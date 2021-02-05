export default interface TimeseriesRecord {
  timestamp: number;
  claim: {
    price: number;
    swapVol: number;
    swapVolCum: number;
    liquidity: number;
    poolId: string;
  };
  noclaim: {
    price: number;
    swapVol: number;
    swapVolCum: number;
    liquidity: number;
    poolId: string;
  };
}