import React, { useEffect, useMemo, useState } from "react";
import "./KeyboardTest.css";
import { keyMap } from "./keyMap";
import { layouts } from "./layouts";

const arrowLayout = [["↑"], ["←", "↓", "→"]];
const mouseLayout = [["LMB", "MMB", "RMB"]];
const displayName = (label) => String(label || "").trim();
const normalized = (label) => displayName(label).toLowerCase();

const KeyboardTest = () => {
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [currentLayout, setCurrentLayout] = useState("mac");
  const [lastKey, setLastKey] = useState("");

  const isMac = useMemo(() => currentLayout === "mac", [currentLayout]);

  const pressKey = (label) => {
    const k = normalized(label);
    if (!k) return;
    setLastKey(displayName(label));
    setActiveKeys((prev) => new Set([...prev, k]));
  };
  const releaseKey = (label) => {
    const k = normalized(label);
    if (!k) return;
    setActiveKeys((prev) => {
      const copy = new Set(prev);
      copy.delete(k);
      return copy;
    });
  };

  const handleKeyDown = (e) => {
    if (
      e.key === "Tab" ||
      e.key.startsWith("Arrow") ||
      e.key === " "
    ) {
      e.preventDefault();
    }

    const mapped = keyMap[e.code] || keyMap[e.key] || e.key;
    if (mapped) pressKey(mapped);
  };

  const handleKeyUp = (e) => {
    const mapped = keyMap[e.code] || keyMap[e.key] || e.key;
    if (mapped) releaseKey(mapped);
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) pressKey("LMB");
    if (e.button === 1) pressKey("MMB");
    if (e.button === 2) pressKey("RMB");
  };
  const handleMouseUp = (e) => {
    if (e.button === 0) releaseKey("LMB");
    if (e.button === 1) releaseKey("MMB");
    if (e.button === 2) releaseKey("RMB");
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp, { passive: false });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const renderRow = (row) => (
    <div className="keyboard-row" key={row.join("-")}>
      {row.map((label) => (
        <div
          key={label}
          className={`key ${activeKeys.has(normalized(label)) ? "active" : ""} ${
            normalized(label) === "space" ? "space" : ""
          } ${["tab", "caps", "ctrl", "opt", "cmd", "fn", "shift"].includes(normalized(label)) ? "wide" : ""} ${
            ["return", "enter", "delete", "backspace"].includes(normalized(label)) ? "extra-wide" : ""
          }`}
          onMouseDown={() => pressKey(label)}
          onMouseUp={() => releaseKey(label)}
          onMouseLeave={() => releaseKey(label)}
        >
          {label}
        </div>
      ))}
    </div>
  );

  return (
    <div className="keyboard-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">System tester</p>
        <h2 className="text-3xl font-semibold text-slate-900 mb-3">Keyboard Tester</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Press keys on your physical keyboard and compare them with a realistic layout that highlights live input.
        </p>
      </div>

      <div className="keyboard-shell p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="text-sm text-slate-600">
            Last key: <span className="font-semibold text-slate-900">{lastKey || "waiting..."}</span>
          </div>
          <div className="switcher flex gap-2">
        <button
          type="button"
          onClick={() => setCurrentLayout("mac")}
          disabled={isMac}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                isMac ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
        >
          Mac Layout
        </button>
        <button
          type="button"
          onClick={() => setCurrentLayout("windows")}
          disabled={!isMac}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                !isMac ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
        >
          Windows Layout
        </button>
      </div>
        </div>

        <div className="space-y-4 overflow-x-auto pb-2">
          {layouts[currentLayout].map((row) => {
            if (row[0] === "ArrowKeys" || row[0] === "Mouse") return null;
            return renderRow(row);
          })}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="keyboard-section">
              <div className="text-sm font-semibold text-slate-700 mb-3">Arrow cluster</div>
              <div className="keyboard-mini">
                {arrowLayout.flat().map((label) => renderRow([label]))}
              </div>
            </div>

            <div className="keyboard-section">
              <div className="text-sm font-semibold text-slate-700 mb-3">Mouse buttons</div>
              <div className="keyboard-mini">
                {mouseLayout.flat().map((label) => renderRow([label]))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardTest;

