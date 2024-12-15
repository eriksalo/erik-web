/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createPart = /* GraphQL */ `
  mutation CreatePart(
    $input: CreatePartInput!
    $condition: ModelPartConditionInput
  ) {
    createPart(input: $input, condition: $condition) {
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
export const updatePart = /* GraphQL */ `
  mutation UpdatePart(
    $input: UpdatePartInput!
    $condition: ModelPartConditionInput
  ) {
    updatePart(input: $input, condition: $condition) {
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
export const deletePart = /* GraphQL */ `
  mutation DeletePart(
    $input: DeletePartInput!
    $condition: ModelPartConditionInput
  ) {
    deletePart(input: $input, condition: $condition) {
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
