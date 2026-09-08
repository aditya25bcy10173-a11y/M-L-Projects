import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DailyPostureLog } from "@/hooks/usePostureHistory";
import { History, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  history: DailyPostureLog[];
  onClear: () => void;
}

export function PostureHistory({ history, onClear }: Props) {
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);

  const getGrade = (pct: number) =>
    pct >= 80 ? "A" : pct >= 60 ? "B" : pct >= 40 ? "C" : "D";

  const getTrend = (idx: number) => {
    if (idx >= sorted.length - 1) return null;
    const curr = sorted[idx].totalSeconds > 0 ? sorted[idx].goodSeconds / sorted[idx].totalSeconds : 0;
    const prev = sorted[idx + 1].totalSeconds > 0 ? sorted[idx + 1].goodSeconds / sorted[idx + 1].totalSeconds : 0;
    if (curr > prev + 0.05) return "up";
    if (curr < prev - 0.05) return "down";
    return "same";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">History</h3>
        </div>
        {history.length > 0 && (
          <Button size="sm" variant="ghost" onClick={onClear} className="text-destructive gap-1">
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No history yet. Start a session to begin tracking.
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sorted.map((log, idx) => {
            const pct = log.totalSeconds > 0 ? Math.round((log.goodSeconds / log.totalSeconds) * 100) : 0;
            const trend = getTrend(idx);
            const mins = Math.round(log.totalSeconds / 60);
            return (
              <div key={log.date} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="text-xs text-muted-foreground w-20">
                    {new Date(log.date + "T12:00:00").toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </div>
                  <div className="flex items-center gap-1">
                    {trend === "up" && <TrendingUp className="h-3 w-3 text-success" />}
                    {trend === "down" && <TrendingDown className="h-3 w-3 text-destructive" />}
                    {trend === "same" && <Minus className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">{mins}m</span>
                  <span className="text-muted-foreground">{log.slouchCount} slouches</span>
                  <span className={`font-bold ${pct >= 70 ? "text-success" : pct >= 40 ? "text-warning" : "text-destructive"}`}>
                    {getGrade(pct)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
