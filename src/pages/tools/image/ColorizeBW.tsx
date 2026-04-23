import React, { useRef, useState } from 'react';
import { Download, Palette } from 'lucide-react';

export function ColorizeBW() {
  const [imageUrl, setImageUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('Upload a monochrome image to apply a warm color mapping locally.');
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onFile = (file: File) => {
    setResultUrl('');
    setMessage('Image loaded. Press Colorize to apply the tone mapping.');
    setImageUrl(URL.createObjectURL(file));
  };

  const colorize = async () => {
    if (!imgRef.current || !canvasRef.current) return;
    setProcessing(true);
    try {
      const source = imgRef.current;
      const canvas = canvasRef.current;
      canvas.width = source.naturalWidth;
      canvas.height = source.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(source, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let index = 0; index < data.length; index += 4) {
        const gray = luminance(data[index], data[index + 1], data[index + 2]);
        const warm = makeWarmPalette(gray);
        data[index] = warm[0];
        data[index + 1] = warm[1];
        data[index + 2] = warm[2];
      }
      ctx.putImageData(imageData, 0, 0);
      setResultUrl(canvas.toDataURL('image/png'));
      setMessage('Color mapping applied. Download the PNG if you like the result.');
    } catch {
      setMessage('Colorization failed. Try a higher contrast black and white image.');
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const anchor = document.createElement('a');
    anchor.href = resultUrl;
    anchor.download = 'colorized.png';
    anchor.click();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-pink-100 text-pink-700 shadow-sm">
          <Palette className="h-8 w-8" />
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">Image studio</p>
        <h1 className="text-3xl font-semibold text-slate-900 mb-3">B/W to Color</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          This is a browser-side warm color mapping tool for black and white photographs.
        </p>
      </div>

      <div className="rounded-3xl border bg-white p-5 sm:p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Upload image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onFile(file);
              }}
              className="block w-full text-sm"
            />
            {imageUrl && (
              <img ref={imgRef} src={imageUrl} alt="Original black and white image" className="mt-4 w-full rounded-2xl border object-contain" />
            )}
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-slate-700">Colorized result</div>
            <canvas ref={canvasRef} className="w-full rounded-2xl border" />
            {resultUrl && <img src={resultUrl} alt="Colorized preview" className="mt-4 w-full rounded-2xl border" />}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={colorize}
            disabled={!imageUrl || processing}
            className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {processing ? 'Processing...' : 'Colorize'}
          </button>
          <button
            type="button"
            onClick={download}
            disabled={!resultUrl}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-slate-700 disabled:opacity-50 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Download PNG
          </button>
          <div className="text-sm text-slate-600">{message}</div>
        </div>
      </div>
    </div>
  );
}

function luminance(r: number, g: number, b: number) {
  return Math.round(r * 0.299 + g * 0.587 + b * 0.114);
}

function makeWarmPalette(gray: number) {
  const ratio = gray / 255;
  const red = clamp(32 + ratio * 210);
  const green = clamp(18 + ratio * 170);
  const blue = clamp(12 + ratio * 120);
  return [red, green, blue];
}

function clamp(value: number) {
  return Math.max(0, Math.min(255, value));
}

export default ColorizeBW;
