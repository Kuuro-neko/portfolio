import './style.css'

const sections = Array.from(document.querySelectorAll('.fullpage'));
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

function showSection(index) {
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
  if (e.key === 'ArrowLeft') showSection(currentSection - 1);
  if (e.key === 'ArrowRight') showSection(currentSection + 1);
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
