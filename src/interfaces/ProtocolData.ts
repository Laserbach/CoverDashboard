export default interface ProtocolData {
  timestamp: number;
  claim: {
    price: number;
    swapVol: string;
    liquidity: number;
  };
  noclaim: {
    price: number;
    swapVol: string;
    liquidity: number;
  };
}
