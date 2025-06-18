import './style.css'
import PerfectScrollbar from 'perfect-scrollbar';
import 'perfect-scrollbar/css/perfect-scrollbar.css';

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

  // Toggle navbar visibility for home section
  if (currentSection === 0) {
    document.body.classList.add('home-active');
  } else {
    document.body.classList.remove('home-active');
  }

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

// Contact form submission (basic example)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // You can add your form handling logic here (e.g., send to API, show a message, etc.)
    alert('Thank you for your message!');
    contactForm.reset();
  });
}

const defaultLink = 'https://github.com';

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
