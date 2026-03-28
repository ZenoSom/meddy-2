import { useState, useEffect } from 'react';
import { Activity, Heart, Search, Bell, Settings, User } from 'lucide-react';
import PatientForm from './components/PatientForm';
import ChatBox from './components/ChatBox';
import GlobalRanking from './components/GlobalRanking';
import DoctorQueues from './components/DoctorQueues';
import AISuggestionBox from './components/AISuggestionBox';
import { Patient, Doctor, Appointment } from './types';
import { AIAnalysis } from './lib/openai';

// Mock Doctors for initial setup
const INITIAL_DOCTORS: Doctor[] = [
  { id: 'd1', name: "Dr. Sarah Sharma", specialist: "Cardiologist", schedule: { day: "Monday", date: "2026-03-30", slots: ["09:00", "09:30", "10:00", "10:30", "11:00"] } },
  { id: 'd2', name: "Dr. James Wilson", specialist: "Pulmonologist", schedule: { day: "Monday", date: "2026-03-30", slots: ["09:00", "09:30", "10:00", "10:30", "11:00"] } },
  { id: 'd3', name: "Dr. Elena Rodriguez", specialist: "Neurologist", schedule: { day: "Monday", date: "2026-03-30", slots: ["09:00", "09:30", "10:00", "10:30", "11:00"] } },
  { id: 'd4', name: "Dr. Robert Chen", specialist: "Orthopedic", schedule: { day: "Monday", date: "2026-03-30", slots: ["09:00", "09:30", "10:00", "10:30", "11:00"] } },
  { id: 'd5', name: "Dr. Emily Brown", specialist: "General Physician", schedule: { day: "Monday", date: "2026-03-30", slots: ["09:00", "09:30", "10:00", "10:30", "11:00"] } },
];

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysis | null>(null);
  const [currentPatientName, setCurrentPatientName] = useState('');
  const [currentDoctorName, setCurrentDoctorName] = useState('');
  const [currentSlot, setCurrentSlot] = useState('');
  const [currentVitals, setCurrentVitals] = useState<any>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPatients = localStorage.getItem('meddy_patients');
    const savedAppointments = localStorage.getItem('meddy_appointments');
    
    if (savedPatients) setPatients(JSON.parse(savedPatients));
    if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
    
    setLoading(false);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('meddy_patients', JSON.stringify(patients));
      localStorage.setItem('meddy_appointments', JSON.stringify(appointments));
    }
  }, [patients, appointments, loading]);

  const addPatient = (newPatient: Patient) => {
    setPatients(prev => [...prev, newPatient]);
    
    // Auto-assign doctor and create appointment
    const doctor = doctors.find(d => d.specialist === newPatient.aiAnalysis.suggestedDoctorType);
    if (doctor) {
      setCurrentDoctorName(doctor.name);
      const doctorApps = appointments.filter(a => a.doctorId === doctor.id);
      const nextRank = doctorApps.length + 1;
      const slotIndex = Math.min(nextRank - 1, doctor.schedule.slots.length - 1);
      const nextSlotTime = doctor.schedule.slots[slotIndex] || "TBD";
      
      const slotString = `${doctor.schedule.day}, ${doctor.schedule.date} @ ${nextSlotTime}`;
      setCurrentSlot(slotString);

      const newAppointment: Appointment = {
        id: Math.random().toString(36).substr(2, 9),
        patientId: newPatient.id,
        doctorId: doctor.id,
        slot: {
          day: doctor.schedule.day,
          date: doctor.schedule.date,
          time: nextSlotTime
        },
        rankInQueue: nextRank,
        createdAt: new Date().toISOString()
      };
      setAppointments(prev => [...prev, newAppointment]);
    } else {
      setCurrentDoctorName("General Physician (Pending)");
      setCurrentSlot("Pending Assignment");
    }
  };

  const deletePatient = (patientId: string) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    setAppointments(prev => prev.filter(a => a.patientId !== patientId));
  };

  const handleAnalysisComplete = (analysis: AIAnalysis, name: string, vitals: any) => {
    setCurrentAnalysis(analysis);
    setCurrentPatientName(name);
    setCurrentVitals(vitals);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Heart className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Meddy AI</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Hospital Management System</p>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              placeholder="Search patients, doctors, or records..."
              className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">Admin Staff</p>
              <p className="text-[10px] text-slate-400">Reception Desk</p>
            </div>
            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full overflow-y-auto custom-scrollbar">
        {/* Top Section: Patient Intake */}
        <PatientForm onPatientAdded={addPatient} onAnalysisComplete={handleAnalysisComplete} />

        {/* AI Suggestion Box */}
        <AISuggestionBox 
          analysis={currentAnalysis} 
          patientName={currentPatientName} 
          doctorName={currentDoctorName}
          slotInfo={currentSlot}
          vitals={currentVitals}
        />

        {/* Bottom Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Global Ranking */}
          <div className="lg:col-span-5 h-[600px]">
            <GlobalRanking patients={patients} onDeletePatient={deletePatient} />
          </div>

          {/* Center: Doctor Queues */}
          <div className="lg:col-span-4 h-[600px]">
            <DoctorQueues doctors={doctors} patients={patients} appointments={appointments} />
          </div>

          {/* Right: Staff Assistant Chat */}
          <div className="lg:col-span-3 h-[600px]">
            <ChatBox patients={patients} />
          </div>
        </div>
      </main>

      {/* Footer / Team Hierarchy */}
      <footer className="bg-white border-t border-slate-200 px-8 py-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Heart className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-800">Meddy AI</h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">© 2026 Triage Intelligence</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 flex-1 max-w-4xl">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Clinical Leadership</h4>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">Dr. Ananya Singh</p>
                <p className="text-[9px] text-slate-400 font-medium italic">Chief Medical Officer</p>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">AI & Engineering</h4>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">Arjun Mehta</p>
                <p className="text-[9px] text-slate-400 font-medium italic">Lead AI Architect</p>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Operations</h4>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">Sarah Jenkins</p>
                <p className="text-[9px] text-slate-400 font-medium italic">Triage Operations Head</p>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Compliance</h4>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">David Chen</p>
                <p className="text-[9px] text-slate-400 font-medium italic">Regulatory & Ethics</p>
              </div>
            </div>
          </div>

          <div className="text-right">
             <div className="flex items-center gap-2 justify-end mb-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">System Active</span>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">GPT-4o Diagnostic Engine v1.1.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
