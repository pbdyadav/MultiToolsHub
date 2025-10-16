// Unit conversion utilities with modular structure

export interface UnitCategory {
  id: string;
  name: string;
  units: Unit[];
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

// Length conversions (base unit: meters)
const lengthUnits: Unit[] = [
  {
    id: 'mm',
    name: 'Millimeters',
    symbol: 'mm',
    toBase: (value) => value / 1000,
    fromBase: (value) => value * 1000
  },
  {
    id: 'cm',
    name: 'Centimeters',
    symbol: 'cm',
    toBase: (value) => value / 100,
    fromBase: (value) => value * 100
  },
  {
    id: 'm',
    name: 'Meters',
    symbol: 'm',
    toBase: (value) => value,
    fromBase: (value) => value
  },
  {
    id: 'km',
    name: 'Kilometers',
    symbol: 'km',
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000
  },
  {
    id: 'in',
    name: 'Inches',
    symbol: 'in',
    toBase: (value) => value * 0.0254,
    fromBase: (value) => value / 0.0254
  },
  {
    id: 'ft',
    name: 'Feet',
    symbol: 'ft',
    toBase: (value) => value * 0.3048,
    fromBase: (value) => value / 0.3048
  },
  {
    id: 'yd',
    name: 'Yards',
    symbol: 'yd',
    toBase: (value) => value * 0.9144,
    fromBase: (value) => value / 0.9144
  },
  {
    id: 'mi',
    name: 'Miles',
    symbol: 'mi',
    toBase: (value) => value * 1609.344,
    fromBase: (value) => value / 1609.344
  }
];

// Weight conversions (base unit: grams)
const weightUnits: Unit[] = [
  {
    id: 'mg',
    name: 'Milligrams',
    symbol: 'mg',
    toBase: (value) => value / 1000,
    fromBase: (value) => value * 1000
  },
  {
    id: 'g',
    name: 'Grams',
    symbol: 'g',
    toBase: (value) => value,
    fromBase: (value) => value
  },
  {
    id: 'kg',
    name: 'Kilograms',
    symbol: 'kg',
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000
  },
  {
    id: 'oz',
    name: 'Ounces',
    symbol: 'oz',
    toBase: (value) => value * 28.3495,
    fromBase: (value) => value / 28.3495
  },
  {
    id: 'lb',
    name: 'Pounds',
    symbol: 'lb',
    toBase: (value) => value * 453.592,
    fromBase: (value) => value / 453.592
  },
  {
    id: 'ton',
    name: 'Tons',
    symbol: 't',
    toBase: (value) => value * 1000000,
    fromBase: (value) => value / 1000000
  }
];

// Temperature conversions (base unit: Celsius)
const temperatureUnits: Unit[] = [
  {
    id: 'c',
    name: 'Celsius',
    symbol: '°C',
    toBase: (value) => value,
    fromBase: (value) => value
  },
  {
    id: 'f',
    name: 'Fahrenheit',
    symbol: '°F',
    toBase: (value) => (value - 32) * 5/9,
    fromBase: (value) => (value * 9/5) + 32
  },
  {
    id: 'k',
    name: 'Kelvin',
    symbol: 'K',
    toBase: (value) => value - 273.15,
    fromBase: (value) => value + 273.15
  }
];

// Area conversions (base unit: square meters)
const areaUnits: Unit[] = [
  {
    id: 'mm2',
    name: 'Square Millimeters',
    symbol: 'mm²',
    toBase: (value) => value / 1000000,
    fromBase: (value) => value * 1000000
  },
  {
    id: 'cm2',
    name: 'Square Centimeters',
    symbol: 'cm²',
    toBase: (value) => value / 10000,
    fromBase: (value) => value * 10000
  },
  {
    id: 'm2',
    name: 'Square Meters',
    symbol: 'm²',
    toBase: (value) => value,
    fromBase: (value) => value
  },
  {
    id: 'km2',
    name: 'Square Kilometers',
    symbol: 'km²',
    toBase: (value) => value * 1000000,
    fromBase: (value) => value / 1000000
  },
  {
    id: 'in2',
    name: 'Square Inches',
    symbol: 'in²',
    toBase: (value) => value * 0.00064516,
    fromBase: (value) => value / 0.00064516
  },
  {
    id: 'ft2',
    name: 'Square Feet',
    symbol: 'ft²',
    toBase: (value) => value * 0.092903,
    fromBase: (value) => value / 0.092903
  },
  {
    id: 'acre',
    name: 'Acres',
    symbol: 'ac',
    toBase: (value) => value * 4046.86,
    fromBase: (value) => value / 4046.86
  }
];

// Volume conversions (base unit: liters)
const volumeUnits: Unit[] = [
  {
    id: 'ml',
    name: 'Milliliters',
    symbol: 'ml',
    toBase: (value) => value / 1000,
    fromBase: (value) => value * 1000
  },
  {
    id: 'l',
    name: 'Liters',
    symbol: 'l',
    toBase: (value) => value,
    fromBase: (value) => value
  },
  {
    id: 'm3',
    name: 'Cubic Meters',
    symbol: 'm³',
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000
  },
  {
    id: 'floz',
    name: 'Fluid Ounces',
    symbol: 'fl oz',
    toBase: (value) => value * 0.0295735,
    fromBase: (value) => value / 0.0295735
  },
  {
    id: 'cup',
    name: 'Cups',
    symbol: 'cup',
    toBase: (value) => value * 0.236588,
    fromBase: (value) => value / 0.236588
  },
  {
    id: 'gal',
    name: 'Gallons',
    symbol: 'gal',
    toBase: (value) => value * 3.78541,
    fromBase: (value) => value / 3.78541
  }
];

// Speed conversions (base unit: meters per second)
const speedUnits: Unit[] = [
  {
    id: 'ms',
    name: 'Meters per Second',
    symbol: 'm/s',
    toBase: (value) => value,
    fromBase: (value) => value
  },
  {
    id: 'kmh',
    name: 'Kilometers per Hour',
    symbol: 'km/h',
    toBase: (value) => value / 3.6,
    fromBase: (value) => value * 3.6
  },
  {
    id: 'mph',
    name: 'Miles per Hour',
    symbol: 'mph',
    toBase: (value) => value * 0.44704,
    fromBase: (value) => value / 0.44704
  },
  {
    id: 'knot',
    name: 'Knots',
    symbol: 'kn',
    toBase: (value) => value * 0.514444,
    fromBase: (value) => value / 0.514444
  }
];

// Time conversions (base unit: seconds)
const timeUnits: Unit[] = [
  {
    id: 'ms',
    name: 'Milliseconds',
    symbol: 'ms',
    toBase: (value) => value / 1000,
    fromBase: (value) => value * 1000
  },
  {
    id: 's',
    name: 'Seconds',
    symbol: 's',
    toBase: (value) => value,
    fromBase: (value) => value
  },
  {
    id: 'min',
    name: 'Minutes',
    symbol: 'min',
    toBase: (value) => value * 60,
    fromBase: (value) => value / 60
  },
  {
    id: 'h',
    name: 'Hours',
    symbol: 'h',
    toBase: (value) => value * 3600,
    fromBase: (value) => value / 3600
  },
  {
    id: 'd',
    name: 'Days',
    symbol: 'd',
    toBase: (value) => value * 86400,
    fromBase: (value) => value / 86400
  },
  {
    id: 'week',
    name: 'Weeks',
    symbol: 'wk',
    toBase: (value) => value * 604800,
    fromBase: (value) => value / 604800
  },
  {
    id: 'month',
    name: 'Months',
    symbol: 'mo',
    toBase: (value) => value * 2629746,
    fromBase: (value) => value / 2629746
  },
  {
    id: 'year',
    name: 'Years',
    symbol: 'yr',
    toBase: (value) => value * 31556952,
    fromBase: (value) => value / 31556952
  }
];

export const unitCategories: UnitCategory[] = [
  { id: 'length', name: 'Length', units: lengthUnits },
  { id: 'weight', name: 'Weight', units: weightUnits },
  { id: 'temperature', name: 'Temperature', units: temperatureUnits },
  { id: 'area', name: 'Area', units: areaUnits },
  { id: 'volume', name: 'Volume', units: volumeUnits },
  { id: 'speed', name: 'Speed', units: speedUnits },
  { id: 'time', name: 'Time', units: timeUnits }
];

export const convertUnit = (
  value: number,
  fromUnit: Unit,
  toUnit: Unit,
  category: UnitCategory
): number => {
  if (fromUnit.id === toUnit.id) return value;
  
  // Special handling for temperature (non-linear conversions)
  if (category.id === 'temperature') {
    if (fromUnit.id === 'c' && toUnit.id === 'f') {
      return (value * 9/5) + 32;
    } else if (fromUnit.id === 'f' && toUnit.id === 'c') {
      return (value - 32) * 5/9;
    } else if (fromUnit.id === 'c' && toUnit.id === 'k') {
      return value + 273.15;
    } else if (fromUnit.id === 'k' && toUnit.id === 'c') {
      return value - 273.15;
    } else if (fromUnit.id === 'f' && toUnit.id === 'k') {
      return ((value - 32) * 5/9) + 273.15;
    } else if (fromUnit.id === 'k' && toUnit.id === 'f') {
      return ((value - 273.15) * 9/5) + 32;
    }
  }
  
  // Standard conversion through base unit
  const baseValue = fromUnit.toBase(value);
  return toUnit.fromBase(baseValue);
};