import { FC } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, ReferenceLine, ResponsiveContainer
} from 'recharts';
import {getMsFromTime, ONE_DAY} from "../utils/chartTimeAndType";
import {getFilteredRecords, getRecordsNotOlderThan} from "../utils/apiDataProc";
import Typography from '@material-ui/core/Typography';
import Grid from "@material-ui/core/Grid";

const RECORD_FILTER_SIZE = 300;
interface ProtocolBarChartProps {
  data: any[],
  xAxisDataKey: string,
  barDataKey: string,
  barLabel: string,
  chartTime: string,
  textColor: string,
  fillColor: string
}

const ProtocolBarChart: FC<ProtocolBarChartProps> = (props) => {
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
    return [numberFormatter(value), props.barLabel];
  }

  const numberFormatter = (vol: number) => {
    return Math.round(vol);
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
      <BarChart data={chartData} margin={{
            top: 5, right: 50, left: 10, bottom: 5,
        }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis stroke={props.textColor} dataKey={props.xAxisDataKey} tickFormatter={dateFormatter} minTickGap={50} />
        <YAxis stroke={props.textColor} type="number" domain={['dataMin - 10', 'dataMax + 10']} tickFormatter={numberFormatter} minTickGap={50} />
        <Tooltip formatter={tooltipFormatter} labelStyle={{color: "black"}} labelFormatter={dateFormatter} />
        <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
        <ReferenceLine y={0} stroke="#000" />
        <Brush dataKey={props.xAxisDataKey}  height={30} stroke={props.fillColor} tickFormatter={dateFormatter}/>
        <Bar dataKey={props.barDataKey} fill={props.fillColor} name={props.barLabel} />
      </BarChart>

     ):(
    <Grid container justify="center" alignContent="center" style={{height: "100%"}}>
      <Typography variant="h6" gutterBottom>
        No current data found 📉
      </Typography>
    </Grid>
    )}
    </ResponsiveContainer>
  );
};

export default ProtocolBarChart;
