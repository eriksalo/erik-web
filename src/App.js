import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table.tsx';
import logo from './logo.svg';
import { quarterlyPricing , hddCapacities, veloSsdCapacities, jbodSizes, compressionRatio } from './constants/pricing';
import { generatePDF } from './utils/pdfGenerator';
import { calculateTotalEffectiveCapacity } from './utils/raw2Useable';
//import { RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';

const StorageConfigurator = () => {
  // Configuration state:  Set initial base options and config options
  const [config, setConfig] = useState({
    quarter: "2025-Q1",
    subscriptionMonths: 36, // Default to 36 months
    serviceOption: "Next Busines Day", // Options: "standard", "noReturnMedia", "noReturnHardware"
    interfaceOption: "Ethernet", // Options: "Ethernet", "Infiniband"
    compressionRatio: 2,
    vpodCount: 3,
    veloCount: 3,
    jbodSize: 78,
    veloSsdCapacity: 3.84,
    vpodHddCapacity: 30,
    vpodSsdCapacity: 1.92,
    discountMonths: 0,
    ssdSoftware: 100,
    hddSoftware: 8,
    encodingScheme: `4+2+2`
  });

  // Calculated metrics state
  const [metrics, setMetrics] = useState({
    totalSsdCapacity:  0,
    totalHddCapacity: 0,
    totalRawCapacity: 0,
    ratioSsdHdd: 0,
    totalIops: 0,
    totalInodes: 0,
    totalMetadata: 0,
    totalThroughput: 0,
    totalSolutionCost: 0,
    ssPercenatge: 0,
    totalEffectiveCapacity: 0,
    vpodUseableCapacity: 0,
    veloUseableCapacity: 0
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
  if (vpodCount === 3) return ['4+2+2'];
  if (vpodCount === 4) return ['6+2+2'];
  if (vpodCount === 5) return ['8+2+2'];
  if (vpodCount === 6) return ['8+2+2', '9+2+2', '10+2+2'];
  if (vpodCount >= 7) return ['8+2+2', '9+2+2', '10+2+2', '12+2+2'];
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
   
     // Calculate metrics and BOM when configuration changes
  useEffect(() => {
    
    const computeUnits = () => {
      let totalRawCapacity = metrics.totalRawCapacity; // Capacity system
      let requiredVeloUnits = config.veloCount;
      let requiredVpodUnits = config.vpodCount;

      // Decrement VPOD count until the raw capacity dips below the minimum
      while (totalRawCapacity >= minRawCapacity && requiredVpodUnits > 3) {
        requiredVpodUnits -= 1;
        totalRawCapacity = requiredVeloUnits * config.veloSsdCapacity + requiredVpodUnits * config.jbodSize * config.vpodHddCapacity;
      }
      // Increment VPOD count until the raw capacity dips below the minimum
      while (totalRawCapacity < minRawCapacity) {
        requiredVpodUnits += 1;
        totalRawCapacity = requiredVeloUnits * config.veloSsdCapacity + requiredVpodUnits * config.jbodSize * config.vpodHddCapacity;
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
    setHddSoftware(quarterlyPricing[config.quarter].hddSoftware);
    setSsdSoftware(quarterlyPricing[config.quarter].ssdSoftware);
    setDiscountMonths(quarterlyPricing[config.quarter].discountMonths);

    const baseHddSoftware = config.hddSoftware || pricing.hddSoftware;
    const baseSsdSoftware = config.ssdSoftware || pricing.ssdSoftware;
    
    // Calculate SSD capacity
    const veloSsdCapacity = config.veloCount * 12 * config.veloSsdCapacity;
    const vpodSsdCapacity = config.vpodSsdCapacity * 12* config.vpodSsdCapacity;

    // Calculate HDD capacity
    const hddCapacity = config.vpodCount * config.jbodSize * config.vpodHddCapacity;

    // Prepare the configuration object needed for capacity calculations
        const capacityConfig = {
          vpodCount: config.vpodCount,
          jbodSize: config.jbodSize,
          vpodHddCapacity: config.vpodHddCapacity,
          vpodSsdCapacity: config.vpodSsdCapacity,
          veloCount: config.veloCount,
          veloSsdCapacity: config.veloSsdCapacity
        };
       console.log('capacityConfig', capacityConfig);

    // Calculate capacities using the imported function
    const capacityResults = calculateTotalEffectiveCapacity(capacityConfig, config.encodingScheme);
    
    // Calculate performance metrics (example values - adjust as needed)
    const iopsPerVelo = 2;
    const metadataPerVelo = 225;
    const inodesPerVelo = 333;

    // Adjust throughput based on JBOD size and HDD size
    let transferRatePerVpod;
    if (config.jbodSize === 78) {
      transferRatePerVpod = config.vpodHddCapacity === 18 ? 26.4 : 13.2;
    } else if (config.jbodSize === 108) {
      transferRatePerVpod = 17.8;
    }

    // Calculate software subscription costs
    const ssdSoftwareUnits = Math.ceil(veloSsdCapacity / 10) * config.subscriptionMonths;
    const hddSoftwareUnits = Math.ceil(hddCapacity / 10) * config.subscriptionMonths;
    const totalSoftwareUnits = Math.ceil(veloSsdCapacity / 10) + Math.ceil(hddCapacity / 10);
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
     const dollarsPerRawTB = totalSolutionCost / (veloSsdCapacity + hddCapacity);
     //console.log('Total Solution Cost:', totalSolutionCost);
     //console.log('Total RAW Capacity', veloSsdCapacity + hddCapacity);
     //console.log('Dollars per Raw TB:', dollarsPerRawTB);
     
    // Generate Bill of Materials
    const bomItems = [
       {
        item: "SSD Software Subscription",
        months: config.subscriptionMonths,
        quantity: Math.ceil(veloSsdCapacity / 10),
        unitCost: baseSsdSoftware,
        totalCost: ssdSoftwareCost
      },
      {
        item: "HDD Software Subscription",
        months: config.subscriptionMonths,
        quantity: Math.ceil(hddCapacity / 10),
        unitCost: baseHddSoftware,
        totalCost: hddSoftwareCost
      },
      {
        item: "Software Discount",
        quantity: (Math.ceil(veloSsdCapacity / 10) + Math.ceil(hddCapacity / 10)),
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
      totalSsdCapacity: veloSsdCapacity ,
      totalHddCapacity: hddCapacity,
      totalRawCapacity: veloSsdCapacity + hddCapacity,
      ratioSsdHdd: veloSsdCapacity / (veloSsdCapacity + hddCapacity),
      totalIops: config.veloCount * iopsPerVelo,
      totalMetadata: config.veloCount * metadataPerVelo,
      totalInodes: config.veloCount * inodesPerVelo,
      totalTransferRate: config.vpodCount * transferRatePerVpod,
      totalSolutionCost: totalSolutionCost,
      ssPercenatge: ( 100 * (1 - (hardwareCost / totalSolutionCost ) ) ),
      vpodUseableCapacity: capacityResults.vpodUseableCapacity,
      veloUseableCapacity: capacityResults.veloUseableCapacity,
      totalEffectiveCapacity: capacityResults.totalEffectiveCapacity * config.compressionRatio

    });
      
    // Calculate dollarsPerRawTB
    
    setDollarsPerRawTB(dollarsPerRawTB);     

    setBom(bomItems);
  }, [minRawCapacity, metrics.totalRawCapacity, config.veloSsdCapacity, config.jbodSize, config.vpodHddCapacity, config.veloCount, config.vpodCount, config, metrics.totalSolutionCost]);

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
        <SelectTrigger>
          <SelectValue placeholder="Select Quarter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem className="text-white" value="2025-Q1"> Q1 2025</SelectItem>
          <SelectItem className="text-white" value="2025-Q2"> Q2 2025</SelectItem>
          <SelectItem className="text-white" value="2025-Q3"> Q3 2025</SelectItem>
          <SelectItem className="text-white" value="2025-Q4"> Q4 2025</SelectItem>
          <SelectItem className="text-white" value="2026-Q1"> Q1 2026</SelectItem>
          <SelectItem className="text-white" value="2026-Q2"> Q2 2026</SelectItem>
          <SelectItem className="text-white" value="2026-Q3"> Q3 2026</SelectItem>
          <SelectItem className="text-white" value="2026-Q4"> Q4 2026</SelectItem>
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
  <label className="block text-white mb-2">Select Service Option (No return options)</label>
  <Select
    value={config.serviceOption}
    onValueChange={(value) => setConfig({...config, serviceOption: value})}
  >
    <SelectTrigger>
      <SelectValue placeholder="Next Business Day" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem className="text-white" value="standard"> Next Business Day</SelectItem>
      <SelectItem className="text-white" value="noReturnMedia"> NBD + No Return Media</SelectItem>
      <SelectItem className="text-white" value="noReturnHardware"> NBD + No Return Hardware</SelectItem>
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
          <SelectValue placeholder="2:1" />
        </SelectTrigger>
        <SelectContent>
          {compressionRatio.map(size => (
            <SelectItem className="bg-white bg-opacity-0 text-white" key={size} value={size.toString()}>{size}:1</SelectItem>
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
      <label className="block text-white mb-2">Minimum RAW Capacity (PB)</label>
      <input
        type="number"
        value={minRawCapacity / 1000}
          onChange={(e) => {
          const pbValue = parseFloat(e.target.value);
          setMinRawCapacity(pbValue * 1000); // Convert PB back to TB for internal use
        }}
        step="0.5" // Set increment to 0.5
        min="3.5"
        className="block w-full p-2 border border-gray-300 rounded bg-black text-white"
        placeholder="Enter minimum RAW capacity"
      />
    </div>
        <div>
      <label className="block text-white mb-2">Select VeLO Count (IOPS & Metadata)</label>
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
      <label className="block text-white mb-2">Select SSD Size (SSD capacity)</label>
      <Select
        value={config.veloSsdCapacity.toString()}
        onValueChange={(value) => setConfig({...config, veloSsdCapacity: parseFloat(value)})}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select SSD Size" />
        </SelectTrigger>
        <SelectContent>
          {veloSsdCapacities.map(size => (
            <SelectItem className="bg-white bg-opacity-0 text-white" key={size} value={size.toString()}>{size}TB SSD</SelectItem>
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
        value={config.encodingScheme}
        onValueChange={(value) => setConfig({...config, encodingScheme: value})}
      >
        <SelectTrigger>
          <SelectValue className="text-white" placeholder="Select Encoding Scheme" />
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

      {/* System Attributes */}
      <Card>
        <CardHeader className="bg-vduraColor border-b border-gray-200">
          <CardTitle className="text-xl font-bold text-gray-800"> System Attributes</CardTitle>
        </CardHeader >
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-white">
          <div>
            <p className="text-sm font-medium">RAW Capacity</p>
            <p className="text-2xl font-bold">{metrics.totalRawCapacity.toLocaleString(undefined, { maximumFractionDigits: 0 })} TB</p>
          </div>
          <div>
            <p className="text-sm font-medium">SSD Capacity</p>
            <p className="text-2xl font-bold">{metrics.totalSsdCapacity.toLocaleString(undefined, { maximumFractionDigits: 0 })} TB</p>
          </div>
          <div>
            <p className="text-sm font-medium">HDD Capacity</p>
            <p className="text-2xl font-bold">{metrics.totalHddCapacity.toLocaleString(undefined, { maximumFractionDigits: 0 })} TB</p>
          </div>
          <div>
            <p className="text-sm font-medium">SSD Content</p>
            <p className="text-2xl font-bold">{(metrics.ratioSsdHdd * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })} %</p>
          </div>
          <div>
            <p className="text-sm font-medium">Total IOPS</p>
            <p className="text-2xl font-bold">{(metrics.totalIops).toLocaleString(undefined, { maximumFractionDigits: 1 })} M/s</p>
          </div>
          <div>
            <p className="text-sm font-medium">iNodes supportd</p>
            <p className="text-2xl font-bold">{(metrics.totalInodes).toLocaleString(undefined, { maximumFractionDigits: 0 })} M</p>
          </div>
          <div>
            <p className="text-sm font-medium">Metadata Creates/Deletes</p>
            <p className="text-2xl font-bold">{(metrics.totalMetadata).toLocaleString(undefined, { maximumFractionDigits: 1 })} k/s</p>
          </div>
          <div>
            <p className="text-sm font-medium">Sustained Throughput</p>
            <p className="text-2xl font-bold">{(metrics.totalTransferRate || 0).toFixed(1)} GB/s</p>
          </div>
          <div>
            <p className="text-sm font-medium">Solution Price</p>
            <p className="text-2xl font-bold">${Number(metrics.totalSolutionCost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div>
            <p className="text-sm font-medium">VPOD Raw Capacity</p>
            <p className="text-2xl font-bold">
              {metrics.totalHddCapacity.toLocaleString(undefined, { maximumFractionDigits: 1 })} TB
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">VPOD Useable Capacity</p>
            <p className="text-2xl font-bold">
              {metrics.vpodUseableCapacity.toLocaleString(undefined, { maximumFractionDigits: 1 })} TB
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">VeLO Raw Capacity</p>
            <p className="text-2xl font-bold">
              {metrics.totalSsdCapacity.toLocaleString(undefined, { maximumFractionDigits: 1 })} TB
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">VeLO Useable Capacity</p>
            <p className="text-2xl font-bold">
              {metrics.veloUseableCapacity.toLocaleString(undefined, { maximumFractionDigits: 1 })} TB
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Total Raw Capacity</p>
            <p className="text-2xl font-bold">
              {metrics.totalRawCapacity.toLocaleString(undefined, { maximumFractionDigits: 1 })} TB
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Total Effective Capacity</p>
            <p className="text-2xl font-bold">
              {metrics.totalEffectiveCapacity.toLocaleString(undefined, { maximumFractionDigits: 1 })} TB
            </p>
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