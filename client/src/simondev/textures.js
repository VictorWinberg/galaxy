import * as THREE from "three";

// Taken from https://github.com/mrdoob/three.js/issues/758
function GetImageData(image) {
  var canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  var context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);

  return context.getImageData(0, 0, image.width, image.height);
}

export class TextureAtlas {
  constructor() {
    this.Create();
    this.onLoad = () => {};
  }

  Load(atlas, names) {
    this.LoadAtlas(atlas, names);
  }

  Create() {
    this.manager = new THREE.LoadingManager();
    this.loader = new THREE.TextureLoader(this.manager);
    this.textures = {};

    this.manager.onLoad = () => {
      this.OnLoad();
    };
  }

  get Info() {
    return this.textures;
  }

  OnLoad() {
    for (let k in this.textures) {
      const atlas = this.textures[k];
      const data = new Uint8Array(atlas.textures.length * 4 * 1024 * 1024);

      for (let t = 0; t < atlas.textures.length; t++) {
        const curTexture = atlas.textures[t];
        const curData = GetImageData(curTexture.image);
        const offset = t * (4 * 1024 * 1024);

        data.set(curData.data, offset);
      }

      const diffuse = new THREE.DataTexture2DArray(data, 1024, 1024, atlas.textures.length);
      diffuse.format = THREE.RGBAFormat;
      diffuse.type = THREE.UnsignedByteType;
      diffuse.minFilter = THREE.LinearMipMapLinearFilter;
      diffuse.magFilter = THREE.LinearFilter;
      diffuse.wrapS = THREE.RepeatWrapping;
      diffuse.wrapT = THREE.RepeatWrapping;
      diffuse.generateMipmaps = true;

      diffuse.anisotropy = 4;

      atlas.atlas = diffuse;
    }

    this.onLoad();
  }

  LoadAtlas(atlas, names) {
    this.textures[atlas] = {
      textures: names.map((n) => this.loader.load(n)),
    };
  }
}
