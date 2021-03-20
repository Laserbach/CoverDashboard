import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Calc from "../components/Calc";
import AddIcon from '@material-ui/icons/Add';
import {formatCurrency} from "../utils/formatting";
import api from "../utils/api.json";
import Protocol from "../interfaces/Protocol";
import CircularProgress from "@material-ui/core/CircularProgress";
import { LinearProgress } from "@material-ui/core";
import {isProtocolActive} from "../utils/coverApiDataProc";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#3a3c4d99",
    margin: theme.spacing(1),
    padding: theme.spacing(1)
  },
  button: {
    marginLeft: theme.spacing(2),
  },
  totalText: {
    margin: theme.spacing(3),
    textDecorationLine: "underline",
    textDecorationStyle: "double",
    textAlign: "right"
  }
}));

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const Tools = () => {
  const classes = useStyles();

  const handleOnChangeTotal = (subtotal: number, itemId: string) => {
    let newPositions = [... positions];
    let positionToChange = newPositions.find(p => p.id === itemId);
    positionToChange.total = subtotal;
    setPositions(newPositions);
  }

  const handleOnItemRemoval = (itemId: string) => {
    let newPositions = [... positions];
    newPositions = newPositions.filter((position, i, arr) => {
      return position.id != itemId;
    })
    setPositions(newPositions);
  }

  const [protocols, setProtocols] = useState<Protocol[]>();
  const [apiData, setApiData] = useState<any>();
  const [positions, setPositions] = useState<any[]>([{id: uuidv4(), total: 0}]);

  useEffect(() => {
    fetch(api.cover_api.base_url)
      .then((response) => response.json())
      .then((data) => {
        let currentTime = Math.round(new Date().getTime() / 1000);
        let protocols = data.protocols.filter((protocol: Protocol) => isProtocolActive(protocol, currentTime) === true);
        protocols.sort((pA: Protocol, pB: Protocol) => {
          if (pA.protocolName < pB.protocolName) { return -1; }
          if (pA.protocolName > pB.protocolName) { return  1; }
          return 0;
        });
        setProtocols(protocols);
        console.log(protocols);
        setApiData(data);
      });
  }, []);

  const addItem = () => {
    setPositions((p) => [...p, {id: uuidv4(), total: 0}]);
  };

  const calcTotal = () : number => {
    let total = 0;
    positions.forEach((pos) => {
      total += pos.total;
    });
    return total;
  }

  return (
    <div>
      <Grid container spacing={3} justify="space-evenly">
        {protocols && apiData ? (
          positions.map((position, index) => (
            <Grid item xs={12} key={position.id}>
              <Card className={classes.root}>
                <Grid container justify="space-evenly" alignItems="center">
                  <Grid item xs={12}>
                    <Calc id={position.id} onChangeTotal={handleOnChangeTotal} onRemoval={handleOnItemRemoval} protocols={protocols} apiData={apiData} />
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))
        ) : (
          <LinearProgress />
        )}
        
        <Grid item xs={12} container justify="space-between" alignItems="center" >
          <Grid item xs={2}>
            {protocols ? (
              <Button
              className={classes.button}
              variant="contained"
              color="primary"
              onClick={addItem}
              startIcon={<AddIcon />}
              >
                Add Coverage
              </Button>
            ) : (
              <CircularProgress />
            )}
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h6" className={classes.totalText}>Total: {formatCurrency(calcTotal())}</Typography>
          </Grid>
        </Grid>
      </Grid>
      
    </div>
  );
};

export default Tools;
