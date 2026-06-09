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
