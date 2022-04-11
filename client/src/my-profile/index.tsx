/* eslint-disable react-hooks/exhaustive-deps */
import Peer from "peerjs";
import { useEffect, useState } from "react";
import Web3 from "web3";
const GalaxyToken = require("../output/GalaxyToken.json");

const web3 = new Web3("ws://127.0.0.1:7545");
const galaxyContract = new web3.eth.Contract(
  GalaxyToken.abi,
  "0x51d45d25810f2e462e5051c8A25cC666Fca14cc1"
);

function MyAccount() {
  const [planetName, setPlanetName] = useState<string>("");
  const [ownedAt, setOwnedAt] = useState<string>("");

  async function initialize() {
    const shouldAllUsersPlanets = await galaxyContract.methods
      .getUserPlanets("0xF23544104E17955613e4a19F2959016c2dA8F5A1")
      .call();

    for (let index = 0; index < shouldAllUsersPlanets.length; index++) {
      const element = shouldAllUsersPlanets[index];
      const shouldGetPlanet = await galaxyContract.methods
        .getPlanet(element)
        .call();
      console.log(JSON.stringify(shouldGetPlanet));
      setPlanetName(shouldGetPlanet[0]);
      setOwnedAt(new Date(shouldGetPlanet[2] * 1000).toDateString());
    }
  }

  // connect to peer host or become host
  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <div id="My Planets" style={{ color: "white" }}>
        {`My Planet: ${planetName} 
            Owned from: ${ownedAt}`}
      </div>
    </>
  );
}

export default MyAccount;
