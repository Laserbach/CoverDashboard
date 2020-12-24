import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Numeral from "numeral";
dayjs.extend(utc);

export const toNiceDate = (date: number) => {
  date = date * 1000;
  let x = dayjs.utc(date).format("MMM DD");
  return x;
};

export const toK = (num: string | number | (string | number)[]) => {
  return Numeral(num).format("$0.[00]a");
};

export const formatTvl = (num: number) => {
  return Numeral(num).format("$0,0[.]00");
};

export const toNiceDateYear = (date: string | number) => {
  if (typeof date === "number") {
    date = date * 1000;
  }
  return dayjs.utc(date).format("MMM D HH:mm");
};
