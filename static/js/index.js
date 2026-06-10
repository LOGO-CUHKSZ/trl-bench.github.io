// Smooth scroll for navigation
document.querySelectorAll('.nav-item, .content-nav a').forEach(link => {
  link.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offset = 120;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  });
});

// Active nav highlighting on scroll
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.content-nav .nav-item');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 150;
    if (window.pageYOffset >= top) {
      current = section.getAttribute('id');
    }
  });
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === '#' + current) {
      item.classList.add('active');
    }
  });
});

// Copy BibTeX
function copyBibtex() {
  const text = document.querySelector('.citation-box pre').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.copy-btn');
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
    }, 2000);
  });
}

// ---- Landing-page motion: scroll hint, scroll-reveal, stat count-up ----
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll hint: jump to Overview on click, fade out once the reader scrolls
  const hint = document.querySelector('.hero-scroll-hint');
  if (hint) {
    hint.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector('#overview');
      if (target) {
        const top = target.getBoundingClientRect().top + window.pageYOffset - 120;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
    const toggleHint = () => hint.classList.toggle('hint-hidden', window.pageYOffset > 160);
    window.addEventListener('scroll', toggleHint, { passive: true });
    toggleHint();
  }

  // Below: progressive enhancement only — bail out and stay fully static
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  // Scroll-reveal: sections/cards fade in and rise as they enter the viewport.
  // Classes are added here at runtime, so without JS nothing is ever hidden.
  const revealTargets = document.querySelectorAll([
    '.section .section-title',
    '.section .section-subtitle',
    '.section .subsection-title',
    '.stat-card',
    '.component-card',
    '.pipeline-step',
    '.videocua-hero',
    '.comparison-section',
    '.pipeline-section',
    '.demo-wrap',
    '.results-note',
    '.citation-section'
  ].join(', '));

  const finishReveal = el => {
    // Hand styling back to the stock rules so hover transitions stay snappy
    el.classList.remove('reveal', 'reveal-in');
    el.style.transitionDelay = '';
  };
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      revealObserver.unobserve(el);
      el.classList.add('reveal-in');
      el.addEventListener('transitionend', () => finishReveal(el), { once: true });
      setTimeout(() => finishReveal(el), 1500); // safety net if transitionend never fires
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

  revealTargets.forEach(el => {
    const siblings = el.parentElement ? el.parentElement.children : [el];
    const idx = Array.prototype.indexOf.call(siblings, el);
    el.style.transitionDelay = Math.min(Math.max(idx, 0) * 70, 350) + 'ms'; // stagger within a grid
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  // Stat count-up: the overview numbers tick from 0 when they come into view
  const formatStat = n => n.toLocaleString('en-US');
  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      statObserver.unobserve(el);
      const target = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10);
      if (!isFinite(target) || target <= 0) return;
      const duration = target < 10 ? 600 : 1300;
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        el.textContent = formatStat(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-number').forEach(el => statObserver.observe(el));
})();
