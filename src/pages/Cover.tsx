import { useState, useEffect, FC } from "react";
import TimeseriesRecord from "../interfaces/TimeseriesRecord";
import Grid from "@material-ui/core/Grid";
import { makeStyles, createStyles, Theme, useTheme  } from "@material-ui/core/styles";
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import api from "../utils/api.json";
import ProtocolBarChart from '../components/ProtocolBarChart';
import Button from "@material-ui/core/Button";
import {apiDataToTimeseriesRecords} from "../utils/apiDataProc";

const useStyles = makeStyles((theme: Theme) => (
  createStyles({
    root: {
      backgroundColor: "#3a3c4d",
      flexGrow: 1,
      marginTop: "10px",
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.primary,
      marginLeft: "20px",
      marginRight: "20px",
      backgroundColor: "#414357"
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
  const theme = useTheme();
  const [timeseriesData, setTimeseriesData] = useState<TimeseriesRecord[]>();
  const [chartTypeSelected, setChartType] = useState<string>();
  const [chartTimeSelected, setChartTime] = useState<string>();
  
  const chartTimes: string[] = ["1h", "1d", "1w", "30d", "all"];
  const chartTypes: string[] = ["price", "volume", "liquidity"];
  
  const chartTimeToMs: Map<string, number> = new Map();
  chartTimeToMs.set(chartTimes[0], 1000*60*60);
  chartTimeToMs.set(chartTimes[1], 1000*60*60*24);
  chartTimeToMs.set(chartTimes[2], 1000*60*60*24*7);
  chartTimeToMs.set(chartTimes[3], 1000*60*60*24*30);
  chartTimeToMs.set(chartTimes[4], -1);

  const ListChartTypes = () => {
    const types = chartTypes.map((chartType) =>
      <Button key={chartType} variant={(chartTypeSelected === chartType) ? "contained" : "outlined"} color="primary" size="small"
        onClick={() => setChartType(chartType)}>
        {chartType}
      </Button>
    );
    return (
      <Grid item xs={5} justify="flex-start">{types}</Grid>
    );
  }

  const ListChartTimes = () => {
    const times = chartTimes.map((chartTime) =>
      <Button key={chartTime} variant={(chartTimeSelected === chartTime) ? "contained" : "outlined"} color="primary" size="small"
        onClick={() => setChartTime(chartTime)}>
        {chartTime}
      </Button>
    );
    return (
      <Grid item xs={7} justify="flex-end">{times}</Grid>
    );
  }

  useEffect(() => {
    fetch(
      `${api.timeseries_data_all+props.match.params.cover}`
    )
      .then((response) => response.json())
      .then((data) => {
        setTimeseriesData(apiDataToTimeseriesRecords(data))
      });
  }, []);
  return (
    <div>
      {timeseriesData ? (
        <div>
        <Grid container spacing={3} justify="space-evenly">
        <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Typography variant="h4" gutterBottom>
                  {props.match.params.cover.toUpperCase()} Token
              </Typography>
            </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper}>
            <Grid container justify="center">
              <Grid item>
              <Typography variant="h5" gutterBottom>
                CLAIM Token [{props.match.params.cover.toUpperCase()}/CLAIM]
              </Typography>
              </Grid>
            </Grid>
            <Grid container justify="space-between" alignItems="center">
              <ListChartTypes />
              <ListChartTimes />
              <Grid item xs={12}>
                <ProtocolBarChart textColor={theme.palette.text.primary} fillColor={theme.palette.primary.main}
                chartTime={chartTimeSelected || chartTimes[3]} data={timeseriesData} xAxisDataKey="timestamp" barDataKey="claim.swapVol"
                  barLabel="Volume [CLAIM]"/>
              </Grid>
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
      ): (
        <LinearProgress color="primary" />
      )}
      
    </div>
  );
};

export default Cover;
