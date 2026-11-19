/* Fælles topbar til alle spil: 🏠 hjem, barnets samlede stjerner og ⚙️ indstillinger.
   Brug: Topbar.init({ kid: "ari", controls: [element, ...] }) når siden er indlæst.
   Spillets egne valg (sværhedsgrad osv.) flyttes ind i ⚙️-menuen, så spillets egen kode virker uændret.
   Lyd er én fælles indstilling (regnespil-lyd). Spil lytter på "topbar:sound" eller læser Topbar.soundOn(). */
(function () {
  "use strict";

  // Nye spil skal tilføje deres stjernenøgle her (bruges også af forsiden)
  const STAR_KEYS = {
    ari: ["talbasket-stars", "tabbi-stars", "leo-stars", "maal-stars"],
    riyana: ["prinsesse-stars", "prinsesse-make-stars", "prinsesse-find-stars", "prinsesse-count-stars"]
  };

  const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch { /* ingen lagring */ } };

  function totalStars(kid) {
    let sum = 0;
    for (const key of STAR_KEYS[kid] || []) sum += Number(read(key)) || 0;
    return sum;
  }

  function starLayout(total) {
    return { lit: total > 0 ? ((total - 1) % 10) + 1 : 0, tens: total > 0 ? Math.floor((total - 1) / 10) : 0 };
  }

  let sound = read("regnespil-lyd") !== "0";
  const soundOn = () => sound;

  // ---------- Start altid på forsiden ----------
  // Lægger man en side på hjemmeskærmen (især på iPhone), gemmes adressen på den side, man står på, fx et spil.
  // Ved en frisk start af appen (ny session) sendes man derfor til forsiden. Inde i appen bliver man, hvor man er.
  const standaloneApp = matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: fullscreen)").matches || navigator.standalone === true;
  let freshStart = false;
  try {
    freshStart = !sessionStorage.getItem("regnespil-startet");
    sessionStorage.setItem("regnespil-startet", "1");
  } catch { /* ingen lagring */ }
  if (freshStart && standaloneApp && window.top === window) {
    const inGame = /\/spil\//.test(location.pathname);
    const childPage = /menu\.html$/.test(location.pathname) && location.search;
    if (inGame || childPage) {
      const front = inGame ? "../menu.html" : "menu.html";
      location.replace(new URL(front, location.href).href);
    }
  }

  // ---------- Hold skærmen tændt ----------
  // Screen Wake Lock: skærmen slukker ikke af sig selv, mens appen er åben og synlig. Slippes af browseren, når siden skjules,
  // så den tages igen, når man vender tilbage. Kan slås fra i ⚙️ (regnespil-vaagen = 0).
  let wakeLock = null;
  const wakeSupported = "wakeLock" in navigator;
  const stayAwake = () => read("regnespil-vaagen") !== "0";
  async function requestWake() {
    if (!wakeSupported || wakeLock || !stayAwake() || document.visibilityState !== "visible") return;
    try {
      const lock = await navigator.wakeLock.request("screen");
      wakeLock = lock;
      lock.addEventListener("release", () => { if (wakeLock === lock) wakeLock = null; });
    } catch { /* afvist, fx lavt batteri */ }
  }
  function releaseWake() {
    if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
  }
  if (wakeSupported) {
    requestWake();
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") requestWake(); });
    // Nogle browsere kræver et tryk først
    document.addEventListener("pointerup", requestWake, true);
  }

  // ---------- Fuld skærm ----------
  // Manifestet bruger "standalone" (virker i alle browsere, uden adresselinje). Fuld skærm uden statuslinje kræver et tryk.
  // Siden ligger normalt i en ramme (index.html), så fuld skærm sættes på den ydre side og består, når man skifter spil.
  // Første tryk starter den, medmindre man selv har afsluttet den (⚙️ → Afslut fuld skærm, eller Esc/gesten i samme side).
  let host = window;
  try { if (window.parent !== window && window.parent.document) host = window.parent; } catch { /* anden oprindelse */ }
  const hdoc = host.document;
  const hroot = hdoc.documentElement;
  const requestFs = hroot.requestFullscreen || hroot.webkitRequestFullscreen;
  const exitFs = hdoc.exitFullscreen || hdoc.webkitExitFullscreen;
  const isFull = () => Boolean(hdoc.fullscreenElement || hdoc.webkitFullscreenElement);
  const alreadyFullscreen = matchMedia("(display-mode: fullscreen)").matches;

  function enterFs() {
    try {
      const p = requestFs.call(hroot);
      if (p && p.catch) p.catch(() => { /* afvist */ });
    } catch { /* afvist */ }
  }

  if (requestFs && !alreadyFullscreen) {
    const onChange = () => {
      if (isFull()) return;
      // Uden ramme forsvinder fuld skærm også, når man skifter side. Her er det kun en afslutning, hvis siden stadig er der lidt efter.
      if (host !== window) host.__fsLeft = true;
      else setTimeout(() => { host.__fsLeft = true; }, 400);
    };
    hdoc.addEventListener("fullscreenchange", onChange);
    hdoc.addEventListener("webkitfullscreenchange", onChange);
    document.addEventListener("pointerup", () => {
      if (read("regnespil-fuldskaerm") !== "0" && !host.__fsLeft && !isFull()) enterFs();
    }, true);
  }

  const css = `
:root { --tb-h: calc(54px + env(safe-area-inset-top, 0px)); }
.tb {
  position: fixed; top: 0; left: 0; right: 0; z-index: 90;
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  height: var(--tb-h);
  padding: env(safe-area-inset-top, 0px) max(8px, env(safe-area-inset-right, 0px)) 0 max(8px, env(safe-area-inset-left, 0px));
  background: linear-gradient(180deg, #ffffffee, #ffffffcc);
  border-bottom: 1px solid #ffffffaa;
  border-radius: 0 0 18px 18px;
  box-shadow: 0 4px 16px #1b2f5a2e;
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  font-family: "Trebuchet MS", "Segoe UI", sans-serif;
  color: #27426f;
  -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; touch-action: manipulation;
}
.tb *, .tb *::before, .tb *::after { box-sizing: border-box; }
.tb-btn {
  display: grid; place-items: center; flex: none;
  width: 42px; height: 42px; margin: 0; padding: 0;
  border: 2px solid #dfe7f3; border-radius: 14px;
  background: #fff; color: #27426f;
  font: inherit; font-size: 1.35rem; line-height: 1; text-decoration: none; cursor: pointer;
  box-shadow: 0 3px 8px #243a5a1a;
}
.tb-btn:active { transform: translateY(1px) scale(.97); }
.tb-btn:focus-visible { outline: 3px solid #5b9dff; outline-offset: 2px; }
.tb-btn[aria-expanded="true"] { background: #eaf2ff; border-color: #9ab8e9; }
.tb-stars { display: flex; align-items: center; justify-content: center; gap: 2px; flex: 1 1 auto; min-width: 0; cursor: default; }
.tb-s { position: relative; width: clamp(13px, 3.4vw, 26px); height: auto; flex: none; overflow: visible; }
.tb-s .g { fill: #dfe3ec; stroke: #c5cbd8; stroke-width: 3; stroke-linejoin: round; }
.tb-s .y { fill: url(#tb-gold); stroke: #e08a00; stroke-width: 3; stroke-linejoin: round; opacity: 0; transform-origin: 50% 55%; }
.tb-s.on .y { opacity: 1; filter: drop-shadow(0 0 3px #ffd54f); }
.tb-s.pop { animation: tb-pop 1.1s cubic-bezier(.2, 1.5, .4, 1); z-index: 2; }
@keyframes tb-pop { 0% { transform: scale(.2) rotate(-200deg); } 55% { transform: scale(2.1) rotate(15deg); filter: drop-shadow(0 0 8px #ffd54f); } 100% { transform: scale(1) rotate(0); } }
.tb-trophy { flex: none; margin-left: 4px; color: #8a5a00; font-size: .9rem; font-weight: 900; white-space: nowrap; }
.tb-spark { position: absolute; z-index: 3; pointer-events: none; font-size: 14px; animation: tb-spark .9s ease-out forwards; }
@keyframes tb-spark { from { opacity: 1; transform: translate(-50%, -50%) scale(.4); } to { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.2); } }
.tb-backdrop { position: fixed; inset: 0; z-index: 89; background: #0b1e4a40; }
.tb-panel {
  position: absolute; top: calc(100% + 8px); right: max(8px, env(safe-area-inset-right, 0px));
  width: min(92vw, 400px); max-height: calc(100dvh - var(--tb-h) - 16px); overflow-y: auto; overscroll-behavior: contain;
  padding: 14px; border: 1px solid #dfe7f3; border-radius: 20px; background: #fff;
  box-shadow: 0 18px 44px #1b2f5a55;
  -webkit-overflow-scrolling: touch;
}
.tb-panel[hidden], .tb-backdrop[hidden], .tb [hidden] { display: none !important; }
.tb-slot { display: grid; gap: 8px; }
.tb-slot:empty { display: none; }
.tb-row { display: grid; gap: 8px; margin-top: 10px; }
.tb-slot:empty + .tb-row { margin-top: 0; }
.tb-toggle {
  display: flex; align-items: center; gap: 10px; width: 100%; min-height: 48px; padding: 8px 14px;
  border: 2px solid #dfe7f3; border-radius: 14px; background: #f7faff; color: #27426f;
  font: inherit; font-size: 1rem; font-weight: 800; text-align: left; cursor: pointer;
}
.tb-toggle:active { background: #eaf2ff; }
.tb-close { position: absolute; top: 6px; right: 8px; }
@media (prefers-reduced-motion: reduce) { .tb-s.pop, .tb-spark { animation: none; } }
`;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);

  const STAR_POINTS = "50,3 62,35 97,36 69,57 79,91 50,71 21,91 31,57 3,36 38,35";
  const starSvg = () => `<svg class="tb-s" viewBox="0 0 100 96" aria-hidden="true" focusable="false"><polygon class="g" points="${STAR_POINTS}"/><polygon class="y" points="${STAR_POINTS}"/></svg>`;

  const state = { kid: null, lit: -1, tens: 0, bar: null, stars: null, soundBtn: null, panel: null, gear: null, backdrop: null };

  function paintSound() {
    if (state.soundBtn) state.soundBtn.textContent = sound ? "🔊  Lyd: til" : "🔇  Lyd: fra";
  }

  function setSound(on) {
    sound = on;
    write("regnespil-lyd", on ? "1" : "0");
    paintSound();
    window.dispatchEvent(new CustomEvent("topbar:sound", { detail: { on } }));
  }

  function spark(star) {
    const host = state.stars;
    for (let k = 0; k < 7; k++) {
      const s = document.createElement("span");
      const angle = (k / 7) * Math.PI * 2 + Math.random() * .4;
      const dist = 22 + Math.random() * 22;
      s.className = "tb-spark";
      s.textContent = k % 2 ? "✨" : "⭐";
      s.style.left = `${star.offsetLeft + star.offsetWidth / 2}px`;
      s.style.top = `${star.offsetTop + star.offsetHeight / 2}px`;
      s.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      s.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
      host.append(s);
      setTimeout(() => s.remove(), 950);
    }
  }

  // Tegner barnets samlede stjerner. bump = true animerer den nyeste stjerne (kald efter en stjerne er gemt).
  function refreshStars(bump) {
    if (!state.kid || !state.stars) return;
    const total = totalStars(state.kid);
    const { lit, tens } = starLayout(total);
    const grew = bump && state.lit >= 0 && (lit > state.lit || tens > state.tens);
    state.stars.querySelectorAll(".tb-s").forEach((s, i) => s.classList.toggle("on", i < lit));
    let trophy = state.stars.querySelector(".tb-trophy");
    if (tens) {
      if (!trophy) { trophy = document.createElement("span"); trophy.className = "tb-trophy"; state.stars.append(trophy); }
      trophy.textContent = `🏆×${tens}`;
    } else if (trophy) trophy.remove();
    state.stars.setAttribute("aria-label", `Stjerner i alt: ${total}`);
    if (grew && lit > 0) {
      const star = state.stars.querySelectorAll(".tb-s")[lit - 1];
      star.classList.remove("pop");
      void star.getBoundingClientRect();
      star.classList.add("pop");
      spark(star);
    }
    state.lit = lit;
    state.tens = tens;
  }

  function closeMenu() {
    if (!state.panel || state.panel.hidden) return;
    state.panel.hidden = true;
    state.backdrop.hidden = true;
    state.gear.setAttribute("aria-expanded", "false");
    state.gear.textContent = "⚙️";
  }

  function openMenu() {
    state.panel.hidden = false;
    state.backdrop.hidden = false;
    state.gear.setAttribute("aria-expanded", "true");
    state.gear.textContent = "✕";
    window.dispatchEvent(new CustomEvent("topbar:menu", { detail: { open: true } }));
  }

  function init(opts) {
    if (state.bar) return;
    const kid = opts && STAR_KEYS[opts.kid] ? opts.kid : "ari";
    state.kid = kid;

    const bar = document.createElement("div");
    bar.className = "tb";
    bar.innerHTML = `
      <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
        <linearGradient id="tb-gold" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffe66d"/><stop offset="1" stop-color="#ffb300"/></linearGradient>
      </defs></svg>
      <a class="tb-btn tb-home" href="${opts && opts.home ? opts.home : "../menu.html"}?barn=${kid}" aria-label="Alle spil" title="Alle spil">🏠</a>
      <div class="tb-stars" role="img" aria-label="Stjerner i alt">${Array.from({ length: 10 }, starSvg).join("")}</div>
      <button class="tb-btn tb-gear" type="button" aria-expanded="false" aria-haspopup="true" aria-label="Indstillinger" title="Indstillinger">⚙️</button>
      <div class="tb-panel" role="dialog" aria-label="Indstillinger" hidden>
        <div class="tb-slot"></div>
        <div class="tb-row">
          <button class="tb-toggle tb-sound" type="button"></button>
          <button class="tb-toggle tb-awake" type="button" hidden></button>
          <button class="tb-toggle tb-full" type="button" hidden>⛶  Fuld skærm</button>
        </div>
      </div>`;
    const backdrop = document.createElement("div");
    backdrop.className = "tb-backdrop";
    backdrop.hidden = true;

    document.body.prepend(bar);
    document.body.prepend(backdrop);
    state.bar = bar;
    state.backdrop = backdrop;
    state.stars = bar.querySelector(".tb-stars");
    state.panel = bar.querySelector(".tb-panel");
    state.gear = bar.querySelector(".tb-gear");
    state.soundBtn = bar.querySelector(".tb-sound");

    // Spillets egne valg flyttes ind i menuen (de beholder deres knapper og lyttere)
    const slot = bar.querySelector(".tb-slot");
    for (const el of (opts && opts.controls) || []) if (el) { el.hidden = false; slot.append(el); }

    paintSound();
    state.soundBtn.addEventListener("click", () => setSound(!sound));

    const awakeBtn = bar.querySelector(".tb-awake");
    if (wakeSupported) {
      awakeBtn.hidden = false;
      const paintAwake = () => { awakeBtn.textContent = stayAwake() ? "💡  Skærmen holdes tændt" : "🌙  Skærmen må slukke"; };
      paintAwake();
      awakeBtn.addEventListener("click", () => {
        write("regnespil-vaagen", stayAwake() ? "0" : "1");
        if (stayAwake()) requestWake(); else releaseWake();
        paintAwake();
      });
    }

    const fsBtn = bar.querySelector(".tb-full");
    if (requestFs && !alreadyFullscreen) {
      fsBtn.hidden = false;
      const sync = () => { fsBtn.textContent = isFull() ? "✕  Afslut fuld skærm" : "⛶  Fuld skærm"; };
      fsBtn.addEventListener("click", async () => {
        try {
          if (isFull()) {
            host.__fsLeft = true;
            write("regnespil-fuldskaerm", "0");
            await exitFs.call(hdoc);
          } else {
            host.__fsLeft = false;
            write("regnespil-fuldskaerm", "1");
            enterFs();
          }
        } catch { /* fuld skærm blev afvist */ }
        closeMenu();
      });
      hdoc.addEventListener("fullscreenchange", sync);
      hdoc.addEventListener("webkitfullscreenchange", sync);
      sync();
    }

    state.gear.addEventListener("click", () => (state.panel.hidden ? openMenu() : closeMenu()));
    backdrop.addEventListener("click", closeMenu);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
    // Andre sider (en anden fane) kan ændre stjerner
    window.addEventListener("storage", () => refreshStars(false));
    window.addEventListener("pageshow", () => refreshStars(false));

    refreshStars(false);
  }

  window.Topbar = { STAR_KEYS, totalStars, starLayout, init, refreshStars, closeMenu, soundOn };
})();
