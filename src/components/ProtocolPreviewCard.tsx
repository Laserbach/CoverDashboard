import { FC, useEffect, useState } from "react";
import { makeStyles, createStyles, Theme,  } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";
import Protocols from "../interfaces/Protocols";
import {getImageSrcOfProtocol} from "../utils/protocolImages";

const useStyles = makeStyles((theme: Theme) => (
  createStyles({
    root: {
      maxWidth: 345,
      backgroundColor: theme.palette.primary.main,
    }
  })
));
interface ProtocolData {
  protocolData: Protocols;
}

const ProtocolPreviewCard: FC<ProtocolData> = ({ protocolData }) => {
  const classes = useStyles();
  let imgSrc = getImageSrcOfProtocol(protocolData.protocolName);
  return (
    <Link
       to={`/covers/${protocolData.protocolName.toLowerCase()}`}
       style={{ textDecoration: "none" }}
     >
      <Card className={classes.root}>
        <CardActionArea>
          <CardMedia
            component="img"
            alt={`${protocolData.protocolName} protocol icon`}
            height="140"
            image={imgSrc}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {protocolData.protocolName}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  );
};

export default ProtocolPreviewCard;
