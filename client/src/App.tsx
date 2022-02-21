import { useEffect, useLayoutEffect, useState } from "react";
import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import UI from "./UI";
import Scene from "./Scene";

function App() {
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer>();
  const [camera, setCamera] = useState<THREE.PerspectiveCamera>();
  const [controls, setControls] = useState<FlyControls>();
  const [clock, setClock] = useState<THREE.Clock>();

  useEffect(() => {
    // WebGLRenderer
    const renderer = new THREE.WebGLRenderer({
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
    const near = 1.0;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 2, 5);
    setCamera(camera);

    // Controls
    const controls = new FlyControls(camera, renderer.domElement);
    controls.movementSpeed = 10;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = false;

    const clock = new THREE.Clock();

    setControls(controls);
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

  if (!renderer || !camera || !controls || !clock) return null;

  return (
    <>
      <UI />
      <Scene
        renderer={renderer}
        camera={camera}
        controls={controls}
        clock={clock}
      />
    </>
  );
}

export default App;
