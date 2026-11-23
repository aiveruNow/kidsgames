    const PARTS = 10;
    const PART_NAMES = ["fødder", "ben", "en krop", "et brystpanel", "arme", "hænder", "et hoved", "øjne", "en mund", "en antenne"];
    const PALETTES = [
      ["#4f9dff", "#2f6fd1"],
      ["#ff8a5b", "#d4562a"],
      ["#3ecf8e", "#1f9e68"],
      ["#b27cff", "#7e47d6"],
      ["#ffc247", "#d9951a"],
      ["#ff6fa5", "#d13d76"]
    ];
    const TIPS = {
      0: "Tips: noget gange 0 giver altid 0.",
      1: "Tips: 1 gange et tal giver tallet selv.",
      2: "Tips: 2-tabellen er det dobbelte. 4 × 2 = 4 + 4.",
      3: "Tips: tæl i spring af 3: 3, 6, 9, 12 …",
      4: "Tips: 4-tabellen er det dobbelte af det dobbelte.",
      5: "Tips: 5-tabellen ender altid på 0 eller 5.",
      6: "Tips: 6 × tal = 5 × tal + tallet en gang til.",
      7: "Tips: 7 × tal = 5 × tal + 2 × tal.",
      8: "Tips: 8-tabellen er det dobbelte af 4-tabellen.",
      9: "Tips: 9 × tal = 10 × tal − tallet. Ciffersummen bliver 9.",
      10: "Tips: sæt et 0 bag tallet."
    };
    const ROW_COLORS = ["#2764c5", "#e99a37", "#20a36a", "#b27cff", "#e36b6b"];

    const firstOperand = document.querySelector("#first");
    const secondOperand = document.querySelector("#second");
    const answerContainer = document.querySelector("#answers");
    const scoreDisplay = document.querySelector("#score");
    const roundDisplay = document.querySelector("#round");
    const settings = document.querySelector("#settings");
    const tableButtonBox = document.querySelector("#tableButtons");
    const feedback = document.querySelector("#feedback");
    const nextButton = document.querySelector("#next");
    const hintToggle = document.querySelector("#hintToggle");
    const mathHint = document.querySelector("#mathHint");
    const hintText = document.querySelector("#hintText");
    const dotGrid = document.querySelector("#dotGrid");
    const scene = document.querySelector("#scene");
    const bubble = document.querySelector("#bubble");
    const robot = document.querySelector("#robot");
    const target = document.querySelector("#target");
    const parts = [...robot.querySelectorAll(".part")].sort((a, b) => a.dataset.part - b.dataset.part);
    const streakDisplay = document.querySelector("#streak");
    const streakDots = streakDisplay.querySelector(".streak-dots");
    const starPopup = document.querySelector("#starPopup");

    let selected = new Set([2]);
    let problem = { table: 2, other: 0, first: 0, second: 0, answer: 0, key: "" };
    let lastKey = "";
    let misses = {};
    let built = 0;
    let robotNumber = 0;
    let correctCount = 0;
    let answeredCount = 0;
    let stars = 0;
    let completed = {};
    let round = 1;
    let busy = false;
    let popupTimer = null;
    let advanceTimer = null;
    let advanceAfterPopup = false;

    try { stars = Number(localStorage.getItem("tabbi-stars")) || 0; } catch { stars = 0; }
    try { completed = JSON.parse(localStorage.getItem("tabbi-done")) || {}; } catch { completed = {}; }

    const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    for (let index = 0; index < PARTS; index++) streakDots.append(document.createElement("i"));

    function updateProgress() {
      streakDots.querySelectorAll("i").forEach((dot, index) => dot.classList.toggle("on", index < built));
      streakDisplay.setAttribute("aria-label", `${built} af ${PARTS} dele bygget`);
      parts.forEach((part, index) => part.classList.toggle("on", index < built));
    }

    function applyPalette() {
      const [main, dark] = PALETTES[robotNumber % PALETTES.length];
      scene.style.setProperty("--robot", main);
      scene.style.setProperty("--robot-dark", dark);
    }

    function say(text, tone) {
      bubble.hidden = !text;
      if (!text) return;
      bubble.textContent = text;
      bubble.className = `bubble ${tone || ""}`;
      void bubble.offsetWidth;
      bubble.classList.add("pop");
    }

    function react(name) {
      scene.classList.remove("cheer", "oops");
      void scene.offsetWidth;
      scene.classList.add(name);
    }

    function hideStarPopup() {
      clearTimeout(popupTimer);
      starPopup.hidden = true;
      for (const sparkle of starPopup.querySelectorAll(".sparkle")) sparkle.remove();
      if (advanceAfterPopup) goToNextQuestion();
    }

    function showStarPopup() {
      const card = starPopup.querySelector(".star-popup-card");
      for (const sparkle of card.querySelectorAll(".sparkle")) sparkle.remove();
      for (let index = 0; index < 14; index++) {
        const sparkle = document.createElement("span");
        const angle = (index / 14) * Math.PI * 2;
        const distance = 140 + Math.random() * 110;
        sparkle.className = "sparkle";
        sparkle.textContent = index % 2 ? "✨" : "⭐";
        sparkle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
        sparkle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
        sparkle.style.animationDelay = `${Math.random() * .25}s`;
        card.append(sparkle);
      }
      document.querySelector("#starTitle").textContent = stars > 1 ? `Stjerne nummer ${stars}!` : "Du fik en stjerne!";
      starPopup.hidden = false;
      clearTimeout(popupTimer);
      popupTimer = setTimeout(hideStarPopup, 4200);
      Topbar.refreshStars(true);
    }

    function awardStar() {
      stars++;
      try { localStorage.setItem("tabbi-stars", String(stars)); } catch { /* ingen lagring */ }
      if (selected.size === 1) {
        const [table] = selected;
        completed[table] = (completed[table] || 0) + 1;
        try { localStorage.setItem("tabbi-done", JSON.stringify(completed)); } catch { /* ingen lagring */ }
        renderTableButtons();
      }
      setTimeout(showStarPopup, reducedMotion() ? 0 : 1500);
    }

    starPopup.addEventListener("click", hideStarPopup);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !starPopup.hidden) hideStarPopup();
    });

    function goToNextQuestion() {
      if (built >= PARTS) {
        built = 0;
        robotNumber++;
        applyPalette();
        updateProgress();
      }
      round++;
      startRound();
    }

    // Spørgsmål, der er gået galt før, får større chance for at komme igen
    function pickProblem() {
      const pool = [];
      let total = 0;
      for (const table of selected) {
        for (let other = 0; other <= 10; other++) {
          const key = `${table}x${other}`;
          if (key === lastKey && selected.size * 11 > 1) continue;
          const weight = 1 + (misses[key] || 0) * 3;
          pool.push({ table, other, key, weight });
          total += weight;
        }
      }
      let roll = Math.random() * total;
      let chosen = pool[pool.length - 1];
      for (const item of pool) {
        roll -= item.weight;
        if (roll < 0) { chosen = item; break; }
      }
      return chosen;
    }

    function makeProblem() {
      const picked = pickProblem();
      const swap = Math.random() < .35;
      problem = {
        ...picked,
        first: swap ? picked.other : picked.table,
        second: swap ? picked.table : picked.other,
        answer: picked.table * picked.other
      };
      lastKey = picked.key;
      firstOperand.textContent = problem.first;
      secondOperand.textContent = problem.second;
    }

    function makeChoices() {
      const { first, second, answer } = problem;
      const candidates = [
        first + second,
        answer + first, answer - first,
        answer + second, answer - second,
        (first + 1) * second, (first - 1) * second,
        first * (second + 1), first * (second - 1),
        answer + 1, answer - 1, answer + 10, answer - 10
      ].filter(value => value >= 0 && value <= 100 && value !== answer);
      const choices = new Set([answer]);
      for (const value of [...new Set(candidates)].sort(() => Math.random() - .5)) {
        if (choices.size >= 4) break;
        choices.add(value);
      }
      while (choices.size < 4) choices.add(Math.floor(Math.random() * 31));
      return [...choices].sort(() => Math.random() - .5);
    }

    function updateHint() {
      const { first, second, table } = problem;
      const empty = first === 0 || second === 0;
      hintText.textContent = empty
        ? `${first} × ${second} betyder ${first} rækker med ${second} i hver. Der er ingen prikker, så svaret er 0. ${TIPS[table]}`
        : `${first} × ${second} betyder ${first} rækker med ${second} prikker i hver. Tæl dem alle. ${TIPS[table]}`;
      dotGrid.setAttribute("aria-label", `${first} rækker med ${second} prikker`);
      if (empty) {
        dotGrid.innerHTML = `<text x="320" y="82" text-anchor="middle" fill="#708099" font-size="22" font-weight="800" font-family="Trebuchet MS, sans-serif">Ingen prikker</text>`;
        return;
      }
      const cell = Math.min(580 / second, 138 / first, 34);
      const radius = cell * .36;
      const startX = (640 - second * cell) / 2 + cell / 2;
      const startY = (150 - first * cell) / 2 + cell / 2;
      let dots = "";
      for (let row = 0; row < first; row++) {
        for (let column = 0; column < second; column++) {
          dots += `<circle cx="${startX + column * cell}" cy="${startY + row * cell}" r="${radius}" fill="${ROW_COLORS[row % ROW_COLORS.length]}"/>`;
        }
      }
      dotGrid.innerHTML = `<title>${first} rækker med ${second} prikker</title>${dots}`;
    }

    function startRound() {
      clearTimeout(advanceTimer);
      advanceAfterPopup = false;
      busy = false;
      scene.classList.remove("cheer", "oops", "dance");
      roundDisplay.textContent = `Runde ${round}`;
      feedback.textContent = "";
      feedback.className = "feedback";
      nextButton.hidden = true;
      mathHint.hidden = true;
      hintToggle.setAttribute("aria-expanded", "false");
      hintToggle.textContent = "💡 Vis regnehjælp";
      if (built === 0) say("Hej! Jeg er Ari. Giv mig de rigtige batterier, så bygger du mig!");
      else bubble.hidden = true;
      makeProblem();
      answerContainer.replaceChildren();

      for (const choice of makeChoices()) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "answer";
        button.dataset.choice = choice;
        button.setAttribute("aria-label", `Svar ${choice}. Træk batteriet hen til Ari, eller tryk Enter.`);
        button.setAttribute("aria-describedby", "dragInstructions");
        button.innerHTML = `<span class="battery" aria-hidden="true"><span class="answer-number">${choice}</span></span>`;
        button.addEventListener("pointerdown", event => beginDrag(event, button, choice));
        button.addEventListener("click", event => {
          if (event.detail === 0) launch(button, choice, null, null);
        });
        answerContainer.append(button);
      }
    }

    function spark(x, y, symbol) {
      if (reducedMotion()) return;
      const element = document.createElement("span");
      element.className = "spark";
      element.textContent = symbol;
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      document.body.append(element);
      setTimeout(() => element.remove(), 850);
    }

    let pending = null;

    function beginDrag(event, button, choice) {
      if (!event.isPrimary || event.button !== 0 || button.disabled || pending || busy) return;
      event.preventDefault();
      button.focus();
      pending = {
        button,
        choice,
        pointerId: event.pointerId,
        origin: { x: event.clientX, y: event.clientY },
        rect: button.querySelector(".battery").getBoundingClientRect(),
        clone: null
      };
      button.setPointerCapture(event.pointerId);
    }

    function overScene(x, y) {
      const rect = scene.getBoundingClientRect();
      const margin = 24;
      return x >= rect.left - margin && x <= rect.right + margin && y >= rect.top - margin && y <= rect.bottom + margin;
    }

    function endDrag() {
      scene.classList.remove("drop-ready");
      if (!pending) return;
      pending.button.classList.remove("is-dragging");
      pending.clone?.remove();
      pending = null;
    }

    document.addEventListener("pointermove", event => {
      if (!pending || event.pointerId !== pending.pointerId) return;
      if (!pending.clone) {
        if (Math.hypot(event.clientX - pending.origin.x, event.clientY - pending.origin.y) < 8) return;
        const clone = pending.button.querySelector(".battery").cloneNode(true);
        clone.classList.add("dragged-battery");
        clone.setAttribute("aria-hidden", "true");
        clone.style.width = `${pending.rect.width}px`;
        clone.style.height = `${pending.rect.height}px`;
        document.body.append(clone);
        pending.clone = clone;
        pending.button.classList.add("is-dragging");
      }
      pending.clone.style.left = `${event.clientX - pending.rect.width / 2}px`;
      pending.clone.style.top = `${event.clientY - pending.rect.height / 2}px`;
      scene.classList.toggle("drop-ready", overScene(event.clientX, event.clientY));
    });

    document.addEventListener("pointerup", event => {
      if (!pending || event.pointerId !== pending.pointerId) return;
      const { button, choice, clone } = pending;
      if (!clone) {
        pending = null;
        launch(button, choice, null, null);
        return;
      }
      if (overScene(event.clientX, event.clientY)) {
        pending = null;
        scene.classList.remove("drop-ready");
        launch(button, choice, { x: event.clientX, y: event.clientY }, clone);
      } else {
        endDrag();
        feedback.className = "feedback";
        feedback.textContent = "Slip batteriet oppe ved Ari.";
      }
    });

    document.addEventListener("pointercancel", event => {
      if (pending && event.pointerId === pending.pointerId) endDrag();
    });

    function launch(button, choice, point, existing) {
      if (busy || button.disabled) {
        existing?.remove();
        return;
      }
      busy = true;
      const isCorrect = choice === problem.answer;
      const tile = button.querySelector(".battery").getBoundingClientRect();
      const origin = { x: tile.left + tile.width / 2, y: tile.top + tile.height / 2 };
      const start = point || origin;
      const goal = target.getBoundingClientRect();
      const end = { x: goal.left + goal.width / 2, y: goal.top + goal.height / 2 };

      const hit = () => {
        scoreShot(button, choice);
        spark(end.x, end.y, isCorrect ? "✨" : "⚡");
      };
      const finish = () => {
        button.classList.remove("is-dragging");
        if (!isCorrect) busy = false;
      };

      if (reducedMotion() || typeof Element.prototype.animate !== "function") {
        existing?.remove();
        hit();
        finish();
        return;
      }

      const flyer = existing || button.querySelector(".battery").cloneNode(true);
      flyer.classList.remove("dragged-battery");
      flyer.classList.add("flying");
      flyer.setAttribute("aria-hidden", "true");
      flyer.style.width = `${tile.width}px`;
      flyer.style.height = `${tile.height}px`;
      flyer.style.left = `${start.x - tile.width / 2}px`;
      flyer.style.top = `${start.y - tile.height / 2}px`;
      if (!flyer.isConnected) document.body.append(flyer);
      button.classList.add("is-dragging");

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      let frames;
      let duration;
      if (isCorrect) {
        duration = 700;
        frames = [
          { transform: "translate(0, 0) scale(1) rotate(0deg)", opacity: 1 },
          { transform: `translate(${dx * .5}px, ${dy * .5 - 70}px) scale(.85) rotate(-10deg)`, opacity: 1, offset: .55 },
          { transform: `translate(${dx}px, ${dy}px) scale(.3) rotate(-20deg)`, opacity: .2 }
        ];
      } else {
        duration = 1200;
        const backX = origin.x - start.x;
        const backY = origin.y - start.y;
        frames = [
          { transform: "translate(0, 0) scale(1) rotate(0deg)", opacity: 1 },
          { transform: `translate(${dx * .5}px, ${dy * .5 - 70}px) scale(.85) rotate(-10deg)`, offset: .25 },
          { transform: `translate(${dx}px, ${dy}px) scale(.7) rotate(-20deg)`, offset: .4 },
          { transform: `translate(${dx}px, ${dy - 14}px) scale(.7) rotate(25deg)`, offset: .46 },
          { transform: `translate(${backX * .5}px, ${(dy + backY) / 2 - 60}px) scale(.9) rotate(200deg)`, offset: .7 },
          { transform: `translate(${backX}px, ${backY}px) scale(1) rotate(360deg)`, opacity: 1 }
        ];
        setTimeout(hit, duration * .4);
      }

      const animation = flyer.animate(frames, { duration, easing: "cubic-bezier(.3,.7,.4,1)" });
      animation.onfinish = () => {
        flyer.remove();
        if (isCorrect) hit();
        finish();
      };
      animation.oncancel = () => {
        flyer.remove();
        busy = false;
      };
    }

    function scoreShot(button, choice) {
      const { first, second, answer, key } = problem;
      const isCorrect = choice === answer;
      const equation = `${first} × ${second} = ${answer}`;
      answeredCount++;
      feedback.className = "feedback";

      if (isCorrect) {
        correctCount++;
        misses[key] = Math.floor((misses[key] || 0) / 2);
        for (const tile of answerContainer.querySelectorAll(".answer")) tile.disabled = true;
        button.classList.add("is-right");
        const partIndex = built;
        built++;
        updateProgress();
        const part = parts[partIndex];
        part.classList.remove("pop");
        void part.getBBox();
        part.classList.add("pop");
        react("cheer");

        if (built >= PARTS) {
          scene.classList.add("dance");
          say(`${equation}! Jeg er færdig!`, "good");
          feedback.textContent = `Rigtigt! ${equation}. Ari er færdigbygget!`;
          awardStar();
          advanceAfterPopup = true;
        } else {
          say(`Rigtigt! ${equation}`, "good");
          feedback.textContent = `Rigtigt! ${equation}. Ari fik ${PART_NAMES[partIndex]}.`;
          advanceTimer = setTimeout(goToNextQuestion, 1900);
        }
        feedback.classList.add("good");
        nextButton.hidden = built >= PARTS;
        if (!nextButton.hidden) nextButton.focus();
        busy = built >= PARTS;
      } else {
        misses[key] = Math.min(5, (misses[key] || 0) + 1);
        button.disabled = true;
        button.classList.add("is-wrong");
        react("oops");
        say("Av! Det batteri passer ikke. Prøv igen!", "bad");
        feedback.textContent = "Næsten! Prøv et andet batteri, eller tryk på 💡 for hjælp.";
        feedback.classList.add("bad");
      }
      scoreDisplay.textContent = `Rigtige: ${correctCount} / ${answeredCount}`;
    }

    hintToggle.addEventListener("click", () => {
      const isOpening = mathHint.hidden;
      mathHint.hidden = !isOpening;
      hintToggle.setAttribute("aria-expanded", String(isOpening));
      hintToggle.textContent = isOpening ? "Skjul regnehjælp" : "💡 Vis regnehjælp";
      if (isOpening) updateHint();
    });

    function renderTableButtons() {
      tableButtonBox.replaceChildren();
      for (let table = 0; table <= 10; table++) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "control";
        button.dataset.table = table;
        button.setAttribute("aria-pressed", String(selected.has(table)));
        button.textContent = completed[table] ? `${table} ⭐` : String(table);
        button.addEventListener("click", () => {
          if (selected.has(table)) {
            if (selected.size === 1) return;
            selected.delete(table);
          } else {
            selected.add(table);
          }
          renderTableButtons();
          resetGame();
        });
        tableButtonBox.append(button);
      }
    }

    function setTables(list) {
      selected = new Set(list);
      renderTableButtons();
      resetGame();
    }

    document.querySelector("#allTables").addEventListener("click", () => setTables([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
    document.querySelector("#easyTables").addEventListener("click", () => setTables([0, 1, 2, 5, 10]));

    Topbar.init({ kid: "ari", controls: [settings] });

    function resetGame() {
      clearTimeout(advanceTimer);
      clearTimeout(popupTimer);
      starPopup.hidden = true;
      endDrag();
      correctCount = 0;
      answeredCount = 0;
      round = 1;
      built = 0;
      misses = {};
      lastKey = "";
      updateProgress();
      scoreDisplay.textContent = "Rigtige: 0 / 0";
      startRound();
    }

    nextButton.addEventListener("click", () => {
      clearTimeout(advanceTimer);
      if (!starPopup.hidden) return;
      advanceAfterPopup = false;
      goToNextQuestion();
      answerContainer.querySelector(".answer")?.focus();
    });

    robotNumber = stars % PALETTES.length;
    applyPalette();
    renderTableButtons();
    resetGame();
