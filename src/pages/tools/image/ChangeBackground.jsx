import React, { useEffect, useRef, useState } from 'react';
import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs-backend-webgl';

export default function ChangeBackground() {
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [bgMode, setBgMode] = useState('color');
  const [color1, setColor1] = useState('#4f46e5');
  const [color2, setColor2] = useState('#06b6d4');
  const [bgImage, setBgImage] = useState(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    let m = true;
    bodyPix.load({ architecture: 'MobileNetV1', outputStride: 16, multiplier: 0.75, quantBytes: 2 })
      .then(mod => { if (m) setModel(mod); })
      .catch(() => setError('Failed to load segmentation model'));
    return () => { m = false; };
  }, []);

  const onFile = (file) => { setError(''); const url = URL.createObjectURL(file); setImage(url); };
  const onBgFile = (file) => { const url = URL.createObjectURL(file); setBgImage(url); };
  const onDrop = (e) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) onFile(e.dataTransfer.files[0]); };
  const prevent = (e) => e.preventDefault();

  const composite = async () => {
    if (!model || !imgRef.current) return;
    setProcessing(true);
    try {
      const seg = await model.segmentPerson(imgRef.current, { internalResolution: 'medium', segmentationThreshold: 0.7 });
      const mask = seg.data; const img = imgRef.current; const canvas = canvasRef.current;
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; const ctx = canvas.getContext('2d');

      // draw background
      if (bgMode === 'color') {
        ctx.fillStyle = color1; ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (bgMode === 'gradient') {
        const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        g.addColorStop(0, color1); g.addColorStop(1, color2); ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (bgMode === 'image' && bgImage) {
        const bgi = new Image(); await new Promise((res)=>{ bgi.onload = res; bgi.src = bgImage; });
        ctx.drawImage(bgi, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // draw person with alpha mask
      const tmp = document.createElement('canvas'); tmp.width = canvas.width; tmp.height = canvas.height; const tctx = tmp.getContext('2d');
      tctx.drawImage(img, 0, 0);
      const data = tctx.getImageData(0, 0, tmp.width, tmp.height);
      for (let i = 0; i < mask.length; i++) if (!mask[i]) data.data[i*4 + 3] = 0;
      tctx.putImageData(data, 0, 0);
      ctx.drawImage(tmp, 0, 0);
    } catch (e) {
      setError('Background change failed');
    } finally {
      setProcessing(false);
    }
  };

  const download = () => { const a = document.createElement('a'); a.href = canvasRef.current.toDataURL('image/png'); a.download = 'changed-background.png'; a.click(); };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Background</h2>
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
              <div className="text-sm font-medium text-gray-800 mb-2">Composited</div>
              <canvas ref={canvasRef} className="w-full rounded border" />
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700">Mode</label>
              <select className="border rounded px-2 py-1" value={bgMode} onChange={e=> setBgMode(e.target.value)}>
                <option value="color">Solid Color</option>
                <option value="gradient">Gradient</option>
                <option value="image">Image</option>
              </select>
            </div>
            {(bgMode === 'color' || bgMode === 'gradient') && (
              <div className="flex items-center gap-3">
                <label className="text-sm">Color 1</label>
                <input type="color" value={color1} onChange={e=> setColor1(e.target.value)} />
                {bgMode === 'gradient' && (<>
                  <label className="text-sm ml-3">Color 2</label>
                  <input type="color" value={color2} onChange={e=> setColor2(e.target.value)} />
                </>)}
              </div>
            )}
            {bgMode === 'image' && (
              <div>
                <label className="inline-block px-3 py-1 border rounded cursor-pointer text-sm">Upload Background Image
                  <input type="file" accept="image/*" className="hidden" onChange={(e)=> e.target.files && onBgFile(e.target.files[0])} />
                </label>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button disabled={!image || processing || !model} onClick={composite} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Apply</button>
            <button disabled={!image} onClick={download} className="px-4 py-2 border rounded disabled:opacity-50">Download</button>
            {processing && <span className="text-sm text-gray-600">Processing...</span>}
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}


