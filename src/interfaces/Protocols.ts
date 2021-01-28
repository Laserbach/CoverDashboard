export default interface Protocols {
  protocolActive: boolean;
  claimNonce: number;
  protocolName: string;
  protocolAddress: string;
  expirationTimestamps: number[];
  claimRedeemDelay: number;
  noclaimRedeemDelay: number;
  collaterals: { address: string; active: boolean }[];
  protocolTokenAddress: string;
  protocolUrl: string;
  protocolDisplayName: string;
  coverObjects: {
    protocolName: string;
    coverAddress: string;
    nonce: number;
    expirationTimestamp: number;
    collateralAddress: string;
    collateralStakedValue: number;
    tokens: {
      claimAddress: string;
      noClaimAddress: string;
      claimTotalSupply:{
        type: string;
        hex: string;
      };
      noClaimTotalSupply:{
        type: string;
        hex: string;
      };          
      claimBalance: boolean;
      noClaimBalance:boolean;
    };
  };
}