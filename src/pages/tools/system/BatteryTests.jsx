import React, { useState, useEffect } from "react";
import { Battery, BatteryCharging } from "lucide-react";

const BatteryTests = () => {
  const [batteryInfo, setBatteryInfo] = useState(null);

  useEffect(() => {
    if (navigator.getBattery) {
      navigator.getBattery().then((battery) => {
        setBatteryInfo({
          level: battery.level,
          charging: battery.charging,
        });

        battery.addEventListener("levelchange", () =>
          setBatteryInfo({ level: battery.level, charging: battery.charging })
        );
        battery.addEventListener("chargingchange", () =>
          setBatteryInfo({ level: battery.level, charging: battery.charging })
        );
      });
    } else {
      setBatteryInfo("Battery API not supported in this browser.");
    }
  }, []);

  const healthText = (level) => {
    const pct = level * 100;
    if (pct >= 80) return { label: "Good", color: "text-green-600" };
    if (pct >= 50) return { label: "Average", color: "text-yellow-600" };
    return { label: "Poor", color: "text-red-600" };
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white border rounded-xl p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Battery Health Test</h1>
        {typeof batteryInfo === "string" ? (
          <p className="text-sm text-gray-700">{batteryInfo}</p>
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

            <div className="text-sm text-gray-800">
              Charging: <span className="font-medium">{batteryInfo.charging ? "Yes" : "No"}</span>
            </div>

            <div className="text-sm text-gray-800">
              Health Estimate: {(() => {
                const { label, color } = healthText(batteryInfo.level);
                return <span className={`font-semibold ${color}`}>{label}</span>;
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

export default BatteryTests;
