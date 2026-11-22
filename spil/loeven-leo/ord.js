// Aris ordlister og lydklip bruger den samme kilde.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.LoevenOrd = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const sets = {
    2: [
      // Første trin: 20 små lydrette ord, én lyd pr. bogstav.
      ["BI", "🐝"], ["KO", "🐄"], ["SO", "🐖"], ["IS", "🍦"], ["TO", "2️⃣"],
      ["NI", "9️⃣"], ["TÅ", "🦶"], ["HØ", "🌾"], ["SØ", "🏞️"], ["BY", "🏙️"],
      ["DU", "👉"], ["TE", "🍵"], ["FE", "🧚"], ["SY", "🧵"], ["LE", "😄"],
      ["SE", "👀"], ["GÅ", "🚶"], ["JA", "✅"], ["NY", "🆕"], ["OP", "⬆️"]
    ],
    3: [
      // Begynderord: ét bogstav pr. lyd, uden stumme bogstaver eller konsonantgrupper.
      ["SOL", "☀️"], ["KAT", "🐱"], ["HUS", "🏠"], ["MUS", "🐭"], ["BUS", "🚌"],
      ["BIL", "🚗"], ["RIS", "🍚"], ["LAM", "🐑"], ["KAM", "🪮"], ["HAT", "🎩"],
      ["LIM", "🧴"], ["TAL", "🔢"], ["PIL", "➡️"]
    ],
    4: [
      ["HUND", "🐶"], ["KAGE", "🍰"], ["BOLD", "⚽"], ["MÅNE", "🌙"], ["FISK", "🐟"],
      ["HEST", "🐴"], ["HØNE", "🐔"], ["ÆBLE", "🍎"], ["LØVE", "🦁"], ["UGLE", "🦉"],
      ["GRIS", "🐷"], ["HÅND", "✋"], ["NÆSE", "👃"], ["MUND", "👄"], ["SAKS", "✂️"],
      ["BABY", "👶"], ["BRØD", "🍞"], ["PIGE", "👧"], ["RING", "💍"], ["MÆLK", "🥛"],
      ["VAND", "💧"], ["TAND", "🦷"], ["ROSE", "🌹"],
      ["KIWI", "🥝"], ["PÆRE", "🍐"], ["SLOT", "🏰"], ["REGN", "🌧️"], ["SKIB", "🚢"],
      ["FUGL", "🐦"], ["TELT", "⛺"], ["DANS", "💃"], ["MAJS", "🌽"],
      ["SLIK", "🍬"], ["JORD", "🌍"], ["LAMA", "🦙"], ["HANE", "🐓"], ["VIND", "💨"], ["BLAD", "🍃"],
      ["SPIL", "🎮"], ["SÆBE", "🧼"], ["SOFA", "🛋️"], ["SENG", "🛏️"], ["BREV", "✉️"], ["GAVE", "🎁"],
      ["FEST", "🎉"], ["KOLD", "🥶"], ["HVAL", "🐳"], ["OKSE", "🐂"]
    ],
    5: [
      ["BAMSE", "🧸"], ["DRENG", "👦"], ["BJØRN", "🐻"], ["TIGER", "🐯"], ["ZEBRA", "🦓"], ["KAMEL", "🐫"],
      ["GIRAF", "🦒"], ["KRONE", "👑"], ["TOMAT", "🍅"], ["BANAN", "🍌"], ["DRAGE", "🐉"], ["ROBOT", "🤖"],
      ["CYKEL", "🚲"], ["FROSK", "🐸"], ["SNEGL", "🐌"], ["PIZZA", "🍕"], ["KANIN", "🐰"], ["SVANE", "🦢"],
      ["MANGO", "🥭"], ["PANDA", "🐼"], ["KLOVN", "🤡"], ["SKOLE", "🏫"], ["KIRKE", "⛪"],
      ["KJOLE", "👗"], ["MELON", "🍈"], ["HJORT", "🦌"], ["TASKE", "👜"], ["BJERG", "⛰️"], ["KOKOS", "🥥"],
      ["SALAT", "🥗"], ["KAFFE", "☕"], ["SUSHI", "🍣"], ["PASTA", "🍝"], ["JUICE", "🧃"], ["RAKET", "🚀"],
      ["KOMET", "☄️"], ["EGERN", "🐿️"], ["PENGE", "💰"], ["NØGLE", "🔑"], ["MUSIK", "🎵"], ["PIANO", "🎹"],
      ["DRUER", "🍇"], ["AGURK", "🥒"], ["PØLSE", "🌭"], ["CHILI", "🌶️"]
    ]
  };

  function allClips() {
    return [...new Set(Object.values(sets).flatMap(words => words.map(([word]) => word)))];
  }

  function clipFile(word) {
    return word.toLowerCase().replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + ".mp3";
  }

  return { sets, allClips, clipFile };
});
