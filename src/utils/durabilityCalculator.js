// Utility functions for calculating system durability and availability
const calculateSystemReliability = (config) => {
  const LAMBDA_SSD = 0.005;
  const LAMBDA_HDD = 0.01;
  const LAMBDA_Server = 0.01;
  const TIME_YEAR = 1;
  const AvailabilityMTTR = 24;
  const vpodSsdCapacity = 1.92;

  // Destructure configuration
  const { jbodSize, vpodCount, vpodHddCapacity } = config;
  const [dataBits, parityBits] = config.encodingScheme.split('+').map(Number);

  const codingWidth = dataBits + parityBits;

  // Calculate number of HDDs per OSD based on JBOD size
  const numHddPerOsd = jbodSize === 108 ? 9 : 6.5;
  // Calculate Annual Failure Rate (AFR) for a single OSD
  const calculateDurabilityAFR = () => {
    return 1 - Math.exp(-1 * (numHddPerOsd * LAMBDA_HDD + 1 * LAMBDA_SSD) * TIME_YEAR);
  };
  const calculateAvailabilityAFR = LAMBDA_Server;

  // Calculate Mean Time Between Failures (MTBF)
  const DurabilityMTBF = 8760 / calculateDurabilityAFR(); // 8760 hours in a year
  const AvailabilityMTBF = 8760 / calculateAvailabilityAFR; // 8760 hours in a year

  const calculateDurabilityMTTR = () => {
 
    const osdSize = jbodSize === 108 ? (((108 / 12) * vpodHddCapacity) + (0.5 * vpodSsdCapacity)) 
    : (((78 / 12) * vpodHddCapacity) + (0.5 * vpodSsdCapacity )); // Size in TB
    const speed = vpodHddCapacity === 18 ? numHddPerOsd * 320 * 0.25 : numHddPerOsd * 160 * 0.25; // Speed in MB/s
    const mttrSeconds = (osdSize * 1000000) / speed; // Convert TB to MB
    return mttrSeconds / 3600; // Convert to hours
    
  };
  
  // Calculate RAID6 Mean Time To Data Loss
  const MTTDL_R6 = Math.pow(DurabilityMTBF, 3) / (codingWidth * (codingWidth - 1) * (codingWidth - 2) * Math.pow(calculateDurabilityMTTR(), 2));
   
  // Calculate Distributed RAID Mean Time To Data Loss
  const MTTDL_DR = MTTDL_R6 * Math.pow(((vpodCount * 12) / codingWidth), ((parityBits * (parityBits - 1)) / 2));


    // Calculate RAID6 Mean Time To Not Available
    const MTTNA_R6 = () => {
    if (vpodCount < (dataBits + parityBits)) {
        return Math.pow(AvailabilityMTBF, 2) / (vpodCount * (vpodCount - 1) * Math.pow(AvailabilityMTTR, 2));
    } else {
        return Math.pow(AvailabilityMTBF, 3) / ((codingWidth * (codingWidth - 1) * (codingWidth - 2)) * Math.pow(AvailabilityMTTR, 3));
    }
    };

 // Calculate Distributed RAID Mean Time To Not Available
    const MTTNA_DR = () => {
      if (vpodCount < (dataBits + parityBits)) {
          return MTTNA_R6();
      } else {
          return MTTNA_R6() * Math.pow((vpodCount / codingWidth) , ((parityBits * (parityBits - 1)) / 2));
      }
      };

  // Main calculation flow
  const DurabilityAFR = calculateDurabilityAFR();
  const AvailabilityAFR = calculateDurabilityAFR();
  const DurabilityMTTR = calculateDurabilityMTTR();

  
  // Calculate durability
  const mttdlR6 = MTTDL_R6;
  const mttdlDR = MTTDL_DR;
  const durability = Math.exp(-8760 / MTTDL_DR);
  const durabilityNines = -Math.log10(1 - durability);

  // Calculate availability
  const availability = Math.exp((-8760 / MTTNA_DR()));
  let availabilityNines = -Math.log10(1 - availability);

  // Compare availabilityNines to durabilityNines
  if (availabilityNines > durabilityNines) {
    availabilityNines = durabilityNines;
  }

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