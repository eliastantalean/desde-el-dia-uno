/* ═══════════════════════════════════════════════════════════
   DESDE EL DÍA UNO — script.js

   ÍNDICE:
   1.  CONFIGURACIÓN — edita aquí el texto, la carta y la velocidad
   2.  Inicio
   3.  Hero: transición al hacer click
   4.  Pétalos flotantes (canvas)
   5.  Parallax suave
   6.  Scroll reveal (secciones)
   7.  Timeline (aparición al scrollear)
   8.  Carta con efecto máquina de escribir
   9.  Galería + Lightbox
   10. Tarjetas de recuerdos
   11. Frase grande
   12. Reproductor de música
   ═══════════════════════════════════════════════════════════ */


/* ───────────────────────────────────────────────────────────
   1. CONFIGURACIÓN — MODIFICA ESTOS VALORES

   LETTER_PARAGRAPHS: array de párrafos de la carta.
     · Cada string es un párrafo independiente.
     · '---' crea una pausa larga sin texto (separador emocional).
     · '\n' dentro de un string inserta salto de línea dentro del párrafo.
     · Las líneas que empiezan con '—' se mostrarán en itálica (firma).

   TYPEWRITER: velocidades en milisegundos.
     · charDelay    — delay entre cada carácter
     · paraDelay    — pausa entre párrafos
     · longPause    — pausa larga para '---'
     · startDelay   — espera antes de empezar a escribir
   ─────────────────────────────────────────────────────────── */

const LETTER_PARAGRAPHS = [
  'Hola.',

  'Si estás leyendo esto, es porque algo que durante mucho tiempo solo existió como esperanza se volvió real.',

  'No sé exactamente en qué momento llegaste a esta página. Lo que sí sé es cuándo escribí estas palabras: mucho antes. Mucho antes de saber si algún día tendrías entre tus manos una rosa de origami con un secreto adentro.',

  '---',

  'Hay cosas que guardamos sin saber muy bien por qué. A veces es miedo. A veces es que algunas cosas merecen ser escritas aunque nadie las lea jamás.',

  'Tú eres de esas cosas.',

  '---',

  'Hubo conversaciones que terminaban y me dejaban pensando horas después. Hubo momentos en los que pensé: ¿estoy inventando esto, o hay algo real aquí?',

  'Esta rosa lleva un tiempo guardando ese secreto. La construí pensando en ti, sabiendo que tal vez nunca la abrirías. O que sí. Y que si lo hacías, significaría que nuestra historia había empezado de verdad.',

  '---',

  'Quería que supieras que todo lo que sentí fue real. Que no fue un impulso. Que hubo días en que pensé en ti sin razón aparente, y noches en que me pregunté si estaba equivocado al esperar.',

  'Tal vez sí. Tal vez no.',

  'Pero lo que no inventé fue la certeza de que valía la pena intentarlo.',

  '---',

  'Gracias por abrir la rosa.\nGracias por estar aquí.',

  'Con mucho cariño,',

  /* MODIFICAR: Firma de la carta */
  '— Elias',
];

const TYPEWRITER = {
  charDelay:  26,    /* ms entre cada carácter */
  paraDelay:  620,   /* ms entre párrafos */
  longPause:  1350,  /* ms para separadores '---' */
  startDelay: 500,   /* ms antes de empezar */
};


/* ───────────────────────────────────────────────────────────
   2. INICIO
   ─────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initPetals();
  initParallax();
  initScrollReveal();
  initTimeline();
  initGallery();
  initMemories();
  initQuote();
  initLetter();       /* Inicia cuando la sección es visible */
  initMusicPlayer();
});


/* ───────────────────────────────────────────────────────────
   3. HERO — Transición al hacer click en el botón
   ─────────────────────────────────────────────────────────── */
function initHero() {
  const btn      = document.getElementById('discover-btn');
  const hero     = document.getElementById('hero');
  const nextSec  = document.getElementById('timeline');

  if (!btn || !hero || !nextSec) return;

  btn.addEventListener('click', () => {
    hero.style.transition = 'opacity 0.75s ease, transform 0.75s ease';
    hero.style.opacity    = '0';
    hero.style.transform  = 'translateY(-18px)';

    setTimeout(() => {
      nextSec.scrollIntoView({ behavior: 'smooth', block: 'start' });

      /* Restaura el hero por si el usuario vuelve arriba */
      setTimeout(() => {
        hero.style.transition = '';
        hero.style.opacity    = '';
        hero.style.transform  = '';
      }, 1000);
    }, 680);
  });
}


/* ───────────────────────────────────────────────────────────
   4. PÉTALOS FLOTANTES (Canvas)
   ─────────────────────────────────────────────────────────── */
function initPetals() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  const petals = [];
  let   raf;

  const COUNT  = window.innerWidth < 600 ? 14 : 26;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  function petalColor() {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return dark
      ? 'rgba(170, 130, 86, 0.28)'
      : 'rgba(180, 130, 100, 0.22)';
  }

  /* Clase pétalo */
  function Petal(initial) {
    this.x    = Math.random() * canvas.width;
    this.y    = initial ? Math.random() * canvas.height : -12;
    this.r    = Math.random() * 3.5 + 1.8;
    this.vy   = Math.random() * 0.38 + 0.14;
    this.vx   = (Math.random() - 0.5) * 0.22;
    this.rot  = Math.random() * Math.PI * 2;
    this.rSpd = (Math.random() - 0.5) * 0.007;
    this.alpha= Math.random() * 0.45 + 0.18;
    this.sway = Math.random() * 0.55 + 0.1;
    this.swF  = Math.random() * 0.009 + 0.003;
    this.swO  = Math.random() * Math.PI * 2;
  }

  Petal.prototype.update = function(t) {
    this.y   += this.vy;
    this.x   += this.vx + Math.sin(t * this.swF + this.swO) * this.sway;
    this.rot += this.rSpd;

    if (this.y > canvas.height + 16 || this.x < -16 || this.x > canvas.width + 16) {
      Object.assign(this, new Petal(false));
    }
  };

  Petal.prototype.draw = function() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, this.r, this.r * 1.65, 0, 0, Math.PI * 2);
    ctx.fillStyle = petalColor();
    ctx.fill();
    ctx.restore();
  };

  for (let i = 0; i < COUNT; i++) petals.push(new Petal(true));

  let t = 0;

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t++;
    petals.forEach(p => { p.update(t); p.draw(); });
    raf = requestAnimationFrame(loop);
  }

  loop();

  /* Pausa cuando la pestaña está oculta */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else loop();
  });
}


/* ───────────────────────────────────────────────────────────
   5. PARALLAX SUAVE en la rosa del hero
   ─────────────────────────────────────────────────────────── */
function initParallax() {
  const rose = document.querySelector('.hero-rose-wrapper');
  const hero = document.getElementById('hero');
  if (!rose || !hero) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const sy = window.scrollY;
        if (sy < hero.offsetHeight) {
          rose.style.transform = `translateY(${sy * 0.1}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}


/* ───────────────────────────────────────────────────────────
   6. SCROLL REVEAL — secciones
   ─────────────────────────────────────────────────────────── */
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal-section').forEach(s => obs.observe(s));
}


/* ───────────────────────────────────────────────────────────
   7. TIMELINE — ítems aparecen al hacer scroll
   ─────────────────────────────────────────────────────────── */
function initTimeline() {
  const items = document.querySelectorAll('.timeline-item');
  if (!items.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => obs.observe(el));
}


/* ───────────────────────────────────────────────────────────
   8. CARTA CON EFECTO MÁQUINA DE ESCRIBIR
   ─────────────────────────────────────────────────────────── */
function initLetter() {
  const body    = document.getElementById('letter-body');
  const section = document.getElementById('letter');
  if (!body || !section) return;

  let started = false;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !started) {
        started = true;
        obs.disconnect();
        setTimeout(runTypewriter, TYPEWRITER.startDelay);
      }
    });
  }, { threshold: 0.35 });

  obs.observe(section);

  /* Cursor parpadeante */
  const cursor = document.createElement('span');
  cursor.className   = 'l-cursor';
  cursor.setAttribute('aria-hidden', 'true');

  function runTypewriter() {
    let pIdx = 0;

    function next() {
      if (pIdx >= LETTER_PARAGRAPHS.length) {
        /* Carta terminada — ocultar cursor suavemente */
        setTimeout(() => cursor.classList.add('is-done'), 1800);
        return;
      }

      const raw = LETTER_PARAGRAPHS[pIdx];
      pIdx++;

      if (raw === '---') {
        setTimeout(next, TYPEWRITER.longPause);
        return;
      }

      /* Crear párrafo */
      const p = document.createElement('p');
      if (raw.startsWith('—') || raw === 'Con mucho cariño,') {
        p.classList.add('l-sig');
      }

      /* Mover cursor al nuevo párrafo */
      p.appendChild(cursor);
      body.appendChild(p);

      /* Scroll suave hacia el cursor mientras escribe */
      cursor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      let cIdx = 0;

      function typeChar() {
        if (cIdx < raw.length) {
          const ch = raw[cIdx++];
          const node = ch === '\n' ? document.createElement('br') : document.createTextNode(ch);
          p.insertBefore(node, cursor);

          const jitter = TYPEWRITER.charDelay + (Math.random() * 18 - 9);
          setTimeout(typeChar, Math.max(8, jitter));
        } else {
          /* Párrafo terminado */
          setTimeout(next, TYPEWRITER.paraDelay);
        }
      }

      typeChar();
    }

    next();
  }
}


/* ───────────────────────────────────────────────────────────
   9. GALERÍA + LIGHTBOX
   ─────────────────────────────────────────────────────────── */
function initGallery() {
  const items       = document.querySelectorAll('.gallery-item');
  const lightbox    = document.getElementById('lightbox');
  const lbImg       = document.getElementById('lightbox-img');
  const lbCap       = document.getElementById('lightbox-cap');
  const lbClose     = document.getElementById('lightbox-close');

  if (!items.length || !lightbox) return;

  /* Manejo de carga de imágenes */
  items.forEach(item => {
    const img = item.querySelector('img');
    if (!img) return;

    const onLoad = () => img.classList.add('is-loaded');
    const onErr  = () => item.classList.add('no-img');

    if (img.complete && img.naturalWidth > 0) onLoad();
    else { img.addEventListener('load', onLoad); img.addEventListener('error', onErr); }
  });

  /* Scroll reveal de la galería con stagger */
  const gallObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = Array.from(items).indexOf(e.target);
        setTimeout(() => e.target.classList.add('is-visible'), idx * 75);
        gallObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  items.forEach(el => gallObs.observe(el));

  /* Lightbox */
  function open(item) {
    const src = item.dataset.src || item.querySelector('img')?.src || '';
    const cap = item.dataset.caption || '';

    lbImg.src = src;
    lbImg.alt = item.querySelector('img')?.alt || '';
    lbCap.textContent = cap;

    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => requestAnimationFrame(() => lightbox.classList.add('is-open')));
    lbClose.focus();
  }

  function close() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => {
      lightbox.setAttribute('hidden', '');
      lbImg.src = '';
    }, 280);
  }

  items.forEach(item => {
    item.addEventListener('click',   () => open(item));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(item); }
    });
  });

  lbClose.addEventListener('click', close);

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !lightbox.hasAttribute('hidden')) close();
  });
}


/* ───────────────────────────────────────────────────────────
   10. TARJETAS DE RECUERDOS
   ─────────────────────────────────────────────────────────── */
function initMemories() {
  const cards = document.querySelectorAll('.mem-card');
  if (!cards.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -20px 0px' });

  cards.forEach(el => obs.observe(el));
}


/* ───────────────────────────────────────────────────────────
   11. FRASE GRANDE
   ─────────────────────────────────────────────────────────── */
function initQuote() {
  const lines = document.querySelectorAll('.bq-line');
  if (!lines.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        lines.forEach((l, i) => setTimeout(() => l.classList.add('is-visible'), i * 380));
        obs.disconnect();
      }
    });
  }, { threshold: 0.45 });

  obs.observe(lines[0]);
}


/* ───────────────────────────────────────────────────────────
   12. REPRODUCTOR DE MÚSICA
   ─────────────────────────────────────────────────────────── */
function initMusicPlayer() {
  const audio  = document.getElementById('music-audio');
  const btn    = document.getElementById('music-btn');
  const track  = document.getElementById('music-track');
  const fill   = document.getElementById('music-fill');
  const thumb  = document.getElementById('music-thumb');
  const timeEl = document.getElementById('music-time');
  const iPlay  = btn?.querySelector('.icon-play');
  const iPause = btn?.querySelector('.icon-pause');

  if (!audio || !btn) return;

  let dragging = false;

  function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function setProgress(pct) {
    pct = Math.max(0, Math.min(1, pct));
    fill.style.width  = (pct * 100) + '%';
    thumb.style.left  = (pct * 100) + '%';
    track.setAttribute('aria-valuenow', Math.round(pct * 100));
  }

  /* Play / Pause */
  btn.addEventListener('click', () => {
    if (audio.paused) audio.play().catch(() => {});
    else              audio.pause();
  });

  audio.addEventListener('play', () => {
    iPlay.hidden  = true;
    iPause.hidden = false;
    btn.setAttribute('aria-label', 'Pausar música');
  });

  audio.addEventListener('pause', () => {
    iPlay.hidden  = false;
    iPause.hidden = true;
    btn.setAttribute('aria-label', 'Reproducir música');
  });

  audio.addEventListener('timeupdate', () => {
    if (dragging || !audio.duration) return;
    setProgress(audio.currentTime / audio.duration);
    timeEl.textContent = fmt(audio.currentTime);
  });

  audio.addEventListener('ended', () => { setProgress(1); });

  /* Seek — mouse */
  function seekAt(clientX) {
    const rect = track.getBoundingClientRect();
    const pct  = (clientX - rect.left) / rect.width;
    if (audio.duration) {
      audio.currentTime = pct * audio.duration;
      setProgress(pct);
      timeEl.textContent = fmt(audio.currentTime);
    }
  }

  track.addEventListener('click',     e => seekAt(e.clientX));
  track.addEventListener('mousedown', e => { dragging = true; seekAt(e.clientX); });
  document.addEventListener('mousemove', e => { if (dragging) seekAt(e.clientX); });
  document.addEventListener('mouseup',   () => { dragging = false; });

  /* Seek — touch */
  track.addEventListener('touchstart', e => {
    dragging = true; seekAt(e.touches[0].clientX);
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (dragging) seekAt(e.touches[0].clientX);
  }, { passive: true });

  document.addEventListener('touchend', () => { dragging = false; });

  /* Teclado en la barra de progreso */
  track.addEventListener('keydown', e => {
    if (!audio.duration) return;
    const step = 5;
    if (e.key === 'ArrowRight') audio.currentTime = Math.min(audio.duration, audio.currentTime + step);
    if (e.key === 'ArrowLeft')  audio.currentTime = Math.max(0, audio.currentTime - step);
  });
}
