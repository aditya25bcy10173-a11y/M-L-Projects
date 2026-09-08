import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DailyPostureLog {
  date: string;
  totalSeconds: number;
  goodSeconds: number;
  slouchCount: number;
  sessions: number;
}

export function usePostureHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<DailyPostureLog[]>([]);

  // Load from DB
  useEffect(() => {
    if (!user) { setHistory([]); return; }

    const load = async () => {
      const { data } = await supabase
        .from("posture_history")
        .select("date, total_seconds, good_seconds, slouch_count, sessions")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(30);

      if (data) {
        setHistory(data.map((r) => ({
          date: r.date,
          totalSeconds: r.total_seconds,
          goodSeconds: r.good_seconds,
          slouchCount: r.slouch_count,
          sessions: r.sessions,
        })));
      }
    };
    load();
  }, [user]);

  const logSession = useCallback(async (totalSeconds: number, goodSeconds: number, slouchCount: number) => {
    if (totalSeconds === 0 || !user) return;
    const today = new Date().toISOString().split("T")[0];

    // Upsert into DB
    const { data: existing } = await supabase
      .from("posture_history")
      .select("id, total_seconds, good_seconds, slouch_count, sessions")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

    if (existing) {
      await supabase.from("posture_history").update({
        total_seconds: existing.total_seconds + totalSeconds,
        good_seconds: existing.good_seconds + goodSeconds,
        slouch_count: existing.slouch_count + slouchCount,
        sessions: existing.sessions + 1,
      }).eq("id", existing.id);
    } else {
      await supabase.from("posture_history").insert({
        user_id: user.id,
        date: today,
        total_seconds: totalSeconds,
        good_seconds: goodSeconds,
        slouch_count: slouchCount,
        sessions: 1,
      });
    }

    // Refresh
    const { data } = await supabase
      .from("posture_history")
      .select("date, total_seconds, good_seconds, slouch_count, sessions")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(30);

    if (data) {
      setHistory(data.map((r) => ({
        date: r.date,
        totalSeconds: r.total_seconds,
        goodSeconds: r.good_seconds,
        slouchCount: r.slouch_count,
        sessions: r.sessions,
      })));
    }
  }, [user]);

  const clearHistory = useCallback(async () => {
    if (!user) return;
    await supabase.from("posture_history").delete().eq("user_id", user.id);
    setHistory([]);
  }, [user]);

  return { history, logSession, clearHistory };
}
