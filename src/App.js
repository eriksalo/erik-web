import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table.tsx';
import logo from './logo.svg';
import { quarterlyPricing , hddCapacities, veloSsdCapacities, jbodSizes, compressionRatio } from './constants/pricing';
import { generatePDF } from './utils/pdfGenerator';
import { calculateTotalEffectiveCapacity } from './utils/raw2Useable';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
//import { useV5000pricing } from './utils/useV5000pricing';
//import { hddCapacities, veloSsdCapacities, jbodSizes, compressionRatio, quarters} from './constants/v5000constants';
import { generateClient } from 'aws-amplify/api';
import { listParts } from './graphql/queries.js';
import calculateSystemReliability from './utils/durabilityCalculator';

//************************************************************************************
// Set initial configuration                                                       
//************************************************************************************

Amplify.configure(awsconfig);
const client = generateClient();

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

const[parts, setParts] = useState([]);
      
    const fetchPricing = async () => { 
        try {
          const erikwebPricing = await client.graphql(listParts);
          const partList = erikwebPricing.data.listParts.partNumber;
          console.log('ErikwebPricing:', partList);
          setParts(partList);

        } catch (error) {
          console.error('error of fetching pricing', error);
    }
  };
  
    //Load pricing data from the API
   //   const { pricing, loading, error } = useV5000pricing(config.quarter);
  //    console.log('Eri main Config.quarter is:', config.quarter);
  
 // console.log('Component render state:', { pricing, loading, error });

      // Access prices like:
    //console.log(pricing.velo); // Price for VCH-5000-D1N
   // console.log(pricing.ssd_15_3); // Price for 15.3TB SSD

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
  const [ssdSoftware, setSsdSoftware] = useState(config.ssdSoftware || 0);
  const [hddSoftware, setHddSoftware] = useState(config.hddSoftware || 0);
  const [discountMonths, setDiscountMonths] = useState(config.discountMonths || 0);
  const [bom, setBom] = useState([]);
  const [dollarsPerRawTB, setDollarsPerRawTB] = useState(0);
  
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
    const handleVpodSsdCapacityChange = (value) => {
      setConfig(prev => ({
        ...prev,
        vpodSsdCapacity: parseFloat(value) || 0 // Ensure it's a number
      }));
    };
    
    const [dataBits, parityBits, spareBits] = config.encodingScheme.split('+').map(Number);
     
    const reliabilityMetrics = calculateSystemReliability({
      vpodHddCapacity: config.vpodHddCapacity,
      jbodSize: config.jbodSize,
      vpodCount: config.vpodCount,
      encodingScheme: config.encodingScheme
    });
    const results = calculateSystemReliability(config);
    console.log('Reliability Metrics:', reliabilityMetrics);
    
//************************************************************************************
// UseEffect section to Calculate metrics and BOM when configuration changes                                                   
//************************************************************************************

  useEffect(() => {
    

    fetchPricing();

    // Guard clause - only proceed if pricing data is available
    //if (!pricing) return;

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

    const pricing = quarterlyPricing[config.quarter];
    setHddSoftware(pricing.hddSoftware);
    setSsdSoftware(pricing.ssdSoftware);
    setDiscountMonths(pricing.discountMonths);

    const baseHddSoftware = config.hddSoftware || pricing.hddSoftware;
    const baseSsdSoftware = config.ssdSoftware || pricing.ssdSoftware;
    


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
    const ssdSoftwareCost = ssdSoftwareUnits * baseSsdSoftware;
    const hddSoftwareCost = hddSoftwareUnits * baseHddSoftware;
  
    // Calculate software discount
    const discountCost = -1 * config.discountMonths * pricing.softwareDiscount * totalSoftwareUnits;
    //console.log('config.discountMonths', config.discountMonths);
    //console.log('pricing.softwareDiscount', pricing.softwareDiscount);
    //console.log('units', totalSoftwareUnits);
    //console.log('Discount Costs', discountCost);
    
    // Calculate hardware costs
    const hardwareCost = config.veloCount * pricing.velo +
                       config.vpodCount * pricing.vpod +
                       config.vpodCount * (config.jbodSize === 78 ? pricing.jbod78 : pricing.jbod108) +
                       config.veloCount * 12 * pricing[`ssd_${config.veloSsdCapacity.toString().replace('.', '_')}`] +
                       config.vpodCount * 12 * pricing.ssd_3_84 +
                       config.vpodCount * config.jbodSize * pricing[`hdd_${config.vpodHddCapacity}`];

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
     //console.log('Total Solution Cost:', totalSolutionCost);
     //console.log('Total RAW Capacity', veloSsdCapacity + hddCapacity);
     //console.log('Dollars per Raw TB:', dollarsPerRawTB);
     
    // Generate Bill of Materials
    const bomItems = [
       {
        item: "SSD Software Subscription",
        months: config.subscriptionMonths,
        quantity: Math.ceil(totalSsdCapacity / 10),
        unitCost: baseSsdSoftware,
        totalCost: ssdSoftwareCost
      },
      {
        item: "HDD Software Subscription",
        months: config.subscriptionMonths,
        quantity: Math.ceil(totalHddCapacity / 10),
        unitCost: baseHddSoftware,
        totalCost: hddSoftwareCost
      },
      {
        item: "Software Discount",
        quantity: (Math.ceil(totalSsdCapacity / 10) + Math.ceil(totalHddCapacity / 10)),
        months: config.discountMonths,
        unitCost: pricing.softwareDiscount,
        totalCost: discountCost
      },
      {
        item: "Service Cost",
        months: config.subscriptionMonths,
        quantity: 1,
        unitCost: totalServiceCost / config.subscriptionMonths,
        totalCost: totalServiceCost
      },
      {},
      {
        item: "VeLO Director",
        quantity: config.veloCount,
        unitCost: pricing.velo,
        totalCost: config.veloCount * pricing.velo
      },
      {
        item: "VPOD Controller",
        quantity: config.vpodCount,
        unitCost: pricing.vpod,
        totalCost: config.vpodCount * pricing.vpod
      },
      {
        item: `JBOD (${config.jbodSize} bays)`,
        quantity: config.vpodCount,
        unitCost: config.jbodSize === 78 ? pricing.jbod78 : pricing.jbod108,
        totalCost: config.vpodCount * (config.jbodSize === 78 ? pricing.jbod78 : pricing.jbod108)
      },
      {
        item: `${config.veloSsdCapacity}TB SSD (VeLO)`,
        quantity: config.veloCount * 12,
        unitCost: pricing[`ssd_${config.veloSsdCapacity.toString().replace('.', '_')}`],
        totalCost: config.veloCount * 12 * pricing[`ssd_${config.veloSsdCapacity.toString().replace('.', '_')}`]
      },
      {
        item: "3.84TB SSD (VPOD)",
        quantity: config.vpodCount * 12,
        unitCost: pricing.ssd_3_84,
        totalCost: config.vpodCount * 12 * pricing.ssd_3_84
      },
      {
        item: `${config.hddSize}TB HDD`,
        quantity: config.vpodCount * config.jbodSize,
        unitCost: pricing[`hdd_${config.vpodHddCapacity}`],
        totalCost: config.vpodCount * config.jbodSize * pricing[`hdd_${config.vpodHddCapacity}`]
      },
      {},
      {
        item: 'Solution Price',
        totalCost: totalSolutionCost
      }
     
    ];


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
      useableEff: (metrics.totalEffectiveCapacity / metrics.totalRawCapacity) * 100,
      effectiveEff: (metrics.totalCompressedEffectiveCapacity / metrics.totalRawCapacity) * 100
    });
      
    // Calculate dollarsPerRawTB
    
    setDollarsPerRawTB(dollarsPerRawTB);     

    setBom(bomItems);
  }, [minRawCapacity, 
    metrics.totalRawCapacity, 
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
                  <TableHead className="text-center font-bold text-black">Unit Price</TableHead>
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
                    <TableCell className="text-right">{item.unitCost !== undefined ? `$${Number(item.unitCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ""}</TableCell>
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