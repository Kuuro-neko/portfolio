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

async function setupBadApple() {
  console.log('Press CTRL + ALT + B for 🍎 ᗜˬᗜ');
  
  let isLoading = false;
  let isPlaying = false;
  let lyrics = [];
  
  // Load lyrics data
  try {
    const response = await fetch('./bad-apple/badapple.json');
    lyrics = await response.json();
    console.log(`Loaded ${lyrics.length} lyric entries`);
  } catch (error) {
    console.error('Failed to load lyrics:', error);
  }
  
  const startBadApple = async (event) => {
    // Check for LEFT_CTRL + ALT + B
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'b') {
      if (isLoading) {
        console.log('Bad Apple is already loading...');
        return;
      }
      
      if (isPlaying) {
        console.log('Bad Apple is already playing');
        return;
      }
      
      event.preventDefault();
      isLoading = true;
      
      try {
        console.log('Loading Bad Apple media files...');
        
        // Create video and audio elements
        const video = document.createElement('video');
        video.src = './bad-apple/badapple144p.mp4';
        video.loop = false;
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        
        const audio = new Audio('./bad-apple/badapple.mp3');
        audio.loop = false;
        audio.volume = 0.5;
        audio.preload = 'auto';
        
        // Wait for both to be ready to play
        await Promise.all([
          new Promise((resolve, reject) => {
            video.addEventListener('canplaythrough', resolve, { once: true });
            video.addEventListener('error', reject, { once: true });
            video.load();
          }),
          new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', resolve, { once: true });
            audio.addEventListener('error', reject, { once: true });
            audio.load();
          })
        ]);
        
        console.log('Bad Apple loaded! Starting playback...');
        isLoading = false;
        isPlaying = true;

        showSection(0);
        
        // Create video texture
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBAFormat;
        
        const originalMaterial = circle.material.clone();
        
        await sunAnimation(0.6, 1.3);
        
        // Apply video texture to circle after animation
        circle.material.map = videoTexture;
        circle.material.needsUpdate = true;
        
        // Start both video and audio simultaneously
        await Promise.all([
          video.play(),
          audio.play()
        ]);
        
        console.log('Bad Apple started successfully!');
        
        // Fade out home section text
        const homeSection = document.querySelector('#home');
        const homeParagraph = homeSection.querySelector('p:first-of-type');
        const homeHeading = homeSection.querySelector('h1');
        if (homeParagraph) homeParagraph.style.transition = 'opacity 0.5s';
        if (homeHeading) homeHeading.style.transition = 'opacity 0.5s';
        if (homeParagraph) homeParagraph.style.opacity = '0.2';
        if (homeHeading) homeHeading.style.opacity = '0.2';
        
        // Lyrics setup
        let currentLyricIndex = 0;
        const totalFrames = 6570;
        const fps = 30;
        const lyricDelay = -1.0; // Fi xconstant delay
        
        // Stop the main typewriter and create lyrics typewriter
        tw.stop();
        
        const twLyrics = new Typewriter('#typewriter', {
          strings: [],
          autoStart: false,
          loop: false,
          delay: 0,
          deleteSpeed: 1,
          cursor: '',
          pauseFor: 0
        });
        
        video.addEventListener('timeupdate', () => {
          // Apply delay to sync lyrics properly
          const adjustedTime = video.currentTime + lyricDelay;
          const currentFrame = Math.floor(adjustedTime * fps);
          
          // Update lyrics based on current frame
          if (currentLyricIndex < lyrics.length - 1 && 
              currentFrame >= lyrics[currentLyricIndex + 1].frame) {
            currentLyricIndex++;
            // Skip ahead if multiple lyrics should have been displayed
            while (currentLyricIndex < lyrics.length - 1 && 
                   currentFrame >= lyrics[currentLyricIndex + 1].frame) {
              currentLyricIndex++;
            }
            // Update lyrics typewriter with new lyric
            twLyrics.deleteAll(1).typeString(lyrics[currentLyricIndex].lyric.replace(/\n/g, '<br>')).start();
          }
          
          // Resync video to audio if drift detected (video follows audio)
          const timeDiff = Math.abs(video.currentTime - audio.currentTime);
          if (timeDiff > 0.3) {
            console.log(`Resyncing: video=${video.currentTime.toFixed(2)}s, audio=${audio.currentTime.toFixed(2)}s, diff=${timeDiff.toFixed(2)}s`);
            video.currentTime = audio.currentTime;

            const syncedAdjustedTime = audio.currentTime + lyricDelay;
            const syncedFrame = Math.floor(syncedAdjustedTime * fps);
            currentLyricIndex = 0;
            for (let i = 0; i < lyrics.length - 1; i++) {
              if (syncedFrame >= lyrics[i + 1].frame) {
                currentLyricIndex = i + 1;
              } else {
                break;
              }
            }
            twLyrics.deleteAll(1).typeString(lyrics[currentLyricIndex].lyric.replace(/\n/g, '<br>')).start();
          }
        });
        
        // Restoring circle at the end
        video.addEventListener('ended', () => {
          console.log('Bad Apple finished. Restoring original circle.');
          circle.material = originalMaterial.clone();
          circle.material.needsUpdate = true;
          sunAnimation(0.0, 1.0);
          
          // Restore home section text opacity
          if (homeParagraph) homeParagraph.style.opacity = '1';
          if (homeHeading) homeHeading.style.opacity = '1';
          
          // Stop lyrics typewriter and restart main typewriter
          twLyrics.stop();
          twLyrics.deleteAll(0);
          
          // Recreate the main typewriter to ensure clean state
          const typewriterElement = document.querySelector('#typewriter');
          if (typewriterElement) {
            typewriterElement.innerHTML = '';
          }
          
          // Start a fresh typewriter instance
          setTimeout(() => {
            const newTw = new Typewriter('#typewriter', {
              strings: originalTypewriterStrings,
              autoStart: true,
              loop: true,
              delay: 75,
              deleteSpeed: 50,
              cursor: '|',
              pauseFor: 2000
            });
          }, 100);
          
          isPlaying = false;
          document.addEventListener('keydown', startBadApple);
        });
        
        // Remove the keydown listener once started
        document.removeEventListener('keydown', startBadApple);
        
        hideTutorial();
        
      } catch (error) {
        console.error('Failed to load or start Bad Apple:', error);
        isLoading = false;
        isPlaying = false;
      }
    }
  };
  document.addEventListener('keydown', startBadApple);
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