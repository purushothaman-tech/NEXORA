MedNova

AI-powered multilingual clinical case-taking, intelligent triage, medical document processing, AYUSH assessment, and dynamic OPD queue management platform.

🏥 About

MedNova is a healthcare software platform designed to make patient case-taking simpler, faster, and more structured.

Patients can explain their health concerns using voice, text, or touch in their preferred language. MedNova understands the information, asks relevant follow-up questions, and converts the conversation into a structured clinical record for practitioner review.

The platform also helps organize previous medical records, support patient prioritization, and reduce repetitive manual work during the pre-consultation process.

✨ Key Features
🗣️ Multilingual Voice-Based Case Taking
Natural voice-based patient interaction
Support for Indian languages
Code-mixed speech support
Text and touch alternatives
Voice guidance for accessibility
Confidence-aware information extraction
🧠 Adaptive Dynamic Case Path

MedNova uses an Adaptive Dynamic Case Path (ADCP) to determine relevant follow-up questions based on the information already provided by the patient.

It helps avoid asking every patient the same fixed set of questions and focuses on the information that is still required.

🎯 Intelligent Triage

The system provides software-based patient prioritization using structured case information.

It can consider:

Clinical priority
Waiting time
Patient status
Department
Resource availability
Validated emergency rules

The system supports staff and practitioners rather than making autonomous clinical decisions.

📄 Intelligent Medical Document Processing

Patients can upload or scan:

ECG reports
Laboratory reports
Prescriptions
Discharge summaries
Consultation notes
X-ray reports
CT/MRI reports
Ultrasound reports
Referral letters
Previous medical records

MedNova uses OCR and document understanding to identify the document type, extract useful information, detect clinical dates, and organize records chronologically.

For example:

IMG_20260919_143522.pdf

can become:

ECG Report - 18 Sep 2026.pdf

The original document is preserved along with its extracted information.

🗓️ Chronological Medical Records

Medical records are organized according to their clinical/event date, rather than simply the upload date.

This helps create a longitudinal view of the patient's previous medical history.

📍 Detailed Body Location

MedNova supports detailed anatomical information including:

Left
Right
Both
Unknown
Region
Sub-region

For example:

Right Arm → Forearm → Wrist → Palm

The system does not assume laterality when the patient has not specified it.

🌿 AYUSH & Prakriti Assessment

MedNova includes guided AYUSH-oriented case-taking and Prakriti assessment covering areas such as:

Body build
Skin
Hair
Appetite
Digestion
Sleep
Energy
Temperature preference
Physical characteristics
Mental characteristics
Lifestyle

The collected information remains available for practitioner review.

🪪 ABHA & Emergency Guest Mode

MedNova supports ABHA-oriented registration and consent.

For emergency situations, patients can continue using a temporary guest identity and the case can later be linked to ABHA after appropriate verification and consent.

👩‍⚕️ Nurse / Caregiver Mode

Authorized nurses can assist patients who have difficulty using the system.

MedNova maintains information provenance such as:

PATIENT_VOICE
PATIENT_TOUCH
NURSE_ASSISTED
DOCUMENT_OCR
PRACTITIONER_ENTERED
🔊 Accessibility

The patient interface supports:

Multilingual voice guidance
Text-to-speech
Voice replay
Large touch targets
High contrast
Voice interaction
Nurse-assisted workflows

Voice guidance and microphone input are handled as separate systems.

🏥 Live OPD Queue

Staff can manage the live patient queue with:

Priority levels
Waiting time
Department filtering
Patient status
Doctor/room assignment
Patient calling
Call again
Dynamic re-triage
Emergency priority
👨‍⚕️ Practitioner Dashboard

Practitioners can review:

Patient information
Chief complaint
Symptoms
Duration
Body location
Previous medical records
OCR-extracted information
AYUSH assessment
Prakriti information
Triage priority
Medical timeline
Structured case summary

AI-generated information can be reviewed, edited, verified, or rejected by the practitioner.

🛠️ Technology Stack

Frontend

React
TypeScript
Tailwind CSS
Progressive Web App architecture

Backend

Node.js
API-based backend
Firebase

Database & Storage

Firebase Firestore
Firebase Storage
Firebase Authentication

AI

Google Gemini API
Clinical information extraction
Confidence-aware processing
Adaptive Dynamic Case Path
Clinical summarization

Speech

Speech-to-Text
Multilingual speech recognition
Text-to-Speech

Document Intelligence

OCR
Document classification
Metadata extraction
Clinical date extraction
Chronological record organization

Interoperability

ABDM
ABHA
FHIR-ready architecture
🔐 Security & Privacy

MedNova is designed with controlled access to patient information and includes:

Role-based access
Authentication
Consent management
Audit logs
Data provenance
Secure document storage
Protected API access
Practitioner verification
🎯 Objective

The goal of MedNova is to reduce repetitive manual case-taking work and help healthcare facilities collect, structure, and organize patient information before consultation.

It brings together multilingual patient interaction, adaptive case-taking, medical document intelligence, AYUSH assessment, intelligent triage, and OPD queue management in one platform.

📌 Project

Project: MedNova
SIH Problem Statement: SIH26047 - Patient Case-Taking Software
Domain: Healthcare / Digital Health
Category: Software

🔮 Future Scope
Expanded ABDM/FHIR integration
More Indian languages
Improved multilingual speech recognition
Advanced medical document understanding
Hospital Information System integration
Explainable AI
Expanded AYUSH knowledge base
Longitudinal patient records
OPD workflow analytics
Additional healthcare workflows

👥 Development Philosophy
MedNova follows a human-in-the-loop approach.
AI assists with understanding and organizing information. The system structures the information. Practitioners verify the information and make clinical decisions
