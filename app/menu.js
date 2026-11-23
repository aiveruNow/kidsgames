    function refreshStars() {
      for (const badge of document.querySelectorAll(".stars")) {
        let count = 0;
        try { count = Number(localStorage.getItem(badge.dataset.store)) || 0; } catch { count = 0; }
        badge.querySelector("span").textContent = count;
        badge.setAttribute("aria-label", `Stjerner: ${count}`);
      }
    }
    refreshStars();

    // Samlet antal stjerner pr. barn. Nøglerne ligger i topbar.js (ét sted for forside og spil).
    const STAR_KEYS = Topbar.STAR_KEYS;
    function totalStars(barn) {
      let sum = 0;
      for (const key of STAR_KEYS[barn]) {
        try { sum += Number(localStorage.getItem(key)) || 0; } catch { /* ingen lagring */ }
      }
      return sum;
    }
    // Fysiske stjerner: op til 10 i en række, grå indtil de er optjent. Hver fulde ti giver en 🏆.
    const STAR_POINTS = "50,3 62,35 97,36 69,57 79,91 50,71 21,91 31,57 3,36 38,35";
    const GLOSS_POINTS = "50,14 58,36 80,37 63,50 69,72 50,59 31,72 37,50 20,37 42,36";
    const starSvg = (cls, i) => `<svg class="s ${cls}" style="--i:${i}" viewBox="0 0 100 96" aria-hidden="true" focusable="false"><polygon class="grey" points="${STAR_POINTS}"/><polygon class="gold" points="${STAR_POINTS}" fill="url(#hero-star-fill)"/><polygon class="gloss" points="${GLOSS_POINTS}"/></svg>`;
    function starLayout(total) {
      return { lit: total > 0 ? ((total - 1) % 10) + 1 : 0, tens: total > 0 ? Math.floor((total - 1) / 10) : 0 };
    }

    function renderChip(chip) {
      const { lit, tens } = starLayout(totalStars(chip.dataset.kid));
      chip.innerHTML = `<span class="mini-row">${Array.from({ length: 10 }, (_, i) => starSvg(i < lit ? "mini on" : "mini", i)).join("")}</span>${tens ? `<span class="trophy">🏆×${tens}</span>` : ""}`;
    }
    for (const chip of document.querySelectorAll(".who-stars")) renderChip(chip);

    // Lyd med Web Audio. Kan slås fra i ⚙️-menuen (huskes uden for spillenes data).
    let soundOn = true;
    try { soundOn = localStorage.getItem("regnespil-lyd") !== "0"; } catch { /* ingen lagring */ }
    let audioCtx = null;
    function ensureAudio() {
      try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
      } catch { /* ingen lyd */ }
    }
    function tone(freq, dur = .3, type = "triangle", vol = .16, delay = 0) {
      // Kun hvis browseren har tilladt lyd; ellers springes den over i stedet for at komme forsinket
      if (!soundOn || !audioCtx || audioCtx.state !== "running") return;
      try {
        const t = audioCtx.currentTime + delay, osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = type; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol, t + .02);
        gain.gain.exponentialRampToValueAtTime(.001, t + dur);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + dur + .02);
      } catch { /* ingen lyd */ }
    }
    const STAR_NOTES = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760];
    const chime = (i) => { tone(STAR_NOTES[i], .38); tone(STAR_NOTES[i] * 2, .2, "sine", .06, .07); };
    const fanfare = () => [523, 659, 784, 1047, 1319].forEach((f, k) => tone(f, .45, "triangle", .15, k * .1));

    const heroEl = document.getElementById("star-hero");
    const rowEl = document.getElementById("star-row");
    const trophyEl = document.getElementById("trophies");
    let heroRun = 0;

    function burst(star) {
      for (let k = 0; k < 7; k++) {
        const spark = document.createElement("span");
        const angle = (k / 7) * Math.PI * 2 + Math.random() * .4;
        const dist = 26 + Math.random() * 26;
        spark.className = "burst";
        spark.textContent = k % 2 ? "✨" : "⭐";
        spark.style.left = `${star.offsetLeft + star.offsetWidth / 2}px`;
        spark.style.top = `${star.offsetTop + star.offsetHeight / 2}px`;
        spark.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
        spark.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
        rowEl.append(spark);
        setTimeout(() => spark.remove(), 900);
      }
    }

    // Tænder barnets stjerner en efter en med glimt og lyd (eller med det samme uden animation)
    function renderHero(total, animate) {
      const run = ++heroRun;
      const { lit, tens } = starLayout(total);
      rowEl.innerHTML = Array.from({ length: 10 }, (_, i) => starSvg("", i)).join("");
      trophyEl.hidden = true;
      trophyEl.innerHTML = tens ? `🏆 <span>×${tens}</span>` : "";
      const stars = [...rowEl.querySelectorAll(".s")];
      if (!animate) {
        stars.slice(0, lit).forEach((s) => s.classList.add("on"));
        trophyEl.hidden = !tens;
        return;
      }
      ensureAudio();
      const first = 550, step = 380;
      stars.slice(0, lit).forEach((s, i) => {
        setTimeout(() => {
          if (run !== heroRun) return;
          s.classList.add("on");
          burst(s);
          chime(i);
        }, first + i * step);
      });
      const done = first + lit * step;
      setTimeout(() => {
        if (run !== heroRun) return;
        if (tens) { trophyEl.hidden = false; chime(9); }
        if (lit === 10) fanfare();
      }, done + 100);
    }

    // Bruges efter nulstilling, så stjernerne følger med
    function refreshTotals() {
      for (const chip of document.querySelectorAll(".who-stars")) renderChip(chip);
      if (Object.prototype.hasOwnProperty.call(STAR_KEYS, kidParam)) renderHero(totalStars(kidParam), false);
    }

    const soundToggle = document.getElementById("sound-toggle");
    const paintSound = () => { soundToggle.textContent = soundOn ? "🔊 Lyd: til" : "🔇 Lyd: fra"; };
    paintSound();
    soundToggle.addEventListener("click", () => {
      soundOn = !soundOn;
      try { localStorage.setItem("regnespil-lyd", soundOn ? "1" : "0"); } catch { /* ingen lagring */ }
      paintSound();
      if (soundOn) { ensureAudio(); tone(784, .25); }
    });

    // To visninger i samme side: valg af barn (uden parameter) og barnets spil (?barn=ari eller ?barn=riyana)
    const KIDS = { ari: { name: "Ari", icon: "🦁" }, riyana: { name: "Riyana", icon: "👸" } };
    const kidParam = new URLSearchParams(location.search).get("barn");
    const kid = Object.prototype.hasOwnProperty.call(KIDS, kidParam) ? KIDS[kidParam] : null;
    if (kid) {
      document.getElementById("choose").hidden = true;
      document.getElementById("games").hidden = false;
      document.getElementById("footer-note").hidden = false;
      document.getElementById("home-link").hidden = false;
      document.getElementById("page-title").textContent = `${kid.icon} ${kid.name}`;
      document.getElementById("page-subtitle").textContent = "Hvad har du lyst til at spille?";
      document.title = `Kidsgames — ${kid.name}`;
      for (const card of document.querySelectorAll("[data-for]")) {
        card.hidden = !card.dataset.for.split(" ").includes(kidParam);
      }

      // Stjernerne tændes en efter en. Tryk på dem for at se og høre det igen.
      const total = totalStars(kidParam);
      heroEl.hidden = false;
      heroEl.setAttribute("aria-label", `${kid.name} har ${total} stjerner. Tryk for at høre dem igen.`);
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      renderHero(total, !reduce);
      const replay = () => renderHero(totalStars(kidParam), !reduce);
      heroEl.addEventListener("click", replay);
      heroEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); replay(); }
      });
    }
