'use strict';

// ===== PARTICLE NETWORK =====
class ParticleNetwork {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.color = '#ff0000';
    this.resize();
    this.init();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  init() {
    this.particles = [];
    const count = Math.floor((this.canvas.width * this.canvas.height) / 14000);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1
      });
    }
  }
  setColor(color) { this.color = color; }
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const p = this.particles;
    for (let i = 0; i < p.length; i++) {
      p[i].x += p[i].vx;
      p[i].y += p[i].vy;
      if (p[i].x < 0 || p[i].x > this.canvas.width) p[i].vx *= -1;
      if (p[i].y < 0 || p[i].y > this.canvas.height) p[i].vy *= -1;
      this.ctx.beginPath();
      this.ctx.arc(p[i].x, p[i].y, p[i].r, 0, Math.PI * 2);
      this.ctx.fillStyle = this.color + '88';
      this.ctx.fill();
      for (let j = i + 1; j < p.length; j++) {
        const dx = p[i].x - p[j].x, dy = p[i].y - p[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          this.ctx.beginPath();
          this.ctx.moveTo(p[i].x, p[i].y);
          this.ctx.lineTo(p[j].x, p[j].y);
          this.ctx.strokeStyle = this.color + Math.floor((1 - dist / 120) * 40).toString(16).padStart(2, '0');
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
    requestAnimationFrame(() => this.animate());
  }
}

// ===== TYPING EFFECT =====
function initTypingEffect() {
  const el = document.getElementById('typing-skill');
  if (!el) return;
  const skills = [
    'Full Stack Engineer', 'Laravel Developer', 'React Developer',
    'Node.js Engineer', 'Mobile Developer', 'Open Source Builder', 'Vibe Coder 💯'
  ];
  let si = 0, ci = 0, deleting = false;
  function tick() {
    const word = skills[si];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(tick, 1800); return; }
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; si = (si + 1) % skills.length; }
    }
    setTimeout(tick, deleting ? 60 : 90);
  }
  tick();
}

// ===== SKILLS =====
function initSkills() {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;
  const skills = [
    { name: 'PHP/Laravel', pct: 88, icon: '🐘' },
    { name: 'JavaScript', pct: 85, icon: '⚡' },
    { name: 'HTML/CSS', pct: 90, icon: '🎨' },
    { name: 'MySQL', pct: 84, icon: '🗄️' },
    { name: 'REST APIs', pct: 82, icon: '🔗' },
    { name: 'Git/GitHub', pct: 85, icon: '🐙' },
    { name: 'React', pct: 78, icon: '⚛️' },
    { name: 'Node.js', pct: 76, icon: '🟢' },
    { name: 'Android', pct: 72, icon: '📱' },
    { name: 'C#/.NET', pct: 68, icon: '🔷' }
  ];
  grid.innerHTML = skills.map(s => {
    const level = s.pct >= 80 ? 'ADVANCED' : 'INTERMEDIATE';
    const cls = s.pct >= 80 ? 'advanced' : '';
    return `<div class="skill-card">
      <div class="skill-header">
        <span class="skill-name">${s.icon} ${s.name}</span>
        <span class="skill-level ${cls}">${level}</span>
      </div>
      <div class="skill-bar-wrap">
        <div class="skill-bar"><div class="skill-bar-fill" data-pct="${s.pct}"></div></div>
        <span class="skill-pct">${s.pct}%</span>
      </div>
    </div>`;
  }).join('');

  // Animate bars on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
          bar.style.width = bar.dataset.pct + '%';
        });
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  observer.observe(grid);
}


// ===== FETCH PROJECTS =====
async function fetchProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="projects-loading">Loading repositories...</div>';
  const SKIP = ['Maijied'];
  const COLORS = ['#ff0000','#ff6600','#ffd700','#00ff88','#0088ff','#aa00ff','#ff0088','#00ffff','#ff4444'];
  try {
    const res = await fetch('https://api.github.com/users/Maijied/repos?sort=updated&per_page=20');
    if (!res.ok) throw new Error('GitHub API error');
    const repos = await res.json();
    const filtered = repos.filter(r => !SKIP.includes(r.name)).slice(0, 9);
    if (!filtered.length) { grid.innerHTML = '<div class="projects-loading">No projects found.</div>'; return; }
    grid.innerHTML = filtered.map((r, i) => `
      <div class="project-card" style="border-left-color:${COLORS[i % COLORS.length]}">
        <div class="project-card-header">
          <span class="project-name">${r.name}</span>
          <span class="project-stars">⭐ ${r.stargazers_count}</span>
        </div>
        <p class="project-desc">${r.description || 'No description provided.'}</p>
        <div class="project-footer">
          <span class="project-lang">${r.language || 'N/A'}</span>
          <div class="project-links">
            <a href="${r.html_url}" target="_blank" class="project-link">GitHub</a>
            ${r.homepage ? `<a href="${r.homepage}" target="_blank" class="project-link">Live</a>` : ''}
          </div>
        </div>
      </div>`).join('');
  } catch (e) {
    grid.innerHTML = '<div class="projects-loading">Could not load projects. <a href="https://github.com/Maijied?tab=repositories" target="_blank" style="color:#ff0000">View on GitHub</a></div>';
  }
}

// ===== MOBILE MENU =====
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', e => { e.stopPropagation(); menu.classList.toggle('open'); });
  document.addEventListener('click', e => { if (!menu.contains(e.target) && e.target !== btn) menu.classList.remove('open'); });
  window.addEventListener('scroll', () => menu.classList.remove('open'), { passive: true });
  menu.querySelectorAll('.mobile-link').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
}

// ===== CSS DRAGON =====
function initCSSDragon() {
  const container = document.getElementById('css-dragon');
  if (!container) return;
  const N = 18, GAP = 20;
  const segs = [];
  const positions = Array.from({ length: N }, () => ({ x: -100, y: -100 }));

  for (let i = 0; i < N; i++) {
    const el = document.createElement('div');
    el.className = 'dragon-segment' + (i === 0 ? ' dragon-head-segment' : '');
    if (i === 0) {
      const wl = document.createElement('div'); wl.className = 'dragon-wing left';
      const wr = document.createElement('div'); wr.className = 'dragon-wing right';
      el.appendChild(wl); el.appendChild(wr);
    }
    el.style.opacity = String(1 - i * 0.04);
    el.style.width = el.style.height = Math.max(6, 18 - i * 0.6) + 'px';
    container.appendChild(el);
    segs.push(el);
  }

  let mx = -200, my = -200;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function update() {
    positions[0].x += (mx - positions[0].x) * 0.18;
    positions[0].y += (my - positions[0].y) * 0.18;
    for (let i = 1; i < N; i++) {
      const dx = positions[i - 1].x - positions[i].x;
      const dy = positions[i - 1].y - positions[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > GAP) {
        const ratio = (dist - GAP) / dist;
        positions[i].x += dx * ratio * 0.5;
        positions[i].y += dy * ratio * 0.5;
      }
    }
    segs.forEach((el, i) => {
      el.style.left = positions[i].x + 'px';
      el.style.top = positions[i].y + 'px';
    });
    requestAnimationFrame(update);
  }
  update();
}

// ===== REAL SNAKE =====
function initRealSnake() {
  const container = document.getElementById('real-snake-container');
  if (!container) return;
  const N = 25, RADIUS = 130;
  const segs = [];
  for (let i = 0; i < N; i++) {
    const el = document.createElement('div');
    el.className = 'snake-body';
    const size = Math.max(4, 10 - i * 0.2);
    el.style.width = el.style.height = size + 'px';
    el.style.opacity = String(0.9 - i * 0.03);
    el.style.background = `hsl(${i * 14}, 100%, 55%)`;
    container.appendChild(el);
    segs.push(el);
  }
  let angle = 0;
  function animate() {
    angle += 0.025;
    segs.forEach((el, i) => {
      const a = angle - i * 0.28;
      const x = RADIUS / 2 + Math.cos(a) * RADIUS / 2;
      const y = RADIUS / 2 + Math.sin(a) * RADIUS / 2;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
    });
    requestAnimationFrame(animate);
  }
  animate();
}


// ===== LOADING SCREEN =====
function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  const container = document.getElementById('loader-container');
  if (!screen || !container) return;
  const types = [
    '<div class="loader-ring"></div>',
    '<div class="loader-pulse"></div>',
    '<div class="loader-bar-wrap"><div class="loader-bar"></div></div>',
    '<div class="loader-dots"><div class="loader-dot"></div><div class="loader-dot"></div><div class="loader-dot"></div></div>'
  ];
  container.innerHTML = types[Math.floor(Math.random() * types.length)];
  const delay = 2000 + Math.random() * 1000;
  setTimeout(() => {
    screen.classList.add('hidden');
    setTimeout(() => { screen.style.display = 'none'; }, 600);
  }, delay);
}

// ===== DOT CURSOR =====
function initDotCursor() {
  const dot = document.getElementById('dot-cursor');
  if (!dot) return;
  let tx = 0, ty = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  function update() {
    cx += (tx - cx) * 0.15;
    cy += (ty - cy) * 0.15;
    dot.style.left = cx + 'px';
    dot.style.top = cy + 'px';
    requestAnimationFrame(update);
  }
  update();
  document.querySelectorAll('a, button, [role="button"], input, select, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => dot.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => dot.classList.remove('cursor-hover'));
  });
}

// ===== THEME =====
const THEMES = {
  midnight:  { label: 'Midnight',  dark: true },
  cyberpunk: { label: 'Cyberpunk', dark: true },
  matrix:    { label: 'Matrix',    dark: true },
  galaxy:    { label: 'Galaxy',    dark: true },
  default:   { label: 'Default',   dark: false },
  sakura:    { label: 'Sakura',    dark: false },
  amber:     { label: 'Amber',     dark: false },
  mint:      { label: 'Mint',      dark: false }
};

function applyTheme(name) {
  const t = THEMES[name] || THEMES.midnight;
  document.body.setAttribute('data-theme', name);
  localStorage.setItem('theme', name);

  const label = document.getElementById('theme-label');
  if (label) label.textContent = t.label;

  const sun = document.getElementById('sun-icon');
  const moon = document.getElementById('moon-icon');
  if (sun) sun.classList.toggle('hidden', t.dark);
  if (moon) moon.classList.toggle('hidden', !t.dark);

  document.querySelectorAll('.theme-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === name);
  });
}

function initTheme() {
  const saved = localStorage.getItem('theme') || 'midnight';
  applyTheme(saved);

  // Theme picker toggle
  const wrap = document.getElementById('theme-wrap');
  const btn  = document.getElementById('theme-toggle');
  const drop = document.getElementById('theme-dropdown');
  const closeBtn = document.getElementById('theme-close');

  btn?.addEventListener('click', e => {
    e.stopPropagation();
    wrap.classList.toggle('open');
    drop.classList.toggle('hidden');
  });
  closeBtn?.addEventListener('click', e => {
    e.stopPropagation();
    wrap.classList.remove('open');
    drop.classList.add('hidden');
  });
  document.addEventListener('click', e => {
    if (!wrap?.contains(e.target)) {
      wrap?.classList.remove('open');
      drop?.classList.add('hidden');
    }
  });

  document.querySelectorAll('.theme-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      applyTheme(opt.dataset.theme);
      wrap.classList.remove('open');
      drop.classList.add('hidden');
    });
  });
}

// ===== MODERN MENU (always visible, no hide on scroll) =====
function initModernMenu() {
  // Active pill link on scroll
  const links = document.querySelectorAll('.pill-link');
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = 'home';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 90) current = s.id;
    });
    links.forEach(l => l.classList.toggle('active', l.dataset.section === current));
  }, { passive: true });

  // Music pill button opens widget
  document.getElementById('pill-music-btn')?.addEventListener('click', () => {
    document.getElementById('musicWidget')?.classList.toggle('hidden');
  });
}

// ===== SECTION THEME COLORS =====
function initSectionThemes() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const net = new ParticleNetwork(canvas);
  const colorMap = {
    home: '#ff0000', about: '#ff6600', skills: '#ffd700',
    projects: '#ff0044', contact: '#ff0000'
  };
  const sections = document.querySelectorAll('.section-theme');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const theme = e.target.dataset.theme;
        if (colorMap[theme]) net.setColor(colorMap[theme]);
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => observer.observe(s));
}


// ===== MUSIC SYSTEM =====
const MUSIC_FILES = [
  'music/lake-marie-i-ian-aisling-main-version-27028-01-02.mp3',
  'music/twinkle-twinkle-little-star-dan-barracuda-main-version-38365-01-19.mp3',
  'music/your-touch-monument-music-main-version-44736-02-04.mp3'
];
const MUSIC_NAMES = [
  'Lake Marie',
  'Twinkle Twinkle',
  'Your Touch'
];
let audio = null;
let currentTrack = 0;
let isPlaying = false;
let musicReady = false;

function formatTime(s) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return m + ':' + String(sec).padStart(2, '0');
}

function updateMusicUI() {
  const playBtn = document.getElementById('playPauseBtn');
  const disc = document.querySelector('.music-disc');
  const eq = document.querySelector('.music-equalizer');
  const trackName = document.getElementById('trackName');
  if (playBtn) {
    playBtn.querySelector('.play-icon').classList.toggle('hidden', isPlaying);
    playBtn.querySelector('.pause-icon').classList.toggle('hidden', !isPlaying);
  }
  if (disc) disc.classList.toggle('playing', isPlaying);
  if (eq) eq.classList.toggle('paused', !isPlaying);
  if (trackName) trackName.textContent = MUSIC_FILES[currentTrack].replace('.mp3', '').replace(/[-_]/g, ' ').toUpperCase();
}

function loadTrack(idx) {
  currentTrack = ((idx % MUSIC_FILES.length) + MUSIC_FILES.length) % MUSIC_FILES.length;
  if (!audio) { audio = new Audio(); audio.volume = 0.7; }
  audio.src = MUSIC_FILES[currentTrack];
  audio.load();
  const trackNameEl = document.getElementById('trackName');
  if (trackNameEl) trackNameEl.textContent = MUSIC_NAMES[currentTrack] || MUSIC_FILES[currentTrack].split('/').pop().replace('.mp3','').replace(/[-_]/g,' ');
  updateMusicUI();
  if (isPlaying) audio.play().catch(() => {});
  audio.ontimeupdate = () => {
    const cur = document.getElementById('currentTime');
    const tot = document.getElementById('totalTime');
    const rem = document.getElementById('remainingTime');
    const fill = document.getElementById('progressFill');
    const slider = document.getElementById('progressSlider');
    if (cur) cur.textContent = formatTime(audio.currentTime);
    if (tot) tot.textContent = formatTime(audio.duration);
    if (rem) rem.textContent = '-' + formatTime((audio.duration || 0) - audio.currentTime);
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    if (fill) fill.style.width = pct + '%';
    if (slider) slider.value = pct;
  };
  audio.onended = () => loadTrack(currentTrack + 1);
}

function togglePlay() {
  if (!audio) loadTrack(0);
  if (isPlaying) { audio.pause(); isPlaying = false; }
  else { audio.play().catch(() => {}); isPlaying = true; }
  updateMusicUI();
}

function initMusicSystem() {
  const floatBtn = document.getElementById('musicFloatBtn');
  const widget = document.getElementById('musicWidget');
  const closeBtn = document.getElementById('closeMusicWidget');
  const playBtn = document.getElementById('playPauseBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const volSlider = document.getElementById('volumeSlider');
  const volValue = document.getElementById('volumeValue');
  const volBtn = document.getElementById('volumeBtn');
  const progSlider = document.getElementById('progressSlider');

  if (floatBtn) {
    floatBtn.style.display = 'flex';
    floatBtn.addEventListener('click', () => {
      widget && widget.classList.toggle('hidden');
      if (!musicReady) { loadTrack(0); musicReady = true; }
    });
  }
  if (closeBtn) closeBtn.addEventListener('click', () => widget && widget.classList.add('hidden'));
  if (playBtn) playBtn.addEventListener('click', togglePlay);
  if (prevBtn) prevBtn.addEventListener('click', () => { loadTrack(currentTrack - 1); if (isPlaying) audio.play().catch(() => {}); });
  if (nextBtn) nextBtn.addEventListener('click', () => { loadTrack(currentTrack + 1); if (isPlaying) audio.play().catch(() => {}); });
  if (volSlider) {
    volSlider.addEventListener('input', () => {
      const v = volSlider.value / 100;
      if (audio) audio.volume = v;
      if (volValue) volValue.textContent = volSlider.value + '%';
      if (volBtn) {
        volBtn.querySelector('.volume-high').classList.toggle('hidden', v === 0);
        volBtn.querySelector('.volume-low').classList.toggle('hidden', v === 0 || v > 0.5);
        volBtn.querySelector('.volume-mute').classList.toggle('hidden', v !== 0);
      }
    });
  }
  if (volBtn) {
    volBtn.addEventListener('click', () => {
      if (!audio) return;
      audio.muted = !audio.muted;
      volBtn.querySelector('.volume-high').classList.toggle('hidden', audio.muted);
      volBtn.querySelector('.volume-mute').classList.toggle('hidden', !audio.muted);
    });
  }
  if (progSlider) {
    progSlider.addEventListener('input', () => {
      if (audio && audio.duration) audio.currentTime = (progSlider.value / 100) * audio.duration;
    });
  }
  updateMusicUI();
}


// ===== SMOOTH SCROLL FOR NAV LINKS =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navH = document.getElementById('main-nav')?.offsetHeight || 64;
        window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
      }
    });
  });
}

// ===== FADE IN SECTIONS =====
function initFadeIn() {
  const style = document.createElement('style');
  style.textContent = '.fade-in-section{opacity:0;transform:translateY(24px);transition:opacity .7s,transform .7s}.fade-in-section.visible{opacity:1;transform:none}';
  document.head.appendChild(style);
  const sections = document.querySelectorAll('.section-theme, .skill-card, .project-card');
  sections.forEach(el => el.classList.add('fade-in-section'));
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  sections.forEach(el => obs.observe(el));
}

// ===== ACTIVE NAV LINK =====
function initActiveNav() {
  const links = document.querySelectorAll('.menu-link, .mobile-link');
  const sections = document.querySelectorAll('section[id]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => {
          l.style.color = l.getAttribute('href') === '#' + e.target.id ? '#ff0000' : '';
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => obs.observe(s));
}

// ===== INIT ALL =====
document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initDotCursor();
  initTheme();
  initModernMenu();
  initMobileMenu();
  initTypingEffect();
  initSkills();
  fetchProjects();
  initCSSDragon();
  initRealSnake();
  initSectionThemes();
  initMusicSystem();
  initSmoothScroll();
  initFadeIn();
  initActiveNav();
});


