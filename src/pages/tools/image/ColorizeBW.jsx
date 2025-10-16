import React, { useRef, useState } from 'react';

// Lightweight placeholder using a simple color mapping as offline fallback.
// You can swap with DeOldify API via .env endpoint.

export default function ColorizeBW() {
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const [error, setError] = useState('');
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const onFile = (file) => {
    setError(''); setResultUrl('');
    const url = URL.createObjectURL(file);
    setImage(url);
  };
  const onDrop = (e) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) onFile(e.dataTransfer.files[0]); };
  const prevent = (e) => e.preventDefault();

  const colorizeLocal = async () => {
    if (!imgRef.current) return;
    setProcessing(true);
    try {
      const img = imgRef.current; const canvas = canvasRef.current;
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = data.data;
      for (let i = 0; i < d.length; i += 4) {
        const gray = d[i];
        // Apply a simple LUT that maps grayscale to a warm color palette
        const r = gray * 1.05;
        const g = gray * 0.95;
        const b = gray * 0.85;
        d[i] = Math.min(255, r);
        d[i+1] = Math.min(255, g);
        d[i+2] = Math.min(255, b);
      }
      ctx.putImageData(data, 0, 0);
      setResultUrl(canvas.toDataURL('image/png'));
    } catch (e) {
      setError('Colorization failed');
    } finally {
      setProcessing(false);
    }
  };

  const colorizeApi = async () => {
    const endpoint = import.meta.env.VITE_DEOLDIFY_ENDPOINT; // expects POST { image: base64 }
    if (!endpoint) { setError('Set VITE_DEOLDIFY_ENDPOINT for online colorization'); return; }
    setProcessing(true);
    try {
      const blob = await (await fetch(image)).blob();
      const reader = new FileReader();
      const base64 = await new Promise((res) => { reader.onloadend = () => res(reader.result); reader.readAsDataURL(blob); });
      const resp = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: base64 }) });
      if (!resp.ok) throw new Error('API failed');
      const json = await resp.json(); // { image: 'data:image/png;base64,...' }
      setResultUrl(json.image);
    } catch (e) {
      setError('Online colorization failed');
    } finally {
      setProcessing(false);
    }
  };

  const download = () => { if (!resultUrl) return; const a = document.createElement('a'); a.href = resultUrl; a.download = 'colorized.png'; a.click(); };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">B/W to Color</h2>
        <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-gray-600" onDrop={onDrop} onDragOver={prevent} onDragEnter={prevent}>
          Drag & drop a black & white image here, or
          <label className="ml-2 inline-block px-3 py-1 bg-blue-600 text-white rounded cursor-pointer">
            Upload
            <input type="file" accept="image/*" className="hidden" onChange={(e)=> e.target.files && onFile(e.target.files[0])} />
          </label>
        </div>

        {image && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <div className="text-sm font-medium text-gray-800 mb-2">Original</div>
              <img ref={imgRef} src={image} alt="input" className="w-full rounded border" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800 mb-2">Colorized</div>
              <canvas ref={canvasRef} className="w-full rounded border" />
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button disabled={!image || processing} onClick={colorizeLocal} className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50">Colorize Locally</button>
          <button disabled={!image || processing} onClick={colorizeApi} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Use DeOldify API</button>
          <button disabled={!resultUrl} onClick={download} className="px-4 py-2 border rounded disabled:opacity-50">Download</button>
          {processing && <span className="text-sm text-gray-600">Processing...</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>
    </div>
  );
}


