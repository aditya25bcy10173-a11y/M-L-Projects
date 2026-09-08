import { useState } from "react";
import { ArrowLeft, BookOpen, Lightbulb, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import ParticlesBackground from "@/components/ParticlesBackground";
import { toast } from "sonner";

interface QuizQuestion {
  q: string;
  opts: string[];
  correct: number;
  exp: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    q: "Which type of cholesterol is considered 'good' cholesterol?",
    opts: ["LDL (Low-Density Lipoprotein)", "HDL (High-Density Lipoprotein)", "VLDL (Very Low-Density Lipoprotein)", "Triglycerides"],
    correct: 1,
    exp: "HDL helps remove other forms of cholesterol from your bloodstream. High levels of HDL are associated with lower heart disease risks."
  },
  {
    q: "What is the primary cause of Type 1 Diabetes?",
    opts: ["Eating too much sugar", "Sedentary lifestyle", "Autoimmune destruction of insulin-producing pancreatic cells", "Chronic obesity"],
    correct: 2,
    exp: "Type 1 Diabetes is an autoimmune condition where the body attacks insulin-producing beta cells in the pancreas. It is not caused by sugar intake or lifestyle."
  },
  {
    q: "Which vitamin deficiency is primarily linked to joint stiffness and bone weakness?",
    opts: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin B12"],
    correct: 2,
    exp: "Vitamin D is crucial for calcium absorption and bone health. Severe deficiency leads to bone pain, muscle weakness, and joint stiffness."
  }
];

const Education = () => {
  // Myth vs Fact states
  const [flippedMyths, setFlippedMyths] = useState<Record<number, boolean>>({});

  // Quiz states
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const toggleMyth = (id: number) => {
    setFlippedMyths(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNextQuestion = () => {
    if (selectedOpt === quizQuestions[quizIdx].correct) {
      setScore(score + 1);
    }
    
    if (quizIdx + 1 < quizQuestions.length) {
      setQuizIdx(quizIdx + 1);
      setSelectedOpt(null);
      setSubmitted(false);
    } else {
      // Account for the last question's score immediately
      const finalScore = score + (selectedOpt === quizQuestions[quizIdx].correct ? 1 : 0);
      setScore(finalScore);
      setQuizComplete(true);
      toast.success(`Quiz complete! You scored ${finalScore}/${quizQuestions.length}`);
    }
  };

  const resetQuiz = () => {
    setQuizIdx(0);
    setSelectedOpt(null);
    setSubmitted(false);
    setScore(0);
    setQuizComplete(false);
  };

  const myths = [
    {
      myth: "Drinking water during or immediately after meals dilutes stomach acid and hinders digestion.",
      fact: "Fact: Water does not interfere with stomach juices or digestion. It actually aids digestion by helping break down food particles so nutrients can be absorbed."
    },
    {
      myth: "Cracking your finger knuckles causes arthritis later in life.",
      fact: "Fact: Multiple clinical trials have shown knuckle cracking does not cause arthritis. The popping sound is caused by gas bubbles bursting in the synovial fluid."
    },
    {
      myth: "Organic food is always significantly more nutritious than conventionally grown food.",
      fact: "Fact: Extensive reviews show no consistent, clinical difference in vitamin or nutrient content between organic and conventional produce, though organic has lower synthetic pesticide residues."
    }
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
            📚 Educational Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Bust common medical myths, test your wellness knowledge, and read curated daily health tips.
          </p>
        </div>

        {/* Top split section */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Myth vs Fact Panel */}
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
                💡 Medical Myth vs Fact
              </h2>
              <p className="text-xs text-muted-foreground mb-4">Click cards to reveal the peer-reviewed medical truth</p>

              <div className="space-y-4">
                {myths.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleMyth(idx)}
                    className="p-4 rounded-xl border border-border/60 bg-secondary/15 hover:bg-secondary/25 transition cursor-pointer relative overflow-hidden min-h-24 flex flex-col justify-center"
                  >
                    {!flippedMyths[idx] ? (
                      <div>
                        <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">Myth</span>
                        <p className="text-xs font-bold text-foreground mt-2 leading-relaxed">
                          {item.myth}
                        </p>
                      </div>
                    ) : (
                      <div className="animate-in fade-in duration-300">
                        <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Fact Check</span>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-medium">
                          {item.fact}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Health Trivia Quiz Game */}
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
                🧠 Health & Wellness Quiz
              </h2>
              <p className="text-xs text-muted-foreground mb-4">Challenge your healthcare knowledge and score</p>

              {!quizComplete ? (
                <div>
                  <div className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-1">
                    Question {quizIdx + 1} of {quizQuestions.length}
                  </div>
                  <div className="text-xs font-bold text-foreground mb-4 leading-relaxed">
                    {quizQuestions[quizIdx].q}
                  </div>

                  <div className="space-y-2">
                    {quizQuestions[quizIdx].opts.map((opt, oIdx) => (
                      <button
                        type="button"
                        key={oIdx}
                        disabled={submitted}
                        onClick={() => setSelectedOpt(oIdx)}
                        className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition ${
                          selectedOpt === oIdx
                            ? "bg-primary/15 border-primary text-primary"
                            : "bg-secondary border-border hover:bg-secondary text-foreground"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {submitted && (
                    <div className="mt-4 p-3 bg-secondary/20 border border-border/60 rounded-xl">
                      <div className="text-xs font-bold flex items-center gap-1">
                        {selectedOpt === quizQuestions[quizIdx].correct ? (
                          <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Correct Answer!</span>
                        ) : (
                          <span className="text-destructive flex items-center gap-1"><XCircle className="h-4 w-4" /> Incorrect</span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                        {quizQuestions[quizIdx].exp}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center bg-secondary/15 border border-border/60 rounded-xl">
                  <BookOpen className="h-12 w-12 text-primary mx-auto mb-3" />
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Quiz Completed!</div>
                  <div className="text-4xl font-black text-foreground mt-1">{score} <span className="text-xs text-muted-foreground">/ {quizQuestions.length}</span></div>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto mt-2 px-6">
                    {score === quizQuestions.length 
                      ? "Perfect! You have outstanding health and wellness knowledge 🌟" 
                      : "Good job! Keep reading our educational tips to score 100% next time."}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-2">
              {!quizComplete ? (
                !submitted ? (
                  <button
                    disabled={selectedOpt === null}
                    onClick={() => setSubmitted(true)}
                    className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition cursor-pointer"
                  >
                    Next Question
                  </button>
                )
              ) : (
                <button onClick={resetQuiz} className="w-full py-2.5 bg-secondary hover:bg-muted text-muted-foreground font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5" /> Restart Quiz
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Daily health tips & news column */}
        <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-xl">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
            📰 Curated Daily Wellness Articles & Tips
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <span className="text-[9px] font-extrabold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Nutrition</span>
              <h3 className="text-xs font-bold text-foreground hover:underline cursor-pointer">The Impact of Intermittent Fasting on Blood Sugar Stability</h3>
              <p className="text-[10px] leading-relaxed text-muted-foreground">Recent clinical updates indicate that structured eating windows help regulate baseline insulin resistance and improve overall cellular repair cycles.</p>
            </div>
            
            <div className="space-y-2">
              <span className="text-[9px] font-extrabold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Fitness</span>
              <h3 className="text-xs font-bold text-foreground hover:underline cursor-pointer">Why 10k Steps Matters: Cardiovascular Elasticity</h3>
              <p className="text-[10px] leading-relaxed text-muted-foreground">Walking actively dilates capillary vascular systems, boosting oxygen flow, lowering diastolic blood pressure, and raising core sleep cycles.</p>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-extrabold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Sleep Science</span>
              <h3 className="text-xs font-bold text-foreground hover:underline cursor-pointer">Understanding REM Sleep Cycles and Mental Fatigue</h3>
              <p className="text-[10px] leading-relaxed text-muted-foreground">Deep REM sleep stages are crucial for cognitive consolidation, protein synthesis inside brain regions, and reducing daily cortisol-induced anxiety.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;
