import { FC } from "react";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, ReferenceLine, ResponsiveContainer
} from 'recharts';
import Typography from '@material-ui/core/Typography';
import Grid from "@material-ui/core/Grid";

interface TVLProtocolsBarChart {
  data: any[],
  xAxisDataKey: string,
  barDataKey: string,
  barLabel: string,
  textColor: string,
  fillColor: string,
}

const ProtocolBarChart: FC<TVLProtocolsBarChart> = (props) => {
  let chartData = props.data;

  const RenderTick = (propsRT: any) => {
    const { x, y, payload } = propsRT;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16} 
          textAnchor="end"
          fill={props.textColor}
          transform="rotate(-35)"
          fontSize="10px"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  const numberFormatter = (vol: number) => {
    vol = vol / 1000;
    return Number(vol.toFixed(0)) + "k$";
  };

  const tooltipFormatter = (value: any, name: any, propsTT: any) => {
    return [numberFormatter(value), props.barLabel];
  }

  return (
    <ResponsiveContainer width='100%' height={300}>
      {(chartData.length > 0) ? (
      <BarChart data={chartData} margin={{
            top: 5, right: 50, left: 10, bottom: 40,
        }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis stroke={props.textColor} dataKey={props.xAxisDataKey} type="category" allowDataOverflow={true} interval={0} tick={<RenderTick />} />
        <YAxis stroke={props.textColor} type="number" domain={[dataMin => (dataMin*0), dataMax => (dataMax)]} tickFormatter={numberFormatter} />
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
