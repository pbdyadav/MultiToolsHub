import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRight, Info } from 'lucide-react';
import { CopyButton } from '../../components/CopyButton';
import { unitCategories, convertUnit, UnitCategory, Unit } from '../../utils/unitConversions';

export function UniversalUnitConverter() {
  const [inputValue, setInputValue] = useState('1');
  const [selectedCategory, setSelectedCategory] = useState<UnitCategory>(unitCategories[0]);
  const [fromUnit, setFromUnit] = useState<Unit>(unitCategories[0].units[0]);
  const [toUnit, setToUnit] = useState<Unit>(unitCategories[0].units[1]);
  const [result, setResult] = useState('');

  useEffect(() => {
    // Update units when category changes
    setFromUnit(selectedCategory.units[0]);
    setToUnit(selectedCategory.units[1] || selectedCategory.units[0]);
  }, [selectedCategory]);

  useEffect(() => {
    // Convert when any value changes
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && fromUnit && toUnit) {
      try {
        const converted = convertUnit(numValue, fromUnit, toUnit, selectedCategory);
        setResult(converted.toFixed(6).replace(/\.?0+$/, ''));
      } catch {
        setResult('Error');
      }
    } else {
      setResult('');
    }
  }, [inputValue, fromUnit, toUnit, selectedCategory]);

  const handleCategoryChange = (categoryId: string) => {
    const category = unitCategories.find(c => c.id === categoryId);
    if (category) {
      setSelectedCategory(category);
    }
  };

  const handleFromUnitChange = (unitId: string) => {
    const unit = selectedCategory.units.find(u => u.id === unitId);
    if (unit) {
      setFromUnit(unit);
    }
  };

  const handleToUnitChange = (unitId: string) => {
    const unit = selectedCategory.units.find(u => u.id === unitId);
    if (unit) {
      setToUnit(unit);
    }
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const getConversionFormula = () => {
    if (selectedCategory.id === 'temperature') {
      if (fromUnit.id === 'c' && toUnit.id === 'f') {
        return '°F = (°C × 9/5) + 32';
      } else if (fromUnit.id === 'f' && toUnit.id === 'c') {
        return '°C = (°F - 32) × 5/9';
      } else if (fromUnit.id === 'c' && toUnit.id === 'k') {
        return 'K = °C + 273.15';
      } else if (fromUnit.id === 'k' && toUnit.id === 'c') {
        return '°C = K - 273.15';
      }
    }
    return `1 ${fromUnit.symbol} = ${convertUnit(1, fromUnit, toUnit, selectedCategory).toFixed(6).replace(/\.?0+$/, '')} ${toUnit.symbol}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="bg-indigo-100 p-4 rounded-full w-fit mx-auto mb-4">
          <Calculator className="h-8 w-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Universal Unit Converter</h1>
        <p className="text-gray-600">Convert between different units across multiple categories</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Category Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {unitCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory.id === category.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Input Value */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
          />
        </div>

        {/* Unit Selection and Conversion */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end mb-6">
          {/* From Unit */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <select
              value={fromUnit.id}
              onChange={(e) => handleFromUnitChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {selectedCategory.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name} ({unit.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={swapUnits}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              title="Swap units"
            >
              <ArrowRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* To Unit */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <select
              value={toUnit.id}
              onChange={(e) => handleToUnitChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {selectedCategory.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name} ({unit.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-indigo-50 rounded-lg p-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-800 mb-2">
                {result} {toUnit.symbol}
              </div>
              <div className="text-indigo-600 mb-4">
                {inputValue} {fromUnit.symbol} = {result} {toUnit.symbol}
              </div>
              <CopyButton 
                text={`${inputValue} ${fromUnit.symbol} = ${result} ${toUnit.symbol}`} 
                className="bg-white hover:bg-indigo-100" 
              />
            </div>
          </div>
        )}

        {/* Conversion Info */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-900 mb-1">Conversion Formula</div>
              <div className="text-sm text-gray-600 font-mono">
                {getConversionFormula()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Reference - {selectedCategory.name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedCategory.units.slice(0, 6).map((unit) => (
            <div key={unit.id} className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="font-medium text-gray-900">{unit.name}</div>
              <div className="text-sm text-gray-600">{unit.symbol}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}