import './style.css'
import PerfectScrollbar from 'perfect-scrollbar';
import Typewriter from 'typewriter-effect/dist/core';
import 'perfect-scrollbar/css/perfect-scrollbar.css';
import { changeTheme } from './scene.js';

const originalTypewriterStrings = [
  'I am a computer graphics student',
  'I am passionate about real-time 3D',
  'I am a game developer',
  'I am always learning something new'
];

const tw = new Typewriter('#typewriter', {
  strings: originalTypewriterStrings,
  autoStart: true,
  loop: true,
  delay: 75,
  deleteSpeed: 50,
  cursor: '|',
  pauseFor: 2000
});

let twLyrics = null;

export { tw, twLyrics, originalTypewriterStrings };

const sections = Array.from(document.querySelectorAll('section'));
const navLinks = [
  document.getElementById('nav-home'),
  document.getElementById('nav-about'),
  document.getElementById('nav-projects'),
  document.getElementById('nav-contact')
];
const arrowLeft = document.getElementById('arrow-left');
const arrowRight = document.getElementById('arrow-right');
const sectionsContainer = document.getElementById('sections');
let currentSection = 0;
let isSliding = false;

export function showSection(index) {
  if (isSliding || index < 0 || index >= sections.length) return;
  isSliding = true;
  currentSection = index;

  // Move the sections container
  sectionsContainer.style.transform = `translateX(-${index * 100}vw)`;

  // Hide arrows if not allowed to move
  if (currentSection === 0) {
    arrowLeft.classList.add('hidden');
  } else {
    arrowLeft.classList.remove('hidden');
  }
  if (currentSection === sections.length - 1) {
    arrowRight.classList.add('hidden');
  } else {
    arrowRight.classList.remove('hidden');
  }
  navLinks.forEach((link, i) => {
    if (link) link.classList.toggle('active', i === index);
  });

  // Toggle navbar visibility for home section
  if (currentSection === 0) {
    document.body.classList.add('home-active');
  } else {
    document.body.classList.remove('home-active');
  }

  updateTutorialTransparency();

  setTimeout(() => { isSliding = false; }, 400);
}

// Arrow navigation
arrowLeft.addEventListener('click', () => {
  showSection(currentSection - 1);
});
arrowRight.addEventListener('click', () => {
  showSection(currentSection + 1);
});

// Keyboard navigation (left/right arrows)
document.addEventListener('keydown', (e) => {
  // Prevent arrow shortcuts if focused on a contact form input/textarea
  const active = document.activeElement;
  if (active && active.closest && active.closest('#contact-form') && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
    return;
  }
  if (e.key === 'ArrowLeft') showSection(currentSection - 1);
  if (e.key === 'ArrowRight') showSection(currentSection + 1);
  if (e.key === 'q') showSection(currentSection - 1);
  if (e.key === 'd') showSection(currentSection + 1);
});

// Navbar click navigation
navLinks.forEach((link, i) => {
  if (link) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(i);
    });
  }
});

// Set arrow symbols to < and >
arrowLeft.textContent = '<';
arrowRight.textContent = '>';

// Initialize
showSection(0); // This will hide the left arrow if currentSection is 0
displayTutorial();

// Tag filtering logic
const tagButtons = Array.from(document.querySelectorAll('#project-tags .tag'));
const projectCards = Array.from(document.querySelectorAll('.project-card'));

function updateProjectVisibility(selectedTag) {
  if (selectedTag === 'All') {
    projectCards.forEach(card => card.style.display = '');
  } else {
    projectCards.forEach(card => {
      const tags = card.getAttribute('data-tags').split(',');
      card.style.display = tags.includes(selectedTag) ? '' : 'none';
    });
  }
}

tagButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // If "All" is clicked, deselect all others
    if (btn.dataset.tag === 'All') {
      tagButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateProjectVisibility('All');
      return;
    }
    // Toggle tag
    btn.classList.toggle('active');
    // Remove "All" active if any tag is selected
    const activeTags = tagButtons.filter(b => b.dataset.tag !== 'All' && b.classList.contains('active'));
    const allBtn = tagButtons.find(b => b.dataset.tag === 'All');
    if (activeTags.length === 0) {
      // No tags selected, select "All"
      tagButtons.forEach(b => b.classList.remove('active'));
      allBtn.classList.add('active');
      updateProjectVisibility('All');
    } else {
      allBtn.classList.remove('active');
      // Show projects matching any selected tag
      const selectedTags = activeTags.map(b => b.dataset.tag);
      projectCards.forEach(card => {
        const tags = card.getAttribute('data-tags').split(',');
        card.style.display = selectedTags.some(tag => tags.includes(tag)) ? '' : 'none';
      });
    }
  });
});

// Contact form submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    contactForm.reset();
    const btn = contactForm.querySelector('button[type="submit"]');
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = 'Sent !';
      btn.style.backgroundColor = 'var(--navbar-border-color)';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = 'var(--primary-color)';
        btn.disabled = false;
      }, 4000);
    }
  });
}



const defaultLink = '';

projectCards.forEach(card => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', (e) => {
    card.blur();
    const url = card.getAttribute('data-link') || defaultLink;
    window.open(url, '_blank');
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      card.blur();
      const url = card.getAttribute('data-link') || defaultLink;
      window.open(url, '_blank');
    }
  });
  card.tabIndex = 0;
});

// Initialize PerfectScrollbar on project grid
const projectGrid = document.getElementById('project-grid');
let ps = null;
if (projectGrid) {
  ps = new PerfectScrollbar(projectGrid, {
    suppressScrollX: true,
    wheelPropagation: false
  });
}

function displayTutorial() {
  // First idea was to use localStorage to show it only if needed, which is why this exists. I was too lazy to move it back to normal html
  if (document.getElementById('tutorial-overlay')) {
    return;
  }

  const tutorial = document.createElement('div');
  tutorial.id = 'tutorial-overlay';
  tutorial.innerHTML = `
    <div class="tutorial-content">
      <div class="tutorial-text">
        <p>Navigate between pages using:</p>
        <div class="tutorial-controls">
          <span class="control-item">← → Keys</span>
          <span class="control-item">Q / D</span>
          <span class="control-item">Click arrows</span>
        </div>
      </div>
      <button id="tutorial-got-it" class="tutorial-button">Got it!</button>
    </div>
  `;
  
  document.body.appendChild(tutorial);
  
  updateTutorialTransparency();
  
  setTimeout(() => {
    tutorial.classList.add('tutorial-show');
  }, 50);
  
  const gotItButton = document.getElementById('tutorial-got-it');
  gotItButton.addEventListener('click', hideTutorial);
}

export function hideTutorial() {
  const tutorial = document.getElementById('tutorial-overlay');
  const hoverArea = document.getElementById('tutorial-hover-area');
  
  if (tutorial) {
    tutorial.classList.remove('tutorial-show');
    tutorial.classList.add('tutorial-hide');
    
    setTimeout(() => {
      tutorial.remove();
    }, 400);
  }
  
  if (hoverArea) {
    hoverArea.remove();
  }
}

let tutorialMinimized = false;

function updateTutorialTransparency() {
  const tutorial = document.getElementById('tutorial-overlay');
  if (tutorial) {
    if (currentSection === 0) {
      tutorial.classList.add('tutorial-home-transparent');
    } else {
      tutorial.classList.remove('tutorial-home-transparent');

      if (!tutorialMinimized) {
        tutorialMinimized = true;
        tutorial.classList.remove('tutorial-show');
        tutorial.classList.add('tutorial-minimized');
        setupTutorialHoverArea();
      }
    }
  }
}

function setupTutorialHoverArea() {
  if (document.getElementById('tutorial-hover-area')) return;
  
  const hoverArea = document.createElement('div');
  hoverArea.id = 'tutorial-hover-area';
  document.body.appendChild(hoverArea);
  
  const tutorial = document.getElementById('tutorial-overlay');
  
  const showTutorial = () => {
    if (tutorialMinimized) {
      tutorial.classList.remove('tutorial-minimized');
      tutorial.classList.add('tutorial-show');
    }
  };
  
  const hideTutorial = () => {
    if (tutorialMinimized) {
      tutorial.classList.remove('tutorial-show');
      tutorial.classList.add('tutorial-minimized');
    }
  };
  
  hoverArea.addEventListener('mouseenter', showTutorial);
  hoverArea.addEventListener('mouseleave', hideTutorial);
  
  tutorial.addEventListener('mouseenter', showTutorial);
  tutorial.addEventListener('mouseleave', hideTutorial);
}

// Theme switch button logic
const themeToggle = document.getElementById('theme-toggle');
const moonSVG = document.getElementById('svg-moon');
const sunSVG = document.getElementById('svg-sun');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const body = document.body;
    const isDark = body.classList.contains('dark-theme');
    if (isDark) {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
      moonSVG.style.display = 'none';
      sunSVG.style.display = 'block';
      changeTheme && changeTheme('light');
    } else {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
      moonSVG.style.display = 'block';
      sunSVG.style.display = 'none';
      changeTheme && changeTheme('dark');
    }
  });
  // Set initial icon
  if (document.body.classList.contains('dark-theme')) {
    moonSVG.style.display = 'block';
    sunSVG.style.display = 'none';
  } else {
    moonSVG.style.display = 'none';
    sunSVG.style.display = 'block';
  }
}