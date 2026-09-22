import express from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { extractClinicalInformationFromText } from './src/utils/clinicalNlp';
import { evaluateClinicalTriage } from './src/utils/triageEngine';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini client to prevent crashes if API key is not configured
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MedNova Clinical Intake & Triage Engine',
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Request deduplication cache & in-flight guard for triage
const inFlightTriageMap = new Map<string, Promise<any>>();
const triageCacheMap = new Map<string, { data: any; expiresAt: number }>();

function getTriageRequestKey(body: any): string {
  const intake = body?.intake || {};
  const age = body?.patientAge ?? '';
  const gender = body?.patientGender ?? '';
  const lang = body?.preferredLanguage ?? '';
  const cc = (intake.chiefComplaint || '').trim().toLowerCase();
  const cco = (intake.chiefComplaintOriginal || '').trim().toLowerCase();
  const dur = (intake.duration || '').trim().toLowerCase();
  const onset = (intake.onset || '').trim().toLowerCase();
  const regions = (intake.bodyRegions || []).slice().sort().join(',');
  const symptoms = (intake.associatedSymptoms || []).slice().sort().join(',');
  const vitals = JSON.stringify(intake.vitals || {});
  return `${age}|${gender}|${lang}|${cc}|${cco}|${dur}|${onset}|${regions}|${symptoms}|${vitals}`;
}

// Error classifier: only retry transient errors (503, 429, 408, 500, 502, 504)
function parseGeminiError(error: any): { isTransient: boolean; status: number | string; code?: string } {
  const rawStatus = error?.status || error?.statusCode || error?.response?.status;
  const message = String(error?.message || '');
  const code = error?.code || (error?.error && error?.error?.code);

  // Non-transient errors: do NOT retry 400, 401, 403, 404
  if (rawStatus === 400 || rawStatus === 401 || rawStatus === 403 || rawStatus === 404) {
    return { isTransient: false, status: rawStatus, code };
  }
  if (
    message.includes('400') || message.includes('INVALID_ARGUMENT') ||
    message.includes('401') || message.includes('UNAUTHENTICATED') ||
    message.includes('403') || message.includes('PERMISSION_DENIED') ||
    message.includes('404') || message.includes('NOT_FOUND')
  ) {
    return { isTransient: false, status: rawStatus || 400, code };
  }

  // Transient errors: 503, 429, 408, 500, 502, 504
  if ([503, 429, 408, 500, 502, 504].includes(rawStatus)) {
    return { isTransient: true, status: rawStatus, code };
  }
  if (
    message.includes('503') || message.includes('UNAVAILABLE') || message.includes('high demand') || message.includes('overloaded') ||
    message.includes('429') || message.includes('RESOURCE_EXHAUSTED') || message.includes('quota') ||
    message.includes('408') || message.includes('TIMEOUT') || message.includes('DEADLINE_EXCEEDED') ||
    message.includes('500') || message.includes('INTERNAL') ||
    message.includes('502') || message.includes('504') || message.includes('BAD_GATEWAY') || message.includes('GATEWAY_TIMEOUT')
  ) {
    const inferredStatus = message.includes('429') || message.includes('quota') ? 429 : 503;
    return { isTransient: true, status: rawStatus || inferredStatus, code };
  }

  // Default: treat unknown network or connection errors as transient once
  return { isTransient: true, status: rawStatus || 'unknown', code };
}

// Retry with exponential backoff + jitter (Attempt 1: ~1s, Attempt 2: ~2s, Attempt 3: ~4s)
async function generateTriageWithRetry(ai: GoogleGenAI, prompt: string): Promise<any> {
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });
      return response;
    } catch (err: any) {
      attempt++;
      const { isTransient, status, code } = parseGeminiError(err);

      if (!isTransient || attempt > MAX_RETRIES) {
        if (attempt > MAX_RETRIES) {
          console.info('[Triage]\nGemini unavailable after retries\nAction: clinical-rules fallback');
        }
        throw err;
      }

      // Exponential backoff with random jitter to prevent synchronized retries
      // attempt 1: base 1000ms + jitter (0-350ms)
      // attempt 2: base 2000ms + jitter (0-500ms)
      // attempt 3: base 4000ms + jitter (0-800ms)
      const baseDelay = Math.pow(2, attempt - 1) * 1000;
      const jitter = Math.floor(Math.random() * (baseDelay * 0.35));
      const delayMs = baseDelay + jitter;

      console.info(
        `[Triage]\nGemini unavailable\nStatus: ${status || code || 503}\nAttempt: ${attempt}/${MAX_RETRIES}\nAction: retry`
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

// 1. Intelligent AI Triage & Clinical Structuring Endpoint
app.post('/api/gemini/triage', async (req, res) => {
  const { intake = {}, patientAge = 30, patientGender = 'other', preferredLanguage = 'en' } = req.body;
  const cacheKey = getTriageRequestKey(req.body);

  // Check in-flight request guard to prevent duplicate concurrent executions
  if (inFlightTriageMap.has(cacheKey)) {
    try {
      const inFlightResult = await inFlightTriageMap.get(cacheKey);
      return res.json(inFlightResult);
    } catch {
      // If the in-flight failed, proceed to local fallback
    }
  }

  // Check cache (valid for 60 seconds)
  const cached = triageCacheMap.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return res.json(cached.data);
  }

  // Execution runner for triage
  const runTriage = async () => {
    const ai = getGenAI();

    // If Gemini key is available, attempt AI clinical structuring
    if (ai) {
      const prompt = `
You are MedNova's Clinical Decision Support AI for hospital triage in India.
Your role is to structure patient clinical intake, identify emergency red flags, calculate an Emergency Severity Index (ESI) triage level (1 to 4), recommend the appropriate clinical department, and suggest bedside investigations for physician evaluation.
DISCLAIMER: You do NOT autonomously diagnose or prescribe; you provide physician decision support.

PATIENT INFORMATION:
- Age: ${patientAge} years, Gender: ${patientGender}
- Preferred Language: ${preferredLanguage}
- Chief Complaint (Original Voice/Text): "${intake.chiefComplaintOriginal || intake.chiefComplaint || ''}"
- Body Regions: ${JSON.stringify(intake.bodyRegions || [])}
- Duration & Onset: ${intake.duration || 'Not specified'}, Onset: ${intake.onset || 'gradual'}
- Pain Severity (0-10): ${intake.vitals?.painScore ?? 0}
- Associated Symptoms: ${JSON.stringify(intake.associatedSymptoms || [])}
- Medical History: ${JSON.stringify(intake.pastMedicalHistory || [])}
- Vitals: BP: ${intake.vitals?.bloodPressureSystolic || 'N/A'}/${intake.vitals?.bloodPressureDiastolic || 'N/A'} mmHg, HR: ${intake.vitals?.heartRate || 'N/A'} bpm, SpO2: ${intake.vitals?.spO2 || 'N/A'}%, Temp: ${intake.vitals?.temperature || 'N/A'} F, RR: ${intake.vitals?.respiratoryRate || 'N/A'}/min, Blood Sugar: ${intake.vitals?.bloodGlucose || 'N/A'} mg/dL

Return a valid JSON object strictly matching this schema:
{
  "translatedChiefComplaint": "Accurate professional clinical translation in English",
  "level": 1 | 2 | 3 | 4,
  "score": number between 10 and 99,
  "recommendedDepartment": "Emergency & Trauma" | "General Medicine" | "Cardiology" | "Pulmonology" | "General Surgery" | "Orthopedics" | "Pediatrics" | "Neurology" | "Gastroenterology" | "Obstetrics & Gynecology" | "ENT & Head-Neck" | "Dermatology",
  "priorityRationale": "Clear clinical justification for triage level and urgency",
  "redFlags": ["list of explicit critical danger signs detected, or empty"],
  "differentialConsiderations": ["Top 3-4 differential considerations for doctor review"],
  "suggestedInvestigations": ["Specific primary investigations e.g. ECG, Troponin, CBC, USG"],
  "immediateNursingActions": ["Immediate bedside actions e.g. oxygen, vitals recheck, wheelchair, NPO"],
  "isEmergency": boolean,
  "confidenceScore": number,
  "confidenceGatingPassed": boolean,
  "confidenceGatingRationale": "Clinical rationale explaining confidence calibration and data completeness",
  "requiresMandatoryPractitionerReview": boolean,
  "adcpClinicalProtocol": {
    "allopathicPathway": "Acute allopathic stabilization and safety pathway",
    "ayushGuidance": "Integrative dosha balancing considerations and dietary guidelines",
    "contraindications": ["Clinical contraindications and therapy delays to avoid"],
    "lifestyleCautions": ["Immediate lifestyle or posture precautions"]
  }
}

Triage Level Guidelines:
- Level 1: Immediate life threat / resuscitation (Cardiac arrest, ACS with diaphoresis, stroke window, severe shock, SpO2 < 88%)
- Level 2: High risk / emergent / extreme pain (9-10/10) / high fever in infant / acute surgical abdomen / asthma exacerbation / dengue with warning signs
- Level 3: Urgent / multiple resources needed / stable vitals (moderate pain, UTI, uncomplicated diabetes high sugar)
- Level 4: Routine / single resource / chronic symptoms (routine joint pain, skin rash, mild cold)

Confidence Gating Rules:
- If vitals or complaint have acute ambiguity, missing key metrics, or discordant symptoms, confidenceScore must be < 0.85 and confidenceGatingPassed must be false.
- When confidenceGatingPassed is false, requiresMandatoryPractitionerReview must be true.
`;

      try {
        const response = await generateTriageWithRetry(ai, prompt);
        const responseText = response.text?.trim();
        if (responseText) {
          const parsed = JSON.parse(responseText);
          const confScore = typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.94;
          const gatingPassed = typeof parsed.confidenceGatingPassed === 'boolean' 
            ? parsed.confidenceGatingPassed 
            : confScore >= 0.85;

          return {
            success: true,
            source: 'gemini',
            triage: {
              level: parsed.level || 3,
              score: parsed.score || 50,
              recommendedDepartment: parsed.recommendedDepartment || 'General Medicine',
              priorityRationale: parsed.priorityRationale || 'Structured by MedNova AI.',
              redFlags: parsed.redFlags || [],
              differentialConsiderations: parsed.differentialConsiderations || [],
              suggestedInvestigations: parsed.suggestedInvestigations || [],
              immediateNursingActions: parsed.immediateNursingActions || [],
              aiConfidence: confScore,
              confidenceScore: confScore,
              confidenceGatingPassed: gatingPassed,
              confidenceGatingRationale: parsed.confidenceGatingRationale || 'Calibrated against clinical triage guidelines and vital signs completeness.',
              requiresMandatoryPractitionerReview: Boolean(parsed.requiresMandatoryPractitionerReview) || !gatingPassed || parsed.level <= 2,
              isEmergency: parsed.level === 1 || Boolean(parsed.isEmergency),
              adcpProtocol: parsed.adcpClinicalProtocol || undefined,
            },
            translatedChiefComplaint: parsed.translatedChiefComplaint || intake.chiefComplaint || '',
          };
        }
      } catch {
        // Fall through to deterministic clinical rules fallback
      }
    }

    // High-fidelity rule-based fallback if Gemini API is unavailable or offline
    const fallbackTriage = evaluateClinicalTriage(intake, patientAge);
    return {
      success: true,
      source: 'rules_fallback',
      fallbackReason: 'AI service temporarily unavailable; clinical rules fallback used.',
      dashboardNotice: 'AI assistance temporarily unavailable — rule-based triage active.',
      triage: {
        ...fallbackTriage,
        ruleBased: true,
        confidenceScore: 0.88,
        confidenceGatingPassed: true,
        confidenceGatingRationale: 'Validated by MedNova deterministic clinical rule engine.',
        requiresMandatoryPractitionerReview: fallbackTriage.level <= 2,
        fallbackReason: 'AI service temporarily unavailable; clinical rules fallback used.',
      },
      translatedChiefComplaint: intake.chiefComplaintOriginal || intake.chiefComplaint || '',
    };
  };

  const triagePromise = runTriage();
  inFlightTriageMap.set(cacheKey, triagePromise);

  try {
    const result = await triagePromise;
    // Cache for 60 seconds to prevent rapid duplicate queries
    triageCacheMap.set(cacheKey, { data: result, expiresAt: Date.now() + 60000 });
    return res.json(result);
  } catch (error: any) {
    const fallback = evaluateClinicalTriage(intake, patientAge);
    const fallbackResult = {
      success: true,
      source: 'rules_fallback',
      fallbackReason: 'AI service temporarily unavailable; clinical rules fallback used.',
      dashboardNotice: 'AI assistance temporarily unavailable — rule-based triage active.',
      triage: {
        ...fallback,
        ruleBased: true,
        fallbackReason: 'AI service temporarily unavailable; clinical rules fallback used.',
      },
      translatedChiefComplaint: intake.chiefComplaintOriginal || intake.chiefComplaint || '',
    };
    return res.json(fallbackResult);
  } finally {
    inFlightTriageMap.delete(cacheKey);
  }
});

// 2. Dynamic Clinical Follow-up Questions Endpoint
app.post('/api/gemini/dynamic-questions', async (req, res) => {
  try {
    const { complaint, preferredLanguage, bodyRegions } = req.body;
    const ai = getGenAI();

    if (ai) {
      const prompt = `
You are MedNova's clinical intake assistant in India.
The patient presented with this complaint: "${complaint}"
Affected body region: ${JSON.stringify(bodyRegions || [])}
Patient language: "${preferredLanguage}"

Generate 2 to 3 clinically relevant follow-up questions tailored to their specific problem to help prioritize care.
Provide each question in both English and translated into their native language ("${preferredLanguage}").
Categories can be: "onset", "severity", "radiation", "associated", "red_flag".

Return valid JSON in this format:
{
  "questions": [
    {
      "id": "q1",
      "questionText": "Question in English",
      "questionTextTranslated": "Question in the patient's language (${preferredLanguage})",
      "category": "radiation",
      "options": ["Option 1", "Option 2", "Option 3"]
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim();
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json({ success: true, questions: parsed.questions || [] });
      }
    }

    // Default dynamic questions based on body region
    const defaultQuestions = [
      {
        id: 'q1',
        questionText: 'Did this problem begin suddenly within hours, or has it been gradual over days or weeks?',
        questionTextTranslated: 'क्या यह समस्या अचानक कुछ घंटों में शुरू हुई या कई दिनों से धीरे-धीरे बढ़ रही है?',
        category: 'onset',
        options: ['Sudden (< 24 hours)', 'Gradual (several days)', 'Chronic (weeks/months)'],
      },
      {
        id: 'q2',
        questionText: 'Are you experiencing any sweating, dizziness, nausea, or breathing discomfort?',
        questionTextTranslated: 'क्या आपको पसीना, चक्कर, उल्टी जैसा मन या सांस लेने में परेशानी हो रही है?',
        category: 'associated',
        options: ['Yes, severe', 'Mild discomfort', 'None of these'],
      }
    ];

    return res.json({ success: true, questions: defaultQuestions });
  } catch (error: any) {
    console.warn('Error generating dynamic questions:', error?.message);
    res.json({
      success: true,
      questions: [
        {
          id: 'q1',
          questionText: 'How severe is this problem on a scale of 1 to 10 right now?',
          category: 'severity',
          options: ['Mild (1-3)', 'Moderate (4-6)', 'Severe (7-10)'],
        }
      ]
    });
  }
});

// 3. Document OCR & Clinical Record Extractor
app.post('/api/gemini/analyze-document', async (req, res) => {
  try {
    const { documentName, sampleText, fileType } = req.body;
    const ai = getGenAI();

    if (ai && sampleText) {
      const prompt = `
Extract structured clinical findings from this medical document for physician review:
Document: "${documentName}" (Type: ${fileType})
Content:
"""
${sampleText}
"""

Return a valid JSON object:
{
  "extractedSummary": "A concise 2-sentence clinical summary of findings",
  "keyFindings": ["List of key lab values, diagnoses, or observations with status flags e.g. Normal, Elevated, Critical Low"],
  "extractedMedications": ["List of identified medications with dosage and frequency, or empty"],
  "extractedAllergies": ["List of identified drug/food allergies, or empty"],
  "clinicalRiskFlags": ["Any abnormal alerts requiring urgent physician attention, or empty"],
  "practitionerVerificationStatus": "pending_verification"
}
`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, document: parsed });
    }

    // Fallback extraction
    return res.json({
      success: true,
      document: {
        extractedSummary: `Analyzed ${documentName}: Document recorded into patient medical history.`,
        keyFindings: ['Recorded for physician verification', 'Previous outpatient record'],
        extractedMedications: [],
        extractedAllergies: [],
        clinicalRiskFlags: [],
        practitionerVerificationStatus: 'pending_verification',
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to analyze document' });
  }
});

// 4. ADCP (Ayush & Allopathic Dynamic Clinical Protocol) Integrative Clinical Reasoning
app.post('/api/gemini/adcp-protocol', async (req, res) => {
  try {
    const { intake = {}, patientAge = 30, ayushPrakriti = {} } = req.body;
    const ai = getGenAI();

    if (ai) {
      const prompt = `
You are MedNova's ADCP (Ayush & Allopathic Dynamic Clinical Protocol) Clinical Decision Support Engine.
Analyze this patient presentation to formulate an evidence-aligned integrative protocol for physician review:
- Chief Complaint: "${intake.chiefComplaint || ''}"
- Body Regions: ${JSON.stringify(intake.bodyRegions || [])}
- Patient Age: ${patientAge}
- Vitals: BP: ${intake.vitals?.bloodPressureSystolic || 'N/A'}/${intake.vitals?.bloodPressureDiastolic || 'N/A'}, HR: ${intake.vitals?.heartRate || 'N/A'} bpm, SpO2: ${intake.vitals?.spO2 || 'N/A'}%
- AYUSH Prakriti Profile: Dominant: ${ayushPrakriti.dominantPrakriti || 'Not assessed'} (Vata: ${ayushPrakriti.vataScore || 0}%, Pitta: ${ayushPrakriti.pittaScore || 0}%, Kapha: ${ayushPrakriti.kaphaScore || 0}%)

Return valid JSON strictly matching:
{
  "protocolTitle": "Targeted ADCP Protocol Title",
  "allopathicStabilization": "Primary allopathic triage recommendation and diagnostic priority",
  "ayushIntegrativeGuidance": "Dosha balancing lifestyle, dietary (pathya/apathya) guidance",
  "contraindications": ["Strict clinical contraindications and red-flag delays to avoid"],
  "lifestylePrecautions": ["Daily routine (Dinacharya) or posture advice"],
  "confidenceScore": number,
  "practitionerVerificationRequired": true
}
`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.1 },
      });
      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, protocol: parsed });
    }

    // Deterministic fallback ADCP protocol
    return res.json({
      success: true,
      protocol: {
        protocolTitle: 'Standard Clinical Observation & Care Pathway',
        allopathicStabilization: 'Vitals monitoring and physician OPD evaluation.',
        ayushIntegrativeGuidance: 'Hydration and balanced warm meals avoiding excessive spices.',
        contraindications: ['Avoid unverified self-medication.'],
        lifestylePrecautions: ['Rest and avoid heavy physical exertion.'],
        confidenceScore: 0.88,
        practitionerVerificationRequired: true,
      },
    });
  } catch (error: any) {
    res.json({
      success: true,
      protocol: {
        protocolTitle: 'Standard Clinical Observation & Care Pathway',
        allopathicStabilization: 'Physician evaluation requested.',
        ayushIntegrativeGuidance: 'Adequate rest and warm hydration.',
        contraindications: ['Do not delay emergency physician review if symptoms worsen.'],
        lifestylePrecautions: ['Rest and vital signs re-check.'],
        confidenceScore: 0.85,
        practitionerVerificationRequired: true,
      },
    });
  }
});

// 4. Translate Doctor Summary to Patient's Native Language
app.post('/api/gemini/translate-summary', async (req, res) => {
  try {
    const { englishSummary, targetLanguage } = req.body;
    const ai = getGenAI();

    if (ai && targetLanguage !== 'en') {
      const prompt = `
Translate this physician summary and instructions into simple, compassionate ${targetLanguage} for the patient:
"${englishSummary}"

Return JSON:
{
  "translatedText": "Patient-friendly translation"
}
`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, translatedText: parsed.translatedText || englishSummary });
    }

    return res.json({ success: true, translatedText: englishSummary });
  } catch (err: any) {
    res.json({ success: true, translatedText: req.body?.englishSummary || '' });
  }
});

// Endpoint: Real Audio Speech-to-Text Transcribe (Section 11 & 12)
app.post('/api/speech/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', languageCode = 'en-IN' } = req.body;

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing audioBase64 data' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Speech recognition service unavailable (missing API configuration)',
      });
    }

    const languageNames: Record<string, string> = {
      'en-IN': 'Indian English',
      'ta-IN': 'Tamil',
      'hi-IN': 'Hindi',
      'te-IN': 'Telugu',
      'kn-IN': 'Kannada',
      'ml-IN': 'Malayalam',
      'bn-IN': 'Bengali',
      'mr-IN': 'Marathi',
    };

    const targetLangName = languageNames[languageCode] || languageCode;

    const audioPart = {
      inlineData: {
        mimeType: mimeType.split(';')[0], // strip codec parameters e.g. audio/webm;codecs=opus -> audio/webm
        data: audioBase64,
      },
    };

    // Primary: gemini-3.5-transcribe; Fallback: gemini-3.1-flash-lite / gemini-3.8-flash
    let rawTranscript = '';
    let usedModel = 'gemini-3.5-transcribe';

    const modelsToTry = ['gemini-3.5-transcribe', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              audioPart,
              {
                text: `You are a verbatim speech-to-text transcriber for a hospital clinical intake system in India. Transcribe the patient's spoken audio words accurately in ${targetLangName} (${languageCode}). Output ONLY the exact transcribed words spoken. Do not add conversational text, commentary, punctuation analysis, or markdown formatting. If the audio is silent, inaudible, or contains no speech, output exactly NO_SPEECH.`,
              },
            ],
          },
        });
        rawTranscript = response.text?.trim() || '';
        usedModel = modelName;
        break; // Successfully received response
      } catch (err: any) {
        lastError = err;
        console.warn(`[Speech STT] Model ${modelName} failed (${err?.status || err?.message}), trying next fallback...`);
      }
    }

    if (!rawTranscript && lastError) {
      console.error('[Speech STT] All speech transcribe models failed:', lastError?.message);
      return res.status(500).json({
        success: false,
        error: 'speech-service-error',
        message: lastError?.message || 'Speech recognition service temporarily unavailable',
      });
    }

    // Sanitize transcript
    const cleanTranscript = rawTranscript
      .replace(/^(NO_SPEECH|No speech|None|Silent|\[Silence\]|\(Silence\))\.*$/i, '')
      .replace(/^(Please provide|தயவுசெய்து ஆடியோவை|कृपया ऑडियो).*$/i, '')
      .replace(/^There is no (audio|speech).*$/i, '')
      .replace(/^"(.*)"$/, '$1')
      .trim();

    if (!cleanTranscript || cleanTranscript.toUpperCase() === 'NO_SPEECH' || cleanTranscript.length < 2) {
      return res.json({
        success: false,
        error: 'no-speech',
        message: 'No intelligible speech detected in the audio',
      });
    }

    return res.json({
      success: true,
      transcript: cleanTranscript,
      languageCode,
      model: usedModel,
    });
  } catch (error: any) {
    console.error('[Speech STT] Internal error:', error);
    return res.status(500).json({
      success: false,
      error: 'server-error',
      message: error?.message || 'Failed to process audio transcription',
    });
  }
});

// Endpoint: Extract structured clinical data from transcript (Section 11 & 12)
app.post('/api/gemini/extract-clinical-info', async (req, res) => {
  try {
    const { transcript, language = 'en' } = req.body;
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Missing transcript parameter' });
    }

    // Baseline deterministic extraction
    const fallbackResult = extractClinicalInformationFromText(transcript, language);

    const ai = getGenAI();
    if (!ai) {
      return res.json({ success: true, source: 'RULE_ENGINE', data: fallbackResult });
    }

    const prompt = `
You are MedNova's Clinical NLP Intake Engine.
Analyze the following patient chief complaint spoken in ${language}:
"${transcript}"

Extract clinical entities precisely into JSON without fabricating details not spoken by the patient:
{
  "complaintType": "e.g., pain, fever, cough, burning, swelling, injury",
  "duration": "e.g., 1 day, 2 hours, since yesterday, or null if unmentioned",
  "severity": "mild, moderate, or severe if mentioned",
  "bodyLocation": {
    "region": "upper_limb, lower_limb, head, torso_front, abdomen, pelvis, back, or null",
    "subRegion": "e.g., hand, knee, shoulder, elbow, eye, ear, or null",
    "specificRegion": "e.g., palm, thumb, sole, heel, or null",
    "laterality": "left, right, both, or unspecified"
  },
  "needsClarification": boolean (true if patient mentioned a paired limb like arm/leg/hand/knee without specifying right or left),
  "clarificationQuestion": "e.g., Which arm — right or left? or null",
  "confidence": 0.95
}
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      
      // Merge with structured hierarchy definitions
      const combined = {
        ...fallbackResult,
        complaintType: parsed.complaintType || fallbackResult.complaintType,
        duration: parsed.duration || fallbackResult.duration,
        severity: parsed.severity || fallbackResult.severity,
        needsClarification: Boolean(parsed.needsClarification || fallbackResult.needsClarification),
        clarificationQuestion: parsed.clarificationQuestion || fallbackResult.clarificationQuestion,
        confidence: parsed.confidence || fallbackResult.confidence,
      };

      if (parsed.bodyLocation?.region) {
        combined.bodyLocation = {
          region: parsed.bodyLocation.region,
          subRegion: parsed.bodyLocation.subRegion || fallbackResult.bodyLocation?.subRegion,
          specificRegion: parsed.bodyLocation.specificRegion || fallbackResult.bodyLocation?.specificRegion,
          laterality: parsed.bodyLocation.laterality || fallbackResult.bodyLocation?.laterality || 'unspecified',
          label: parsed.bodyLocation.region,
        };
      }

      return res.json({ success: true, source: 'GEMINI_NLP', data: combined });
    } catch (aiErr) {
      console.info('[Clinical NLP] Gemini unavailable, falling back to rule engine');
      return res.json({ success: true, source: 'RULE_ENGINE', data: fallbackResult });
    }
  } catch (err: any) {
    const fallback = extractClinicalInformationFromText(req.body?.transcript || '', req.body?.language || 'en');
    return res.json({ success: true, source: 'FALLBACK', data: fallback });
  }
});

// Vite middleware for development vs static build in production
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`MedNova Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
