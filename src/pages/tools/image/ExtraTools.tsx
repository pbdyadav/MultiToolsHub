import React, { useRef, useState } from 'react';
import { Scissors, Maximize, BadgePercent, Droplets, Type } from 'lucide-react';

export function ExtraTools() {
  const [file, setFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
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

  const resizeHalf = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const tmp = document.createElement('canvas');
    const tctx = tmp.getContext('2d')!;
    tmp.width = Math.max(1, Math.floor(canvas.width/2));
    tmp.height = Math.max(1, Math.floor(canvas.height/2));
    tctx.drawImage(canvas, 0, 0, tmp.width, tmp.height);
    canvas.width = tmp.width; canvas.height = tmp.height;
    ctx.drawImage(tmp, 0, 0);
  };

  const compress = () => {
    const canvas = canvasRef.current!;
    const url = canvas.toDataURL('image/jpeg', 0.7);
    const a = document.createElement('a');
    a.href = url; a.download = 'compressed.jpg'; a.click();
  };

  const blur = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.filter = 'blur(2px)';
    const img = new Image(); img.onload = ()=>{ ctx.drawImage(img, 0, 0); ctx.filter='none'; };
    img.src = canvas.toDataURL();
  };

  const sharpen = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    // Simple unsharp mask-like effect via contrast
    ctx.filter = 'contrast(1.2)';
    const img = new Image(); img.onload = ()=>{ ctx.drawImage(img, 0, 0); ctx.filter='none'; };
    img.src = canvas.toDataURL();
  };

  const watermark = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.textAlign = 'right';
    ctx.fillText('© Your Brand', canvas.width - 20, canvas.height - 20);
  };

  const sketch = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    // Simple grayscale to mimic sketch
    const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const avg = (d[i] + d[i+1] + d[i+2]) / 3;
      d[i] = d[i+1] = d[i+2] = avg;
    }
    ctx.putImageData(imgData, 0, 0);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-4">
          <Scissors className="h-8 w-8 text-gray-700" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Extra Image Tools</h1>
        <p className="text-gray-600">Crop & resize, compress, blur/sharpen, watermark, and sketch/cartoon.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">Processing requires API integration. Demo preview only.</div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
        <input type="file" accept="image/*" onChange={onFileChange} className="block w-full text-sm" />
        <canvas ref={canvasRef} className="mt-4 w-full max-h-96 border rounded" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          <button onClick={resizeHalf} disabled={!file} className="px-3 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 inline-flex items-center gap-2"><Maximize className="h-4 w-4"/>Resize 50%</button>
          <button onClick={compress} disabled={!file} className="px-3 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 inline-flex items-center gap-2"><BadgePercent className="h-4 w-4"/>Compress</button>
          <button onClick={blur} disabled={!file} className="px-3 py-2 bg-rose-600 text-white rounded-lg disabled:opacity-50 inline-flex items-center gap-2"><Droplets className="h-4 w-4"/>Blur</button>
          <button onClick={sharpen} disabled={!file} className="px-3 py-2 bg-amber-600 text-white rounded-lg disabled:opacity-50 inline-flex items-center gap-2"><Droplets className="h-4 w-4"/>Sharpen</button>
          <button onClick={watermark} disabled={!file} className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 inline-flex items-center gap-2"><Type className="h-4 w-4"/>Watermark</button>
          <button onClick={sketch} disabled={!file} className="px-3 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50">Sketch</button>
        </div>
      </div>
    </div>
  );
}

export default ExtraTools;


