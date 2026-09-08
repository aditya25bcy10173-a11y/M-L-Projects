import { useNavigate } from "react-router-dom";
import { Shield, Eye, Zap, Clock, ChevronRight, Activity, Cpu, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
  const navigate = useNavigate();

  const handleEnter = () => {
    // Navigate directly to the monitor page - no sign-in required!
    navigate("/monitor");
  };

  return (
    <div className="min-h-screen bg-[#06060a] text-foreground flex flex-col relative overflow-hidden selection:bg-primary/30 selection:text-white">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_70%)] animate-pulse-glow" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(168,85,247,0.05)_0%,transparent_70%)]" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/[0.04] backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white">
              Your<span className="text-primary">Guard</span>
            </span>
          </div>
          <span className="ml-3 hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI Active
          </span>
        </div>

        <Button
          onClick={handleEnter}
          variant="outline"
          size="sm"
          className="rounded-full border-white/10 hover:bg-white/5 text-xs text-white"
        >
          Launch Monitor
        </Button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-24 flex flex-col md:flex-row items-center gap-16 relative z-10">
        {/* Left Side Info */}
        <div className="flex-1 space-y-8 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 border border-primary/20 text-primary-foreground animate-float">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Posture Sentinel
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] max-w-xl mx-auto md:mx-0">
            Say goodbye to slouching. <span className="text-primary bg-clip-text">Forever.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto md:mx-0 leading-relaxed">
            YourGuard runs computer vision entirely in your browser to monitor your shoulder & neck alignment. 
            No video leaves your device. 100% private, instant alerts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <Button
              size="lg"
              onClick={handleEnter}
              className="w-full sm:w-auto text-base px-8 py-6 rounded-full font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all gap-2"
            >
              Start Monitoring Now <ChevronRight className="h-5 w-5" />
            </Button>
            <a
              href="#how-it-works"
              className="text-sm font-semibold hover:text-white text-muted-foreground transition-colors py-2 px-4"
            >
              How it works &rarr;
            </a>
          </div>
        </div>

        {/* Right Side Visual Mockup */}
        <div className="flex-1 w-full max-w-md md:max-w-none">
          <div className="relative rounded-2xl overflow-hidden glass-card shadow-2xl border border-white/[0.08] p-3 aspect-video group">
            {/* Header window control dots */}
            <div className="flex items-center gap-1.5 mb-3 px-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-[10px] text-muted-foreground/60 ml-2 font-mono">posture_scanner.ai</span>
            </div>

            {/* Generated Image inside mock browser */}
            <div className="relative rounded-xl overflow-hidden bg-black/60 w-full h-[220px] sm:h-[280px]">
              <img
                src="/posture_hero_illustration.png"
                alt="Posture Pal AI Illustration"
                className="w-full h-full object-cover opacity-80 group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              
              {/* Animated Scanner line */}
              <div className="scanner-line" />

              {/* HUD Overlays */}
              <div className="absolute top-4 left-4 p-2 rounded-lg bg-black/70 backdrop-blur border border-white/10 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                <Activity className="w-3 h-3 animate-pulse" />
                <span>AI CAMERA: ENABLED</span>
              </div>

              <div className="absolute bottom-4 right-4 p-2.5 rounded-lg bg-black/70 backdrop-blur border border-white/10 text-[10px] font-mono text-white/90 space-y-1">
                <div>CALIBRATION: <span className="text-primary font-bold">READY</span></div>
                <div>CONFIDENCE: <span className="text-emerald-400 font-bold">98.4%</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* How it Works Section */}
      <section id="how-it-works" className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-white/[0.04] relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Get corrected in three simple steps
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            No expensive hardware needed. If you have a webcam, you can start monitoring in under 30 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {[
            {
              step: "01",
              title: "Calibrate Alignment",
              desc: "Sit up straight with your ideal posture and click calibrate. The AI registers your baseline.",
            },
            {
              step: "02",
              title: "Real-time Tracker",
              desc: "The AI tracks key shoulder and head landmarks. Runs completely inside your web browser.",
            },
            {
              step: "03",
              title: "Get Audio alerts",
              desc: "Get an instant warning tone and flashing indicator if you slouch for more than 5 seconds.",
            },
          ].map(({ step, title, desc }, idx) => (
            <div key={title} className="p-8 rounded-2xl glass-card relative border border-white/[0.05] hover:border-primary/20 transition-colors">
              <span className="text-4xl font-extrabold text-primary/20 font-mono absolute top-4 right-6">{step}</span>
              <h3 className="text-lg font-bold text-white mb-3 mt-4">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-white/[0.04] relative z-10 bg-[linear-gradient(180deg,transparent_0%,rgba(139,92,246,0.01)_100%)]">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Engineered for physical health
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Full-featured sentinel designed to help developers, students, and workers maintain back health.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Cpu,
              title: "On-device AI Engine",
              desc: "Utilizes TensorFlow Pose Detection to track and model posture directly in the browser.",
            },
            {
              icon: Shield,
              title: "100% Privacy Lock",
              desc: "No camera stream is ever sent to servers. Everything runs entirely locally in client memory.",
            },
            {
              icon: Clock,
              title: "Active Break Timer",
              desc: "Integrated break timers to prompt stretching exercises and stand up after periods of work.",
            },
            {
              icon: Activity,
              title: "Detailed Statistics",
              desc: "Tracks your slouching frequency and logs your session statistics for long-term progress reviews.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-2xl bg-[#09090f] border border-white/[0.03] hover:border-white/[0.08] transition-all group hover:-translate-y-1">
              <div className="h-10 w-10 rounded-xl bg-white/[0.03] flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.04] py-8 text-center text-xs text-muted-foreground/60 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-bold text-white/80">YourGuard &copy; 2026</span>
          </div>
          <div>
            <span>Runs fully locally with TensorFlow.js. Privacy assured.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
