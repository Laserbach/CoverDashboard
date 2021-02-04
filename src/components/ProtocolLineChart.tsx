import { FC } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, ReferenceLine, ResponsiveContainer
} from 'recharts';
import {getMsFromTime, ONE_DAY} from "../utils/chartTimeAndType";
import {getFilteredRecords, getRecordsNotOlderThan} from "../utils/apiDataProc";


const RECORD_FILTER_SIZE = 1000;

interface ProtocolLineChartProps {
  data: any[],
  xAxisDataKey: string,
  lineDataKey: string,
  lineLabel: string,
  chartTime: string,
  textColor: string,
  fillColor: string
}

const ProtocolBarChart: FC<ProtocolLineChartProps> = (props) => {
  let chartData = props.data;
  const msSelected = getMsFromTime(props.chartTime);

  if (msSelected > 0) {
    let filterTime = msSelected / RECORD_FILTER_SIZE;
    chartData = getFilteredRecords(chartData, filterTime);
    chartData = getRecordsNotOlderThan(chartData, msSelected);
    console.log("timestamped: "+chartData.length + "records.");
  } else if (msSelected == -1) {
    let filterTime = 1000*60*60*3;
    chartData = getFilteredRecords(chartData, filterTime);
  }

  const tooltipFormatter = (value: any, name: any, propsTT: any) => {
    return [numberFormatter(value), props.lineLabel];
  }

  const numberFormatter = (price: number) => {
    return Number(price.toFixed(4));
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
      <LineChart data={chartData} margin={{
            top: 5, right: 50, left: 10, bottom: 5,
        }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis stroke={props.textColor} dataKey={props.xAxisDataKey} tickFormatter={dateFormatter} minTickGap={50} />
        <YAxis stroke={props.textColor} type="number" domain={[dataMin => (dataMin*0.97), dataMax => (dataMax * 1.03)]} tickFormatter={numberFormatter} minTickGap={50} />
        <Tooltip formatter={tooltipFormatter} labelStyle={{color: "black"}} labelFormatter={dateFormatter} />
        <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
        <Brush dataKey={props.xAxisDataKey}  height={30} stroke={props.fillColor} tickFormatter={dateFormatter}/>
        <Line dot={false} type="monotone" dataKey={props.lineDataKey} stroke={props.fillColor} name={props.lineLabel}  />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProtocolBarChart;
