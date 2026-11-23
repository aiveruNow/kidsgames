    /* ---------- Find tallet: prik den rigtige ballon ---------- */
    function findRound() {
      const v = ver, n = pick(), t = rnd(THINGS), opts = choices(n);
      const stage = scaffold();
      ask(`Find ${chip(n)}`, L.findAsk(n));
      stage.innerHTML = `
        <div class="sky" id="sky">${opts.map((o, i) => `<button class="balloon c${cc(o)}" data-n="${o}" style="--i:${i}" type="button" aria-label="${o}">${o}</button>`).join("")}</div>
        <div class="reveal" id="reveal"></div>`;
      let wrong = 0, locked = false;
      $("#sky").addEventListener("click", async e => {
        const b = e.target.closest(".balloon");
        if (!b || locked) return;
        const m = Number(b.dataset.n);
        if (m !== n) {
          wrong++;
          sfx.oops();
          avatarDo("oops");
          b.classList.remove("wobble");
          void b.offsetWidth;
          b.classList.add("wobble");
          speak([L.isNumber(m), L.findAgain(n)]);
          if (wrong >= 2) $(`.balloon[data-n="${n}"]`).classList.add("hint");
          return;
        }
        locked = true;
        sfx.balloon();
        burstEl(b, ["💖", "✨", "⭐", "🎉"], 14, 150);
        b.classList.remove("hint", "wobble");
        b.classList.add("boom");
        $("#sky").querySelectorAll(".balloon").forEach(o => { if (o !== b) o.classList.add("away"); });
        await sleep(350);
        const row = items(n, t, { hide: true });
        $("#reveal").append(row);
        if (!(await countAloud(v, row))) return;
        dance(row);
        if (await reward(v, wrong === 0, [phrase(n, t), rnd(PRAISE)])) findRound();
      });
    }

    startGame({ id: "find", round: findRound });
