export const platformConfig = {
  feeRate: parseFloat(process.env.PLATFORM_FEE_RATE || "0.2"),
};

export function calculateCreditCost(rewardAmount: number): number {
  return Math.ceil(rewardAmount * (1 + platformConfig.feeRate));
}
