import * as THREE from 'three';

const canvas = document.getElementById('three-bg');
if (canvas) {
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 2.5;

  // Triangle geometry
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    0.0,  0.8, 0.0,
   -0.7, -0.6, 0.0,
    0.7, -0.6, 0.0
  ]);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  const material = new THREE.MeshBasicMaterial({ color: 0x0078d7, side: THREE.DoubleSide });
  const triangle = new THREE.Mesh(geometry, material);
  scene.add(triangle);

  // Responsive resize
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    triangle.rotation.z += 0.003;
    renderer.render(scene, camera);
  }
  animate();
}