import CoverObject from "./CoverObject";
export default interface Protocol {
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
  coverObjects: CoverObject[];
  migrated: boolean;
}