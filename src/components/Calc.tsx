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
  cpCalcBonusRewards,
  mmCalcBonusRewards} from "../utils/toolsCalculations";
import {getMostRelevantPoolBySymbol} from "../utils/coverApiDataProc";
import {formatCurrency} from "../utils/formatting";
import api from "../utils/api.json";

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

const SCENARIO_HACK : string = "hack";
const SCENARIO_NO_HACK : string = "nohack";

const TYPE_MM : string = "mm";
const TYPE_CP : string = "cp";

interface CalcProps {
  onChangeTotal: any;
  onRemoval: any;
  id: string;
  protocols: Protocol[];
  apiData: any;
}

const Calc: FC<CalcProps> = (props) => {
  const classes = useStyles();
  const [protocol, setProtocol] = useState(props.protocols[0].protocolName.toLowerCase());
  const [poolIdClaim, setPoolIdClaim] = useState(getMostRelevantPoolBySymbol(protocol, true, props.apiData.poolData)[0]);
  const [poolIdNoClaim, setPoolIdNoClaim] = useState(getMostRelevantPoolBySymbol(protocol, false, props.apiData.poolData)[0]);
  const [mmcp, setMmcp] = useState(TYPE_MM);
  const [mintAmount, setMintAmount] = useState(10000);
  const [scenario, setScenario] = useState(SCENARIO_NO_HACK);
  const [bonusRewards, setBonusRewards] = useState(0);
  const [sf, setSwapFees] = useState(0);
  const [il, setImpermanentLoss] = useState(0);
  const [premium, setPremium] = useState(0);
  const [total, setTotal] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(0);

  const findPoolDataObj = (poolIdentifier : string) => {
    const poolData = props.apiData.poolData;
    let poolDataObj : PoolData;
    let tokenDai : any;
    let tokenCov : any;

    poolData[poolIdentifier].poolId.tokens.forEach((token : any) => {
      if(token.name === "covToken") {
        tokenCov = token;
        return;
      }

      if (token.symbol.toUpperCase() === "DAI") {
        tokenDai = token;
        return;
      }
    });

    poolDataObj = {
      swapFee: poolData[poolIdentifier].poolId.swapFee,
      denormWeightCov: tokenCov.denormWeight,
      denormWeightDai: tokenDai.denormWeight,
      balanceCov: tokenCov.balance,
      balanceDai: tokenDai.balance,
      priceCov: poolData[poolIdentifier].price
    }

    return poolDataObj;
  }

  const findBonusRewardData = (bonuses : any) => {
    let bonusObj : any = undefined;
    if(bonuses) {
      bonuses.forEach((bonus : any) => {
        if(bonus.endTime*1000 > new Date().getTime()) bonusObj = bonus;
      });
    }
    return bonusObj;
  }

  const calc = (newScenario : string, newType : string, newPoolIdClaim : string, newPoolIdNoClaim : string, newProtocol : string, newMintAmount : number, 
    newTokenPrice : number) => {
    let poolDataClaim : PoolData = findPoolDataObj(newPoolIdClaim);
    let poolDataNoClaim : PoolData = findPoolDataObj(newPoolIdNoClaim);
    let prem = cpCalcEarnedPremium(poolDataClaim, newMintAmount);
    let sf : number = 0;
    let il : number = 0;

    switch (newType) {
      case TYPE_MM:
        setPremium(0);
        prem = 0;
        if(newScenario === SCENARIO_HACK) {
          [sf, il] = mmCalcSfAndILOnHack([poolDataClaim, poolDataNoClaim], newMintAmount);
        } else {
          [sf, il] = mmCalcSfAndILOnNoHack([poolDataClaim, poolDataNoClaim], newMintAmount);
        }
        break;
      case TYPE_CP:
        setPremium(prem);
        if(newScenario === SCENARIO_HACK) {
          [sf, il] = cpCalcSfAndILOnHack(poolDataNoClaim, newMintAmount);
        } else {
          [sf, il] = cpCalcSfAndILOnNoHack(poolDataNoClaim, newMintAmount);
        }
        break;
    }
    setSwapFees(sf);
    setImpermanentLoss(il);
    let bonus = 0;
    if(props.apiData.bonusRewardsData[newPoolIdNoClaim] && props.apiData.bonusRewardsData[newPoolIdClaim]) {
      let bonusRewardDataNoClaim : any = findBonusRewardData(props.apiData.bonusRewardsData[newPoolIdNoClaim].bonuses);
      let bonusRewardDataClaim : any = findBonusRewardData(props.apiData.bonusRewardsData[newPoolIdClaim].bonuses);
      if (bonusRewardDataNoClaim && bonusRewardDataClaim) {
        bonus = cpCalcBonusRewards(bonusRewardDataNoClaim, newTokenPrice, newMintAmount, poolDataNoClaim);
        if (newType === TYPE_MM) {
          bonus = mmCalcBonusRewards([bonusRewardDataClaim, bonusRewardDataNoClaim], newTokenPrice, newMintAmount, [poolDataClaim, poolDataNoClaim]);
        }
      }
    }
    setBonusRewards(bonus);
    setTotal(prem + bonus + sf + il);
    props.onChangeTotal(prem + bonus + sf + il, props.id);
  }

  const handleChangeProtocol = (event: any) => {
    let newPoolIdClaim = getMostRelevantPoolBySymbol(event.target.value, true, props.apiData.poolData)[0];
    let newPoolIdNoClaim = getMostRelevantPoolBySymbol(event.target.value, false, props.apiData.poolData)[0];
    let protocol : Protocol = props.apiData.protocols.find((p : Protocol) => p.protocolName.toLowerCase() === event.target.value.toLowerCase());
    fetch(api.coingecko_api.simple_price + protocol.protocolTokenAddress)
      .then((response) => response.json())
      .then((data) => {
        let queriedTokenPrice = data[protocol.protocolTokenAddress.toLowerCase()].usd;
        setTokenPrice(queriedTokenPrice);
        setPoolIdClaim(newPoolIdClaim);
        setPoolIdNoClaim(newPoolIdNoClaim);
        setProtocol(event.target.value);
        calc(scenario, mmcp, newPoolIdClaim, newPoolIdNoClaim, event.target.value, mintAmount, queriedTokenPrice);
      });
  };

  const handleChangeMmcp = (event: any) => {
    setMmcp(event.target.value);
    calc(scenario, event.target.value, poolIdClaim, poolIdNoClaim, protocol, mintAmount, tokenPrice);
  };
  const handleChangeMintAmount = (event: any) => {
    setMintAmount(event.target.value);
    calc(scenario, mmcp, poolIdClaim, poolIdNoClaim, protocol, event.target.value, tokenPrice);
  };
  const handleChangeScenario = (event: any) => {
    setScenario(event.target.value);
    calc(event.target.value, mmcp, poolIdClaim, poolIdNoClaim, protocol, mintAmount, tokenPrice);
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
            <MenuItem value={TYPE_MM}>MM</MenuItem>
            <MenuItem value={TYPE_CP}>CP</MenuItem>
          </Select>
        </FormControl>
        <FormControl className={classes.formControl}>
          <InputLabel className={classes.label} id="mint-amount" shrink>
            Mint Amount
          </InputLabel>
          <Input
            id="mint-amount"
            value={mintAmount}
            onChange={handleChangeMintAmount}
            type="number"
            placeholder="Mint Amount"
          />
        </FormControl>
        <FormControl className={classes.formControl}>
          <FormLabel className={classes.formLabel}>Scenario</FormLabel>
          <RadioGroup
            name="cov-token"
            value={scenario}
            onChange={handleChangeScenario}
          >
            <FormControlLabel
              value={SCENARIO_NO_HACK}
              control={<Radio size="small" />}
              label="No Hack"
            />
            <FormControlLabel
              value={SCENARIO_HACK}
              control={<Radio size="small" />}
              label="Hack"
            />
          </RadioGroup>
        </FormControl>
        <FormControl className={classes.formControl}>
        <Button
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={handleOnDelete}
                startIcon={<DeleteIcon />}
              >
                Delete
          </Button>
        </FormControl>
      </Box>
      <Typography className={classes.text}>Premium: {formatCurrency(premium)}</Typography>
      <Typography className={classes.text}>Bonus Rewards: {formatCurrency(bonusRewards)} </Typography>
      <Typography className={classes.text}>Estimated Swap Fees: {formatCurrency(sf)} </Typography>
      <Typography className={classes.text}>Impermanent Loss: {formatCurrency(il)} </Typography>
      <Divider />
      <Typography className={classes.subTotalText}>Total: {formatCurrency(total)}</Typography>
    </div>
  );
};

export default Calc;