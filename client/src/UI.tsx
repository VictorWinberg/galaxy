import { useState } from "react";
import { randomizeName } from "./utils";

const UI = () => {
  const [planet, setPlanet] = useState(randomizeName(String(Date.now())));

  return (
    <div
      className="ui-overlay"
      onClick={() => setPlanet(randomizeName(String(Date.now())))}
    >
      <h1>Planet: {planet}</h1>
    </div>
  );
};

export default UI;
