import * as THREE from "three";

import { Noise } from "./noise.js";
import { CubeQuadTree } from "./quadtree.js";
import { terrain_shader } from "./terrain-shader.js";
import TerrainChunkRebuilderThreaded from "./terrain-builder-threaded.js";
import { texture_splatter } from "./texture-splatter.js";
import { textures } from "./textures.js";
import { utils } from "./utils.js";

const _MIN_CELL_SIZE = 250;
const _MIN_CELL_RESOLUTION = 64;
const _PLANET_RADIUS = 4000;

export default class TerrainChunkManager {
  constructor(params) {
    this._Init(params);
  }

  _Init(params) {
    this._params = params;

    const loader = new THREE.TextureLoader();

    const noiseTexture = loader.load("/galaxy/resources/simplex-noise.png");
    noiseTexture.wrapS = THREE.RepeatWrapping;
    noiseTexture.wrapT = THREE.RepeatWrapping;

    const diffuse = new textures.TextureAtlas(params);
    diffuse.Load("diffuse", [
      "/galaxy/resources/dirt_01_diffuse-1024.png",
      "/galaxy/resources/grass1-albedo3-1024.png",
      "/galaxy/resources/sandyground-albedo-1024.png",
      "/galaxy/resources/worn-bumpy-rock-albedo-1024.png",
      "/galaxy/resources/rock-snow-ice-albedo-1024.png",
      "/galaxy/resources/snow-packed-albedo-1024.png",
      "/galaxy/resources/rough-wet-cobble-albedo-1024.png",
      "/galaxy/resources/sandy-rocks1-albedo-1024.png",
    ]);
    diffuse.onLoad = () => {
      this._material.uniforms.diffuseMap.value = diffuse.Info["diffuse"].atlas;
    };

    const normal = new textures.TextureAtlas(params);
    normal.Load("normal", [
      "/galaxy/resources/dirt_01_normal-1024.jpg",
      "/galaxy/resources/grass1-normal-1024.jpg",
      "/galaxy/resources/sandyground-normal-1024.jpg",
      "/galaxy/resources/worn-bumpy-rock-normal-1024.jpg",
      "/galaxy/resources/rock-snow-ice-normal-1024.jpg",
      "/galaxy/resources/snow-packed-normal-1024.jpg",
      "/galaxy/resources/rough-wet-cobble-normal-1024.jpg",
      "/galaxy/resources/sandy-rocks1-normal-1024.jpg",
    ]);
    normal.onLoad = () => {
      this._material.uniforms.normalMap.value = normal.Info["normal"].atlas;
    };

    this._material = new THREE.MeshStandardMaterial({
      wireframe: false,
      wireframeLinewidth: 1,
      color: 0xffffff,
      side: THREE.FrontSide,
      vertexColors: THREE.VertexColors,
      // normalMap: texture,
    });

    this._material = new THREE.RawShaderMaterial({
      uniforms: {
        diffuseMap: {},
        normalMap: {},
        noiseMap: {
          value: noiseTexture,
        },
      },
      vertexShader: terrain_shader.VS,
      fragmentShader: terrain_shader.PS,
      side: THREE.FrontSide,
    });

    this._builder = new TerrainChunkRebuilderThreaded();

    this._InitNoise(params);
    this._InitBiomes(params);
    this._InitTerrain(params);
  }

  _InitNoise(params) {
    params.guiParams.noise = {
      octaves: 10,
      persistence: 0.5,
      lacunarity: 1.6,
      exponentiation: 7.5,
      height: 900.0,
      scale: 1800.0,
      seed: 1,
    };

    const onNoiseChanged = () => {
      this._builder.Rebuild(this._chunks);
    };

    const noiseRollup = params.gui.addFolder("Terrain.Noise");
    noiseRollup.add(params.guiParams.noise, "scale", 32.0, 4096.0).onChange(onNoiseChanged);
    noiseRollup.add(params.guiParams.noise, "octaves", 1, 20, 1).onChange(onNoiseChanged);
    noiseRollup.add(params.guiParams.noise, "persistence", 0.25, 1.0).onChange(onNoiseChanged);
    noiseRollup.add(params.guiParams.noise, "lacunarity", 0.01, 4.0).onChange(onNoiseChanged);
    noiseRollup.add(params.guiParams.noise, "exponentiation", 0.1, 10.0).onChange(onNoiseChanged);
    noiseRollup.add(params.guiParams.noise, "height", 0, 20000).onChange(onNoiseChanged);

    this._noise = new Noise(params.guiParams.noise);
    this._noiseParams = params.guiParams.noise;

    params.guiParams.heightmap = {
      height: 16,
    };

    const heightmapRollup = params.gui.addFolder("Terrain.Heightmap");
    heightmapRollup.add(params.guiParams.heightmap, "height", 0, 128).onChange(onNoiseChanged);
  }

  _InitBiomes(params) {
    params.guiParams.biomes = {
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
      this._builder.Rebuild(this._chunks);
    };

    const noiseRollup = params.gui.addFolder("Terrain.Biomes");
    noiseRollup.add(params.guiParams.biomes, "scale", 64.0, 4096.0).onChange(onNoiseChanged);
    noiseRollup.add(params.guiParams.biomes, "octaves", 1, 20, 1).onChange(onNoiseChanged);
    noiseRollup.add(params.guiParams.biomes, "persistence", 0.01, 1.0).onChange(onNoiseChanged);
    noiseRollup.add(params.guiParams.biomes, "lacunarity", 0.01, 4.0).onChange(onNoiseChanged);
    noiseRollup.add(params.guiParams.biomes, "exponentiation", 0.1, 10.0).onChange(onNoiseChanged);

    this._biomes = new Noise(params.guiParams.biomes);
    this._biomesParams = params.guiParams.biomes;

    const colourParams = {
      octaves: 1,
      persistence: 0.5,
      lacunarity: 2.0,
      exponentiation: 1.0,
      scale: 256.0,
      noiseType: "simplex",
      seed: 2,
      height: 1.0,
    };
    this._colourNoise = new Noise(colourParams);
    this._colourNoiseParams = colourParams;
  }

  _InitTerrain(params) {
    params.guiParams.terrain = {
      wireframe: false,
    };

    this._groups = [...new Array(6)].map((_) => new THREE.Group());
    params.scene.add(...this._groups);

    const terrainRollup = params.gui.addFolder("Terrain");
    terrainRollup.add(params.guiParams.terrain, "wireframe").onChange(() => {
      for (let k in this._chunks) {
        this._chunks[k].chunk._plane.material.wireframe = params.guiParams.terrain.wireframe;
      }
    });

    this._chunks = {};
    this._params = params;
  }

  _CellIndex(p) {
    const xp = p.x + _MIN_CELL_SIZE * 0.5;
    const yp = p.z + _MIN_CELL_SIZE * 0.5;
    const x = Math.floor(xp / _MIN_CELL_SIZE);
    const z = Math.floor(yp / _MIN_CELL_SIZE);
    return [x, z];
  }

  _CreateTerrainChunk(group, offset, width, resolution) {
    const params = {
      group: group,
      material: this._material,
      width: width,
      offset: offset,
      radius: _PLANET_RADIUS,
      resolution: resolution,
      biomeGenerator: this._biomes,
      colourGenerator: new texture_splatter.TextureSplatter({
        biomeGenerator: this._biomes,
        colourNoise: this._colourNoise,
      }),
      heightGenerators: [new texture_splatter.HeightGenerator(this._noise, offset, 100000, 100000 + 1)],
      noiseParams: this._noiseParams,
      colourNoiseParams: this._colourNoiseParams,
      biomesParams: this._biomesParams,
      colourGeneratorParams: {
        biomeGeneratorParams: this._biomesParams,
        colourNoiseParams: this._colourNoiseParams,
      },
      heightGeneratorsParams: {
        min: 100000,
        max: 100000 + 1,
      },
    };

    return this._builder.AllocateChunk(params);
  }

  Update(_) {
    this._builder.Update();
    if (!this._builder.Busy) {
      this._UpdateVisibleChunks_Quadtree();
    }
  }

  _UpdateVisibleChunks_Quadtree() {
    function _Key(c) {
      return c.position[0] + "/" + c.position[1] + " [" + c.size + "]" + " [" + c.index + "]";
    }

    const q = new CubeQuadTree({
      radius: _PLANET_RADIUS,
      min_node_size: _MIN_CELL_SIZE,
    });
    q.Insert(this._params.camera.position);

    const sides = q.GetChildren();

    let newTerrainChunks = {};
    const center = new THREE.Vector3();
    const dimensions = new THREE.Vector3();
    for (let i = 0; i < sides.length; i++) {
      this._groups[i].matrix = sides[i].transform;
      this._groups[i].matrixAutoUpdate = false;
      for (let c of sides[i].children) {
        c.bounds.getCenter(center);
        c.bounds.getSize(dimensions);

        const child = {
          index: i,
          group: this._groups[i],
          position: [center.x, center.y, center.z],
          bounds: c.bounds,
          size: dimensions.x,
        };

        const k = _Key(child);
        newTerrainChunks[k] = child;
      }
    }

    const intersection = utils.DictIntersection(this._chunks, newTerrainChunks);
    const difference = utils.DictDifference(newTerrainChunks, this._chunks);
    const recycle = Object.values(utils.DictDifference(this._chunks, newTerrainChunks));

    this._builder.RetireChunks(recycle);

    newTerrainChunks = intersection;

    for (let k in difference) {
      const [xp, yp, zp] = difference[k].position;

      const offset = new THREE.Vector3(xp, yp, zp);
      newTerrainChunks[k] = {
        position: [xp, zp],
        chunk: this._CreateTerrainChunk(difference[k].group, offset, difference[k].size, _MIN_CELL_RESOLUTION),
      };
    }

    this._chunks = newTerrainChunks;
  }
}
