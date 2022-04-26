import { useEffect, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { preloadFont } from "troika-three-text";
import Scene from "./Scene";
import ParamsPosition from "../ParamsPosition";
import ChatOverlay from "../chat/ChatOverlay";

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
  const [rotation, setRotation] = useState<Point3D>();
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
    const xyz = params?.location?.split(/[@,+]/).map(Number);
    if (xyz) {
      camera.position.set(xyz[1], xyz[2], xyz[3]);
      camera.rotation.set(xyz[4], xyz[5], xyz[6]);
    }
    setCamera(camera);

    // Controls
    const controls = new FlyControls(camera, renderer.domElement);
    controls.movementSpeed = 10;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = true;

    // Camera position and rotation
    controls.addEventListener("change", () => {
      const { x: px, y: py, z: pz } = camera.position;
      setPosition({ x: px, y: py, z: pz });
      const { x: rx, y: ry, z: rz } = camera.rotation;
      setRotation({ x: rx, y: ry, z: rz });
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

  if (!renderer || !camera || !controls || !clock || !fontsLoaded) {
    return <div>LOADING</div>;
  }

  return (
    <>
      <ParamsPosition position={position} rotation={rotation} />
      <ChatOverlay />
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
