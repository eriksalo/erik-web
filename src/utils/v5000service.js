import { API } from 'aws-amplify';

export const fetchQuarterPricing = async (quarter) => {
  try {
    const response = await API.graphql({
      query: `
        query GetQuarterPricing($quarter: String!) {
          listV5000Pricing(filter: { quarter: { eq: $quarter } }) {
            items {
              PartNumber
              Description
              Category
              Discount
              Price
            }
          }
        }
      `,
      variables: { quarter }
    });
    return response.data.listV5000Pricing.items;
  } catch (error) {
    console.error('Error fetching pricing:', error);
    throw error;
  }
};