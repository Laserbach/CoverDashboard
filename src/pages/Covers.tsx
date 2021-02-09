import { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import ProtocolCard from "../components/ProtocolCard";
import Protocols from "../interfaces/Protocols";
import LinearProgress from '@material-ui/core/LinearProgress';
import api from "../utils/api.json";

const Covers = () => {
  const [protocols, setProtocols] = useState<Protocols[]>();

  useEffect(() => {
    fetch(api.cover_api.base_url)
      .then((response) => response.json())
      .then((data) => {
        setProtocols(data.protocols.filter((protocol: Protocols) => protocol.protocolName));
      })
  }, []);
  return (
    <div>
      {protocols ? (
        <Grid container spacing={3} justify="center">
        {protocols?.map((protocolData, index) => (
          <Grid
            item
            style={{ width: window.innerWidth > 600 ? "300px" : "50%" }}
            key={protocolData.protocolName}
          >
            <ProtocolCard protocolData={protocolData} />
          </Grid>
        ))}
      </Grid>
      ) : (
        <LinearProgress color="primary" />
      )}
    </div>
  );
};

export default Covers;
