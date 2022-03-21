import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { generateNearbyChunks, getChunkId } from "./ChunkGenerator";
import type { Mesh } from "three";
import { randomizeName } from "./utils";
// @ts-ignore
import { Text } from "troika-three-text";

type Props = {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  controls: FlyControls;
  clock: THREE.Clock;
};

const generateText = (sphere: THREE.Mesh) => {
  const sphereName = new Text();

  // Set properties to configure:
  sphereName.text = randomizeName(
    `${sphere.position.x},${sphere.position.y},${sphere.position.z}`
  );
  sphereName.fontSize = 0.6;
  sphereName.position.y = sphere.position.y + 3;
  sphereName.position.x = sphere.position.x - 1;
  sphereName.position.z = sphere.position.z;
  sphereName.color = 0x9966ff;
  return sphereName;
};

function Scene({ renderer, camera, controls, clock }: Props) {
  const frameId = useRef(-1);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current!.firstChild!.replaceWith(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();

    // Lights
    const light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(20, 100, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    scene.add(light);

    const ambLight = new THREE.AmbientLight(0x101010);
    scene.add(ambLight);

    // Meshes
    const sphereZero = new THREE.Mesh(
      new THREE.SphereGeometry(2, 32, 16),
      new THREE.MeshStandardMaterial({
        color: 0x00ccaa,
      })
    );
    sphereZero.position.set(0, 0, 0);
    sphereZero.castShadow = true;
    sphereZero.receiveShadow = true;
    const sphereZeroText = generateText(sphereZero);
    scene.add(sphereZero);
    scene.add(sphereZeroText);

    var wireframe = new THREE.LineSegments(
      new THREE.EdgesGeometry(sphereZero.geometry),
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    sphereZero.add(wireframe);

    // Animation
    const animate = function () {
      sphereZero.rotation.x += 0.001;
      sphereZero.rotation.y += 0.001;
      const { x, y, z } = camera.position;
      const spheres: Mesh[] = generateNearbyChunks(x, y, z);
      spheres.forEach((sphere) => {
        const sphereText = generateText(sphere);
        scene.add(sphere);
        scene.add(sphereText);
      });

      controls.update(clock.getDelta());
      renderer.render(scene, camera);
      frameId.current = requestAnimationFrame(animate);
    };
    frameId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId.current);
  }, [renderer, camera, controls, clock]);

  return (
    <div id="scene" ref={ref}>
      <canvas />
    </div>
  );
}

export default Scene;
