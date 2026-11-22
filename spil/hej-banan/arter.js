// Junglernes verdener, dyr og aber til Hej Banan. Spillet, dyrebogen og service workeren bruger denne ene fil.
// Selve tegningerne ligger i dyr-*.js (de registrerer sig i BananTegn); her står, hvem dyrene er, og hvad de gør i spillet.
//
// Tegnekontrakten for alle dyr og aber (BananArter.draw(ctx, id, o)):
//   o.r      størrelse i pixel (1 lokal enhed = o.r pixel). Dyret tegnes vendt mod +x med midten i (0,0), cirka inden for x -1.6..1.6 og y -1.4..1.4.
//   o.t      tid i sekunder (til vingeslag, halesving, vejrtrækning, blink)
//   o.mode   "sit"    hviler på en gren eller på jorden, fødderne ved y = +1 (rolig bevægelse: blink, hale, vejrtrækning)
//            "fly"    flyver eller svæver (vingeslag)
//            "move"   går eller løber (benene bevæger sig)
//            "attack" springer efter byttet med åbent gab (o.angry er også sand)
//            "hang"   slanger: (0,0) er toppen af slangen, kroppen hænger lodret ned til længden o.len (lokale enheder), hovedet nederst og vendt mod +x.
//                     Edderkopper og andre, der hænger i en tråd: kroppens midte i (0,0), ingen tråd (den tegner spillet).
//   o.angry  sand for rovdyr og farer: vrede øjne, tænder, ingen smil
//   o.len    kun for "hang" (slanger)
//   Aberne (de otte spilbare) har desuden o.mode: "swing" ((0,0) = hånden på lianen, kroppen hænger nedenunder i +y, op til ca. y = +2.6),
//   "fly" ((0,0) = kroppens midte, armene strakt frem/op), "eat" (sidder og spiser en banan), "dizzy" (fanget: sløret blik),
//   "run" (løber på alle fire på jorden, fødderne ved y = +1; o.ph = trinfase i radianer, 2π = én gangcyklus; o.sq = 0..1 klem ved landing) og
//   "jump" (hop på jorden; o.jv = -1 stiger hurtigt .. 0 toppen .. +1 styrter ned). De otte andre primater tegnes som "sit" i run/jump.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(root.BananTegn || require("./tegn.js"));
  else root.BananArter = factory(root.BananTegn);
})(typeof self !== "undefined" ? self : this, function (T) {
  "use strict";

  // ---------- Hvem er dyrene? ----------
  // role: friend (venner: giver bonus, når man rører dem), predator (rovdyr: fanger en), hazard (farer: kan ikke undgås ved berøring)
  // beh: friend "sit" (sidder på en gren) eller "fly"; predator "floor" (løber på jorden og springer), "hang" (slange i en gren) eller "air" (flyver og styrtdykker);
  //      hazard "air" (svæver), "thread" (hænger i en tråd) eller "branch" (sidder på en gren)
  // size = tegnestørrelse i spillets enheder (aben er 5), pts = bonuspoint for venner, len = længden af en hængende slange
  const SP = {};
  const sp = (id, da, role, beh, size, extra) => { SP[id] = Object.assign({ id, da, role, beh, size }, extra); };

  // Venner
  sp("ara", "Rød ara", "friend", "fly", 4.5, { pts: 5 });
  sp("tukan", "Tukan", "friend", "sit", 4.5, { pts: 5 });
  sp("dovendyr", "Tretået dovendyr", "friend", "sit", 5.5, { pts: 5 });
  sp("morfo", "Blå morfo-sommerfugl", "friend", "fly", 3.6, { pts: 5 });
  sp("graa_papegoeje", "Grå papegøje", "friend", "fly", 4, { pts: 5 });
  sp("turako", "Blå turako", "friend", "sit", 4.5, { pts: 5 });
  sp("kamaeleon", "Kamæleon", "friend", "sit", 4, { pts: 5 });
  sp("bonobo", "Bonobo", "friend", "sit", 5, { pts: 10 });
  sp("naesehornsfugl", "Næsehornsfugl", "friend", "sit", 6, { pts: 5 });
  sp("flyverav", "Flyveræv", "friend", "fly", 5, { pts: 5 });
  sp("naesabe", "Næseabe", "friend", "sit", 5.5, { pts: 10 });
  sp("flyvedrage", "Flyvedrage", "friend", "fly", 4, { pts: 5 });
  sp("paafugl", "Påfugl", "friend", "sit", 6.5, { pts: 5 });
  sp("parakit", "Halsbåndsparakit", "friend", "fly", 3.6, { pts: 5 });
  sp("hanuman", "Hanuman-langur", "friend", "sit", 5.5, { pts: 5 });
  sp("kaempeegern", "Kæmpeegern", "friend", "sit", 4.5, { pts: 5 });
  sp("loris", "Slank loris", "friend", "sit", 4, { pts: 10 });
  sp("lilla_langur", "Lilla-ansigtet langur", "friend", "sit", 5, { pts: 5 });
  sp("junglehoene", "Ceylonsk junglehøne", "friend", "sit", 4.5, { pts: 5 });
  sp("sifaka", "Sifaka", "friend", "sit", 5.5, { pts: 10 });
  sp("fingerdyr", "Fingerdyr", "friend", "sit", 4.5, { pts: 10 });
  sp("panterkamaeleon", "Panterkamæleon", "friend", "sit", 4, { pts: 5 });
  sp("komet", "Kometsommerfugl", "friend", "fly", 4, { pts: 10 });
  sp("quetzal", "Quetzal", "friend", "sit", 5, { pts: 10 });
  sp("broleabe", "Brøleabe", "friend", "sit", 5.5, { pts: 5 });
  sp("totaaet_dovendyr", "Totået dovendyr", "friend", "sit", 5.5, { pts: 5 });
  sp("loevfroe", "Rødøjet løvfrø", "friend", "sit", 3.2, { pts: 5 });

  // Rovdyr
  sp("jaguar", "Jaguar", "predator", "floor", 8);
  sp("leopard", "Leopard", "predator", "floor", 7.5);
  sp("skyleopard", "Skyleopard", "predator", "floor", 7);
  sp("tiger", "Bengalsk tiger", "predator", "floor", 10);
  sp("ceylonleopard", "Ceylonleopard", "predator", "floor", 7.5);
  sp("fossa", "Fossa", "predator", "floor", 6.5);
  sp("puma", "Puma", "predator", "floor", 8);
  sp("harpyoern", "Harpyørn", "predator", "air", 8);
  sp("kronoern", "Kroneørn", "predator", "air", 8);
  sp("slangeoern", "Slangeørn", "predator", "air", 7);
  sp("ornoeugle", "Bengalsk ørneugle", "predator", "air", 6.5);
  sp("hoegeoern", "Ceylonsk høgeørn", "predator", "air", 6.5);
  sp("mad_hoenshoeg", "Madagaskar-hønsehøg", "predator", "air", 6);
  sp("prydhoegeoern", "Prydhøgeørn", "predator", "air", 7);
  sp("anakonda", "Anakonda", "predator", "hang", 4.2, { len: 26 });
  sp("groen_mamba", "Grøn mamba", "predator", "hang", 2.6, { len: 20 });
  sp("netpyton", "Netpyton", "predator", "hang", 4, { len: 28 });
  sp("kongekobra", "Kongekobra", "predator", "hang", 3.6, { len: 22 });
  sp("indisk_kobra", "Indisk kobra", "predator", "hang", 3.2, { len: 18 });
  sp("mad_boa", "Madagaskar-boa", "predator", "hang", 3.8, { len: 22 });
  sp("buskmester", "Buskmester", "predator", "hang", 3.6, { len: 24 });

  // Farer
  sp("fuglespider", "Goliat-fuglespider", "hazard", "thread", 4.5);
  sp("giftfroe", "Blå pilegiftfrø", "hazard", "branch", 3);
  sp("haermyre", "Hærmyre", "hazard", "branch", 2.8);
  sp("tsetse", "Tsetseflue", "hazard", "air", 3);
  sp("tusindben", "Kæmpe-tusindben", "hazard", "branch", 5);
  sp("kaempehornet", "Kæmpehornet", "hazard", "air", 3.4);
  sp("skorpion", "Asiatisk skovskorpion", "hazard", "branch", 4);
  sp("kaempehonningbi", "Kæmpehonningbi", "hazard", "air", 3.2);
  sp("tretarantel", "Træ-tarantel", "hazard", "thread", 4.5);
  sp("tomatfroe", "Tomatfrø", "hazard", "branch", 3.4);
  sp("bananedderkop", "Bananedderkop", "hazard", "thread", 4);
  sp("kuglemyre", "Kuglemyre", "hazard", "branch", 3);

  // ---------- De otte spilbare aber ----------
  // after = nummeret på den jungle (0-6), man skal klare for at låse aben op (-1 = fra start)
  const M = [
    { id: "chimpanse", da: "Chimpanse", after: -1 },
    { id: "doedningehovedabe", da: "Dødningehovedabe", after: 0 },
    { id: "gorilla", da: "Gorilla", after: 1 },
    { id: "orangutang", da: "Orangutang", after: 2 },
    { id: "rhesusabe", da: "Rhesusabe", after: 3 },
    { id: "toque_makak", da: "Toque-makak", after: 4 },
    { id: "ringhalet_maki", da: "Ringhalet maki", after: 5 },
    { id: "kapucinerabe", da: "Kapucinerabe", after: 6 }
  ];
  for (const m of M) m.size = 5;

  // ---------- Verdener = junglerne ----------
  // sky = himlen (top, midt, bund), leaf = bladfarver (mørk, mellem, lys), trunk = stammer, far = silhuet langt væk, farc = dens farve, floor = jordens farve,
  // friends / predators / hazards = dyrene, der bor her (id'er i SP), unlock = abens id, der låses op, når junglen er klaret
  const W = [
    { id: "amazonas", da: "Amazonas", land: "Brasilien, Sydamerika", fact: "Amazonas er verdens største regnskov", sky: ["#bff0d2", "#58c08f", "#176b4b"], leaf: ["#0a4a2a", "#1f8d46", "#74cc4f"], trunk: "#5a3a24", far: "river", farc: "#2f8f6a", floor: "#3a2a18",
      friends: ["ara", "tukan", "dovendyr", "morfo"], predators: ["jaguar", "harpyoern", "anakonda"], hazards: ["fuglespider", "giftfroe"], unlock: "doedningehovedabe" },
    { id: "congo", da: "Congo", land: "Congo-bækkenet, Afrika", fact: "Her bor gorillaer, chimpanser og bonoboer", sky: ["#f0ecb0", "#8acb6c", "#22703c"], leaf: ["#0c4a24", "#2a8a3a", "#8fd04a"], trunk: "#5e4630", far: "mist", farc: "#6aa46a", floor: "#3c2c1a",
      friends: ["graa_papegoeje", "turako", "kamaeleon", "bonobo"], predators: ["leopard", "kronoern", "groen_mamba"], hazards: ["haermyre", "tsetse"], unlock: "gorilla" },
    { id: "borneo", da: "Borneo", land: "Indonesien, Asien", fact: "Her bor orangutangerne, som er skovens mennesker", sky: ["#ffe0b0", "#7ccf8c", "#176a42"], leaf: ["#0a4a2e", "#1d9050", "#6fd07a"], trunk: "#6a4a30", far: "karst", farc: "#4a8f6e", floor: "#3a2a1c",
      friends: ["naesehornsfugl", "flyverav", "naesabe", "flyvedrage"], predators: ["skyleopard", "netpyton", "slangeoern"], hazards: ["tusindben", "kaempehornet"], unlock: "orangutang" },
    { id: "indien", da: "Indien", land: "Vestlige Ghats, Indien", fact: "Skovene i Vestlige Ghats er hjem for tigre og elefanter", sky: ["#ffd88a", "#92d05c", "#2a7a3a"], leaf: ["#0e4a22", "#2a8a34", "#9ad23e"], trunk: "#6a4426", far: "temple", farc: "#8a7a3a", floor: "#40301a",
      friends: ["paafugl", "parakit", "hanuman", "kaempeegern"], predators: ["tiger", "kongekobra", "ornoeugle"], hazards: ["skorpion", "kaempehonningbi"], unlock: "rhesusabe" },
    { id: "srilanka", da: "Sri Lanka", land: "Øen syd for Indien, Asien", fact: "Sri Lanka er en lille ø med et rigt dyreliv", sky: ["#c4f4ff", "#5ad2a4", "#136e54"], leaf: ["#0a4c3c", "#1a9068", "#62d0a0"], trunk: "#684830", far: "hills", farc: "#3a9a7a", floor: "#3a2c1c",
      friends: ["loris", "lilla_langur", "junglehoene", "flyverav"], predators: ["ceylonleopard", "indisk_kobra", "hoegeoern"], hazards: ["tretarantel", "kaempehonningbi"], unlock: "toque_makak" },
    { id: "madagaskar", da: "Madagaskar", land: "Øen ud for Afrika", fact: "Næsten alle dyr på Madagaskar findes ingen andre steder", sky: ["#ffd0a8", "#d99a5c", "#6a4a2c"], leaf: ["#3a4a1a", "#6e8a2a", "#b8c840"], trunk: "#8a6a48", far: "baobab", farc: "#9a6a44", floor: "#5a3a22",
      friends: ["sifaka", "fingerdyr", "panterkamaeleon", "komet"], predators: ["fossa", "mad_boa", "mad_hoenshoeg"], hazards: ["tomatfroe", "tusindben"], unlock: "ringhalet_maki" },
    { id: "costarica", da: "Costa Rica", land: "Mellemamerika", fact: "Her ligger tågeskove højt oppe på vulkanernes sider", sky: ["#c8ecff", "#62bcd8", "#1a6e7c"], leaf: ["#0a4a3a", "#1a8a5a", "#5ccc8a"], trunk: "#5a3e2c", far: "volcano", farc: "#4a8a98", floor: "#352418",
      friends: ["quetzal", "broleabe", "totaaet_dovendyr", "loevfroe"], predators: ["puma", "buskmester", "prydhoegeoern"], hazards: ["bananedderkop", "kuglemyre"], unlock: "kapucinerabe" }
  ];

  // ---------- Tegning ----------
  function draw(c, id, o) {
    const s = T.looks[id];
    const k = s && T.kinds[s.kind];
    c.save();
    c.scale(o.r, o.r);
    if (k) k(c, s, o);
    else { // mangler tegningen, vises en grå plet med spørgsmålstegn
      c.fillStyle = "#8a8f98"; c.beginPath(); c.ellipse(0, 0, 1, .7, 0, 0, T.PI2); c.fill();
      c.fillStyle = "#fff"; c.font = "bold .9px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("?", 0, .05);
    }
    c.restore();
  }

  // Lille billede af et dyr (dataURL)
  function icon(id, size, o) {
    const cv = document.createElement("canvas");
    cv.width = Math.round(size * 2); cv.height = Math.round(size * 1.5);
    const c = cv.getContext("2d");
    c.translate(cv.width / 2, cv.height / 2);
    draw(c, id, Object.assign({ r: size * .42, t: 0, mode: "sit" }, o));
    return cv.toDataURL();
  }

  const monkeyOf = (id) => M.find((m) => m.id === id);
  // Alle navne på dyr og aber (til dyrebogen og lydklip)
  const nameOf = (id) => (SP[id] && SP[id].da) || (monkeyOf(id) && monkeyOf(id).da) || id;

  return { species: SP, worlds: W, monkeys: M, monkeyOf, nameOf, draw, icon, mix: T.mix, dk: T.dk, lt: T.lt };
});
