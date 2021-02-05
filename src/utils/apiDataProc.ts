import TimeseriesRecord from "../interfaces/TimeseriesRecord";

const SYMBOL_CLAIM_IDENTIFIER = "_CLAIM";
const SYMBOL_NOCLAIM_IDENTIFIER = "_NOCLAIM";

export const apiDataToTimeseriesRecords = (data: any) => {
    let records: TimeseriesRecord[] = [];
    let lastClaimVol : number = 0;
    let lastNoClaimVol : number = 0;

    for (let record of data["Items"]) {
        let poolIDClaim: string = "";
            let poolIDNoClaim: string = "";
            let liqClaimMax: number = 0;
            let liqNoClaimMax: number = 0;
            
            let pools = record.protocolData.poolData;
            for (let pool in pools) {
                if(pools[pool].liquidity >= liqClaimMax && pools[pool].symbol.indexOf(SYMBOL_CLAIM_IDENTIFIER) > -1) {
                    poolIDClaim = pools[pool].poolId;
                    liqClaimMax = pools[pool].liquidity;
                } else if (pools[pool].liquidity >= liqNoClaimMax && pools[pool].symbol.indexOf(SYMBOL_NOCLAIM_IDENTIFIER) > -1) {
                    poolIDNoClaim = pools[pool].poolId;
                    liqNoClaimMax = pools[pool].liquidity;
                }
            }

            records.push({
                timestamp: record.timestamp,
                claim: {
                    price: record.protocolData.poolData[poolIDClaim].price,
                    swapVol: record.protocolData.poolData[poolIDClaim].totalSwapFee - lastClaimVol,
                    liquidity: record.protocolData.poolData[poolIDClaim].liquidity
                },
                noclaim: {
                    price: record.protocolData.poolData[poolIDNoClaim].price,
                    swapVol: record.protocolData.poolData[poolIDNoClaim].totalSwapFee - lastNoClaimVol,
                    liquidity: record.protocolData.poolData[poolIDNoClaim].liquidity
                }
            });
            
            lastClaimVol = record.protocolData.poolData[poolIDClaim].totalSwapFee;
            lastNoClaimVol = record.protocolData.poolData[poolIDNoClaim].totalSwapFee;
    }
    // need to remove the first entry because of cummulated volume data
    // (otherwise first record would be an enormous spike in volume)
    records.shift();
    return records;
}

export const getFilteredRecords = (records: TimeseriesRecord[], ms: number) => {
    let filteredRecords: TimeseriesRecord[] = [];
    let lastTimestamp: number = 0

    for(let record of records) {
        if (Math.abs(lastTimestamp - record.timestamp) >= ms) {
            filteredRecords.push(record)
            lastTimestamp = record.timestamp;
        }
    }
    
    filteredRecords.sort(function(A, B) {
        return A.timestamp - B.timestamp;
    });

    return filteredRecords;
}

export const getRecordsNotOlderThan = (records: TimeseriesRecord[], timeInMS: number) => {
    let now = new Date().getTime();
    let thresh = now-timeInMS;
    let filteredRecords: TimeseriesRecord[] = [];
    for(let record of records) {
        if (record.timestamp >= thresh) {
            filteredRecords.push(record)
        }
    }

    return filteredRecords;
}