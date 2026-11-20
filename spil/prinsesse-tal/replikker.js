// Alle prinsessens replikker i Prinsesse Riyana. Spillet, service workeren og lydgeneratoren
// (lydvaerktoej\lav-lyd.mjs prinsesse-tal) bruger denne ene fil, så tekst og lydklip altid passer sammen.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PrinsesseReplikker = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const MAX = 20;
  const numbers = ["nul", "et", "to", "tre", "fire", "fem", "seks", "syv", "otte", "ni", "ti", "elleve", "tolv", "tretten", "fjorten", "femten", "seksten", "sytten", "atten", "nitten", "tyve"];

  const things = [
    { e: "💎", sg: "diamant", pl: "diamanter", art: "en" },
    { e: "🎀", sg: "sløjfe", pl: "sløjfer", art: "en" },
    { e: "💍", sg: "ring", pl: "ringe", art: "en" },
    { e: "👑", sg: "krone", pl: "kroner", art: "en" },
    { e: "🌸", sg: "blomst", pl: "blomster", art: "en" },
    { e: "🦋", sg: "sommerfugl", pl: "sommerfugle", art: "en" },
    { e: "💖", sg: "hjerte", pl: "hjerter", art: "et" },
    { e: "⭐", sg: "stjerne", pl: "stjerner", art: "en" }
  ];

  // Hver tredje stjerne giver et nyt prinsessting til samlingen
  const accessories = [
    { e: "🎀", name: "sløjfe" }, { e: "💍", name: "ring" }, { e: "💄", name: "læbestift" }, { e: "💎", name: "diamant" },
    { e: "🦄", name: "enhjørning" }, { e: "🌸", name: "blomst" }, { e: "🦋", name: "sommerfugl" }, { e: "👑", name: "krone" }
  ];

  const praise = ["Flot!", "Dygtig!", "Super!", "Hurra!", "Sådan!", "Fantastisk!", "Hvor er du dygtig!", "Godt set!", "Wow!"];

  const lines = {
    count: (n) => numbers[n],
    amount: (n, t) => (n === 1 ? `${t.art} ${t.sg}.` : `${numbers[n]} ${t.pl}.`),
    put: (n, t) => `Læg ${lines.amount(n, t).slice(0, -1)} i smykkeskrinet.`,
    findAsk: (n) => `Find tallet ${numbers[n]}.`,
    findAgain: (n) => `Find ${numbers[n]}.`,
    isNumber: (m) => `Det er ${numbers[m]}.`,
    notNumber: (m) => `Det er ikke ${numbers[m]}.`,
    countAsk: (t) => `Hvor mange ${t.pl} er der? Tæl med!`,
    unlock: (a) => `Du fik en ${a.name}!`,
    tapNumber: "Tryk på et tal.",
    letsCount: "Lad os tælle sammen!",
    tryAgain: "Prøv igen!",
    moreNumbers: "Nu kan vi øve flere tal!"
  };

  // Alle sætninger, der kan blive sagt. Hver sætning er ét lydklip.
  function allClips() {
    const all = [lines.tapNumber, lines.letsCount, lines.tryAgain, lines.moreNumbers, ...praise];
    for (let n = 1; n <= MAX; n++) {
      all.push(lines.count(n), lines.findAsk(n), lines.findAgain(n), lines.isNumber(n), lines.notNumber(n));
      for (const t of things) all.push(lines.amount(n, t), lines.put(n, t));
    }
    for (const t of things) all.push(lines.countAsk(t));
    for (const a of accessories) all.push(lines.unlock(a));
    return [...new Set(all)];
  }

  // Filnavnet er sætningen med små bogstaver, æ=ae, ø=oe, å=aa og bindestreger
  function clipFile(text) {
    return text.toLowerCase().replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + ".mp3";
  }

  return { MAX, numbers, things, accessories, praise, lines, allClips, clipFile };
});
