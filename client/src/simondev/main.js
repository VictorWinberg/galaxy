import { GUI } from "dat.gui";
import TerrainChunkManager from "./terrain.js";

export default class ProceduralTerrain {
  constructor(props) {
    this.Initialize(props);
  }

  Initialize(props) {
    this._CreateGUI();

    this._threejs = props.renderer;
    this._camera = props.camera;
    this._scene = props.scene;

    this._camera.position.set(0, 0, 10000);
    this._camera.quaternion.set(0, 0, 0, 0);

    this._terrain = new TerrainChunkManager({
      camera: this._camera,
      scene: this._scene,
      gui: this._gui,
      guiParams: this._guiParams,
      game: this,
    });
  }

  _CreateGUI() {
    this._guiParams = {
      general: {},
    };
    this._gui = new GUI();
  }
}
