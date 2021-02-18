import { useState, useEffect } from "react";
import { makeStyles, createStyles, Theme, useTheme  } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import ProtocolsBarChart from "../components/ProtocolsBarChart";
import Protocol from "../interfaces/Protocol";
import TimeseriesRecord from "../interfaces/TimeseriesRecord";
import api from "../utils/api.json";
import {getMostRelevantPoolBySymbol, setCSVsForAnyTimestamp, findAllRecordsAndDistinctTimestamps} from "../utils/coverApiDataProc";
import LinearProgress from '@material-ui/core/LinearProgress';
import TVLProtocolsAreaChart from "../components/TVLChart";
import CoverageDemand from "../interfaces/CoverageDemand";
import {formatCurrency} from "../utils/formatting";
interface collateralRecord {
  timestamp: number,
  collateralStakedValue: number
}

const useStyles = makeStyles((theme: Theme) => (
  createStyles({
    root: {
      backgroundColor: "#3a3c4d99",
      flexGrow: 1,
      marginTop: "10px",
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.primary,
      backgroundColor: "#3a3c4d99",
    }, 
    infoCard : {
      margin: 0
    }
  })
));

const calcCoverage = (graphData: any, claimTokenAddr: string) => {
  let coverageDemand = 0;
  console.log(graphData);
  for(let i = 0; graphData.data.pool.swaps.length > i; i++){
      if(graphData.data.pool.swaps[i].tokenOut == claimTokenAddr.toLowerCase()) {
        coverageDemand += parseFloat(graphData.data.pool.swaps[i].value);
      }
  }
  return coverageDemand;
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


const Home = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [protocols, setProtocols] = useState<Protocol[]>();
  const [demands, setCoverageDemands] = useState<CoverageDemand[]>();
  const [csvs, setCollateralStakedVales] = useState<collateralRecord[]>();

  /**
   * Fetches data from TheGraph for all supporting protocols and sets the state (the lowest chart)
   * when finished.
   */
  const fetchAndSetCoverageDemands = (filteredProtocols: Protocol[], data: any) => {
    let coverageDemands: CoverageDemand[] = [];
        filteredProtocols.forEach((p: Protocol) => {
          let name = p.protocolName;
          let [poolId, claimTokenAddr] = getMostRelevantPoolBySymbol(name, true, data.poolData);
          let coverage = 0;
          coverageDemands.push({
            protocolName: name,
            poolId: poolId,
            coverage: coverage,
            claimTokenAddr: claimTokenAddr
          })

        });
        
        let graphRequests = coverageDemands.map(d => fetch(api.the_graph_api.base_url, {
          method: "POST",
          mode: "cors",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({query: `{
            pool (id: "${d.poolId}") {
              totalSwapVolume
              totalSwapFee
              tokens {
                symbol
                address
              }
              swaps {
                tokenOut
                value
              }
            }
          }`})
        }));

        Promise.all(graphRequests)
          .then((responses) => {
            Promise.all(responses.map(r=>r.json()))
              .then(allGraphData => {
                for(let i = 0; i<allGraphData.length; i++) {
                  // handle graphQL error, when no data is returned
                  if(allGraphData[i].data.pool === null) return;
                  coverageDemands[i].coverage = calcCoverage(allGraphData[i], coverageDemands[i].claimTokenAddr);
                }
                setCoverageDemands(coverageDemands);
              })
          })
  }

  useEffect(() => {
    fetch(api.cover_api.base_url)
      .then((response) => response.json())
      .then((data) => {      
        // filter out non-active protocols
        let filteredProtocols: Protocol[] = data.protocols.filter((p: Protocol) => p.protocolActive === true);

        // remove old cover objects
        filteredProtocols.forEach(protocol => {
          protocol.coverObjects = [findMostRecentCoverObject(protocol.coverObjects)];
        })

        filteredProtocols.sort((a: Protocol, b: Protocol) => {
          return b.coverObjects[0].collateralStakedValue - a.coverObjects[0].collateralStakedValue;
        })
        setProtocols(filteredProtocols);
        console.log(filteredProtocols);
        
        fetchAndSetCoverageDemands(filteredProtocols, data);

        // now we need to get the timeseries data of each protocol
        // for that, we need to fetch each protocol and sum up the csv as there's no endpoint in the api for that
        let urls : string[] = [];
        filteredProtocols.forEach((p: Protocol) => {
          urls.push(api.cover_api.timeseries_data_all+p.protocolName);
        });

        let requests = urls.map(url => fetch(url));
        Promise.all(requests)
          .then((responses) => {
            Promise.all(responses.map(r=>r.json()))
              .then(dataArr => {
                let [timestamps, allRecords] = findAllRecordsAndDistinctTimestamps(dataArr); 
                let allCSV: number[] = new Array(timestamps.length);
                allCSV.fill(0);

                allRecords.forEach((records: TimeseriesRecord[]) => {
                  setCSVsForAnyTimestamp(records, timestamps, allCSV);
                });

                let collaterals: collateralRecord[] = [];
                for (let i = 0; i< timestamps.length; i++) {
                  collaterals.push({
                    timestamp: timestamps[i],
                    collateralStakedValue: allCSV[i]
                  })
                }
                setCollateralStakedVales(collaterals);
              })
          })
      });
  }, []);
    return (
    <div>
      <Grid container spacing={3} justify="space-evenly" style={{paddingLeft: "3%", paddingRight: "3%"}}>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper}>
            <Grid container justify="space-between" alignContent="center">
              <p className={classes.infoCard}>Total Value Locked</p>
              {csvs ? (
                    <p className={classes.infoCard}>{formatCurrency(csvs[csvs.length-1].collateralStakedValue)}</p>
                  ) : (
                    <LinearProgress color="primary" />
              )}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper}>
            <Grid container justify="space-between" alignContent="center">
              <p className={classes.infoCard}>Total Amount of Redeem Fees</p>
              {csvs ? (
                    <p className={classes.infoCard}>{"-"}</p>
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
                  Total Value Locked
                </Typography>
              </Grid>
            </Grid>
            <Grid container justify="space-between" alignItems="center">
              <Grid item xs={12}>
                {csvs ? (
                  <TVLProtocolsAreaChart textColor={theme.palette.text.primary} fillColor={theme.palette.primary.main}
                  data={csvs} xAxisDataKey="timestamp" areaDataKey={"collateralStakedValue"}
                  areaLabel={`Collateral Staked Value [USD]`} fillColorBrush={"#323342"}/>
                ) : (
                  <LinearProgress color="primary" />
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container justify="center">
              <Grid item>
                <Typography variant="h5" gutterBottom>
                  Total Value Locked per Protocol
                </Typography>
              </Grid>
            </Grid>
            <Grid container justify="space-between" alignItems="center">
              <Grid item xs={12}>
                {protocols ? (
                  <ProtocolsBarChart textColor={theme.palette.text.primary} fillColor={theme.palette.secondary.main}
                  data={protocols} xAxisDataKey="protocolName" barDataKey={`coverObjects[0].collateralStakedValue`}
                  barLabel={`Collateral Staked Value [USD]`} />
                  ) : ( 
                    <LinearProgress color="secondary" />
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container justify="center">
              <Grid item>
                <Typography variant="h5" gutterBottom>
                  Coverage Demand per Protocol
                </Typography>
              </Grid>
            </Grid>
            <Grid container justify="space-between" alignItems="center">
              <Grid item xs={12}>
                {demands ? (
                  <ProtocolsBarChart textColor={theme.palette.text.primary} fillColor={theme.palette.primary.main}
                  data={demands} xAxisDataKey="protocolName" barDataKey={`coverage`}
                  barLabel={`Coverage Demand per Protocol [USD]`} />
                ) : (
                  <LinearProgress color="primary" />
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Home;
