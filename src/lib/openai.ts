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

export async function analyzePatient(patientData: any): Promise<AIAnalysis> {
  const prompt = `
    Analyze the following patient data for hospital triage:
    Name: ${patientData.name}
    Age: ${patientData.age}
    Gender: ${patientData.gender}
    Vitals: Temp ${patientData.vitals.temp}°F, BP ${patientData.vitals.bp}, O2 ${patientData.vitals.o2}%, HR ${patientData.vitals.hr || 'N/A'}
    Symptoms: ${patientData.symptoms.text}
    Pain Area: ${patientData.symptoms.painArea}, Level: ${patientData.symptoms.painLevel}/10
    Duration: ${patientData.symptoms.duration}
    Risk Factors: Diabetes: ${patientData.risks.diabetes}, High BP: ${patientData.risks.highBP}, Heart History: ${patientData.risks.heartHistory}, Habits: ${patientData.risks.habits}, Family History: ${patientData.risks.familyHistory}
    Additional Notes: ${patientData.notes}

    Provide a JSON response with:
    - predictedDisease: A likely diagnosis.
    - riskLevel: One of 'Critical', 'Urgent', 'Normal'.
    - suggestedDoctorType: One of 'Cardiologist', 'Pulmonologist', 'Neurologist', 'General Physician', 'Orthopedic'.
    - explanation: A brief explanation of the condition.
    - futureRisks: A list of potential future health risks.
    - prescription: A detailed clinical plan, recommended initial medications (to be verified), and immediate care steps.
    
    RESPONSE FORMAT: Return ONLY a valid JSON object.
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const body = await response.json();
    const resultText = body.candidates[0].content.parts[0].text;
    return JSON.parse(resultText) as AIAnalysis;
  } catch (error) {
    console.error("Gemini Analysis failed:", error);
    return {
      predictedDisease: "Pending Evaluation",
      riskLevel: "Normal",
      suggestedDoctorType: "General Physician",
      explanation: "AI analysis was unavailable. Please consult a doctor immediately.",
      futureRisks: ["Unknown"],
      prescription: "Standard triage observation required. No automatic prescription generated."
    };
  }
}

export async function chatWithAssistant(message: string, patients: any[]): Promise<string> {
  const systemInstruction = `
    You are Meddy AI, a specialized hospital staff assistant. 
    Your role is to help medical staff with triage, patient status, and general hospital management.
    
    Current Patient Data:
    ${JSON.stringify(patients.map(p => ({
      name: p.name,
      age: p.age,
      priority: p.priorityLevel,
      score: p.priorityScore,
      disease: p.aiAnalysis.predictedDisease,
      specialist: p.aiAnalysis.suggestedDoctorType
    })))}
    
    Guidelines:
    - Be professional, concise, and helpful.
    - If asked about a patient, use the provided data.
    - If asked for triage advice, prioritize vitals and severity.
    - If asked something unrelated to medical/hospital work, politely redirect.
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `SYSTEM_INSTRUCTION: ${systemInstruction}` }] },
          { role: "user", parts: [{ text: message }] }
        ]
      })
    });

    const body = await response.json();
    return body.candidates[0].content.parts[0].text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini Chat failed:", error);
    return "The Gemini connection is having trouble right now. Please verify your API key.";
  }
}

export async function parsePatientFile(text: string): Promise<any> {
    const prompt = `
    Extract patient information from the following text and return it as a structured JSON object. 
    Text content: "${text}"

    Required JSON Structure:
    {
      "name": "Full Name",
      "age": "Number",
      "gender": "Male" | "Female" | "Other",
      "vitals": {
        "temp": "Number (e.g. 98.6)",
        "bp": "String (e.g. 120/80)",
        "o2": "Number",
        "hr": "Number"
      },
      "symptoms": {
        "text": "Detailed description",
        "painArea": "Location",
        "painLevel": "Number 1-10",
        "duration": "String"
      },
      "risks": {
        "diabetes": boolean,
        "highBP": boolean,
        "heartHistory": boolean,
        "habits": "string",
        "familyHistory": "string"
      },
      "notes": "Any other details"
    }

    AI Guidelines:
    - If a specific field is missing, use null (or false for booleans).
    - Ensure Age, Temp, O2, HR are returned as numbers.
    - If 'Oxygen' or 'SpO2' is mentioned, extract it into 'o2'.
    - If 'Temperature' is mentioned, extract it into 'temp'.
    RESPONSE FORMAT: Return ONLY a valid JSON object.
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const body = await response.json();
    const resultText = body.candidates[0].content.parts[0].text;
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Gemini Extraction failed:", error);
    return null;
  }
}
