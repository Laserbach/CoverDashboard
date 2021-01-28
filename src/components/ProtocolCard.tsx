import { FC } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";
import Protocols from "../interfaces/Protocols";

const useStyles = makeStyles({
  root: {
    maxWidth: 345,
    backgroundColor: "#6b7affcc",
  },
});

interface ProtocolData {
  protocolData: Protocols;
}

const ProtocolCard: FC<ProtocolData> = ({ protocolData }) => {
  const classes = useStyles();
  return (
    <Link
    to='test'
    //   to={`/covers/${protocolData.id.toLowerCase()}`}
       style={{ textDecoration: "none" }}
     >
      <Card className={classes.root}>
        <CardActionArea>
          <CardMedia
            component="img"
            alt={'test'}
            height="140"
            image={`${process.env.PUBLIC_URL}/images/protocols/${protocolData.protocolName}.png`}
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

export default ProtocolCard;
