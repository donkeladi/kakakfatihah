(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('locked');

  /* Umur pada hari lahir terdekat (6 Nov 1997) */
  (() => {
    const now = new Date(), y = now.getFullYear();
    const near = [y - 1, y, y + 1].map(v => new Date(v, 10, 6)).sort((a, b) => Math.abs(a - now) - Math.abs(b - now))[0];
    $('#heroAge').textContent = '6 November · Tahun ke-' + (near.getFullYear() - 1997);
  })();

  /* Nama dipecah kepada huruf (kata kekal utuh) */
  const nameEl = $('#heroName');
  const text = nameEl.textContent; nameEl.textContent = '';
  let idx = 0;
  text.split(' ').forEach((word, wi, arr) => {
    const w = document.createElement('span'); w.className = 'w';
    [...word].forEach(c => {
      const s = document.createElement('span');
      s.className = 'ch'; s.style.setProperty('--i', idx++);
      s.setAttribute('aria-hidden', 'true'); s.textContent = c; w.appendChild(s);
    });
    nameEl.appendChild(w);
    if (wi < arr.length - 1) { nameEl.appendChild(document.createTextNode(' ')); idx++; }
  });

  /* Reveal semasa scroll */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  const watch = () => {
    document.querySelectorAll('.reveal,.letter__body p').forEach((el, i) => {
      if (el.classList.contains('reveal')) el.style.setProperty('--d', (i % 3) * .1 + 's');
      io.observe(el);
    });
    io.observe(nameEl);
  };

  /* Buka kejutan */
  const intro = $('#intro'), orb = $('#openBtn');
  let opened = false;
  orb.addEventListener('click', () => {
    if (opened) return; opened = true;
    orb.classList.add('pressed');
    startMusic();
    setTimeout(() => {
      intro.classList.add('gone');
      document.body.classList.remove('locked');
      window.scrollTo(0, 0);
      watch();
    }, reduce ? 50 : 250);
  });

  /* Parallax gambar hero */
  const floats = [...document.querySelectorAll('.float')];
  if (!reduce) {
    let tick = false;
    addEventListener('scroll', () => {
      if (tick) return; tick = true;
      requestAnimationFrame(() => {
        const y = Math.min(scrollY, innerHeight * 1.2);
        floats.forEach(f => f.style.setProperty('--py', (y * parseFloat(f.dataset.speed)) + 'px'));
        tick = false;
      });
    }, { passive: true });
  }

  /* Galeri gelongsor: seret dengan tetikus + butang */
  document.querySelectorAll('.reel').forEach(reel => {
    let down = false, sx = 0, sl = 0, moved = false;
    reel.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = reel.scrollLeft;
    });
    addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; reel.classList.add('drag'); }
      reel.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', () => { down = false; reel.classList.remove('drag'); });
    reel.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') reel.scrollBy({ left: 320, behavior: 'smooth' });
      if (e.key === 'ArrowLeft') reel.scrollBy({ left: -320, behavior: 'smooth' });
    });
  });
  document.querySelectorAll('.reel-btn').forEach(b => b.addEventListener('click', () => {
    const r = document.getElementById(b.dataset.reel);
    r.scrollBy({ left: (b.classList.contains('next') ? 1 : -1) * r.clientWidth * .7, behavior: 'smooth' });
  }));

  /* Muzik (pilihan: audio/lagu.mp3) */
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
  const colors = ['#ffc2a8', '#ff8fa3', '#b9a6ff', '#ffd27a', '#f6eef0'];
  function burst() {
    if (reduce) return;
    for (let i = 0; i < 160; i++) parts.push({
      x: innerWidth / 2, y: innerHeight * .55,
      vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 3,
      w: 4 + Math.random() * 5, h: 7 + Math.random() * 8, r: Math.random() * 6,
      vr: (Math.random() - .5) * .3, c: colors[i % colors.length], life: 0
    });
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.life < 260 && p.y < innerHeight + 20);
    for (const p of parts) {
      p.vy += .22; p.vx *= .992; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.globalAlpha = Math.max(0, 1 - p.life / 260);
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
})();
