(() => {
  'use strict';
  // Preserve bookmarked section URLs from the original one-page website.
  const legacySections = new Set(['top', 'about', 'work', 'experience', 'education', 'skills', 'contact']);
  function redirectLegacySection() {
    if (document.body.classList.contains('landing-page') && legacySections.has(location.hash.slice(1))) {
      location.replace(new URL(`classic/${location.hash}`, location.href).href);
    }
  }
  redirectLegacySection();
  window.addEventListener('hashchange', redirectLegacySection);
  const links = [...document.querySelectorAll('.profile-sidebar a[href^="#"]')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting);
    if (!visible.length) return;
    const id = visible[0].target.id;
    links.forEach(link => {
      if (link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
})();
