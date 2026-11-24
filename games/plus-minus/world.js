// Talbasket: verdenskort, bogen om kontinenter og lande, oplæsning og kort over dyr og steder i billedet.
// Data: geo.js (TalbasketGeo), flag: flags.js (TalbasketFlag), kortets former: map.js (TalbasketMap).
// game.js giver adgang til spillets tilstand via TalbasketWorld.init({ ... }).
(function () {
  "use strict";
  const Geo = window.TalbasketGeo;
  const Flag = window.TalbasketFlag;
  const MapData = window.TalbasketMap;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Farver pr. kontinent (kortet, bogen og kortets knapper)
  const COLORS = {
    europa: "#38bdf8", afrika: "#fbbf24", asien: "#fb7185", nordamerika: "#34d399",
    sydamerika: "#a3e635", australien: "#fb923c", antarktis: "#bae6fd"
  };

  let api = null;
  const idxOf = (id) => Geo.continents.findIndex((c) => c.id === id);

  // ---------- Oplæsning ----------
  // Mobiler tillader kun lyd, når afspilleren er "låst op" af en berøring.
  const clip = new Audio();
  clip.preload = "auto";
  const SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
  let unlocked = false;
  let token = 0;
  let current = null;

  function unlockAudio() {
    if (unlocked) return;
    unlocked = true;
    try {
      clip.src = SILENT;
      const p = clip.play();
      if (p && p.catch) p.catch((err) => { if (err && err.name === "NotAllowedError") unlocked = false; });
    } catch { unlocked = false; }
  }
  for (const ev of ["pointerdown", "touchend", "keydown"]) document.addEventListener(ev, unlockAudio, true);

  const soundOn = () => (window.Topbar && Topbar.soundOn ? Topbar.soundOn() : true);

  function stopSpeech() {
    token++;
    clip.onended = clip.onerror = clip.ontimeupdate = null;
    try { clip.pause(); } catch { /* ingen lyd */ }
    if (window.speechSynthesis) { try { speechSynthesis.cancel(); } catch { /* ingen tale */ } }
    if (current) {
      const done = current;
      current = null;
      if (done.onstop) done.onstop();
    }
  }

  // Afspiller audio/<file>.mp3; findes klippet ikke, læser enhedens danske stemme teksten.
  // hooks: onstart(), onprogress(0..1), onend(ok), onstop()
  function speak(file, text, hooks = {}) {
    stopSpeech();
    const mine = ++token;
    const entry = { onstop: hooks.onstop };
    current = entry;
    const end = (ok) => {
      if (mine !== token) return;
      current = null;
      if (hooks.onend) hooks.onend(ok);
    };
    if (!soundOn()) { if (hooks.onstart) hooks.onstart(); setTimeout(() => end(true), 700); return; }

    const viaVoice = () => {
      if (mine !== token) return;
      if (!window.speechSynthesis || !text) { end(false); return; }
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "da-DK";
        u.rate = .92;
        const voice = speechSynthesis.getVoices().find((v) => /^da/i.test(v.lang));
        if (voice) u.voice = voice;
        u.onstart = () => { if (mine === token && hooks.onstart) hooks.onstart(); };
        u.onend = () => end(true);
        u.onerror = () => end(false);
        speechSynthesis.speak(u);
      } catch { end(false); }
    };

    clip.onended = () => { if (hooks.onprogress) hooks.onprogress(1); end(true); };
    clip.onerror = viaVoice;
    clip.ontimeupdate = () => {
      if (mine === token && hooks.onprogress && clip.duration) hooks.onprogress(clip.currentTime / clip.duration);
    };
    clip.src = `audio/${file}.mp3`;
    const p = clip.play();
    if (hooks.onstart) hooks.onstart();
    if (p && p.catch) {
      p.catch((err) => {
        if (mine !== token) return;
        if (err && err.name === "NotAllowedError") { unlocked = false; end(false); } else viaVoice();
      });
    }
  }

  // ---------- Flag ----------
  const flagSvg = (id, cls = "") => (Flag && Flag.svg ? Flag.svg(id, `class="flag ${cls}" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice"`) : "");
  const isFlagged = (c) => c.kind !== "place";
  const mark = (c, cls = "") => (isFlagged(c) ? flagSvg(c.id, cls) : `<span class="place-emoji ${cls}" aria-hidden="true">${c.emoji}</span>`);

  // ---------- Verdenskort ----------
  const SVGNS = "http://www.w3.org/2000/svg";
  function renderHome() {
    const st = api.state();
    const svg = $("worldMap");
    if (!svg || !MapData) return;
    const pins = MapData.order.map((id) => MapData.continents[id].pin);
    let s = `
      <defs>
        <radialGradient id="oc" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#14508a"/><stop offset="1" stop-color="#071c36"/></radialGradient>
      </defs>
      <rect class="ocean" x="-700" y="-500" width="2400" height="1500" fill="url(#oc)"/>
      <g class="grid" fill="none" stroke="#ffffff" stroke-opacity=".07" stroke-width="1">
        ${[-300, -200, -100, 0, 100, 200, 300, 400, 500, 600, 700, 800].map((y) => `<path d="M-700 ${y}H1700"/>`).join("")}
        ${[-500, -375, -250, -125, 0, 125, 250, 375, 500, 625, 750, 875, 1000, 1125, 1250, 1375, 1500].map((x) => `<path d="M${x} -500V1000"/>`).join("")}
      </g>`;
    // Ruten mellem kontinenterne, man har besøgt
    let route = "";
    for (let i = 0; i < st.unlocked; i++) {
      const a = pins[i], b = pins[i + 1];
      route += `M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - 70} ${b.x} ${b.y} `;
    }
    if (route) s += `<path class="route" d="${route}" fill="none" stroke="#fde68a" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/>`;
    MapData.order.forEach((id, i) => {
      const c = MapData.continents[id];
      const g = Geo.continent(id);
      const stateName = i < st.unlocked ? "done" : i === st.unlocked ? "current" : "locked";
      const total = Geo.countriesOf(id).length;
      const found = api.found(i);
      const label = stateName === "locked" ? "🔒" : g.emoji;
      const aria = `${g.name}${stateName === "locked" ? ", låst" : `, ${found} af ${total} fundet`}`;
      s += `<g class="mc ${stateName}" data-cont="${id}" tabindex="0" role="button" aria-label="${esc(aria)}" style="--c:${COLORS[id] || "#38bdf8"}">
        <path class="mc-shape" d="${c.d}"/>
        <text class="mc-emoji" x="${c.label.x}" y="${c.label.y - 6}" text-anchor="middle">${label}</text>
        <text class="mc-name" x="${c.label.x}" y="${c.label.y + 18}" text-anchor="middle">${esc(g.name.replace(" og Oceanien", ""))}</text>
        ${stateName === "locked" ? "" : `<text class="mc-count" x="${c.label.x}" y="${c.label.y + 36}" text-anchor="middle">${found}/${total}</text>`}
      </g>`;
    });
    const cur = MapData.continents[MapData.order[st.current]];
    if (cur) s += `<g class="pin" transform="translate(${cur.pin.x} ${cur.pin.y})"><text class="pin-ico" text-anchor="middle" y="-4">📍</text></g>`;
    if (st.unlocked > 0) {
      const a = pins[st.unlocked - 1], b = pins[st.unlocked];
      s += `<text class="plane" font-size="30" text-anchor="middle"><animateMotion dur="5.5s" repeatCount="indefinite" path="M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - 70} ${b.x} ${b.y}"/>✈️</text>`;
    }
    svg.innerHTML = s;

    // Knapper under kortet: nemmere at ramme end kortets små kontinenter på en telefon
    $("contChips").innerHTML = MapData.order.map((id, i) => {
      const g = Geo.continent(id);
      const stateName = i < st.unlocked ? "done" : i === st.unlocked ? "current" : "locked";
      const total = Geo.countriesOf(id).length;
      return `<button class="cc ${stateName}" type="button" data-cont="${id}" style="--c:${COLORS[id] || "#38bdf8"}"><span class="cc-emo">${stateName === "locked" ? "🔒" : g.emoji}</span><span class="cc-name">${esc(g.name.replace(" og Oceanien", ""))}</span>${stateName === "locked" ? "" : `<small>${api.found(i)}/${total}</small>`}</button>`;
    }).join("");

    const all = Geo.countries.length;
    let foundAll = 0;
    Geo.continents.forEach((c, i) => { foundAll += api.found(i); });
    $("passCount").textContent = String(foundAll);
    $("passOf").textContent = `af ${all} lande`;
    const cont = Geo.continents[st.current];
    $("playBtnTxt").textContent = st.complete ? "Spil igen" : `Spil basket i ${cont.name.replace(" og Oceanien", "")}`;
    $("bookBtnTxt").textContent = `📖 Bogen om ${cont.name.replace(" og Oceanien", "")}`;
    $("mapHint").textContent = st.complete ? "Du har rejst jorden rundt! Tryk på et kontinent for at læse igen." : "Tryk på et kontinent for at høre og lære mere";
  }

  function onMapPick(id) {
    const st = api.state();
    const i = idxOf(id);
    if (i > st.unlocked) {
      const need = Geo.continents[st.unlocked].name.replace(" og Oceanien", "");
      $("mapHint").textContent = `🔒 Find alle landene i ${need} først, så åbner ${Geo.continent(id).name.replace(" og Oceanien", "")}`;
      const el = document.querySelector(`#worldMap [data-cont="${id}"]`);
      if (el) { el.classList.remove("shake"); void el.getBBox(); el.classList.add("shake"); }
      api.sfx("wrong");
      return;
    }
    api.sfx("click");
    openBook(id);
  }

  // ---------- Bogen ----------
  const book = { cont: null, view: "home", id: null, onClose: null, speaking: null, passport: false };

  const dots = (i) => Geo.continents.map((_, n) => `<i class="${n < i ? "done" : n === i ? "on" : ""}"></i>`).join("");

  function setPlayState(btn, on) {
    if (!btn) return;
    btn.classList.toggle("speaking", on);
    if (!on) { const bar = btn.querySelector(".bar"); if (bar) bar.style.width = "0"; }
  }

  function playFor(btn, file, text) {
    // Et tryk på den knap, der taler, stopper oplæsningen
    if (btn && btn.classList.contains("speaking")) { stopSpeech(); return; }
    clearSpeaking();
    book.speaking = btn;
    speak(file, text, {
      onstart: () => { if (btn) setPlayState(btn, true); },
      onprogress: (p) => { const bar = btn && btn.querySelector(".bar"); if (bar) bar.style.width = `${Math.round(p * 100)}%`; },
      onend: () => { if (btn) setPlayState(btn, false); },
      onstop: () => { if (btn) setPlayState(btn, false); }
    });
  }
  function clearSpeaking() {
    for (const el of document.querySelectorAll("#book .speaking")) setPlayState(el, false);
  }

  function openBook(contId, countryId, opts = {}) {
    book.cont = contId;
    book.passport = false;
    book.onClose = opts.onClose || null;
    book.view = "home";
    book.id = null;
    $("book").hidden = false;
    renderBook();
    if (countryId) showDetail("country", countryId);
  }

  function openPassport() {
    book.cont = null;
    book.passport = true;
    book.view = "home";
    $("book").hidden = false;
    renderBook();
  }

  function closeBook() {
    stopSpeech();
    $("book").hidden = true;
    const fn = book.onClose;
    book.onClose = null;
    if (fn) fn();
    else renderHome();
  }

  function renderBook() {
    const card = document.querySelector("#book .card");
    card.classList.remove("detail");
    $("bkDetail").hidden = true;
    $("bkHome").hidden = false;
    const st = api.state();
    if (book.passport) {
      card.style.setProperty("--acc", "#fde68a");
      $("bkEyebrow").textContent = "Mit rejsepas";
      $("bkDots").innerHTML = "";
      $("bkTitle").textContent = "Lande jeg har fundet";
      let total = 0, foundAll = 0;
      Geo.continents.forEach((c, i) => { total += Geo.countriesOf(c.id).length; foundAll += api.found(i); });
      $("bkStats").innerHTML = `<span class="chip">🛂 ${foundAll} af ${total} lande</span>`;
      $("bkIntro").hidden = true;
      $("bkPlay").hidden = true;
      $("bkProgFill").style.width = `${Math.round(foundAll / total * 100)}%`;
      $("bkProgText").textContent = `${foundAll} af ${total}`;
      let h = "";
      Geo.continents.forEach((c, i) => {
        const list = Geo.countriesOf(c.id);
        const f = api.found(i);
        h += `<section class="bk-sec" style="--acc:${COLORS[c.id]}"><h4>${c.emoji} ${esc(c.name)} <small>${i > st.unlocked ? "🔒 låst" : `${f} af ${list.length}`}</small></h4><div class="stamps">`;
        list.forEach((co, n) => {
          const open = n < f;
          h += open
            ? `<button class="stamp" type="button" data-open="${c.id}:${co.id}">${mark(co)}<span>${esc(co.name)}</span></button>`
            : `<span class="stamp locked" aria-label="Ikke fundet endnu"><i>?</i><span>&nbsp;</span></span>`;
        });
        h += `</div></section>`;
      });
      $("bkHome").innerHTML = h;
      return;
    }

    const c = Geo.continent(book.cont);
    const i = idxOf(book.cont);
    const list = Geo.countriesOf(c.id);
    const found = api.found(i);
    card.style.setProperty("--acc", COLORS[c.id] || "#38bdf8");
    $("bkEyebrow").textContent = `Kontinent ${i + 1} af ${Geo.continents.length}`;
    $("bkDots").innerHTML = dots(i);
    $("bkTitle").textContent = c.name;
    $("bkStats").innerHTML = c.stats.map((s) => `<span class="chip"><b>${s.icon}</b> ${esc(s.label)}: ${esc(s.value)}</span>`).join("");
    $("bkIntro").hidden = false;
    $("bkIntroTxt").textContent = `Hør om ${c.name.replace(" og Oceanien", "")}`;
    $("bkProgFill").style.width = `${Math.round(found / list.length * 100)}%`;
    $("bkProgText").textContent = `${found} af ${list.length} ${list[0].kind === "place" ? "steder" : "lande"} fundet`;
    const playable = i <= st.unlocked;
    $("bkPlay").hidden = !playable;
    $("bkPlayTxt").textContent = i === st.unlocked && !st.complete ? `Spil basket i ${c.name.replace(" og Oceanien", "")}` : `Spil i ${c.name.replace(" og Oceanien", "")}`;

    const place = list[0].kind === "place";
    let h = `<section class="bk-sec"><h4>${place ? "Steder" : "Lande"} <small>${found === list.length ? "alle fundet 🎉" : "skyd dig frem til de næste"}</small></h4><div class="bk-grid">`;
    list.forEach((co, n) => {
      if (n < found) {
        h += `<button class="tile" type="button" style="--i:${n}" data-kind="country" data-id="${co.id}"><span class="tile-art">${mark(co)}</span><span class="tile-name">${esc(co.name)}</span></button>`;
      } else {
        h += `<span class="tile locked" style="--i:${n}" aria-label="Ikke fundet endnu"><span class="tile-art"><i>?</i></span><span class="tile-name">${n === found ? "Næste: skyd " + Math.max(1, api.toNext()) + " mere" : "Låst"}</span></span>`;
      }
    });
    h += `</div></section>`;
    h += `<section class="bk-sec"><h4>Dyr <small>tryk for at møde dem</small></h4><div class="bk-grid animals">`;
    c.animals.forEach((a, n) => {
      h += `<button class="tile animal" type="button" style="--i:${n}" data-kind="animal" data-id="${a.id}"><span class="tile-art"><span class="emo">${a.emoji}</span></span><span class="tile-name">${esc(a.name)}</span></button>`;
    });
    h += `</div></section>`;
    h += `<section class="bk-sec"><h4>Kendte steder</h4><div class="bk-grid places">`;
    c.landmarks.forEach((a, n) => {
      h += `<button class="tile animal" type="button" style="--i:${n}" data-kind="landmark" data-id="${a.id}"><span class="tile-art"><span class="emo">${a.emoji}</span></span><span class="tile-name">${esc(a.name)}</span></button>`;
    });
    h += `</div></section>`;
    h += `<section class="bk-sec"><h4>Vidste du det?</h4><div class="facts">`;
    c.facts.forEach((f, n) => {
      h += `<button class="fact" type="button" data-fact="${n}"><span class="fact-ico">💡</span><span class="fact-txt">${esc(f.text)}</span><span class="wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span></button>`;
    });
    h += `</div></section>`;
    $("bkHome").innerHTML = h;
    $("bkBody").scrollTop = 0;
  }

  // Liste over det, man kan bladre i fra et givent emne
  function siblings(kind) {
    const c = Geo.continent(book.cont);
    if (kind === "country") {
      const found = api.found(idxOf(book.cont));
      return Geo.countriesOf(c.id).slice(0, found);
    }
    return kind === "animal" ? c.animals : c.landmarks;
  }

  function showDetail(kind, id) {
    stopSpeech();
    book.view = "detail";
    book.kind = kind;
    book.id = id;
    const card = document.querySelector("#book .card");
    card.classList.add("detail");
    $("bkHome").hidden = true;
    const box = $("bkDetail");
    box.hidden = false;
    const c = Geo.continent(book.cont);
    const list = siblings(kind);
    const n = list.findIndex((x) => x.id === id);
    const item = list[n] || list[0];
    let h = `<div class="dt-hero">
      <button class="dt-btn back" type="button" data-act="back">← <span>${kind === "country" ? (c.id === "antarktis" ? "Alle steder" : "Alle lande") : "Tilbage"}</span></button>
      <span class="dt-btn count">${n + 1} / ${list.length}</span>
      ${list.length > 1 ? `<button class="dt-nav prev" type="button" data-act="prev" aria-label="Forrige">‹</button><button class="dt-nav next" type="button" data-act="next" aria-label="Næste">›</button>` : ""}`;
    if (kind === "country") h += `<div class="dt-art flagart">${mark(item, "big")}</div>`;
    else h += `<div class="dt-art"><span class="emo big">${item.emoji}</span></div>`;
    h += `</div><div class="dt-info">`;
    if (kind === "country") {
      h += `<div class="dt-name"><h3>${esc(item.name)}</h3>${item.kind === "place" ? "" : `<p class="dt-sub">${esc(c.name.replace(" og Oceanien", ""))}</p>`}</div>
        <button class="play" type="button" data-play="intro"><span class="ico"><svg class="pl" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg><svg class="pa" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg></span><span class="lbl"><span>Hør om ${esc(item.name)}</span><small>Lyt og lær</small></span><span class="wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="bar"></span></button>
        <p class="dt-text">${esc(item.intro)}</p>
        <div class="dt-tiles">${item.tiles.map((t, k) => `<button class="dtile" type="button" data-tile="${k}"><span class="dtile-ico">${t.icon}</span><span class="dtile-lbl">${esc(t.label)}</span><span class="dtile-val">${esc(t.value)}</span><span class="wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span></button>`).join("")}</div>
        <p class="dt-sec">Specialiteter</p>
        <div class="specials">${item.specials.map((s, k) => `<button class="spec" type="button" data-spec="${k}"><span>${s.icon}</span>${esc(s.label)}</button>`).join("")}</div>
        <div class="say" id="dtSay" hidden></div>`;
      if (item.hello) h += `<button class="hello" type="button" data-hello="1"><span class="hello-lbl">Sig hej</span><b>${esc(item.hello.text)}</b></button>`;
      const an = (item.animals || []).map((aid) => c.animals.find((a) => a.id === aid)).filter(Boolean);
      if (an.length) h += `<p class="dt-sec">Dyr her</p><div class="specials">${an.map((a) => `<button class="spec" type="button" data-open-animal="${a.id}"><span>${a.emoji}</span>${esc(a.name)}</button>`).join("")}</div>`;
    } else {
      h += `<div class="dt-name"><h3>${esc(item.name)}</h3><p class="dt-sub">${esc(item.where || "")}</p></div>
        <button class="play" type="button" data-play="fact"><span class="ico"><svg class="pl" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg><svg class="pa" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg></span><span class="lbl"><span>Hør fakta</span><small>Lyt og lær</small></span><span class="wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="bar"></span></button>
        <p class="dt-text">${esc(item.fact)}</p>`;
    }
    h += `</div>`;
    box.innerHTML = h;
    $("bkBody").scrollTop = 0;
    if (kind !== "country") { /* dyr og steder læses først, når barnet trykker */ }
  }

  function detailItem() {
    return siblings(book.kind).find((x) => x.id === book.id);
  }

  function showHello(item) {
    const say = $("dtSay");
    if (!say) return;
    say.hidden = false;
    say.innerHTML = `<b>${esc(item.hello.text)}</b> betyder hej i ${esc(item.name)}.`;
  }

  // Alle tryk i bogen
  $("book").addEventListener("click", (e) => {
    const t = e.target.closest("button, [data-open]");
    if (!t) return;
    if (t.id === "bkClose") { api.sfx("click"); closeBook(); return; }
    if (t.id === "bkPlay") { const id = book.cont; api.sfx("click"); stopSpeech(); $("book").hidden = true; book.onClose = null; api.play(idxOf(id)); return; }
    if (t.id === "bkIntro") { const c = Geo.continent(book.cont); playFor(t, c.introFile, c.intro); return; }
    if (t.dataset.open) { const [cid, coid] = t.dataset.open.split(":"); book.passport = false; book.cont = cid; renderBook(); showDetail("country", coid); return; }
    if (t.classList.contains("tile") && t.dataset.kind) { api.sfx("click"); showDetail(t.dataset.kind, t.dataset.id); return; }
    if (t.dataset.fact !== undefined) { const f = Geo.continent(book.cont).facts[Number(t.dataset.fact)]; playFor(t, f.file, f.text); return; }
    const act = t.dataset.act;
    if (act) {
      api.sfx("click");
      if (act === "back") { stopSpeech(); book.view = "home"; renderBook(); return; }
      const list = siblings(book.kind);
      const n = list.findIndex((x) => x.id === book.id);
      const m = (n + (act === "next" ? 1 : list.length - 1)) % list.length;
      showDetail(book.kind, list[m].id);
      return;
    }
    const item = book.view === "detail" ? detailItem() : null;
    if (!item) return;
    if (t.dataset.play === "intro") { playFor(t, item.introFile, item.intro); return; }
    if (t.dataset.play === "fact") { playFor(t, item.file, item.fact); return; }
    if (t.dataset.tile !== undefined) { const tile = item.tiles[Number(t.dataset.tile)]; playFor(t, tile.file, tile.say); return; }
    if (t.dataset.spec !== undefined) {
      const sp = item.specials[Number(t.dataset.spec)];
      for (const b of document.querySelectorAll("#bkDetail .spec")) b.classList.toggle("on", b === t);
      const say = $("dtSay");
      say.hidden = false;
      say.innerHTML = `<b>${sp.icon} ${esc(sp.label)}</b> ${esc(sp.text)}`;
      playFor(t, sp.file, sp.text);
      return;
    }
    if (t.dataset.hello) { showHello(item); playFor(t, item.helloFile, item.helloLine); return; }
    if (t.dataset.openAnimal) { showDetail("animal", t.dataset.openAnimal); return; }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("book").hidden) closeBook();
  });
  // Tryk ved siden af kortet lukker det
  $("book").addEventListener("pointerdown", (e) => { if (e.target === $("book")) closeBook(); });

  // ---------- Kort over dyr og steder i billedet ----------
  let spotTimer = 0;
  function openSpot(item) {
    $("spotEmoji").textContent = item.emoji;
    $("spotName").textContent = item.name;
    $("spotWhere").textContent = item.where || "";
    $("spotText").textContent = item.fact;
    const card = $("spotCard");
    card.hidden = false;
    card.classList.remove("pop");
    void card.offsetWidth;
    card.classList.add("pop");
    const btn = $("spotPlay");
    clearTimeout(spotTimer);
    speak(item.file, item.fact, {
      onstart: () => btn.classList.add("speaking"),
      onend: () => btn.classList.remove("speaking"),
      onstop: () => btn.classList.remove("speaking")
    });
    $("spotPlayTxt").onclick = null;
    btn.onclick = () => { if (btn.classList.contains("speaking")) stopSpeech(); else speak(item.file, item.fact, { onstart: () => btn.classList.add("speaking"), onend: () => btn.classList.remove("speaking"), onstop: () => btn.classList.remove("speaking") }); };
  }
  function closeSpot() {
    if ($("spotCard").hidden) return;
    $("spotCard").hidden = true;
    stopSpeech();
  }
  $("spotClose").addEventListener("click", closeSpot);
  // Tryk uden for kortet (fx på en bold) lukker det
  document.addEventListener("pointerdown", (e) => {
    if ($("spotCard").hidden) return;
    if (e.target.closest && (e.target.closest("#spotCard") || e.target.closest(".spot"))) return;
    closeSpot();
  }, true);

  // ---------- Opstart ----------
  function init(apiObj) {
    api = apiObj;
    $("worldMap").addEventListener("click", (e) => {
      const g = e.target.closest("[data-cont]");
      if (g) onMapPick(g.dataset.cont);
    });
    $("worldMap").addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const g = e.target.closest && e.target.closest("[data-cont]");
      if (g) { e.preventDefault(); onMapPick(g.dataset.cont); }
    });
    $("contChips").addEventListener("click", (e) => {
      const b = e.target.closest("[data-cont]");
      if (b) onMapPick(b.dataset.cont);
    });
    $("passBtn").addEventListener("click", () => { api.sfx("click"); openPassport(); });
    $("bookBtn").addEventListener("click", () => { api.sfx("click"); openBook(Geo.continents[api.state().current].id); });
    $("playBtn").addEventListener("click", () => { api.sfx("pop"); api.play(api.state().current); });
    renderHome();
  }

  window.TalbasketWorld = { init, renderHome, openBook, openPassport, closeBook, openSpot, closeSpot, speak, stopSpeech, flagSvg, COLORS, idxOf };
})();
