export const calculatePricing = (pricingData) => {
  const pricing = {
    velo: getPriceByCategory(pricingData, 'Directors', 'VCH-5000-D1N'),
    vpod: getPriceByCategory(pricingData, 'Storage Nodes', 'VCH-5000-S1N'),
    jbod78_16: getPriceByCategory(pricingData, 'JBOD', 'VCH-5000-J78-1248'),
    jbod78_24: getPriceByCategory(pricingData, 'JBOD', 'VCH-5000-J78-1842s'),
    jbod78_30: getPriceByCategory(pricingData, 'JBOD', 'VCH-5000-J78-2340'),
    jbod78_32: getPriceByCategory(pricingData, 'JBOD', 'VCH-5000-J78-2496'),
    jbod78_18: getPriceByCategory(pricingData, 'JBOD', 'VCH-5000-J78-1404s'),
    jbod108_16: getPriceByCategory(pricingData, 'JBOD', 'VCH-5000-J108-1728'),
    jbod108_24: getPriceByCategory(pricingData, 'JBOD', 'VCH-5000-J108-2592s'),
    jbod108_30: getPriceByCategory(pricingData, 'JBOD', 'VCH-5000-J108-3240'),
    jbod108_32: getPriceByCategory(pricingData, 'JBOD', 'VCH-5000-J108-3456'),
    ssd_1_92: getPriceByPartNumber(pricingData, 'VCH-NVME-1.9s'),
    ssd_3_84: getPriceByPartNumber(pricingData, 'VCH-NVME-3.8s'),
    ssd_7_6: getPriceByPartNumber(pricingData, 'VCH-NVME-7.6s'),
    ssd_15_3: getPriceByPartNumber(pricingData, 'VCH-NVME-15.3s'),
    ssd_30_7: getPriceByPartNumber(pricingData, 'VCH-NVME-30.7s'),
    hddSoftware: getPriceByPartNumber(pricingData, 'VDP-SW-P-10-C'),
    ssdSoftware: getPriceByPartNumber(pricingData, 'VDP-SW-P-10-HP'),
    softwareDiscount: getPriceByPartNumber(pricingData, 'VDP-SW-P-10-PD')
    hbaPcie: getPriceByPartNumber(pricingData, 'VCH-200GbE-2P-PCIe'),
    hbaOcp: getPriceByPartNumber(pricingData, 'VCH-200GbE-2P-OCP'),
    install: getPriceByCategory(pricingData, 'SVC-R1-CINT-PDEP-NORACK')
  };

const getPriceByCategory = (data, category, partNumberStartsWith) => {
  const item = data.find(item => 
    item.Category === category && 
    item.PartNumber.startsWith(partNumberStartsWith)
  );
  return item ? parseFloat(item.Price) : 0;
};

const getPriceByPartNumber = (data, partNumber) => {
  const item = data.find(item => item.PartNumber === partNumber);
  return item ? parseFloat(item.Price) : 0;
};