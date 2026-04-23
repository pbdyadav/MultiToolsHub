import React, { useEffect, useRef, useState } from "react";
import { Volume2, Camera, Mic, VolumeX, CameraOff } from "lucide-react";

export default function AudioVideoTests() {
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(0);
  const cameraStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const micActiveRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [devices, setDevices] = useState([]);

  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices?.().then((list) => {
      setDevices(list.filter((device) => device.kind === "audioinput" || device.kind === "videoinput"));
    }).catch(() => {});
  }, []);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraOn(true);
    } catch (error) {
      alert("Camera access denied or unavailable.");
    }
  };
  const stopCamera = () => {
    const stream = cameraStreamRef.current || videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsCameraOn(false);
      cameraStreamRef.current = null;
    }
  };

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      micStreamRef.current = stream;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
      sourceRef.current = source;
      micActiveRef.current = true;
      setMicLevel(0);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const draw = () => {
        if (!micActiveRef.current) return;
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.2;
        let x = 0;
        let sum = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          sum += dataArray[i];
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          gradient.addColorStop(0, "#14b8a6");
          gradient.addColorStop(1, "#2563eb");
          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }

        setMicLevel(Math.min(100, Math.round((sum / bufferLength / 255) * 100)));
        animationRef.current = requestAnimationFrame(draw);
      };

      cancelAnimationFrame(animationRef.current);
      setIsMicOn(true);
      draw();
    } catch (error) {
      alert(error?.message || "Microphone access denied or unavailable.");
    }
  };

  const stopMic = () => {
    micActiveRef.current = false;
    cancelAnimationFrame(animationRef.current);
    const stream = micStreamRef.current;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioCtxRef.current) audioCtxRef.current.close();
    micStreamRef.current = null;
    sourceRef.current = null;
    analyserRef.current = null;
    audioCtxRef.current = null;
    setIsMicOn(false);
    setMicLevel(0);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    return () => {
      stopMic();
      stopCamera();
      stopAudio();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">System tester</p>
        <h2 className="text-3xl font-semibold text-slate-900 mb-3">Audio and Video Tests</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Speaker, camera, and microphone checks with live feedback so you can see what the browser is actually receiving.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="h-5 w-5 text-gray-700" />
          <h2 className="font-semibold text-gray-900">Speaker Test</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">Play a clean test tone and music clip to confirm speaker output.</p>
        {!isPlaying ? (
          <button
            onClick={playAudio}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl"
          >
            ▶ Play Test Audio
          </button>
        ) : (
          <button
            onClick={stopAudio}
            className="px-4 py-2 bg-red-600 text-white rounded-xl"
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
        <div className="mt-4 text-xs text-slate-500 flex items-center gap-2">
          {isPlaying ? <Volume2 className="h-4 w-4 text-emerald-600" /> : <VolumeX className="h-4 w-4" />}
          {isPlaying ? "Audio is playing." : "Ready to play the test file."}
        </div>
        </div>

      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="h-5 w-5 text-gray-700" />
          <h2 className="font-semibold text-gray-900">Camera Test</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">A live preview confirms that the selected camera is active.</p>
        {!isCameraOn ? (
          <button
            onClick={startCamera}
            className="mb-3 px-4 py-2 border rounded-xl hover:bg-gray-100"
          >
            ▶ Start Camera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="mb-3 px-4 py-2 border rounded-xl hover:bg-gray-100 bg-red-100 text-red-700"
          >
            ⏹ Stop Camera
          </button>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full rounded-xl border bg-black/80 min-h-[220px]"
        />
        <div className="mt-4 text-xs text-slate-500 flex items-center gap-2">
          {isCameraOn ? <Camera className="h-4 w-4 text-emerald-600" /> : <CameraOff className="h-4 w-4" />}
          {isCameraOn ? "Camera stream is active." : "No camera stream running."}
        </div>
        </div>

      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Mic className="h-5 w-5 text-gray-700" />
          <h2 className="font-semibold text-gray-900">Microphone Test</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">Speak into your mic and watch the live level meter respond.</p>
        {!isMicOn ? (
          <button
            onClick={startMic}
            className="mb-3 px-4 py-2 border rounded-xl hover:bg-gray-100"
          >
            ▶ Start Mic
          </button>
        ) : (
          <button
            onClick={stopMic}
            className="mb-3 px-4 py-2 border rounded-xl hover:bg-gray-100 bg-red-100 text-red-700"
          >
            ⏹ Stop Mic
          </button>
        )}
        <canvas
          ref={canvasRef}
          width={600}
          height={120}
          className="w-full border rounded-xl bg-gray-50"
        />
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>{isMicOn ? "Mic live" : "Mic idle"}</span>
          <span className="font-semibold text-slate-900">{micLevel}%</span>
        </div>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Detected devices</h3>
            <p className="text-sm text-slate-600">The browser can list the available inputs after permission or device enumeration.</p>
          </div>
          <div className="text-xs text-slate-500">{devices.length} device(s) found</div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {devices.map((device) => (
            <div key={device.deviceId} className="rounded-xl border bg-slate-50 p-4 text-sm">
              <div className="font-semibold text-slate-900">{device.kind === "videoinput" ? "Camera" : "Microphone"}</div>
              <div className="text-slate-600">{device.label || "Unnamed device"}</div>
            </div>
          ))}
          {!devices.length && (
            <div className="text-sm text-slate-500">
              Device names appear here after the browser exposes them.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
