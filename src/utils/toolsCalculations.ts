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
  const balanceClaim : number = parseFloat(poolObjs[0].balanceCov + ""); 
  const weeklyRewardsClaimPool : number = parseFloat(bonusRewardObjs[0].weeklyRewards + "");
  const endTime : number = parseFloat(bonusRewardObjs[0].endTime + "");
  const weeklyRewardsNoClaimPool : number = parseFloat(bonusRewardObjs[1].weeklyRewards + "");
  const balanceNoClaim : number = parseFloat(poolObjs[1].balanceCov + "");


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
  const endTime : number = parseFloat(bonusRewardObj.endTime + ""); // COVER API - BADGER
  const weeklyRewardsNoClaimPool : number = parseFloat(bonusRewardObj.weeklyRewards + ""); // COVER API - BADGER
  const balanceNoClaim : number = parseFloat(poolObjNoClaim.balanceCov + ""); // COVER API - BADGER


  // COINGECKO API
  const bonusTokenPrice : number = parseFloat(tokenPrice + ""); // GECKO API - tokenAddr BADGER

  // INPUT DATA
  const currentUnixTime : number = new Date().getTime()/1000;

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
  const swapFee : number = parseFloat(poolObj.swapFee + "");
  const denormWeightClaim : number = parseFloat(poolObj.denormWeightCov + "");
  const denormWeightDai : number = parseFloat(poolObj.denormWeightDai + "");
  const balanceClaim : number = parseFloat(poolObj.balanceCov + "");
  const balanceDai : number = parseFloat(poolObj.balanceDai + "");
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
  let targetEndPrice : number = 1;
  let swapFee : number = parseFloat(poolObj[0].swapFee + "");
  let denormWeightClaim : number = parseFloat(poolObj[0].denormWeightCov + "");
  let denormWeightDai : number = parseFloat(poolObj[0].denormWeightDai + "");
  let priceClaimToken : number = parseFloat(poolObj[0].priceCov + "");
  let balanceClaim : number = parseFloat(poolObj[0].balanceCov + mintAmount + "");
  let balanceDai : number = parseFloat(poolObj[0].balanceDai + mintAmount * priceClaimToken + "" );

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
  let denormWeightNolaim : number = poolObj[1].denormWeightCov;
  denormWeightDai = poolObj[1].denormWeightDai;
  let priceNoclaimToken : number = poolObj[1].priceCov;
  let balanceNoclaim : number = poolObj[1].balanceCov + mintAmount;
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
  let targetEndPrice : number = 0.03;
  let swapFee : number = parseFloat(poolObj[0].swapFee + "");
  let denormWeightClaim : number = parseFloat(poolObj[0].denormWeightCov + "");
  let denormWeightDai : number = parseFloat(poolObj[0].denormWeightDai + "");
  let priceClaimToken : number = parseFloat(poolObj[0].priceCov + "");
  let balanceClaim : number = parseFloat(poolObj[0].balanceCov + mintAmount + "");
  let balanceDai : number = parseFloat(poolObj[0].balanceDai + mintAmount * priceClaimToken + "");

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
  let denormWeightNolaim : number = parseFloat(poolObj[1].denormWeightCov + "");
  denormWeightDai = poolObj[1].denormWeightDai;
  let priceNoclaimToken : number = parseFloat(poolObj[1].priceCov + "");
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
  const targetEndPrice : number = 0.03;
  const swapFee : number = parseFloat(poolObj.swapFee + "");
  const denormWeightNolaim : number = parseFloat(poolObj.denormWeightCov + "");
  const denormWeightDai : number = parseFloat(poolObj.denormWeightDai + "");
  const priceNoclaimToken : number = parseFloat(poolObj.priceCov + "");
  const balanceNoclaim : number = parseFloat(poolObj.balanceCov + mintAmount + "");

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
  const targetEndPrice : number = 1;
  const swapFee : number = parseFloat(poolObj.swapFee + "");
  const denormWeightNolaim : number = parseFloat(poolObj.denormWeightCov + "");
  const denormWeightDai : number = parseFloat(poolObj.denormWeightDai + "");
  const priceNoclaimToken : number = parseFloat(poolObj.priceCov + "");
  const balanceDai : number = parseFloat(poolObj.balanceDai + mintAmount + "");

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
