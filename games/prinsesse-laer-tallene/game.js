    /* ---------- Lær tallene ---------- */
    function learnView() {
      const stage = scaffold();
      // Tallene går fra 1 og op til det valgte (standard 10, op til 20 i ⚙️)
      const N = S.learnMax;
      const cols = N <= 5 ? N : N <= 10 ? 5 : N <= 16 ? 8 : 10;
      const fs = cols <= 5 ? 9 : cols <= 8 ? 6.6 : 5.4;
      ask("Tryk på et tal 👆", L.tapNumber);
      stage.innerHTML = `
        <div class="strip" style="--cols:${cols};--nf:clamp(1.3rem, calc(var(--u) * ${fs}), 5.5rem);--nh:calc(var(--u) * ${N > 5 ? 9.5 : 19})">${Array.from({ length: N }, (_, i) => `<button class="nb c${cc(i + 1)}${i === 0 ? " hint" : ""}" data-n="${i + 1}" type="button">${i + 1}</button>`).join("")}</div>
        <div class="show" id="show"></div>`;
      let current = 0;
      stage.querySelector(".strip").addEventListener("click", e => {
        const b = e.target.closest(".nb");
        if (b) learnPlay(Number(b.dataset.n));
      });
      stage.addEventListener("click", e => {
        if ((e.target.closest(".items") || e.target.closest(".bignum")) && current > 0) learnPlay(current);
      });

      async function learnPlay(n) {
        current = n;
        const v = ++ver;
        stage.querySelectorAll(".nb").forEach(b => { b.classList.remove("hint"); b.classList.toggle("on", Number(b.dataset.n) === n); });
        const t = rnd(THINGS);
        const show = $("#show");
        show.classList.toggle("six", n > 5 && n <= 10);
        show.classList.toggle("many", n > 10);
        const row = items(n, t, { hide: true, tappable: true });
        show.innerHTML = `<div class="showtop"><div class="bignum c${cc(n)}">${n}</div><div class="word c${cc(n)}">${W[n]}</div></div>`;
        show.append(row);
        sfx.note(n);
        if (!(await countAloud(v, row))) return;
        dance(row);
        avatarDo("cheer");
        await speak(phrase(n, t));
      }
    }

    startGame({ id: "learn", round: learnView });
