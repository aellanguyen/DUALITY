 'use strict';

// Navigation is an enhancement: all content and artwork links work without JavaScript.
// Mark the section currently being read, without changing scroll or generating motion.
const navigationLinks = [...document.querySelectorAll('nav a[href^="#"]')];
const sections = navigationLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const visibleSections = new Map();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visibleSections.set(entry.target.id, entry.intersectionRatio);
      else visibleSections.delete(entry.target.id);
    }
    const current = [...visibleSections].sort((a, b) => b[1] - a[1])[0]?.[0];
    for (const link of navigationLinks) {
      if (link.getAttribute('href') === `#${current}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }, { rootMargin: '-10% 0px -20% 0px', threshold: [0, 0.15, 0.4, 0.7] });
  sections.forEach(section => observer.observe(section));
}

// Move the sticky sculpture from the lower edge of the title to the centre
// of Artwork 2. The track ends there, so both artworks then scroll away together.
const sequence = document.querySelector('.artwork-sequence');
const openingScene = sequence.querySelector('.hero');
let scrollFrame = 0;

function updateSculpturePosition() {
  scrollFrame = 0;
  const { top, height } = openingScene.getBoundingClientRect();
  const travel = Math.max(0, Math.min(1, -top / height));
  sequence.style.setProperty('--travel', travel);
}

function scheduleSculpturePosition() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateSculpturePosition);
}

window.addEventListener('scroll', scheduleSculpturePosition, { passive: true });
window.addEventListener('resize', scheduleSculpturePosition);
updateSculpturePosition();
