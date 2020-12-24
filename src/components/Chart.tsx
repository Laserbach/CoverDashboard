import { FC } from "react";
import {
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import ProtocolData from "../interfaces/ProtocolData";
import { toNiceDate, toK, formatTvl, toNiceDateYear } from "../utils/index";

interface ProtocolDataArray {
  data: ProtocolData[] | undefined;
  tokenType:
    | "claim.price"
    | "noclaim.price"
    | "claim.liquidity"
    | "noclaim.liquidity";
}

const Chart: FC<ProtocolDataArray> = ({ data, tokenType }) => {
  return (
    <ResponsiveContainer width="99%" height={400}>
      <AreaChart data={data} margin={{ right: 20 }}>
        <Area
          type="monotone"
          dataKey={tokenType}
          stroke="#6b7affcc"
          strokeWidth={3}
          fill="#6b7affcc"
          name="Price"
        />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(tick) => toNiceDate(tick)}
          stroke="#ffffff"
          minTickGap={30}
          interval="preserveStart"
        />
        <YAxis
          orientation="right"
          tickFormatter={(tick) => formatTvl(tick)}
          stroke="#ffffff"
        />
        <Tooltip
          formatter={(val) => toK(val)}
          labelFormatter={(label) => toNiceDateYear(label)}
          labelStyle={{ color: "#21222c" }}
          cursor={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default Chart;
