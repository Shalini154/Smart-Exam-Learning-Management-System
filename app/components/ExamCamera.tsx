"use client";

import { useEffect, useRef, useState } from "react";
import * as blazeface from "@tensorflow-models/blazeface";
import "@tensorflow/tfjs";

type Props = {
  onViolation?: (type: string) => void;
};

export default function ExamCamera({
  onViolation,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const modelRef = useRef<any>(null);
  const cooldownRef = useRef<Record<string, number>>({});

  const [faceCount, setFaceCount] = useState(0);
  const [violations, setViolations] = useState(0);

  const recordViolation = (type: string) => {
    const now = Date.now();

    if (
      cooldownRef.current[type] &&
      now - cooldownRef.current[type] < 5000
    ) {
      return;
    }

    cooldownRef.current[type] = now;

    setViolations((v) => v + 1);

    if (onViolation) {
      onViolation(type);
    }
  };

  const detectFaces = async () => {
    if (
      !modelRef.current ||
      !videoRef.current ||
      !canvasRef.current
    )
      return;

    const predictions =
      await modelRef.current.estimateFaces(
        videoRef.current,
        false
      );

    setFaceCount(predictions.length);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width =
      videoRef.current.videoWidth;

    canvas.height =
      videoRef.current.videoHeight;

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    if (predictions.length === 0) {
      recordViolation("NO_FACE");
    }

    if (predictions.length > 1) {
      recordViolation("MULTIPLE_FACE");
    }

    predictions.forEach((face: any) => {
      const [x, y] = face.topLeft;

      const width =
        face.bottomRight[0] - x;

      const height =
        face.bottomRight[1] - y;

      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 3;

      ctx.strokeRect(
        x,
        y,
        width,
        height
      );
    });
  };

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: true,
            }
          );

        if (videoRef.current) {
          videoRef.current.srcObject =
            stream;

          await videoRef.current.play();
        }

        modelRef.current =
          await blazeface.load();

        setInterval(
          detectFaces,
          1000
        );
      } catch (err) {
        console.error(err);
      }
    };

    startCamera();

    const handleVisibility = () => {
      if (document.hidden) {
        recordViolation("TAB_SWITCH");
      }
    };

    const handleBlur = () => {
      recordViolation("WINDOW_BLUR");
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    window.addEventListener(
      "blur",
      handleBlur
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      window.removeEventListener(
        "blur",
        handleBlur
      );
    };
  }, []);

  return (
    <div className="fixed right-4 bottom-4 z-50 bg-black border border-gray-700 rounded-lg p-3">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-64 rounded"
        />

        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>

      <div className="mt-2 text-xs text-gray-300">
        Faces: {faceCount}
      </div>

      <div className="text-xs text-red-400">
        Violations: {violations}
      </div>
    </div>
  );
}