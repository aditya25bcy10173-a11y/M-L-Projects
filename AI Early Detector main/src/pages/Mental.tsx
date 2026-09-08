import { useState, useEffect } from "react";
import { ArrowLeft, BrainCircuit, Heart, Play, Pause, RefreshCw, Smile, SmilePlus } from "lucide-react";
import { Link } from "react-router-dom";
import ParticlesBackground from "@/components/ParticlesBackground";
import { toast } from "sonner";

interface MoodEntry {
  date: string;
  mood: string;
  note: string;
}

const Mental = () => {
  // Stress Assessment state
  const [stressAnswers, setStressAnswers] = useState<Record<number, number>>({});
  const [stressScore, setStressScore] = useState<number | null>(null);

  // Guided Breathing state
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale" | "idle">("idle");
  const [breathSeconds, setBreathSeconds] = useState(4);

  // Ambient sound state
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSound, setSelectedSound] = useState("Zen Forest");

  // Mood Journal state
  const [mood, setMood] = useState("");
  const [note, setNote] = useState("");
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);

  // Load mood logs
  useEffect(() => {
    const cached = localStorage.getItem("adhira_mood_logs");
    if (cached) {
      try {
        setMoodHistory(JSON.parse(cached));
      } catch (e) {
        localStorage.removeItem("adhira_mood_logs");
      }
    }
  }, []);

  // Guided Breathing Loop Timer
  useEffect(() => {
    if (breathPhase === "idle") return;
    const timer = setInterval(() => {
      setBreathSeconds((prev) => {
        if (prev <= 1) {
          if (breathPhase === "inhale") {
            setBreathPhase("hold");
            return 4; // hold for 4s
          } else if (breathPhase === "hold") {
            setBreathPhase("exhale");
            return 4; // exhale for 4s
          } else {
            setBreathPhase("inhale");
            return 4; // inhale for 4s
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [breathPhase]);

  const startBreathing = () => {
    setBreathPhase("inhale");
    setBreathSeconds(4);
    toast.success("Guided breathing session started 🧘");
  };

  const stopBreathing = () => {
    setBreathPhase("idle");
    toast.info("Guided breathing session stopped");
  };

  // Soundscape
  const toggleSound = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      toast.success(`Playing ambient track: ${selectedSound} 🎵`);
    }
  };

  // GAD stress quiz config
  const questions = [
    "Feeling nervous, anxious, or on edge?",
    "Not being able to stop or control worrying?",
    "Worrying too much about different things?",
    "Trouble relaxing or winding down?",
    "Being so restless that it is hard to sit still?"
  ];

  const calculateStress = () => {
    if (Object.keys(stressAnswers).length < questions.length) {
      toast.error("Please answer all 5 questions before submitting.");
      return;
    }
    const score = Object.values(stressAnswers).reduce((sum, val) => sum + val, 0);
    setStressScore(score);
    toast.success("Stress Assessment complete!");
  };

  const resetStress = () => {
    setStressAnswers({});
    setStressScore(null);
  };

  // Mood Save
  const handleSaveMood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood) {
      toast.error("Please select a mood emoji.");
      return;
    }
    const newEntry: MoodEntry = {
      date: new Date().toLocaleDateString(),
      mood,
      note
    };
    const updated = [newEntry, ...moodHistory].slice(0, 10); // keep last 10 entries
    setMoodHistory(updated);
    localStorage.setItem("adhira_mood_logs", JSON.stringify(updated));
    setMood("");
    setNote("");
    toast.success("Mood and gratitude log saved! 💖");
  };

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
            🧠 Mental Wellness Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Relax with breathing timers, analyze your stress levels, and log daily positive highlights.
          </p>
        </div>

        {/* Top Split Sections */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Guided Breathing Panel */}
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-xl flex flex-col items-center justify-between min-h-[400px]">
            <div className="text-center w-full">
              <h2 className="text-lg font-bold text-foreground flex items-center justify-center gap-2 mb-1">
                🧘 Box Breathing Trainer
              </h2>
              <p className="text-xs text-muted-foreground">Synchronize breathing to calm your nervous system</p>
            </div>

            {/* Breathing Animation Circle */}
            <div className="my-8 relative flex items-center justify-center w-56 h-56">
              {/* Outer wave ring */}
              <div 
                className={`absolute inset-0 rounded-full bg-primary/5 border border-primary/20 transition-all duration-1000 ${
                  breathPhase === "inhale" ? "scale-110 opacity-100" 
                  : breathPhase === "hold" ? "scale-110 opacity-70" 
                  : breathPhase === "exhale" ? "scale-75 opacity-40" 
                  : "scale-90 opacity-20"
                }`} 
              />
              
              {/* Main Breathing Bubble */}
              <div 
                className={`flex flex-col items-center justify-center w-40 h-40 rounded-full text-white font-extrabold text-lg transition-all duration-1000 shadow-2xl ${
                  breathPhase === "inhale" ? "bg-gradient-to-tr from-sky-400 to-primary scale-105" 
                  : breathPhase === "hold" ? "bg-gradient-to-tr from-amber-400 to-orange-400 scale-105 animate-pulse" 
                  : breathPhase === "exhale" ? "bg-gradient-to-tr from-indigo-500 to-purple-500 scale-90" 
                  : "bg-secondary border border-border text-foreground scale-95"
                }`}
              >
                {breathPhase === "idle" ? (
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Ready</span>
                ) : (
                  <div className="text-center">
                    <div className="uppercase tracking-widest text-xs font-bold opacity-80">{breathPhase}</div>
                    <div className="text-3xl font-black mt-1">{breathSeconds}s</div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="w-full flex gap-3">
              {breathPhase === "idle" ? (
                <button onClick={startBreathing} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl text-sm hover:opacity-90 active:scale-95 transition cursor-pointer">
                  Start Sessions
                </button>
              ) : (
                <button onClick={stopBreathing} className="w-full py-3 bg-secondary hover:bg-muted text-foreground font-bold rounded-xl text-sm transition cursor-pointer">
                  Stop Session
                </button>
              )}
            </div>
          </div>

          {/* Stress Assessment Panel */}
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
                📋 GAD-5 Stress & Anxiety Quiz
              </h2>
              <p className="text-xs text-muted-foreground mb-4">Complete a self-report clinical evaluation</p>

              {stressScore === null ? (
                <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
                  {questions.map((q, idx) => (
                    <div key={idx} className="border-b border-border/60 pb-3">
                      <div className="text-xs font-bold text-foreground mb-2">{idx + 1}. {q}</div>
                      <div className="flex gap-1">
                        {["Not at all", "Several days", "More than half", "Nearly every day"].map((opt, oIdx) => (
                          <button
                            type="button"
                            key={oIdx}
                            onClick={() => setStressAnswers(prev => ({ ...prev, [idx]: oIdx }))}
                            className={`flex-1 py-1 px-1 rounded-md text-[10px] font-semibold border transition cursor-pointer ${
                              stressAnswers[idx] === oIdx 
                                ? "bg-primary border-primary text-primary-foreground font-bold" 
                                : "bg-secondary border-border text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-secondary/15 border border-border/60 rounded-xl">
                  <BrainCircuit className="h-12 w-12 text-primary mx-auto mb-3" />
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Assessment Score</div>
                  <div className="text-4xl font-black text-foreground mt-1">{stressScore} <span className="text-xs text-muted-foreground">/ 15</span></div>
                  
                  <div className="mt-4 font-bold text-sm text-foreground">
                    {stressScore >= 10 ? "⚠️ High Anxiety Level" 
                     : stressScore >= 6 ? "⚡ Moderate Stress Level" 
                     : "🍃 Low / Healthy Stress Level"}
                  </div>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto mt-2 px-6">
                    {stressScore >= 10 ? "We recommend engaging in relaxation therapy, guided breathing, and consulting a healthcare professional." 
                     : stressScore >= 6 ? "Try taking breaks, listening to calming sounds, and logging logs in the gratitude journal."
                     : "Great job! Keep practicing mindfulness to maintain a healthy emotional state."}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              {stressScore === null ? (
                <button onClick={calculateStress} className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition cursor-pointer">
                  Submit Quiz
                </button>
              ) : (
                <button onClick={resetStress} className="w-full py-2.5 bg-secondary hover:bg-muted text-muted-foreground font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5" /> Reset Quiz
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lower Soundscape and Journal Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Ambient Sounds Card */}
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
                🎵 Calming Ambient Player
              </h2>
              <p className="text-xs text-muted-foreground mb-4">Listen to soundscapes designed for focus and relaxation</p>

              {/* Sound Selector */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {["Zen Forest", "Soft Rain", "Tibetan Bowls", "Ocean Waves"].map((sound) => (
                  <button
                    key={sound}
                    onClick={() => {
                      setSelectedSound(sound);
                      if (isPlaying) {
                        toast.success(`Switched to: ${sound} 🎵`);
                      }
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition text-left cursor-pointer ${
                      selectedSound === sound
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "bg-secondary/45 border-border hover:bg-secondary text-foreground"
                    }`}
                  >
                    {sound === "Zen Forest" ? "🌲" : sound === "Soft Rain" ? "🌧️" : sound === "Tibetan Bowls" ? "🧘" : "🌊"} {sound}
                  </button>
                ))}
              </div>

              {/* Player Widget */}
              <div className="flex items-center justify-between p-4 bg-secondary/25 border border-border/50 rounded-xl mb-4">
                <div className="flex items-center gap-3">
                  <div className={`flex gap-1 h-5 items-end ${isPlaying ? "opacity-100" : "opacity-35"}`}>
                    <span className={`w-1 bg-primary rounded-full ${isPlaying ? "animate-[bounce_0.8s_infinite]" : "h-2"}`} style={{ animationDelay: "0ms" }} />
                    <span className={`w-1 bg-primary rounded-full ${isPlaying ? "animate-[bounce_1.2s_infinite]" : "h-4"}`} style={{ animationDelay: "150ms" }} />
                    <span className={`w-1 bg-primary rounded-full ${isPlaying ? "animate-[bounce_0.6s_infinite]" : "h-1"}`} style={{ animationDelay: "300ms" }} />
                    <span className={`w-1 bg-primary rounded-full ${isPlaying ? "animate-[bounce_1s_infinite]" : "h-3"}`} style={{ animationDelay: "450ms" }} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">{selectedSound}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{isPlaying ? "Now Playing" : "Paused"}</div>
                  </div>
                </div>

                <button onClick={toggleSound} className="p-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-full transition shadow-md cursor-pointer">
                  {isPlaying ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5 fill-primary-foreground" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mood Tracker Card */}
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
                🌸 Mood & Gratitude Journal
              </h2>
              <p className="text-xs text-muted-foreground mb-4">Log current mood and daily highlights</p>

              <form onSubmit={handleSaveMood} className="space-y-4">
                {/* Emoji buttons */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">How are you feeling today?</label>
                  <div className="flex gap-2">
                    {["😊 Happy", "😌 Calm", "⚡ Stressed", "😴 Tired", "😢 Sad"].map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setMood(m)}
                        className={`flex-1 py-2 rounded-xl text-xs border font-bold transition cursor-pointer ${
                          mood === m
                            ? "bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400 font-extrabold"
                            : "bg-secondary border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">What are you grateful for today?</label>
                  <textarea
                    placeholder="e.g. Grateful for nice morning coffee, completing my steps target..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full min-h-16 p-2 rounded-lg bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-rose-500 placeholder-muted-foreground/50"
                  />
                </div>

                <button type="submit" className="w-full py-2 bg-rose-500 text-white font-bold rounded-xl text-xs hover:bg-rose-600 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1">
                  <SmilePlus className="h-4 w-4" /> Save Journal Entry
                </button>
              </form>
            </div>

            {/* History logs */}
            {moodHistory.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/60">
                <div className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2">Recent Logs</div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {moodHistory.map((h, i) => (
                    <div key={i} className="shrink-0 p-2.5 rounded-xl bg-secondary/15 border border-border/60 text-left min-w-[140px] max-w-[180px]">
                      <div className="flex justify-between items-center text-[9px] font-semibold text-muted-foreground">
                        <span>{h.date}</span>
                        <span className="font-bold text-rose-500">{h.mood.split(" ")[0]}</span>
                      </div>
                      <p className="text-[10px] text-foreground mt-1 truncate">{h.note || "Logged mood only"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mental;
