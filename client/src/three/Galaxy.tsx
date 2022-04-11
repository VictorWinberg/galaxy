import { useEffect, useLayoutEffect, useState } from "react";
import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { preloadFont } from "troika-three-text";
import Scene from "./Scene";
import QueryParams from "../ParamsPosition";
import { useParams } from "react-router-dom";
import MyAccount from "../my-profile";

type Point3D = {
  x: number;
  y: number;
  z: number;
};

function Galaxy() {
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer>();
  const [camera, setCamera] = useState<THREE.PerspectiveCamera>();
  const [controls, setControls] = useState<FlyControls>();
  const [position, setPosition] = useState<Point3D>();
  const [clock, setClock] = useState<THREE.Clock>();
  const params = useParams();
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

  preloadFont(
    {
      characters: "abcdefghijklmnopqrstuvwxyz",
    },
    () => setFontsLoaded(true)
  );

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
    const xyz = params?.location?.slice(1, -1).split(",").map(Number);
    if (xyz) camera.position.set(xyz[0], xyz[1], xyz[2]);
    setCamera(camera);

    // Controls
    const controls = new FlyControls(camera, renderer.domElement);
    controls.movementSpeed = 10;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = true;

    // Position
    const { x, y, z } = camera.position;
    setPosition({ x, y, z });
    controls.addEventListener("change", () => {
      const { x, y, z } = camera.position;
      setPosition({ x, y, z });
    });

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

  if (
    !renderer ||
    !camera ||
    !controls ||
    !clock ||
    !position ||
    !fontsLoaded
  ) {
    return <div>LOADING</div>;
  }

  return (
    <>
      <MyAccount></MyAccount>
      <QueryParams position={position} />
      <Scene
        renderer={renderer}
        camera={camera}
        controls={controls}
        clock={clock}
      />
    </>
  );
}

export default Galaxy;
