import React from 'react';
import { Patient } from '../types';
import { AlertTriangle, Clock, CheckCircle, ChevronRight, Trash2, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

interface GlobalRankingProps {
  patients: Patient[];
  onDeletePatient: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export default function GlobalRanking({ patients, onDeletePatient, onViewDetails }: GlobalRankingProps) {
  const sortedPatients = [...patients].sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Global Patient Ranking</h2>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total: {patients.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
        {sortedPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <Clock className="w-12 h-12 opacity-20" />
            <p className="text-sm">No patients in queue</p>
          </div>
        ) : (
          sortedPatients.map((patient, index) => (
            <div
              key={patient.id}
              onClick={() => onViewDetails(patient.id)}
              className={cn(
                "p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer group relative",
                patient.priorityLevel === 'Critical' ? "bg-red-50 border-red-100" :
                patient.priorityLevel === 'Urgent' ? "bg-orange-50 border-orange-100" :
                "bg-emerald-50 border-emerald-100"
              )}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePatient(patient.id);
                }}
                className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="Delete Patient"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    patient.priorityLevel === 'Critical' ? "bg-red-600 text-white" :
                    patient.priorityLevel === 'Urgent' ? "bg-orange-500 text-white" :
                    "bg-emerald-600 text-white"
                  )}>
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{patient.name}</h3>
                    <p className="text-xs text-slate-500">{patient.age}y • {patient.gender}</p>
                  </div>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter mr-6",
                  patient.priorityLevel === 'Critical' ? "bg-red-200 text-red-700" :
                  patient.priorityLevel === 'Urgent' ? "bg-orange-200 text-orange-700" :
                  "bg-emerald-200 text-emerald-700"
                )}>
                  {patient.priorityLevel}
                </div>
              </div>

              <div className="bg-white/40 p-3 rounded-lg border border-white/20 mb-3 space-y-1">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Priority Trend</p>
                   <div className="flex items-center gap-1 font-bold text-xs">
                     {patient.trend === 'up' && <span className="flex items-center text-red-500"><ArrowUpRight className="w-4 h-4" /> Increasing Risk</span>}
                     {patient.trend === 'down' && <span className="flex items-center text-emerald-500"><ArrowDownRight className="w-4 h-4" /> Decreasing Risk</span>}
                     {patient.trend === 'stable' && <span className="flex items-center text-blue-500"><Minus className="w-4 h-4" /> Stable</span>}
                   </div>
                </div>
                
                <div className="text-[10px] space-y-1 mt-2">
                  <p className="font-bold text-slate-400 uppercase tracking-widest">History Timeline (BP)</p>
                  <div className="flex items-center gap-3 overflow-x-auto pb-1 custom-scrollbar">
                    {patient.history.map((h, i) => (
                      <div key={i} className="flex flex-col items-center bg-white/60 px-2 py-1 rounded border border-slate-100 min-w-max">
                        <span className="font-bold text-slate-700">{h.bp}</span>
                        <span className="text-[8px] text-slate-400">{h.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/50 p-2 rounded-lg border border-white/20">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Predicted Disease</p>
                  <p className="text-xs font-medium text-slate-700 truncate">{patient.aiAnalysis.predictedDisease}</p>
                </div>
                <div className="bg-white/50 p-2 rounded-lg border border-white/20">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Suggested Specialist</p>
                  <p className="text-xs font-medium text-slate-700">{patient.aiAnalysis.suggestedDoctorType}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <AlertTriangle className="w-3 h-3" />
                  Score: {patient.priorityScore}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(patient.id);
                  }}
                  className="flex items-center gap-1 text-blue-600 text-[10px] font-bold group-hover:translate-x-1 transition-transform"
                >
                  View Details <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
