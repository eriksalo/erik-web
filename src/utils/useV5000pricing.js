import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';

export const useV5000pricing = (selectedQuarter) => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPricing = async () => {
      // Convert quarter format from "2025-Q1" to "2025_Q1"
      const fieldName = selectedQuarter.replace('-', '_');
      
      try {
        setLoading(true);
        const client = generateClient();
        
        const response = await client.graphql({
          query: `
            query ListPricingData {
              listV5000pricings {
                items {
                  Category
                  PartNumber
                  Description
                  Discount
                  ${fieldName}
                }
              }
            }
          `
        });

        const items = response.data.listV5000pricings.items;

        // Process the pricing data
        const pricingObject = {
          quarter: selectedQuarter,
          // Directors
          velo: parsePriceValue(findPrice(items, 'VCH-5000-D1N', fieldName)),
          director5050: parsePriceValue(findPrice(items, 'VCH-5050-D1N', fieldName)),
          auxiliaryNode: parsePriceValue(findPrice(items, 'VCH-5000-X1N', fieldName)),
          
          // Storage Nodes
          storageNode: parsePriceValue(findPrice(items, 'VCH-5000-S1N', fieldName)),
          storageNode5050: parsePriceValue(findPrice(items, 'VCH-5050-S1N', fieldName)),
          
          // JBODs
          jbod108_1728: parsePriceValue(findPrice(items, 'VCH-5000-J108-1728', fieldName)),
          jbod108_2592s: parsePriceValue(findPrice(items, 'VCH-5000-J108-2592s', fieldName)),
          jbod108_3240: parsePriceValue(findPrice(items, 'VCH-5000-J108-3240', fieldName)),
          jbod108_3456: parsePriceValue(findPrice(items, 'VCH-5000-J108-3456', fieldName)),
          jbod78_1248: parsePriceValue(findPrice(items, 'VCH-5000-J78-1248', fieldName)),
          jbod78_1872s: parsePriceValue(findPrice(items, 'VCH-5000-J78-1872s', fieldName)),
          jbod78_2340: parsePriceValue(findPrice(items, 'VCH-5000-J78-2340', fieldName)),
          jbod78_2496: parsePriceValue(findPrice(items, 'VCH-5000-J78-2496', fieldName)),
          
          // SSDs
          ssd_1_9: parsePriceValue(findPrice(items, 'VCH-NVME-1.9s', fieldName)),
          ssd_3_8: parsePriceValue(findPrice(items, 'VCH-NVME-3.8s', fieldName)),
          ssd_7_6: parsePriceValue(findPrice(items, 'VCH-NVME-7.6s', fieldName)),
          ssd_15_3: parsePriceValue(findPrice(items, 'VCH-NVME-15.3s', fieldName)),
          ssd_30_7: parsePriceValue(findPrice(items, 'VCH-NVME-30.7s', fieldName)),
          
          // Software
          highPerfSoftware: parsePriceValue(findPrice(items, 'VDP-SW-P-10-HP', fieldName)),
          capacitySoftware: parsePriceValue(findPrice(items, 'VDP-SW-P-10-C', fieldName)),
          softwareDiscount: parsePriceValue(findPrice(items, 'VDP-SW-P-10-PD', fieldName)),
          
          // Support
          hwSupportNBD: parsePriceValue(findPrice(items, 'HW-Support-NBD', fieldName)),
          hwSupportNBDYear6_7: parsePriceValue(findPrice(items, 'HW-Support-NBD Yr 6-7', fieldName))
        };

        setPricing(pricingObject);
      } catch (err) {
        console.error('Error fetching pricing data:', err);
        console.log('Selected Quarter:', selectedQuarter);
        console.log('Generated Field Name:', fieldName);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedQuarter) {
      fetchPricing();
    }
  }, [selectedQuarter]);

  // Helper function to find price for a specific part number
  const findPrice = (items, partNumber, fieldName) => {
    const item = items.find(item => item.PartNumber.trim() === partNumber);
    return item ? item[fieldName] : '0';
  };

  // Helper function to parse price values
  const parsePriceValue = (priceString) => {
    if (!priceString) return 0;
    // Handle both string and number inputs
    const stringValue = priceString.toString();
    // Remove currency symbols, commas, spaces, and convert to float
    return parseFloat(stringValue.replace(/[^0-9.-]+/g, '')) || 0;
  };

  return { pricing, loading, error };
};