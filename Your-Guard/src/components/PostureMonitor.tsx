import { useEffect, useRef } from "react";
import { usePostureDetection, PostureStatus } from "@/hooks/usePostureDetection";
import { Camera, CameraOff, AlertTriangle, CheckCircle, User, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const statusConfig: Record<PostureStatus, { label: string; icon: typeof CheckCircle; className: string }> = {
  good: { label: "Great Posture!", icon: CheckCircle, className: "text-success" },
  slouching: { label: "Slouching Detected!", icon: AlertTriangle, className: "text-destructive" },
  initializing: { label: "Initializing...", icon: Camera, className: "text-muted-foreground" },
  "no-person": { label: "No person detected", icon: User, className: "text-warning" },
};

export function PostureMonitor() {
  const { videoRef, canvasRef, posture, isRunning, isCalibrated, cameraError, start, stop, calibrate } =
    usePostureDetection();
  const alertAudioRef = useRef<AudioContext | null>(null);
  const lastAlertRef = useRef(0);

  // Slouch alert sound
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
              <Crosshair className="h-4 w-4" />
              Calibrate
            </Button>
          )}
          <Button
            size="sm"
            variant={isRunning ? "destructive" : "default"}
            onClick={isRunning ? stop : start}
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
              <p className="text-muted-foreground text-sm">Click Start to begin monitoring</p>
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
            Sit up straight, then click <strong>Calibrate</strong> to set your baseline posture
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
