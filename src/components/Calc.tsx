import { FC, useState, useEffect } from "react";
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
import DeleteIcon from "@material-ui/icons/Delete";
import Button from "@material-ui/core/Button";
import { Divider } from "@material-ui/core";
import Protocol from "../interfaces/Protocol";
import PoolData from "../interfaces/PoolData";
import {
  cpCalcEarnedPremium,
  mmCalcSfAndILOnHack,
  mmCalcSfAndILOnNoHack,
  cpCalcSfAndILOnHack,
  cpCalcSfAndILOnNoHack,
} from "../utils/toolsCalculations";
import { getMostRelevantPoolBySymbol } from "../utils/coverApiDataProc";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#3a3c4d99",
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
  onChangeTotal: any;
  onRemoval: any;
  id: number;
  protocols: Protocol[];
  apiData: any;
}

const Calc: FC<CalcProps> = (props) => {
  const classes = useStyles();
  const [protocol, setProtocol] = useState(
    props.protocols[0].protocolName.toLowerCase()
  );
  const [mmcp, setMmcp] = useState("mm");
  const [mintAmount, setMintAmount] = useState(1000);
  const [scenario, setScenario] = useState("nohack");
  const [bonusRewards, setBonusRewards] = useState(0);
  const [sf, setSwapFees] = useState(0);
  const [il, setImpermanentLoss] = useState(0);
  const [premium, setPremium] = useState(0);

  const calc = () => {
    const poolData = props.apiData.poolData;
    let poolIdClaim: string;
    let poolIdNoClaim: string;
    let claimTokenAddr: string;
    let noClaimTokenAddr: string;

    // get pooldata(s) of new protocol
    [poolIdClaim, claimTokenAddr] = getMostRelevantPoolBySymbol(
      protocol,
      true,
      poolData
    );
    [poolIdNoClaim, noClaimTokenAddr] = getMostRelevantPoolBySymbol(
      protocol,
      false,
      poolData
    );

    let poolDataClaim: PoolData;
    let poolDataNoClaim: PoolData;
    let tokenClaimDai: any;
    let tokenClaimCov: any;
    let tokenNoClaimDai: any;
    let tokenNoClaimCov: any;

    poolData[poolIdClaim].poolId.tokens.forEach((token: any) => {
      if (token.name === "covToken") {
        tokenClaimCov = token;
        return;
      }

      if (token.symbol.toUpperCase() === "DAI") {
        tokenClaimDai = token;
        return;
      }
    });

    poolData[poolIdNoClaim].poolId.tokens.forEach((token: any) => {
      if (token.name === "covToken") {
        tokenNoClaimCov = token;
        return;
      }
      if (token.symbol.toUpperCase() === "DAI") {
        tokenNoClaimDai = token;
        return;
      }
    });

    poolDataClaim = {
      swapFee: poolData[poolIdClaim].poolId.swapFee,
      denormWeightCov: tokenClaimCov.denormWeight,
      denormWeightDai: tokenClaimDai.denormWeight,
      balanceCov: tokenClaimCov.balance,
      balanceDai: tokenClaimDai.balance,
      priceCov: poolData[poolIdClaim].price,
    };

    poolDataNoClaim = {
      swapFee: poolData[poolIdNoClaim].poolId.swapFee,
      denormWeightCov: tokenNoClaimCov.denormWeight,
      denormWeightDai: tokenNoClaimDai.denormWeight,
      balanceCov: tokenNoClaimCov.balance,
      balanceDai: tokenNoClaimDai.balance,
      priceCov: poolData[poolIdNoClaim].price,
    };

    // calc based off pool;
    let prem = cpCalcEarnedPremium(poolDataClaim, mintAmount);
    setPremium(prem);
    console.log(`Premium: ${prem}`);

    let sf: number;
    let il: number;

    switch (mmcp) {
      case "mm":
        if (scenario === "hack") {
          [sf, il] = mmCalcSfAndILOnHack(
            [poolDataClaim, poolDataNoClaim],
            mintAmount
          );
          console.log(poolDataClaim);
          console.log(poolDataNoClaim);
          setSwapFees(sf);
          setImpermanentLoss(il);
        } else {
          [sf, il] = mmCalcSfAndILOnNoHack(
            [poolDataClaim, poolDataNoClaim],
            mintAmount
          );
          setSwapFees(sf);
          setImpermanentLoss(il);
        }
        break;
      case "cp":
        if (scenario === "hack") {
          [sf, il] = cpCalcSfAndILOnHack(poolDataNoClaim, mintAmount);
          setSwapFees(sf);
          setImpermanentLoss(il);
        } else {
          [sf, il] = cpCalcSfAndILOnNoHack(poolDataNoClaim, mintAmount);
          setSwapFees(sf);
          setImpermanentLoss(il);
        }
        break;
      default:
        break;
    }
  };

  const handleChangeProtocol = (event: any) => {
    setProtocol(event.target.value);
    calc();
  };
  const handleChangeMmcp = (event: any) => {
    setMmcp(event.target.value);
    calc();
  };
  const handleChangeAmount = (event: any) => {
    setMintAmount(event.target.value);
    calc();
  };
  const handleChangeRadio = (event: any) => {
    setScenario(event.target.value);
    calc();
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
            {props.protocols.map((protocol, index) => (
              <MenuItem key={index} value={protocol.protocolName.toLowerCase()}>
                {protocol.protocolDisplayName}
              </MenuItem>
            ))}
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
            value={mintAmount}
            onChange={handleChangeAmount}
            type="number"
            placeholder="Mint Amount"
          />
        </FormControl>
        <FormControl className={classes.formControl}>
          <FormLabel className={classes.formLabel}>Scenario</FormLabel>
          <RadioGroup
            name="cov-token"
            value={scenario}
            onChange={handleChangeRadio}
          >
            <FormControlLabel
              value="nohack"
              control={<Radio size="small" />}
              label="No Hack"
            />
            <FormControlLabel
              value="hack"
              control={<Radio size="small" />}
              label="Hack"
            />
          </RadioGroup>
        </FormControl>
        <FormControl className={classes.formControl}>
          {props.id > 0 ? (
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
          ) : (
            <div></div>
          )}
        </FormControl>
      </Box>
      <Typography className={classes.text}>Premium: {premium}</Typography>
      <Typography className={classes.text}>
        Bonus Rewards: {bonusRewards}{" "}
      </Typography>
      <Typography className={classes.text}>
        Estimated Swap Fees: {sf}{" "}
      </Typography>
      <Typography className={classes.text}>Impermanent Loss: {il} </Typography>
      <Divider />
      <Typography className={classes.subTotalText}>Total:</Typography>
    </div>
  );
};

export default Calc;
