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

// Regenerate within the existing iframe; the visitor stays on the parent page.
for (const button of document.querySelectorAll('[data-artwork]')) {
  const frame = document.getElementById(button.dataset.artwork);
  const regenerate = () => {
    try {
      const draw = frame.contentWindow.generate;
      if (typeof draw !== 'function') return false;
      draw();
      return true;
    } catch {
      return false;
    }
  };
  button.addEventListener('click', () => {
    if (regenerate()) return;
    button.disabled = true;
    button.textContent = 'Loading artwork…';
    // This only loads the embedded study, never navigates the main page.
    frame.loading = 'eager';
    frame.src = frame.getAttribute('src');
  });
  frame.addEventListener('load', () => {
    button.disabled = false;
    button.textContent = 'New composition';
  });
}
