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

// Copy BibTeX (with a little celebratory burst of "table cells")
function cellConfetti(anchor) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const rect = anchor.getBoundingClientRect();
  const colors = ['#6d4bc4', '#8a63e0', '#2f6fd0', '#f59e0b'];
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('span');
    s.className = 'cell-confetti';
    const size = 5 + Math.random() * 6;
    s.style.cssText =
      'left:' + (rect.left + rect.width / 2) + 'px;' +
      'top:' + (rect.top + rect.height / 2) + 'px;' +
      'width:' + size + 'px;height:' + size + 'px;' +
      'background:' + colors[i % colors.length] + ';' +
      '--dx:' + ((Math.random() * 2 - 1) * 150).toFixed(0) + 'px;' +
      '--dy:' + (-(50 + Math.random() * 120)).toFixed(0) + 'px;' +
      '--rot:' + ((Math.random() * 2 - 1) * 540).toFixed(0) + 'deg;';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1300);
  }
}

function copyBibtex() {
  const text = document.querySelector('.citation-box pre').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.copy-btn');
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    cellConfetti(btn);
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

// ---- Widgets: figure lightbox + floating mini voxel cube ----
(function () {
  // Lightbox: click a large figure to inspect it full screen
  const zoomables = document.querySelectorAll('.hero-teaser, .pipeline-image');
  if (zoomables.length) {
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Image viewer');
    box.innerHTML = '<img alt=""><p class="lightbox-caption"></p><p class="lightbox-hint">Click anywhere or press Esc to close</p>';
    document.body.appendChild(box);
    const big = box.querySelector('img');
    const cap = box.querySelector('.lightbox-caption');
    const close = () => {
      box.classList.remove('open');
      document.documentElement.style.overflow = '';
    };
    zoomables.forEach(img => {
      img.classList.add('zoomable');
      img.addEventListener('click', () => {
        big.src = img.src;
        big.alt = img.alt || '';
        cap.textContent = img.alt || '';
        box.classList.add('open');
        document.documentElement.style.overflow = 'hidden';
      });
    });
    box.addEventListener('click', close);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && box.classList.contains('open')) close();
    });
  }

  // Mini voxel cube: shows once the reader is past the hero, hides at the demo
  const cube = document.getElementById('miniCube');
  if (!cube) return;
  let dismissed = false;
  try { dismissed = sessionStorage.getItem('cubeDismissed') === '1'; } catch (e) { /* file:// quirks */ }
  if (dismissed) { cube.remove(); return; }

  let heroInView = true;
  let demoInView = false;
  const update = () => cube.classList.toggle('cube-hidden', heroInView || demoInView);
  if ('IntersectionObserver' in window) {
    const hero = document.querySelector('.hero');
    const demo = document.querySelector('#demo');
    if (hero) new IntersectionObserver(es => { heroInView = es[0].isIntersecting; update(); }, { threshold: 0 }).observe(hero);
    if (demo) new IntersectionObserver(es => { demoInView = es[0].isIntersecting; update(); }, { threshold: 0.15 }).observe(demo);
  } else {
    heroInView = false; // no observer: just show it
  }
  update();

  cube.querySelector('.mini-cube-link').addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector('#demo');
    if (target) {
      const top = target.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
  cube.querySelector('.mini-cube-close').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    try { sessionStorage.setItem('cubeDismissed', '1'); } catch (err) { /* ignore */ }
    cube.remove();
  });
})();

// ---- Hero cursor glow: lights up the grid backdrop under the pointer ----
(function () {
  const hero = document.querySelector('.hero');
  const heroBg = document.querySelector('.hero-bg');
  const fine = window.matchMedia('(pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hero || !heroBg || !fine || reduce) return;

  const glow = document.createElement('span');
  glow.className = 'hero-glow';
  glow.setAttribute('aria-hidden', 'true');
  heroBg.appendChild(glow);

  hero.addEventListener('mousemove', function (e) {
    const r = hero.getBoundingClientRect();
    glow.style.setProperty('--gx', (e.clientX - r.left) + 'px');
    glow.style.setProperty('--gy', (e.clientY - r.top) + 'px');
  }, { passive: true });
  hero.addEventListener('mouseenter', () => glow.classList.add('on'));
  hero.addEventListener('mouseleave', () => glow.classList.remove('on'));
})();
