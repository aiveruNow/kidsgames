    const WORDS = [
      ["LØVE", "🦁"], ["HUND", "🐶"], ["KAGE", "🍰"], ["BOLD", "⚽"], ["MÅNE", "🌙"], ["FISK", "🐟"],
      ["HEST", "🐴"], ["FUGL", "🐦"], ["UGLE", "🦉"], ["GRIS", "🐷"], ["HÅND", "✋"], ["NÆSE", "👃"],
      ["MUND", "👄"], ["SAKS", "✂️"], ["KRAB", "🦀"], ["PIGE", "👧"], ["RING", "💍"], ["VAND", "💧"],
      ["MÆLK", "🥛"], ["BRØD", "🍞"], ["TAND", "🦷"], ["ROSE", "🌹"], ["PÆRE", "🍐"], ["SLOT", "🏰"],
      ["REGN", "🌧️"], ["SKIB", "🚢"]
    ];
    const BALL_COLORS = ["#e8453c", "#2f7de1", "#f39c12", "#8e44ad", "#1fae6b", "#e91e8c"];
    const WORDS_PER_STAR = 5;
    const N = 4;
    const MIN_PULL = 22;
    const MAX_PULL = 150;

    const $ = id => document.getElementById(id);
    const stage = $("stage"), fx = $("fx"), goal = $("goal"), goalInner = $("goalInner"), net = $("net");
    const keeper = $("keeper"), kin = $("keeperIn"), look = $("look");
    const screen = $("screen"), picEl = $("pic"), slotsEl = $("slots"), ballsEl = $("balls");
    const bubbleEl = $("bubble"), nextBtn = $("nextBtn"), banner = $("banner"), stands = $("stands"), dotsEl = $("dots");
    const aimCv = $("aim"), aimCtx = aimCv.getContext("2d");
    const NS = "http://www.w3.org/2000/svg";
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    const pick = list => list[Math.floor(Math.random() * list.length)];
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const shuffle = list => {
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      return list;
    };
    const easeIn = t => t * t;
    const easeInOut = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const easeOut = t => 1 - (1 - t) * (1 - t);

    const store = {
      get(key, fallback = 0) { try { const v = localStorage.getItem(key); return v === null ? fallback : v; } catch { return fallback; } },
      set(key, value) { try { localStorage.setItem(key, String(value)); } catch { /* ingen lagring */ } }
    };

    let stars = Number(store.get("maal-stars")) || 0;
    let muted = !Topbar.soundOn();
    let mode = ["ord", "hard"].includes(store.get("maal-mode", "ord")) ? store.get("maal-mode", "ord") : "ord";
    let progress = 0;
    let round = null;
    let idx = 0;
    let wrongs = 0;
    let mistakes = 0;
    let misses = 0;
    let balls = [];
    let busy = true;
    let started = false;
    let bag = [];
    let firstWordDone = false;
    let firstSpeech = true;
    let roundId = 0;
    let aim = null;

    // ---------- Lyd ----------
    let ac, noiseBuffer;
    function audio() {
      if (muted) return null;
      if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { ac = null; } }
      if (ac && ac.state === "suspended") ac.resume();
      return ac;
    }

    function tone(freq, at, dur, type = "triangle", vol = .16, endFreq) {
      const ctx = audio();
      if (!ctx) return;
      const t = ctx.currentTime + at;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
      gain.gain.setValueAtTime(.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + .05);
    }

    function noise({ at = 0, dur = .2, type = "bandpass", f0 = 1000, f1 = f0, q = 1, vol = .2, attack = .01 }) {
      const ctx = audio();
      if (!ctx) return;
      if (!noiseBuffer) {
        noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      const t = ctx.currentTime + at;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = type;
      filter.Q.value = q;
      filter.frequency.setValueAtTime(f0, t);
      if (f1 !== f0) filter.frequency.exponentialRampToValueAtTime(f1, t + dur);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + attack);
      gain.gain.exponentialRampToValueAtTime(.0001, t + dur);
      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start(t);
      src.stop(t + dur + .05);
    }

    const sfx = {
      kick() { tone(190, 0, .13, "sine", .35, 55); noise({ dur: .07, type: "lowpass", f0: 1400, vol: .25 }); },
      swish() { noise({ dur: .45, f0: 3000, f1: 700, q: .8, vol: .22, attack: .03 }); },
      thud() { tone(120, 0, .12, "sine", .3, 50); },
      boing() {
        tone(200, 0, .38, "sine", .22, 560);
        tone(560, .38, .3, "sine", .18, 180);
      },
      ooh() { tone(520, 0, .5, "sine", .12, 230); noise({ dur: .5, f0: 900, f1: 400, q: .6, vol: .1, attack: .08 }); },
      stretch(p) { tone(260 + p * 380, 0, .06, "sine", .05); },
      ding(i) { tone([523, 659, 784, 1047][i % 4], 0, .45, "triangle", .2); tone([1046, 1318, 1568, 2093][i % 4], .04, .35, "sine", .08); },
      whistle() {
        const ctx = audio();
        if (!ctx) return;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 2700;
        lfo.frequency.value = 38;
        lfoGain.gain.value = 170;
        lfo.connect(lfoGain).connect(osc.frequency);
        gain.gain.setValueAtTime(.0001, t);
        gain.gain.exponentialRampToValueAtTime(.12, t + .03);
        gain.gain.setValueAtTime(.12, t + .28);
        gain.gain.exponentialRampToValueAtTime(.0001, t + .4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t); lfo.start(t);
        osc.stop(t + .45); lfo.stop(t + .45);
      },
      cheer(big) {
        const dur = big ? 2.2 : .9;
        noise({ dur, f0: 650, f1: 1300, q: .6, vol: big ? .22 : .14, attack: .25 });
        for (let i = 0; i < (big ? 22 : 8); i++) {
          noise({ at: Math.random() * dur * .9, dur: .05, type: "highpass", f0: 2200, vol: .12, attack: .005 });
        }
      },
      fanfare() {
        [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .12, .25, "square", .09));
        [523, 659, 784, 1047].forEach(f => tone(f, .55, .8, "triangle", .12));
        tone(1568, .55, .8, "sine", .08);
      },
      roar() {
        const ctx = audio();
        if (!ctx) return;
        const dur = 1.1;
        const t = ctx.currentTime;
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(900, t);
        filter.frequency.exponentialRampToValueAtTime(260, t + dur);
        gain.gain.setValueAtTime(.0001, t);
        gain.gain.exponentialRampToValueAtTime(.26, t + .08);
        gain.gain.exponentialRampToValueAtTime(.0001, t + dur);
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 26;
        lfoGain.gain.value = .08;
        lfo.connect(lfoGain).connect(gain.gain);
        for (const [type, mult] of [["sawtooth", 1], ["square", 1.51]]) {
          const osc = ctx.createOscillator();
          osc.type = type;
          osc.frequency.setValueAtTime(120 * mult, t);
          osc.frequency.exponentialRampToValueAtTime(52 * mult, t + dur);
          osc.connect(filter);
          osc.start(t);
          osc.stop(t + dur + .05);
        }
        filter.connect(gain).connect(ctx.destination);
        lfo.start(t);
        lfo.stop(t + dur + .05);
      }
    };

    let daVoice = null;
    function findVoice() {
      if (!("speechSynthesis" in window)) return;
      daVoice = speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith("da")) || null;
    }
    findVoice();
    if ("speechSynthesis" in window) speechSynthesis.addEventListener("voiceschanged", findVoice);

    // Uden dansk stemme på enheden hentes oplæsningen online (kun selve ordet sendes).
    const clips = new Map();
    function sayOnline(text) {
      return new Promise(resolve => {
        const key = text.toLowerCase();
        if (!clips.has(key)) {
          const el = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=da&q=${encodeURIComponent(key)}`);
          el.preload = "auto";
          clips.set(key, el);
        }
        const el = clips.get(key);
        el.onended = resolve;
        el.onerror = resolve;
        el.currentTime = 0;
        el.play().catch(resolve);
        setTimeout(resolve, 3500);
      });
    }

    function say(text, rate = .85) {
      return new Promise(resolve => {
        if (muted) return resolve();
        if (!daVoice) return sayOnline(text).then(resolve);
        const u = new SpeechSynthesisUtterance(text.toLowerCase());
        u.voice = daVoice;
        u.lang = daVoice.lang;
        u.rate = rate;
        u.pitch = 1.15;
        u.onend = resolve;
        u.onerror = resolve;
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
        setTimeout(resolve, 3000);
      });
    }

    // ---------- Konfetti og fyrværkeri ----------
    const cv = $("confetti");
    const cx2 = cv.getContext("2d");
    let parts = [];
    let raf = 0;
    const CONFETTI = ["#ff5a5a", "#ffd54f", "#4f9dff", "#5be39a", "#ff8fd1", "#ffffff", "#ff9a3c"];

    function resizeCanvas() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      for (const c of [cv, aimCv]) {
        c.width = innerWidth * dpr;
        c.height = innerHeight * dpr;
      }
      cx2.setTransform(dpr, 0, 0, dpr, 0, 0);
      aimCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();

    function burst(x, y, n, o = {}) {
      const count = reduceMotion ? Math.ceil(n / 3) : n;
      for (let i = 0; i < count; i++) {
        const a = o.up ? -Math.PI / 2 + (Math.random() - .5) * (o.spread ?? 1.6) : Math.random() * Math.PI * 2;
        const sp = (o.speed ?? 7) * (.4 + Math.random() * .8);
        parts.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          g: o.gravity ?? .22, r: (o.size ?? 7) * (.6 + Math.random() * .7),
          rot: Math.random() * 6, vr: (Math.random() - .5) * .4,
          color: o.colors ? pick(o.colors) : pick(CONFETTI),
          shape: o.shape ?? pick(["rect", "rect", "circle", "star"]),
          life: 0, max: (o.life ?? 70) * (.7 + Math.random() * .6), drag: o.drag ?? .99
        });
      }
      kickLoop();
    }

    function starPath(ctx, r) {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 ? r * .45 : r;
        const a = -Math.PI / 2 + i * Math.PI / 5;
        ctx[i ? "lineTo" : "moveTo"](Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
    }

    function kickLoop() { if (!raf) raf = requestAnimationFrame(tick); }

    function tick() {
      cx2.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter(p => p.life < p.max && p.y < innerHeight + 40);
      for (const p of parts) {
        p.life++;
        p.vx *= p.drag; p.vy = p.vy * p.drag + p.g;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        cx2.save();
        cx2.globalAlpha = Math.min(1, (p.max - p.life) / 18);
        cx2.translate(p.x, p.y);
        cx2.rotate(p.rot);
        cx2.fillStyle = p.color;
        if (p.shape === "rect") cx2.fillRect(-p.r, -p.r * .5, p.r * 2, p.r);
        else if (p.shape === "star") { starPath(cx2, p.r * 1.3); cx2.fill(); }
        else { cx2.beginPath(); cx2.arc(0, 0, p.r * .6, 0, 7); cx2.fill(); }
        cx2.restore();
      }
      raf = parts.length ? requestAnimationFrame(tick) : 0;
      if (!parts.length) cx2.clearRect(0, 0, innerWidth, innerHeight);
    }

    function confettiRain(ms) {
      const end = performance.now() + ms;
      const timer = setInterval(() => {
        if (performance.now() > end) return clearInterval(timer);
        for (let i = 0; i < 3; i++) {
          burst(Math.random() * innerWidth, 4, 1, { up: false, speed: 1.5, gravity: .09, life: 220, size: 8, drag: .995 });
        }
      }, 40);
    }

    function firework(x, y) {
      const hue = pick(["#ff5a5a", "#ffd54f", "#4f9dff", "#5be39a", "#ff8fd1"]);
      burst(x, y, 46, { speed: 9, gravity: .08, life: 55, size: 5, shape: "circle", colors: [hue, "#fff", hue], drag: .965 });
      burst(x, y, 10, { speed: 5, gravity: .1, life: 60, size: 7, shape: "star", colors: ["#ffd54f", "#fff"], drag: .97 });
      tone(900 + Math.random() * 500, 0, .25, "sine", .05, 200);
    }

    function fireworksShow(n) {
      for (let i = 0; i < n; i++) {
        setTimeout(() => firework(innerWidth * (.12 + Math.random() * .76), innerHeight * (.1 + Math.random() * .4)), i * 260);
      }
    }

    // ---------- Geometri ----------
    function rel(el) {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, l: r.left, t: r.top };
    }

    function goalGeom() {
      const r = goalInner.getBoundingClientRect();
      return { cx: r.left + r.width / 2, left: r.left, right: r.right, top: r.top, bottom: r.bottom, w: r.width, h: r.height };
    }

    function place(el, x, y, s) {
      el.style.transform = `translate(${x - el._r}px, ${y - el._r}px) scale(${s})`;
    }

    function fly(el, o) {
      const { x0, y0, x1, y1, s0 = 1, s1 = 1, peak = 0, dur = 600, spin = 0, ease = t => t, trail = true } = o;
      const patches = el.querySelector(".patches");
      const rot0 = el._rot || 0;
      return new Promise(resolve => {
        const t0 = performance.now();
        let lastTrail = 0;
        function step(now) {
          const t = Math.min(1, (now - t0) / dur);
          const e = ease(t);
          const x = x0 + (x1 - x0) * e;
          const y = y0 + (y1 - y0) * e - peak * 4 * t * (1 - t);
          const s = s0 + (s1 - s0) * e;
          place(el, x, y, s);
          if (patches) patches.style.transform = `rotate(${rot0 + spin * e}deg)`;
          if (trail && now - lastTrail > 36) { lastTrail = now; addTrail(x, y); }
          if (t < 1) requestAnimationFrame(step);
          else { el._rot = rot0 + spin; resolve(); }
        }
        requestAnimationFrame(step);
      });
    }

    function addTrail(x, y) {
      const d = document.createElement("div");
      d.className = "trail";
      d.style.left = x + "px";
      d.style.top = y + "px";
      fx.append(d);
      setTimeout(() => d.remove(), 600);
    }

    function dust(x, y) {
      const unit = Math.min(innerWidth, innerHeight) / 100;
      for (const dir of [-1, 0, 1]) {
        const d = document.createElement("div");
        d.className = "puff";
        d.style.left = x + "px";
        d.style.top = y + "px";
        d.style.setProperty("--px", `${dir * 5 * unit}px`);
        fx.append(d);
        setTimeout(() => d.remove(), 650);
      }
    }

    function ringAt(x, y) {
      const d = document.createElement("div");
      d.className = "ringfx";
      d.style.left = x + "px";
      d.style.top = y + "px";
      fx.append(d);
      setTimeout(() => d.remove(), 650);
    }

    function makeFlyer(ball) {
      const size = ball.el.offsetWidth;
      const f = document.createElement("div");
      f.className = "flyer";
      f.style.width = f.style.height = size + "px";
      f.append(ball.inner.cloneNode(true));
      f._r = size / 2;
      fx.append(f);
      return f;
    }

    // ---------- Ari i målet ----------
    function buildMane() {
      const mane = keeper.querySelector(".mane");
      const base = document.createElementNS(NS, "circle");
      for (const [k, v] of Object.entries({ cx: 100, cy: 108, r: 62, fill: "#c9741f" })) base.setAttribute(k, v);
      mane.append(base);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("cx", 100 + Math.cos(a) * 50);
        c.setAttribute("cy", 108 + Math.sin(a) * 50);
        c.setAttribute("r", 24);
        c.setAttribute("fill", i % 2 ? "#b8651b" : "#d9822b");
        c.setAttribute("stroke", "#8f4d12");
        c.setAttribute("stroke-width", 2.5);
        mane.append(c);
      }
    }
    buildMane();

    // Målmanden går frem og tilbage foran målet. Han flytter sig i px fra målets midte.
    const kp = { x: 0 };
    let patrolOn = false;
    let phase = 0;
    let lastFrame = performance.now();

    const keeperAmp = () => { const g = goalGeom(); return Math.max(0, g.w / 2 - keeper.offsetWidth * .62); };

    function setKeeperX(px, dur = 0) {
      kp.x = px;
      keeper.style.transition = dur ? `transform ${dur}ms cubic-bezier(.22,.9,.3,1)` : "none";
      keeper.style.transform = `translateX(calc(-50% + ${px}px))`;
    }

    // Går hurtigere for hvert billede i en pokalrunde, og er hurtigst i den svære version
    function keeperPeriod() { return Math.max(1.5, 3.1 - progress * .3 - (mode === "hard" ? .5 : 0)); }

    function patrolTick(now) {
      const dt = Math.min(.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (patrolOn && !reduceMotion) {
        phase += dt * (Math.PI * 2 / keeperPeriod());
        setKeeperX(Math.sin(phase) * keeperAmp());
      }
      requestAnimationFrame(patrolTick);
    }
    requestAnimationFrame(patrolTick);

    function resumePatrol() {
      const amp = keeperAmp() || 1;
      phase = Math.asin(clamp(kp.x / amp, -1, 1));
      patrolOn = true;
    }

    let kToken = 0;
    function kAnim(to, { dur = 400, delay: d = 0, easing = "ease-out" } = {}) {
      kin.style.transition = `transform ${dur}ms ${easing} ${d}ms`;
      kin.style.transform = to;
      return delay(dur + d);
    }

    // Dyk mod en x-position i målet
    function keeperDiveTo(x, dur, high = false) {
      kToken++;
      patrolOn = false;
      const g = goalGeom();
      const amp = keeperAmp();
      const px = clamp(x - g.cx, -amp, amp);
      const dir = Math.sign(px - kp.x) || 1;
      setKeeperX(px, dur);
      return kAnim(`translate(0px, ${-g.h * (high ? .2 : .08)}px) rotate(${dir * 62}deg)`, { dur: 430, easing: "cubic-bezier(.22,.9,.3,1)" });
    }

    function keeperReset() {
      kToken++;
      kin.style.transition = "none";
      kin.style.transform = "";
    }

    async function keeperRecover(d = 0) {
      const token = ++kToken;
      await kAnim("translate(0px, 0px) rotate(0deg)", { dur: 380, delay: d, easing: "cubic-bezier(.3,1.5,.5,1)" });
      if (token === kToken) keeperReset();
    }

    async function keeperJump(times) {
      const token = ++kToken;
      const h = -goal.offsetHeight * .22;
      for (let i = 0; i < times; i++) {
        for (const to of [`translateY(${h}px) rotate(${i % 2 ? 6 : -6}deg)`, "translateY(0px) rotate(0deg)"]) {
          if (token !== kToken) return;
          await kAnim(to, { dur: 170, easing: "ease-in-out" });
        }
      }
      if (token === kToken) keeperReset();
    }

    function keeperLook(dir) { look.style.transform = `translate(${dir * 5}px, 2px)`; }

    function keeperMood(classes, on) {
      for (const c of classes.split(" ")) keeper.classList.toggle(c, on);
    }

    // ---------- Bolde, skærm og tekst ----------
    function patchesSVG() {
      const pent = (cx, cy, r, rot) => Array.from({ length: 5 }, (_, k) => {
        const a = (rot + k * 72) * Math.PI / 180;
        return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
      }).join(" ");
      let polys = "", seams = "";
      for (let i = 0; i < 5; i++) {
        const a = (-90 + i * 72) * Math.PI / 180;
        polys += `<polygon points="${pent(50 + 40 * Math.cos(a), 50 + 40 * Math.sin(a), 12, -90 + i * 72 + 180)}"/>`;
        seams += `M${(50 + 22 * Math.cos(a)).toFixed(1)} ${(50 + 22 * Math.sin(a)).toFixed(1)}L${(50 + 30 * Math.cos(a)).toFixed(1)} ${(50 + 30 * Math.sin(a)).toFixed(1)}`;
      }
      return `<svg class="patches" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <circle cx="50" cy="50" r="48" fill="url(#ballGrad)"/>
        <g clip-path="url(#ballClip)" fill="#2b2f3a">${polys}</g>
        <path d="${seams}" stroke="#2b2f3a" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="50" cy="50" r="48" fill="none" stroke="#2b2f3a" stroke-width="3"/>
      </svg>`;
    }
    const PATCHES = patchesSVG();

    function setBubble(text) {
      bubbleEl.textContent = text;
      bubbleEl.classList.remove("pop");
      void bubbleEl.offsetWidth;
      bubbleEl.classList.add("pop");
    }

    function showBanner(text, small, miss) {
      banner.textContent = text;
      banner.className = "banner";
      void banner.offsetWidth;
      banner.className = "banner show" + (small ? " small" : "") + (miss ? " miss" : "");
    }

    function floatText(text) {
      const d = document.createElement("div");
      d.className = "floater";
      d.textContent = text;
      stage.append(d);
      setTimeout(() => d.remove(), 1700);
    }

    function crowdCheer(ms) {
      stands.classList.add("cheer");
      clearTimeout(crowdCheer.t);
      crowdCheer.t = setTimeout(() => stands.classList.remove("cheer"), ms);
    }

    // Publikum fylder hele bredden og tilpasser sig skærmens form
    function buildCrowd() {
      const w = stands.clientWidth || innerWidth, h = stands.clientHeight || innerHeight * .34;
      const vbH = 100 * h / w;
      const shirts = ["#e8453c", "#ffd54f", "#4f9dff", "#ffffff", "#5be39a", "#ff8fd1"];
      const skins = ["#f6d2b0", "#e8b98a", "#c68a5c", "#8d5a3b"];
      const spacing = Math.max(3, Math.min(9, 100 * (h * .17) / w));
      let out = "";
      const rows = Math.max(2, Math.floor((vbH - 6) / (spacing * 1.35)));
      for (let row = 0; row < rows; row++) {
        const y = vbH * .3 + row * spacing * 1.35;
        for (let x = spacing / 2 + (row % 2 ? spacing / 2 : 0); x < 100; x += spacing) {
          const d = (Math.random() * -2.4).toFixed(2);
          const r = spacing * .4;
          out += `<g class="p" style="--d:${d}s"><rect x="${(x - r).toFixed(1)}" y="${y.toFixed(1)}" width="${(r * 2).toFixed(1)}" height="${(spacing * .95).toFixed(1)}" rx="${(r * .8).toFixed(1)}" fill="${pick(shirts)}"/><circle cx="${x.toFixed(1)}" cy="${(y - r * .6).toFixed(1)}" r="${(r * .95).toFixed(1)}" fill="${pick(skins)}"/></g>`;
        }
      }
      stands.innerHTML = `<svg viewBox="0 0 100 ${vbH.toFixed(2)}" preserveAspectRatio="none" aria-hidden="true" focusable="false">${out}</svg>`;
    }

    // ---------- Opgaver ----------
    function nextItem() {
      if (!bag.length) bag = shuffle(WORDS.slice());
      let entry;
      if (!firstWordDone) {
        firstWordDone = true;
        entry = WORDS[0];
        bag = bag.filter(w => w !== entry);
      } else entry = bag.pop();
      return { values: entry[0].split(""), pic: entry[1], intro: "Hvilken lyd kommer først?", speak: entry[0] };
    }

    function updateDots() {
      dotsEl.innerHTML = "";
      dotsEl.setAttribute("aria-label", `${progress} ord i træk uden fejl ud af ${WORDS_PER_STAR}`);
      for (let i = 0; i < WORDS_PER_STAR; i++) {
        const d = document.createElement("span");
        d.className = "dot" + (i < progress ? " on" : "");
        d.textContent = "⚽";
        dotsEl.append(d);
      }
    }

    function updateChips(bumpStar) { Topbar.refreshStars(bumpStar); }

    function applyMode() {
      for (const b of document.querySelectorAll(".mode")) b.setAttribute("aria-pressed", String(b.dataset.mode === mode));
    }

    // Bolde står forskellige steder på banen fra billede til billede (afstand og vinkel er forskellig)
    const FORMS = {
      land: [
        [[20, 80], [40, 80], [60, 80], [80, 80]],
        [[9, 82], [23, 77], [37, 82], [51, 77]],
        [[91, 82], [77, 77], [63, 82], [49, 77]],
        [[14, 77], [37, 82], [63, 82], [86, 77]]
      ],
      port: [
        [[12.5, 80], [37.5, 80], [62.5, 80], [87.5, 80]],
        [[12.5, 77], [37.5, 82], [62.5, 77], [87.5, 82]],
        [[12.5, 83], [37.5, 79], [62.5, 75], [87.5, 71]],
        [[12.5, 71], [37.5, 75], [62.5, 79], [87.5, 83]]
      ]
    };
    let formIndex = 0;

    function layoutBalls() {
      const set = FORMS[innerHeight > innerWidth ? "port" : "land"];
      const form = set[formIndex % set.length];
      balls.forEach((b, i) => {
        b.el.style.setProperty("--x", form[i][0] + "%");
        b.el.style.setProperty("--y", form[i][1] + "%");
      });
    }

    function startRound() {
      const myRound = ++roundId;
      round = nextItem();
      idx = 0; wrongs = 0; mistakes = 0; misses = 0;
      busy = true;
      fx.innerHTML = "";
      nextBtn.hidden = true;
      screen.classList.remove("win");
      keeperMood("cheer hug open guard", false);
      keeperReset();
      look.style.transform = "";
      resumePatrol();

      picEl.textContent = round.pic;
      picEl.classList.remove("pop");
      void picEl.offsetWidth;
      picEl.classList.add("pop");

      slotsEl.innerHTML = "";
      round.values.forEach((v, i) => {
        const s = document.createElement("div");
        s.className = "slot" + (i === 0 ? " cur" : "");
        s.innerHTML = `<span class="g">?</span>`;
        if (v.length > 1) s.style.fontSize = "min(5cqmin, 7cqh)";
        slotsEl.append(s);
      });

      let order;
      do { order = shuffle(round.values.slice()); } while (order.join() === round.values.join());
      const colors = shuffle(BALL_COLORS.slice());
      ballsEl.innerHTML = "";
      balls = order.map((value, i) => {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "ball";
        el.style.setProperty("--d", `${i * .09}s`);
        el.setAttribute("aria-label", `Bold med ${value}. Træk tilbage og slip for at skyde, eller tryk Enter.`);
        el.innerHTML = `<span class="shadow"></span><span class="ball-in"><span class="ball-core">${PATCHES}<span class="badge${value.length > 1 ? " two" : ""}" style="--c:${colors[i]}">${value}</span></span></span>`;
        const ball = { value, el, inner: el.querySelector(".ball-in"), color: colors[i] };
        el.addEventListener("pointerdown", e => beginAim(e, ball));
        el.addEventListener("keydown", e => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); quickShot(ball); }
        });
        el.addEventListener("click", () => { if (!aim && !busy && !ball.used && !el._dragged) nudge(ball); });
        ballsEl.append(el);
        return ball;
      });
      formIndex = progress === 0 && firstSpeech ? 0 : Math.floor(Math.random() * 4);
      layoutBalls();

      sfx.whistle();
      setBubble(firstSpeech ? "Træk bolden tilbage og skyd!" : round.intro);
      firstSpeech = false;
      setTimeout(() => {
        if (myRound === roundId) busy = false;
      }, 1000);
    }

    function nextSlotMark() {
      [...slotsEl.children].forEach((s, i) => s.classList.toggle("cur", i === idx));
    }

    function nudge(ball) {
      ball.el.classList.remove("nudge");
      void ball.el.offsetWidth;
      ball.el.classList.add("nudge");
      setBubble("Træk bolden ned, og slip!");
    }

    // ---------- Sigt og skyd ----------
    // Skudretningen er modsat det, man trækker (som en slangebøsse). Længden på trækket bestemmer, hvor højt i målet bolden rammer.
    function computeShot(start, pull, maxPull) {
      const g = goalGeom();
      const len = Math.hypot(pull.x, pull.y) || 1;
      const dx = -pull.x / len, dy = -pull.y / len;
      const power = clamp((len - MIN_PULL) / Math.max(1, maxPull - MIN_PULL), 0, 1);
      const yT = g.bottom - g.h * (.14 + .7 * power);
      let x, y = yT, onTarget = false;
      if (dy < -.18) {
        const k = (start.y - yT) / -dy;
        x = start.x + dx * k;
        const slack = g.w * (misses >= 2 ? .16 : .07);
        if (x > g.left - slack && x < g.right + slack) {
          onTarget = true;
          x = clamp(x, g.left + g.w * .06, g.right - g.w * .06);
        }
      } else {
        // Trækket peger ikke nedad nok: skuddet går forbi
        x = start.x + dx * innerWidth * .6;
        y = start.y + dy * innerHeight * .6;
      }
      x = clamp(x, -40, innerWidth + 40);
      y = clamp(y, -40, innerHeight + 40);
      const shot = { x, y, onTarget, power, g, peak: 0 };
      const dist = Math.hypot(x - start.x, y - start.y);
      shot.peak = 24 + dist * .1;
      return shot;
    }

    // Bolden følger en bue fra start til mål. u går fra 0 til 1 og bruges både til aim, kollision og selve skuddet.
    const SCALE_START = 1.06;
    function shotPos(start, t, u) {
      const e = easeOut(u);
      return {
        x: start.x + (t.x - start.x) * e,
        y: start.y + (t.y - start.y) * e - t.peak * 4 * u * (1 - u),
        s: SCALE_START + ((t.onTarget ? .6 : .6) - SCALE_START) * e
      };
    }

    const flightMs = (start, t, power) => Math.round(520 + Math.hypot(t.x - start.x, t.y - start.y) * .26 - power * 150);

    // Flyver bolden langs buen til og med u = uEnd
    function flyCurve(el, start, t, { dur, spin = 0, uEnd = 1, trail = true }) {
      const patches = el.querySelector(".patches");
      const rot0 = el._rot || 0;
      return new Promise(resolve => {
        const t0 = performance.now();
        const total = Math.max(120, dur * uEnd);
        let lastTrail = 0;
        function step(now) {
          const k = Math.min(1, (now - t0) / total);
          const u = k * uEnd;
          const p = shotPos(start, t, u);
          place(el, p.x, p.y, p.s);
          if (patches) patches.style.transform = `rotate(${rot0 + spin * k}deg)`;
          if (trail && now - lastTrail > 36) { lastTrail = now; addTrail(p.x, p.y); }
          if (k < 1) requestAnimationFrame(step);
          else { el._rot = rot0 + spin * uEnd; resolve(); }
        }
        requestAnimationFrame(step);
      });
    }

    function drawAim(a) {
      aimCtx.clearRect(0, 0, innerWidth, innerHeight);
      const len = Math.hypot(a.pull.x, a.pull.y);
      if (len < MIN_PULL * .6) return;
      const t = computeShot(a.start, a.pull, a.maxPull);
      const unit = Math.min(innerWidth, innerHeight) / 100;
      const col = t.onTarget ? "#ffffff" : "#ff9d8f";
      aimCtx.fillStyle = col;
      aimCtx.shadowColor = "#0007";
      aimCtx.shadowBlur = 5;
      const dots = 14;
      for (let i = 1; i <= dots; i++) {
        const k = i / (dots + 1);
        const p = shotPos(a.start, t, k);
        aimCtx.globalAlpha = .95 - k * .35;
        aimCtx.beginPath();
        aimCtx.arc(p.x, p.y, Math.max(2.6, unit * (1.15 - k * .55)), 0, 7);
        aimCtx.fill();
      }
      aimCtx.globalAlpha = 1;
      aimCtx.strokeStyle = col;
      aimCtx.lineWidth = Math.max(3, unit * .7);
      const r = unit * 3.2;
      // Sigtekorn der hvor bolden rammer
      aimCtx.beginPath();
      aimCtx.arc(t.x, t.y, r, 0, 7);
      aimCtx.moveTo(t.x - r * 1.5, t.y); aimCtx.lineTo(t.x - r * .5, t.y);
      aimCtx.moveTo(t.x + r * .5, t.y); aimCtx.lineTo(t.x + r * 1.5, t.y);
      aimCtx.moveTo(t.x, t.y - r * 1.5); aimCtx.lineTo(t.x, t.y - r * .5);
      aimCtx.moveTo(t.x, t.y + r * .5); aimCtx.lineTo(t.x, t.y + r * 1.5);
      aimCtx.stroke();
      aimCtx.shadowBlur = 0;
    }

    function clearAim() { aimCtx.clearRect(0, 0, innerWidth, innerHeight); }

    function beginAim(e, ball) {
      if (!e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return;
      if (busy || !round || ball.used || aim) return;
      e.preventDefault();
      audio();
      const start = rel(ball.el);
      const r = ball.el.offsetWidth / 2;
      const room = innerHeight - start.y - r - 10;
      const f = makeFlyer(ball);
      place(f, start.x, start.y, 1.06);
      ball.el.classList.add("away");
      ball.el._dragged = true;
      try { ball.el.setPointerCapture(e.pointerId); } catch { /* ingen capture */ }
      aim = {
        ball, f, start, r, id: e.pointerId,
        origin: { x: e.clientX, y: e.clientY },
        pull: { x: 0, y: 0 },
        maxPull: clamp(room, 60, MAX_PULL),
        lastTick: 0
      };
      keeperMood("guard", true);
      setBubble("Sigt, og slip!");
    }

    document.addEventListener("pointermove", e => {
      if (!aim || e.pointerId !== aim.id) return;
      let px = e.clientX - aim.origin.x, py = e.clientY - aim.origin.y;
      const len = Math.hypot(px, py);
      if (len > aim.maxPull) { px *= aim.maxPull / len; py *= aim.maxPull / len; }
      aim.pull = { x: px, y: py };
      place(aim.f, aim.start.x + px, aim.start.y + py, 1.06);
      const p = clamp(Math.hypot(px, py) / aim.maxPull, 0, 1);
      if (Math.abs(p - aim.lastTick) > .12) { aim.lastTick = p; sfx.stretch(p); }
      drawAim(aim);
    });

    function endAim(e, cancelled) {
      if (!aim || e.pointerId !== aim.id) return;
      const a = aim;
      aim = null;
      clearAim();
      keeperMood("guard", false);
      setTimeout(() => { a.ball.el._dragged = false; }, 50);
      const len = Math.hypot(a.pull.x, a.pull.y);
      if (cancelled || len < MIN_PULL) {
        a.f.remove();
        a.ball.el.classList.remove("away");
        if (!cancelled) nudge(a.ball);
        return;
      }
      shoot(a.ball, a.f, a.start, computeShot(a.start, a.pull, a.maxPull));
    }

    document.addEventListener("pointerup", e => endAim(e, false));
    document.addEventListener("pointercancel", e => endAim(e, true));

    // Tastatur: Enter skyder lige mod målet
    function quickShot(ball) {
      if (busy || !round || ball.used || aim) return;
      audio();
      const start = rel(ball.el);
      const g = goalGeom();
      const f = makeFlyer(ball);
      place(f, start.x, start.y, 1);
      ball.el.classList.add("away");
      const t = { x: g.cx + (Math.random() - .5) * g.w * .7, y: g.bottom - g.h * (.3 + Math.random() * .35), onTarget: true, power: .85, g, peak: 0 };
      const dist = Math.hypot(t.x - start.x, t.y - start.y);
      t.peak = 24 + dist * .1;
      shoot(ball, f, start, t);
    }

    async function shoot(ball, f, start, t) {
      busy = true;
      patrolOn = false;
      const myRound = roundId;
      const ok = ball.value === round.values[idx];
      const g = t.g;
      const side = Math.sign(t.x - g.cx) || (Math.random() < .5 ? -1 : 1);
      const dur = flightMs(start, t, t.power);
      const spin = side * (500 + Math.random() * 300);

      sfx.kick();
      dust(start.x, start.y + f._r * .8);
      keeperLook(side);

      if (!t.onTarget) {
        // Forbi målet: ingen straf, bolden kommer tilbage
        await flyCurve(f, start, t, { dur, spin });
        if (myRound !== roundId) return f.remove();
        return missed(ball, f, t, start, side);
      }

      if (ok) {
        // Rigtig bold: Ari kaster sig den forkerte vej, og der scores
        const awayDir = Math.sign(t.x - (g.cx + kp.x)) || 1;
        keeperDiveTo(g.cx + kp.x - awayDir * g.w * .22, dur * .5, false);
      } else {
        keeperDiveTo(t.x, Math.min(dur * .8, 420), t.y < g.top + g.h * .5);
      }
      await flyCurve(f, start, t, { dur, spin });
      if (myRound !== roundId) return f.remove();

      if (ok) await goalScored(ball, f, t.x, t.y, g, side);
      else await caught(ball, f, t.x, t.y, g, start, side);
    }

    async function missed(ball, f, t, start, side) {
      sfx.ooh();
      misses++;
      showBanner("Forbi!", true, true);
      setBubble(misses >= 2 ? "Sigt mod målet, så rammer du!" : "Forbi! Prøv igen!");
      f.style.transition = "opacity .3s";
      f.style.opacity = "0";
      await delay(260);
      f.remove();
      ball.el.classList.remove("away", "land");
      void ball.el.offsetWidth;
      ball.el.classList.add("land");
      sfx.thud();
      keeperLook(0);
      keeperRecover(0);
      busy = false;
      resumePatrol();
    }

    async function goalScored(ball, f, tx, ty, g, side) {
      const slotIndex = idx;
      const gr = rel(net);
      net.style.setProperty("--ox", `${tx - gr.l}px`);
      net.style.setProperty("--oy", `${ty - gr.t}px`);
      net.classList.remove("hit");
      void net.offsetWidth;
      net.classList.add("hit");
      ringAt(tx, ty);
      sfx.swish();
      crowdCheer(1100);
      burst(tx, ty, 22, { speed: 6, size: 6, life: 50 });
      showBanner("Mål!", true);
      keeperMood("open", true);
      misses = 0;

      ball.used = true;
      idx++;
      const lastOne = idx >= N;
      const bottom = g.bottom - f._r * .62 - 1;
      const recover = keeperRecover(420);
      await fly(f, { x0: tx, y0: ty, x1: tx + side * 4, y1: bottom, s0: .62, s1: .62, dur: 330, ease: easeIn, spin: side * 120, trail: false });
      sfx.thud();
      await fly(f, { x0: tx + side * 4, y0: bottom, x1: tx + side * 14, y1: bottom, s0: .62, s1: .62, peak: 12, dur: 230, spin: side * 90, trail: false });

      const lp = flyLetter(ball.value, ball.color, tx + side * 14, bottom, slotIndex);
      ringAt(tx + side * 14, bottom);
      f.remove();

      await recover;
      keeperMood("open", false);
      keeperLook(0);
      if (lastOne) { await lp; return finishRound(); }
      nextSlotMark();
      wrongs = 0;
      busy = false;
      resumePatrol();
    }

    async function flyLetter(value, color, x0, y0, slotIndex) {
      const l = document.createElement("div");
      l.className = "lfly";
      l.textContent = value;
      l.style.setProperty("--c", color);
      if (value.length > 1) l.style.fontSize = "5cqmin";
      fx.append(l);
      l._r = l.offsetWidth / 2;
      const slot = slotsEl.children[slotIndex];
      const sc = rel(slot);
      place(l, x0, y0, 1.1);
      await fly(l, { x0, y0, x1: sc.x, y1: sc.y, s0: 1.15, s1: .95, peak: 50, dur: 620, ease: easeInOut });
      l.remove();
      slot.classList.remove("cur");
      slot.style.setProperty("--c", color);
      slot.classList.add("filled");
      slot.firstChild.textContent = value;
      sfx.ding(slotIndex);
      burst(sc.x, sc.y, 16, { speed: 5, size: 5, life: 45, shape: "star", colors: ["#ffd54f", "#fff", "#ff9a3c"] });
    }

    async function caught(ball, f, tx, ty, g, s0, side) {
      sfx.boing();
      keeperMood("hug open", true);
      ringAt(tx, ty);
      setBubble(pick(["Hov! Ari tog den!", "Hihi! Prøv en anden!", "Nam! Ari fik den!"]));
      mistakes++;
      wrongs++;
      misses = 0;
      await delay(480);

      const front = { x: g.cx + kp.x, y: g.top + g.h * .56 };
      await Promise.all([
        keeperRecover(0),
        fly(f, { x0: tx, y0: ty, x1: front.x, y1: front.y, s0: .56, s1: .72, dur: 380, ease: easeInOut, trail: false })
      ]);
      keeperMood("hug", false);
      keeperJump(1);
      sfx.kick();
      const home = rel(ball.el);
      await fly(f, { x0: front.x, y0: front.y, x1: home.x, y1: home.y, s0: .72, s1: 1, peak: 140, dur: 780, spin: -side * 700, ease: easeIn });
      f.remove();
      ball.el.classList.remove("away");
      ball.el.classList.remove("land");
      void ball.el.offsetWidth;
      ball.el.classList.add("land");
      dust(home.x, home.y + ball.el.offsetWidth * .45);
      sfx.thud();
      keeperMood("open", false);
      keeperLook(0);

      busy = false;
      resumePatrol();
    }

    async function finishRound() {
      busy = true;
      patrolOn = false;
      const perfect = mistakes === 0;
      const hadStreak = progress > 0;
      progress = perfect ? progress + 1 : 0;
      const earned = progress >= WORDS_PER_STAR;
      updateDots();
      if (!perfect && hadStreak) {
        dotsEl.classList.remove("reset");
        void dotsEl.offsetWidth;
        dotsEl.classList.add("reset");
      }

      screen.classList.add("win");
      crowdCheer(3200);
      sfx.fanfare();
      sfx.cheer(true);
      setTimeout(sfx.roar, 500);
      keeperMood("cheer open", true);
      keeperJump(3);
      showBanner(perfect ? "Perfekt!" : "Mål!", false);
      if (perfect) floatText(`⚽ ${progress}/${WORDS_PER_STAR}`);
      confettiRain(1800);
      fireworksShow(earned ? 7 : 3);
      [...slotsEl.children].forEach((s, i) => setTimeout(() => {
        s.classList.remove("wave");
        void s.offsetWidth;
        s.classList.add("wave");
      }, 300 + i * 160));
      setBubble(perfect ? `${round.speak}! Flot stavet!` : `${round.speak}! Næste gang uden fejl!`);
      wave(roundId);

      await delay(2400);
      keeperMood("cheer open", false);
      if (earned) showStarPopup();
      else nextBtn.hidden = false;
    }

    async function wave(id) {
      await delay(600);
      if (id === roundId) say(round.speak, .8);
    }

    let popupTimer = 0;
    function showStarPopup() {
      stars++;
      store.set("maal-stars", stars);
      const pop = $("trophy");
      pop.querySelectorAll(".sparkle").forEach(s => s.remove());
      for (let i = 0; i < 14; i++) {
        const s = document.createElement("span");
        const angle = (i / 14) * Math.PI * 2;
        const dist = 26 + Math.random() * 20;
        s.className = "sparkle";
        s.textContent = i % 2 ? "✨" : "⭐";
        s.style.setProperty("--dx", `${Math.cos(angle) * dist}cqmin`);
        s.style.setProperty("--dy", `${Math.sin(angle) * dist}cqmin`);
        s.style.animationDelay = `${Math.random() * .25}s`;
        pop.append(s);
      }
      $("trophyTitle").textContent = stars > 1 ? `Stjerne nummer ${stars}!` : "Du fik en stjerne!";
      pop.hidden = false;
      sfx.fanfare();
      sfx.cheer(true);
      fireworksShow(6);
      confettiRain(3000);
      updateChips(true);
      clearTimeout(popupTimer);
      popupTimer = setTimeout(closeStarPopup, 6000);
    }

    function closeStarPopup() {
      clearTimeout(popupTimer);
      const pop = $("trophy");
      if (pop.hidden) return;
      pop.hidden = true;
      progress = 0;
      updateDots();
      startRound();
    }

    // ---------- Styring ----------
    $("startBtn").addEventListener("click", () => {
      started = true;
      $("start").hidden = true;
      audio();
      startRound();
    });

    nextBtn.addEventListener("click", () => {
      if (!started) return;
      audio();
      if ("speechSynthesis" in window) speechSynthesis.cancel();
      startRound();
    });

    $("trophyBtn").addEventListener("click", closeStarPopup);

    function sayAgain() {
      if (!round) return;
      audio();
      screen.classList.remove("wiggle");
      void screen.offsetWidth;
      screen.classList.add("wiggle");
      say(round.speak, .8);
    }
    screen.addEventListener("click", sayAgain);
    screen.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sayAgain(); } });

    for (const b of document.querySelectorAll(".mode")) {
      b.addEventListener("click", () => {
        if (b.dataset.mode === mode) return;
        mode = b.dataset.mode;
        store.set("maal-mode", mode);
        bag = [];
        applyMode();
        if (started) { progress = 0; updateDots(); $("trophy").hidden = true; startRound(); }
      });
    }

    window.addEventListener("topbar:sound", e => {
      muted = !e.detail.on;
      if (muted && "speechSynthesis" in window) speechSynthesis.cancel();
    });

    let resizeTimer = 0;
    addEventListener("resize", () => {
      resizeCanvas();
      layoutBalls();
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildCrowd, 150);
    });

    buildCrowd();
    applyMode();
    Topbar.init({ kid: "ari", controls: [$("modes")] });
    updateDots();
    slotsEl.innerHTML = [0, 1, 2, 3].map(() => '<div class="slot"><span class="g">?</span></div>').join("");
    picEl.textContent = "🦁";
    resumePatrol();
