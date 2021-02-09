import { FC } from "react";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, ReferenceLine, ResponsiveContainer
} from 'recharts';
import {getMsFromTime, ONE_DAY} from "../utils/chartTimeAndType";
import {getRecordsNotOlderThan} from "../utils/coverApiDataProc";
import Typography from '@material-ui/core/Typography';
import Grid from "@material-ui/core/Grid";
import {formatCurrencyWithDigits, formatCurrency, formatToDate, formatToDateTime} from "../utils/formatting";

interface ProtocolPriceChartProps {
  data: any[],
  xAxisDataKey: string,
  lineDataKey: string,
  chartTime: string,
  textColor: string,
  fillColor: string,
  fillColorBrush: string
}

const ProtocolPriceChart: FC<ProtocolPriceChartProps> = (props) => {
  let chartData = props.data;
  const msSelected = getMsFromTime(props.chartTime);

  if (msSelected > 0) {
    chartData = getRecordsNotOlderThan(chartData, msSelected);
  }

  const tooltipFormatter = (value: any, name: any, propsTT: any) => {
    return [numberFormatter(value), "Price [USD]"];
  }

  const numberFormatter = (price: number) => {
    if(price <= 1) return formatCurrencyWithDigits(price, 4);
    return formatCurrency(price);
  };

  const dateFormatter = (timestamp: number | any) => {
    return formatToDate(timestamp, msSelected);
  };

  return (
    <ResponsiveContainer width='95%' height={320}>
      {(chartData.length > 0) ? (
      <LineChart data={chartData} margin={{
            top: 5, right: 50, left: 50, bottom: 5,
        }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis stroke={props.textColor} dataKey={props.xAxisDataKey} tickFormatter={dateFormatter} minTickGap={50} />
        <YAxis stroke={props.textColor} type="number" domain={[dataMin => (dataMin*0.97), dataMax => (dataMax * 1.03)]} tickFormatter={numberFormatter} minTickGap={50} />
        <Tooltip formatter={tooltipFormatter} labelStyle={{color: "black"}} labelFormatter={formatToDateTime} />
        <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
        <Brush dataKey={props.xAxisDataKey}  height={30} stroke={props.fillColor} tickFormatter={dateFormatter} fill={props.fillColorBrush} />
        <Line dot={false} type="monotone" dataKey={props.lineDataKey} stroke={props.fillColor} name={"Price [USD]"} />
      </LineChart>
      ):(
        <Grid container justify="center" alignContent="center" style={{height: "100%"}}>
        <Typography variant="h6" gutterBottom>
          No current data found 😨
        </Typography>
      </Grid>
      )}
    </ResponsiveContainer>
  );
};

export default ProtocolPriceChart;
