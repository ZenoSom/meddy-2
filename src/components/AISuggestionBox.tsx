import React from 'react';
import { Sparkles, AlertTriangle, ShieldCheck, Stethoscope, ArrowRight, Printer, Clock, Calendar, User, Heart, FileText, Pill } from 'lucide-react';
import { AIAnalysis } from '../lib/openai';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AISuggestionBoxProps {
  analysis: AIAnalysis | null;
  patientName: string;
  doctorName: string;
  slotInfo: string;
  vitals: any;
}

export default function AISuggestionBox({ analysis, patientName, doctorName, slotInfo, vitals }: AISuggestionBoxProps) {
  if (!analysis) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white border-2 border-blue-100 rounded-2xl shadow-xl overflow-hidden mb-6 group/box"
      >
        {/* Screen View Header */}
        <div className="bg-blue-600 px-6 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold tracking-tight">AI Diagnostic Insight: {patientName}</h3>
          </div>
          <div className="flex items-center gap-3">
             <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30",
              analysis.riskLevel === 'Critical' ? "bg-red-500 text-white" :
              analysis.riskLevel === 'Urgent' ? "bg-orange-500 text-white" :
              "bg-emerald-500 text-white"
            )}>
              {analysis.riskLevel} Priority
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10 hidden sm:block">
              Prescription Analyzer Active
            </div>
          </div>
        </div>

        {/* Screen View Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">
          {/* Predicted Disease */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Predicted Condition</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 h-[140px] overflow-y-auto custom-scrollbar">
              <p className="text-lg font-bold text-slate-800 leading-tight">{analysis.predictedDisease}</p>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{analysis.explanation}</p>
            </div>
          </div>

          {/* Suggested Action */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Stethoscope className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Referral & Queue</span>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3 h-[140px]">
              <div>
                <p className="text-md font-bold text-blue-900 leading-tight">{analysis.suggestedDoctorType}</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-3 h-3 text-blue-400" />
                  <p className="text-xs font-bold text-blue-700 truncate">{doctorName || "Assigning..."}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-blue-100/50">
                <Clock className="w-3 h-3 text-blue-500" />
                <p className="text-[10px] font-bold text-blue-800 uppercase tracking-tight">{slotInfo || "TBD"}</p>
              </div>
            </div>
          </div>

          {/* Prescription Box Analyzer (NEW FEATURE) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Pill className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Prescription Box Analyzer</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 h-[140px] overflow-y-auto custom-scrollbar">
              <p className="text-[11px] text-emerald-900 font-medium leading-relaxed whitespace-pre-wrap">
                {analysis.prescription}
              </p>
            </div>
          </div>

          {/* Future Risks */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Future Risks</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 h-[140px] overflow-y-auto custom-scrollbar">
              <ul className="space-y-2">
                {analysis.futureRisks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Screen View Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between print:hidden">
          <p className="text-[10px] text-slate-400 italic">
            * This is an AI-generated clinical plan. Please verify with a licensed doctor.
          </p>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Printer className="w-3 h-3" />
            Print Analysis & Rx
          </button>
        </div>

        {/* PRINT ONLY SECTION - Styled as an Official Certificate */}
        <div className="hidden print:block p-12 bg-white min-h-[1000px] font-serif border-[12px] border-double border-slate-200 m-4">
          <div className="text-center mb-10 border-b-2 border-slate-800 pb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <Heart className="text-white w-8 h-8" />
              </div>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Meddy AI • Clinical Referral</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Official Medical Triage & Prescription Analyzer Report</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Patient Identity</h4>
              <p className="text-2xl font-bold text-slate-900">{patientName}</p>
              <div className="flex gap-4 text-sm text-slate-600">
                <span className="font-bold">ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                <span>Date: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <div className="space-y-4 border-l border-slate-100 pl-8">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Appointment Details</h4>
              <div className="space-y-1">
                <p className="text-lg font-bold text-blue-900">{doctorName}</p>
                <p className="text-sm font-semibold text-slate-500">{analysis.suggestedDoctorType} Specialist</p>
                <p className="text-xs font-black text-emerald-600 uppercase tracking-wider mt-2 bg-emerald-50 inline-block px-2 py-1 rounded">{slotInfo}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold uppercase tracking-tight">AI Diagnostic & Prescription Analysis</h3>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Predicted Condition</span>
                <p className="text-2xl font-black text-slate-800 mt-1">{analysis.predictedDisease}</p>
                <p className="text-sm text-slate-600 leading-relaxed mt-3">{analysis.explanation}</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Suggested Prescription & Immediate Action</span>
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {analysis.prescription}
                </p>
              </div>
              
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                {Object.entries(vitals || {}).map(([key, val]) => (
                  <div key={key}>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{key}</span>
                    <p className="text-sm font-bold text-slate-900">{val as string}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Triage Priority</h4>
                <div className={cn(
                  "px-4 py-2 rounded-lg text-sm font-black uppercase tracking-widest text-center border",
                  analysis.riskLevel === 'Critical' ? "bg-red-50 text-red-600 border-red-200" :
                  analysis.riskLevel === 'Urgent' ? "bg-orange-50 text-orange-600 border-orange-200" :
                  "bg-emerald-50 text-emerald-600 border-emerald-200"
                )}>
                  {analysis.riskLevel} Case
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Next Steps</h4>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  Patient has been successfully added to the global queue and assigned to the relevant specialist. Please present this document at the reception desk for further processing.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-20 flex justify-between items-end border-t border-slate-200 pt-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Electronic Signature</p>
              <p className="text-xl font-serif italic text-blue-900">Meddy AI Diagnostic Engine v3.1</p>
              <div className="h-0.5 w-32 bg-slate-200" />
            </div>
            <div className="text-right text-[8px] text-slate-400 space-y-1 font-bold">
              <p>VERIFIED SECURE BY MEDDY CLOUD</p>
              <p>SYSTEM ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
          </div>

          <div className="mt-8 text-center bg-slate-50 p-4 rounded-xl">
             <p className="text-[8px] text-slate-400 italic leading-relaxed">
              DISCLAIMER: This analysis report is generated by an artificial intelligence model and is intended for triage support only. 
              It does not constitute a legal medical diagnosis or prescription. All findings must be clinically verified by a licensed medical professional 
              before any treatment or intervention is administered.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
