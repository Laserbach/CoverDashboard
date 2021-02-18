import PoolData from "../interfaces/PoolData";

/**
 * 
 * @param bonusRewardObjs Bonus Reward Objects of CLAIM [0] and NOCLAIM [1] Token
 * @param tokenPrice price of the protocol in USD
 * @param mintAmount inputted mint amount
 * @param poolObjs Pools of CLAIM [0] and NOCLAIM [1] Token
 */
export const mmCalcBonusRewards = (
  bonusRewardObjs: any[],
  tokenPrice: number,
  mintAmount: number,
  poolObjs: PoolData[]
) : number => {
  // ##################################################################
  // ONLY FOR MM, farming bonus rewards (if available) in noclaim + claim pool
  // ##################################################################

  // COVER API DATA
  const balanceClaim = poolObjs[0].balanceCov; 
  const weeklyRewardsClaimPool = bonusRewardObjs[0].weeklyRewards;
  const endTime = bonusRewardObjs[0].endTime;
  const weeklyRewardsNoClaimPool = bonusRewardObjs[1].weeklyRewards;
  const balanceNoClaim = poolObjs[1].balanceCov;


  // COINGECKO API
  const bonusTokenPrice = tokenPrice; // GECKO API - tokenAddr BADGER

  // INPUT DATA
  const currentUnixTime = new Date().getTime()/1000;

  // BONUS REWARDS CALC
  const oneWeekUnix = 168 * 3600;
  const remainingRewardsNoClaimPool = (weeklyRewardsNoClaimPool * (endTime - currentUnixTime)) / (oneWeekUnix);
  const remainingRewardsClaimPool = (weeklyRewardsClaimPool * (endTime - currentUnixTime)) / (oneWeekUnix);

  const bonusRewardsUsd = ((1/balanceNoClaim)*mintAmount * remainingRewardsNoClaimPool * bonusTokenPrice) + ((1/balanceClaim)*mintAmount * remainingRewardsClaimPool * bonusTokenPrice);
  return bonusRewardsUsd;
}

/**
 * 
 * @param bonusRewardObj Bonus Reward Object of NOCLAIM Token
 * @param tokenPrice price of the protocol in USD
 * @param mintAmount inputted mint amount
 * @param poolObjNoClaim Pools of NOCLAIM Token
 */
export const cpCalcBonusRewards = (
  bonusRewardObj: any,
  tokenPrice: number,
  mintAmount: number,
  poolObjNoClaim: PoolData
) : number => {
  // ##################################################################
  // ONLY FOR CP, farming bonus rewards (if available) in noclaim pool
  // ##################################################################

  // COVER API DATA
  const endTime = bonusRewardObj.endTime; // COVER API - BADGER
  const weeklyRewardsNoClaimPool = bonusRewardObj.weeklyRewards; // COVER API - BADGER
  const balanceNoClaim = poolObjNoClaim.balanceCov; // COVER API - BADGER


  // COINGECKO API
  const bonusTokenPrice = tokenPrice; // GECKO API - tokenAddr BADGER

  // INPUT DATA
  const currentUnixTime = new Date().getTime()/1000;

  // BONUS REWARDS CALC
  const oneWeekUnix = 168 * 3600;
  const remainingRewards = (weeklyRewardsNoClaimPool * (endTime - currentUnixTime)) / (oneWeekUnix);

  return (1/balanceNoClaim)*mintAmount * remainingRewards * bonusTokenPrice;
}


/**
 *
 * @param poolObj Pool of CLAIM Token
 * @param mintAmount Inputted Mint Amount
 */
export const cpCalcEarnedPremium = (
  poolObj: PoolData,
  mintAmount: number
): number => {
  const swapFee = poolObj.swapFee;
  const denormWeightClaim = poolObj.denormWeightCov;
  const denormWeightDai = poolObj.denormWeightDai;
  const balanceClaim = poolObj.balanceCov;
  const balanceDai = poolObj.balanceDai;
  // PREMIUM CALCULATION
  return (
    balanceDai *
    (1 -
      (balanceClaim / (balanceClaim + mintAmount * (1 - swapFee))) **
        (denormWeightClaim / denormWeightDai))
  );
};

/**
 *
 * @param poolObj[] Pools of CLAIM [0] and NOCLAIM [1] Token
 * @param mintAmount Inputted Mint Amount
 * @returns [swapFees, impermanentLoss]
 */
export const mmCalcSfAndILOnHack = (
  poolObj: PoolData[],
  mintAmount: number
): number[] => {
  // CLAIM POOL
  let targetEndPrice = 1;
  let swapFee = poolObj[0].swapFee;
  let denormWeightClaim = poolObj[0].denormWeightCov;
  let denormWeightDai = poolObj[0].denormWeightDai;
  let priceClaimToken = poolObj[0].priceCov;
  let balanceClaim = poolObj[0].balanceCov + mintAmount;
  let balanceDai = poolObj[0].balanceDai + mintAmount * priceClaimToken;

  // #################################
  // CALC SF + IL OF CLAIM POOL
  // #################################
  let normalizedWeightClaim =
    ((100 / (denormWeightClaim + denormWeightDai)) * denormWeightClaim) / 100;
  let slippagePerDai = (1 - swapFee) / (2 * balanceDai * normalizedWeightClaim);
  let daiSpent = (targetEndPrice / priceClaimToken - 1) / slippagePerDai;
  let earnedSwapFeesClaim = daiSpent * swapFee;
  let claimPriceChange = (targetEndPrice * 100) / priceClaimToken / 100;
  let poolValue =
    claimPriceChange * normalizedWeightClaim + (1 - normalizedWeightClaim);
  let assetValueIfHeld =
    claimPriceChange ** normalizedWeightClaim *
    1 ** (1 - normalizedWeightClaim);
  let impermanenLossClaim = Math.abs(assetValueIfHeld / poolValue - 1);

  // NOCLAIM POOL
  targetEndPrice = 0.03;
  swapFee = poolObj[1].swapFee;
  let denormWeightNolaim = poolObj[1].denormWeightCov;
  denormWeightDai = poolObj[1].denormWeightDai;
  let priceNoclaimToken = poolObj[1].priceCov;
  let balanceNoclaim = poolObj[1].balanceCov + mintAmount;
  balanceDai = poolObj[1].balanceDai + mintAmount * priceNoclaimToken;

  // #################################
  // CALC SF + IL OF NO CLAIM POOL
  // #################################
  let normalizedWeightDai =
    ((100 / (denormWeightNolaim + denormWeightDai)) * denormWeightDai) / 100;
  let slippagePerNoClaim =
    (1 - swapFee) / (2 * balanceNoclaim * normalizedWeightDai);
  let noclaimSpent =
    (1 - (targetEndPrice - priceNoclaimToken) / targetEndPrice) /
    slippagePerNoClaim;
  let earnedSwapFeesNoClaim = noclaimSpent * targetEndPrice * swapFee;
  let noclaimPriceChange = (targetEndPrice * 100) / priceNoclaimToken / 100;
  poolValue =
    (noclaimPriceChange * (100 - normalizedWeightDai * 100)) / 100 +
    normalizedWeightDai;
  assetValueIfHeld =
    noclaimPriceChange ** (1 - normalizedWeightDai) * 1 ** normalizedWeightDai;
  let impermanenLossNoClaim = Math.abs(assetValueIfHeld / poolValue - 1);

  // TOTAL
  const totalIL = impermanenLossClaim + impermanenLossNoClaim;
  const il = totalIL * mintAmount;
  const totalSF = earnedSwapFeesClaim + earnedSwapFeesNoClaim;
  return [totalSF, il];
};

/**
 *
 * @param poolObj[] Pools of CLAIM [0] and NOCLAIM [1] Token
 * @param mintAmount Inputted Mint Amount
 * @returns [swapFees, impermanentLoss]
 */
export const mmCalcSfAndILOnNoHack = (
  poolObj: PoolData[],
  mintAmount: number
): number[] => {
  // CLAIM POOL
  let targetEndPrice = 0.03;
  let swapFee = poolObj[0].swapFee;
  let denormWeightClaim = poolObj[0].denormWeightCov;
  let denormWeightDai = poolObj[0].denormWeightDai;
  let priceClaimToken = poolObj[0].priceCov;
  let balanceClaim = poolObj[0].balanceCov + mintAmount;
  let balanceDai = poolObj[0].balanceDai + mintAmount * priceClaimToken;

  // #################################
  // CALC SF + IL OF CLAIM POOL
  // #################################
  let normalizedWeightDai =
    ((100 / (denormWeightClaim + denormWeightDai)) * denormWeightDai) / 100;
  let slippagePerClaim =
    (1 - swapFee) / (2 * balanceClaim * normalizedWeightDai);
  let claimSpent =
    (1 - (targetEndPrice - priceClaimToken) / targetEndPrice) /
    slippagePerClaim;
  let earnedSwapFeesClaim = claimSpent * targetEndPrice * swapFee;
  let claimPriceChange = (targetEndPrice * 100) / priceClaimToken / 100;
  let poolValue =
    (claimPriceChange * (100 - normalizedWeightDai * 100)) / 100 +
    normalizedWeightDai;
  let assetValueIfHeld =
    claimPriceChange ** (1 - normalizedWeightDai) * 1 ** normalizedWeightDai;
  let impermanenLossClaim = Math.abs(assetValueIfHeld / poolValue - 1);

  // NOCLAIM POOL
  targetEndPrice = 1;
  swapFee = poolObj[1].swapFee;
  let denormWeightNolaim = poolObj[1].denormWeightCov;
  denormWeightDai = poolObj[1].denormWeightDai;
  let priceNoclaimToken = poolObj[1].priceCov;
  let balanceNoclaim = poolObj[1].balanceCov + mintAmount;
  balanceDai = poolObj[1].balanceDai + mintAmount * priceNoclaimToken;

  // #################################
  // CALC SF + IL OF NO CLAIM POOL
  // #################################
  let normalizedWeighNoClaim =
    ((100 / (denormWeightNolaim + denormWeightDai)) * denormWeightNolaim) / 100;
  let slippagePerDai =
    (1 - swapFee) / (2 * balanceDai * normalizedWeighNoClaim);
  let daiSpent = (targetEndPrice / priceNoclaimToken - 1) / slippagePerDai;
  let earnedSwapFeesNoClaim = daiSpent * swapFee;
  let noclaimPriceChange = (targetEndPrice * 100) / priceNoclaimToken / 100;
  poolValue =
    noclaimPriceChange * normalizedWeighNoClaim + (1 - normalizedWeighNoClaim);
  assetValueIfHeld =
    noclaimPriceChange ** normalizedWeighNoClaim *
    1 ** (1 - normalizedWeighNoClaim);
  let impermanenLossNoClaim = Math.abs(assetValueIfHeld / poolValue - 1);

  const totalIL = impermanenLossClaim + impermanenLossNoClaim;
  const il = totalIL * mintAmount;
  const totalSF = earnedSwapFeesClaim + earnedSwapFeesNoClaim;
  return [totalSF, il];
};

/**
 *
 * @param poolObj Pool of NOCLAIM Token
 * @param mintAmount Inputted Mint Amount
 * @returns [swapFees, impermanentLoss]
 */
export const cpCalcSfAndILOnHack = (
  poolObj: PoolData,
  mintAmount: number
): number[] => {
  const targetEndPrice = 0.03;
  const swapFee = poolObj.swapFee;
  const denormWeightNolaim = poolObj.denormWeightCov;
  const denormWeightDai = poolObj.denormWeightDai;
  const priceNoclaimToken = poolObj.priceCov;
  const balanceNoclaim = poolObj.balanceCov + mintAmount;

  // CALC SWAP Fees
  let normalizedWeightDai =
    ((100 / (denormWeightNolaim + denormWeightDai)) * denormWeightDai) / 100;
  let slippagePerNoClaim =
    (1 - swapFee) / (2 * balanceNoclaim * normalizedWeightDai);
  let noclaimSpent =
    (1 - (targetEndPrice - priceNoclaimToken) / targetEndPrice) /
    slippagePerNoClaim;
  let earnedSwapFees = noclaimSpent * targetEndPrice * swapFee;

  // CALC IMPERMANENT LOSS
  let noclaimPriceChange = (targetEndPrice * 100) / priceNoclaimToken / 100;
  let poolValue =
    (noclaimPriceChange * (100 - normalizedWeightDai * 100)) / 100 +
    normalizedWeightDai;
  let assetValueIfHeld =
    noclaimPriceChange ** (1 - normalizedWeightDai) * 1 ** normalizedWeightDai;
  let impermanenLoss = Math.abs(assetValueIfHeld / poolValue - 1);
  let il = impermanenLoss * mintAmount;

  return [earnedSwapFees, il];
};

/**
 *
 * @param poolObj Pool of NOCLAIM Token
 * @param mintAmount Inputted Mint Amount
 * @returns [swapFees, impermanentLoss]
 */
export const cpCalcSfAndILOnNoHack = (
  poolObj: PoolData,
  mintAmount: number
): number[] => {
  const targetEndPrice = 1;
  const swapFee = poolObj.swapFee;
  const denormWeightNolaim = poolObj.denormWeightCov;
  const denormWeightDai = poolObj.denormWeightDai;
  const priceNoclaimToken = poolObj.priceCov;
  const balanceDai = poolObj.balanceDai + mintAmount;

  // CALC SWAP Fees
  let normalizedWeighNoClaim =
    ((100 / (denormWeightNolaim + denormWeightDai)) * denormWeightNolaim) / 100;
  let slippagePerDai =
    (1 - swapFee) / (2 * balanceDai * normalizedWeighNoClaim);
  let daiSpent = (targetEndPrice / priceNoclaimToken - 1) / slippagePerDai;
  let earnedSwapFees = daiSpent * swapFee;

  // CALC IMPERMANENT LOSS
  let noclaimPriceChange = (targetEndPrice * 100) / priceNoclaimToken / 100;
  let poolValue =
    noclaimPriceChange * normalizedWeighNoClaim + (1 - normalizedWeighNoClaim);
  let assetValueIfHeld =
    noclaimPriceChange ** normalizedWeighNoClaim *
    1 ** (1 - normalizedWeighNoClaim);
  let impermanenLoss = Math.abs(assetValueIfHeld / poolValue - 1);
  let il = impermanenLoss * mintAmount;

  return [earnedSwapFees, il];
};
