import { StructuredBodyRegion, BodyRegion } from '../types/mednova';
import { BODY_HIERARCHY } from '../components/intake/BodyMapHierarchy';

export interface ExtractedClinicalInfo {
  chiefComplaintSummary: string;
  complaintType: string;
  duration?: string;
  severity?: string;
  bodyLocation?: {
    region: string; // e.g. 'upper_limb', 'head', 'torso_front', 'abdomen', etc.
    subRegion?: string; // e.g. 'hand', 'shoulder', 'knee', 'eye', etc.
    specificRegion?: string; // e.g. 'palm', 'thumb', 'sole', etc.
    laterality: 'left' | 'right' | 'both' | 'unspecified';
    label: string;
  };
  structuredRegions: StructuredBodyRegion[];
  legacyBodyRegions: BodyRegion[];
  needsClarification: boolean;
  clarificationQuestion?: string;
  clarificationOptions?: { label: string; side: 'left' | 'right' | 'both' }[];
  confidence: number;
}

// Multilingual word matchers for laterality
const RIGHT_SIDE_PATTERNS = [
  /\bright\b/i,
  /\bright-side\b/i,
  /\bright-hand\b/i,
  /\bright-arm\b/i,
  /\bright-leg\b/i,
  /\bright-knee\b/i,
  /வலது/i, // Tamil
  /दायाँ|दाहिना|दाएं|दाहिनी/i, // Hindi
  /కుడి/i, // Telugu
  /ಬಲ/i, // Kannada
  /വലത്/i, // Malayalam
  /ডান/i, // Bengali
  /उजवा|उजव्या/i, // Marathi
];

const LEFT_SIDE_PATTERNS = [
  /\bleft\b/i,
  /\bleft-side\b/i,
  /\bleft-hand\b/i,
  /\bleft-arm\b/i,
  /\bleft-leg\b/i,
  /\bleft-knee\b/i,
  /இடது/i, // Tamil
  /बायाँ|बाएं|बायीं/i, // Hindi
  /ఎడమ/i, // Telugu
  /ಎಡ/i, // Kannada
  /ഇടത്/i, // Malayalam
  /বাম/i, // Bengali
  /डावा|डाव्या/i, // Marathi
];

const BOTH_SIDES_PATTERNS = [
  /\bboth\b/i,
  /\bbilateral\b/i,
  /\bboth sides\b/i,
  /\bboth hands\b/i,
  /\bboth arms\b/i,
  /\bboth legs\b/i,
  /\bboth knees\b/i,
  /இரண்டும்|இரு/i, // Tamil
  /दोनों/i, // Hindi
  /రెండు|ఇరువైపులా/i, // Telugu
  /ಎರಡೂ/i, // Kannada
  /രണ്ടും/i, // Malayalam
  /উভয়|দুটোই/i, // Bengali
  /दोन्ही/i, // Marathi
];

// Multilingual body location patterns
interface RegionMatchDef {
  regionId: string;
  legacyId: BodyRegion;
  isPaired: boolean;
  patterns: RegExp[];
  subRegions?: {
    subRegionId: string;
    patterns: RegExp[];
    specificRegions?: {
      specificId: string;
      patterns: RegExp[];
    }[];
  }[];
}

const REGION_DEFINITIONS: RegionMatchDef[] = [
  {
    regionId: 'upper_limb',
    legacyId: 'upper_limbs',
    isPaired: true,
    patterns: [
      /\b(arm|hand|shoulder|elbow|forearm|wrist|finger|palm)\b/i,
      /கை|தோள்பட்டை|முழங்கை|மணிக்கட்டு|விரல்|உள்ளங்கை/i, // Tamil
      /हाथ|कंधा|कोहनी|कलाई|उंगली|हथेली|भुजा/i, // Hindi
      /చేయి|భుజం|మోచేయి|మణికట్టు|వేలు|అరచేయి/i, // Telugu
      /ತೋಳು|ಕೈ|ಭುಜ|ಮೊಣಕೈ|ಮಣಿಕಟ್ಟು|ಬೆರಳು/i, // Kannada
      /കൈ|തോൾ|മുട്ട്|മണിബന്ധം|വിരൽ|ഉള്ളംകൈ/i, // Malayalam
      /হাত|কাঁধ|কনুই|কব্জি|আঙুল|তালু/i, // Bengali
      /हात|खांदा|कोपरा|मनगट|बोट|तळहात/i, // Marathi
    ],
    subRegions: [
      {
        subRegionId: 'hand',
        patterns: [/\bhand\b/i, /கை/i, /हाथ/i, /చేయి/i, /ಕೈ/i, /കൈ/i, /হাত/i, /हात/i],
        specificRegions: [
          {
            specificId: 'palm',
            patterns: [/\bpalm\b/i, /உள்ளங்கை/i, /हथेली/i, /అరచేయి/i, /ಅಂಗೈ/i, /ഉള്ളംകൈ/i, /তালু/i, /तळहात/i],
          },
          {
            specificId: 'thumb',
            patterns: [/\bthumb\b/i, /பெருவிரல்/i, /अंगूठा/i, /బొటనవేలు/i, /ಹೆಬ್ಬೆರಳು/i, /തള്ളവിരൽ/i, /বুড়ো আঙুল/i, /अंगठा/i],
          },
        ],
      },
      {
        subRegionId: 'shoulder',
        patterns: [/\bshoulder\b/i, /தோள்பட்டை|தோள்/i, /कंधा/i, /భుజం/i, /ಭುಜ/i, /തോൾ/i, /কাঁধ/i, /खांदा/i],
      },
      {
        subRegionId: 'elbow',
        patterns: [/\belbow\b/i, /முழங்கை/i, /कोहनी/i, /మోచేయి/i, /ಮೊಣಕೈ/i, /മുട്ട്/i, /কনুই/i, /कोपरा/i],
      },
      {
        subRegionId: 'forearm',
        patterns: [/\bforearm\b/i, /முன்கை/i, /बांह/i, /முன்கை/i],
      },
      {
        subRegionId: 'wrist',
        patterns: [/\bwrist\b/i, /மணிக்கட்டு/i, /कलाई/i, /మణికట్టు/i, /ಮಣಿಕಟ್ಟು/i, /മണിബന്ധം/i, /কব্জি/i, /मनगट/i],
      },
    ],
  },
  {
    regionId: 'lower_limb',
    legacyId: 'lower_limbs',
    isPaired: true,
    patterns: [
      /\b(leg|knee|foot|feet|ankle|thigh|calf|toe|heel)\b/i,
      /கால்|முழங்கால்|பாதம்|கணுக்கால்|தொடைகள்|குதிங்கால்/i, // Tamil
      /पैर|टांग|घुटना|पैर का पंजा|टखना|जांघ|पिंडली|एड़ी/i, // Hindi
      /కాలు|మోకాలు|పాదము|చీలమండలము|తొడ/i, // Telugu
      /ಕಾಲು|ಮೊಣಕಾಲು|ಪಾದ|ಹಿಮ್ಮಡಿ/i, // Kannada
      /കാൽ|മുട്ട്|പാദം|കണങ്കാൽ|തുട/i, // Malayalam
      /পা|হাঁটু|পায়ের পাতা|গোড়ালি|উরুর/i, // Bengali
      /पाय|गुडघा|पाऊल|घोटा|मांडी/i, // Marathi
    ],
    subRegions: [
      {
        subRegionId: 'knee',
        patterns: [/\bknee\b/i, /முழங்கால்/i, /घुटना/i, /మోకాలు/i, /ಮೊಣಕಾಲು/i, /മുട്ട്/i, /হাঁটু/i, /गुडघा/i],
      },
      {
        subRegionId: 'foot',
        patterns: [/\b(foot|feet)\b/i, /பாதம்/i, /पैर का पंजा/i, /పాదము/i, /ಪಾದ/i, /പാദം/i, /পায়ের পাতা/i, /पाऊल/i],
        specificRegions: [
          {
            specificId: 'sole',
            patterns: [/\bsole\b/i, /உள்ளங்கால்/i, /तलवा/i, /అరికాలు/i, /ಅಂಗಾಲು/i, /പാദത്തിന്റെ അടി/i, /পায়ের তলা/i, /तळपाय/i],
          },
          {
            specificId: 'heel',
            patterns: [/\bheel\b/i, /குதிங்கால்/i, /एड़ी/i, /మడమ/i, /ಹಿಮ್ಮಡಿ/i, /മടമ്പ്/i, /গোড়ালি/i, /टाच/i],
          },
        ],
      },
      {
        subRegionId: 'ankle',
        patterns: [/\bankle\b/i, /கணுக்கால்/i, /टखना/i, /చీలమండ/i, /ಕಣಕಾಲು/i, /കണങ്കാൽ/i, /গোড়ালি/i, /घोटा/i],
      },
      {
        subRegionId: 'thigh',
        patterns: [/\bthigh\b/i, /தொடை/i, /जांघ/i, /తొడ/i, /ತೊಡೆ/i, /തുട/i, /উরু/i, /मांडी/i],
      },
    ],
  },
  {
    regionId: 'torso_front',
    legacyId: 'chest',
    isPaired: false,
    patterns: [
      /\b(chest|heart|breast|ribs)\b/i,
      /மார்பு|நெஞ்சு|இதயம்/i, // Tamil
      /सीना|छाती|हृदय/i, // Hindi
      /ఛాతీ|రొమ్ము|గుండె/i, // Telugu
      /ಎದೆ|ಹೃದಯ/i, // Kannada
      /നെഞ്ച്|ഹൃദയം/i, // Malayalam
      /বুক|হৃৎপিণ্ড/i, // Bengali
      /छाती|हृदय/i, // Marathi
    ],
  },
  {
    regionId: 'abdomen',
    legacyId: 'abdomen',
    isPaired: false,
    patterns: [
      /\b(stomach|belly|abdomen|gut|navel)\b/i,
      /வயிறு|தொப்புள்/i, // Tamil
      /पेट|उदर/i, // Hindi
      /కడుపు|పొట్ట/i, // Telugu
      /ಹೊಟ್ಟೆ/i, // Kannada
      /വയർ/i, // Malayalam
      /পেট/i, // Bengali
      /पोट/i, // Marathi
    ],
  },
  {
    regionId: 'head',
    legacyId: 'head_neck',
    isPaired: false,
    patterns: [
      /\b(head|headache|throat|neck|face|eye|ear|nose|jaw)\b/i,
      /தலை|தொண்டை|கழுத்து|முகம்|கண்|காது|மூக்கு|தாடை/i, // Tamil
      /सिर|गला|गर्दन|चेहरा|आँख|कान|नाक|जबड़ा/i, // Hindi
      /తల|గొంతు|మెడ|ముఖం|కన్ను|చెవి|ముక్కు/i, // Telugu
      /ತಲೆ|ಗಂಟಲು|ಕುತ್ತಿಗೆ|ಮುಖ|ಕಣ್ಣು|ಕಿವಿ|ಮೂಗು/i, // Kannada
      /തല|തൊണ്ട|കഴുത്ത്|മുഖം|കണ്ണ്|ചെവി|മൂക്ക്/i, // Malayalam
      /মাথা|গলা|ঘাড়|মুখ|চোখ|কান|ناک/i, // Bengali
      /डोके|घसा|मान|चेहरा|डोळा|कान|नाक/i, // Marathi
    ],
    subRegions: [
      {
        subRegionId: 'eye',
        patterns: [/\beye\b/i, /கண்/i, /आँख|आंख/i, /కన్ను/i, /ಕಣ್ಣು/i, /കണ്ണ്/i, /চোখ/i, /डोळा/i],
      },
      {
        subRegionId: 'ear',
        patterns: [/\bear\b/i, /காது/i, /कान/i, /చెవి/i, /ಕಿವಿ/i, /ചെവി/i, /কান/i, /कान/i],
      },
      {
        subRegionId: 'neck',
        patterns: [/\bneck\b/i, /கழுத்து/i, /गर्दन/i, /మెడ/i, /ಕುತ್ತಿಗೆ/i, /കഴുത്ത്/i, /ঘাড়/i, /मान/i],
      },
    ],
  },
  {
    regionId: 'back',
    legacyId: 'spine_back',
    isPaired: false,
    patterns: [
      /\b(back|spine|lumbar|backache)\b/i,
      /முதுகு|தண்டுவடம்/i, // Tamil
      /पीठ|रीढ़/i, // Hindi
      /వెన్ను|వీపు/i, // Telugu
      /ಬೆನ್ನು/i, // Kannada
      /പുറം|നട്ടെല്ല്/i, // Malayalam
      /পিঠ|মেরুদণ্ড/i, // Bengali
      /पाठ|कणा/i, // Marathi
    ],
  },
  {
    regionId: 'pelvis',
    legacyId: 'pelvis_urinary',
    isPaired: false,
    patterns: [
      /\b(pelvis|urine|urinary|groin|bladder)\b/i,
      /இடுப்பு|சிறுநீர்/i, // Tamil
      /कमर|मूत्र|पेशाब/i, // Hindi
      /నడుము|మూత్రం/i, // Telugu
      /ಸೊಂಟ|ಮೂತ್ರ/i, // Kannada
      /ഇടുപ്പ്|മൂത്രം/i, // Malayalam
      /কোমর|মূত্র/i, // Bengali
      /कंबर|लघवी/i, // Marathi
    ],
  },
];

// Multilingual duration extractors
const DURATION_PATTERNS = [
  { regex: /(since\s+yesterday|from\s+yesterday|நேற்று\s*முதல்|कल\s*से|నిన్నటి\s*నుండి)/i, label: '1 day' },
  { regex: /(\d+)\s*(days?|நாட்கள்|दिन|రోజులు|ದಿನ|ദിവസം|দিন|दिवस)/i, format: (m: string[]) => `${m[1]} days` },
  { regex: /(\d+)\s*(hours?|hrs?|மணி\s*நேரம்|घंटे|గంటలు|ಗಂಟೆ|മണിക്കൂർ|ঘণ্টা|तास)/i, format: (m: string[]) => `${m[1]} hours` },
  { regex: /(\d+)\s*(weeks?|வாரங்கள்|सप्ताह|हफ्ते|వారాలు|ವಾರ|ആഴ്ച|সপ্তাহ|आठवडे)/i, format: (m: string[]) => `${m[1]} weeks` },
  { regex: /(\d+)\s*(months?|மாதங்கள்|महीने|నెలలు|ತಿಂಗಳು|മാസം|মাস|महिने)/i, format: (m: string[]) => `${m[1]} months` },
  { regex: /(since\s+morning|காலையிலிருந்து|सुबह\s*से|ఉదయం\s*నుండి)/i, label: 'Since morning' },
  { regex: /(since\s+midnight|நள்ளிரவு\s*முதல்|आधी\s*रात\s*से)/i, label: 'Since midnight' },
];

export function extractClinicalInformationFromText(
  transcript: string,
  userLanguage: string = 'en'
): ExtractedClinicalInfo {
  const text = transcript.trim();
  if (!text) {
    return {
      chiefComplaintSummary: '',
      complaintType: 'Unspecified',
      structuredRegions: [],
      legacyBodyRegions: [],
      needsClarification: false,
      confidence: 0,
    };
  }

  // 1. Determine laterality if present
  let detectedLaterality: 'left' | 'right' | 'both' | 'unspecified' = 'unspecified';

  if (BOTH_SIDES_PATTERNS.some(p => p.test(text))) {
    detectedLaterality = 'both';
  } else if (RIGHT_SIDE_PATTERNS.some(p => p.test(text))) {
    detectedLaterality = 'right';
  } else if (LEFT_SIDE_PATTERNS.some(p => p.test(text))) {
    detectedLaterality = 'left';
  }

  // 2. Extract Duration
  let duration: string | undefined;
  for (const item of DURATION_PATTERNS) {
    const match = text.match(item.regex);
    if (match) {
      duration = item.label || (item.format ? item.format(match) : match[0]);
      break;
    }
  }

  // 3. Extract Complaint Type
  let complaintType = 'pain';
  if (/fever|temperature|காய்ச்சல்|बुखार|జ్వరం|ಜ್ವರ|പനി|জ্বর|ताप/i.test(text)) {
    complaintType = 'fever';
  } else if (/cough|wheez|இருமல்|खांसी|దగ్గు|ಕೆಮ್ಮು|ചുമ|কাশি|खोकला/i.test(text)) {
    complaintType = 'cough / breathing';
  } else if (/burn|burning|எரிச்சல்|जलन|మంట|ಉರಿ|പുകച്ചിൽ|জ্বালা|जळजळ/i.test(text)) {
    complaintType = 'burning sensation';
  } else if (/swell|swelling|வீக்கம்|सूजन|వాపు|ಊತ|വീക്കം|ফোলা|सूज/i.test(text)) {
    complaintType = 'swelling';
  } else if (/wound|cut|bleeding|காயம்|இரத்தம்|घाव|चोट|గాయం|ಗಾಯ|മുറിവ്|ক্ষত|जखम/i.test(text)) {
    complaintType = 'injury / wound';
  }

  // 4. Find matched body regions
  const matchedStructured: StructuredBodyRegion[] = [];
  const matchedLegacy: BodyRegion[] = [];
  let detectedBodyLocation: ExtractedClinicalInfo['bodyLocation'] | undefined;
  let needsClarification = false;
  let clarificationQuestion: string | undefined;
  let clarificationOptions: { label: string; side: 'left' | 'right' | 'both' }[] | undefined;

  for (const def of REGION_DEFINITIONS) {
    const matchesRegion = def.patterns.some(p => p.test(text));
    if (matchesRegion) {
      if (!matchedLegacy.includes(def.legacyId)) {
        matchedLegacy.push(def.legacyId);
      }

      // Check subregion
      let matchedSubRegionId: string | undefined;
      let matchedSpecificRegionId: string | undefined;

      if (def.subRegions) {
        for (const sub of def.subRegions) {
          if (sub.patterns.some(p => p.test(text))) {
            matchedSubRegionId = sub.subRegionId;
            // Check specific
            if (sub.specificRegions) {
              for (const spec of sub.specificRegions) {
                if (spec.patterns.some(p => p.test(text))) {
                  matchedSpecificRegionId = spec.specificId;
                  break;
                }
              }
            }
            break;
          }
        }
      }

      // PAIRING & LATERALITY RULE (Section 11 & 12):
      // If region is paired (e.g. arm, leg, hand) and laterality was NOT mentioned,
      // DO NOT silently infer! Prompt clarification!
      if (def.isPaired) {
        if (detectedLaterality === 'unspecified') {
          needsClarification = true;
          const partName = def.regionId === 'upper_limb' ? 'arm' : 'leg';
          clarificationQuestion = `Which ${partName} — right or left?`;
          clarificationOptions = [
            { label: `Right ${partName}`, side: 'right' },
            { label: `Left ${partName}`, side: 'left' },
            { label: `Both ${partName}s`, side: 'both' },
          ];

          // Still register region in structured list without side
          matchedStructured.push({
            bodyRegion: def.regionId,
            subRegion: matchedSubRegionId,
            specificRegion: matchedSpecificRegionId,
          });
        } else {
          // Explicit laterality captured
          matchedStructured.push({
            bodyRegion: def.regionId,
            side: detectedLaterality,
            subRegion: matchedSubRegionId,
            specificRegion: matchedSpecificRegionId,
          });
        }
      } else {
        // Non-paired region (e.g. abdomen, chest, back)
        matchedStructured.push({
          bodyRegion: def.regionId,
          subRegion: matchedSubRegionId,
          specificRegion: matchedSpecificRegionId,
        });
      }

      if (!detectedBodyLocation) {
        const foundDef = BODY_HIERARCHY.find(r => r.id === def.regionId);
        detectedBodyLocation = {
          region: def.regionId,
          subRegion: matchedSubRegionId,
          specificRegion: matchedSpecificRegionId,
          laterality: detectedLaterality,
          label: foundDef?.label || def.regionId,
        };
      }
    }
  }

  // Confidence assessment
  let confidence = 0.6;
  if (detectedBodyLocation && duration) {
    confidence = needsClarification ? 0.8 : 0.95;
  } else if (detectedBodyLocation || duration) {
    confidence = 0.85;
  }

  return {
    chiefComplaintSummary: text,
    complaintType,
    duration,
    bodyLocation: detectedBodyLocation,
    structuredRegions: matchedStructured,
    legacyBodyRegions: matchedLegacy,
    needsClarification,
    clarificationQuestion,
    clarificationOptions,
    confidence,
  };
}
