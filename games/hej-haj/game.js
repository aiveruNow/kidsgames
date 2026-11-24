  (() => {
    "use strict";
    // Ord, billeder og lydklip er Urundais (samme tamilske ord, samme gentagelse). Ordstatistikken deles med Urundai.
    const R = window.UrundaiOrd;
    const Art = window.UrundaiArt;
    const AR = window.HajArter; // havets 7 have og rigtige arter (species.js)
    const SPECIES = AR.species;
    const WORLDS = AR.worlds;
    const WORDS = R.words;
    const ALL = Object.keys(WORDS);
    const $ = (id) => document.getElementById(id);
    const kid = "ari";
    const key = (name) => `haj-${kid}-${name}`;
    const WORDS_KEY = `urundai-${kid}-words`;
    const read = (name, fallback) => { try { const v = localStorage.getItem(key(name)); return v === null ? fallback : v; } catch { return fallback; } };
    const write = (name, value) => { try { localStorage.setItem(key(name), String(value)); } catch { /* ingen lagring */ } };
    const readWords = () => { try { return JSON.parse(localStorage.getItem(WORDS_KEY) || "") || {}; } catch { return {}; } };

    const wordState = readWords(); // id -> { box 0-3, seen, ok, bad, t }
    let stars = Number(read("stars", "0")) || 0;
    let curWorld = Math.max(0, Number(read("hav", "0")) || 0) % WORLDS.length; // hvilket af de 7 have man er nået til (0-6)
    let muted = !Topbar.soundOn();
    const { audio, tone, buzz } = KidsSynth.create(() => muted);
    window.addEventListener("topbar:sound", (e) => { muted = !e.detail.on; if (muted) stopSpeech(); });

    const ws = (id) => wordState[id] || (wordState[id] = { box: 0, seen: false, ok: 0, bad: 0, t: 0 });
    const saveWords = () => { try { localStorage.setItem(WORDS_KEY, JSON.stringify(wordState)); } catch { /* ingen lagring */ } };
    const rnd = (n) => Math.floor(Math.random() * n);
    const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const seenCount = () => ALL.filter((id) => ws(id).seen).length;
    const seenIds = () => ALL.filter((id) => ws(id).seen);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    // Gentagelse: ord, barnet er svagest til eller ikke har set længe, trækkes oftest (men altid med tilfældighed)
    function weight(id) {
      const st = ws(id);
      const stale = Math.min(3, (Date.now() - (st.t || 0)) / 600000);
      return Math.max(.6, 4 - st.box) + stale;
    }
    function pickWeighted(ids, n, exclude = []) {
      const pool = ids.filter((id) => !exclude.includes(id));
      const out = [];
      while (out.length < n && pool.length) {
        let r = Math.random() * pool.reduce((s, id) => s + weight(id), 0);
        let k = 0;
        for (; k < pool.length - 1; k++) { r -= weight(pool[k]); if (r <= 0) break; }
        out.push(pool.splice(k, 1)[0]);
      }
      return out;
    }

    const FACT = { rolig: .6, normal: .8, hurtig: 1 };
    let speedKey = FACT[read("fart", "")] ? read("fart", "") : "normal";
    let controlMode = read("styring", "tryk") === "traek" ? "traek" : "tryk";
    const hintText = () => (controlMode === "tryk" ? "Hold fingeren nede for at stige!" : "Træk op og ned for at svømme!");

    // ---------- Tegninger (haj og fisk) ----------
    // Samme former bruges i SVG (forside, popups) og på lærredet. Alt er tegnet med radius 1.
    const SHARK = {
      body: "M1.3 .1C1.1 -.35 .6 -.62 0 -.6C-.4 -.58 -.6 -.3 -.85 -.12L-1.35 -.62L-1.15 0L-1.3 .55L-.85 .14C-.5 .45 .3 .55 .8 .35C1.05 .25 1.2 .2 1.3 .1Z",
      belly: "M1.3 .1C1.2 .2 1.05 .25 .8 .35C.3 .55 -.5 .45 -.85 .14C-.4 .3 .4 .3 1.3 .1Z",
      dorsal: "M.15 -.58L-.3 -1.05L-.45 -.45Z",
      pect: "M.25 .3L-.25 .85L-.35 .28Z"
    };
    const sharkSvg = (id = "s") => `<svg viewBox="-1.5 -1.15 2.9 2.1" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="-.6" x2="0" y2=".5" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2f7fc4"/><stop offset="1" stop-color="#5fc0ee"/></linearGradient></defs>` +
      `<path d="${SHARK.dorsal}" fill="#2a6fb0"/><path d="${SHARK.pect}" fill="#2a6fb0"/><path d="${SHARK.body}" fill="url(#${id})" stroke="#1f5a92" stroke-width=".05" stroke-linejoin="round"/>` +
      `<path d="${SHARK.belly}" fill="#f4fbff"/><circle cx=".8" cy="-.12" r=".12" fill="#fff"/><circle cx=".83" cy="-.12" r=".065" fill="#12263a"/>` +
      `<path d="M1.27 .13Q.95 .32 .6 .22" fill="none" stroke="#12263a" stroke-width=".04" stroke-linecap="round"/><path d="M.5 -.25Q.46 -.1 .5 .05M.38 -.26Q.34 -.1 .38 .04" fill="none" stroke="#1f5a92" stroke-width=".03" stroke-linecap="round"/></svg>`;
    $("mascot").innerHTML = sharkSvg("sm");

    // ---------- Billeder til ordene ----------
    function pic(id) {
      const p = WORDS[id].pic;
      const el = document.createElement("div");
      el.className = "pic";
      if (p.color) el.innerHTML = Art.swatch(p.color);
      else if (p.count) el.innerHTML = Art.get(`n${p.count}`);
      else el.innerHTML = Art.get(p.art);
      return el;
    }
    function picBox(id) {
      const box = document.createElement("div");
      box.className = "pbox";
      box.append(pic(id));
      return box;
    }
    const starSvg = (cls = "") => `<svg class="${cls}" viewBox="0 0 100 96" aria-hidden="true"><polygon points="50,4 62,36 96,37 69,58 79,91 50,72 21,91 31,58 4,37 38,36" fill="#ffc933" stroke="#e08a00" stroke-width="5" stroke-linejoin="round"/></svg>`;
    // Lange tamilske ord får mindre skrift, så de kan være i kortene
    const lenCls = (txt) => (txt.length >= 11 ? "xlong" : txt.length >= 8 ? "long" : "");
    // Krymper tamilsk tekst, til den passer i sin ramme (aldrig ud over kanten)
    const FIT = ".card-w .t, .mcard .t, .wordbtn .tw, #wordPop .tw";
    function fitAll() {
      for (const el of document.querySelectorAll(FIT)) {
        el.style.fontSize = "";
        if (!el.clientWidth) continue; // skjult
        let fs = parseFloat(getComputedStyle(el).fontSize);
        for (let i = 0; i < 30 && el.scrollWidth > el.clientWidth + 1 && fs > 10; i++) {
          fs *= .92;
          el.style.fontSize = `${fs.toFixed(1)}px`;
        }
      }
    }
    const fitSoon = () => { fitAll(); requestAnimationFrame(fitAll); setTimeout(fitAll, 250); };
    window.addEventListener("resize", fitSoon);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitSoon);

    // ---------- Lyd ----------
    // Mobiler tillader kun lyd, hvis afspilleren er "låst op" af en berøring. Afvises et klip alligevel, gemmes det og spilles ved næste tryk.
    const clip = new Audio();
    clip.preload = "auto";
    const SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
    let speechToken = 0;
    let factToken = 0; // dyrefakta bruger samme afspiller; et nyt klip eller stopSpeech gør det gamle ugyldigt
    let speechDone = null;
    let unlocked = false;
    let pendingSpeech = null;
    function setNote(text) {
      for (const id of ["quizNote", "meetNote"]) {
        const el = $(id);
        if (el) { el.textContent = text; el.hidden = !text; }
      }
    }
    const refreshNote = () => setNote(muted ? "🔇 Lyden er slået fra. Slå den til i ⚙️." : pendingSpeech ? "🔈 Tryk på skærmen for at høre ordet." : "");
    function unlockAudio() {
      if (unlocked) return;
      unlocked = true;
      audio();
      try {
        clip.src = SILENT;
        const p = clip.play();
        if (p && p.catch) p.catch((err) => { if (err && err.name === "NotAllowedError") unlocked = false; });
      } catch { unlocked = false; }
    }
    function stopSpeech() {
      speechToken++;
      factToken++;
      clip.onended = null;
      clip.onerror = null;
      clip.onplaying = null;
      clip.ontimeupdate = null;
      clip.pause();
      if (speechDone) { const d = speechDone; speechDone = null; d(false); }
      if (typeof faunaAudioStopped === "function") faunaAudioStopped();
    }
    // Svarer true, når klippet er spillet til ende, og false, hvis noget andet afbrød det eller afspilningen blev afvist
    const setSpeaking = (on) => $("quizWord").classList.toggle("speaking", on);
    function speak(id) {
      stopSpeech();
      const token = speechToken;
      return new Promise((resolve) => {
        let finished = false;
        let safety = 0;
        let endTimer = 0;
        setSpeaking(true);
        const finish = (ok) => {
          if (finished) return;
          finished = true;
          setSpeaking(false);
          clearTimeout(safety);
          clearTimeout(endTimer);
          if (speechDone === done) speechDone = null;
          resolve(ok && token === speechToken);
        };
        const done = (ok) => finish(ok);
        speechDone = done;
        if (muted) { setTimeout(() => finish(true), 500); return; }
        clip.onended = () => finish(true);
        clip.onerror = () => setTimeout(() => finish(true), 300);
        // Stemmen lægger stilhed efter ordet: gå videre, så snart ordet er sagt
        const len = (window.UrundaiLaengder || {})[id];
        clip.onplaying = () => {
          clip.onplaying = null;
          if (len) endTimer = setTimeout(() => { if (token === speechToken) { clip.pause(); finish(true); } }, (len + .25) * 1000);
        };
        clip.src = `../../shared/tamil-words/audio/${id}.mp3`;
        const p = clip.play();
        if (p && p.catch) {
          p.catch((err) => {
            if (token !== speechToken) return; // et nyt klip afbrød dette
            if (err && err.name === "NotAllowedError") { unlocked = false; pendingSpeech = id; refreshNote(); finish(false); } else setTimeout(() => finish(true), 300);
          });
        }
        if (pendingSpeech === id) { pendingSpeech = null; refreshNote(); }
        safety = setTimeout(() => finish(true), 6000);
      });
    }
    for (const ev of ["pointerdown", "touchend", "keydown"]) {
      document.addEventListener(ev, () => {
        unlockAudio();
        if (pendingSpeech) { const id = pendingSpeech; pendingSpeech = null; refreshNote(); speak(id); }
      }, true);
    }
    window.addEventListener("topbar:sound", refreshNote);
    const sfx = {
      eat: () => { tone(420, .09, "square", .06, 0, 500); tone(760, .08, "square", .05, .06); },
      caught: () => { [440, 370, 311, 262, 196, 147].forEach((f, i) => tone(f, .16, "sawtooth", .08, i * .12)); },
      ready: () => { [392, 523, 659, 784].forEach((f, i) => tone(f, .16, "triangle", .08, i * .15)); },
      wrong: () => tone(220, .28, "triangle", .1, 0, -90),
      right: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .22, "triangle", .12, i * .09)),
      fanfare: () => [523, 659, 784, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .28, "triangle", .13, i * .12)),
      pop: () => { tone(480, .1, "triangle", .12, 0, 380); tone(760, .12, "triangle", .08, .08); },
      levelup: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .2, "triangle", .12, i * .07))
    };

    // ---------- Skærme ----------
    const SCREENS = ["home", "dictScreen", "play"];
    let screen = "home";
    function show(name) {
      screen = name;
      for (const s of SCREENS) $(s).hidden = s !== name;
      if (name === "play") resize();
      document.body.classList.toggle("playing", name === "play");
    }
    // Urundais junglescene i havfarver: bladene bliver til tang og tempeltårnene til ruiner
    const seaUri = (wide) => `url("${Art.dataUri(Art.scene("#38bdf8", "#0a4466", wide))}")`;
    const paintBg = () => { $("bg").style.backgroundImage = seaUri(innerWidth > innerHeight); };
    paintBg();
    window.addEventListener("resize", paintBg);
    $("temple").innerHTML = Art.gopuram();

    function renderHome() {
      $("playBtn").textContent = `▶ Spil · ${WORLDS[curWorld].da}`;
      $("dictCount").textContent = `(${seenCount()}/${ALL.length})`;
      const total = Object.keys(INFO).length;
      $("faunaCount").textContent = `(${Object.keys(INFO).filter((id) => heard.has(id)).length}/${total})`;
    }

    function renderDict() {
      const body = $("dictBody");
      body.replaceChildren();
      for (const id of ALL) {
        const st = ws(id);
        const card = document.createElement("button");
        card.type = "button";
        if (st.seen) {
          card.className = "card-w";
          card.append(picBox(id));
          card.insertAdjacentHTML("beforeend", `<span class="t ${lenCls(WORDS[id].ta)}">${WORDS[id].ta}</span><span class="r rom">${WORDS[id].rom}</span><span class="d">${WORDS[id].da}</span><span class="medal">${[1, 2, 3].map((n) => `<i class="${st.box >= n ? "on" : ""}"></i>`).join("")}</span>`);
          card.addEventListener("click", () => { audio(); speak(id); card.animate([{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }], { duration: 300 }); });
        } else {
          card.className = "card-w unseen";
          card.innerHTML = `<span class="q">?</span>`;
          card.disabled = true;
        }
        body.append(card);
      }
      $("dictSub").textContent = `${seenCount()} af ${ALL.length} ord`;
      applyRom();
    }

    // ---------- Banen ----------
    const stage = $("stage");
    const cv = $("cv");
    const ctx = cv.getContext("2d");
    let SW = 0;
    let SH = 0;
    let u = 1; // 1 % af den korteste side
    let time = 0;
    let state = "home"; // home, meet, ready, play, dying, quiz, won, done
    let G = null;
    let sh = null;
    let fish = [];
    let particles = [];
    let bubbles = [];
    const pointer = { active: false, y: 0, y0: 0, ty0: 0 };
    const keys = { y: 0, down: new Set() };

    // Hajen starter som en baby og vokser med de point, den spiser (100 point klarer et hav). Størrelsen er i enheder (1 enhed = 1 % af den korteste side).
    const R_BASE = 3.8;
    const R_GROW = 7.5; // hvor meget hajen vokser i alt i én verden
    const GOAL = 100; // point der skal til for at klare et hav
    const TOP = 50; // øverste pixels på banen er til HUD'en
    const SHARK_X = .2; // hajen står stille her (andel af bredden), og verden scroller mod venstre
    const sharkRadius = () => (R_BASE + R_GROW * Math.min(1, G.points / GOAL)) * u;
    const stageOf = (points) => Math.min(5, 1 + Math.floor(points / 20)); // 1-5, en ny størrelse for hver 20 point
    const world = () => WORLDS[G.w];
    let scrollX = 0;
    let eatFx = []; // fisk der suges ind i munden
    let floaters = []; // "+1" der svæver op
    let rings = []; // lyde-ringe
    const GAIN = 1.5; // fingerens lodrette træk ganges, så en hel skærm ikke kræver et helt tommelfingerslag

    function resize() {
      const w = stage.clientWidth;
      // På iPhone kan banen række længere ned end det synlige (værktøjslinjer i Safari), så højden begrænses til det, der kan ses
      const vv = window.visualViewport;
      const visibleBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
      const h = Math.floor(Math.min(stage.clientHeight, visibleBottom - stage.getBoundingClientRect().top));
      if (!w || h < 80) return;
      if (w === SW && h === SH) return;
      cv.style.height = `${h}px`;
      const first = !SW;
      const ox = SW || w;
      const oy = SH || h;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      SW = w;
      SH = h;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      u = Math.min(SW, SH) / 100;
      if (!bubbles.length) for (let i = 0; i < 16; i++) bubbles.push({ x: Math.random() * SW, y: Math.random() * SH, r: .4 + Math.random() * 1.2, sp: 3 + Math.random() * 6 });
      if (sh) { sh.x = SW * SHARK_X; sh.y = clamp(sh.y * SH / oy, TOP + sh.R, SH - sh.R); sh.ty = sh.y; }
      for (const f of fish) { f.x *= SW / ox; f.y = clamp(f.y * SH / oy, TOP + f.r, SH - f.r); }
      if (first && G) { sh.R = sharkRadius(); sh.x = SW * SHARK_X; sh.y = sh.ty = (TOP + SH) / 2; fish = []; fillFish(); }
    }

    // Sværhed: stiger med verdenen og med hajens størrelse (0-22)
    const diff = () => G.w * 2 + (G.n - 1);
    // Højst to onde fisk ad gangen: kun én i de første størrelser, og først efter et lille stykke tid, så man kan øve sig
    const evilTarget = () => (G.n <= 3 ? 1 : 2);
    const evilDelay = () => Math.max(1.2, 4.5 - .35 * diff()); // sekunder, før en ny ond fisk kommer ind
    const homing = () => Math.min(.6, .08 * diff());
    // Mere tid på en smal telefonskærm: fiskene er 15 % langsommere, og i starten er den ene onde fisk langsom
    const speedFactor = () => FACT[speedKey] * Math.min(1.3, 1 + .02 * diff()) * (SW < SH ? .85 : 1);
    const groundSpeed = () => 9 * u * .8 * speedFactor(); // bunddyr følger tang og sand (forgrunden scroller med 80 %)

    // Størrelsen på spiselige fisk i forhold til hajen: små og almindelige (1 point) er mindst, sjældne (10 point) næsten lige så store som hajen
    const R_REL = { 1: [.3, .45], 2: [.42, .58], 5: [.58, .74], 10: [.72, .88] };
    const WEIGHT = { 1: 5, 2: 3, 5: 1.3, 10: .4 }; // hvor ofte hver slags kommer (sjældne sjældent)
    function pickFood() {
      const ids = world().food;
      let tot = 0;
      for (const id of ids) tot += WEIGHT[SPECIES[id].pts];
      let r = Math.random() * tot;
      for (const id of ids) { r -= WEIGHT[SPECIES[id].pts]; if (r <= 0) return SPECIES[id]; }
      return SPECIES[ids[0]];
    }
    const hitFactor = (spec) => (spec.kind === "fish" ? .55 + .22 * (spec.len || 1) : spec.kind === "eel" ? .9 : .75);

    // Alle dyr kommer ind fra højre og svømmer mod venstre. role: "food" (spiselig), "evil" (rovfisk, kun lidt større end hajen),
    // "ground" (bunddyr: krabber og søstjerner, eller farlige pindsvin og rygere) og "float" (farlige vandmænd og ål).
    // spread = fordelt ud over banen ved start (kun til højre for hajen).
    function spawnFish(role, spread) {
      const W = world();
      let spec;
      let r;
      let speed;
      if (role === "evil") { spec = SPECIES[W.evil[rnd(W.evil.length)]]; r = sh.R * (1.2 + Math.random() * .25); speed = (22 + Math.random() * 11) * u; }
      else if (role === "ground") {
        const hzChance = G.w === 0 && G.n === 1 ? 0 : Math.min(.55, .15 + .03 * diff());
        const useHazard = W.hazards.length && (!W.ground.length || Math.random() < hzChance);
        const list = useHazard ? W.hazards : W.ground;
        if (!list.length) return;
        spec = SPECIES[list[rnd(list.length)]];
        if (spec.id === "kiste" && Math.random() < .5) spec = SPECIES[list[rnd(list.length)]]; // skattekisten er sjælden
        if (spec.hazard) r = clamp(sh.R * .55, 2.4 * u, 4 * u);
        else { const rr = R_REL[spec.pts]; r = Math.max(2.4 * u, sh.R * (rr[0] + Math.random() * (rr[1] - rr[0]))); }
        speed = groundSpeed();
      } else if (role === "float") { spec = SPECIES[W.float[rnd(W.float.length)]]; r = clamp(sh.R * .7, 3 * u, 5 * u); speed = (10 + Math.random() * 5) * u; }
      else { spec = pickFood(); const rr = R_REL[spec.pts]; r = sh.R * (rr[0] + Math.random() * (rr[1] - rr[0])); speed = (20 + Math.random() * 12) * u; }
      const ground = !!spec.ground;
      let f = null;
      for (let tries = 0; tries < 24; tries++) {
        const x = spread ? SW * .45 + Math.random() * SW * .9 : SW + r * 2.4 + Math.random() * 8 * u;
        const y = ground ? SH - 2.4 * u - (spec.gy || .8) * r : TOP + r + Math.random() * Math.max(1, SH - TOP - 2 * r);
        f = { spec, role, x, y, r, hr: r * hitFactor(spec), face: -1, big: role === "evil", ground, hazard: !!spec.hazard, chomp: 0, phase: Math.random() * 6.28, freq: 1 + Math.random() * 1.5, amp: (role === "evil" ? 1.5 : role === "float" ? 4 : ground ? 0 : 3.5) * u * Math.random(), speed };
        // to onde fisk må ikke ligge oven i hinanden, så der altid er et hul at svømme igennem
        if (!fish.some((o) => o.big && role === "evil" && Math.abs(o.x - x) < r * 3 && Math.abs(o.y - y) < (o.r + r) * 1.4)) break;
      }
      fish.push(f);
    }
    function fillFish() {
      for (let i = 0; i < 8; i++) spawnFish("food", true);
      evilCd = G.w === 0 && G.n <= 1 ? 4 : 2; // den første onde fisk kommer først lidt inde i spillet
      groundCd = 2.5;
      floatCd = 6;
    }
    // Holder antallet af spiselige fisk oppe og lader farlige dyr komme ind, når der er plads til dem
    let spawnCd = 0;
    let evilCd = 0;
    let groundCd = 0;
    let floatCd = 0;
    function ensureFish(dt) {
      spawnCd -= dt;
      evilCd -= dt;
      groundCd -= dt;
      floatCd -= dt;
      const W = world();
      let evil = 0;
      let food = 0;
      let ground = 0;
      let floating = 0;
      for (const f of fish) { if (f.ground) ground++; else if (f.role === "float") floating++; else if (f.big) evil++; else food++; }
      if (evil < evilTarget() && evilCd <= 0) { spawnFish("evil", false); evilCd = evilDelay(); return; }
      const gTarget = W.ground.length || W.hazards.length ? (G.w === 0 && G.n <= 2 ? 1 : 2) : 0;
      if (ground < gTarget && groundCd <= 0) { spawnFish("ground", false); groundCd = 2.4; return; }
      if (W.float.length && floating < 1 && floatCd <= 0 && diff() >= 2) { spawnFish("float", false); floatCd = 5; return; }
      if (spawnCd > 0) return;
      if (food < 8) { spawnFish("food", false); spawnCd = .22; }
    }

    // Starter en verden: hajen er en baby, og verdenen har sine egne farver og dyr
    function loadWorld(w, keepWords, keepReview) {
      const fresh = keepWords || shuffle(ALL.filter((id) => !ws(id).seen)).slice(0, 2);
      G = {
        w, n: 1, points: 0, total: 0, caught: 0, diedWorld: 0, grace: 0, dyT: 0, tT: 0, killer: null, announce: true,
        newWords: fresh,
        reviewWords: keepReview || pickWeighted(seenIds(), 2, fresh)
      };
      const W = WORLDS[w];
      stage.style.background = `linear-gradient(${W.grad[0]}, ${W.grad[1]} 45%, ${W.grad[2]})`;
      $("play").style.backgroundColor = W.sand;
      sh = { x: SW * SHARK_X, y: (TOP + SH) / 2, ty: (TOP + SH) / 2, vy: 0, face: 1, tilt: 0, R: R_BASE * u, chew: 0, pop: 0, dscale: 1 };
      sh.R = sharkRadius();
      resetActors();
      renderFoot();
    }

    function resetActors() {
      sh.x = SW * SHARK_X;
      sh.y = sh.ty = (TOP + SH) / 2;
      sh.vy = 0;
      sh.dscale = 1;
      sh.R = sharkRadius();
      fish = [];
      particles = [];
      eatFx = [];
      floaters = [];
      rings = [];
      fillFish();
      G.grace = 0;
    }

    function startWorld(w) {
      show("play");
      loadWorld(w);
      const next = () => { if (G.newWords.length || G.reviewWords.length) showMeet(G.newWords, G.reviewWords); else beginReady(); };
      if (read("dyr", "1") === "0") next(); else showFauna(w, next);
    }

    function beginReady() {
      state = "ready";
      resize();
      $("startHint").textContent = hintText();
      $("startHint").hidden = false;
      sfx.ready();
      if (G.announce) { G.announce = false; toast(WORLDS[G.w].da, WORLDS[G.w].fact); }
      const w = pickWeighted(seenIds(), 1)[0];
      if (w) setTimeout(() => { if (state === "ready") wordPop(w); }, 500);
    }

    // Ordkort under spillet: gentagelse uden at afbryde
    let popTimer = 0;
    function wordPop(id, isNew) {
      const el = $("wordPop");
      const w = WORDS[id];
      el.replaceChildren(picBox(id));
      el.insertAdjacentHTML("beforeend", `<div>${isNew ? `<span class="badge new">Nyt ord</span>` : ""}<span class="tw ${lenCls(w.ta)}">${w.ta}</span><span class="rm rom">${w.rom}</span></div>`);
      el.hidden = false;
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
      applyRom();
      ws(id).t = Date.now();
      speak(id);
      clearTimeout(popTimer);
      popTimer = setTimeout(hidePop, 2800);
    }
    function hidePop() { clearTimeout(popTimer); $("wordPop").hidden = true; }

    function renderFoot() { renderProg(); }
    function renderProg() {
      $("playTitle").textContent = WORLDS[G.w].da;
      $("progFill").style.width = `${Math.min(100, Math.round(100 * G.points / GOAL))}%`;
      $("progText").textContent = `${Math.min(G.points, GOAL)} / ${GOAL}`;
    }

    // ---------- Mød ordene ----------
    let meetToken = 0;
    function showMeet(newIds, reviewIds) {
      state = "meet";
      $("startHint").hidden = true;
      hidePop();
      const ids = [...newIds, ...reviewIds];
      const cards = $("meetCards");
      cards.replaceChildren();
      cards.classList.toggle("many", ids.length > 2);
      const els = ids.map((id) => {
        const w = WORDS[id];
        const c = document.createElement("button");
        c.type = "button";
        c.className = "mcard";
        const isNew = newIds.includes(id);
        c.insertAdjacentHTML("beforeend", `<span class="badge ${isNew ? "new" : ""}">${isNew ? "Nyt" : "Gentag"}</span>`);
        c.append(picBox(id));
        c.insertAdjacentHTML("beforeend", `<span class="t ${lenCls(w.ta)}">${w.ta}</span><span class="r rom">${w.rom}</span><span class="d">${w.da}</span>`);
        c.addEventListener("click", () => { flash(c); speak(id); });
        cards.append(c);
        return c;
      });
      $("meetTitle").textContent = newIds.length ? "Nye ord!" : "Øv ordene igen!";
      const flash = (c) => { els.forEach((e) => e.classList.toggle("on", e === c)); };
      applyRom();
      refreshNote();
      $("meet").hidden = false;
      const token = ++meetToken;
      (async () => {
        await new Promise((r) => setTimeout(r, 450));
        for (let i = 0; i < ids.length && token === meetToken; i++) {
          flash(els[i]);
          const ok = await speak(ids[i]);
          if (!ok || token !== meetToken) return;
          await new Promise((r) => setTimeout(r, 350));
        }
        if (token === meetToken) flash(null);
      })();
    }
    $("meetGo").addEventListener("click", () => {
      meetToken++;
      stopSpeech();
      audio();
      for (const id of [...G.newWords, ...G.reviewWords]) { const st = ws(id); st.t = Date.now(); if (G.newWords.includes(id)) st.seen = true; }
      saveWords();
      $("meet").hidden = true;
      beginReady();
    });

    // ---------- Havets dyr: dyrebogen i starten af hver runde ----------
    // Viser havets dyr som kort. Et tryk på et dyr viser det stort, og en dansk stemme fortæller fakta om det (audio/<id>.mp3, se facts.js).
    const INFO = window.HajFakta.fakta;
    const INTRO = window.HajFakta.hav;
    const heard = new Set((() => { try { return JSON.parse(read("fakta", "[]")); } catch { return []; } })());
    const FN = { w: 0, list: [], groups: [], idx: -1, onDone: null, ctx: null, play: "idle", raf: 0, bubbles: [], last: 0, swipe: null };
    const ROLE_TXT = { food: (s) => `Mad · ${s.pts} point`, evil: () => "Rovfisk · flygt!", hazard: () => "Farlig · rør ikke!" };
    const ROLE_TIP = {
      food: (s) => (s.ground ? `Den bor på bunden. Svøm ned og spis den for at få ${s.pts} point.` : `Spis den for at få ${s.pts} point.`),
      evil: (s) => `Den er lidt større end dig, så svøm væk! Når du er vokset forbi den, kan du spise den og få ${s.pts} point.`,
      hazard: () => "Den kan ikke spises, og den stikker, hvis du rører den. Svøm udenom!"
    };

    function faunaGroups(w) {
      const W = WORLDS[w];
      const edible = [...new Set([...W.food, ...W.ground.filter((id) => !SPECIES[id].hazard)])];
      return [
        { key: "food", title: "Mad", sub: "Spis dem for at få point", ids: edible },
        { key: "evil", title: "Rovdyr", sub: "Større end dig. Flygt!", ids: W.evil },
        { key: "hazard", title: "Farer", sub: "Kan ikke spises. Rør dem ikke", ids: [...new Set([...W.hazards, ...W.float])] }
      ].filter((g) => g.ids.length);
    }
    const roleOf = (id) => FN.groups.find((g) => g.ids.includes(id)).key;

    // Hvert dyr tegnes, så det fylder rammen: først måles dyrets rammer (alle dyr har forskellig form), så skaleres det
    const boxCache = {};
    function boxOf(spec) {
      if (boxCache[spec.id]) return boxCache[spec.id];
      const S = 760;
      const cv = document.createElement("canvas");
      cv.width = cv.height = S;
      const c = cv.getContext("2d", { willReadFrequently: true });
      c.translate(S / 2, S / 2);
      AR.draw(c, spec, { r: 100, t: 0 });
      const d = c.getImageData(0, 0, S, S).data;
      let x0 = S, x1 = 0, y0 = S, y1 = 0;
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        if (d[(y * S + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
      return (boxCache[spec.id] = { x0: x0 - S / 2, x1: x1 - S / 2, y0: y0 - S / 2, y1: y1 - S / 2 });
    }
    function paintAnimal(c, spec, w, h, t, pad, bottom) {
      const b = boxOf(spec);
      const k = Math.min(w * (1 - 2 * pad) / (b.x1 - b.x0), (h - bottom) * (1 - 2 * pad) / (b.y1 - b.y0));
      c.save();
      c.translate(w / 2 - (b.x0 + b.x1) / 2 * k, (h - bottom) / 2 - (b.y0 + b.y1) / 2 * k);
      AR.draw(c, spec, { r: 100 * k, t });
      c.restore();
    }
    const thumbs = {};
    function thumb(id) {
      if (thumbs[id]) return thumbs[id];
      const cv = document.createElement("canvas");
      cv.width = 270; cv.height = 180;
      paintAnimal(cv.getContext("2d"), SPECIES[id], 270, 180, 0, .06, 0);
      return (thumbs[id] = cv.toDataURL());
    }

    function updateFaunaProgress() {
      const ids = FN.list;
      const n = ids.filter((id) => heard.has(id)).length;
      $("fnProgFill").style.width = `${ids.length ? Math.round(100 * n / ids.length) : 0}%`;
      $("fnProgText").textContent = n === ids.length && n ? `Du har mødt alle ${n} dyr` : `${n} af ${ids.length} dyr mødt`;
      for (const el of document.querySelectorAll(".fn-tile")) el.classList.toggle("heard", heard.has(el.dataset.id));
    }
    function markHeard(id) {
      if (!id || heard.has(id)) return;
      heard.add(id);
      write("fakta", JSON.stringify([...heard]));
      updateFaunaProgress();
      renderHome();
    }

    function renderFaunaGrid() {
      const grid = $("fnGrid");
      grid.replaceChildren();
      let n = 0;
      for (const g of FN.groups) {
        const sec = document.createElement("section");
        sec.className = `fn-group ${g.key}`;
        sec.innerHTML = `<h4><i></i><b>${g.title}</b><span>${g.sub}</span></h4>`;
        const wrap = document.createElement("div");
        wrap.className = "fn-tiles";
        for (const id of g.ids) {
          const s = SPECIES[id];
          const b = document.createElement("button");
          b.type = "button";
          b.className = "fn-tile";
          b.dataset.id = id;
          b.style.setProperty("--i", n++);
          b.setAttribute("aria-label", s.da);
          b.innerHTML = `<img alt="" src="${thumb(id)}"><span class="nm">${s.da}</span>${g.key === "food" ? `<span class="pt">+${s.pts}</span>` : ""}<span class="tick" aria-hidden="true">✓</span>`;
          b.addEventListener("click", () => { audio(); openDetail(id); });
          wrap.append(b);
        }
        sec.append(wrap);
        grid.append(sec);
      }
    }

    // Lydafspilning af fakta (samme afspiller som ordene)
    function setPlayUi(state) {
      FN.play = state;
      const on = state === "playing";
      $("fnPlay").classList.toggle("speaking", on && FN.ctx !== "intro");
      $("fnIntro").classList.toggle("speaking", on && FN.ctx === "intro");
      $("fnPlayTxt").textContent = on ? "Pause" : state === "paused" ? "Fortsæt" : heard.has(FN.ctx) ? "Hør igen" : "Hør fakta";
      $("fnPlaySub").textContent = muted ? "Lyden er slået fra i ⚙️" : on ? "Lytter …" : "Lyt og lær";
      if (state === "idle") $("fnBar").style.width = "0";
    }
    function faunaAudioStopped() { if ($("fauna").hidden === false || FN.play !== "idle") setPlayUi("idle"); }
    function playFact(file, ctx) {
      stopSpeech();
      FN.ctx = ctx;
      const token = ++factToken;
      const finish = () => { if (token !== factToken) return; if (ctx !== "intro") markHeard(ctx); setPlayUi("idle"); };
      if (muted) { setPlayUi("idle"); if (ctx !== "intro") markHeard(ctx); return; }
      setPlayUi("playing");
      clip.onended = finish;
      clip.onerror = finish;
      clip.ontimeupdate = () => {
        if (token !== factToken || !clip.duration) return;
        const p = clip.currentTime / clip.duration;
        $("fnBar").style.width = `${Math.round(p * 100)}%`;
        if (p > .6 && ctx !== "intro") markHeard(ctx);
      };
      clip.src = `audio/${file}`;
      const p = clip.play();
      if (p && p.catch) p.catch(() => { if (token === factToken) setPlayUi("idle"); });
    }
    const playIntro = () => playFact(`hav-${WORLDS[FN.w].id}.mp3`, "intro");

    function showFaunaGrid() {
      FN.idx = -1;
      document.querySelector(".card.fauna").classList.remove("detail");
      $("fnDetail").hidden = true;
      $("fnGrid").hidden = false;
      $("fnHint").hidden = false;
      $("fnBody").scrollTop = 0;
      cancelAnimationFrame(FN.raf);
      FN.raf = 0;
    }
    function openDetail(id) {
      const idx = FN.list.indexOf(id);
      if (idx < 0) return;
      FN.idx = idx;
      const s = SPECIES[id];
      const info = INFO[id] || { latin: "", str: "", lever: "", tegn: [], tekst: "" };
      const role = roleOf(id);
      const d = $("fnDetail");
      d.className = `fn-detail ${role}`;
      d.hidden = false;
      document.querySelector(".card.fauna").classList.add("detail");
      d.style.animation = "none";
      void d.offsetWidth;
      d.style.animation = "";
      $("fnGrid").hidden = true;
      $("fnHint").hidden = true;
      $("fnBody").scrollTop = 0;
      const W = WORLDS[FN.w];
      $("fnHero").style.background = `linear-gradient(${W.grad[0]}, ${W.grad[1]} 55%, ${W.grad[2]})`;
      $("fnName").textContent = s.da;
      $("fnLatin").textContent = info.latin;
      $("fnText").textContent = info.tekst;
      $("fnRoleTxt").textContent = ROLE_TXT[role](s);
      $("fnCount").textContent = `${idx + 1} / ${FN.list.length}`;
      $("fnStats").innerHTML = `<div class="fn-stat"><small>Størrelse</small><b>${info.str}</b></div><div class="fn-stat"><small>Bor</small><b>${info.lever}</b></div><div class="fn-stat"><small>${role === "food" ? "Point" : "Fare"}</small><b>${role === "food" ? `${s.pts} point` : role === "evil" ? "Rovfisk" : "Stikker"}</b></div>`;
      $("fnTegn").innerHTML = info.tegn.map((t) => `<li>${t}</li>`).join("");
      $("fnTip").textContent = ROLE_TIP[role](s);
      FN.bubbles = Array.from({ length: 16 }, () => ({ x: Math.random(), y: Math.random(), r: .006 + Math.random() * .012, v: .02 + Math.random() * .04, ph: Math.random() * 6.3 }));
      setPlayUi("idle");
      FN.ctx = id;
      playFact(`${id}.mp3`, id);
      startHero();
    }

    // Stort, levende billede: vandets farver, lysstråler, bobler og dyret, der svæver blidt
    const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function sizeHero() {
      const cv = $("fnCv");
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      if (!w || !h) return null;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      return { cv, w, h, dpr };
    }
    function heroFrame(now) {
      if ($("fauna").hidden || $("fnDetail").hidden) { FN.raf = 0; return; }
      const z = sizeHero();
      if (z) {
        const c = z.cv.getContext("2d");
        const { w, h } = z;
        const t = REDUCED ? 0 : now / 1000;
        const dt = Math.min(.05, (now - (FN.last || now)) / 1000);
        FN.last = now;
        const id = FN.list[FN.idx];
        const s = SPECIES[id];
        const W = WORLDS[FN.w];
        const acc = { food: "74,222,128", evil: "251,113,133", hazard: "251,191,36" }[roleOf(id)];
        c.setTransform(z.dpr, 0, 0, z.dpr, 0, 0);
        c.clearRect(0, 0, w, h);
        for (let i = 0; i < 4; i++) { // lysstråler fra overfladen
          const x = w * (.1 + .26 * i) + Math.sin(t * .35 + i * 1.7) * w * .05;
          const g = c.createLinearGradient(x, 0, x + w * .1, h * .85);
          g.addColorStop(0, "rgba(255,255,255,.2)"); g.addColorStop(1, "rgba(255,255,255,0)");
          c.fillStyle = g; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + w * .13, 0); c.lineTo(x + w * .32, h); c.lineTo(x + w * .12, h); c.closePath(); c.fill();
        }
        const halo = c.createRadialGradient(w / 2, h * .46, 0, w / 2, h * .46, Math.max(w, h) * .55);
        halo.addColorStop(0, `rgba(${acc},.3)`); halo.addColorStop(1, `rgba(${acc},0)`);
        c.fillStyle = halo; c.fillRect(0, 0, w, h);
        let bottom = 0;
        if (s.ground) { // bunddyr sidder på sandet
          bottom = h * .17;
          const sg = c.createLinearGradient(0, h - bottom, 0, h);
          sg.addColorStop(0, W.sand); sg.addColorStop(1, mixShade(W.sand));
          c.fillStyle = sg; c.beginPath(); c.moveTo(0, h); c.lineTo(0, h - bottom * .7); c.quadraticCurveTo(w * .5, h - bottom * 1.35, w, h - bottom * .7); c.lineTo(w, h); c.closePath(); c.fill();
        }
        for (const b of FN.bubbles) { // bobler
          b.y -= b.v * dt; if (b.y < -.05) { b.y = 1.05; b.x = Math.random(); }
          c.strokeStyle = "rgba(255,255,255,.45)"; c.lineWidth = 1.4;
          c.beginPath(); c.arc((b.x + Math.sin(t * 1.3 + b.ph) * .012) * w, b.y * h, b.r * Math.min(w, h), 0, 6.3); c.stroke();
        }
        c.save();
        if (!s.ground) c.translate(0, Math.sin(t * 1.3) * h * .014);
        c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 24; c.shadowOffsetY = 10;
        paintAnimal(c, s, w, h, t, .13, bottom);
        c.restore();
        const vg = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .35, w / 2, h / 2, Math.max(w, h) * .75);
        vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,12,30,.42)");
        c.fillStyle = vg; c.fillRect(0, 0, w, h);
      }
      FN.raf = REDUCED ? 0 : requestAnimationFrame(heroFrame);
    }
    const mixShade = (hex) => AR.dk(hex, .28);
    function startHero() {
      cancelAnimationFrame(FN.raf);
      FN.last = 0;
      FN.raf = requestAnimationFrame(heroFrame);
    }

    function step(dir) {
      const n = FN.list.length;
      if (FN.idx < 0 || n < 2) return;
      openDetail(FN.list[(FN.idx + dir + n) % n]);
    }

    function showFauna(w, onDone) {
      FN.w = w;
      FN.onDone = onDone || null;
      FN.groups = faunaGroups(w);
      FN.list = FN.groups.flatMap((g) => g.ids);
      const W = WORLDS[w];
      if (onDone) { state = "meet"; $("startHint").hidden = true; hidePop(); }
      $("fnEyebrow").textContent = `Hav ${w + 1} af ${WORLDS.length}`;
      $("fnDots").innerHTML = WORLDS.map((_, i) => `<i class="${i === w ? "on" : ""}"></i>`).join("");
      $("fnTitle").textContent = W.da;
      $("fnSub").textContent = `${W.fact}.`;
      $("faunaGo").innerHTML = !onDone ? "✔ Færdig" : `<span class="go-ico" aria-hidden="true"></span> Start spillet`;
      showFaunaGrid();
      renderFaunaGrid();
      updateFaunaProgress();
      setPlayUi("idle");
      $("fauna").hidden = false;
      FN.ctx = "intro";
      setTimeout(() => { if (!$("fauna").hidden && FN.idx < 0 && FN.w === w) playIntro(); }, 600);
    }
    function closeFauna() {
      stopSpeech();
      showFaunaGrid();
      $("fauna").hidden = true;
      const cb = FN.onDone;
      FN.onDone = null;
      if (cb) { audio(); cb(); }
    }
    $("faunaGo").addEventListener("click", closeFauna);
    $("fnBack").addEventListener("click", () => { stopSpeech(); showFaunaGrid(); });
    $("fnPrev").addEventListener("click", () => step(-1));
    $("fnNext").addEventListener("click", () => step(1));
    $("fnIntro").addEventListener("click", () => {
      audio();
      if (FN.play === "playing" && FN.ctx === "intro") { stopSpeech(); setPlayUi("idle"); return; }
      showFaunaGrid();
      playIntro();
    });
    $("fnPlay").addEventListener("click", () => {
      audio();
      const id = FN.list[FN.idx];
      if (FN.play === "playing" && FN.ctx === id) { clip.pause(); setPlayUi("paused"); }
      else if (FN.play === "paused" && FN.ctx === id) { setPlayUi("playing"); const p = clip.play(); if (p && p.catch) p.catch(() => setPlayUi("idle")); }
      else playFact(`${id}.mp3`, id);
    });
    // Stryg til siden på billedet for at skifte dyr
    $("fnHero").addEventListener("pointerdown", (e) => { FN.swipe = { x: e.clientX, y: e.clientY }; });
    $("fnHero").addEventListener("pointerup", (e) => {
      const s0 = FN.swipe;
      FN.swipe = null;
      if (s0 && Math.abs(e.clientX - s0.x) > 55 && Math.abs(e.clientX - s0.x) > Math.abs(e.clientY - s0.y) * 1.5) step(e.clientX < s0.x ? 1 : -1);
    });
    document.addEventListener("keydown", (e) => {
      if ($("fauna").hidden) return;
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Escape") { if (FN.idx >= 0) { stopSpeech(); showFaunaGrid(); } else closeFauna(); }
    });
    window.addEventListener("resize", () => { if (!$("fauna").hidden && !$("fnDetail").hidden && !FN.raf) { FN.raf = requestAnimationFrame(heroFrame); } });
    window.addEventListener("topbar:sound", () => { if (!$("fauna").hidden) setPlayUi(FN.play); });

    // ---------- Spillet ----------
    // Lille lyd-ring, der breder sig fra hajens mund
    const ring = (x, y, r, color = "255,255,255") => rings.push({ x, y, r, life: 1, color });
    const floatText = (x, y, text, color = "#fff", big = false) => floaters.push({ x, y, text, life: 1, color, big });
    const POINT_COLOR = { 1: "#ffffff", 2: "#a7f3d0", 5: "#fde047", 10: "#fb923c" };
    function eat(f) {
      fish.splice(fish.indexOf(f), 1);
      const pts = f.spec.pts; // hver art giver 1, 2, 5 eller 10 point
      G.points += pts;
      G.total++;
      sh.chew = .35;
      eatFx.push({ spec: f.spec, x: f.x, y: f.y, r: f.r, phase: f.phase, t: 0 });
      floatText(sh.x + sh.R * .6, sh.y - sh.R * 1.3, `${f.spec.da} +${pts}`, POINT_COLOR[pts] || "#fff", pts >= 5);
      ring(sh.x + sh.R * .9, sh.y, sh.R * .5, pts >= 5 ? "253,224,71" : "255,255,255");
      burst(sh.x + sh.R * .9, sh.y, pts >= 5 ? 12 : 6, ["#fff", "#bae6fd", "#fde047"]);
      sfx.eat();
      buzz(pts >= 5 ? 30 : 15);
      renderProg();
      if (G.points >= GOAL) { worldDone(); return; }
      if (stageOf(G.points) > G.n) { sizeUp(); return; }
      if (G.total % 4 === 0) { const wd = pickWeighted(seenIds(), 1)[0]; if (wd) wordPop(wd); }
    }

    // Hver 20 point: en større haj, en stjerne og et nyt ord (spillet stopper ikke)
    function sizeUp() {
      G.n = stageOf(G.points);
      stars += 1;
      write("stars", stars);
      Topbar.refreshStars(true);
      sh.pop = 1;
      for (let i = 0; i < 3; i++) ring(sh.x, sh.y, sh.R * (.8 + i * .5), "253,224,71");
      burst(sh.x, sh.y, 22, ["#fde047", "#fff", "#7dd3fc", "#34d399"]);
      sfx.levelup();
      buzz(40);
      toast(`Størrelse ${G.n}`, "+1 ⭐");
      const nw = shuffle(ALL.filter((id) => !ws(id).seen))[0];
      if (nw) { const st = ws(nw); st.seen = true; st.t = Date.now(); saveWords(); wordPop(nw, true); }
    }

    // 100 point: havet er klaret. Hajen er stor, og næste hav begynder med en baby-haj.
    function worldDone() {
      state = "world";
      hidePop();
      G.tT = 0;
      const perfect = G.diedWorld === 0;
      const got = perfect ? 5 : 3;
      stars += got;
      write("stars", stars);
      Topbar.refreshStars(true);
      curWorld = (G.w + 1) % WORLDS.length;
      write("hav", curWorld);
      sh.pop = 1;
      for (let i = 0; i < 4; i++) ring(sh.x, sh.y, sh.R * (.8 + i * .6), "253,224,71");
      burst(sh.x, sh.y, 36, ["#fde047", "#fff", "#7dd3fc", "#34d399", "#f472b6"]);
      sfx.fanfare();
      buzz(60);
      toast(`${WORLDS[G.w].da} klaret!`, G.w === WORLDS.length - 1 ? `Alle 7 have klaret! +${got} ⭐ · du begynder forfra` : `${perfect ? "Ingen ædt! " : ""}+${got} ⭐ · næste: ${WORLDS[curWorld].da}`);
    }
    let toastTimer = 0;
    function toast(title, sub) {
      const el = $("toast");
      el.innerHTML = `<b>${title}</b><span>${sub}</span>`;
      el.hidden = false;
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { el.hidden = true; }, 2300);
    }

    // En stor fisk fanger hajen: skærmen ryster, hajen suges ind i munden, og fisken tygger
    function caught(f) {
      state = "dying";
      hidePop();
      stopSpeech();
      G.caught++;
      G.diedWorld++;
      G.dyT = 0;
      G.killer = f;
      G.burped = false;
      sh.dx0 = sh.x;
      sh.dy0 = sh.y;
      renderFoot();
      sfx.caught();
      buzz(60);
      burst(sh.x, sh.y, 14, ["#7dd3fc", "#fff"]);
      ring(sh.x, sh.y, sh.R, "255,80,80");
    }

    // To måder at styre på (⚙️): "tryk" = let tyngdekraft, hold fingeren for at stige og slip for at synke (som Big Shark), "traek" = træk op og ned.
    // Hajen står stille i siden og svømmer kun op og ned.
    function moveShark(dt) {
      const floor = SH - sh.R * .7 - 2.6 * u;
      const prev = sh.y;
      if (controlMode === "tryk") {
        const up = pointer.active || keys.y < 0;
        sh.vy += (up ? -80 : 65) * u * dt; // stigning mens man holder, ellers sagte fald
        sh.vy -= sh.vy * 2.2 * dt; // vandmodstand, så det føles blødt
        sh.vy = clamp(sh.vy, -45 * u, 40 * u);
        sh.y += sh.vy * dt;
        if (sh.y < TOP + sh.R) { sh.y = TOP + sh.R; sh.vy = Math.max(0, sh.vy); }
        if (sh.y > floor) { sh.y = floor; sh.vy = Math.min(0, sh.vy); }
        sh.ty = sh.y;
      } else {
        if (pointer.active) sh.ty = sh.ty0 + GAIN * (pointer.y - pointer.y0);
        else if (keys.y) sh.ty += keys.y * 60 * u * dt;
        sh.ty = clamp(sh.ty, TOP + sh.R, SH - sh.R * .7);
        const vmax = 110 * u;
        sh.y = clamp(sh.y + clamp((sh.ty - sh.y) * 12, -vmax, vmax) * dt, TOP + sh.R, SH - sh.R * .7);
        sh.vy = (sh.y - prev) / Math.max(dt, 1e-3);
      }
      sh.tilt += (clamp(sh.vy / (60 * u), -.6, .6) - sh.tilt) * Math.min(1, dt * 8);
    }

    function updateFish(dt) {
      const f0 = speedFactor();
      const h = homing();
      scrollX += 9 * u * f0 * dt;
      for (const f of [...fish]) {
        if (f.role === "evil") f.big = f.r > sh.R; // vokser hajen forbi en rovfisk, bliver den spiselig
        if (f.ground) {
          f.x -= groundSpeed() * dt; // bunddyr følger sandet
          f.y = SH - 2.4 * u - (f.spec.gy || .8) * f.r;
        } else {
          f.x -= f.speed * f0 * (f.big && G.w === 0 && G.n === 1 ? .65 : 1) * dt;
          let vy = Math.cos(time * f.freq + f.phase) * f.amp * f.freq;
          if (f.big && h && f.x > sh.x) vy += clamp(sh.y - f.y, -8 * u, 8 * u) * h;
          f.y = clamp(f.y + vy * dt, TOP + f.r * .8, SH - 2.6 * u - f.r * .8);
        }
        if (f.x < -f.r * 3) fish.splice(fish.indexOf(f), 1);
      }
      ensureFish(dt);
    }

    function collide() {
      const sr = sh.R * .8;
      for (const f of [...fish]) {
        const d = Math.hypot(f.x - sh.x, f.y - sh.y);
        const fr = f.hr;
        if (f.hazard) { if (G.grace <= 0 && d < sr + fr * .8) { caught(f); return; } }
        else if (f.big) { if (G.grace <= 0 && d < sr + fr * .7) { caught(f); return; } }
        else if (d < sr + fr + sh.R * .45) { eat(f); if (state !== "play") return; }
      }
    }

    function update(dt) {
      time += dt;
      for (const b of bubbles) { b.y -= b.sp * u * dt; b.x -= (state === "play" ? 6 : 1.5) * u * dt; if (b.y < -b.r * u || b.x < -5) { b.y = SH + b.r * u; b.x = SW * (.3 + Math.random() * .8); } }
      for (const p of particles) { p.x += p.vx * u * dt * 6; p.y += p.vy * u * dt * 6; p.vy -= dt * .4; p.life -= dt * 1.4; }
      particles = particles.filter((p) => p.life > 0);
      for (const s of eatFx) s.t += dt / .24;
      eatFx = eatFx.filter((s) => s.t < 1);
      for (const t of floaters) { t.y -= 12 * u * dt; t.life -= dt * 1.2; }
      floaters = floaters.filter((t) => t.life > 0);
      for (const r of rings) { r.r += 16 * u * dt; r.life -= dt * 2.4; }
      rings = rings.filter((r) => r.life > 0);
      if (!G || !sh) return;
      sh.R += (sharkRadius() - sh.R) * Math.min(1, dt * 6);
      sh.chew = Math.max(0, sh.chew - dt);
      sh.pop = Math.max(0, sh.pop - dt * 1.8);
      if (state === "play") {
        G.grace = Math.max(0, G.grace - dt);
        moveShark(dt);
        updateFish(dt);
        collide();
      } else if (state === "ready") {
        if (controlMode !== "tryk") moveShark(dt); // med tyngdekraft hænger hajen stille, til spillet starter
      } else if (state === "dying") {
        G.dyT += dt;
        const k = G.killer;
        const p = clamp(G.dyT / .55, 0, 1);
        const e = p * p * (3 - 2 * p);
        const mx = k.hazard ? sh.dx0 : k.x - k.r * .85;
        const my = k.hazard ? sh.dy0 : k.y + k.r * .08;
        sh.x = sh.dx0 + (mx - sh.dx0) * e; // hajen suges ind i fiskens mund
        sh.y = sh.dy0 + (my - sh.dy0) * e;
        sh.dscale = 1 - .93 * e;
        k.x -= 6 * u * dt;
        k.chomp = G.dyT < .45 ? Math.min(1, G.dyT / .25) : Math.max(0, 1 - (G.dyT - .45) / .35); // mund åben, så sluger den
        if (G.dyT >= .55 && !G.burped) {
          G.burped = true;
          burst(mx, my, 16, ["#fff", "#bae6fd", "#7dd3fc"]);
          ring(k.x, k.y, k.r * .8, "255,255,255");
          floatText(k.x, k.y - k.r * 1.1, k.hazard ? "AV!" : "SLURP!", "#fff", true);
        }
        if (G.dyT > 1.35) openQuiz();
      } else if (state === "world") { // verdenen er klaret: kort fest, så starter den næste verden med en baby-haj
        G.tT += dt;
        updateFish(dt);
        if (G.tT > 2.8) { startWorld(curWorld); }
      }
    }

    // ---------- Quiz (når man bliver ædt) ----------
    let quiz = null;
    let lastTarget = null;
    function choiceCount() {
      const v = read("valg", "auto");
      if (v !== "auto") return Number(v);
      const d = G ? diff() : 0;
      return d <= 1 ? 2 : d <= 4 ? 3 : 4;
    }
    function pickTarget() {
      const known = ALL.filter((id) => ws(id).seen || G.newWords.includes(id));
      let pool = known.length ? known : ALL;
      if (pool.length > 1) pool = pool.filter((id) => id !== lastTarget);
      return pickWeighted(pool, 1)[0] || pool[0];
    }
    // De forkerte billeder er mest ord, barnet har mødt, så det skal kende forskel på dem
    function pickDistractors(target, count) {
      const others = ALL.filter((id) => id !== target);
      const known = shuffle(others.filter((id) => ws(id).seen));
      const unknown = shuffle(others.filter((id) => !ws(id).seen));
      const fromKnown = Math.min(known.length, Math.ceil(count * .7));
      const out = [...known.slice(0, fromKnown), ...unknown.slice(0, count - fromKnown)];
      for (const id of known.slice(fromKnown)) if (out.length < count) out.push(id);
      return out;
    }

    function openQuiz() {
      state = "quiz";
      pointer.active = false;
      $("startHint").hidden = true;
      hidePop();
      const target = pickTarget();
      lastTarget = target;
      const n = Math.min(choiceCount(), ALL.length);
      const options = shuffle([target, ...pickDistractors(target, n - 1)]);
      quiz = { target, options, locked: false, idle: 0 };
      const w = WORDS[target];
      $("quizTa").textContent = w.ta;
      $("quizTa").className = `tw ${lenCls(w.ta)}`;
      $("quizRom").textContent = w.rom;
      $("quizBanner").textContent = "";
      $("quizBanner").className = "banner";
      $("quizRetry").hidden = true;
      const k = G.killer;
      $("quizIcon").innerHTML = `<img src="${AR.icon(k.spec, 54, k.big && !k.hazard)}" width="54" height="35" alt="">`;
      $("quizWhy").textContent = k.hazard ? `Av! Du blev stukket af ${k.spec.da.toLowerCase()}` : `Du blev ædt af ${k.spec.da.toLowerCase()}`;
      const box = $("quizChoices");
      box.replaceChildren();
      box.className = `choices n${n}`;
      box.style.setProperty("--n", n);
      box.style.setProperty("--cols", n === 3 ? 3 : 2);
      for (const id of options) {
        const t = document.createElement("button");
        t.type = "button";
        t.className = "tile";
        t.dataset.id = id;
        t.setAttribute("aria-label", WORDS[id].da);
        t.append(pic(id));
        t.addEventListener("click", () => answer(id, t));
        box.append(t);
      }
      applyRom();
      refreshNote();
      sfx.pop();
      $("quiz").hidden = false;
      setTimeout(() => { if (quiz && quiz.target === target) speak(target); }, 380);
    }

    function record(id, ok) {
      const st = ws(id);
      if (ok) { st.ok++; st.box = Math.min(3, st.box + 1); } else { st.bad++; st.box = Math.max(0, st.box - 1); }
      st.seen = true;
      st.t = Date.now();
      saveWords();
    }

    function answer(id, tile) {
      if (!quiz || quiz.locked) return;
      quiz.locked = true;
      const q = quiz;
      const ok = id === q.target;
      record(q.target, ok);
      const tiles = [...$("quizChoices").children];
      tiles.forEach((t) => { t.disabled = true; });
      if (ok) {
        tile.classList.add("right");
        tiles.forEach((t) => { if (t !== tile) t.classList.add("dim"); });
        const praise = Object.keys(R.praise)[rnd(Object.keys(R.praise).length)];
        $("quizBanner").innerHTML = `<span class="tw">${R.praise[praise].ta}</span> ${R.praise[praise].da}`;
        sfx.right();
        buzz(30);
        const minimum = new Promise((r) => setTimeout(r, 1500));
        const spoken = speak(id).then((done) => (done ? speak(`ros-${praise}`) : false));
        Promise.all([minimum, spoken]).then(() => { if (quiz === q) closeQuiz(true); });
      } else {
        tile.classList.add("wrong");
        tiles.forEach((t) => {
          if (t.dataset.id === q.target) t.classList.add("right");
          else if (t !== tile) t.classList.add("dim");
        });
        const w = WORDS[q.target];
        $("quizBanner").className = "banner bad";
        $("quizBanner").innerHTML = `<span class="tw">${w.ta}</span> = ${w.da}`;
        sfx.wrong();
        speak(id).then((done) => (done ? new Promise((r) => setTimeout(r, 300)).then(() => speak(q.target)) : false));
        $("quizRetry").hidden = false;
      }
    }
    $("quizRetry").addEventListener("click", () => { if (quiz && quiz.locked) closeQuiz(false); });
    $("quizWord").addEventListener("click", () => { audio(); if (quiz) speak(quiz.target); });
    setInterval(() => {
      if (!quiz || quiz.locked || $("quiz").hidden) return;
      if (++quiz.idle >= 9) { quiz.idle = 0; speak(quiz.target); }
    }, 1000);

    function closeQuiz(ok) {
      quiz = null;
      stopSpeech();
      $("quiz").hidden = true;
      if (!ok) { restartLevel(); return; }
      resetActors();
      beginReady();
    }

    // Forkert svar: hajen starter forfra som en baby i den samme verden. Stjernerne beholdes.
    function restartLevel() {
      loadWorld(G.w, G.newWords, G.reviewWords);
      beginReady();
      toast("Baby-haj", "Du starter forfra");
    }

    function goHome() {
      stopSpeech();
      hidePop();
      meetToken++;
      quiz = null;
      $("quiz").hidden = true;
      $("meet").hidden = true;
      $("startHint").hidden = true;
      pointer.active = false;
      state = "home";
      G = null;
      sh = null;
      fish = [];
      renderHome();
      show("home");
    }
    $("playBack").addEventListener("click", goHome);

    // ---------- Tegning ----------
    function burst(x, y, n, colors) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = .4 + Math.random() * 1.2;
        particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - .2, life: 1, c: colors[rnd(colors.length)], s: (.5 + Math.random() * 1.1) * u });
      }
    }

    // Tegner et dyr (rigtig art fra species.js) med glød: grøn = kan spises, rød = farlig
    function drawFish(f) {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(f.face, 1);
      const r = f.r;
      const pulse = .5 + .5 * Math.sin(time * 5 + f.phase);
      const danger = f.big || f.hazard;
      const reach = r * Math.max(1, (f.spec.len || 1) * .9);
      const gr = ctx.createRadialGradient(0, 0, reach * .5, 0, 0, reach * (danger ? 2.1 + pulse * .3 : 1.7));
      gr.addColorStop(0, danger ? `rgba(255,40,40,${.28 + .2 * pulse})` : "rgba(120,255,140,.32)");
      gr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(0, 0, reach * 2.4, 0, 6.3);
      ctx.fill();
      const ck = f.chomp || 0;
      ctx.scale(1 + .1 * ck, 1 - .06 * ck);
      AR.draw(ctx, f.spec, { r, t: time + f.phase, angry: !!f.big && !f.hazard, chomp: ck });
      ctx.restore();
    }

    const P2 = {};
    const path = (name) => P2[name] || (P2[name] = new Path2D(SHARK[name]));
    function drawShark() {
      const r = sh.R;
      ctx.save();
      ctx.translate(sh.x, sh.y);
      if (state === "dying") { ctx.rotate(G.dyT * 9); ctx.scale(sh.dscale, sh.dscale); ctx.globalAlpha = Math.min(1, sh.dscale * 4); }
      ctx.scale(sh.face, 1);
      ctx.rotate(sh.tilt);
      const bite = sh.chew > 0 ? 1 + .12 * Math.sin(sh.chew * 9) : 1;
      const popS = 1 + .25 * sh.pop * sh.pop; // lille hop, når hajen vokser
      ctx.scale(r * bite * popS, r * popS);
      ctx.lineJoin = "round";
      ctx.fillStyle = "#2a6fb0";
      ctx.fill(path("dorsal"));
      ctx.fill(path("pect"));
      const g = ctx.createLinearGradient(0, -.6, 0, .5);
      g.addColorStop(0, "#2f7fc4");
      g.addColorStop(1, "#5fc0ee");
      ctx.fillStyle = g;
      ctx.strokeStyle = "#1f5a92";
      ctx.lineWidth = .05;
      ctx.fill(path("body"));
      ctx.stroke(path("body"));
      ctx.fillStyle = "#f4fbff";
      ctx.fill(path("belly"));
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(.8, -.12, .12, 0, 6.3); ctx.fill();
      ctx.fillStyle = "#12263a";
      ctx.beginPath(); ctx.arc(.83, -.12, .065, 0, 6.3); ctx.fill();
      ctx.strokeStyle = "#12263a";
      ctx.lineWidth = .04;
      ctx.lineCap = "round";
      if (sh.chew > 0 || state === "dying") { // åben mund med tænder, når hajen spiser
        const open = state === "dying" ? 1 : Math.min(1, sh.chew * 4);
        ctx.fillStyle = "#7f1d1d";
        ctx.beginPath(); ctx.moveTo(1.3, .1); ctx.quadraticCurveTo(1.0, .1 + .55 * open, .55, .26); ctx.quadraticCurveTo(.95, .12, 1.3, .1); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.moveTo(1.22, .12); ctx.lineTo(1.14, .26 * open + .1); ctx.lineTo(1.06, .13); ctx.moveTo(.98, .15); ctx.lineTo(.9, .3 * open + .12); ctx.lineTo(.82, .17); ctx.fill();
      } else {
        ctx.beginPath(); ctx.moveTo(1.27, .13); ctx.quadraticCurveTo(.95, .32, .6, .22); ctx.stroke();
      }
      ctx.strokeStyle = "#1f5a92";
      ctx.lineWidth = .03;
      ctx.beginPath(); ctx.moveTo(.5, -.25); ctx.quadraticCurveTo(.46, -.1, .5, .05); ctx.moveTo(.38, -.26); ctx.quadraticCurveTo(.34, -.1, .38, .04); ctx.stroke();
      ctx.restore();
    }

    const wrap = (x, w) => ((x % w) + w) % w;
    // Baggrund der scroller mod venstre i flere lag (langsomt langt væk, hurtigere tæt på): ruiner, tang og sand
    function drawFarLayers() {
      const W = world();
      const T = 70 * u;
      const cnt = Math.ceil(SW / T) + 2;
      const base = SH - 2 * u;
      ctx.fillStyle = W.farc;
      ctx.strokeStyle = W.farc;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 0; i < cnt; i++) {
        const x = wrap(i * T - scrollX * .3, cnt * T) - T;
        const k = W.far;
        if (k === "coral") { // koralgrene
          ctx.lineWidth = 2.2 * u;
          for (const [dx, h] of [[8, 16], [20, 11], [34, 19], [48, 12]]) {
            const bx = x + dx * u;
            ctx.beginPath(); ctx.moveTo(bx, base); ctx.lineTo(bx, base - h * u); ctx.moveTo(bx, base - h * .5 * u); ctx.lineTo(bx - 3.5 * u, base - h * .8 * u); ctx.moveTo(bx, base - h * .35 * u); ctx.lineTo(bx + 3.5 * u, base - h * .65 * u); ctx.stroke();
          }
        } else if (k === "kelp") { // høje tangstilke
          ctx.lineWidth = 2.4 * u;
          for (const [dx, h] of [[6, 38], [26, 30], [44, 42], [60, 28]]) {
            const bx = x + dx * u, sw = Math.sin(time * .9 + i + dx) * 3 * u;
            ctx.beginPath(); ctx.moveTo(bx, base); ctx.bezierCurveTo(bx + sw, base - h * .35 * u, bx - sw, base - h * .7 * u, bx + sw * 1.3, base - h * u); ctx.stroke();
          }
        } else if (k === "ship") { // skibsvrag med master
          if (i % 2 === 0) {
            ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x + 6 * u, base - 9 * u); ctx.lineTo(x + 46 * u, base - 9 * u); ctx.lineTo(x + 56 * u, base - 2 * u); ctx.lineTo(x + 52 * u, base); ctx.closePath(); ctx.fill();
            ctx.lineWidth = 1.6 * u;
            ctx.beginPath(); ctx.moveTo(x + 20 * u, base - 9 * u); ctx.lineTo(x + 18 * u, base - 30 * u); ctx.moveTo(x + 34 * u, base - 9 * u); ctx.lineTo(x + 36 * u, base - 24 * u); ctx.moveTo(x + 11 * u, base - 22 * u); ctx.lineTo(x + 26 * u, base - 20 * u); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + 18 * u, base - 28 * u); ctx.lineTo(x + 30 * u, base - 24 * u); ctx.lineTo(x + 19 * u, base - 14 * u); ctx.closePath(); ctx.fill();
          } else {
            ctx.beginPath(); ctx.arc(x + 30 * u, base, 7 * u, Math.PI, 0); ctx.fill();
            ctx.fillRect(x + 22 * u, base - 4 * u, 16 * u, 4 * u);
          }
        } else if (k === "rocks") { // klipper
          for (const [dx, w, h] of [[2, 22, 14], [20, 26, 22], [44, 18, 11]]) {
            ctx.beginPath(); ctx.moveTo(x + dx * u, base); ctx.lineTo(x + (dx + w * .25) * u, base - h * u); ctx.lineTo(x + (dx + w * .7) * u, base - h * .85 * u); ctx.lineTo(x + (dx + w) * u, base); ctx.closePath(); ctx.fill();
          }
        } else if (k === "jungle") { // mangroverødder
          ctx.lineWidth = 1.8 * u;
          for (const dx of [6, 30, 52]) {
            ctx.beginPath(); ctx.moveTo(x + dx * u, 0); ctx.lineTo(x + dx * u + Math.sin(time * .7 + i + dx) * u, 14 * u + (dx % 11) * u); ctx.stroke();
          }
          for (const [dx, h] of [[10, 18], [36, 24]]) {
            for (let j = -1; j <= 1; j++) { ctx.beginPath(); ctx.moveTo(x + (dx + j * 4) * u, base); ctx.quadraticCurveTo(x + (dx + j * 1.5) * u, base - h * .6 * u, x + dx * u, base - h * u); ctx.stroke(); }
            ctx.beginPath(); ctx.ellipse(x + dx * u, base - h * u, 7 * u, 3 * u, 0, 0, 6.3); ctx.fill();
          }
        } else if (k === "ice") { // isbjerge
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 10 * u, 18 * u); ctx.lineTo(x + 20 * u, 4 * u); ctx.lineTo(x + 34 * u, 24 * u); ctx.lineTo(x + 46 * u, 6 * u); ctx.lineTo(x + 70 * u, 0); ctx.closePath(); ctx.fill();
          ctx.beginPath(); ctx.moveTo(x + 10 * u, base); ctx.lineTo(x + 22 * u, base - 18 * u); ctx.lineTo(x + 30 * u, base - 8 * u); ctx.lineTo(x + 38 * u, base - 22 * u); ctx.lineTo(x + 52 * u, base); ctx.closePath(); ctx.fill();
        } else if (k === "open") { // lysstriber og en fjern hvalskygge
          if (i % 3 === 0) {
            ctx.beginPath(); ctx.ellipse(x + 30 * u, SH * .42 + Math.sin(time * .4 + i) * 2 * u, 20 * u, 4 * u, 0, 0, 6.3); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + 8 * u, SH * .42); ctx.lineTo(x - 2 * u, SH * .42 - 5 * u); ctx.lineTo(x - 2 * u, SH * .42 + 5 * u); ctx.closePath(); ctx.fill();
          }
        } else if (k === "deep") { // lysende prikker og dybe søjler
          ctx.fillRect(x + 4 * u, base - 14 * u, 5 * u, 14 * u);
          ctx.fillRect(x + 40 * u, base - 9 * u, 4 * u, 9 * u);
          ctx.fillStyle = "rgba(120,240,255,.55)";
          for (const [dx, dy] of [[12, .3], [30, .55], [52, .38], [64, .7]]) {
            const p = .5 + .5 * Math.sin(time * 1.5 + dx + i);
            ctx.globalAlpha = .25 + .5 * p;
            ctx.beginPath(); ctx.arc(x + dx * u, SH * dy, .9 * u, 0, 6.3); ctx.fill();
          }
          ctx.globalAlpha = 1;
          ctx.fillStyle = W.farc;
        } else if (k === "vents") { // sorte rygere med røg
          for (const dx of [14, 48]) {
            ctx.beginPath(); ctx.moveTo(x + (dx - 6) * u, base); ctx.lineTo(x + (dx - 2) * u, base - 20 * u); ctx.lineTo(x + (dx + 2) * u, base - 20 * u); ctx.lineTo(x + (dx + 7) * u, base); ctx.closePath(); ctx.fill();
            ctx.fillStyle = "rgba(255,120,60,.22)";
            for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.arc(x + dx * u + Math.sin(time + j + dx) * 2 * u, base - (24 + j * 7 + (time * 6 % 7)) * u, (2 + j * .8) * u, 0, 6.3); ctx.fill(); }
            ctx.fillStyle = W.farc;
          }
        } else if (k === "temple") { // søjler og tempel
          ctx.fillRect(x + 6 * u, base - 22 * u, 5 * u, 22 * u);
          ctx.fillRect(x + 20 * u, base - 22 * u, 5 * u, 22 * u);
          ctx.fillRect(x + 3 * u, base - 26 * u, 25 * u, 4 * u);
          ctx.beginPath(); ctx.moveTo(x + 1 * u, base - 26 * u); ctx.lineTo(x + 15.5 * u, base - 36 * u); ctx.lineTo(x + 30 * u, base - 26 * u); ctx.closePath(); ctx.fill();
          ctx.fillRect(x + 44 * u, base - 14 * u, 5 * u, 14 * u);
          ctx.fillRect(x + 56 * u, base - 9 * u, 5 * u, 9 * u);
        }
      }
    }
    function drawNearLayers() {
      const W = world();
      const S = 17 * u;
      const cnt = Math.ceil(SW / S) + 3;
      ctx.lineCap = "round";
      for (let i = 0; i < cnt; i++) {
        const x = wrap(i * S - scrollX * .8, cnt * S) - S;
        const h = (6 + (i * 37) % 7) * u;
        const sway = Math.sin(time * 1.6 + i) * u * 1.2;
        ctx.strokeStyle = W.weed[i % 2];
        ctx.lineWidth = u * 1.6;
        ctx.beginPath(); ctx.moveTo(x, SH - 2 * u); ctx.quadraticCurveTo(x + sway, SH - 2 * u - h * .55, x + sway * 1.6, SH - 2 * u - h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + u * 2.2, SH - 2 * u); ctx.quadraticCurveTo(x + u * 2.2 - sway, SH - 2 * u - h * .4, x + u * 2.2 - sway * 1.3, SH - 2 * u - h * .75); ctx.stroke();
      }
      ctx.fillStyle = W.sand;
      ctx.beginPath();
      ctx.moveTo(0, SH);
      for (let xx = 0; xx <= SW + 8; xx += 8) ctx.lineTo(xx, SH - 2.6 * u + Math.sin((xx + scrollX * .8) / (9 * u)) * u * .8);
      ctx.lineTo(SW + 8, SH);
      ctx.closePath();
      ctx.fill();
    }

    function draw() {
      ctx.clearRect(0, 0, SW, SH);
      ctx.save();
      if (G && state === "dying" && G.dyT < .4) { // skærmen ryster, når man bliver ædt
        const k = (1 - G.dyT / .4) * u * 1.1;
        ctx.translate((Math.random() - .5) * 2 * k, (Math.random() - .5) * 2 * k);
      }
      // Lysstråler, ruiner og bobler
      ctx.save();
      for (let i = 0; i < 3; i++) {
        const x = SW * (.2 + i * .3) + Math.sin(time * .3 + i) * u * 6;
        const g = ctx.createLinearGradient(x, 0, x + SW * .15, SH);
        g.addColorStop(0, "rgba(255,255,255,.16)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + SW * .1, 0); ctx.lineTo(x + SW * .3, SH); ctx.lineTo(x + SW * .1, SH); ctx.fill();
      }
      drawFarLayers();
      ctx.strokeStyle = "rgba(255,255,255,.5)";
      ctx.fillStyle = "rgba(255,255,255,.12)";
      ctx.lineWidth = 1.5;
      for (const b of bubbles) { ctx.beginPath(); ctx.arc(b.x, b.y, b.r * u, 0, 6.3); ctx.fill(); ctx.stroke(); }
      drawNearLayers();
      ctx.restore();
      if (!G || !sh) { ctx.restore(); return; }
      for (const f of fish) drawFish(f);
      // Fisk der suges ind i hajens mund (formindskes og drejer)
      for (const s of eatFx) {
        const e = s.t * s.t * (3 - 2 * s.t);
        const mx = sh.x + sh.R * .85;
        const my = sh.y + sh.R * .05;
        ctx.save();
        ctx.globalAlpha = 1 - e * .4;
        drawFish({ spec: s.spec, x: s.x + (mx - s.x) * e, y: s.y + (my - s.y) * e, r: Math.max(.5, s.r * (1 - .9 * e)), face: -1, big: false, hazard: false, chomp: 0, phase: s.phase + s.t * 12 });
        ctx.restore();
      }
      for (const rg of rings) {
        ctx.strokeStyle = `rgba(${rg.color},${Math.max(0, rg.life) * .7})`;
        ctx.lineWidth = Math.max(1.5, u * .5 * rg.life);
        ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r, 0, 6.3); ctx.stroke();
      }
      // Advarsel: en rød pil ved højre kant, før en stor fisk svømmer ind
      for (const f of fish) {
        if (!f.big || f.x < SW + f.r * .6) continue;
        const ex = SW - u * 5;
        const ey = clamp(f.y, TOP + u * 4, SH - u * 6);
        const pulse = .6 + .4 * Math.sin(time * 10);
        ctx.save();
        ctx.translate(ex, ey);
        ctx.scale(-1, 1);
        ctx.globalAlpha = pulse;
        ctx.fillStyle = "#ff3b30";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = Math.max(2, u * .5);
        ctx.beginPath();
        ctx.moveTo(u * 3.6, 0); ctx.lineTo(-u * 2.4, -u * 3.4); ctx.lineTo(-u * 2.4, u * 3.4); ctx.closePath();
        ctx.stroke(); ctx.fill();
        ctx.restore();
      }
      drawShark();
      if (debugOn) {
        // rød ramme om lærredets kanter, magenta linje ved hajens gulv og målestreger hver 50 px i bunden
        ctx.save();
        ctx.strokeStyle = "#ff0044"; ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, SW - 6, SH - 6);
        ctx.strokeStyle = "#ff00ff"; ctx.lineWidth = 2;
        const fy = SH - sh.R * .7 - 2.6 * u;
        ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(SW, fy); ctx.stroke();
        ctx.fillStyle = "#fff"; ctx.font = "bold 12px sans-serif";
        for (let yy = SH - 50; yy > TOP; yy -= 50) { ctx.fillRect(0, yy, 14, 2); ctx.fillText(`${SH - yy} fra bund`, 18, yy + 4); }
        ctx.restore();
      }
      for (const p of particles) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s * p.life, 0, 6.3); ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (const t of floaters) { // "+1" og "SLURP!" der svæver op
        ctx.save();
        ctx.globalAlpha = Math.min(1, t.life * 1.6);
        ctx.font = `800 ${Math.round(u * (t.big ? 3.9 : 3.1))}px "Trebuchet MS", sans-serif`;
        ctx.textAlign = "center";
        ctx.lineWidth = Math.max(3, u * .7);
        ctx.strokeStyle = "rgba(8,28,50,.75)";
        ctx.lineJoin = "round";
        ctx.strokeText(t.text, t.x, t.y);
        ctx.fillStyle = t.color;
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
      }
      ctx.restore();
      if (G && state === "dying" && G.dyT < .5) { // kort rød blitz
        ctx.fillStyle = `rgba(255,50,50,${.32 * (1 - G.dyT / .5)})`;
        ctx.fillRect(0, 0, SW, SH);
      }
    }

    let last = performance.now();
    function frame(now) {
      const dt = Math.min(.05, (now - last) / 1000);
      last = now;
      if (screen === "play" && !SW) resize();
      if (screen === "play" && SW > 0) { update(dt); draw(); }
      requestAnimationFrame(frame);
    }

    // ---------- Styring: træk fingeren op og ned, så svømmer hajen op og ned (hajen står stille i siden) ----------
    const setPointer = (e) => { pointer.y = e.clientY - cv.getBoundingClientRect().top; };
    const startPlay = () => { if (state === "ready") { state = "play"; G.grace = 1.5; $("startHint").hidden = true; } };
    stage.addEventListener("pointerdown", (e) => {
      if (!G) return;
      pointer.active = true;
      setPointer(e);
      pointer.y0 = pointer.y;
      sh.ty0 = sh.ty;
      if (controlMode === "tryk" && state !== "quiz") sh.vy = Math.min(sh.vy, -30 * u); // et tryk giver straks et lille løft
      try { stage.setPointerCapture(e.pointerId); } catch { /* ikke vigtigt */ }
      startPlay();
    });
    stage.addEventListener("pointermove", (e) => { if (pointer.active) setPointer(e); });
    const endPointer = () => { pointer.active = false; };
    stage.addEventListener("pointerup", endPointer);
    stage.addEventListener("pointercancel", endPointer);
    const KEYMAP = { ArrowUp: -1, ArrowDown: 1, w: -1, s: 1 };
    function syncKeys() {
      keys.y = 0;
      for (const k of keys.down) keys.y += KEYMAP[k];
      keys.y = clamp(keys.y, -1, 1);
    }
    document.addEventListener("keydown", (e) => {
      if (screen !== "play" || !KEYMAP[e.key]) return;
      e.preventDefault();
      keys.down.add(e.key);
      syncKeys();
      startPlay();
    });
    document.addEventListener("keyup", (e) => { keys.down.delete(e.key); syncKeys(); });

    // ---------- Fejlsøgning (⚙️ → Vis skærmmål, eller ?debug=1) ----------
    let debugOn = read("debug", "0") === "1" || new URLSearchParams(location.search).has("debug");
    let cacheName = "";
    if (window.caches) caches.keys().then((k) => { cacheName = k.filter((n) => n.startsWith("regnespil-")).join(", "); }).catch(() => {});
    function debugText() {
      const vv = window.visualViewport;
      const pr = getComputedStyle($("probe"));
      const sr = stage.getBoundingClientRect();
      const cr = cv.getBoundingClientRect();
      const tb = document.querySelector(".tb");
      const hud = document.querySelector(".hud");
      return [
        `cache: ${cacheName || "?"}`,
        `inner ${innerWidth}x${innerHeight}  screen ${window.screen.width}x${window.screen.height}  dpr ${devicePixelRatio}`,
        `vv ${vv ? `${Math.round(vv.width)}x${Math.round(vv.height)} top ${Math.round(vv.offsetTop)} scale ${vv.scale}` : "-"}`,
        `fast kasse (fixed 0..bund): ${Math.round($("probe").getBoundingClientRect().height)}  dvh: ${CSS.supports("height", "100dvh")}`,
        `safe t/r/b/l: ${pr.paddingTop} ${pr.paddingRight} ${pr.paddingBottom} ${pr.paddingLeft}`,
        `topbar bund: ${tb ? Math.round(tb.getBoundingClientRect().bottom) : "-"}  hud top: ${hud ? Math.round(hud.getBoundingClientRect().top) : "-"}`,
        `bane top/bund: ${Math.round(sr.top)} / ${Math.round(sr.bottom)}  (h ${Math.round(sr.height)})`,
        `lærred bund: ${Math.round(cr.bottom)}  SW x SH: ${SW}x${SH}`,
        `haj y: ${sh ? Math.round(sh.y) : "-"}  gulv: ${sh ? Math.round(SH - sh.R * .7 - 2.6 * u) : "-"}`,
        `standalone: ${navigator.standalone === true || matchMedia("(display-mode: standalone)").matches}`,
        `${navigator.userAgent.replace(/Mozilla\/5.0 /, "").slice(0, 80)}`
      ].join("\n");
    }
    function applyDebug() {
      $("dbg").hidden = !debugOn;
      $("optDebug").textContent = debugOn ? "🛠 Skjul skærmmål" : "🛠 Vis skærmmål (fejlsøgning)";
    }
    $("optDebug").addEventListener("click", () => { debugOn = !debugOn; write("debug", debugOn ? "1" : "0"); applyDebug(); Topbar.closeMenu(); });
    applyDebug();
    setInterval(() => { if (debugOn) $("dbg").textContent = debugText(); }, 400);

    // ---------- Indstillinger og start ----------
    function applyRom() {
      const hide = read("rom", "1") === "0";
      for (const el of document.querySelectorAll(".rom, #quizRom")) el.style.display = hide ? "none" : "";
      fitSoon();
    }
    $("optSpeed").value = speedKey;
    $("optControl").value = controlMode;
    $("optControl").addEventListener("change", (e) => { controlMode = e.target.value === "traek" ? "traek" : "tryk"; write("styring", controlMode); if (sh) { sh.vy = 0; sh.ty = sh.y; } $("startHint").textContent = hintText(); });
    $("optChoices").value = read("valg", "auto");
    $("optRom").value = read("rom", "1");
    $("optSpeed").addEventListener("change", (e) => { write("fart", e.target.value); speedKey = e.target.value; });
    $("optChoices").addEventListener("change", (e) => write("valg", e.target.value));
    $("optRom").addEventListener("change", (e) => { write("rom", e.target.value); applyRom(); });
    $("optReset").addEventListener("click", () => {
      curWorld = 0;
      write("hav", 0);
      Topbar.closeMenu();
      if (screen === "play") goHome(); else renderHome();
    });

    $("mascot").addEventListener("click", (e) => { audio(); sfx.pop(); e.currentTarget.animate([{ transform: "scale(1)" }, { transform: "scale(1.15) rotate(8deg)" }, { transform: "scale(1)" }], { duration: 380 }); });
    $("playBtn").addEventListener("click", () => { audio(); startWorld(curWorld); });
    $("dictBtn").addEventListener("click", () => { renderDict(); show("dictScreen"); $("dictScreen").scrollTop = 0; });
    $("faunaBtn").addEventListener("click", () => { audio(); showFauna(curWorld, null); });
    $("optFauna").value = read("dyr", "1");
    $("optFauna").addEventListener("change", (e) => write("dyr", e.target.value));
    $("dictBack").addEventListener("click", () => { stopSpeech(); renderHome(); show("home"); });

    // Siden følger den højde, der faktisk kan ses (iPhone-Safari tæller nogle gange værktøjslinjerne med)
    const fitViewport = () => {
      const vv = window.visualViewport;
      document.documentElement.style.setProperty("--app-h", `${Math.round(vv ? vv.height : window.innerHeight)}px`);
    };
    fitViewport();
    window.addEventListener("resize", fitViewport);
    window.addEventListener("orientationchange", () => setTimeout(fitViewport, 300));
    if (window.visualViewport) visualViewport.addEventListener("resize", fitViewport);
    new ResizeObserver(() => { if (screen === "play") resize(); }).observe(stage);
    window.addEventListener("resize", () => { if (screen === "play") resize(); });
    if (window.visualViewport) { visualViewport.addEventListener("resize", () => { if (screen === "play") resize(); }); visualViewport.addEventListener("scroll", () => { if (screen === "play") resize(); }); }

    Topbar.init({ kid, controls: [$("settings")] });
    renderHome();
    requestAnimationFrame(frame);

    // Testværktøj: ?l=<hav 1-7> åbner et hav direkte. window.__haj giver adgang til tilstanden, og tick(sek) kører spillet frem.
    const qs = new URLSearchParams(location.search);
    window.__haj = {
      get G() { return G; }, get sh() { return sh; }, get fish() { return fish; }, get state() { return state; }, get quiz() { return quiz; },
      pointer, answer, closeQuiz, startWorld, speak, wordState, ALL, WORLDS, SPECIES, openDetail, showFauna, heard,
      get SW() { return SW; }, get SH() { return SH; }, get curWorld() { return curWorld; },
      tick(sec) { for (let i = 0; i < sec * 60; i++) update(1 / 60); draw(); },
      worldDone, sizeUp, caught, eat, spawnFish, get stars() { return stars; }
    };
    if (qs.has("l")) startWorld(Math.max(0, (Number(qs.get("l")) || 1) - 1) % WORLDS.length);
    // ?quiz=1 (sammen med ?l=) åbner quizzen direkte, til skærmbilleder
    if (qs.has("quiz") && qs.has("l")) setTimeout(() => { if (!$("fauna").hidden) $("faunaGo").click(); $("meetGo").click(); state = "play"; pointer.active = false; G.grace = 0; spawnFish("evil", false); const e = fish.find((f) => f.big); e.x = sh.x; e.y = sh.y; for (let i = 0; i < 100; i++) update(1 / 60); }, 800);
  })();
