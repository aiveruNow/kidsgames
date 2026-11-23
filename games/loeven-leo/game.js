    const WORD_SETS = LoevenOrd.sets;

    const FRIENDS = [
      { id: "elefant", name: "ELEFANT", e: "🐘", c: "#9fb3c8" },
      { id: "giraf", name: "GIRAF", e: "🦒", c: "#f2b84b" },
      { id: "abe", name: "ABE", e: "🐒", c: "#b9774a" },
      { id: "papegoeje", name: "PAPEGØJE", e: "🦜", c: "#e5484d" },
      { id: "flodhest", name: "FLODHEST", e: "🦛", c: "#a58ab8" },
      { id: "skildpadde", name: "SKILDPADDE", e: "🐢", c: "#4fae6b" },
      { id: "zebra", name: "ZEBRA", e: "🦓", c: "#7d8aa0" },
      { id: "krokodille", name: "KROKODILLE", e: "🐊", c: "#3f9b5a" },
      { id: "naesehorn", name: "NÆSEHORN", e: "🦏", c: "#8f9aa8" },
      { id: "flamingo", name: "FLAMINGO", e: "🦩", c: "#ff7fa8", rare: true },
      { id: "panda", name: "PANDA", e: "🐼", c: "#6b7a8f", rare: true },
      { id: "leopard", name: "LEOPARD", e: "🐆", c: "#e0a030", rare: true },
      { id: "kaenguru", name: "KÆNGURU", e: "🦘", c: "#c98a52" },
      { id: "koala", name: "KOALA", e: "🐨", c: "#9aa5b5" },
      { id: "pingvin", name: "PINGVIN", e: "🐧", c: "#4b6fa8" },
      { id: "frosk", name: "FROSK", e: "🐸", c: "#52b85a" },
      { id: "sommerfugl", name: "SOMMERFUGL", e: "🦋", c: "#4f9dff" },
      { id: "mariehoene", name: "MARIEHØNE", e: "🐞", c: "#e5484d" },
      { id: "bi", name: "BI", e: "🐝", c: "#f5c518" },
      { id: "pindsvin", name: "PINDSVIN", e: "🦔", c: "#9b7653" },
      { id: "paafugl", name: "PÅFUGL", e: "🦚", c: "#1aa3a3", rare: true },
      { id: "firben", name: "FIRBEN", e: "🦎", c: "#7bc043" },
      { id: "kamel", name: "KAMEL", e: "🐫", c: "#d6a35c" },
      { id: "tiger", name: "TIGER", e: "🐯", c: "#f08a24" }
    ];

    const GOAL = 10;
    const KING = 12;
    const $ = id => document.getElementById(id);
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const load = (key, fallback) => { try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; } };
    const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ingen lagring */ } };

    // Alle starter på trinnet med 2 bogstaver, én gang; derefter gemmes det valgte niveau
    const startTwoApplied = load("leo-start-2-v1", false);
    let size = startTwoApplied && [2, 3, 4, 5].includes(load("leo-size", 2)) ? load("leo-size", 2) : 2;
    if (!startTwoApplied) {
      save("leo-size", 2);
      save("leo-phonics-default-v1", true);
      save("leo-start-2-v1", true);
    }
    let WORDS = WORD_SETS[size];
    let stars = load("leo-stars", 0);
    let friends = load("leo-friends", {});
    let order = load("leo-order", []);
    let misses = load("leo-misses", {});
    let delivered = load("leo-delivered", 0);
    let progress = Math.max(0, Math.min(Number(load("leo-progress", 0)) || 0, GOAL - 1));
    let trailFriendId = load("leo-trail-friend", load("leo-egg", ""));
    let muted = !Topbar.soundOn();
    let streak = 0;
    let target = null;
    let choices = [];
    let wrong = 0;
    let locked = true;
    let gold = false;
    let recent = [];
    let idleTimer = 0;
    let ghostTimer = 0;
    let runId = 0;
    let drag = null;

    const delay = ms => new Promise(resolve => setTimeout(resolve, reduceMotion ? Math.min(ms, 50) : ms));
    const pick = list => list[Math.floor(Math.random() * list.length)];
    const shuffle = list => {
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      return list;
    };
    const distinct = () => Object.keys(friends).filter(id => friends[id] > 0).length;
    const friendOf = id => FRIENDS.find(f => f.id === id);

    // ---------- Lyd ----------
    let ac;
    function audio() {
      if (muted) return null;
      if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { ac = null; } }
      if (ac && ac.state === "suspended") ac.resume();
      return ac;
    }

    function tone(freq, at, dur, type = "triangle", vol = .16) {
      const ctx = audio();
      if (!ctx) return;
      const t = ctx.currentTime + at;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + .05);
    }

    const chime = () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .09, .28));
    const oops = () => { tone(330, 0, .2, "sine", .12); tone(262, .15, .3, "sine", .12); };
    const nam = () => { tone(520, 0, .09, "sine", .22); tone(330, .08, .12, "sine", .2); };
    const fanfare = () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * .11, .35, "triangle", .18));

    function roarSound(big) {
      const ctx = audio();
      if (!ctx) return;
      const dur = big ? 1.5 : .8;
      const t = ctx.currentTime;
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(900, t);
      filter.frequency.exponentialRampToValueAtTime(260, t + dur);
      gain.gain.setValueAtTime(.0001, t);
      gain.gain.exponentialRampToValueAtTime(.3, t + .08);
      gain.gain.exponentialRampToValueAtTime(.0001, t + dur);
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 26;
      lfoGain.gain.value = .09;
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

    let daVoice = null;
    function findVoice() {
      if (!("speechSynthesis" in window)) return;
      daVoice = speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith("da")) || null;
    }
    findVoice();
    if ("speechSynthesis" in window) speechSynthesis.addEventListener("voiceschanged", findVoice);

    // Ordklip afspilles lokalt; øvrige replikker bruger enhedens stemme eller netoplæsning.
    const clipWords = new Set(LoevenOrd.allClips());
    const clips = new Map();
    function clip(text) {
      const key = text.toUpperCase();
      if (!clips.has(key)) {
        const el = new Audio(`audio/${LoevenOrd.clipFile(key)}`);
        el.preload = "auto";
        clips.set(key, el);
      }
      return clips.get(key);
    }

    function playClip(text) {
      const key = text.toUpperCase();
      if (!clipWords.has(key)) return Promise.resolve(false);
      return new Promise(resolve => {
        const el = clip(key);
        let settled = false;
        const finish = played => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          el.onended = null;
          el.onerror = null;
          resolve(played);
        };
        const timer = setTimeout(() => finish(false), 4000);
        el.onended = () => finish(true);
        el.onerror = () => finish(false);
        el.currentTime = 0;
        el.play().catch(() => finish(false));
      });
    }

    const onlineClips = new Map();
    function sayOnline(text) {
      return new Promise(resolve => {
        const key = text.toLowerCase();
        if (!onlineClips.has(key)) {
          const el = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=da&q=${encodeURIComponent(key)}`);
          el.preload = "auto";
          onlineClips.set(key, el);
        }
        const el = onlineClips.get(key);
        el.onended = resolve;
        el.onerror = resolve;
        el.currentTime = 0;
        el.play().catch(resolve);
        setTimeout(resolve, 4000);
      });
    }

    function sayWithDeviceVoice(text, rate) {
      return new Promise(resolve => {
        if (!daVoice) findVoice();
        if (!daVoice) return sayOnline(text).then(resolve);
        const u = new SpeechSynthesisUtterance(text.toLowerCase());
        u.voice = daVoice;
        u.lang = daVoice.lang;
        u.rate = rate;
        u.pitch = 1.1;
        u.onend = resolve;
        u.onerror = resolve;
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
        setTimeout(resolve, 3500);
      });
    }

    function say(text, rate = .8) {
      if (muted) return Promise.resolve();
      return playClip(text).then(played => played ? undefined : sayWithDeviceVoice(text, rate));
    }

    // ---------- Scene ----------
    const sceneCard = $("sceneCard");
    const scene = $("scene");
    const leo = $("leo");
    const NS = "http://www.w3.org/2000/svg";

    function buildMane() {
      const mane = $("mane");
      const base = document.createElementNS(NS, "circle");
      base.setAttribute("cx", 100);
      base.setAttribute("cy", 108);
      base.setAttribute("r", 62);
      base.setAttribute("fill", "#c9741f");
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

    function updateLeo() {
      const f = Math.min(1, distinct() / KING);
      $("maneScale").style.transform = `scale(${0.7 + 0.45 * f})`;
      leo.classList.toggle("crowned", distinct() >= KING);
    }

    function react(className, ms) {
      leo.classList.remove("jump", "roar", "sad", "chew");
      void leo.getBoundingClientRect();
      leo.classList.add(className);
      setTimeout(() => leo.classList.remove(className), ms);
    }

    function leoRoar(big) {
      leo.classList.add("open");
      react("roar", 1000);
      roarSound(big);
      setTimeout(() => leo.classList.remove("open"), big ? 1500 : 800);
    }

    function bubble(text) {
      const el = $("bubble");
      el.textContent = text;
      el.classList.remove("pop");
      void el.offsetWidth;
      el.classList.add("pop");
    }

    function pickTrailFriend() {
      const fresh = FRIENDS.filter(f => !friends[f.id]);
      trailFriendId = pick(fresh.length ? fresh : FRIENDS).id;
      save("leo-trail-friend", trailFriendId);
      $("trailFriend").textContent = friendOf(trailFriendId).e;
    }

    function moveLeoAlongTrail(p) {
      const x = 26 + Math.min(p, GOAL) / GOAL * 278;
      $("leoSpot").setAttribute("transform", `translate(${x} 92) scale(.96)`);
    }

    function setTrailProgress(p) {
      const ratio = p / GOAL;
      $("trailFriend").classList.toggle("peek", p >= 4 && p < GOAL);
      $("trailGoal").classList.toggle("found", p >= GOAL);
      $("trailGlow").style.opacity = String(p >= GOAL ? .9 : .12 + ratio * .62);
      moveLeoAlongTrail(p);
      [...$("sceneTrail").children].forEach((step, i) => {
        step.classList.toggle("done", i < p);
        step.classList.toggle("current", i === p && p < GOAL);
      });
    }

    function renderFriends() {
      const g = $("friends");
      g.replaceChildren();
      order.slice(-4).forEach((id, i) => {
        const f = friendOf(id);
        if (!f) return;
        const t = document.createElementNS(NS, "text");
        t.setAttribute("x", 270 + i * 50);
        t.setAttribute("y", 292 + (i % 2) * 6);
        t.setAttribute("class", "pal");
        t.style.animationDelay = `${-i * .6}s`;
        t.textContent = f.e;
        g.append(t);
      });
    }

    function leoZoneContains(x, y) {
      const r = $("leoZone").getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    }

    function mouthCenter() {
      const r = $("mouthPt").getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    function lookAt(x, y) {
      const m = mouthCenter();
      const clamp = v => Math.max(-1, Math.min(1, v));
      $("eyes").style.transform = x == null ? "" : `translate(${clamp((x - m.x) / 90) * 4}px, ${clamp((y - m.y + 40) / 90) * 3}px)`;
    }

    // ---------- Visning ----------
    function buildPath() {
      const path = $("path");
      path.replaceChildren();
      const sceneTrail = $("sceneTrail");
      sceneTrail.replaceChildren();
      for (let i = 0; i < GOAL; i++) {
        const dot = document.createElement("span");
        dot.className = `dot${i === progress ? " current" : ""}`;
        dot.textContent = "🐾";
        path.append(dot);

        const x = 210 + i * 29;
        const y = i % 2 ? 245 : 263;
        const step = document.createElementNS(NS, "g");
        step.classList.add("scene-step");
        step.setAttribute("transform", `translate(${x} ${y}) rotate(${i % 2 ? 22 : -22})`);
        const pad = document.createElementNS(NS, "ellipse");
        pad.setAttribute("cx", "0");
        pad.setAttribute("cy", "2");
        pad.setAttribute("rx", "5");
        pad.setAttribute("ry", "7");
        step.append(pad);
        for (const [tx, ty] of [[-5, -7], [0, -10], [5, -7]]) {
          const toe = document.createElementNS(NS, "circle");
          toe.setAttribute("cx", String(tx));
          toe.setAttribute("cy", String(ty));
          toe.setAttribute("r", "2.5");
          step.append(toe);
        }
        sceneTrail.append(step);
      }
    }

    function updatePath() {
      [...$("path").children].forEach((dot, i) => {
        dot.classList.toggle("done", i < progress);
        dot.classList.toggle("current", i === progress && progress < GOAL);
      });
      $("path").setAttribute("aria-label", `${progress} af ${GOAL} ord, følg fodsporene`);
      setTrailProgress(progress);
    }

    function updateStats() {
      $("friendCount").textContent = `${distinct()}/${FRIENDS.length}`;
      for (const btn of document.querySelectorAll(".size")) {
        const n = Number(btn.dataset.size);
        btn.setAttribute("aria-pressed", n === size);
      }
    }

    function confetti(count = 36) {
      if (reduceMotion) return;
      const symbols = ["⭐", "🌟", "🎉", "🍃", "🐾", "✨"];
      for (let i = 0; i < count; i++) {
        const el = document.createElement("span");
        el.className = "confetti";
        el.textContent = pick(symbols);
        el.style.left = `${Math.random() * 100}vw`;
        document.body.append(el);
        const drift = (Math.random() - .5) * 160;
        const anim = el.animate([
          { transform: "translate(0, 0) rotate(0)", opacity: 1 },
          { transform: `translate(${drift}px, 105vh) rotate(${Math.random() * 720 - 360}deg)`, opacity: .9 }
        ], { duration: 1600 + Math.random() * 1400, delay: Math.random() * 400, easing: "ease-in" });
        anim.onfinish = () => el.remove();
      }
    }

    function setIdleNudge() {
      clearTimeout(idleTimer);
      $("readBtn").classList.remove("nudge");
      idleTimer = setTimeout(() => $("readBtn").classList.add("nudge"), 9000);
    }

    function showGhost() {
      clearTimeout(ghostTimer);
      $("ghost").classList.remove("on");
      if (delivered >= 4) return;
      ghostTimer = setTimeout(() => $("ghost").classList.add("on"), 1800);
    }

    // ---------- Ord ----------
    function nextTarget() {
      const pool = WORDS.filter(w => !recent.includes(w[0]));
      const list = pool.length ? pool : WORDS;
      const weights = list.map(w => 1 + Math.min(3, misses[w[0]] || 0) * 2);
      let r = Math.random() * weights.reduce((a, b) => a + b, 0);
      for (let i = 0; i < list.length; i++) {
        r -= weights[i];
        if (r <= 0) return list[i];
      }
      return list[list.length - 1];
    }

    function pickChoices(word) {
      const initial = w => w[0][0];
      const others = WORDS.filter(w => w !== word);
      const picks = [];
      if (distinct() >= 3) {
        const similar = others.filter(w => initial(w) === initial(word));
        if (similar.length) picks.push(pick(similar));
      }
      for (const w of shuffle(others.slice())) {
        if (picks.length >= 2) break;
        if (picks.includes(w)) continue;
        if (distinct() < 3 && initial(w) === initial(word)) continue;
        picks.push(w);
      }
      return shuffle([word, ...picks]);
    }

    function newWord() {
      runId++;
      target = nextTarget();
      recent.push(target[0]);
      recent = recent.slice(-Math.min(10, WORDS.length - 6));
      choices = pickChoices(target);
      wrong = 0;
      locked = false;
      gold = progress > 0 && Math.random() < .12;
      $("wordcard").classList.toggle("gold", gold);

      const letters = $("letters");
      letters.style.setProperty("--n", target[0].length);
      letters.classList.remove("all");
      letters.replaceChildren(...[...target[0]].map(ch => {
        const tile = document.createElement("div");
        tile.className = "letter";
        tile.textContent = ch;
        return tile;
      }));

      $("choices").replaceChildren(...choices.map((w, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pic";
        btn.dataset.index = i;
        const art = LoevenArt.get(w[0]);
        if (art) btn.innerHTML = art;
        else btn.textContent = w[1];
        btn.setAttribute("aria-label", `Billede ${i + 1}`);
        return btn;
      }));

      if (!muted) clip(target[0]);
      bubble(gold ? "Et guldord! Dobbelt stjerne!" : pick(["Hvad står der?", "Find det rigtige billede!", "Hvilket billede passer?"]));
      setIdleNudge();
      showGhost();
    }

    async function readWord() {
      const id = runId;
      const word = target[0];
      const tiles = [...$("letters").children];
      $("readBtn").classList.remove("nudge");
      setIdleNudge();
      tiles.forEach(l => l.classList.remove("lit"));
      $("letters").classList.remove("all");
      for (const tile of tiles) {
        tile.classList.add("lit");
        await delay(420);
        tile.classList.remove("lit");
        if (id !== runId) return;
      }
      $("letters").classList.add("all");
      await say(word);
    }

    function hintCorrect() {
      $("choices").children[choices.indexOf(target)]?.classList.add("hint");
    }

    // ---------- Træk og aflever ----------
    function makeFlyer(btn, rect, small) {
      const f = btn.cloneNode(true);
      f.className = "pic flyer";
      f.removeAttribute("data-index");
      const s = small ? Math.min(rect.width, 104) : rect.width;
      const left = small ? small.x - s / 2 : rect.left;
      const top = small ? small.y - s / 2 : rect.top;
      Object.assign(f.style, { left: `${left}px`, top: `${top}px`, width: `${s}px`, height: `${s}px`, fontSize: `${s * .42}px` });
      document.body.append(f);
      btn.classList.add("lifted");
      return f;
    }

    const center = r => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

    function fly(el, frames, ms, easing = "ease-in-out") {
      const anim = el.animate(frames, { duration: reduceMotion ? 1 : ms, easing, fill: "forwards" });
      return anim.finished.catch(() => {});
    }

    async function deliver(index, flyer) {
      locked = true;
      clearTimeout(idleTimer);
      clearTimeout(ghostTimer);
      $("ghost").classList.remove("on");
      $("readBtn").classList.remove("nudge");
      delivered++;
      save("leo-delivered", delivered);
      const btn = $("choices").children[index];
      const home = center(btn.getBoundingClientRect());
      const from = center(flyer.getBoundingClientRect());
      const mouth = mouthCenter();
      const toMouth = `translate(${mouth.x - from.x}px, ${mouth.y - from.y}px)`;
      leo.classList.add("open");
      await fly(flyer, [
        { transform: "translate(0, 0) scale(1) rotate(0)" },
        { transform: `${toMouth} scale(.22) rotate(28deg)`, opacity: .9 }
      ], 380, "cubic-bezier(.5, 0, .8, .6)");

      if (choices[index] === target) {
        flyer.remove();
        btn.classList.remove("lifted");
        btn.classList.add("eaten");
        leo.classList.remove("open");
        react("chew", 700);
        nam();
        await onCorrect();
      } else {
        react("sad", 700);
        oops();
        bubble(pick(["Bleh! Det er ikke det!", "Øv, det smager ikke rigtigt!", "Hov! Prøv et andet."]));
        setTimeout(() => leo.classList.remove("open"), 350);
        await fly(flyer, [
          { transform: `${toMouth} scale(.22) rotate(28deg)` },
          { transform: `translate(${(mouth.x + home.x) / 2 - from.x}px, ${Math.min(mouth.y, home.y) - from.y - 90}px) scale(1.05) rotate(-22deg)` },
          { transform: `translate(${home.x - from.x}px, ${home.y - from.y}px) scale(1) rotate(0)` }
        ], 650, "cubic-bezier(.3, .6, .4, 1)");
        flyer.remove();
        btn.classList.remove("lifted");
        btn.classList.add("wrong");
        await onWrong();
      }
    }

    async function returnFlyer(d) {
      const from = center(d.flyer.getBoundingClientRect());
      const home = center(d.btn.getBoundingClientRect());
      await fly(d.flyer, [
        { transform: "translate(0, 0)" },
        { transform: `translate(${home.x - from.x}px, ${home.y - from.y}px)` }
      ], 320, "cubic-bezier(.3, 1.4, .5, 1)");
      d.flyer.remove();
      d.btn.classList.remove("lifted");
    }

    function endDrag(e) {
      if (!drag || e.pointerId !== drag.pointerId) return;
      const d = drag;
      drag = null;
      sceneCard.classList.remove("dragging", "over");
      lookAt(null);
      if (!d.moved) {
        deliver(d.index, makeFlyer(d.btn, d.rect));
      } else if (e.type !== "pointercancel" && leoZoneContains(e.clientX, e.clientY)) {
        deliver(d.index, d.flyer);
      } else {
        leo.classList.remove("open");
        returnFlyer(d);
      }
    }

    $("choices").addEventListener("pointerdown", e => {
      const btn = e.target.closest(".pic");
      if (!btn || locked || drag || e.button > 0 || btn.classList.contains("wrong")) return;
      e.preventDefault();
      audio();
      $("ghost").classList.remove("on");
      clearTimeout(ghostTimer);
      const rect = btn.getBoundingClientRect();
      drag = { btn, index: Number(btn.dataset.index), rect, startX: e.clientX, startY: e.clientY, pointerId: e.pointerId, moved: false, flyer: null };
    });

    window.addEventListener("pointermove", e => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) > 8) {
        drag.moved = true;
        drag.flyer = makeFlyer(drag.btn, drag.rect, { x: e.clientX, y: e.clientY });
        drag.size = drag.flyer.getBoundingClientRect().width;
        sceneCard.classList.add("dragging");
      }
      if (!drag.moved) return;
      drag.flyer.style.left = `${e.clientX - drag.size / 2}px`;
      drag.flyer.style.top = `${e.clientY - drag.size / 2}px`;
      const over = leoZoneContains(e.clientX, e.clientY);
      sceneCard.classList.toggle("over", over);
      leo.classList.toggle("open", over);
      lookAt(e.clientX, e.clientY);
    });

    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    // Tastatur: Enter eller mellemrum på et billede
    $("choices").addEventListener("click", e => {
      const btn = e.target.closest(".pic");
      if (!btn || e.detail !== 0 || locked || btn.classList.contains("wrong")) return;
      audio();
      deliver(Number(btn.dataset.index), makeFlyer(btn, btn.getBoundingClientRect()));
    });

    // ---------- Spilforløb ----------
    async function onCorrect() {
      const id = runId;
      const word = target[0];
      const firstTry = wrong === 0;
      progress++;
      save("leo-progress", progress);
      updatePath();
      react("jump", 700);
      chime();
      $("letters").classList.add("all");

      let gain = 0;
      let message = firstTry ? pick(["Det er rigtigt!", "Flot læst!", "Du er dygtig!", "Yes!"]) : "Godt klaret!";
      if (gold) {
        gain = 2;
        message = "Guldord! ⭐⭐";
        confetti(20);
      } else if (firstTry) {
        gain = 1;
      }
      if (firstTry) {
        streak++;
        if (misses[word]) { misses[word]--; save("leo-misses", misses); }
        if (streak % 3 === 0) {
          gain++;
          message = `${streak} i træk! Brøl-bonus! 🦁`;
          setTimeout(() => leoRoar(false), 350);
          confetti(24);
        }
      } else {
        streak = 0;
      }
      if (gain) {
        stars += gain;
        save("leo-stars", stars);
        Topbar.refreshStars(true);
      }
      updateStats();
      bubble(message);

      if (progress >= GOAL) {
        await say(word);
        await delay(300);
        if (id === runId) await discoverFriend();
        return;
      }
      await Promise.all([say(word), delay(1700)]);
      if (id === runId) newWord();
    }

    async function onWrong() {
      wrong++;
      streak = 0;
      misses[target[0]] = (misses[target[0]] || 0) + 1;
      save("leo-misses", misses);
      if (wrong >= 2) {
        bubble("Lyt, så læser jeg ordet!");
        await readWord();
        hintCorrect();
      } else {
        say("Prøv igen");
        setIdleNudge();
      }
      locked = false;
    }

    // ---------- Spor og venner ----------
    async function discoverFriend() {
      locked = true;
      const friend = friendOf(trailFriendId) || FRIENDS[0];
      const before = distinct();
      const isNew = !friends[friend.id];
      friends[friend.id] = (friends[friend.id] || 0) + 1;
      if (isNew) order.push(friend.id);
      stars += 3;
      save("leo-friends", friends);
      save("leo-order", order);
      save("leo-stars", stars);
      save("leo-progress", 0);
      const king = before < KING && distinct() >= KING;

      bubble("Vi fandt en ven!");
      fanfare();
      confetti(60);
      leoRoar(false);
      await delay(900);

      $("discoveryEmoji").textContent = friend.e;
      $("discoveryRibbon").textContent = friend.rare ? "✨ Sjælden ven!" : isNew ? "Ny ven!" : "Din ven kom igen!";
      $("discoveryRibbon").classList.toggle("rare", Boolean(friend.rare));
      const name = $("discoveryName");
      name.style.setProperty("--n", friend.name.length);
      name.replaceChildren(...[...friend.name].map((ch, i) => {
        const tile = document.createElement("div");
        tile.className = "letter";
        tile.style.animationDelay = `${.5 + i * .09}s`;
        tile.textContent = ch;
        return tile;
      }));
      $("discoveryInfo").textContent = isNew ? `Ven nr. ${distinct()} af ${FRIENDS.length}` : `Nu har du ${friends[friend.id]} af dem!`;
      $("kingNote").hidden = !king;
      $("discovery").hidden = false;
      updateStats();
      Topbar.refreshStars(true);
      say(friend.name);
      if (king) setTimeout(() => leoRoar(true), 1200);
      $("discovery").dataset.friend = friend.id;
    }

    function afterDiscovery(openBook) {
      const id = $("discovery").dataset.friend;
      $("discovery").hidden = true;
      progress = 0;
      pickTrailFriend();
      updatePath();
      renderFriends();
      updateLeo();
      updateStats();
      bubble("Følg de nye spor, Ari!");
      newWord();
      if (openBook) showBook(id);
    }

    function showBook(newId) {
      const grid = $("bookGrid");
      grid.replaceChildren(...FRIENDS.map(f => {
        const have = friends[f.id] > 0;
        const slot = document.createElement("div");
        slot.className = `slot${have ? "" : " locked"}${f.rare ? " rare" : ""}${f.id === newId ? " new" : ""}`;
        slot.innerHTML = `<span class="em">${f.e}</span><span>${have ? f.name : "???"}</span>`;
        if (have && friends[f.id] > 1) {
          const cnt = document.createElement("span");
          cnt.className = "cnt";
          cnt.textContent = `×${friends[f.id]}`;
          slot.append(cnt);
        }
        if (have) {
          slot.addEventListener("click", () => {
            slot.classList.remove("hop");
            void slot.offsetWidth;
            slot.classList.add("hop");
            audio();
            say(f.name);
          });
        }
        return slot;
      }));
      $("bookCount").textContent = `${distinct()}/${FRIENDS.length}`;
      $("book").hidden = false;
    }

    function setSize(n) {
      if (n === size && target) return;
      size = n;
      WORDS = WORD_SETS[size];
      save("leo-size", size);
      recent = [];
      streak = 0;
      updateStats();
      bubble(`Nu læser vi ord med ${size} bogstaver!`);
      newWord();
    }

    window.addEventListener("topbar:sound", e => {
      muted = !e.detail.on;
      if (muted && "speechSynthesis" in window) speechSynthesis.cancel();
    });

    document.querySelector(".sizes").addEventListener("click", e => {
      const btn = e.target.closest(".size");
      if (btn && !locked) setSize(Number(btn.dataset.size));
    });
    $("readBtn").addEventListener("click", () => { audio(); readWord(); });
    $("letters").addEventListener("click", () => { audio(); readWord(); });
    $("bookBtn").addEventListener("click", () => showBook());
    $("bookClose").addEventListener("click", () => { $("book").hidden = true; });
    $("book").addEventListener("click", e => { if (e.target === $("book")) $("book").hidden = true; });
    $("discoveryNext").addEventListener("click", () => afterDiscovery(false));
    $("discoveryBook").addEventListener("click", () => afterDiscovery(true));
    leo.addEventListener("click", () => { audio(); leoRoar(false); });

    buildMane();
    buildPath();
    if (!friendOf(trailFriendId)) pickTrailFriend();
    else $("trailFriend").textContent = friendOf(trailFriendId).e;
    updatePath();
    renderFriends();
    updateLeo();
    updateStats();
    Topbar.init({ kid: "ari", controls: [document.querySelector(".sizes")] });
    newWord();
