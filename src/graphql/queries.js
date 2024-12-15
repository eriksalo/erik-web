/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getPart = /* GraphQL */ `
  query GetPart($id: ID!) {
    getPart(id: $id) {
      id
      partNumber
      description
      discount
      pricing2024Q1
      pricing2024Q2
      pricing2024Q3
      pricing2024Q4
      pricing2025Q1
      pricing2025Q2
      pricing2025Q3
      pricing2025Q4
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listParts = /* GraphQL */ `
  query ListParts(
    $filter: ModelPartFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listParts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        partNumber
        description
        discount
        pricing2024Q1
        pricing2024Q2
        pricing2024Q3
        pricing2024Q4
        pricing2025Q1
        pricing2025Q2
        pricing2025Q3
        pricing2025Q4
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
