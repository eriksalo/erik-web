import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';

export const useV5000pricing = (selectedQuarter) => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const findPrice = (items, partNumber) => {
    const item = items.find(item => item.PartNumber?.trim() === partNumber);
    console.log(`Looking up price for ${partNumber}:`, item);
    if (!item) {
      console.warn(`No price found for part number: ${partNumber}`);
      return { price: 0, discount: 0, description: '' };
    }
    return {
      price: item.Price || 0,
      discount: item.Discount || 0,
      description: item.Description || ''
    };
  };

  useEffect(() => {
    const fetchPricing = async () => {
      if (!selectedQuarter) {
        setPricing(null);
        setLoading(false);
        return;
      }

      console.log('Looking up prices for quarter:', selectedQuarter);
      
      try {
        setLoading(true);
        const client = generateClient();
        
        // Using a simpler query structure
        const query = /* GraphQL */ `
          query ListV5000pricings($quarterFilter: String!) {
            listV5000pricings(filter: { Quarter: { eq: $quarterFilter }}) {
              items {
                id
                PartNumber
                Description
                Price
                Discount
                Quarter
              }
            }
          }
        `;

        const variables = {
          quarterFilter: selectedQuarter
        };

        console.log('Executing query with variables:', variables);

        const response = await client.graphql({
          query,
          variables
        });

        console.log('Raw response:', JSON.stringify(response, null, 2));

        // Check for GraphQL errors
        if (response.errors) {
          throw new Error(response.errors[0]?.message || 'GraphQL query failed');
        }

        const items = response.data?.listV5000pricings?.items;
        
        if (!items || items.length === 0) {
          throw new Error(`No pricing data found for quarter: ${selectedQuarter}`);
        }

        // Log all received items for debugging
        console.log('Received items:', items);

        // Process the pricing data
        const pricingObject = {
          quarter: selectedQuarter,
          // Directors
          director: findPrice(items, 'VCH-5000-D1N'),
          director5050: findPrice(items, 'VCH-5050-D1N'),
          auxiliaryNode: findPrice(items, 'VCH-5000-X1N'),
          
          // Storage Nodes
          storageNode: findPrice(items, 'VCH-5000-S1N'),
          storageNode5050: findPrice(items, 'VCH-5050-S1N'),
          
          // JBODs
          jbod108_1728: findPrice(items, 'VCH-5000-J108-1728'),
          jbod108_2592s: findPrice(items, 'VCH-5000-J108-2592s'),
          jbod108_3240: findPrice(items, 'VCH-5000-J108-3240'),
          jbod108_3456: findPrice(items, 'VCH-5000-J108-3456'),
          
          // Small JBODs
          jbod78_1248: findPrice(items, 'VCH-5000-J78-1248'),
          jbod78_1872s: findPrice(items, 'VCH-5000-J78-1872s'),
          jbod78_2340: findPrice(items, 'VCH-5000-J78-2340'),
          jbod78_2496: findPrice(items, 'VCH-5000-J78-2496'),
          
          // SSDs
          ssd_1_9: findPrice(items, 'VCH-NVME-1.9s'),
          ssd_3_8: findPrice(items, 'VCH-NVME-3.8s'),
          ssd_7_6: findPrice(items, 'VCH-NVME-7.6s'),
          ssd_15_3: findPrice(items, 'VCH-NVME-15.3s'),
          ssd_30_7: findPrice(items, 'VCH-NVME-30.7s'),
          
          // Software
          highPerfSoftware: findPrice(items, 'VDP-SW-P-10-HP'),
          capacitySoftware: findPrice(items, 'VDP-SW-P-10-C'),
          softwareDiscount: findPrice(items, 'VDP-SW-P-10-PD')
        };

        console.log('Generated pricing object:', pricingObject);
        setPricing(pricingObject);

      } catch (err) {
        console.error('Error fetching pricing data:', {
          message: err.message,
          errors: err.errors,
          stack: err.stack,
          response: err.response
        });
        setError(err);
        setPricing(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [selectedQuarter]);

  return { pricing, loading, error };
};