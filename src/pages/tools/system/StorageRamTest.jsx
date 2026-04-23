import React, { useEffect, useMemo, useState } from "react";
import { HardDrive, MemoryStick, ShieldCheck, ShieldAlert, Play } from "lucide-react";

export default function StorageRamTest() {
  const [ramGB, setRamGB] = useState(null);
  const [storage, setStorage] = useState(null);
  const [bench, setBench] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (navigator.deviceMemory) setRamGB(navigator.deviceMemory);
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        setStorage({ quota: est.quota || 0, usage: est.usage || 0 });
      });
    }
  }, []);

  const health = useMemo(() => {
    if (!storage) return null;
    const free = storage.quota - storage.usage;
    const pctFree = storage.quota ? (free / storage.quota) * 100 : 0;
    if (pctFree > 80) return { label: "Good", color: "text-green-600", Icon: ShieldCheck };
    if (pctFree >= 50) return { label: "Moderate", color: "text-yellow-600", Icon: ShieldCheck };
    return { label: "Poor", color: "text-red-600", Icon: ShieldAlert };
  }, [storage]);

  const runBenchmark = async () => {
    setRunning(true);
    setBench(null);
    try {
      const size = 8 * 1024 * 1024;
      const payload = new Uint8Array(size);
      fillRandomBytes(payload);
      const db = await openBenchDb();
      const startWrite = performance.now();
      await putBenchValue(db, payload);
      const writeMs = performance.now() - startWrite;

      const startRead = performance.now();
      const readBack = await readBenchValue(db);
      const readMs = performance.now() - startRead;
      db.close();

      setBench({
        writeMbps: ((size / 1024 / 1024) / (writeMs / 1000)).toFixed(1),
        readMbps: ((readBack.byteLength / 1024 / 1024) / (readMs / 1000)).toFixed(1),
        sizeMb: (size / 1024 / 1024).toFixed(0),
      });
    } catch (error) {
      setBench({ error: "Benchmark unavailable in this browser." });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">System tester</p>
        <h2 className="text-3xl font-semibold text-slate-900 mb-3">Storage and RAM Test</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          This browser cannot read hardware SMART or true RAM health, but it can still measure the available signals and storage speed.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <MemoryStick className="h-5 w-5 text-indigo-700" />
            <h2 className="font-semibold text-gray-900">RAM Result</h2>
          </div>
          <p className="text-sm text-gray-600">Detected from browser hints and memory limits exposed by the runtime.</p>
          <div className="mt-4 rounded-xl bg-slate-50 border p-4">
            <div className="text-sm text-slate-500">Approximate RAM</div>
            <div className="text-3xl font-semibold text-slate-900">{ramGB ? `${ramGB} GB` : "Not available"}</div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Metric label="Platform" value={navigator.platform || "Unknown"} />
            <Metric label="Cores" value={navigator.hardwareConcurrency || "Unknown"} />
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="h-5 w-5 text-indigo-700" />
            <h2 className="font-semibold text-gray-900">HDD / SSD Result</h2>
          </div>
          <p className="text-sm text-gray-600">Storage quota, usage, and a small read/write benchmark.</p>
          {storage ? (
            <div className="mt-4 space-y-3 text-sm text-gray-800">
              <Metric label="Total quota" value={`${(storage.quota / 1024 ** 3).toFixed(2)} GB`} />
              <Metric label="Used" value={`${(storage.usage / 1024 ** 3).toFixed(2)} GB`} />
              <Metric label="Free" value={`${((storage.quota - storage.usage) / 1024 ** 3).toFixed(2)} GB`} />
              <div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-emerald-500 rounded-full"
                    style={{ width: `${storage.quota ? ((storage.quota - storage.usage) / storage.quota) * 100 : 0}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500">Free space percentage</div>
              </div>
              {health && (
                <div className={`flex items-center gap-2 ${health.color}`}>
                  <health.Icon className="h-4 w-4" />
                  <span className="font-semibold">Health: {health.label}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-2 text-gray-700">Storage info not supported on this browser.</p>
          )}

          <div className="mt-5 rounded-xl border bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Benchmark</div>
                <div className="text-xs text-slate-500">Measures a small browser storage round trip.</div>
              </div>
              <button
                type="button"
                onClick={runBenchmark}
                disabled={running}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                <Play className="h-4 w-4" />
                {running ? "Running..." : "Run test"}
              </button>
            </div>
            {bench && !bench.error && (
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                <Metric label="Size" value={`${bench.sizeMb} MB`} compact />
                <Metric label="Write" value={`${bench.writeMbps} MB/s`} compact />
                <Metric label="Read" value={`${bench.readMbps} MB/s`} compact />
              </div>
            )}
            {bench?.error && <div className="mt-3 text-sm text-red-600">{bench.error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, compact = false }) {
  return (
    <div className={`rounded-xl border bg-white ${compact ? "p-3" : "p-4"}`}>
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900 break-words">{value}</div>
    </div>
  );
}

function openBenchDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("multitoolweb-storage-bench", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("bench");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function putBenchValue(db, payload) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("bench", "readwrite");
    tx.objectStore("bench").put(payload, "payload");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function readBenchValue(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("bench", "readonly");
    const req = tx.objectStore("bench").get("payload");
    req.onsuccess = () => resolve(req.result || new Uint8Array());
    req.onerror = () => reject(req.error);
  });
}

function fillRandomBytes(buffer) {
  const chunkSize = 65536;
  for (let offset = 0; offset < buffer.length; offset += chunkSize) {
    crypto.getRandomValues(buffer.subarray(offset, Math.min(offset + chunkSize, buffer.length)));
  }
}
