import { useState, useEffect } from 'react';
import { fetchQuarterPricing } from '../utils/v5000service';
import { calculatePricing } from '../utils/pricingCalculator';

export const useV5000Pricing = (selectedQuarter) => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPricing = async () => {
      try {
        setLoading(true);
        const rawPricing = await fetchQuarterPricing(selectedQuarter);
        const calculatedPricing = calculatePricing(rawPricing);
        setPricing(calculatedPricing);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedQuarter) {
      loadPricing();
    }
  }, [selectedQuarter]);

  return { pricing, loading, error };
};