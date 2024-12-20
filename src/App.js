import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table.tsx';
import logo from './logo.svg';
import { productDb, hddCapacities, veloSsdCapacities, jbodSizes, compressionRatio } from './constants/pricing.ts';
import { generatePDF } from './utils/pdfGenerator';
import { calculateTotalEffectiveCapacity } from './utils/raw2Useable';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import calculateSystemReliability from './utils/durabilityCalculator';
import _ from 'lodash';

//************************************************************************************
// Set initial configuration                                                       
//************************************************************************************

const VELO_DIRECTOR_PN = 'VCH-5000-D1N';
const STORAGE_NODE_PN = 'VCH-5000-S1N';
const HDD_BASE_PN = 'VCH-5000-J';
const SSD_BASE_PN = 'VCH-NVME-';
const STORAGE_NODE_SSD_PN = 'VCH-NVME-1.9s';
const SSD_SOFTWARE_PN = 'VDP-SW-P-10-HP';
const HDD_SOFTWARE_PN = 'VDP-SW-P-10-C';
const SOFTWARE_DISCOUNT_PN = 'VDP-SW-P-10-PD';
const servicePn = 'HW-Support-NBD';
const HW_SUPPORT_YR_67 = 'HW-Support-NBD Yr 6-7';
const INSTALLATION = 'SVC-R1-CINT-PDEP-NORACK';
 // Load the product database
// const [productDb] = useState(productDb);

Amplify.configure(awsconfig);

const StorageConfigurator = () => {
  
  //Amplify.configure(config);
  // Configuration state:  Set initial base options and config options
  const [config, setConfig] = useState({
    quarter: "2025-Q1",
    subscriptionMonths: 36, // Default to 36 months
    serviceOption: "standard", // Options: "standard", "noReturnMedia", "noReturnHardware"
    interfaceOption: "Ethernet", // Options: "Ethernet", "Infiniband"
    compressionRatio: 2,
    vpodCount: 3,
    veloCount: 3,
    jbodSize: 78,
    veloSsdCapacity: 3.84,
    vpodHddCapacity: 24,
    vpodSsdCapacity: 1.92,
    discountMonths: 0,
    ssdSoftware: 100,
    hddSoftware: 8,
    encodingScheme: "4+2+2"
  });


  // Calculated metrics state
  const [metrics, setMetrics] = useState({
    totalVeloSsdCapacity: 0,
    totalVpodSsdCapacity: 0,
    totalSsdCapacity:  0,
    totalHddCapacity: 0,
    totalRawCapacity: 0,
    ratioSsdHdd: 0,
    totalIops: 0,
    totalInodes: 0,
    totalMetadata: 0,
    totalReadTransferRate: 0,
    totalWriteTransferRate: 0,
    totalSolutionCost: 0,
    ssPercenatge: 0,
    totalEffectiveCapacity: 0,
    totalCompressedEffectiveCapacity: 0,
    vpodUseableCapacity: 0,
    veloUseableCapacity: 0,
    useableEff: 0,
    effectiveEff: 0
  });

  const [minRawCapacity, setMinRawCapacity] = useState(0);
  const prevConfigRef = useRef(config);
  const [bom, setBom] = useState([]);
  const [dollarsPerRawTB, setDollarsPerRawTB] = useState(0);
  
  // Helper function to get product price
  const getProductPrice = (partNumber, quarter) => {
    if (!productDb?.products[partNumber]) return 0;
    const quarterMapping = {
      '2024-Q1': 'pricingQ12024',
      '2024-Q2': 'pricingQ22024',
      '2024-Q3': 'pricingQ32024',
      '2024-Q4': 'pricingQ42024',
      '2025-Q1': 'pricingQ12025',
      '2025-Q2': 'pricingQ22025',
      '2025-Q3': 'pricingQ32025',
      '2025-Q4': 'pricingQ42025'
    };
    return productDb.products[partNumber][quarterMapping[quarter]] || 0;
  };

  const getProductDescription = (partNumber) => {
    if (!productDb?.products[partNumber]) return 0;
    return productDb.products[partNumber].description || "";
  };
  const getProductDiscount = (partNumber) => {
    if (!productDb?.products[partNumber]) return 0;
    return productDb.products[partNumber].discount || 0;
  };
  // Helper function to get HDD part number
  const getHddPartNumber = (size, jbodSize) => {
    const jbodCount = jbodSize.toString();
    if (size === 24) {
      return `${HDD_BASE_PN}${jbodCount}-${size * jbodSize}s`;
    }
    return `${HDD_BASE_PN}${jbodCount}-${size * jbodSize}`;
  };

  // Helper function to get SSD part number
  const getSsdPartNumber = (capacity) => {
    return `${SSD_BASE_PN}${capacity.toString().replace('.', '_')}s`;
  };
// Available encoding schemes based on VPOD count
const getAvailableEncodingSchemes = (vpodCount) => {
  if (vpodCount === 3) return ["4+2+2"];
  if (vpodCount === 4) return ["6+2+2"];
  if (vpodCount === 5) return ["8+2+2"];
  if (vpodCount === 6) return ["8+2+2", "9+2+2", "10+2+2"];
  if (vpodCount === 7) return ["9+2+2", "10+2+2", "12+2+2"];
  if (vpodCount === 8) return ["9+2+2", "10+2+2", "12+2+2", "12+2+4", "14+2+2", "14+2+4"];
  if (vpodCount >= 8) return ["9+2+2", "10+2+2", "12+2+2", "12+2+4", "14+2+2", "14+2+4", "16+2+2", "16+2+4"];
  return [];
};
 // Ensure JBOD config is valid
    const handleJbodSizeChange = (value) => {
      const newJbodSize = parseInt(value);
      let newVeloHddCapacity = config.vpodHddCapacity;

      if (newJbodSize === 108 && newVeloHddCapacity === 18) {
        newVeloHddCapacity = hddCapacities.find(size => size !== 18); // Default to the first valid size
      }

     setConfig({...config, jbodSize: newJbodSize, vpodHddCapacity: newVeloHddCapacity});
     };

  // Special pricing handlers
    const handleSsdSoftwareChange = (e) => {
      const value = parseFloat(e.target.value);
      setConfig(prev => ({
        ...prev,
        ssdSoftware: isNaN(value) ? 0 : value
      }));
    };

    const handleHddSoftwareChange = (e) => {
      const value = parseFloat(e.target.value);
      setConfig(prev => ({
        ...prev,
        hddSoftware: isNaN(value) ? 0 : value
      }));
    };

    const handleDiscountMonthsChange = (e) => {
      const value = parseFloat(e.target.value);
      setConfig(prev => ({
        ...prev,
        discountMonths: isNaN(value) ? 0 : value
      }));
    };
    
    const [dataBits, parityBits] = config.encodingScheme.split('+').map(Number);
     
    const reliabilityMetrics = calculateSystemReliability({
      vpodHddCapacity: config.vpodHddCapacity,
      jbodSize: config.jbodSize,
      vpodCount: config.vpodCount,
      encodingScheme: config.encodingScheme
    });
        
//************************************************************************************
// UseEffect section to Calculate metrics and BOM when configuration changes                                                   
//************************************************************************************

  useEffect(() => {
    
   
    if (!productDb) return;

    // Calculate hardware costs
    const veloDirectorCost = config.veloCount * getProductPrice(VELO_DIRECTOR_PN, config.quarter);
    const storageNodeCost = config.vpodCount * getProductPrice(STORAGE_NODE_PN, config.quarter);
    
    const hddPartNumber = getHddPartNumber(config.vpodHddCapacity, config.jbodSize);
    const hddCost = config.vpodCount * config.jbodSize * getProductPrice(hddPartNumber, config.quarter);
    
    const veloSsdPartNumber = getSsdPartNumber(config.veloSsdCapacity);
    const veloSsdCost = config.veloCount * 12 * getProductPrice(veloSsdPartNumber, config.quarter);
    
    const vpodSsdPartNumber = getSsdPartNumber(config.vpodSsdCapacity);
    const vpodSsdCost = config.vpodCount * 12 * getProductPrice(vpodSsdPartNumber, config.quarter);

    const hardwareCost = veloDirectorCost + storageNodeCost + hddCost + veloSsdCost + vpodSsdCost;

    // Calculate service costs using the new part numbers
    const standardServicePn = 'HW-Support-NBD';
    const noReturnMediaPn = 'HW-Support-NBD-NR-MEDIA';
    const noReturnHardwarePn = 'HW-Support-NBD-NR-NM';

    let servicePn = standardServicePn;
    if (config.serviceOption === 'noReturnMedia') {
      servicePn = noReturnMediaPn;
    } else if (config.serviceOption === 'noReturnHardware') {
      servicePn = noReturnHardwarePn;
    }

    // const serviceRate = getProductPrice(servicePn, config.quarter);
    // const totalServiceCost = hardwareCost * serviceRate * config.subscriptionMonths;

    // Calculate software costs
    const ssdSoftwarePn = 'VDP-SW-P-10-HP';
    const hddSoftwarePn = 'VDP-SW-P-10-C';
    const softwareDiscountPn = 'VDP-SW-P-10-PD';

    const ssdSoftwareRate = getProductPrice(ssdSoftwarePn, config.quarter);
    const hddSoftwareRate = getProductPrice(hddSoftwarePn, config.quarter);
    const softwareDiscountRate = getProductPrice(softwareDiscountPn, config.quarter);

   

    
    // Update metrics
    setMetrics({
      // ... Your existing metrics updates ...
    });
    
    // Calculate SSD capacity
    const totalVeloSsdCapacity = config.veloCount * 12 * config.veloSsdCapacity;
    const totalVpodSsdCapacity = config.vpodCount * 12 * config.vpodSsdCapacity;
    const totalSsdCapacity = totalVeloSsdCapacity + totalVpodSsdCapacity;
    // Calculate HDD capacity
    const totalHddCapacity = config.vpodCount * config.jbodSize * config.vpodHddCapacity;
    
    const computeUnits = () => {
      let totalRawCapacity = metrics.totalRawCapacity; // Capacity system
      let requiredVeloUnits = config.veloCount;
      let requiredVpodUnits = config.vpodCount;

      // Decrement VPOD count until the raw capacity dips below the minimum
      while (totalRawCapacity >= minRawCapacity && requiredVpodUnits > 3) {
        requiredVpodUnits -= 1;
        totalRawCapacity = requiredVeloUnits * 12 * config.veloSsdCapacity + requiredVpodUnits * config.jbodSize * config.vpodHddCapacity + requiredVpodUnits * 12 * config.vpodSsdCapacity;
      }
      // Increment VPOD count until the raw capacity dips below the minimum
      while (totalRawCapacity < minRawCapacity) {
        requiredVpodUnits += 1;
        totalRawCapacity = requiredVeloUnits * 12 * config.veloSsdCapacity + requiredVpodUnits * config.jbodSize * config.vpodHddCapacity + requiredVpodUnits * 12 * config.vpodSsdCapacity;
      }
      // Ensure the VPOD count does not go below 3
      requiredVpodUnits = Math.max(3, requiredVpodUnits);

      if (prevConfigRef.current.vpodCount !== requiredVpodUnits) {
        setConfig((prevConfig) => ({
          ...prevConfig,
          vpodCount: requiredVpodUnits
        }));
      }

      prevConfigRef.current = { ...config, veloCount: requiredVeloUnits, vpodCount: requiredVpodUnits };
    };

    computeUnits();


    // Prepare the configuration object needed for capacity calculations
        const capacityConfig = {
          vpodCount: config.vpodCount,
          jbodSize: config.jbodSize,
          vpodHddCapacity: config.vpodHddCapacity,
          vpodSsdCapacity: config.vpodSsdCapacity,
          veloCount: config.veloCount,
          veloSsdCapacity: config.veloSsdCapacity
        };
       //('capacityConfig', capacityConfig);

    // Calculate capacities using the imported function
    const capacityResults = calculateTotalEffectiveCapacity(capacityConfig, config.encodingScheme);

    const availableSchemes = getAvailableEncodingSchemes(config.vpodCount) || [];
    if (!availableSchemes.includes(config.encodingScheme)) {
      // If current scheme is invalid for new vpodCount, select the first available scheme
      setConfig(prev => ({
        ...prev,
        encodingScheme: availableSchemes[0]
      }));
    }
    
    // Calculate performance metrics (example values - adjust as needed)
    const iopsPerVelo = 2;
    const metadataPerVelo = 225;
    const inodesPerVelo = 333;

    // Adjust throughput based on JBOD size and HDD size
    let transferRatePerVpod;
    if (config.jbodSize === 78) {
      transferRatePerVpod = config.vpodHddCapacity === 18 ? 24.96 : 12.48;
    } else if (config.jbodSize === 108) {
      transferRatePerVpod = 17.28;
    }

    // Calculate software subscription costs
    const ssdSoftwareUnits = Math.ceil(totalSsdCapacity / 10) * config.subscriptionMonths;
    const hddSoftwareUnits = Math.ceil(totalHddCapacity / 10) * config.subscriptionMonths;
    const totalSoftwareUnits = Math.ceil(metrics.totalRawCapacity / 10);
    const ssdSoftwareCost = ssdSoftwareUnits * ssdSoftwareRate;
    const hddSoftwareCost = hddSoftwareUnits * hddSoftwareRate;
  
    // Calculate software discount
    const discountCost = -1 * config.discountMonths * softwareDiscountRate * totalSoftwareUnits;
    
    // Calculate hardware costs
    // const hardwareCost = config.veloCount * pricing.velo +
    //                    config.vpodCount * pricing.vpod +
    //                    config.vpodCount * (config.jbodSize === 78 ? pricing.jbod78 : pricing.jbod108) +
    //                    config.veloCount * 12 * pricing[`ssd_${config.veloSsdCapacity.toString().replace('.', '_')}`] +
    //                    config.vpodCount * 12 * pricing.ssd_3_84 +
    //                    config.vpodCount * config.jbodSize * pricing[`hdd_${config.vpodHddCapacity}`];

    // Calculate service costs
    const basicServiceCost = hardwareCost * 0.0063 * Math.min(config.subscriptionMonths, 60) +
                           hardwareCost * 0.0158 * Math.max(config.subscriptionMonths - 60, 0);
    let totalServiceCost = basicServiceCost;
    if (config.serviceOption === "noReturnMedia") {
      totalServiceCost *= 1.36;
    } else if (config.serviceOption === "noReturnHardware") {
    totalServiceCost *= 1.598;
    }

    // Calculate total solution cost
    const totalSolutionCost = ssdSoftwareCost + hddSoftwareCost + discountCost + totalServiceCost + hardwareCost;
    
  // Calculate dollarsPerRawTB
     const dollarsPerRawTB = totalSolutionCost / (totalSsdCapacity + totalHddCapacity);

    const bom = [
       {
        partNumber: SSD_SOFTWARE_PN, 
        item: getProductDescription(SSD_SOFTWARE_PN),
        months: config.subscriptionMonths,
        list: ssdSoftwareRate / (1 - getProductDiscount(SSD_SOFTWARE_PN)),
        quantity: Math.ceil(totalSsdCapacity / 10),
        discount: `${(getProductDiscount(SSD_SOFTWARE_PN) * 100).toFixed(0)}%`,
        unitCost: ssdSoftwareRate,
        totalCost: ssdSoftwareCost
      },
      {
        partNumber: HDD_SOFTWARE_PN,
        item: getProductDescription(HDD_SOFTWARE_PN),
        months: config.subscriptionMonths,
        list: hddSoftwareRate / (1 - getProductDiscount(HDD_SOFTWARE_PN)),
        quantity: Math.ceil(totalHddCapacity / 10),
        discount: `${(getProductDiscount(HDD_SOFTWARE_PN) * 100).toFixed(0)}%`,
        unitCost: hddSoftwareRate,
        totalCost: hddSoftwareCost
      },
      {
        partNumber: SOFTWARE_DISCOUNT_PN,
        item: getProductDescription(SOFTWARE_DISCOUNT_PN),
        quantity: (Math.ceil(totalSsdCapacity / 10) + Math.ceil(totalHddCapacity / 10)),
        list: softwareDiscountRate / (1- getProductDiscount(SOFTWARE_DISCOUNT_PN)),
        months: config.discountMonths,
        discount: `${(getProductDiscount(SOFTWARE_DISCOUNT_PN) * 100).toFixed(0)}%`,
        unitCost: softwareDiscountRate,
        totalCost: discountCost
      },
      {
        partNumber: servicePn,
        item: getProductDescription(servicePn),
        months: config.subscriptionMonths,
        quantity: 1,
        list: (totalServiceCost / config.subscriptionMonths) / (1 - getProductDiscount(servicePn)),
        discount: `${(getProductDiscount(servicePn) * 100).toFixed(0)}%`,
        unitCost: totalServiceCost / config.subscriptionMonths,
        totalCost: totalServiceCost
      },
      {
        partNumber: HW_SUPPORT_YR_67,
        item: getProductDescription(HW_SUPPORT_YR_67),
        months: config.subscriptionMonths,
        quantity: 1,
        list: (totalServiceCost / config.subscriptionMonths) / (1 - getProductDiscount(HW_SUPPORT_YR_67)),
        discount: `${(getProductDiscount(HW_SUPPORT_YR_67) * 100).toFixed(0)}%`,
        unitCost: totalServiceCost / config.subscriptionMonths,
        totalCost: totalServiceCost
      },
      {
        partNumber: INSTALLATION,
        item: getProductDescription(INSTALLATION),
        quantity: 1,
        discount: `${(getProductDiscount(INSTALLATION) * 100).toFixed(0)}%`,
        unitCost: getProductPrice(INSTALLATION , config.quarter),
        list: getProductPrice(INSTALLATION , config.quarter) / (1- getProductDiscount(INSTALLATION)),
        totalCost: getProductPrice(INSTALLATION , config.quarter)
      },
      {},
      {
        partNumber: VELO_DIRECTOR_PN,
        item: getProductDescription(VELO_DIRECTOR_PN),
        quantity: config.veloCount,
        list: getProductPrice(VELO_DIRECTOR_PN, config.quarter) / (1 - getProductDiscount(VELO_DIRECTOR_PN)),
        unitCost: getProductPrice(VELO_DIRECTOR_PN, config.quarter),
        discount: `${(getProductDiscount(VELO_DIRECTOR_PN) * 100).toFixed(0)}%`,
        totalCost: veloDirectorCost
      },
      {
        partNumber: veloSsdPartNumber,
        item: getProductDescription(veloSsdPartNumber),
        quantity: config.veloCount * 12,
        list: getProductPrice(veloSsdPartNumber, config.quarter) / (1 - getProductDiscount(veloSsdPartNumber)),
        unitCost: getProductPrice(veloSsdPartNumber, config.quarter),
        discount: `${(getProductDiscount(veloSsdPartNumber) * 100).toFixed(0)}%`,
        totalCost: veloSsdCost
      },
      {
        partNumber: STORAGE_NODE_PN,
        item: getProductDescription(STORAGE_NODE_PN),
        quantity: config.vpodCount,
        list: getProductPrice(STORAGE_NODE_PN, config.quarter) / (1 - getProductDiscount(STORAGE_NODE_PN)),
        discount: `${(getProductDiscount(STORAGE_NODE_PN) * 100).toFixed(0)}%`,
        unitCost: getProductPrice(STORAGE_NODE_PN, config.quarter),
        totalCost: storageNodeCost
      },
      {
        partNumber: hddPartNumber,
        item: getProductDescription(hddPartNumber),
        quantity: config.vpodCount,
        list: getProductPrice(hddPartNumber, config.quarter) / (1 - getProductDiscount(hddPartNumber)),
        discount: `${(getProductDiscount(hddPartNumber) * 100).toFixed(0)}%`,
        unitCost: getProductPrice(hddPartNumber, config.quarter),
        totalCost: storageNodeCost
      },
      {
        partNumber: vpodSsdPartNumber,
        item: getProductDescription(vpodSsdPartNumber),
        quantity: config.vpodCount * 12,
        list: getProductPrice(vpodSsdPartNumber, config.quarter) / (1 - getProductDiscount(vpodSsdPartNumber)),
        discount: `${(getProductDiscount(vpodSsdPartNumber) * 100).toFixed(0)}%`,
        unitCost: getProductPrice(vpodSsdPartNumber, config.quarter),
        totalCost: vpodSsdCost
      },
      {},
      {
        item: 'Solution Price',
        totalCost: totalSolutionCost
      }
     
    ];


    setBom(bom);
    // Calculate total cost
    // const totalCost = bomItems.reduce((sum, item) => sum + item.totalCost, 0);

    // Update metrics
    setMetrics({
      totalVeloSsdCapacity: totalVeloSsdCapacity,  
      totalVpodSsdCapacity: totalVpodSsdCapacity,  
      totalSsdCapacity: totalVeloSsdCapacity + totalVpodSsdCapacity,
      totalHddCapacity: totalHddCapacity,
      totalRawCapacity: totalSsdCapacity + totalHddCapacity,
      ratioSsdHdd: (totalSsdCapacity / (totalSsdCapacity + totalHddCapacity)) * 100,
      totalIops: config.veloCount * iopsPerVelo,
      totalMetadata: config.veloCount * metadataPerVelo,
      totalInodes: config.veloCount * inodesPerVelo,
      totalReadTransferRate: config.vpodCount * transferRatePerVpod,
      totalWriteTransferRate: (config.vpodCount * transferRatePerVpod) * (dataBits / (dataBits + parityBits)),
      totalSolutionCost: totalSolutionCost,
      ssPercenatge: ( 100 * (1 - (hardwareCost / totalSolutionCost ) ) ),
      vpodUseableCapacity: capacityResults.vpodUseableCapacity,
      veloUseableCapacity: capacityResults.veloUseableCapacity,
      totalEffectiveCapacity: capacityResults.totalEffectiveCapacity ,
      totalCompressedEffectiveCapacity: capacityResults.totalEffectiveCapacity * config.compressionRatio,
      useableEff: (capacityResults.totalEffectiveCapacity / metrics.totalRawCapacity) * 100,
      effectiveEff: (metrics.totalCompressedEffectiveCapacity / metrics.totalRawCapacity) * 100
    });
      
    // Calculate dollarsPerRawTB
    
    setDollarsPerRawTB(dollarsPerRawTB);     

    setBom(bom);

  }, [minRawCapacity, dataBits, parityBits,
    metrics.totalRawCapacity, 
    metrics.totalCompressedEffectiveCapacity,
    metrics.totalSsdCapacity,
    metrics.totalVeloSsdCapacity,
    metrics.totalVpodSsdCapacity,
    metrics.totalHddCapacity,
    config.veloSsdCapacity, 
    config.jbodSize, 
    config.encodingScheme, 
    config.vpodHddCapacity, 
    config.veloCount, 
    config.vpodCount, 
    config, 
    metrics.totalSolutionCost]);


//************************************************************************************
// Display section                                                  
//************************************************************************************

  return (
    
    <div className="space-y-8 p-6 bg-black min-h-screen text-white">

      <div className="flex items-center space-x-4">
         <img src={logo} alt="Logo" className="w-80" />
         <div className="text-white text-xl font-bold">
          V5000 System configurator and quote generator
          </div>
       
      </div>

     {/* Configuration Controls */}
      <Card>

  <CardHeader className="bg-vduraColor">
    <CardTitle className="bg-vduraColor text-xl font-bold text-gray-800">Baseline System Configuration</CardTitle>
  </CardHeader>
  <CardContent className="grid bg-black grid-cols-2 md:grid-cols-3 gap-4 text-white">
    <div>
      <label className="block text-white mb-2">Select Delivery Quarter</label>
      <Select
        value={config.quarter}
        onValueChange={(value) => setConfig({...config, quarter: value})}
      >
        <SelectTrigger className="w=[180px]">
          <SelectValue placeholder="Select Quarter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem className="text-white pr-8" value="2025-Q1"> Q1 2025</SelectItem>
          <SelectItem className="text-white pr-8" value="2025-Q2"> Q2 2025</SelectItem>
          <SelectItem className="text-white pr-8" value="2025-Q3"> Q3 2025</SelectItem>
          <SelectItem className="text-white pr-8" value="2025-Q4"> Q4 2025</SelectItem>
          <SelectItem className="text-white pr-8" value="2026-Q1"> Q1 2026</SelectItem>
          <SelectItem className="text-white pr-8" value="2026-Q2"> Q2 2026</SelectItem>
          <SelectItem className="text-white pr-8" value="2026-Q3"> Q3 2026</SelectItem>
          <SelectItem className="text-white pr-8" value="2026-Q4"> Q4 2026</SelectItem>
        </SelectContent>
      </Select>
    </div>

    
    <div>
      <label className="block text-white mb-2">Select Subscription Duration</label>
      <Select
        value={(config.subscriptionMonths || 0).toString()}
        onValueChange={(value) => setConfig({...config, subscriptionMonths: parseInt(value)})}
  >
       <SelectTrigger>
      <SelectValue placeholder="Select Subscription Months" />
      </SelectTrigger>
      <SelectContent>
      {[36, 48, 60, 72, 84].map(months => (
        <SelectItem className="text-white" key={months} value={months.toString()}>{months} months</SelectItem>
      ))}
      </SelectContent>
      </Select>
    </div>
    <div>
      <label className="block text-white mb-2">Select Service Option (No return, etc)</label>
      <Select
        value={config.serviceOption}
        onValueChange={(value) => setConfig({...config, serviceOption: value})}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem className="text-white" value="standard">Next Business Day</SelectItem>
          <SelectItem className="text-white" value="noReturnMedia">No Return Media</SelectItem>
          <SelectItem className="text-white" value="noReturnHardware">No Return Hardware</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div>
  <label className="block text-white mb-2">Select Network Interface</label>
  <Select
    value={config.interfaceOption}
    onValueChange={(value) => setConfig({...config, interfaceOption: value})}
  >
    <SelectTrigger>
      <SelectValue placeholder="Ethernet" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem className="text-white" value="Ethernet">Ethernet</SelectItem>
      <SelectItem className="text-white" value="Infiniband">Infiniband</SelectItem>
    </SelectContent>
  </Select>
</div>

   <div>
      <label className="block text-white mb-2">Data Compressibility</label>
      <Select
        value={config.compressionRatio.toString()}
        onValueChange={(value) => setConfig({...config, compressionRatio: parseFloat(value)})}
      >
        <SelectTrigger>
          <SelectValue placeholder=" 2:1" />
        </SelectTrigger>
        <SelectContent>
          {compressionRatio.map(size => (
            <SelectItem className="bg-white bg-opacity-0 text-white pl=2" key={size} value={size.toString()}>{"  "}{size}:1</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </CardContent>
  


  <CardHeader className="bg-vduraColor">
    <CardTitle className="bg-vduraColor text-xl font-bold text-gray-800">Performance, Capacity and Reliability Requirements</CardTitle>
  </CardHeader>



  <CardContent className="grid bg-black grid-cols-2 md:grid-cols-3 gap-4 text-white">
    <div>
      <label className="block text-white mb-2">Minimum RAW Capacity (PB), {(config.vpodCount)} Storage Servers</label>
      <input
        type="number"
        value={minRawCapacity / 1000}
          onChange={(e) => {
          const pbValue = parseFloat(e.target.value);
          setMinRawCapacity(pbValue * 1000); // Convert PB back to TB for internal use  x
        }}
        step="0.5" // Set increment to 0.5
        min="3.5"
        className="block w-full p-2 border border-gray-300 rounded bg-black text-white"
        placeholder="Enter minimum RAW capacity"
      />
    </div>
        <div>
      <label className="block text-white mb-2">Select Director Count (IOPS & Metadata)</label>
      <Select
        value={config.veloCount.toString()}
        onValueChange={(value) => setConfig({...config, veloCount: parseInt(value)})}
      >
        <SelectTrigger>
          <SelectValue className="bg-vduraColor text-xl font-bold text-white pr-8" placeholder="Select VeLO Count" />
        </SelectTrigger>
        <SelectContent>
          {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(n => (
             <SelectItem 
                className="text-white [&>span]:pl-0 [&>span:last-child]:right-2"
                key={n} 
                value={n.toString()}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="inline-block min-w-[40px]">{n}</span>
                </div>
              </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div>
      <label className="block text-white mb-2">Select SSD Capacity</label>
      <Select
        value={config.veloSsdCapacity.toString()}
        onValueChange={(value) => setConfig({...config, veloSsdCapacity: parseFloat(value)})}
      >
        <SelectTrigger className="select-trigger w-[180px]">
          <SelectValue className="select-value" placeholder="Select SSD Size" />
        </SelectTrigger>
        <SelectContent>
          {veloSsdCapacities.map(size => (
            <SelectItem className="bg-white bg-opacity-0 text-white" key={size} value={size.toString()}> {" "}{size}TB SSD</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div>
      <label className="block text-white mb-2">Select JBOD Size (1M or 1.2M)</label>
      <Select
         value={config.jbodSize.toString()}
         onValueChange={handleJbodSizeChange}
  >
         <SelectTrigger>
            <SelectValue placeholder="Select JBOD Size" />
         </SelectTrigger>
      <SelectContent>
        {jbodSizes.map(size => (
         <SelectItem className="bg-black text-white" key={size} value={size.toString()}>{size} drives</SelectItem>
      ))}
      </SelectContent>
     </Select>
    </div>

    <div>
     <label className="block text-white mb-2">Select HDD Size (Capacity / Dual Actuator)</label>
     <Select
      value={config.vpodHddCapacity.toString()}
      onValueChange={(value) => setConfig({...config, vpodHddCapacity: parseInt(value)})}
     >
     <SelectTrigger>
       <SelectValue placeholder="Select HDD Size" />
     </SelectTrigger>
     <SelectContent>
      {config.jbodSize === 78 ? (
        hddCapacities.map(size => (
          <SelectItem className="text-white" key={size} value={size.toString()}>{size}TB HDD</SelectItem>
        ))
      ) : (
        hddCapacities.filter(size => size !== 18).map(size => (
          <SelectItem className="text-white" key={size} value={size.toString()}>{size}TB HDD</SelectItem>
        ))
      )}
      </SelectContent>
     </Select>
    </div>
    <div>
      <label className="block text-white mb-2">Select Encoding Scheme</label>
      <Select
        defaultValue={config.encodingScheme}
        value={config.encodingScheme}
        onValueChange={(value) => setConfig({...config, encodingScheme: value})}
      >
        <SelectTrigger>
          <SelectValue className="text-white">
            {config.encodingScheme}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {getAvailableEncodingSchemes(config.vpodCount).map(scheme => (
            <SelectItem 
              className="text-white" 
              key={scheme} 
              value={scheme}
            >
              {scheme}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

  </CardContent>
</Card>

         {/* Updated System Attributes Card */}
      <Card>
        <CardHeader className="bg-vduraColor border-b border-gray-200">
          <CardTitle className="text-xl font-bold text-gray-800">System Attributes</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-6 p-6 text-white">
          {/* Capacity and Cost Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Capacity and Cost</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">RAW Capacity</p>
                <p className="text-2xl font-bold">
                  {metrics.totalRawCapacity.toLocaleString(undefined, { maximumFractionDigits: 0 })} TB
                  <span className="text-sm font-medium">  
                    ({metrics.ratioSsdHdd.toLocaleString(undefined, { maximumFractionDigits: 1 } )  } %SSD)</span> 
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Effective Capacity (Uncompressed/Compressed)</p>
                <p className="text-2xl font-bold">
                  {metrics.totalEffectiveCapacity.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
                  <span className="text-sm font-medium">  TB 
                    ({metrics.useableEff.toLocaleString(undefined, { maximumFractionDigits: 0 })}% Util)   </span>  
                   / {metrics.totalCompressedEffectiveCapacity.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
                  <span className="text-sm font-medium">  TB</span> 
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Solution Price</p>
                <p className="text-2xl font-bold">
                  ${Number(metrics.totalSolutionCost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Performance</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Total IOPS</p>
                <p className="text-2xl font-bold">
                  {(metrics.totalIops).toLocaleString(undefined, { maximumFractionDigits: 1 })} Million  
                  <span className="text-sm font-medium"> /s</span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Metadata Creates/Deletes, iNodes Supported</p>
                <p className="text-2xl font-bold">
                  {(metrics.totalMetadata).toLocaleString(undefined, { maximumFractionDigits: 1 })} 
                  <span className="text-sm font-medium"> k/s         </span> 
                       / {(metrics.totalInodes).toLocaleString(undefined, { maximumFractionDigits: 0 })} 
                     <span className="text-sm font-medium"> M</span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Sustained Throughput (Read/Write)</p>
                <p className="text-2xl font-bold">
                  {(metrics.totalReadTransferRate || 0).toFixed(1)} 
                  <span className="text-sm font-medium"> GB/s</span> 
                  {(metrics.totalWriteTransferRate || 0).toFixed(1)} 
                  <span className="text-sm font-medium"> GB/s</span>
                </p>
              </div>

            </div>
          </div>

          {/* Durability Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Guaranteed VDURAbility</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Erasure encoding schema</p>
                <p className="text-2xl font-bold">{config.encodingScheme}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Data Durability</p>
                <p className="text-2xl font-bold">
                  {reliabilityMetrics.durabilityNines.toFixed(1)}
                  <span className="text-sm font-medium"> 9's</span>
                </p>
              </div>
               <div>
                <p className="text-sm font-medium">Data Availability</p>
                <p className="text-2xl font-bold">
                  {reliabilityMetrics.availabilityNines.toFixed(1)}
                  <span className="text-sm font-medium"> 9's</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

     {/* Bill of Materials */}
      <Card className="border-2 border-gray-700 shadow-lg bg-vduraCol text-white">
        <CardHeader className="bg-vduraColor border-b border-gray-200">
          <CardTitle className=" bg-vduraColor text-xl font-bold text-gray-800">Bill of Materials</CardTitle>
          
        </CardHeader>
        <CardContent className="p-6">
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <Table className="w-full center-vertical">
              <TableHeader>
                <TableRow className="bg-vduraColor center-vertical">
                  <TableHead className="text-center font-bold text-black center-vertical">P/N</TableHead>
                  <TableHead className="font-bold text-black center-vertical">Description</TableHead>
                  <TableHead className="text-center font-bold text-black center-vertical">Quantity</TableHead>
                  <TableHead className="text-center font-bold text-black center-vertical">Months</TableHead>
                  <TableHead className="text-center font-bold text-black center-vertical">List Price</TableHead>
                  <TableHead className="text-center font-bold text-black center-vertical">Discount</TableHead>
                  <TableHead className="text-center font-bold text-black center-vertical">Discounted Price</TableHead>
                  <TableHead className="text-center font-bold text-black center-vertical">Extended Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bom.map((item, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900 center-vertical">{item.partNumber}</TableCell>
                    <TableCell className="font-medium text-gray-900 center-vertical">{item.item}</TableCell>
                    <TableCell className="text-center text-gray-900 center-vertical">{item.quantity}</TableCell>
                    <TableCell className="text-center font-medium text-gray-900 center-vertical">{item.months}</TableCell>
                    <TableCell className="text-right text-gray-900 center-vertical" >{item.unitCost !== undefined ? `$${Number(item.unitCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ""}</TableCell>
                    <TableCell className="text-center text-gray-900 center-vertical">{item.discount}</TableCell>
                    <TableCell className="text-right text-gray-900 center-vertical">{item.unitCost !== undefined ? `$${Number(item.unitCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ""}</TableCell>
                    <TableCell className="text-center font-semibold text-gray-900 center-vertical">{item.totalCost !== undefined ? `$${Number(item.totalCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-vduraColor">
                  <TableHead className="text-center font-bold text-black">P/N</TableHead>
                  <TableHead className="font-bold text-black">Description</TableHead>
                  <TableHead className="text-center font-bold text-black">Quantity</TableHead>
                  <TableHead className="text-center font-bold text-black">Months</TableHead>
                  <TableHead className="text-center font-bold text-black">List Price</TableHead>
                  <TableHead className="text-center font-bold text-black">Discount</TableHead>
                  <TableHead className="text-center font-bold text-black">Discounted Price</TableHead>
                  <TableHead className="text-center font-bold text-black">Extended Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bom.map((item, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-blue-500">{item.partNumber}</TableCell>
                    <TableCell className="font-medium">{item.item}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-center font-medium">{item.months}</TableCell>
                    <TableCell className="text-right">{item.unitCost !== undefined ? `$${Number(item.list).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ""}</TableCell>
                    <TableCell className="text-center">{item.discount}</TableCell>
                    <TableCell className="text-right">{item.unitCost !== undefined ? `$${Number(item.unitCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ""}</TableCell>
                    <TableCell className="text-center font-semibold">{item.totalCost !== undefined ? `$${Number(item.totalCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
       {/* System Attributes */}
      <Card>
  <CardHeader className="bg-vduraColor border-b border-gray-200">
    <CardTitle className="text-xl font-bold text-gray-800">Special Pricing</CardTitle>
  </CardHeader>
  <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-white">
      <div>
      <label className="block text-white mb-2">SSD Software Price ($)</label>
      <input
        type="number"
        value={config.ssdSoftware}
        step="0.1"  // This sets the increment to 0.1
        onChange={handleSsdSoftwareChange}
        className="block w-full p-2 border border-gray-300 rounded bg-black text-white"
        placeholder="Enter SSD Software Price"
      />
    </div>
    <div>
      <label className="block text-white mb-2">HDD Software Price ($)</label>
      <input
        type="number"
        value={config.hddSoftware}
        step="0.1"  // This sets the increment to 0.1
        onChange={handleHddSoftwareChange}
        className="block w-full p-2 border border-gray-300 rounded bg-black text-white"
        placeholder="Enter HDD Software Price"
      />
    </div>
    <div>
      <label className="block text-white mb-2">Discount Months</label>
      <input
        type="number"
              value={config.discountMonths}
              onChange={handleDiscountMonthsChange}
        className="block w-full p-2 border border-gray-300 rounded bg-black text-white"
        placeholder="Enter Discount Months"
      />
    </div>
    <div>
      <p className="text-sm font-medium">Software + Service %</p>
      <p className="text-2xl font-bold">{metrics.ssPercenatge.toLocaleString(undefined, { maximumFractionDigits: 1 })} %</p>
    </div>
     <div>
      <p className="text-sm font-medium">Dollars per Raw TB</p>
      <p className="text-2xl font-bold">${dollarsPerRawTB.toFixed(2)}</p>
    </div>
    <div>
      <p className="text-sm font-medium">Solution Price</p>
      <p className="text-2xl font-bold">${Number(metrics.totalSolutionCost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
    </div>
  </CardContent>
</Card>
      <button 
        onClick={() => {
          if (!metrics || !bom) {
            console.error('Metrics or BOM data is not ready');
            return;
          }
          generatePDF(metrics, bom);
        }} 
        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded"
      >
        Generate PDF
      </button>
    </div>
    
  );
};

export default StorageConfigurator;