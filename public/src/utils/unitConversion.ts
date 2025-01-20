// src/utils/unitConversion.ts
interface ConversionFactor {
    metric: string;
    imperial: string;
    toMetric: number;
    toImperial: number;
  }
  
  // Conversion factors for common kitchen measurements
  const conversionTable: { [key: string]: ConversionFactor } = {
    // Volume
    cup: {
      metric: 'ml',
      imperial: 'cup',
      toMetric: 236.588,
      toImperial: 0.00423
    },
    tbsp: {
      metric: 'ml',
      imperial: 'tbsp',
      toMetric: 14.787,
      toImperial: 0.067628
    },
    tsp: {
      metric: 'ml',
      imperial: 'tsp',
      toMetric: 4.929,
      toImperial: 0.202884
    },
    fl: {
      metric: 'ml',
      imperial: 'fl oz',
      toMetric: 29.5735,
      toImperial: 0.033814
    },
    // Weight
    oz: {
      metric: 'g',
      imperial: 'oz',
      toMetric: 28.3495,
      toImperial: 0.035274
    },
    lb: {
      metric: 'g',
      imperial: 'lb',
      toMetric: 453.592,
      toImperial: 0.00220462
    },
    // Temperature
    f: {
      metric: 'C',
      imperial: 'F',
      toMetric: 1,  // Special case, handled separately
      toImperial: 1
    }
  };
  
  // Unit aliases for normalization
  const unitAliases: { [key: string]: string } = {
    'cups': 'cup',
    'cup': 'cup',
    'tablespoon': 'tbsp',
    'tablespoons': 'tbsp',
    'tbsp': 'tbsp',
    'tbs': 'tbsp',
    'teaspoon': 'tsp',
    'teaspoons': 'tsp',
    'tsp': 'tsp',
    'fluid ounce': 'fl',
    'fluid ounces': 'fl',
    'fl oz': 'fl',
    'ounce': 'oz',
    'ounces': 'oz',
    'oz': 'oz',
    'pound': 'lb',
    'pounds': 'lb',
    'lb': 'lb',
    'lbs': 'lb',
    'gram': 'g',
    'grams': 'g',
    'g': 'g',
    'kilogram': 'kg',
    'kilograms': 'kg',
    'kg': 'kg',
    'milliliter': 'ml',
    'milliliters': 'ml',
    'ml': 'ml',
    'liter': 'l',
    'liters': 'l',
    'l': 'l',
    'fahrenheit': 'f',
    'f': 'f',
    'celsius': 'c',
    'c': 'c'
  };
  
  export function normalizeUnit(unit: string): string {
    const normalized = unitAliases[unit.toLowerCase()];
    return normalized || unit;
  }
  
  export function convertTemperature(value: number, from: string, to: string): number {
    if (from === to) return value;
    
    if (from === 'F' && to === 'C') {
      return Math.round((value - 32) * 5/9);
    } else if (from === 'C' && to === 'F') {
      return Math.round((value * 9/5) + 32);
    }
    
    return value;
  }
  
  export function convertUnit(value: number, fromUnit: string, toSystem: 'metric' | 'imperial'): {
    value: number;
    unit: string;
  } {
    const normalizedUnit = normalizeUnit(fromUnit);
    const conversion = conversionTable[normalizedUnit];
  
    if (!conversion) {
      return { value, unit: fromUnit }; // Return original if no conversion found
    }
  
    // Handle temperature conversion separately
    if (normalizedUnit === 'f') {
      const convertedTemp = toSystem === 'metric' 
        ? convertTemperature(value, 'F', 'C')
        : convertTemperature(value, 'C', 'F');
      return {
        value: convertedTemp,
        unit: toSystem === 'metric' ? 'C' : 'F'
      };
    }
  
    // Handle metric to imperial or vice versa
    let convertedValue: number;
    let convertedUnit: string;
  
    if (toSystem === 'metric') {
      convertedValue = value * conversion.toMetric;
      convertedUnit = conversion.metric;
    } else {
      convertedValue = value * conversion.toImperial;
      convertedUnit = conversion.imperial;
    }
  
    // Round to reasonable precision
    convertedValue = Math.round(convertedValue * 100) / 100;
  
    // Scale units if necessary
    if (toSystem === 'metric') {
      if (convertedValue >= 1000 && convertedUnit === 'g') {
        convertedValue = convertedValue / 1000;
        convertedUnit = 'kg';
      } else if (convertedValue >= 1000 && convertedUnit === 'ml') {
        convertedValue = convertedValue / 1000;
        convertedUnit = 'l';
      }
    }
  
    return {
      value: convertedValue,
      unit: convertedUnit
    };
  }