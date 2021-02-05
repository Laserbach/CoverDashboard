export default interface TimeseriesRecord {
  timestamp: number;
  claim: {
    price: number;
    swapVol: number;
    liquidity: number;
  };
  noclaim: {
    price: number;
    swapVol: number;
    liquidity: number;
  };
}