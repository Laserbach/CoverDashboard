import { FC } from "react";
import TimeseriesRecord from "../interfaces/TimeseriesRecord";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, ReferenceLine, ResponsiveContainer
} from 'recharts';
import {getMsFromTime, ONE_DAY} from "../utils/chartTimeAndType";
import {getFilteredRecords, getRecordsNotOlderThan} from "../utils/apiDataProc";

const useStyles = makeStyles({
  root: {
    maxWidth: 345,
    backgroundColor: "#6b7affcc",
  },
});

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
  const classes = useStyles();
  const theme = useTheme();

  let chartData = props.data;
  const msSelected = getMsFromTime(props.chartTime);

  if (msSelected > 0) {
    let filterTime = msSelected / 100;
    chartData = getFilteredRecords(chartData, filterTime);
    chartData = getRecordsNotOlderThan(chartData, msSelected);
    console.log("timestamped: "+chartData.length + "records.");
  } else if (msSelected == -1) {
    let filterTime = 1000*60*60*3;
    chartData = getFilteredRecords(chartData, filterTime);
  }

  const tooltipFormatter = (value: any, name: any, props: any) => {
    return [Math.round(value), "Volume [CLAIM]"];
  }

  const roundFormatter = (vol: number) => {
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
      <BarChart data={chartData} margin={{
            top: 5, right: 90, left: 50, bottom: 5,
        }}>
        <CartesianGrid strokeDasharray="5 5" />
        <XAxis stroke={props.textColor} dataKey={props.xAxisDataKey} tickFormatter={dateFormatter} minTickGap={50} />
        <YAxis stroke={props.textColor} type="number" domain={['dataMin - 10', 'dataMax + 10']} tickFormatter={roundFormatter} minTickGap={50} />
        <Tooltip formatter={tooltipFormatter} labelStyle={{color: "black"}} labelFormatter={dateFormatter} />
        <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
        <ReferenceLine y={0} stroke="#000" />
        <Brush dataKey={props.xAxisDataKey}  height={30} stroke={props.fillColor} tickFormatter={dateFormatter}/>
        <Bar dataKey={props.barDataKey} fill={props.fillColor} name={props.barLabel} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProtocolBarChart;
