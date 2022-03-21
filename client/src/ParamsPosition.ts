import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Point3D = {
  x: number;
  y: number;
  z: number;
};

type Props = {
  position: Point3D;
};

const ParamsPosition = ({ position }: Props) => {
  const [timeout, setTimeout] = useState(-1);
  const navigate = useNavigate();

  useEffect(() => {
    clearTimeout(timeout);

    const timeoutId = window.setTimeout(() => {
      const { x, y, z } = position;
      navigate(`/galaxy/@${x},${y},${z}z`);
    }, 100);

    setTimeout(timeoutId);
  }, [position]);

  return null;
};

export default ParamsPosition;
