import { FC, useEffect, useState } from "react";
import { makeStyles, createStyles, Theme,  } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Protocol from "../interfaces/Protocol";
import {getImageSrcOfProtocol} from "../utils/protocolImages";

const useStyles = makeStyles((theme: Theme) => (
  createStyles({
    root: {
      maxWidth: 345,
      backgroundColor: "#3a3c4d99",
    }
  })
));
interface ProtocolData {
  protocolData: Protocol;
}

const ProtocolPreviewCard: FC<ProtocolData> = ({ protocolData }) => {
  const classes = useStyles();
  let imgSrc = getImageSrcOfProtocol(protocolData.protocolName);
  return (
    <Link
       href={`/covers/${protocolData.protocolName.toLowerCase()}`}
       style={{ textDecoration: "none" }}>
      <Card className={classes.root}>
        <CardActionArea>
          <CardMedia
            component="img"
            alt={`${protocolData.protocolName} protocol icon`}
            height="140"
            image={imgSrc}
          />
          <CardContent>
            <Typography gutterBottom variant="h6">
              {protocolData.protocolName}
            </Typography>
            <Typography gutterBottom variant="subtitle1">
                {protocolData.protocolUrl || "-"}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  );
};

export default ProtocolPreviewCard;
