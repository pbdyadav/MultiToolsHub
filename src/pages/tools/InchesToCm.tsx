import React, { useState } from 'react';
import { Ruler, ArrowRight } from 'lucide-react';
import { CopyButton } from '../../components/CopyButton';

export function InchesToCm() {
  const [inches, setInches] = useState('');
  const [centimeters, setCentimeters] = useState('');

  const convertToCm = (inchValue: string) => {
    const numInches = parseFloat(inchValue);
    if (isNaN(numInches)) {
      setCentimeters('');
      return;
    }
    const cm = (numInches * 2.54).toFixed(4);
    setCentimeters(cm);
  };

  const handleInchesChange = (value: string) => {
    setInches(value);
    convertToCm(value);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-4">
          <Ruler className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inches to Centimeters Converter</h1>
        <p className="text-gray-600">Convert inches to centimeters instantly with precision</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Inches</label>
            <input
              type="number"
              value={inches}
              onChange={(e) => handleInchesChange(e.target.value)}
              placeholder="Enter inches..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-gray-400" />
          </div>

          {/* Output */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Centimeters</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={centimeters}
                readOnly
                placeholder="Result..."
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-lg"
              />
              <CopyButton text={centimeters} />
            </div>
          </div>
        </div>

        {/* Quick Conversions */}
        {inches && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Quick Conversions:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-800">Millimeters</div>
                <div className="text-blue-600">{(parseFloat(centimeters) * 10).toFixed(2)} mm</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-800">Meters</div>
                <div className="text-blue-600">{(parseFloat(centimeters) / 100).toFixed(4)} m</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-800">Feet</div>
                <div className="text-blue-600">{(parseFloat(inches) / 12).toFixed(4)} ft</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-800">Yards</div>
                <div className="text-blue-600">{(parseFloat(inches) / 36).toFixed(4)} yd</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Formula Info */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Conversion Formula</h3>
        <p className="text-gray-600 mb-2">
          <strong>Centimeters = Inches × 2.54</strong>
        </p>
        <p className="text-sm text-gray-500">
          The inch is defined as exactly 2.54 centimeters, making this conversion precise and standardized.
        </p>
      </div>
    </div>
  );
}