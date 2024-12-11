// Utility function to get available encoding schemes based on VPOD count

// Parse encoding scheme string into components
const parseEncodingScheme = (encodingScheme) => {
   
  if (!encodingScheme || typeof encodingScheme !== 'string') {
    console.warn('Invalid encoding scheme provided, defaulting to 4+2+2');
    encodingScheme = '4+2+2'; // Default value
  }

  try {
    const [dataBits, parityBits, spareBits] = encodingScheme.split('+').map(Number);
    
    // Validate the parsed values
    if (isNaN(dataBits) || isNaN(parityBits) || isNaN(spareBits)) {
      console.warn('Invalid encoding scheme format, defaulting to 8+2+2');
      return { dataBits: 8, parityBits: 2, spareBits: 2 };
    }
    
    return { dataBits, parityBits, spareBits };
  } catch (error) {
    console.warn('Error parsing encoding scheme, defaulting to 8+2+2');
    return { dataBits: 8, parityBits: 2, spareBits: 2 };
  }
};

// Calculate VPOD useable capacity
const calculateVpodUseableCapacity = (config, encodingScheme) => {

    if (!config) {
    console.error('Configuration object is required');
    return 0;
  }
  
  const { vpodCount, jbodSize, vpodHddCapacity, vpodSsdCapacity } = config;
  const { dataBits, parityBits, spareBits } = parseEncodingScheme(encodingScheme);
  
  // Calculate OSD-related metrics
  const osdsPerJbod = jbodSize / 12;
  const osdRawCapacity = (vpodHddCapacity * (12 / jbodSize)) + (vpodSsdCapacity * 0.5);
  const rawUseableCapacityPerVpod = 12 * osdRawCapacity;
  const totalOsdCount = 12 * vpodCount;
  
  // Remove spare capacity OSDs
  const remainingOsds = totalOsdCount - spareBits;
  
  // Calculate useable capacity using encoding ratio
  const encodingRatio = dataBits / (dataBits + parityBits);
  const vpodUseableCapacity = (remainingOsds * osdRawCapacity) * encodingRatio;
  
  return vpodUseableCapacity;
};

// Calculate VeLO useable capacity
const calculateVeloUseableCapacity = (config) => {
  const { veloCount, veloSsdCapacity } = config;
  const capacityPerVelo = (veloSsdCapacity / 3) - 2;
  return veloCount * capacityPerVelo;
};

// Main function to calculate total effective capacity
export const calculateTotalEffectiveCapacity = (config, encodingScheme) => {
  // Validate encoding scheme based on VPOD count
  //const availableSchemes = getAvailableEncodingSchemes(config.vpodCount);
  //if (!availableSchemes.includes(encodingScheme)) {
  //  throw new Error(`Invalid encoding scheme ${encodingScheme} for ${config.vpodCount} VPODs. Available schemes: ${availableSchemes.join(', ')}`);
  //}
  
  // Calculate both components
  const vpodUseableCapacity = calculateVpodUseableCapacity(config, encodingScheme);
  const veloUseableCapacity = calculateVeloUseableCapacity(config);
  
  // Return total effective capacity
  return {
    totalEffectiveCapacity: vpodUseableCapacity + veloUseableCapacity,
    vpodUseableCapacity,
    veloUseableCapacity,
  };
};

// Example usage:
/*
const config = {
  vpodCount: 5,
  jbodSize: 78,
  vpodHddCapacity: 30,
  vpodSsdCapacity: 1.92,
  veloCount: 3,
  veloSsdCapacity: 3.84
};

const result = calculateTotalEffectiveCapacity(config, "8+2+2");
*/