// Alle Budhas replikker i Farvehaven. Spillet, service workeren og lydgeneratoren
// (lydvaerktoej\lav-lyd.mjs) bruger denne ene fil, så tekst og lydklip altid passer sammen.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.FarvehavenReplikker = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // name = "en ___ blomst", flower = "den ___ blomst"
  const colors = {
    red: { name: "rød", flower: "røde" },
    yellow: { name: "gul", flower: "gule" },
    blue: { name: "blå", flower: "blå" },
    green: { name: "grøn", flower: "grønne" },
    orange: { name: "orange", flower: "orange" },
    purple: { name: "lilla", flower: "lilla" },
    brown: { name: "brun", flower: "brune" },
    pink: { name: "lyserød", flower: "lyserøde" }
  };

  // Navnet bruges efter "du har fået ..."
  const decorations = {
    butterfly: "en sommerfugl",
    sunflower: "en solsikke",
    mushroom: "en lille svamp",
    rainbow: "en regnbue",
    ladybug: "en mariehøne",
    tulip: "en tulipan",
    bee: "en lille bi",
    flower: "en blomsterbuket"
  };

  // Funktioner får farven (eller pyntet) som argument, tekster er de samme hver gang
  const lines = {
    ask: [
      (c) => `Find den ${c.flower} blomst.`,
      (c) => `Kan du finde den ${c.flower} blomst?`,
      (c) => `Hvor er den ${c.flower} blomst?`,
      (c) => `Budha vil gerne have en ${c.name} blomst. Kan du hjælpe?`,
      (c) => `Tryk på den ${c.flower} blomst.`,
      (c) => `Åh, nu mangler Budha en ${c.name} blomst!`,
      (c) => `Hvilken blomst er ${c.name}?`
    ],
    // Siges, når barnet vælger en forkert farve (c = den farve, der blev valgt). Bagefter spørges der igen.
    wrong: [
      (c) => `Hov, det er en ${c.name} blomst. Prøv igen!`,
      (c) => `Næsten! Det var den ${c.flower} blomst. Kig en gang til!`,
      (c) => `Ups, den er ${c.name}. Prøv en gang til!`,
      "Det var ikke den. Prøv igen, du kan det!"
    ],
    praise: [
      "Ja, det er rigtigt!",
      "Sådan!",
      "Flot!",
      "Hvor er du dygtig!",
      "Det er helt rigtigt!",
      "Ja! Det er den!",
      "Ej, hvor er du god!",
      "Super!",
      "Wow, hvor går det godt!",
      "Godt set!",
      "Hurra!",
      "Rigtig godt klaret!"
    ],
    plant: [
      (c) => `Nu planter Budha en ${c.name} blomst!`,
      (c) => `Budha graver et hul til den ${c.flower} blomst.`,
      (c) => `Se, hvor smuk en ${c.name} blomst!`,
      (c) => `Budha vander den ${c.flower} blomst, så den kan vokse.`
    ],
    reward: [
      (d) => `Ej, hvor er du god! Nu har du fået ${d}!`,
      (d) => `Hurra! Nu bor ${d} i haven!`,
      (d) => `Wow, se! Du har fået ${d} til haven!`
    ],
    finish: [
      "Hvor er du dygtig! Tak for hjælpen, siger Budha.",
      "Hurra! Haven er fuld af blomster. Tusind tak!",
      "Sikke en flot have! Du er så dygtig!",
      "Budha er så glad! Tak, fordi du hjalp!",
      "Wow! Se alle de flotte farver. Godt klaret!"
    ]
  };

  const colorList = Object.values(colors);
  const decorationList = Object.values(decorations);

  function expand(pool, args) {
    return pool.flatMap((item) => (typeof item === "function" ? args.map((arg) => item(arg)) : [item]));
  }

  // Alle sætninger, der kan blive sagt. Hver sætning er ét lydklip.
  function allClips() {
    const all = [
      ...expand(lines.ask, colorList),
      ...expand(lines.wrong, colorList),
      ...expand(lines.praise, []),
      ...expand(lines.plant, colorList),
      ...expand(lines.reward, decorationList),
      ...expand(lines.finish, [])
    ];
    return [...new Set(all)];
  }

  // Filnavnet er sætningen med små bogstaver, æ=ae, ø=oe, å=aa og bindestreger
  function clipFile(text) {
    return text.toLowerCase().replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + ".mp3";
  }

  return { colors, decorations, lines, allClips, clipFile };
});
