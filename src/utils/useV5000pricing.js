import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { useState, useEffect } from 'react';

export const useV5000pricing = (quarter) => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const client = generateClient();

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoading(true);
        const response = await client.graphql({
          query: `
            query GetV5000Pricing($quarter: String!) {
              getV5000Pricing(quarter: $quarter) {
                quarter
                velo
                vpod
                jbod78
                jbod108
                ssd_1_92
                ssd_3_84
                ssd_7_68
                ssd_15_36
                hdd_18
                hdd_20
                hdd_22
                softwareDiscount
                ssdSoftware
                hddSoftware
                discountMonths
              }
            }
          `,
          variables: {
            quarter: quarter
          }
        });

        const pricingData = response.data.getV5000Pricing;
        setPricing(pricingData);
      } catch (err) {
        console.error('Error fetching pricing data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (quarter) {
      fetchPricing();
    }
  }, [quarter]);

  return { pricing, loading, error };
};