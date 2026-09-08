import { useState } from "react";
import { ArrowLeft, Activity, Heart, Shield, RefreshCw, Info } from "lucide-react";
import { Link } from "react-router-dom";
import ParticlesBackground from "@/components/ParticlesBackground";
import { toast } from "sonner";

const Vitals = () => {
  const [activeTab, setActiveTab] = useState<"bmi" | "heart" | "bp">("bmi");
  
  // BMI State
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("170");
  const [bmiResult, setBmiResult] = useState<{ bmi: number; category: string; minWeight: number; maxWeight: number } | null>(null);

  // Heart Rate State
  const [age, setAge] = useState("25");
  const [restingHR, setRestingHR] = useState("70");
  const [hrResult, setHrResult] = useState<{ maxHR: number; zones: { name: string; range: string; purpose: string }[] } | null>(null);

  // BP State
  const [systolic, setSystolic] = useState("120");
  const [diastolic, setDiastolic] = useState("80");
  const [bpResult, setBpResult] = useState<{ category: string; map: number; color: string; advice: string } | null>(null);

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      toast.error("Please enter valid weight and height values.");
      return;
    }
    const bmiVal = w / (h * h);
    let cat = "Normal weight";
    if (bmiVal < 18.5) cat = "Underweight";
    else if (bmiVal >= 30) cat = "Obese";
    else if (bmiVal >= 25) cat = "Overweight";

    const minW = 18.5 * (h * h);
    const maxW = 24.9 * (h * h);

    setBmiResult({
      bmi: Math.round(bmiVal * 10) / 10,
      category: cat,
      minWeight: Math.round(minW * 10) / 10,
      maxWeight: Math.round(maxW * 10) / 10,
    });
    toast.success("BMI calculated!");
  };

  const calculateHeartRate = () => {
    const a = parseInt(age);
    const r = parseInt(restingHR);
    if (isNaN(a) || isNaN(r) || a <= 0 || a > 120 || r <= 0 || r > 220) {
      toast.error("Please enter valid age and resting heart rate.");
      return;
    }
    
    // Tanaka formula: Max HR = 208 - 0.7 * Age
    const maxHR = Math.round(208 - 0.7 * a);
    const hrr = maxHR - r; // Heart Rate Reserve

    const zones = [
      {
        name: "Fat Burn Zone (50-60%)",
        range: `${Math.round(r + hrr * 0.5)} - ${Math.round(r + hrr * 0.6)} bpm`,
        purpose: "Ideal for active recovery, fat oxidation, and light fitness conditioning.",
      },
      {
        name: "Aerobic Zone (60-70%)",
        range: `${Math.round(r + hrr * 0.6)} - ${Math.round(r + hrr * 0.7)} bpm`,
        purpose: "Improves cardiovascular endurance, strengthens heart muscle, and boosts stamina.",
      },
      {
        name: "Anaerobic / Performance Zone (70-85%)",
        range: `${Math.round(r + hrr * 0.7)} - ${Math.round(r + hrr * 0.85)} bpm`,
        purpose: "Enhances athletic performance, increases lactate threshold, and builds speed.",
      },
    ];

    setHrResult({ maxHR, zones });
    toast.success("Heart rate training zones calculated!");
  };

  const calculateBP = () => {
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    if (isNaN(sys) || isNaN(dia) || sys <= 0 || dia <= 0) {
      toast.error("Please enter valid blood pressure values.");
      return;
    }

    // Mean Arterial Pressure = Diastolic + 1/3 * (Systolic - Diastolic)
    const mapVal = dia + (sys - dia) / 3;

    let cat = "Normal";
    let color = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    let advice = "Your blood pressure is in the healthy range. Maintain a balanced diet and regular exercise.";

    if (sys >= 180 || dia >= 120) {
      cat = "Hypertensive Crisis (Seek Emergency Care)";
      color = "text-destructive bg-destructive/10 border-destructive/20 animate-pulse";
      advice = "WARNING: Hypertensive crisis. If you have headaches, chest pain, or vision issues, seek immediate medical attention.";
    } else if (sys >= 140 || dia >= 90) {
      cat = "High Blood Pressure (Stage 2 Hypertension)";
      color = "text-red-500 bg-red-500/10 border-red-500/20";
      advice = "Stage 2 Hypertension. Consult a physician for an assessment and possible medication review.";
    } else if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
      cat = "High Blood Pressure (Stage 1 Hypertension)";
      color = "text-orange-500 bg-orange-500/10 border-orange-500/20";
      advice = "Stage 1 Hypertension. Monitor your pressure regularly and adopt heart-healthy diet modifications.";
    } else if (sys >= 120 && sys < 130 && dia < 80) {
      cat = "Elevated Blood Pressure";
      color = "text-amber-500 bg-amber-500/10 border-amber-500/20";
      advice = "Blood pressure is slightly elevated. Lifestyle modifications can help prevent hypertension.";
    }

    setBpResult({
      category: cat,
      map: Math.round(mapVal * 10) / 10,
      color,
      advice,
    });
    toast.success("Blood pressure category analyzed!");
  };

  const getBmiColor = (bmi: number) => {
    if (bmi < 18.5) return "text-blue-500";
    if (bmi >= 25 && bmi < 30) return "text-orange-500";
    if (bmi >= 30) return "text-destructive";
    return "text-emerald-500";
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      <ParticlesBackground />
      <div className="relative z-10 w-full max-w-xl my-8">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="rounded-2xl card-glow overflow-hidden bg-card border border-border/60">
          <div className="bg-hero-gradient p-6 text-center text-primary-foreground">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Activity className="h-6 w-6 text-primary-foreground" />
              <h1 className="text-2xl font-bold">Health Vitals Calculator</h1>
            </div>
            <p className="text-primary-foreground/75 text-sm">Calculate & monitor key physiological parameters locally</p>
          </div>

          {/* Navigation tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("bmi")}
              className={`flex-1 py-3.5 text-sm font-semibold transition ${
                activeTab === "bmi" ? "border-b-2 border-primary text-primary bg-secondary/35" : "text-muted-foreground hover:bg-secondary/15"
              }`}
            >
              ⚖️ BMI
            </button>
            <button
              onClick={() => setActiveTab("heart")}
              className={`flex-1 py-3.5 text-sm font-semibold transition ${
                activeTab === "heart" ? "border-b-2 border-primary text-primary bg-secondary/35" : "text-muted-foreground hover:bg-secondary/15"
              }`}
            >
              ❤️ Heart Zones
            </button>
            <button
              onClick={() => setActiveTab("bp")}
              className={`flex-1 py-3.5 text-sm font-semibold transition ${
                activeTab === "bp" ? "border-b-2 border-primary text-primary bg-secondary/35" : "text-muted-foreground hover:bg-secondary/15"
              }`}
            >
              🩸 Blood Pressure
            </button>
          </div>

          <div className="p-6">
            {/* BMI Tab */}
            {activeTab === "bmi" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 70"
                    className="w-full p-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Height (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 170"
                    className="w-full p-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  onClick={calculateBMI}
                  className="w-full py-3.5 rounded-xl bg-hero-gradient text-primary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Calculate BMI
                </button>

                {bmiResult && (
                  <div className="mt-6 border border-border rounded-2xl p-5 bg-secondary/40 space-y-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Your Body Mass Index (BMI)</p>
                      <h3 className={`text-4xl font-extrabold mt-1.5 ${getBmiColor(bmiResult.bmi)}`}>{bmiResult.bmi}</h3>
                      <p className={`text-base font-bold mt-1.5 ${getBmiColor(bmiResult.bmi)}`}>{bmiResult.category}</p>
                    </div>
                    
                    <div className="h-px bg-border my-2" />
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-background rounded-xl p-3 border border-border">
                        <span className="text-xs text-muted-foreground font-medium block">Healthy Range Min</span>
                        <b className="text-base text-foreground mt-1 block">{bmiResult.minWeight} kg</b>
                      </div>
                      <div className="bg-background rounded-xl p-3 border border-border">
                        <span className="text-xs text-muted-foreground font-medium block">Healthy Range Max</span>
                        <b className="text-base text-foreground mt-1 block">{bmiResult.maxWeight} kg</b>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground text-center italic flex items-center justify-center gap-1">
                      <Info className="h-3 w-3 shrink-0" /> BMI does not account for muscle mass vs. fat composition.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Heart Rate Tab */}
            {activeTab === "heart" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full p-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Resting Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={restingHR}
                    onChange={(e) => setRestingHR(e.target.value)}
                    placeholder="e.g. 70"
                    className="w-full p-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  onClick={calculateHeartRate}
                  className="w-full py-3.5 rounded-xl bg-hero-gradient text-primary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <Heart className="h-4 w-4" /> Calculate Training Zones
                </button>

                {hrResult && (
                  <div className="mt-6 border border-border rounded-2xl p-5 bg-secondary/40 space-y-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Estimated Max Heart Rate</p>
                      <h3 className="text-3xl font-extrabold text-primary mt-1">{hrResult.maxHR} bpm</h3>
                    </div>
                    
                    <div className="h-px bg-border my-2" />

                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Your Cardio Training Zones</p>
                      {hrResult.zones.map((zone, idx) => (
                        <div key={idx} className="bg-background rounded-xl p-3.5 border border-border">
                          <div className="flex justify-between items-baseline gap-2 mb-1 flex-wrap">
                            <span className="font-bold text-sm text-foreground">{zone.name}</span>
                            <span className="text-xs font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">{zone.range}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{zone.purpose}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Blood Pressure Tab */}
            {activeTab === "bp" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Systolic (mmHg)</label>
                    <input
                      type="number"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      placeholder="e.g. 120"
                      className="w-full p-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Diastolic (mmHg)</label>
                    <input
                      type="number"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      placeholder="e.g. 80"
                      className="w-full p-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <button
                  onClick={calculateBP}
                  className="w-full py-3.5 rounded-xl bg-hero-gradient text-primary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <Shield className="h-4 w-4" /> Analyze Blood Pressure
                </button>

                {bpResult && (
                  <div className="mt-6 border border-border rounded-2xl p-5 bg-secondary/40 space-y-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Analysis Results</p>
                      <div className={`mt-2 inline-block px-4 py-2 rounded-xl border text-base font-bold ${bpResult.color}`}>
                        {bpResult.category}
                      </div>
                    </div>
                    
                    <div className="h-px bg-border my-2" />

                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-background rounded-xl p-3.5 border border-border">
                        <span className="text-xs text-muted-foreground font-medium block">Mean Arterial Pressure (MAP)</span>
                        <b className="text-lg text-foreground mt-1 block">{bpResult.map} mmHg</b>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          MAP is the average arterial pressure during a single cardiac cycle. A normal MAP is typically between 70 and 100 mmHg.
                        </p>
                      </div>
                      
                      <div className="bg-background rounded-xl p-4 border border-border border-l-4 border-l-primary">
                        <span className="text-xs text-primary font-bold uppercase tracking-wider block">Clinical Advice</span>
                        <p className="text-sm text-foreground mt-1.5 leading-relaxed">{bpResult.advice}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vitals;
