const chartTimes: string[] = ["1h", "1d", "1w", "30d", "all"];
const chartTypes: string[] = ["price", "volume", "liquidity"];
const chartTimeToMs: Map<string, number> = new Map();

export const ONE_HOUR = 1000*60*60;
export const ONE_DAY = 1000*60*60*24;
export const ONE_WEEK = 1000*60*60*24*7;
export const ONE_MONTH = 1000*60*60*24*30;
export const ONE_YEAR = 1000*60*60*24*365;

chartTimeToMs.set(chartTimes[0], ONE_HOUR);
chartTimeToMs.set(chartTimes[1], ONE_DAY);
chartTimeToMs.set(chartTimes[2], ONE_WEEK);
chartTimeToMs.set(chartTimes[3], ONE_MONTH);
chartTimeToMs.set(chartTimes[4], -1);

export const getAllTypes = () => {
    return chartTypes;
};

export const getAllTimes = () => {
    return chartTimes;
};

export const getMsFromTime = (time: string) => {
    return chartTimeToMs.get(time) || 0;
};

