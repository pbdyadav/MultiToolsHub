import React, { useRef, useState } from 'react';
import { Palette, Download } from 'lucide-react';

export function ColorizeBW() {
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setResultUrl('');
    if (!f) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = URL.createObjectURL(f);
  };

  const process = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Fake colorization by adding a subtle sepia overlay
    const ctx = canvas.getContext('2d')!;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(112, 66, 20, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setResultUrl(canvas.toDataURL('image/png'));
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'colorized.png';
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="bg-pink-100 p-4 rounded-full w-fit mx-auto mb-4">
          <Palette className="h-8 w-8 text-pink-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">B/W to Color</h1>
        <p className="text-gray-600">Demo colorization overlay. For real colorization, integrate an ML API.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">Processing requires API integration. Demo preview only.</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
            <input type="file" accept="image/*" onChange={onFileChange} className="block w-full text-sm" />
            <canvas ref={canvasRef} className="mt-4 w-full max-h-96 border rounded" />
          </div>
          <div>
            <button onClick={process} disabled={!file} className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50">Process</button>
            {resultUrl && (
              <div className="mt-4">
                <img src={resultUrl} alt="result" className="w-full max-h-96 object-contain border rounded" />
                <button onClick={download} className="mt-3 inline-flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50"><Download className="h-4 w-4"/>Download</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ColorizeBW;


