export interface ParsedPatientData {
  name: string;
  age: string;
  vitals: {
    temp: string;
    bp: string;
    o2: string;
    hr: string;
  };
  symptoms: {
    text: string;
  };
}

export function parsePatientFileManually(text: string): ParsedPatientData {
  const result: ParsedPatientData = {
    name: '',
    age: '',
    vitals: { temp: '', bp: '', o2: '', hr: '' },
    symptoms: { text: '' }
  };

  // Helper to extract value after a label
  const extract = (label: string, fallback: string = ''): string => {
    const regex = new RegExp(`${label}:\\s*(.+)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : fallback;
  };

  // Name extraction
  result.name = extract('Name');

  // Age extraction
  result.age = extract('Age').replace(/\D/g, ''); // Extract only numbers

  // Vitals extraction (handling different formats)
  result.vitals.temp = extract('Temperature').replace(/[^\d.]/g, ''); // e.g. "98.6°F" -> "98.6"
  result.vitals.o2 = extract('Oxygen Level \\(SpO2\\)').replace(/\D/g, '') || extract('Oxygen').replace(/\D/g, '') || extract('SpO2').replace(/\D/g, '');
  result.vitals.hr = extract('Heart Rate').replace(/\D/g, '') || extract('Pulse').replace(/\D/g, '');
  result.vitals.bp = extract('Blood Pressure');

  // Symptoms extraction
  // Note: Symptoms might be multi-line, but this basic extract handles the first line. 
  // Let's improve it to handle the text block after "Symptoms:" until the end or next section.
  const symptomsRegex = /Symptoms:\s*([\s\S]+?)(?=\n\w+:|$)/i;
  const symptomsMatch = text.match(symptomsRegex);
  if (symptomsMatch) {
    result.symptoms.text = symptomsMatch[1].trim();
  }

  return result;
}
