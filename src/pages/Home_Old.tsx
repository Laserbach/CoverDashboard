import { FC } from "react";
import Chart from "../components/Chart";
import ProtocolData from "../interfaces/TimeseriesRecord";
import { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
//import ProtocolCard from "../components/ProtocolCard";
import Protocols from "../interfaces/Protocols";

const Home = () => {
  const [protocols, setProtocols] = useState<Protocols[]>();

  useEffect(() => {
    fetch("https://api.coverprotocol.com/protocol_data/production/")
      .then((response) => response.json())
      .then((data) =>
        setProtocols(
          data.protocols.filter((protocol: Protocols) => protocol.protocolName)
        )
      )  
  }, []);

  fetch("https://api.coverprotocol.com/protocol_data/production/")
      .then((response) => response.json())
    .then((data)=> {
      //console.log(data);

    let protocolsA = data["protocols"];      
    let collateralStakedValues = [];
    //for each project in the protocols
     for(let i = 0; i < protocolsA.length; i++){
      let protocol = protocolsA[i];
      let coverObjects = protocol["coverObjects"];
      //and then for each coverObject in each protocol
      for(let j = 0; j < coverObjects.length; j++){
          let coverObject = coverObjects[j];
          //console.log(coverObjects[j])
          let collateralStakedValue = coverObject["collateralStakedValue"];
          //console.log(collateralStakedValue);
          collateralStakedValues.push(collateralStakedValue);
      }
    }
    //console.log(collateralStakedValues);
    });
    

      //.then((data)=> console.log(data.))
  return (
    <div>
      <Grid container spacing={3} justify="center">
        {protocols?.map((protocolData, index) => (
          <Grid
            item
            style={{ width: window.innerWidth > 600 ? "300px" : "250px" }}
            key={protocolData.protocolName}
          >
          <h3>{protocolData.protocolName}</h3>
          {console.log(protocolData)}
          {console.log(protocolData.coverObjects)}
          
          </Grid>
        ))}
      </Grid> 

    </div>
  );
};
// const Home = () => {
//   return (
//     <div>
//       <h1>Work in progress</h1>
//     </div>
//   );
// };

export default Home;