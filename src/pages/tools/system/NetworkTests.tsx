import React, { useEffect, useState } from "react";
import { Wifi } from "lucide-react";

export function NetworkTests() {
  const [downloadMbps, setDownloadMbps] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testSpeed = async () => {
    setRunning(true);
    setError(null);
    try {
      // Measure latency with a small request
      const pingStart = performance.now();
      await fetch("https://speed.cloudflare.com/__down?bytes=100000", { cache: "no-store" });
      const pingEnd = performance.now();
      setLatencyMs(Math.round(pingEnd - pingStart));

      // Download test file
      const start = performance.now();
      const resp = await fetch("https://speed.hetzner.de/10MB.bin", { cache: "no-store" });
      const blob = await resp.blob();
      const end = performance.now();

      const seconds = (end - start) / 1000;
      const mbits = (blob.size * 8) / 1_000_000; // megabits
      setDownloadMbps(parseFloat((mbits / seconds).toFixed(2)));
    } catch (err) {
      setError("Network test failed. Please try again.");
    }
    setRunning(false);
  };

  useEffect(() => {}, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-6">
        <div className="bg-teal-100 p-4 rounded-full w-fit mx-auto mb-4">
          <Wifi className="h-8 w-8 text-teal-700" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">WiFi Speed Test</h1>
        <p className="text-gray-600">Browser-based test. Results may vary.</p>
      </div>
      <div className="bg-white border rounded-xl p-6 text-center">
        <button
          onClick={testSpeed}
          disabled={running}
          className="px-4 py-2 bg-teal-600 text-white rounded disabled:opacity-50"
        >
          {running ? "Testing..." : "Start Test"}
        </button>

        {latencyMs !== null && (
          <div className="mt-4 text-lg">
            Latency:{" "}
            <span className="font-semibold text-teal-700">{latencyMs} ms</span>
          </div>
        )}

        {downloadMbps !== null && (
          <div className="mt-2 text-lg">
            Download:{" "}
            <span className="font-semibold text-teal-700">
              {downloadMbps} Mbps
            </span>
          </div>
        )}

        {error && <p className="text-red-600 mt-3">{error}</p>}

        <p className="text-xs text-gray-500 mt-2">
          For more accurate results, use a dedicated speed test service.
        </p>
      </div>
    </div>
  );
}

export default NetworkTests;
