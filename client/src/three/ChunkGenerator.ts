import { CHUNK_SIZE, PLAYER_VIEW_LENGTH, OFFSET } from "./constants";
import * as THREE from "three";
import PoissonDiskSampling from "poisson-disk-sampling";
import seedrandom from "seedrandom";
import type { Mesh } from "three";

type Chunk = {
  xId: number;
  yId: number;
  zId: number;
};
const generatedChunks = new Set<String>();

export const generateNearbyChunks = (
  x: number,
  y: number,
  z: number
): Mesh[] => {
  const chunkIds = getIdsNearbyChunks(x, y, z);
  const allSpheres = Array.from(chunkIds).flatMap((chunkId: string) =>
    generateChunk(chunkId)
  );
  return allSpheres;
};

const generateChunk = (chunkId: string): Mesh[] => {
  if (generatedChunks.has(chunkId)) {
    return [];
  }
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
  const spheres: Mesh[] = points.map(([px, py, pz]) => {
    const xPos = px + xId * CHUNK_SIZE - OFFSET;
    const yPos = py + yId * CHUNK_SIZE - OFFSET;
    const zPos = pz + zId * CHUNK_SIZE - OFFSET;
    return createSphere(xPos, yPos, zPos);
  });
  generatedChunks.add(chunkId);
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
  return `${xId}, ${yId}, ${zId}`;
};

const getIdsNearbyChunks = (x: number, y: number, z: number): Set<string> => {
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
  return chunkIds;
};

const getChunkFromId = (chunkId: String): Chunk => {
  const coords = chunkId.split(",");
  return {
    xId: parseInt(coords[0]),
    yId: parseInt(coords[1]),
    zId: parseInt(coords[2]),
  };
};

const createSphere = (x: number, y: number, z: number): Mesh => {
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(2, 32, 16),
    new THREE.MeshStandardMaterial({
      color: 0x00ccaa,
    })
  );
  sphere.position.set(x, y, z);
  return sphere;
};
