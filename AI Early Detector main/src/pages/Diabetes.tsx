import { useState, useEffect } from "react";
import { ArrowLeft, Activity, Info, Dumbbell, Utensils, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import ParticlesBackground from "@/components/ParticlesBackground";
import { toast } from "sonner";

interface GlucoseLog {
  date: string;
  time: string;
  type: "Fasting" | "Post-Meal";
  value: number;
  status: string;
}

const Diabetes = () => {
  // Sugar state
  const [sugarVal, setSugarVal] = useState("");
  const [sugarType, setSugarType] = useState<"Fasting" | "Post-Meal">("Fasting");
  const [logs, setLogs] = useState<GlucoseLog[]>([]);

  // Diet selection state
  const [selectedDiet, setSelectedDiet] = useState("Diabetic-Friendly");

  // Load from local storage
  useEffect(() => {
    const cached = localStorage.getItem("adhira_glucose_logs");
    if (cached) {
      try {
        setLogs(JSON.parse(cached));
      } catch (e) {
        localStorage.removeItem("adhira_glucose_logs");
      }
    }
  }, []);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(sugarVal);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid blood sugar value (mg/dL).");
      return;
    }

    let status = "Normal";
    if (sugarType === "Fasting") {
      if (val >= 126) status = "Diabetic 🚨";
      else if (val >= 100) status = "Prediabetic ⚡";
    } else {
      if (val >= 200) status = "Diabetic 🚨";
      else if (val >= 140) status = "Prediabetic ⚡";
    }

    const newLog: GlucoseLog = {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: sugarType,
      value: val,
      status
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    localStorage.setItem("adhira_glucose_logs", JSON.stringify(updated));
    setSugarVal("");
    toast.success("Glucose reading logged! 🩸");
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem("adhira_glucose_logs");
    toast.info("Glucose logs cleared");
  };

  // Diet options
  const diets: Record<string, string[]> = {
    "Diabetic-Friendly": [
      "Leafy greens (Spinach, Kale) - low calorie, high magnesium.",
      "Whole grains (Quinoa, Oats) - complex carbs, slow digest.",
      "Fatty fish (Salmon, Sardines) - rich in Omega-3 fatty acids.",
      "Greek Yogurt - high protein, supports metabolic health.",
      "Avocados - healthy monounsaturated fats, low sugar."
    ],
    "Keto / Low-Carb": [
      "Cruciferous vegetables (Broccoli, Cauliflower) - low carb.",
      "Eggs - zero carb, high satiety source of protein.",
      "Healthy Oils (Olive oil, Coconut oil) - supports ketosis.",
      "Nuts and Seeds (Almonds, Chia seeds) - healthy fats, fiber.",
      "Avocados - excellent keto macro profile."
    ],
    "Low Sodium (Heart-Healthy)": [
      "Fresh Fruits (Berries, Apples) - natural vitamins, no sodium.",
      "Fresh Herbs (Garlic, Lemon juice) - flavor enhancer without salt.",
      "Skinless poultry and fish - lean protein sources.",
      "Beans and lentils - high fiber, low sodium (rinse canned).",
      "Unsalted nuts and seeds."
    ]
  };

  // Workout Options
  const workouts = [
    { title: "🏃 Aerobic (Cardio)", desc: "Brisk walking, cycling, swimming. Target: 30 minutes, 5 days a week. Improves insulin sensitivity and cardiovascular stamina." },
    { title: "🏋️ Strength Training", desc: "Resistance bands, light free weights. Target: 2-3 sessions a week. Builds muscle mass which enhances glucose utilization." },
    { title: "🧘 Flexibility & Yoga", desc: "Mindful stretching and postures. Target: Daily 15-20 mins. Reduces stress/cortisol levels which otherwise spike blood sugar." }
  ];

  return (
    <div className="min-h-screen bg-background relative pb-16">
      <ParticlesBackground />
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
            🩸 Diabetes & Diet Planner
          </h1>
          <p className="text-muted-foreground mt-1">
            Log your blood sugar readings, check customized meal recommendations, and build healthy exercise habits.
          </p>
        </div>

        {/* Top split sections */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Blood Sugar Tracker Card */}
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
                🩸 Glucose Level Tracker
              </h2>
              <p className="text-xs text-muted-foreground mb-4">Track daily fasting and post-meal glucose logs</p>

              <form onSubmit={handleAddLog} className="space-y-4 mb-4">
                <div className="flex gap-2">
                  <select
                    value={sugarType}
                    onChange={(e) => setSugarType(e.target.value as any)}
                    className="p-3 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="Fasting">Fasting</option>
                    <option value="Post-Meal">Post-Meal</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Value (mg/dL)"
                    value={sugarVal}
                    onChange={(e) => setSugarVal(e.target.value)}
                    className="flex-1 p-3 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                  <button type="submit" className="px-5 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition cursor-pointer">
                    Log
                  </button>
                </div>
              </form>

              {/* Glucose Logs List */}
              <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1 no-scrollbar">
                {logs.length === 0 ? (
                  <div className="text-center py-8 bg-secondary/15 rounded-xl border border-dashed text-xs text-muted-foreground">
                    No glucose readings logged yet today.
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="p-3 bg-secondary/20 border border-border/60 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-foreground">{log.value} mg/dL</span>
                        <span className="text-[10px] text-muted-foreground ml-2">({log.type})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-semibold text-muted-foreground">{log.date} @ {log.time}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          log.status.includes("Normal") 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                            : log.status.includes("Prediabetic") 
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
                            : "bg-destructive/10 text-destructive border-destructive/20 animate-pulse"
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {logs.length > 0 && (
              <button onClick={clearLogs} className="mt-4 w-full py-2 bg-secondary hover:bg-muted text-muted-foreground font-bold rounded-xl text-[10px] transition cursor-pointer">
                Clear Glucose Logs
              </button>
            )}
          </div>

          {/* Diet Recommendations Panel */}
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
              🥗 Custom Meal Planner
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Select diet framework for customized nutritional advice</p>

            <div className="flex gap-2 mb-4">
              {Object.keys(diets).map((dietName) => (
                <button
                  key={dietName}
                  onClick={() => setSelectedDiet(dietName)}
                  className={`flex-1 py-2 rounded-xl text-[10px] border font-bold transition cursor-pointer ${
                    selectedDiet === dietName
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "bg-secondary border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {dietName}
                </button>
              ))}
            </div>

            {/* Diet list */}
            <div className="space-y-3">
              {(diets[selectedDiet] || []).map((item, idx) => (
                <div key={idx} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Workout suggestions section */}
        <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-xl">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
            🏋️ Workout Planner & Exercise Guide
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Clinically structured physical exercise recommendations</p>

          <div className="grid gap-4 md:grid-cols-3">
            {workouts.map((workout, idx) => (
              <div key={idx} className="p-4 bg-secondary/15 border border-border/60 rounded-xl">
                <div className="text-xs font-bold text-foreground mb-2">{workout.title}</div>
                <p className="text-[10px] leading-relaxed text-muted-foreground">{workout.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diabetes;
