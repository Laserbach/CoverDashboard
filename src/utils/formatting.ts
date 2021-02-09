import {ONE_WEEK} from "../utils/chartTimeAndType";

export const formatNumber = (num: number, digits: number, char: string) => {
    return `${Number(num.toFixed(digits))}${char}`;
}

export const formatCurrencyWithDigits = (num: number, digits: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: digits}).format(num);
}

export const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2}).format(num);
}   

export const formatPercent = (percent: number) => {
    return new Intl.NumberFormat("en-US", {style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2}).format(percent);
}

export const formatToInteger = (num: number) => {
    num = Math.round(num);
    return new Intl.NumberFormat("en-Us", {minimumFractionDigits: 0, maximumFractionDigits: 0}).format(num);
}

export const formatBigNumber = (num: number) => {
    const multipliers = [{amount: 1000000, symbol: "M"}, {amount: 1000, symbol: "K"}];
    let multiplierSymbol = "";
    multipliers.forEach((multiplier) => {
      if (num >= multiplier.amount) {
        num = num / multiplier.amount;
        multiplierSymbol = multiplier.symbol;
        return;
      }
    });
    return formatNumber(num, 2, multiplierSymbol);
}

export const formatToDate = (timestamp: number, chartTime: number) => {
    let date = new Date(timestamp);
    if (chartTime <= ONE_WEEK && chartTime !== -1) {
      return date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString('en-US');
    } else {
      return date.toLocaleDateString("en-US");
    }
}

export const formatToDateTime = (timestamp: number | any) => {
    let date = new Date(timestamp);
    return date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString('en-US');
}