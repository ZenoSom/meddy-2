import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // This is needed for Client-side Vite environment
});

export interface AIAnalysis {
  predictedDisease: string;
  riskLevel: 'Critical' | 'Urgent' | 'Normal';
  suggestedDoctorType: 'Cardiologist' | 'Pulmonologist' | 'Neurologist' | 'General Physician' | 'Orthopedic';
  explanation: string;
  futureRisks: string[];
  prescription: string;
}

export async function analyzePatient(patientData: any): Promise<AIAnalysis> {
  const prompt = `
    Analyze the following patient data for hospital triage:
    Name: ${patientData.name}
    Age: ${patientData.age}
    Gender: ${patientData.gender}
    Vitals: Temp ${patientData.vitals.temp}°C, BP ${patientData.vitals.bp}, O2 ${patientData.vitals.o2}%, HR ${patientData.vitals.hr || 'N/A'}
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
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as AIAnalysis;
  } catch (error) {
    console.error("OpenAI Analysis failed:", error);
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: message }
      ]
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("OpenAI Chat failed:", error);
    return "The GPT connection is having trouble right now. Please verify your API key.";
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
        "temp": "Number (e.g. 37.5)",
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
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error("OpenAI Extraction failed:", error);
    return null;
  }
}
