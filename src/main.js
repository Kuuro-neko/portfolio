import './style.css'
import viteLogo from '/vite.svg'

// Highlight navbar link on scroll
const sections = document.querySelectorAll('section');
const navLinks = {
  home: document.getElementById('nav-home'),
  about: document.getElementById('nav-about'),
  projects: document.getElementById('nav-projects'),
  contact: document.getElementById('nav-contact'),
};

function onScroll() {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 70;
    if (window.scrollY >= sectionTop) {
      current = section.id;
    }
  });

  Object.keys(navLinks).forEach(key => {
    navLinks[key].classList.remove('active');
    if (key === current) {
      navLinks[key].classList.add('active');
    }
  });
}

window.addEventListener('scroll', onScroll);
onScroll();
