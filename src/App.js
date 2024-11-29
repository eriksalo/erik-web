import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table.tsx';
import logo from './logo.svg';

// Mock data - In real app, this would come from your database
const quarterlyPricing = {
  "2025-Q1": {
    velo: 10446,
    vpod: 15996,
    jbod78: 7028,
    jbod108: 8061,
    ssd_3_84: 881,
    ssd_7_68: 1300,
    ssd_15_36: 2628,
    ssd_30_72: 5200,
    hdd_18: 350,
    hdd_24: 350,
    hdd_30: 550,
    hdd_32: 600, // Default to 0 months
    ssdSoftware: 100, 
    hddSoftware: 8, 
    softwareDiscount: -12   
  },
  "2025-Q2": {
    velo: 10446,
    vpod: 15996,
    jbod78: 7028,
    jbod108: 8061,
    ssd_3_84: 881,
    ssd_7_68: 1300,
    ssd_15_36: 2628,
    ssd_30_72: 5200,
    hdd_18: 350,
    hdd_24: 350,
    hdd_30: 550,
    hdd_32: 600, // Default to 0 months
    ssdSoftware: 100, 
    hddSoftware: 8, 
    softwareDiscount: -12
  },
  "2025-Q3": {
    velo: 10446,
    vpod: 15996,
    jbod78: 7028,
    jbod108: 8061,
    ssd_3_84: 881,
    ssd_7_68: 1300,
    ssd_15_36: 2628,
    ssd_30_72: 5200,
    hdd_18: 350,
    hdd_24: 350,
    hdd_30: 550,
    hdd_32: 600, // Default to 0 months
    ssdSoftware: 100, 
    hddSoftware: 8, 
    softwareDiscount: -12
  },
  "2025-Q4": {
    velo: 10446,
    vpod: 15996,
    jbod78: 7028,
    jbod108: 8061,
    ssd_3_84: 881,
    ssd_7_68: 1300,
    ssd_15_36: 2628,
    ssd_30_72: 5200,
    hdd_18: 350,
    hdd_24: 350,
    hdd_30: 550,
    hdd_32: 600, // Default to 0 months
    ssdSoftware: 100, 
    hddSoftware: 8, 
    softwareDiscount: -12
  },
  "2026-Q1": {
    velo: 10446,
    vpod: 15996,
    jbod78: 7028,
    jbod108: 8061,
    ssd_3_84: 881,
    ssd_7_68: 1300,
    ssd_15_36: 2628,
    ssd_30_72: 5200,
    hdd_18: 350,
    hdd_24: 350,
    hdd_30: 550,
    hdd_32: 600, // Default to 0 months
    ssdSoftware: 100, 
    hddSoftware: 8, 
    softwareDiscount: -12
  },
  "2026-Q2": {
    velo: 10446,
    vpod: 15996,
    jbod78: 7028,
    jbod108: 8061,
    ssd_3_84: 881,
    ssd_7_68: 1300,
    ssd_15_36: 2628,
    ssd_30_72: 5200,
    hdd_18: 350,
    hdd_24: 350,
    hdd_30: 550,
    hdd_32: 600, // Default to 0 months
    ssdSoftware: 100, 
    hddSoftware: 8, 
    softwareDiscount: -12
  },
  "2026-Q3": {
    velo: 10446,
    vpod: 15996,
    jbod78: 7028,
    jbod108: 8061,
    ssd_3_84: 881,
    ssd_7_68: 1300,
    ssd_15_36: 2628,
    ssd_30_72: 5200,
    hdd_18: 350,
    hdd_24: 350,
    hdd_30: 550,
    hdd_32: 600, // Default to 0 months
    ssdSoftware: 100, 
    hddSoftware: 8, 
    softwareDiscount: -12
  },
  "2026-Q4": {
    velo: 10446,
    vpod: 15996,
    jbod78: 7028,
    jbod108: 8061,
    ssd_3_84: 881,
    ssd_7_68: 1300,
    ssd_15_36: 2628,
    ssd_30_72: 5200,
    hdd_18: 350,
    hdd_24: 350,
    hdd_30: 550,
    hdd_32: 600, // Default to 0 months
    ssdSoftware: 100, 
    hddSoftware: 8, 
    softwareDiscount: -12
  }
  // Add more quarters here
};

const ssdCapacities = [3.84, 7.68, 15.36, 30.72];
const hddCapacities = [18, 24, 30, 32];
const jbodSizes = [78, 108];

const StorageConfigurator = () => {
  // Configuration state
  const [config, setConfig] = useState({
    quarter: "2025-Q1",
    veloCount: 3,
    veloSsdSize: 3.84,
    vpodCount: 3,
    jbodSize: 78,
    hddSize: 18,
    subscriptionMonths: 36, // Default to 36 months
    discountMonths: 0,
    serviceOption: "standard" // Options: "standard", "noReturnMedia", "noReturnHardware"
  });

  // Calculated metrics state
  const [metrics, setMetrics] = useState({
    totalSsdCapacity: 0,
    totalHddCapacity: 0,
    totalRawCapacity: 0,
    ratioSsdHdd: 0,
    totalIops: 0,
    totalInodes: 0,
    totalMetadata: 0,
    totalThroughput: 0,
    totalCost: 0     
  });

  // Bill of Materials state
  const [bom, setBom] = useState([]);

// Ensure JBOD config is valid
    const handleJbodSizeChange = (value) => {
      const newJbodSize = parseInt(value);
      let newHddSize = config.hddSize;

      if (newJbodSize === 108 && newHddSize === 18) {
        newHddSize = hddCapacities.find(size => size !== 18); // Default to the first valid size
      }

     setConfig({...config, jbodSize: newJbodSize, hddSize: newHddSize});
     };

  // Calculate metrics and BOM when configuration changes
  useEffect(() => {
    const pricing = quarterlyPricing[config.quarter];
    
    // Calculate SSD capacity
    const veloSsdCapacity = config.veloCount * 12 * config.veloSsdSize;
       
    // Calculate HDD capacity
    const hddCapacity = config.vpodCount * config.jbodSize * config.hddSize;
    
    // Calculate performance metrics (example values - adjust as needed)
    const iopsPerVelo = 2;
    const metadataPerVelo = 225;
    const inodesPerVelo = 333;

    // Adjust throughput based on JBOD size and HDD size
    let transferRatePerVpod;
    if (config.jbodSize === 78) {
      transferRatePerVpod = config.hddSize === 18 ? 26.4 : 13.2;
    } else if (config.jbodSize === 108) {
      transferRatePerVpod = 17.8;
    }

    // Calculate software subscription costs
    const ssdSoftwareUnits = Math.ceil(veloSsdCapacity / 10) * config.subscriptionMonths;
    const hddSoftwareUnits = Math.ceil(hddCapacity / 10) * config.subscriptionMonths;
    const ssdSoftwareCost = ssdSoftwareUnits * pricing.ssdSoftware;
    const hddSoftwareCost = hddSoftwareUnits * pricing.hddSoftware;
  
    // Calculate software discount
    const discountCost = config.discountMonths * pricing.softwareDiscount;

    // Calculate hardware costs
    const hardwareCost = config.veloCount * pricing.velo +
                       config.vpodCount * pricing.vpod +
                       config.vpodCount * (config.jbodSize === 78 ? pricing.jbod78 : pricing.jbod108) +
                       config.veloCount * 12 * pricing[`ssd_${config.veloSsdSize.toString().replace('.', '_')}`] +
                       config.vpodCount * 12 * pricing.ssd_3_84 +
                       config.vpodCount * config.jbodSize * pricing[`hdd_${config.hddSize}`];

    // Calculate service costs
    const basicServiceCost = hardwareCost * 0.0063 * Math.min(config.subscriptionMonths, 60) +
                           hardwareCost * 0.0158 * Math.max(config.subscriptionMonths - 60, 0);
    let totalServiceCost = basicServiceCost;
    if (config.serviceOption === "noReturnMedia") {
      totalServiceCost *= 1.36;
    } else if (config.serviceOption === "noReturnHardware") {
    totalServiceCost *= 1.598;
    }

    // Generate Bill of Materials
    const bomItems = [
       {
        item: "SSD Software Subscription",
        months: config.subscriptionMonths,
        quantity: ssdSoftwareUnits,
        unitCost: pricing.ssdSoftware,
        totalCost: ssdSoftwareCost
      },
      {
        item: "HDD Software Subscription",
        months: config.subscriptionMonths,
        quantity: hddSoftwareUnits,
        unitCost: pricing.hddSoftware,
        totalCost: hddSoftwareCost
      },
      {
        item: "Software Discount",
        quantity: config.discountMonths,
        months: config.discountMonths,
        unitCost: pricing.softwareDiscount,
        totalCost: discountCost
      },
      {
        item: "Service Cost",
        months: config.subscriptionMonths,
        quantity: config.subscriptionMonths,
        unitCost: totalServiceCost / config.subscriptionMonths,
        totalCost: totalServiceCost
      },
      {
        item: "", // Blank row
        months: "",
        quantity: "",
        unitCost: "",
        totalCost: ""
      },
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
        item: `${config.veloSsdSize}TB SSD (VeLO)`,
        quantity: config.veloCount * 12,
        unitCost: pricing[`ssd_${config.veloSsdSize.toString().replace('.', '_')}`],
        totalCost: config.veloCount * 12 * pricing[`ssd_${config.veloSsdSize.toString().replace('.', '_')}`]
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
        unitCost: pricing[`hdd_${config.hddSize}`],
        totalCost: config.vpodCount * config.jbodSize * pricing[`hdd_${config.hddSize}`]
      }
     
    ];

    // Calculate total cost
    const totalCost = bomItems.reduce((sum, item) => sum + item.totalCost, 0);

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
      totalCost: totalCost
    });

    setBom(bomItems);
  }, [config]);

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
    <CardTitle className="bg-vduraColor text-xl font-bold text-gray-800">Input System Configuration</CardTitle>
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
      <label className="block text-white mb-2">Select VeLO Count (IOPS & Metadata)</label>
      <Select
        value={config.veloCount.toString()}
        onValueChange={(value) => setConfig({...config, veloCount: parseInt(value)})}
      >
        <SelectTrigger>
          <SelectValue className="bg-vduraColor text-xl font-bold text-white" placeholder="Select VeLO Count" />
        </SelectTrigger>
        <SelectContent>
          {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <SelectItem className="text-white" key={n} value={n.toString()}>{n} VeLO(s)</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div>
      <label className="block text-white mb-2">Select SSD Size (SSD capacity)</label>
      <Select
        value={config.veloSsdSize.toString()}
        onValueChange={(value) => setConfig({...config, veloSsdSize: parseFloat(value)})}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select SSD Size" />
        </SelectTrigger>
        <SelectContent>
          {ssdCapacities.map(size => (
            <SelectItem className="bg-white bg-opacity-0 text-white" key={size} value={size.toString()}>{size}TB SSD</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div>
      <label className="block text-white mb-2">Select VPOD Count (HDD Capacity)</label>
      <Select
        value={config.vpodCount.toString()}
        onValueChange={(value) => setConfig({...config, vpodCount: parseInt(value)})}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select VPOD Count" />
        </SelectTrigger>
        <SelectContent>
          {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <SelectItem className="text-white" key={n} value={n.toString()}>{n} VPOD(s)</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div>
      <label className="block text-white mb-2">Select JBOD Size (1M or 1.3M / Dual Actuator)</label>
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
     <label className="block text-white mb-2">Select HDD Size (HDD Capacity)</label>
     <Select
      value={config.hddSize.toString()}
      onValueChange={(value) => setConfig({...config, hddSize: parseInt(value)})}
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
      <SelectValue placeholder="Select Service Option" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem className="text-white" value="standard">Standard</SelectItem>
      <SelectItem className="text-white" value="noReturnMedia">No Return Media</SelectItem>
      <SelectItem className="text-white" value="noReturnHardware">No Return Hardware</SelectItem>
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
            <p className="text-2xl font-bold">{metrics.totalRawCapacity.toFixed(0)} TB</p>
          </div>
          <div>
            <p className="text-sm font-medium">SSD Capacity</p>
            <p className="text-2xl font-bold">{metrics.totalSsdCapacity.toFixed(0)} TB</p>
          </div>
          <div>
            <p className="text-sm font-medium">HDD Capacity</p>
            <p className="text-2xl font-bold">{metrics.totalHddCapacity.toFixed(0)} TB</p>
          </div>
          <div>
            <p className="text-sm font-medium">SSD Content</p>
            <p className="text-2xl font-bold">{(metrics.ratioSsdHdd * 100).toFixed(2)} %</p>
          </div>
          <div>
            <p className="text-sm font-medium">Total IOPS</p>
            <p className="text-2xl font-bold">{(metrics.totalIops)} M/s</p>
          </div>
          <div>
            <p className="text-sm font-medium">iNodes supportd</p>
            <p className="text-2xl font-bold">{(metrics.totalInodes)} M</p>
          </div>
          <div>
            <p className="text-sm font-medium">Metadata Creates/Deletes</p>
            <p className="text-2xl font-bold">{(metrics.totalMetadata)} k/s</p>
          </div>
          <div>
            <p className="text-sm font-medium">Sustained Throughput</p>
            <p className="text-2xl font-bold">{(metrics.totalTransferRate || 0).toFixed(1)} GB/s</p>
          </div>
          <div>
            <p className="text-sm font-medium">Total Cost</p>
            <p className="text-2xl font-bold">${Number(metrics.totalCost || 0).toFixed(0).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

     {/* Bill of Materials */}
      <Card className="border-2 border-gray-700 shadow-lg bg-vduraCol text-white">
        <CardHeader className="bg-vduraColor border-b border-gray-200">
          <CardTitle className=" bg-vduraColor text-xl font-bold text-gray-800">Bill of Materials</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="border rounded-lg overflow-hidden">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-vduraColor">
                  <TableHead className="font-bold text-black">Item</TableHead>
                  <TableHead className="font-bold text-black">Months</TableHead>
                  <TableHead className="text-right font-bold text-black">Quantity</TableHead>
                  <TableHead className="text-right font-bold text-black">Unit Cost</TableHead>
                  <TableHead className="text-right font-bold text-black">Extended Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bom.map((item, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{item.item}</TableCell>
                    <TableCell className="font-medium">{item.months}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.unitCost !== undefined ? `$${item.unitCost.toLocaleString()}` : ""}</TableCell>
                    <TableCell className="text-right font-semibold">{item.totalCost !== undefined ? `$${item.totalCost.toLocaleString()}` : ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageConfigurator;