import { useState, useEffect, FC } from "react";
import Protocols from "../interfaces/Protocols";
import Chart from "../components/Chart";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  root: {
    backgroundColor: "#3a3c4d",
  },
  media: {
    width: "200px",
    marginBottom: "20px",
  },
});

interface PropsProtocol {
  match: {
    params: {
      cover: string;
    };
  };
}

const Cover: FC<PropsProtocol> = (props) => {
  const classes = useStyles();
  const [protocolData, setProtocolData] = useState<Protocols>();
  const [historicData, setHistoricData] = useState();
  useEffect(() => {
    fetch(
      `https://apiv1.coverprotocol.com/protocols/${props.match.params.cover}`
    )
      .then((response) => response.json())
      .then((data) => setProtocolData(data.data));
  }, []);
  useEffect(() => {
    if (protocolData) {
      fetch(
        `https://apiv1.coverprotocol.com/prices/${protocolData.id}/${protocolData.expirationTimestamps[0]}`
      )
        .then((response) => response.json())
        .then((data) => setHistoricData(data));
    }
  }, [protocolData]);
  return (
    <>
      <CardMedia
        className={classes.media}
        image={`${process.env.PUBLIC_URL}/images/protocols/${props.match.params.cover}_transparent.png`}
        component="img"
        alt={props.match.params.cover}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card className={classes.root}>
            <CardContent>
              <CardHeader title="Claim Price" />
              <Chart data={historicData} tokenType="claim.price" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card className={classes.root}>
            <CardContent>
              <CardHeader title="NoClaim Price" />
              <Chart data={historicData} tokenType="noclaim.price" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card className={classes.root}>
            <CardContent>
              <CardHeader title="Claim Liquidity" />
              <Chart data={historicData} tokenType="claim.liquidity" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card className={classes.root}>
            <CardContent>
              <CardHeader title="NoClaim Liquidity" />
              <Chart data={historicData} tokenType="noclaim.liquidity" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default Cover;
