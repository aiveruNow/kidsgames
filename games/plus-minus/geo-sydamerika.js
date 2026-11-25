(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.TalbasketGeoSydamerika = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const rows = [
    { id: "ve", cont: "sydamerika", name: "Venezuela", i: "i Venezuela",
      capital: "Caracas", pv: "ca. 28 mio.", ps: "otteogtyve millioner",
      cur: "Venezuelanske bolívar", curSay: "venezuelanske bolivar",
      lang: "Spansk", langSay: "spansk",
      hello: { text: "Hola", say: "oola" },
      intro: "Venezuela ligger i det nordlige Sydamerika, ved det Caribiske Hav. Her styrter et af verdens højeste vandfald ned fra et fladt bjerg i junglen. I de store floder svømmer lyserøde floddelfiner. Hovedstaden hedder Caracas." },
    { id: "ec", cont: "sydamerika", name: "Ecuador", i: "i Ecuador",
      capital: "Quito", capSay: "Kito", pv: "ca. 18 mio.", ps: "atten millioner",
      cur: "Amerikanske dollar", curSay: "amerikanske dollar",
      lang: "Spansk", langSay: "spansk",
      hello: { text: "Hola", say: "oola" },
      intro: "Ecuador ligger i Sydamerika, og navnet betyder ækvator, som går gennem landet. Ude i havet ligger Galapagosøerne, hvor der bor kæmpeskildpadder og sjove havleguaner. Der er også høje vulkaner. Hovedstaden hedder Quito." },
    { id: "bo", cont: "sydamerika", name: "Bolivia", i: "i Bolivia",
      capital: "Sucre", capSay: "Sukre", pv: "ca. 12 mio.", ps: "tolv millioner",
      cur: "Boliviansk boliviano", curSay: "boliviansk boliviano",
      lang: "Spansk", langSay: "spansk",
      hello: { text: "Hola", say: "oola" },
      intro: "Bolivia ligger midt i Sydamerika, og her er der meget høje bjerge. Der findes en kæmpe flade af hvidt salt, som ligner et stort spejl, når der er lidt vand. Der bor også lamaer. Hovedstaden hedder Sucre, men regeringen sidder i La Paz." },
    { id: "py", cont: "sydamerika", name: "Paraguay", i: "i Paraguay",
      capital: "Asuncion", capSay: "Asunsjon", pv: "ca. 6,8 mio.", ps: "seks komma otte millioner",
      cur: "Paraguayansk guarani", curSay: "paraguayansk guarani",
      lang: "Spansk og guarani", langSay: "spansk og guarani",
      hello: null,
      intro: "Paraguay ligger midt i Sydamerika og har ingen kyst. Mange børn vokser op med to sprog, spansk og guarani. I skovene lever store myresluger med lange næser. Hovedstaden hedder Asuncion." },
    { id: "uy", cont: "sydamerika", name: "Uruguay", i: "i Uruguay",
      capital: "Montevideo", pv: "ca. 3,4 mio.", ps: "tre komma fire millioner",
      cur: "Uruguayanske pesos", curSay: "uruguayanske pesos",
      lang: "Spansk", langSay: "spansk",
      hello: { text: "Hola", say: "oola" },
      intro: "Uruguay er et lille land i Sydamerika med lange sandstrande ved Atlanterhavet. Her elsker man fodbold, og landet har vundet verdensmesterskabet to gange. Der går mange køer og heste på de grønne marker. Hovedstaden hedder Montevideo." },
    { id: "gy", cont: "sydamerika", name: "Guyana", i: "i Guyana",
      capital: "Georgetown", capSay: "Dsjårdstaun", pv: "ca. 800 tusind", ps: "otte hundrede tusind",
      cur: "Guyanske dollar", curSay: "guyanske dollar",
      lang: "Engelsk", langSay: "engelsk",
      hello: { text: "Hello", say: "hallo" },
      intro: "Guyana ligger i Sydamerika og er dækket af tæt regnskov. Her styrter et meget højt vandfald ned i junglen. I skoven bor jaguarer, store oddere og farverige fugle. Man taler engelsk, selvom landet ligger i Sydamerika. Hovedstaden hedder Georgetown." },
    { id: "sr", cont: "sydamerika", name: "Surinam", i: "i Surinam",
      capital: "Paramaribo", pv: "ca. 600 tusind", ps: "seks hundrede tusind",
      cur: "Surinamske dollar", curSay: "surinamske dollar",
      lang: "Hollandsk", langSay: "hollandsk",
      hello: { text: "Hallo", say: "hallo" },
      intro: "Surinam ligger i Sydamerika og er næsten helt dækket af regnskov. Her bor aber, tukaner og jaguarer. Man taler hollandsk, og mange børn lærer også flere andre sprog. Hovedstaden hedder Paramaribo." }
  ];
  const pron = {
    "Guyana": "Gajana",
    "Georgetown": "Dsjårdstaun",
    "Quito": "Kito",
    "Sucre": "Sukre",
    "Asuncion": "Asunsjon"
  };
  return { rows, pron };
});
