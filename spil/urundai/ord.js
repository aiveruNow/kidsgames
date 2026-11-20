// Alle tamilske ord i Urundai. Spillet, service workeren og lydgeneratoren
// (lydvaerktoej\lav-tamilsk-lyd.mjs) bruger denne ene fil, så ord og lydklip altid passer sammen.
// ta = tamilsk skrift (det, stemmen siger), rom = udtale med latinske bogstaver, da = dansk (kun til ordbogen).
// pic: { emoji } eller { color } eller { count }. Lyden hedder lyd\<id>.mp3.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.UrundaiOrd = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const words = {
    // Farver
    roed: { ta: "சிவப்பு", rom: "sivappu", da: "rød", pic: { color: "#e53935" } },
    blaa: { ta: "நீலம்", rom: "neelam", da: "blå", pic: { color: "#1e88e5" } },
    gul: { ta: "மஞ்சள்", rom: "manjal", da: "gul", pic: { color: "#fdd835" } },
    groen: { ta: "பச்சை", rom: "pachchai", da: "grøn", pic: { color: "#43a047" } },
    hvid: { ta: "வெள்ளை", rom: "vellai", da: "hvid", pic: { color: "#ffffff" } },
    sort: { ta: "கறுப்பு", rom: "karuppu", da: "sort", pic: { color: "#263238" } },
    orange: { ta: "ஆரஞ்சு", rom: "aaranju", da: "orange", pic: { color: "#fb8c00" } },
    lilla: { ta: "ஊதா", rom: "oodhaa", da: "lilla", pic: { color: "#8e24aa" } },

    // Tal
    t1: { ta: "ஒன்று", rom: "onru", da: "1", pic: { count: 1 } },
    t2: { ta: "இரண்டு", rom: "irandu", da: "2", pic: { count: 2 } },
    t3: { ta: "மூன்று", rom: "moonru", da: "3", pic: { count: 3 } },
    t4: { ta: "நான்கு", rom: "naangu", da: "4", pic: { count: 4 } },
    t5: { ta: "ஐந்து", rom: "aindhu", da: "5", pic: { count: 5 } },
    t6: { ta: "ஆறு", rom: "aaru", da: "6", pic: { count: 6 } },
    t7: { ta: "ஏழு", rom: "ezhu", da: "7", pic: { count: 7 } },
    t8: { ta: "எட்டு", rom: "ettu", da: "8", pic: { count: 8 } },
    t9: { ta: "ஒன்பது", rom: "onbadhu", da: "9", pic: { count: 9 } },
    t10: { ta: "பத்து", rom: "paththu", da: "10", pic: { count: 10 } },

    // Familie
    amma: { ta: "அம்மா", rom: "amma", da: "mor", pic: { emoji: "👩" } },
    appa: { ta: "அப்பா", rom: "appa", da: "far", pic: { emoji: "👨" } },
    paatti: { ta: "பாட்டி", rom: "paatti", da: "bedstemor", pic: { emoji: "👵" } },
    thaaththa: { ta: "தாத்தா", rom: "thaaththaa", da: "bedstefar", pic: { emoji: "👴" } },
    thambi: { ta: "தம்பி", rom: "thambi", da: "lillebror", pic: { emoji: "👦" } },
    thangai: { ta: "தங்கை", rom: "thangai", da: "lillesøster", pic: { emoji: "👧" } },

    // Dyr
    yaanai: { ta: "யானை", rom: "yaanai", da: "elefant", pic: { emoji: "🐘" } },
    poonai: { ta: "பூனை", rom: "poonai", da: "kat", pic: { emoji: "🐱" } },
    naai: { ta: "நாய்", rom: "naai", da: "hund", pic: { emoji: "🐶" } },
    meen: { ta: "மீன்", rom: "meen", da: "fisk", pic: { emoji: "🐟" } },
    paravai: { ta: "பறவை", rom: "paravai", da: "fugl", pic: { emoji: "🐦" } },
    kurangu: { ta: "குரங்கு", rom: "kurangu", da: "abe", pic: { emoji: "🐒" } },
    singam: { ta: "சிங்கம்", rom: "singam", da: "løve", pic: { emoji: "🦁" } },
    maadu: { ta: "மாடு", rom: "maadu", da: "ko", pic: { emoji: "🐄" } }
  };

  // Ros efter rigtigt svar (også tamilsk): nallathu = godt, arumai = fremragende, sabaash = bravo
  const praise = {
    nallathu: { ta: "நல்லது!", rom: "nallathu", da: "Godt!" },
    arumai: { ta: "அருமை!", rom: "arumai", da: "Fremragende!" },
    sabaash: { ta: "சபாஷ்!", rom: "sabaash", da: "Bravo!" }
  };

  // Hver bane har 2-3 nye ord. Den sidste bane i en verden blander alle verdenens ord ("mix").
  // maze = antal felter på banens korte side (længden følger skærmen)
  const worlds = [
    {
      id: "farver", name: "Farver", ta: "நிறங்கள்", emoji: "🎨", goal: "🌈",
      obstacles: ["🚧", "🧱"], deco: ["🌸", "🌼", "🍃"],
      theme: { bg1: "#ffe1f0", bg2: "#d9e7ff", floor: "#fffaff", wall: "#8b5cf6", accent: "#ec4899" },
      levels: [["roed", "blaa", "gul"], ["groen", "hvid", "sort"], ["orange", "lilla"], "mix"],
      maze: [4, 5, 5, 6]
    },
    {
      id: "tal", name: "Tal", ta: "எண்கள்", emoji: "🔢", goal: "🏰",
      obstacles: ["🔒", "🪨"], deco: ["⭐", "✨", "🌙"],
      theme: { bg1: "#2b3a8f", bg2: "#5b3f9e", floor: "#eef0ff", wall: "#1b2468", accent: "#fbbf24" },
      levels: [["t1", "t2", "t3"], ["t4", "t5"], ["t6", "t7"], ["t8", "t9", "t10"], "mix"],
      maze: [4, 5, 5, 6, 7]
    },
    {
      id: "familie", name: "Familie", ta: "குடும்பம்", emoji: "👨‍👩‍👧", goal: "🏠",
      obstacles: ["🚪", "🚧"], deco: ["💛", "🌻", "🦋"],
      theme: { bg1: "#fff0c2", bg2: "#ffd6b0", floor: "#fffdf5", wall: "#d97706", accent: "#f97316" },
      levels: [["amma", "appa", "paatti"], ["thaaththa", "thambi", "thangai"], "mix"],
      maze: [4, 5, 6]
    },
    {
      id: "dyr", name: "Dyr", ta: "விலங்குகள்", emoji: "🐘", goal: "🌳",
      obstacles: ["🪵", "🪨", "🚧"], deco: ["🌿", "🍄", "🦋"],
      theme: { bg1: "#cdf5c4", bg2: "#a8e6cf", floor: "#f6fff2", wall: "#2f7d4f", accent: "#16a34a" },
      levels: [["yaanai", "poonai", "naai"], ["meen", "paravai", "kurangu"], ["singam", "maadu"], "mix"],
      maze: [4, 5, 5, 6]
    }
  ];

  const clipFile = (id) => `${id}.mp3`;

  // Alle lydklip: { id, text }
  function allClips() {
    return [
      ...Object.entries(words).map(([id, w]) => ({ id, text: w.ta })),
      ...Object.entries(praise).map(([id, w]) => ({ id: `ros-${id}`, text: w.ta }))
    ];
  }

  return { words, praise, worlds, clipFile, allClips };
});
