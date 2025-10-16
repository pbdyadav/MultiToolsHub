import React, { useEffect, useRef, useState } from "react";
import { Volume2, Camera, Mic } from "lucide-react";

export default function AudioVideoTests() {
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [micStream, setMicStream] = useState(null);

  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);

  // 🔊 Speaker Test
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // 📷 Camera Test
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraOn(true);
    } catch {
      alert("Camera access denied or unavailable.");
    }
  };
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
  };

  // 🎙 Mic Test with Equalizer Bars
  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128; // Fewer bars = smoother look
      source.connect(analyser);

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
      setIsMicOn(true);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const draw = () => {
        if (!isMicOn) return;
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = "#f9fafb";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          const r = 34, g = 197, b = 94; // Tailwind green-500
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }

        requestAnimationFrame(draw);
      };

      draw();
    } catch {
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopMic = () => {
    if (micStream) micStream.getTracks().forEach((t) => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    setIsMicOn(false);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    return () => {
      stopMic();
      stopCamera();
      stopAudio();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* 🔊 Speaker Test */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="h-5 w-5 text-gray-700" />
          <h2 className="font-semibold text-gray-900">Speaker Test</h2>
        </div>
        {!isPlaying ? (
          <button
            onClick={playAudio}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            ▶ Play Test Audio
          </button>
        ) : (
          <button
            onClick={stopAudio}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            ⏹ Stop Audio
          </button>
        )}
        <audio
          ref={audioRef}
          src="/audio/speaker_test.mp3"
          preload="auto"
          onEnded={() => setIsPlaying(false)}
        />
      </div>

      {/* 📷 Camera Test */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="h-5 w-5 text-gray-700" />
          <h2 className="font-semibold text-gray-900">Camera Test</h2>
        </div>
        {!isCameraOn ? (
          <button
            onClick={startCamera}
            className="mb-3 px-4 py-2 border rounded hover:bg-gray-100"
          >
            ▶ Start Camera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="mb-3 px-4 py-2 border rounded hover:bg-gray-100 bg-red-100 text-red-700"
          >
            ⏹ Stop Camera
          </button>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full rounded border"
        />
      </div>

      {/* 🎙 Microphone Test */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Mic className="h-5 w-5 text-gray-700" />
          <h2 className="font-semibold text-gray-900">Microphone Test</h2>
        </div>
        {!isMicOn ? (
          <button
            onClick={startMic}
            className="mb-3 px-4 py-2 border rounded hover:bg-gray-100"
          >
            ▶ Start Mic
          </button>
        ) : (
          <button
            onClick={stopMic}
            className="mb-3 px-4 py-2 border rounded hover:bg-gray-100 bg-red-100 text-red-700"
          >
            ⏹ Stop Mic
          </button>
        )}
        <canvas
          ref={canvasRef}
          width={600}
          height={120}
          className="w-full border rounded bg-gray-50"
        />
      </div>
    </div>
  );
}
