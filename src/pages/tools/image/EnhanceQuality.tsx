import React, { useRef, useState } from 'react';
import { Download, Sparkles } from 'lucide-react';

export function EnhanceQuality() {
  const [imageUrl, setImageUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [scale, setScale] = useState(2);
  const [contrast, setContrast] = useState(1.08);
  const [saturation, setSaturation] = useState(1.06);
  const [sharpness, setSharpness] = useState(0.45);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('Upload a photo and enhance it locally with sharpening and upscaling.');
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onFile = (file: File) => {
    setResultUrl('');
    setMessage('Image loaded. Adjust the sliders and press Enhance.');
    setImageUrl(URL.createObjectURL(file));
  };

  const enhance = async () => {
    if (!imgRef.current || !canvasRef.current) return;
    setProcessing(true);
    try {
      const source = imgRef.current;
      const canvas = canvasRef.current;
      const width = Math.max(1, Math.round(source.naturalWidth * scale));
      const height = Math.max(1, Math.round(source.naturalHeight * scale));
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(source, 0, 0, width, height);

      applyToneAdjustments(ctx, width, height, contrast, saturation);
      applySharpenFilter(ctx, width, height, sharpness);
      setResultUrl(canvas.toDataURL('image/png'));
      setMessage('Enhancement complete. Download the improved PNG.');
    } catch {
      setMessage('Enhancement failed. Try a clearer image.');
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const anchor = document.createElement('a');
    anchor.href = resultUrl;
    anchor.download = 'enhanced.png';
    anchor.click();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-700 shadow-sm">
          <Sparkles className="h-8 w-8" />
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">Image studio</p>
        <h1 className="text-3xl font-semibold text-slate-900 mb-3">Enhance Image Quality</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Upscale, sharpen, and gently tune the tones of your image in the browser.
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
              <img ref={imgRef} src={imageUrl} alt="Original" className="mt-4 w-full rounded-2xl border object-contain" />
            )}
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-slate-700">Enhanced result</div>
            <canvas ref={canvasRef} className="w-full rounded-2xl border" />
            {resultUrl && <img src={resultUrl} alt="Enhanced preview" className="mt-4 w-full rounded-2xl border" />}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <LabelledRange label="Scale" value={`${scale}x`} min={1} max={4} step={1} current={scale} onChange={setScale} />
          <LabelledRange label="Contrast" value={contrast.toFixed(2)} min={0.8} max={1.4} step={0.02} current={contrast} onChange={setContrast} />
          <LabelledRange label="Saturation" value={saturation.toFixed(2)} min={0.8} max={1.4} step={0.02} current={saturation} onChange={setSaturation} />
          <LabelledRange label="Sharpness" value={sharpness.toFixed(2)} min={0} max={1} step={0.05} current={sharpness} onChange={setSharpness} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={enhance}
            disabled={!imageUrl || processing}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {processing ? 'Processing...' : 'Enhance image'}
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

function LabelledRange({
  label,
  value,
  min,
  max,
  step,
  current,
  onChange
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="rounded-2xl border bg-slate-50 p-4 text-sm font-medium text-slate-700">
      <div className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <span className="text-slate-900">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full"
      />
    </label>
  );
}

function applyToneAdjustments(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  contrast: number,
  saturation: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let index = 0; index < data.length; index += 4) {
    let red = data[index];
    let green = data[index + 1];
    let blue = data[index + 2];

    red = ((red - 128) * contrast) + 128;
    green = ((green - 128) * contrast) + 128;
    blue = ((blue - 128) * contrast) + 128;

    const average = (red + green + blue) / 3;
    red = average + (red - average) * saturation;
    green = average + (green - average) * saturation;
    blue = average + (blue - average) * saturation;

    data[index] = clamp(red);
    data[index + 1] = clamp(green);
    data[index + 2] = clamp(blue);
  }
  ctx.putImageData(imageData, 0, 0);
}

function applySharpenFilter(ctx: CanvasRenderingContext2D, width: number, height: number, strength: number) {
  if (strength <= 0) return;
  const source = ctx.getImageData(0, 0, width, height);
  const output = ctx.createImageData(width, height);
  const kernel = [
    0, -1 * strength, 0,
    -1 * strength, 1 + 4 * strength, -1 * strength,
    0, -1 * strength, 0
  ];
  const data = source.data;
  const out = output.data;

  const sample = (x: number, y: number, channel: number) => {
    const clampedX = Math.max(0, Math.min(width - 1, x));
    const clampedY = Math.max(0, Math.min(height - 1, y));
    return data[(clampedY * width + clampedX) * 4 + channel];
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      for (let channel = 0; channel < 3; channel += 1) {
        let value = 0;
        let index = 0;
        for (let ky = -1; ky <= 1; ky += 1) {
          for (let kx = -1; kx <= 1; kx += 1) {
            value += sample(x + kx, y + ky, channel) * kernel[index];
            index += 1;
          }
        }
        out[(y * width + x) * 4 + channel] = clamp(value);
      }
      out[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3];
    }
  }

  ctx.putImageData(output, 0, 0);
}

function clamp(value: number) {
  return Math.max(0, Math.min(255, value));
}

export default EnhanceQuality;
