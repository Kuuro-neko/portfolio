import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
function loadTextureAsync(url) {
  return new Promise((resolve, reject) => {
    textureLoader.load(url, resolve, undefined, reject);
  });
}

// Singleton to manage row indices
class RowIndexSingleton {
  static instance = null;
  constructor() {
    this.currentIndex = 0;
  }
  static getInstance() {
    if (!RowIndexSingleton.instance) {
      RowIndexSingleton.instance = new RowIndexSingleton();
    }
    return RowIndexSingleton.instance;
  }
  getAndIncrementRowIndex() {
    return this.currentIndex++;
  }
}

export class InfiniteGrid {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    this.speed = 0.15;
    this.lastTime = performance.now();

    this.plane = null;
    this.plane2 = null;

    this.animating = false;
    this.animationId = null;

    this.clock = new THREE.Clock();

    const TEXTURE_PATH = './portfolio/textures/texture.png';
    const HEIGHTMAP_PATH = './portfolio/textures/heightmap.png';
    const METALNESS_PATH = './portfolio/textures/metalness.png';

    Promise.all([
      loadTextureAsync(TEXTURE_PATH),
      loadTextureAsync(HEIGHTMAP_PATH),
      loadTextureAsync(METALNESS_PATH)
    ]).then(([texture, heightmap, metalness]) => {
      this.texture = texture;
      this.heightmap = heightmap;
      this.metalness = metalness;
      this.createPlanes();
      this.start();
    });
  }

  loadTextureAsync(url) {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(url, resolve, undefined, reject);
    });
  }

  createPlanes() {
    if (this.plane) {
      this.scene.remove(this.plane);
      this.plane.geometry.dispose();
      this.plane.material.dispose();
      this.scene.remove(this.plane2);
      this.plane2.geometry.dispose();
      this.plane2.material.dispose();
    }

    const geometry = new THREE.PlaneGeometry(1, 2, 24, 24);
    const material = new THREE.MeshStandardMaterial({
        map: this.texture,
        displacementMap: this.heightmap,
        displacementScale: 0.4,
    });
    
    this.plane = new THREE.Mesh(geometry, material);
    this.plane.rotation.x = -Math.PI / 2;
    this.plane.position.set(0, -0.0, 0);

    this.plane2 = new THREE.Mesh(geometry, material);
    this.plane2.rotation.x = -Math.PI / 2;
    this.plane2.position.set(0, -0.0, -2);

    this.scene.add(this.plane);
    this.scene.add(this.plane2);

    this.lastTime = performance.now();
  }

  setSpeed(newSpeed) {
    this.speed = newSpeed;
  }

  start() {
    if (this.animating) return;
    this.animating = true;
    this.lastTime = performance.now();
    this.animate();
  }

  stop() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animating = false;
  }

  resize() {
    this.rowIndexManager.currentIndex = 0;
    this.createPlanes(false);
  }

  animate() {
    if (!this.animating) return;
    const elapsed = this.clock.getElapsedTime();
    this.plane.position.z = (elapsed * this.speed) % 2;
    this.plane2.position.z = (elapsed * this.speed % 2) - 2;
    this.render();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
