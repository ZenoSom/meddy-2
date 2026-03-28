import React, { useState } from 'react';
import { Upload, Send, Activity, Thermometer, Droplets, Heart, AlertCircle, User } from 'lucide-react';
import { calculateSeverity, cn } from '../lib/utils';
import { analyzePatient, AIAnalysis } from '../lib/openai';
import { parsePatientFileManually } from '../lib/parser';
import { Patient } from '../types';

interface PatientFormProps {
  onPatientAdded: (patient: Patient) => void;
  onAnalysisComplete: (analysis: AIAnalysis, name: string, vitals: any) => void;
}

export default function PatientForm({ onPatientAdded, onAnalysisComplete }: PatientFormProps) {
  const [loading, setLoading] = useState(false);
  const [parsingFile, setParsingFile] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    vitals: { temp: '', bp: '', o2: '', hr: '' },
    symptoms: { text: '', painArea: '', painLevel: 5, duration: '' },
    risks: { diabetes: false, highBP: false, heartHistory: false, habits: '', familyHistory: '' },
    notes: ''
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingFile(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const extractedData = parsePatientFileManually(text);

      if (extractedData && extractedData.name) {
        const newData = {
          ...formData,
          name: extractedData.name || formData.name,
          age: extractedData.age || formData.age,
          vitals: {
            temp: extractedData.vitals.temp || formData.vitals.temp,
            bp: extractedData.vitals.bp || formData.vitals.bp,
            o2: extractedData.vitals.o2 || formData.vitals.o2,
            hr: extractedData.vitals.hr || formData.vitals.hr,
          },
          symptoms: {
            ...formData.symptoms,
            text: extractedData.symptoms.text || formData.symptoms.text,
          }
        };

        setFormData(newData);
        setParsingFile(false);

        // Auto-submit after parsing (Manual process)
        await processData(newData);
      } else {
        alert("Could not parse file. Ensure format matches 'Name: Value'");
        setParsingFile(false);
      }
    };

    reader.readAsText(file);
  };

  const processData = async (data: typeof formData) => {
    setLoading(true);
    try {
      const { score, level } = calculateSeverity(data);
      const aiResult = await analyzePatient(data);

      const newPatient: Patient = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name,
        age: parseInt(data.age) || 0,
        gender: data.gender,
        vitals: {
          temp: parseFloat(data.vitals.temp) || 0,
          bp: data.vitals.bp,
          o2: parseInt(data.vitals.o2) || 0,
          hr: data.vitals.hr ? parseInt(data.vitals.hr) : undefined
        },
        symptoms: data.symptoms,
        risks: data.risks,
        notes: data.notes,
        priorityScore: score,
        priorityLevel: level,
        aiAnalysis: {
          predictedDisease: aiResult.predictedDisease,
          explanation: aiResult.explanation,
          futureRisks: aiResult.futureRisks,
          suggestedDoctorType: aiResult.suggestedDoctorType
        },
        createdAt: new Date().toISOString()
      };

      onPatientAdded(newPatient);
      onAnalysisComplete(aiResult, data.name, data.vitals);

      // Reset form
      setFormData({
        name: '',
        age: '',
        gender: 'Male',
        vitals: { temp: '', bp: '', o2: '', hr: '' },
        symptoms: { text: '', painArea: '', painLevel: 5, duration: '' },
        risks: { diabetes: false, highBP: false, heartHistory: false, habits: '', familyHistory: '' },
        notes: ''
      });
    } catch (error) {
      console.error("Error adding patient:", error);
      alert("Failed to add patient. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await processData(formData);
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg mb-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
            <Activity className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Patient Intake Portal</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Real-time AI Triage & Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Basic Info</span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Vitals</span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Symptoms</span>
        </div>
      </div>

      {/* Quick Upload Indicator */}
      <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Upload className="w-5 h-5 text-blue-600 animate-bounce" />
          <div>
            <p className="text-xs font-black text-blue-900 uppercase tracking-widest">pre ealth DATA</p>
            <p className="text-[10px] text-blue-600 font-medium">Standard format recognized (Name, Age, Vitals: Temp, Oxygen, HR, BP, Symptoms).</p>
          </div>
        </div>
        <label className={cn(
          "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest cursor-pointer transition-all shadow-lg shadow-blue-100",
          parsingFile && "opacity-50 cursor-wait animate-pulse"
        )}>
          {parsingFile ? 'Processing...' : 'Upload Now'}
          <input
            type="file"
            className="hidden"
            accept=".txt,.md,.pdf"
            onChange={handleFileChange}
            disabled={parsingFile}
          />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Basic Info & Vitals */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User className="w-3 h-3" /> Identity
            </h3>
            <div className="space-y-3">
              <input
                required
                placeholder="Patient Full Name"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  type="number"
                  placeholder="Age"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                />
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3 h-3" /> Vital Signs
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <input
                  placeholder="Temp (°C)"
                  className="bg-transparent outline-none text-sm w-full font-medium"
                  value={formData.vitals.temp}
                  onChange={e => setFormData({ ...formData, vitals: { ...formData.vitals, temp: e.target.value } })}
                />
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <Droplets className="w-4 h-4 text-blue-500" />
                <input
                  placeholder="BP (120/80)"
                  className="bg-transparent outline-none text-sm w-full font-medium"
                  value={formData.vitals.bp}
                  onChange={e => setFormData({ ...formData, vitals: { ...formData.vitals, bp: e.target.value } })}
                />
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <Activity className="w-4 h-4 text-green-500" />
                <input
                  placeholder="O2 Level (%)"
                  className="bg-transparent outline-none text-sm w-full font-medium"
                  value={formData.vitals.o2}
                  onChange={e => setFormData({ ...formData, vitals: { ...formData.vitals, o2: e.target.value } })}
                />
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <Heart className="w-4 h-4 text-red-500" />
                <input
                  placeholder="Heart Rate"
                  className="bg-transparent outline-none text-sm w-full font-medium"
                  value={formData.vitals.hr}
                  onChange={e => setFormData({ ...formData, vitals: { ...formData.vitals, hr: e.target.value } })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Symptoms & Pain */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-3 h-3" /> Clinical Presentation
            </h3>
            <div className="space-y-4">
              <textarea
                placeholder="Detailed description of symptoms..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl h-[108px] text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                value={formData.symptoms.text}
                onChange={e => setFormData({ ...formData, symptoms: { ...formData.symptoms, text: e.target.value } })}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Primary Pain Area"
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none"
                  value={formData.symptoms.painArea}
                  onChange={e => setFormData({ ...formData, symptoms: { ...formData.symptoms, painArea: e.target.value } })}
                />
                <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pain Intensity</span>
                    <span className="text-xs font-black text-blue-600">{formData.symptoms.painLevel}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    value={formData.symptoms.painLevel}
                    onChange={e => setFormData({ ...formData, symptoms: { ...formData.symptoms, painLevel: parseInt(e.target.value) } })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Risk Factors</h3>
              <div className="flex flex-wrap gap-3">
                {['diabetes', 'highBP', 'heartHistory'].map((risk) => (
                  <label key={risk} className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-all">
                    <input
                      type="checkbox"
                      className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={(formData.risks as any)[risk]}
                      onChange={e => setFormData({ ...formData, risks: { ...formData.risks, [risk]: e.target.checked } })}
                    />
                    {risk === 'highBP' ? 'High BP' : risk === 'heartHistory' ? 'Heart History' : 'Diabetes'}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-4">
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Additional Notes</h3>
          <textarea
            placeholder="Any other observations..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl h-[108px] text-sm font-medium outline-none resize-none"
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
          />
          <button
            disabled={loading}
            className="w-full flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-100 group"
          >
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-[10px]">AI Analyzing...</span>
              </div>
            ) : (
              <>
                <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <span className="text-xs">Process Intake</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
