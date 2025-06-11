import * as THREE from 'three';

export function initScene() {
  // Get the canvas from the DOM
  const canvas = document.getElementById('three-bg');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Scene and camera
  const scene = new THREE.Scene();

  // Calculate box size to match viewport aspect ratio
  function getBoxSize(width, height) {
    const aspect = width / height;
    return { w: aspect, h: 1 };
  }

  // Camera setup so that the front face fills the screen
  function setupCameraAndBox(camera, box, width, height) {
    const aspect = width / height;
    const distance = 0.5; // distance from camera to front face
    const boxHeight = 1;
    const boxWidth = aspect;

    // Update box geometry
    box.geometry.dispose();
    box.geometry = new THREE.BoxGeometry(boxWidth, boxHeight, 1);

    // FOV so that the box's height fits the screen at z=0.5
    const fov = 2 * THREE.MathUtils.radToDeg(Math.atan((boxHeight / 2) / distance));
    camera.fov = fov;
    camera.aspect = aspect;
    camera.near = distance;
    camera.far = 1000;
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  // Initial box with placeholder geometry, will be replaced in setupCameraAndBox
  const initialGeometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00bfff, wireframe: true });
  const box = new THREE.Mesh(initialGeometry, material);
  scene.add(box);

  const camera = new THREE.PerspectiveCamera();
  setupCameraAndBox(camera, box, window.innerWidth, window.innerHeight);

  // Responsive resize
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    setupCameraAndBox(camera, box, window.innerWidth, window.innerHeight);
  });

  // Render once, no animation or rotation
  box.rotation.x = 0;
  box.rotation.y = 0;
  box.rotation.z = 0;
  renderer.render(scene, camera);
}