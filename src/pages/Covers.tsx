import { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import ProtocolPreviewCard from "../components/ProtocolPreviewCard";
import Protocol from "../interfaces/Protocol";
import LinearProgress from '@material-ui/core/LinearProgress';
import api from "../utils/api.json";

const Covers = () => {
  const [protocols, setProtocols] = useState<Protocol[]>();
  const [width, setWidth] = useState<number>(window.innerWidth);

  const handleResize = () => {
    setWidth(window.innerWidth);
  }

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
      });
      
    window.addEventListener('resize', handleResize)
  }, []);
  return (
    <div>
      {protocols ? (
        <Grid container spacing={3} justify="center">
        {protocols?.map((protocolData, index) => (
          <Grid
            item
            style={{ width: (width > 600) ? "300px" : "50%" }}
            key={protocolData.protocolName}
          >
            <ProtocolPreviewCard protocolData={protocolData}  />
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
