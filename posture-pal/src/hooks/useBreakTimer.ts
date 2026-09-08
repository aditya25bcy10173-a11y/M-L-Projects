import { useState, useEffect, useCallback, useRef } from "react";

interface BreakTimerState {
  isActive: boolean;
  remainingSeconds: number;
  isBreakTime: boolean;
  intervalMinutes: number;
  breakDurationMinutes: number;
}

export function useBreakTimer() {
  const [state, setState] = useState<BreakTimerState>({
    isActive: false,
    remainingSeconds: 25 * 60,
    isBreakTime: false,
    intervalMinutes: 25,
    breakDurationMinutes: 5,
  });
  const intervalRef = useRef<number>(0);

  const tick = useCallback(() => {
    setState((prev) => {
      if (prev.remainingSeconds <= 1) {
        if (!prev.isBreakTime) {
          // Play notification sound
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 528;
            osc.type = "sine";
            gain.gain.value = 0.3;
            osc.start();
            setTimeout(() => { osc.stop(); ctx.close(); }, 800);
          } catch { /* no audio */ }

          return {
            ...prev,
            isBreakTime: true,
            remainingSeconds: prev.breakDurationMinutes * 60,
          };
        } else {
          return {
            ...prev,
            isBreakTime: false,
            remainingSeconds: prev.intervalMinutes * 60,
          };
        }
      }
      return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
    });
  }, []);

  useEffect(() => {
    if (state.isActive) {
      intervalRef.current = window.setInterval(tick, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [state.isActive, tick]);

  const startTimer = useCallback(() => {
    setState((prev) => ({ ...prev, isActive: true }));
  }, []);

  const stopTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: false,
      isBreakTime: false,
      remainingSeconds: prev.intervalMinutes * 60,
    }));
  }, []);

  const skipBreak = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isBreakTime: false,
      remainingSeconds: prev.intervalMinutes * 60,
    }));
  }, []);

  const setInterval_ = useCallback((minutes: number) => {
    setState((prev) => ({
      ...prev,
      intervalMinutes: minutes,
      remainingSeconds: prev.isBreakTime ? prev.remainingSeconds : minutes * 60,
    }));
  }, []);

  const setBreakDuration = useCallback((minutes: number) => {
    setState((prev) => ({
      ...prev,
      breakDurationMinutes: minutes,
      remainingSeconds: prev.isBreakTime ? minutes * 60 : prev.remainingSeconds,
    }));
  }, []);

  return { ...state, startTimer, stopTimer, skipBreak, setInterval: setInterval_, setBreakDuration };
}
