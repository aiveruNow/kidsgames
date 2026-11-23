const levelButtons = [...document.querySelectorAll(".level")];
const settings = document.querySelector("#settings");
const board = document.querySelector("#board");
const boardDescription = document.querySelector("#boardDesc");
const answerContainer = document.querySelector("#answers");
const scoreDisplay = document.querySelector("#score");
const roundDisplay = document.querySelector("#round");
const levelPill = document.querySelector("#levelPill");
const meter = document.querySelector("#meter");
const meterDots = meter.querySelector(".meter-dots");
const feedback = document.querySelector("#feedback");
const nextButton = document.querySelector("#next");
const starPopup = document.querySelector("#starPopup");

const STAR_EVERY = 5;
const PLACES = [
  { key: "h", one: "hundrede", many: "hundreder" },
  { key: "t", one: "tier", many: "tiere" },
  { key: "o", one: "ener", many: "enere" }
];

const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* ingen lagring */ } }
};

let maximum = [19, 29, 49, 99, 999].includes(Number(store.get("klods-level"))) ? Number(store.get("klods-level")) : 19;
let currentNumber = 0;
let correctCount = 0;
let answeredCount = 0;
let round = 1;
let progress = 0;
let stars = Number(store.get("klods-stars")) || 0;
let answered = false;
let roundToken = 0;
let popupTimer = null;

Topbar.init({ kid: "ari", controls: [settings] });

let muted = !Topbar.soundOn();
const { tone, buzz } = KidsSynth.create(() => muted);
window.addEventListener("topbar:sound", event => { muted = !event.detail.on; });

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

for (let index = 0; index < STAR_EVERY; index++) meterDots.append(document.createElement("i"));

function randomInteger(max) {
  return Math.floor(Math.random() * max) + 1;
}

function shuffle(list) {
  for (let index = list.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [list[index], list[other]] = [list[other], list[index]];
  }
  return list;
}

function split(number) {
  return [Math.floor(number / 100), Math.floor((number % 100) / 10), number % 10];
}

// Svarene ligner det rigtige tal: byttede cifre og tal der er 1, 10 eller 100 fra.
function makeChoices(answer) {
  const [h, t, o] = split(answer);
  const valid = value => value >= 1 && value <= maximum && value !== answer;
  const swaps = new Set([h * 100 + o * 10 + t, t * 100 + h * 10 + o, o * 100 + t * 10 + h].filter(valid));
  const steps = new Set([answer - 1, answer + 1, answer - 10, answer + 10, answer - 100, answer + 100].filter(valid));

  const wrong = new Set();
  const swapList = shuffle([...swaps]);
  if (swapList.length) wrong.add(swapList[0]);
  for (const value of shuffle([...steps])) if (wrong.size < 3) wrong.add(value);
  for (const value of swapList) if (wrong.size < 3) wrong.add(value);
  while (wrong.size < 3) {
    const value = randomInteger(maximum);
    if (value !== answer) wrong.add(value);
  }
  return shuffle([answer, ...wrong]);
}

function coloredDigits(number) {
  const text = String(number);
  return [...text].map((digit, index) => `<span class="d-${PLACES[3 - text.length + index].key}">${digit}</span>`).join("");
}

function countPhrase(place, count) {
  return `<span class="d-${place.key}">${count} ${count === 1 ? place.one : place.many}</span>`;
}

function describe(number) {
  const digits = split(number);
  const shown = maximum < 100 ? [1, 2] : [0, 1, 2];
  return shown.map(index => countPhrase(PLACES[index], digits[index])).join(" + ");
}

function renderBoard(number) {
  const digits = split(number);
  board.classList.toggle("two", maximum < 100);
  board.classList.remove("cheer");

  board.querySelectorAll(".col").forEach((column, index) => {
    const place = PLACES[index].key;
    const pile = column.querySelector(".pile");
    const slot = column.querySelector(".slot");
    pile.replaceChildren();
    pile.classList.toggle("empty", digits[index] === 0);
    for (let block = 0; block < digits[index]; block++) {
      const piece = document.createElement("i");
      piece.className = `b b-${place}`;
      piece.style.setProperty("--i", String(block + index * 2));
      pile.append(piece);
    }
    slot.textContent = "?";
    slot.classList.remove("show");
  });

  const shown = maximum < 100 ? [1, 2] : [0, 1, 2];
  boardDescription.textContent = shown
    .map(index => `${digits[index]} ${digits[index] === 1 ? PLACES[index].one : PLACES[index].many}`)
    .join(", ");
}

function startRound() {
  roundToken++;
  answered = false;
  let next = randomInteger(maximum);
  while (maximum > 1 && next === currentNumber) next = randomInteger(maximum);
  currentNumber = next;

  roundDisplay.textContent = `Runde ${round}`;
  levelPill.textContent = `Op til ${maximum}`;
  feedback.textContent = "";
  feedback.className = "feedback";
  nextButton.hidden = true;
  renderBoard(currentNumber);
  answerContainer.replaceChildren();

  makeChoices(currentNumber).forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer";
    button.dataset.value = String(choice);
    button.style.setProperty("--k", String(index));
    button.setAttribute("aria-label", `Svar ${choice}`);
    button.innerHTML = `<span class="key" aria-hidden="true">${index + 1}</span><span class="answer-number">${coloredDigits(choice)}</span>`;
    button.addEventListener("click", () => selectAnswer(button, choice));
    answerContainer.append(button);
  });
}

function updateMeter() {
  meterDots.querySelectorAll("i").forEach((dot, index) => dot.classList.toggle("on", index < progress));
  meter.setAttribute("aria-label", `${progress} af ${STAR_EVERY} til næste stjerne`);
}

// Tallet bygges op kolonne for kolonne, så barnet ser, hvordan cifrene hører til klodserne
function revealDigits(token, correct) {
  const digits = split(currentNumber);
  const columns = [...board.querySelectorAll(".col")].filter(column => getComputedStyle(column).display !== "none");
  const offset = columns.length === 2 ? 1 : 0;
  columns.forEach((column, order) => {
    const slot = column.querySelector(".slot");
    slot.textContent = String(digits[order + offset]);
    slot.style.setProperty("--k", String(order));
    slot.classList.add("show");
    setTimeout(() => {
      if (token === roundToken) tone(correct ? 523 + order * 131 : 330 + order * 60, .16, "triangle", .1);
    }, reducedMotion() ? 0 : order * 160 + 120);
  });
  if (correct && !reducedMotion()) {
    void board.offsetWidth;
    board.classList.add("cheer");
  }
}

function selectAnswer(selectedButton, choice) {
  if (answered) return;
  answered = true;
  const isCorrect = choice === currentNumber;
  answeredCount++;
  if (isCorrect) correctCount++;

  for (const button of answerContainer.querySelectorAll(".answer")) {
    button.disabled = true;
    if (Number(button.dataset.value) === currentNumber) button.classList.add("is-right");
    else if (button !== selectedButton) button.classList.add("is-dim");
  }

  if (isCorrect) {
    feedback.innerHTML = `Rigtigt! <span>${coloredDigits(currentNumber)}</span> = ${describe(currentNumber)}`;
    feedback.classList.add("good");
    progress++;
    tone(784, .12, "sine", .12, .35);
    tone(1047, .22, "sine", .1, .5);
  } else {
    selectedButton.classList.add("is-wrong");
    feedback.innerHTML = `Godt forsøgt! Det er <span>${coloredDigits(currentNumber)}</span> = ${describe(currentNumber)}`;
    feedback.classList.add("bad");
    buzz(60);
  }

  revealDigits(roundToken, isCorrect);
  scoreDisplay.textContent = `Rigtige: ${correctCount} / ${answeredCount}`;
  updateMeter();

  if (isCorrect && progress >= STAR_EVERY) {
    progress = 0;
    awardStar();
  }
  nextButton.hidden = false;
  nextButton.focus({ preventScroll: true });
}

function awardStar() {
  stars++;
  store.set("klods-stars", String(stars));
  setTimeout(() => {
    updateMeter();
    showStarPopup();
  }, reducedMotion() ? 0 : 1100);
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
  [523, 659, 784, 1047].forEach((freq, index) => tone(freq, .3, "triangle", .13, index * .1));
  clearTimeout(popupTimer);
  popupTimer = setTimeout(hideStarPopup, 4200);
  Topbar.refreshStars(true);
}

function hideStarPopup() {
  clearTimeout(popupTimer);
  starPopup.hidden = true;
  nextButton.focus({ preventScroll: true });
}

function resetGame() {
  clearTimeout(popupTimer);
  starPopup.hidden = true;
  correctCount = 0;
  answeredCount = 0;
  round = 1;
  progress = 0;
  scoreDisplay.textContent = "Rigtige: 0 / 0";
  updateMeter();
  startRound();
}

for (const button of levelButtons) {
  button.addEventListener("click", () => {
    maximum = Number(button.dataset.max);
    store.set("klods-level", String(maximum));
    for (const level of levelButtons) level.setAttribute("aria-pressed", String(level === button));
    Topbar.closeMenu();
    resetGame();
  });
}

nextButton.addEventListener("click", () => {
  round++;
  startRound();
  answerContainer.querySelector(".answer")?.focus({ preventScroll: true });
});

starPopup.addEventListener("click", hideStarPopup);

// Tast 1–4 vælger svar, og Escape lukker stjernen
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !starPopup.hidden) { hideStarPopup(); return; }
  if (!starPopup.hidden || answered || event.ctrlKey || event.metaKey || event.altKey) return;
  const index = Number(event.key) - 1;
  const button = answerContainer.querySelectorAll(".answer")[index];
  if (button) button.click();
});

for (const level of levelButtons) level.setAttribute("aria-pressed", String(Number(level.dataset.max) === maximum));
resetGame();
