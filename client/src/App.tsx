import { useEffect, useLayoutEffect, useState } from "react";
import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { GUI } from "dat.gui";
import UI from "./UI";
import Scene from "./Scene";

function App() {
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer>();
  const [camera, setCamera] = useState<THREE.PerspectiveCamera>();
  const [gui, setGUI] = useState<dat.GUI>();
  const [controls, setControls] = useState<FlyControls>();
  const [clock, setClock] = useState<THREE.Clock>();

  useEffect(() => {
    // WebGLRenderer
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", { alpha: false });
    if (!context) throw Error("WebGL2 is not supported");
    const renderer = new THREE.WebGLRenderer({
      canvas,
      context,
      antialias: true,
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    setRenderer(renderer);

    // Camera
    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 100000.0;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 10000);
    // camera.quaternion.set(0, 0, 0, 0);
    setCamera(camera);

    // Controls
    const controls = new FlyControls(camera, renderer.domElement);
    controls.movementSpeed = 1000;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = true;
    setControls(controls);

    // GUI
    const gui = new GUI();
    const cameraFolder = gui.addFolder("Camera");
    cameraFolder.add(camera.position, "x", -1000000, 1000000);
    cameraFolder.add(camera.position, "y", -1000000, 1000000);
    cameraFolder.add(camera.position, "z", -1000000, 1000000);
    setGUI(gui);

    const clock = new THREE.Clock();
    setClock(clock);
  }, []);

  useLayoutEffect(() => {
    function OnWindowResize() {
      if (!renderer || !camera) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", OnWindowResize);

    return () => window.removeEventListener("resize", OnWindowResize);
  }, [camera, renderer]);

  if (!renderer || !camera || !controls || !clock || !gui) return null;

  return (
    <>
      <UI />
      <Scene
        renderer={renderer}
        camera={camera}
        controls={controls}
        gui={gui}
        clock={clock}
      />
    </>
  );
}

export default App;
