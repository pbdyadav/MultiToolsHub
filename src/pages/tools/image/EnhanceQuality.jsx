import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

export default function EnhanceQuality() {
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const [error, setError] = useState('');
  const [scale, setScale] = useState(2);
  const [contrast, setContrast] = useState(1.1);
  const [sharp, setSharp] = useState(1.0);
  const [saturation, setSaturation] = useState(1.0);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(true);

  useEffect(() => {
    // tfjs backend is auto-initialized by imports; keep a flag
    setReady(true);
  }, []);

  const onFile = (file) => {
    setError(''); setResultUrl('');
    const url = URL.createObjectURL(file);
    setImage(url);
  };
  const onDrop = (e) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) onFile(e.dataTransfer.files[0]); };
  const prevent = (e) => e.preventDefault();

  const applyPostAdjust = (ctx, w, h) => {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const s = sharp; // simple unsharp mask-like by increasing contrast slightly
    const c = contrast;
    const sat = saturation;
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i+1], b = data[i+2];
      // contrast
      r = ((r - 128) * c) + 128; g = ((g - 128) * c) + 128; b = ((b - 128) * c) + 128;
      // saturation
      const avg = (r + g + b) / 3;
      r = avg + (r - avg) * sat;
      g = avg + (g - avg) * sat;
      b = avg + (b - avg) * sat;
      // clamp
      data[i] = Math.max(0, Math.min(255, r));
      data[i+1] = Math.max(0, Math.min(255, g));
      data[i+2] = Math.max(0, Math.min(255, b));
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const enhance = async () => {
    if (!ready || !imgRef.current) return;
    setProcessing(true);
    try {
      const src = imgRef.current;
      const tmp = document.createElement('canvas');
      tmp.width = src.naturalWidth; tmp.height = src.naturalHeight;
      const tctx = tmp.getContext('2d'); tctx.drawImage(src, 0, 0);
      const srcImg = tf.browser.fromPixels(tmp);
      const resized = tf.image.resizeNearestNeighbor(srcImg, [srcImg.shape[0] * scale, srcImg.shape[1] * scale], false);
      const out = await tf.browser.toPixels(resized);
      const canvas = canvasRef.current; canvas.width = resized.shape[1]; canvas.height = resized.shape[0];
      const ctx = canvas.getContext('2d');
      const imageData = new ImageData(new Uint8ClampedArray(out), canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
      srcImg.dispose(); resized.dispose();
      applyPostAdjust(ctx, canvas.width, canvas.height);
      setResultUrl(canvas.toDataURL('image/png'));
    } catch (e) {
      setError('Enhancement failed');
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!resultUrl) return; const a = document.createElement('a'); a.href = resultUrl; a.download = 'enhanced.png'; a.click();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Enhance Quality</h2>
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
              <div className="text-sm font-medium text-gray-800 mb-2">Before</div>
              <img ref={imgRef} src={image} alt="input" className="w-full rounded border" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800 mb-2">After</div>
              <canvas ref={canvasRef} className="w-full rounded border" />
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="text-sm text-gray-700">Scale
            <select className="ml-2 border rounded px-2 py-1" value={scale} onChange={e=> setScale(Number(e.target.value))}>
              <option value={2}>2x</option>
              <option value={3}>3x</option>
              <option value={4}>4x</option>
            </select>
          </label>
          <label className="text-sm text-gray-700">Contrast
            <input type="range" min="0.5" max="2" step="0.1" value={contrast} onChange={e=> setContrast(Number(e.target.value))} className="ml-2" />
          </label>
          <label className="text-sm text-gray-700">Saturation
            <input type="range" min="0.5" max="2" step="0.1" value={saturation} onChange={e=> setSaturation(Number(e.target.value))} className="ml-2" />
          </label>
          <button disabled={!image || processing} onClick={enhance} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Enhance</button>
          <button disabled={!resultUrl} onClick={download} className="px-4 py-2 border rounded disabled:opacity-50">Download</button>
          {processing && <span className="text-sm text-gray-600">Processing...</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>
    </div>
  );
}


