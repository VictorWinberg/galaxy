import * as THREE from "three";
import { GUI } from "dat.gui";
import { controls } from "./controls.js";
import Game from "./game.js";
import TerrainChunkManager from "./terrain.js";

export default class ProceduralTerrain extends Game {
  _OnInitialize() {
    this._CreateGUI();

    this._graphics.Camera.position.set(0, 0, 10000);
    this._graphics.Camera.quaternion.set(0, 0, 0, 0);

    this._entities["_terrain"] = new TerrainChunkManager({
      camera: this._graphics.Camera,
      scene: this._graphics.Scene,
      gui: this._gui,
      guiParams: this._guiParams,
      game: this,
    });

    this._entities["_controls"] = new controls.FPSControls({
      camera: this._graphics.Camera,
      scene: this._graphics.Scene,
      domElement: this._graphics._threejs.domElement,
      gui: this._gui,
      guiParams: this._guiParams,
    });

    this._totalTime = 0;

    this._LoadBackground();
  }

  _CreateGUI() {
    this._guiParams = {
      general: {},
    };
    this._gui = new GUI();
  }

  _LoadBackground() {
    this._graphics.Scene.background = new THREE.Color(0x000000);
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      "/galaxy/resources/space-posx.jpg",
      "/galaxy/resources/space-negx.jpg",
      "/galaxy/resources/space-posy.jpg",
      "/galaxy/resources/space-negy.jpg",
      "/galaxy/resources/space-posz.jpg",
      "/galaxy/resources/space-negz.jpg",
    ]);
    this._graphics._scene.background = texture;
  }

  _OnStep(timeInSeconds) {}
}
