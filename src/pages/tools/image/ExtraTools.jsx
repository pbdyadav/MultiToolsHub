import React, { useRef, useState } from 'react';

export default function ExtraTools() {
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const [error, setError] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const [resizeW, setResizeW] = useState(512);
  const [resizeH, setResizeH] = useState(512);
  const [quality, setQuality] = useState(0.8);
  const [blur, setBlur] = useState(0);
  const [sharpen, setSharpen] = useState(0);
  const [watermark, setWatermark] = useState('');
  const [logo, setLogo] = useState(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const onFile = (file) => { setError(''); setResultUrl(''); const url = URL.createObjectURL(file); setImage(url); };
  const onDrop = (e) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) onFile(e.dataTransfer.files[0]); };
  const prevent = (e) => e.preventDefault();

  const applyOps = async () => {
    if (!imgRef.current) return; setProcessing(true);
    try {
      const img = imgRef.current; const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
      // Crop
      const sx = crop.x, sy = crop.y, sw = Math.min(img.naturalWidth - sx, crop.w), sh = Math.min(img.naturalHeight - sy, crop.h);
      // Resize
      canvas.width = resizeW; canvas.height = resizeH; ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, resizeW, resizeH);

      // Blur
      if (blur > 0 && ctx.filter !== undefined) {
        const tmp = document.createElement('canvas'); tmp.width = resizeW; tmp.height = resizeH; const tctx = tmp.getContext('2d');
        tctx.drawImage(canvas, 0, 0);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.filter = `blur(${blur}px)`; ctx.drawImage(tmp, 0, 0); ctx.filter = 'none';
      }

      // Sharpen (simple kernel)
      if (sharpen > 0) {
        const imgData = ctx.getImageData(0,0,canvas.width,canvas.height); const d = imgData.data;
        // simple unsharp-like effect by boosting contrast slightly
        const factor = 1 + sharpen * 0.3;
        for (let i = 0; i < d.length; i += 4) {
          d[i] = Math.min(255, Math.max(0, (d[i] - 128) * factor + 128));
          d[i+1] = Math.min(255, Math.max(0, (d[i+1] - 128) * factor + 128));
          d[i+2] = Math.min(255, Math.max(0, (d[i+2] - 128) * factor + 128));
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // Watermark text
      if (watermark) {
        ctx.font = '20px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.textBaseline = 'bottom';
        ctx.fillText(watermark, 12, canvas.height - 12);
      }

      // Watermark logo
      if (logo) {
        const logoImg = new Image(); await new Promise((res)=>{ logoImg.onload = res; logoImg.src = logo; });
        const w = Math.min(logoImg.width, canvas.width / 6); const h = (logoImg.height / logoImg.width) * w;
        ctx.globalAlpha = 0.8; ctx.drawImage(logoImg, canvas.width - w - 12, canvas.height - h - 12, w, h); ctx.globalAlpha = 1;
      }

      setResultUrl(canvas.toDataURL('image/jpeg', quality));
    } catch (e) {
      setError('Processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const onLogo = (file) => { const url = URL.createObjectURL(file); setLogo(url); };
  const download = () => { if (!resultUrl) return; const a = document.createElement('a'); a.href = resultUrl; a.download = 'edited.jpg'; a.click(); };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Extra Tools</h2>
        <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-gray-600" onDrop={onDrop} onDragOver={prevent} onDragEnter={prevent}>
          Drag & drop an image here, or
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
              <div className="text-sm font-medium text-gray-800 mb-2">Result</div>
              <canvas ref={canvasRef} className="w-full rounded border" />
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label>Crop X<input type="number" className="mt-1 border rounded px-2 py-1" value={crop.x} onChange={e=> setCrop({...crop, x: Number(e.target.value)})} /></label>
              <label>Crop Y<input type="number" className="mt-1 border rounded px-2 py-1" value={crop.y} onChange={e=> setCrop({...crop, y: Number(e.target.value)})} /></label>
              <label>Crop W<input type="number" className="mt-1 border rounded px-2 py-1" value={crop.w} onChange={e=> setCrop({...crop, w: Number(e.target.value)})} /></label>
              <label>Crop H<input type="number" className="mt-1 border rounded px-2 py-1" value={crop.h} onChange={e=> setCrop({...crop, h: Number(e.target.value)})} /></label>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label>Resize W<input type="number" className="mt-1 border rounded px-2 py-1" value={resizeW} onChange={e=> setResizeW(Number(e.target.value) || 1)} /></label>
              <label>Resize H<input type="number" className="mt-1 border rounded px-2 py-1" value={resizeH} onChange={e=> setResizeH(Number(e.target.value) || 1)} /></label>
            </div>
            <label className="text-sm">JPEG Quality
              <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={e=> setQuality(Number(e.target.value))} className="ml-2" />
            </label>
            <label className="text-sm">Blur
              <input type="range" min="0" max="10" step="1" value={blur} onChange={e=> setBlur(Number(e.target.value))} className="ml-2" />
            </label>
            <label className="text-sm">Sharpen
              <input type="range" min="0" max="5" step="1" value={sharpen} onChange={e=> setSharpen(Number(e.target.value))} className="ml-2" />
            </label>
          </div>
          <div className="space-y-3">
            <label className="text-sm">Watermark Text
              <input type="text" className="ml-2 border rounded px-2 py-1" placeholder="Your brand" value={watermark} onChange={e=> setWatermark(e.target.value)} />
            </label>
            <label className="inline-block px-3 py-1 border rounded cursor-pointer text-sm">Upload Logo
              <input type="file" accept="image/*" className="hidden" onChange={(e)=> e.target.files && onLogo(e.target.files[0])} />
            </label>
            <div className="text-xs text-gray-600">Sketch: Download result and apply grayscale + edges via your favorite editor, or integrate Canny/edge detection if needed.</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button disabled={!image || processing} onClick={applyOps} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Apply</button>
          <button disabled={!resultUrl} onClick={download} className="px-4 py-2 border rounded disabled:opacity-50">Download</button>
          {processing && <span className="text-sm text-gray-600">Processing...</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>
    </div>
  );
}


