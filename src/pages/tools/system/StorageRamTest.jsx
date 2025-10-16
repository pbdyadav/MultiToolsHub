import React, { useEffect, useState } from "react";
import { HardDrive, MemoryStick, ShieldCheck, ShieldAlert } from "lucide-react";

export default function StorageRamTest() {
  const [ramGB, setRamGB] = useState(null);
  const [storage, setStorage] = useState(null);

  useEffect(() => {
    if (navigator.deviceMemory) {
      setRamGB(navigator.deviceMemory);
    }
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        setStorage({ quota: est.quota || 0, usage: est.usage || 0 });
      });
    }
  }, []);

  const health = (() => {
    if (!storage) return null;
    const free = storage.quota - storage.usage;
    const pctFree = storage.quota ? (free / storage.quota) * 100 : 0;
    if (pctFree > 80) return { label: "Good", color: "text-green-600", Icon: ShieldCheck };
    if (pctFree >= 50) return { label: "Moderate", color: "text-yellow-600", Icon: ShieldCheck };
    return { label: "Poor", color: "text-red-600", Icon: ShieldAlert };
  })();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <MemoryStick className="h-5 w-5 text-indigo-700" />
          <h2 className="font-semibold text-gray-900">RAM Test (Approx)</h2>
        </div>
        <p className="text-sm text-gray-600">Browser APIs only allow approximate RAM detection.</p>
        <p className="mt-2 text-gray-800">
          <strong>Detected:</strong> {ramGB ? `${ramGB} GB` : "Not available"}
        </p>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <HardDrive className="h-5 w-5 text-indigo-700" />
          <h2 className="font-semibold text-gray-900">HDD / SSD Test (Approx)</h2>
        </div>
        <p className="text-sm text-gray-600">
          Browser can only show storage quota & usage. For deep health check, use vendor tools.
        </p>
        {storage ? (
          <div className="mt-3 space-y-2 text-sm text-gray-800">
            <div className="flex justify-between">
              <span>Total Quota</span>
              <span>{(storage.quota / 1024 ** 3).toFixed(2)} GB</span>
            </div>
            <div className="flex justify-between">
              <span>Used</span>
              <span>{(storage.usage / 1024 ** 3).toFixed(2)} GB</span>
            </div>
            <div className="flex justify-between">
              <span>Free</span>
              <span>{((storage.quota - storage.usage) / 1024 ** 3).toFixed(2)} GB</span>
            </div>
            <div className="mt-3">
              <div className="h-3 bg-gray-100 rounded">
                <div
                  className="h-3 bg-emerald-500 rounded"
                  style={{ width: `${storage.quota ? ((storage.quota - storage.usage) / storage.quota) * 100 : 0}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-gray-600">Free space percentage</div>
            </div>
            {health && (
              <div className={`flex items-center gap-2 mt-2 ${health.color}`}>
                <health.Icon className="h-4 w-4" />
                <span className="font-semibold">Health: {health.label}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-2 text-gray-700">Storage info not supported on this browser.</p>
        )}
      </div>
    </div>
  );
}


