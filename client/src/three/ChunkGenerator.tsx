import { useFrame, extend, useThree } from "@react-three/fiber";
import { Text } from "troika-three-text";
import PoissonDiskSampling from "poisson-disk-sampling";
import { useRef, useState } from "react";
import seedrandom from "seedrandom";
import * as THREE from "three";
import {
  CHUNK_SIZE,
  OFFSET,
  PLAYER_VIEW_LENGTH,
  MOVE_OFFSET,
} from "./constants";
import { randomizeName } from "../nameGenerator/utils";
extend({ Text });

type Chunk = {
  xId: number;
  yId: number;
  zId: number;
};

function Planet(props: any) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>();

  // Hold state for hovered and clicked events
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const { camera } = useThree();
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame(() => (ref.current!.rotation.x += 0.01));
  const [x, y, z] = props.position;
  const moveCamera = (event: any, clicked: boolean) => {
    const { x, y, z } = event.point;
    camera.position.set(x + MOVE_OFFSET, y + MOVE_OFFSET, z + MOVE_OFFSET);
    camera.lookAt(x, y, z);
    setClicked(clicked);
  };
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => moveCamera(event, !clicked)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <text
        /* @ts-ignore */
        text={randomizeName(`${x},${y},${z}`)}
        anchorX="center"
        anchorY="middle"
        color="#9966ff"
        fontSize="0.6"
        position={[0, 0, 2]}
      />
      <sphereGeometry args={[2, 32, 16]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}
export const generateNearbyChunks = (chunkIds: string[]) => {
  const allSpheres = Array.from(chunkIds).flatMap((chunkId: string) =>
    generateChunk(chunkId)
  );
  return allSpheres;
};

const generateChunk = (chunkId: string) => {
  // eslint-disable-next-line no-console
  console.log(`Generating chunk: ${chunkId}`);
  var poissonSampler = new PoissonDiskSampling(
    {
      shape: [CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE],
      minDistance: 100,
      maxDistance: 300,
      tries: 10,
    },
    seedrandom(chunkId)
  );
  const { xId, yId, zId } = getChunkFromId(chunkId);
  var points = poissonSampler.fill();
  const spheres = points.map(([px, py, pz]) => {
    const xPos = px + xId * CHUNK_SIZE - OFFSET;
    const yPos = py + yId * CHUNK_SIZE - OFFSET;
    const zPos = pz + zId * CHUNK_SIZE - OFFSET;
    return createSphere(xPos, yPos, zPos);
  });
  return spheres;
};

const getChunk = (x: number, y: number, z: number): Chunk => {
  const xSign = x >= 0 ? 1 : -1;
  const ySign = y >= 0 ? 1 : -1;
  const zSign = z >= 0 ? 1 : -1;
  const xId = Math.trunc((x + xSign * (CHUNK_SIZE - OFFSET)) / CHUNK_SIZE);
  const yId = Math.trunc((y + ySign * (CHUNK_SIZE - OFFSET)) / CHUNK_SIZE);
  const zId = Math.trunc((z + zSign * (CHUNK_SIZE - OFFSET)) / CHUNK_SIZE);
  return { xId, yId, zId };
};

export const getChunkId = (x: number, y: number, z: number): string => {
  const { xId, yId, zId } = getChunk(x, y, z);
  return stringifyCoordinates(xId, yId, zId);
};

const stringifyCoordinates = (x: number, y: number, z: number) =>
  `${x}, ${y}, ${z}`;

export const getIdsNearbyChunks = (
  x: number,
  y: number,
  z: number
): string[] => {
  const chunkIds = new Set<string>();
  const deltas = [
    [PLAYER_VIEW_LENGTH, PLAYER_VIEW_LENGTH, PLAYER_VIEW_LENGTH],
    [-PLAYER_VIEW_LENGTH, PLAYER_VIEW_LENGTH, PLAYER_VIEW_LENGTH],
    [-PLAYER_VIEW_LENGTH, -PLAYER_VIEW_LENGTH, PLAYER_VIEW_LENGTH],
    [-PLAYER_VIEW_LENGTH, PLAYER_VIEW_LENGTH, -PLAYER_VIEW_LENGTH],
    [PLAYER_VIEW_LENGTH, -PLAYER_VIEW_LENGTH, PLAYER_VIEW_LENGTH],
    [PLAYER_VIEW_LENGTH, PLAYER_VIEW_LENGTH, -PLAYER_VIEW_LENGTH],
    [-PLAYER_VIEW_LENGTH, -PLAYER_VIEW_LENGTH, -PLAYER_VIEW_LENGTH],
  ];
  deltas.forEach(([dx, dy, dz]) => {
    chunkIds.add(getChunkId(x + dx, y + dy, z + dz));
  });
  return Array.from(chunkIds);
};

const getChunkFromId = (chunkId: string): Chunk => {
  const coords = chunkId.split(",");
  return {
    xId: parseInt(coords[0]),
    yId: parseInt(coords[1]),
    zId: parseInt(coords[2]),
  };
};

export const createSphere = (x: number, y: number, z: number): JSX.Element => {
  return (
    <Planet
      key={stringifyCoordinates(x, y, z)}
      radius={2}
      widthSegments={32}
      heightSegments={16}
      position={[x, y, z]}
    />
  );
};
