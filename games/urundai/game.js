  (() => {
    "use strict";
    const R = window.UrundaiOrd;
    const Art = window.UrundaiArt;
    const WORDS = R.words;
    const ALL = Object.keys(WORDS);
    const $ = (id) => document.getElementById(id);
    const kid = new URLSearchParams(location.search).get("barn") === "riyana" ? "riyana" : "ari";
    const key = (name) => `urundai-${kid}-${name}`;
    const read = (name, fallback) => { try { const v = localStorage.getItem(key(name)); return v === null ? fallback : v; } catch { return fallback; } };
    const write = (name, value) => { try { localStorage.setItem(key(name), String(value)); } catch { /* ingen lagring */ } };
    const readJSON = (name, fallback) => { try { return JSON.parse(read(name, "")) || fallback; } catch { return fallback; } };

    const wordState = readJSON("words", {}); // id -> { box 0-3, seen, ok, bad }
    let stars = Number(read("stars", "0")) || 0;
    let nextLevel = Math.max(1, Number(read("level", "1")) || 1);
    let hiScore = Number(read("rekord", "0")) || 0;
    let muted = !Topbar.soundOn();
    const { audio, tone, buzz } = KidsSynth.create(() => muted);
    window.addEventListener("topbar:sound", (e) => { muted = !e.detail.on; if (muted) stopSpeech(); });

    const ws = (id) => wordState[id] || (wordState[id] = { box: 0, seen: false, ok: 0, bad: 0, t: 0 });
    const saveWords = () => write("words", JSON.stringify(wordState));
    const rnd = (n) => Math.floor(Math.random() * n);
    const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const seenCount = () => ALL.filter((id) => ws(id).seen).length;
    const seenIds = () => ALL.filter((id) => ws(id).seen);

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

    // ---------- Farver og fart ----------
    // wall = stenmure, floor = mørk tempelgang. Guldkanten (rim) svarer til de blå linjer i originalen.
    const PALETTES = [
      { bg1: "#5b2a86", bg2: "#14683a", wall: "#7a3350", wallHi: "#93445f", floor: "#1c1020", rim: "#f2b63f" },
      { bg1: "#16327e", bg2: "#0f766e", wall: "#2c4a8a", wallHi: "#3b5ea6", floor: "#0c1230", rim: "#f5c04a" },
      { bg1: "#9a3412", bg2: "#4d7c0f", wall: "#8a4a1f", wallHi: "#a65c28", floor: "#22120a", rim: "#f0a53a" },
      { bg1: "#065f46", bg2: "#15803d", wall: "#46682e", wallHi: "#5a8239", floor: "#0e1f12", rim: "#e6b94a" }
    ];
    // Ghost-sprites: 0 tiger (rød), 1 abe (lyserød), 2 påfugl (cyan), 3 kobra (orange) som i originalen
    const GK = [
      { k: "puli", body: "#ef5a1a", dark: "#9a2f00", light: "#ffd9b8" },
      { k: "bandar", body: "#e79ab0", dark: "#9a4a66", light: "#fde1ea" },
      { k: "mayil", body: "#1fc3cf", dark: "#0e7c86", light: "#c8f6f9" },
      { k: "naga", body: "#f0a03a", dark: "#a05a00", light: "#ffe6b8" }
    ];
    const FACT = { rolig: .55, normal: .75, hurtig: 1 };
    const PHASES = {
      rolig: [9, 14, 9, 14, 7, 14, 7, 1e9],
      normal: [7, 20, 7, 20, 5, 20, 5, 1e9],
      hurtig: [7, 20, 7, 20, 5, 20, 5, 1e9]
    };
    const BASE = 9.47; // felter pr. sekund ved 100 % (som originalen)
    let speedKey = FACT[read("fart", "")] ? read("fart", "") : (kid === "riyana" ? "rolig" : "normal");

    // ---------- Billeder ----------
    const imgCache = new Map();
    function artImg(keyName) {
      let img = imgCache.get(keyName);
      if (!img) { img = new Image(); img.src = Art.dataUri(Art.get(keyName)); imgCache.set(keyName, img); }
      return img;
    }
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
    const FIT = ".card-w .t, .mcard .t, .wordbtn .tw, #wordPop .tw, .chip .ta";
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
    // Mobiler (især iPhone/iPad) tillader kun lyd, hvis afspilleren er "låst op" af en berøring. Derfor låses den op ved første tryk,
    // og afvises et klip alligevel, gemmes det og spilles ved næste tryk (med en lille tekst om det).
    const clip = new Audio();
    clip.preload = "auto";
    const SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
    let speechToken = 0;
    let speechDone = null;
    let unlocked = false;
    let pendingSpeech = null;
    let soundNote = "";
    function setNote(text) {
      soundNote = text;
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
      $("quizWord").classList.remove("speaking");
      clip.onended = null;
      clip.onerror = null;
      clip.onplaying = null;
      clip.pause();
      if (speechDone) { const d = speechDone; speechDone = null; d(false); }
    }
    // Svarer true, når klippet er spillet til ende, og false, hvis noget andet afbrød det eller afspilningen blev afvist
    function speak(id) {
      stopSpeech();
      const token = speechToken;
      return new Promise((resolve) => {
        let finished = false;
        let safety = 0;
        let endTimer = 0;
        const finish = (ok) => {
          if (finished) return;
          finished = true;
          if (token === speechToken) $("quizWord").classList.remove("speaking");
          clearTimeout(safety);
          clearTimeout(endTimer);
          if (speechDone === done) speechDone = null;
          resolve(ok && token === speechToken);
        };
        const done = (ok) => finish(ok);
        speechDone = done;
        $("quizWord").classList.add("speaking");
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
    let chompFlip = false;
    const sfx = {
      chomp: () => { chompFlip = !chompFlip; tone(chompFlip ? 330 : 440, .06, "square", .04); },
      power: () => { tone(300, .2, "triangle", .12, 0, 500); tone(600, .25, "triangle", .1, .12); },
      eat: () => { tone(500, .12, "square", .08, 0, 600); tone(900, .12, "square", .06, .08); },
      fruit: () => { tone(880, .1, "triangle", .1); tone(1320, .14, "triangle", .1, .09); },
      caught: () => { [440, 370, 311, 262, 196, 147].forEach((f, i) => tone(f, .16, "sawtooth", .08, i * .12)); },
      ready: () => { [392, 523, 659, 784].forEach((f, i) => tone(f, .16, "triangle", .08, i * .15)); },
      wrong: () => tone(220, .28, "triangle", .1, 0, -90),
      right: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .22, "triangle", .12, i * .09)),
      fanfare: () => [523, 659, 784, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .28, "triangle", .13, i * .12)),
      pop: () => { tone(480, .1, "triangle", .12, 0, 380); tone(760, .12, "triangle", .08, .08); }
    };

    // ---------- Skærme ----------
    const SCREENS = ["home", "dictScreen", "play"];
    let screen = "home";
    function show(name) {
      screen = name;
      for (const s of SCREENS) $(s).hidden = s !== name;
      if (name === "play") resize();
    }
    const sceneUri = (c1, c2, wide) => `url("${Art.dataUri(Art.scene(c1, c2, wide))}")`;
    const paintBg = () => { $("bg").style.backgroundImage = sceneUri(PALETTES[3].bg1, PALETTES[3].bg2, innerWidth > innerHeight); };
    paintBg();
    window.addEventListener("resize", paintBg);
    $("temple").innerHTML = Art.gopuram();

    function renderHome() {
      $("playBtn").textContent = nextLevel > 1 ? `▶ Spil · bane ${nextLevel}` : "▶ Spil";
      $("dictCount").textContent = `(${seenCount()}/${ALL.length})`;
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

    // ---------- Banen: samme felt-labyrint som i Pac-Man (28 × 31 felter) ----------
    // # mur, _ uden for banen, . blomst, o lotus (kraftprik), mellemrum tom gang, T tunnel, - port, H spøgelseshuset
    const MAP = [
      "############################",
      "#............##............#",
      "#.####.#####.##.#####.####.#",
      "#o####.#####.##.#####.####o#",
      "#.####.#####.##.#####.####.#",
      "#..........................#",
      "#.####.##.########.##.####.#",
      "#.####.##.########.##.####.#",
      "#......##....##....##......#",
      "######.#####_##_#####.######",
      "_____#.#####_##_#####.#_____",
      "_____#.##          ##.#_____",
      "_____#.## ###--### ##.#_____",
      "######.## #HHHHHH# ##.######",
      "TTTTTT.   #HHHHHH#   .TTTTTT",
      "######.## #HHHHHH# ##.######",
      "_____#.## ######## ##.#_____",
      "_____#.##          ##.#_____",
      "_____#.## ######## ##.#_____",
      "######.## ######## ##.######",
      "#............##............#",
      "#.####.#####.##.#####.####.#",
      "#.####.#####.##.#####.####.#",
      "#o..##.......  .......##..o#",
      "###.##.##.########.##.##.###",
      "###.##.##.########.##.##.###",
      "#......##....##....##......#",
      "#.##########.##.##########.#",
      "#.##########.##.##########.#",
      "#..........................#",
      "############################"
    ];
    // Rækken over huset ligger tom, så mellemrum i række 9 er gang uden blomster
    MAP[9] = "######.##### ## #####.######";
    MAP[10] = "_____#.##### ## #####.#_____";
    const COLS = 28;
    const ROWS = 31;
    const DX = [0, 1, 0, -1];
    const DY = [-1, 0, 1, 0];
    const EPS = 1e-6;
    const NOUP = new Set(["12,11", "15,11", "12,23", "15,23"]);
    const CORNER = [[25, -3], [2, -3], [27, 31], [0, 31]];
    const FRUITS = ["mango", "banan", "kokos", "jakfrugt"];
    const FRUIT_POINTS = [100, 300, 500, 700, 1000, 2000, 3000, 5000];

    function tileAt(tx, ty) {
      if (ty < 0 || ty >= ROWS) return "#";
      if (tx < 0 || tx >= COLS) { if (ty !== 14) return "#"; tx = (tx + COLS) % COLS; }
      return MAP[ty][tx];
    }
    const pacPass = (tx, ty) => ".o T".includes(tileAt(tx, ty));
    const ghostPass = (tx, ty, eyes) => {
      const c = tileAt(tx, ty);
      return ".o T".includes(c) || (eyes && (c === "-" || c === "H"));
    };

    const stage = $("stage");
    const cv = $("cv");
    const ctx = cv.getContext("2d");
    let SW = 0;
    let SH = 0;
    let dpr = 1;
    let geo = { t: 10, ox: 0, oy: 0 };
    let G = null; // banens tilstand
    let pac = null;
    let ghosts = [];
    let boards = [null, null];
    let state = "home"; // ready, play, dying, won, quiz, meet, done
    let time = 0;
    let readyT = 0;
    let runScore = 0; // point fra de klarede baner i denne omgang
    let popups = [];
    const READY_TIME = 2.2;

    function resize() {
      const r = stage.getBoundingClientRect();
      SW = r.width;
      SH = r.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.max(1, Math.round(SW * dpr));
      cv.height = Math.max(1, Math.round(SH * dpr));
      cv.style.width = `${SW}px`;
      cv.style.height = `${SH}px`;
      if (G && SW > 0) { layoutGeo(); renderBoards(); }
    }
    // Felterne må være op til 70 % højere (eller bredere) end de er brede, så labyrinten udnytter en høj mobilskærm.
    // t er den mindste side og bruges til figurernes størrelse.
    function layoutGeo() {
      const pad = SW < 520 ? 4 : 10;
      const base = Math.max(4, Math.min((SW - pad * 2) / COLS, (SH - pad * 2) / ROWS));
      const tx = Math.min((SW - pad * 2) / COLS, base * 1.7);
      const ty = Math.min((SH - pad * 2) / ROWS, base * 1.7);
      geo = { t: Math.min(tx, ty), tx, ty, ox: Math.round((SW - tx * COLS) / 2), oy: Math.round((SH - ty * ROWS) / 2) };
    }

    // Farten i felter pr. sekund. Den vokser lidt for hver bane.
    function speeds() {
      const f = FACT[speedKey] * Math.min(1.25, 1 + .03 * (G.n - 1));
      return { pac: BASE * .8 * f, ghost: BASE * .75 * f, fright: BASE * .5 * f, tunnel: BASE * .4 * f, eyes: BASE * 1.4 * f, house: BASE * .45 * f };
    }

    function pickNew(n) {
      return shuffle(ALL.filter((id) => !ws(id).seen)).slice(0, n);
    }
    // Gamle ord, der skal øves igen (de svageste og dem, barnet ikke har set længe, trækkes oftest)
    function pickReview(exclude) {
      return pickWeighted(seenIds(), 2, exclude);
    }

    function loadLevel(n, keepWords, keepReview) {
      const dots = new Uint8Array(COLS * ROWS);
      let total = 0;
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const c = MAP[y][x];
          if (c === "." || c === "o") { dots[y * COLS + x] = c === "o" ? 2 : 1; total++; }
        }
      }
      const fresh = keepWords || pickNew(2);
      G = {
        n, dots, total, left: total, eaten: 0, lifeDots: 0, noDot: 0, caught: 0,
        pal: PALETTES[rnd(PALETTES.length)],
        newWords: fresh,
        reviewWords: keepReview || pickReview(fresh),
        ghostsN: kid === "riyana" ? (n < 2 ? 1 : n < 6 ? 2 : 3) : (n < 2 ? 2 : n < 3 ? 3 : 4),
        score: runScore, phase: 0, phaseT: 0, frightT: 0, chain: 0, freeze: 0,
        fruit: null, fruitSeen: [false, false], bonus: 0, flash: 0, wonT: 0, frightLen: Math.max(3, 8 - .6 * n)
      };
      resetActors();
      layoutGeo();
      stage.style.backgroundImage = sceneUri(G.pal.bg1, G.pal.bg2, SW > SH);
      $("playTitle").textContent = `Bane ${n}`;
      setScore();
      renderFoot();
      renderBoards();
    }

    function resetActors() {
      pac = { x: 14, y: 23.5, dir: 3, face: 3, want: -1, wantT: 0, since: 1, lc: null, chew: 0, dying: 0 };
      ghosts = [0, 1, 2, 3].slice(0, G.ghostsN).map((id) => ({
        id, x: id === 0 ? 14 : [14, 12, 16][id - 1], y: id === 0 ? 11.5 : 14.5,
        dir: id === 0 ? 3 : -1, mode: id === 0 ? "active" : "house", fright: false, anim: id, wait: 0
      }));
      G.lifeDots = 0;
      G.noDot = 0;
      G.phase = 0;
      G.phaseT = 0;
      G.frightT = 0;
      G.chain = 0;
      G.fruit = null;
      G.freeze = 0;
      popups = [];
    }

    function startLevel(n) {
      show("play");
      loadLevel(n);
      if (G.newWords.length || G.reviewWords.length) showMeet(G.newWords, G.reviewWords);
      else beginReady();
    }

    function beginReady() {
      state = "ready";
      readyT = 0;
      resize();
      $("startHint").hidden = true;
      sfx.ready();
      // Et ord at øve, mens man venter på at starte
      const w = pickWeighted(seenIds(), 1)[0];
      if (w) setTimeout(() => { if (state === "ready") wordPop(w); }, 500);
    }

    // Ordkort under spillet: gentagelse uden at afbryde
    let popTimer = 0;
    function wordPop(id) {
      const el = $("wordPop");
      const w = WORDS[id];
      el.replaceChildren(picBox(id));
      el.insertAdjacentHTML("beforeend", `<div><span class="tw ${lenCls(w.ta)}">${w.ta}</span><span class="rm rom">${w.rom}</span></div>`);
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
    const popWord = () => pickWeighted(seenIds(), 1)[0];

    function setScore() {
      $("score").textContent = G.score;
      if (G.score > hiScore) { hiScore = G.score; write("rekord", hiScore); }
      $("hi").textContent = Math.max(hiScore, G.score);
    }
    function renderFoot() {
      const lit = Math.max(0, 3 - G.caught);
      $("pips").innerHTML = [0, 1, 2].map((i) => starSvg(i < lit ? "" : "off")).join("");
      const kind = FRUITS[(G.n - 1) % FRUITS.length];
      $("fruits").innerHTML = Art.get(`fruit:${kind}`);
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

    // ---------- Bevægelse (fælles for kuglen og spøgelserne) ----------
    const atCenter = (e) => Math.abs(e.x - Math.floor(e.x) - .5) < EPS && Math.abs(e.y - Math.floor(e.y) - .5) < EPS;

    // Flytter e langs sin retning. Ved hvert felts midte kaldes center(e), som vælger retning (eller dir = -1 for stop).
    function advance(e, dist, center) {
      for (let guard = 0; dist > EPS && guard < 16; guard++) {
        if (atCenter(e)) { center(e); if (e.dir < 0 || state === "won") return; }
        const dx = DX[e.dir];
        const dy = DY[e.dir];
        const pos = dx !== 0 ? e.x : e.y;
        const sign = dx !== 0 ? dx : dy;
        const c = Math.floor(pos) + .5;
        const dc = sign > 0 ? (c > pos + EPS ? c - pos : c + 1 - pos) : (c < pos - EPS ? pos - c : pos - c + 1);
        const m = Math.min(dist, dc);
        e.x += dx * m;
        e.y += dy * m;
        dist -= m;
        if (e.since !== undefined) e.since += m;
        if (m >= dc - EPS) {
          if (dx !== 0) e.x = Math.round(e.x - .5) + .5; else e.y = Math.round(e.y - .5) + .5;
        }
        if (e.x < 0) e.x += COLS;
        if (e.x >= COLS) e.x -= COLS;
      }
    }

    // ---------- Kuglen ----------
    function pacCenter(p) {
      const tx = Math.floor(p.x);
      const ty = Math.floor(p.y);
      const i = ty * COLS + tx;
      const d = G.dots[i];
      if (d) {
        G.dots[i] = 0;
        G.left--;
        G.eaten++;
        G.lifeDots++;
        G.noDot = 0;
        G.score += d === 2 ? 50 : 10;
        setScore();
        if (d === 2) { powerUp(); sfx.power(); burst(tx + .5, ty + .5, 10, ["#f472b6", "#fbbf24", "#fff"]); const w = popWord(); if (w) wordPop(w); } else sfx.chomp();
        spawnFruit();
        if (G.left === 0) { win(); return; }
      }
      p.since = 0;
      p.lc = [tx, ty];
      if (p.want >= 0 && pacPass(tx + DX[p.want], ty + DY[p.want])) { p.dir = p.want; p.face = p.dir; p.want = -1; } else if (p.dir < 0 || !pacPass(tx + DX[p.dir], ty + DY[p.dir])) p.dir = -1;
    }

    function swipe(d) {
      if (!G || !pac) return;
      if (state === "ready" && readyT >= READY_TIME) {
        audio();
        state = "play";
        $("startHint").hidden = true;
        pac.dir = d === 1 ? 1 : 3;
        pac.face = pac.dir;
        if (d === 0 || d === 2) { pac.want = d; pac.wantT = 0; }
        return;
      }
      if (state !== "play") return;
      audio();
      if (pac.dir >= 0 && d === (pac.dir + 2) % 4) { pac.dir = d; pac.face = d; pac.want = -1; return; }
      if (pac.dir < 0) {
        const tx = Math.floor(pac.x);
        const ty = Math.floor(pac.y);
        if (atCenter(pac) && pacPass(tx + DX[d], ty + DY[d])) { pac.dir = d; pac.face = d; } else { pac.want = d; pac.wantT = 0; }
        return;
      }
      if (d === pac.dir) return;
      // Et swipe lidt for sent: kuglen er lige kørt forbi krydset, så den tager det alligevel
      if (pac.since > 0 && pac.since < .5 && pac.lc && pacPass(pac.lc[0] + DX[d], pac.lc[1] + DY[d])) {
        pac.x = pac.lc[0] + .5;
        pac.y = pac.lc[1] + .5;
        pac.dir = d;
        pac.face = d;
        pac.want = -1;
        pac.since = 0;
        return;
      }
      pac.want = d;
      pac.wantT = 0;
    }

    function powerUp() {
      G.frightT = G.frightLen;
      G.chain = 0;
      for (const g of ghosts) {
        if (g.mode === "eyes" || g.mode === "entering") continue;
        g.fright = true;
        if (g.mode === "active" && g.dir >= 0) g.dir = (g.dir + 2) % 4;
      }
    }

    function spawnFruit() {
      for (const [i, at] of [[0, 70], [1, 170]]) {
        if (!G.fruitSeen[i] && G.eaten >= at) { G.fruitSeen[i] = true; G.fruit = { x: 14, y: 17.5, t: 9.5 }; }
      }
    }

    // ---------- Spøgelserne (samme regler som originalen) ----------
    function ghostTarget(g) {
      if (g.mode === "eyes") return [13, 12];
      if (G.phase % 2 === 0) return CORNER[g.id];
      const pt = [Math.floor(pac.x), Math.floor(pac.y)];
      const f = pac.face;
      switch (g.id) {
        case 0: return pt;
        case 1: return [pt[0] + DX[f] * 4 - (f === 0 ? 4 : 0), pt[1] + DY[f] * 4];
        case 2: {
          const a = [pt[0] + DX[f] * 2 - (f === 0 ? 2 : 0), pt[1] + DY[f] * 2];
          const b = ghosts[0];
          return [2 * a[0] - Math.floor(b.x), 2 * a[1] - Math.floor(b.y)];
        }
        default: {
          const dx = Math.floor(g.x) - pt[0];
          const dy = Math.floor(g.y) - pt[1];
          return dx * dx + dy * dy > 64 ? pt : CORNER[3];
        }
      }
    }

    function ghostCenter(g) {
      const tx = Math.floor(g.x);
      const ty = Math.floor(g.y);
      const eyes = g.mode === "eyes";
      if (eyes && ty === 12 && (tx === 13 || tx === 14)) { g.mode = "entering"; g.dir = -1; return; }
      const back = g.dir < 0 ? -1 : (g.dir + 2) % 4;
      let cand = [];
      for (const d of [0, 3, 2, 1]) {
        if (d === back) continue;
        if (!ghostPass(tx + DX[d], ty + DY[d], eyes)) continue;
        if (d === 0 && !g.fright && !eyes && NOUP.has(`${tx},${ty}`)) continue;
        cand.push(d);
      }
      if (!cand.length) {
        if (back >= 0 && ghostPass(tx + DX[back], ty + DY[back], eyes)) cand = [back]; else { g.dir = -1; return; }
      }
      if (g.fright && !eyes) { g.dir = cand[rnd(cand.length)]; return; }
      const [gx, gy] = ghostTarget(g);
      let best = cand[0];
      let bv = Infinity;
      for (const d of cand) {
        const nx = tx + DX[d] - gx;
        const ny = ty + DY[d] - gy;
        const v = nx * nx + ny * ny;
        if (v < bv) { bv = v; best = d; }
      }
      g.dir = best;
    }

    function releaseNext() {
      const g = ghosts.find((x) => x.mode === "house");
      if (g) { g.mode = "leaving"; g.y = 14.5; }
    }

    function updateGhost(g, dt, v) {
      g.anim += dt;
      if (g.mode === "house") { g.y = 14.5 + Math.sin(g.anim * 6) * .3; return; }
      if (g.mode === "leaving") {
        const s = v.house * 1.5 * dt;
        if (Math.abs(g.x - 14) > 1e-4) g.x += Math.sign(14 - g.x) * Math.min(s, Math.abs(14 - g.x));
        else if (g.y > 11.5 + 1e-4) g.y -= Math.min(s, g.y - 11.5);
        else { g.y = 11.5; g.mode = "active"; g.dir = 3; }
        return;
      }
      if (g.mode === "entering") {
        const s = v.eyes * dt;
        if (Math.abs(g.x - 14) > 1e-4) g.x += Math.sign(14 - g.x) * Math.min(s, Math.abs(14 - g.x));
        else if (g.y < 14.5 - 1e-4) g.y += Math.min(s, 14.5 - g.y);
        else { g.mode = "leaving"; g.fright = false; g.dir = -1; }
        return;
      }
      let sp = g.mode === "eyes" ? v.eyes : g.fright ? v.fright : v.ghost;
      if (g.mode !== "eyes" && tileAt(Math.floor(g.x), Math.floor(g.y)) === "T") sp = Math.min(sp, v.tunnel);
      advance(g, sp * dt, ghostCenter);
    }

    function playStep(dt) {
      const v = speeds();
      pac.wantT += dt;
      if (pac.wantT > 2) pac.want = -1;
      advance(pac, v.pac * (G.frightT > 0 ? 1.125 : 1) * dt, pacCenter);
      if (state !== "play") return;
      if (pac.dir >= 0) pac.chew += dt * 16;

      if (G.frightT > 0) {
        G.frightT -= dt;
        if (G.frightT <= 0) for (const g of ghosts) g.fright = false;
      } else {
        G.phaseT += dt;
        const len = PHASES[speedKey][Math.min(G.phase, 7)];
        if (G.phaseT >= len) {
          G.phase++;
          G.phaseT = 0;
          for (const g of ghosts) if (g.mode === "active" && g.dir >= 0) g.dir = (g.dir + 2) % 4;
        }
      }

      G.noDot += dt;
      const waiting = ghosts.filter((g) => g.mode === "house").length;
      const thresholds = [0, 15, 35];
      const nextIdx = ghosts.filter((g) => g.mode !== "house").length - 1;
      if (waiting && (G.lifeDots >= thresholds[Math.min(2, Math.max(0, nextIdx))] || G.noDot > 4)) { releaseNext(); if (G.noDot > 4) G.noDot = 0; }

      for (const g of ghosts) updateGhost(g, dt, v);

      if (G.fruit) {
        G.fruit.t -= dt;
        if (Math.hypot(G.fruit.x - pac.x, G.fruit.y - pac.y) < .9) {
          const pts = FRUIT_POINTS[Math.min(G.n - 1, 7)];
          G.score += pts;
          G.bonus++;
          setScore();
          popups.push({ x: G.fruit.x, y: G.fruit.y, txt: String(pts), t: 1.2 });
          sfx.fruit();
          G.fruit = null;
          const fw = popWord();
          if (fw) wordPop(fw);
        } else if (G.fruit.t <= 0) G.fruit = null;
      }

      for (const g of ghosts) {
        if (g.mode !== "active" && g.mode !== "leaving") continue;
        if (Math.hypot(g.x - pac.x, g.y - pac.y) >= .65) continue;
        if (g.fright) {
          const pts = 200 * 2 ** Math.min(3, G.chain++);
          G.score += pts;
          setScore();
          g.mode = "eyes";
          g.fright = false;
          popups.push({ x: g.x, y: g.y, txt: String(pts), t: 1 });
          sfx.eat();
          buzz(20);
          G.freeze = .45;
          if (G.chain === 1) { const gw = popWord(); if (gw) wordPop(gw); }
        } else {
          caught(g);
          return;
        }
      }
    }

    function caught(g) {
      state = "dying";
      hidePop();
      stopSpeech();
      pac.dying = 0;
      G.caught++;
      G.eatenBy = GK[g.id].body;
      G.freeze = .8;
      renderFoot();
      sfx.caught();
      buzz(60);
    }

    function win() {
      state = "won";
      hidePop();
      G.wonT = 0;
      pac.dir = -1;
      sfx.fanfare();
    }

    // ---------- Quiz ----------
    let quiz = null;
    let lastTarget = null;
    function choiceCount() {
      const v = read("valg", "auto");
      if (v !== "auto") return Number(v);
      return nextLevel <= 1 ? 2 : nextLevel === 2 ? 3 : 4;
    }
    function pickTarget(reason) {
      const known = ALL.filter((id) => ws(id).seen || G.newWords.includes(id));
      let pool;
      if (reason === "clear") pool = G.newWords.length && Math.random() < .65 ? G.newWords : [...G.newWords, ...G.reviewWords];
      else pool = known;
      if (!pool.length) pool = known.length ? known : ALL;
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

    function openQuiz(reason) {
      state = "quiz";
      $("startHint").hidden = true;
      hidePop();
      const target = pickTarget(reason);
      lastTarget = target;
      const n = Math.min(choiceCount(), ALL.length);
      const options = shuffle([target, ...pickDistractors(target, n - 1)]);
      quiz = { reason, target, options, locked: false, idle: 0 };
      const w = WORDS[target];
      $("quizTa").textContent = w.ta;
      $("quizTa").className = `tw ${lenCls(w.ta)}`;
      $("quizRom").textContent = w.rom;
      $("quizBanner").textContent = "";
      $("quizBanner").className = "banner";
      $("quizRetry").hidden = true;
      if (reason === "clear") {
        $("quizIcon").innerHTML = Art.gopuram();
        $("quizWhy").textContent = "Tempelporten er lukket! Svar rigtigt for at komme videre.";
      } else {
        $("quizIcon").innerHTML = Art.ghost(G.eatenBy || "#2fa150");
        $("quizWhy").textContent = "Du blev fanget! Svar rigtigt for at fortsætte.";
      }
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
      const reason = quiz.reason;
      quiz = null;
      stopSpeech();
      $("quiz").hidden = true;
      if (!ok) { restartLevel(); return; }
      if (reason === "clear") levelDone();
      else { resetActors(); beginReady(); }
    }

    // Forkert svar: samme bane forfra med alle blomster igen
    function restartLevel() {
      const words = G.newWords;
      const review = G.reviewWords;
      const n = G.n;
      loadLevel(n, words, review);
      G.caught = 0;
      renderFoot();
      beginReady();
    }

    // ---------- Banen er klaret ----------
    function levelDone() {
      const got = G.caught === 0 ? 3 : G.caught === 1 ? 2 : 1;
      stars += got + G.bonus;
      write("stars", stars);
      Topbar.refreshStars(true);
      nextLevel = G.n + 1;
      runScore = G.score;
      write("level", nextLevel);
      $("doneArt").innerHTML = Art.gopuram();
      $("doneTitle").textContent = G.caught === 0 ? "Helt perfekt! Porten er åben!" : "Porten er åben!";
      const row = $("doneStars");
      row.replaceChildren();
      for (let i = 0; i < 3; i++) {
        const holder = document.createElement("span");
        holder.innerHTML = starSvg(i < got ? "on" : "");
        if (i < got) holder.firstChild.style.setProperty("--d", `${.25 + i * .25}s`);
        row.append(holder.firstChild);
      }
      const words = $("doneWords");
      words.replaceChildren();
      for (const id of G.newWords) {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chip";
        chip.append(picBox(id));
        chip.insertAdjacentHTML("beforeend", `<span class="ta">${WORDS[id].ta}</span>`);
        chip.addEventListener("click", () => { audio(); speak(id); });
        words.append(chip);
      }
      $("done").hidden = false;
      fitSoon();
      state = "done";
      confetti();
    }
    function confetti() {
      const colors = ["#fbbf24", "#f472b6", "#fb923c", "#fde047", "#34d399", "#fff"];
      for (let i = 0; i < 30; i++) {
        const s = document.createElement("span");
        const size = 10 + rnd(12);
        s.className = "petal";
        s.style.cssText = `left:${rnd(100)}vw;width:${size}px;height:${size}px;background:${colors[rnd(colors.length)]};animation-duration:${2.2 + Math.random() * 2}s;animation-delay:${Math.random() * .8}s`;
        document.body.append(s);
        setTimeout(() => s.remove(), 5200);
      }
    }
    $("doneNext").addEventListener("click", () => { $("done").hidden = true; startLevel(nextLevel); });
    $("doneHome").addEventListener("click", () => { $("done").hidden = true; goHome(); });

    function goHome() {
      stopSpeech();
      hidePop();
      meetToken++;
      quiz = null;
      $("quiz").hidden = true;
      $("meet").hidden = true;
      $("startHint").hidden = true;
      state = "home";
      G = null;
      renderHome();
      show("home");
    }
    $("playBack").addEventListener("click", goHome);

    // ---------- Tegning ----------
    let particles = [];
    function burst(x, y, n, colors) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 1.5 + Math.random() * 5;
        particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 1, c: colors[rnd(colors.length)], s: .12 + Math.random() * .16 });
      }
    }

    function rr(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }

    // Stenmure med guldkant. Gangene er mørke kanaler, som i originalens blå linjer.
    function renderBoards() {
      if (!G || SW <= 0) return;
      for (const flash of [0, 1]) {
        const b0 = boards[flash] || (boards[flash] = document.createElement("canvas"));
        b0.width = cv.width;
        b0.height = cv.height;
        const b = b0.getContext("2d");
        b.setTransform(dpr, 0, 0, dpr, 0, 0);
        const { t, tx, ty, ox, oy } = geo;
        const W = COLS * tx;
        const H = ROWS * ty;
        const pal = G.pal;
        b.save();
        b.translate(ox, oy);
        b.shadowColor = "#0008";
        b.shadowBlur = t * .8;
        rr(b, -t * .5, -t * .5, W + t, H + t, t * 1.1);
        b.fillStyle = pal.rim;
        b.fill();
        b.shadowBlur = 0;
        rr(b, -t * .22, -t * .22, W + t * .44, H + t * .44, t * .8);
        b.fillStyle = flash ? "#fff4cf" : pal.wall;
        b.fill();
        b.save();
        rr(b, -t * .22, -t * .22, W + t * .44, H + t * .44, t * .8);
        b.clip();
        b.strokeStyle = flash ? "rgba(180,120,0,.25)" : "rgba(0,0,0,.2)";
        b.lineWidth = Math.max(1, t * .06);
        const bh = t * .75;
        for (let row = 0; row * bh < H + bh; row++) {
          const y = row * bh;
          b.beginPath();
          b.moveTo(0, y);
          b.lineTo(W, y);
          b.stroke();
          for (let x = row % 2 ? bh : 0; x < W; x += bh * 2) {
            b.beginPath();
            b.moveTo(x, y - bh);
            b.lineTo(x, y);
            b.stroke();
          }
        }
        b.restore();
        b.lineCap = "round";
        b.lineJoin = "round";
        const floorTiles = [];
        for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (".o T-H".includes(MAP[y][x])) floorTiles.push([x, y]);
        const tracks = (width, color) => {
          b.strokeStyle = color;
          b.lineWidth = width;
          b.beginPath();
          for (const [x, y] of floorTiles) {
            const cx = (x + .5) * tx;
            const cy = (y + .5) * ty;
            b.moveTo(cx, cy);
            b.lineTo(cx + .01, cy);
            if (".o T-H".includes(tileAt(x + 1, y)) && x + 1 < COLS) { b.moveTo(cx, cy); b.lineTo(cx + tx, cy); }
            if (".o T-H".includes(tileAt(x, y + 1))) { b.moveTo(cx, cy); b.lineTo(cx, cy + ty); }
          }
          b.stroke();
        };
        tracks(t * 1.2, flash ? "#ffffff" : pal.rim);
        tracks(t * .94, flash ? "#fff4cf" : pal.floor);
        // Tunnelen går ud til kanten
        b.fillStyle = flash ? "#fff4cf" : pal.floor;
        b.fillRect(-t * .22, 14.5 * ty - t * .47, t * .4, t * .94);
        b.fillRect(W - t * .18, 14.5 * ty - t * .47, t * .4, t * .94);
        // Porten til huset
        b.strokeStyle = "#ffd54f";
        b.lineWidth = t * .22;
        b.beginPath();
        b.moveTo(13 * tx, 12.5 * ty);
        b.lineTo(15 * tx, 12.5 * ty);
        b.stroke();
        b.restore();
      }
    }

    function drawGhost(g, t) {
      const { t: u, tx, ty } = geo;
      const r = u * .85;
      const k = GK[g.id];
      ctx.save();
      ctx.translate(g.x * tx, g.y * ty);
      const look = g.dir >= 0 ? [DX[g.dir], DY[g.dir]] : [0, 1];
      const eye = (ex, ey, rx, ry, pr) => {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(ex, ey, rx, ry, 0, 0, 7);
        ctx.fill();
        ctx.fillStyle = "#1b1b9a";
        ctx.beginPath();
        ctx.arc(ex + look[0] * rx * .45, ey + look[1] * ry * .4, pr, 0, 7);
        ctx.fill();
      };
      if (g.mode === "eyes" || g.mode === "entering") {
        eye(-r * .36, -r * .1, r * .28, r * .34, r * .14);
        eye(r * .36, -r * .1, r * .28, r * .34, r * .14);
        ctx.restore();
        return;
      }
      const scared = g.fright;
      const flash = scared && G.frightT < 2 && Math.floor(t * 6) % 2 === 0;
      const body = scared ? (flash ? "#fff" : "#2f4fd8") : k.body;
      if (!scared) {
        if (k.k === "naga") {
          ctx.fillStyle = k.dark;
          ctx.beginPath();
          ctx.ellipse(0, -r * .15, r * 1.28, r * 1.08, 0, 0, 7);
          ctx.fill();
        } else if (k.k === "bandar") {
          for (const s of [-1, 1]) {
            ctx.fillStyle = k.dark;
            ctx.beginPath();
            ctx.arc(s * r * .98, -r * .35, r * .34, 0, 7);
            ctx.fill();
            ctx.fillStyle = k.light;
            ctx.beginPath();
            ctx.arc(s * r * .98, -r * .35, r * .18, 0, 7);
            ctx.fill();
          }
        } else if (k.k === "puli") {
          for (const s of [-1, 1]) {
            ctx.fillStyle = k.body;
            ctx.beginPath();
            ctx.arc(s * r * .66, -r * .98, r * .3, 0, 7);
            ctx.fill();
            ctx.fillStyle = k.dark;
            ctx.beginPath();
            ctx.arc(s * r * .66, -r * .98, r * .15, 0, 7);
            ctx.fill();
          }
        } else {
          ctx.strokeStyle = k.dark;
          ctx.lineWidth = r * .1;
          ctx.lineCap = "round";
          for (const a of [-.5, 0, .5]) {
            ctx.beginPath();
            ctx.moveTo(0, -r * .9);
            ctx.lineTo(Math.sin(a) * r * .9, -r * 1.55);
            ctx.stroke();
            ctx.fillStyle = "#ffd54f";
            ctx.beginPath();
            ctx.arc(Math.sin(a) * r * .9, -r * 1.55, r * .14, 0, 7);
            ctx.fill();
          }
        }
      }
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(0, -r * .12, r, Math.PI, 0);
      ctx.lineTo(r, r * .9);
      const wob = Math.sin(t * 10 + g.id) * r * .08;
      const w = (2 * r) / 3;
      for (let i = 0; i < 3; i++) {
        const x0 = r - i * w;
        ctx.quadraticCurveTo(x0 - w * .25, r * 1.18 + (i % 2 ? wob : -wob), x0 - w * .5, r * .9);
        ctx.quadraticCurveTo(x0 - w * .75, r * .66, x0 - w, r * .9);
      }
      ctx.closePath();
      ctx.fill();
      if (!scared) {
        if (k.k === "bandar") {
          ctx.fillStyle = k.light;
          ctx.beginPath();
          ctx.ellipse(0, r * .12, r * .66, r * .55, 0, 0, 7);
          ctx.fill();
        } else if (k.k === "puli") {
          ctx.strokeStyle = k.dark;
          ctx.lineWidth = r * .13;
          ctx.lineCap = "round";
          for (const s of [-1, 1]) {
            for (const yy of [-.55, -.2, .15]) {
              ctx.beginPath();
              ctx.moveTo(s * r * .98, yy * r);
              ctx.lineTo(s * r * .68, (yy + .08) * r);
              ctx.stroke();
            }
          }
        } else if (k.k === "naga") {
          ctx.fillStyle = "#fde047";
          ctx.beginPath();
          ctx.arc(0, -r * .72, r * .1, 0, 7);
          ctx.fill();
        }
        eye(-r * .36, -r * .2, r * .26, r * .32, r * .13);
        eye(r * .36, -r * .2, r * .26, r * .32, r * .13);
      } else {
        ctx.fillStyle = flash ? "#2f4fd8" : "#ffd9a8";
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.arc(s * r * .34, -r * .22, r * .11, 0, 7);
          ctx.fill();
        }
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = r * .09;
        ctx.beginPath();
        for (let i = 0; i <= 6; i++) {
          const x = -r * .55 + i * (r * 1.1 / 6);
          const y = r * .35 + (i % 2 ? -r * .1 : r * .1);
          if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawPac(t) {
      const { t: u, tx, ty } = geo;
      const r = u * .82;
      ctx.save();
      ctx.translate(pac.x * tx, pac.y * ty);
      let sc = 1;
      let rot = 0;
      if (state === "dying") {
        if (G.freeze > 0) { /* spøgelserne står stille et øjeblik */ } else {
          const p = Math.min(1, pac.dying / 1.2);
          rot = p * Math.PI * 5;
          sc = 1 - p;
          ctx.globalAlpha = 1 - p * .5;
        }
      } else if (state === "won") {
        ctx.translate(0, -Math.abs(Math.sin(t * 9)) * u * .5);
      }
      ctx.rotate(rot);
      ctx.scale(sc, sc);
      const body = ctx.createRadialGradient(-r * .35, -r * .4, r * .1, 0, 0, r * 1.08);
      body.addColorStop(0, "#ffd9a0");
      body.addColorStop(.45, "#ff8a3d");
      body.addColorStop(1, "#d9480f");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, 7);
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, 7);
      ctx.clip();
      ctx.rotate(pac.chew * .4);
      ctx.strokeStyle = "#ffffff47";
      ctx.lineWidth = r * .2;
      for (const k of [-.62, 0, .62]) {
        ctx.beginPath();
        ctx.moveTo(-r, k * r);
        ctx.lineTo(r, k * r);
        ctx.stroke();
      }
      ctx.restore();
      ctx.lineWidth = Math.max(1, u * .12);
      ctx.strokeStyle = "#fff";
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, 7);
      ctx.stroke();
      const lx = (pac.face >= 0 ? DX[pac.face] : 0) * .2 * r;
      const ly = (pac.face >= 0 ? DY[pac.face] : 1) * .14 * r;
      const blink = t % 3.4 < .12;
      for (const s of [-1, 1]) {
        const ex = s * r * .34 + lx;
        const ey = -r * .18 + ly;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(ex, ey, r * .21, blink ? r * .04 : r * .26, 0, 0, 7);
        ctx.fill();
        if (!blink) {
          ctx.fillStyle = "#1c1233";
          ctx.beginPath();
          ctx.arc(ex + lx * .35, ey + ly * .35, r * .11, 0, 7);
          ctx.fill();
        }
      }
      const open = state === "play" && pac.dir >= 0 ? .25 + .75 * Math.abs(Math.sin(pac.chew)) : state === "won" ? 1 : .2;
      ctx.fillStyle = "#5a1c05";
      ctx.beginPath();
      ctx.ellipse(lx * .6, r * .38, r * .22, r * (.05 + .2 * open), 0, 0, 7);
      ctx.fill();
      ctx.restore();
    }

    function drawText(txt, x, y, size, color) {
      ctx.font = `900 ${size}px "Trebuchet MS", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = size * .18;
      ctx.strokeStyle = "#000a";
      ctx.strokeText(txt, x, y);
      ctx.fillStyle = color;
      ctx.fillText(txt, x, y);
    }

    function draw(t) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      if (!G) return;
      const flash = state === "won" && Math.floor(G.wonT / .28) % 2 === 1 ? 1 : 0;
      if (boards[flash]) ctx.drawImage(boards[flash], 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const { t: u, tx, ty, ox, oy } = geo;
      ctx.save();
      ctx.translate(ox, oy);
      const lotus = artImg("lotus:#f472b6");
      if (state !== "won" || flash === 0) {
        for (let y = 0; y < ROWS; y++) {
          for (let x = 0; x < COLS; x++) {
            const d = G.dots[y * COLS + x];
            if (!d) continue;
            const cx = (x + .5) * tx;
            const cy = (y + .5) * ty;
            if (d === 2) {
              const s = u * 1.9 * (1 + .08 * Math.sin(t * 6));
              if (lotus.complete && lotus.naturalWidth) ctx.drawImage(lotus, cx - s / 2, cy - s / 2, s, s);
            } else {
              ctx.fillStyle = "rgba(255,200,80,.25)";
              ctx.beginPath();
              ctx.arc(cx, cy, u * .3, 0, 7);
              ctx.fill();
              ctx.fillStyle = "#ffc94d";
              ctx.beginPath();
              ctx.arc(cx, cy, u * .17, 0, 7);
              ctx.fill();
              ctx.fillStyle = "#fff1a8";
              ctx.beginPath();
              ctx.arc(cx, cy, u * .08, 0, 7);
              ctx.fill();
            }
          }
        }
      }
      if (G.fruit) {
        const fi = artImg(`fruit:${FRUITS[(G.n - 1) % FRUITS.length]}`);
        const s = u * 1.9;
        if (fi.complete && fi.naturalWidth) ctx.drawImage(fi, G.fruit.x * tx - s / 2, G.fruit.y * ty - s / 2 + Math.sin(t * 5) * u * .1, s, s);
      }
      const hideGhosts = state === "won" || (state === "dying" && G.freeze <= 0);
      if (!hideGhosts) for (const g of ghosts) drawGhost(g, t);
      drawPac(t);
      for (const p of particles) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x * tx, p.y * ty, u * p.s, 0, 7);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (const p of popups) drawText(p.txt, p.x * tx, p.y * ty - (1 - p.t) * u, u * 1.1, "#7df9ff");
      if (state === "ready") drawText("KLAR!", 14 * tx, 17.5 * ty, u * 1.9, "#ffe066");
      ctx.restore();
    }

    function update(dt) {
      if (!G || !pac) return;
      time += dt;
      for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 8 * dt; p.life -= dt * 1.2; }
      particles = particles.filter((p) => p.life > 0);
      for (const p of popups) p.t -= dt;
      popups = popups.filter((p) => p.t > 0);
      if (state === "ready") {
        readyT += dt;
        for (const g of ghosts) if (g.mode === "house") { g.anim += dt; g.y = 14.5 + Math.sin(g.anim * 6) * .3; }
        if (readyT >= READY_TIME && $("startHint").hidden) $("startHint").hidden = false;
      } else if (state === "play") {
        if (G.freeze > 0) { G.freeze -= dt; return; }
        playStep(dt);
      } else if (state === "dying") {
        if (G.freeze > 0) { G.freeze -= dt; return; }
        pac.dying += dt;
        if (pac.dying > 1.3) openQuiz("eaten");
      } else if (state === "won") {
        G.wonT += dt;
        if (G.wonT > 2.4) openQuiz("clear");
      }
    }

    let last = performance.now();
    function frame(now) {
      const dt = Math.min(.05, (now - last) / 1000);
      last = now;
      if (screen === "play" && G && !boards[0]) resize();
      if (screen === "play" && SW > 0) {
        update(dt);
        draw(now / 1000);
      }
      requestAnimationFrame(frame);
    }

    // ---------- Swipe ----------
    let drag = null;
    stage.addEventListener("pointerdown", (e) => {
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
      try { stage.setPointerCapture(e.pointerId); } catch { /* ikke vigtigt */ }
    });
    stage.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (Math.hypot(dx, dy) < 18) return;
      swipe(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
      drag.x = e.clientX;
      drag.y = e.clientY;
    });
    const endDrag = () => { drag = null; };
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    document.addEventListener("keydown", (e) => {
      const d = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3, w: 0, d: 1, s: 2, a: 3 }[e.key];
      if (d !== undefined && screen === "play") { e.preventDefault(); swipe(d); }
    });

    // ---------- Indstillinger og start ----------
    function applyRom() {
      const hide = read("rom", "1") === "0";
      for (const el of document.querySelectorAll(".rom, #quizRom")) el.style.display = hide ? "none" : "";
      fitSoon();
    }
    $("optSpeed").value = speedKey;
    $("optChoices").value = read("valg", "auto");
    $("optRom").value = read("rom", "1");
    $("optSpeed").addEventListener("change", (e) => { write("fart", e.target.value); speedKey = e.target.value; });
    $("optChoices").addEventListener("change", (e) => write("valg", e.target.value));
    $("optRom").addEventListener("change", (e) => { write("rom", e.target.value); applyRom(); });
    $("optReset").addEventListener("click", () => {
      nextLevel = 1;
      write("level", 1);
      Topbar.closeMenu();
      if (screen === "play") goHome(); else renderHome();
    });

    $("mascot").addEventListener("click", (e) => { audio(); speak("urundai"); e.currentTarget.animate([{ transform: "scale(1)" }, { transform: "scale(1.15) rotate(8deg)" }, { transform: "scale(1)" }], { duration: 380 }); });
    $("playBtn").addEventListener("click", () => { audio(); runScore = 0; startLevel(nextLevel); });
    $("dictBtn").addEventListener("click", () => { renderDict(); show("dictScreen"); $("dictScreen").scrollTop = 0; });
    $("dictBack").addEventListener("click", () => { stopSpeech(); renderHome(); show("home"); });

    new ResizeObserver(() => { if (screen === "play") resize(); }).observe(stage);
    window.addEventListener("resize", () => { if (screen === "play") resize(); });

    Topbar.init({ kid, controls: [$("settings")] });
    renderHome();
    requestAnimationFrame(frame);

    // Testværktøj: ?l=<bane> åbner en bane direkte. window.__urundai giver adgang til tilstanden, og tick(sek) kører spillet frem.
    const qs = new URLSearchParams(location.search);
    window.__urundai = {
      get G() { return G; }, get pac() { return pac; }, get ghosts() { return ghosts; }, get state() { return state; }, get quiz() { return quiz; },
      swipe, answer, wordState, ws, MAP, closeQuiz, levelStart: startLevel, speak, wordPop, pickWeighted, ALL,
      get audioInfo() { return { unlocked, pendingSpeech, muted, paused: clip.paused, src: clip.src.split("/").pop(), err: clip.error && clip.error.code }; },
      tick(sec) { for (let i = 0; i < sec * 60; i++) update(1 / 60); draw(time); },
      clearAll() { G.dots.fill(0); G.left = 0; win(); },
      kill() { caught(ghosts[0] || { id: 0 }); },
      get stars() { return stars; }
    };
    if (qs.has("l")) startLevel(Math.max(1, Number(qs.get("l")) || 1));
  })();
