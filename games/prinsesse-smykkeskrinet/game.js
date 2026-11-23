    /* ---------- Tallet skrives: strøg for strøg, som man skriver det i hånden ---------- */
    // Hvert tal er en eller flere streger i en boks på 100 × 140, tegnet i skriveretningen
    const DIGITS = {
      "0": ["M50 12 C25 12 14 40 14 70 C14 100 28 128 50 128 C72 128 86 100 86 70 C86 40 75 12 50 12"],
      "1": ["M26 44 L56 14 L56 128"],
      "2": ["M20 42 C20 18 38 12 50 12 C68 12 80 24 80 42 C80 62 60 82 20 126 L86 126"],
      "3": ["M22 28 C32 14 48 12 56 12 C74 12 82 26 80 40 C78 56 62 66 44 66 C66 66 84 78 84 98 C84 118 66 128 48 128 C34 128 22 120 16 106"],
      "4": ["M68 12 L16 92 L90 92", "M68 12 L68 128"],
      "5": ["M80 14 L30 14 L24 64 C34 56 46 52 58 54 C76 58 84 74 84 94 C84 114 68 128 48 128 C34 128 22 122 16 108"],
      "6": ["M72 16 C54 24 26 50 18 86 C12 112 28 128 50 128 C72 128 84 112 84 92 C84 72 70 60 52 60 C36 60 22 72 18 88"],
      "7": ["M16 14 L84 14 L40 128"],
      "8": ["M50 70 C28 70 20 56 20 42 C20 24 34 12 50 12 C66 12 80 24 80 42 C80 56 72 70 50 70 C26 70 16 86 16 102 C16 118 30 128 50 128 C70 128 84 118 84 102 C84 86 74 70 50 70"],
      "9": ["M50 12 C30 12 18 26 18 44 C18 62 32 76 50 76 C68 76 82 62 82 44 C82 26 70 12 50 12", "M82 44 C82 84 76 114 58 128 C48 134 36 130 26 122"]
    };
    let numTok = 0;
    let numState = null;
    const stillParam = new URLSearchParams(location.search).has("still");   // til test: vis tallet færdigskrevet

    function numberSvg(n) {
      const ds = String(n).split("");
      const vbW = ds.length * 100 + (ds.length - 1) * 24;
      const strokes = [];
      ds.forEach((d, i) => DIGITS[d].forEach(p => strokes.push({ d: p, x: i * 124 })));
      const svg = $("#numsvg");
      svg.setAttribute("viewBox", `0 0 ${vbW} 140`);
      svg.style.setProperty("--vbw", vbW);
      svg.classList.remove("done");
      svg.innerHTML = strokes.map(s => `<path class="ghost" transform="translate(${s.x} 0)" d="${s.d}"/>`).join("")
        + strokes.map(s => `<path class="ink" transform="translate(${s.x} 0)" d="${s.d}"/>`).join("")
        + `<circle class="pen" r="9" cx="-60" cy="-60"/>`;
      return strokes;
    }

    function drawStroke(path, pen, x, dur, tok) {
      return new Promise(res => {
        const len = path.getTotalLength();
        const t0 = performance.now();
        const step = now => {
          if (tok !== numTok) return res(false);
          const k = Math.min(1, (now - t0) / dur);
          const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          path.style.strokeDashoffset = len * (1 - e);
          const p = path.getPointAtLength(len * e);
          pen.setAttribute("cx", p.x + x);
          pen.setAttribute("cy", p.y);
          if (k < 1) requestAnimationFrame(step); else res(true);
        };
        requestAnimationFrame(step);
      });
    }

    // Tallet skrives igen og igen, indtil man trykker
    async function numLoop(n, t, tok) {
      const strokes = numberSvg(n);
      const svg = $("#numsvg"), pen = svg.querySelector(".pen"), inks = [...svg.querySelectorAll(".ink")];
      const word = $("#numword"), box = $("#numitems");
      word.textContent = W[n];
      const showThings = () => {
        word.classList.add("on");
        box.innerHTML = Array.from({ length: n }, (_, i) => `<span style="--k:${i}">${t.e}</span>`).join("");
      };
      if (stillParam || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        inks.forEach(p => { p.style.strokeDasharray = p.getTotalLength(); p.style.strokeDashoffset = 0; });
        pen.style.opacity = 0;
        showThings();
        speak(W[n]);
        return;
      }
      while (tok === numTok) {
        inks.forEach(p => { const len = p.getTotalLength(); p.style.strokeDasharray = len; p.style.strokeDashoffset = len; });
        svg.classList.remove("done");
        word.classList.remove("on");
        box.innerHTML = "";
        pen.style.opacity = 1;
        pen.setAttribute("cx", -60);
        speak(W[n]);
        await sleep(450);
        for (let i = 0; i < inks.length; i++) {
          if (tok !== numTok) return;
          const dur = Math.max(700, Math.min(1300, inks[i].getTotalLength() * 9));
          sfx.whoosh();
          if (!(await drawStroke(inks[i], pen, strokes[i].x, dur, tok))) return;
          await sleep(220);
        }
        if (tok !== numTok) return;
        pen.style.opacity = 0;
        svg.classList.add("done");
        sfx.clink(n);
        const r = svg.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, ["✨", "⭐", "💖"], 12, 150);
        showThings();
        await sleep(3200);
      }
    }

    function openNumber(n, t, v) {
      const tok = ++numTok;
      const pop = $("#numpop");
      numState = { v, at: performance.now() };
      $("#numcard").className = `numcard c${cc(n)}`;
      pop.hidden = false;
      pop.focus({ preventScroll: true });
      stopSpeech();
      numLoop(n, t, tok);
    }

    function closeNumber() {
      const pop = $("#numpop");
      if (pop.hidden || !numState || performance.now() - numState.at < 350) return;
      numTok++;
      pop.hidden = true;
      stopSpeech();
      sfx.pick();
      // Nu fortæller prinsessen, hvad der skal gøres
      if (numState.v === ver) speak(askSpeech);
    }
    $("#numpop").addEventListener("click", closeNumber);

    /* ---------- Smykkeskrinet: træk eller tryk smykkerne i skrinet ---------- */
    let mk = null;   // den aktuelle runde
    let drag = null;

    function makeRound() {
      const forced = Number(new URLSearchParams(location.search).get("n")) || 0;   // ?n=7 til test
      const v = ver, n = forced || pick(), t = rnd(THINGS);
      const stage = scaffold();
      ask(`Læg ${chip(n)} ${t.e}`, L.put(n, t), false);
      // Tryk på boblen viser tallet igen
      const again = $("#again"), fresh = again.cloneNode(true);
      again.replaceWith(fresh);
      fresh.addEventListener("click", () => openNumber(n, t, v));
      const trayCount = Math.min(22, n + 2);
      stage.innerHTML = `
        <div class="chest" id="chest" style="--slot:calc(var(--u) * ${n > 10 ? 5.2 : n > 5 ? 7.5 : 12})">
          <div class="lid"></div>
          <div class="box"><div class="slots" style="--cols:${n <= 5 ? n : n <= 10 ? 5 : 10}">${'<div class="slot"></div>'.repeat(n)}</div></div>
        </div>
        <div class="tray" id="tray" style="--it:clamp(2.2rem, calc(var(--u) * ${n > 10 ? 5.5 : n > 5 ? 7.2 : 11}), 7rem)">${Array.from({ length: trayCount }, () => `<button class="gem" type="button" aria-label="${t.sg}">${t.e}</button>`).join("")}</div>`;
      mk = { v, n, t, k: 0, busy: false, slots: [...stage.querySelectorAll(".slot")], chest: $("#chest"), tray: $("#tray") };
      mk.slots[0].classList.add("next");

      // Tryk på et smykke lægger det i skrinet. Kan også trækkes derhen.
      mk.tray.addEventListener("click", e => {
        const g = e.target.closest(".gem");
        if (g && e.detail === 0) place(g, g.getBoundingClientRect());   // tastatur
      });

      // Først vises tallet stort og skrives. Et tryk et vilkårligt sted lukker det, og så begynder legen.
      openNumber(n, t, v);
    }

    document.addEventListener("pointerdown", e => {
      if (!mk || mk.busy || drag || e.target.closest(".drag")) return;
      const g = e.target.closest(".gem");
      if (!g || !mk.tray.contains(g) || g.dataset.used) return;
      e.preventDefault();
      const r = g.getBoundingClientRect();
      const clone = g.cloneNode(true);
      clone.classList.add("drag");
      clone.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;font-size:${r.height * .8}px;`;
      document.body.append(clone);
      g.style.visibility = "hidden";
      drag = { g, clone, id: e.pointerId, ox: e.clientX - r.left, oy: e.clientY - r.top, sx: e.clientX, sy: e.clientY, moved: false, home: r };
      sfx.pick();
    });

    document.addEventListener("pointermove", e => {
      if (!drag || e.pointerId !== drag.id) return;
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 10) drag.moved = true;
      drag.clone.style.left = `${e.clientX - drag.ox}px`;
      drag.clone.style.top = `${e.clientY - drag.oy}px`;
    });

    function endDrag(e, cancelled) {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      const box = mk?.chest.getBoundingClientRect();
      const over = box && e.clientX > box.left - 30 && e.clientX < box.right + 30 && e.clientY > box.top - 50 && e.clientY < box.bottom + 30;
      if (!cancelled && mk && !mk.busy && (!d.moved || over)) {
        place(d.g, d.home, d.clone);
        return;
      }
      // Slap uden for skrinet: smykket flyver tilbage
      d.clone.classList.add("snap");
      d.clone.style.left = `${d.home.left}px`;
      d.clone.style.top = `${d.home.top}px`;
      setTimeout(() => { d.clone.remove(); d.g.style.visibility = ""; }, 360);
    }
    document.addEventListener("pointerup", e => endDrag(e, false));
    document.addEventListener("pointercancel", e => endDrag(e, true));

    async function place(g, from, existingClone) {
      if (!mk || mk.busy || g.dataset.used || mk.k >= mk.n) return;
      const round = mk, v = round.v;
      g.dataset.used = "1";
      g.style.visibility = "hidden";
      const slot = round.slots[round.k];
      const sr = slot.getBoundingClientRect();
      const clone = existingClone || (() => {
        const c = g.cloneNode(true);
        c.classList.add("drag");
        c.style.cssText = `left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;font-size:${from.height * .8}px;`;
        document.body.append(c);
        return c;
      })();
      sfx.whoosh();
      void clone.offsetWidth;
      clone.classList.add("snap");
      clone.style.left = `${sr.left}px`;
      clone.style.top = `${sr.top}px`;
      clone.style.width = `${sr.width}px`;
      clone.style.height = `${sr.height}px`;
      clone.style.fontSize = `${sr.height * .75}px`;
      round.k++;
      const k = round.k;
      round.slots.forEach(s => s.classList.remove("next"));
      if (k < round.n) round.slots[k].classList.add("next");
      round.busy = k >= round.n;
      await sleep(360);
      if (v !== ver) { clone.remove(); return; }
      clone.remove();
      const s = document.createElement("span");
      s.className = "it pop";
      s.textContent = round.t.e;
      slot.append(s);
      slot.style.borderStyle = "solid";
      sfx.clink(k);
      burstEl(slot, ["✨", "💖"], 6, 70);
      speak(W[k]);
      if (k === round.n) {
        await sleep(900);
        if (v !== ver) return;
        round.chest.classList.add("done");
        round.tray.querySelectorAll(".gem").forEach(x => x.classList.add("fade"));
        sfx.chest();
        burstEl(round.chest, ["✨", "💎", "💖", "⭐"], 14, 150);
        await sleep(700);
        if (await reward(v, true, [phrase(round.n, round.t), rnd(PRAISE)])) makeRound();
      }
    }

    startGame({
      id: "make",
      round: makeRound,
      leave() {
        numTok++;
        $("#numpop").hidden = true;
      }
    });
