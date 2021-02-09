import { FC } from "react";
import {AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, ResponsiveContainer
} from 'recharts';
import {getMsFromTime, ONE_DAY} from "../utils/chartTimeAndType";
import {filterVolumeRecords, getRecordsNotOlderThan} from "../utils/coverApiDataProc";
import Typography from '@material-ui/core/Typography';
import Grid from "@material-ui/core/Grid";
import {formatCurrency, formatToDate, formatToDateTime} from "../utils/formatting";
interface ProtocolAreaChartProps {
  data: any[],
  xAxisDataKey: string,
  areaDataKey: string,
  areaLabel: string,
  chartTime: string,
  textColor: string,
  fillColor: string,
  fillColorBrush: string
}

const ProtocolBarChart: FC<ProtocolAreaChartProps> = (props) => {
  let chartData = props.data;
  const msSelected = getMsFromTime(props.chartTime);

  if (msSelected > 0) {
    chartData = getRecordsNotOlderThan(chartData, msSelected);
  }

  const tooltipFormatter = (value: any, name: any, propsTT: any) => {
    return [formatCurrency(value), props.areaLabel];
  }

  const dateFormatter = (timestamp: number | any) => {
    return formatToDate(timestamp, msSelected);
  };

  return (
    <ResponsiveContainer width='95%' height={320}>
      {(chartData.length > 0) ? (
        <AreaChart data={chartData} margin={{
              top: 5, right: 50, left: 50, bottom: 5}}>
          <defs>
            <linearGradient id={props.fillColor} x1="0" y1="0" x2="0" y2="1">
              <stop offset="10%" stopColor={props.fillColor} stopOpacity={0.9}/>
              <stop offset="90%" stopColor={props.fillColor} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis stroke={props.textColor} dataKey={props.xAxisDataKey} tickFormatter={dateFormatter} minTickGap={50} />
          <YAxis stroke={props.textColor} type="number" domain={[dataMin => (dataMin*0.9), dataMax => (dataMax * 1.1)]} tickFormatter={formatCurrency} minTickGap={50} />
          <Tooltip formatter={tooltipFormatter} labelStyle={{color: "black"}} labelFormatter={formatToDateTime} />
          <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
          <Brush dataKey={props.xAxisDataKey}  height={30} stroke={props.fillColor} tickFormatter={dateFormatter} fill={props.fillColorBrush} />
          <Area type="monotone" dataKey={props.areaDataKey} stroke={props.fillColor} name={props.areaLabel} fillOpacity={1} fill={`url(#${props.fillColor})`}/>
        </AreaChart>
  ):(
    <Grid container justify="center" alignContent="center" style={{height: "100%"}}>
      <Typography variant="h6" gutterBottom>
        No current data found 😔
      </Typography>
    </Grid>
  )}
  </ResponsiveContainer>);
};

export default ProtocolBarChart;
