import * as THREE from 'three';
import { InfiniteGrid } from './grid.js';
import { hideTutorial, showSection, tw, originalTypewriterStrings } from './main.js';
import Typewriter from 'typewriter-effect/dist/core';

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

export var currentSection = 0;

export function setCurrentSection(index) {
  currentSection = index;
  updateControllerOpacity();
}

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

  // Sun
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

  setupBadApple();
}

// Bad Apple state management (module scope for export)
let badAppleState = {
  isLoading: false,
  isPlaying: false,
  video: null,
  audio: null,
  twLyrics: null,
  originalMaterial: null,
  homeParagraph: null,
  homeHeading: null,
  startBadApple: null // Will store the keyboard listener function
};

// Exportable function to stop Bad Apple
export function stopBadApple() {
  console.log('Stopping Bad Apple...');
  
  // Stop media playback
  if (badAppleState.video) {
    badAppleState.video.pause();
    badAppleState.video.currentTime = 0;
  }
  if (badAppleState.audio) {
    badAppleState.audio.pause();
    badAppleState.audio.currentTime = 0;
  }
  
  // Restore circle
  if (badAppleState.originalMaterial) {
    circle.material = badAppleState.originalMaterial.clone();
    circle.material.needsUpdate = true;
  }
  sunAnimation(0.0, 1.0);
  
  // Restore home section text opacity
  if (badAppleState.homeParagraph) badAppleState.homeParagraph.style.opacity = '1';
  if (badAppleState.homeHeading) badAppleState.homeHeading.style.opacity = '1';
  
  // Stop lyrics typewriter and restart main typewriter
  if (badAppleState.twLyrics) {
    badAppleState.twLyrics.stop();
    badAppleState.twLyrics.deleteAll(0);
  }
  
  // Recreate the main typewriter to ensure clean state
  const typewriterElement = document.querySelector('#typewriter');
  if (typewriterElement) {
    typewriterElement.innerHTML = '';
  }
  
  // Start a fresh typewriter instance
  setTimeout(() => {
    new Typewriter('#typewriter', {
      strings: originalTypewriterStrings,
      autoStart: true,
      loop: true,
      delay: 75,
      deleteSpeed: 50,
      cursor: '|',
      pauseFor: 2000
    });
  }, 100);
  
  // Remove controller
  removeBadAppleController();
  
  // Reset state
  badAppleState.isPlaying = false;
  
  // Re-enable the keyboard listener
  if (badAppleState.startBadApple) {
    document.addEventListener('keydown', badAppleState.startBadApple);
  }
  
  console.log('Bad Apple stopped and restored.');
}

async function setupBadApple() {
  console.log('Press CTRL + ALT + B for 🍎 ᗜˬᗜ');
  
  let lyrics = [];
  try {
    const response = await fetch('./bad-apple/badapple.json');
    lyrics = await response.json();
  } catch (error) {
    console.error('Failed to load lyrics:', error);
  }
  
  const startBadApple = async (event) => {
    // Check for LEFT_CTRL + ALT + B
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'b') {
      if (badAppleState.isLoading || badAppleState.isPlaying) return;
      event.preventDefault();
      badAppleState.isLoading = true;
      
      try {
        console.log('Loading Bad Apple media files...');
        
        // Create video and audio elements
        badAppleState.video = document.createElement('video');
        badAppleState.video.src = './bad-apple/badapple144p.mp4';
        badAppleState.video.loop = false;
        badAppleState.video.muted = true;
        badAppleState.video.playsInline = true;
        badAppleState.video.preload = 'auto';
        
        // Load saved volume from localStorage
        const savedVolume = localStorage.getItem('badAppleVolume');
        const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
        
        badAppleState.audio = new Audio('./bad-apple/badapple.mp3');
        badAppleState.audio.loop = false;
        badAppleState.audio.volume = initialVolume;
        badAppleState.audio.preload = 'auto';
        
        // Wait for both to be ready to play
        await Promise.all([
          new Promise((resolve, reject) => {
            badAppleState.video.addEventListener('canplaythrough', resolve, { once: true });
            badAppleState.video.addEventListener('error', reject, { once: true });
            badAppleState.video.load();
          }),
          new Promise((resolve, reject) => {
            badAppleState.audio.addEventListener('canplaythrough', resolve, { once: true });
            badAppleState.audio.addEventListener('error', reject, { once: true });
            badAppleState.audio.load();
          })
        ]);
        
        badAppleState.isLoading = false;
        badAppleState.isPlaying = true;

        showSection(0);
        
        // Create video texture
        const videoTexture = new THREE.VideoTexture(badAppleState.video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBAFormat;
        
        badAppleState.originalMaterial = circle.material.clone();
        
        await sunAnimation(0.6, 1.3);
        
        circle.material.map = videoTexture;
        circle.material.needsUpdate = true;
        
        await Promise.all([
          badAppleState.video.play(),
          badAppleState.audio.play()
        ]);
        
        const homeSection = document.querySelector('#home');
        badAppleState.homeParagraph = homeSection.querySelector('p:first-of-type');
        badAppleState.homeHeading = homeSection.querySelector('h1');
        if (badAppleState.homeParagraph) badAppleState.homeParagraph.style.transition = 'opacity 0.5s';
        if (badAppleState.homeHeading) badAppleState.homeHeading.style.transition = 'opacity 0.5s';
        if (badAppleState.homeParagraph) badAppleState.homeParagraph.style.opacity = '0.2';
        if (badAppleState.homeHeading) badAppleState.homeHeading.style.opacity = '0.2';
        
        // Lyrics setup
        let currentLyricIndex = 0;
        const totalFrames = 6570;
        const fps = 30;
        const lyricDelay = -1.0; // Fix constant delay
        
        // Stop the main typewriter and create lyrics typewriter
        tw.stop();
        
        badAppleState.twLyrics = new Typewriter('#typewriter', {
          strings: [],
          autoStart: false,
          loop: false,
          delay: 0,
          deleteSpeed: 1,
          cursor: '',
          pauseFor: 0
        });
        
        badAppleState.video.addEventListener('timeupdate', () => {
          const adjustedTime = badAppleState.video.currentTime + lyricDelay;
          const currentFrame = Math.floor(adjustedTime * fps);
          
          if (currentLyricIndex < lyrics.length - 1 && 
              currentFrame >= lyrics[currentLyricIndex + 1].frame) {
            currentLyricIndex++;
            while (currentLyricIndex < lyrics.length - 1 && 
                   currentFrame >= lyrics[currentLyricIndex + 1].frame) {
              currentLyricIndex++;
            }
            badAppleState.twLyrics.deleteAll(1).typeString(lyrics[currentLyricIndex].lyric.replace(/\n/g, '<br>')).start();
          }
          
          // Resync video to audio if drift detected (video follows audio)
          const timeDiff = Math.abs(badAppleState.video.currentTime - badAppleState.audio.currentTime);
          if (timeDiff > 0.3) {
            console.log(`Resyncing: video=${badAppleState.video.currentTime.toFixed(2)}s, audio=${badAppleState.audio.currentTime.toFixed(2)}s, diff=${timeDiff.toFixed(2)}s`);
            badAppleState.video.currentTime = badAppleState.audio.currentTime;

            const syncedAdjustedTime = badAppleState.audio.currentTime + lyricDelay;
            const syncedFrame = Math.floor(syncedAdjustedTime * fps);
            currentLyricIndex = 0;
            for (let i = 0; i < lyrics.length - 1; i++) {
              if (syncedFrame >= lyrics[i + 1].frame) {
                currentLyricIndex = i + 1;
              } else {
                break;
              }
            }
            badAppleState.twLyrics.deleteAll(1).typeString(lyrics[currentLyricIndex].lyric.replace(/\n/g, '<br>')).start();
          }
        });
        
        // When video ends, stop Bad Apple
        badAppleState.video.addEventListener('ended', () => {
          stopBadApple();
        });
        
        // Remove the keydown listener once started
        document.removeEventListener('keydown', startBadApple);
        
        hideTutorial();

        createBadAppleController();
        
      } catch (error) {
        console.error('Failed to load or start Bad Apple:', error);
        badAppleState.isLoading = false;
        badAppleState.isPlaying = false;
      }
    }
  };
  
  badAppleState.startBadApple = startBadApple;
  
  document.addEventListener('keydown', startBadApple);
}

function updateControllerOpacity() {
  const controller = badAppleState.controller;
  if (controller) {
    if (currentSection === 0) {
      controller.classList.add('overlay-home-transparent');
    } else {
      controller.classList.remove('overlay-home-transparent');
    }
  }
}

function createBadAppleController() {
  const controller = document.createElement('div');
  controller.id = 'badapple-controller';
  controller.className = 'bottom-overlay overlay-show overlay-home-transparent';
  
  controller.innerHTML = `
    <div class="controller-content">
      <div class="controller-controls">
        <span style="font-size: 0.75rem; color: var(--text-darker);">Vol:</span>
        <input type="range" id="volume-slider" min="0" max="1" step="0.01" value="0.5">
      </div>
      <button class="controller-button" id="badapple-stop">Stop</button>
    </div>
  `;
  
  document.body.appendChild(controller);
  badAppleState.controller = controller;
  
  updateControllerOpacity();

  // Volume
  const volumeSlider = controller.querySelector('#volume-slider');
  const savedVolume = localStorage.getItem('badAppleVolume');
  const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
  const updateVolumeSlider = (value) => {
    const percent = value * 100;
    volumeSlider.style.setProperty('--volume-percent', `${percent}%`);
  };
  volumeSlider.value = initialVolume;
  if (badAppleState.audio) {
    badAppleState.audio.volume = initialVolume;
  }
  updateVolumeSlider(initialVolume);
  
  volumeSlider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    if (badAppleState.audio) {
      badAppleState.audio.volume = value;
    }
    updateVolumeSlider(value);
    // Save to localStorage
    localStorage.setItem('badAppleVolume', value.toString());
  });
  
  // Stop button
  const stopButton = controller.querySelector('#badapple-stop');
  stopButton.addEventListener('click', () => {
    stopBadApple();
  });
}

function removeBadAppleController() {
  if (badAppleState.controller) {
    badAppleState.controller.classList.remove('overlay-show');
    badAppleState.controller.classList.add('overlay-hide');
    setTimeout(() => {
      if (badAppleState.controller) {
        badAppleState.controller.remove();
        badAppleState.controller = null;
      }
    }, 400);
  }
}

function sunAnimation(targetY, targetScale) {
  return new Promise((resolve) => {
    const startY = circle.position.y;
    const startScale = circle.scale.x;
    const duration = 500;
    const startTime = performance.now();
    
    function animate() {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const eased = 1 - Math.pow(1 - progress, 3);
      
      circle.position.y = startY + (targetY - startY) * eased;
      
      const currentScale = startScale + (targetScale - startScale) * eased;
      circle.scale.set(currentScale, currentScale, currentScale);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }
    
    animate();
  });
}