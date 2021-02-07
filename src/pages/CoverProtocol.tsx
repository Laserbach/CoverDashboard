import { useState, useEffect } from "react";
import { makeStyles, createStyles, Theme, useTheme  } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import api from "../utils/api.json";
import LinearProgress from '@material-ui/core/LinearProgress';
import {formatCurrency, formatPercent} from "../utils/formatting";
import CoverProtocolCoverAPI from "../interfaces/CoverProtocolCoverAPI";
import {getAllTimes} from "../utils/chartTimeAndType";
import CoverProtocolPriceChart from "../components/CoverProtocolPriceChart";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme: Theme) => (
  createStyles({
    root: {
      flexGrow: 1,
      marginTop: "10px",
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.primary,
      backgroundColor: "#414357",
    }, 
    infoCard : {
      margin: 0
    },
    link : {
      color: theme.palette.primary.main
    }
  })
));

const chartTimes: string[] = getAllTimes().slice(1);
// we do not want 1h chart in here as there's 
// too less data available from coingecko API

const CoverProtocol = () => {
  const classes = useStyles();
  const theme = useTheme();

  const [chartTimeSelected = chartTimes[0], setChartTime] = useState<string>();
  const [coverBasicInfo, setCoverBasicInfo] = useState<CoverProtocolCoverAPI>();
  const [coverMarketData, setCoverMarketData] = useState<any[]>();

  const makePriceObj = (priceEntry: number[]) => {
    return {
      timestamp:priceEntry[0], 
      price: priceEntry[1]
    }
  }

  const ListChartTimes = (props: any) => {
    const times = chartTimes.map((chartTime) =>
      <Button key={chartTime} variant={(chartTimeSelected === chartTime) ? "contained" : "outlined"} color={props.color} 
        size="small" onClick={() => setChartTime(chartTime)}>
        {chartTime}
      </Button>
    );
    return (
      <Grid item xs={7} justify="flex-end" container>{times}</Grid>
    );
  }

  useEffect(() => {
    fetch(api.base_url)
      .then((response) => response.json())
      .then((coverAPIdata) => {
        setCoverBasicInfo(coverAPIdata.externalData.coingecko["cover-protocol"]);
        fetch(api.coingecko_cover_protocol_market_endpoint+"?vs_currency=usd&days=max")
          .then((response) => response.json())
          .then((marketData) => {
            let marketDataPrices : number[][] = marketData.prices;
            let prices : any[] = marketDataPrices.map(priceEntry => makePriceObj(priceEntry));
            prices.push({
              timestamp: coverAPIdata.externalData.coingecko["cover-protocol"].last_updated_at*1000,
              price: coverAPIdata.externalData.coingecko["cover-protocol"].usd
            });
            setCoverMarketData(prices);
          })
      });
  }, []);
    return (
    <div>
      <Grid container spacing={3} justify="space-evenly" style={{paddingLeft: "3%", paddingRight: "3%"}}>
        <Grid item xs={6} sm={3}>
          <Paper className={classes.paper}>
            <Grid container justify="space-between" alignContent="center">
              <p className={classes.infoCard}>Current Price</p>
              {coverBasicInfo ? (
                    <p className={classes.infoCard}>{formatCurrency(coverBasicInfo.usd)}</p>
                  ) : (
                    <LinearProgress color="primary" />
              )}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper className={classes.paper}>
            <Grid container justify="space-between" alignContent="center">
              <p className={classes.infoCard}>24h Price Change</p>
              {coverBasicInfo ? (
                    <p className={classes.infoCard} style={{color: (coverBasicInfo.usd_24h_change >= 0) ? theme.palette.success.main : theme.palette.error.main}}>{formatPercent(coverBasicInfo.usd_24h_change/100)}</p>
                  ) : (
                    <LinearProgress color="primary" />
              )}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper className={classes.paper}>
            <Grid container justify="space-between" alignContent="center">
              <p className={classes.infoCard}>Market Cap</p>
              {coverBasicInfo ? (
                    <p className={classes.infoCard}>{formatCurrency(coverBasicInfo.usd_market_cap)}</p>
                  ) : (
                    <LinearProgress color="primary" />
              )}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper className={classes.paper}>
            <Grid container justify="space-between" alignContent="center">
              <p className={classes.infoCard}>24h Volume</p>
              {coverBasicInfo ? (
                    <p className={classes.infoCard}>{formatCurrency(coverBasicInfo.usd_24h_vol)}</p>
                  ) : (
                    <LinearProgress color="primary" />
              )}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container justify="center">
              <Grid item>
                <Typography variant="h5" gutterBottom>
                    Cover Protocol Price Chart
                </Typography>
              </Grid>
            </Grid>
            <Grid container justify="flex-end" alignContent="center">
              <ListChartTimes color="primary"/>
              <Grid item xs={12}>
              {coverMarketData ? (
                <CoverProtocolPriceChart data={coverMarketData} xAxisDataKey="timestamp" lineDataKey="price" 
                  lineLabel="Price [USD]" chartTime={chartTimeSelected} textColor={theme.palette.text.primary}
                  fillColor={theme.palette.primary.main}/>
                ) : (
                <LinearProgress color="primary"/>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container justify="center" alignContent="center">
              <p className={classes.infoCard}>Cover Snapshot Page<br/><a className={classes.link} href="https://snapshot.page/#/cover" target="_blank">https://snapshot.page/#/cover</a><br/><br/>
              Governance Forum<br/><a className={classes.link} href="https://forum.coverprotocol.com" target="_blank">https://forum.coverprotocol.com</a><br/><br/>
              Token Address<br/>
              <a className={classes.link} href="https://etherscan.io/token/0x4688a8b1f292fdab17e9a90c8bc379dc1dbd8713" target="_blank">0x4688a8b1f292fdab17e9a90c8bc379dc1dbd8713</a>
              </p>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default CoverProtocol;
