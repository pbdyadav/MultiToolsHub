import React, { useState } from 'react';
import { Palette, ArrowRight } from 'lucide-react';
import { CopyButton } from '../../components/CopyButton';

export function HexToRgb() {
  const [hex, setHex] = useState('#3B82F6');
  const [rgb, setRgb] = useState('59, 130, 246');

  const hexToRgb = (hexColor: string): string => {
    // Remove # if present
    const cleanHex = hexColor.replace('#', '');
    
    // Handle 3-character hex
    const fullHex = cleanHex.length === 3 
      ? cleanHex.split('').map(c => c + c).join('')
      : cleanHex;
    
    if (fullHex.length !== 6 || !/^[0-9A-Fa-f]+$/.test(fullHex)) {
      return '';
    }

    const r = parseInt(fullHex.substring(0, 2), 16);
    const g = parseInt(fullHex.substring(2, 4), 16);
    const b = parseInt(fullHex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
  };

  const handleHexChange = (value: string) => {
    setHex(value);
    const rgbResult = hexToRgb(value);
    setRgb(rgbResult);
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const getRgbValues = () => {
    return rgb.split(', ').map(Number);
  };

  const [r, g, b] = getRgbValues();
  const hsl = rgbToHsl(r, g, b);
  const isValidColor = rgb && !isNaN(r) && !isNaN(g) && !isNaN(b);

  const presetColors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#000000', '#FFFFFF', '#808080', '#800000', '#008000', '#000080'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="bg-pink-100 p-4 rounded-full w-fit mx-auto mb-4">
          <Palette className="h-8 w-8 text-pink-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HEX to RGB Converter</h1>
        <p className="text-gray-600">Convert HEX color codes to RGB values with live preview</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Color Preview */}
        {isValidColor && (
          <div className="mb-8 text-center">
            <div
              className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
              style={{ backgroundColor: hex }}
            />
            <div className="text-sm text-gray-600">Color Preview</div>
          </div>
        )}

        {/* Converter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-8">
          {/* HEX Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">HEX Color</label>
            <input
              type="text"
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#3B82F6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-lg font-mono"
            />
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-gray-400" />
          </div>

          {/* RGB Output */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">RGB Values</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={rgb}
                readOnly
                placeholder="59, 130, 246"
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-lg font-mono"
              />
              <CopyButton text={`rgb(${rgb})`} />
            </div>
          </div>
        </div>

        {/* Color Information */}
        {isValidColor && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">RGB</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-red-600">Red:</span>
                    <span className="font-mono">{r}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Green:</span>
                    <span className="font-mono">{g}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Blue:</span>
                    <span className="font-mono">{b}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">HSL</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Hue:</span>
                    <span className="font-mono">{hsl.h}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturation:</span>
                    <span className="font-mono">{hsl.s}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lightness:</span>
                    <span className="font-mono">{hsl.l}%</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">CSS Values</div>
                <div className="space-y-2">
                  <CopyButton text={hex} className="w-full justify-center" />
                  <CopyButton text={`rgb(${rgb})`} className="w-full justify-center" />
                  <CopyButton text={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} className="w-full justify-center" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preset Colors */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Colors</h3>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => handleHexChange(color)}
                className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong className="text-gray-900">CSS:</strong>
            <div className="bg-white p-2 rounded mt-1 font-mono text-xs">
              color: {hex};<br/>
              background: rgb({rgb});
            </div>
          </div>
          <div>
            <strong className="text-gray-900">JavaScript:</strong>
            <div className="bg-white p-2 rounded mt-1 font-mono text-xs">
              const color = "{hex}";<br/>
              const rgb = "rgb({rgb})";
            </div>
          </div>
          <div>
            <strong className="text-gray-900">RGB Values:</strong>
            <div className="bg-white p-2 rounded mt-1 font-mono text-xs">
              R: {r}<br/>
              G: {g}<br/>
              B: {b}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}