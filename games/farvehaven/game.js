    (() => {
      "use strict";

      const $ = (id) => document.getElementById(id);
      const R = FarvehavenReplikker;
      const COLORS = [
        { id: "red", hex: "#ef5350" },
        { id: "yellow", hex: "#ffca28" },
        { id: "blue", hex: "#42a5f5" },
        { id: "green", hex: "#66bb6a" },
        { id: "orange", hex: "#fb8c32" },
        { id: "purple", hex: "#ab75d1" },
        { id: "brown", hex: "#a66b42" },
        { id: "pink", hex: "#f17aa7" }
      ].map((color) => ({ ...color, ...R.colors[color.id] }));
      const DECORATIONS = [
        { id: "butterfly", icon: "🦋" },
        { id: "sunflower", icon: "🌻" },
        { id: "mushroom", icon: "🍄" },
        { id: "rainbow", icon: "🌈" },
        { id: "ladybug", icon: "🐞" },
        { id: "tulip", icon: "🌷" },
        { id: "bee", icon: "🐝" },
        { id: "flower", icon: "💐" }
      ].map((item) => ({ ...item, name: R.decorations[item.id] }));
      const ROUNDS = 5;
      const STAR_KEY = "farvehave-stars";
      const DECOR_KEY = "farvehave-decor";
      const COLORS_KEY = "farvehave-colors";
      const steps = [];
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let totalStars = 0;
      let sessionStars = 0;
      let round = 0;
      let target = null;
      let currentAsk = "";
      const lastLine = {};
      let lastTarget = "";
      let busy = false;
      let muted = !Topbar.soundOn();
      let voice = null;
      let voiceToken = 0;
      const clipAudio = new Audio();
      clipAudio.preload = "auto";
      let unlocked = [];
      let storageFailed = false;
      let rewardTimer = 0;
      let bunnySpot = 0;
      let bunnyMotions = [];

      const progress = $("progress");
      const message = $("message");
      const choices = $("choices");
      const bunny = $("bunny");
      const shadow = $("bunnyShadow");
      const flowerBed = $("flowerBed");
      const colorCount = $("colorCount");
      const reward = $("reward");
      const storageNote = $("storageNote");
      const voiceNote = $("voiceNote");

      function storageError(error) {
        storageFailed = true;
        console.error("Farvehavens fremskridt kunne ikke gemmes.", error);
        storageNote.textContent = "Fremskridtet kunne ikke gemmes på denne enhed.";
        storageNote.hidden = false;
      }

      function readNumber(key, fallback) {
        try {
          const value = Number(localStorage.getItem(key));
          return Number.isInteger(value) && value >= 0 ? value : fallback;
        } catch (error) {
          storageError(error);
          return fallback;
        }
      }

      function saveValue(key, value) {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          storageError(error);
        }
      }

      function loadDecor() {
        try {
          const saved = localStorage.getItem(DECOR_KEY);
          if (!saved) return [];
          const values = JSON.parse(saved);
          if (!Array.isArray(values)) throw new TypeError("Farvehavens samling har et ugyldigt format.");
          return [...new Set(values.filter((id) => DECORATIONS.some((item) => item.id === id)))];
        } catch (error) {
          storageError(error);
          return [];
        }
      }

      function shuffle(items) {
        const result = items.slice();
        for (let i = result.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
      }

      function paintProgress() {
        $("roundLabel").textContent = `Blomster ${round} af ${ROUNDS}`;
        flowerBed.setAttribute("aria-label", `Budhas blomsterbed: ${round} af ${ROUNDS} blomster plantet`);
        steps.forEach((step, index) => step.classList.toggle("done", index < round));
      }

      // ---------- Landskabet: ting man kan trykke på, en sommerfugl der flyver og lander, fugle og belønninger ----------
      const field = $("field");
      const scene = $("scene");
      const fliers = $("fliers");
      const fx = $("fx");
      const rainbow = $("rainbow");
      const DECOR_SLOTS = {
        sunflower: { x: 35, y: 41 },
        mushroom: { x: 47, y: 40 },
        ladybug: { x: 54, y: 36 },
        tulip: { x: 63, y: 41 },
        flower: { x: 78, y: 40 }
      };
      const WILD_FLOWERS = [[5, 35, "#ff8fb5"], [10, 41, "#ffffff"], [21, 34, "#ffd84d"], [33, 38, "#b197fc"], [43, 34, "#ff8fb5"], [51, 39, "#ffd84d"], [66, 35, "#ffffff"], [76, 36, "#ff8f6b"], [83, 41, "#b197fc"], [93, 36, "#ffd84d"]];
      const fliersList = [];
      const decorNodes = new Map();
      let particleCount = 0;
      let sunSpin = null;
      let bladeSpin = null;
      let birdTimer = 0;

      function toField(clientX, clientY) {
        const rect = field.getBoundingClientRect();
        return { x: clientX - rect.left - field.clientLeft, y: clientY - rect.top - field.clientTop };
      }

      function pointOn(el, px = 50, py = 50) {
        const rect = el.getBoundingClientRect();
        return toField(rect.left + rect.width * px / 100, rect.top + rect.height * py / 100);
      }

      function burst(x, y, glyphs, count = 5, options = {}) {
        if (reduceMotion || particleCount > 48) return;
        const { spread = 60, rise = 46, fall = 70, duration = 1100, spin = 90 } = options;
        for (let i = 0; i < count; i++) {
          const piece = document.createElement("span");
          piece.className = "particle";
          piece.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
          piece.style.left = `${x}px`;
          piece.style.top = `${y}px`;
          fx.append(piece);
          particleCount += 1;
          const dx = (Math.random() - .5) * 2 * spread;
          const up = rise * (.6 + Math.random() * .6);
          const down = fall * (.8 + Math.random() * .4);
          const turn = (Math.random() - .5) * 2 * spin;
          const motion = piece.animate([
            { transform: "translate(-50%, -50%) scale(.3) rotate(0deg)", opacity: 0 },
            { transform: `translate(calc(-50% + ${dx * .55}px), calc(-50% - ${up}px)) scale(1) rotate(${turn * .5}deg)`, opacity: 1, offset: .35 },
            { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${down}px)) scale(.9) rotate(${turn}deg)`, opacity: 0 }
          ], { duration: duration * (.8 + Math.random() * .5), delay: i * 40, easing: "cubic-bezier(.3, .6, .5, 1)" });
          motion.onfinish = motion.oncancel = () => {
            piece.remove();
            particleCount -= 1;
          };
        }
      }

      function wobble(el, className, ms) {
        el.classList.remove(className);
        void el.getBoundingClientRect();
        el.classList.add(className);
        window.clearTimeout(el._wobbleTimer);
        el._wobbleTimer = window.setTimeout(() => el.classList.remove(className), ms);
      }

      // Sætter en uendelig animation op i fart og lader den falde til ro igen.
      function boost(animation, rate) {
        if (!animation) return;
        window.clearInterval(animation._calm);
        animation.playbackRate = rate;
        animation._calm = window.setInterval(() => {
          animation.playbackRate = Math.max(1, animation.playbackRate * .88);
          if (animation.playbackRate <= 1.02) {
            animation.playbackRate = 1;
            window.clearInterval(animation._calm);
          }
        }, 120);
      }

      function bounce(el, spin) {
        if (reduceMotion) return;
        el.animate([
          { transform: "scale(1, 1) rotate(0deg)" },
          { transform: "scale(1.18, .78) rotate(0deg)", offset: .18 },
          { transform: `translateY(-26px) scale(.92, 1.12) rotate(${spin ? 180 : -8}deg)`, offset: .5 },
          { transform: `translateY(0) scale(1.12, .86) rotate(${spin ? 360 : 6}deg)`, offset: .78 },
          { transform: "scale(1, 1) rotate(0deg)" }
        ], { duration: 700, easing: "ease-out" });
      }

      const TOYS = {
        sun(el) {
          wobble(el, "cheer", 1500);
          boost(sunSpin, 10);
          const c = pointOn(el);
          burst(c.x, c.y, ["✨", "⭐", "💛"], 6, { spread: 70, rise: 40, fall: 30 });
        },
        cloud(el) {
          wobble(el, "squish", 700);
          const rect = el.getBoundingClientRect();
          const c = toField(rect.left + rect.width / 2, rect.top + rect.height * .8);
          burst(c.x, c.y, ["💧"], 6, { spread: rect.width * .35, rise: 2, fall: 120, duration: 1000 });
        },
        tree(el) {
          wobble(el, "shake", 900);
          const rect = el.getBoundingClientRect();
          const c = toField(rect.left + rect.width * .5, rect.top + rect.height * .35);
          burst(c.x, c.y, (el.dataset.bits || "🍃").split(","), 5, { spread: rect.width * .45, rise: 4, fall: rect.height * .6, duration: 1500 });
        },
        bush(el) {
          wobble(el, "shake", 900);
          const c = pointOn(el, 50, 40);
          burst(c.x, c.y, (el.dataset.bits || "🍃").split(","), 4, { spread: 36, rise: 18, fall: 40 });
        },
        windmill(el) {
          boost(bladeSpin, 16);
          const c = pointOn(el, 50, 37);
          burst(c.x, c.y, ["💨"], 3, { spread: 56, rise: 10, fall: -8 });
        },
        wild(el) {
          wobble(el, "wiggle", 700);
          const c = pointOn(el, 50, 25);
          burst(c.x, c.y, ["🌸", "✨"], 3, { spread: 30, rise: 28, fall: 18 });
        },
        planted(el) {
          wobble(el, "wiggle", 700);
          const c = pointOn(el, 50, 30);
          burst(c.x, c.y, ["✨", "💛"], 3, { spread: 30, rise: 30, fall: 12 });
        },
        rainbow(el) {
          wobble(el, "shimmer", 900);
          for (let i = 0; i < 3; i++) {
            const c = pointOn(el, 14 + Math.random() * 72, 8 + Math.random() * 24);
            burst(c.x, c.y, ["✨", "⭐"], 2, { spread: 22, rise: 14, fall: 22 });
          }
        },
        decor(el) {
          const id = el.dataset.decor;
          bounce(el, id === "ladybug");
          const c = pointOn(el, 50, 30);
          const bits = { sunflower: ["🌼", "✨"], mushroom: ["✨", "💨"], ladybug: ["✨", "❤️"], tulip: ["🌸", "✨"], flower: ["💖", "✨"] }[id] || ["✨"];
          burst(c.x, c.y, bits, 4, { spread: 36, rise: 38, fall: 20 });
        },
        butterfly(el) {
          const c = pointOn(el);
          burst(c.x, c.y, ["✨"], 3, { spread: 24, rise: 18, fall: 8, duration: 800 });
          flyAway(el._flier, .26);
        },
        bee(el) {
          const c = pointOn(el);
          burst(c.x, c.y, ["💨", "✨"], 3, { spread: 24, rise: 12, fall: 8, duration: 800 });
          wander(el._flier, .34);
        },
        bird(el) {
          if (el._looping) return;
          el._looping = true;
          const c = pointOn(el);
          burst(c.x, c.y, ["♪", "♫"], 3, { spread: 34, rise: 42, fall: -10 });
          if (reduceMotion) { el._looping = false; return; }
          const loop = el.firstElementChild.animate([
            { transform: "rotate(0deg) translateY(0)" },
            { transform: "rotate(-180deg) translateY(-14px)", offset: .5 },
            { transform: "rotate(-360deg) translateY(0)" }
          ], { duration: 900, easing: "ease-in-out" });
          loop.onfinish = () => { el._looping = false; };
        }
      };

      function bunnyJoy() {
        if (busy || bunnyMotions.length || reduceMotion) return;
        const motion = bunny.animate([
          { transform: "translateY(0) scale(1, 1)", offset: 0 },
          { transform: "translateY(0) scale(1.08, .88)", offset: .15 },
          { transform: "translateY(-26px) scale(.95, 1.08)", offset: .45 },
          { transform: "translateY(0) scale(1.08, .9)", offset: .75 },
          { transform: "translateY(0) scale(1, 1)", offset: 1 }
        ], { duration: 700, easing: "ease-out" });
        bunnyMotions.push(motion);
        motion.onfinish = motion.oncancel = () => { bunnyMotions = bunnyMotions.filter((item) => item !== motion); };
        bunny.classList.add("happy");
        window.setTimeout(() => { if (!busy) bunny.classList.remove("happy"); }, 1500);
        const c = pointOn(bunny, 50, 6);
        burst(c.x, c.y, ["❤️", "💕", "✨"], 4, { spread: 46, rise: 52, fall: -6 });
        scareBunnyPerchers();
      }

      field.addEventListener("pointerdown", (event) => {
        if (event.target.closest(".choice, .speech, .repeat")) return;
        const toy = event.target.closest("[data-toy]");
        const rect = bunny.getBoundingClientRect();
        const onBunny = event.clientX > rect.left + rect.width * .12 && event.clientX < rect.right - rect.width * .12
          && event.clientY > rect.top && event.clientY < rect.bottom;
        if (onBunny && !(toy && ["butterfly", "bee"].includes(toy.dataset.toy))) {
          bunnyJoy();
          return;
        }
        if (toy && TOYS[toy.dataset.toy]) TOYS[toy.dataset.toy](toy);
      });

      // ---- Sommerfugle og bier: de flyver i svajende kurver og sætter sig på ting i landskabet ----
      function currentPoint(flier) {
        const rect = flier.el.getBoundingClientRect();
        return toField(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }

      function place(flier, point) {
        flier.x = point.x;
        flier.y = point.y;
        flier.el.style.transform = `translate(${point.x}px, ${point.y}px)`;
      }

      function perchPoint(spot) {
        if (spot.key === "bunny") {
          const rect = bunny.getBoundingClientRect();
          return toField(rect.left + rect.width * .79, rect.top + rect.height * .27);
        }
        if (!spot.key.isConnected) return null;
        const rect = spot.key.getBoundingClientRect();
        if (!rect.width) return null;
        const [px, py] = spot.key.dataset.perch.split(",").map(Number);
        return toField(rect.left + rect.width * px / 100, rect.top + rect.height * py / 100);
      }

      function perchOptions() {
        const spots = [...scene.querySelectorAll("[data-perch]")].map((el) => ({ key: el }));
        if (!busy) spots.push({ key: "bunny" });
        const limit = toField(0, document.querySelector(".speech").getBoundingClientRect().bottom).y + 8;
        return spots
          .map((spot) => ({ spot, point: perchPoint(spot) }))
          .filter(({ point }) => point && point.y > limit && point.x > 10 && point.x < field.clientWidth - 10);
      }

      function pickPerch(flier) {
        const taken = fliersList.filter((other) => other !== flier && other.spot).map((other) => other.spot.key);
        const origin = currentPoint(flier);
        const options = perchOptions().filter(({ spot }) => !taken.includes(spot.key) && !(flier.spot && flier.spot.key === spot.key));
        const far = options.filter(({ point }) => Math.hypot(point.x - origin.x, point.y - origin.y) > Math.min(field.clientWidth * .18, 120));
        const pool = far.length ? far : options;
        return pool[Math.floor(Math.random() * pool.length)] || null;
      }

      function flyTo(flier, target, speed = .11) {
        window.clearTimeout(flier.timer);
        const from = currentPoint(flier);
        if (flier.motion) flier.motion.cancel();
        flier.motion = null;
        flier.spot = null;
        if (reduceMotion) {
          arrive(flier, target);
          return;
        }
        const dx = target.point.x - from.x;
        const dy = target.point.y - from.y;
        const dist = Math.hypot(dx, dy) || 1;
        const duration = Math.min(6000, Math.max(1400, dist / speed));
        const steps = Math.max(10, Math.round(duration / 55));
        const nx = -dy / dist;
        const ny = dx / dist;
        const bend = (Math.random() - .5) * Math.min(180, dist * .7);
        const sway = flier.kind === "bee" ? 6 : 9 + Math.random() * 7;
        const cycles = Math.max(2, Math.round(dist / 90));
        const bobs = Math.max(2, Math.round(dist / 60));
        const frames = [];
        let previousX = from.x;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const ease = t * t * (3 - 2 * t);
          const envelope = Math.sin(Math.PI * t);
          const side = bend * envelope + Math.sin(2 * Math.PI * cycles * t) * sway * envelope;
          const x = from.x + dx * ease + nx * side;
          const y = from.y + dy * ease + ny * side + Math.sin(2 * Math.PI * bobs * t) * 6 * envelope;
          const tilt = i === steps ? 0 : Math.max(-24, Math.min(24, (x - previousX) * 4));
          previousX = x;
          frames.push({ transform: `translate(${x}px, ${y}px) rotate(${tilt}deg)` });
        }
        flier.el.classList.remove("perched");
        flier.el.classList.add("flying");
        flier.motion = flier.el.animate(frames, { duration, fill: "forwards" });
        flier.motion.onfinish = () => arrive(flier, target);
      }

      function arrive(flier, target) {
        place(flier, target.point);
        if (flier.motion) {
          flier.motion.cancel();
          flier.motion = null;
        }
        if (flier.kind === "bee") {
          flier.timer = window.setTimeout(() => wander(flier), 150 + Math.random() * 600);
          return;
        }
        flier.spot = target.spot;
        flier.el.classList.remove("flying");
        flier.el.classList.add("perched");
        if (target.spot.key === "bunny") {
          const rect = flier.el.getBoundingClientRect();
          lookAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        flier.timer = window.setTimeout(() => flyAway(flier), 3500 + Math.random() * 4500);
      }

      function flyAway(flier, speed) {
        if (flier.kind === "bee") {
          wander(flier, speed);
          return;
        }
        const option = pickPerch(flier);
        if (!option) {
          flier.timer = window.setTimeout(() => flyAway(flier), 1500);
          return;
        }
        flyTo(flier, option, speed);
      }

      function wander(flier, speed = .17) {
        const point = { x: field.clientWidth * (.08 + Math.random() * .84), y: field.clientHeight * (.3 + Math.random() * .3) };
        flyTo(flier, { point }, speed);
      }

      function scareBunnyPerchers() {
        fliersList.forEach((flier) => {
          if (flier.spot && flier.spot.key === "bunny") flyAway(flier, .24);
        });
      }

      function refreshPerched() {
        fliersList.forEach((flier) => {
          if (!flier.spot || flier.motion) return;
          const point = perchPoint(flier.spot);
          if (point) place(flier, point);
        });
      }

      function addButterfly(variant, fresh) {
        const el = document.createElement("div");
        el.className = `butterfly ${variant} perched`;
        el.dataset.toy = "butterfly";
        el.innerHTML = `<svg viewBox="0 0 40 34" focusable="false" aria-hidden="true">
          <g class="bf-wing l">
            <path class="bf-up" d="M20 16C15 3 3 1 2 10c-1 7 9 9 18 7z"/>
            <path class="bf-low" d="M20 18C12 19 5 23 8 29c3 5 10 0 12-9z"/>
            <circle class="bf-dot" cx="9" cy="10" r="2.6"/><circle class="bf-dot" cx="12" cy="26" r="1.8"/>
          </g>
          <g class="bf-wing r">
            <path class="bf-up" d="M20 16c5-13 17-15 18-6 1 7-9 9-18 7z"/>
            <path class="bf-low" d="M20 18c8 1 15 5 12 11-3 5-10 0-12-9z"/>
            <circle class="bf-dot" cx="31" cy="10" r="2.6"/><circle class="bf-dot" cx="28" cy="26" r="1.8"/>
          </g>
          <ellipse cx="20" cy="18" rx="1.9" ry="8.5" fill="#4a3b52"/>
          <path d="M19 10C17 5 14 3 12 3M21 10c2-5 5-7 7-7" fill="none" stroke="#4a3b52" stroke-width="1.2" stroke-linecap="round"/>
        </svg>`;
        fliers.append(el);
        const flier = { el, kind: "butterfly", spot: null, motion: null, timer: 0, x: 0, y: 0 };
        el._flier = flier;
        fliersList.push(flier);
        requestAnimationFrame(() => {
          if (fresh) {
            place(flier, { x: field.clientWidth / 2, y: field.clientHeight * .4 });
            flier.timer = window.setTimeout(() => flyAway(flier, .2), 300);
            return;
          }
          const first = pickPerch(flier);
          if (first) arrive(flier, first);
          else place(flier, { x: field.clientWidth * .5, y: field.clientHeight * .3 });
          window.clearTimeout(flier.timer);
          flier.timer = window.setTimeout(() => flyAway(flier), 1500 + Math.random() * 2000);
        });
        return el;
      }

      function addBee(fresh) {
        const el = document.createElement("span");
        el.className = "bee";
        el.dataset.toy = "bee";
        el.textContent = "🐝";
        fliers.append(el);
        const flier = { el, kind: "bee", spot: null, motion: null, timer: 0, x: 0, y: 0 };
        el._flier = flier;
        fliersList.push(flier);
        requestAnimationFrame(() => {
          place(flier, { x: field.clientWidth * (fresh ? .5 : .3), y: field.clientHeight * .4 });
          wander(flier);
        });
        return el;
      }

      // ---- Fugle der flyver forbi i en blød bølge; et tryk giver en lille loop og toner ----
      function scheduleBird(delay) {
        window.clearTimeout(birdTimer);
        birdTimer = window.setTimeout(spawnBird, delay);
      }

      function spawnBird() {
        if (reduceMotion || document.hidden) {
          scheduleBird(8000);
          return;
        }
        const width = field.clientWidth;
        const height = field.clientHeight;
        const direction = Math.random() < .5 ? 1 : -1;
        const baseY = height * (.26 + Math.random() * .1);
        const bird = document.createElement("div");
        bird.className = "bird";
        bird.dataset.toy = "bird";
        bird.innerHTML = `<svg viewBox="0 0 40 24" focusable="false" aria-hidden="true">
          <g class="wing"><path d="M20 14C14 4 6 3 1 6c6 1 10 5 19 8z" fill="#5d7ea6"/></g>
          <g class="wing"><path d="M20 14c6-10 14-11 19-8-6 1-10 5-19 8z" fill="#5d7ea6"/></g>
          <ellipse cx="20" cy="15" rx="5.2" ry="3.4" fill="#7ea3cc"/><circle cx="25" cy="13" r="2.7" fill="#7ea3cc"/><path d="M27 12.4l5 1.2-5 1.2z" fill="#f5a742"/>
        </svg>`;
        fliers.append(bird);
        const duration = 11000 + Math.random() * 5000;
        const frames = [];
        for (let i = 0; i <= 28; i++) {
          const t = i / 28;
          const x = direction > 0 ? -60 + (width + 120) * t : width + 60 - (width + 120) * t;
          const y = baseY + Math.sin(t * Math.PI * 5) * 12 - Math.sin(t * Math.PI) * 14;
          frames.push({ transform: `translate(${x}px, ${y}px) scaleX(${direction})` });
        }
        const flight = bird.animate(frames, { duration, easing: "linear" });
        flight.onfinish = () => {
          bird.remove();
          scheduleBird(7000 + Math.random() * 9000);
        };
      }

      function showRainbow(fresh) {
        rainbow.removeAttribute("hidden");
        if (fresh && !reduceMotion) rainbow.classList.add("rainbow-draw");
      }

      function popIn(el) {
        if (!reduceMotion) {
          el.animate([
            { transform: "scale(0) rotate(-20deg)", opacity: 0 },
            { transform: "scale(1.3) rotate(8deg)", opacity: 1, offset: .6 },
            { transform: "scale(1) rotate(0deg)", opacity: 1 }
          ], { duration: 800, easing: "cubic-bezier(.2, 1.4, .4, 1)" });
        }
        const c = pointOn(el, 50, 30);
        burst(c.x, c.y, ["✨", "⭐"], 6, { spread: 50, rise: 40, fall: 20 });
      }

      function paintDecor(freshId) {
        unlocked.forEach((id) => {
          if (decorNodes.has(id)) return;
          const item = DECORATIONS.find((decoration) => decoration.id === id);
          if (!item) return;
          const fresh = id === freshId;
          if (id === "butterfly") {
            decorNodes.set(id, addButterfly("pink", fresh));
            return;
          }
          if (id === "bee") {
            decorNodes.set(id, addBee(fresh));
            return;
          }
          if (id === "rainbow") {
            showRainbow(fresh);
            decorNodes.set(id, rainbow);
            return;
          }
          const slot = DECOR_SLOTS[id];
          if (!slot) return;
          const el = document.createElement("span");
          el.className = "decor-item";
          el.dataset.toy = "decor";
          el.dataset.decor = id;
          el.dataset.perch = "50,14";
          el.textContent = item.icon;
          el.style.left = `${slot.x}%`;
          el.style.bottom = `${slot.y}%`;
          scene.append(el);
          decorNodes.set(id, el);
          if (fresh) popIn(el);
        });
      }

      function buildScenery() {
        $("sunRays").innerHTML = Array.from({ length: 12 }, (_, i) => `<rect x="-3" y="-47" width="6" height="15" rx="3" fill="#ffd95e" transform="rotate(${i * 30})"/>`).join("");
        $("wilds").innerHTML = WILD_FLOWERS.map(([x, y, color], i) => `<span class="wild" data-toy="wild" data-perch="50,30" style="left:${x}%;bottom:${y}%;--d:${(i % 5) * .6}"><svg viewBox="0 0 24 40" focusable="false" aria-hidden="true"><path d="M12 39Q11 27 12 16" fill="none" stroke="#4fa05a" stroke-width="2.4" stroke-linecap="round"/><path d="M12 31Q5 29 4 23Q10 23 12 30Z" fill="#5fb36a"/><g fill="${color}" stroke="#00000014" stroke-width=".6"><circle cx="12" cy="7.5" r="4.2"/><circle cx="16.8" cy="11" r="4.2"/><circle cx="15" cy="16.6" r="4.2"/><circle cx="9" cy="16.6" r="4.2"/><circle cx="7.2" cy="11" r="4.2"/></g><circle cx="12" cy="12" r="3.2" fill="#ffcf40"/></svg></span>`).join("");
        if (!reduceMotion) {
          sunSpin = $("sunRays").animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 60000, iterations: Infinity });
          bladeSpin = $("blades").animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 16000, iterations: Infinity });
        }
        addButterfly("blue", false);
        scheduleBird(3500);
      }

      function resetFlowerBed() {
        flowerBed.replaceChildren();
        for (let i = 0; i < ROUNDS; i++) {
          const plot = document.createElement("span");
          plot.className = "plot";
          plot.setAttribute("aria-hidden", "true");
          plot.innerHTML = '<span class="seed"></span>';
          flowerBed.append(plot);
        }
        flowerBed.setAttribute("aria-label", `Budhas blomsterbed: ${round} af ${ROUNDS} blomster plantet`);
      }

      function plantFlower(color, index) {
        const plot = flowerBed.children[index];
        if (!plot) return;
        plot.classList.add("planted");
        plot.innerHTML = `<svg class="planted-flower" data-toy="planted" viewBox="0 0 60 78" aria-hidden="true" focusable="false">
          <path class="stem" d="M30 43v29" fill="none" stroke="#388653" stroke-width="4" stroke-linecap="round"/>
          <path class="leaf" d="M30 61C14 47 10 60 28 66z" fill="#58ad62"/>
          <path class="leaf" d="M30 55c15-16 22-4 3 6z" fill="#70c875"/>
          <g class="bloom">
            <g fill="${color.hex}" stroke="#fff" stroke-width="1.5">
              <circle cx="30" cy="17" r="8"/><circle cx="39" cy="24" r="8"/>
              <circle cx="35" cy="35" r="8"/><circle cx="25" cy="35" r="8"/>
              <circle cx="21" cy="24" r="8"/>
            </g>
            <circle cx="30" cy="27" r="7" fill="#ffe17c"/>
            <circle cx="28" cy="26" r="1" fill="#8a6930"/><circle cx="32" cy="26" r="1" fill="#8a6930"/>
            <path d="M28 29q2 2 4 0" fill="none" stroke="#8a6930" stroke-width="1" stroke-linecap="round"/>
          </g>
        </svg><span class="sparkle" aria-hidden="true">✨</span>`;
        flowerBed.setAttribute("aria-label", `Budhas blomsterbed: ${index + 1} af ${ROUNDS} blomster plantet`);
      }

      function flowerSvg(color) {
        return `<svg class="flower" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <g class="petal" fill="${color.hex}" stroke="#ffffff" stroke-width="3">
            <circle cx="50" cy="23" r="18"/><circle cx="75" cy="42" r="18"/>
            <circle cx="65" cy="70" r="18"/><circle cx="35" cy="70" r="18"/>
            <circle cx="25" cy="42" r="18"/>
          </g>
          <circle cx="50" cy="49" r="15" fill="#ffe17c" stroke="#fff" stroke-width="3"/>
          <circle cx="45" cy="46" r="1.8" fill="#8a6930"/><circle cx="55" cy="46" r="1.8" fill="#8a6930"/>
          <path d="M46 53q4 4 8 0" fill="none" stroke="#8a6930" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
      }

      function mixColor(hex, target, amount) {
        const value = parseInt(hex.slice(1), 16);
        const channels = [value >> 16, (value >> 8) & 255, value & 255];
        return `rgb(${channels.map((channel, i) => Math.round(channel + (target[i] - channel) * amount)).join(", ")})`;
      }

      function renderChoices() {
        const numberOfChoices = totalStars < 5 ? 2 : 3;
        const options = shuffle([target, ...shuffle(activeColors.filter((color) => color.id !== target.id)).slice(0, numberOfChoices - 1)]);
        choices.style.setProperty("--choice-count", options.length);
        choices.dataset.count = options.length;
        choices.classList.remove("picked");
        choices.replaceChildren();
        options.forEach((color, index) => {
          const button = document.createElement("button");
          button.className = "choice";
          button.type = "button";
          button.setAttribute("aria-label", color.name);
          button.style.setProperty("--n", index);
          button.style.setProperty("--c", color.hex);
          button.style.setProperty("--c-light", mixColor(color.hex, [255, 255, 255], .82));
          button.style.setProperty("--c-mid", mixColor(color.hex, [255, 255, 255], .5));
          button.style.setProperty("--c-glow", mixColor(color.hex, [255, 255, 255], .3));
          button.style.setProperty("--c-dark", mixColor(color.hex, [24, 40, 30], .36));
          button.style.setProperty("--c-ink", mixColor(color.hex, [20, 30, 20], .62));
          button.innerHTML = `<span class="choice-art">${flowerSvg(color)}</span><span class="choice-name">${color.name}</span>`;
          button.addEventListener("click", () => chooseColor(color, button));
          choices.append(button);
        });
      }

      let activeColors = COLORS.slice(0, 4);
      function chooseTarget() {
        const available = activeColors.filter((color) => color.id !== lastTarget);
        target = available[Math.floor(Math.random() * available.length)] || activeColors[0];
        lastTarget = target.id;
      }

      function askQuestion() {
        if (round >= ROUNDS) {
          finishSession();
          return;
        }
        resetBunny();
        busy = false;
        paintProgress();
        chooseTarget();
        renderChoices();
        currentAsk = pickLine("ask", R.lines.ask, target);
        readOut(currentAsk);
      }

      function beginSession() {
        round = 0;
        sessionStars = 0;
        lastTarget = "";
        bunny.classList.remove("dance");
        resetBunny();
        resetFlowerBed();
        bunnySpot = 0;
        placeBunny(0);
        activeColors = COLORS.slice(0, Number(colorCount.value) || 4);
        $("finishScreen").hidden = true;
        $("startScreen").hidden = true;
        $("choices").hidden = false;
        paintProgress();
        askQuestion();
      }

      // Budha står bag blomsterbedet med fødderne ved jordhøjen i det plot, hun skal plante i, og flytter sig kun ét plot ad gangen.
      function placeBunny(index) {
        const plot = flowerBed.children[index];
        if (!plot) return;
        const field = $("field");
        const fieldRect = field.getBoundingClientRect();
        const border = field.clientLeft;
        const plotRect = plot.getBoundingClientRect();
        const style = getComputedStyle(bunny);
        const width = parseFloat(style.width) || bunny.getBoundingClientRect().width;
        const height = parseFloat(style.height) || bunny.getBoundingClientRect().height;
        const centre = plotRect.left + plotRect.width / 2 - fieldRect.left - border;
        const x = Math.min(Math.max(centre, width / 2 + 6), field.clientWidth - width / 2 - 6);
        const bottom = fieldRect.bottom - border - plotRect.bottom + 2;
        const shadowWidth = width * .62;
        const shadowHeight = shadowWidth * .17;
        bunny.style.left = `${x}px`;
        bunny.style.bottom = `${bottom}px`;
        shadow.style.left = `${x}px`;
        shadow.style.bottom = `${bottom + height * .063 - shadowHeight / 2}px`;
        shadow.style.width = `${shadowWidth}px`;
        shadow.style.height = `${shadowHeight}px`;
        shadow.style.marginLeft = `${-shadowWidth / 2}px`;
      }

      // To hop med forberedelse, udstrækning i luften og blød landing. Ørerne hænger bagefter og skyggen følger jorden.
      function hopToSpot(index) {
        scareBunnyPerchers();
        const before = bunny.getBoundingClientRect();
        placeBunny(index);
        bunnySpot = index;
        const after = bunny.getBoundingClientRect();
        const dx = before.left - after.left;
        const dy = before.top - after.top;
        if (reduceMotion || (!dx && !dy)) return;
        const hop = Math.min(44, Math.max(26, Math.abs(dx) * .2));
        const at = (progress, lift, scale) => `translate(${dx * (1 - progress)}px, ${dy * (1 - progress) - lift}px) scale(${scale})`;
        const duration = 950;
        bunny.style.animation = "none";
        bunnyMotions = [
          bunny.animate([
            { transform: at(0, 0, "1, 1"), offset: 0, easing: "ease-out" },
            { transform: at(0, 0, "1.08, .86"), offset: .1, easing: "cubic-bezier(.2, .7, .4, 1)" },
            { transform: at(.25, hop, ".94, 1.12"), offset: .24, easing: "cubic-bezier(.6, 0, .8, .4)" },
            { transform: at(.5, 0, "1.09, .88"), offset: .4, easing: "ease-out" },
            { transform: at(.5, 0, "1, 1"), offset: .46, easing: "ease-out" },
            { transform: at(.5, 0, "1.07, .89"), offset: .54, easing: "cubic-bezier(.2, .7, .4, 1)" },
            { transform: at(.75, hop * .9, ".95, 1.1"), offset: .67, easing: "cubic-bezier(.6, 0, .8, .4)" },
            { transform: at(1, 0, "1.1, .87"), offset: .82, easing: "ease-out" },
            { transform: at(1, 0, ".98, 1.03"), offset: .92, easing: "ease-in-out" },
            { transform: at(1, 0, "1, 1"), offset: 1 }
          ], { duration })
        ];
        bunnyMotions.push(shadow.animate([
          { transform: `translateX(${dx}px) scale(1)`, opacity: 1, offset: 0 },
          { transform: `translateX(${dx * .75}px) scale(.72)`, opacity: .55, offset: .24 },
          { transform: `translateX(${dx * .5}px) scale(1.1)`, opacity: 1, offset: .4 },
          { transform: `translateX(${dx * .5}px) scale(1)`, opacity: 1, offset: .5 },
          { transform: `translateX(${dx * .25}px) scale(.74)`, opacity: .55, offset: .67 },
          { transform: "translateX(0) scale(1.1)", opacity: 1, offset: .82 },
          { transform: "translateX(0) scale(1)", opacity: 1, offset: 1 }
        ], { duration }));
        bunny.querySelectorAll(".ear").forEach((ear) => {
          const side = ear.classList.contains("left") ? -1 : 1;
          bunnyMotions.push(ear.animate([
            { transform: "rotate(0deg)", offset: 0 },
            { transform: `rotate(${side * 4}deg)`, offset: .1 },
            { transform: `rotate(${side * 13}deg)`, offset: .22 },
            { transform: `rotate(${side * -6}deg)`, offset: .34 },
            { transform: `rotate(${side * 11}deg)`, offset: .42 },
            { transform: "rotate(0deg)", offset: .52 },
            { transform: `rotate(${side * 13}deg)`, offset: .66 },
            { transform: `rotate(${side * -6}deg)`, offset: .78 },
            { transform: `rotate(${side * 9}deg)`, offset: .86 },
            { transform: `rotate(${side * -2}deg)`, offset: .94 },
            { transform: "rotate(0deg)", offset: 1 }
          ], { duration, easing: "ease-in-out" }));
        });
        const done = () => { if (bunny.style.animation === "none") bunny.style.animation = ""; };
        bunnyMotions[0].onfinish = done;
        bunnyMotions[0].oncancel = done;
      }

      function resetBunny() {
        bunnyMotions.forEach((motion) => motion.cancel());
        bunnyMotions = [];
        bunny.style.animation = "";
        bunny.classList.remove("digging", "watering", "catching", "nope", "happy");
      }

      // Budha følger fingeren eller musen med øjne og hoved.
      function lookAt(x, y) {
        const rect = bunny.getBoundingClientRect();
        const reach = Math.max(rect.width * 2.4, 180);
        const nx = Math.max(-1, Math.min(1, (x - (rect.left + rect.width / 2)) / reach));
        const ny = Math.max(-1, Math.min(1, (y - (rect.top + rect.height * .42)) / reach));
        bunny.style.setProperty("--lx", nx.toFixed(2));
        bunny.style.setProperty("--ly", ny.toFixed(2));
        bunny.style.setProperty("--ex", (nx * 3.2).toFixed(2));
        bunny.style.setProperty("--ey", (ny * 2.4).toFixed(2));
      }

      function shakeNo() {
        bunny.classList.remove("nope");
        void bunny.getBoundingClientRect();
        bunny.classList.add("nope");
        window.setTimeout(() => bunny.classList.remove("nope"), 650);
      }

      function flySeed(choice, color) {
        if (reduceMotion) return;
        const source = (choice.querySelector(".flower") || choice).getBoundingClientRect();
        const bunnyRect = bunny.getBoundingClientRect();
        const size = Math.min(source.width, 64);
        const fromX = source.left + source.width / 2;
        const fromY = source.top + source.height / 2;
        const dx = bunnyRect.left + bunnyRect.width * .64 - fromX;
        const dy = bunnyRect.top + bunnyRect.height * .66 - fromY;
        const fly = document.createElement("div");
        fly.className = "fly-flower";
        fly.setAttribute("aria-hidden", "true");
        fly.style.width = `${size}px`;
        fly.style.left = `${fromX - size / 2}px`;
        fly.style.top = `${fromY - size / 2}px`;
        fly.innerHTML = flowerSvg(color);
        document.body.append(fly);
        const arc = Math.max(46, Math.abs(dy) * .3);
        const motion = fly.animate([
          { transform: "translate(0, 0) scale(1) rotate(0)", opacity: 1, offset: 0 },
          { transform: `translate(${dx * .5}px, ${dy * .5 - arc}px) scale(1.15) rotate(150deg)`, opacity: 1, offset: .5 },
          { transform: `translate(${dx}px, ${dy}px) scale(.3) rotate(320deg)`, opacity: .9, offset: 1 }
        ], { duration: 600, easing: "ease-in-out", fill: "forwards" });
        motion.onfinish = () => fly.remove();
        motion.oncancel = () => fly.remove();
      }

      function beginPlanting(color, index, choice, decoration) {
        const plot = flowerBed.children[index];
        if (!plot) return;
        const later = (action, delay) => window.setTimeout(action, reduceMotion ? 0 : delay);
        resetBunny();
        scareBunnyPerchers();
        flySeed(choice, color);
        later(() => bunny.classList.add("catching", "happy"), 520);
        later(() => {
          bunny.classList.remove("catching");
          bunny.classList.add("digging");
        }, 700);
        later(() => {
          bunny.classList.remove("digging");
          bunny.classList.add("watering");
          plot.classList.add("wet");
        }, 1580);
        later(() => {
          bunny.classList.remove("watering");
          plantFlower(color, index);
        }, 2600);
        if (index + 1 < ROUNDS) {
          later(() => hopToSpot(index + 1), 2680);
          later(() => {
            const grown = plot.getBoundingClientRect();
            lookAt(grown.left + grown.width / 2, grown.top);
          }, 3500);
        }
        if (decoration) later(() => showReward(decoration), 3400);
      }

      function awardStar() {
        totalStars += 1;
        sessionStars += 1;
        saveValue(STAR_KEY, String(totalStars));
        Topbar.refreshStars(true);
        return totalStars % 3 === 0 ? unlockDecoration() : null;
      }

      function unlockDecoration() {
        const next = DECORATIONS.find((item) => !unlocked.includes(item.id));
        if (!next) return null;
        unlocked.push(next.id);
        saveValue(DECOR_KEY, JSON.stringify(unlocked));
        return next;
      }

      function showReward(item) {
        if (!item) return;
        paintDecor(item.id);
        $("rewardIcon").textContent = item.icon;
        $("rewardText").textContent = `En ny ven: ${item.name}!`;
        reward.hidden = false;
        clearTimeout(rewardTimer);
        rewardTimer = window.setTimeout(() => { reward.hidden = true; }, 1350);
      }

      function chooseColor(color, button) {
        if (busy) return;
        busy = true;
        choices.querySelectorAll("button").forEach((choice) => { choice.disabled = true; });
        if (color.id !== target.id) {
          button.classList.add("wrong");
          shakeNo();
          currentAsk = pickLine("ask", R.lines.ask, target);
          readOut([pickLine("wrong", R.lines.wrong, color), currentAsk]);
          window.setTimeout(() => {
            button.classList.remove("wrong");
            choices.querySelectorAll("button").forEach((choice) => { choice.disabled = false; });
            busy = false;
          }, 850);
          return;
        }

        button.classList.add("correct");
        choices.classList.add("picked");
        const flowerIndex = round;
        const decoration = awardStar();
        round += 1;
        paintProgress();
        const lines = [pickLine("praise", R.lines.praise), pickLine("plant", R.lines.plant, color)];
        if (decoration) lines.push(pickLine("reward", R.lines.reward, decoration.name));
        const spoken = readOut(lines);
        beginPlanting(color, flowerIndex, button, decoration);
        const animationTime = reduceMotion ? 1100 : decoration ? 4850 : 4300;
        // Næste spørgsmål kommer først, når Budha er færdig med at tale
        Promise.all([spoken, new Promise((resolve) => window.setTimeout(resolve, animationTime))])
          .then(() => window.setTimeout(askQuestion, 400));
      }

      function finishSession() {
        busy = true;
        resetBunny();
        $("choices").hidden = true;
        $("roundLabel").textContent = "Haven er fuld af farver!";
        bunny.classList.add("dance", "happy");
        $("finishStars").textContent = "⭐".repeat(sessionStars);
        $("finishText").textContent = `Du hjalp Budha med at plante ${sessionStars} blomster. Kom og leg igen!`;
        $("finishScreen").hidden = false;
        readOut(pickLine("finish", R.lines.finish));
      }

      function findDanishVoice() {
        if (!("speechSynthesis" in window)) return;
        const danish = speechSynthesis.getVoices().filter((item) => item.lang && item.lang.toLowerCase().replace("_", "-").startsWith("da"));
        // Foretræk stemmer, der ligger på enheden, frem for netværksstemmer
        voice = danish.find((item) => item.localService) || danish[0] || null;
      }

      let finishSpeech = null;

      function endSpeech(completed) {
        if (!finishSpeech) return;
        const done = finishSpeech;
        finishSpeech = null;
        done(completed);
      }

      function stopVoice() {
        voiceToken += 1;
        if ("speechSynthesis" in window) speechSynthesis.cancel();
        clipAudio.onended = null;
        clipAudio.onerror = null;
        clipAudio.pause();
        endSpeech(false);
      }

      function voiceUnavailable(token) {
        if (token !== voiceToken || muted) return;
        console.warn("Dansk oplæsning kunne ikke afspilles.");
        voiceNote.hidden = false;
        $("repeat").title = "Oplæsning virker ikke lige nu – prøv igen";
        endSpeech(false);
      }

      function speakWithDeviceVoice(text, token) {
        if (!("speechSynthesis" in window)) {
          voiceUnavailable(token);
          return;
        }
        // Stemmerne indlæses ofte sent på mobil, så find dem igen her
        if (!voice) findDanishVoice();
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "da-DK";
          if (voice) utterance.voice = voice;
          utterance.rate = .88;
          utterance.onend = () => { if (token === voiceToken) endSpeech(true); };
          utterance.onerror = (event) => {
            if (event.error === "canceled" || event.error === "interrupted") return;
            voiceUnavailable(token);
          };
          speechSynthesis.speak(utterance);
        } catch (error) {
          console.warn("Dansk tale på enheden kunne ikke startes.", error);
          voiceUnavailable(token);
        }
      }

      // Tilfældig replik fra en gruppe i lines.js, aldrig den samme to gange i træk
      function pickLine(key, pool, arg) {
        let index;
        do {
          index = Math.floor(Math.random() * pool.length);
        } while (pool.length > 1 && index === lastLine[key]);
        lastLine[key] = index;
        const item = pool[index];
        return typeof item === "function" ? item(arg) : item;
      }

      // Afspiller de indtalte lydklip efter hinanden og viser den sætning, der siges. Mangler et klip, læser enhedens stemme resten op.
      function playClips(parts, index, token) {
        if (token !== voiceToken) return;
        if (index >= parts.length) {
          endSpeech(true);
          return;
        }
        message.textContent = parts[index];
        let handled = false;
        const fallback = () => {
          if (handled) return;
          handled = true;
          if (token !== voiceToken || muted) return;
          const rest = parts.slice(index).join(" ");
          message.textContent = rest;
          speakWithDeviceVoice(rest, token);
        };
        clipAudio.onended = () => {
          if (handled) return;
          handled = true;
          playClips(parts, index + 1, token);
        };
        clipAudio.onerror = fallback;
        clipAudio.src = `audio/${R.clipFile(parts[index])}`;
        const playing = clipAudio.play();
        if (playing && typeof playing.catch === "function") playing.catch(fallback);
      }

      // Viser teksten og siger den højt. Svaret er true, når alt er sagt til ende.
      function readOut(text) {
        stopVoice();
        const parts = Array.isArray(text) ? text : [text];
        if (muted) {
          message.textContent = parts.join(" ");
          return Promise.resolve(false);
        }
        voiceNote.hidden = true;
        const token = voiceToken;
        return new Promise((resolve) => {
          finishSpeech = resolve;
          window.setTimeout(() => { if (token === voiceToken) endSpeech(false); }, 15000);
          playClips(parts, 0, token);
        });
      }

      for (let i = 0; i < ROUNDS; i++) {
        const step = document.createElement("span");
        step.className = "step";
        step.textContent = "★";
        step.setAttribute("aria-hidden", "true");
        progress.append(step);
        steps.push(step);
      }

      totalStars = readNumber(STAR_KEY, 0);
      unlocked = loadDecor();
      resetFlowerBed();
      const savedColors = readNumber(COLORS_KEY, 4);
      colorCount.value = [4, 6, 8].includes(savedColors) ? String(savedColors) : "4";
      colorCount.addEventListener("change", () => saveValue(COLORS_KEY, colorCount.value));

      $("startBtn").addEventListener("click", beginSession);
      $("againBtn").addEventListener("click", beginSession);
      $("repeat").addEventListener("click", () => {
        if (target && !busy) readOut(currentAsk);
      });
      paintProgress();
      buildScenery();
      paintDecor();
      placeBunny(bunnySpot);
      if ("ResizeObserver" in window) {
        new ResizeObserver(() => {
          placeBunny(bunnySpot);
          refreshPerched();
        }).observe($("field"));
      }
      window.addEventListener("resize", () => {
        placeBunny(bunnySpot);
        refreshPerched();
      });
      window.addEventListener("load", () => {
        placeBunny(bunnySpot);
        refreshPerched();
      });
      let lookFrame = 0;
      const followPointer = (event) => {
        const { clientX, clientY } = event;
        if (lookFrame) cancelAnimationFrame(lookFrame);
        lookFrame = requestAnimationFrame(() => {
          lookFrame = 0;
          lookAt(clientX, clientY);
        });
      };
      window.addEventListener("pointermove", followPointer, { passive: true });
      window.addEventListener("pointerdown", followPointer, { passive: true });
      Topbar.init({ kid: "riyana", controls: [$("settings")] });
      findDanishVoice();
      if ("speechSynthesis" in window) speechSynthesis.addEventListener("voiceschanged", findDanishVoice);
      window.addEventListener("topbar:sound", (event) => {
        muted = !event.detail.on;
        if (muted) stopVoice();
      });
    })();
