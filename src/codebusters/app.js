/**
 * Codebusters — Animated Website
 * AWSMD-inspired dark theme with particle canvas,
 * scroll reveal, animated counters, and interactivity.
 */

/* ──────────────────────────────────────────────
   PARTICLE CANVAS BACKGROUND
   ────────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const PARTICLES = [];
  const COUNT     = 80;
  const MAX_DIST  = 120;

  let W, H, mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.vx   = (Math.random() - 0.5) * 0.4;
      this.vy   = (Math.random() - 0.5) * 0.4;
      this.r    = Math.random() * 1.5 + 0.5;
      this.life = 1;
      this.col  = Math.random() < 0.5
        ? `rgba(99,102,241,${0.3 + Math.random() * 0.4})`
        : `rgba(139,92,246,${0.2 + Math.random() * 0.3})`;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        this.vx += (dx / dist) * 0.15;
        this.vy += (dy / dist) * 0.15;
      }

      // Dampen
      this.vx *= 0.98;
      this.vy *= 0.98;

      // Wrap edges
      if (this.x < 0)  this.x = W;
      if (this.x > W)  this.x = 0;
      if (this.y < 0)  this.y = H;
      if (this.y > H)  this.y = 0;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.col;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) PARTICLES.push(new Particle());

  function drawLines() {
    for (let i = 0; i < PARTICLES.length; i++) {
      for (let j = i + 1; j < PARTICLES.length; j++) {
        const dx   = PARTICLES[i].x - PARTICLES[j].x;
        const dy   = PARTICLES[i].y - PARTICLES[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(PARTICLES[i].x, PARTICLES[i].y);
          ctx.lineTo(PARTICLES[j].x, PARTICLES[j].y);
          ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    PARTICLES.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }
  loop();
})();


/* ──────────────────────────────────────────────
   NAVIGATION — scroll state + mobile toggle
   ────────────────────────────────────────────── */
(function initNav() {
  const nav     = document.getElementById('nav');
  const burger  = document.getElementById('navBurger');
  const mobile  = document.getElementById('navMobile');

  // Scroll class
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Burger toggle
  if (burger && mobile) {
    burger.addEventListener('click', () => {
      const open = mobile.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
    });

    // Close on link click
    mobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobile.classList.remove('open');
        burger.classList.remove('open');
      });
    });
  }

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__links a, .nav__mobile a');

  function highlightNav() {
    const scrollY = window.scrollY + 100;
    sections.forEach(s => {
      const top    = s.offsetTop;
      const height = s.offsetHeight;
      const id     = s.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }
  window.addEventListener('scroll', highlightNav, { passive: true });
})();


/* ──────────────────────────────────────────────
   SCROLL REVEAL — Intersection Observer
   ────────────────────────────────────────────── */
(function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right'
  );

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ──────────────────────────────────────────────
   ANIMATED COUNTERS
   ────────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1800;
    let start      = null;

    function step(ts) {
      if (!start) start = ts;
      const elapsed  = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutQuart(progress);
      el.textContent = Math.round(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();


/* ──────────────────────────────────────────────
   TRUST BAR — duplicate logos for infinite scroll
   ────────────────────────────────────────────── */
(function initMarquee() {
  const container = document.querySelector('.trust-bar__logos');
  if (!container) return;

  // Clone all children for seamless loop
  const items = [...container.children];
  items.forEach(item => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    container.appendChild(clone);
  });

  let x = 0;
  const speed = 0.5;
  const totalW = container.scrollWidth / 2;

  function tick() {
    x -= speed;
    if (Math.abs(x) >= totalW) x = 0;
    container.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(tick);
  }
  tick();
})();


/* ──────────────────────────────────────────────
   SERVICE CARD — tilt on hover
   ────────────────────────────────────────────── */
(function initCardTilt() {
  const cards = document.querySelectorAll('.service-card, .industry-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const tiltX  = dy * -5;
      const tiltY  = dx *  5;

      card.style.transform = `translateY(-4px) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ──────────────────────────────────────────────
   SMOOTH SCROLL — polyfill for anchor links
   ────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ──────────────────────────────────────────────
   CONTACT FORM — basic validation + submit
   ────────────────────────────────────────────── */
(function initForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const btn   = form.querySelector('button[type="submit"]');
  const orig  = btn.innerHTML;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate
    const email = form.querySelector('#email');
    if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      email.focus();
      email.style.borderColor = '#f43f5e';
      setTimeout(() => { email.style.borderColor = ''; }, 2000);
      return;
    }

    // Simulate loading
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="animation:spin 0.8s linear infinite">
        <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
        <path d="M8 2a6 6 0 016 6" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      Sending…`;
    btn.disabled = true;

    await new Promise(r => setTimeout(r, 1800));

    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8l3.5 3.5L13 4.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Message Sent!`;
    btn.style.background = 'linear-gradient(135deg,#10b981,#059669)';

    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 4000);
  });
})();


/* ──────────────────────────────────────────────
   CSS KEYFRAME INJECTION — spinner for form
   ────────────────────────────────────────────── */
(function injectKeyframes() {
  const style = document.createElement('style');
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
})();


/* ──────────────────────────────────────────────
   HERO ORB — subtle parallax on scroll
   ────────────────────────────────────────────── */
(function initHeroParallax() {
  const orbs = document.querySelectorAll('.hero__orb');
  if (!orbs.length) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    orbs[0] && (orbs[0].style.transform = `translateY(${y * 0.15}px)`);
    orbs[1] && (orbs[1].style.transform = `translateY(${y * 0.08}px)`);
    orbs[2] && (orbs[2].style.transform = `translateY(${y * 0.12}px)`);
  }, { passive: true });
})();


/* ──────────────────────────────────────────────
   PAGE LOAD ANIMATION — stagger hero elements
   ────────────────────────────────────────────── */
(function initPageLoad() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';

  window.addEventListener('load', () => {
    document.body.style.opacity = '1';

    // Trigger hero reveals after a brief pause
    setTimeout(() => {
      document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('visible');
        }, i * 120);
      });
    }, 200);
  });
})();
