// Utility functions for calculating system durability and availability
const calculateSystemReliability = (config) => {
  const LAMBDA_SSD = 0.005;
  const LAMBDA_HDD = 0.01;
  const TIME_YEAR = 1;
  
  // Destructure configuration
  const { jbodSize, vpodCount, vpodHddCapacity } = config;
  const [dataBits, parityBits] = config.encodingScheme.split('+').map(Number);
  console.log('dataBits', dataBits);
  console.log('parityBits', parityBits);

  const codingWidth = dataBits + parityBits;
  console.log('codingWidth', codingWidth);

  // Calculate number of HDDs per OSD based on JBOD size
  const numHddPerOsd = jbodSize === 108 ? 9 : 6.5;
  console.log('numHddPerOsd', numHddPerOsd);
  // Calculate Annual Failure Rate (AFR) for a single OSD
  const calculateAFR = () => {
    return 1 - Math.exp(-1 * (numHddPerOsd * LAMBDA_HDD + 1 * LAMBDA_SSD) * TIME_YEAR);
  };

  console.log('calculateAFR', calculateAFR());

  // Calculate Mean Time Between Failures (MTBF)
  const MTBF = 8760 / calculateAFR(); // 8760 hours in a year
  console.log('calculateMTBF', MTBF);

  // Calculate Mean Time To Repair (MTTR)
  console.log('vpodHddCapacity', vpodHddCapacity);
  const calculateMTTR = () => {
    const osdSize = jbodSize === 108 ? ((108 / 12) * vpodHddCapacity) : ((78 / 12) * config.vpodHddCapacity); // Size in TB
    console.log('osdSize', osdSize);
    const speed = vpodHddCapacity === 18 ? numHddPerOsd * 340 * 0.25 : numHddPerOsd * 170 * 0.25; // Speed in MB/s
    console.log('speed', speed);
    const mttrSeconds = (osdSize * 1024 * 1024) / speed; // Convert TB to MB
    return mttrSeconds / 3600; // Convert to hours
  };
    console.log('calculateMTTR', calculateMTTR());
  // Calculate RAID6 Mean Time To Data Loss
  const MTTDL_R6 = Math.pow(MTBF, 3) / (codingWidth * (codingWidth - 1) * (codingWidth - 2) * Math.pow(calculateMTTR(), 2));
  
  console.log('calculateMTTDL_R6', MTTDL_R6);
  
  // Calculate Distributed RAID Mean Time To Data Loss
  //const MTTDL_DR = MTTDL_R6 * ((vpodCount * 12) / codingWidth);
  const MTTDL_DR = MTTDL_R6 * Math.pow(((vpodCount * 12) / codingWidth), ((parityBits * (parityBits - 1)) / 2));
  
  console.log('calculateMTTDL_DR', MTTDL_DR);

    // Calculate RAID6 Mean Time To Not Available
    const MTTNA_R6 = () => {
    if (vpodCount < (dataBits + parityBits)) {
        return Math.pow(MTBF, 2) / (codingWidth * (codingWidth - 1) * Math.pow(calculateMTTR(), 2));
    } else {
        return Math.pow(MTBF, 3) / ((codingWidth * (codingWidth - 1) * (codingWidth - 2)) * Math.pow(calculateMTTR(), 3));
    }
    };
  console.log('calculateMTTNA_R6', MTTNA_R6());

  // Calculate Distributed RAID Mean Time To Not Available
  const MTTNA_DR = MTTNA_R6() * Math.pow(12 , (parityBits * ((parityBits - 1) / 2)));
    console.log('calculateMTTNA_DR', MTTNA_DR);
    

  // Main calculation flow
  const afr = calculateAFR();
  console.log('afr', afr);
  const mtbf = MTBF;
  console.log('mtbf', mtbf);
  const mttr = calculateMTTR();
  console.log('mttr', mttr);
  
  // Calculate durability
  const mttdlR6 = MTTDL_R6;
  console.log('mttdlR6', mttdlR6);
  const mttdlDR = MTTDL_DR;
  console.log('mttdlDR', mttdlDR);
  const durability = Math.exp(-8760 / MTTDL_DR);
  console.log('durability', durability);
  const durabilityNines = -Math.log10(1 - durability);
  console.log('durabilityNines', durabilityNines);

  // Calculate availability
  const availability = Math.exp(-8760 / MTTNA_DR);
  const availabilityNines = -Math.log10(1 - availability);

 console.log('durability', durability);
 console.log('durabilityNines', durabilityNines);
 console.log('availability', availability);
 console.log('availabilityNines', availabilityNines);

  return {
    durability,
    durabilityNines,
    availability,
    availabilityNines,

  };
};

// Export individual functions for direct access
export const calculateDurabilityNines = (config) => {
  const { durabilityNines } = calculateSystemReliability(config);
  return durabilityNines;
};

export const calculateAvailabilityNines = (config) => {
  const { availabilityNines } = calculateSystemReliability(config);
  return availabilityNines;
};

export default calculateSystemReliability;