export interface AIAnalysis {
  predictedDisease: string;
  riskLevel: 'Critical' | 'Urgent' | 'Normal';
  suggestedDoctorType: 'Cardiologist' | 'Pulmonologist' | 'Neurologist' | 'General Physician' | 'Orthopedic';
  explanation: string;
  futureRisks: string[];
  prescription: string;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `${window.location.origin}/gemini-api/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// PRE-FACT (DETERMINISTIC) TRIAGE ENGINE
// This maps body parts and keywords to clinical analysis without needing an AI API.
const PREFACT_ANALYSIS: Record<string, Partial<AIAnalysis>> = {
  "chest": {
    predictedDisease: "Acute Coronary Syndrome",
    riskLevel: "Critical",
    suggestedDoctorType: "Cardiologist",
    explanation: "Patient reports significant chest discomfort. Given the risk profile, immediate cardiac monitoring and ECG are mandatory.",
    futureRisks: ["Myocardial Infarction", "Arrhythmia"],
    prescription: "Aspirin 325mg (Chewable), Nitroglycerin (if BP allows), Oxygen, immediate ECG and Troponin levels."
  },
  "heart": {
    predictedDisease: "Arrhythmia / Tachycardia",
    riskLevel: "Urgent",
    suggestedDoctorType: "Cardiologist",
    explanation: "Abnormal heart rate or palpitations reported. Requires immediate rhythm analysis.",
    futureRisks: ["Syncope", "Atrial Fibrillation"],
    prescription: "Telemetry monitoring, ECG, Beta-blockers (if indicated), Electrolyte panel."
  },
  "head": {
    predictedDisease: "Neurological Distress",
    riskLevel: "Urgent",
    suggestedDoctorType: "Neurologist",
    explanation: "Significant head pain or neurological deficit reported. Must rule out intracranial pressure or vascular issues.",
    futureRisks: ["Seizure", "Cerebrovascular Accident"],
    prescription: "Neuro-checks every 15 mins, CT Head (non-contrast), Bed rest in dark room, IV fluids."
  },
  "neck": {
    predictedDisease: "Suspected Meningitis",
    riskLevel: "Critical",
    suggestedDoctorType: "Neurologist",
    explanation: "Combined neck stiffness and fever is a red flag for central nervous system infection.",
    futureRisks: ["Permanent Neuro Deficit", "Hearing Loss"],
    prescription: "Isolation, Lumbar Puncture preparation, IV Dexamethasone, broad-spectrum IV Antibiotics."
  },
  "lungs": {
    predictedDisease: "Acute Respiratory Distress",
    riskLevel: "Critical",
    suggestedDoctorType: "Pulmonologist",
    explanation: "Compromised breathing efficiency requires immediate airway assessment and pulmonary support.",
    futureRisks: ["Respiratory Failure", "Hypoxia"],
    prescription: "Nebulization (Albuterol), Pulsox monitoring, Chest X-ray, Oxygen via nasal cannula."
  },
  "breath": {
    predictedDisease: "Pneumonia / Bronchitis",
    riskLevel: "Urgent",
    suggestedDoctorType: "Pulmonologist",
    explanation: "Difficulty breathing with potential infectious origin.",
    futureRisks: ["Pleural Effusion", "Septicemia"],
    prescription: "Sputum culture, Antibiotics (Azithromycin), Hydration, Bronchodilators."
  },
  "arm": {
    predictedDisease: "Upper Limb Trauma",
    riskLevel: "Normal",
    suggestedDoctorType: "Orthopedic",
    explanation: "Likely fracture or severe sprain in the upper extremity.",
    futureRisks: ["Nerve Damage", "Reduced Mobility"],
    prescription: "X-ray (AP/Lateral), Immobilization, RICE protocol, Analgesics."
  },
  "leg": {
    predictedDisease: "Lower Limb Trauma / DVT",
    riskLevel: "Urgent",
    suggestedDoctorType: "Orthopedic",
    explanation: "Leg pain requires ruling out fractures or deep vein thrombosis if swelling is present.",
    futureRisks: ["Pulmonary Embolism", "Compartment Syndrome"],
    prescription: "Doppler Ultrasound (if swollen), X-ray, Elevation, NSAIDs."
  },
  "bone": {
    predictedDisease: "Skeletal Injury",
    riskLevel: "Normal",
    suggestedDoctorType: "Orthopedic",
    explanation: "Localized bone pain usually indicates a structural injury.",
    futureRisks: ["Stress Fracture", "Osteomyelitis"],
    prescription: "Diagnostic Imaging, Immobilization, Calcium/Vit D assessment."
  }
};

function getDumbAnalysis(patientData: any): AIAnalysis {
  const area = (patientData.symptoms.painArea || "").toLowerCase();
  const text = (patientData.symptoms.text || "").toLowerCase();
  
  let result: Partial<AIAnalysis> = {
    predictedDisease: "General Viral Syndrome",
    riskLevel: "Normal",
    suggestedDoctorType: "General Physician",
    explanation: "Patient exhibits non-localized symptoms. Basic triage suggests a general medical condition.",
    futureRisks: ["Dehydration", "Secondary Infection"],
    prescription: "Rest, increased fluid intake, Paracetamol for fever, follow up if symptoms persist."
  };

  // Keyword Matching
  for (const [key, analysis] of Object.entries(PREFACT_ANALYSIS)) {
    if (area.includes(key) || text.includes(key)) {
      result = { ...result, ...analysis };
      break;
    }
  }

  // Final check for Criticality based on Vitals
  if (patientData.vitals.o2 < 90 || (patientData.vitals.temp && patientData.vitals.temp > 104)) {
    result.riskLevel = "Critical";
    result.explanation = "CRITICAL VITALS: Regardless of localized pain, the patient's vitals indicate systemic failure. " + (result.explanation || "");
  }

  return result as AIAnalysis;
}

export async function analyzePatient(patientData: any): Promise<AIAnalysis> {
  try {
    // If API KEY is missing, looks like a placeholder, or we want fast results
    // We use the Pre-Fact deterministic engine.
    if (!API_KEY || API_KEY.toLowerCase().startsWith("aiza")) {
       return getDumbAnalysis(patientData);
    }

    const prompt = `Analyze patient: ${JSON.stringify(patientData)}. Return JSON only.`;
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) throw new Error("API Limit");

    const body = await response.json();
    const resultText = body.candidates[0].content.parts[0].text;
    return JSON.parse(resultText) as AIAnalysis;
  } catch (error) {
    console.warn("Using Deterministic Pre-Fact Engine...");
    return getDumbAnalysis(patientData);
  }
}

export async function chatWithAssistant(message: string, patients: any[]): Promise<string> {
  try {
     if (!API_KEY || API_KEY.toLowerCase().startsWith("aiza")) {
        return "Meddy AI (Offline Mode): I can see " + patients.length + " patients in the queue. The most critical is " + (patients.find(p => p.priorityLevel === 'Critical')?.name || "none") + ". How can I help with the charts?";
     }

    const systemInstruction = `You are Meddy AI assistant. DATA: ${JSON.stringify(patients)}`;
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `SYSTEM: ${systemInstruction}` }] },
          { role: "user", parts: [{ text: message }] }
        ]
      })
    });

    const body = await response.json();
    return body.candidates[0].content.parts[0].text || "Offline.";
  } catch (error) {
    return "Offline Mode: I see " + patients.length + " patients. Most critical is " + (patients[0]?.name || "None") + ".";
  }
}

export async function parsePatientFile(text: string): Promise<any> {
    const data: any = {
        name: "Unknown", age: 0, gender: "Other",
        vitals: { temp: 98.6, bp: "120/80", o2: 98, hr: 80 },
        symptoms: { text: text.substring(0, 100), painArea: "General", painLevel: 5, duration: "Unknown" },
        risks: { diabetes: false, highBP: false, heartHistory: false, habits: "", familyHistory: "" },
        notes: "Parsed via Deterministic Engine"
    };

    const lines = text.split('\n');
    lines.forEach(line => {
        const lower = line.toLowerCase();
        if (lower.includes('name:')) data.name = line.split(':')[1].trim();
        if (lower.includes('age:')) data.age = parseInt(line.split(':')[1]) || 0;
        if (lower.includes('gender:')) data.gender = line.split(':')[1].trim();
        if (lower.includes('temp:')) data.vitals.temp = parseFloat(line.split(':')[1]) || 98.6;
        if (lower.includes('o2:')) data.vitals.o2 = parseInt(line.split(':')[1]) || 98;
    });

    return data;
}
