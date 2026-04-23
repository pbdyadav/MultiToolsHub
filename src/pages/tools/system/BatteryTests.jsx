import React, { useEffect, useMemo, useState } from "react";
import { Battery, BatteryCharging, BatteryWarning, PlugZap } from "lucide-react";

const BatteryTests = () => {
  const [batteryInfo, setBatteryInfo] = useState(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (navigator.getBattery) {
      let battery = null;
      let alive = true;
      const sync = () => {
        if (!battery || !alive) return;
        setBatteryInfo({
          level: battery.level,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
        });
      };

      navigator.getBattery().then((result) => {
        battery = result;
        sync();
        battery.addEventListener("levelchange", sync);
        battery.addEventListener("chargingchange", sync);
        battery.addEventListener("chargingtimechange", sync);
        battery.addEventListener("dischargingtimechange", sync);
      });

      return () => {
        alive = false;
        if (battery) {
          battery.removeEventListener("levelchange", sync);
          battery.removeEventListener("chargingchange", sync);
          battery.removeEventListener("chargingtimechange", sync);
          battery.removeEventListener("dischargingtimechange", sync);
        }
      };
    } else {
      setSupported(false);
    }
  }, []);

  const healthText = (level, charging) => {
    const pct = level * 100;
    if (charging && pct >= 95) return { label: "Excellent", color: "text-green-600", Icon: PlugZap };
    if (pct >= 80) return { label: "Good", color: "text-green-600", Icon: BatteryCharging };
    if (pct >= 50) return { label: "Average", color: "text-yellow-600", Icon: Battery };
    return { label: "Weak", color: "text-red-600", Icon: BatteryWarning };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">System tester</p>
          <h1 className="text-2xl font-semibold text-gray-900">Battery Health Test</h1>
        </div>
        {!supported ? (
          <p className="text-sm text-gray-700">Battery API not supported in this browser.</p>
        ) : batteryInfo ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {batteryInfo.charging ? (
                <BatteryCharging className="h-6 w-6 text-green-600" />
              ) : (
                <Battery className="h-6 w-6 text-gray-700" />
              )}
              <div className="flex-1">
                <div className="h-3 bg-gray-100 rounded">
                  <div
                    className="h-3 bg-emerald-500 rounded"
                    style={{ width: `${(batteryInfo.level * 100).toFixed(0)}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-800 w-12 text-right">
                {(batteryInfo.level * 100).toFixed(0)}%
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <InfoBox label="Charging" value={batteryInfo.charging ? "Yes" : "No"} />
              <InfoBox label="Charging time" value={batteryInfo.chargingTime === Infinity ? "Unavailable" : `${Math.round(batteryInfo.chargingTime / 60)} min`} />
              <InfoBox label="Discharging time" value={batteryInfo.dischargingTime === Infinity ? "Unavailable" : `${Math.round(batteryInfo.dischargingTime / 60)} min`} />
            </div>

            <div className="rounded-xl border bg-slate-50 p-4 flex items-center gap-3">
              {(() => {
                const { label, color, Icon } = healthText(batteryInfo.level, batteryInfo.charging);
                return (
                  <>
                    <Icon className={`h-5 w-5 ${color}`} />
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Health result</div>
                      <div className={`font-semibold ${color}`}>{label}</div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700">Loading battery info...</p>
        )}
      </div>
    </div>
  );
};

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-3">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-1 font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default BatteryTests;
