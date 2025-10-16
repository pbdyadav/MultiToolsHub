import React, { useEffect, useState } from 'react';
import { Monitor } from 'lucide-react';

const colors = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF'];

export function ScreenDeadPixelTest() {
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);

  // Handle keyboard arrows
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % colors.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + colors.length) % colors.length);
      if (e.key === 'Escape') setFull(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const enterFullscreen = () => {
    setFull(true);
    document.documentElement.requestFullscreen?.();
  };

  const exitFullscreen = () => {
    setFull(false);
    document.exitFullscreen?.();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-6">
        <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-4">
          <Monitor className="h-8 w-8 text-gray-700"/>
        </div>
        <h1 className="text-3xl font-bold">Screen Dead Pixel Test</h1>
        <p className="text-gray-600">Use arrow keys or click to cycle colors. ESC to exit.</p>
      </div>
      <div className="bg-white border rounded-xl p-4">
        <button onClick={enterFullscreen} className="px-4 py-2 bg-gray-800 text-white rounded">
          Enter Fullscreen
        </button>
      </div>

      {full && (
        <div
          className="fixed inset-0 z-50"
          style={{ backgroundColor: colors[index] }}
          onClick={() => setIndex((i) => (i + 1) % colors.length)}
        >
          {/* Hidden exit button */}
          <button
            className="absolute top-4 right-4 px-3 py-2 bg-white text-black rounded"
            onClick={exitFullscreen}
          >
            Exit
          </button>
        </div>
      )}
    </div>
  );
}

export default ScreenDeadPixelTest;
