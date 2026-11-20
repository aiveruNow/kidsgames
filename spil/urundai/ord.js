// Alle tamilske ord i Urundai. Spillet, service workeren og lydgeneratoren
// (lydvaerktoej\lav-tamilsk-lyd.mjs) bruger denne ene fil, så ord og lydklip altid passer sammen.
// ta = tamilsk skrift (det, stemmen siger), rom = udtale med latinske bogstaver, da = dansk (kun til mødeskærm og ordbog).
// pic: { art } (tegning i billeder.js), { color } (lotus i farven) eller { count } (så mange olielamper). Lyden hedder lyd\<id>.mp3.
// Ordene er blandet i spillet: der er ingen kategorier eller verdener.
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
    amma: { ta: "அம்மா", rom: "amma", da: "mor", pic: { art: "amma" } },
    appa: { ta: "அப்பா", rom: "appa", da: "far", pic: { art: "appa" } },
    paatti: { ta: "பாட்டி", rom: "paatti", da: "bedstemor", pic: { art: "paatti" } },
    thaaththa: { ta: "தாத்தா", rom: "thaaththaa", da: "bedstefar", pic: { art: "thaaththa" } },
    thambi: { ta: "தம்பி", rom: "thambi", da: "lillebror", pic: { art: "thambi" } },
    thangai: { ta: "தங்கை", rom: "thangai", da: "lillesøster", pic: { art: "thangai" } },

    // Dyr
    yaanai: { ta: "யானை", rom: "yaanai", da: "elefant", pic: { art: "yaanai" } },
    poonai: { ta: "பூனை", rom: "poonai", da: "kat", pic: { art: "poonai" } },
    naai: { ta: "நாய்", rom: "naai", da: "hund", pic: { art: "naai" } },
    meen: { ta: "மீன்", rom: "meen", da: "fisk", pic: { art: "meen" } },
    paravai: { ta: "பறவை", rom: "paravai", da: "fugl", pic: { art: "paravai" } },
    kurangu: { ta: "குரங்கு", rom: "kurangu", da: "abe", pic: { art: "kurangu" } },
    singam: { ta: "சிங்கம்", rom: "singam", da: "løve", pic: { art: "singam" } },
    maadu: { ta: "மாடு", rom: "maadu", da: "ko", pic: { art: "maadu" } },

    // Tal 11-20
    n11: { ta: "பதினொன்று", rom: "pathinonru", da: "11", pic: { art: "n11" } },
    n12: { ta: "பன்னிரண்டு", rom: "pannirandu", da: "12", pic: { art: "n12" } },
    n13: { ta: "பதின்மூன்று", rom: "pathinmoonru", da: "13", pic: { art: "n13" } },
    n14: { ta: "பதினான்கு", rom: "pathinaangu", da: "14", pic: { art: "n14" } },
    n15: { ta: "பதினைந்து", rom: "pathinaindhu", da: "15", pic: { art: "n15" } },
    n16: { ta: "பதினாறு", rom: "pathinaaru", da: "16", pic: { art: "n16" } },
    n17: { ta: "பதினேழு", rom: "pathinezhu", da: "17", pic: { art: "n17" } },
    n18: { ta: "பதினெட்டு", rom: "pathinettu", da: "18", pic: { art: "n18" } },
    n19: { ta: "பத்தொன்பது", rom: "paththonbadhu", da: "19", pic: { art: "n19" } },
    n20: { ta: "இருபது", rom: "irubadhu", da: "20", pic: { art: "n20" } },

    // Natur
    sooriyan: { ta: "சூரியன்", rom: "sooriyan", da: "sol", pic: { art: "sooriyan" } },
    nilaa: { ta: "நிலா", rom: "nilaa", da: "måne", pic: { art: "nilaa" } },
    natchaththiram: { ta: "நட்சத்திரம்", rom: "natchaththiram", da: "stjerne", pic: { art: "natchaththiram" } },
    maram: { ta: "மரம்", rom: "maram", da: "træ", pic: { art: "maram" } },
    poo: { ta: "பூ", rom: "poo", da: "blomst", pic: { art: "poo" } },
    mazhai: { ta: "மழை", rom: "mazhai", da: "regn", pic: { art: "mazhai" } },
    malai: { ta: "மலை", rom: "malai", da: "bjerg", pic: { art: "malai" } },
    thee: { ta: "தீ", rom: "thee", da: "ild", pic: { art: "thee" } },
    megam: { ta: "மேகம்", rom: "megam", da: "sky", pic: { art: "megam" } },

    // Mad og drikke
    soru: { ta: "சோறு", rom: "soru", da: "ris", pic: { art: "soru" } },
    paal: { ta: "பால்", rom: "paal", da: "mælk", pic: { art: "paal" } },
    thanneer: { ta: "தண்ணீர்", rom: "thanneer", da: "vand", pic: { art: "thanneer" } },
    maampazham: { ta: "மாம்பழம்", rom: "maampazham", da: "mango", pic: { art: "maampazham" } },
    vaazhaippazham: { ta: "வாழைப்பழம்", rom: "vaazhaippazham", da: "banan", pic: { art: "vaazhaippazham" } },
    thenkaai: { ta: "தேங்காய்", rom: "thenkaai", da: "kokosnød", pic: { art: "thenkaai" } },
    idli: { ta: "இட்லி", rom: "idli", da: "idli", pic: { art: "idli" } },
    thosai: { ta: "தோசை", rom: "thosai", da: "dosa", pic: { art: "thosai" } },
    muttai: { ta: "முட்டை", rom: "muttai", da: "æg", pic: { art: "muttai" } },
    aappil: { ta: "ஆப்பிள்", rom: "aappil", da: "æble", pic: { art: "aappil" } },

    // Krop
    kan: { ta: "கண்", rom: "kan", da: "øje", pic: { art: "kan" } },
    kaathu: { ta: "காது", rom: "kaathu", da: "øre", pic: { art: "kaathu" } },
    mookku: { ta: "மூக்கு", rom: "mookku", da: "næse", pic: { art: "mookku" } },
    vaai: { ta: "வாய்", rom: "vaai", da: "mund", pic: { art: "vaai" } },
    kai: { ta: "கை", rom: "kai", da: "hånd", pic: { art: "kai" } },
    kaal: { ta: "கால்", rom: "kaal", da: "fod", pic: { art: "kaal" } },

    // Flere dyr
    kuthirai: { ta: "குதிரை", rom: "kuthirai", da: "hest", pic: { art: "kuthirai" } },
    kozhi: { ta: "கோழி", rom: "kozhi", da: "høne", pic: { art: "kozhi" } },
    vaaththu: { ta: "வாத்து", rom: "vaaththu", da: "and", pic: { art: "vaaththu" } },
    muyal: { ta: "முயல்", rom: "muyal", da: "kanin", pic: { art: "muyal" } },
    paambu: { ta: "பாம்பு", rom: "paambu", da: "slange", pic: { art: "paambu" } },
    aamai: { ta: "ஆமை", rom: "aamai", da: "skildpadde", pic: { art: "aamai" } },

    // Ting
    veedu: { ta: "வீடு", rom: "veedu", da: "hus", pic: { art: "veedu" } },
    puththakam: { ta: "புத்தகம்", rom: "puththakam", da: "bog", pic: { art: "puththakam" } },
    panthu: { ta: "பந்து", rom: "panthu", da: "bold", pic: { art: "panthu" } },
    kaar: { ta: "கார்", rom: "kaar", da: "bil", pic: { art: "kaar" } },
    padagu: { ta: "படகு", rom: "padagu", da: "båd", pic: { art: "padagu" } },
    kudai: { ta: "குடை", rom: "kudai", da: "paraply", pic: { art: "kudai" } },
    mani: { ta: "மணி", rom: "mani", da: "klokke", pic: { art: "mani" } },
    thoppi: { ta: "தொப்பி", rom: "thoppi", da: "kasket", pic: { art: "thoppi" } },
    kadikaaram: { ta: "கடிகாரம்", rom: "kadikaaram", da: "ur", pic: { art: "kadikaaram" } }
  };

  // Ros efter rigtigt svar (også tamilsk): nallathu = godt, arumai = fremragende, sabaash = bravo
  const praise = {
    nallathu: { ta: "நல்லது!", rom: "nallathu", da: "Godt!" },
    arumai: { ta: "அருமை!", rom: "arumai", da: "Fremragende!" },
    sabaash: { ta: "சபாஷ்!", rom: "sabaash", da: "Bravo!" }
  };

  const clipFile = (id) => `${id}.mp3`;

  // Alle lydklip: { id, text }
  function allClips() {
    return [
      ...Object.entries(words).map(([id, w]) => ({ id, text: w.ta })),
      ...Object.entries(praise).map(([id, w]) => ({ id: `ros-${id}`, text: w.ta })),
      { id: "urundai", text: "உருண்டை" } // kuglens navn, siges når man trykker på den på forsiden
    ];
  }

  return { words, praise, clipFile, allClips };
});
