export const digitsformatter = (num: number, digits: number, char: string) => {
    return Number(num.toFixed(digits)) + char;
}

export const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

export const formatPercent = (percent: number) => {
    return new Intl.NumberFormat("en-US", {style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2}).format(percent);
}