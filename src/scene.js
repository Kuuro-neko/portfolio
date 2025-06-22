import * as THREE from 'three';
import { InfiniteGrid } from './grid.js';

export var sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  aspect: window.innerWidth / window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2)
};

const darkTheme = {
  fog: '#030101',
  spotlight: '#8B3030',
  ambientLight: '#ffffff',
  circle: '#BE5E4E'
};

const lightTheme = {
  fog: '#ffffff',
  spotlight: '#D3B5BAFF',
  ambientLight: '#000000',
  circle: '#FF7F7F'
};

export var colors = darkTheme;

const scene = new THREE.Scene();
var ambientLight;
var spotlight;
var spotlight2;
var circle;
var infiniteGrid;
var currentTheme = "dark";

export function changeTheme(theme) {
  if (theme === currentTheme) return;
  currentTheme = theme;
  if (currentTheme === 'dark') {
    colors = darkTheme;
    infiniteGrid.changeTheme(currentTheme);
  } else if (currentTheme === 'light') {
    colors = lightTheme;
    infiniteGrid.changeTheme(currentTheme);
  }
  scene.fog.color.set(colors.fog);
  scene.background = new THREE.Color(colors.fog);
  spotlight.color.set(colors.spotlight);
  spotlight2.color.set(colors.spotlight);
  circle.material.color.set(colors.circle);
  circle.material.needsUpdate = true;
  ambientLight.color.set(colors.ambientLight);
}

export function initScene() {
  // Get the canvas from the DOM
  const canvas = document.getElementById('three-bg');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Scene and camera
  function setupCamera(camera, width, height) {
    const aspect = width / height;

    const fov = 75;
    camera.fov = fov;
    camera.aspect = aspect;
    camera.near = 0.01;
    camera.far = 20;
    camera.position.set(0, 0.1, 1.0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  const camera = new THREE.PerspectiveCamera();
  setupCamera(camera, window.innerWidth, window.innerHeight);

  // Ambient light
  ambientLight = new THREE.AmbientLight(colors.ambientLight, 10);
  scene.add(ambientLight);

  // Spotlights
  // Right Spotlight
  spotlight = new THREE.SpotLight(colors.spotlight, 200, 25, Math.PI * 0.1, 0.25);
  spotlight.position.set(0.5, 0.75, 2.2);
  spotlight.target.position.x = -0.25;
  spotlight.target.position.y = 0.25;
  spotlight.target.position.z = 0.25;
  scene.add(spotlight);
  scene.add(spotlight.target);

  // Left Spotlight
  spotlight2 = new THREE.SpotLight(colors.spotlight, 200, 25, Math.PI * 0.1, 0.25);
  spotlight2.position.set(-0.5, 0.75, 2.2);
  spotlight2.target.position.x = 0.25;
  spotlight2.target.position.y = 0.25;
  spotlight2.target.position.z = 0.25;
  scene.add(spotlight2);
  scene.add(spotlight2.target);

  // Grid
  infiniteGrid = new InfiniteGrid(scene, camera, renderer);

  // Fog #030101FF
  scene.fog = new THREE.Fog(colors.fog, 1, 2.5);
  scene.background = new THREE.Color(colors.fog);
  scene.fog.color.set(colors.fog);

  const size = 0.25;
  const circleGeometry = new THREE.CircleGeometry(size, 64);
  const circleMaterial = new THREE.MeshBasicMaterial({ color: colors.circle, side: THREE.FrontSide });
  circle = new THREE.Mesh(circleGeometry, circleMaterial);
  circle.position.set(0, 0.0, -1.1);
  scene.add(circle);

  // Responsive resize
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    setupCamera(camera, window.innerWidth, window.innerHeight);
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    sizes.aspect = window.innerWidth / window.innerHeight;
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);
    infiniteGrid.resize();
    infiniteGrid.render();
  });

  infiniteGrid.render();
}