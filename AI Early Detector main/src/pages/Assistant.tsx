import { useState, useEffect } from "react";
import { ArrowLeft, Award, Flame, GlassWater, Moon, Footprints, Plus, Trash2, Calendar, CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import ParticlesBackground from "@/components/ParticlesBackground";
import { toast } from "sonner";

interface MedReminder {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
}

const Assistant = () => {
  const todayStr = new Date().toISOString().split("T")[0];

  // Tracker states
  const [water, setWater] = useState(0); // in mL
  const [sleep, setSleep] = useState(0); // in hours
  const [steps, setSteps] = useState(0); // count
  const [caloriesIn, setCaloriesIn] = useState(0); // consumed
  const [caloriesOut, setCaloriesOut] = useState(0); // burned
  
  // Input fields
  const [sleepInput, setSleepInput] = useState("");
  const [stepsInput, setStepsInput] = useState("");
  const [calInInput, setCalInInput] = useState("");
  const [calOutInput, setCalOutInput] = useState("");

  // Medication and Appointment states
  const [meds, setMeds] = useState<MedReminder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Add Med states
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [medTime, setMedTime] = useState("");

  // Add Appt states
  const [apptDoctor, setApptDoctor] = useState("");
  const [apptSpecialty, setApptSpecialty] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("");

  // Load from LocalStorage
  useEffect(() => {
    const cachedData = localStorage.getItem(`adhira_assistant_${todayStr}`);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setWater(parsed.water || 0);
        setSleep(parsed.sleep || 0);
        setSteps(parsed.steps || 0);
        setCaloriesIn(parsed.caloriesIn || 0);
        setCaloriesOut(parsed.caloriesOut || 0);
      } catch (e) {
        localStorage.removeItem(`adhira_assistant_${todayStr}`);
      }
    }

    const cachedMeds = localStorage.getItem("adhira_meds");
    if (cachedMeds) {
      try {
        setMeds(JSON.parse(cachedMeds));
      } catch (e) {
        localStorage.removeItem("adhira_meds");
      }
    }

    const cachedAppts = localStorage.getItem("adhira_appointments");
    if (cachedAppts) {
      try {
        setAppointments(JSON.parse(cachedAppts));
      } catch (e) {
        localStorage.removeItem("adhira_appointments");
      }
    }
  }, [todayStr]);

  // Save trackers to LocalStorage
  const saveTrackers = (updatedFields: Record<string, number>) => {
    const cachedData = localStorage.getItem(`adhira_assistant_${todayStr}`);
    let current = {};
    if (cachedData) {
      try {
        current = JSON.parse(cachedData);
      } catch (e) {}
    }
    const newData = { ...current, ...updatedFields };
    localStorage.setItem(`adhira_assistant_${todayStr}`, JSON.stringify(newData));
  };

  // Water Actions
  const addWater = (amount: number) => {
    const nextWater = Math.min(water + amount, 5000);
    setWater(nextWater);
    saveTrackers({ water: nextWater });
    toast.success(`Added ${amount}ml water 💧`);
  };

  const resetWater = () => {
    setWater(0);
    saveTrackers({ water: 0 });
    toast.info("Water tracker reset");
  };

  // Log Sleep
  const handleLogSleep = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(sleepInput);
    if (isNaN(val) || val < 0 || val > 24) {
      toast.error("Please enter a valid sleep duration (0-24 hours).");
      return;
    }
    setSleep(val);
    saveTrackers({ sleep: val });
    setSleepInput("");
    toast.success(`Logged ${val} hours of sleep 🌙`);
  };

  // Log Steps
  const handleLogSteps = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(stepsInput);
    if (isNaN(val) || val < 0) {
      toast.error("Please enter a valid step count.");
      return;
    }
    setSteps(val);
    saveTrackers({ steps: val });
    setStepsInput("");
    toast.success(`Logged ${val.toLocaleString()} steps 👣`);
  };

  // Log Calories In
  const handleLogCalIn = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(calInInput);
    if (isNaN(val) || val < 0) {
      toast.error("Please enter a valid calorie count.");
      return;
    }
    setCaloriesIn(val);
    saveTrackers({ caloriesIn: val });
    setCalInInput("");
    toast.success(`Logged ${val} kcal consumed 🍎`);
  };

  // Log Calories Out
  const handleLogCalOut = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(calOutInput);
    if (isNaN(val) || val < 0) {
      toast.error("Please enter a valid calorie burn count.");
      return;
    }
    setCaloriesOut(val);
    saveTrackers({ caloriesOut: val });
    setCalOutInput("");
    toast.success(`Logged ${val} kcal burned ⚡`);
  };

  // Medication Reminders
  const addMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medDosage || !medTime) {
      toast.error("Please fill out all medication details.");
      return;
    }
    const newMed: MedReminder = {
      id: Date.now().toString(),
      name: medName,
      dosage: medDosage,
      time: medTime,
      taken: false
    };
    const updated = [...meds, newMed];
    setMeds(updated);
    localStorage.setItem("adhira_meds", JSON.stringify(updated));
    setMedName("");
    setMedDosage("");
    setMedTime("");
    toast.success("Medication reminder added 💊");
  };

  const toggleMedTaken = (id: string) => {
    const updated = meds.map((m) => m.id === id ? { ...m, taken: !m.taken } : m);
    setMeds(updated);
    localStorage.setItem("adhira_meds", JSON.stringify(updated));
    const med = updated.find(m => m.id === id);
    if (med?.taken) toast.success(`${med.name} marked as taken!`);
  };

  const deleteMed = (id: string) => {
    const updated = meds.filter((m) => m.id !== id);
    setMeds(updated);
    localStorage.setItem("adhira_meds", JSON.stringify(updated));
    toast.info("Medication reminder removed");
  };

  // Appointment Actions
  const addAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptDoctor || !apptSpecialty || !apptDate || !apptTime) {
      toast.error("Please fill out all appointment details.");
      return;
    }
    const newAppt: Appointment = {
      id: Date.now().toString(),
      doctor: apptDoctor,
      specialty: apptSpecialty,
      date: apptDate,
      time: apptTime
    };
    const updated = [...appointments, newAppt];
    setAppointments(updated);
    localStorage.setItem("adhira_appointments", JSON.stringify(updated));
    setApptDoctor("");
    setApptSpecialty("");
    setApptDate("");
    setApptTime("");
    toast.success("Doctor appointment scheduled 📅");
  };

  const deleteAppt = (id: string) => {
    const updated = appointments.filter((a) => a.id !== id);
    setAppointments(updated);
    localStorage.setItem("adhira_appointments", JSON.stringify(updated));
    toast.info("Appointment canceled");
  };

  // Daily Health Score Calculation
  // Max score: 100
  // Water: 25 pts (Target: 2500mL)
  // Sleep: 25 pts (Target: 8h)
  // Steps: 25 pts (Target: 10,000)
  // Calorie balance: 25 pts (Target: positive entry/net burn)
  const calculateDailyScore = () => {
    const waterScore = Math.min((water / 2500) * 25, 25);
    const sleepScore = Math.min((sleep / 8) * 25, 25);
    const stepsScore = Math.min((steps / 10000) * 25, 25);
    const calorieScore = caloriesIn > 0 ? 25 : 0;
    return Math.round(waterScore + sleepScore + stepsScore + calorieScore);
  };

  const dailyScore = calculateDailyScore();

  return (
    <div className="min-h-screen bg-background relative pb-16">
      <ParticlesBackground />
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
              👣 Personal Health Assistant
            </h1>
            <p className="text-muted-foreground mt-1">
              Log habits, track calorie targets, and ensure daily medication compliance.
            </p>
          </div>
          
          {/* Health Score Summary Card */}
          <div className="flex items-center gap-4 bg-card/90 border border-border/80 p-4 rounded-2xl shadow-xl backdrop-blur">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Daily Wellness Score</div>
              <div className="text-2xl font-black text-foreground mt-0.5">{dailyScore} <span className="text-sm font-normal text-muted-foreground">/ 100</span></div>
              <div className="text-[11px] text-emerald-500 font-semibold mt-0.5">
                {dailyScore >= 75 ? "Excellent Health!" : dailyScore >= 50 ? "Doing Great!" : "Keep it up!"}
              </div>
            </div>
          </div>
        </div>

        {/* Grid Layout for Trackers */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Water Tracker Card */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-lg flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <GlassWater className="h-20 w-20 text-blue-500" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                <GlassWater className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Water Tracker</h3>
            </div>
            <div className="flex-1 flex flex-col justify-center my-3">
              <span className="text-2xl font-black text-blue-500">{water} <span className="text-xs font-semibold text-muted-foreground">/ 2500 mL</span></span>
              <div className="w-full bg-secondary h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${Math.min((water / 2500) * 100, 100)}%` }} />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button onClick={() => addWater(250)} className="flex-1 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition cursor-pointer">+250ml</button>
              <button onClick={() => addWater(500)} className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition cursor-pointer">+500ml</button>
              <button onClick={resetWater} className="py-1.5 px-2.5 bg-secondary hover:bg-muted text-muted-foreground rounded-lg text-xs font-bold transition cursor-pointer">Reset</button>
            </div>
          </div>

          {/* Sleep Tracker Card */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-lg flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Moon className="h-20 w-20 text-amber-500" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                <Moon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Sleep Log</h3>
            </div>
            <div className="flex-1 flex flex-col justify-center my-3">
              <span className="text-2xl font-black text-amber-500">{sleep} <span className="text-xs font-semibold text-muted-foreground">/ 8 hrs</span></span>
              <div className="w-full bg-secondary h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${Math.min((sleep / 8) * 100, 100)}%` }} />
              </div>
            </div>
            <form onSubmit={handleLogSleep} className="flex gap-1.5 mt-2">
              <input
                type="number"
                step="0.5"
                placeholder="Hrs"
                value={sleepInput}
                onChange={(e) => setSleepInput(e.target.value)}
                className="w-16 px-2 py-1.5 rounded-lg bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-amber-500"
              />
              <button type="submit" className="flex-1 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition cursor-pointer">Log Sleep</button>
            </form>
          </div>

          {/* Steps Tracker Card */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-lg flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Footprints className="h-20 w-20 text-emerald-500" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                <Footprints className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Step Counter</h3>
            </div>
            <div className="flex-1 flex flex-col justify-center my-3">
              <span className="text-2xl font-black text-emerald-500">{steps.toLocaleString()} <span className="text-xs font-semibold text-muted-foreground">/ 10,000</span></span>
              <div className="w-full bg-secondary h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${Math.min((steps / 10000) * 100, 100)}%` }} />
              </div>
            </div>
            <form onSubmit={handleLogSteps} className="flex gap-1.5 mt-2">
              <input
                type="number"
                placeholder="Steps"
                value={stepsInput}
                onChange={(e) => setStepsInput(e.target.value)}
                className="w-20 px-2 py-1.5 rounded-lg bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-emerald-500"
              />
              <button type="submit" className="flex-1 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition cursor-pointer">Log steps</button>
            </form>
          </div>

          {/* Calories Tracker Card */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-lg flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Flame className="h-20 w-20 text-rose-500" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Calorie Balance</h3>
            </div>
            <div className="flex-1 flex flex-col justify-center my-3">
              <span className="text-lg font-bold text-rose-500">In: {caloriesIn} | Out: {caloriesOut}</span>
              <div className="text-xs font-semibold text-muted-foreground mt-1">
                Net: {caloriesIn - caloriesOut} kcal
              </div>
            </div>
            <div className="flex gap-1 mt-2">
              <form onSubmit={handleLogCalIn} className="flex-1 flex gap-1">
                <input
                  type="number"
                  placeholder="In"
                  value={calInInput}
                  onChange={(e) => setCalInInput(e.target.value)}
                  className="w-12 px-1 py-1 bg-secondary border border-border rounded text-center text-xs text-foreground focus:outline-none focus:border-rose-500"
                />
                <button type="submit" className="px-1.5 bg-rose-500 text-white rounded text-[10px] font-bold cursor-pointer">In</button>
              </form>
              <form onSubmit={handleLogCalOut} className="flex-1 flex gap-1">
                <input
                  type="number"
                  placeholder="Out"
                  value={calOutInput}
                  onChange={(e) => setCalOutInput(e.target.value)}
                  className="w-12 px-1 py-1 bg-secondary border border-border rounded text-center text-xs text-foreground focus:outline-none focus:border-rose-500"
                />
                <button type="submit" className="px-1.5 bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer">Out</button>
              </form>
            </div>
          </div>
        </div>

        {/* Lower Reminders & Management Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Medications Panel */}
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-xl flex flex-col">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              💊 Pill & Medication Reminders
            </h2>
            
            {/* Meds List */}
            <div className="flex-1 space-y-3 mb-6 min-h-32">
              {meds.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-secondary/15 rounded-xl border border-dashed border-border/80">
                  <p className="text-xs text-muted-foreground font-medium">No medications set. Add one below!</p>
                </div>
              ) : (
                meds.map((med) => (
                  <div key={med.id} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/10 hover:bg-secondary/20 transition duration-200">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleMedTaken(med.id)} className="focus:outline-none cursor-pointer">
                        <CheckCircle2 className={`h-5 w-5 ${med.taken ? "text-primary fill-primary/10" : "text-muted-foreground opacity-60"}`} />
                      </button>
                      <div>
                        <div className={`text-sm font-bold ${med.taken ? "line-through text-muted-foreground" : "text-foreground"}`}>{med.name}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>{med.dosage}</span>
                          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                          <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {med.time}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => deleteMed(med.id)} className="p-1.5 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground/60 rounded-lg transition cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Med Form */}
            <form onSubmit={addMedication} className="bg-secondary/20 border border-border/50 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold text-foreground">Add New Reminder</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Med Name (e.g. Lipitor)"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="p-2 rounded-lg bg-card border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g. 10mg)"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  className="p-2 rounded-lg bg-card border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Time (e.g. 09:00 AM)"
                  value={medTime}
                  onChange={(e) => setMedTime(e.target.value)}
                  className="flex-1 p-2 rounded-lg bg-card border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg text-xs hover:opacity-90 active:scale-95 transition cursor-pointer flex items-center gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </form>
          </div>

          {/* Doctor Appointments Panel */}
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-xl flex flex-col">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              📅 Appointment Management
            </h2>

            {/* Appts List */}
            <div className="flex-1 space-y-3 mb-6 min-h-32">
              {appointments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-secondary/15 rounded-xl border border-dashed border-border/80">
                  <p className="text-xs text-muted-foreground font-medium">No appointments scheduled. Add one below!</p>
                </div>
              ) : (
                appointments.map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/10 hover:bg-secondary/20 transition duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <Calendar className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">{appt.doctor}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>{appt.specialty}</span>
                          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                          <span>{appt.date} @ {appt.time}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => deleteAppt(appt.id)} className="p-1.5 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground/60 rounded-lg transition cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Appt Form */}
            <form onSubmit={addAppointment} className="bg-secondary/20 border border-border/50 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold text-foreground">Schedule Appointment</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Doctor (e.g. Dr. Verma)"
                  value={apptDoctor}
                  onChange={(e) => setApptDoctor(e.target.value)}
                  className="p-2 rounded-lg bg-card border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Specialty (e.g. Cardio)"
                  value={apptSpecialty}
                  onChange={(e) => setApptSpecialty(e.target.value)}
                  className="p-2 rounded-lg bg-card border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={apptDate}
                  onChange={(e) => setApptDate(e.target.value)}
                  className="p-2 rounded-lg bg-card border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
                <input
                  type="time"
                  value={apptTime}
                  onChange={(e) => setApptTime(e.target.value)}
                  className="p-2 rounded-lg bg-card border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg text-xs hover:opacity-90 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Book Appointment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
