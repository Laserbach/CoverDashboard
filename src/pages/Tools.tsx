import { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

import Calc from "../components/Calc";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#3a3c4d",
    margin: theme.spacing(2),
  },
  button: {
    marginLeft: theme.spacing(2),
  },
}));

const Tools = () => {
  const classes = useStyles();
  const [items, setItems] = useState([<Calc />, <Calc />, <Calc />]);
  const addItem = () => {
    setItems((p) => [...p, <Calc />]);
  };
  return (
    <div>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={addItem}
      >
        Add
      </Button>
      {items.map((item, index) => (
        <div key={index}>{item} </div>
      ))}
    </div>
  );
};

export default Tools;
