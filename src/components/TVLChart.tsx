import { FC } from "react";
import { makeStyles, createStyles, Theme  } from "@material-ui/core/styles";
import {AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, ResponsiveContainer
} from 'recharts';
import Typography from '@material-ui/core/Typography';
import Grid from "@material-ui/core/Grid";
import {formatBigNumber, formatToDate, formatToDateTime} from "../utils/formatting";

interface TVLChartProps {
  data: any[],
  xAxisDataKey: string,
  areaDataKey: string,
  areaLabel: string,
  textColor: string,
  fillColor: string,
  fillColorBrush: string
}

const useStyles = makeStyles((theme: Theme) => (
  createStyles({
    container: {
      marginRight: "auto",
      marginLeft: "auto"
    }
  })
));

const TVLChart: FC<TVLChartProps> = (props) => {
  const classes = useStyles();
  let chartData = props.data;

  const tooltipFormatter = (value: any, name: any, propsTT: any) => {
    return [formatBigNumber(value), props.areaLabel];
  }

  const dateFormatter = (timestamp: number | any) => {
    return formatToDate(timestamp, -1);
  };

  return (
    <ResponsiveContainer width='100%' height={300} className={classes.container}>
      {(chartData.length > 0) ? (
        <AreaChart data={chartData} margin={{top: 5, bottom: 5, right: 30, left: 30}}>
          <defs>
          <linearGradient id={props.fillColor} x1="0" y1="0" x2="0" y2="1">
            <stop offset="10%" stopColor={props.fillColor} stopOpacity={0.9}/>
            <stop offset="90%" stopColor={props.fillColor} stopOpacity={0.1}/>
          </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis stroke={props.textColor} dataKey={props.xAxisDataKey} tickFormatter={dateFormatter} minTickGap={40} />
          <YAxis stroke={props.textColor} type="number" domain={[dataMin => (dataMin*0.9), dataMax => (dataMax * 1.1)]} 
              tickFormatter={formatBigNumber} minTickGap={50} unit="$" />
          <Tooltip formatter={tooltipFormatter} labelStyle={{color: "black"}} labelFormatter={formatToDateTime} />
          <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
          <Brush dataKey={props.xAxisDataKey}  height={30} stroke={props.fillColor} tickFormatter={dateFormatter} fill={props.fillColorBrush}/>
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

export default TVLChart;