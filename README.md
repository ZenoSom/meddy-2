# 🏥 Meddy AI: Project Overview & Architecture

We built an AI-based hospital management patient prioritization system, gaining valuable experience in innovation, teamwork, and problem-solving.

**Meddy AI** is a state-of-the-art **Neural Triage System** designed to streamline medical intake processes using Artificial Intelligence. It transforms raw patient data (vitals, symptoms, and medical history) into actionable clinical insights, prioritizing patients based on urgency and ensuring they are seen by the right specialist.

---

## 🚀 Core Features

### 🧠 AI-Powered Triage
- Uses Gemini/OpenAI models  
- Analyzes symptoms and predicts:
  - Potential diseases  
  - Risk levels (Critical, Urgent, Normal)  
  - Initial prescription suggestions  

---

### 📊 Dynamic Neural Ranking
- Global Ranking system for patients  
- Scores based on:
  - Blood Pressure (BP)  
  - Oxygen Level (O2)  
  - Heart Rate (HR)  
  - AI analysis  
- Ensures critical patients are prioritized  

---

### 🩺 Specialist Routing
- Automatically assigns doctors based on symptoms:
  - Cardiologist → Chest pain  
  - Neurologist → Stiff neck  
- Improves efficiency and reduces manual sorting  

---

### 📈 Real-time Vitals Monitoring
- Tracks patient vitals history  
- Visualizes trends:
  - Stable  
  - Deteriorating  

---

### 🎨 Glassmorphic UI
- macOS-inspired design  
- Features:
  - Blur effects  
  - Smooth animations  
  - Premium interface  

---

### 💬 Staff Assistant
- Chat interface for clinical staff  
- Allows:
  - Patient queries  
  - System-wide insights  

---

## 🛠️ Technical Stack

| Category            | Technology                          |
|--------------------|-----------------------------------|
| Frontend Framework | React 19, TypeScript              |
| Build Tool         | Vite 6                            |
| Styling            | Tailwind CSS 4, Lucide Icons      |
| Animations         | Framer Motion                     |
| AI Integration     | Google Gemini API, OpenAI SDK     |
| Database/Auth      | Supabase                          |
| Persistence        | LocalStorage                      |

---

## 📁 Technical Structure

### `/src/components/`
- **PatientForm.tsx** → Patient data intake  
- **AISuggestionBox.tsx** → AI diagnostic results UI  
- **GlobalRanking.tsx** → Patient priority dashboard  
- **DoctorQueues.tsx** → Specialist-wise queue management  
- **ChatBox.tsx** → Staff assistant  

---

### `/src/lib/`
- **openai.ts** → AI request handling  
- **parser.ts** → Converts AI responses into structured data  
- **utils.ts** → UI helper functions  

---

### ⚙️ Root Configuration
- **supabase_schema.sql** → Database structure  
- **vite.config.ts** → Build optimization  

---

## 🚦 Getting Started

### 🔑 Environment Setup
Create `.env.local`:



---

### 📦 Installation



---

### ▶️ Run Development Server


➡️ Runs on: `http://localhost:3000`

---

### 🧪 Demo Mode
- Uses `MOCK_PATIENTS` dataset  
- Fully ready for real-time data integration via **PatientForm**

---

## 🙏 Acknowledgements

# 🛡️ HackShastra

**HackShastra** is India's first creator-led tech community and student collective focused on bridging the gap between academic theory and real-world architectural innovation.

---

## 🔗 Project & Community Links

* **Official Website:** [hackshastra.in](https://www.hackshastra.in/)
* **SRM-AP Chapter:** [hackshastrasrmuap.dev](https://www.hackshastrasrmuap.dev/)

---

## 👥 Community Leadership
* ** Uday Sharma
* ** Md Imran
---

## 👨‍💻 Team

- Somnath Singh (IIT Jodhpur, Rajasthan)  |  Kartik Karnwal (SRGC)  |  Garuv Kumar (SRGC) |  Nitin Kumar (SRGC)
 

---
