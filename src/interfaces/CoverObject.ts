export default interface CoverObject {
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
  }
}