// Fælles kode til de fire prinsessespil (Lær tallene, Smykkeskrinet, Find tallet, Hvor mange?):
// lyd, tale, effekter, stjerner, talområde og de små hjælpere. Hvert spil har sin egen runde i sin egen mappe
// og starter med startGame({ id, round, leave }) til sidst i sin HTML-fil.
// Skal indlæses efter topbar.js og replikker.js (alle ord og sætninger står i replikker.js).
const R = PrinsesseReplikker;
const L = R.lines;
const W = R.numbers;
const THINGS = R.things;
const ACC = R.accessories;
const PRAISE = R.praise;

const $ = (s, r = document) => r.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rnd = a => a[Math.floor(Math.random() * a.length)];
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ingen lagring */ } }
};

const MAX_NUM = 20;   // højeste tal, man kan vælge i ⚙️
const S = {
  stars: 0,
  max: Math.min(MAX_NUM, Math.max(2, Number(store.get("prinsesse-max", 3)) || 3)),
  learnMax: Math.min(MAX_NUM, Math.max(3, Number(store.get("prinsesse-learn-max", 10)) || 10)),
  muted: !Topbar.soundOn(),
  streak: 0,
  last: -1
};
let MODE = "";          // spillets id: learn, make, find eller count (sættes af startGame)
let STAR_KEY = "";
let ROUND = null;       // starter en ny runde i det aktuelle spil
let LEAVE = null;       // spillets oprydning, når skærmen skifter
const view = $("#view");
let ver = 0;            // bruges til at afbryde igangværende forløb ved skærmskift
let started = false;
let askSpeech = "";

/* ---------- Baggrund ---------- */
(function buildBackground() {
  const bg = $("#bg");
  for (let i = 0; i < 5; i++) {
    const c = document.createElement("div");
    c.className = "cloud";
    c.style.top = `${6 + i * 17 + Math.random() * 6}%`;
    c.style.transform = `scale(${.7 + Math.random() * .8})`;
    c.style.animationDuration = `${70 + i * 28}s`;
    c.style.animationDelay = `${-Math.random() * 90}s`;
    bg.append(c);
  }
  for (let i = 0; i < 16; i++) {
    const t = document.createElement("span");
    t.className = "tw";
    t.textContent = i % 3 ? "✨" : "⭐";
    t.style.left = `${Math.random() * 96}%`;
    t.style.top = `${Math.random() * 92}%`;
    t.style.animationDelay = `${-Math.random() * 3}s`;
    t.style.animationDuration = `${2 + Math.random() * 3}s`;
    bg.append(t);
  }
})();

/* ---------- Lyd ---------- */
let ac;
function audioOk() {
  if (S.muted) return false;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === "suspended") ac.resume().catch(() => {});
    return ac.state === "running";
  } catch { return false; }
}
function tone(f, d = .18, type = "sine", vol = .16, delay = 0, slideTo = 0) {
  if (!audioOk()) return;
  try {
    const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + d);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + .015);
    g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g); g.connect(ac.destination);
    o.start(t); o.stop(t + d + .02);
  } catch { /* ingen lyd */ }
}
function noise(d = .15, vol = .1, delay = 0, type = "highpass", from = 2500, to = 0) {
  if (!audioOk()) return;
  try {
    const t = ac.currentTime + delay;
    const buf = ac.createBuffer(1, Math.max(1, Math.floor(ac.sampleRate * d)), ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buf;
    const flt = ac.createBiquadFilter();
    flt.type = type;
    flt.frequency.setValueAtTime(from, t);
    if (to) flt.frequency.exponentialRampToValueAtTime(to, t + d);
    const g = ac.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + .01);
    g.gain.exponentialRampToValueAtTime(.001, t + d);
    src.connect(flt); flt.connect(g); g.connect(ac.destination);
    src.start(t);
  } catch { /* ingen lyd */ }
}
const SCALE = [262, 294, 330, 392, 440, 523, 587, 659, 784, 880, 1047];
const sfx = {
  tick() { tone(1100, .05, "triangle", .035); },
  note(n) { tone(SCALE[Math.min(n, 10)], .26, "triangle", .17); tone(SCALE[Math.min(n, 10)] * 2, .18, "sine", .05, .05); },
  pick() { tone(500, .1, "triangle", .12, 0, 900); },
  clink(n) { tone(SCALE[Math.min(n, 10)] * 2, .35, "sine", .12); tone(SCALE[Math.min(n, 10)] * 3, .25, "sine", .05, .03); },
  balloon() { noise(.14, .16, 0, "highpass", 1500); tone(380, .14, "sine", .14, 0, 90); },
  oops() { tone(300, .2, "sine", .13); tone(240, .25, "sine", .13, .12); },
  giggle() { [660, 880, 740, 990].forEach((f, i) => tone(f, .09, "triangle", .1, i * .08)); },
  chest() { tone(160, .14, "square", .1, 0, 90); noise(.5, .06, .12, "highpass", 5000); [1047, 1319, 1568].forEach((f, i) => tone(f, .4, "sine", .08, .15 + i * .09)); },
  win() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .3, "triangle", .15, i * .09)); tone(2093, .5, "sine", .05, .5); },
  whoosh() { noise(.3, .08, 0, "bandpass", 400, 2400); }
};

/* ---------- Tale: indtalte lydklip (som i Farvehaven), enhedens stemme som reserve ---------- */
let daVoice = null;
function findVoice() {
  if (!("speechSynthesis" in window)) return;
  daVoice = speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith("da")) || null;
}
findVoice();
if ("speechSynthesis" in window) speechSynthesis.addEventListener("voiceschanged", findVoice);

const clipAudio = new Audio();
clipAudio.preload = "auto";
let voiceToken = 0;
let endCurrent = null;   // afslutter den igangværende sætning, hvis den afbrydes

function stopSpeech() {
  voiceToken++;
  try { speechSynthesis.cancel(); } catch { /* ingen tale */ }
  clipAudio.onended = null;
  clipAudio.onerror = null;
  clipAudio.pause();
  const end = endCurrent;
  endCurrent = null;
  if (end) end();
}

// Siger en sætning eller flere efter hinanden. Svaret er klar, når alt er sagt (eller kunne ikke sagt).
function speak(text) {
  const parts = Array.isArray(text) ? text : [text];
  return new Promise(res => {
    if (S.muted) { setTimeout(res, 450); return; }
    stopSpeech();
    const token = voiceToken;
    let done = false;
    const fin = () => { if (!done) { done = true; if (endCurrent === fin) endCurrent = null; res(); } };
    endCurrent = fin;
    setTimeout(fin, 2500 + parts.join(" ").length * 140);

    const deviceVoice = rest => {
      if (token !== voiceToken || !daVoice) { fin(); return; }
      try {
        const u = new SpeechSynthesisUtterance(rest.join(" "));
        u.voice = daVoice; u.lang = daVoice.lang; u.rate = .88;
        u.onend = fin; u.onerror = fin;
        speechSynthesis.speak(u);
      } catch { fin(); }
    };

    const next = i => {
      if (token !== voiceToken) { fin(); return; }
      if (i >= parts.length) { fin(); return; }
      let handled = false;
      const fail = () => { if (!handled) { handled = true; deviceVoice(parts.slice(i)); } };
      clipAudio.onended = () => { if (!handled) { handled = true; next(i + 1); } };
      clipAudio.onerror = fail;
      clipAudio.src = `../prinsesse-tal/lyd/${R.clipFile(parts[i])}`;
      const p = clipAudio.play();
      if (p && typeof p.catch === "function") p.catch(fail);
    };
    next(0);
  });
}

window.addEventListener("topbar:sound", e => {
  S.muted = !e.detail.on;
  if (S.muted) stopSpeech();
});

/* ---------- Effekter ---------- */
function burst(x, y, list = ["✨", "💖", "⭐"], n = 9, far = 110) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    const a = (i / n) * Math.PI * 2 + Math.random() * .5;
    const d = far * (.5 + Math.random() * .6);
    s.className = "sp";
    s.textContent = rnd(list);
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    s.style.setProperty("--dx", `${Math.cos(a) * d}px`);
    s.style.setProperty("--dy", `${Math.sin(a) * d - 20}px`);
    $("#fx").append(s);
    setTimeout(() => s.remove(), 1000);
  }
}
function burstEl(el, list, n, far) {
  const r = el.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, list, n, far);
}

// Alle tryk giver et lille glimt og en blød lyd
let lastTap = 0;
document.addEventListener("pointerdown", e => {
  if (!started || e.target.closest(".tb, .tb-backdrop, #start")) return;
  const now = performance.now();
  if (now - lastTap < 140) return;
  lastTap = now;
  burst(e.clientX, e.clientY, ["✨"], 3, 38);
  sfx.tick();
}, true);

function confetti(n = 24) {
  const fx = $("#fx"), E = ["💖", "✨", "⭐", "👑", "💎", "🎀", "🌸"];
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "conf";
    s.textContent = rnd(E);
    s.style.left = Math.random() * 100 + "%";
    s.style.fontSize = 1.4 + Math.random() * 1.6 + "rem";
    s.style.animationDuration = 1.4 + Math.random() * 1.2 + "s";
    s.style.animationDelay = Math.random() * .3 + "s";
    fx.append(s);
    setTimeout(() => s.remove(), 3200);
  }
}

function showPop(big, text) {
  return new Promise(res => {
    const p = $("#pop");
    p.innerHTML = `<div class="popbox"><div class="popbig">${big}</div><div class="poptext">${text}</div></div>`;
    p.hidden = false;
    confetti(34);
    sfx.win();
    let done = false;
    const end = () => { if (!done) { done = true; p.hidden = true; res(); } };
    p.onclick = end;
    speak(text).then(() => setTimeout(end, 500));
    setTimeout(end, 4500);
  });
}

function avatarDo(cls) {
  const a = $("#av");
  if (!a) return;
  a.classList.remove("cheer", "oops");
  void a.offsetWidth;
  a.classList.add(cls);
}

/* ---------- Hjælpere ---------- */
const phrase = L.amount;
// Talfarverne gentager sig efter ti
const cc = n => ((n - 1) % 10) + 1;
const chip = n => `<span class="chip c${cc(n)}">${n}</span>`;

function pick() {
  const p = [];
  for (let i = 1; i <= S.max; i++) if (i !== S.last) p.push(i);
  return (S.last = rnd(p));
}

// Altid mindst tre valg, så der er noget at vælge imellem
function choices(n) {
  const top = Math.max(3, S.max);
  const all = [];
  for (let i = 1; i <= top; i++) if (i !== n) all.push(i);
  const s = [n];
  while (s.length < 3 && all.length) s.push(all.splice(Math.floor(Math.random() * all.length), 1)[0]);
  return s.sort(() => Math.random() - .5);
}

function items(n, t, { hide = false, tappable = false } = {}) {
  const row = document.createElement("div");
  row.className = "items" + (tappable ? " tappable" : "") + (n > 10 ? " many" : "");
  for (let i = 0; i < n; i++) {
    const s = document.createElement("button");
    s.type = "button";
    s.className = "it" + (hide ? " hid" : "");
    s.style.setProperty("--k", i);
    s.textContent = t.e;
    s.setAttribute("aria-label", `${t.sg} ${i + 1}`);
    row.append(s);
  }
  return row;
}

async function reward(v, first, line) {
  avatarDo("cheer"); confetti(); sfx.win();
  S.stars++;
  const unlock = S.stars % 3 === 0 && S.stars / 3 <= ACC.length ? ACC[S.stars / 3 - 1] : null;
  let levelUp = false;
  if (first) {
    if (++S.streak >= 3 && S.max < 10) { S.max++; S.streak = 0; levelUp = true; paintMax(); }
  } else S.streak = 0;
  store.set(STAR_KEY, S.stars);
  store.set("prinsesse-max", S.max);
  Topbar.refreshStars(true);
  await speak(line);
  if (v !== ver) return false;
  if (unlock) { await showPop(unlock.e, L.unlock(unlock)); if (v !== ver) return false; }
  if (levelUp) { await showPop(S.max, L.moreNumbers); if (v !== ver) return false; }
  return true;
}

async function countAloud(v, row) {
  let i = 0;
  for (const el of row.querySelectorAll(".it")) {
    i++;
    el.classList.remove("hid");
    el.classList.add("pop");
    sfx.note(i);
    burstEl(el, ["✨"], 5, 60);
    await speak(W[i]);
    if (v !== ver) return false;
    await sleep(100);
  }
  return true;
}

const dance = row => row.querySelectorAll(".it").forEach(el => { el.classList.remove("pop", "hop"); void el.offsetWidth; el.classList.add("dance"); });

/* ---------- Navigation og opsætning ---------- */
function go() {
  if (!started) return;
  ver++;
  if (LEAVE) LEAVE();
  stopSpeech();
  $("#pop").hidden = true;
  ROUND();
}

// Talområdet vælges i ⚙️-menuen. "Lær tallene" har sit eget (standard 1–10), de andre lege har deres (stiger af sig selv op til 10).
const paintMax = () => { $("#maxN").textContent = MODE === "learn" ? S.learnMax : S.max; };
const stepMax = d => {
  if (MODE === "learn") {
    S.learnMax = Math.min(MAX_NUM, Math.max(3, S.learnMax + d));
    store.set("prinsesse-learn-max", S.learnMax);
  } else {
    S.max = Math.min(MAX_NUM, Math.max(2, S.max + d));
    S.streak = 0;
    store.set("prinsesse-max", S.max);
  }
  paintMax();
  go();
};

function scaffold() {
  const got = Math.min(ACC.length, Math.floor(S.stars / 3));
  // Samlingen af prinsessting: det nyeste lyser op
  const collect = MODE !== "learn"
    ? `<div class="collect" aria-label="Dine prinsessting">${ACC.map((a, i) => `<span class="${i < got ? (i === got - 1 && S.stars % 3 === 0 ? "new" : "") : "locked"}">${a.e}</span>`).join("")}</div>`
    : "";
  view.innerHTML = `
    <div class="ask">
      <button class="avatar" id="av" type="button" aria-label="Prinsesse Riyana">👸</button>
      <button class="bubble" id="again" type="button"><span class="spk">🔊</span><span id="askText"></span></button>
    </div>
    ${collect}
    <div class="stage" id="stage"></div>`;
  $("#again").addEventListener("click", () => speak(askSpeech));
  $("#av").addEventListener("click", e => {
    avatarDo("cheer");
    sfx.giggle();
    burstEl(e.currentTarget, ["💖", "✨", "⭐"], 8, 90);
  });
  return $("#stage");
}

function ask(html, speech, say = true) {
  $("#askText").innerHTML = html;
  askSpeech = speech;
  return say ? speak(speech) : Promise.resolve();
}

/* ---------- Start ---------- */
// Hvert spil kalder denne til sidst: id (learn, make, find, count), round (starter en runde) og leave (valgfri oprydning)
function startGame({ id, round, leave }) {
  MODE = id;
  STAR_KEY = `prinsesse-${MODE}-stars`;
  ROUND = round;
  LEAVE = leave || null;
  S.stars = Number(store.get(STAR_KEY, 0)) || 0;

  $("#sMaxDown").addEventListener("click", () => stepMax(-1));
  $("#sMaxUp").addEventListener("click", () => stepMax(1));
  paintMax();

  Topbar.init({ kid: "riyana", controls: [$("#settings")] });

  function begin() {
    started = true;
    audioOk();
    $("#start").hidden = true;
    go();
  }
  $("#start").addEventListener("click", () => { sfx.giggle(); begin(); });
  // ?start springer startskærmen over (bruges til test)
  if (new URLSearchParams(location.search).has("start")) begin();
}
