import { useEffect, useState } from "react";
import { NavigateFunction } from "react-router-dom";

export type Point3D = {
  x: number;
  y: number;
  z: number;
};

type Props = {
  navigate: NavigateFunction;
  position: Point3D | undefined;
  rotation: Point3D | undefined;
};

const round = (num: number, digits = 0) =>
  Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);

export const useParamsPosition = ({ navigate, position, rotation }: Props) => {
  const [timeout, setTimeout] = useState(-1);

  useEffect(() => {
    clearTimeout(timeout);

    const timeoutId = window.setTimeout(() => {
      if (!position || !rotation) return;

      const { x: px, y: py, z: pz } = position;
      const pos = `${round(px)},${round(py)},${round(pz)}`;
      const { x: rx, y: ry, z: rz } = rotation;
      const rot = `${round(rx, 2)},${round(ry, 2)},${round(rz, 2)}`;
      navigate(`/galaxy/@${pos}+${rot}`);
    }, 100);

    setTimeout(timeoutId);
  }, [position, rotation]);
};
