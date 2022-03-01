import * as THREE from "three";

import { Noise } from "./noise.js";
import { CubeQuadTree } from "./quadtree.js";
import TerrainBuilderThreaded from "./terrain-builder-threaded.js";
import { TextureSplatter, HeightGenerator } from "./texture-splatter.js";
import { DictDifference, DictIntersection } from "./utils.js";

const MIN_CELL_SIZE = 250;
const MIN_CELL_RESOLUTION =256;
const PLANET_RADIUS = 4000;

export default class TerrainChunkManager {
  constructor(params) {
    this.Init(params);
  }

  Init({ camera, scene, gui }) {
    this.camera = camera;

    this.material = new THREE.MeshStandardMaterial({
      wireframe: false,
      wireframeLinewidth: 1,
      color: 0xffffff,
      side: THREE.FrontSide,
      vertexColors: THREE.VertexColors,
      // normalMap: texture,
    });

    this.builder = new TerrainBuilderThreaded();

    this.InitNoise({ gui });
    this.InitBiomes({ gui });
    this.InitTerrain({ scene, gui });
  }

  InitNoise({ gui }) {
    this.noiseParams = {
      octaves: 10,
      persistence: 0.5,
      lacunarity: 1.6,
      exponentiation: 7.5,
      height: 2000.0,
      scale: 1800.0,
      seed: 1,
    };

    const onNoiseChanged = () => {
      this.builder.Rebuild(this.chunks);
    };

    const noiseRollup = gui.addFolder("Terrain.Noise");
    noiseRollup.add(this.noiseParams, "scale", 32.0, 4096.0).onChange(onNoiseChanged);
    noiseRollup.add(this.noiseParams, "octaves", 1, 20, 1).onChange(onNoiseChanged);
    noiseRollup.add(this.noiseParams, "persistence", 0.25, 1.0).onChange(onNoiseChanged);
    noiseRollup.add(this.noiseParams, "lacunarity", 0.01, 4.0).onChange(onNoiseChanged);
    noiseRollup.add(this.noiseParams, "exponentiation", 0.1, 10.0).onChange(onNoiseChanged);
    noiseRollup.add(this.noiseParams, "height", 0, 10000).onChange(onNoiseChanged);

    this.noise = new Noise(this.noiseParams);
  }

  InitBiomes({ gui }) {
    this.biomesParams = {
      octaves: 2,
      persistence: 0.5,
      lacunarity: 2.0,
      scale: 2048.0,
      noiseType: "simplex",
      seed: 2,
      exponentiation: 1,
      height: 1.0,
    };

    const onNoiseChanged = () => {
      this.builder.Rebuild(this.chunks);
    };

    const biomesRollup = gui.addFolder("Terrain.Biomes");
    biomesRollup.add(this.biomesParams, "scale", 64.0, 4096.0).onChange(onNoiseChanged);
    biomesRollup.add(this.biomesParams, "octaves", 1, 20, 1).onChange(onNoiseChanged);
    biomesRollup.add(this.biomesParams, "persistence", 0.01, 1.0).onChange(onNoiseChanged);
    biomesRollup.add(this.biomesParams, "lacunarity", 0.01, 4.0).onChange(onNoiseChanged);
    biomesRollup.add(this.biomesParams, "exponentiation", 0.1, 10.0).onChange(onNoiseChanged);

    this.biomes = new Noise(this.biomesParams);

    this.colourNoiseParams = {
      octaves: 1,
      persistence: 0.5,
      lacunarity: 2.0,
      exponentiation: 1.0,
      scale: 256.0,
      noiseType: "simplex",
      seed: 2,
      height: 1.0,
    };
    this.colourNoise = new Noise(this.colourNoiseParams);
  }

  InitTerrain({ scene, gui }) {
    this.terrainParams = {
      wireframe: false,
    };

    this.groups = [...new Array(6)].map((_) => new THREE.Group());
    scene.add(...this.groups);

    const terrainRollup = gui.addFolder("Terrain");
    terrainRollup.add(this.terrainParams, "wireframe").onChange(() => {
      for (let k in this.chunks) {
        this.chunks[k].chunk._plane.material.wireframe = this.terrainParams.wireframe;
      }
    });

    this.chunks = {};
  }

  CellIndex(p) {
    const xp = p.x + MIN_CELL_SIZE * 0.5;
    const yp = p.z + MIN_CELL_SIZE * 0.5;
    const x = Math.floor(xp / MIN_CELL_SIZE);
    const z = Math.floor(yp / MIN_CELL_SIZE);
    return [x, z];
  }

  CreateTerrainChunk(group, offset, width, resolution) {
    const params = {
      group: group,
      material: this.material,
      width: width,
      offset: offset,
      radius: PLANET_RADIUS,
      resolution: resolution,
      biomeGenerator: this.biomes,
      colourGenerator: new TextureSplatter({
        biomeGenerator: this.biomes,
        colourNoise: this.colourNoise,
      }),
      heightGenerators: [new HeightGenerator(this.noise, offset, 100000, 100000 + 1)],
      noiseParams: this.noiseParams,
      colourNoiseParams: this.colourNoiseParams,
      biomesParams: this.biomesParams,
      colourGeneratorParams: {
        biomeGeneratorParams: this.biomesParams,
        colourNoiseParams: this.colourNoiseParams,
      },
      heightGeneratorsParams: {
        min: 100000,
        max: 100000 + 1,
      },
    };

    return this.builder.AllocateChunk(params);
  }

  Update() {
    this.builder.Update();
    if (!this.builder.Busy) {
      this.UpdateVisibleChunks_Quadtree();
    }
  }

  UpdateVisibleChunks_Quadtree() {
    function Key(c) {
      return c.position[0] + "/" + c.position[1] + " [" + c.size + "] [" + c.index + "]";
    }

    const q = new CubeQuadTree({
      radius: PLANET_RADIUS,
      min_node_size: MIN_CELL_SIZE,
    });
    q.Insert(this.camera.position);

    const sides = q.GetChildren();

    let newTerrainChunks = {};
    const center = new THREE.Vector3();
    const dimensions = new THREE.Vector3();
    for (let i = 0; i < sides.length; i++) {
      this.groups[i].matrix = sides[i].transform;
      this.groups[i].matrixAutoUpdate = false;
      for (let c of sides[i].children) {
        c.bounds.getCenter(center);
        c.bounds.getSize(dimensions);

        const child = {
          index: i,
          group: this.groups[i],
          position: [center.x, center.y, center.z],
          bounds: c.bounds,
          size: dimensions.x,
        };

        const k = Key(child);
        newTerrainChunks[k] = child;
      }
    }

    const intersection = DictIntersection(this.chunks, newTerrainChunks);
    const difference = DictDifference(newTerrainChunks, this.chunks);
    const recycle = Object.values(DictDifference(this.chunks, newTerrainChunks));

    this.builder.RetireChunks(recycle);

    newTerrainChunks = intersection;

    for (let k in difference) {
      const [xp, yp, zp] = difference[k].position;

      const offset = new THREE.Vector3(xp, yp, zp);
      newTerrainChunks[k] = {
        position: [xp, zp],
        chunk: this.CreateTerrainChunk(difference[k].group, offset, difference[k].size, MIN_CELL_RESOLUTION),
      };
    }

    this.chunks = newTerrainChunks;
  }
}
