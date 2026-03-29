import { useState, useEffect } from 'react';
import { Activity, Heart, Search, Bell, Settings, User } from 'lucide-react';
import PatientForm from './components/PatientForm';
import ChatBox from './components/ChatBox';
import GlobalRanking from './components/GlobalRanking';
import DoctorQueues from './components/DoctorQueues';
import AISuggestionBox from './components/AISuggestionBox';
import PatientDetailModal from './components/PatientDetailModal';
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
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctorName, setSelectedDoctorName] = useState('');
  const [selectedSlotInfo, setSelectedSlotInfo] = useState('');

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPatients = localStorage.getItem('meddy_patients');
    const savedAppointments = localStorage.getItem('meddy_appointments');
    
    if (savedPatients) {
      try {
        const parsed = JSON.parse(savedPatients);
        if (Array.isArray(parsed)) {
          const parsedPatients = parsed.map((p: any) => {
            // Migration from old schema to new schema
            if (!p.history && p.vitals) {
              p.history = [{
                time: p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "00:00",
                temp: p.vitals.temp,
                bp: p.vitals.bp,
                o2: p.vitals.o2,
                hr: p.vitals.hr
              }];
            }
            if (!p.trend) p.trend = 'stable';
            return p;
          });
          setPatients(parsedPatients);
        } else {
          setPatients([]);
        }
      } catch (e) {
        console.error("Failed to parse patients", e);
        setPatients([]);
      }
    }
    
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
    setPatients(prev => {
      const existingIndex = prev.findIndex(p => p.id === newPatient.id);
      if (existingIndex !== -1) {
        // Update existing
        const updated = [...prev];
        updated[existingIndex] = newPatient;
        return updated;
      }
      return [...prev, newPatient];
    });
    
    // Auto-assign doctor and create appointment ONLY if it's a new checkin/update
    // We'll just create a new appointment or update if needed. We'll simply create a new appointment.
    const doctor = doctors.find(d => d.specialist === newPatient.aiAnalysis.suggestedDoctorType);
    if (doctor) {
      setCurrentDoctorName(doctor.name);
      // We check if an appointment already exists for this patient, if yes, just skip or we update?
      // Let's create a new appointment if they don't have one today, for simplicity we skip creating multiple appointments for updates
      setAppointments(prevApps => {
        if(prevApps.find(a => a.patientId === newPatient.id)) return prevApps; // skip recreating doctor app
        const doctorApps = prevApps.filter(a => a.doctorId === doctor.id);
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
        return [...prevApps, newAppointment];
      });
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

  const handleViewDetails = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    setSelectedPatient(patient);

    const appointment = appointments.find(a => a.patientId === patient.id);
    if (appointment) {
      const doc = doctors.find(d => d.id === appointment.doctorId);
      setSelectedDoctorName(doc ? doc.name : "Pending");
      setSelectedSlotInfo(`${appointment.slot.day}, ${appointment.slot.date} @ ${appointment.slot.time}`);
    } else {
      setSelectedDoctorName("Pending Assignment");
      setSelectedSlotInfo("TBD");
    }
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2500')] bg-cover bg-center flex items-center justify-center p-2 sm:p-8 font-sans text-slate-900">
      <div className="w-full max-w-[1700px] h-[95vh] sm:h-[90vh] bg-white/20 backdrop-blur-3xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-2xl flex flex-col overflow-hidden text-slate-800 ring-1 ring-white/50">
        
        {/* Header - macOS Style */}
        <header className="bg-white/30 border-b border-white/40 px-4 py-3 flex items-center justify-between z-10 sticky top-0 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-6">
            {/* macOS traffic lights */}
            <div className="flex gap-2 group cursor-pointer">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-300 group-hover:bg-red-500 transition-colors shadow-inner flex items-center justify-center"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-slate-300 group-hover:bg-yellow-500 transition-colors shadow-inner flex items-center justify-center"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-slate-300 group-hover:bg-green-500 transition-colors shadow-inner flex items-center justify-center"></div>
            </div>
            
            <div className="flex items-center gap-3">
              <img src="/logo.png" className="w-9 h-9 rounded-lg object-cover ring-1 ring-white/60 shadow-sm" alt="Meddy AI Brand Logo" />
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">Meddy AI</h1>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest hidden sm:block">Neural Triage System</p>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-slate-800 transition-colors" />
              <input
                placeholder="Search patient neural records..."
                className="w-full bg-white/40 border border-white/50 rounded-full py-2 pl-10 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-white/80 outline-none transition-all placeholder:text-slate-600 backdrop-blur-sm shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-600 hover:text-slate-900 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white shadow-sm animate-pulse"></span>
            </button>
            <button className="p-2 text-slate-600 hover:text-slate-900 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-white/40 mx-2"></div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800">System Admin</p>
                <p className="text-[10px] text-slate-600">Command Center</p>
              </div>
              <div className="w-9 h-9 bg-white/50 border border-white/60 rounded-full flex items-center justify-center text-slate-700 group-hover:bg-white/70 transition-colors shadow-sm">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area - Scrollable */}
        <main className="flex-1 p-4 sm:p-6 mx-auto w-full overflow-y-auto custom-scrollbar relative z-0">
          {/* We wrap the child components so they appear cleanly against the dark/glass bg */}
          <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Top Section: Patient Intake */}
            <PatientForm patients={patients} onPatientAdded={addPatient} onAnalysisComplete={handleAnalysisComplete} />

            {/* AI Suggestion Box */}
            <AISuggestionBox 
              analysis={currentAnalysis} 
              patientName={currentPatientName} 
              doctorName={currentDoctorName}
              slotInfo={currentSlot}
              vitals={currentVitals}
              onClose={() => setCurrentAnalysis(null)}
            />

            {/* Bottom Grid Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Global Ranking */}
              <div className="lg:col-span-5 h-[600px]">
                <GlobalRanking patients={patients} onDeletePatient={deletePatient} onViewDetails={handleViewDetails} />
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
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/30 backdrop-blur-md border-t border-white/40 px-6 py-4 shrink-0 shadow-inner z-10 relative flex justify-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/60 shadow-sm" alt="Meddy Logo" />
            <div className="text-left">
              <h1 className="text-sm font-bold tracking-tight text-slate-900">Meddy AI</h1>
              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Copyright. Team_Hierarchy</p>
            </div>
          </div>
        </footer>

        {/* Patient Detail Popup Modal */}
        <PatientDetailModal
          patient={selectedPatient}
          doctorName={selectedDoctorName}
          slotInfo={selectedSlotInfo}
          onClose={() => setSelectedPatient(null)}
        />
      </div>
    </div>
  );
}
