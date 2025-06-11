import { createNoise2D } from 'simplex-noise';
import * as THREE from 'three';

const noise2D = createNoise2D();

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
        const hw = planeWidth / 2;
        const hh = planeHeight / 2;
        // Vertices for XZ plane at y
        const vertices = new Float32Array([
          -hw, y, -hh, // 0: bottom left
           hw, y, -hh, // 1: bottom right
           hw, y,  hh, // 2: top right
          -hw, y,  hh  // 3: top left
        ]);
        // Indices for lines
        const lineIndices = [
          0, 1, 1, 2, 2, 3, 3, 0
        ];
        // Indices for face (two triangles)
        const faceIndices = [
          0, 1, 2,
          0, 2, 3
        ];

        // Face mesh
        const faceGeometry = new THREE.BufferGeometry();
        faceGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        faceGeometry.setIndex(faceIndices);
        faceGeometry.computeVertexNormals();
        const faceMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
        const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);

        // Edge lines
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        lineGeometry.setIndex(lineIndices);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00bfff });
        const line = new THREE.LineSegments(lineGeometry, lineMaterial);

        // Position both at the correct spot
        const x = -gridWidth / 2 + planeWidth / 2 + col * planeWidth;
        const z = -gridHeight / 2 + planeHeight / 2 + row * planeHeight;
        faceMesh.position.set(x, 0, z);
        line.position.set(x, 0, z);

        gridGroup.add(faceMesh);
        gridGroup.add(line);

        // Clean up geometry if you want, but only after removal from scene
        // faceGeometry.dispose();
        // lineGeometry.dispose();
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