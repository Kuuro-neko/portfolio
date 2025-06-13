import * as THREE from 'three';

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
  constructor(scene, camera, renderer, options = {}) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.gridRows = options.gridRows || 48;
    this.gridCols = options.gridCols || 24;
    this.planeWidth = 5 / 24;
    this.planeHeight = 2 / 24;
    this.gridWidth = this.planeWidth * this.gridCols;
    this.gridHeight = this.planeHeight * this.gridRows;
    this.y = -0.45;
    this.rowSpeed = options.rowSpeed || 0.1;
    this.scroll = 0;
    this.lastTime = performance.now();
    this.rowIndexManager = RowIndexSingleton.getInstance();
    this.gridGroup = null;
    this.rowGroups = [];
    this.animating = false;
    this.animationId = null;
    this.createGrid();
    this.start();
  }

  createGrid(resetIndex = true) {
    if (this.gridGroup) {
      this.scene.remove(this.gridGroup);
      this.gridGroup.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
    }
    this.gridGroup = new THREE.Group();
    this.rowGroups = [];
    if (resetIndex) this.rowIndexManager.currentIndex = 0;
    for (let row = 0; row < this.gridRows; row++) {
      const rowGroup = new THREE.Group();
      rowGroup.userData.rowIndex = this.rowIndexManager.getAndIncrementRowIndex();
      for (let col = 0; col < this.gridCols; col++) {
        const hw = this.planeWidth / 2;
        const hh = this.planeHeight / 2;
        const vertices = new Float32Array([
          -hw, this.y, -hh,
           hw, this.y, -hh,
           hw, this.y,  hh,
          -hw, this.y,  hh
        ]);
        const lineIndices = [0, 1, 1, 2, 2, 3, 3, 0];
        const faceIndices = [0, 1, 2, 0, 2, 3];
        const faceGeometry = new THREE.BufferGeometry();
        faceGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        faceGeometry.setIndex(faceIndices);
        faceGeometry.computeVertexNormals();
        const faceMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
        const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        lineGeometry.setIndex(lineIndices);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00bfff });
        const line = new THREE.LineSegments(lineGeometry, lineMaterial);
        const x = -this.gridWidth / 2 + this.planeWidth / 2 + col * this.planeWidth;
        faceMesh.position.set(x, 0, 0);
        line.position.set(x, 0, 0);
        rowGroup.add(faceMesh);
        rowGroup.add(line);
      }
      // Position the row group in z
      const z = -this.gridHeight / 2 + this.planeHeight / 2 + row * this.planeHeight;
      rowGroup.position.set(0, 0, z);
      this.gridGroup.add(rowGroup);
      this.rowGroups.push(rowGroup);
    }
    this.scene.add(this.gridGroup);
    this.scroll = 0;
    this.lastTime = performance.now();
  }

  setSpeed(newSpeed) {
    this.rowSpeed = newSpeed;
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
    this.createGrid(false);
  }

  animate() {
    if (!this.animating) return;
    const now = performance.now();
    const deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.scroll += this.rowSpeed * deltaTime;

    if (this.scroll > this.planeHeight) {
      this.scroll -= this.planeHeight;
      const firstRow = this.rowGroups.shift();
      this.rowGroups.push(firstRow);
      console.log(`Row index reset for row: ${firstRow.userData.rowIndex}`);
      this.rowGroups[this.rowGroups.length - 1].userData.rowIndex = this.rowIndexManager.getAndIncrementRowIndex();
      console.log(`New row index assigned: ${this.rowGroups[this.rowGroups.length - 1].userData.rowIndex}`);
    }

    for (let i = 0; i < this.rowGroups.length; i++) {
      const rowGroup = this.rowGroups[i];
      rowGroup.position.z = -this.gridHeight / 2 + this.planeHeight / 2 + (i * this.planeHeight) + this.scroll;
    }
    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}
