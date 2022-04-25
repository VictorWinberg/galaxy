import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import StatsModule from "three/examples/jsm/libs/stats.module";
import { generateNearbyChunks } from "./ChunkGenerator";

function Planet(props: any) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>();

  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (ref.current!.rotation.x += 0.01));

  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <sphereGeometry args={[2, 32, 16]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

function Stats() {
  const stats = useMemo(StatsModule, []);

  useFrame(() => stats.update());

  useEffect(() => {
    document.body.appendChild(stats.dom);
  }, []);

  return null;
}

const CameraController = () => {
  const { camera, gl } = useThree();
  const controls = useMemo(() => new FlyControls(camera, gl.domElement), []);
  const clock = useMemo(() => new THREE.Clock(), []);

  useEffect(() => {
    controls.movementSpeed = 10;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = true;
    return () => {
      controls.dispose();
    };
  }, [camera, gl]);

  useFrame(() => controls.update(clock.getDelta()));

  return null;
};
const Planets = () => {
  const { camera } = useThree();
  const pos = camera.position;
  const planets = generateNearbyChunks(pos.x, pos.y, pos.z);
  return <>{planets}</>;
};

function Galaxy() {
  return (
    <Canvas
      camera={{
        fov: 60,
        aspect: window.innerWidth / window.innerHeight,
        near: 1.0,
        far: 1000,
      }}
    >
      <CameraController />
      <ambientLight color={0x101010} />
      <directionalLight position={[20, 100, 10]} castShadow />
      <pointLight position={[10, 10, 10]} />
      <Planets />
      <Planet position={[0, 0, 5]} />
      <Planet position={[-1.2, 0, 0]} />
      <Planet position={[1.2, 0, 0]} />
      <Stats />
    </Canvas>
  );
}

export default Galaxy;
