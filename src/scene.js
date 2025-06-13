import { createNoise2D } from 'simplex-noise';
import * as THREE from 'three';
import { InfiniteGrid } from './grid.js';

const noise2D = createNoise2D();

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
    const distance = 0.1; // Move camera closer (was 0.5)
    const gridHeight = 1;

    const fov = 2 * THREE.MathUtils.radToDeg(Math.atan((gridHeight / 2) / distance));
    camera.fov = fov;
    camera.aspect = aspect;
    camera.near = distance;
    camera.far = 1000;
    camera.position.set(0, -0.01, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  const camera = new THREE.PerspectiveCamera();
  setupCamera(camera, window.innerWidth, window.innerHeight);

  // Grid
  let infiniteGrid = new InfiniteGrid(scene, camera, renderer);

  // Responsive resize
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    setupCamera(camera, window.innerWidth, window.innerHeight);
    infiniteGrid.resize();
    renderer.render(scene, camera);
  });

  renderer.render(scene, camera);
}