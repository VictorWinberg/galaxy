import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
};

function Scene({ renderer, camera }: Props) {
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
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100, 10, 10),
      new THREE.MeshStandardMaterial({
        color: 0xffffaa,
      })
    );
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.position.set(0, -3, 0);
    plane.rotation.set(-Math.PI / 2, 0, 0);
    scene.add(plane);

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(2, 32, 16),
      new THREE.MeshStandardMaterial({
        color: 0x00ccaa,
      })
    );
    sphere.position.set(0, 0, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);

    var wireframe = new THREE.LineSegments(
      new THREE.EdgesGeometry(sphere.geometry),
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    sphere.add(wireframe);

    // Animation
    const animate = function () {
      sphere.rotation.x += 0.001;
      sphere.rotation.y += 0.001;
      renderer.render(scene, camera);
      frameId.current = requestAnimationFrame(animate);
    };
    frameId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId.current);
  }, [renderer, camera]);

  return (
    <div id="scene" ref={ref}>
      <canvas />
    </div>
  );
}

export default Scene;
