import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { WEBGL } from "three/examples/jsm/WebGL.js";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";

import { scattering_shader } from "./scattering-shader.js";

export default class Graphics {
  Initialize(props) {
    if (!WEBGL.isWebGL2Available()) {
      return false;
    }

    this._threejs = props.renderer;
    this._camera = props.camera;
    this._scene = props.scene;
    this._scene.background = new THREE.Color(0xaaaaaa);

    this._stats = new Stats();

    window.addEventListener(
      "resize",
      () => {
        this._OnWindowResize();
      },
      false
    );

    const renderPass = new RenderPass(this._scene, this._camera);
    const fxaaPass = new ShaderPass(FXAAShader);
    // const depthPass = new ShaderPass(scattering_shader.Shader);

    // this._depthPass = depthPass;

    this._composer = new EffectComposer(this._threejs);
    this._composer.addPass(renderPass);
    this._composer.addPass(fxaaPass);
    //this._composer.addPass(depthPass);

    this._target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    this._target.texture.format = THREE.RGBFormat;
    this._target.texture.minFilter = THREE.NearestFilter;
    this._target.texture.magFilter = THREE.NearestFilter;
    this._target.texture.generateMipmaps = false;
    this._target.stencilBuffer = false;
    this._target.depthBuffer = true;
    this._target.depthTexture = new THREE.DepthTexture();
    this._target.depthTexture.format = THREE.DepthFormat;
    this._target.depthTexture.type = THREE.FloatType;

    this._threejs.setRenderTarget(this._target);

    this._postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this._depthPass = new THREE.ShaderMaterial({
      vertexShader: scattering_shader.VS,
      fragmentShader: scattering_shader.PS,
      uniforms: {
        cameraNear: { value: this.Camera.near },
        cameraFar: { value: this.Camera.far },
        cameraPosition: { value: this.Camera.position },
        cameraForward: { value: null },
        tDiffuse: { value: null },
        tDepth: { value: null },
        inverseProjection: { value: null },
        inverseView: { value: null },
        planetPosition: { value: null },
        planetRadius: { value: null },
        atmosphereRadius: { value: null },
      },
    });
    var postPlane = new THREE.PlaneBufferGeometry(2, 2);
    var postQuad = new THREE.Mesh(postPlane, this._depthPass);
    this._postScene = new THREE.Scene();
    this._postScene.add(postQuad);

    this._CreateLights();

    return true;
  }

  _CreateLights() {
    let light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(100, 100, -100);
    light.target.position.set(0, 0, 0);
    light.castShadow = false;
    this._scene.add(light);

    light = new THREE.DirectionalLight(0x404040, 1);
    light.position.set(100, 100, -100);
    light.target.position.set(0, 0, 0);
    light.castShadow = false;
    this._scene.add(light);

    light = new THREE.DirectionalLight(0x404040, 1);
    light.position.set(100, 100, -100);
    light.target.position.set(0, 0, 0);
    light.castShadow = false;
    this._scene.add(light);

    light = new THREE.DirectionalLight(0x202040, 1);
    light.position.set(100, -100, 100);
    light.target.position.set(0, 0, 0);
    light.castShadow = false;
    this._scene.add(light);

    light = new THREE.AmbientLight(0xffffff, 1.0);
    this._scene.add(light);
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
    this._composer.setSize(window.innerWidth, window.innerHeight);
    this._target.setSize(window.innerWidth, window.innerHeight);
  }

  get Scene() {
    return this._scene;
  }

  get Camera() {
    return this._camera;
  }

  Render(timeInSeconds) {
    this._threejs.setRenderTarget(this._target);

    this._threejs.clear();
    this._threejs.render(this._scene, this._camera);
    //this._composer.render();

    this._threejs.setRenderTarget(null);

    const forward = new THREE.Vector3();
    this._camera.getWorldDirection(forward);

    this._depthPass.uniforms.inverseProjection.value = this._camera.projectionMatrixInverse;
    this._depthPass.uniforms.inverseView.value = this._camera.matrixWorld;
    this._depthPass.uniforms.tDiffuse.value = this._target.texture;
    this._depthPass.uniforms.tDepth.value = this._target.depthTexture;
    this._depthPass.uniforms.cameraNear.value = this._camera.near;
    this._depthPass.uniforms.cameraFar.value = this._camera.far;
    this._depthPass.uniforms.cameraPosition.value = this._camera.position;
    this._depthPass.uniforms.cameraForward.value = forward;
    this._depthPass.uniforms.planetPosition.value = new THREE.Vector3(0, 0, 0);
    this._depthPass.uniforms.planetRadius.value = 4000.0;
    this._depthPass.uniforms.atmosphereRadius.value = 4400.0;
    this._depthPass.uniformsNeedUpdate = true;

    this._threejs.render(this._postScene, this._postCamera);

    this._stats.update();
  }
}
