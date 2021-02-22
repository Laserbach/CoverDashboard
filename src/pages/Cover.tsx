import { useState, useEffect, FC } from "react";
import TimeseriesRecord from "../interfaces/TimeseriesRecord";
import Grid from "@material-ui/core/Grid";
import { makeStyles, createStyles, Theme, useTheme  } from "@material-ui/core/styles";
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import api from "../utils/api.json";
import ProtocolVolumeChart from '../components/ProtocolVolumeChart';
import ProtocolPriceChart from '../components/ProtocolPriceChart';
import ProtocolLiquidityChart from '../components/ProtocolLiquidityChart';
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import {apiDataToTimeseriesRecords, getMostRelevantPoolBySymbol, getAllTimeseriesDataOfProtocol} from "../utils/coverApiDataProc";
import {getAllTypes, getAllTimes} from "../utils/chartTimeAndType";
import {formatCurrency, formatToInteger} from "../utils/formatting";
import Protocol from "../interfaces/Protocol";
import {getImageSrcOfProtocol} from "../utils/protocolImages";

const useStyles = makeStyles((theme: Theme) => (
  createStyles({
    root: {
      backgroundColor: theme.palette.background.default,
      flexGrow: 1,
      marginTop: "10px",
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.primary,
      marginLeft: "20px",
      marginRight: "20px",
      backgroundColor: "#3a3c4d99"
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
    },
    infoCard : {
      margin: 0
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

interface tokensInWalletsAndPools {
  claim: {
    pool: number,
    wallet: number
  },
  noclaim: {
    pool: number,
    wallet: number
  }
}

const Cover: FC<PropsProtocol> = (props) => {
  const classes = useStyles();
  const theme = useTheme();
  const chartTimes: string[] = getAllTimes();
  const chartTypes: string[] = getAllTypes();
  const [swapFeePercentClaim, setSwapFeeClaim] = useState<number>();
  const [swapFeePercentNoClaim, setSwapFeeNoClaim] = useState<number>();
  const [timeseriesData, setTimeseriesData] = useState<TimeseriesRecord[]>();
  const [chartTypeSelected = chartTypes[0], setChartType] = useState<string>();
  const [chartTimeSelected = chartTimes[3], setChartTime] = useState<string>();
  const [tokens, setTokensInWalletsAndPools] = useState<tokensInWalletsAndPools>();
  

  const ListChartTypes = (props: any) => {
    const types = chartTypes.map((chartType) =>
      <Button key={chartType} variant={(chartTypeSelected === chartType) ? "contained" : "outlined"} color={props.color} 
        size="small" onClick={() => setChartType(chartType)}>
        {chartType}
      </Button>
    );
    return (
      <Grid item xs={5} justify="flex-start" container>{types}</Grid>
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
      <Grid item xs={7} justify="flex-end" container>{times}</Grid>
    );
  }

  const renderChart = (chartType: string | undefined, type: string) => {
    if (timeseriesData) {
      switch(chartType) {
        case chartTypes[0]:
          return (
            <ProtocolPriceChart textColor={theme.palette.text.primary} fillColor={(type.toLowerCase() === "claim") ? theme.palette.primary.main : theme.palette.secondary.main}
                  chartTime={chartTimeSelected || chartTimes[3]} data={timeseriesData} xAxisDataKey="timestamp" lineDataKey={`${type.toLowerCase()}.price`}
                    fillColorBrush={"#323342"}/>
          );
        case chartTypes[1]:
          return (
            <ProtocolVolumeChart textColor={theme.palette.text.primary} fillColor={(type.toLowerCase() === "claim") ? theme.palette.primary.main : theme.palette.secondary.main}
                  chartTime={chartTimeSelected || chartTimes[3]} data={timeseriesData} xAxisDataKey="timestamp" barDataKey={`${type.toLowerCase()}.swapVol`}
                  barLabel={`Volume [USD]`} filtering={false} fillColorBrush={"#323342"}/>
          );
        case chartTypes[2]:
          return (
            <ProtocolLiquidityChart textColor={theme.palette.text.primary} fillColor={(type.toLowerCase() === "claim") ? theme.palette.primary.main : theme.palette.secondary.main}
                  chartTime={chartTimeSelected || chartTimes[3]} data={timeseriesData} xAxisDataKey="timestamp" areaDataKey={`${type.toLowerCase()}.liquidity`}
                    areaLabel={`Liquidity [USD]`} fillColorBrush={"#323342"}/>
          );
        default:
          return (
            <ProtocolPriceChart textColor={theme.palette.text.primary} fillColor={(type.toLowerCase() === "claim") ? theme.palette.primary.main : theme.palette.secondary.main}
                  chartTime={chartTimeSelected || chartTimes[3]} data={timeseriesData} xAxisDataKey="timestamp" lineDataKey={`${type.toLowerCase()}.price`}
                    fillColorBrush={"#323342"}/>
          );
      }
    }
  }

  const renderChartInfo = (type: string, records: TimeseriesRecord[]) => {
    type = type.toLowerCase();
    if (type === "claim" || type === "noclaim") {
      return (
        <Grid container justify="space-between">
          <Grid item xs={12} sm={12}>
            <Paper className={classes.paper} style={{marginTop: "10px"}}>
              <Grid container justify="space-between" alignContent="center">
                <p className={classes.infoCard}>Total Volume</p>
                <p className={classes.infoCard}>{formatCurrency(getNewestRecord(records)[type].swapVolCum)}</p>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Paper className={classes.paper} style={{marginTop: "10px"}}>
              <Grid container justify="space-between" alignContent="center">
                <p className={classes.infoCard}>Total Amount of Swap Fees</p>
                {(type === "claim" && swapFeePercentClaim && swapFeePercentNoClaim) ? (
                  <p className={classes.infoCard}>{formatCurrency(getNewestRecord(records)[type].swapVolCum*swapFeePercentClaim)}</p>
                ) : swapFeePercentNoClaim ? (
                  <p className={classes.infoCard}>{formatCurrency(getNewestRecord(records)[type].swapVolCum*swapFeePercentNoClaim)}</p>
                ) : (<div></div>)}  
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper className={classes.paper} style={{marginTop: "10px"}}>
              <Grid container justify="space-between" alignContent="center">
                  <p className={classes.infoCard}>Total Amount in Wallets</p>
                  {tokens ? (
                    <p className={classes.infoCard}>{formatToInteger(tokens[type].wallet)}</p>
                  ): (
                    <LinearProgress color="primary" />
                  )}
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper className={classes.paper} style={{marginTop: "10px"}}>
              <Grid container justify="space-between" alignContent="center">
                  <p className={classes.infoCard}>Total Amount in Pools</p>
                  {tokens ? (
                    <p className={classes.infoCard}>{formatToInteger(tokens[type].pool)}</p>
                  ): (
                    <LinearProgress color="primary" />
                  )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      );
    } else {
      return (
        <div></div>
        );
    }
  }

  const getNewestRecord = (records: TimeseriesRecord[]) => {
    return records[records.length-1];
  }

  const findMostRecentCoverObject = (coverObjects: any[]) => {
    let nonceMax: number = -1;
    let coverObj: any = {};
    for (let coverObject of coverObjects) {
      if(coverObject.nonce >= nonceMax) {
        coverObj = coverObject;
        nonceMax = coverObj.nonce;
      }
    }
    return coverObj;
  }

  useEffect(() => {    
    const fetchTimeseriesData = async () => {
      let items = await getAllTimeseriesDataOfProtocol(props.match.params.cover.toLowerCase());
      console.log(items);
      setTimeseriesData(apiDataToTimeseriesRecords(items))
    }

    fetchTimeseriesData();
    
    fetch(api.cover_api.base_url)
      .then((response) => response.json())
      .then((data) => {
        let filteredProtocols: Protocol[] = data.protocols.filter((p: Protocol) => p.protocolActive === true);
        let selectedProtocol = filteredProtocols.find(p => p.protocolName.toLowerCase() === props.match.params.cover.toLowerCase());
        if(selectedProtocol === undefined) return;
        let [poolIdClaim, claimTokenAddr] = getMostRelevantPoolBySymbol(selectedProtocol.protocolName, true, data.poolData);
        let [poolIdNoClaim, noClaimTokenAddr] = getMostRelevantPoolBySymbol(selectedProtocol.protocolName, false, data.poolData);
        setSwapFeeClaim(data.poolData[poolIdClaim].poolId.swapFee);
        setSwapFeeNoClaim(data.poolData[poolIdNoClaim].poolId.swapFee);
        let pools = [poolIdClaim, poolIdNoClaim];
        let graphRequests = pools.map(poolId => fetch(api.the_graph_api.base_url, {
          method: "POST",
          mode: "cors",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({query: `{
            pool (id: "${poolId}") {
              totalSwapVolume
              totalSwapFee
              tokens {
                symbol
                address
                balance
              }
            }
          }`})
        }));
        Promise.all(graphRequests)
          .then((responses) => {
          Promise.all(responses.map(r=>r.json()))
            .then(allGraphData => {
              let balanceClaim = 0;
              let balanceNoClaim = 0;
              for (let graphData of allGraphData) {
                for (let token of graphData.data.pool.tokens) {
                  if (token.symbol.indexOf(`_${props.match.params.cover.toUpperCase()}_`) > -1) {
                    if (token.symbol.indexOf(`_CLAIM`) > -1) {
                      balanceClaim = token.balance;
                    } else if (token.symbol.indexOf(`_NOCLAIM`) > -1) {
                      balanceNoClaim = token.balance;
                    }
                  }
                }
              }
              if (selectedProtocol === undefined) return;
              let coverObject = findMostRecentCoverObject(selectedProtocol.coverObjects);
              let tokenInfo: tokensInWalletsAndPools = {
                claim: {
                  pool: balanceClaim,
                  wallet: coverObject.collateralStaked - balanceClaim
                },
                noclaim: {
                  pool: balanceNoClaim,
                  wallet: coverObject.collateralStaked - balanceNoClaim
                }
              };
              setTokensInWalletsAndPools(tokenInfo);
            })
        })
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
                  <Avatar className={classes.avatar} alt={`${props.match.params.cover} Token`} src={getImageSrcOfProtocol(props.match.params.cover)}/>
                  <Typography variant="h4" gutterBottom>
                        {props.match.params.cover.toUpperCase()} Token
                  </Typography>
                </Grid>           
              </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper className={classes.paper}>
              <Grid container justify="center">
                <Grid item>
                  <Link color="inherit" href={api.balancer_pools.base_url+getNewestRecord(timeseriesData).claim.poolId}>
                    <Typography variant="h5" gutterBottom>
                      CLAIM Token
                    </Typography>
                  </Link>
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
            <Grid item xs={12} container justify="space-between">
              {renderChartInfo("claim", timeseriesData)}
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper className={classes.paper}>
              <Grid container justify="center">
                <Grid item>
                <Link color="inherit" href={api.balancer_pools.base_url+getNewestRecord(timeseriesData).noclaim.poolId}>
                  <Typography variant="h5" gutterBottom>
                  NOCLAIM Token
                </Typography>
                </Link>
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
            <Grid item xs={12} container justify="space-between">
              {renderChartInfo("noclaim", timeseriesData)}
            </Grid>
          </Grid>
        </Grid>
      </div>
      ): (
        <LinearProgress color="primary" />
      )}
    </div>
  );
};

export default Cover;
