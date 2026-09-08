import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BreakTimer } from "@/components/BreakTimer";
import { PostureStats } from "@/components/PostureStats";
import { PostureHistory } from "@/components/PostureHistory";
import { PostureCoach } from "@/components/PostureCoach";
import { usePostureDetection, PostureStatus } from "@/hooks/usePostureDetection";
import { usePostureHistory } from "@/hooks/usePostureHistory";
import { Shield, Camera, CameraOff, AlertTriangle, CheckCircle, User, Crosshair, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const statusConfig: Record<PostureStatus, { label: string; icon: typeof CheckCircle; className: string }> = {
  good: { label: "Great Posture!", icon: CheckCircle, className: "text-success" },
  slouching: { label: "Slouching Detected!", icon: AlertTriangle, className: "text-destructive" },
  initializing: { label: "Initializing...", icon: Camera, className: "text-muted-foreground" },
  "no-person": { label: "No person detected", icon: User, className: "text-warning" },
};

const Index = () => {
  const detection = usePostureDetection();
  const { history, logSession, clearHistory } = usePostureHistory();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="mr-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Your<span className="text-primary">Guard</span></h1>
            <p className="text-xs text-muted-foreground">AI-powered posture monitoring</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PostureMonitor {...detection} onSessionEnd={logSession} />
            <PostureHistory history={history} onClear={clearHistory} />
          </div>
          <div className="space-y-6">
            <BreakTimer />
            <PostureStats status={detection.posture.status} isRunning={detection.isRunning} />
            <PostureCoach />
          </div>
        </div>
      </main>
    </div>
  );
};

function PostureMonitor({
  videoRef, canvasRef, posture, isRunning, isCalibrated, cameraError, start, stop, calibrate, onSessionEnd,
}: ReturnType<typeof usePostureDetection> & { onSessionEnd: (t: number, g: number, s: number) => void }) {
  const lastAlertRef = useRef(0);
  const statsRef = useRef({ totalSeconds: 0, goodSeconds: 0, slouchCount: 0 });
  const wasSlouchingRef = useRef(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      statsRef.current.totalSeconds++;
      if (posture.status === "good") statsRef.current.goodSeconds++;
      if (posture.status === "slouching" && !wasSlouchingRef.current) statsRef.current.slouchCount++;
      wasSlouchingRef.current = posture.status === "slouching";
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, posture.status]);

  const handleStop = () => {
    const s = statsRef.current;
    onSessionEnd(s.totalSeconds, s.goodSeconds, s.slouchCount);
    statsRef.current = { totalSeconds: 0, goodSeconds: 0, slouchCount: 0 };
    stop();
  };

  useEffect(() => {
    if (posture.status === "slouching" && Date.now() - lastAlertRef.current > 5000) {
      lastAlertRef.current = Date.now();
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 440;
        osc.type = "triangle";
        gain.gain.value = 0.2;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        setTimeout(() => { osc.stop(); ctx.close(); }, 600);
      } catch { /* */ }
    }
  }, [posture.status]);

  const config = statusConfig[posture.status];
  const StatusIcon = config.icon;

  return (
    <Card className="overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${config.className}`} />
          <span className={`font-semibold ${config.className}`}>{config.label}</span>
        </div>
        <div className="flex gap-2">
          {isRunning && !isCalibrated && (
            <Button size="sm" variant="outline" onClick={calibrate} className="gap-1">
              <Crosshair className="h-4 w-4" /> Calibrate
            </Button>
          )}
          <Button
            size="sm"
            variant={isRunning ? "destructive" : "default"}
            onClick={isRunning ? handleStop : start}
            className="gap-1"
          >
            {isRunning ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
            {isRunning ? "Stop" : "Start"}
          </Button>
        </div>
      </div>

      <div className="relative aspect-video bg-foreground/5">
        {cameraError ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
            <div>
              <CameraOff className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">{cameraError}</p>
            </div>
          </div>
        ) : !isRunning ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Camera className="h-16 w-16 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm">Click Start to begin posture monitoring</p>
            </div>
          </div>
        ) : null}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)", display: isRunning ? "block" : "none" }}
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ transform: "scaleX(-1)", display: isRunning ? "block" : "none" }}
        />
        {isRunning && posture.status === "slouching" && (
          <div className="absolute inset-0 border-4 border-destructive rounded-sm animate-pulse pointer-events-none" />
        )}
        {isRunning && !isCalibrated && (
          <div className="absolute bottom-0 left-0 right-0 bg-foreground/70 text-background p-2 text-center text-sm">
            Sit up straight, then click <strong>Calibrate</strong> to set your baseline
          </div>
        )}
      </div>

      {isRunning && (
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Detection Confidence</span>
            <span className="font-medium">{Math.round(posture.confidence)}%</span>
          </div>
          <Progress value={posture.confidence} className="h-2" />
        </div>
      )}
    </Card>
  );
}

export default Index;
