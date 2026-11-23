    const levelButtons = [...document.querySelectorAll(".level")];
    const answerContainer = document.querySelector("#answers");
    const scoreDisplay = document.querySelector("#score");
    const roundDisplay = document.querySelector("#round");
    const feedback = document.querySelector("#feedback");
    const nextButton = document.querySelector("#next");
    const blocksSvg = document.querySelector("#blocks");
    const blocksDescription = document.querySelector("#blocks-desc");

    let maximum = 19;
    let currentNumber = 0;
    let correctCount = 0;
    let answeredCount = 0;
    let round = 1;

    function randomInteger(max) {
      return Math.floor(Math.random() * max) + 1;
    }

    function makeChoices(answer) {
      const choices = new Set([answer]);
      while (choices.size < 4) choices.add(randomInteger(maximum));
      return [...choices].sort(() => Math.random() - 0.5);
    }

    function renderBlocks(number) {
      const hundreds = Math.floor(number / 100);
      const tens = Math.floor((number % 100) / 10);
      const ones = number % 10;
      const categories = [
        { label: "Hundreder", count: hundreds, x: 16, kind: "hundred" },
        { label: "Tiere", count: tens, x: 316, kind: "ten" },
        { label: "Enere", count: ones, x: 616, kind: "one" }
      ];

      let markup = `<rect x="1" y="1" width="898" height="328" rx="16" fill="transparent"/>`;

      for (const category of categories) {
        markup += `<text x="${category.x + 134}" y="29" text-anchor="middle" fill="#506784" font-size="17" font-weight="700" font-family="Trebuchet MS, sans-serif">${category.label}</text>`;
        markup += `<line x1="${category.x + 12}" y1="42" x2="${category.x + 256}" y2="42" stroke="#d4e5f1" stroke-width="2"/>`;

        for (let index = 0; index < category.count; index++) {
          if (category.kind === "hundred") {
            const col = index % 3;
            const row = Math.floor(index / 3);
            const x = category.x + 31 + col * 82;
            const y = 61 + row * 84;
            markup += `<g aria-hidden="true"><rect x="${x}" y="${y}" width="70" height="70" rx="3" fill="#f3b942" stroke="#bd841f" stroke-width="2"/>`;
            for (let grid = 1; grid < 10; grid++) {
              const offset = grid * 7;
              markup += `<path d="M${x + offset} ${y}v70 M${x} ${y + offset}h70" stroke="#fff1c8" stroke-width="1.3"/>`;
            }
            markup += `</g>`;
          } else if (category.kind === "ten") {
            const col = index % 6;
            const row = Math.floor(index / 6);
            const x = category.x + 29 + col * 37;
            const y = 61 + row * 116;
            markup += `<g aria-hidden="true"><rect x="${x}" y="${y}" width="28" height="105" rx="5" fill="#43a86b" stroke="#247747" stroke-width="2"/>`;
            for (let segment = 1; segment < 10; segment++) {
              const sy = y + segment * 10.5;
              markup += `<path d="M${x + 2} ${sy}h24" stroke="#a9e3bb" stroke-width="1.4"/>`;
            }
            markup += `<path d="M${x + 5} ${y + 3}v99" stroke="#83d19b" stroke-width="2" opacity=".8"/></g>`;
          } else {
            const col = index % 5;
            const row = Math.floor(index / 5);
            const x = category.x + 32 + col * 43;
            const y = 72 + row * 94;
            markup += `<g aria-hidden="true"><polygon points="${x},${y + 9} ${x + 15},${y} ${x + 30},${y + 9} ${x + 15},${y + 18}" fill="#ff7770" stroke="#ba4542" stroke-width="1.5"/>`;
            markup += `<polygon points="${x},${y + 9} ${x + 15},${y + 18} ${x + 15},${y + 38} ${x},${y + 29}" fill="#e55450" stroke="#ba4542" stroke-width="1.5"/>`;
            markup += `<polygon points="${x + 15},${y + 18} ${x + 30},${y + 9} ${x + 30},${y + 29} ${x + 15},${y + 38}" fill="#d94240" stroke="#ba4542" stroke-width="1.5"/></g>`;
          }
        }
      }

      blocksSvg.innerHTML = `<title id="blocks-title">Base-ti klodser</title><desc id="blocks-desc">${hundreds} hundreder, ${tens} tiere og ${ones} enere.</desc>${markup}`;
      blocksDescription.textContent = `${hundreds} hundreder, ${tens} tiere og ${ones} enere.`;
    }

    function startRound() {
      currentNumber = randomInteger(maximum);
      roundDisplay.textContent = `Runde ${round}`;
      feedback.textContent = "";
      feedback.className = "feedback";
      nextButton.hidden = true;
      renderBlocks(currentNumber);
      answerContainer.replaceChildren();

      for (const choice of makeChoices(currentNumber)) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "answer";
        button.setAttribute("aria-label", `Svar ${choice}`);
        button.innerHTML = `<span class="ball" aria-hidden="true"></span><span class="answer-number">${choice}</span>`;
        button.addEventListener("click", () => selectAnswer(button, choice));
        answerContainer.append(button);
      }
    }

    function placeDescription(number) {
      const hundreds = Math.floor(number / 100);
      const tens = Math.floor((number % 100) / 10);
      const ones = number % 10;
      const parts = [];
      if (hundreds) parts.push(`${hundreds} ${hundreds === 1 ? "hundred" : "hundreder"}`);
      if (tens) parts.push(`${tens} ${tens === 1 ? "tier" : "tiere"}`);
      if (ones) parts.push(`${ones} ${ones === 1 ? "ener" : "enere"}`);
      return parts.join(" og ");
    }

    function selectAnswer(selectedButton, choice) {
      const isCorrect = choice === currentNumber;
      answeredCount++;
      if (isCorrect) correctCount++;

      for (const button of answerContainer.querySelectorAll(".answer")) {
        button.disabled = true;
        if (Number(button.querySelector(".answer-number").textContent) === currentNumber) {
          button.classList.add("is-right");
        }
      }

      if (isCorrect) {
        feedback.textContent = `Rigtigt! ${currentNumber} er ${placeDescription(currentNumber)}.`;
        feedback.classList.add("good");
      } else {
        selectedButton.classList.add("is-wrong");
        feedback.textContent = `Godt forsøgt — det rigtige svar er ${currentNumber} (${placeDescription(currentNumber)}).`;
        feedback.classList.add("bad");
      }

      scoreDisplay.textContent = `Rigtige: ${correctCount} / ${answeredCount}`;
      nextButton.hidden = false;
      nextButton.focus();
    }

    for (const button of levelButtons) {
      button.addEventListener("click", () => {
        maximum = Number(button.dataset.max);
        correctCount = 0;
        answeredCount = 0;
        round = 1;
        scoreDisplay.textContent = "Rigtige: 0 / 0";
        for (const level of levelButtons) {
          level.setAttribute("aria-pressed", String(level === button));
        }
        startRound();
      });
    }

    nextButton.addEventListener("click", () => {
      round++;
      startRound();
      answerContainer.querySelector(".answer")?.focus();
    });

    startRound();
