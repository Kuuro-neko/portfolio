import * as THREE from 'three';
import { InfiniteGrid } from './grid.js';

export function initScene() {
  // Get the canvas from the DOM
  const canvas = document.getElementById('three-bg');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Scene and camera
  const scene = new THREE.Scene();

  function setupCamera(camera, width, height) {
    const aspect = width / height;
    const gridHeight = 1;

    const fov = 75;
    camera.fov = fov;
    camera.aspect = aspect;
    camera.near = 0.01;
    camera.far = 20;
    camera.position.set(0, 0.1, 1.1);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  const camera = new THREE.PerspectiveCamera();
  setupCamera(camera, window.innerWidth, window.innerHeight);

  // Ambient light
  const ambientLight = new THREE.AmbientLight("#ffffff", 10);
  scene.add(ambientLight);

  // Grid
  let infiniteGrid = new InfiniteGrid(scene, camera, renderer);

  // Fog
  scene.fog = new THREE.Fog('#000000', 1, 2.5);
  scene.background = new THREE.Color(0x000000);
  scene.fog.color.set(0x000000);

  // Responsive resize
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    setupCamera(camera, window.innerWidth, window.innerHeight);
    infiniteGrid.resize();
    renderer.render(scene, camera);
  });

  renderer.render(scene, camera);
}