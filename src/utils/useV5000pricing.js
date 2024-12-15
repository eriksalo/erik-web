import { API } from 'aws-amplify';
import { useState, useEffect } from 'react';
import { listPricings } from '../graphql/queries';

interface PricingData {
  velo: number;
  vpod: number;
  jbod78: number;
  jbod108: number;
  ssd_1_92: number;
  ssd_3_84: number;
  ssd_7_68: number;
  ssd_15_36: number;
  hdd_18: number;
  hdd_20: number;
  hdd_22: number;
  softwareDiscount: number;
  hddSoftware: number;
  ssdSoftware: number;
  discountMonths: number;
}

export const useV5000pricing = (quarter: string) => {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoading(true);
        const response = await API.graphql({
          query: listPricings,
          variables: {
            filter: {
              quarter: {
                eq: quarter
              }
            }
          }
        });

        const pricingData = response.data.listPricings.items[0];
        if (pricingData) {
          setPricing(pricingData);
        } else {
          throw new Error(`No pricing data found for quarter ${quarter}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
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