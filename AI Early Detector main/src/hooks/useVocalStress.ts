import { useState, useEffect, useRef } from "react";

export const useVocalStress = (isListening: boolean) => {
  const [vocalStress, setVocalStress] = useState(false);
  const [vocalStressScore, setVocalStressScore] = useState(0);
  const isListeningRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    isListeningRef.current = isListening;

    if (isListening) {
      setVocalStress(false);
      
      let stream: MediaStream | null = null;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const startAnalysis = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const ctx = new AudioCtx();
          audioCtxRef.current = ctx;

          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 1024;
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          let totalVariance = 0;
          let count = 0;
          let lastVal = 0;

          const analyze = () => {
            if (!isListeningRef.current) {
              const avgStress = totalVariance / (count || 1);
              setVocalStress(avgStress > 12);
              setVocalStressScore(0);
              
              ctx.close();
              if (stream) {
                stream.getTracks().forEach((track) => track.stop());
              }
              return;
            }

            analyser.getByteTimeDomainData(dataArray);

            let sumSq = 0;
            for (let i = 0; i < bufferLength; i++) {
              const val = (dataArray[i] - 128) / 128;
              sumSq += val * val;
            }
            const rms = Math.sqrt(sumSq / bufferLength);

            if (count > 0) {
              totalVariance += Math.abs(rms - lastVal) * 100;
            }
            lastVal = rms;
            count++;

            const runningAvg = count > 0 ? totalVariance / count : 0;
            const score = Math.min(100, Math.round(runningAvg * 5));
            setVocalStressScore(score);

            requestAnimationFrame(analyze);
          };

          requestAnimationFrame(analyze);
        } catch (err) {
          console.error("Vocal stress analysis failed to initialize", err);
        }
      };

      startAnalysis();

      return () => {
        if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
          audioCtxRef.current.close();
        }
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      };
    }
  }, [isListening]);

  return { vocalStress, setVocalStress, vocalStressScore };
};
