import React, { useEffect, useMemo, useState } from "react";

const SerialNumberTest = () => {
  const [serialNo, setSerialNo] = useState("");

  const browserReport = useMemo(() => {
    const nav = navigator;
    return {
      language: nav.language,
      cores: nav.hardwareConcurrency || "Unknown",
      memory: nav.deviceMemory ? `${nav.deviceMemory} GB` : "Unknown",
      screen: `${window.screen.width} × ${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      browser: nav.userAgent.includes("Chrome")
        ? "Chrome"
        : nav.userAgent.includes("Firefox")
          ? "Firefox"
          : nav.userAgent.includes("Safari")
            ? "Safari"
            : "Browser",
    };
  }, []);

  useEffect(() => {
    const payload = JSON.stringify({
      ...browserReport,
      platform: navigator.platform,
      origin: window.location.origin,
    });
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload)).then((buffer) => {
      const hex = Array.from(new Uint8Array(buffer))
        .slice(0, 8)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
      setSerialNo(`MTW-${hex}`);
    });
  }, [browserReport]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">System tester</p>
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">Serial Number Result</h2>
        <p className="text-sm text-slate-600 mb-6">
          Browsers cannot read the real hardware serial number, so this page shows a browser-generated serial reference for support and testing.
        </p>

        <div className="rounded-2xl border bg-slate-50 p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Serial No.</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{serialNo || "Calculating..."}</div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <InfoBox label="Browser" value={browserReport.browser} />
          <InfoBox label="Language" value={browserReport.language} />
          <InfoBox label="CPU cores" value={browserReport.cores} />
          <InfoBox label="Memory hint" value={browserReport.memory} />
          <InfoBox label="Screen" value={browserReport.screen} />
          <InfoBox label="Time zone" value={browserReport.timezone} />
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
          Real motherboard serial numbers are not exposed to web pages, so this result is a stable browser reference instead.
        </div>
      </div>
    </div>
  );
};

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-1 font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default SerialNumberTest;
