(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Umur: tahun ke berapa pada hari lahir yang paling hampir (6 Nov 1997) */
  (() => {
    const now = new Date(), y = now.getFullYear();
    const near = [y - 1, y, y + 1].map(v => new Date(v, 10, 6))
      .sort((a, b) => Math.abs(a - now) - Math.abs(b - now))[0];
    $('#heroAge').textContent = 'Tahun ke-' + (near.getFullYear() - 1997);
  })();

  /* Nama: pecah kepada huruf untuk animasi */
  const nameEl = $('#heroName');
  const text = nameEl.textContent;
  nameEl.textContent = '';
  let idx = 0;
  text.split(' ').forEach((word, wi, arr) => {
    const w = document.createElement('span');
    w.style.whiteSpace = 'nowrap'; w.style.display = 'inline-block';
    [...word].forEach(c => {
      const s = document.createElement('span');
      s.className = 'ch'; s.style.setProperty('--i', idx++);
      s.setAttribute('aria-hidden', 'true'); s.textContent = c;
      w.appendChild(s);
    });
    nameEl.appendChild(w);
    if (wi < arr.length - 1) { nameEl.appendChild(document.createTextNode(' ')); idx++; }
  });

  /* Reveal semasa scroll */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .2, rootMargin: '0px 0px -8% 0px' });
  const watch = () => {
    document.querySelectorAll('.reveal,.letter__body p').forEach((el, i) => {
      if (!el.dataset.d && el.classList.contains('reveal')) el.style.setProperty('--d', (i % 4) * .12 + 's');
      io.observe(el);
    });
    io.observe(nameEl);
  };

  /* Buka sampul */
  const intro = $('#intro'), env = $('#openBtn');
  let opened = false;
  env.addEventListener('click', () => {
    if (opened) return; opened = true;
    env.classList.add('open');
    startMusic();
    setTimeout(() => {
      intro.classList.add('gone');
      document.body.classList.remove('locked');
      window.scrollTo(0, 0);
      watch();
    }, reduce ? 100 : 1700);
  });

  /* Muzik (pilihan: letak audio/lagu.mp3) */
  const bgm = $('#bgm'), mBtn = $('#musicBtn');
  bgm.addEventListener('loadedmetadata', () => { mBtn.hidden = false; });
  bgm.volume = .6;
  function startMusic() { if (!mBtn.hidden) bgm.play().then(() => mBtn.classList.add('on')).catch(() => {}); }
  mBtn.addEventListener('click', () => {
    if (bgm.paused) { bgm.play(); mBtn.classList.add('on'); mBtn.setAttribute('aria-label', 'Jeda muzik'); }
    else { bgm.pause(); mBtn.classList.remove('on'); mBtn.setAttribute('aria-label', 'Mainkan muzik'); }
  });

  /* Lilin + confetti */
  const candle = $('#candle'), cake = $('#cake');
  const cv = $('#confetti'), ctx = cv.getContext('2d');
  let parts = [], raf = 0;
  const size = () => { const r = devicePixelRatio || 1; cv.width = innerWidth * r; cv.height = innerHeight * r; ctx.setTransform(r, 0, 0, r, 0, 0); };
  addEventListener('resize', size); size();
  const colors = ['#b08d57', '#8a2f3c', '#e8dcc4', '#d9b97f', '#2a2523'];
  function burst() {
    if (reduce) return;
    for (let i = 0; i < 110; i++) parts.push({
      x: innerWidth / 2, y: innerHeight * .55,
      vx: (Math.random() - .5) * 11, vy: -Math.random() * 12 - 3,
      w: 4 + Math.random() * 5, h: 7 + Math.random() * 7, r: Math.random() * 6,
      vr: (Math.random() - .5) * .3, c: colors[i % colors.length], life: 0
    });
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.life < 240 && p.y < innerHeight + 20);
    for (const p of parts) {
      p.vy += .22; p.vx *= .992; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.globalAlpha = Math.max(0, 1 - p.life / 240);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    }
    raf = parts.length ? requestAnimationFrame(tick) : 0;
    if (!raf) ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
  candle.addEventListener('click', () => {
    if (candle.classList.contains('out')) return;
    candle.classList.add('out'); candle.setAttribute('aria-pressed', 'true');
    cake.classList.add('done');
    setTimeout(burst, 350);
  });

  /* Fallback jika JS reveal gagal sebelum sampul dibuka tidak diperlukan; sampul sentiasa muncul dahulu */
})();
