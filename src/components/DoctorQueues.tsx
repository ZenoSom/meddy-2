import React from 'react';
import { Doctor, Patient, Appointment } from '../types';
import { User, Calendar, Clock, Stethoscope } from 'lucide-react';
import { cn } from '../lib/utils';

interface DoctorQueuesProps {
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
}

export default function DoctorQueues({ doctors, patients, appointments }: DoctorQueuesProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Stethoscope className="text-blue-600 w-5 h-5" />
        <h2 className="text-lg font-semibold text-slate-800">Doctor Queues</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
        {doctors.map(doctor => {
          const doctorAppointments = appointments
            .filter(app => app.doctorId === doctor.id)
            .sort((a, b) => a.rankInQueue - b.rankInQueue);

          return (
            <div key={doctor.id} className="space-y-3">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{doctor.name}</h3>
                    <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">{doctor.specialist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Queue</p>
                  <p className="text-sm font-bold text-slate-700">{doctorAppointments.length}</p>
                </div>
              </div>

              <div className="space-y-2 pl-4">
                {doctorAppointments.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">No active appointments</p>
                ) : (
                  doctorAppointments.map((app, idx) => {
                    const patient = patients.find(p => p.id === app.patientId);
                    if (!patient) return null;

                    return (
                      <div
                        key={app.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg border text-xs",
                          patient.priorityLevel === 'Critical' ? "bg-red-50/50 border-red-100" :
                          patient.priorityLevel === 'Urgent' ? "bg-orange-50/50 border-orange-100" :
                          "bg-emerald-50/50 border-emerald-100"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-400">#{idx + 1}</span>
                          <span className="font-medium text-slate-700">{patient.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {app.slot.time}
                          </div>
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            patient.priorityLevel === 'Critical' ? "bg-red-500" :
                            patient.priorityLevel === 'Urgent' ? "bg-orange-400" :
                            "bg-emerald-500"
                          )} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
