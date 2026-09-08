import { useBreakTimer } from "@/hooks/useBreakTimer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Play, Square, SkipForward, Coffee } from "lucide-react";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const presets = [15, 25, 45, 60];

export function BreakTimer() {
  const timer = useBreakTimer();

  const progress = timer.isBreakTime
    ? ((timer.breakDurationMinutes * 60 - timer.remainingSeconds) / (timer.breakDurationMinutes * 60)) * 100
    : ((timer.intervalMinutes * 60 - timer.remainingSeconds) / (timer.intervalMinutes * 60)) * 100;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        {timer.isBreakTime ? (
          <Coffee className="h-5 w-5 text-success" />
        ) : (
          <Timer className="h-5 w-5 text-primary" />
        )}
        <h3 className="font-semibold text-foreground">
          {timer.isBreakTime ? "Break Time!" : "Break Timer"}
        </h3>
      </div>

      <div className="relative flex items-center justify-center mb-6">
        <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" className="stroke-muted" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            className={timer.isBreakTime ? "stroke-success" : "stroke-primary"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 54}`}
            strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute text-center">
          <span className="text-3xl font-bold text-foreground font-mono">
            {formatTime(timer.remainingSeconds)}
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            {timer.isBreakTime ? "Stretch & relax" : "Until break"}
          </p>
        </div>
      </div>

      <div className="flex gap-2 justify-center mb-4">
        {!timer.isActive ? (
          <Button onClick={timer.startTimer} className="gap-1">
            <Play className="h-4 w-4" /> Start
          </Button>
        ) : (
          <Button onClick={timer.stopTimer} variant="outline" className="gap-1">
            <Square className="h-4 w-4" /> Reset
          </Button>
        )}
        {timer.isBreakTime && (
          <Button onClick={timer.skipBreak} variant="secondary" className="gap-1">
            <SkipForward className="h-4 w-4" /> Skip Break
          </Button>
        )}
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Work interval</p>
        <div className="flex gap-1.5">
          {presets.map((m) => (
            <Button
              key={m}
              size="sm"
              variant={timer.intervalMinutes === m ? "default" : "outline"}
              onClick={() => timer.setInterval(m)}
              className="text-xs flex-1"
            >
              {m}m
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
