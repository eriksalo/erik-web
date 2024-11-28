import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table.tsx';
import logo from './logo.svg';

// Mock data - In real app, this would come from your database
const quarterlyPricing = {
  "2024-Q4": {
    velo: 75000,
    vpod: 45000,
    jbod78: 12000,
    jbod108: 15000,
    ssd_3_84: 2500,
    ssd_7_68: 4500,
    ssd_15_36: 8500,
    hdd_18: 350,
    hdd_24: 450,
    hdd_30: 550,
    hdd_32: 600
  }
  // Add more quarters here
};

const ssdCapacities = [3.84, 7.68, 15.36];
const hddCapacities = [18, 24, 30, 32];
const jbodSizes = [78, 108];

const StorageConfigurator = () => {
  // Configuration state
  const [config, setConfig] = useState({
    quarter: "2024-Q4",
    veloCount: 1,
    veloSsdSize: 3.84,
    vpodCount: 1,
    jbodSize: 78,
    hddSize: 18
  });

  // Calculated metrics state
  const [metrics, setMetrics] = useState({
    totalSsdCapacity: 0,
    totalHddCapacity: 0,
    totalIops: 0,
    totalMetadata: 0,
    totalTransferRate: 0,
    totalCost: 0
  });

  // Bill of Materials state
  const [bom, setBom] = useState([]);

  // Calculate metrics and BOM when configuration changes
  useEffect(() => {
    const pricing = quarterlyPricing[config.quarter];
    
    // Calculate SSD capacity
    const veloSsdCapacity = config.veloCount * 12 * config.veloSsdSize;
    const vpodSsdCapacity = config.vpodCount * 12 * 3.84; // VPODs always use 3.84TB SSDs
    
    // Calculate HDD capacity
    const hddCapacity = config.vpodCount * config.jbodSize * config.hddSize;
    
    // Calculate performance metrics (example values - adjust as needed)
    const iopsPerVelo = 500000;
    const metadataPerVelo = 200000;
    const transferRatePerVpod = 16; // GB/s

    // Generate Bill of Materials
    const bomItems = [
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
      totalSsdCapacity: veloSsdCapacity + vpodSsdCapacity,
      totalHddCapacity: hddCapacity,
      totalIops: config.veloCount * iopsPerVelo,
      totalMetadata: config.veloCount * metadataPerVelo,
      totalTransferRate: config.vpodCount * transferRatePerVpod,
      totalCost: totalCost
    });

    setBom(bomItems);
  }, [config]);

  return (
    
    <div className="space-y-8 p-6 bg-black min-h-screen text-white">

      <img src={logo} alt="Logo" className="w-80" />

       <Card>
        <CardHeader className="bg-vduraColor">
          <CardTitle className="bg-vduraColor text-xl font-bold text-gray-800">V5000 System Configurator</CardTitle>
        </CardHeader>
       </Card>
      
      {/* Configuration Controls */}
      <Card>
        <CardHeader className="bg-vduraColor">
          <CardTitle className="bg-vduraColor text-xl font-bold text-gray-800">Input System Configuration</CardTitle>
        </CardHeader>
        <CardContent className="grid bg-vduraColorgrid-cols-2 md:grid-cols-3 gap-4 text-white">
          <Select
            value={config.quarter}
            onValueChange={(value) => setConfig({...config, quarter: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Quarter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-Q4">Q4 2024</SelectItem>
              {/* Add more quarters */}
            </SelectContent>
          </Select>

          <Select
            value={config.veloCount.toString()}
            onValueChange={(value) => setConfig({...config, veloCount: parseInt(value)})}
          >
            <SelectTrigger>
              <SelectValue className="bg-vduraColor text-xl font-bold text-white" placeholder="VeLO Count" />
            </SelectTrigger>
            <SelectContent>
              {[1,2,3,4].map(n => (
                <SelectItem className="text-white" key={n} value={n.toString()}>{n} VeLO(s)</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={config.veloSsdSize.toString()}
            onValueChange={(value) => setConfig({...config, veloSsdSize: parseFloat(value)})}
          >
            <SelectTrigger>
              <SelectValue placeholder="VeLO SSD Size" />
            </SelectTrigger>
            <SelectContent>
              {ssdCapacities.map(size => (
                <SelectItem className="bg-white bg-opacity-0 text-white" key={size} value={size.toString()}>{size}TB SSD</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={config.vpodCount.toString()}
            onValueChange={(value) => setConfig({...config, vpodCount: parseInt(value)})}
          >
            <SelectTrigger>
              <SelectValue placeholder="VPOD Count" />
            </SelectTrigger>
            <SelectContent>
              {[1,2,3,4].map(n => (
                <SelectItem className="text-white" key={n} value={n.toString()}>{n} VPOD(s)</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={config.jbodSize.toString()}
            onValueChange={(value) => setConfig({...config, jbodSize: parseInt(value)})}
          >
            <SelectTrigger>
              <SelectValue placeholder="JBOD Size" />
            </SelectTrigger>
            <SelectContent>
              {jbodSizes.map(size => (
                <SelectItem className="bg-black text-white" key={size} value={size.toString()}>{size} drives</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={config.hddSize.toString()}
            onValueChange={(value) => setConfig({...config, hddSize: parseInt(value)})}
          >
            <SelectTrigger>
              <SelectValue placeholder="HDD Size" />
            </SelectTrigger>
            <SelectContent>
              {hddCapacities.map(size => (
                <SelectItem className="text-white" key={size} value={size.toString()}>{size}TB HDD</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* System Attributes */}
      <Card>
        <CardHeader className="bg-vduraColor border-b border-gray-200">
          <CardTitle className="text-xl font-bold text-gray-800"> System Attributes</CardTitle>
        </CardHeader >
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-white">
          <div>
            <p className="text-sm font-medium">Total SSD Capacity</p>
            <p className="text-2xl font-bold">{metrics.totalSsdCapacity.toFixed(2)} TB</p>
          </div>
          <div>
            <p className="text-sm font-medium">Total HDD Capacity</p>
            <p className="text-2xl font-bold">{metrics.totalHddCapacity.toFixed(2)} TB</p>
          </div>
          <div>
            <p className="text-sm font-medium">Total IOPS</p>
            <p className="text-2xl font-bold">{(metrics.totalIops / 1000).toFixed(0)}K</p>
          </div>
          <div>
            <p className="text-sm font-medium">Metadata Ops/sec</p>
            <p className="text-2xl font-bold">{(metrics.totalMetadata / 1000).toFixed(0)}K</p>
          </div>
          <div>
            <p className="text-sm font-medium">Transfer Rate</p>
            <p className="text-2xl font-bold">{metrics.totalTransferRate} GB/s</p>
          </div>
          <div>
            <p className="text-sm font-medium">Total Cost</p>
            <p className="text-2xl font-bold">${metrics.totalCost.toLocaleString()}</p>
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
            <Table>
              <TableHeader>
                <TableRow className="bg-vduraColor">
                  <TableHead className="font-bold text-black">Item</TableHead>
                  <TableHead className="text-right font-bold text-black">Quantity</TableHead>
                  <TableHead className="text-right font-bold text-black">Unit Cost</TableHead>
                  <TableHead className="text-right font-bold text-black">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bom.map((item, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{item.item}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.unitCost.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">${item.totalCost.toLocaleString()}</TableCell>
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