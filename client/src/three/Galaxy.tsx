import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import StatsModule from "three/examples/jsm/libs/stats.module";
import { useParamsPosition, Point3D } from "../ParamsPosition";
import {
  Location,
  NavigateFunction,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Planets from "./Planets";

function Stats() {
  const stats = useMemo(StatsModule, []);

  useFrame(() => stats.update());

  useEffect(() => {
    document.body.appendChild(stats.dom);
  }, []);

  return null;
}

type CameraProps = {
  navigate: NavigateFunction;
  location: Location;
};

const CameraController = ({ navigate, location }: CameraProps) => {
  const { camera, gl } = useThree();
  const controls = useMemo(() => new FlyControls(camera, gl.domElement), []);
  const clock = useMemo(() => new THREE.Clock(), []);
  const [position, setPosition] = useState<Point3D>();
  const [rotation, setRotation] = useState<Point3D>();

  useParamsPosition({ navigate, location, position, rotation });

  useEffect(() => {
    controls.movementSpeed = 10;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = true;

    const handleChange = () => {
      const { x: px, y: py, z: pz } = camera.position;
      setPosition({ x: px, y: py, z: pz });
      const { x: rx, y: ry, z: rz } = camera.rotation;
      setRotation({ x: rx, y: ry, z: rz });
    };

    controls.addEventListener("change", handleChange);

    return () => {
      controls.dispose();
      controls.removeEventListener("change", handleChange);
    };
  }, [camera, gl]);

  useFrame(() => controls.update(clock.getDelta()));

  return null;
};

function Galaxy() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Canvas
      camera={{
        fov: 60,
        aspect: window.innerWidth / window.innerHeight,
        near: 1.0,
        far: 1000,
      }}
    >
      <CameraController navigate={navigate} location={location} />
      <ambientLight color={0x101010} />
      <directionalLight position={[20, 100, 10]} castShadow />
      <Planets />
      <Stats />
    </Canvas>
  );
}

export default Galaxy;
