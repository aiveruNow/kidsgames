    /* ---------- Hvor mange? Tryk på tingene og tæl ---------- */
    function countRound() {
      const v = ver, n = pick(), t = rnd(THINGS), opts = choices(n);
      const stage = scaffold();
      ask(`Hvor mange ${t.e}?`, L.countAsk(t));
      const row = items(n, t, { tappable: true });
      stage.innerHTML = `<div class="field" id="field"></div>
        <div class="answers" id="answers">${opts.map(o => `<button class="ans c${cc(o)}" data-n="${o}" type="button" aria-label="${o}">${o}</button>`).join("")}</div>`;
      $("#field").append(row);
      let counted = 0, wrong = 0, busy = false, idle = 0;

      const nudge = () => {
        clearTimeout(idle);
        row.querySelectorAll(".it.hint").forEach(x => x.classList.remove("hint"));
        idle = setTimeout(() => {
          if (v !== ver || busy) return;
          row.querySelector(".it:not([data-c])")?.classList.add("hint");
        }, 4500);
      };
      nudge();

      const mark = (el, i) => {
        el.classList.add("counted");
        el.dataset.c = i;
        el.insertAdjacentHTML("beforeend", `<i>${i}</i>`);
      };

      row.addEventListener("click", e => {
        const el = e.target.closest(".it");
        if (!el || busy || el.dataset.c) return;
        mark(el, ++counted);
        el.classList.remove("hop", "hint");
        void el.offsetWidth;
        el.classList.add("hop");
        sfx.note(counted);
        burstEl(el, ["✨", "💖"], 5, 60);
        speak(W[counted]);
        nudge();
      });

      async function autoCount() {
        row.querySelectorAll(".it").forEach(el => { el.classList.remove("counted", "hint"); delete el.dataset.c; el.querySelector("i")?.remove(); });
        counted = 0;
        for (const el of row.querySelectorAll(".it")) {
          mark(el, ++counted);
          el.classList.remove("hop");
          void el.offsetWidth;
          el.classList.add("hop");
          sfx.note(counted);
          await speak(W[counted]);
          if (v !== ver) return false;
          await sleep(100);
        }
        return true;
      }

      $("#answers").addEventListener("click", async e => {
        const b = e.target.closest(".ans");
        if (!b || busy) return;
        clearTimeout(idle);
        const m = Number(b.dataset.n);
        if (m !== n) {
          wrong++;
          sfx.oops();
          avatarDo("oops");
          b.classList.remove("shake");
          void b.offsetWidth;
          b.classList.add("shake");
          if (wrong === 1) {
            busy = true;
            await speak([L.notNumber(m), L.letsCount]);
            if (v !== ver || !(await autoCount())) return;
            busy = false;
          } else {
            speak([L.notNumber(m), L.tryAgain]);
            $(`.ans[data-n="${n}"]`).classList.add("hint");
          }
          return;
        }
        busy = true;
        $("#answers").querySelectorAll(".ans").forEach(c => c.classList.remove("hint"));
        b.classList.add("win");
        burstEl(b, ["💖", "✨", "⭐"], 12, 120);
        if (counted < n && !(await autoCount())) return;
        dance(row);
        if (await reward(v, wrong === 0, [phrase(n, t), rnd(PRAISE)])) countRound();
      });
    }

    startGame({ id: "count", round: countRound });
