export const getImageSrcOfProtocol = (protocolName: string) => {
  let imgURLIdentifier = protocolName.toLowerCase();
  // need to switch the img Identifier because the API has some typos in it..
  switch (imgURLIdentifier) {
    case "stablize":
      imgURLIdentifier = "stabilize";
      break;
    case "badgerdao":
      imgURLIdentifier = "badger";
      break;
    case "cds_rcweth":
      imgURLIdentifier = "ruler";
      break;
    case "cds_rccover":
      imgURLIdentifier = "ruler";
      break;
    case "cds_rcwbtc":
      imgURLIdentifier = "ruler";
      break;
    default:
      break;
  }
  return `https://app.coverprotocol.com/${imgURLIdentifier}_logo.png`;
};
