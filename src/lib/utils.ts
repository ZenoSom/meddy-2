import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateSeverity(patientData: any, history: any[]): { score: number; level: 'Critical' | 'Urgent' | 'Normal', trend: 'up' | 'down' | 'stable' } {
  let score = 0;
  
  // Calculate Trend based on latest two readings
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (history.length >= 2) {
    const latest = history[history.length - 1];
    const prev = history[history.length - 2];
    
    // We compare Systolic BP as an example for trend, or just overall urgency.
    // The requirement says: Compare last two readings. 
    // Usually, we'll check BP for the trend requirement: "BP > 140 AND increasing -> CRITICAL"
    const getSys = (bp: string) => parseInt(bp.split('/')[0]) || 0;
    const sysLatest = getSys(latest.bp);
    const sysPrev = getSys(prev.bp);
    
    if (sysLatest > sysPrev) trend = 'up';
    else if (sysLatest < sysPrev) trend = 'down';
    else trend = 'stable';
  }

  const latestIndex = history.length - 1;
  const currentVitals = history[latestIndex] || patientData.vitals;

  // New Priority Logic
  let level: 'Critical' | 'Urgent' | 'Normal' = 'Normal';
  
  const sysBP = parseInt((currentVitals.bp || "0").split('/')[0]) || 0;
  
  if (currentVitals.o2 < 90) {
    level = 'Critical';
    score += 80;
  } else if (sysBP > 140 && trend === 'up') {
    level = 'Critical';
    score += 80;
  } else if (trend === 'stable' && currentVitals.o2 >= 90 && sysBP <= 140) {
    level = 'Normal';
    score += 10;
  } else {
    // Fallback based on old rules for Urgency
    if (patientData.symptoms?.text?.toLowerCase().includes('chest pain')) score += 40;
    if (currentVitals.temp > 101.3) score += 20;
    
    if (score >= 50) level = 'Urgent';
    else level = 'Normal';
  }

  return { score, level, trend };
}

export const SPECIALIST_MAP: Record<string, string> = {
  'Heart': 'Cardiologist',
  'Lung': 'Pulmonologist',
  'Brain': 'Neurologist',
  'Bone': 'Orthopedic',
  'General': 'General Physician'
};
