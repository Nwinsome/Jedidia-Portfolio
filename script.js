/* Keep anchor navigation available when JavaScript is disabled. */
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('#nav-links');
const mobileViewport = window.matchMedia('(max-width: 760px)');
const header = document.querySelector('.site-header');

// Measure after menu layout changes, before native anchor scrolling runs.
const updateHeaderHeight = () => {
  if (header) {
    document.documentElement.style.setProperty('--header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
  }
};
if (menuButton && navLinks) {
  document.documentElement.classList.add('menu-ready');
  menuButton.hidden = false;
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
    updateHeaderHeight();
  };
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    navLinks.classList.toggle('is-open', !isOpen);
    updateHeaderHeight();
  });
  navLinks.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav')) closeMenu();
  });
  if (mobileViewport.addEventListener) mobileViewport.addEventListener('change', closeMenu);
}
updateHeaderHeight();
if (header && 'ResizeObserver' in window) {
  new ResizeObserver(updateHeaderHeight).observe(header);
}
window.addEventListener('resize', updateHeaderHeight);

// Reveal the destination before scrolling, including direct fragment visits.
const revealTarget = (target) => {
  if (!target) return;
  const parent = target.closest('.reveal');
  if (parent) parent.classList.remove('is-pending');
  target.querySelectorAll('.reveal').forEach((element) => element.classList.remove('is-pending'));
};
const hashTarget = () => {
  try { return document.getElementById(decodeURIComponent(window.location.hash.slice(1))); }
  catch { return null; }
};
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (link) revealTarget(document.getElementById(link.getAttribute('href').slice(1)));
});
window.addEventListener('hashchange', () => revealTarget(hashTarget()));
window.addEventListener('load', () => {
  updateHeaderHeight();
  const target = hashTarget();
  if (target) {
    revealTarget(target);
    // Correct the browser's early fragment placement after final layout.
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
});
const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

/* Reveal progressively; respect reduced motion and live preference changes. */
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !motionPreference.matches) {
  const elements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('is-pending');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0 });
  elements.forEach((element) => {
    element.classList.add('is-pending');
    observer.observe(element);
  });
  if (motionPreference.addEventListener) {
    motionPreference.addEventListener('change', (event) => {
      if (event.matches) {
        observer.disconnect();
        elements.forEach((element) => element.classList.remove('is-pending'));
      }
    });
  }
}
