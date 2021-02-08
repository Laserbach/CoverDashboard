import { FC } from "react";
import {AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, ResponsiveContainer
} from 'recharts';
import {getMsFromTime, ONE_DAY} from "../utils/chartTimeAndType";
import {getFilteredRecords, getRecordsNotOlderThan} from "../utils/apiDataProc";
import Typography from '@material-ui/core/Typography';
import Grid from "@material-ui/core/Grid";


const RECORD_FILTER_SIZE = 1000;

interface ProtocolAreaChartProps {
  data: any[],
  xAxisDataKey: string,
  areaDataKey: string,
  areaLabel: string,
  chartTime: string,
  textColor: string,
  fillColor: string
}

const ProtocolBarChart: FC<ProtocolAreaChartProps> = (props) => {
  let chartData = props.data;
  const msSelected = getMsFromTime(props.chartTime);

  if (msSelected > 0) {
    let filterTime = msSelected / RECORD_FILTER_SIZE;
    chartData = getFilteredRecords(chartData, filterTime);
    chartData = getRecordsNotOlderThan(chartData, msSelected);
  } else if (msSelected == -1) {
    let filterTime = 1000*60*60*3;
    chartData = getFilteredRecords(chartData, filterTime);
  }

  const tooltipFormatter = (value: any, name: any, propsTT: any) => {
    return [numberFormatter(value), props.areaLabel];
  }

  const numberFormatter = (price: number) => {
    return Number(price.toFixed(2)) + "$";
  };

  const dateFormatter = (timestamp: number | any) => {
    let date = new Date(timestamp);

    if (msSelected <= ONE_DAY && msSelected !== -1) {
      return date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString('en-US');
    } else {
      return date.toLocaleDateString("en-US");
    }
  };

  return (
    <ResponsiveContainer width='100%' height={300}>
      {(chartData.length > 0) ? (
        <AreaChart data={chartData} margin={{
              top: 5, right: 50, left: 10, bottom: 5}}>
          <defs>
          <linearGradient id={props.fillColor} x1="0" y1="0" x2="0" y2="1">
            <stop offset="10%" stopColor={props.fillColor} stopOpacity={0.9}/>
            <stop offset="90%" stopColor={props.fillColor} stopOpacity={0.1}/>
          </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis stroke={props.textColor} dataKey={props.xAxisDataKey} tickFormatter={dateFormatter} minTickGap={50} />
          <YAxis stroke={props.textColor} type="number" domain={[dataMin => (dataMin*0.9), dataMax => (dataMax * 1.1)]} tickFormatter={numberFormatter} minTickGap={50} />
          <Tooltip formatter={tooltipFormatter} labelStyle={{color: "black"}} labelFormatter={dateFormatter} />
          <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
          <Brush dataKey={props.xAxisDataKey}  height={30} stroke={props.fillColor} tickFormatter={dateFormatter}/>
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
