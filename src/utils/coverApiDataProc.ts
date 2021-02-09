import TimeseriesRecord from "../interfaces/TimeseriesRecord";

const SYMBOL_CLAIM_IDENTIFIER = "_CLAIM";
const SYMBOL_NOCLAIM_IDENTIFIER = "_NOCLAIM";

export const getMostRelevantPool = (claim: boolean, pools: any) => {
    let secondIdentifier = SYMBOL_CLAIM_IDENTIFIER;
    if(claim === false) secondIdentifier = SYMBOL_NOCLAIM_IDENTIFIER;
    let liqMax: number = 0;
    let poolId: string = "";

    for (let pool in pools) {
        if(pools[pool].liquidity >= liqMax
            && pools[pool].symbol.indexOf(secondIdentifier) > -1) {
            poolId = pools[pool].poolId;
            liqMax = pools[pool].liquidity;
        }
    }
    return poolId;
}

export const getMostRelevantPoolBySymbol = (symbolName: string, claim: boolean, pools: any) => {
    let secondIdentifier = SYMBOL_CLAIM_IDENTIFIER;
    if(claim === false) secondIdentifier = SYMBOL_NOCLAIM_IDENTIFIER;
    let liqMax: number = 0;
    let poolId: string = "";
    let claimTokenAddr: string = "";
    let symbolIdentifier = `_${symbolName.toUpperCase()}_`;
    let covTokenIdentifier: string = "covToken";

    for (let pool in pools) {
        if(pools[pool].poolId.liquidity >= liqMax && pools[pool].symbol.indexOf(symbolIdentifier) > -1
            && pools[pool].symbol.indexOf(secondIdentifier) > -1) {
            poolId = pool
            liqMax = pools[pool].poolId.liquidity;
            for (let token of pools[pool].poolId.tokens) {
                if(token.name === covTokenIdentifier) {
                    claimTokenAddr = token.address;
                }
            }
        }
    }
    return [poolId, claimTokenAddr];
}

export const apiDataToTimeseriesRecords = (data: any) => {
    let records: TimeseriesRecord[] = [];
    let lastClaimVol : number = 0;
    let lastNoClaimVol : number = 0;

    for (let record of data["Items"]) {
        let pools = record.protocolData.poolData;
        let poolIDClaim: string = getMostRelevantPool(true, pools);
        let poolIDNoClaim: string = getMostRelevantPool(false, pools);

        if (record.protocolData.poolData) {
            records.push({
                timestamp: record.timestamp,
                claim: {
                    price: record.protocolData.poolData[poolIDClaim].price,
                    swapVol: record.protocolData.poolData[poolIDClaim].totalSwapFee - lastClaimVol,
                    swapVolCum: record.protocolData.poolData[poolIDClaim].totalSwapFee,
                    liquidity: record.protocolData.poolData[poolIDClaim].liquidity,
                    poolId: poolIDClaim
                },
                noclaim: {
                    price: record.protocolData.poolData[poolIDNoClaim].price,
                    swapVol: record.protocolData.poolData[poolIDNoClaim].totalSwapFee - lastNoClaimVol,
                    swapVolCum: record.protocolData.poolData[poolIDNoClaim].totalSwapFee,
                    liquidity: record.protocolData.poolData[poolIDNoClaim].liquidity,
                    poolId: poolIDNoClaim
                },
                collateralStakedValue: record.protocolData.coverObjects[0].collateralStakedValue
            });
            
            lastClaimVol = record.protocolData.poolData[poolIDClaim].totalSwapFee;
            lastNoClaimVol = record.protocolData.poolData[poolIDNoClaim].totalSwapFee;
        }
    }
    // need to remove the first entry because of cummulated volume data
    // (otherwise first record would be an enormous spike in volume)
    records.shift();
    return records;
}

export const filterVolumeRecords = (records: TimeseriesRecord[], ms: number) => {
    let filteredRecords: TimeseriesRecord[] = [];
    let lastTimestamp: number = 0

    for(let record of records) {
        if ((record.claim.swapVol != 0 || record.noclaim.swapVol != 0) || (Math.abs(lastTimestamp - record.timestamp) >= ms)) {
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

/**
 * Finds all Timeseries Records with each distinct Timestamp of multiple Responses from Cover API.
 * @param allTimeseriesData array of JSON responses of the Timeseries Endpoint from Cover API
 */
export const findAllRecordsAndDistinctTimestamps = (allTimeseriesData: any[]) : [number[], TimeseriesRecord[][]] => {
    let distinctTimestamps = new Map<number, number>();
    let allRecords: TimeseriesRecord[][] = [];
    allTimeseriesData.forEach((data) => {
        let records: TimeseriesRecord[] = apiDataToTimeseriesRecords(data);
        allRecords.push(records);
        records.forEach((record) => {
            distinctTimestamps.set(record.timestamp, 0);
        });
    });

    let timestamps: number[] = [];
    distinctTimestamps.forEach((obj: number, timestamp: number) => {
        timestamps.push(timestamp);
    });
    timestamps.sort();
    return [timestamps, allRecords];
}

/**
 * With this function we extend the records received by the Cover API.
 * The API does not provide a CollateralStakedValue for each timestamp, it is rather inconsistent.
 * So with this function we find the CSV of a protocol of each timestamp we need (timestamp array) and 
 * fill it to a given number array (collateralStakedValues).
 * 
 * @param records all TimeseriesRecords which exist for a single protocol from Cover API
 * @param timestamps array of distinct timestamps (MUST be sorted ascending)
 * @param collateralStakedValues array which will be filled up with all CSVs (length must be same as of timestamp array)
 */
export const setCSVsForAnyTimestamp = (records: TimeseriesRecord[], timestamps: number[], collateralStakedValues: number[]) => {
    let indexLastRecordUsed: number = 0;
    let lastCSVSeen: number = 0;
    for (let i = 0; i<timestamps.length; i++) {
        let timestamp = timestamps[i];
        if (records[indexLastRecordUsed] === undefined || records[indexLastRecordUsed].timestamp > timestamp) {
            collateralStakedValues[i] += lastCSVSeen;
        } else {
            collateralStakedValues[i] += records[indexLastRecordUsed].collateralStakedValue;
            lastCSVSeen = records[indexLastRecordUsed].collateralStakedValue;
            indexLastRecordUsed++;
        }
    }
}