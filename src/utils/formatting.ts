export const digitsformatter = (num: number, digits: number, char: string) => {
    return Number(num.toFixed(digits)) + char;
}

export const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

export const formatPercent = (percent: number) => {
    return new Intl.NumberFormat("en-US", {style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2}).format(percent);
}

export const formatToInteger = (num: number) => {
    num = Math.round(num);
    return new Intl.NumberFormat("en-Us", {minimumFractionDigits: 0, maximumFractionDigits: 0}).format(num);
}