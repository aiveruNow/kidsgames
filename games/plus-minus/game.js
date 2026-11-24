    const operationButtons = [...document.querySelectorAll(".operation")];
    const difficultyButtons = [...document.querySelectorAll(".difficulty")];
    const tableButtons = [...document.querySelectorAll(".table")];
    const tablesGroup = document.querySelector("#tablesGroup");
    const tablesLabel = document.querySelector("#tablesLabel");
    const maxGroup = document.querySelector("#maxGroup");
    const maxLabel = document.querySelector("#maxLabel");
    const firstOperand = document.querySelector("#first");
    const secondOperand = document.querySelector("#second");
    const operatorDisplay = document.querySelector("#operator");
    const answerContainer = document.querySelector("#answers");
    const scoreDisplay = document.querySelector("#score");
    const roundDisplay = document.querySelector("#round");
    const settings = document.querySelector("#settings");
    const feedback = document.querySelector("#feedback");
    const nextButton = document.querySelector("#next");
    const hintToggle = document.querySelector("#hintToggle");
    const mathHint = document.querySelector("#mathHint");
    const hintText = document.querySelector("#hintText");
    const numberLine = document.querySelector("#numberLine");
    const hoop = document.querySelector("#hoop");
    const lake = document.querySelector("#lake");

    // ---------- Lydeffekter (Web Audio, ingen lydfiler) ----------
    let audioCtx = null;
    let soundOn = Topbar.soundOn();
    window.addEventListener("topbar:sound", event => { soundOn = event.detail.on; });

    function audioReady() {
      try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
        return audioCtx.state === "running";
      } catch { return false; }
    }

    function tone(freq, dur = .2, type = "sine", vol = .15, delay = 0, slideTo = 0) {
      if (!soundOn || !audioReady()) return;
      try {
        const t = audioCtx.currentTime + delay;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol, t + .01);
        gain.gain.exponentialRampToValueAtTime(.001, t + dur);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + dur + .02);
      } catch { /* ingen lyd */ }
    }

    // Støj gennem et filter: bruges til sus, plask og net
    function noise(dur = .3, vol = .12, delay = 0, filterType = "bandpass", from = 1200, to = 0) {
      if (!soundOn || !audioReady()) return;
      try {
        const t = audioCtx.currentTime + delay;
        const buffer = audioCtx.createBuffer(1, Math.max(1, Math.floor(audioCtx.sampleRate * dur)), audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.setValueAtTime(from, t);
        if (to) filter.frequency.exponentialRampToValueAtTime(to, t + dur);
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol, t + .02);
        gain.gain.exponentialRampToValueAtTime(.001, t + dur);
        source.connect(filter).connect(gain).connect(audioCtx.destination);
        source.start(t);
      } catch { /* ingen lyd */ }
    }

    const sfx = {
      click() { tone(760, .05, "triangle", .08); },
      wrong() { tone(300, .22, "triangle", .1, 0, 160); },
      // Regnestykket springer frem
      pop() { tone(420, .12, "triangle", .14, 0, 840); tone(1050, .1, "sine", .06, .09); },
      // Bolden trækkes tilbage: højere tone, jo længere træk
      stretch(p) { tone(170 + p * 380, .07, "triangle", .06); },
      // Bolden skydes afsted
      kick(p = .6) { noise(.22, .13, 0, "bandpass", 500 + p * 800, 2600); tone(150, .12, "sine", .16, 0, 70); },
      // Bolden rammer ringen
      clang() { tone(660, .35, "triangle", .13); tone(990, .28, "sine", .07, .02); noise(.08, .09, 0, "highpass", 3000); },
      // Rigtigt svar: net og klokker
      swish() {
        noise(.5, .14, 0, "highpass", 2500, 900);
        [523, 659, 784, 1047].forEach((f, i) => tone(f, .32, "triangle", .13, .1 + i * .08));
      },
      splash() { noise(.5, .2, 0, "lowpass", 1800, 250); tone(260, .22, "sine", .1, 0, 90); },
      // Krokodillen æder bolden
      chomp() {
        [0, .16, .32].forEach(d => { tone(120, .1, "square", .1, d, 60); noise(.06, .08, d, "lowpass", 900); });
        tone(300, .3, "sawtooth", .06, .5, 110);
      },
      streak(n) { tone(440 + (n % 10) * 55, .16, "triangle", .1); tone(880 + (n % 10) * 110, .12, "sine", .05, .06); },
      fanfare() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .5, "triangle", .15, i * .11)); tone(2093, .6, "sine", .06, .6); }
    };

    let operation = "add";
    const OPERATORS = { add: ["+", "plus"], subtract: ["−", "minus"], multiply: ["×", "gange"] };
    const opSign = () => OPERATORS[operation][0];
    const opName = () => OPERATORS[operation][1];
    let selectedTables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    try {
      const saved = JSON.parse(localStorage.getItem("talbasket-tabeller"));
      if (Array.isArray(saved)) {
        const valid = selectedTables.filter(table => saved.includes(table));
        if (valid.length) selectedTables = valid;
      }
    } catch { /* ingen lagring */ }

    // Baner: hvert land kræver PER_COUNTRY rigtige svar. Når et kontinents lande er fundet, rejser man videre.
    const PER_COUNTRY = 6;
    const Geo = window.TalbasketGeo;
    const World = window.TalbasketWorld;
    const CONTINENTS = [
      { key: "europa", flyers: ["🕊️", "🎈"], theme: {} },
      { key: "afrika", flyers: ["🦅", "🦜"], theme: { "sky-top": "#ffd08a", "sky-bottom": "#fff0c9", "sky-ground": "#f6dca0", sun: "#ff9f1c", hills: "#e6c76f", "ground-a": "#d9a74e", "ground-b": "#c28d3a", "water-top": "#8fd6d0", "water-bottom": "#3a9aa3" } },
      { key: "asien", flyers: ["🪁", "🕊️"], theme: { "sky-top": "#ffc2d4", "sky-bottom": "#fff0f4", "sky-ground": "#e3f2c4", sun: "#ff6b6b", hills: "#b9d98a", "ground-a": "#8cc16a", "ground-b": "#6aa650", "water-top": "#8fd9d6", "water-bottom": "#2f9a9a" } },
      { key: "nordamerika", flyers: ["🦅", "🎈"], theme: { "sky-top": "#bcd8ff", "sky-bottom": "#eef5ff", "sky-ground": "#d5ecd0", hills: "#8fc78a", "ground-a": "#6fae6a", "ground-b": "#539a52", "water-top": "#7fc3f0", "water-bottom": "#2f7fc0" } },
      { key: "sydamerika", flyers: ["🦜", "🦋"], theme: { "sky-top": "#b9ecb0", "sky-bottom": "#eaffe0", "sky-ground": "#bfe8b0", hills: "#6fc46a", "ground-a": "#3fa85a", "ground-b": "#2f8f48", "water-top": "#6fd6b0", "water-bottom": "#2a9a78" } },
      { key: "australien", flyers: ["🦜", "🦋"], theme: { "sky-top": "#ffd0a0", "sky-bottom": "#fff0dc", "sky-ground": "#f4d2a8", sun: "#ff8c42", hills: "#e0a86a", "ground-a": "#d98c4a", "ground-b": "#c0733a", "water-top": "#6fd2f0", "water-bottom": "#2a95c8" } },
      { key: "antarktis", flyers: ["❄️", "❄️"], theme: { "sky-top": "#c4e2ff", "sky-bottom": "#f6fbff", "sky-ground": "#ffffff", sun: "#fff3b0", hills: "#eef6fb", "ground-a": "#ffffff", "ground-b": "#dcecf7", "water-top": "#9fdcf5", "water-bottom": "#4aa3d6" } }
    ];
    const LAST_CONTINENT = CONTINENTS.length - 1;
    const goalOf = (index) => Geo.countriesOf(CONTINENTS[index].key).length * PER_COUNTRY;
    let unlockedContinent = 0;
    let continentProgress = 0;
    let currentContinent = 0;
    let journeyDone = false;
    try {
      unlockedContinent = Math.min(LAST_CONTINENT, Math.max(0, Math.floor(Number(localStorage.getItem("talbasket-kontinent")) || 0)));
      continentProgress = Math.max(0, Math.floor(Number(localStorage.getItem("talbasket-kontinent-point")) || 0));
      journeyDone = localStorage.getItem("talbasket-faerdig") === "1";
    } catch { /* ingen lagring */ }
    continentProgress = Math.min(continentProgress, goalOf(unlockedContinent) - 1);
    if (journeyDone) { unlockedContinent = LAST_CONTINENT; continentProgress = goalOf(LAST_CONTINENT); }
    currentContinent = unlockedContinent;
    // Antal fundne lande i et kontinent
    const foundIn = (index) => {
      const total = Geo.countriesOf(CONTINENTS[index].key).length;
      if (index < unlockedContinent) return total;
      if (index > unlockedContinent) return 0;
      return Math.min(total, Math.floor(continentProgress / PER_COUNTRY));
    };
    const foundCountries = () => CONTINENTS.flatMap((continent, index) => Geo.countriesOf(continent.key).slice(0, foundIn(index)));
    const toNextCountry = () => PER_COUNTRY - (continentProgress % PER_COUNTRY);

    // Niveauet stiger automatisk med 10 for hver optjent stjerne (op til 100), men kan låses i menuen
    const LEVEL_STEP = 10;
    const LEVEL_CAP = 100;
    let levelSteps = 0;
    let autoLevel = true;
    let maximum = LEVEL_STEP;
    try { levelSteps = Number(localStorage.getItem("talbasket-trin")) || 0; } catch { levelSteps = 0; }
    const autoMaximum = () => Math.min(LEVEL_CAP, LEVEL_STEP * (levelSteps + 1));
    try {
      const saved = Number(localStorage.getItem("talbasket-niveau"));
      if ([10, 20, 50, 100].includes(saved)) { autoLevel = false; maximum = saved; }
    } catch { /* ingen lagring */ }
    if (autoLevel) maximum = autoMaximum();
    let first = 0;
    let second = 0;
    let answer = 0;
    let correctCount = 0;
    let answeredCount = 0;
    let streak = 0;
    let stars = 0;
    const STREAK_GOAL = 10;
    const streakDisplay = document.querySelector("#streak");
    const streakDots = streakDisplay.querySelector(".streak-dots");
    const starPopup = document.querySelector("#starPopup");
    const problemPopup = document.querySelector("#problemPopup");
    const problemEq = document.querySelector("#problemEq");
    let popupTimer = null;
    let levelUpMessage = "";
    let advanceTimer = null;
    let advanceAfterPopup = false;

    function goToNextQuestion() {
      round++;
      startRound();
    }

    try { stars = Number(localStorage.getItem("talbasket-stars")) || 0; } catch { stars = 0; }

    for (let index = 0; index < STREAK_GOAL; index++) streakDots.append(document.createElement("i"));

    function updateStreak() {
      const filled = streak % STREAK_GOAL;
      streakDots.querySelectorAll("i").forEach((dot, index) => dot.classList.toggle("on", index < filled));
      streakDisplay.setAttribute("aria-label", `${filled} rigtige i streg ud af ${STREAK_GOAL}`);
    }

    function hideStarPopup() {
      if (starPopup.hidden) return;
      clearTimeout(popupTimer);
      starPopup.hidden = true;
      for (const sparkle of starPopup.querySelectorAll(".sparkle")) sparkle.remove();
      runNextPopup();
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
      const levelUpEl = document.querySelector("#levelUp");
      levelUpEl.textContent = levelUpMessage;
      levelUpEl.hidden = !levelUpMessage;
      starPopup.hidden = false;
      clearTimeout(popupTimer);
      popupTimer = setTimeout(hideStarPopup, 4200);
      sfx.fanfare();
      Topbar.refreshStars(true);
    }

    function awardStar() {
      stars++;
      try { localStorage.setItem("talbasket-stars", String(stars)); } catch { /* ingen lagring */ }
      levelUpMessage = "";
      if (autoLevel && operation !== "multiply") {
        const before = maximum;
        levelSteps++;
        try { localStorage.setItem("talbasket-trin", String(levelSteps)); } catch { /* ingen lagring */ }
        maximum = autoMaximum();
        updateMenuLabel();
        if (maximum > before) levelUpMessage = `Nu bliver det lidt sværere: tal op til ${maximum} 🚀`;
      }
    }

    const popupDelay = () => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1600);
    const travelPopup = document.querySelector("#travelPopup");
    const foundPopup = document.querySelector("#foundPopup");
    const continentBadge = document.querySelector("#continentBadge");
    const spotLayer = document.querySelector("#spots");
    const skyLayer = document.querySelector("#sky");
    const SVG = "http://www.w3.org/2000/svg";
    let travelTimer = null;
    let popupQueue = [];

    // Popups efter et rigtigt svar står i kø: stjerne, nyt land, rejse. Først bagefter kommer næste spørgsmål.
    function runNextPopup() {
      const next = popupQueue.shift();
      if (next) { next(); return; }
      if (advanceAfterPopup) {
        advanceAfterPopup = false;
        goToNextQuestion();
      }
    }

    function queuePopups(list) {
      popupQueue = list;
      advanceAfterPopup = true;
      setTimeout(runNextPopup, popupDelay());
    }

    // ---------- Banen: farver, dyr og steder, flyvere ----------
    const SPOT_SLOTS = [
      { x: 120, y: 146, s: 30, type: "animal" }, { x: 190, y: 138, s: 30, type: "animal" },
      { x: 452, y: 138, s: 30, type: "animal" }, { x: 524, y: 146, s: 30, type: "animal" },
      { x: 238, y: 114, s: 34, type: "landmark" }, { x: 408, y: 112, s: 34, type: "landmark" }
    ];
    let metSpots = [];
    try { metSpots = JSON.parse(localStorage.getItem("talbasket-dyr")) || []; } catch { metSpots = []; }
    const shuffled = (list) => [...list].sort(() => Math.random() - 0.5);

    function applyScenery() {
      const continent = CONTINENTS[currentContinent];
      for (const key of ["sky-top", "sky-bottom", "sky-ground", "sun", "hills", "ground-a", "ground-b", "water-top", "water-bottom"]) {
        if (continent.theme[key]) lake.style.setProperty(`--${key}`, continent.theme[key]);
        else lake.style.removeProperty(`--${key}`);
      }
      lake.dataset.continent = continent.key;
      document.body.dataset.continent = continent.key;
      if (World) World.closeSpot();

      const geo = Geo.continent(continent.key);
      const animals = shuffled(geo.animals);
      const places = shuffled(geo.landmarks);
      const counters = { animal: 0, landmark: 0 };
      spotLayer.replaceChildren(...SPOT_SLOTS.map((slot, index) => {
        const item = (slot.type === "animal" ? animals : places)[counters[slot.type]++];
        const group = document.createElementNS(SVG, "g");
        group.setAttribute("class", `spot ${slot.type}${metSpots.includes(item.id) ? "" : " fresh"}`);
        group.setAttribute("transform", `translate(${slot.x} ${slot.y})`);
        group.setAttribute("role", "button");
        group.setAttribute("tabindex", "0");
        group.setAttribute("aria-label", item.name);
        group.style.setProperty("--d", `${(index * .37).toFixed(2)}s`);
        const hit = document.createElementNS(SVG, "circle");
        hit.setAttribute("r", "24");
        hit.setAttribute("cy", "-10");
        hit.setAttribute("fill", "transparent");
        const glow = document.createElementNS(SVG, "circle");
        glow.setAttribute("class", "spot-glow");
        glow.setAttribute("r", "17");
        glow.setAttribute("cy", "-9");
        const text = document.createElementNS(SVG, "text");
        text.setAttribute("class", "spot-emo");
        text.setAttribute("font-size", String(slot.s));
        text.setAttribute("text-anchor", "middle");
        text.textContent = item.emoji;
        // Dyr i højre side vender mod kurven; vendingen ligger på en indpakning, så CSS-animationen ikke fjerner den
        const holder = document.createElementNS(SVG, "g");
        if (slot.x > 320 && slot.type === "animal") holder.setAttribute("transform", "scale(-1 1)");
        holder.append(text);
        group.append(glow, hit, holder);
        const open = (event) => {
          event.stopPropagation();
          group.classList.remove("hop");
          void group.getBBox();
          group.classList.add("hop");
          group.classList.remove("fresh");
          if (!metSpots.includes(item.id)) {
            metSpots.push(item.id);
            try { localStorage.setItem("talbasket-dyr", JSON.stringify(metSpots)); } catch { /* ingen lagring */ }
          }
          sfx.pop();
          World.openSpot(item);
        };
        group.addEventListener("click", open);
        group.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(event); } });
        return group;
      }));
      skyLayer.replaceChildren();
    }

    // Små flyvere krydser himlen engang imellem
    function launchFlyer() {
      if (document.body.dataset.screen !== "play" || document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const flyers = CONTINENTS[currentContinent].flyers;
      const text = document.createElementNS(SVG, "text");
      const fromLeft = Math.random() < .5;
      const y = 34 + Math.random() * 40;
      text.textContent = flyers[Math.floor(Math.random() * flyers.length)];
      text.setAttribute("y", String(y));
      text.setAttribute("font-size", "22");
      skyLayer.append(text);
      const from = fromLeft ? -40 : 700;
      const to = fromLeft ? 700 : -40;
      text.animate([
        { transform: `translate(${from}px, 0px)` },
        { transform: `translate(${(from + to) / 2}px, -14px)`, offset: .5 },
        { transform: `translate(${to}px, 4px)` }
      ], { duration: 9000 + Math.random() * 4000, easing: "linear" }).onfinish = () => text.remove();
    }
    setInterval(launchFlyer, 9000);

    // Opdaterer kontinent-chippen øverst i banen: navn, fundne lande og vej til næste land
    function updateContinentUI() {
      const continent = CONTINENTS[currentContinent];
      const geo = Geo.continent(continent.key);
      const list = Geo.countriesOf(continent.key);
      const found = foundIn(currentContinent);
      const counting = currentContinent === unlockedContinent && !journeyDone;
      const flags = list.map((country, index) => {
        if (index < found) return `<i class="got">${World.flagSvg(country.id, "mini")}${country.kind === "place" ? `<b>${country.emoji}</b>` : ""}</i>`;
        return `<i class="${index === found && counting ? "nx" : ""}">?</i>`;
      }).join("");
      const left = counting ? toNextCountry() : 0;
      continentBadge.innerHTML = `<span class="hc-emoji" aria-hidden="true">${geo.emoji}</span><span class="hc-main"><span class="hc-name">${geo.name.replace(" og Oceanien", "")}</span><span class="hc-flags">${flags}</span></span>${counting ? `<span class="hc-bar" aria-hidden="true"><i style="width:${(continentProgress % PER_COUNTRY) / PER_COUNTRY * 100}%"></i></span>` : ""}`;
      continentBadge.setAttribute("aria-label", counting
        ? `${geo.name}: ${found} af ${list.length} fundet. Skyd ${left} rigtige mere for at finde næste land. Tryk for at åbne bogen.`
        : `${geo.name}: ${found} af ${list.length} fundet. Tryk for at åbne bogen.`);
    }

    // Et rigtigt svar tæller mod næste land. Returnerer, hvad der skete: nyt land, rejse eller færdig tur
    function addContinentProgress() {
      if (journeyDone || currentContinent !== unlockedContinent) return null;
      continentProgress++;
      const result = { country: null, travel: false, done: false };
      const key = CONTINENTS[unlockedContinent].key;
      if (continentProgress % PER_COUNTRY === 0) result.country = Geo.countriesOf(key)[continentProgress / PER_COUNTRY - 1];
      if (continentProgress >= goalOf(unlockedContinent)) {
        if (unlockedContinent >= LAST_CONTINENT) {
          journeyDone = true;
          result.done = true;
        } else {
          unlockedContinent++;
          currentContinent = unlockedContinent;
          continentProgress = 0;
          result.travel = true;
        }
      }
      try {
        localStorage.setItem("talbasket-kontinent", String(unlockedContinent));
        localStorage.setItem("talbasket-kontinent-point", String(continentProgress));
        if (journeyDone) localStorage.setItem("talbasket-faerdig", "1");
      } catch { /* ingen lagring */ }
      if (result.travel || result.done) {
        stars++;
        try { localStorage.setItem("talbasket-stars", String(stars)); } catch { /* ingen lagring */ }
      }
      return result;
    }

    function showFoundPopup(country) {
      const geo = Geo.continent(country.cont);
      document.querySelector("#foundFlag").innerHTML = country.kind === "place" ? `<span class="place-emoji big">${country.emoji}</span>` : World.flagSvg(country.id, "big");
      document.querySelector("#foundName").textContent = country.name;
      document.querySelector("#foundText").textContent = country.kind === "place"
        ? `Nyt sted i ${geo.name.replace(" og Oceanien", "")}. Tryk for at høre mere.`
        : `${country.name} ligger i ${geo.name.replace(" og Oceanien", "")}. Hovedstaden hedder ${country.capital}.`;
      foundPopup.dataset.id = country.id;
      foundPopup.dataset.cont = country.cont;
      const card = foundPopup.querySelector(".star-popup-card");
      for (const sparkle of card.querySelectorAll(".sparkle")) sparkle.remove();
      for (let index = 0; index < 12; index++) {
        const sparkle = document.createElement("span");
        const angle = (index / 12) * Math.PI * 2;
        const distance = 130 + Math.random() * 90;
        sparkle.className = "sparkle";
        sparkle.textContent = index % 2 ? "✨" : "🌟";
        sparkle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
        sparkle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
        sparkle.style.animationDelay = `${Math.random() * .25}s`;
        card.append(sparkle);
      }
      foundPopup.hidden = false;
      updateContinentUI();
      sfx.fanfare();
    }

    function hideFoundPopup(then) {
      if (foundPopup.hidden) return;
      foundPopup.hidden = true;
      then();
    }

    document.querySelector("#foundGo").addEventListener("click", () => hideFoundPopup(() => {
      sfx.click();
      // Det nye land får et geografi-skud med det samme
      if (qMode !== "math") geoFocus = foundPopup.dataset.id;
      runNextPopup();
    }));
    document.querySelector("#foundSee").addEventListener("click", () => hideFoundPopup(() => {
      sfx.click();
      if (qMode !== "math") geoFocus = foundPopup.dataset.id;
      World.openBook(foundPopup.dataset.cont, foundPopup.dataset.id, { onClose: runNextPopup });
    }));

    function showTravelPopup() {
      const continent = CONTINENTS[currentContinent];
      const geo = Geo.continent(continent.key);
      applyScenery();
      updateContinentUI();
      document.querySelector("#travelEmoji").textContent = journeyDone ? "🏆" : geo.emoji;
      document.querySelector("#travelTitle").textContent = journeyDone ? "Du har rejst jorden rundt!" : `Du rejser til ${geo.name.replace(" og Oceanien", "")}!`;
      document.querySelector("#travelText").textContent = journeyDone
        ? "Alle lande og steder er fundet. +1 ⭐"
        : `Alle landene er fundet. Ny bane låst op. +1 ⭐`;
      travelPopup.hidden = false;
      clearTimeout(travelTimer);
      travelTimer = setTimeout(hideTravelPopup, 6000);
      sfx.fanfare();
      Topbar.refreshStars(true);
    }

    function hideTravelPopup() {
      if (travelPopup.hidden) return;
      clearTimeout(travelTimer);
      travelPopup.hidden = true;
      runNextPopup();
    }

    travelPopup.addEventListener("click", hideTravelPopup);

    starPopup.addEventListener("click", hideStarPopup);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !starPopup.hidden) hideStarPopup();
      if (event.key === "Escape" && !problemPopup.hidden) hideProblemPopup();
      if (event.key === "Escape" && !travelPopup.hidden) hideTravelPopup();
    });
    updateStreak();
    let round = 1;
    // Højst 10 at lægge til eller trække fra, så børn kan tælle på fingrene
    const MAX_TERM = 10;

    function randomInteger(max) {
      return Math.floor(Math.random() * max) + 1;
    }

    // ---------- Geografi-skud: flag som svar ----------
    let qMode = "mix";
    try {
      const savedMode = localStorage.getItem("talbasket-spoergsmaal");
      if (["mix", "math", "geo"].includes(savedMode)) qMode = savedMode;
    } catch { /* ingen lagring */ }
    const GEO_EVERY = 4;
    let geoCountdown = 3;
    let geoFocus = null;
    let isGeo = false;
    let geoQ = null;
    let lastGeoId = null;
    const geoQuestion = document.querySelector("#geoQ");
    const promptEl = document.querySelector("#prompt");
    const pick = (list) => list[Math.floor(Math.random() * list.length)];

    // Lande, man kan blive spurgt om: dem man har fundet (med flag). I "kun geografi" uden fundne lande bruges banens egne lande.
    function geoPool() {
      let pool = foundCountries().filter((country) => country.kind === "country");
      if (!pool.length && qMode === "geo") pool = Geo.countriesOf(CONTINENTS[currentContinent].key).filter((country) => country.kind === "country");
      if (!pool.length) pool = Geo.countries.filter((country) => country.kind === "country").slice(0, 5);
      return pool;
    }

    function wantGeo() {
      if (qMode === "math") return false;
      if (qMode === "geo" || geoFocus) return true;
      return foundCountries().some((country) => country.kind === "country") && geoCountdown <= 0;
    }

    function makeGeoProblem() {
      const pool = geoPool();
      let target = geoFocus ? Geo.country(geoFocus) : null;
      geoFocus = null;
      if (!target || target.kind !== "country") {
        const candidates = pool.filter((country) => country.id !== lastGeoId);
        target = pick(candidates.length ? candidates : pool);
      }
      lastGeoId = target.id;
      const type = pick(["flag", "capital", "currency"]);
      geoQ = { type, country: target };
      isGeo = true;
      answer = target.id;
      const name = target.name;
      geoQuestion.innerHTML = type === "flag"
        ? `<span class="gq-ico" aria-hidden="true">🏳️</span><span class="gq-lbl">Hvilket flag har</span><span class="gq-name">${name}?</span>`
        : type === "capital"
          ? `<span class="gq-ico" aria-hidden="true">🏙️</span><span class="gq-name">${target.capital}</span><span class="gq-lbl">er hovedstaden i …</span>`
          : `<span class="gq-ico" aria-hidden="true">💰</span><span class="gq-name">${target.currency}</span><span class="gq-lbl">bruger man i …</span>`;
    }

    // Tre andre lande som svarmuligheder: helst lande, man har mødt
    function geoChoices() {
      const target = geoQ.country;
      // To lande med samme valuta (fx euro) må ikke begge være svarmuligheder
      const clash = (country) => geoQ.type === "currency" && country.currency === target.currency;
      const others = (list) => shuffled(list.filter((country) => country.kind === "country" && country.id !== target.id && !clash(country)));
      const picked = [];
      for (const list of [foundCountries(), Geo.countriesOf(target.cont), Geo.countries]) {
        for (const country of others(list)) {
          if (picked.length >= 3) break;
          if (!picked.includes(country.id)) picked.push(country.id);
        }
      }
      return shuffled([target.id, ...picked]);
    }

    function makeProblem() {
      isGeo = false;
      geoQ = null;
      if (wantGeo()) {
        geoCountdown = GEO_EVERY;
        makeGeoProblem();
        return;
      }
      geoCountdown--;
      if (operation === "multiply") {
        // Undgå at få præcis samme stykke to gange i træk
        let table, factor;
        do {
          table = selectedTables[Math.floor(Math.random() * selectedTables.length)];
          factor = randomInteger(10);
        } while (table === first && factor === second);
        first = table;
        second = factor;
        answer = first * second;
      } else if (operation === "add") {
        first = randomInteger(maximum - 1);
        second = randomInteger(Math.min(MAX_TERM, maximum - first));
        answer = first + second;
      } else {
        first = randomInteger(maximum);
        second = randomInteger(Math.min(MAX_TERM, first));
        answer = first - second;
      }

      firstOperand.textContent = first;
      secondOperand.textContent = second;
      operatorDisplay.textContent = opSign();
      operatorDisplay.setAttribute("aria-label", opName());
    }

    function makeChoices() {
      if (isGeo) return geoChoices();
      const choices = new Set([answer]);
      if (operation === "multiply") {
        // Lokkende fejlsvar: nabo-produkter i samme tabel og med byttede tal
        const near = [answer - first, answer + first, answer - second, answer + second, answer - 1, answer + 1, (first + 1) * second, (second + 1) * first]
          .filter(value => value >= 0 && value !== answer);
        for (const value of near.sort(() => Math.random() - 0.5)) {
          if (choices.size >= 4) break;
          choices.add(value);
        }
        while (choices.size < 4) choices.add(Math.floor(Math.random() * 101));
      } else {
        while (choices.size < 4) choices.add(Math.floor(Math.random() * (maximum + 1)));
      }
      return [...choices].sort(() => Math.random() - 0.5);
    }

    function updateMultiplyHint() {
      hintText.textContent = `Tæl i spring af ${first}, ${second} gange: ${first} × ${second} er ${second} ${second === 1 ? "gang" : "gange"} ${first}.`;
      numberLine.setAttribute("aria-label", `Tæl i spring af ${first} i ${second} gange. Svaret er ${answer}.`);
      const slot = Math.min(62, 600 / second);
      const startX = (640 - slot * second) / 2;
      let chips = "";
      for (let i = 1; i <= second; i++) {
        const centerX = startX + slot * (i - 0.5);
        const delay = (0.4 + (i - 1) * 0.7).toFixed(1);
        const isLast = i === second;
        const size = second > 7 ? 18 : 24;
        chips += `
          <rect class="finger" x="${(centerX - slot * .42).toFixed(1)}" y="22" width="${(slot * .84).toFixed(1)}" height="64" rx="14" fill="${isLast ? "#d9f7e6" : "#e8f1ff"}" stroke="${isLast ? "#2e9e44" : "#9ab8e9"}" stroke-width="2.5" style="animation-delay:${delay}s"/>
          <text class="count-num" x="${centerX.toFixed(1)}" y="64" text-anchor="middle" font-size="${size}" font-weight="900" fill="${isLast ? "#13804f" : "#2764c5"}" font-family="Trebuchet MS, sans-serif" style="animation-delay:${delay}s">${first * i}</text>`;
      }
      numberLine.innerHTML = `<title>Tæl i spring af ${first}</title>${chips}`;
    }

    function updateHint() {
      if (operation === "multiply") { updateMultiplyHint(); return; }
      const isAddition = operation === "add";
      // Største tal i hovedet, mindste tal på fingrene, og så tælles der op (plus) eller ned (minus)
      const head = isAddition ? Math.max(first, second) : first;
      const fingers = isAddition ? Math.min(first, second) : second;
      const step = isAddition ? 1 : -1;
      hintText.textContent = isAddition
        ? `Tag det største tal, ${head}, i hovedet. Tag det mindste, ${fingers}, på fingrene, og tæl op: Hvad kommer efter ${head}?`
        : `Tag ${head} i hovedet. Tag ${fingers} på fingrene, og tæl baglæns: Hvad kommer før ${head}?`;
      numberLine.setAttribute("aria-label", `${head} i hovedet og ${fingers} fingre. Tæl ${isAddition ? "op" : "baglæns"} fra ${head}.`);

      const slot = Math.min(52, 410 / fingers);
      const fingerWidth = slot * .68;
      const startX = 215 + (410 - slot * fingers) / 2;
      let hand = "";
      for (let i = 1; i <= fingers; i++) {
        const number = head + step * i;
        const centerX = startX + slot * (i - 0.5);
        const delay = (0.6 + (i - 1) * 0.9).toFixed(1);
        const isLast = i === fingers;
        hand += `
          <rect class="finger" x="${(centerX - fingerWidth / 2).toFixed(1)}" y="22" width="${fingerWidth.toFixed(1)}" height="74" rx="${(fingerWidth / 2).toFixed(1)}" fill="#ffcf9e" stroke="#e0a56b" stroke-width="2" style="animation-delay:${delay}s"/>
          <text class="count-num" x="${centerX.toFixed(1)}" y="128" text-anchor="middle" font-size="${fingers > 7 ? 22 : 28}" font-weight="900" fill="${isLast ? "#13804f" : "#2879bd"}" font-family="Trebuchet MS, sans-serif" style="animation-delay:${delay}s">${number}</text>`;
      }

      numberLine.innerHTML = `
        <title>Tæl videre fra ${head} med ${fingers} fingre</title>
        <rect x="18" y="14" width="160" height="112" rx="22" fill="#fff" stroke="#9ab8e9" stroke-width="3"/>
        <text x="98" y="56" text-anchor="middle" font-size="38">🧠</text>
        <text x="98" y="108" text-anchor="middle" font-size="46" font-weight="900" fill="#2764c5" font-family="Trebuchet MS, sans-serif">${head}</text>
        <rect x="${(startX - 6).toFixed(1)}" y="92" width="${(slot * fingers + 12).toFixed(1)}" height="14" rx="7" fill="#f4b57f"/>
        ${hand}`;
    }

    function showProblemPopup() {
      Topbar.closeMenu();
      if (isGeo) {
        const target = geoQ.country;
        problemEq.innerHTML = `<span class="geo-pop">${geoQuestion.innerHTML}</span>`;
        problemPopup.querySelector(".problem-label").textContent = "Find landet!";
        problemPopup.setAttribute("aria-label", `Geografi: ${geoQuestion.textContent}. Tryk for at starte.`);
        void target;
      } else {
        problemEq.innerHTML = `<span class="n">${first}</span><span class="op">${opSign()}</span><span class="n">${second}</span><span class="eqs">=</span><span class="n q">?</span>`;
        problemPopup.querySelector(".problem-label").textContent = "Regn det ud!";
        problemPopup.setAttribute("aria-label", `Regnestykke: ${first} ${opName()} ${second}. Tryk for at starte.`);
      }
      problemPopup.hidden = false;
      problemPopup.focus({ preventScroll: true });
      sfx.pop();
    }

    function hideProblemPopup() {
      if (problemPopup.hidden) return;
      problemPopup.hidden = true;
      sfx.click();
      // Geografi-spørgsmålet læses højt, når man trykker for at starte
      if (isGeo && geoQ) {
        const line = geoQ.country.q[geoQ.type];
        World.speak(line.file, line.text);
      }
    }

    problemPopup.addEventListener("click", hideProblemPopup);

    function startRound() {
      clearTimeout(advanceTimer);
      advanceAfterPopup = false;
      if (World) World.stopSpeech();
      clearShots();
      roundDisplay.textContent = `Runde ${round}`;
      feedback.textContent = "";
      feedback.className = "feedback";
      nextButton.hidden = true;
      mathHint.hidden = true;
      hoop.classList.remove("scored");
      makeProblem();
      document.body.classList.toggle("geo-round", isGeo);
      geoQuestion.hidden = !isGeo;
      promptEl.textContent = isGeo ? "Skyd flaget, der passer" : "Hvad giver regnestykket?";
      hintToggle.setAttribute("aria-expanded", "false");
      hintToggle.textContent = isGeo ? "📖 Slå op i bogen" : "💡 Vis regnehjælp";
      answerContainer.replaceChildren();

      for (const choice of makeChoices()) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "answer";
        button.dataset.choice = String(choice);
        const country = isGeo ? Geo.country(choice) : null;
        button.setAttribute("aria-label", `Svar ${country ? country.name : choice}. Træk bolden tilbage og skyd mod kurven, eller tryk Enter.`);
        button.setAttribute("aria-describedby", "dragInstructions");
        button.innerHTML = isGeo
          ? `<span class="ball flag-ball" aria-hidden="true">${World.flagSvg(choice, "ball-flag")}</span>`
          : `<span class="ball" aria-hidden="true"><span class="answer-number">${choice}</span></span>`;
        button.addEventListener("pointerdown", event => beginDrag(event, button, choice));
        button.addEventListener("click", event => {
          if (event.detail === 0) submitShot(button, choice);
          else if (ignoreNextClick) {
            ignoreNextClick = false;
            event.preventDefault();
          }
        });
        answerContainer.append(button);
      }
      showProblemPopup();
    }

    function clearShots() {
      if (activeDrag) activeDrag.button.classList.remove("is-dragging");
      activeDrag?.ball.remove();
      activeDrag = null;
      if (flight) cancelAnimationFrame(flight.frame);
      flight = null;
      clearAim();
      clearEffects();
      lake.classList.remove("splash");
      for (const ball of document.querySelectorAll(".flying-ball, .dragged-ball")) {
        for (const animation of ball.getAnimations()) animation.cancel();
        ball.remove();
      }
    }

    function animateShot(source, isCorrect) {
      audioReady();
      sfx.kick(.6);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const ballSource = source.querySelector(".ball");
      if (!ballSource) return;

      const from = ballSource.getBoundingClientRect();
      const startX = from.left + from.width / 2;
      const startY = from.top + from.height / 2;
      let targetElement = hoop.querySelector(".rim-target");
      if (!isCorrect) {
        // Vælg den side af søen som bolden kommer fra
        const waterSpots = [...lake.querySelectorAll(".water-target")];
        targetElement = waterSpots.reduce((best, spot) => {
          const rect = spot.getBoundingClientRect();
          const bestRect = best.getBoundingClientRect();
          return Math.abs(rect.left + rect.width / 2 - startX) < Math.abs(bestRect.left + bestRect.width / 2 - startX) ? spot : best;
        });
      }
      const target = targetElement.getBoundingClientRect();
      const endX = target.left + target.width / 2;
      const endY = target.top + target.height / 2;
      const ball = document.createElement("span");
      const size = 38;
      ball.classList.add("flying-ball");
      ball.setAttribute("aria-hidden", "true");
      ball.style.width = `${size}px`;
      ball.style.height = `${size}px`;
      ball.style.left = `${startX - size / 2}px`;
      ball.style.top = `${startY - size / 2}px`;
      if (!ball.isConnected) document.body.append(ball);

      if (reducedMotion || typeof ball.animate !== "function") {
        ball.remove();
        if (isCorrect) hoop.classList.add("scored");
        return;
      }

      const dx = endX - startX;
      const dy = endY - startY;
      const frames = isCorrect ? [
        { transform: "translate(0, 0) scale(1) rotate(0deg)" },
        { transform: `translate(${dx * .48}px, ${dy * .48 - 82}px) scale(.84) rotate(270deg)` },
        { transform: `translate(${dx * .82}px, ${dy * .82 - 25}px) scale(.68) rotate(540deg)` },
        { transform: `translate(${dx}px, ${dy}px) scale(.5) rotate(760deg)` }
      ] : [
        { transform: "translate(0, 0) scale(1) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx * .5}px, ${dy * .5 - 70}px) scale(.82) rotate(270deg)`, opacity: 1 },
        { transform: `translate(${dx}px, ${dy - 6}px) scale(.55) rotate(560deg)`, opacity: 1, offset: .72 },
        { transform: `translate(${dx}px, ${dy + 10}px) scale(.3) rotate(640deg)`, opacity: 0 }
      ];

      const animation = ball.animate(frames, { duration: isCorrect ? 780 : 980, easing: "cubic-bezier(.2,.72,.28,1)" });

      animation.onfinish = () => {
        ball.remove();
        const label = isGeo ? source.dataset.choice : source.querySelector(".answer-number").textContent;
        const radius = ballRadiusUnits(size);
        if (isCorrect) playBasket(endX, endY, label, radius);
        else playCroc(endX, endY, label, radius);
      };
      animation.oncancel = () => ball.remove();
    }

    let activeDrag = null;
    let ignoreNextClick = false;
    let flight = null;

    const GRAVITY = 1600;
    const POWER = 4.5;
    const HOOP_MAGNET = 2.6;
    const MAX_PULL = 120;
    const MIN_PULL = 24;
    const SIM_STEP = 1 / 120;
    const aimCanvas = document.createElement("canvas");
    aimCanvas.className = "aim-canvas";
    aimCanvas.setAttribute("aria-hidden", "true");
    document.body.append(aimCanvas);
    const aimContext = aimCanvas.getContext("2d");

    function hoopGeometry() {
      const rim = hoop.querySelector(".rim-target").getBoundingClientRect();
      const water = lake.querySelector(".water-surface").getBoundingClientRect();
      const rimY = rim.top + rim.height / 2;
      // Pixel pr. billedenhed og ringens midte uden sidebevægelse, så kurvens plads kan regnes ud til ethvert tidspunkt
      const pixelsPerUnit = rim.width / (68 * hoopScale());
      const restX = rim.left + rim.width / 2 - pixelsPerUnit * hoopOffset(performance.now());
      return {
        rimX: rim.left + rim.width / 2,
        rimXAt: time => restX + pixelsPerUnit * hoopOffset(time),
        rimY,
        rimHalf: rim.width / 2,
        netBottom: rimY + rim.width * .7,
        water: { x: water.left + water.width / 2, y: water.top + water.height / 2, rx: water.width / 2 * .92, ry: water.height / 2 * .92 }
      };
    }

    function inWater(geo, x, y) {
      const { water } = geo;
      return ((x - water.x) / water.rx) ** 2 + ((y - water.y) / water.ry) ** 2 <= 1;
    }

    // clock er tidspunktet (ms) hvor bolden forlader hånden; kurven kan nemlig bevæge sig, mens bolden er i luften
    function simulate(start, velocity, geo, { detectHoop = true, maxTime = 4, tolerance = geo.rimHalf * .85, clock = performance.now() } = {}) {
      let { x, y } = start;
      let { vx, vy } = velocity;
      const points = [{ x, y }];
      const result = { points, hit: false, water: false };

      for (let time = SIM_STEP; time <= maxTime; time += SIM_STEP) {
        const previousX = x;
        const previousY = y;
        vy += GRAVITY * SIM_STEP;
        x += vx * SIM_STEP;
        y += vy * SIM_STEP;

        if (detectHoop && vy > 0 && previousY < geo.rimY && y >= geo.rimY) {
          const crossX = previousX + (x - previousX) * (geo.rimY - previousY) / (y - previousY);
          const center = geo.rimXAt(clock + time * 1000);
          if (Math.abs(crossX - center) <= tolerance) {
            points.push({ x: crossX, y: geo.rimY });
            result.hit = true;
            result.crossX = crossX;
            result.center = center;
            return result;
          }
        }

        points.push({ x, y });
        if (vy > 0 && inWater(geo, x, y)) {
          result.water = true;
          return result;
        }
        if (y > window.innerHeight + 80 || x < -200 || x > window.innerWidth + 200) return result;
      }
      return result;
    }

    function launchVelocity(drag, pull, clock) {
      const velocity = { vx: -pull.x * drag.speedPerPixel, vy: -pull.y * drag.speedPerPixel };
      // Kurven trækker i kastet: er bolden tæt på, drejes den ind mod midten af ringen
      const rough = simulate(drag.start, velocity, drag.geo, { tolerance: drag.geo.rimHalf * HOOP_MAGNET, clock });
      if (rough.hit) {
        const flightTime = (rough.points.length - 1) * SIM_STEP;
        velocity.vx += (rough.center - rough.crossX) * .9 / flightTime;
      }
      return velocity;
    }

    function clearAim() {
      aimContext.setTransform(1, 0, 0, 1, 0, 0);
      aimContext.clearRect(0, 0, aimCanvas.width, aimCanvas.height);
    }

    function drawAim(drag) {
      const ratio = window.devicePixelRatio || 1;
      const width = Math.round(window.innerWidth * ratio);
      const height = Math.round(window.innerHeight * ratio);
      if (aimCanvas.width !== width || aimCanvas.height !== height) {
        aimCanvas.width = width;
        aimCanvas.height = height;
      }
      clearAim();
      aimContext.setTransform(ratio, 0, 0, ratio, 0, 0);

      const ballCenter = { x: drag.start.x + drag.pull.x, y: drag.start.y + drag.pull.y };
      aimContext.lineCap = "round";
      aimContext.strokeStyle = "#8b4a1f";
      aimContext.lineWidth = 5;
      aimContext.beginPath();
      aimContext.moveTo(drag.start.x, drag.start.y);
      aimContext.lineTo(ballCenter.x, ballCenter.y);
      aimContext.stroke();

      if (Math.hypot(drag.pull.x, drag.pull.y) < MIN_PULL) return;

      const clock = performance.now();
      const preview = simulate(drag.start, launchVelocity(drag, drag.pull, clock), drag.geo, { maxTime: 1.3, clock });
      const stride = 5;
      for (let index = stride; index < preview.points.length; index += stride) {
        const point = preview.points[index];
        const fade = 1 - index / preview.points.length * .6;
        aimContext.beginPath();
        aimContext.arc(point.x, point.y, 5.5 * fade, 0, Math.PI * 2);
        aimContext.fillStyle = "#ed8a45";
        aimContext.fill();
        aimContext.lineWidth = 2;
        aimContext.strokeStyle = "#fff";
        aimContext.stroke();
      }
    }

    const SVG_NS = "http://www.w3.org/2000/svg";
    const lakeSvg = lake.querySelector("svg");
    const effects = lakeSvg.querySelector("#effects");
    const crocClipRect = lakeSvg.querySelector("#crocClipRect");
    let effectTimers = [];

    function prefersReducedMotion() {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function clientToSvg(clientX, clientY) {
      const point = lakeSvg.createSVGPoint();
      point.x = clientX;
      point.y = clientY;
      return point.matrixTransform(lakeSvg.getScreenCTM().inverse());
    }

    function ballRadiusUnits(diameterPx) {
      return diameterPx / 2 / lakeSvg.getScreenCTM().a;
    }

    function clearEffects() {
      for (const timer of effectTimers) clearTimeout(timer);
      effectTimers = [];
      effects.replaceChildren();
      for (const leftover of hoop.querySelectorAll(".net-ball")) leftover.remove();
    }

    function later(callback, delay) {
      effectTimers.push(setTimeout(callback, delay));
    }

    function showScored() {
      sfx.swish();
      hoop.classList.remove("scored");
      void hoop.getBoundingClientRect();
      hoop.classList.add("scored");
    }

    function splashAtSvg(x, y) {
      for (const ring of lake.querySelectorAll(".ring")) {
        ring.setAttribute("cx", x);
        ring.setAttribute("cy", y);
      }
      lake.classList.remove("splash");
      void lake.getBoundingClientRect();
      lake.classList.add("splash");
    }

    function showSplash(clientX, clientY) {
      sfx.splash();
      const local = clientToSvg(clientX, clientY);
      splashAtSvg(local.x, local.y);
    }

    let flagClipCount = 0;
    function ballMarkup(radius, label) {
      // Flag-bold (geografi-skud): flaget klippes rundt og får bolden sømme oven på
      const flagInner = window.TalbasketFlag ? window.TalbasketFlag.inner(String(label)) : "";
      if (flagInner) {
        const clipId = `fbc${++flagClipCount}`;
        return `
        <clipPath id="${clipId}"><circle r="${radius}"/></clipPath>
        <g clip-path="url(#${clipId})"><svg x="${-radius}" y="${-radius}" width="${radius * 2}" height="${radius * 2}" viewBox="0 0 60 40" preserveAspectRatio="xMidYMid slice">${flagInner}</svg></g>
        <path d="M0 ${-radius}V${radius}M${-radius} 0H${radius}" fill="none" stroke="#39251d" stroke-opacity=".55" stroke-width="${radius * .08}"/>
        <circle r="${radius}" fill="none" stroke="#9d421c" stroke-width="${radius * .12}"/>`;
      }
      const fontSize = radius * (String(label).length > 2 ? .85 : 1.1);
      return `
        <circle r="${radius}" fill="url(#ball-shade)" stroke="#9d421c" stroke-width="${radius * .12}"/>
        <path d="M0 ${-radius}V${radius}M${-radius} 0H${radius}M${-radius * .72} ${-radius * .72}Q${-radius * .2} 0 ${-radius * .72} ${radius * .72}M${radius * .72} ${-radius * .72}Q${radius * .2} 0 ${radius * .72} ${radius * .72}" fill="none" stroke="#39251d" stroke-width="${radius * .1}"/>
        <text y="${fontSize * .36}" text-anchor="middle" font-size="${fontSize}" font-weight="900" fill="#fff" stroke="#6e2c14" stroke-width="${radius * .14}" paint-order="stroke" font-family="Trebuchet MS, sans-serif">${label}</text>`;
    }

    function popText(x, y, text, fill) {
      const label = document.createElementNS(SVG_NS, "text");
      label.textContent = text;
      label.setAttribute("x", x);
      label.setAttribute("y", y);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "30");
      label.setAttribute("font-weight", "900");
      label.setAttribute("fill", fill);
      label.setAttribute("stroke", "#fff");
      label.setAttribute("stroke-width", "7");
      label.setAttribute("paint-order", "stroke");
      label.setAttribute("font-family", "Trebuchet MS, sans-serif");
      label.style.transformOrigin = `${x}px ${y}px`;
      effects.append(label);
      label.animate([
        { transform: "translate(0px, 10px) scale(.3)", opacity: 0 },
        { transform: "translate(0px, -6px) scale(1.25)", opacity: 1, offset: .3 },
        { transform: "translate(0px, -18px) scale(1)", opacity: 1, offset: .75 },
        { transform: "translate(0px, -32px) scale(1)", opacity: 0 }
      ], { duration: 1200, easing: "ease-out" }).onfinish = () => label.remove();
    }

    function burstStars(x, y) {
      for (let index = 0; index < 12; index++) {
        const star = document.createElementNS(SVG_NS, "text");
        star.textContent = "★";
        star.setAttribute("x", x);
        star.setAttribute("y", y);
        star.setAttribute("text-anchor", "middle");
        star.setAttribute("font-size", "18");
        star.setAttribute("fill", index % 2 ? "#ffc400" : "#ff7a45");
        star.setAttribute("stroke", "#fff");
        star.setAttribute("stroke-width", "1.5");
        star.setAttribute("paint-order", "stroke");
        star.style.transformOrigin = `${x}px ${y}px`;
        effects.append(star);

        const angle = (index / 12) * Math.PI * 2 + Math.random() * .4;
        const distance = 50 + Math.random() * 40;
        star.animate([
          { transform: "translate(0px, 0px) scale(.3)", opacity: 1 },
          { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance - 18}px) scale(1.3)`, opacity: 0 }
        ], { duration: 800 + Math.random() * 300, easing: "cubic-bezier(.2,.8,.3,1)" }).onfinish = () => star.remove();
      }
    }

    // Kurvens størrelse og afstand (længere væk = mindre og højere oppe) styres med en transformation på #hoop
    const HOOP_DISTANCES = [{ shift: 0, scale: 1 }, { shift: 22, scale: .88 }, { shift: 40, scale: .78 }];
    const hoopBase = document.querySelector("#hoopBase");
    const hoopSizeButtons = [...document.querySelectorAll(".hoop-size")];
    const hoopDistanceButtons = [...document.querySelectorAll(".hoop-distance")];
    let hoopSize = 1;
    let hoopDistance = 0;
    try {
      const savedSize = Number(localStorage.getItem("talbasket-kurv-stoerrelse"));
      if (hoopSizeButtons.some(button => Number(button.dataset.size) === savedSize)) hoopSize = savedSize;
      const savedDistance = Number(localStorage.getItem("talbasket-kurv-afstand"));
      if (HOOP_DISTANCES[savedDistance]) hoopDistance = savedDistance;
    } catch { /* ingen lagring */ }

    const hoopScale = () => hoopSize * HOOP_DISTANCES[hoopDistance].scale;
    // Sidebevægelse i billedenheder: en rolig sinuskurve, der kun afhænger af uret, så kast kan forudsige hvor kurven er
    const HOOP_MOTIONS = [{ amplitude: 0, period: 1 }, { amplitude: 24, period: 4200 }, { amplitude: 46, period: 3000 }];
    const hoopMotionButtons = [...document.querySelectorAll(".hoop-motion")];
    let hoopMotion = 0;
    try {
      const savedMotion = Number(localStorage.getItem("talbasket-kurv-bevaegelse"));
      if (HOOP_MOTIONS[savedMotion]) hoopMotion = savedMotion;
    } catch { /* ingen lagring */ }
    const hoopOffset = time => {
      const { amplitude, period } = HOOP_MOTIONS[hoopMotion];
      return amplitude && !prefersReducedMotion() ? amplitude * Math.sin(2 * Math.PI * time / period) : 0;
    };
    // Omregner et punkt i kurvens egne koordinater til billedets koordinater
    const hoopToScene = (x, y) => ({
      x: 320 + hoopOffset(performance.now()) + (x - 320) * hoopScale(),
      y: 198 - HOOP_DISTANCES[hoopDistance].shift + (y - 198) * hoopScale()
    });

    let hoopFrame = 0;
    function renderHoop() {
      const transform = `translate(${320 + hoopOffset(performance.now())} ${198 - HOOP_DISTANCES[hoopDistance].shift}) scale(${hoopScale()}) translate(-320 -198)`;
      hoop.setAttribute("transform", transform);
      hoopBase.setAttribute("transform", transform);
    }

    function hoopLoop() {
      renderHoop();
      hoopFrame = requestAnimationFrame(hoopLoop);
    }

    function applyHoop() {
      cancelAnimationFrame(hoopFrame);
      hoopFrame = 0;
      renderHoop();
      if (HOOP_MOTIONS[hoopMotion].amplitude && !prefersReducedMotion()) hoopFrame = requestAnimationFrame(hoopLoop);
      for (const button of hoopSizeButtons) button.setAttribute("aria-pressed", String(Number(button.dataset.size) === hoopSize));
      hoopDistanceButtons.forEach((button, index) => button.setAttribute("aria-pressed", String(index === hoopDistance)));
      hoopMotionButtons.forEach((button, index) => button.setAttribute("aria-pressed", String(index === hoopMotion)));
    }

    // Bolden falder gennem nettet, så man tydeligt ser at den er i kurven
    function playBasket(clientX, clientY, label, radius) {
      showScored();
      if (prefersReducedMotion()) return;

      const scale = hoopScale();
      const localRadius = radius / scale;
      const start = clientToSvg(clientX, clientY);
      const startX = Math.max(298, Math.min(342, 320 + (start.x - 320 - hoopOffset(performance.now())) / scale));
      const netBall = document.createElementNS(SVG_NS, "g");
      netBall.setAttribute("class", "net-ball");
      netBall.innerHTML = ballMarkup(localRadius, label);
      hoop.querySelector(".net-lines").before(netBall);

      const top = hoopToScene(320, 78);
      burstStars(top.x, top.y);
      popText(top.x, top.y - 12 * scale, "KURV!", "#ff8a00");

      const midX = (startX + 320) / 2;
      netBall.animate([
        { transform: `translate(${startX}px, 74px) scale(1, 1) rotate(0deg)` },
        { transform: `translate(${midX}px, 98px) scale(.97, 1.05) rotate(45deg)`, offset: .28 },
        { transform: `translate(320px, 122px) scale(.9, 1.14) rotate(95deg)`, offset: .55 },
        { transform: `translate(320px, ${130 + localRadius}px) scale(1, 1) rotate(140deg)`, offset: .7 },
        { transform: `translate(320px, 200px) scale(.9, .9) rotate(230deg)`, opacity: 1, offset: .94 },
        { transform: `translate(320px, 206px) scale(.5, .5) rotate(250deg)`, opacity: 0 }
      ], { duration: 1300, easing: "ease-in" }).onfinish = () => {
        netBall.remove();
        const bottom = hoopToScene(320, 206);
        splashAtSvg(bottom.x, bottom.y);
      };
    }

    function crocMarkup(label, facing) {
      return `
        <g class="croc-rise">
          <path d="M-4 6C-16 -6 -34 -8 -52 -2C-62 2 -72 2 -84 8L-4 14Z" fill="#3f9a4a"/>
          <path d="M-16 -4l4 -8 4 8M-30 -5l4 -8 4 8M-44 -2l4 -8 4 8M-58 1l4 -8 4 8" fill="#2f7d3a"/>
          <path d="M-4 2L82 2C84 12 74 17 58 18C32 21 6 19 -4 13Z" fill="#4aa356"/>
          <path d="M12 2l4 -7 4 7M30 2l4 -7 4 7M48 2l4 -7 4 7M66 2l4 -7 4 7" fill="#fff" stroke="#cfd8dc" stroke-width=".6"/>
          <g class="croc-ball" transform="translate(42 -12) scale(${facing} 1)">${ballMarkup(14, label)}</g>
          <g class="croc-jaw">
            <path d="M-6 -3C8 -22 56 -24 86 -9C90 -6 89 0 83 2L-6 2Z" fill="#58c062"/>
            <path d="M18 2l4 7 4 -7M36 2l4 7 4 -7M54 2l4 7 4 -7M72 2l4 7 4 -7" fill="#fff" stroke="#cfd8dc" stroke-width=".6"/>
            <circle cx="77" cy="-10" r="2.4" fill="#2d6a35"/>
            <circle cx="16" cy="-18" r="10" fill="#58c062"/>
            <circle cx="17" cy="-19" r="6" fill="#fff"/>
            <ellipse cx="18.5" cy="-19" rx="2" ry="4.4" fill="#1b1b1b"/>
            <path d="M7 -22q10 -8 20 0" fill="none" stroke="#2f7d3a" stroke-width="2.4" stroke-linecap="round"/>
          </g>
        </g>`;
    }

    // En krokodille dukker op af søen og æder bolden
    function playCroc(clientX, clientY, label, radius) {
      sfx.splash();
      const spot = clientToSvg(clientX, clientY);
      splashAtSvg(spot.x, spot.y);
      if (prefersReducedMotion()) return;

      effects.querySelector(".croc-layer")?.remove();
      const scale = radius / 14;
      // Krokodillen vender væk fra kurven, så kroppen ligger inde i billedet
      const facing = spot.x > 320 ? 1 : -1;
      const originX = spot.x - facing * 42 * scale;
      const originY = spot.y + 12 * scale;
      crocClipRect.setAttribute("height", String(originY + 12 * scale + 400));

      const layer = document.createElementNS(SVG_NS, "g");
      layer.setAttribute("class", "croc-layer");
      layer.setAttribute("clip-path", "url(#croc-clip)");
      const croc = document.createElementNS(SVG_NS, "g");
      croc.setAttribute("transform", `translate(${originX} ${originY}) scale(${facing * scale} ${scale})`);
      croc.innerHTML = crocMarkup(label, facing);
      layer.append(croc);
      effects.append(layer);

      const total = 2500;
      const sink = 70;
      croc.querySelector(".croc-rise").animate([
        { transform: `translate(0px, ${sink}px)` },
        { transform: "translate(0px, 0px)", offset: .14, easing: "ease-out" },
        { transform: "translate(0px, 0px)", offset: .35 },
        { transform: "translate(0px, -6px)", offset: .39 },
        { transform: "translate(0px, 0px)", offset: .47 },
        { transform: "translate(0px, -3px)", offset: .55 },
        { transform: "translate(0px, 0px)", offset: .63 },
        { transform: "translate(0px, 0px)", offset: .72, easing: "ease-in" },
        { transform: `translate(0px, ${sink}px)` }
      ], { duration: total, easing: "ease-out" }).onfinish = () => layer.remove();

      croc.querySelector(".croc-jaw").animate([
        { transform: "rotate(-36deg)" },
        { transform: "rotate(-36deg)", offset: .3 },
        { transform: "rotate(0deg)", offset: .35, easing: "ease-in" },
        { transform: "rotate(-10deg)", offset: .43 },
        { transform: "rotate(0deg)", offset: .51 },
        { transform: "rotate(-8deg)", offset: .59 },
        { transform: "rotate(0deg)", offset: .67 },
        { transform: "rotate(0deg)" }
      ], { duration: total });

      croc.querySelector(".croc-ball").animate([
        { opacity: 1 },
        { opacity: 1, offset: .35 },
        { opacity: 0, offset: .36 },
        { opacity: 0 }
      ], { duration: total });

      later(() => {
        sfx.chomp();
        splashAtSvg(spot.x, spot.y + 6);
        popText(spot.x, spot.y - 54 * scale, "NAM!", "#2e9e44");
      }, total * .35);
    }

    function buildShot(start, velocity, geo, isCorrect, clock) {
      const trajectory = simulate(start, velocity, geo, { clock });
      const points = trajectory.points;
      const shot = { points, kind: "miss", splash: null, hitIndex: -1, clock };

      if (trajectory.hit) {
        const hit = points[points.length - 1];
        shot.hitIndex = points.length - 1;
        if (isCorrect) {
          shot.kind = "basket";
        } else {
          shot.kind = "bounce";
          const direction = Math.abs(hit.x - trajectory.center) < 3 ? (Math.random() < .5 ? -1 : 1) : Math.sign(hit.x - trajectory.center);
          const bounce = simulate(hit, { vx: direction * 170, vy: -220 }, geo, { detectHoop: false, maxTime: 3 });
          points.push(...bounce.points.slice(1));
          shot.splash = points[points.length - 1];
        }
      } else if (trajectory.water) {
        shot.kind = "water";
        shot.splash = points[points.length - 1];
      }
      return shot;
    }

    function finishFlight(drag, shot) {
      drag.ball.remove();
      flight = null;
      drag.button.classList.remove("is-dragging");
      const end = shot.points[shot.points.length - 1];
      const radius = ballRadiusUnits(drag.size * drag.flightScale);
      if (shot.kind === "basket") playBasket(end.x, end.y, drag.choice, radius);
      else if (shot.kind === "bounce") playCroc(end.x, end.y, drag.choice, radius);
      else if (shot.splash) showSplash(shot.splash.x, shot.splash.y);

      if (shot.kind === "basket" || shot.kind === "bounce") {
        scoreShot(drag.choice);
      } else {
        feedback.className = "feedback";
        feedback.textContent = shot.kind === "water"
          ? "Plask! Forbi kurven — prøv igen."
          : "Forbi kurven — prøv igen.";
      }
    }

    function playFlight(drag, shot) {
      sfx.kick(Math.hypot(drag.pull.x, drag.pull.y) / drag.maxPull);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) {
        finishFlight(drag, shot);
        return;
      }

      const { ball, size, flightScale } = drag;
      ball.classList.remove("dragged-ball");
      ball.classList.add("flying-ball");
      const startTime = shot.clock;
      flight = { frame: 0, startedAt: performance.now() };

      const step = now => {
        try {
          const elapsed = Math.max(0, (now - startTime) / 1000);
          const index = Math.min(shot.points.length - 1, Math.floor(elapsed / SIM_STEP));
          // Forkert bold: ringen klinger, når bolden rammer den (kun én gang)
          if (shot.kind === "bounce" && !shot.clanged && index >= shot.hitIndex) {
            shot.clanged = true;
            sfx.clang();
          }
          const point = shot.points[index];
          const shrinkIn = Math.min(1, elapsed / .15);
          const scale = (1 - (1 - flightScale) * shrinkIn) * (point.shrink || 1);
          ball.style.left = `${point.x - size / 2}px`;
          ball.style.top = `${point.y - size / 2}px`;
          ball.style.opacity = point.fade ?? 1;
          ball.style.transform = `scale(${scale}) rotate(${elapsed * 540}deg)`;

          if (index >= shot.points.length - 1) finishFlight(drag, shot);
          else flight.frame = requestAnimationFrame(step);
        } catch (error) {
          // En fejl i animationen må aldrig efterlade en bold i luften, som blokerer for næste skud
          console.error(error);
          ball.remove();
          drag.button.classList.remove("is-dragging");
          flight = null;
        }
      };
      flight.frame = requestAnimationFrame(step);
    }

    function cancelDrag() {
      if (!activeDrag) return;
      activeDrag.button.classList.remove("is-dragging");
      activeDrag.ball.remove();
      activeDrag = null;
      clearAim();
    }

    function beginDrag(event, button, choice) {
      if (!event.isPrimary || event.button !== 0 || button.disabled) return;
      // Et skud tager under to sekunder; hænger det længere, ryddes det, så næste træk kan starte
      if (flight && performance.now() - flight.startedAt > 5000) {
        cancelAnimationFrame(flight.frame);
        for (const stale of document.querySelectorAll(".flying-ball")) stale.remove();
        flight = null;
      }
      if (flight) return;
      // Et tidligere træk, der aldrig fik sin slip-hændelse, må ikke blokere for et nyt
      cancelDrag();

      const ballSource = button.querySelector(".ball");
      const bounds = ballSource.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) return;

      event.preventDefault();
      audioReady();
      button.focus();
      const ball = ballSource.cloneNode(true);
      ball.classList.add("dragged-ball");
      ball.setAttribute("aria-hidden", "true");
      ball.style.width = `${bounds.width}px`;
      ball.style.height = `${bounds.height}px`;
      ball.style.left = `${bounds.left}px`;
      ball.style.top = `${bounds.top}px`;
      document.body.append(ball);

      const geo = hoopGeometry();
      const start = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
      // Hastigheden skaleres efter afstanden til kurven, så et fuldt træk altid kan nå den
      const reach = Math.max(260, Math.hypot(geo.rimX - start.x, geo.rimY - start.y));
      const maxSpeed = Math.sqrt(POWER * GRAVITY * reach);
      // Bolden skal kunne trækkes helt tilbage uden at forlade skærmen nederst
      const roomBelow = window.innerHeight - start.y - bounds.height / 2 - 8;
      const maxPull = Math.max(MIN_PULL * 2.5, Math.min(MAX_PULL, roomBelow));

      activeDrag = {
        button,
        choice,
        pointerId: event.pointerId,
        ball,
        size: bounds.width,
        flightScale: Math.min(.6, Math.max(.3, geo.rimHalf * 1.1 / bounds.width)),
        start,
        origin: { x: event.clientX, y: event.clientY },
        pull: { x: 0, y: 0 },
        geo,
        maxPull,
        speedPerPixel: maxSpeed / maxPull
      };
      button.classList.add("is-dragging");
      try { button.setPointerCapture(event.pointerId); } catch { /* pegeren er allerede væk */ }
      // Mister knappen fingeren (fx kantsvip eller systemgestus), afbrydes trækket i stedet for at hænge
      button.addEventListener("lostpointercapture", () => {
        if (activeDrag && activeDrag.button === button && activeDrag.pointerId === event.pointerId && !activeDrag.released) cancelDrag();
      }, { once: true });
      feedback.className = "feedback";
      feedback.textContent = "Træk bolden tilbage, sigt mod kurven og slip.";
    }

    document.addEventListener("pointermove", event => {
      if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

      const drag = activeDrag;
      // Bolden holdes inden for skærmen, så den aldrig forsvinder ud over kanten
      const half = drag.size / 2;
      const centerX = Math.min(window.innerWidth - half, Math.max(half, drag.start.x + event.clientX - drag.origin.x));
      const centerY = Math.min(window.innerHeight - half, Math.max(half, drag.start.y + event.clientY - drag.origin.y));
      let pullX = centerX - drag.start.x;
      let pullY = centerY - drag.start.y;
      const length = Math.hypot(pullX, pullY);
      if (length > drag.maxPull) {
        pullX *= drag.maxPull / length;
        pullY *= drag.maxPull / length;
      }
      drag.pull = { x: pullX, y: pullY };
      const pullRatio = Math.min(1, Math.hypot(pullX, pullY) / drag.maxPull);
      if (Math.abs(pullRatio - (drag.lastTick ?? 0)) > .12) {
        drag.lastTick = pullRatio;
        sfx.stretch(pullRatio);
      }
      drag.ball.style.left = `${drag.start.x + pullX - drag.size / 2}px`;
      drag.ball.style.top = `${drag.start.y + pullY - drag.size / 2}px`;
      drawAim(drag);
    });

    document.addEventListener("pointerup", event => {
      if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

      const drag = activeDrag;
      drag.released = true;
      activeDrag = null;
      clearAim();
      ignoreNextClick = true;
      setTimeout(() => { ignoreNextClick = false; }, 0);

      if (Math.hypot(drag.pull.x, drag.pull.y) < MIN_PULL) {
        drag.ball.remove();
        drag.button.classList.remove("is-dragging");
        feedback.textContent = "Træk bolden længere tilbage for at skyde.";
        return;
      }

      const start = { ...drag.start };
      const clock = performance.now();
      const shot = buildShot(start, launchVelocity(drag, drag.pull, clock), drag.geo, drag.choice === answer, clock);
      playFlight(drag, shot);
    });

    document.addEventListener("pointercancel", event => {
      if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;
      cancelDrag();
    });
    // Højreklik, fanebladsskift, vinduesfokus og skærmdrejning sluger slip-hændelsen og ville ellers lade bolden hænge
    document.addEventListener("contextmenu", event => {
      if (activeDrag || event.target.closest?.(".answer")) event.preventDefault();
      cancelDrag();
    });
    window.addEventListener("blur", cancelDrag);
    window.addEventListener("resize", cancelDrag);
    document.addEventListener("visibilitychange", () => { if (document.hidden) cancelDrag(); });

    function submitShot(selectedButton, choice) {
      animateShot(selectedButton, choice === answer);
      scoreShot(choice);
    }

    function scoreShot(choice) {
      const isCorrect = choice === answer;
      answeredCount++;
      if (isCorrect) correctCount++;

      feedback.className = "feedback";
      if (isCorrect) {
        for (const button of answerContainer.querySelectorAll(".answer")) {
          button.disabled = true;
          if (button.dataset.choice === String(answer)) button.classList.add("is-right");
        }
        if (isGeo) {
          const country = geoQ.country;
          const tile = country.tiles.find((entry) => entry.key === (geoQ.type === "currency" ? "currency" : "capital"));
          feedback.textContent = geoQ.type === "capital"
            ? `Basket! ${country.capital} er hovedstaden i ${country.name}.`
            : geoQ.type === "currency"
              ? `Basket! I ${country.name} bruger man ${country.currency.toLowerCase()}.`
              : `Basket! Det er flaget fra ${country.name}.`;
          if (tile) World.speak(tile.file, tile.say);
        } else {
          feedback.textContent = `Basket! Rigtigt: ${first} ${opSign()} ${second} = ${answer}.`;
        }
        feedback.classList.add("good");
      } else {
        feedback.textContent = isGeo ? "Gnam! Krokodillen åd bolden — prøv et andet flag." : "Gnam! Krokodillen åd bolden — prøv en anden bold.";
        feedback.classList.add("bad");
      }

      if (isCorrect) {
        streak++;
        const starEarned = streak % STREAK_GOAL === 0;
        const progress = addContinentProgress();
        const popups = [];
        if (starEarned) {
          awardStar();
          popups.push(showStarPopup);
        }
        if (progress && progress.country) popups.push(() => showFoundPopup(progress.country));
        if (progress && (progress.travel || progress.done)) popups.push(showTravelPopup);
        if (!(progress && (progress.travel || progress.done))) updateContinentUI();
        if (popups.length) {
          queuePopups(popups);
        } else {
          sfx.streak(streak);
          advanceTimer = setTimeout(goToNextQuestion, isGeo ? 3800 : 1700);
        }
      } else {
        streak = 0;
      }
      updateStreak();

      scoreDisplay.textContent = `Rigtige: ${correctCount} / ${answeredCount}`;
      nextButton.hidden = !isCorrect;
      if (isCorrect) nextButton.focus();
    }

    document.querySelector("#hintReplay").addEventListener("click", updateHint);
    hintToggle.addEventListener("click", () => {
      // Geografi: slå landet op i bogen i stedet for en regnehjælp
      if (isGeo) {
        World.openBook(geoQ.country.cont, geoQ.country.id);
        return;
      }
      const isOpening = mathHint.hidden;
      mathHint.hidden = !isOpening;
      hintToggle.setAttribute("aria-expanded", String(isOpening));
      hintToggle.textContent = isOpening ? "Skjul regnehjælp" : "💡 Vis regnehjælp";
      if (isOpening) updateHint();
    });

    function updateMenuLabel() {
      for (const option of difficultyButtons) {
        const pressed = autoLevel ? option.dataset.max === "auto" : Number(option.dataset.max) === maximum;
        option.setAttribute("aria-pressed", String(pressed));
      }
      for (const option of tableButtons) {
        option.setAttribute("aria-pressed", String(selectedTables.includes(Number(option.dataset.table))));
      }
      for (const option of document.querySelectorAll(".qmode")) {
        option.setAttribute("aria-pressed", String(option.dataset.qmode === qMode));
      }
      const multiply = operation === "multiply";
      tablesGroup.hidden = !multiply;
      tablesLabel.hidden = !multiply;
      maxGroup.hidden = multiply;
      maxLabel.hidden = multiply;
    }

    Topbar.init({ kid: "ari", controls: [settings] });

    function resetGame() {
      correctCount = 0;
      answeredCount = 0;
      round = 1;
      streak = 0;
      geoCountdown = 3;
      updateStreak();
      updateMenuLabel();
      updateContinentUI();
      scoreDisplay.textContent = "Rigtige: 0 / 0";
      startRound();
    }

    for (const button of document.querySelectorAll(".qmode")) {
      button.addEventListener("click", () => {
        qMode = button.dataset.qmode;
        try { localStorage.setItem("talbasket-spoergsmaal", qMode); } catch { /* ingen lagring */ }
        if (document.body.dataset.screen === "play") resetGame();
        else updateMenuLabel();
      });
    }

    for (const button of operationButtons) {
      button.addEventListener("click", () => {
        operation = button.dataset.operation;
        for (const option of operationButtons) {
          option.setAttribute("aria-pressed", String(option === button));
        }
        if (document.body.dataset.screen === "play") resetGame();
        else updateMenuLabel();
      });
    }

    for (const button of tableButtons) {
      button.addEventListener("click", () => {
        const table = Number(button.dataset.table);
        if (selectedTables.includes(table)) {
          // Mindst én tabel skal altid være valgt
          if (selectedTables.length === 1) return;
          selectedTables = selectedTables.filter(value => value !== table);
        } else {
          selectedTables = [...selectedTables, table].sort((a, b) => a - b);
        }
        try { localStorage.setItem("talbasket-tabeller", JSON.stringify(selectedTables)); } catch { /* ingen lagring */ }
        if (document.body.dataset.screen === "play") resetGame();
        else updateMenuLabel();
      });
    }

    for (const button of hoopSizeButtons) {
      button.addEventListener("click", () => {
        hoopSize = Number(button.dataset.size);
        try { localStorage.setItem("talbasket-kurv-stoerrelse", String(hoopSize)); } catch { /* ingen lagring */ }
        applyHoop();
      });
    }

    hoopDistanceButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        hoopDistance = index;
        try { localStorage.setItem("talbasket-kurv-afstand", String(hoopDistance)); } catch { /* ingen lagring */ }
        applyHoop();
      });
    });

    hoopMotionButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        hoopMotion = index;
        try { localStorage.setItem("talbasket-kurv-bevaegelse", String(hoopMotion)); } catch { /* ingen lagring */ }
        applyHoop();
      });
    });

    for (const button of difficultyButtons) {
      button.addEventListener("click", () => {
        autoLevel = button.dataset.max === "auto";
        maximum = autoLevel ? autoMaximum() : Number(button.dataset.max);
        try {
          if (autoLevel) localStorage.removeItem("talbasket-niveau");
          else localStorage.setItem("talbasket-niveau", String(maximum));
        } catch { /* ingen lagring */ }
        if (document.body.dataset.screen === "play") resetGame();
        else updateMenuLabel();
      });
    }

    nextButton.addEventListener("click", () => {
      goToNextQuestion();
      answerContainer.querySelector(".answer")?.focus();
    });

    updateMenuLabel();
    applyHoop();
    applyScenery();
    updateContinentUI();

    // ---------- Skærme: verdenskort og bane ----------
    function leavePlay() {
      clearTimeout(advanceTimer);
      clearTimeout(popupTimer);
      clearTimeout(travelTimer);
      popupQueue = [];
      advanceAfterPopup = false;
      starPopup.hidden = true;
      travelPopup.hidden = true;
      foundPopup.hidden = true;
      problemPopup.hidden = true;
      cancelDrag();
      clearShots();
      World.closeSpot();
      World.stopSpeech();
    }

    function showScreen(name) {
      if (name === "home") leavePlay();
      document.body.dataset.screen = name;
      document.querySelector("#home").hidden = name !== "home";
      document.querySelector("#play").hidden = name !== "play";
      if (name === "home") World.renderHome();
    }

    function playContinent(index) {
      currentContinent = index;
      applyScenery();
      showScreen("play");
      resetGame();
    }

    document.querySelector("#toMap").addEventListener("click", () => { sfx.click(); showScreen("home"); });
    continentBadge.addEventListener("click", () => { sfx.click(); World.openBook(CONTINENTS[currentContinent].key); });

    World.init({
      state: () => ({ unlocked: unlockedContinent, current: currentContinent, progress: continentProgress, complete: journeyDone }),
      found: foundIn,
      toNext: toNextCountry,
      play: playContinent,
      sfx: (name) => { if (sfx[name]) sfx[name](); }
    });

    // Til test: ?k=<0-6>&p=<antal rigtige i kontinentet>&spil=1 og window.__tb
    const params = new URLSearchParams(location.search);
    function setProgress(unlocked, progress) {
      unlockedContinent = Math.max(0, Math.min(LAST_CONTINENT, unlocked));
      continentProgress = Math.max(0, Math.min(goalOf(unlockedContinent) - 1, progress));
      journeyDone = false;
      currentContinent = unlockedContinent;
      applyScenery();
      updateContinentUI();
      World.renderHome();
    }
    if (params.has("k")) setProgress(Number(params.get("k")) || 0, Number(params.get("p")) || 0);
    window.__tb = { setProgress, playContinent, showScreen, makeProblem, startRound, scoreShot, get answer() { return answer; }, get isGeo() { return isGeo; }, get geoQ() { return geoQ; }, state: () => ({ unlockedContinent, continentProgress, currentContinent, journeyDone, qMode }), setMode: (mode) => { qMode = mode; }, focusGeo: (id) => { geoFocus = id; } };
    if (params.has("spil")) playContinent(currentContinent);
