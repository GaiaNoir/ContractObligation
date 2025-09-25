/**
 * Pricing calculation utilities for contract obligation extraction
 */

export interface PricingTier {
  minContracts: number;
  maxContracts: number | null;
  pricePerContract: number;
  description: string;
}

export interface PricingCalculation {
  contractCount: number;
  pricePerContract: number;
  totalPrice: number;
  savings: number;
  tier: PricingTier;
}

// Pricing tiers based on volume
export const PRICING_TIERS: PricingTier[] = [
  {
    minContracts: 1,
    maxContracts: 4,
    pricePerContract: 5,
    description: "Standard Rate"
  },
  {
    minContracts: 5,
    maxContracts: 9,
    pricePerContract: 4,
    description: "Volume Discount"
  },
  {
    minContracts: 10,
    maxContracts: null,
    pricePerContract: 3,
    description: "Bulk Discount"
  }
];

/**
 * Calculate pricing based on number of contracts
 */
export function calculatePricing(contractCount: number): PricingCalculation {
  if (contractCount <= 0) {
    throw new Error('Contract count must be greater than 0');
  }

  // Find the appropriate pricing tier
  const tier = PRICING_TIERS.find(tier => {
    return contractCount >= tier.minContracts && 
           (tier.maxContracts === null || contractCount <= tier.maxContracts);
  });

  if (!tier) {
    throw new Error('No pricing tier found for contract count: ' + contractCount);
  }

  const totalPrice = contractCount * tier.pricePerContract;
  const standardPrice = contractCount * PRICING_TIERS[0].pricePerContract;
  const savings = standardPrice - totalPrice;

  return {
    contractCount,
    pricePerContract: tier.pricePerContract,
    totalPrice,
    savings,
    tier
  };
}

/**
 * Convert USD price to ZAR (South African Rand)
 * Using approximate exchange rate: 1 USD = 18 ZAR
 */
export function convertToZAR(usdAmount: number): number {
  const exchangeRate = 18; // 1 USD = 18 ZAR (approximate)
  return Math.round(usdAmount * exchangeRate);
}

/**
 * Get pricing summary text for display
 */
export function getPricingSummary(contractCount: number): string {
  const pricing = calculatePricing(contractCount);
  
  if (contractCount === 1) {
    return `$${pricing.totalPrice} for ${contractCount} contract`;
  }
  
  if (pricing.savings > 0) {
    return `$${pricing.totalPrice} for ${contractCount} contracts ($${pricing.pricePerContract} each - Save $${pricing.savings}!)`;
  }
  
  return `$${pricing.totalPrice} for ${contractCount} contracts ($${pricing.pricePerContract} each)`;
}

/**
 * Get detailed pricing breakdown for UI display
 */
export function getPricingBreakdown(contractCount: number) {
  const pricing = calculatePricing(contractCount);
  
  return {
    contractCount: pricing.contractCount,
    pricePerContract: pricing.pricePerContract,
    totalPrice: pricing.totalPrice,
    totalPriceZAR: convertToZAR(pricing.totalPrice),
    savings: pricing.savings,
    tierDescription: pricing.tier.description,
    hasSavings: pricing.savings > 0
  };
}
