import { useState } from "react";
import { randomizeName } from "./utils";
import Web3 from "web3";
import GalaxyAPI from "./galaxy-api/GalaxyApi";
const galaxyAPI = new GalaxyAPI('http://127.0.0.1:7545','0x88d9F88b8D4F2Aa7B3750389882876565881F726')

const web3 = new Web3('http://127.0.0.1:7545')

const getAccount = (): string => {
  const accounts = web3.defaultAccount || 'No defualt Account'
  return accounts
}


const UI = () => {
  const [planet, setPlanet] = useState(randomizeName(String(Date.now())));

  return (
    <div
      className="ui-overlay"
      onClick={() => setPlanet(randomizeName(String(Date.now())))}
    >
      <h1>Planet: {planet}</h1>
      <div>
        <h2>My ID: {getAccount()}</h2>
        <div>
          <p>My Planets: {galaxyAPI.getUserPlanets('0x067FaaE30961Cc624869B3dbb73ABcAf4d74B4ad')}</p>
        </div>
      </div>
    </div>
  );
};

export default UI;
