import React, { useEffect, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { generateNearbyChunks, getIdsNearbyChunks } from "./ChunkGenerator";

const Planets = () => {
  const [chunks, setChunks] = useState<string[]>([]);
  const [planets, setPlanets] = useState<JSX.Element[]>([]);
  const { camera } = useThree();

  useFrame(() => {
    const { x, y, z } = camera.position;
    const chunkIds = getIdsNearbyChunks(x, y, z);
    if (!chunkIds.every((c) => chunks.includes(c))) {
      setChunks(chunkIds);
    }
  });

  useEffect(() => {
    setPlanets(generateNearbyChunks(chunks));
  }, [chunks]);

  return <>{planets}</>;
};

export default Planets;
