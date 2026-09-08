import { Card } from "@/components/ui/card";
import { Activity, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { PostureStatus } from "@/hooks/usePostureDetection";
import { useEffect, useRef, useState } from "react";

interface Props {
  status: PostureStatus;
  isRunning: boolean;
}

export function PostureStats({ status, isRunning }: Props) {
  const [stats, setStats] = useState({
    totalSeconds: 0,
    goodSeconds: 0,
    slouchCount: 0,
  });
  const wasSlouchingRef = useRef(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setStats((prev) => {
        const newStats = { ...prev, totalSeconds: prev.totalSeconds + 1 };
        if (status === "good") newStats.goodSeconds++;
        if (status === "slouching" && !wasSlouchingRef.current) {
          newStats.slouchCount++;
        }
        wasSlouchingRef.current = status === "slouching";
        return newStats;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, status]);

  const goodPercent = stats.totalSeconds > 0 ? Math.round((stats.goodSeconds / stats.totalSeconds) * 100) : 0;
  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  };

  const items = [
    { icon: Clock, label: "Session", value: formatDuration(stats.totalSeconds), color: "text-primary" },
    { icon: TrendingUp, label: "Good Posture", value: `${goodPercent}%`, color: "text-success" },
    { icon: AlertTriangle, label: "Slouch Alerts", value: `${stats.slouchCount}`, color: "text-destructive" },
    { icon: Activity, label: "Score", value: goodPercent >= 80 ? "A" : goodPercent >= 60 ? "B" : goodPercent >= 40 ? "C" : "D", color: "text-accent" },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">Session Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        {items.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="text-center p-3 rounded-lg bg-muted/50">
            <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
            <p className="text-lg font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
