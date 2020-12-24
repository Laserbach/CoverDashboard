export default interface Protocols {
  claimNonce: number;
  protocolAddress: string;
  expirationTimestamps: number[];
  collaterals: { address: string; active: boolean }[];
  protocolTokenAddress: string;
  coverObjects: {
    coverAddress: string;
    nonce: number;
    expirationTimestamp: number;
    tokens: {
      claim: {
        address: string;
        totalSupply: string;
        direction: string;
      };
      noClaim: {
        address: string;
        totalSupply: string;
        direction: string;
      };
    };
    collateral: {
      symbol: string;
      address: string;
      price: number;
      staked: number;
      stakedUsd: number;
    };
  };
  active: boolean;
  id: string;
  name: string;
  url: string;
  redeemDelay: {
    claim: number;
    noClaim: number;
  };
}
