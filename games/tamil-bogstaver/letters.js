// Alle tamilske bogstaver i spillet "Tamil-bogstaver" (bogens side: konsonant + vokal = bogstav).
// Spillet, service workeren og lydgeneratoren (tools\make-letter-audio.mjs) bruger denne ene fil.
// Rækkefølgen er bogens: 18 konsonanter (mei) med hver sin gruppe: v = vallinam (rød), m = mellinam (grøn), i = idaiyinam (lyserød).
// Lyden hedder audio\<id>.mp3: mei-01 (க்), a-01 (க), aa-01 (கா), vowel-a (அ), vowel-aa (ஆ).
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.TamilBogstaver = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const PULLI = "\u0BCD"; // prikken over konsonanten (gør den til ren konsonant)
  const AA_SIGN = "\u0BBE"; // vokaltegnet for ஆ, som skrives efter konsonanten

  const order = [
    ["க", "v"], ["ங", "m"], ["ச", "v"], ["ஞ", "m"], ["ட", "v"], ["ண", "m"],
    ["த", "v"], ["ந", "m"], ["ப", "v"], ["ம", "m"], ["ய", "i"], ["ர", "i"],
    ["ல", "i"], ["வ", "i"], ["ழ", "i"], ["ள", "i"], ["ற", "v"], ["ன", "m"]
  ];

  const pad = (n) => String(n).padStart(2, "0");
  const consonants = order.map(([base, cls], index) => {
    const n = index + 1;
    return { n, base, cls, mei: base + PULLI, a: base, aa: base + AA_SIGN, meiId: `mei-${pad(n)}`, aId: `a-${pad(n)}`, aaId: `aa-${pad(n)}` };
  });

  const vowels = [
    { ta: "அ", id: "vowel-a" },
    { ta: "ஆ", id: "vowel-aa" }
  ];

  // Bogstavet konsonant i + vokal b (0 = அ, 1 = ஆ)
  const letterOf = (i, b) => (b === 0 ? { ta: consonants[i].a, id: consonants[i].aId } : { ta: consonants[i].aa, id: consonants[i].aaId });

  const clipFile = (id) => `${id}.mp3`;

  // Alle lydklip: { id, text }
  function allClips() {
    return [
      ...consonants.map((c) => ({ id: c.meiId, text: c.mei })),
      ...consonants.map((c) => ({ id: c.aId, text: c.a })),
      ...consonants.map((c) => ({ id: c.aaId, text: c.aa })),
      ...vowels.map((v) => ({ id: v.id, text: v.ta }))
    ];
  }

  return { consonants, vowels, letterOf, clipFile, allClips };
});
