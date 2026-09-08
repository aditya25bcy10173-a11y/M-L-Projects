import { useRef, useState, useCallback, useEffect } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";

export type PostureStatus = "good" | "slouching" | "initializing" | "no-person";

interface PostureData {
  status: PostureStatus;
  confidence: number;
  shoulderAngle: number | null;
  headTilt: number | null;
}

export function usePostureDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const animFrameRef = useRef<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [posture, setPosture] = useState<PostureData>({
    status: "initializing",
    confidence: 0,
    shoulderAngle: null,
    headTilt: null,
  });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const baselineRef = useRef<{ noseToShoulderRatio: number } | null>(null);
  const calibratingRef = useRef(false);
  const [isCalibrated, setIsCalibrated] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraError(null);
      return true;
    } catch {
      setCameraError("Camera access denied. Please allow camera permissions.");
      return false;
    }
  }, []);

  const initDetector = useCallback(async () => {
    if (detectorRef.current) return;
    try {
      await tf.setBackend("webgl");
    } catch {
      try {
        await tf.setBackend("cpu");
      } catch {
        // ignore
      }
    }
    await tf.ready();
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
    );
    detectorRef.current = detector;
  }, []);

  const analyzePosture = useCallback(
    (keypoints: poseDetection.Keypoint[]): PostureData => {
      const getKp = (name: string) =>
        keypoints.find((k) => k.name === name && (k.score ?? 0) > 0.3);

      const nose = getKp("nose");
      const leftShoulder = getKp("left_shoulder");
      const rightShoulder = getKp("right_shoulder");
      const leftEar = getKp("left_ear");
      const rightEar = getKp("right_ear");

      if (!nose || (!leftShoulder && !rightShoulder)) {
        return { status: "no-person", confidence: 0, shoulderAngle: null, headTilt: null };
      }

      const shoulderY = leftShoulder && rightShoulder
        ? (leftShoulder.y + rightShoulder.y) / 2
        : (leftShoulder || rightShoulder)!.y;

      const shoulderX = leftShoulder && rightShoulder
        ? Math.abs(leftShoulder.y - rightShoulder.y)
        : 0;

      const earY = leftEar && rightEar
        ? (leftEar.y + rightEar.y) / 2
        : (leftEar || rightEar)?.y ?? nose.y;

      const noseToShoulderDist = shoulderY - nose.y;
      const currentRatio = noseToShoulderDist / (videoRef.current?.videoHeight || 480);

      if (!baselineRef.current) {
        return { status: "initializing", confidence: 0, shoulderAngle: shoulderX, headTilt: null };
      }

      const baselineRatio = baselineRef.current.noseToShoulderRatio;
      const deviationPercent = ((baselineRatio - currentRatio) / baselineRatio) * 100;

      const headForward = nose.y - earY;
      const isSlouching = deviationPercent > 15 || headForward > 30;

      const confidence = Math.min(
        ((keypoints.filter((k) => (k.score ?? 0) > 0.3).length / keypoints.length) * 100),
        100
      );

      return {
        status: isSlouching ? "slouching" : "good",
        confidence,
        shoulderAngle: shoulderX,
        headTilt: headForward,
      };
    },
    []
  );

  const drawPose = useCallback(
    (keypoints: poseDetection.Keypoint[], status: PostureStatus) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const color = status === "slouching" ? "#ef4444" : status === "good" ? "#22c55e" : "#eab308";

      const connections = [
        ["left_ear", "left_shoulder"],
        ["right_ear", "right_shoulder"],
        ["left_shoulder", "right_shoulder"],
        ["left_shoulder", "left_hip"],
        ["right_shoulder", "right_hip"],
      ];

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      connections.forEach(([a, b]) => {
        const kpA = keypoints.find((k) => k.name === a && (k.score ?? 0) > 0.3);
        const kpB = keypoints.find((k) => k.name === b && (k.score ?? 0) > 0.3);
        if (kpA && kpB) {
          ctx.beginPath();
          ctx.moveTo(kpA.x, kpA.y);
          ctx.lineTo(kpB.x, kpB.y);
          ctx.stroke();
        }
      });

      keypoints.forEach((kp) => {
        if ((kp.score ?? 0) > 0.3) {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }
      });
    },
    []
  );

  const detectLoop = useCallback(async () => {
    if (!detectorRef.current || !videoRef.current || !isRunning) return;

    try {
      const poses = await detectorRef.current.estimatePoses(videoRef.current);
      if (poses.length > 0) {
        const result = analyzePosture(poses[0].keypoints);
        setPosture(result);
        drawPose(poses[0].keypoints, result.status);
      } else {
        setPosture({ status: "no-person", confidence: 0, shoulderAngle: null, headTilt: null });
      }
    } catch {
      // skip frame
    }

    animFrameRef.current = requestAnimationFrame(detectLoop);
  }, [isRunning, analyzePosture, drawPose]);

  const calibrate = useCallback(async () => {
    if (!detectorRef.current || !videoRef.current || calibratingRef.current) return;
    calibratingRef.current = true;

    const samples: number[] = [];
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 200));
      try {
        const poses = await detectorRef.current.estimatePoses(videoRef.current);
        if (poses.length > 0) {
          const nose = poses[0].keypoints.find((k) => k.name === "nose" && (k.score ?? 0) > 0.3);
          const ls = poses[0].keypoints.find((k) => k.name === "left_shoulder" && (k.score ?? 0) > 0.3);
          const rs = poses[0].keypoints.find((k) => k.name === "right_shoulder" && (k.score ?? 0) > 0.3);
          if (nose && (ls || rs)) {
            const sY = ls && rs ? (ls.y + rs.y) / 2 : (ls || rs)!.y;
            samples.push((sY - nose.y) / (videoRef.current.videoHeight || 480));
          }
        }
      } catch {
        // skip
      }
    }

    if (samples.length >= 3) {
      const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
      baselineRef.current = { noseToShoulderRatio: avg };
      setIsCalibrated(true);
    }
    calibratingRef.current = false;
  }, []);

  const start = useCallback(async () => {
    setCameraError(null);
    const camOk = await startCamera();
    if (!camOk) return;
    try {
      await initDetector();
      setIsRunning(true);
    } catch (err) {
      console.error("AI model initialization failed:", err);
      setCameraError("Failed to initialize AI model. Please try again.");
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [startCamera, initDetector]);

  const stop = useCallback(() => {
    setIsRunning(false);
    cancelAnimationFrame(animFrameRef.current);
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    baselineRef.current = null;
    setIsCalibrated(false);
    setPosture({ status: "initializing", confidence: 0, shoulderAngle: null, headTilt: null });
  }, []);

  useEffect(() => {
    if (isRunning) {
      animFrameRef.current = requestAnimationFrame(detectLoop);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isRunning, detectLoop]);

  return {
    videoRef,
    canvasRef,
    posture,
    isRunning,
    isCalibrated,
    cameraError,
    start,
    stop,
    calibrate,
  };
}
