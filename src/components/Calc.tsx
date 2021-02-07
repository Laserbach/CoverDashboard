import { FC, useState } from "react";
import Box from "@material-ui/core/Box";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from '@material-ui/icons/Delete';
import Button from "@material-ui/core/Button";
import { Divider } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#3a3c4d",
    margin: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(2),
    minWidth: 160,
  },
  label: {
    color: "#6b7affcc",
  },
  formLabel: {
    color: "#6b7affcc",
    transform: "translate(0, 1.5px) scale(0.75)",
  },
  text: {
    margin: theme.spacing(1),
    marginLeft: theme.spacing(2),
  },
  subTotalText: {
    margin: theme.spacing(1),
    marginLeft: theme.spacing(2),
  },
  button: {
    margin: theme.spacing(2),
  },
}));

interface CalcProps {
  onChangeTotal: any,
  onRemoval: any,
  id: number
}

const Calc: FC<CalcProps> = (props) => {
  const classes = useStyles();
  const [protocol, setProtocol] = useState("default");
  const [mmcp, setMmcp] = useState("default");
  const [amount, setAmount] = useState("");
  const [radio, setRadio] = useState("noclaim");
  
  // TODO: do calculation of an item in here, when the total of the item gets changed, call
  // props.onChangeTotal(total, props.id)
  const handleChangeProtocol = (event: any) => {
    setProtocol(event.target.value);
  };
  const handleChangeMmcp = (event: any) => {
    setMmcp(event.target.value);
  };
  const handleChangeAmount = (event: any) => {
    setAmount(event.target.value);
  };
  const handleChangeRadio = (event: any) => {
    setRadio(event.target.value);
  };

  const handleOnDelete = (event: any) => {
    props.onRemoval(props.id);
  };

  return (
    <div>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        flexWrap="wrap"
      >
        <FormControl className={classes.formControl}>
          <InputLabel className={classes.label} id="protocol-label">
            Protocol
          </InputLabel>
          <Select
            labelId="protocol-label"
            id="protocol-select"
            value={protocol}
            onChange={handleChangeProtocol}
          >
            <MenuItem value={"default"}>Choose Protocol</MenuItem>
            <MenuItem value={"curve"}>Curve</MenuItem>
            <MenuItem value={"aave"}>Aave</MenuItem>
            <MenuItem value={"balancer"}>Balancer</MenuItem>
          </Select>
        </FormControl>
        <FormControl className={classes.formControl}>
          <InputLabel className={classes.label} id="mmcp-label">
            MM or CP
          </InputLabel>
          <Select
            labelId="mmcp-label"
            id="mmcp-select"
            value={mmcp}
            onChange={handleChangeMmcp}
          >
            <MenuItem value={"default"}>Select MM or CP</MenuItem>
            <MenuItem value={"mm"}>MM</MenuItem>
            <MenuItem value={"cp"}>CP</MenuItem>
          </Select>
        </FormControl>
        <FormControl className={classes.formControl}>
          <InputLabel className={classes.label} id="mint-amount" shrink>
            Mint Amount
          </InputLabel>
          <Input
            id="mint-amount"
            value={amount}
            onChange={handleChangeAmount}
            type="number"
            placeholder="Mint Amount"
          />
        </FormControl>
        <FormControl className={classes.formControl}>
          <FormLabel className={classes.formLabel}>Token Type</FormLabel>
          <RadioGroup
            name="cov-token"
            value={radio}
            onChange={handleChangeRadio}
          >
            <FormControlLabel
              value="noclaim"
              control={<Radio size="small" />}
              label="No Claim"
            />
            <FormControlLabel
              value="claim"
              control={<Radio size="small" />}
              label="Claim"
            />
          </RadioGroup>
        </FormControl>
        <FormControl className={classes.formControl}>
        {(props.id > 0) ? (
          <div>
            <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={handleOnDelete}
                  startIcon={<DeleteIcon />}
                >
                  Delete
            </Button>
          </div>  
        ) : (<div></div>)}
        </FormControl>
      </Box>
      <Typography className={classes.text}>Premium:</Typography>
      <Typography className={classes.text}>Shieldmine Rewards:</Typography>
      <Typography className={classes.text}>Estimated Swap Fees:</Typography>
      <Typography className={classes.text}>Impermanent Loss:</Typography>
      <Divider />
      <Typography className={classes.subTotalText}>Total:</Typography>
    </div>
  );
};

export default Calc;
