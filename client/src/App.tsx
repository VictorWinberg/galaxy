import { useEffect, useLayoutEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import UI from "./UI";
import Scene from "./Scene";

function App() {
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer>();
  const [camera, setCamera] = useState<THREE.PerspectiveCamera>();

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
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();
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

  if (!renderer || !camera) return null;

  return (
    <>
      <UI/>
      <Scene renderer={renderer} camera={camera} />
    </>
  );
}

export default App;
