import React from 'react';
import { X, Heart, Thermometer, Droplets, Activity, ArrowUpRight, ArrowDownRight, Minus, Sparkles, Stethoscope, ShieldCheck, AlertTriangle, Clock, Pill } from 'lucide-react';
import { Patient } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface PatientDetailModalProps {
  patient: Patient | null;
  doctorName: string;
  slotInfo: string;
  onClose: () => void;
}

export default function PatientDetailModal({ patient, doctorName, slotInfo, onClose }: PatientDetailModalProps) {
  if (!patient) return null;

  const latestVitals = patient.history[patient.history.length - 1];

  return (
    <AnimatePresence>
      {patient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={cn(
              "px-6 py-4 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl",
              patient.priorityLevel === 'Critical' ? "bg-red-600" :
              patient.priorityLevel === 'Urgent' ? "bg-orange-500" :
              "bg-blue-600"
            )}>
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black text-lg backdrop-blur-sm">
                  {patient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-lg tracking-tight">{patient.name}</h2>
                  <p className="text-white/80 text-xs font-medium">{patient.age}y • {patient.gender} • {patient.priorityLevel} Priority</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">

              {/* Latest Vitals */}
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Latest Vitals</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-center">
                    <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                    <p className="text-lg font-black text-slate-800">{latestVitals?.bp || '—'}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Blood Pressure</p>
                  </div>
                  <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-3 text-center">
                    <Droplets className="w-4 h-4 text-cyan-500 mx-auto mb-1" />
                    <p className="text-lg font-black text-slate-800">{latestVitals?.o2 || '—'}%</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Oxygen</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                    <Thermometer className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <p className="text-lg font-black text-slate-800">{latestVitals?.temp || '—'}°F</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Temperature</p>
                  </div>
                  <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-center">
                    <Activity className="w-4 h-4 text-violet-500 mx-auto mb-1" />
                    <p className="text-lg font-black text-slate-800">{latestVitals?.hr || '—'}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Heart Rate</p>
                  </div>
                </div>
              </div>

              {/* Trend */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vitals Trend</p>
                  <p className="text-xs text-slate-500 mt-0.5">{patient.history.length} reading{patient.history.length !== 1 ? 's' : ''} recorded</p>
                </div>
                <div className="flex items-center gap-2">
                  {patient.trend === 'up' && <span className="flex items-center gap-1 text-red-600 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-full border border-red-100"><ArrowUpRight className="w-4 h-4" /> Increasing ↑</span>}
                  {patient.trend === 'down' && <span className="flex items-center gap-1 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100"><ArrowDownRight className="w-4 h-4" /> Decreasing ↓</span>}
                  {patient.trend === 'stable' && <span className="flex items-center gap-1 text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100"><Minus className="w-4 h-4" /> Stable —</span>}
                </div>
              </div>

              {/* History Timeline */}
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">History Timeline</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {[...patient.history].reverse().map((entry, i) => (
                    <div key={i} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-4 py-2.5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px] font-bold">{entry.time}</span>
                        </div>
                        {i === 0 && <span className="text-[8px] bg-blue-100 text-blue-700 font-black px-1.5 py-0.5 rounded uppercase">Latest</span>}
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="font-bold text-slate-700">BP: {entry.bp}</span>
                        <span className="text-slate-500">O₂: {entry.o2}%</span>
                        <span className="text-slate-500">Temp: {entry.temp}°F</span>
                        {entry.hr && <span className="text-slate-500">HR: {entry.hr}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Diagnosis */}
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> AI Diagnosis
                </h3>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase">Predicted Condition</p>
                    <p className="text-base font-black text-slate-800">{patient.aiAnalysis.predictedDisease}</p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{patient.aiAnalysis.explanation}</p>
                </div>
              </div>

              {/* Doctor & Risks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-2 text-slate-400">
                    <Stethoscope className="w-3 h-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Doctor Assignment</p>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{doctorName}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">{patient.aiAnalysis.suggestedDoctorType}</p>
                  <p className="text-[10px] text-blue-600 font-bold mt-2 bg-blue-50 inline-block px-2 py-1 rounded">{slotInfo}</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-2 text-slate-400">
                    <ShieldCheck className="w-3 h-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Future Risks</p>
                  </div>
                  <ul className="space-y-1.5">
                    {patient.aiAnalysis.futureRisks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Priority Badge */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Priority Score: <span className="font-bold text-slate-800">{patient.priorityScore}</span>
                </div>
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                  patient.priorityLevel === 'Critical' ? "bg-red-100 text-red-700 border border-red-200" :
                  patient.priorityLevel === 'Urgent' ? "bg-orange-100 text-orange-700 border border-orange-200" :
                  "bg-emerald-100 text-emerald-700 border border-emerald-200"
                )}>
                  {patient.priorityLevel}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
