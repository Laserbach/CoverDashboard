import { useState, useEffect, FC } from "react";
import TimeseriesRecord from "../interfaces/TimeseriesRecord";
import Grid from "@material-ui/core/Grid";
import { makeStyles, createStyles, Theme, useTheme  } from "@material-ui/core/styles";
import Paper from '@material-ui/core/Paper';
import api from "../utils/api.json";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, ReferenceLine
} from 'recharts';

const useStyles = makeStyles((theme: Theme) => (
  createStyles({
    root: {
      backgroundColor: "#3a3c4d",
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.primary,
      marginLeft: "20px",
      marginRight: "20px",
    },
    tooltip: {
      color: theme.palette.text.secondary,
    }
  })
));

interface PropsProtocol {
  match: {
    params: {
      cover: string;
    };
  };
}

const Cover: FC<PropsProtocol> = (props) => {
  const classes = useStyles();
  //const [protocolData, setProtocolData] = useState<Protocols>();
  const [historicData, setHistoricData] = useState<any[]>();
  const [timeseriesData, setTimeseriesData] = useState<TimeseriesRecord[]>();

  const poolIDNoClaim = "0xd9b92e84b9f96267bf548cfe3a3ae21773872138";
  const poolIDClaim = "0xdfe5ead7bd050eb74009e7717000eeadcf0f18db";

  const dateFormatter = (date: number | any) => {
    return new Date(date).toLocaleDateString("en-US");
  };

  const volFormatter = (vol: number) => {
    return Math.round(vol);
  };

  const tooltipFormatter = (value: any, name: any, props: any) => {
    return [Math.round(value), "Volume [CLAIM]"];
  }

  const brushFormatter = (date: number) => {
    return new Date(date).toLocaleDateString("en-US");
  }

  const CustomTooltip = (active: boolean, payload: any, label: string) => {
    if (active) {
      return (
        <div className="custom-tooltip">
          <p className="intro">{label}</p>
          <p className="label">{`${payload[0].value} Volume [CLAIM]`}</p>
          <p className="desc">Anything you want can be displayed here.</p>
        </div>
      );
    }
    return null;
  };

  const myTheme = useTheme();

  useEffect(() => {
    fetch(
      `${api.timeseries_data_all+props.match.params.cover}`
    )
      .then((response) => response.json())
      .then((data) => {
          setHistoricData(data["Items"]);
          console.log(data);
          
          setTimeseriesData(() => {
            let objs: TimeseriesRecord[] = []
            let lastTimestamp: number = 0
            for (let record of data["Items"]) {
              if(Math.abs(lastTimestamp - record.timestamp) >= 7200000) {
                objs.push({
                  timestamp: record.timestamp,
                  claim: {
                    price: record.protocolData.poolData[poolIDClaim].price,
                    swapVol: record.protocolData.poolData[poolIDClaim].totalSwapFee,
                    liquidity: record.protocolData.poolData[poolIDClaim].liquidity
                  },
                  noclaim: {
                    price: record.protocolData.poolData[poolIDNoClaim].price,
                    swapVol: record.protocolData.poolData[poolIDNoClaim].totalSwapFee,
                    liquidity: record.protocolData.poolData[poolIDNoClaim].liquidity
                  }
                });
                lastTimestamp = record.timestamp;
              }
            }
            objs.sort(function(objA, objB) {
              return objA.timestamp - objB.timestamp;
            });
            return objs;
          });
        });
  }, []);
  return (
    <div className={classes.root}>
      <Grid container spacing={3} justify="space-evenly">
      <Grid item xs={12}>
          <Paper className={classes.paper}>{props.match.params.cover.toUpperCase()} Token</Paper>
      </Grid>
      <Grid item xs={12} sm={6} justify="center" alignItems="center">
        <Paper className={classes.paper}>
          <Grid container justify="center" alignItems="center">
            <BarChart width={650} height={250} data={timeseriesData} margin={{right: 10, left: 10}}>
              <CartesianGrid strokeDasharray="5 5" />
              <XAxis stroke={myTheme.palette.primary.light} dataKey="timestamp" tickFormatter={dateFormatter} minTickGap={50} />
              <YAxis stroke={myTheme.palette.primary.light} type="number" domain={['dataMin - 10', 'dataMax + 10']} tickFormatter={volFormatter} minTickGap={50} />
              <Tooltip formatter={tooltipFormatter} labelStyle={{color: "black"}} labelFormatter={dateFormatter} />
              <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
              <ReferenceLine y={0} stroke="#000" />
              <Brush dataKey="timestamp" x={130} width={400} height={30} stroke="#8884d8" tickFormatter={brushFormatter}/>
              <Bar dataKey="claim.swapVol" fill="#8884d8" name="Volume [CLAIM]" />
            </BarChart>
          </Grid>
        </Paper>
      </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper}>xs=12 sm=6</Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper}>xs=12 sm=6</Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper}>xs=12 sm=6</Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper}>xs=12 sm=6</Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper}>xs=12 sm=6</Paper>
        </Grid>
      </Grid>
      <pre>Data: {JSON.stringify(timeseriesData, null, 2)}
      </pre>
    </div>
  );
};

export default Cover;
