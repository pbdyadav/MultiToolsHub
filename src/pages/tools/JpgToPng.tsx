import React, { useState, useCallback } from 'react';
import { Image, Upload, Download, X } from 'lucide-react';

export function JpgToPng() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      setSelectedFile(file);
      setConvertedImage(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const convertToPng = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    try {
      // Create canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Set canvas dimensions to match image
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw image on canvas with white background
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          }

          // Convert to PNG
          const pngDataUrl = canvas.toDataURL('image/png');
          setConvertedImage(pngDataUrl);
          resolve(pngDataUrl);
        };
        img.onerror = reject;
      });

      img.src = URL.createObjectURL(selectedFile);
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadPng = () => {
    if (!convertedImage || !selectedFile) return;

    const link = document.createElement('a');
    link.download = selectedFile.name.replace(/\.[^/.]+$/, '.png');
    link.href = convertedImage;
    link.click();
  };

  const reset = () => {
    setSelectedFile(null);
    setConvertedImage(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="bg-purple-100 p-4 rounded-full w-fit mx-auto mb-4">
          <Image className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">JPG to PNG Converter</h1>
        <p className="text-gray-600">Convert your JPEG images to PNG format with transparency support</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragOver 
                ? 'border-purple-400 bg-purple-50' 
                : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Drop your image here
            </h3>
            <p className="text-gray-600 mb-6">
              Or click to browse and select an image file
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors"
            >
              <Upload className="h-5 w-5" />
              <span>Choose File</span>
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selected File Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Image className="h-6 w-6 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">{selectedFile.name}</div>
                  <div className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <button
                onClick={reset}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Original (JPG)</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Original"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {convertedImage && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Converted (PNG)</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100 bg-opacity-50 bg-checkered">
                    <img
                      src={convertedImage}
                      alt="Converted"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!convertedImage ? (
                <button
                  onClick={convertToPng}
                  disabled={isConverting}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {isConverting ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Image className="h-5 w-5" />
                  )}
                  <span>{isConverting ? 'Converting...' : 'Convert to PNG'}</span>
                </button>
              ) : (
                <button
                  onClick={downloadPng}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span>Download PNG</span>
                </button>
              )}
              
              <button
                onClick={reset}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Choose Different File
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">About JPG to PNG Conversion</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <strong>JPG (JPEG):</strong> Compressed format, smaller file size, no transparency
          </div>
          <div>
            <strong>PNG:</strong> Lossless format, larger file size, supports transparency
          </div>
        </div>
      </div>
    </div>
  );
}