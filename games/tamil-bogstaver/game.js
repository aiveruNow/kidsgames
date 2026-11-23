  (() => {
    "use strict";
    const B = window.TamilBogstaver;
    const C = B.consonants;
    const V = B.vowels;
    const ROWS = C.length;
    const TOTAL = (ROWS - 1) * V.length; // række 1 er bogens eksempel og er allerede udfyldt
    const $ = (id) => document.getElementById(id);
    const kid = "ari";
    const key = (name) => `tamil-${kid}-${name}`;
    const read = (name, fallback) => { try { const v = localStorage.getItem(key(name)); return v === null ? fallback : v; } catch { return fallback; } };
    const write = (name, value) => { try { localStorage.setItem(key(name), String(value)); } catch { /* ingen lagring */ } };
    const readJSON = (name, fallback) => { try { return JSON.parse(read(name, "")) || fallback; } catch { return fallback; } };
    const rnd = (n) => Math.floor(Math.random() * n);
    const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const freshFill = () => V.map(() => C.map((_, i) => i === 0));
    let fill = readJSON("fill", null);
    if (!Array.isArray(fill) || fill.length !== V.length || fill.some((f) => !Array.isArray(f) || f.length !== ROWS)) fill = freshFill();
    let awarded = readJSON("awarded", [false, false]);
    let stars = Number(read("stars", "0")) || 0;
    let muted = !Topbar.soundOn();
    const { audio, tone } = KidsSynth.create(() => muted);
    window.addEventListener("topbar:sound", (e) => { muted = !e.detail.on; if (muted) stopAudio(); });

    const blockDone = (b) => fill[b].every(Boolean);
    const filledCount = () => fill.reduce((s, f) => s + f.filter(Boolean).length - 1, 0);
    const firstOpen = (b, after = -1) => {
      for (let i = after + 1; i < ROWS; i++) if (!fill[b][i]) return i;
      return fill[b].findIndex((x) => !x);
    };

    // ---------- Siden ----------
    const sheet = $("sheet");
    const rowEl = (b, i) => sheet.querySelector(`.row[data-b="${b}"][data-i="${i}"]`);
    function build() {
      sheet.innerHTML = "";
      V.forEach((v, b) => {
        const sec = document.createElement("section");
        sec.className = "block";
        sec.dataset.b = b;
        let html = `<div class="bhead"><button class="badge ta" type="button" data-k="vowel" data-b="${b}" aria-label="Vokalen ${v.ta}">${v.ta}</button><span class="eg ta">எ.கா:</span></div><div class="rows">`;
        C.forEach((c, i) => {
          html += `<div class="row ${c.cls}${i === 0 ? " ex" : ""}" data-b="${b}" data-i="${i}" style="--n:${i}">` +
            `<button class="cap cons ta" type="button" data-k="cons">${c.mei}</button><span class="op">+</span>` +
            `<button class="cap vow ta" type="button" data-k="vow">${v.ta}</button><span class="op">=</span>` +
            `<button class="cap ans ta" type="button" data-k="ans"></button></div>`;
        });
        sec.innerHTML = html + "</div>";
        sheet.appendChild(sec);
      });
      paintAll();
    }
    function paintAll() {
      V.forEach((v, b) => {
        const open = fill[b].findIndex((x) => !x);
        C.forEach((c, i) => {
          const row = rowEl(b, i);
          row.classList.toggle("active", i === open);
          row.classList.toggle("filled", fill[b][i]);
          row.querySelector(".ans").textContent = fill[b][i] ? B.letterOf(i, b).ta : "";
        });
      });
      progress();
    }
    function progress() {
      const n = filledCount();
      document.querySelector(".head").style.setProperty("--p", n / TOTAL);
      $("count").textContent = `${n}/${TOTAL}`;
    }
    function save() { write("fill", JSON.stringify(fill)); write("awarded", JSON.stringify(awarded)); }

    // ---------- Lyd ----------
    const clip = new Audio();
    clip.preload = "auto";
    const SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
    const TEXT = Object.fromEntries(B.allClips().map((c) => [c.id, c.text]));
    let token = 0;
    let unlocked = false;
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
    for (const ev of ["pointerdown", "touchend", "keydown"]) document.addEventListener(ev, unlockAudio, true);
    function stopAudio() {
      token++;
      clip.onended = null;
      clip.onerror = null;
      clip.onplaying = null;
      clip.pause();
      document.querySelectorAll(".hi").forEach((e) => e.classList.remove("hi"));
    }
    function deviceVoice(id, t) {
      return new Promise((resolve) => {
        const synth = window.speechSynthesis;
        if (!synth || muted || !TEXT[id]) { resolve(); return; }
        const u = new SpeechSynthesisUtterance(TEXT[id]);
        u.lang = "ta-IN";
        u.onend = u.onerror = () => resolve();
        synth.speak(u);
        setTimeout(resolve, 1800);
      });
    }
    // Afspiller ét klip og venter, til bogstavet er sagt (stemmen lægger stilhed efter, den springes over)
    function playOne(id, t) {
      return new Promise((resolve) => {
        if (muted) { setTimeout(resolve, 450); return; }
        let finished = false;
        let endTimer = 0;
        let safety = 0;
        const finish = (fallback) => {
          if (finished) return;
          finished = true;
          clearTimeout(endTimer);
          clearTimeout(safety);
          if (fallback && t === token) deviceVoice(id, t).then(resolve); else resolve();
        };
        clip.onended = () => finish(false);
        clip.onerror = () => finish(true);
        const len = (window.TamilBogstaverLaengder || {})[id];
        clip.onplaying = () => {
          clip.onplaying = null;
          if (len) endTimer = setTimeout(() => { if (t === token) { clip.pause(); finish(false); } }, (len + .2) * 1000);
        };
        clip.src = `audio/${B.clipFile(id)}`;
        const p = clip.play();
        if (p && p.catch) p.catch(() => finish(true));
        safety = setTimeout(() => finish(false), 4000);
      });
    }
    // items: [{ id, el }]. el lyser, mens klippet siges.
    async function say(items) {
      stopAudio();
      const t = token;
      for (const it of items) {
        if (t !== token) return false;
        if (it.el) it.el.classList.add("hi");
        await playOne(it.id, t);
        if (it.el) it.el.classList.remove("hi");
        if (t === token) await sleep(70);
      }
      return t === token;
    }
    const sfx = {
      right: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .2, "triangle", .11, i * .08)),
      wrong: () => tone(240, .26, "triangle", .1, 0, -90),
      win: () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, .22, "triangle", .12, i * .1))
    };
    const PRAISE = [{ id: "ros-nallathu", ta: "நல்லது!" }, { id: "ros-arumai", ta: "அருமை!" }, { id: "ros-sabaash", ta: "சபாஷ்!" }];
    // Ros fra Urundai (samme stemme), kun hver tredje gang så det ikke bliver for meget
    function playPraise(p) {
      if (muted) return Promise.resolve();
      return new Promise((resolve) => {
        const t = token;
        clip.onended = () => resolve();
        clip.onerror = () => resolve();
        clip.src = `../../shared/tamil-words/audio/${p.id}.mp3`;
        const pr = clip.play();
        if (pr && pr.catch) pr.catch(() => resolve());
        setTimeout(() => { if (t === token) resolve(); }, 1500);
      });
    }

    function burst(x, y, n = 14, set = ["⭐", "✨", "🌸", "🟡"]) {
      for (let k = 0; k < n; k++) {
        const s = document.createElement("span");
        s.className = "fx";
        s.textContent = set[rnd(set.length)];
        s.style.left = `${x}px`;
        s.style.top = `${y}px`;
        document.body.appendChild(s);
        const a = Math.random() * Math.PI * 2;
        const d = 60 + Math.random() * 130;
        s.animate([{ transform: "translate(-50%,-50%) scale(.4)", opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d - 30}px)) scale(1.3) rotate(${rnd(360)}deg)`, opacity: 0 }], { duration: 800 + Math.random() * 500, easing: "ease-out" }).onfinish = () => s.remove();
      }
    }
    const centerOf = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

    // ---------- Spørgsmål ----------
    let cur = null; // { b, i, opts, busy }
    let praiseCount = 0;
    function makeOptions(b, i) {
      const n = Number(read("valg", "4")) === 3 ? 3 : 4;
      const right = B.letterOf(i, b);
      const picks = [right, B.letterOf(i, 1 - b)];
      const pool = shuffle(C.map((_, j) => j).filter((j) => j !== i));
      for (const j of pool) {
        if (picks.length >= n) break;
        picks.push(B.letterOf(j, b));
      }
      return shuffle(picks.slice(0, n)).map((l) => ({ ...l, right: l.id === right.id }));
    }
    const OC = [["#e0534a", "#a8261f"], ["#6fb23c", "#3d7a17"], ["#d96aa3", "#a02a6a"], ["#3b82c4", "#1f5a92"]];
    function openPicker(b, i) {
      stopAudio();
      cur = { b, i, busy: false };
      const c = C[i];
      const eqn = $("eqn");
      eqn.className = `eqn ${c.cls}`;
      $("eqC").textContent = c.mei;
      $("eqV").textContent = V[b].ta;
      $("eqA").textContent = "?";
      $("toast").textContent = "";
      $("toast").className = "toast";
      const opts = makeOptions(b, i);
      cur.opts = opts;
      const box = $("opts");
      box.dataset.n = opts.length;
      box.innerHTML = "";
      opts.forEach((o, k) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "opt";
        btn.textContent = o.ta;
        btn.style.setProperty("--oc", OC[k % OC.length][0]);
        btn.style.setProperty("--od", OC[k % OC.length][1]);
        btn.addEventListener("click", () => choose(o, btn));
        box.appendChild(btn);
      });
      $("picker").hidden = false;
      sayQuestion();
    }
    function sayQuestion() {
      if (!cur) return;
      say([{ id: C[cur.i].meiId, el: $("eqC") }, { id: V[cur.b].id, el: $("eqV") }]);
    }
    function closePicker() {
      stopAudio();
      cur = null;
      $("picker").hidden = true;
    }
    async function choose(o, btn) {
      if (!cur || cur.busy || btn.disabled) return;
      const { b, i } = cur;
      if (!o.right) {
        btn.classList.add("bad");
        btn.disabled = true;
        sfx.wrong();
        $("toast").className = "toast no";
        $("toast").textContent = "Prøv igen – du kan det!";
        say([{ id: o.id }]); // så barnet hører, hvilket bogstav det valgte
        return;
      }
      cur.busy = true;
      btn.classList.add("good");
      $("opts").querySelectorAll(".opt").forEach((x) => { x.disabled = true; });
      $("eqA").textContent = o.ta;
      sfx.right();
      fill[b][i] = true;
      save();
      paintAll();
      const ans = rowEl(b, i).querySelector(".ans");
      ans.classList.remove("pop");
      void ans.offsetWidth;
      ans.classList.add("pop");
      const [x, y] = centerOf(btn);
      burst(x, y, 10);
      praiseCount++;
      const p = PRAISE[praiseCount % PRAISE.length];
      $("toast").className = "toast";
      $("toast").textContent = praiseCount % 3 === 0 ? `${p.ta}` : "Rigtigt! ✓";
      await say([{ id: C[i].meiId, el: $("eqC") }, { id: V[b].id, el: $("eqV") }, { id: o.id, el: $("eqA") }]);
      if (praiseCount % 3 === 0) await playPraise(p);
      await sleep(250);
      if (!cur) return; // lukket imens
      advance(b, i);
    }
    function advance(b, i) {
      const auto = read("auto", "1") !== "0";
      if (blockDone(b)) {
        closePicker();
        winBlock(b);
        return;
      }
      if (!auto) { closePicker(); return; }
      openPicker(b, firstOpen(b, i));
    }

    // ---------- Belønning ----------
    async function winBlock(b) {
      const sec = sheet.querySelector(`.block[data-b="${b}"]`);
      sec.classList.add("win");
      sfx.win();
      const [x, y] = centerOf(sec);
      burst(x, y, 26);
      if (!awarded[b]) {
        awarded[b] = true;
        stars++;
        write("stars", stars);
        save();
        if (window.Topbar) Topbar.refreshStars(true);
      }
      await sleep(1500);
      sec.classList.remove("win");
      if (V.every((_, k) => blockDone(k))) {
        sfx.win();
        $("done").hidden = false;
        const [dx, dy] = [innerWidth / 2, innerHeight / 3];
        burst(dx, dy, 30);
        return;
      }
      const other = V.findIndex((_, k) => !blockDone(k));
      if (other >= 0 && read("auto", "1") !== "0") openPicker(other, firstOpen(other));
    }

    function restart() {
      stopAudio();
      fill = freshFill();
      awarded = [false, false];
      save();
      $("done").hidden = true;
      $("picker").hidden = true;
      cur = null;
      paintAll();
    }

    // ---------- Tryk på siden ----------
    sheet.addEventListener("click", (e) => {
      const badge = e.target.closest(".badge");
      if (badge) { const b = Number(badge.dataset.b); say([{ id: V[b].id, el: badge }]); return; }
      const row = e.target.closest(".row");
      if (!row) return;
      const b = Number(row.dataset.b);
      const i = Number(row.dataset.i);
      const which = e.target.closest(".cap");
      const k = which && which.dataset.k;
      if (!fill[b][i]) { openPicker(b, i); return; }
      const parts = { cons: { id: C[i].meiId, el: row.querySelector(".cons") }, vow: { id: V[b].id, el: row.querySelector(".vow") }, ans: { id: B.letterOf(i, b).id, el: row.querySelector(".ans") } };
      if (k && parts[k] && k !== "ans") say([parts[k]]);
      else say([parts.cons, parts.vow, parts.ans]); // hele regnestykket: konsonant, vokal og så bogstavet
    });
    $("pickX").addEventListener("click", closePicker);
    $("picker").addEventListener("click", (e) => { if (e.target === $("picker")) closePicker(); });
    $("pickSay").addEventListener("click", sayQuestion);
    $("eqC").addEventListener("click", () => cur && say([{ id: C[cur.i].meiId, el: $("eqC") }]));
    $("eqV").addEventListener("click", () => cur && say([{ id: V[cur.b].id, el: $("eqV") }]));
    $("again").addEventListener("click", restart);
    $("stay").addEventListener("click", () => { $("done").hidden = true; });
    $("optChoices").value = read("valg", "4");
    $("optAuto").value = read("auto", "1");
    $("optChoices").addEventListener("change", (e) => write("valg", e.target.value));
    $("optAuto").addEventListener("change", (e) => write("auto", e.target.value));
    $("optReset").addEventListener("click", () => { Topbar.closeMenu(); restart(); });

    build();
    Topbar.init({ kid, controls: [$("settings")] });

    // Testværktøj: window.__tamil giver adgang til tilstanden
    window.__tamil = { get fill() { return fill; }, get cur() { return cur; }, openPicker, choose, restart, C, V, B, say, makeOptions, winBlock };
  })();
