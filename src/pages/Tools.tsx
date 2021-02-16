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

const Tools = () => {
  const classes = useStyles();

  const handleOnChangeTotal = (subtotal: number, itemId: number) => {
    totals[itemId] = subtotal;
    setTotals(totals);
  }

  const handleOnItemRemoval = (itemId: number) => {
    setTotals(totals.filter((itemValue, itemIndex, arr) => {
      return itemIndex != itemId;
    }));

    // TODO: For some reason, it deletes multiple entries with this function, no idea how.
    setItems(items.filter((itemValue, itemIndex, arr) => {
      return itemIndex != itemId;
    }));
  }

  const [totals, setTotals] = useState<number[]>([0]);
  const [protocols, setProtocols] = useState<Protocol[]>();
  const [apiData, setApiData] = useState<any>();
  const [items, setItems] = useState<number[]>([0]);

  useEffect(() => {
    fetch(api.cover_api.base_url)
      .then((response) => response.json())
      .then((data) => {
        let protocols = data.protocols.filter((protocol: Protocol) => protocol.protocolName);
        protocols.sort((pA: Protocol, pB: Protocol) => {
          if (pA.protocolName < pB.protocolName) { return -1; }
          if (pA.protocolName > pB.protocolName) { return 1;  }
          return 0;
        });
        setProtocols(protocols);
        setApiData(data);
      });
  }, []);

  const addItem = () => {
    setItems((p) => [...p, items.length]);
    setTotals((t) => [...t, 10]);
  };

  return (
    <div>
      <Grid container spacing={3} justify="space-evenly">
        {protocols && apiData ? (
          items.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Card className={classes.root}>
                <Grid container justify="space-evenly" alignItems="center">
                  <Grid item xs={12}>
                    <Calc id={item} onChangeTotal={handleOnChangeTotal} onRemoval={handleOnItemRemoval} protocols={protocols} apiData={apiData} />
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))
        ) : (
          <div></div>
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
              <div></div>
            )}
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h6" className={classes.totalText}>Total: {formatCurrency(totals.reduce((A, B) => A+B))}</Typography>
          </Grid>
        </Grid>
      </Grid>
      
    </div>
  );
};

export default Tools;
