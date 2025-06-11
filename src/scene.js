import * as THREE from 'three';

export function initScene() {
  // Get the canvas from the DOM
  const canvas = document.getElementById('three-bg');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Scene and camera
  const scene = new THREE.Scene();

  // Camera setup so that the grid fills the screen
  function setupCamera(camera, width, height) {
    const aspect = width / height;
    const distance = 0.1; // Move camera closer (was 0.5)
    const gridHeight = 1;
    const gridWidth = aspect;

    // FOV so that the grid's height fits the screen at z=distance
    const fov = 2 * THREE.MathUtils.radToDeg(Math.atan((gridHeight / 2) / distance));
    camera.fov = fov;
    camera.aspect = aspect;
    camera.near = distance;
    camera.far = 1000;
    camera.position.set(0, -0.01, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  const gridRows = 48;
  const gridCols = 24;
  let gridGroup = new THREE.Group();

  function createGrid(aspect) {
    // Remove previous grid if any
    if (gridGroup) {
      scene.remove(gridGroup);
      gridGroup.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
    }
    gridGroup = new THREE.Group();

    const planeWidth = 5 / 24;
    const planeHeight = 2 / 24;
    const gridWidth = planeWidth * gridCols;
    const gridHeight = planeHeight * gridRows;
    const y = -0.45; // y position for the bottom face, slightly higher than -0.5

    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: 0x00bfff });
        const line = new THREE.LineSegments(edges, material);

        // Center the grid at (0, y, 0)
        const x = -gridWidth / 2 + planeWidth / 2 + col * planeWidth;
        const z = -gridHeight / 2 + planeHeight / 2 + row * planeHeight;
        line.position.set(x, y, z);
        line.rotation.x = -Math.PI / 2; // Make it horizontal (XZ plane)
        gridGroup.add(line);

        geometry.dispose(); // Clean up geometry, only edges are needed
      }
    }
    scene.add(gridGroup);
  }

  const camera = new THREE.PerspectiveCamera();
  setupCamera(camera, window.innerWidth, window.innerHeight);
  createGrid(window.innerWidth / window.innerHeight);

  // Responsive resize
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    setupCamera(camera, window.innerWidth, window.innerHeight);
    createGrid(window.innerWidth / window.innerHeight);
    renderer.render(scene, camera);
  });

  // Render once, no animation
  renderer.render(scene, camera);
}