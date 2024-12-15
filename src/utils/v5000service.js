import { generateClient } from '@aws-amplify/api';

// Create a client instance outside the function so it's only created once
const client = generateClient();

export const fetchQuarterPricing = async (quarter) => {
  try {
    const response = await client.graphql({
      query: `
        query GetQuarterPricing($quarter: String!) {
          listV5000pricing(filter: { quarter: { eq: $quarter } }) {
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
    return response.data.listV5000pricing.items;
  } catch (error) {
    console.error('Error fetching pricing:', error);
    throw error;
  }
};