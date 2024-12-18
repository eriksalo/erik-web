// Types that mirror potential database schema
export type Product = {
  partNumber: string;  // Primary key
  description: string;
  discount: number;
  pricingQ12024: number;
  pricingQ22024: number;
  pricingQ32024: number;
  pricingQ42024: number;
  pricingQ12025: number;
  pricingQ22025: number;
  pricingQ32025: number;
  pricingQ42025: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
interface ProductDatabase {
  products: {
    [key: string]: Product;
  };
}
// Mock database tables
export const productDatabase = {
  // Products table - indexed by partNumber
  products: {
    'VCH-5000-D1N': {
      partNumber: 'VCH-5000-D1N',
      description: 'VDURA Certified Hardware 5000 - 1U Director Node, Dual 25/10GbE TURIN CPU',
      discount: 0.30,
      pricingQ12024: 19917.51,
      pricingQ22024: 19917.51,
      pricingQ32024: 19917.51,
      pricingQ42024: 19917.51,
      pricingQ12025: 19917.51,
      pricingQ22025: 19917.51,
      pricingQ32025: 19917.51,
      pricingQ42025: 19917.51,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    'VCH-5000-S1N': {
        partNumber: 'VCH-5000-S1N',
        description: 'VDURA Certified Hardware 5000 - 1U Storage Node Eth CARD',
        discount: 0.30,
        pricingQ12024: 10917.93,
        pricingQ22024: 10917.93,
        pricingQ32024: 10917.93,
        pricingQ42024: 10917.93,
        pricingQ12025: 10917.93,
        pricingQ22025: 10917.93,
        pricingQ32025: 10917.93,
        pricingQ42025: 10917.93,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
    'VCH-5000-J108-1728': {
        partNumber: 'VCH-5000-J108-1728',
        description: 'VDURA Certified Hardware 5000 - 4U SAS4 JBOD, 1728TB, 108 16TB HDDs, 1.2m Racks ',
        discount: 0.30,
        pricingQ12024: 37544.11,
        pricingQ22024: 37544.11,
        pricingQ32024: 37544.11,
        pricingQ42024: 37544.11,
        pricingQ12025: 37544.11,
        pricingQ22025: 37544.11,
        pricingQ32025: 37544.11,
        pricingQ42025: 37544.11,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'VCH-5000-J108-2592s': {
        partNumber: 'VCH-5000-J108-2592s',
        description: 'VDURA Certified Hardware 5000 - 4U SAS4 JBOD, 2592TB, 108 24TB SED HDDs, 1.2m Racks ',
        discount: 0.30,
        pricingQ12024: 52340.11,
        pricingQ22024: 52340.11,
        pricingQ32024: 52340.11,
        pricingQ42024: 52340.11,
        pricingQ12025: 52340.11,
        pricingQ22025: 52340.11,
        pricingQ32025: 52340.11,
        pricingQ42025: 52340.11,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'VCH-5000-J108-3240': {
        partNumber: 'VCH-5000-J108-3240',
        description: 'VDURA Certified Hardware 5000 - 4U SAS4 JBOD, 3240TB, 108 30TB HDDs, 1.2m Racks ',
        discount: 0.30,
        pricingQ12024: 67460.11,
        pricingQ22024: 67460.11,
        pricingQ32024: 67460.11,
        pricingQ42024: 67460.11,
        pricingQ12025: 67460.11,
        pricingQ22025: 67460.11,
        pricingQ32025: 67460.11,
        pricingQ42025: 67460.11,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'VCH-5000-J108-3456': {
        partNumber: 'VCH-5000-J108-3456',
        description: 'VDURA Certified Hardware 5000 - 4U SAS4 JBOD, 3456TB, 108 32TB HDDs, 1.2m Racks ',
        discount: 0.30,
        pricingQ12024: 72860.11,
        pricingQ22024: 72860.11,
        pricingQ32024: 72860.11,
        pricingQ42024: 72860.11,
        pricingQ12025: 72860.11,
        pricingQ22025: 72860.11,
        pricingQ32025: 72860.11,
        pricingQ42025: 72860.11,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'VCH-5000-J78-1248': {
        partNumber: 'VCH-5000-J78-1248',
        description: 'VDURA Certified Hardware 5000 - 4U SAS4 JBOD, 1248TB, 78 16TB HDDs, 1m Racks ',
        discount: 0.30,
        pricingQ12024: 27677.42,
        pricingQ22024: 27677.42,
        pricingQ32024: 27677.42,
        pricingQ42024: 27677.42,
        pricingQ12025: 27677.42,
        pricingQ22025: 27677.42,
        pricingQ32025: 27677.42,
        pricingQ42025: 27677.42,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'VCH-5000-J78-1872s': {
        partNumber: 'VCH-5000-J78-1872s',
        description: 'VDURA Certified Hardware 5000 - 4U SAS4 JBOD, 1872TB, 78 24TB SED HDDs, 1m Racks ',
        discount: 0.30,
        pricingQ12024: 38363.42,
        pricingQ22024: 38363.42,
        pricingQ32024: 38363.42,
        pricingQ42024: 38363.42,
        pricingQ12025: 38363.42,
        pricingQ22025: 38363.42,
        pricingQ32025: 38363.42,
        pricingQ42025: 38363.42,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'VCH-5000-J78-2350': {
        partNumber: 'VCH-5000-J78-2340',
        description: 'VDURA Certified Hardware 5000 - 4U SAS4 JBOD, 2340TB, 78 30TB HDDs, 1m Racks ',
        discount: 0.30,
        pricingQ12024: 49283.42,
        pricingQ22024: 49283.42,
        pricingQ32024: 49283.42,
        pricingQ42024: 49283.42,
        pricingQ12025: 49283.42,
        pricingQ22025: 49283.42,
        pricingQ32025: 49283.42,
        pricingQ42025: 49283.42,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'VCH-5000-J78-2496': {
        partNumber: 'VCH-5000-J78-2496',
        description: 'VDURA Certified Hardware 5000 - 4U SAS4 JBOD, 2496TB, 78 32TB HDDs, 1m Racks ',
        discount: 0.30,
        pricingQ12024: 53183.42,
        pricingQ22024: 53183.42,
        pricingQ32024: 53183.42,
        pricingQ42024: 53183.42,
        pricingQ12025: 53183.42,
        pricingQ22025: 53183.42,
        pricingQ32025: 53183.42,
        pricingQ42025: 53183.42,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'VCH-5000-J78-1404s': {
        partNumber: 'VCH-5000-J78-1404s',
        description: 'VDURA Certified Hardware 5050 - 4U SAS4 JBOD, 1404TB, 78 18TB SED HDDs, 1m Racks ',
        discount: 0.30,
        pricingQ12024: 30865.85,
        pricingQ22024: 30865.85,
        pricingQ32024: 30865.85,
        pricingQ42024: 30865.85,
        pricingQ12025: 30865.85,
        pricingQ22025: 30865.85,
        pricingQ32025: 30865.85,
        pricingQ42025: 30865.85,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'VCH-200GbE-2P-PCIe': {
        partNumber: 'VCH-200GbE-2P-PCIe',
        description: 'VDURA Certified Hardware - 200/100GbE, Dual-Port QSFP112, HHHL PCIe',
        discount: 0.30,
        pricingQ12024: 1500,
        pricingQ22024: 1500,
        pricingQ32024: 1500,
        pricingQ42024: 1500,
        pricingQ12025: 1500,
        pricingQ22025: 1500,
        pricingQ32025: 1500,
        pricingQ42025: 1500,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'VCH-NVME-1.9s': {
        partNumber: 'VCH-NVME-1.9s',
        description: 'VDURA Certified Hardware - 1.9TB SSD, PCIe 5.0, SED',
        discount: 0.30,
        pricingQ12024: 400,
        pricingQ22024: 400,
        pricingQ32024: 400,
        pricingQ42024: 400,
        pricingQ12025: 400,
        pricingQ22025: 400,
        pricingQ32025: 400,
        pricingQ42025: 400,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'VCH-NVME-3.8s': {
        partNumber: 'VCH-NVME-3.8s',
        description: 'VDURA Certified Hardware - 3.8TB SSD, PCIe 5.0, SED',
        discount: 0.30,
        pricingQ12024: 705.65,
        pricingQ22024: 705.65,
        pricingQ32024: 705.65,
        pricingQ42024: 705.65,
        pricingQ12025: 705.65,
        pricingQ22025: 705.65,
        pricingQ32025: 705.65,
        pricingQ42025: 705.65,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'VCH-NVME-7.6s': {
        partNumber: 'VCH-NVME-7.6s',
        description: 'VDURA Certified Hardware - 7.6TB SSD, PCIe 5.0, SED',
        discount: 0.30,
        pricingQ12024: 1328,
        pricingQ22024: 1328,
        pricingQ32024: 1328,
        pricingQ42024: 1328,
        pricingQ12025: 1328,
        pricingQ22025: 1328,
        pricingQ32025: 1328,
        pricingQ42025: 1328,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'VCH-NVME-15.3s': {
        partNumber: 'VCH-NVME-15.3s',
        description: 'VDURA Certified Hardware - 15.3TB SSD, PCIe 5.0, SED',
        discount: 0.30,
        pricingQ12024: 2499.00,
        pricingQ22024: 2499.00,
        pricingQ32024: 2499.00,
        pricingQ42024: 2499.00,
        pricingQ12025: 2499.00,
        pricingQ22025: 2499.00,
        pricingQ32025: 2499.00,
        pricingQ42025: 2499.00,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'VCH-NVME-30.7s': {
        partNumber: 'VCH-NVME-30.7s',
        description: 'VDURA Certified Hardware - 30.7TB SSD, PCIe 5.0, SED',
        discount: 0.30,
        pricingQ12024: 4888.00,
        pricingQ22024: 4888.00,
        pricingQ32024: 4888.00,
        pricingQ42024: 4888.00,
        pricingQ12025: 4888.00,
        pricingQ22025: 4888.00,
        pricingQ32025: 4888.00,
        pricingQ42025: 4888.00,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'VDP-SW-P-10-HP': {
        partNumber: 'VDP-SW-P-10-HP',
        description: 'VDURA Data Platform - Physical, 10TB, High Performance Tier, One Month Subscription Term',
        discount: 0.80,
        pricingQ12024: 100.00,
        pricingQ22024: 100.00,
        pricingQ32024: 100.00,
        pricingQ42024: 100.00,
        pricingQ12025: 100.00,
        pricingQ22025: 100.00,
        pricingQ32025: 100.00,
        pricingQ42025: 100.00,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'VDP-SW-P-10-C': {
        partNumber: 'VDP-SW-P-10-C',
        description: 'VDURA Data Platform - Physical, 10TB, Capacity Tier, One Month Subscription Term',
        discount: 0.80,
        pricingQ12024: 8.00,
        pricingQ22024: 8.00,
        pricingQ32024: 8.00,
        pricingQ42024: 8.00,
        pricingQ12025: 8.00,
        pricingQ22025: 8.00,
        pricingQ32025: 8.00,
        pricingQ42025: 8.00,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'VDP-SW-P-10-PD': {
        partNumber: 'VDP-SW-P-10-PD',
        description: 'VDURA Data Platform - Physical, 10TB, One Month Subscription Term Promotion Discount',
        discount: 0.80,
        pricingQ12024: 75.00,
        pricingQ22024: 75.00,
        pricingQ32024: 75.00,
        pricingQ42024: 75.00,
        pricingQ12025: 75.00,
        pricingQ22025: 75.00,
        pricingQ32025: 75.00,
        pricingQ42025: 75.00,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'HW-Support-NBD': {
        partNumber: 'HW-Support-NBD',
        description: 'Next Business Day Hardware Support One Month Term ',
        discount: 0.50,
        pricingQ12024: 0.0063,
        pricingQ22024: 0.0063,
        pricingQ32024: 0.0063,
        pricingQ42024: 0.0063,
        pricingQ12025: 0.0063,
        pricingQ22025: 0.0063,
        pricingQ32025: 0.0063,
        pricingQ42025: 0.0063,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'HW-Support-NBD Yr 6-7': {
        partNumber: 'HW-Support-NBD Yr 6-7',
        description: 'Next Business Day Hardware Support One Month Term Years 6-7',
        discount: 0.50,
        pricingQ12024: 0.0158,
        pricingQ22024: 0.0158,
        pricingQ32024: 0.0158,
        pricingQ42024: 0.0158,
        pricingQ12025: 0.0158,
        pricingQ22025: 0.0158,
        pricingQ32025: 0.0158,
        pricingQ42025: 0.0158,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'HW-Support-NBD-NR-MEDIA': {
        partNumber: 'HW-Support-NBD-NR-MEDIA',
        description: 'HW-Support-NBD-NR-MEDIA : Next Business Day HW Support One Month No Return Media Term',
        discount: 0.50,
        pricingQ12024: 1.58,
        pricingQ22024: 1.58,
        pricingQ32024: 1.58,
        pricingQ42024: 1.58,
        pricingQ12025: 1.58,
        pricingQ22025: 1.58,
        pricingQ32025: 1.58,
        pricingQ42025: 1.58,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'HW-Support-NBD-NR-NM': {
        partNumber: 'HW-Support-NBD-NR-NM',
        description: 'Next Business Day HW Support One Month No Return Hardware',
        discount: 0.50,
        pricingQ12024: 1.36,
        pricingQ22024: 1.36,
        pricingQ32024: 1.36,
        pricingQ42024: 1.36,
        pricingQ12025: 1.36,
        pricingQ22025: 1.36,
        pricingQ32025: 1.36,
        pricingQ42025: 1.36,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
     'SVC-R1-CINT-PDEP-NORACK': {
        partNumber: 'SVC-R1-CINT-PDEP-NORACK',
        description: 'First Rack, Customer Integration, VDURA Deployment, No Rack',
        discount: 0.50,
        pricingQ12024: 1.598,
        pricingQ22024: 1.598,
        pricingQ32024: 1.598,
        pricingQ42024: 1.598,
        pricingQ12025: 1.598,
        pricingQ22025: 1.598,
        pricingQ32025: 1.598,
        pricingQ42025: 1.598,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
  },

};

// // Database-like query functions
// export const productQueries = {
//   // Get product by part number
//   getProduct: (partNumber: string): Product | null => {
//     return productDatabase.products[partNumber] || null;
//   },

//   // Get current price for a product
//   getCurrentPrice: (partNumber: string): number | null => {
//     const currentDate = new Date();
//     const priceEntry = productDatabase.priceHistory
//       .find(entry => 
//         entry.partNumber === partNumber &&
//         new Date(entry.effectiveDate) <= currentDate &&
//         (!entry.expirationDate || new Date(entry.expirationDate) >= currentDate)
//       );
//     return priceEntry?.price || null;
//   },
//   // Get discounted price
//   getDiscountedPrice: (partNumber: string, price: number): number | null => {
//     const product = productDatabase.products[partNumber];
//     if (!product) return null;
//     return price * (1 - product.discount);
//   },

//   // Update product
//   updateProduct: (partNumber: string, updates: Partial<Product>): void => {
//     if (productDatabase.products[partNumber]) {
//       productDatabase.products[partNumber] = {
//         ...productDatabase.products[partNumber],
//         ...updates,
//         updatedAt: new Date().toISOString()
//       };
//     }
//   },

//   // Get all products
//   getAllProducts: (): Product[] => {
//     return Object.values(productDatabase.products);
//   },

//   // Get prices for a specific quarter
//   getPricesForQuarter: (quarter: string): Record<string, number> => {
//     const prices: Record<string, number> = {};
//     productDatabase.priceHistory
//       .filter(entry => entry.quarter === quarter)
//       .forEach(entry => {
//         prices[entry.partNumber] = entry.price;
//       });
//     return prices;
//   }
// };