import React, { useEffect, useMemo, useState } from "react";
import "./KeyboardTest.css";
import { keyMap } from "./keyMap";
import { layouts } from "./layouts";

const arrowLayout = [["↑"], ["←", "↓", "→"]];
const mouseLayout = [["LMB", "MMB", "RMB"]];

function normalizeKeyLabel(raw) {
  if (!raw) return "";
  return String(raw);
}

const KeyboardTest = () => {
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [currentLayout, setCurrentLayout] = useState("mac");

  const isMac = useMemo(() => currentLayout === "mac", [currentLayout]);

  const pressKey = (label) => {
    const k = normalizeKeyLabel(label).toLowerCase();
    if (!k) return;
    setActiveKeys((prev) => new Set([...prev, k]));
  };
  const releaseKey = (label) => {
    const k = normalizeKeyLabel(label).toLowerCase();
    if (!k) return;
    setActiveKeys((prev) => {
      const copy = new Set(prev);
      copy.delete(k);
      return copy;
    });
  };

  const handleKeyDown = (e) => {
    // Prevent page scroll and focus change for arrows and Tab
    if (
      e.key === "Tab" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight"
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

  // Also reflect real mouse buttons on the virtual keys
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
          className={`key ${activeKeys.has(label.toLowerCase()) ? "active" : ""} key-${label.replace(/\s/g, "_")}`}
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
    <div className="keyboard-container">
      <h2>Keyboard Tester</h2>
      <div className="switcher">
        <button
          type="button"
          onClick={() => setCurrentLayout("mac")}
          disabled={isMac}
        >
          Mac Layout
        </button>
        <button
          type="button"
          onClick={() => setCurrentLayout("windows")}
          disabled={!isMac}
        >
          Windows Layout
        </button>
      </div>

      <div className="keyboard">
        {layouts[currentLayout].map((row) => {
          if (row[0] === "ArrowKeys" || row[0] === "Mouse") return null;
          return renderRow(row);
        })}

        <div className="arrow-keys">
          {arrowLayout.map((row) => renderRow(row))}
        </div>

        <div className="mouse-keys">
          {mouseLayout.map((row) => renderRow(row))}
        </div>
      </div>
    </div>
  );
};

export default KeyboardTest;


