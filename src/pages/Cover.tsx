import { useState, useEffect, FC } from "react";
import TimeseriesRecord from "../interfaces/TimeseriesRecord";
import Grid from "@material-ui/core/Grid";
import { makeStyles, createStyles, Theme, useTheme  } from "@material-ui/core/styles";
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import api from "../utils/api.json";
import ProtocolBarChart from '../components/ProtocolBarChart';
import ProtocolLineChart from '../components/ProtocolLineChart';
import ProtocolAreaChart from '../components/ProtocolAreaChart';
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
    },
    avatar: {
      marginBottom: "10px",
      marginRight: "25px"
    },
    heading: {
      paddingTop: "10px"
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
  const chartTimes: string[] = ["1h", "1d", "1w", "30d", "all"];
  const chartTypes: string[] = ["price", "volume", "liquidity"];
  const [timeseriesData, setTimeseriesData] = useState<TimeseriesRecord[]>();
  const [chartTypeSelected = chartTypes[0], setChartType] = useState<string>();
  const [chartTimeSelected = chartTimes[3], setChartTime] = useState<string>();
  
  const chartTimeToMs: Map<string, number> = new Map();
  chartTimeToMs.set(chartTimes[0], 1000*60*60);
  chartTimeToMs.set(chartTimes[1], 1000*60*60*24);
  chartTimeToMs.set(chartTimes[2], 1000*60*60*24*7);
  chartTimeToMs.set(chartTimes[3], 1000*60*60*24*30);
  chartTimeToMs.set(chartTimes[4], -1);

  const ListChartTypes = (props: any) => {
    const types = chartTypes.map((chartType) =>
      <Button key={chartType} variant={(chartTypeSelected === chartType) ? "contained" : "outlined"} color={props.color} 
        size="small" onClick={() => setChartType(chartType)}>
        {chartType}
      </Button>
    );
    return (
      <Grid item xs={5} justify="flex-start">{types}</Grid>
    );
  }

  const ListChartTimes = (props: any) => {
    const times = chartTimes.map((chartTime) =>
      <Button key={chartTime} variant={(chartTimeSelected === chartTime) ? "contained" : "outlined"} color={props.color} 
        size="small" onClick={() => setChartTime(chartTime)}>
        {chartTime}
      </Button>
    );
    return (
      <Grid item xs={7} justify="flex-end">{times}</Grid>
    );
  }

  const renderChart = (chartType: string | undefined, type: string) => {
    if (timeseriesData) {
      switch(chartType) {
        case chartTypes[0]:
          return (
            <ProtocolLineChart textColor={theme.palette.text.primary} fillColor={(type.toLowerCase() === "claim") ? theme.palette.primary.main : theme.palette.secondary.main}
                  chartTime={chartTimeSelected || chartTimes[3]} data={timeseriesData} xAxisDataKey="timestamp" lineDataKey={`${type.toLowerCase()}.price`}
                    lineLabel={`Price [USD]`}/>
          );
        case chartTypes[1]:
          return (
            <ProtocolBarChart textColor={theme.palette.text.primary} fillColor={(type.toLowerCase() === "claim") ? theme.palette.primary.main : theme.palette.secondary.main}
                  chartTime={chartTimeSelected || chartTimes[3]} data={timeseriesData} xAxisDataKey="timestamp" barDataKey={`${type.toLowerCase()}.swapVol`}
                  barLabel={`Volume [USD]`}/>
          );
        case chartTypes[2]:
          return (
            <ProtocolAreaChart textColor={theme.palette.text.primary} fillColor={(type.toLowerCase() === "claim") ? theme.palette.primary.main : theme.palette.secondary.main}
                  chartTime={chartTimeSelected || chartTimes[3]} data={timeseriesData} xAxisDataKey="timestamp" areaDataKey={`${type.toLowerCase()}.liquidity`}
                    areaLabel={`Liquidity [USD]`}/>
          );
        default:
          return (
            <ProtocolLineChart textColor={theme.palette.text.primary} fillColor={(type.toLowerCase() === "claim") ? theme.palette.primary.main : theme.palette.secondary.main}
                  chartTime={chartTimeSelected || chartTimes[3]} data={timeseriesData} xAxisDataKey="timestamp" lineDataKey={`${type.toLowerCase()}.price`}
                    lineLabel={`Price [USD]`}/>
          );
      }
    }
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
              <Grid className={classes.heading} container justify="center" alignItems="center">
                <Avatar className={classes.avatar} alt={`${props.match.params.cover} Token`} src={`${process.env.PUBLIC_URL}/images/protocols/${props.match.params.cover}.png`}/>
                <Typography variant="h4" gutterBottom>
                      {props.match.params.cover.toUpperCase()} Token
                </Typography>
              </Grid>           
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
            <ListChartTypes color="primary" />
            <ListChartTimes color="primary" />
            <Grid item xs={12}>
              {renderChart(chartTypeSelected, "CLAIM")}
            </Grid>
          </Grid>
          </Paper>
        </Grid>
          <Grid item xs={12} sm={6}>
            <Paper className={classes.paper}>
              <Grid container justify="center">
                <Grid item>
                <Typography variant="h5" gutterBottom>
                  NOCLAIM Token [{props.match.params.cover.toUpperCase()}/NOCLAIM]
                </Typography>
                </Grid>
              </Grid>
              <Grid container justify="space-between" alignItems="center">
                <ListChartTypes color="secondary" />
                <ListChartTimes color="secondary" />
                <Grid item xs={12}>
                {renderChart(chartTypeSelected, "NOCLAIM")}
                </Grid>
              </Grid>
            </Paper>
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
