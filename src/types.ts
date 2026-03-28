export type PriorityLevel = 'Critical' | 'Urgent' | 'Normal';
export type Specialist = 'Cardiologist' | 'Pulmonologist' | 'Neurologist' | 'General Physician' | 'Orthopedic';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  vitals: {
    temp: number;
    bp: string;
    o2: number;
    hr?: number;
  };
  symptoms: {
    text: string;
    painArea: string;
    painLevel: number;
    duration: string;
  };
  risks: {
    diabetes: boolean;
    highBP: boolean;
    heartHistory: boolean;
    habits: string;
    familyHistory: string;
  };
  notes: string;
  prescriptionUrl?: string;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  aiAnalysis: {
    predictedDisease: string;
    explanation: string;
    futureRisks: string[];
    suggestedDoctorType: Specialist;
  };
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialist: Specialist;
  schedule: {
    day: string;
    date: string;
    slots: string[]; // e.g., ["09:00", "10:00", ...]
  };
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  slot: {
    day: string;
    date: string;
    time: string;
  };
  rankInQueue: number;
  createdAt: string;
}
