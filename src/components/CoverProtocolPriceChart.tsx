import { FC } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, ReferenceLine, ResponsiveContainer
} from 'recharts';
import {getMsFromTime, ONE_DAY} from "../utils/chartTimeAndType";
import {getFilteredRecords, getRecordsNotOlderThan} from "../utils/apiDataProc";
import Typography from '@material-ui/core/Typography';
import Grid from "@material-ui/core/Grid";
import {formatCurrency} from "../utils/formatting";

interface CoverProtocolPriceChartProps {
  data: any[],
  xAxisDataKey: string,
  lineDataKey: string,
  lineLabel: string,
  chartTime: string,
  textColor: string,
  fillColor: string
}

const CoverProtocolPriceChart: FC<CoverProtocolPriceChartProps> = (props) => {
  let chartData = props.data;
  const msSelected = getMsFromTime(props.chartTime);

  if (msSelected > 0) {
    chartData = getRecordsNotOlderThan(chartData, msSelected);
  }

  const tooltipFormatter = (value: any, name: any, propsTT: any) => {
    return [formatCurrency(value), props.lineLabel];
  }

  const numberFormatter = (price: number) => {
    return formatCurrency(price);
  };

  const dateFormatter = (timestamp: number | any) => {
    let date = new Date(timestamp);

    if (msSelected <= ONE_DAY && msSelected !== -1) {
      return dateTimeFormatter(timestamp);
    } else {
      return date.toLocaleDateString("en-US");
    }
  };

  const dateTimeFormatter = (timestamp: number | any) => {
    let date = new Date(timestamp);
    return date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString('en-US');
  };

  return (
    <ResponsiveContainer width='100%' height={300}>
      {(chartData.length > 0) ? (
      <LineChart data={chartData} margin={{
            top: 5, right: 50, left: 10, bottom: 5,
        }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis stroke={props.textColor} dataKey={props.xAxisDataKey} tickFormatter={dateFormatter} minTickGap={50} />
        <YAxis stroke={props.textColor} type="number" domain={[dataMin => (dataMin*0.97), dataMax => (dataMax * 1.03)]} tickFormatter={numberFormatter} minTickGap={50} />
        <Tooltip formatter={tooltipFormatter} labelStyle={{color: "black"}} labelFormatter={dateTimeFormatter} />
        <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
        <Brush dataKey={props.xAxisDataKey}  height={30} stroke={props.fillColor} tickFormatter={dateFormatter}/>
        <Line dot={false} type="monotone" dataKey={props.lineDataKey} stroke={props.fillColor} name={props.lineLabel} />
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

export default CoverProtocolPriceChart;
