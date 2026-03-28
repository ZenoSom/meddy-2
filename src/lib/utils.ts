import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateSeverity(patientData: any): { score: number; level: 'Critical' | 'Urgent' | 'Normal' } {
  let score = 0;

  // Rule-based scoring
  if (patientData.vitals.o2 < 90) score += 50;
  if (patientData.symptoms.text.toLowerCase().includes('chest pain')) score += 40;
  if (patientData.vitals.temp > 38.5) score += 20;
  if (patientData.symptoms.text.toLowerCase().includes('breathing') || patientData.symptoms.text.toLowerCase().includes('shortness of breath')) score += 20;
  if (patientData.risks.highBP) score += 10;

  let level: 'Critical' | 'Urgent' | 'Normal' = 'Normal';
  if (score >= 80) level = 'Critical';
  else if (score >= 50) level = 'Urgent';

  return { score, level };
}

export const SPECIALIST_MAP: Record<string, string> = {
  'Heart': 'Cardiologist',
  'Lung': 'Pulmonologist',
  'Brain': 'Neurologist',
  'Bone': 'Orthopedic',
  'General': 'General Physician'
};
