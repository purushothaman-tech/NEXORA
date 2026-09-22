import { PrakritiQuestion, PrakritiAssessment, PrakritiAnswerRecord, InformationSource, SupportedLanguage } from '../types/mednova';

/**
 * Controlled Question Bank for AYUSH Prakriti Assessment.
 * Strict non-invented questions curated according to standardized Ayurvedic Prakriti Pariksha guidelines.
 */
export const PRAKRITI_QUESTION_BANK: PrakritiQuestion[] = [
  {
    id: 'pq_body_build',
    category: 'body_build',
    questionText: 'How would you describe your overall physical body frame?',
    subtitle: 'Observe bone structure, shoulders, and natural weight tendency.',
    audioPromptKey: 'prakriti.q.body_build',
    options: [
      {
        key: 'vata_lean',
        label: 'Thin, slender, prominent bones/joints, difficulty gaining weight',
        doshaWeight: { vata: 3, pitta: 0, kapha: 0 },
        description: 'Ectomorphic, light physical frame with visible tendons.',
      },
      {
        key: 'pitta_medium',
        label: 'Medium, athletic, well-proportioned, moderate muscle development',
        doshaWeight: { vata: 0, pitta: 3, kapha: 0 },
        description: 'Mesomorphic, balanced frame with moderate symmetry.',
      },
      {
        key: 'kapha_broad',
        label: 'Broad, heavy-set, solid bone structure, tendency to gain weight easily',
        doshaWeight: { vata: 0, pitta: 0, kapha: 3 },
        description: 'Endomorphic, sturdy, well-cushioned and dense frame.',
      },
    ],
  },
  {
    id: 'pq_skin',
    category: 'skin',
    questionText: 'What are your natural skin characteristics?',
    subtitle: 'Notice moisture, texture, and tendency towards temperature or redness.',
    audioPromptKey: 'prakriti.q.skin',
    options: [
      {
        key: 'vata_dry',
        label: 'Dry, rough, thin, prone to cracking or chapping, cool to touch',
        doshaWeight: { vata: 3, pitta: 0, kapha: 0 },
        description: 'Requires frequent moisturizing, easily rough.',
      },
      {
        key: 'pitta_warm',
        label: 'Warm, reddish/fair, sensitive, prone to moles, freckles, or rashes',
        doshaWeight: { vata: 0, pitta: 3, kapha: 0 },
        description: 'Flushes easily, reacts to heat, delicate and pinkish.',
      },
      {
        key: 'kapha_oily',
        label: 'Thick, oily or moist, smooth, soft, glowing, cool and pale',
        doshaWeight: { vata: 0, pitta: 0, kapha: 3 },
        description: 'Naturally hydrated, thick, resilient with small pores.',
      },
    ],
  },
  {
    id: 'pq_hair',
    category: 'hair',
    questionText: 'How is your scalp hair naturally?',
    subtitle: 'Texture, density, and hydration without chemical treatments.',
    audioPromptKey: 'prakriti.q.hair',
    options: [
      {
        key: 'vata_dry_curly',
        label: 'Dry, brittle, thin, rough, split ends, or frizzy',
        doshaWeight: { vata: 3, pitta: 0, kapha: 0 },
        description: 'Dull finish, tends to knot easily.',
      },
      {
        key: 'pitta_fine_thinning',
        label: 'Fine, soft, reddish/blonde tint, early thinning, graying, or balding',
        doshaWeight: { vata: 0, pitta: 3, kapha: 0 },
        description: 'Silky but fragile, warmth-sensitive scalp.',
      },
      {
        key: 'kapha_thick_lustrous',
        label: 'Thick, dense, wavy, dark, shiny, oily, and strongly rooted',
        doshaWeight: { vata: 0, pitta: 0, kapha: 3 },
        description: 'Abundant volume, lush, resilient and heavy.',
      },
    ],
  },
  {
    id: 'pq_appetite_digestion',
    category: 'appetite_digestion',
    questionText: 'How is your daily appetite and digestive rhythm (Agni)?',
    subtitle: 'Hunger timing, digestive speed, and bowel regularity.',
    audioPromptKey: 'prakriti.q.appetite',
    options: [
      {
        key: 'vata_irregular',
        label: 'Variable and unpredictable (Vishama Agni); hungry sometimes, forgets meals other times, gas/bloating',
        doshaWeight: { vata: 3, pitta: 0, kapha: 0 },
        description: 'Inconsistent meal times, irregular bowel movements.',
      },
      {
        key: 'pitta_strong',
        label: 'Strong and sharp (Tikshna Agni); becomes irritable if meals are delayed, acidic tendency, thirst',
        doshaWeight: { vata: 0, pitta: 3, kapha: 0 },
        description: 'High metabolic fire, must eat on time, frequent loose stools.',
      },
      {
        key: 'kapha_slow',
        label: 'Slow and steady (Manda Agni); can skip meals easily without discomfort, slow digestion, heavy feeling',
        doshaWeight: { vata: 0, pitta: 0, kapha: 3 },
        description: 'Loves warm spices to stimulate digestion, sluggish bowel habits.',
      },
    ],
  },
  {
    id: 'pq_sleep',
    category: 'sleep',
    questionText: 'What is your typical sleep pattern?',
    subtitle: 'Duration, depth of sleep, and waking feeling.',
    audioPromptKey: 'prakriti.q.sleep',
    options: [
      {
        key: 'vata_light',
        label: 'Light, interrupted, takes long to fall asleep, vivid dreams, wakes feeling unrefreshed (5-6 hours)',
        doshaWeight: { vata: 3, pitta: 0, kapha: 0 },
        description: 'Easily awakened by faint noises or temperature drops.',
      },
      {
        key: 'pitta_moderate',
        label: 'Moderate (6-7 hours), falls asleep easily, wakes alert, occasional waking due to overheating/thirst',
        doshaWeight: { vata: 0, pitta: 3, kapha: 0 },
        description: 'Goal-oriented dreams, wakes up quickly ready for tasks.',
      },
      {
        key: 'kapha_deep',
        label: 'Deep, uninterrupted, heavy (8-9+ hours), difficulty waking up in the morning, loves naps',
        doshaWeight: { vata: 0, pitta: 0, kapha: 3 },
        description: 'Sound sleeper, feels groggy for 30 minutes upon waking.',
      },
    ],
  },
  {
    id: 'pq_temperature_tolerance',
    category: 'temperature_tolerance',
    questionText: 'Which weather or climate do you naturally prefer or find most uncomfortable?',
    subtitle: 'Tolerance to seasonal heat, winter cold, or breeze.',
    audioPromptKey: 'prakriti.q.temperature',
    options: [
      {
        key: 'vata_hates_cold',
        label: 'Dislikes cold weather and dry winds; loves warmth, hot drinks, sun, and cozy blankets',
        doshaWeight: { vata: 3, pitta: 0, kapha: 0 },
        description: 'Cold hands and feet, stiffens in winter.',
      },
      {
        key: 'pitta_hates_heat',
        label: 'Dislikes hot humid weather; craves cool air, AC, cold beverages, and shade',
        doshaWeight: { vata: 0, pitta: 3, kapha: 0 },
        description: 'Perspires easily, overheats quickly in sunshine.',
      },
      {
        key: 'kapha_hates_damp',
        label: 'Dislikes damp, wet, chilly weather; tolerates both moderate heat and cold well if dry',
        doshaWeight: { vata: 0, pitta: 0, kapha: 3 },
        description: 'Prone to sinus congestion and mucus in monsoon/winter.',
      },
    ],
  },
  {
    id: 'pq_energy_activity',
    category: 'energy_activity',
    questionText: 'How is your natural physical energy and pace of movement?',
    subtitle: 'Daily stamina, speed of walking, speaking, and task execution.',
    audioPromptKey: 'prakriti.q.energy',
    options: [
      {
        key: 'vata_bursts',
        label: 'Bursts of quick energy, fast walker/talker, tire out suddenly, erratic stamina',
        doshaWeight: { vata: 3, pitta: 0, kapha: 0 },
        description: 'Quick to start, fast pace, needs regular rest pauses.',
      },
      {
        key: 'pitta_purposeful',
        label: 'Moderate, purposeful, competitive, driven, maintains good stamina with discipline',
        doshaWeight: { vata: 0, pitta: 3, kapha: 0 },
        description: 'Goal-focused energy, pushes through fatigue.',
      },
      {
        key: 'kapha_enduring',
        label: 'Slow to get started, but exceptional steady endurance and stamina once in motion',
        doshaWeight: { vata: 0, pitta: 0, kapha: 3 },
        description: 'Calm, methodical, sustained strength, rarely exhausts.',
      },
    ],
  },
  {
    id: 'pq_mental_temperament',
    category: 'mental_temperament',
    questionText: 'Under stress or pressure, what is your primary emotional response?',
    subtitle: 'First instinctive reaction to sudden uncertainty or conflict.',
    audioPromptKey: 'prakriti.q.mental',
    options: [
      {
        key: 'vata_anxiety',
        label: 'Anxiety, worry, overthinking, restlessness, indecisiveness',
        doshaWeight: { vata: 3, pitta: 0, kapha: 0 },
        description: 'Mind races, quick to adapt, quick to forget details.',
      },
      {
        key: 'pitta_irritation',
        label: 'Irritation, impatience, anger, critical evaluation, perfectionism',
        doshaWeight: { vata: 0, pitta: 3, kapha: 0 },
        description: 'Sharp intellect, decisive, demands efficiency and logic.',
      },
      {
        key: 'kapha_calm',
        label: 'Calm, steady, patient, avoids conflict, may withdraw or procrastinate',
        doshaWeight: { vata: 0, pitta: 0, kapha: 3 },
        description: 'Loyal, affectionate, forgiving, resistant to rapid changes.',
      },
    ],
  },
  {
    id: 'pq_lifestyle',
    category: 'lifestyle',
    questionText: 'How is your typical lifestyle and dietary preference?',
    subtitle: 'Daily routine consistency and taste cravings.',
    audioPromptKey: 'prakriti.q.lifestyle',
    options: [
      {
        key: 'vata_spontaneous',
        label: 'Spontaneous schedule, craves warm, sweet, salty, oily foods and soups',
        doshaWeight: { vata: 3, pitta: 0, kapha: 0 },
        description: 'Travel-loving, irregular meal times, likes hot comforting foods.',
      },
      {
        key: 'pitta_organized',
        label: 'Organized and punctual, craves sweet, bitter, astringent tastes, cold salads and sweets',
        doshaWeight: { vata: 0, pitta: 3, kapha: 0 },
        description: 'Strict schedule, dislikes missing lunch, enjoys refreshing drinks.',
      },
      {
        key: 'kapha_routine',
        label: 'Loves steady home routine, comfortable stability, craves pungent, spicy, and light food',
        doshaWeight: { vata: 0, pitta: 0, kapha: 3 },
        description: 'Enjoys leisure, slow mornings, thrives on stimulating spices.',
      },
    ],
  },
];

export interface LocalizedPrakritiContent {
  questionText: string;
  subtitle: string;
  options: Record<string, { label: string; description?: string }>;
}

export const PRAKRITI_LOCALIZED_MAP: Partial<Record<SupportedLanguage, Record<string, LocalizedPrakritiContent>>> = {
  ta: {
    pq_body_build: {
      questionText: 'உங்கள் ஒட்டுமொத்த உடல் அமைப்பை எவ்வாறு விவரிப்பீர்கள்?',
      subtitle: 'எலும்பு அமைப்பு, தோள்கள் மற்றும் இயற்கையான எடை போக்கைக் கவனியுங்கள்.',
      options: {
        vata_lean: { label: 'மெலிந்த, எலும்புகள்/மூட்டுகள் துருத்திய உடல், எடை அதிகரிப்பதில் சிரமம்', description: 'லேசான உடல் அமைப்பு, நரம்புகள் துருத்திய தோற்றம்.' },
        pitta_medium: { label: 'நடுத்தர, தசைப்பிடிப்புள்ள சீரான உடல் அமைப்பு', description: 'சமச்சீரான, நடுத்தர தசை வலிமை.' },
        kapha_broad: { label: 'பருமனான, கனமான, எளிதில் எடை கூடும் வலுவான எலும்பு அமைப்பு', description: 'வலுவான, தடிமனான உடலமைப்பு.' },
      },
    },
    pq_skin: {
      questionText: 'உங்கள் இயற்கையான சருமத்தின் தன்மை என்ன?',
      subtitle: 'ஈரப்பதம், சரும வழவழப்பு மற்றும் வெப்பநிலை மாற்றங்களைக் கவனியுங்கள்.',
      options: {
        vata_dry: { label: 'வறண்ட, கடினமான, எளிதில் வெடிப்பு ஏற்படும், தொட்டால் குளிர்ந்த சருமம்', description: 'அடிக்கடி மாய்ஸ்சரைசர் தேவைப்படும் வறண்ட சருமம்.' },
        pitta_warm: { label: 'வெதுவெதுப்பான, சிவந்த/வெளிறிய, உணர்திறன் மிக்க, தடிப்புகள் வரும் சருமம்', description: 'வெயிலைத் தாங்காத, விரைவில் சிவக்கும் சருமம்.' },
        kapha_oily: { label: 'எண்ணெய்பசை அல்லது ஈரப்பதமான, மென்மையான, பளபளப்பான சருமம்', description: 'இயற்கையாகவே ஈரப்பதமுள்ள வழவழப்பான சருமம்.' },
      },
    },
    pq_hair: {
      questionText: 'உங்கள் தலைமுடி இயற்கையாக எப்படி இருக்கும்?',
      subtitle: 'முடியின் தடிமன், பளபளப்பு மற்றும் ஈரப்பதம்.',
      options: {
        vata_dry_curly: { label: 'வறண்ட, மெல்லிய, பிளவுபட்ட முனைகள் கொண்ட அல்லது சுருண்ட முடி', description: 'பளபளப்பற்ற, எளிதில் சிக்கும் முடி.' },
        pitta_fine_thinning: { label: 'மென்மையான, இளம் வயதிலேயே நரைத்தல் அல்லது முடி உதிரும் போக்கு', description: 'மெல்லிய இழைகள், வெப்பம் தாங்காத உச்சந்தலை.' },
        kapha_thick_lustrous: { label: 'அடர்த்தியான, அலைபாயும், பளபளப்பான, வேரூன்றிய வலுவான முடி', description: 'அடர்த்தியான, வலுவான பளபளப்பான முடி.' },
      },
    },
    pq_appetite_digestion: {
      questionText: 'உங்கள் தினசரி பசி மற்றும் செரிமானத் திறன் (அக்னி) எப்படி உள்ளது?',
      subtitle: 'பசி எடுக்கும் நேரம் மற்றும் செரிமான வேகம்.',
      options: {
        vata_irregular: { label: 'நிலையற்ற பசி (விஷம அக்னி); சில நேரம் பசிக்கும், சில நேரம் பசிக்காது, வாயுத்தொல்லை', description: 'மாறுபடும் உணவு நேரங்கள்.' },
        pitta_strong: { label: 'அதிக மற்றும் கடுமையான பசி (தீக்ஷ்ண அக்னி); நேரம் தவறினால் எரிச்சல், அமிலத்தன்மை', description: 'வலுவான செரிமான அக்னி, சரியான நேரத்திற்கு சாப்பிட வேண்டும்.' },
        kapha_slow: { label: 'மிதமான மற்றும் மெதுவான பசி (மந்த அக்னி); பசியில்லாமல் எளிதாக உணவைத் தவிர்க்க முடியும்', description: 'மெதுவான செரிமானம், மந்தமான உணர்வு.' },
      },
    },
    pq_sleep: {
      questionText: 'உங்கள் வழக்கமான தூக்க முறை எப்படிப்பட்டது?',
      subtitle: 'தூக்கத்தின் ஆழம், கால அளவு மற்றும் காலையில் எழும் உணர்வு.',
      options: {
        vata_light: { label: 'லேசான தூக்கம், அடிக்கடி விழிப்பு, கனவுகள், காலையில் சோர்வாக உணர்தல்', description: 'சிறு சத்தத்திற்கும் உடனே கண் விழித்தல்.' },
        pitta_moderate: { label: 'மிதமான தூக்கம் (6-7 மணி நேரம்), எளிதில் விழித்தல், புத்துணர்ச்சியுடன் எழுதல்', description: 'குறிக்கோள் சார்ந்த கனவுகள், சுறுசுறுப்பாக எழுதல்.' },
        kapha_deep: { label: 'ஆழ்ந்த, கனமான, தடையற்ற தூக்கம் (8-9 மணி நேரம்), காலையில் எழ சிரமம்', description: 'நல்ல ஆழ்ந்த தூக்கம், காலையில் எழுவது மெதுவாக இருக்கும்.' },
      },
    },
    pq_temperature_tolerance: {
      questionText: 'எந்த தட்பவெப்பநிலை உங்களுக்கு மிகவும் சிரமமாக அல்லது இதமாக இருக்கும்?',
      subtitle: 'குளிர் அல்லது வெப்பத்தைத் தாங்கும் திறன்.',
      options: {
        vata_hates_cold: { label: 'குளிர்காற்று பிடிக்காது; வெதுவெதுப்பான உணவு, சூரிய வெளிச்சம் மற்றும் போர்வை பிடிக்கும்', description: 'குளிர்ந்த கைகள் மற்றும் கால்கள்.' },
        pitta_hates_heat: { label: 'வெப்பம் மற்றும் ஈரப்பதம் பிடிக்காது; குளிர்ந்த காற்று, நிழல், குளிர் பானங்கள் பிடிக்கும்', description: 'எளிதில் வியர்க்கும், வெப்பம் பிடிக்காது.' },
        kapha_hates_damp: { label: 'ஈரமான, குளிர்ந்த வானிலை பிடிக்காது; உலர்ந்த மிதமான காலநிலையைத் தாங்கும்', description: 'மழைக்காலத்தில் சளி பிடிக்க வாய்ப்பு அதிகம்.' },
      },
    },
    pq_energy_activity: {
      questionText: 'உங்கள் இயற்கையான உடல் ஆற்றல் மற்றும் செயல்பாட்டு வேகம் எப்படி?',
      subtitle: 'தினசரி சகிப்புத்தன்மை, நடக்கும் மற்றும் பேசும் வேகம்.',
      options: {
        vata_bursts: { label: 'திடீரென அதிக ஆற்றல், வேகமான நடை/பேச்சு, விரைவில் சோர்வடைதல்', description: 'விரைவாகத் தொடங்குதல், சீரற்ற ஆற்றல்.' },
        pitta_purposeful: { label: 'குறிக்கோளுடன் கூடிய சீரான ஆற்றல், ஒழுக்கத்துடன் கூடிய நல்ல சகிப்புத்தன்மை', description: 'இலக்கு சார்ந்த செயல்பாடுகள்.' },
        kapha_enduring: { label: 'ஆரம்பிக்க மெதுவாக இருக்கும், ஆனால் நீண்ட நேரம் தளராமல் உழைக்கும் ஆற்றல்', description: 'அமைதியான, தொடர்ச்சியான உடல் உறுதி.' },
      },
    },
    pq_mental_temperament: {
      questionText: 'மன அழுத்தம் அல்லது பதற்றத்தின் போது உங்கள் முதன்மை எதிர்வினை என்ன?',
      subtitle: 'திடீர் நிச்சயமற்ற தன்மைக்கான உங்கள் இயற்கையான எதிர்வினை.',
      options: {
        vata_anxiety: { label: 'கவலை, அளவுக்கு அதிகமாக யோசித்தல், அமைதியின்மை, தயக்கம்', description: 'மனம் அலைபாயும், எளிதில் பதற்றமடைதல்.' },
        pitta_irritation: { label: 'எரிச்சல், பொறுமையின்மை, கோபம், துல்லியத்தை எதிர்பார்ப்பது', description: 'கூர்மையான புத்தி, முடிவெடுக்கும் திறன்.' },
        kapha_calm: { label: 'அமைதி, பொறுமை, மோதல்களைத் தவிர்த்தல், மெதுவாக முடிவெடுப்பது', description: 'பொறுமையான குணம், அன்பான போக்கு.' },
      },
    },
    pq_lifestyle: {
      questionText: 'உங்கள் வழக்கமான வாழ்க்கை முறை மற்றும் உணவு விருப்பம் என்ன?',
      subtitle: 'தினசரி பழக்கவழக்கம் மற்றும் விருப்பமான சுவைகள்.',
      options: {
        vata_spontaneous: { label: 'திட்டமிடப்படாத வழக்கம்; சூடான, இனிப்பான, எண்ணெய்பசையான உணவுகள் மற்றும் சூப் பிடிக்கும்', description: 'பயணங்கள் பிடிக்கும், மாறிக்கொண்டே இருக்கும் உணவு நேரம்.' },
        pitta_organized: { label: 'ஒழுங்கான திட்டமிடல்; இனிப்பு, கசப்பு, குளிர்ச்சியான உணவுகள் மற்றும் பழங்கள் பிடிக்கும்', description: 'சரியான அட்டவணை, மதிய உணவு தாமதமாவதை விரும்பாமை.' },
        kapha_routine: { label: 'நிலையான வீட்டு வழக்கம்; காரமான, எளிதில் செரிக்கும் உணவு மற்றும் மசாலா பிடிக்கும்', description: 'நிலையான சூழல், காரசாரமான சுவைகள் பிடிக்கும்.' },
      },
    },
  },
  hi: {
    pq_body_build: {
      questionText: 'आप अपनी समग्र शारीरिक बनावट का वर्णन कैसे करेंगे?',
      subtitle: 'हड्डियों की बनावट, कंधे और प्राकृतिक वजन की प्रवृत्ति पर ध्यान दें।',
      options: {
        vata_lean: { label: 'पतला, दुबला, उभरी हुई हड्डियां/जोड़, वजन बढ़ाने में कठिनाई', description: 'हल्का ढांचा, नसें आसानी से दिखाई देती हैं।' },
        pitta_medium: { label: 'मध्यम, गठीला, सुडौल, संतुलित मांसपेशियां', description: 'संतुलित संरचना, मध्यम ताकत।' },
        kapha_broad: { label: 'चौड़ा, भारी, मजबूत हड्डियों की संरचना, आसानी से वजन बढ़ना', description: 'ठोस, भारी और मजबूत शरीर।' },
      },
    },
    pq_skin: {
      questionText: 'आपकी प्राकृतिक त्वचा की विशेषताएँ क्या हैं?',
      subtitle: 'नमी, बनावट और तापमान या लालिमा की प्रवृत्ति पर ध्यान दें।',
      options: {
        vata_dry: { label: 'रूखी, खुरदरी, पतली, फटने की प्रवृत्ति, छूने पर ठंडी', description: 'बार-बार मॉइस्चराइज़र की आवश्यकता होती है।' },
        pitta_warm: { label: 'गर्म, गोरी/गुलाबी, संवेदनशील, तिल या चकत्तों की प्रवृत्ति', description: 'जल्दी लाल होना, धूप के प्रति संवेदनशील।' },
        kapha_oily: { label: 'मोटी, तैलीय या नम, चिकनी, मुलायम, चमकदार और ठंडी', description: 'प्राकृतिक रूप से हाइड्रेटेड और लचीली।' },
      },
    },
    pq_hair: {
      questionText: 'आपके सिर के बाल प्राकृतिक रूप से कैसे हैं?',
      subtitle: 'बनावट, घनत्व और प्राकृतिक चमक।',
      options: {
        vata_dry_curly: { label: 'रूखे, पतले, दोमुंहे, खुरदरे या घुंघराले बाल', description: 'चमकहीन, आसानी से उलझने वाले बाल।' },
        pitta_fine_thinning: { label: 'मुलायम, पतले, जल्दी सफेद होना या बाल झड़ना', description: 'नाजुक बाल, गर्म खोपड़ी।' },
        kapha_thick_lustrous: { label: 'घने, मजबूत, लहरदार, चमकदार, तैलीय और मजबूत जड़ें', description: 'घना आयतन, मजबूत और भारी बाल।' },
      },
    },
    pq_appetite_digestion: {
      questionText: 'आपकी दैनिक भूख और पाचन अग्नि कैसी है?',
      subtitle: 'भूख लगने का समय और पाचन की गति।',
      options: {
        vata_irregular: { label: 'अनियमित भूख (विषम अग्नि); कभी तेज भूख, कभी भूख न लगना, गैस/अफारा', description: 'असंगत भोजन समय।' },
        pitta_strong: { label: 'तीव्र और तेज भूख (तीक्ष्ण अग्नि); भोजन में देरी होने पर चिड़चिड़ापन या एसिडिटी', description: 'मजबूत पाचन अग्नि, समय पर भोजन जरूरी।' },
        kapha_slow: { label: 'धीमी और स्थिर भूख (मंद अग्नि); बिना परेशानी के भोजन छोड़ सकना', description: 'धीमा पाचन, भारीपन का अहसास।' },
      },
    },
    pq_sleep: {
      questionText: 'आपकी सामान्य नींद का पैटर्न क्या है?',
      subtitle: 'नींद की गहराई, अवधि और जागने पर महसूस होना।',
      options: {
        vata_light: { label: 'हल्की नींद, बार-बार टूटना, सपने आना, उठने पर थकान (5-6 घंटे)', description: 'हल्की आवाज से भी तुरंत जाग जाना।' },
        pitta_moderate: { label: 'मध्यम (6-7 घंटे), आसानी से सोना, ताजगी से जागना', description: 'लक्ष्य-उन्मुख सपने, तुरंत सक्रिय होना।' },
        kapha_deep: { label: 'गहरी, भारी, निर्बाध नींद (8-9+ घंटे), सुबह उठने में कठिनाई', description: 'गहरी नींद, उठने के बाद कुछ देर सुस्ती।' },
      },
    },
    pq_temperature_tolerance: {
      questionText: 'कौन सा मौसम आपको सबसे अधिक असहज लगता है?',
      subtitle: 'गर्मी या सर्दी सहन करने की क्षमता।',
      options: {
        vata_hates_cold: { label: 'ठंडा मौसम और ठंडी हवा नापसंद; गर्मी, गर्म पेय और धूप पसंद', description: 'ठंडे हाथ-पैर।' },
        pitta_hates_heat: { label: 'गर्म और उमस भरा मौसम नापसंद; ठंडी हवा, छांव और ठंडा पानी पसंद', description: 'जल्दी पसीना आना।' },
        kapha_hates_damp: { label: 'नम और गीला ठंडा मौसम नापसंद; शुष्क मौसम सहन कर लेना', description: 'सर्दियों में कफ बनने की प्रवृत्ति।' },
      },
    },
    pq_energy_activity: {
      questionText: 'आपकी स्वाभाविक शारीरिक ऊर्जा और गति कैसी है?',
      subtitle: 'दैनिक सहनशक्ति, चलने और बोलने की गति।',
      options: {
        vata_bursts: { label: 'तेज ऊर्जा के झोंके, तेज चलना/बोलना, जल्दी थक जाना', description: 'जल्दी शुरुआत, अनियमित सहनशक्ति।' },
        pitta_purposeful: { label: 'उद्देश्यपूर्ण, अनुशासित, अच्छी सहनशक्ति बनाए रखना', description: 'लक्ष्य पर केंद्रित ऊर्जा।' },
        kapha_enduring: { label: 'शुरुआत में धीमी, लेकिन एक बार शुरू होने पर दीर्घकालिक सहनशक्ति', description: 'शांत, स्थिर ताकत।' },
      },
    },
    pq_mental_temperament: {
      questionText: 'तनाव या दबाव में आपकी प्राथमिक भावनात्मक प्रतिक्रिया क्या होती है?',
      subtitle: 'अचानक अनिश्चितता पर पहली प्रतिक्रिया।',
      options: {
        vata_anxiety: { label: 'चिंता, घबराहट, बहुत अधिक सोचना, बेचैनी', description: 'तेज दिमाग, तेजी से भूलना।' },
        pitta_irritation: { label: 'चिड़चिड़ापन, अधीरता, गुस्सा, पूर्णता की मांग', description: 'तेज बुद्धि, तार्किक निर्णय।' },
        kapha_calm: { label: 'शांत, स्थिर, धैर्यवान, विवादों से बचना', description: 'सहनशील, वफादार, बदलाव में धीमा।' },
      },
    },
    pq_lifestyle: {
      questionText: 'आपकी सामान्य जीवनशैली और आहार प्राथमिकता क्या है?',
      subtitle: 'दैनिक दिनचर्या और पसंदीदा स्वाद।',
      options: {
        vata_spontaneous: { label: 'अनियोजित दिनचर्या, गर्म, मीठा, नमकीन और तैलीय भोजन पसंद', description: 'यात्रा पसंद, अनियमित भोजन।' },
        pitta_organized: { label: 'व्यवस्थित और समयबद्ध, मीठा, कड़वा और ठंडा भोजन पसंद', description: 'कड़ा कार्यक्रम, ताजा भोजन पसंद।' },
        kapha_routine: { label: 'नियमित घरेलू दिनचर्या, तीखा, मसालेदार और हल्का भोजन पसंद', description: 'स्थिरता पसंद, मसालेदार स्वाद।' },
      },
    },
  },
};

export function getLocalizedPrakritiQuestion(
  question: PrakritiQuestion,
  language: SupportedLanguage
): PrakritiQuestion {
  const langTable = PRAKRITI_LOCALIZED_MAP[language];
  const qLocalized = langTable ? langTable[question.id] : undefined;

  const questionText = qLocalized?.questionText || question.questionText;
  const subtitle = qLocalized?.subtitle || question.subtitle || '';

  const options = question.options.map((opt) => {
    const optLoc = qLocalized?.options?.[opt.key];
    return {
      key: opt.key,
      label: optLoc?.label || opt.label,
      doshaWeight: opt.doshaWeight,
      description: optLoc?.description || opt.description,
    };
  });

  return {
    ...question,
    questionText,
    subtitle,
    options,
  };
}

/**
 * Calculates Vata, Pitta, Kapha constitutional proportions and generates
 * a practitioner-review decision support result.
 */
export function calculatePrakriti(
  answers: PrakritiAnswerRecord[],
  lifestyleInfo?: {
    dietPreference?: string;
    dailyRoutine?: string;
    physicalActivity?: string;
    stressLevel?: string;
  }
): PrakritiAssessment {
  let vataPoints = 0;
  let pittaPoints = 0;
  let kaphaPoints = 0;

  answers.forEach((ans) => {
    vataPoints += ans.doshaWeight.vata;
    pittaPoints += ans.doshaWeight.pitta;
    kaphaPoints += ans.doshaWeight.kapha;
  });

  const totalPoints = vataPoints + pittaPoints + kaphaPoints || 1;
  const vataScore = Math.round((vataPoints / totalPoints) * 100);
  const pittaScore = Math.round((pittaPoints / totalPoints) * 100);
  const kaphaScore = 100 - (vataScore + pittaScore); // Ensures exactly 100%

  // Determine dominant constitution
  const scores = [
    { dosha: 'Vata', score: vataScore },
    { dosha: 'Pitta', score: pittaScore },
    { dosha: 'Kapha', score: kaphaScore },
  ].sort((a, b) => b.score - a.score);

  let dominantPrakriti = scores[0].dosha;
  const diff = scores[0].score - scores[1].score;

  if (diff <= 10) {
    dominantPrakriti = `${scores[0].dosha}-${scores[1].dosha}`;
  } else if (scores[0].score >= 50) {
    dominantPrakriti = `${scores[0].dosha} Dominant`;
  }

  // Characteristics list
  const characteristics: string[] = [];
  if (vataScore >= 30) {
    characteristics.push('Vata: Quick comprehension, variable Agni, preference for warmth, creative adaptability.');
  }
  if (pittaScore >= 30) {
    characteristics.push('Pitta: Sharp intellect, strong metabolic fire (Tikshna Agni), decisive, warmth-sensitive.');
  }
  if (kaphaScore >= 30) {
    characteristics.push('Kapha: Solid structural stability, enduring stamina, calm temperament, deep restful sleep.');
  }

  const completenessScore = Math.min(100, Math.round((answers.length / PRAKRITI_QUESTION_BANK.length) * 100));

  const summary = `Preliminary constitutional profile indicates ${dominantPrakriti} pattern (${vataScore}% Vata, ${pittaScore}% Pitta, ${kaphaScore}% Kapha) based on ${answers.length} structured biological and behavioral observations. Awaiting clinical validation by AYUSH practitioner.`;

  return {
    vataScore,
    pittaScore,
    kaphaScore,
    dominantPrakriti,
    characteristics,
    responses: answers,
    completenessScore,
    summary,
    lifestyleInfo,
    practitionerReview: {
      status: 'pending_review',
      practitionerNotes: '',
      verifiedPrakriti: dominantPrakriti,
    },
  };
}
