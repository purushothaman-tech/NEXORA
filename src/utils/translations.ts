import { SupportedLanguage, LanguageOption } from '../types/mednova';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN' },
];

export interface TranslationDict {
  appName: string;
  tagline: string;
  selectLanguage: string;
  kioskIntake: string;
  queueDashboard: string;
  doctorStation: string;
  adminAnalytics: string;
  startIntake: string;
  patientRegistration: string;
  fullName: string;
  age: string;
  gender: string;
  male: string;
  female: string;
  other: string;
  mobileNumber: string;
  abhaId: string;
  chiefComplaintTitle: string;
  chiefComplaintSubtitle: string;
  voiceInstruction: string;
  tapToSpeak: string;
  listening: string;
  stopListening: string;
  typeInstead: string;
  sampleComplaints: string;
  selectBodyArea: string;
  painSeverity: string;
  duration: string;
  associatedSymptoms: string;
  medicalHistory: string;
  vitalsCheck: string;
  submitAndTriage: string;
  tokenGenerated: string;
  triagePriority: string;
  proceedToRoom: string;
  emergencyAlert: string;
  redFlagsDetected: string;
  disclaimerText: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDict> = {
  en: {
    appName: 'MedNova',
    tagline: "From People's Voices to Prioritized Care",
    selectLanguage: 'Select Language',
    kioskIntake: 'Patient Intake',
    queueDashboard: 'Live Queue',
    doctorStation: 'Doctor Workstation',
    adminAnalytics: 'Hospital Analytics',
    startIntake: 'Begin Clinical Intake',
    patientRegistration: 'Patient Registration',
    fullName: 'Full Name',
    age: 'Age',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    mobileNumber: 'Mobile Number',
    abhaId: 'ABHA Health ID (Optional)',
    chiefComplaintTitle: 'What brings you to the hospital today?',
    chiefComplaintSubtitle: 'You can speak in your mother tongue, type, or touch the body map.',
    voiceInstruction: 'Press the microphone and explain your problem naturally',
    tapToSpeak: 'Tap to Speak',
    listening: 'Listening... Please describe your symptoms',
    stopListening: 'Done Speaking',
    typeInstead: 'Or type your health concern in your own words',
    sampleComplaints: 'Sample Voice Prompts (Click to try)',
    selectBodyArea: 'Select Affected Body Area',
    painSeverity: 'Pain Severity (0 - 10)',
    duration: 'How long have you had this issue?',
    associatedSymptoms: 'Accompanying Symptoms',
    medicalHistory: 'Past Medical History & Medications',
    vitalsCheck: 'Vital Signs Recording',
    submitAndTriage: 'Complete Intake & Generate Triage Token',
    tokenGenerated: 'Your OPD Token Has Been Generated',
    triagePriority: 'Triage Priority Level',
    proceedToRoom: 'Please proceed to designated consultation area',
    emergencyAlert: 'EMERGENCY RED FLAG DETECTED',
    redFlagsDetected: 'Immediate clinical review triggered based on critical symptoms.',
    disclaimerText: 'MedNova provides clinical intake structuring and triage decision support for healthcare professionals. MedNova does not autonomously diagnose or prescribe.',
  },
  hi: {
    appName: 'मेदनोवा (MedNova)',
    tagline: 'जन-जन की आवाज़ से त्वरित उपचार तक',
    selectLanguage: 'भाषा चुनें',
    kioskIntake: 'मरीज़ पंजीकरण एवं जाँच',
    queueDashboard: 'सक्रिय कतार (Queue)',
    doctorStation: 'डॉक्टर वर्कस्टेशन',
    adminAnalytics: 'अस्पताल विश्लेषण',
    startIntake: 'जाँच शुरू करें',
    patientRegistration: 'मरीज़ का विवरण',
    fullName: 'पूरा नाम',
    age: 'उम्र',
    gender: 'लिंग',
    male: 'पुरुष',
    female: 'महिला',
    other: 'अन्य',
    mobileNumber: 'मोबाइल नंबर',
    abhaId: 'आभा (ABHA) स्वास्थ्य आईडी',
    chiefComplaintTitle: 'आज आपको क्या परेशानी है?',
    chiefComplaintSubtitle: 'आप अपनी भाषा में बोल सकते हैं, लिख सकते हैं या शरीर के अंग पर छू सकते हैं।',
    voiceInstruction: 'माइक दबाएं और अपनी समस्या विस्तार से बताएं',
    tapToSpeak: 'बोलने के लिए माइक दबाएं',
    listening: 'सुन रहे हैं... कृपया अपनी परेशानी बताएं',
    stopListening: 'बोलना समाप्त करें',
    typeInstead: 'या अपने शब्दों में समस्या लिखें',
    sampleComplaints: 'आवाज़ के नमूने (क्लिक करके देखें)',
    selectBodyArea: 'शरीर का प्रभावित अंग चुनें',
    painSeverity: 'दर्द की तीव्रता (0 - 10)',
    duration: 'यह समस्या कब से है?',
    associatedSymptoms: 'अन्य लक्षण',
    medicalHistory: 'पुरानी बीमारियाँ व दवाइयाँ',
    vitalsCheck: 'वाइटल्स (रक्तचाप, पल्स, तापमान)',
    submitAndTriage: 'पंजीकरण पूरा करें व टोकन प्राप्त करें',
    tokenGenerated: 'आपका ओपीडी टोकन तैयार है',
    triagePriority: 'प्राथमिकता स्तर (Triage Level)',
    proceedToRoom: 'कृपया निर्दिष्ट परामर्श कक्ष में जाएं',
    emergencyAlert: 'आपातकालीन चेतावनी (EMERGENCY)',
    redFlagsDetected: 'गंभीर लक्षणों के कारण तुरंत आपातकालीन डॉक्टर को सूचित किया गया है।',
    disclaimerText: 'मेदनोवा केवल डॉक्टरों की सहायता हेतु प्राथमिकता तय करता है। यह स्वयं निदान या दवा का नुस्खा नहीं देता।',
  },
  ta: {
    appName: 'மெட்நோவா (MedNova)',
    tagline: 'மக்களின் குரலில் இருந்து முன்னுரிமை சிகிச்சை வரை',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    kioskIntake: 'நோயாளி பதிவு',
    queueDashboard: 'நேரலை வரிசை',
    doctorStation: 'மருத்துவர் பணிநிலையம்',
    adminAnalytics: 'மருத்துவமனை பகுப்பாய்வு',
    startIntake: 'பதிவைத் தொடங்கவும்',
    patientRegistration: 'நோயாளி விவரங்கள்',
    fullName: 'முழு பெயர்',
    age: 'வயது',
    gender: 'பாலினம்',
    male: 'ஆண்',
    female: 'பெண்',
    other: 'மற்றவை',
    mobileNumber: 'அலைபேசி எண்',
    abhaId: 'ஆபா (ABHA) சுகாதார அடையாள அட்டை',
    chiefComplaintTitle: 'இன்று உங்கள் உடல்நலப் பிரச்சனை என்ன?',
    chiefComplaintSubtitle: 'நீங்கள் தமிழில் பேசலாம், தட்டச்சு செய்யலாம் அல்லது உடல் வரைபடத்தில் தொடலாம்.',
    voiceInstruction: 'மைக் பொத்தானை அழுத்தி உங்கள் பிரச்சனையை தெளிவாகக் கூறவும்',
    tapToSpeak: 'பேச தொடங்குங்கள்',
    listening: 'கேட்கிறது... உங்கள் அறிகுறிகளைச் சொல்லுங்கள்',
    stopListening: 'பேசி முடிந்தது',
    typeInstead: 'அல்லது உங்கள் சொந்த வார்த்தைகளில் தட்டச்சு செய்யவும்',
    sampleComplaints: 'மாதிரி குரல் உள்ளீடுகள் (பயன்படுத்தவும்)',
    selectBodyArea: 'பாதிக்கப்பட்ட பகுதியைத் தேர்வு செய்யவும்',
    painSeverity: 'வலியின் அளவு (0 - 10)',
    duration: 'எவ்வளவு நாட்களாக இந்த பிரச்சனை உள்ளது?',
    associatedSymptoms: 'பிற அறிகுறிகள்',
    medicalHistory: 'முந்தைய நோய்கள் மற்றும் மருந்துகள்',
    vitalsCheck: 'உடல் நல அளவீடுகள் (Vitals)',
    submitAndTriage: 'முடிக்கவும் & டோக்கன் பெறவும்',
    tokenGenerated: 'உங்கள் டோக்கன் தயாராக உள்ளது',
    triagePriority: 'சிகிச்சை முன்னுரிமை நிலை',
    proceedToRoom: 'குறிப்பிட்ட அறைக்குச் செல்லவும்',
    emergencyAlert: 'அவசர சிகிச்சை எச்சரிக்கை',
    redFlagsDetected: 'தீவிர அறிகுறிகள் காரணமாக அவசர முன்னுரிமை வழங்கப்பட்டுள்ளது.',
    disclaimerText: 'மெட்நோவா மருத்துவர்களின் முடிவுக்கு உதவும் கருவியாகும். இது தானாக நோய் கண்டறிதல் அல்லது மருந்து வழங்காது.',
  },
  te: {
    appName: 'మెడ్నోవా (MedNova)',
    tagline: 'ప్రజల స్వరం నుండి ప్రాధాన్యత సంరక్షణ వరకు',
    selectLanguage: 'భాషను ఎంచుకోండి',
    kioskIntake: 'రోగి నమోదు',
    queueDashboard: 'క్యూ బోర్డు',
    doctorStation: 'వైద్యుల స్టేషన్',
    adminAnalytics: 'హాస్పిటల్ డేటా',
    startIntake: 'ప్రారంభించండి',
    patientRegistration: 'రోగి వివరాలు',
    fullName: 'పూర్తి పేరు',
    age: 'వయస్సు',
    gender: 'లింగం',
    male: 'పురుషుడు',
    female: 'స్త్రీ',
    other: 'ఇతర',
    mobileNumber: 'మొబైల్ సంఖ్య',
    abhaId: 'ABHA ఐడీ',
    chiefComplaintTitle: 'ఈ రోజు మీకు ఉన్న సమస్య ఏమిటి?',
    chiefComplaintSubtitle: 'మీరు మాట్లాడవచ్చు, టైప్ చేయవచ్చు లేదా శరీరంపై నొక్కవచ్చు.',
    voiceInstruction: 'మైక్ నొక్కి మీ సమస్యను వివరించండి',
    tapToSpeak: 'మాట్లాడటానికి నొక్కండి',
    listening: 'వింటున్నాము...',
    stopListening: 'పూర్తయింది',
    typeInstead: 'లేదా టైప్ చేయండి',
    sampleComplaints: 'నమూనా వాక్యాలు',
    selectBodyArea: 'సమస్య ఉన్న భాగాన్ని ఎంచుకోండి',
    painSeverity: 'నొప్పి తీవ్రత (0 - 10)',
    duration: 'ఎప్పటి నుండి ఉంది?',
    associatedSymptoms: 'ఇతర లక్షణాలు',
    medicalHistory: 'గత ఆరోగ్య చరిత్ర',
    vitalsCheck: 'వైటల్స్ రీడింగ్స్',
    submitAndTriage: 'పూర్తి చేసి టోకెన్ పొందండి',
    tokenGenerated: 'మీ టోకెన్ సిద్ధంగా ఉంది',
    triagePriority: 'ప్రాధాన్యత స్థాయి',
    proceedToRoom: 'గదికి వెళ్లండి',
    emergencyAlert: 'అత్యవసర హెచ్చరిక',
    redFlagsDetected: 'తీవ్ర లక్షణాలు గుర్తించబడ్డాయి.',
    disclaimerText: 'మెడ్నోవా వైద్యులకు సహాయపడే వేదిక మాత్రమే.',
  },
  bn: {
    appName: 'মেডনোভা (MedNova)',
    tagline: 'মানুষের কণ্ঠস্বর থেকে অগ্রাধিকারযুক্ত চিকিৎসা',
    selectLanguage: 'ভাষা নির্বাচন করুন',
    kioskIntake: 'রোগী ভর্তি ও বিবরণ',
    queueDashboard: 'লাইভ কিউ',
    doctorStation: 'ডাক্তার ওয়ার্কস্টেশন',
    adminAnalytics: 'হাসপাতাল রিপোর্ট',
    startIntake: 'শুরু করুন',
    patientRegistration: 'রোগীর তথ্য',
    fullName: 'পুরো নাম',
    age: 'বয়স',
    gender: 'লিঙ্গ',
    male: 'পুরুষ',
    female: 'মহিলা',
    other: 'অন্যান্য',
    mobileNumber: 'মোবাইল নম্বর',
    abhaId: 'ABHA আইডি',
    chiefComplaintTitle: 'আজ আপনার কি সমস্যা হচ্ছে?',
    chiefComplaintSubtitle: 'আপনি বাংলায় বলতে পারেন, লিখতে পারেন বা শরীরে স্পর্শ করতে পারেন।',
    voiceInstruction: 'মাইক টিপে আপনার কষ্ট বলুন',
    tapToSpeak: 'বলতে স্পর্শ করুন',
    listening: 'শুনছি...',
    stopListening: 'বলা শেষ',
    typeInstead: 'অথবা টাইপ করুন',
    sampleComplaints: 'নমুনা ভয়েস',
    selectBodyArea: 'আক্রান্ত অংশ বেছে নিন',
    painSeverity: 'ব্যথার তীব্রতা (0 - 10)',
    duration: 'কতদিন ধরে সমস্যা?',
    associatedSymptoms: 'অন্যান্য লক্ষণ',
    medicalHistory: 'পূর্ববর্তী চিকিৎসার ইতিহাস',
    vitalsCheck: 'ভাইটালস চেক',
    submitAndTriage: 'টোকেন নিন',
    tokenGenerated: 'টোকেন প্রস্তুত',
    triagePriority: 'জরুরি মাত্রা',
    proceedToRoom: 'নির্দিষ্ট কক্ষে যান',
    emergencyAlert: 'জরুরি সতর্কবার্তা',
    redFlagsDetected: 'গুরুতর লক্ষণের জন্য দ্রুত মনোযোগ প্রয়োজন।',
    disclaimerText: 'মেডনোভা ডাক্তারদের সহায়তার জন্য ডিজাইন করা হয়েছে।',
  },
  mr: {
    appName: 'मेडनोव्हा (MedNova)',
    tagline: 'लोकांच्या आवाजातून प्राधान्य उपचारांकडे',
    selectLanguage: 'भाषा निवडा',
    kioskIntake: 'रुग्ण नोंदणी',
    queueDashboard: 'थेट रांग (Queue)',
    doctorStation: 'डॉक्टर वर्कस्टेशन',
    adminAnalytics: 'रुग्णालय विश्लेषण',
    startIntake: 'नोंदणी सुरू करा',
    patientRegistration: 'रुग्णाची माहिती',
    fullName: 'पूर्ण नाव',
    age: 'वय',
    gender: 'लिंग',
    male: 'पुरुष',
    female: 'स्त्री',
    other: 'इतर',
    mobileNumber: 'मोबाईल नंबर',
    abhaId: 'आभा (ABHA) कार्ड',
    chiefComplaintTitle: 'आज आपल्याला काय त्रास होत आहे?',
    chiefComplaintSubtitle: 'तुम्ही बोलू शकता, लिहू शकता किंवा शरीरावर स्पर्श करू शकता.',
    voiceInstruction: 'माईक दाबून आपला त्रास सांगा',
    tapToSpeak: 'बोलण्यासाठी स्पर्श करा',
    listening: 'ऐकत आहे...',
    stopListening: 'बोलणे पूर्ण झाले',
    typeInstead: 'किंवा लिहून सांगा',
    sampleComplaints: 'नमुना वाक्ये',
    selectBodyArea: 'त्रास असलेला भाग निवडा',
    painSeverity: 'वेदनांची तीव्रता (0 - 10)',
    duration: 'त्रास किती दिवसांपासून आहे?',
    associatedSymptoms: 'इतर लक्षणे',
    medicalHistory: 'मागील आजार व औषधे',
    vitalsCheck: 'व्हायटल्स',
    submitAndTriage: 'टोकन मिळवा',
    tokenGenerated: 'आपले टोकन तयार आहे',
    triagePriority: 'प्राधान्य पातळी',
    proceedToRoom: 'कृपया कक्षात जा',
    emergencyAlert: 'तातडीची सूचना (Emergency)',
    redFlagsDetected: 'गंभीर लक्षणांमुळे तात्काळ डॉक्टर आवश्यक.',
    disclaimerText: 'मेडनोव्हा केवळ डॉक्टरांना निर्णय प्रक्रियेत मदत करते.',
  },
  kn: {
    appName: 'ಮೆಡ್ನೋವಾ (MedNova)',
    tagline: 'ಜನರ ಧ್ವನಿಯಿಂದ ಆದ್ಯತೆಯ ಆರೈಕೆಗೆ',
    selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
    kioskIntake: 'ರೋಗಿಯ ನೋಂದಣಿ',
    queueDashboard: 'ಸರದಿ ಸಾಲು',
    doctorStation: 'ವೈದ್ಯರ ಕೊಠಡಿ',
    adminAnalytics: 'ಆಸ್ಪತ್ರೆ ವರದಿ',
    startIntake: 'ಪ್ರಾರಂಭಿಸಿ',
    patientRegistration: 'ರೋಗಿಯ ವಿವರಗಳು',
    fullName: 'ಪೂರ್ಣ ಹೆಸರು',
    age: 'ವಯಸ್ಸು',
    gender: 'ಲಿಂಗ',
    male: 'ಪುರುಷ',
    female: 'ಮಹಿಳೆ',
    other: 'ಇತರ',
    mobileNumber: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    abhaId: 'ABHA ಗುರುತಿನ ಚೀಟಿ',
    chiefComplaintTitle: 'ಇಂದು ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಏನು?',
    chiefComplaintSubtitle: 'ನೀವು ಮಾತನಾಡಬಹುದು, ಟೈಪ್ ಮಾಡಬಹುದು ಅಥವಾ ಸ್ಪರ್ಶಿಸಬಹುದು.',
    voiceInstruction: 'ಮೈಕ್ ಒತ್ತಿ ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಹೇಳಿ',
    tapToSpeak: 'ಮಾತನಾಡಲು ಒತ್ತಿ',
    listening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ...',
    stopListening: 'ಮುಕ್ತಾಯ',
    typeInstead: 'ಅಥವಾ ಟೈಪ್ ಮಾಡಿ',
    sampleComplaints: 'ಮಾದರಿ ಧ್ವನಿಗಳು',
    selectBodyArea: 'ತೊಂದರೆ ಇರುವ ಜಾಗ ಆಯ್ಕೆಮಾಡಿ',
    painSeverity: 'ನೋವಿನ ಪ್ರಮಾಣ (0 - 10)',
    duration: 'ಎಷ್ಟು ಸಮಯದಿಂದ ಇದೆ?',
    associatedSymptoms: 'ಇತರ ಲಕ್ಷಣಗಳು',
    medicalHistory: 'ಹಳೆಯ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಔಷಧಿಗಳು',
    vitalsCheck: 'ವೈಟಲ್ಸ್ ವಿವರ',
    submitAndTriage: 'ಟೋಕನ್ ಪಡೆಯಿರಿ',
    tokenGenerated: 'ನಿಮ್ಮ ಟೋಕನ್ ಸಿದ್ಧವಾಗಿದೆ',
    triagePriority: 'ಆದ್ಯತಾ ಮಟ್ಟ',
    proceedToRoom: 'ಕೊಠಡಿಗೆ ತೆರಳಿ',
    emergencyAlert: 'ತುರ್ತು ಎಚ್ಚರಿಕೆ',
    redFlagsDetected: 'ಗಂಭೀರ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿವೆ.',
    disclaimerText: 'ಮೆಡ್ನೋವಾ ಕೇವಲ ವೈದ್ಯರ ಸಹಾಯಕ್ಕಾಗಿ ರೂಪಿಸಲಾಗಿದೆ.',
  },
  ml: {
    appName: 'മെഡ്നോവ (MedNova)',
    tagline: 'ജനങ്ങളുടെ ശബ്ദത്തിൽ നിന്ന് മുൻഗണനാ പരിചരണത്തിലേക്ക്',
    selectLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    kioskIntake: 'രോഗി രജിസ്ട്രേഷൻ',
    queueDashboard: 'ക്യൂ ബോർഡ്',
    doctorStation: 'ഡോക്ടർ വർക്ക്സ്റ്റേഷൻ',
    adminAnalytics: 'ആശുപത്രി അനലിറ്റിക്സ്',
    startIntake: 'ആരംഭിക്കുക',
    patientRegistration: 'വിവരങ്ങൾ',
    fullName: 'പൂർണ്ണമായ പേര്',
    age: 'പ്രായം',
    gender: 'ലിംഗം',
    male: 'പുരുഷൻ',
    female: 'സ്ത്രീ',
    other: 'മറ്റുള്ളവ',
    mobileNumber: 'മൊബൈൽ നമ്പർ',
    abhaId: 'ABHA ഐഡി',
    chiefComplaintTitle: 'ഇന്ന് എന്താണ് അസുഖം?',
    chiefComplaintSubtitle: 'സംസാരിക്കുകയോ ടൈപ്പ് ചെയ്യുകയോ തൊടുകയോ ചെയ്യാം.',
    voiceInstruction: 'മൈക്ക് അമർത്തി ലക്ഷണങ്ങൾ പറയുക',
    tapToSpeak: 'സംസാരിക്കാൻ അമർത്തുക',
    listening: 'കേൾക്കുന്നു...',
    stopListening: 'പൂർത്തിയായി',
    typeInstead: 'അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യുക',
    sampleComplaints: 'മാതൃക ശബ്ദം',
    selectBodyArea: 'ശരീര ഭാഗം തിരഞ്ഞെടുക്കുക',
    painSeverity: 'വേദനയുടെ കാഠിന്യം (0 - 10)',
    duration: 'എത്ര ദിവസമായി?',
    associatedSymptoms: 'മറ്റു ലക്ഷണങ്ങൾ',
    medicalHistory: 'പഴയ അസുഖങ്ങൾ',
    vitalsCheck: 'വൈറ്റൽസ്',
    submitAndTriage: 'ടോക്കൺ നേടുക',
    tokenGenerated: 'ടോക്കൺ തയ്യാറാണ്',
    triagePriority: 'മുൻഗണന',
    proceedToRoom: 'മുറിയിലേക്ക് പോകുക',
    emergencyAlert: 'അടിയന്തര മുന്നറിയിപ്പ്',
    redFlagsDetected: 'ഉടൻ ഡോക്ടറെ കാണേണ്ടതുണ്ട്.',
    disclaimerText: 'ഡോക്ടർമാർക്കുള്ള തീരുമാന പിന്തുണ പ്ലാറ്റ്‌ഫോം.',
  },
};

// Realistic sample clinical complaints in Indian languages for 1-click test & voice input
export interface SampleComplaint {
  language: SupportedLanguage;
  nativeText: string;
  englishTranslation: string;
  category: string;
  expectedTriage: 1 | 2 | 3 | 4;
  department: string;
  bodyRegion: 'chest' | 'head_neck' | 'abdomen' | 'spine_back' | 'upper_limbs' | 'lower_limbs' | 'pelvis_urinary';
}

export const SAMPLE_COMPLAINTS: SampleComplaint[] = [
  {
    language: 'hi',
    nativeText: 'मेरे सीने में पिछले 2 घंटे से बहुत भारी दबाव और पसीना आ रहा है, दर्द बाएं कंधे और जबड़े तक जा रहा है।',
    englishTranslation: 'Severe retrosternal chest pressure and profuse sweating for the past 2 hours, pain radiating to the left shoulder and jaw.',
    category: 'Acute Chest Pain / Cardiac',
    expectedTriage: 1,
    department: 'Cardiology',
    bodyRegion: 'chest',
  },
  {
    language: 'ta',
    nativeText: '3 நாட்களாக கடுமையான காய்ச்சல் மற்றும் கண் இமைகளின் பின்னால் கடுமையான வலி உள்ளது, உடலில் சிவப்பு புள்ளிகள் தென்படுகின்றன.',
    englishTranslation: 'Severe high fever with retro-orbital headache for 3 days, petechial rash observed on limbs.',
    category: 'Suspected Dengue / Acute Febrile',
    expectedTriage: 2,
    department: 'General Medicine',
    bodyRegion: 'head_neck',
  },
  {
    language: 'hi',
    nativeText: 'पेट के निचले दाहिने हिस्से में 8 घंटे से असहनीय दर्द हो रहा है, 3 बार उल्टी हुई है और हल्का बुखार भी है।',
    englishTranslation: 'Excruciating right lower abdominal pain for 8 hours with vomiting (3 episodes) and low grade fever.',
    category: 'Acute Abdomen / Suspected Appendicitis',
    expectedTriage: 2,
    department: 'General Surgery',
    bodyRegion: 'abdomen',
  },
  {
    language: 'te',
    nativeText: 'నాకు ఊపిరి తీసుకోవడం చాలా కష్టంగా ఉంది, పిల్లికూతలు వస్తున్నాయి, దగ్గు వల్ల రాత్రి పడుకోలేకపోయాను.',
    englishTranslation: 'Severe shortness of breath with audible wheezing, unable to lie flat due to persistent night cough.',
    category: 'Severe Bronchospasm / Asthma Exacerbation',
    expectedTriage: 2,
    department: 'Pulmonology',
    bodyRegion: 'chest',
  },
  {
    language: 'en',
    nativeText: 'Sudden weakness on the right side of my body with slurred speech and facial drooping that started 45 minutes ago.',
    englishTranslation: 'Sudden right-sided hemiparesis, dysarthria and facial droop that started 45 minutes ago.',
    category: 'Acute Ischemic Stroke Window',
    expectedTriage: 1,
    department: 'Emergency & Trauma',
    bodyRegion: 'head_neck',
  },
  {
    language: 'mr',
    nativeText: 'गेल्या ६ महिन्यांपासून दोन्ही गुडघ्यांमध्ये चालताना खूप कटकट आवाज आणि दुखणे होते, सकाळी ताठरता जाणवते.',
    englishTranslation: 'Bilateral knee pain with crepitus on walking for 6 months and morning stiffness.',
    category: 'Bilateral Knee Osteoarthritis',
    expectedTriage: 4,
    department: 'Orthopedics',
    bodyRegion: 'lower_limbs',
  },
];

// Helper to speak announcements via SpeechSynthesis
export function speakAnnouncement(text: string, langCode: string = 'en-IN') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
  }
}
