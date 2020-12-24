import { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import ProtocolCard from "../components/ProtocolCard";
import Protocols from "../interfaces/Protocols";

const Covers = () => {
  const [protocols, setProtocols] = useState<Protocols[]>();

  useEffect(() => {
    fetch("https://apiv1.coverprotocol.com/protocols/all")
      .then((response) => response.json())
      .then((data) =>
        setProtocols(
          data.protocols.filter((protocol: Protocols) => protocol.name)
        )
      );
  }, []);
  return (
    <div>
      <Grid container spacing={3} justify="center">
        {protocols?.map((protocolData, index) => (
          <Grid
            item
            style={{ width: window.innerWidth > 600 ? "300px" : "250px" }}
            key={protocolData.id}
          >
            <ProtocolCard protocolData={protocolData} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Covers;
