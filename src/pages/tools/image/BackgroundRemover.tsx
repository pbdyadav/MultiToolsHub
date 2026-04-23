import React, { useRef, useState } from 'react';
import { Download, ImageMinus, Sparkles } from 'lucide-react';

export function BackgroundRemover() {
  const [imageUrl, setImageUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('Upload a portrait image and remove the background locally.');
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onFile = (file: File) => {
    setResultUrl('');
    setMessage('Image loaded. Run the remover to create a transparent result.');
    setImageUrl(URL.createObjectURL(file));
  };

  const removeBackground = async () => {
    if (!imgRef.current || !canvasRef.current) return;
    setProcessing(true);
    try {
      const image = imgRef.current;
      const canvas = canvasRef.current;
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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

      ctx.putImageData(imageData, 0, 0);
      setResultUrl(canvas.toDataURL('image/png'));
      setMessage('Background removed. Download the transparent PNG.');
    } catch {
      setMessage('Background removal failed. Try a clearer portrait image.');
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const anchor = document.createElement('a');
    anchor.href = resultUrl;
    anchor.download = 'background-removed.png';
    anchor.click();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-100 text-violet-700 shadow-sm">
          <ImageMinus className="h-8 w-8" />
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">Image studio</p>
        <h1 className="text-3xl font-semibold text-slate-900 mb-3">Background Remover</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          This local mode uses a simple background key to clear the backdrop and export a transparent PNG.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
          <Sparkles className="inline-block h-4 w-4 mr-2" />
          Best results come from portraits with a fairly plain background.
        </div>

        <div className="grid gap-6 md:grid-cols-2">
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
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Uploaded preview"
                className="mt-4 w-full rounded-2xl border object-contain"
              />
            )}
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-slate-700">Transparent result</div>
            <canvas ref={canvasRef} className="w-full rounded-2xl border bg-transparent" />
            {resultUrl && <img src={resultUrl} alt="Transparent preview" className="mt-4 w-full rounded-2xl border" />}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={removeBackground}
            disabled={!imageUrl || processing}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {processing ? 'Processing...' : 'Remove background'}
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

export default BackgroundRemover;
