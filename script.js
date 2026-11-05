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
      hero.classList.add('go');
      hero.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
      watch();
    }, reduce ? 50 : 250);
  });

  /* Hero: parallax kedalaman + condong 3D mengikut tetikus */
  const hero = $('#hero');
  if (!reduce) {
    let tick = false;
    addEventListener('scroll', () => {
      if (tick) return; tick = true;
      requestAnimationFrame(() => {
        const y = Math.min(scrollY, innerHeight * 1.2);
        hero.style.setProperty('--py', (y * .12) + 'px');
        hero.style.setProperty('--ty', (y * -.18) + 'px');
        tick = false;
      });
    }, { passive: true });
    if (matchMedia('(hover:hover)').matches) {
      hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        hero.style.setProperty('--ry', (x * 9) + 'deg');
        hero.style.setProperty('--rx', (-y * 5) + 'deg');
        hero.style.setProperty('--fx', (x * -14) + 'px');
        hero.style.setProperty('--ox', (x * 30) + 'px');
        hero.style.setProperty('--oy', (y * 20) + 'px');
      });
      hero.addEventListener('pointerleave', () => ['--ry','--rx','--fx','--ox','--oy'].forEach(k => hero.style.removeProperty(k)));
    }
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
    setTimeout(() => revealBtn.classList.add('show'), reduce ? 200 : 2600);
  });

  /* Special reveal */
  const revealBtn = $('#revealBtn'), special = $('#special');
  revealBtn.addEventListener('click', () => {
    special.hidden = false;
    revealBtn.classList.remove('show');
    requestAnimationFrame(() => {
      special.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      setTimeout(() => special.classList.add('on'), reduce ? 0 : 700);
      setTimeout(() => nextBtn.classList.add('show'), reduce ? 300 : 6200);
      setTimeout(burst, reduce ? 0 : 1100);
    });
  });

  /* Special -> Finale */
  const nextBtn = $('#nextBtn'), finale = $('#finale');
  nextBtn.addEventListener('click', () => {
    finale.hidden = false; nextBtn.classList.remove('show');
    requestAnimationFrame(() => finale.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }));
  });

  /* Kalendar: tarikh lahir Adik Firdaus = 27 April 2000 */
  const ANSWER = { y: 2000, m: 3, d: 27 };
  const MONTHS = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
  const mSel = $('#calMonth'), ySel = $('#calYear'), grid = $('#calGrid');
  const okBtn = $('#calOk'), msg = $('#calMsg'), selTxt = $('#calSel'), cal = $('#cal');
  const today = new Date();
  MONTHS.forEach((n, i) => mSel.add(new Option(n, i)));
  for (let y = today.getFullYear(); y >= 1980; y--) ySel.add(new Option(y, y));
  mSel.value = today.getMonth(); ySel.value = today.getFullYear();
  let picked = null, tries = 0;
  function drawCal() {
    const y = +ySel.value, m = +mSel.value;
    const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
    grid.textContent = '';
    for (let i = 0; i < first; i++) grid.appendChild(document.createElement('span'));
    for (let d = 1; d <= days; d++) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'cal__day'; b.textContent = d;
      const on = picked && picked.y === y && picked.m === m && picked.d === d;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.setAttribute('aria-label', d + ' ' + MONTHS[m] + ' ' + y);
      b.addEventListener('click', () => {
        picked = { y, m, d };
        selTxt.textContent = d + ' ' + MONTHS[m] + ' ' + y;
        okBtn.disabled = false; msg.textContent = ''; msg.className = 'cal__msg';
        drawCal();
      });
      grid.appendChild(b);
    }
  }
  const shift = n => {
    let m = +mSel.value + n, y = +ySel.value;
    if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; }
    if (y < 1980 || y > today.getFullYear()) return;
    mSel.value = m; ySel.value = y; drawCal();
  };
  $('#calPrev').addEventListener('click', () => shift(-1));
  $('#calNext').addEventListener('click', () => shift(1));
  mSel.addEventListener('change', drawCal); ySel.addEventListener('change', drawCal);
  drawCal();

  okBtn.addEventListener('click', () => {
    if (!picked) return;
    if (picked.y === ANSWER.y && picked.m === ANSWER.m && picked.d === ANSWER.d) {
      $('#gate').classList.add('ok');
      setTimeout(() => {
        $('#gate').hidden = true;
        const prize = $('#prize'); prize.hidden = false;
        requestAnimationFrame(() => { prize.classList.add('on'); initScratch(); });
        burst();
        setTimeout(burst, 700);
      }, reduce ? 0 : 700);
    } else {
      tries++;
      cal.classList.remove('shake'); void cal.offsetWidth; if (!reduce) cal.classList.add('shake');
      msg.className = 'cal__msg bad';
      msg.textContent = tries === 1 ? 'Hmm, belum tepat. Cuba lagi, Kak.'
        : tries === 2 ? 'Takkan lupa hari lahir adik sendiri…'
        : 'Petunjuk: tahun 2000, dan bulannya sebelum Mei.';
    }
  });

  /* Kad gores */
  let scratchReady = false;
  function initScratch() {
    if (scratchReady) return; scratchReady = true;
    const cv = $('#scratchCv'), box = $('#scratch'), g = cv.getContext('2d', { willReadFrequently: true });
    const r = devicePixelRatio || 1, W = box.clientWidth, H = box.clientHeight;
    cv.width = W * r; cv.height = H * r; g.scale(r, r);
    const f = g.createLinearGradient(0, 0, W, H);
    f.addColorStop(0, '#d9b97f'); f.addColorStop(.35, '#f6e3b4'); f.addColorStop(.6, '#c9a05a'); f.addColorStop(1, '#e8cf94');
    g.fillStyle = f; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 2;
    for (let x = -H; x < W; x += 26) { g.beginPath(); g.moveTo(x, H); g.lineTo(x + H, 0); g.stroke(); }
    g.fillStyle = 'rgba(90,60,30,.7)'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '700 ' + Math.max(18, W * .07) + 'px Bricolage Grotesque, sans-serif';
    g.fillText('GORES DI SINI', W / 2, H / 2 - 12);
    g.font = '400 ' + Math.max(12, W * .035) + 'px Bricolage Grotesque, sans-serif';
    g.fillText('guna jari kakak', W / 2, H / 2 + Math.max(16, W * .05));
    g.globalCompositeOperation = 'destination-out';
    let drawing = false, last = null, moves = 0, revealed = false;
    const pos = e => { const b = cv.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
    const line = (a, b) => { g.strokeStyle = '#000'; g.lineWidth = Math.max(34, W * .09); g.lineCap = 'round'; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); };
    function check() {
      const d = g.getImageData(0, 0, cv.width, cv.height).data; let clear = 0, n = 0;
      for (let i = 3; i < d.length; i += 4 * 37) { n++; if (d[i] < 40) clear++; }
      if (clear / n > .5) done();
    }
    function done() {
      if (revealed) return; revealed = true;
      cv.classList.add('done'); $('#scratchSkip').hidden = true;
      burst(); setTimeout(burst, 600);
    }
    cv.addEventListener('pointerdown', e => { drawing = true; last = pos(e); line(last, last); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (!drawing) return; const p = pos(e); line(last, p); last = p; if (++moves % 10 === 0) check(); });
    const end = () => { if (drawing) { drawing = false; check(); } };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    $('#scratchSkip').addEventListener('click', done);
  }
})();
