import { useState, useEffect } from "react";
import { makeStyles, createStyles, Theme, useTheme  } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import {getAllTypes, getAllTimes} from "../utils/chartTimeAndType";
import TVLProtocolsBarChart from "../components/TVLProtocolsBarChart";
import Protocols from "../interfaces/Protocols";
import TimeseriesRecord from "../interfaces/TimeseriesRecord";
import api from "../utils/api.json";
import {apiDataToTimeseriesRecords, getMostRelevantPoolBySymbol} from "../utils/apiDataProc";
import LinearProgress from '@material-ui/core/LinearProgress';
import TVLProtocolsAreaChart from "../components/TVLProtocolsAreaChart";
import {formatCurrency} from "../utils/formatting";
import CoverageDemand from "../interfaces/CoverageDemand";
interface collateralRecord {
  timestamp: number,
  collateralStakedValue: number
}

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
      backgroundColor: "#414357",
    }, 
    infoCard : {
      margin: 0
    }
  })
));

const calcCoverage = (graphData: any, claimTokenAddr: string) => {
  let coverageDemand = 0;
  for(let i = 0; graphData.data.pool.swaps.length > i; i++){
      if(graphData.data.pool.swaps[i].tokenOut == claimTokenAddr.toLowerCase()) {
        coverageDemand += parseFloat(graphData.data.pool.swaps[i].value);
      }
  }
  return coverageDemand;
}


const Home = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [protocols, setProtocols] = useState<Protocols[]>();
  const [demands, setCoverageDemands] = useState<CoverageDemand[]>();
  const [csvs, setCollateralStakedVales] = useState<collateralRecord[]>();

  /**
   * Fetches data from TheGraph for all supporting protocols and sets the state (the lowest chart)
   * when finished.
   */
  const fetchAndSetCoverageDemands = (filteredProtocols: Protocols[], data: any) => {
    let coverageDemands: CoverageDemand[] = [];
        filteredProtocols.forEach((p: Protocols) => {
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
        
        let graphRequests = coverageDemands.map(d => fetch(api.the_graph_base_url, {
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
                  coverageDemands[i].coverage = calcCoverage(allGraphData[i], coverageDemands[i].claimTokenAddr);
                }
                setCoverageDemands(coverageDemands);
              })
          })
  }

  useEffect(() => {
    fetch(api.base_url)
      .then((response) => response.json())
      .then((data) => {
        data.protocols.sort((a: Protocols, b: Protocols) => {
          return b.coverObjects[0].collateralStakedValue - a.coverObjects[0].collateralStakedValue;
        })
        // filter out non-active protocols
        let filteredProtocols: Protocols[] = data.protocols.filter((p: Protocols) => p.protocolActive === true);
        setProtocols(filteredProtocols);
        console.log(filteredProtocols);
        
        fetchAndSetCoverageDemands(filteredProtocols, data);

        // now we need to get the timeseries data of each protocol
        // for that, we need to fetch each protocol and sum up the csv as there's no endpoint in the api for that
        let urls : string[] = [];
        let timestampToCSVMap = new Map<number, number>();
        filteredProtocols.forEach((p: Protocols) => {
          urls.push(api.timeseries_data_all+p.protocolName);
        });

        let requests = urls.map(url => fetch(url));
        Promise.all(requests)
          .then((responses) => {
            Promise.all(responses.map(r=>r.json()))
              .then(dataArr => {
                dataArr.forEach((data) => {
                  let records: TimeseriesRecord[] = apiDataToTimeseriesRecords(data);
                  for(let record of records) {
                      let csv = timestampToCSVMap.get(record.timestamp);
                      if(csv === undefined) {
                        timestampToCSVMap.set(record.timestamp, record.collateralStakedValue);
                      } else {
                        csv += record.collateralStakedValue;
                        timestampToCSVMap.set(record.timestamp, csv);
                      }
                  }
                })

                // now change the map to a sorted array (sorted by ascending timestamp)
                let collaterals: collateralRecord[] = [];
                timestampToCSVMap.forEach((value: number, key: number) => {
                  collaterals.push({
                    timestamp: key,
                    collateralStakedValue: value
                  });
                });
                collaterals.sort((entryA, entryB) => {return entryA.timestamp-entryB.timestamp})
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
                    <p className={classes.infoCard}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(csvs[csvs.length-1].collateralStakedValue)}</p>
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
                    <p className={classes.infoCard}>{formatCurrency(csvs[csvs.length-1].collateralStakedValue)}</p>
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
                  areaLabel={`Collateral Staked Value [USD]`}/>
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
                  Total Active Amount of Coverage per Protocol
                </Typography>
              </Grid>
            </Grid>
            <Grid container justify="space-between" alignItems="center">
              <Grid item xs={12}>
                {protocols ? (
                  <TVLProtocolsBarChart textColor={theme.palette.text.primary} fillColor={theme.palette.secondary.main}
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
                  <TVLProtocolsBarChart textColor={theme.palette.text.primary} fillColor={theme.palette.primary.main}
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
