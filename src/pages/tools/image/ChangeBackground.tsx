import React, { useRef, useState } from 'react';
import { Download, Layers } from 'lucide-react';

export function ChangeBackground() {
  const [imageUrl, setImageUrl] = useState('');
  const [bgMode, setBgMode] = useState<'color' | 'gradient' | 'image'>('color');
  const [bgColorA, setBgColorA] = useState('#0f766e');
  const [bgColorB, setBgColorB] = useState('#38bdf8');
  const [bgImageUrl, setBgImageUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const [message, setMessage] = useState('Upload a portrait, choose a background, and apply the composite.');
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onImage = (file: File) => {
    setResultUrl('');
    setMessage('Image ready. Pick a background and press Apply.');
    setImageUrl(URL.createObjectURL(file));
  };

  const onBgImage = (file: File) => {
    setBgImageUrl(URL.createObjectURL(file));
  };

  const applyBackground = async () => {
    if (!imgRef.current || !canvasRef.current) return;
    setProcessing(true);
    try {
      const image = imgRef.current;
      const canvas = canvasRef.current;
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const temp = document.createElement('canvas');
      temp.width = canvas.width;
      temp.height = canvas.height;
      const tempCtx = temp.getContext('2d');
      if (!tempCtx) return;

      await drawBackground(ctx, canvas.width, canvas.height, bgMode, bgColorA, bgColorB, bgImageUrl);

      tempCtx.drawImage(image, 0, 0);
      const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const background = sampleCornerBackground(data, canvas.width, canvas.height);
      const threshold = 48;

      for (let index = 0; index < data.length; index += 4) {
        const distance = colorDistance(
          [data[index], data[index + 1], data[index + 2]],
          background
        );
        if (distance < threshold) {
          data[index + 3] = 0;
        }
      }

      tempCtx.putImageData(imageData, 0, 0);
      ctx.drawImage(temp, 0, 0);
      setResultUrl(canvas.toDataURL('image/png'));
      setMessage('Background changed. Download the composited PNG.');
    } catch {
      setMessage('Background compositing failed. Try a clearer photo.');
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const anchor = document.createElement('a');
    anchor.href = resultUrl;
    anchor.download = 'changed-background.png';
    anchor.click();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-100 text-cyan-700 shadow-sm">
          <Layers className="h-8 w-8" />
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">Image studio</p>
        <h1 className="text-3xl font-semibold text-slate-900 mb-3">Change Background</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Replace the background with a solid color, gradient, or another image while keeping the subject isolated.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Upload subject image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onImage(file);
              }}
              className="block w-full text-sm"
            />
            {imageUrl && (
              <img ref={imgRef} src={imageUrl} alt="Source preview" className="mt-4 w-full rounded-2xl border object-contain" />
            )}

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Background mode</label>
                <select
                  value={bgMode}
                  onChange={(event) => setBgMode(event.target.value as 'color' | 'gradient' | 'image')}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                >
                  <option value="color">Solid color</option>
                  <option value="gradient">Gradient</option>
                  <option value="image">Image</option>
                </select>
              </div>

              {(bgMode === 'color' || bgMode === 'gradient') && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Color 1
                    <input
                      type="color"
                      value={bgColorA}
                      onChange={(event) => setBgColorA(event.target.value)}
                      className="mt-2 block h-12 w-full rounded-xl border"
                    />
                  </label>
                  {bgMode === 'gradient' && (
                    <label className="block text-sm font-medium text-slate-700">
                      Color 2
                      <input
                        type="color"
                        value={bgColorB}
                        onChange={(event) => setBgColorB(event.target.value)}
                        className="mt-2 block h-12 w-full rounded-xl border"
                      />
                    </label>
                  )}
                </div>
              )}

              {bgMode === 'image' && (
                <label className="block text-sm font-medium text-slate-700">
                  Upload background image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) onBgImage(file);
                    }}
                    className="mt-2 block w-full text-sm"
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-slate-700">Composite result</div>
            <canvas ref={canvasRef} className="w-full rounded-2xl border" />
            {resultUrl && <img src={resultUrl} alt="Composite result preview" className="mt-4 w-full rounded-2xl border" />}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={applyBackground}
            disabled={!imageUrl || processing}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {processing ? 'Processing...' : 'Apply background'}
          </button>
          <button
            type="button"
            onClick={download}
            disabled={!resultUrl}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 disabled:opacity-50 hover:bg-slate-50"
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

async function drawImageToCanvas(ctx: CanvasRenderingContext2D, src: string, width: number, height: number) {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Failed to load background image'));
    image.src = src;
  });
  ctx.drawImage(image, 0, 0, width, height);
}

async function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mode: 'color' | 'gradient' | 'image',
  colorA: string,
  colorB: string,
  bgImageUrl: string
) {
  if (mode === 'color') {
    ctx.fillStyle = colorA;
    ctx.fillRect(0, 0, width, height);
    return;
  }
  if (mode === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colorA);
    gradient.addColorStop(1, colorB);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    return;
  }
  if (bgImageUrl) {
    await drawImageToCanvas(ctx, bgImageUrl, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }
}

function sampleCornerBackground(data: Uint8ClampedArray, width: number, height: number) {
  const points = [
    [10, 10],
    [width - 10, 10],
    [10, height - 10],
    [width - 10, height - 10]
  ];
  const samples = points.map(([x, y]) => {
    const index = (Math.max(0, Math.min(height - 1, y)) * width + Math.max(0, Math.min(width - 1, x))) * 4;
    return [data[index], data[index + 1], data[index + 2]] as [number, number, number];
  });
  const total = samples.reduce(
    (sum, item) => [sum[0] + item[0], sum[1] + item[1], sum[2] + item[2]],
    [0, 0, 0]
  );
  return total.map((value) => value / samples.length) as [number, number, number];
}

function colorDistance(a: [number, number, number], b: [number, number, number]) {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 +
      (a[1] - b[1]) ** 2 +
      (a[2] - b[2]) ** 2
  );
}

export default ChangeBackground;
