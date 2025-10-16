import React, { useEffect, useRef, useState } from 'react';
import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs-backend-webgl';

export default function BackgroundRemover() {
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const [error, setError] = useState('');
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    let isMounted = true;
    bodyPix.load({ architecture: 'MobileNetV1', outputStride: 16, multiplier: 0.75, quantBytes: 2 })
      .then(m => { if (isMounted) setModel(m); })
      .catch(() => setError('Failed to load segmentation model'));
    return () => { isMounted = false; };
  }, []);

  const onFile = (file) => {
    setError(''); setResultUrl('');
    const url = URL.createObjectURL(file);
    setImage(url);
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
  };

  const prevent = (e) => e.preventDefault();

  const removeBgLocal = async () => {
    if (!model || !imgRef.current) return;
    setProcessing(true);
    try {
      const segmentation = await model.segmentPerson(imgRef.current, { internalResolution: 'medium', segmentationThreshold: 0.7 });
      const { data: mask } = segmentation;
      const img = imgRef.current;
      const canvas = canvasRef.current;
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < mask.length; i++) {
        if (!mask[i]) imgData.data[i * 4 + 3] = 0; // transparent background
      }
      ctx.putImageData(imgData, 0, 0);
      setResultUrl(canvas.toDataURL('image/png'));
    } catch (e) {
      setError('Segmentation failed');
    } finally {
      setProcessing(false);
    }
  };

  const removeBgApi = async () => {
    if (!imgRef.current) return;
    const apiKey = import.meta.env.VITE_REMOVE_BG_API_KEY;
    if (!apiKey) { setError('Set VITE_REMOVE_BG_API_KEY to use remove.bg'); return; }
    setProcessing(true);
    try {
      const blob = await (await fetch(image)).blob();
      const form = new FormData();
      form.append('image_file', blob, 'image.png');
      form.append('size', 'auto');
      const resp = await fetch('https://api.remove.bg/v1.0/removebg', { method: 'POST', headers: { 'X-Api-Key': apiKey }, body: form });
      if (!resp.ok) throw new Error('API failed');
      const arrayBuf = await resp.arrayBuffer();
      const outUrl = URL.createObjectURL(new Blob([arrayBuf]));
      setResultUrl(outUrl);
    } catch (e) {
      setError('remove.bg request failed');
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl; a.download = 'background-removed.png'; a.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Background Remover</h2>

        <div
          className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-gray-600"
          onDrop={onDrop}
          onDragOver={prevent}
          onDragEnter={prevent}
        >
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
              <canvas ref={canvasRef} className="w-full rounded border bg-transparent" />
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button disabled={!image || processing || !model} onClick={removeBgLocal} className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50">Remove Locally (BodyPix)</button>
          <button disabled={!image || processing} onClick={removeBgApi} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Use remove.bg API</button>
          <button disabled={!resultUrl} onClick={download} className="px-4 py-2 border rounded disabled:opacity-50">Download PNG</button>
          {processing && <span className="text-sm text-gray-600">Processing...</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>
    </div>
  );
}


