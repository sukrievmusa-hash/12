/* Сынақ — Арена боссов.
   Соло: босс заряжает удар, пока вы думаете. Верный ответ — ваш удар (быстрее и с комбо — сильнее),
   ошибка или конец заряда — удар босса и разбор задания. 3 сердца.
   Рейд: друзья по ссылке бьют одного босса вместе. Связь — публичный MQTT по WebSocket, без сервера и аккаунтов.
   Вопросы берутся из генераторов «Сынақ» (задания с одним ответом и контекстные). */
(function () {
  'use strict';
  const ART = window.SynaqBossArt, G = window.SynaqGen, C = window.SYNAQ_CONFIG || {};

  const BOSSES = [
    { k: 'math', subj: ['math'], name: 'Тригонометр', c: '#8b5cf6', c2: '#2e1065', hp: 100,
      start: 'Синусы, косинусы… А ты точно готов?', rage: 'Мои углы становятся острее!', win: 'Возвращайся, когда выучишь формулы.', die: 'Я… разложен… на множители…' },
    { k: 'physics', subj: ['physics'], name: 'Тесла-Колосс', c: '#22d3ee', c2: '#082f49', hp: 100,
      start: 'Сопротивление бесполезно. Измеряется в омах.', rage: 'Напряжение растёт!', win: 'Ты не выдержал нагрузки.', die: 'Короткое… замыкание…' },
    { k: 'informatics', subj: ['informatics'], name: 'Глюк-Паук', c: '#22c55e', c2: '#052e16', hp: 100,
      start: 'Найдёшь баг в моём коде? Не найдёшь.', rage: 'Stack overflow!!!', win: '404: победа не найдена.', die: 'Процесс… завершён… с кодом 0…' },
    { k: 'chemistry', subj: ['chemistry'], name: 'Кислотный Слизень', c: '#a3e635', c2: '#1a2e05', hp: 100,
      start: 'Я реагирую бурно. Особенно на ошибки.', rage: 'Реакция пошла экзотермическая!', win: 'Ты выпал в осадок.', die: 'Нейтрализован… pH 7…' },
    { k: 'biology', subj: ['biology'], name: 'Росянка-Мутант', c: '#f43f5e', c2: '#4c0519', hp: 100,
      start: 'Я питаюсь теми, кто не учил клетку.', rage: 'Мутация! Я стала сильнее!', win: 'Естественный отбор — в мою пользу.', die: 'Фотосинтез… прекращён…' },
    { k: 'geography', subj: ['geography'], name: 'Вулкан-Титан', c: '#f97316', c2: '#431407', hp: 100,
      start: 'Тектонические плиты на моей стороне.', rage: 'Извержение начинается!', win: 'Тебя засыпало пеплом.', die: 'Остываю… до базальта…' },
    { k: 'final', subj: ['math', 'physics', 'informatics', 'chemistry', 'biology', 'geography'], name: 'Хронос ЕНТ', c: '#f59e0b', c2: '#3b0a0a', hp: 150, need: 3,
      start: 'Все предметы сразу. Время идёт.', rage: 'Время на исходе!', win: 'Время вышло. До следующей попытки.', die: 'Часы… остановились…' },
  ];
  const BY = {}; BOSSES.forEach((b) => (BY[b.k] = b));
  const SUBJ_NAME = { math: 'математика', physics: 'физика', informatics: 'информатика', chemistry: 'химия', biology: 'биология', geography: 'география' };
  const ITEMS = {
    cheat: { i: '📜', name: 'Шпаргалка', what: 'убирает 2 неверных ответа' },
    freeze: { i: '🛡️', name: 'Упор', what: 'батыр упирается: босс не давит на этом вопросе' },
    double: { i: '💥', name: 'Рывок', what: 'следующий толчок ×2' },
  };
  const AVS = ['🦊', '🐼', '🐯', '🦁', '🐸', '🐵', '🦉', '🐺', '🐲', '🤖', '👾', '🧠', '🚀', '⚡'];
  const HEARTS = 3, RAID_SEC = 240;
  const BROKERS = window.SYNAQ_RAID_BROKERS || C.raidBrokers || ['wss://broker.emqx.io:8084/mqtt', 'wss://broker.hivemq.com:8884/mqtt', 'wss://test.mosquitto.org:8081/mqtt'];

  let H = null;             // помощники из app.js: app, LS, esc, toast, paywall, hasAccess, track
  let cur = null;           // текущий бой
  let raid = null;          // текущая комната
  const KEY = 'synaq_boss';
  const st = () => Object.assign({ stars: {}, best: {}, wins: 0, name: '', av: '', sound: true }, H.LS.get(KEY, {}));
  const saveSt = (s) => H.LS.set(KEY, s);
  const $ = (s, el = document) => el.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const strip = (s) => String(s || '').replace(/<[^>]+>/g, '');
  const mmss = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
  const stars = (n, tot = 3) => '★'.repeat(n) + `<i>${'★'.repeat(tot - n)}</i>`;
  const imgOf = (k) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ART[k].trim().replace('class="boss-svg"', 'xmlns="http://www.w3.org/2000/svg"').replace(/class="b-lid"/g, 'display="none"'));
  const siteUrl = () => location.origin + location.pathname;
  const starsTotal = (s) => Object.keys(s.stars).filter((k) => k !== 'final' && s.stars[k] > 0).length;
  const unlocked = (b, s) => !b.need || starsTotal(s) >= b.need;
  const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

  /* ---------- звук (синтез, без файлов) ---------- */
  let ac = null;
  function audio() { if (!st().sound) return null; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { return null; } return ac; }
  function tone(type, f1, f2, dur, vol, delay = 0) {
    const c = audio(); if (!c) return;
    const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol, freq, delay = 0) {
    const c = audio(); if (!c) return;
    const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const t = c.currentTime + delay, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = b; f.type = 'lowpass'; f.frequency.value = freq; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f).connect(g).connect(c.destination); s.start(t);
  }
  const SFX = {
    shot: () => tone('sine', 420, 980, 0.14, 0.18),
    hit: () => { tone('sine', 180, 50, 0.3, 0.6); noise(0.22, 0.4, 2400); },
    crit: () => { tone('sine', 200, 40, 0.4, 0.7); noise(0.3, 0.5, 4200); tone('square', 900, 1800, 0.14, 0.07, 0.05); },
    hurt: () => { tone('sawtooth', 240, 60, 0.4, 0.28); noise(0.35, 0.5, 900); },
    item: () => { tone('triangle', 600, 1200, 0.18, 0.2); tone('triangle', 900, 1800, 0.18, 0.12, 0.08); },
    tick: () => tone('square', 1300, 1250, 0.035, 0.035),
    rage: () => { tone('sawtooth', 120, 60, 0.8, 0.25); noise(0.8, 0.3, 500); },
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone('square', f, f, 0.2, 0.1, i * 0.11)),
    lose: () => [392, 330, 262, 196].forEach((f, i) => tone('triangle', f, f * 0.98, 0.28, 0.2, i * 0.15)),
  };
  const vib = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* нет вибрации */ } };

  /* ---------- колода вопросов ---------- */
  /* Билет из 25 вопросов по уровням сложности (от лёгких к сложным):
     1 — лёгкий, 12 шт. (40–50%): одношаговые задания с выбором одного ответа;
     2 — средний, 8 шт. (30–35%): задания по тексту/условию, нужно понять связи и применить правило;
     3 — сложный, 5 шт. (20–25%): выбор нескольких верных ответов из шести. */
  const TICKET = [12, 8, 5], TICKET_N = 25, LV_NAME = ['', 'Лёгкий', 'Средний', 'Сложный'];
  function Deck(subjects, seed) {
    const R = G.H.makeR(hash('deck:' + seed));
    let tk = null, i = 0;
    function build() {
      const S = [], C = [], M = [];
      subjects.forEach((s) => G.buildVariant(s, 'T' + seed + '-' + s).questions.forEach((q) => {
        q.subj = s; (q.type === 'single' ? S : q.type === 'context' ? C : q.type === 'multi' ? M : []).push(q);
      }));
      const S1 = R.shuffle(S), C1 = R.shuffle(C), M1 = R.shuffle(M);
      const easy = S1.splice(0, TICKET[0]);
      const mid = C1.splice(0, TICKET[1]); while (mid.length < TICKET[1] && S1.length) mid.push(S1.shift());
      const hard = M1.splice(0, TICKET[2]); while (hard.length < TICKET[2] && C1.length) hard.push(C1.shift());
      tk = [].concat(easy.map((q) => Object.assign(q, { lvl: 1 })), mid.map((q) => Object.assign(q, { lvl: 2 })), hard.map((q) => Object.assign(q, { lvl: 3 })));
    }
    return { total: TICKET_N, next() { if (!tk) build(); return i < tk.length ? tk[i++] : null; } };
  }
  const LETTERS = 'ABCDEF';
  const ansText = (q) => q.type === 'multi' ? q.answer.map((k) => `${LETTERS[k]}) ${q.options[k]}`).join('; ') : `${LETTERS[q.answer]}) ${q.options[q.answer]}`;
  const isMulti = (q) => q && q.type === 'multi';

  /* ---------- бой: 2D-схватка ----------
     Батыр и босс упёрлись друг в друга в центре. Босс всё время давит — точка схватки ползёт к краю батыра.
     Верный ответ: батыр получает силу и толкает (урон боссу). Ошибка: босс делает рывок.
     Батыра вытолкнули за край — минус сердце. Босса вытолкнули за его край — «ринг-аут», большой урон. */
  const LV = [null,
    { n: 1, h0: '#bfdbfe', h1: '#3b82f6', h2: '#1e3a8a', hg: '#60a5fa' },
    { n: 2, h0: '#cffafe', h1: '#06b6d4', h2: '#164e63', hg: '#22d3ee' },
    { n: 3, h0: '#fef3c7', h1: '#f59e0b', h2: '#78350f', hg: '#fb923c' }];
  let grind = null;
  function grindOn() {
    const c = audio(); if (!c || grind) return;
    const n = c.sampleRate * 2, buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; s.loop = true; f.type = 'bandpass'; f.frequency.value = 600; f.Q.value = 3; g.gain.value = 0;
    s.connect(f).connect(g).connect(c.destination); s.start(); grind = { s, f, g };
  }
  function grindSet(level) { if (!grind || !ac) return; const t = ac.currentTime; grind.g.gain.setTargetAtTime(0.01 + 0.06 * level, t, 0.15); grind.f.frequency.setTargetAtTime(450 + 900 * level, t, 0.2); }
  function grindOff() { if (!grind) return; try { grind.s.stop(); } catch (e) { /* */ } grind = null; }

  // opts: boss, seed, hpMax, root, raid: { teamDmg(), onDamage(myDmg), onOut(), mates(), left() } | null, onEnd(result), heroName
  function Fight(opts) {
    const B = opts.boss, root = opts.root;
    const F = { hearts: HEARTS, combo: 0, maxCombo: 0, ok: 0, tot: 0, myDmg: 0, wrongs: [], items: { cheat: 1, freeze: 1, double: 1 }, dbl: false, rage: false, over: false, t0: performance.now(), q: null, lv: 1, pw: 0, p: 0, pt: 0 };
    const deck = Deck(B.subj, opts.seed);
    const hp = () => opts.hpMax - (opts.raid ? opts.raid.teamDmg() : F.myDmg);
    const heroName = opts.heroName || 'Батыр';
    let raf = 0, limit = 30, frozen = false, locked = false, lastTick = 0, lastSpark = 0, timers = [], tPrev = performance.now(), edgeLock = false;
    const later = (fn, ms) => { const t = setTimeout(() => { if (!F.dead) fn(); }, ms); timers.push(t); return t; };

    root.innerHTML = `
    <div class="ar-wrap"><div class="ar-dark" id="arena" style="--c:${B.c};--c2:${B.c2}">
      <div class="ar-fixed">
      <div class="ar-hud">
        <div class="ar-top"><div class="ar-bname">${B.name}<small>${opts.raid ? 'рейд' : B.subj.length > 1 ? 'все предметы' : SUBJ_NAME[B.subj[0]]}</small></div>
          <div style="display:flex;gap:6px"><button class="ar-x" id="aSnd" aria-label="Звук"></button><button class="ar-x" id="aX" aria-label="Выйти">×</button></div></div>
        <div class="ar-hp"><i class="lag" id="aLag"></i><i class="fill" id="aHp"></i><i class="half"></i><b id="aHpN"></b></div>
        <div class="ar-row2"><span class="ar-hearts" id="aHearts"></span><span class="ar-combo" id="aCombo"></span><span class="ar-clock" id="aClock">0:00</span></div>
      </div>
      ${opts.raid ? '<div class="ar-team" id="aTeam"></div>' : ''}
      <div class="ar-ring" id="aStage">
        <div class="ar-say" id="aSay"></div>
        <div class="ar-zone l" id="aZoneL"></div><div class="ar-zone r"></div>
        <div class="ar-floor"></div>
        <div class="ar-fighter ally" id="aHero"><div class="ar-body">${ART.hero}</div><span class="ar-tag" id="aTag"></span></div>
        <div class="ar-fighter foe" id="aBoss"><div class="ar-body">${ART[B.k]}</div></div>
        <div class="ar-clash" id="aClash"></div>
      </div>
      <div class="ar-tug"><span class="z l">край</span><div class="tr"><i class="mid"></i><b id="aKnob"></b></div><span class="z r">ринг-аут</span></div>
      <div class="ar-power" id="aPower"><span id="aLv"></span><div class="bar"><i id="aPow"></i></div><span id="aPress"></span></div>
      </div>
      <div class="ar-q" id="aQ"></div>
      <div class="ar-pw" id="aPw"></div>
      <div class="ar-fx" id="aFx"></div><div class="ar-banner" id="aBan"></div><div class="ar-flash"></div>
    </div></div>`;
    const arena = $('#arena', root), stage = $('#aStage', root), heroEl = $('#aHero', root), bossEl = $('#aBoss', root), fx = $('#aFx', root);
    arena._F = F;
    const renderSnd = () => ($('#aSnd', root).textContent = st().sound ? '🔊' : '🔇');
    renderSnd();
    $('#aSnd', root).onclick = () => { const s = st(); s.sound = !s.sound; saveSt(s); renderSnd(); if (s.sound) grindOn(); else grindOff(); };
    $('#aX', root).onclick = () => {
      if (F.over || F.exitArm) { F.stop(); opts.onExit ? opts.onExit() : (location.hash = '#/boss'); return; }
      F.exitArm = true; banner('Ещё раз × — выйти', 1500); setTimeout(() => (F.exitArm = false), 2500);
    };

    function say(text, ms = 2600) { const s = $('#aSay', root); if (!text) return; s.textContent = text; s.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(() => s.classList.remove('on'), ms); }
    function banner(text, ms = 1100) { const b = $('#aBan', root); b.textContent = text; b.classList.toggle('sm', text.length > 12); b.classList.add('on'); clearTimeout(banner.t); banner.t = setTimeout(() => b.classList.remove('on'), ms); }
    function setLevel(n) {
      F.lv = n; const L = LV[n];
      ['h0', 'h1', 'h2', 'hg'].forEach((k) => heroEl.style.setProperty('--' + k, L[k]));
      heroEl.classList.remove('lv1', 'lv2', 'lv3'); heroEl.classList.add('lv' + n);
    }
    function hud() {
      const h = Math.max(0, hp()), pct = clamp(h / opts.hpMax * 100, 0, 100);
      $('#aHp', root).style.width = pct + '%'; $('#aLag', root).style.width = pct + '%';
      $('#aHpN', root).textContent = `${Math.ceil(h)} / ${opts.hpMax}`;
      $('#aHearts', root).innerHTML = Array.from({ length: HEARTS }, (_, i) => `<span class="${i < F.hearts ? '' : 'off'}">❤️</span>`).join('');
      $('#aCombo', root).textContent = F.combo >= 2 ? `🔥 Комбо ×${F.combo}` : '';
      $('#aTag', root).textContent = `${heroName} · ур. ${F.lv}`;
      $('#aLv', root).textContent = F.lv >= 3 ? '⚡ Сила: МАКС' : `⚡ Сила · ур. ${F.lv}`;
      $('#aPow', root).style.width = (F.lv >= 3 ? 100 : F.pw / 3 * 100) + '%';
      $('#aPw', root).innerHTML = Object.entries(ITEMS).map(([k, it]) => `<button data-it="${k}" ${F.items[k] && !locked && !F.over ? '' : 'disabled'} title="${it.what}"><span class="i">${it.i}</span>${it.name}${F.items[k] ? `<span class="n">${F.items[k]}</span>` : ''}</button>`).join('');
      $('#aPw', root).querySelectorAll('[data-it]').forEach((b) => (b.onclick = () => useItem(b.dataset.it)));
      if (!F.rage && h <= opts.hpMax / 2 && h > 0) { F.rage = true; arena.classList.add('rage'); banner('ЯРОСТЬ!'); say(B.rage); SFX.rage(); }
      if (opts.raid) renderTeam();
    }
    function renderTeam() {
      const box = $('#aTeam', root); if (!box) return;
      box.innerHTML = opts.raid.mates().map((m) => `<span class="ar-mate ${m.me ? 'me' : ''} ${m.out ? 'out' : ''}"><span class="av">${m.av}</span>${H.esc(m.n)} <span class="d">${m.dmg}</span>${m.out ? ' 💤' : ''}</span>`).join('');
    }
    F.renderTeam = renderTeam;
    F.hud = hud;

    /* раскладка бойцов: точка схватки x = центр + p · RANGE */
    function layout() {
      const W = stage.clientWidth, hw = heroEl.offsetWidth, bw = bossEl.offsetWidth;
      const jit = F.over ? 0 : (Math.random() - 0.5) * (1.2 + 2.2 * Math.max(0, -F.p));
      const X = W / 2 + F.p * W * 0.26;
      heroEl.style.transform = `translateX(${X - hw * 0.86 + jit}px)`;
      bossEl.style.transform = `translateX(${X - bw * 0.1 - jit}px)`;
      $('#aClash', root).style.left = X + 'px';
      $('#aKnob', root).style.left = clamp(50 + F.p * 50, 0, 100) + '%';
      $('#aZoneL', root).style.opacity = clamp(-F.p * 1.2 - 0.2, 0, 1);
      return X;
    }
    function center(el) { const a = arena.getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: r.left - a.left + r.width / 2, y: r.top - a.top + r.height / 2 }; }
    function clashPt() { const a = arena.getBoundingClientRect(), r = $('#aClash', root).getBoundingClientRect(); return { x: r.left - a.left, y: r.top - a.top }; }
    function floatText(text, cls, x, y) {
      const d = document.createElement('div'); d.className = 'ar-dmg ' + (cls || ''); d.textContent = text; d.style.left = x + 'px'; d.style.top = y + 'px'; fx.append(d);
      d.animate([{ transform: 'translate(-50%,0) scale(.5)', opacity: 0 }, { transform: 'translate(-50%,-30px) scale(1.15)', opacity: 1, offset: 0.25 }, { transform: 'translate(-50%,-90px) scale(1)', opacity: 0 }], { duration: 1100, easing: 'ease-out' }).onfinish = () => d.remove();
    }
    function sparks(x, y, n, color, spread = 1) {
      for (let i = 0; i < n; i++) {
        const s = document.createElement('div'); s.className = 'ar-spark'; s.style.left = x + 'px'; s.style.top = y + 'px'; if (color) s.style.background = color; fx.append(s);
        const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.6, r = (25 + Math.random() * 70) * spread;
        s.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * r}px,${Math.sin(a) * r + 30}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }], { duration: 400 + Math.random() * 400, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => s.remove();
      }
    }
    function orb(from, cb) { // сила от ответа летит в батыра
      const to = center(heroEl), s = document.createElement('div'); s.className = 'ar-shot'; fx.append(s); SFX.shot();
      s.animate([{ left: from.x + 'px', top: from.y + 'px', transform: 'scale(.6)' }, { left: to.x + 'px', top: to.y + 'px', transform: 'scale(1.3)' }], { duration: 300, easing: 'cubic-bezier(.5,0,.9,.4)' }).onfinish = () => { s.remove(); cb(); };
    }
    const anim = (el, cls, ms) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); later(() => el.classList.remove(cls), ms); };

    function ask() {
      if (F.over || F.dead) return;
      locked = false; frozen = false;
      const q = (F.q = deck.next());
      if (!q) { F.ticketOut = true; F.q = null; return lose(); } // все 25 вопросов билета прошли, а босс жив
      F.tot++;
      const len = strip(q.text).length + strip(q.context).length + q.options.map(strip).join('').length;
      limit = clamp(14 + len / 8, 18, 60) * (isMulti(q) ? 1.3 : 1);
      const mu = isMulti(q);
      $('#aQ', root).innerHTML = `<div class="meta"><span>Вопрос ${F.tot} из ${deck.total}${B.subj.length > 1 ? ' · ' + SUBJ_NAME[q.subj] : ''}</span><span class="lvl l${q.lvl}">${'★'.repeat(q.lvl)} ${LV_NAME[q.lvl]}</span></div>
        ${q.context ? `<div class="ctx">${q.context}</div>` : ''}<div class="qt">${q.text}</div>${mu ? '<div class="ar-hint">Выберите все верные ответы и нажмите «Ответить»</div>' : ''}
        <div class="ar-opts" id="aOpts">${q.options.map((o, j) => `<button class="ar-opt" data-o="${j}"><span class="k">${LETTERS[j]}</span><span>${o}</span></button>`).join('')}</div>${mu ? '<button class="ar-btn blue" id="aSub" style="margin-top:10px;width:100%">Ответить</button>' : ''}<div id="aExp"></div>`;
      $('#aQ', root).querySelectorAll('[data-o]').forEach((b) => (b.onclick = () => (mu ? b.classList.toggle('sel') : answer(+b.dataset.o, b))));
      if (mu) $('#aSub', root).onclick = submitMulti;
      arena.classList.remove('frozen');
      hud();
      later(() => scrollToQ(), 60);
    }
    /* на телефоне арена закреплена вверху: вопрос и ответы прокручиваем так, чтобы они были сразу под ней */
    function fixedBottom() { const f = $('.ar-fixed', root); return f && getComputedStyle(f).position === 'sticky' ? f.getBoundingClientRect().bottom : 0; }
    function scrollInto(el, pad = 8) { if (!el || !fixedBottom()) return; const d = el.getBoundingClientRect().top - fixedBottom() - pad; if (Math.abs(d) > 4) window.scrollBy({ top: d, behavior: 'smooth' }); }
    function scrollToQ() { scrollInto($('#aQ', root), 6); }
    function submitMulti() {
      if (locked || F.over) return;
      const q = F.q, sel = Array.from($('#aOpts', root).children).map((b, k) => (b.classList.contains('sel') ? k : -1)).filter((k) => k >= 0);
      if (!sel.length) return;
      answer(sel, $('#aSub', root), G.scoreQuestion(q, sel) === 2);
    }

    function answer(j, btn, multiOk) {
      if (locked || F.over) return;
      locked = true;
      const q = F.q, ok = isMulti(q) ? !!multiOk : j === q.answer;
      const tUsed = (performance.now() - (F.qStart || performance.now())) / 1000, speed = clamp(1 - tUsed / limit, 0, 1);
      $('#aOpts', root).classList.add('lock');
      logTopic(q, ok);
      if (ok) {
        if (isMulti(q)) { j.forEach((k) => $('#aOpts', root).children[k].classList.add('ok')); $('#aSub', root).style.display = 'none'; } else btn.classList.add('ok');
        F.ok++; F.combo++; F.maxCombo = Math.max(F.maxCombo, F.combo);
        const mult = (1 + 0.1 * Math.min(F.combo - 1, 5)) * (1 + 0.25 * (F.lv - 1)) * (F.dbl ? 2 : 1), crit = F.dbl || F.combo >= 5 || F.lv >= 3;
        const dmg = Math.round((10 + 6 * speed) * mult * [1, 1, 1.2, 1.5][q.lvl || 1]), push = (0.22 + 0.1 * speed + 0.05 * (F.lv - 1)) * (F.dbl ? 1.8 : 1);
        F.dbl = false;
        orb(center(btn), () => {
          anim(heroEl, 'charge', 260);
          if (F.lv < 3 && ++F.pw >= 3) { F.pw = 0; setLevel(F.lv + 1); banner(F.lv >= 3 ? '⚡ БАТЫР НА МАКСИМУМЕ!' : `⚡ Батыр сильнее! Ур. ${F.lv}`, 1300); SFX.item(); vib([20, 40, 20]); }
          later(() => {
            F.pt = F.p + push; anim(heroEl, 'shove', 380); anim(bossEl, 'hit', 380);
            F.myDmg += dmg; if (opts.raid) opts.raid.onDamage(F.myDmg);
            const c = clashPt(); floatText((crit ? 'КРИТ −' : '−') + dmg, crit ? 'crit' : '', c.x + 40, c.y - 70); sparks(c.x, c.y, crit ? 26 : 14);
            arena.classList.remove('bump'); void arena.offsetWidth; arena.classList.add('bump');
            (crit ? SFX.crit : SFX.hit)(); vib(crit ? [20, 30, 40] : 25);
            if (F.combo % 3 === 0) reward();
            hud();
            if (hp() <= 0) return win();
            later(ask, 600);
          }, 140);
        });
      } else {
        markWrong(q, j, btn);
        F.pw = Math.max(0, F.pw - 1); F.combo = 0;
        lunge(0.38);
        if (!F.over) miss(j);
      }
      hud();
    }
    function markWrong(q, j, btn) { // показываем верный ответ: зелёным, свой неверный: красным
      const o = $('#aOpts', root).children;
      if (isMulti(q)) { j.forEach((k) => { if (!q.answer.includes(k)) o[k].classList.add('bad'); }); q.answer.forEach((k) => o[k].classList.add('ok')); const sb = $('#aSub', root); if (sb) sb.style.display = 'none'; }
      else { if (btn) btn.classList.add('bad'); o[q.answer].classList.add('ok'); }
    }
    function lunge(k) { // рывок босса
      anim(bossEl, 'lunge', 420); anim(heroEl, 'recoil', 420);
      F.pt = F.p - k; SFX.hurt(); vib(50);
      const c = clashPt(); sparks(c.x, c.y, 10, '#fca5a5');
    }
    function miss(j) {
      const q = F.q; F.combo = 0; F.wrongs.push({ q, a: j });
      $('#aExp', root).innerHTML = `<div class="ar-exp">${j === null ? '<b>Не успели — босс вытолкнул.</b> ' : '<b>Ошибка — босс давит!</b> '}Верный ответ: <b style="color:#15803d">${ansText(q)}</b><div style="margin-top:6px">${q.explain || ''}</div>
        <button class="ar-btn blue" id="aNext" style="margin-top:10px;width:100%">Дальше →</button></div>`;
      $('#aNext', root).onclick = () => ask();
      const ok = $('#aOpts', root).querySelector('.ok'); // к верному ответу; через 2 с сами идём дальше
      later(() => scrollInto(ok, 10), 120);
      later(() => { if (F.q === q && !F.over && $('#aNext', root)) ask(); }, 2000);
      hud();
    }
    function pushedOut() { // батыра вытолкнули за край
      edgeLock = true; F.hearts--;
      arena.classList.remove('hurt'); void arena.offsetWidth; arena.classList.add('hurt'); SFX.hurt(); vib([60, 40, 90]);
      anim(heroEl, 'knock', 700);
      const c = center(heroEl); floatText('−❤️', 'crit', c.x, c.y - 30);
      banner(F.hearts > 0 ? 'Батыра вытолкнули!' : 'Батыр повержен', 1200);
      const unanswered = !locked && F.q;
      if (unanswered) { locked = true; logTopic(F.q, false); $('#aOpts', root).classList.add('lock'); markWrong(F.q, isMulti(F.q) ? [] : -1, null); }
      hud();
      if (F.hearts <= 0) return lose();
      later(() => { F.p = F.pt = 0; edgeLock = false; }, 650);
      if (unanswered) miss(null);
    }
    function ringOut() {
      edgeLock = true; const bonus = Math.round(18 * (1 + 0.25 * (F.lv - 1)));
      F.myDmg += bonus; if (opts.raid) opts.raid.onDamage(F.myDmg);
      anim(bossEl, 'out', 700); banner('РИНГ-АУТ!', 1100); SFX.crit(); vib([30, 30, 60]);
      const c = center(bossEl); floatText('−' + bonus, 'crit', c.x, c.y - 40); sparks(c.x, c.y + 40, 24, B.c, 1.4);
      hud();
      if (hp() <= 0) return win();
      later(() => { F.pt = 0.15; edgeLock = false; }, 650);
    }
    function reward() {
      const keys = Object.keys(ITEMS), k = keys[Math.floor(Math.random() * keys.length)];
      F.items[k]++; SFX.item(); later(() => banner(`+ ${ITEMS[k].i} ${ITEMS[k].name}`, 1200), 500);
      hud(); const b = $(`[data-it="${k}"]`, root); if (b) b.classList.add('pop');
    }
    function useItem(k) {
      if (locked || F.over || !F.items[k]) return;
      F.items[k]--; SFX.item();
      if (k === 'cheat') {
        const all = F.q.options.map((_, i) => i), wrong = all.filter((i) => isMulti(F.q) ? !F.q.answer.includes(i) : i !== F.q.answer); wrong.sort(() => Math.random() - 0.5);
        wrong.slice(0, 2).forEach((i) => $('#aOpts', root).children[i].classList.add('gone'));
      } else if (k === 'freeze') { frozen = true; arena.classList.add('frozen'); banner('🛡️ Батыр упёрся'); }
      else if (k === 'double') { F.dbl = true; banner('💥 Следующий толчок ×2'); }
      hud();
    }
    function logTopic(q, ok) {
      try { const log = H.LS.get('synaq_topiclog', []); log.push({ s: q.subj, t: G.topicOf(q.subj, q), g: ok ? 1 : 0, m: 1, d: Date.now(), src: 'boss' }); H.LS.set('synaq_topiclog', log.slice(-3000)); } catch (e) { /* без статистики */ }
    }

    function tick() {
      if (F.dead) return;
      raf = requestAnimationFrame(tick);
      const now = performance.now(), dt = Math.min(0.05, (now - tPrev) / 1000); tPrev = now;
      $('#aClock', root).textContent = opts.raid ? mmss(Math.max(0, opts.raid.left())) : mmss((now - F.t0) / 1000);
      if (opts.raid && !F.over) {
        if (hp() <= 0) return win();
        if (opts.raid.left() <= 0) return lose(true);
      }
      const pressing = !F.over && !locked && !frozen && F.q && !edgeLock;
      if (pressing) F.pt -= dt / limit * (F.rage ? 1.3 : 1);
      if (!F.qStart || F.qStartFor !== F.q) { F.qStart = now; F.qStartFor = F.q; }
      F.p += (F.pt - F.p) * Math.min(1, dt * 10);
      const X = layout();
      $('#aPress', root).textContent = frozen ? '🛡️ упор' : pressing ? (F.p < -0.6 ? '⚠️ край!' : 'босс давит') : '';
      grindSet(F.over ? 0 : clamp(0.3 - F.p * 0.5, 0, 1));
      if (!F.over && now - lastSpark > (pressing ? 140 : 300)) { lastSpark = now; const a = arena.getBoundingClientRect(), r = stage.getBoundingClientRect(); sparks(X + r.left - a.left, r.top - a.top + stage.clientHeight * 0.52, 2, '#fde68a', 0.5); }
      if (pressing && F.p < -0.7 && now - lastTick > 700) { lastTick = now; SFX.tick(); }
      if (!F.over && !edgeLock && F.p <= -1) pushedOut();
      else if (!F.over && !edgeLock && F.p >= 1) ringOut();
    }

    function finish(res) {
      F.over = true; locked = true; hud(); grindSet(0);
      const sec = (performance.now() - F.t0) / 1000;
      later(() => { F.stop(); opts.onEnd(Object.assign({ boss: B, sec, hearts: Math.max(0, F.hearts), ok: F.ok, tot: F.tot, maxCombo: F.maxCombo, dmg: F.myDmg, wrongs: F.wrongs, lv: F.lv }, res)); }, res.win ? 2300 : 2000);
    }
    function win() {
      if (F.over) return;
      const c = center(bossEl); bossEl.classList.add('dead'); heroEl.classList.add('victory'); say(B.die, 2000); sparks(c.x, c.y, 40, B.c, 1.5); SFX.win(); vib([40, 60, 40, 60, 120]);
      later(() => banner('ПОБЕДА!', 1600), 500);
      finish({ win: true });
    }
    function lose(timeUp) {
      if (F.over) return;
      if (opts.raid && !timeUp && opts.raid.onOut) { // в рейде: выбыл, команда бьётся дальше
        F.over = true; locked = true; heroEl.classList.add('down'); SFX.lose(); grindSet(0);
        $('#aQ', root).innerHTML = `<div style="text-align:center;padding:8px 0"><div style="font-size:34px">💤</div><b>Ваш батыр выбыл.</b><div style="color:#64748b;font-size:14px">Команда ещё бьётся — следите за полоской здоровья босса.</div></div>`;
        hud(); opts.raid.onOut(F);
        return;
      }
      heroEl.classList.add('down'); bossEl.classList.add('win'); say(B.win, 2400); SFX.lose();
      later(() => banner(timeUp ? 'ВРЕМЯ ВЫШЛО' : F.ticketOut ? 'ВОПРОСЫ ЗАКОНЧИЛИСЬ' : 'ПОРАЖЕНИЕ', 1600), 400);
      finish({ win: false, timeUp: !!timeUp });
    }
    F.forceEnd = (w) => { if (w) { if (!F.ended) { F.ended = true; F.over = false; win(); } } else { F.over = false; finish({ win: false, timeUp: true }); } };
    F.stop = () => { F.dead = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout); grindOff(); document.removeEventListener('keydown', F.key); };
    F.key = (e) => {
      if (F.over) return;
      const k = e.key.toLowerCase(), i = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, a: 0, b: 1, c: 2, d: 3, e: 4, f: 5 }[k];
      if (i !== undefined && !locked) { const b = $('#aOpts', root) && $('#aOpts', root).children[i]; if (b && !b.classList.contains('gone')) { if (isMulti(F.q)) b.classList.toggle('sel'); else answer(i, b); } }
      else if (k === 'enter') { if ($('#aNext', root)) ask(); else if (!locked && isMulti(F.q)) submitMulti(); }
    };
    document.addEventListener('keydown', F.key);

    setLevel(1); hud(); layout(); say(B.start, 2600); banner('СХВАТКА!', 900); grindOn();
    later(ask, 700); tick();
    return F;
  }

  /* ---------- страницы соло ---------- */
  function pageList(mode) {
    const s = st();
    document.body.classList.add('arena-on');
    const total = starsTotal(s);
    H.app.innerHTML = `<div class="ar-wrap"><div class="ar-dark" style="--c:#7c3aed;--c2:#1e1b4b">
      <div class="ar-hero"><h1>⚔️ Битва с боссами ЕНТ</h1>
        <p>Отвечай на задания — бей босса. Думаешь долго — он бьёт тебя. Побеждено боссов: <b>${total} из 6</b></p>
        <div class="ar-modes"><button class="ar-mode ${mode !== 'raid' ? 'on' : ''}" data-m="solo"><b>🧍 Один</b><span>6 боссов + финальный</span></button>
          <button class="ar-mode ${mode === 'raid' ? 'on' : ''}" data-m="raid"><b>👥 С друзьями</b><span>рейд по ссылке, до 8 человек</span></button></div>
      </div>
      ${mode === 'raid' ? raidIntro() : `<div class="ar-grid">${BOSSES.map((b) => card(b, s)).join('')}</div>
      <div class="ar-note">Задания — из генераторов «Сынақ», каждый бой новые. Ошибки попадают в статистику слабых тем.</div>`}
    </div></div>`;
    H.app.querySelectorAll('[data-m]').forEach((b) => (b.onclick = () => (location.hash = b.dataset.m === 'raid' ? '#/boss/friends' : '#/boss')));
    H.app.querySelectorAll('[data-b]').forEach((b) => (b.onclick = () => {
      const B = BY[b.dataset.b];
      if (!unlocked(B, s)) return H.toast(`Победите ещё ${B.need - total} босса(ов), чтобы открыть финал`);
      location.hash = '#/boss/' + B.k;
    }));
    const nb = $('#newRaid'); if (nb) nb.onclick = () => { const code = newCode(); H.LS.set('synaq_raid_host', code); location.hash = '#/raid/' + code; };
  }
  function card(b, s) {
    const lock = !unlocked(b, s), n = s.stars[b.k] || 0;
    return `<button class="ar-card ${lock ? 'locked' : ''} ${b.need ? 'wide' : ''}" style="--c:${b.c}" data-b="${b.k}">
      <img src="${imgOf(b.k)}" alt="">
      <div><div class="nm">${b.name}</div><div class="sb">${b.need ? (lock ? `откроется после ${b.need} побед` : 'финал · все 6 предметов') : SUBJ_NAME[b.subj[0]]}</div>
      <div class="st">${n ? stars(n) : lock ? '' : '<span style="font-size:12px;color:#94a3b8;letter-spacing:0">не побеждён</span>'}</div></div></button>`;
  }
  function raidIntro() {
    return `<div class="ar-lobby" style="padding-top:4px">
      <div class="ar-players">
        <div class="ar-player"><span class="av">1️⃣</span><span>Создайте комнату и отправьте ссылку друзьям в WhatsApp или Telegram</span></div>
        <div class="ar-player"><span class="av">2️⃣</span><span>Выберите босса — у него будет больше здоровья, чем в соло</span></div>
        <div class="ar-player"><span class="av">3️⃣</span><span>У каждого свои задания. Все удары складываются, в конце — таблица и MVP</span></div>
      </div>
      <button class="ar-btn" id="newRaid">Создать комнату</button>
      <p class="ar-net">Без регистрации. Нужен интернет у всех игроков.</p></div>`;
  }

  function pageFight(k) {
    const B = BY[k], s = st();
    if (!B) { location.hash = '#/boss'; return; }
    if (!unlocked(B, s)) { location.hash = '#/boss'; H.toast('Финал откроется после 3 побед'); return; }
    document.body.classList.add('arena-on', 'arena-fight');
    H.track && H.track('boss');
    cur = Fight({ boss: B, seed: Date.now() % 1e9, hpMax: B.hp, root: H.app, raid: null, onEnd: (r) => soloEnd(r) });
  }

  function soloEnd(r) {
    cur = null;
    document.body.classList.remove('arena-fight');
    const s = st(), B = r.boss, starsN = r.win ? r.hearts : 0;
    const wasLocked = BOSSES.filter((b) => !unlocked(b, s)).map((b) => b.k);
    if (r.win) { s.stars[B.k] = Math.max(s.stars[B.k] || 0, starsN); s.best[B.k] = Math.min(s.best[B.k] || 1e9, Math.round(r.sec)); s.wins = (s.wins || 0) + 1; saveSt(s); }
    const opened = wasLocked.filter((k) => unlocked(BY[k], s));
    const nextB = BOSSES.find((b) => b.k !== B.k && unlocked(b, s) && !s.stars[b.k]);
    const acc = r.tot ? Math.round(r.ok / r.tot * 100) : 0;
    H.app.innerHTML = `<div class="ar-wrap"><div class="ar-dark" style="--c:${B.c};--c2:${B.c2}"><div class="ar-end">
      <img src="${imgOf(B.k)}" alt="" style="width:120px;${r.win ? 'filter:grayscale(.7) brightness(.8);transform:rotate(-12deg)' : ''}">
      <h2>${r.win ? 'Победа!' : 'Поражение'}</h2>
      ${r.win ? `<div class="big">${stars(starsN)}</div><p>${B.name} повержен за ${mmss(r.sec)}${s.best[B.k] === Math.round(r.sec) ? ' · личный рекорд' : ''}</p>` : `<p>«${B.win}»</p>`}
      ${opened.includes('final') ? '<p style="color:#fde047;font-weight:800">🔓 Открыт финальный босс — Хронос ЕНТ!</p>' : ''}
      <div class="ar-kpi"><div><b>${r.ok}/${r.tot}</b><span>верных</span></div><div><b>${acc}%</b><span>точность</span></div><div><b>×${r.maxCombo}</b><span>лучшее комбо</span></div></div>
      <div class="ar-btns">
        ${r.win ? (nextB ? `<a class="ar-btn" href="#/boss/${nextB.k}">Следующий: ${nextB.name} →</a>` : '<a class="ar-btn" href="#/boss">К боссам</a>') : `<button class="ar-btn" id="again">Реванш</button>`}
        <button class="ar-btn blue" id="withFriends">👥 Позвать друзей на ${B.name}</button>
        <button class="ar-btn ghost" id="share">Поделиться результатом</button>
        ${r.win ? '<button class="ar-btn ghost" id="again">Ещё раз</button>' : '<a class="ar-btn ghost" href="#/boss">Все боссы</a>'}
      </div>
      ${review(r.wrongs)}
      ${H.hasAccess() ? '' : `<div class="ar-exp" style="text-align:left;margin-top:14px;background:#fff7ed;color:#7c2d12">Хотите проверить себя в формате ЕНТ? 40 заданий, таймер и баллы из 50. Вариант 1 по каждому предмету — бесплатно.<a class="ar-btn" style="margin-top:10px" href="#/tests">Пройти пробный ЕНТ</a></div>`}
    </div></div></div>`;
    H.app.querySelectorAll('#again').forEach((b) => (b.onclick = () => pageFight(B.k)));
    $('#withFriends').onclick = () => { const code = newCode(); H.LS.set('synaq_raid_host', code); H.LS.set('synaq_raid_pick', B.k); location.hash = '#/raid/' + code; };
    $('#share').onclick = () => share(r.win ? `Я победил босса «${B.name}» в «Сынақ» за ${mmss(r.sec)} ${'★'.repeat(starsN)} Сможешь быстрее?` : `Босс «${B.name}» меня победил 😤 Попробуй сам:`, siteUrl() + '#/boss/' + B.k);
    window.scrollTo(0, 0);
  }
  function review(wrongs) {
    if (!wrongs.length) return '';
    return `<div class="ar-review"><p style="margin:0 0 8px;color:#fff;font-weight:800">Разбор ошибок (${wrongs.length})</p>${wrongs.map(({ q, a }) => `<details><summary>${strip(q.text).slice(0, 90)}${strip(q.text).length > 90 ? '…' : ''}</summary>
      ${q.context ? `<div style="margin-top:6px;color:#475569">${q.context}</div>` : ''}<div style="margin-top:6px">${q.text}</div>
      <div style="margin-top:6px">${a === null ? 'Не успели ответить. ' : `Ваш ответ: ${Array.isArray(a) ? (a.length ? a.map((k) => q.options[k]).join('; ') : '—') : q.options[a]}. `}<span class="c">Верно: ${isMulti(q) ? q.answer.map((k) => q.options[k]).join('; ') : q.options[q.answer]}</span></div>
      <div style="margin-top:6px;color:#1e3a8a">${q.explain || ''}</div></details>`).join('')}</div>`;
  }
  async function share(text, url) {
    try { if (navigator.share) { await navigator.share({ title: 'Сынақ — битва с боссами', text, url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(text + ' ' + url); H.toast('Ссылка скопирована — отправьте друзьям'); } catch (e) { window.prompt('Скопируйте ссылку:', text + ' ' + url); }
  }

  /* ---------- MQTT по WebSocket (QoS 0, без библиотек) ---------- */
  const enc = new TextEncoder(), dec = new TextDecoder();
  const mstr = (s) => { const b = enc.encode(s); return [b.length >> 8, b.length & 255, ...b]; };
  const mlen = (n) => { const o = []; do { let b = n % 128; n = Math.floor(n / 128); if (n > 0) b |= 128; o.push(b); } while (n > 0); return o; };
  const mpkt = (type, body) => Uint8Array.from([type, ...mlen(body.length), ...body]);
  /* Одно соединение с одним брокером. Mqtt() держит их СРАЗУ ВСЕ: шлёт во все, слушает все, дубли отбрасывает —
     так друзья не окажутся на разных брокерах (иначе «хозяин не в сети»). */
  function MqttLink(url, topic, cid, onMsg, onUp) {
    let ws = null, ready = false, closed = false, ping = 0, to = 0, wait = 600, buf = new Uint8Array(0);
    const retry = (me) => { clearTimeout(to); clearInterval(ping); if (ready) { ready = false; onUp(); } try { me.close(); } catch (e) { /* */ } if (!closed) setTimeout(open, (wait = Math.min(wait * 1.6, 8000))); };
    function open() {
      if (closed) return;
      buf = new Uint8Array(0); let me;
      try { me = ws = new WebSocket(url, 'mqtt'); } catch (e) { setTimeout(open, 3000); return; }
      me.binaryType = 'arraybuffer';
      const tx = (b) => { if (me.readyState === 1) me.send(b); };
      to = setTimeout(() => { if (!ready && ws === me) retry(me); }, 7000);
      me.onopen = () => tx(mpkt(0x10, [...mstr('MQTT'), 4, 2, 0, 45, ...mstr(cid)]));
      me.onerror = () => { if (ws === me) retry(me); };
      me.onclose = () => { if (ws === me) retry(me); };
      me.onmessage = (e) => {
        const u = new Uint8Array(e.data), nb = new Uint8Array(buf.length + u.length); nb.set(buf); nb.set(u, buf.length); buf = nb;
        for (;;) {
          if (buf.length < 2) return;
          let i = 1, len = 0, mul = 1, b;
          do { if (i >= buf.length) return; b = buf[i++]; len += (b & 127) * mul; mul *= 128; } while (b & 128);
          if (buf.length < i + len) return;
          const type = buf[0] >> 4, fl = buf[0] & 15, body = buf.slice(i, i + len); buf = buf.slice(i + len);
          if (type === 2) { if (body[1] === 0) tx(mpkt(0x82, [0, 1, ...mstr(topic), 0])); else { retry(me); return; } }
          else if (type === 9) { ready = true; wait = 600; clearTimeout(to); onUp(); clearInterval(ping); ping = setInterval(() => tx(Uint8Array.of(0xC0, 0)), 25000); }
          else if (type === 3) { const tl = (body[0] << 8) | body[1]; let k = 2 + tl; if ((fl >> 1) & 3) k += 2; try { onMsg(JSON.parse(dec.decode(body.slice(k)))); } catch (x) { /* чужое сообщение */ } }
        }
      };
    }
    open();
    return {
      get ready() { return ready; },
      put(bytes) { if (!ready || !ws || ws.readyState !== 1) return false; try { ws.send(bytes); return true; } catch (e) { return false; } },
      close() { closed = true; clearTimeout(to); clearInterval(ping); try { ws && ws.close(); } catch (e) { /* */ } },
    };
  }
  function Mqtt(topic, onMsg, onState) {
    const cid = 'snq' + Math.random().toString(36).slice(2, 12), seen = new Set(), order = [];
    let closed = false, last = 'connecting';
    const recv = (m) => {
      if (m && m._u) { if (seen.has(m._u)) return; seen.add(m._u); order.push(m._u); if (order.length > 500) seen.delete(order.shift()); }
      if (!closed) onMsg(m);
    };
    const state = () => { const s = links.some((l) => l.ready) ? 'ready' : 'connecting'; if (s !== last) { last = s; if (!closed) onState(s); } };
    onState('connecting');
    const links = BROKERS.map((u, i) => MqttLink(u, topic, cid + i, recv, state));
    return {
      send(o) {
        const bytes = mpkt(0x30, [...mstr(topic), ...enc.encode(JSON.stringify(Object.assign({ _u: Math.random().toString(36).slice(2, 10) }, o)))]);
        let ok = false; links.forEach((l) => { if (l.put(bytes)) ok = true; }); return ok;
      },
      close() { closed = true; links.forEach((l) => l.close()); },
      get ready() { return links.some((l) => l.ready); },
    };
  }

  /* ---------- рейд ---------- */
  const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('');
  const raidHp = (B, n) => Math.round(B.hp * (0.5 + 0.5 * n) / 10) * 10;

  function pageRaid(code) {
    if (!/^[a-z0-9]{4,10}$/.test(code || '')) { const c = newCode(); H.LS.set('synaq_raid_host', c); location.replace('#/raid/' + c); return; }
    document.body.classList.add('arena-on');
    const s = st();
    if (!s.av || !AVS.includes(s.av)) { s.av = AVS[Math.floor(Math.random() * AVS.length)]; saveSt(s); }
    if (!s.name) { s.name = ''; }
    const id = Math.random().toString(36).slice(2, 9);
    const R = raid = { code, id, host: H.LS.get('synaq_raid_host', '') === code, peers: {}, net: null, state: 'lobby', round: '', boss: H.LS.get('synaq_raid_pick', 'math'), go: null, fight: null, ids: [], timers: [], t0: 0, netState: 'connecting', joinedAt: Date.now(), result: null };
    H.LS.del('synaq_raid_pick');
    if (!BY[R.boss]) R.boss = 'math';
    const me = () => ({ id, n: (st().name || 'Игрок').slice(0, 14), av: st().av, h: R.host ? 1 : 0, j: R.joinedAt });
    const presence = () => {
      const F = R.fight;
      return Object.assign(me(), { k: 'p', st: R.state, r: R.round, dmg: F ? F.myDmg : (R.result ? R.result.dmg : 0), ok: F ? F.ok : 0, tot: F ? F.tot : 0, hp: F ? F.hearts : HEARTS, b: R.host ? R.boss : undefined });
    };
    const send = (o) => R.net && R.net.send(o);
    const every = (ms, fn) => R.timers.push(setInterval(fn, ms));
    R.net = Mqtt('synaq-raid-v1/' + code, onMsg, (x) => { R.netState = x; if (x === 'ready') { send(presence()); } if (R.state === 'lobby') renderLobby(!!$('#rPlayers')); });
    every(1500, () => { send(presence()); prune(); if (R.state === 'lobby') renderLobby(true); });
    every(2000, () => { if (R.host && R.state === 'fight' && R.go) send(Object.assign({}, R.go, { el: Date.now() - R.t0 })); });

    function prune() {
      const now = Date.now();
      Object.keys(R.peers).forEach((k) => { if (now - R.peers[k].seen > 9000 && !(R.state !== 'lobby' && R.ids.includes(k))) delete R.peers[k]; });
      // хозяин пропал — хозяином становится тот, кто зашёл раньше всех
      if (!R.host && R.state === 'lobby' && now - R.joinedAt > 8000) {
        const live = Object.values(R.peers).filter((p) => now - p.seen < 9000);
        if (!live.some((p) => p.h)) { const all = live.map((p) => ({ id: p.id, j: p.j || 0 })).concat([{ id, j: R.joinedAt }]).sort((a, b) => a.j - b.j || (a.id < b.id ? -1 : 1)); if (all[0].id === id) { R.host = true; H.LS.set('synaq_raid_host', code); H.toast('Теперь вы хозяин комнаты'); } }
      }
    }
    function onMsg(m) {
      if (!m || m.id === id || typeof m.k !== 'string') return;
      if (m.k === 'p') {
        const p = R.peers[m.id] || (R.peers[m.id] = {});
        Object.assign(p, { id: String(m.id).slice(0, 12), n: String(m.n || 'Игрок').slice(0, 14), av: AVS.includes(m.av) ? m.av : '🙂', h: !!m.h, j: +m.j || 0, st: m.st, r: m.r, seen: Date.now(),
          dmg: m.r === R.round ? Math.max(0, Math.min(+m.dmg || 0, 999)) : (p.r === R.round ? p.dmg : 0), ok: +m.ok || 0, tot: +m.tot || 0, hp: +m.hp });
        if (m.h && BY[m.b] && !R.host) R.boss = m.b;
        if (R.fight) { R.fight.hud(); }
        if (R.state === 'lobby') renderLobby(true);
      } else if (m.k === 'go' && BY[m.boss] && Array.isArray(m.ids)) {
        if (m.r === R.round) return;
        if (R.state === 'lobby' || R.state === 'end') {
          if (!m.ids.includes(id) && (+m.el || 0) > 4000) return; // бой уже идёт без нас
          startFight(m);
        }
      } else if (m.k === 'lobby' && R.state === 'end') { R.state = 'lobby'; R.result = null; renderLobby(); }
    }

    function renderLobby(soft) {
      if (R.state !== 'lobby' || raid !== R) return;
      const list = [me()].concat(Object.values(R.peers).filter((p) => Date.now() - p.seen < 9000));
      const B = BY[R.boss];
      const playersHtml = list.map((p) => `<div class="ar-player"><span class="av">${p.av}</span><span>${H.esc(p.n)}${p.id === id ? ' (вы)' : ''}</span><span class="tag">${p.h ? '👑 хозяин' : ''}</span></div>`).join('');
      if (soft && $('#rPlayers') && R.shownBoss === R.boss) { $('#rPlayers').innerHTML = playersHtml; if ($('#rWait')) $('#rWait').textContent = waitText(); $('#rNet').outerHTML = netLine(); const g = $('#rGo'); if (g) g.textContent = `Начать бой (${list.length} ${list.length === 1 ? 'игрок' : list.length < 5 ? 'игрока' : 'игроков'})`; if ($('#rBossName')) $('#rBossName').textContent = `${B.name} · здоровье ${raidHp(B, list.length)}`; return; }
      const link = siteUrl() + '#/raid/' + code;
      R.shownBoss = R.boss;
      H.app.innerHTML = `<div class="ar-wrap"><div class="ar-dark" style="--c:${B.c};--c2:${B.c2}"><div class="ar-lobby">
        <h2>👥 Рейд на босса</h2><p class="sub">Комната <b>${code}</b> · отправьте ссылку друзьям</p>
        <div class="ar-link"><input id="rLink" readonly value="${link}"><button id="rCopy">Копировать</button></div>
        <div class="ar-btns" style="grid-template-columns:1fr 1fr"><a class="ar-btn ghost" style="padding:10px;font-size:14px" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent('Го в рейд на босса ЕНТ! Заходи: ' + link)}">WhatsApp</a>
          <a class="ar-btn ghost" style="padding:10px;font-size:14px" target="_blank" rel="noopener" href="https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Го в рейд на босса ЕНТ!')}">Telegram</a></div>
        <div class="ar-field"><input id="rName" maxlength="14" placeholder="Ваше имя" value="${H.esc(st().name)}"></div>
        <div class="ar-avs">${AVS.map((a) => `<button data-av="${a}" class="${a === st().av ? 'on' : ''}">${a}</button>`).join('')}</div>
        <p class="sub" style="margin:14px 0 4px">Босс: <b id="rBossName">${B.name} · здоровье ${raidHp(B, list.length)}</b></p>
        ${R.host ? `<div class="ar-pick">${BOSSES.map((b) => `<button data-pick="${b.k}" class="${b.k === R.boss ? 'on' : ''}"><img src="${imgOf(b.k)}" alt="">${b.name}</button>`).join('')}</div>` : `<div style="text-align:center"><img src="${imgOf(B.k)}" alt="" style="width:120px"></div>`}
        <div class="ar-players" id="rPlayers">${playersHtml}</div>
        ${R.host ? `<button class="ar-btn" id="rGo">Начать бой</button><p class="ar-net" style="margin-top:6px">Можно начать и одному. У каждого свои задания, удары складываются. ${RAID_SEC / 60} минуты на бой.</p>` : `<p class="sub" id="rWait">${waitText()}</p>`}
        ${netLine()}
        <a class="ar-btn ghost" href="#/boss" style="margin-top:12px">Выйти</a>
      </div></div></div>`;
      $('#rCopy').onclick = async () => { try { await navigator.clipboard.writeText(link); H.toast('Ссылка скопирована'); } catch (e) { $('#rLink').select(); } };
      $('#rName').oninput = (e) => { const s = st(); s.name = e.target.value.trim().slice(0, 14); saveSt(s); };
      $('#rName').onchange = () => send(presence());
      H.app.querySelectorAll('[data-av]').forEach((b) => (b.onclick = () => { const s = st(); s.av = b.dataset.av; saveSt(s); send(presence()); renderLobby(); }));
      H.app.querySelectorAll('[data-pick]').forEach((b) => (b.onclick = () => { R.boss = b.dataset.pick; send(presence()); renderLobby(); }));
      if ($('#rGo')) $('#rGo').onclick = () => {
        const ids = [id].concat(Object.values(R.peers).filter((p) => Date.now() - p.seen < 9000 && p.st === 'lobby').map((p) => p.id));
        const go = { k: 'go', id, r: Math.random().toString(36).slice(2, 8), boss: R.boss, seed: Math.floor(Math.random() * 1e9), ids, el: 0 };
        send(go); startFight(go);
      };
    }
    function waitText() { return Object.values(R.peers).some((p) => p.h && (p.st === 'fight' || p.st === 'count') && Date.now() - p.seen < 9000) ? 'Сейчас идёт бой. Вы попадёте в следующий — не закрывайте страницу.' : 'Ждём, когда хозяин начнёт бой…'; }
    function netLine() { return `<p class="ar-net ${R.netState === 'ready' ? 'ok' : ''}" id="rNet">${R.netState === 'ready' ? '● связь есть' : '○ подключаемся к серверу игры…'}</p>`; }

    function startFight(go) {
      const el = Math.max(0, +go.el || 0);
      R.go = { k: 'go', id: R.host ? id : go.id, r: go.r, boss: go.boss, seed: go.seed, ids: go.ids.slice(0, 8).map(String) };
      R.round = go.r; R.boss = go.boss; R.ids = R.go.ids.includes(id) ? R.go.ids : R.go.ids.concat([id]); R.state = 'count'; R.t0 = Date.now() - el; R.result = null;
      Object.values(R.peers).forEach((p) => { p.dmg = 0; p.out = false; });
      const B = BY[go.boss];
      document.body.classList.add('arena-fight');
      const cd = () => {
        if (raid !== R || R.state !== 'count') return;
        const left = Math.ceil((3000 - (Date.now() - R.t0)) / 1000);
        if (left <= 0) return begin();
        H.app.innerHTML = `<div class="ar-wrap"><div class="ar-dark" style="--c:${B.c};--c2:${B.c2}"><div class="ar-end"><img src="${imgOf(B.k)}" alt="" style="width:150px"><h2>${B.name}</h2><p>Здоровье ${raidHp(B, R.ids.length)} · игроков: ${R.ids.length}</p><div class="ar-cd">${left}</div></div></div></div>`;
        SFX.tick(); setTimeout(cd, 1000 - ((Date.now() - R.t0) % 1000));
      };
      if (el < 3000) cd(); else begin();
      send(presence());
    }
    function begin() {
      R.state = 'fight';
      const B = BY[R.boss], n = R.ids.length, hpMax = raidHp(B, n);
      const mates = () => R.ids.map((pid) => pid === id ? { me: true, n: (st().name || 'Вы'), av: st().av, dmg: R.fight ? R.fight.myDmg : 0, out: R.fight && R.fight.hearts <= 0 }
        : (R.peers[pid] ? { n: R.peers[pid].n, av: R.peers[pid].av, dmg: R.peers[pid].dmg || 0, out: R.peers[pid].hp <= 0 || Date.now() - R.peers[pid].seen > 15000 } : { n: 'игрок', av: '🙂', dmg: 0, out: true }))
        .sort((a, b) => b.dmg - a.dmg);
      const teamDmg = () => mates().reduce((t, m) => t + m.dmg, 0);
      R.fight = Fight({
        boss: B, seed: R.go.seed + ':' + id, hpMax, root: H.app, heroName: (st().name || 'Батыр').slice(0, 12),
        raid: {
          teamDmg, mates,
          left: () => RAID_SEC - (Date.now() - R.t0 - 3000) / 1000,
          onDamage: () => send(presence()),
          onOut: () => { send(presence()); watchAllOut(); },
        },
        onExit: () => { location.hash = '#/boss/friends'; },
        onEnd: (r) => raidEnd(r, mates()),
      });
      // все выбыли — поражение
      function watchAllOut() {
        const t = setInterval(() => {
          if (raid !== R || R.state !== 'fight' || !R.fight) return clearInterval(t);
          const F = R.fight, ms = mates();
          if (teamDmg() >= hpMax) { clearInterval(t); F.forceEnd(true); }
          else if (ms.every((m) => m.out) || RAID_SEC - (Date.now() - R.t0 - 3000) / 1000 <= 0) { clearInterval(t); F.forceEnd(false); }
          else F.hud();
        }, 500);
        R.timers.push(t);
      }
    }
    function raidEnd(r, ms) {
      R.state = 'end'; R.result = r; const F = R.fight; R.fight = null;
      document.body.classList.remove('arena-fight');
      send(presence());
      const B = r.boss, mvp = ms[0];
      const s = st(); if (r.win) { s.wins = (s.wins || 0) + 1; saveSt(s); }
      H.app.innerHTML = `<div class="ar-wrap"><div class="ar-dark" style="--c:${B.c};--c2:${B.c2}"><div class="ar-end">
        <img src="${imgOf(B.k)}" alt="" style="width:110px;${r.win ? 'filter:grayscale(.7) brightness(.8);transform:rotate(-12deg)' : ''}">
        <h2>${r.win ? 'Рейд пройден!' : r.timeUp ? 'Время вышло' : 'Команда пала'}</h2>
        <p>${r.win ? `${B.name} повержен за ${mmss(Math.max(0, (Date.now() - R.t0 - 3000) / 1000))}` : `«${B.win}»`}</p>
        <table class="ar-tbl"><tr><td></td><td style="color:#94a3b8;font-size:12px">игрок</td><td class="n" style="color:#94a3b8;font-size:12px">урон</td></tr>
          ${ms.map((m, i) => `<tr class="${m.me ? 'me' : ''}"><td style="width:28px">${i === 0 && m.dmg > 0 ? '👑' : i + 1}</td><td>${m.av} ${H.esc(m.n)}${m.me ? ' (вы)' : ''}</td><td class="n">${m.dmg}</td></tr>`).join('')}</table>
        ${mvp && mvp.dmg > 0 ? `<p>MVP боя: <b style="color:#fde047">${H.esc(mvp.n)}</b></p>` : ''}
        <div class="ar-kpi"><div><b>${r.ok}/${r.tot}</b><span>ваших верных</span></div><div><b>${r.dmg}</b><span>ваш урон</span></div><div><b>×${r.maxCombo}</b><span>комбо</span></div></div>
        <div class="ar-btns">
          ${R.host ? '<button class="ar-btn" id="rAgain">Ещё бой этой командой</button>' : '<p class="sub" style="color:#cbd5e1">Хозяин может начать ещё бой — оставайтесь на странице.</p>'}
          <button class="ar-btn ghost" id="rShare">Позвать ещё друзей</button>
          <a class="ar-btn ghost" href="#/boss">Соло-боссы</a>
        </div>
        ${review(r.wrongs)}
        ${H.hasAccess() ? '' : `<div class="ar-exp" style="text-align:left;margin-top:14px;background:#fff7ed;color:#7c2d12">Хотите проверить себя в формате ЕНТ? Вариант 1 по каждому предмету — бесплатно.<a class="ar-btn" style="margin-top:10px" href="#/tests">Пройти пробный ЕНТ</a></div>`}
      </div></div></div>`;
      if ($('#rAgain')) $('#rAgain').onclick = () => { R.state = 'lobby'; R.result = null; send({ k: 'lobby', id }); send(presence()); renderLobby(); };
      $('#rShare').onclick = () => share('Го в рейд на босса ЕНТ!', siteUrl() + '#/raid/' + code);
      window.scrollTo(0, 0);
      void F;
    }
    R.leave = () => { R.timers.forEach(clearInterval); if (R.fight) R.fight.stop(); R.net && R.net.close(); };
    renderLobby();
  }

  /* ---------- вход из роутера app.js ---------- */
  function leave() {
    if (cur) { cur.stop(); cur = null; }
    if (raid) { raid.leave(); raid = null; }
    document.body.classList.remove('arena-on', 'arena-fight');
  }
  function route(parts, helpers) {
    H = helpers;
    if (parts[0] === 'raid') return pageRaid(parts[1]);
    if (!parts[1]) return pageList('solo');
    if (parts[1] === 'friends') return pageList('raid');
    return pageFight(parts[1]);
  }
  window.SynaqBoss = { route, leave, BOSSES, imgOf };
})();
