import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { generateNearbyChunks } from "./ChunkGenerator";
import type { Mesh } from "three";
import { randomizeName } from "../nameGenerator/utils";
import { Text } from "troika-three-text";
import { MOVE_OFFSET } from "./constants";

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
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const scene = useMemo(() => new THREE.Scene(), []);

  const onPointerMove = (event: any) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects && intersects.length) {
      const first = intersects[0].object.position;
      camera.position.set(
        first.x + MOVE_OFFSET,
        first.y + MOVE_OFFSET,
        first.z + MOVE_OFFSET
      );
      camera.lookAt(first.x, first.y, first.z);
    }
  };

  window.addEventListener("click", onPointerMove);

  useEffect(() => {
    ref.current!.firstChild!.replaceWith(renderer.domElement);

    // Lights
    const light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(20, 100, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    // light.shadow.bias = -0.001;
    // light.shadow.mapSize.width = 2048;
    // light.shadow.mapSize.height = 2048;
    // light.shadow.camera.near = 0.1;
    // light.shadow.camera.far = 500.0;
    // light.shadow.camera.near = 0.5;
    // light.shadow.camera.far = 500.0;
    // light.shadow.camera.left = 100;
    // light.shadow.camera.right = -100;
    // light.shadow.camera.top = 100;
    // light.shadow.camera.bottom = -100;
    scene.add(light);

    // Meshes
    const sphereZero = new THREE.Mesh(
      new THREE.SphereGeometry(2, 32, 16),
      new THREE.MeshStandardMaterial({
        color: 0x00ccaa,
      })
    );
    sphereZero.position.set(0, -2.5, -1);
    sphereZero.castShadow = true;
    sphereZero.receiveShadow = true;
    camera.add(sphereZero);
    scene.add(camera);

    var wireframe = new THREE.LineSegments(
      new THREE.EdgesGeometry(sphereZero.geometry),
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    sphereZero.add(wireframe);

    var stats = Stats();
    document.body.appendChild(stats.dom);

    // Animation
    const animate = function () {
      const { x, y, z } = camera.position;
      const spheres: Mesh[] = generateNearbyChunks(x, y, z);

      spheres.forEach((sphere) => {
        const sphereText = generateText(sphere);
        scene.add(sphere);
        scene.add(sphereText);
      });

      controls.update(clock.getDelta());
      renderer.render(scene, camera);
      stats.update();
      frameId.current = requestAnimationFrame(animate);
    };
    frameId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId.current);
  }, [renderer, camera, controls, clock, scene]);

  return (
    <div id="scene" ref={ref}>
      <canvas />
    </div>
  );
}

export default Scene;
