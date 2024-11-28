// src/graphql/queries.js
export const listQuarterlyPricing = /* GraphQL */ `
  query ListQuarterlyPricing(
    $filter: ModelQuarterlyPricingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listQuarterlyPricing(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        quarter
        validFrom
        validTo
        veloPrice
        vpodPrice
        jbod78Price
        jbod108Price
        ssd384Price
        ssd768Price
        ssd1536Price
        hdd18Price
        hdd24Price
        hdd30Price
        hdd32Price
        isActive
        notes
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const getQuarterlyPricingByDate = /* GraphQL */ `
  query GetQuarterlyPricingByDate($date: AWSDateTime!) {
    listQuarterlyPricing(
      filter: {
        validFrom: { le: $date }
        validTo: { ge: $date }
        isActive: { eq: true }
      }
    ) {
      items {
        id
        quarter
        veloPrice
        vpodPrice
        jbod78Price
        jbod108Price
        ssd384Price
        ssd768Price
        ssd1536Price
        hdd18Price
        hdd24Price
        hdd30Price
        hdd32Price
      }
    }
  }
`;

export const getComponentSpecsByType = /* GraphQL */ `
  query GetComponentSpecsByType(
    $type: ComponentType!
    $filter: ModelComponentSpecsFilterInput
  ) {
    listComponentSpecs(
      filter: {
        and: [
          { type: { eq: $type } },
          { isActive: { eq: true } },
          $filter
        ]
      }
    ) {
      items {
        id
        type
        model
        version
        iopsPerUnit
        metadataOpsPerUnit
        transferRatePerUnit
        driveSlots
        ssdSlots
        isActive
        notes
      }
    }
  }
`;

// src/graphql/mutations.js
export const createQuarterlyPricing = /* GraphQL */ `
  mutation CreateQuarterlyPricing(
    $input: CreateQuarterlyPricingInput!
  ) {
    createQuarterlyPricing(input: $input) {
      id
      quarter
      validFrom
      validTo
      veloPrice
      vpodPrice
      jbod78Price
      jbod108Price
      ssd384Price
      ssd768Price
      ssd1536Price
      hdd18Price
      hdd24Price
      hdd30Price
      hdd32Price
      isActive
      notes
    }
  }
`;

export const updateQuarterlyPricing = /* GraphQL */ `
  mutation UpdateQuarterlyPricing(
    $input: UpdateQuarterlyPricingInput!
  ) {
    updateQuarterlyPricing(input: $input) {
      id
      quarter
      validFrom
      validTo
      veloPrice
      vpodPrice
      jbod78Price
      jbod108Price
      ssd384Price
      ssd768Price
      ssd1536Price
      hdd18Price
      hdd24Price
      hdd30Price
      hdd32Price
      isActive
      notes
    }
  }
`;

export const saveConfiguration = /* GraphQL */ `
  mutation SaveConfiguration(
    $input: CreateSavedConfigurationInput!
  ) {
    createSavedConfiguration(input: $input) {
      id
      name
      description
      quarterPricingId
      veloCount
      veloSsdSize
      vpodCount
      jbodSize
      hddSize
      totalSsdCapacity
      totalHddCapacity
      totalIops
      totalMetadataOps
      totalTransferRate
      totalCost
      createdAt
      updatedAt
    }
  }
`;

// src/graphql/subscriptions.js
export const onPriceUpdate = /* GraphQL */ `
  subscription OnPriceUpdate {
    onUpdateQuarterlyPricing {
      id
      quarter
      validFrom
      validTo
      veloPrice
      vpodPrice
      jbod78Price
      jbod108Price
      ssd384Price
      ssd768Price
      ssd1536Price
      hdd18Price
      hdd24Price
      hdd30Price
      hdd32Price
      isActive
    }
  }
`;