import { FC } from "react";
import { makeStyles, createStyles, Theme  } from "@material-ui/core/styles";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, ReferenceLine, ResponsiveContainer
} from 'recharts';
import Typography from '@material-ui/core/Typography';
import Grid from "@material-ui/core/Grid";
import {formatBigNumber} from "../utils/formatting";

interface ProtocolsBarChart {
  data: any[],
  xAxisDataKey: string,
  barDataKey: string,
  barLabel: string,
  textColor: string,
  fillColor: string,
}

const useStyles = makeStyles((theme: Theme) => (
  createStyles({
    container: {
      marginRight: "auto",
      marginLeft: "auto"
    }
  })
));

const ProtocolBarChart: FC<ProtocolsBarChart> = (props) => {
  const classes = useStyles();
  let chartData = props.data;

  const RenderTick = (propsRT: any) => {
    const { x, y, payload } = propsRT;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={(window.innerWidth > 800) ? 10 : 3} 
          textAnchor="end"
          fill={props.textColor}
          transform={`rotate(${(window.innerWidth > 800) ? "-35" : "-75"})`}
          fontSize={`${(window.innerWidth > 800) ? "10px" : "7px"}`}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  const tooltipFormatter = (value: any, name: any, propsTT: any) => {
    return [formatBigNumber(value), props.barLabel];
  }

  return (
    <ResponsiveContainer width='100%' height={300} className={classes.container}>
      {(chartData.length > 0) ? (
      <BarChart data={chartData} margin={{
            top: 5, right: 30, left: 30, bottom: 40,
        }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis stroke={props.textColor} dataKey={props.xAxisDataKey} type="category" allowDataOverflow={true} interval={0} tick={<RenderTick />} />
        <YAxis stroke={props.textColor} type="number" domain={[dataMin => (dataMin*0), dataMax => (dataMax)]} tickFormatter={formatBigNumber} unit={"$"} />
        <Tooltip labelStyle={{color: "black"}} formatter={tooltipFormatter} />
        <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px'}} />
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
