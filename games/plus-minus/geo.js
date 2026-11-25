// Geografi-data til Talbasket: 7 kontinenter, 33 lande/steder, dyr og kendte steder.
// Alle tekster med "say", "text", "intro" og "fact" er præcis det, Christel siger i lydklippet audio/<file>.mp3, og de vises også på skærmen.
// PRON er kun til lydgeneratoren: skrevet form -> udtale, så den danske stemme siger fremmede navne rigtigt.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.TalbasketGeo = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const CONTINENTS = [
    {
      id: "europa", name: "Europa", emoji: "🏰", order: 1,
      stats: [
        { icon: "📐", label: "Størrelse", value: "ca. 10 mio. km²" },
        { icon: "👨‍👩‍👧", label: "Mennesker", value: "ca. 750 mio." },
        { icon: "🏳️", label: "Lande", value: "45" }
      ],
      intro: "Velkommen til Europa! Her bor omkring syv hundrede og halvtreds millioner mennesker. Europa har mange små og store lande, som ligger tæt på hinanden. Man kan tage toget fra by til by og høre mange forskellige sprog. Her ligger Danmark, og her findes sneklædte bjerge, varme strande og gamle slotte.",
      introFile: "europa-intro",
      facts: [
        { text: "Europa er det næstmindste kontinent, men her bor rigtig mange mennesker. Der er mange små lande, som ligger tæt på hinanden.", file: "europa-fakta1" },
        { text: "Man kan tage et tog fra Danmark helt ned til Italien. Så kommer man forbi bjerge, floder og store byer.", file: "europa-fakta2" },
        { text: "Mange gamle slotte ligger i Europa. Nogle er flere hundrede år gamle. Måske har en rigtig prinsesse boet der!", file: "europa-fakta3" }
      ],
      animals: [
        { id: "brunbjoern", name: "Brun bjørn", emoji: "🐻", where: "Skove og bjerge i Europa", fact: "Den brune bjørn er stor og stærk. Den sover hele vinteren i en hule. Om foråret vågner den sulten og leder efter bær, rødder og honning.", file: "dyr-brunbjoern" },
        { id: "raev", name: "Rød ræv", emoji: "🦊", where: "Skove og marker, også i Danmark", fact: "Ræven har en busket hale og store, spidse ører. Den er listig og kan høre en mus, selv under sneen. Om natten går den ofte på jagt.", file: "dyr-raev" },
        { id: "ulv", name: "Ulv", emoji: "🐺", where: "Skove og bjerge i Sydeuropa", fact: "Ulve bor sammen i en flok og hyler til hinanden. De er sky og holder sig væk fra mennesker. I dag bor der ulve i flere europæiske lande.", file: "dyr-ulv" },
        { id: "kronhjort", name: "Kronhjort", emoji: "🦌", where: "Skove, også i Danmark", fact: "Hannen har et kæmpe gevir, som falder af hvert år og vokser ud igen. Geviret er stort og tungt. Kronhjorte bor i skove, også i Danmark.", file: "dyr-kronhjort" },
        { id: "ugle", name: "Ugle", emoji: "🦉", where: "Skove og marker", fact: "Uglen kan dreje hovedet langt om på ryggen. Den har store øjne og ser godt i mørke. Om natten flyver den helt lydløst, så ingen kan høre den.", file: "dyr-ugle" },
        { id: "pindsvin", name: "Pindsvin", emoji: "🦔", where: "Haver og skove", fact: "Pindsvinet har tusindvis af pigge. Når det bliver bange, ruller det sig sammen til en lille pigget bold. Om vinteren sover det i en bunke blade.", file: "dyr-pindsvin" }
      ],
      landmarks: [
        { id: "eiffeltaarnet", name: "Eiffeltårnet", emoji: "🗼", where: "Paris, Frankrig", fact: "Eiffeltårnet er omkring tre hundrede meter højt. Det er bygget af jern, og man kan tage elevator helt op. Når det bliver mørkt, glimter det med tusindvis af små lys.", file: "sted-eiffeltaarnet" },
        { id: "colosseum", name: "Colosseum", emoji: "🏛️", where: "Rom, Italien", fact: "Colosseum er en kæmpe, rund bygning i Rom. Den er næsten to tusind år gammel. For længe siden kom der mange tusinde mennesker for at se store shows.", file: "sted-colosseum" },
        { id: "bigben", name: "Big Ben", emoji: "🕰️", where: "London, Storbritannien", fact: "Big Ben er et stort ur i et højt tårn i London. Egentlig er Big Ben navnet på den tunge klokke inde i tårnet. Den ringer så højt, at man kan høre den langt væk.", file: "sted-bigben" }
      ]
    },
    {
      id: "afrika", name: "Afrika", emoji: "🌍", order: 2,
      stats: [
        { icon: "📐", label: "Størrelse", value: "ca. 30 mio. km²" },
        { icon: "👨‍👩‍👧", label: "Mennesker", value: "ca. 1,4 mia." },
        { icon: "🏳️", label: "Lande", value: "54" }
      ],
      intro: "Velkommen til Afrika! Afrika er et kæmpestort kontinent med varme ørkener, grønne regnskove og endeløse savanner. Her bor elefanter, løver og giraffer. Der bor også omkring en komma fire milliarder mennesker, og de taler mange hundrede forskellige sprog. Her er også store floder og vandfald. Tag med på safari!",
      introFile: "afrika-intro",
      facts: [
        { text: "Afrika er det næststørste kontinent i verden. Det er så stort, at man kan lægge både USA, Kina og Indien ind i det.", file: "afrika-fakta1" },
        { text: "I Afrika ligger Sahara, verdens største varme ørken. Den er næsten lige så stor som hele USA.", file: "afrika-fakta2" },
        { text: "Floden Nilen er en af de længste floder i verden. Den løber gennem Egypten og ud i Middelhavet.", file: "afrika-fakta3" }
      ],
      animals: [
        { id: "loeve", name: "Løve", emoji: "🦁", where: "Savannen i Afrika", fact: "Løven kaldes dyrenes konge. Den bor i en flok, som hedder en pride. Hannen har en flot manke, og løvens brøl kan høres meget langt væk.", file: "dyr-loeve" },
        { id: "giraf", name: "Giraf", emoji: "🦒", where: "Savannen i Afrika", fact: "Giraffen er det højeste dyr i verden. Selv en baby er højere end mange voksne mennesker. Giraffen bruger sin lange, mørke tunge til at plukke blade fra træerne.", file: "dyr-giraf" },
        { id: "zebra", name: "Zebra", emoji: "🦓", where: "Sletterne i Østafrika", fact: "Hver zebra har sine egne striber, ligesom du har dine egne fingeraftryk. Der findes ikke to zebraer med helt det samme mønster. De bor i store flokke og løber hurtigt.", file: "dyr-zebra" },
        { id: "naesehorn", name: "Næsehorn", emoji: "🦏", where: "Savannen i Østafrika og Sydafrika", fact: "Næsehornet er et stort og tungt dyr med et horn på næsen. Hornet er lavet af det samme som dine negle og dit hår. Næsehornet elsker at tage mudderbad.", file: "dyr-naesehorn" },
        { id: "flodhest", name: "Flodhest", emoji: "🦛", where: "Floder og søer i Afrika", fact: "Flodhesten tilbringer dagen i vandet for at holde sig kølig. Den kan holde vejret i flere minutter under vandet. Om natten går den på land for at spise græs.", file: "dyr-flodhest" },
        { id: "lemur", name: "Ringhalet lemur", emoji: "🐒", where: "Øen Madagaskar", fact: "Lemurer lever kun vildt på Madagaskar. Den ringhalede lemur har en lang hale med sorte og hvide ringe. Om morgenen sidder den og varmer sig i solen.", file: "dyr-lemur" }
      ],
      landmarks: [
        { id: "pyramiderne", name: "Pyramiderne i Giza", emoji: "🏜️", where: "Giza, Egypten", fact: "Pyramiderne i Giza er kæmpe gravsteder for gamle konger, som hed faraoer. De er over fire tusind år gamle. Den største pyramide er bygget af millioner af tunge sten.", file: "sted-pyramiderne" },
        { id: "kilimanjaro", name: "Kilimanjaro", emoji: "🏔️", where: "Tanzania", fact: "Kilimanjaro er Afrikas højeste bjerg. Selvom det ligger i det varme Afrika, er der sne på toppen. Bjerget er næsten seks tusind meter højt. Det er et rigtigt kæmpebjerg.", file: "sted-kilimanjaro" },
        { id: "victoriafaldene", name: "Victoriafaldene", emoji: "🌊", where: "Zambia og Zimbabwe", fact: "Victoriafaldene er nogle af verdens største vandfald. Floden styrter ned i en dyb kløft, og vandet danser op som tyk tåge. Det lokale navn betyder røgen, der tordner.", file: "sted-victoriafaldene" }
      ]
    },
    {
      id: "asien", name: "Asien", emoji: "🏯", order: 3,
      stats: [
        { icon: "📐", label: "Størrelse", value: "ca. 44 mio. km²" },
        { icon: "👨‍👩‍👧", label: "Mennesker", value: "ca. 4,7 mia." },
        { icon: "🏳️", label: "Lande", value: "46" }
      ],
      intro: "Velkommen til Asien! Asien er verdens største kontinent, og her bor mere end halvdelen af alle mennesker. Her ligger verdens højeste bjerg, store byer med lynhurtige tog og varme jungler med elefanter. Asien har pandaer, tigre og masser af god mad. Hvilket land vil du besøge først?",
      introFile: "asien-intro",
      facts: [
        { text: "Asien har både iskolde bjerge og varme jungler. Nogle steder sner det næsten hele året, og andre steder er der sommer hele året.", file: "asien-fakta1" },
        { text: "I Kina og Indien bor der næsten lige mange mennesker, omkring en komma fire milliarder i hvert land.", file: "asien-fakta2" },
        { text: "Risen, som mange af os spiser, kommer ofte fra Asien. Man dyrker den i våde marker, som hedder rismarker.", file: "asien-fakta3" }
      ],
      animals: [
        { id: "panda", name: "Kæmpepanda", emoji: "🐼", where: "Bjergskove i Kina", fact: "Pandaen spiser næsten kun bambus. Den kan sidde og tygge bambus i mange timer hver dag. En pandababy er lyserød og bittelille, når den bliver født.", file: "dyr-panda" },
        { id: "tiger", name: "Tiger", emoji: "🐅", where: "Skove og jungler i Asien", fact: "Tigeren er den største kat i verden. Hver tiger har sine egne striber, og den kan lide at bade i vand. Tigre bor i skove, for eksempel i Indien og Thailand.", file: "dyr-tiger" },
        { id: "elefant", name: "Asiatisk elefant", emoji: "🐘", where: "Jungler i Indien, Thailand og Sri Lanka", fact: "Den asiatiske elefant har en lang snabel, som den bruger som hånd og som snorkel. Den har mindre ører end den afrikanske elefant. Elefanter elsker at sprøjte vand på sig selv.", file: "dyr-elefant" },
        { id: "paafugl", name: "Påfugl", emoji: "🦚", where: "Indien og Sri Lanka", fact: "Påfuglehannen har en kæmpe, flot hale med blå og grønne øjne. Når den folder halen ud som en vifte, vil den gerne vise sig frem. Påfuglen er Indiens nationalfugl.", file: "dyr-paafugl" },
        { id: "orangutang", name: "Orangutang", emoji: "🦧", where: "Regnskoven på Borneo og Sumatra", fact: "Orangutangen bor i regnskoven på øerne Borneo og Sumatra. Hver aften bygger den en blød rede af grene og sover i træerne. Navnet betyder skovens menneske.", file: "dyr-orangutang" },
        { id: "makak", name: "Japansk makak", emoji: "🐵", where: "Bjerge i Japan", fact: "Den japanske makak kaldes også sneabe. Om vinteren sidder den i varme kilder og får det dejligt varmt. Så kan den slappe af, mens det sner rundt om den.", file: "dyr-makak" }
      ],
      landmarks: [
        { id: "muren", name: "Den Kinesiske Mur", emoji: "🧱", where: "Kina", fact: "Den Kinesiske Mur er en meget lang mur, som snor sig over bjerge og dale. Den er bygget for mange hundrede år siden. Den er flere tusind kilometer lang.", file: "sted-muren" },
        { id: "tajmahal", name: "Taj Mahal", emoji: "🕌", where: "Agra, Indien", fact: "Taj Mahal er et smukt, hvidt bygningsværk lavet af marmor. En konge byggede det for mange hundrede år siden til sin elskede dronning. Det tog mere end tyve år at bygge.", file: "sted-tajmahal" },
        { id: "everest", name: "Mount Everest", emoji: "🏔️", where: "Himalaya, Nepal og Kina", fact: "Mount Everest er verdens højeste bjerg. Toppen er omkring ni tusind meter over havet. Der er sne og is hele året, og kun modige bjergbestigere når helt op.", file: "sted-everest" }
      ]
    },
    {
      id: "nordamerika", name: "Nordamerika", emoji: "🗽", order: 4,
      stats: [
        { icon: "📐", label: "Størrelse", value: "ca. 24 mio. km²" },
        { icon: "👨‍👩‍👧", label: "Mennesker", value: "ca. 600 mio." },
        { icon: "🏳️", label: "Lande", value: "24" }
      ],
      intro: "Velkommen til Nordamerika! Her ligger Canada, USA og Mexico, og det er et kæmpestort kontinent. Her er høje bjerge, store søer, ørkener og regnskove. Mod nord bor der isbjørne, og i syd bor der dovendyr. Her ligger også Grønland, som er verdens største ø. Tag med på tur!",
      introFile: "nordamerika-intro",
      facts: [
        { text: "Nordamerika har nogle af verdens største søer. Nogle af dem er så store, at de næsten ligner et hav.", file: "nordamerika-fakta1" },
        { text: "I Nordamerika kan man møde både isbjørne og alligatorer. Isbjørnene bor langt mod nord, og alligatorerne bor i det varme syd.", file: "nordamerika-fakta2" },
        { text: "Nordamerika har mange store nationalparker. Her kan man se høje bjerge, varme kilder og vilde dyr helt tæt på.", file: "nordamerika-fakta3" }
      ],
      animals: [
        { id: "isbjoern", name: "Isbjørn", emoji: "🐻", where: "Det kolde nord, Grønland og Canada", fact: "Isbjørnen har tyk pels og et tykt lag fedt, så den ikke fryser. Den er en rigtig god svømmer og kan svømme i mange timer ad gangen.", file: "dyr-isbjoern" },
        { id: "vaskebjoern", name: "Vaskebjørn", emoji: "🦝", where: "Skove og byer i USA og Canada", fact: "Vaskebjørnen har en sort maske om øjnene, ligesom en lille bandit. Den vasker tit sin mad i vand, før den spiser. Den er god til at åbne låg med sine små hænder.", file: "dyr-vaskebjoern" },
        { id: "alligator", name: "Alligator", emoji: "🐊", where: "Sumpe i det sydlige USA", fact: "Alligatoren bor i varme sumpe i det sydlige USA. Den ligger helt stille i vandet, så man kun kan se øjnene og næsen. Den har mange skarpe tænder.", file: "dyr-alligator" },
        { id: "havoern", name: "Hvidhovedet havørn", emoji: "🦅", where: "Canada og USA", fact: "Den hvidhovedede havørn har et hvidt hoved og et gult næb. Den kan se en lille fisk fra højt oppe i luften. Den er nationalfugl i USA.", file: "dyr-havoern" },
        { id: "kalkun", name: "Vild kalkun", emoji: "🦃", where: "Skove i USA og Mexico", fact: "Den vilde kalkun kan flyve og sover oppe i træerne om natten. Hannen spreder sin hale som en vifte og siger gluk gluk gluk. Kalkunen kommer oprindeligt fra Nordamerika.", file: "dyr-kalkun" },
        { id: "dovendyr", name: "Dovendyr", emoji: "🦥", where: "Regnskoven i Mellemamerika", fact: "Dovendyret bevæger sig meget, meget langsomt. Det hænger i træerne og sover mange timer hver dag. Nogle gange vokser der små grønne alger på dets pels.", file: "dyr-dovendyr" }
      ],
      landmarks: [
        { id: "frihedsgudinden", name: "Frihedsgudinden", emoji: "🗽", where: "New York, USA", fact: "Frihedsgudinden står på en lille ø ved New York. Hun holder en fakkel i hånden. Hun blev givet som gave fra Frankrig for omkring hundrede og fyrre år siden.", file: "sted-frihedsgudinden" },
        { id: "grandcanyon", name: "Grand Canyon", emoji: "🏜️", where: "Arizona, USA", fact: "Grand Canyon er en kæmpe, dyb kløft i USA. Floden Colorado har gravet den i mange millioner år. Kløften er så stor, at man kan stå og kigge ud over den i lang tid.", file: "sted-grandcanyon" },
        { id: "chichenitza", name: "Chichén Itzá", emoji: "🏛️", where: "Mexico", fact: "Chichén Itzá er en gammel by, som mayaerne byggede for mange hundrede år siden. Den store pyramide har trapper på alle fire sider. Hvis man klapper foran trappen, svarer den som en fugl.", file: "sted-chichenitza" }
      ]
    },
    {
      id: "sydamerika", name: "Sydamerika", emoji: "🦜", order: 5,
      stats: [
        { icon: "📐", label: "Størrelse", value: "ca. 18 mio. km²" },
        { icon: "👨‍👩‍👧", label: "Mennesker", value: "ca. 440 mio." },
        { icon: "🏳️", label: "Lande", value: "12" }
      ],
      intro: "Velkommen til Sydamerika! Her flyder Amazonfloden gennem den største regnskov i verden. Her ligger de høje Andesbjerge, tørre ørkener og lange strande. I Sydamerika bor lamaer, jaguarer og farverige papegøjer. Man taler mest spansk og portugisisk, og folk elsker fodbold. Det er et kontinent fuld af farver og eventyr.",
      introFile: "sydamerika-intro",
      facts: [
        { text: "Amazonfloden fører mere vand end nogen anden flod i verden. Nogle steder er den så bred, at man ikke kan se over til den anden side.", file: "sydamerika-fakta1" },
        { text: "Andesbjergene er verdens længste bjergkæde. De strækker sig langs hele Sydamerikas vestkyst, mange tusind kilometer.", file: "sydamerika-fakta2" },
        { text: "Mange dyr i Amazonas er farverige. Der bor papegøjer, frøer og lyserøde floddelfiner. Det er et af jordens mest farverige steder.", file: "sydamerika-fakta3" }
      ],
      animals: [
        { id: "lama", name: "Lama", emoji: "🦙", where: "Andesbjergene", fact: "Lamaen er i familie med kamelen, men den har ingen pukkel. Den bor i bjergene og er god til at bære tunge ting. Hvis den bliver sur, kan den finde på at spytte.", file: "dyr-lama" },
        { id: "ara", name: "Ara", emoji: "🦜", where: "Regnskoven i Sydamerika", fact: "Araer er store papegøjer med farverige fjer i rød, gul og blå. De bor i regnskoven og kan blive meget gamle. De kan efterligne lyde og skriger højt.", file: "dyr-ara" },
        { id: "jaguar", name: "Jaguar", emoji: "🐆", where: "Regnskoven i Sydamerika", fact: "Jaguaren er den største kat i Sydamerika. Den har gul pels med sorte pletter og er en god svømmer. Den bor i regnskoven og hviler sig gerne i træerne.", file: "dyr-jaguar" },
        { id: "anakonda", name: "Anakonda", emoji: "🐍", where: "Sumpe og floder i Amazonas", fact: "Anakondaen er en af verdens største slanger. Den bor i vand og sumpe i Amazonas og kan blive flere meter lang. På land er den langsom, men i vandet er den hurtig.", file: "dyr-anakonda" },
        { id: "flamingo", name: "Flamingo", emoji: "🦩", where: "Saltsøer i Andesbjergene", fact: "Flamingoer står ofte på ét ben, når de hviler sig. Deres fjer er lyserøde på grund af maden, de spiser, nemlig små rejer og alger. De bor i store flokke ved saltsøer.", file: "dyr-flamingo" },
        { id: "floddelfin", name: "Lyserød floddelfin", emoji: "🐬", where: "Amazonfloden", fact: "Den lyserøde floddelfin lever i Amazonfloden og er en af de få delfiner, der bor i en flod. Den har en lang snude. Når regnskoven bliver oversvømmet, kan den svømme rundt mellem træerne.", file: "dyr-floddelfin" }
      ],
      landmarks: [
        { id: "machupicchu", name: "Machu Picchu", emoji: "🏔️", where: "Peru", fact: "Machu Picchu er en gammel by højt oppe i Andesbjergene. Inkaerne byggede den for mange hundrede år siden. Den ligger så højt, at den nogle gange er helt omgivet af skyer.", file: "sted-machupicchu" },
        { id: "kristusstatuen", name: "Kristusstatuen", emoji: "🙌", where: "Rio de Janeiro, Brasilien", fact: "Kristusstatuen står på en bjergtop over Rio de Janeiro. Den har armene bredt ud, som et stort kram. Den er mere end tredive meter høj og kan ses fra mange steder i byen.", file: "sted-kristusstatuen" },
        { id: "paaskeoen", name: "Påskeøens statuer", emoji: "🗿", where: "Påskeøen, Chile", fact: "På Påskeøen står der næsten tusind store stenhoveder, som hedder moai. De blev lavet for mange hundrede år siden af folk, som boede på øen. Nogle er flere meter høje.", file: "sted-paaskeoen" }
      ]
    },
    {
      id: "australien", name: "Australien og Oceanien", emoji: "🦘", order: 6,
      stats: [
        { icon: "📐", label: "Størrelse", value: "ca. 8,5 mio. km²" },
        { icon: "👨‍👩‍👧", label: "Mennesker", value: "ca. 45 mio." },
        { icon: "🏳️", label: "Lande", value: "14" }
      ],
      intro: "Velkommen til Australien og Oceanien! Her er røde ørkener, varme strande og tusindvis af øer i Stillehavet. Her hopper kænguruer rundt, og koalaer sover i træerne. Mange af øerne har palmer og hvidt sand. Her findes også dyr, som ikke bor andre steder i verden.",
      introFile: "australien-intro",
      facts: [
        { text: "Australien er både et land og et helt kontinent. Det er det eneste land, der fylder et helt kontinent alene.", file: "australien-fakta1" },
        { text: "Mange af dyrene i Australien findes ikke andre steder. Kænguruen og koalaen har begge en pose på maven, hvor ungerne vokser op.", file: "australien-fakta2" },
        { text: "I Oceanien ligger tusindvis af små øer i Stillehavet. Mange af dem har palmer, hvide strande og klart blåt vand.", file: "australien-fakta3" }
      ],
      animals: [
        { id: "kaenguru", name: "Kænguru", emoji: "🦘", where: "Australien", fact: "Kænguruen hopper rundt på sine kraftige baglår. Mor kænguru bærer sin baby i en pose på maven. Babyen hedder en joey og er bittelille, når den bliver født.", file: "dyr-kaenguru" },
        { id: "koala", name: "Koala", emoji: "🐨", where: "Eukalyptusskove i Australien", fact: "Koalaen er ikke en bjørn, selvom den ligner en bamse. Den spiser blade fra eukalyptustræer og sover op til tyve timer hver dag. Den er et rigtigt sovedyr.", file: "dyr-koala" },
        { id: "naebdyr", name: "Næbdyr", emoji: "🦆", where: "Floder i Australien", fact: "Næbdyret er et af verdens skøreste dyr. Det har et næb som en and og en hale som en bæver. Og så lægger det æg, selvom det er et pattedyr.", file: "dyr-naebdyr" },
        { id: "kiwi", name: "Kiwifugl", emoji: "🐤", where: "Skove i New Zealand", fact: "Kiwifuglen kan slet ikke flyve. Den er rund som en bold og kommer frem om natten. Den bruger sit lange næb til at snuse efter orme i jorden.", file: "dyr-kiwi" },
        { id: "dingo", name: "Dingo", emoji: "🐕", where: "Australien", fact: "Dingoen er en vild hund, der lever i Australien. Den har gyldenbrun pels og kan hyle ligesom en ulv. Dingoen er sky og holder sig for det meste for sig selv.", file: "dyr-dingo" },
        { id: "havskildpadde", name: "Havskildpadde", emoji: "🐢", where: "Varme have, også ved Fiji og Australien", fact: "Havskildpadden svømmer rundt i de varme have. Mor skildpadde kravler op på stranden og lægger sine æg i et hul i sandet. Når ungerne klækkes, skynder de sig ned til havet.", file: "dyr-havskildpadde" }
      ],
      landmarks: [
        { id: "operahuset", name: "Operahuset i Sydney", emoji: "🎭", where: "Sydney, Australien", fact: "Operahuset i Sydney ligner store hvide sejl fra en båd. Det ligger lige ved havnen. Her kan man se musik, dans og skuespil. Taget er dækket af over en million fliser.", file: "sted-operahuset" },
        { id: "uluru", name: "Uluru", emoji: "🏜️", where: "Midt i Australien", fact: "Uluru er en kæmpestor rød sten midt i Australiens ørken. Den er meget hellig for aboriginerne, som har boet her i mange tusind år. Ved solnedgang skifter stenen farve.", file: "sted-uluru" },
        { id: "barriererevet", name: "Det Store Barriere-rev", emoji: "🐠", where: "Ud for Australiens østkyst", fact: "Det Store Barriere-rev er verdens største koralrev. Det består af tusindvis af små koraller og mange små øer. Her bor skildpadder, rokker og farverige fisk.", file: "sted-barriererevet" }
      ]
    },
    {
      id: "antarktis", name: "Antarktis", emoji: "🐧", order: 7,
      stats: [
        { icon: "📐", label: "Størrelse", value: "ca. 14 mio. km²" },
        { icon: "👨‍👩‍👧", label: "Mennesker", value: "Kun forskere" },
        { icon: "🏳️", label: "Lande", value: "Ingen" }
      ],
      intro: "Velkommen til Antarktis! Her er verdens koldeste sted, helt nede i bunden af kloden. Næsten alt er dækket af tyk is og sne. Der bor ingen faste mennesker, kun forskere i en periode. Men her bor mange pingviner og sæler, og de elsker kulden. Tag varmt tøj på!",
      introFile: "antarktis-intro",
      facts: [
        { text: "Antarktis er dækket af is, som nogle steder er flere kilometer tyk. Her ligger næsten al verdens is.", file: "antarktis-fakta1" },
        { text: "Selvom der er så meget is, falder der næsten ingen sne. Antarktis er faktisk en kold ørken.", file: "antarktis-fakta2" },
        { text: "Ved Sydpolen er der ét langt døgn. Det er dag i et halvt år og nat i et halvt år.", file: "antarktis-fakta3" }
      ],
      animals: [
        { id: "kejserpingvin", name: "Kejserpingvin", emoji: "🐧", where: "Isen rundt om Antarktis", fact: "Kejserpingvinen er den største pingvin. Pingviner kan ikke flyve, men de svømmer rigtig godt. Pingvinfar holder ægget varmt på sine fødder i over to måneder.", file: "dyr-kejserpingvin" },
        { id: "leopardsael", name: "Leopardsæl", emoji: "🦭", where: "Havet ved Antarktis", fact: "Leopardsælen har pletter ligesom en leopard. Den er en god svømmer og bor i det kolde hav ved Antarktis. Nogle gange hviler den sig på en flydende isflage.", file: "dyr-leopardsael" },
        { id: "blaahval", name: "Blåhval", emoji: "🐋", where: "Havet ved Antarktis", fact: "Blåhvalen er det største dyr, der nogensinde har levet. Den er omkring tredive meter lang. Selvom den er kæmpestor, spiser den bittesmå dyr, som hedder krill.", file: "dyr-blaahval" },
        { id: "spaekhugger", name: "Spækhugger", emoji: "🐳", where: "Havet ved Antarktis", fact: "Spækhuggeren er en slags delfin, selvom den er stor og sort og hvid. Den bor i en flok og snakker med fløjt og klik. Spækhuggere er meget kloge.", file: "dyr-spaekhugger" },
        { id: "krill", name: "Krill", emoji: "🦐", where: "Havet ved Antarktis", fact: "Krill er bittesmå rejer, som ikke er længere end din finger. Der er så mange, at de bliver mad for pingviner, sæler og hvaler. Uden krill ville mange dyr blive sultne.", file: "dyr-krill" },
        { id: "albatros", name: "Vandrealbatros", emoji: "🐦", where: "Havet omkring Antarktis", fact: "Vandrealbatrossen har de længste vinger af alle fugle. Den kan være over tre meter fra vingespids til vingespids. Den kan flyve i dagevis over havet uden at lande.", file: "dyr-albatros" }
      ],
      landmarks: [
        { id: "sydpolen", name: "Sydpolen", emoji: "🧭", where: "Midt i Antarktis", fact: "Sydpolen er det sted, der ligger helt nede i bunden af jorden. Hvis man står der, er alle retninger mod nord. En lille stang med en blank kugle markerer stedet, og forskere bor tæt ved.", file: "sted-sydpolen" },
        { id: "mountvinson", name: "Mount Vinson", emoji: "⛰️", where: "Antarktis", fact: "Mount Vinson er det højeste bjerg i Antarktis. Det er næsten fem tusind meter højt. Det er dækket af sne og is, og ikke særlig mange mennesker har nogensinde stået på toppen.", file: "sted-mountvinson" },
        { id: "isbjerge", name: "Isbjerge", emoji: "🧊", where: "Havet rundt om Antarktis", fact: "Isbjerge er store stykker is, der flyder rundt i havet. Man kan kun se en lille del over vandet. Resten gemmer sig under vandet. Nogle isbjerge i Antarktis er større end en hel by.", file: "sted-isbjerge" }
      ]
    }
  ];

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const special = (id, key, label, pair) => ({ id: key, icon: pair[0], label, text: pair[1], file: `${id}-${key}` });

  // Et land: fire felter (hovedstad, indbyggere, valuta, sprog) bliver til fire fliser med tilhørende lydsætninger.
  function buildCountry(r) {
    const I = cap(r.i);
    return {
      id: r.id, cont: r.cont, kind: "country", name: r.name, emoji: r.emoji,
      capital: r.capital, people: r.people, currency: r.cur, language: r.lang,
      hello: r.hello, intro: r.intro, introFile: `${r.id}-intro`,
      tiles: [
        { key: "capital", icon: "🏙️", label: "Hovedstad", value: r.capital, say: `Hovedstaden ${r.i} hedder ${r.capSay || r.capital}.`, file: `${r.id}-capital` },
        { key: "people", icon: "👨‍👩‍👧", label: "Indbyggere", value: r.pv, say: `${I} bor der omkring ${r.ps} mennesker.`, file: `${r.id}-people` },
        { key: "currency", icon: "💰", label: "Valuta", value: r.cur, say: `${I} betaler man med ${r.curSay}.`, file: `${r.id}-currency` },
        { key: "language", icon: "🗣️", label: "Sprog", value: r.lang, say: `${I} taler man ${r.langSay}.`, file: `${r.id}-language` }
      ],
      specials: [
        special(r.id, "mad", "Mad", r.m),
        special(r.id, "oplev", "Se og oplev", r.o),
        special(r.id, "sjovt", "Sjovt", r.s)
      ],
      animals: r.animals
    };
  }

  // Et sted (Antarktis): fire andre fliser og tre andre specials, ingen hovedstad, valuta eller sprog.
  function buildPlace(r) {
    const t = r.tiles;
    return {
      id: r.id, cont: r.cont, kind: "place", name: r.name, emoji: r.emoji,
      capital: null, people: null, currency: null, language: null, hello: null,
      intro: r.intro, introFile: `${r.id}-intro`,
      tiles: [
        { key: "type", icon: "❓", label: "Hvad er det?", value: t[0][0], say: t[0][1], file: `${r.id}-type` },
        { key: "stoerrelse", icon: "📐", label: "Størrelse", value: t[1][0], say: t[1][1], file: `${r.id}-stoerrelse` },
        { key: "kulde", icon: "🌡️", label: "Temperatur", value: t[2][0], say: t[2][1], file: `${r.id}-kulde` },
        { key: "dyr", icon: "🐧", label: "Dyr her", value: t[3][0], say: t[3][1], file: `${r.id}-dyr` }
      ],
      specials: [
        special(r.id, "oplev", "Se og oplev", r.o),
        special(r.id, "forsker", "Forskerne", r.f),
        special(r.id, "sjovt", "Sjovt", r.s)
      ],
      animals: r.animals
    };
  }

  const RAW = [
    // ---------- Europa ----------
    {
      id: "dk", cont: "europa", name: "Danmark", emoji: "🇩🇰", i: "i Danmark",
      capital: "København", pv: "ca. 5,9 mio.", people: "ca. 5,9 millioner", ps: "fem komma ni millioner",
      cur: "Danske kroner", curSay: "danske kroner", lang: "Dansk", langSay: "dansk",
      hello: { text: "Goddag", say: "goddag" },
      intro: "Danmark er et lille land i Nordeuropa. Det ligger mellem Nordsøen og Østersøen og består af Jylland og mange øer. Her bor du! Man er aldrig langt fra havet, og her er strande, vind og masser af hygge.",
      m: ["🥪", "I Danmark spiser vi rugbrød med pålæg, og til fødselsdage er der kanelsnegle og wienerbrød. Mange danske børn elsker også frikadeller med kartofler. Mmm, det smager godt!"],
      o: ["🏖️", "I Danmark kan du lege på lange strande. Du kan besøge Legoland i Billund, hvor alt er bygget af små klodser. I København ligger Tivoli med rutsjebaner og lys om aftenen."],
      s: ["😄", "Dannebrog er et af verdens ældste flag. En gammel fortælling siger, at det faldt ned fra himlen. Og når vi hilser på hinanden, siger vi goddag."],
      animals: ["raev", "pindsvin"]
    },
    {
      id: "gb", cont: "europa", name: "Storbritannien", emoji: "🇬🇧", i: "i Storbritannien",
      capital: "London", pv: "ca. 67 mio.", people: "ca. 67 millioner", ps: "syvogtres millioner",
      cur: "Pund", curSay: "britiske pund", lang: "Engelsk", langSay: "engelsk",
      hello: { text: "Hello", say: "hellåu" },
      intro: "Storbritannien er en stor ø i Vesteuropa, ikke langt fra Danmark. Her ligger England, Skotland og Wales. Der er grønne bakker, gamle slotte og regn, som tit kommer på besøg. Hovedstaden London har røde busser med to etager.",
      m: ["🍵", "I Storbritannien drikker man te med mælk, ofte sammen med en lille kage. En kendt ret hedder fish and chips. Det er stegt fisk med pommes frites. Man kan også få en stor morgenmad med bønner og pølse."],
      o: ["🎡", "I London kan du køre i en rød bus med to etager. Du kan også tage med London Eye, et kæmpe pariserhjul ved floden. Fra toppen kan du se hele byen."],
      s: ["😄", "I Storbritannien kører bilerne i venstre side af vejen. Det er lidt sjovt at sidde i en bil, hvor rattet er på den forkerte side! Og når briterne hilser, siger de hello."],
      animals: ["pindsvin", "kronhjort"]
    },
    {
      id: "fr", cont: "europa", name: "Frankrig", emoji: "🇫🇷", i: "i Frankrig",
      capital: "Paris", pv: "ca. 68 mio.", people: "ca. 68 millioner", ps: "otteogtres millioner",
      cur: "Euro", curSay: "euro", lang: "Fransk", langSay: "fransk",
      hello: { text: "Bonjour", say: "bongsjur" },
      intro: "Frankrig ligger i Vesteuropa, syd for Storbritannien og ved siden af Tyskland og Spanien. Det er et stort land med bjerge, strande og små landsbyer. Her ligger Paris, hvor Eiffeltårnet står. Franskmændene elsker god mad.",
      m: ["🥖", "I Frankrig bager man lange, sprøde baguettes, og mange spiser en croissant til morgenmad. Franskmændene elsker også ost. Der findes mange hundrede forskellige slags ost!"],
      o: ["🗼", "I Paris kan du tage en tur op i Eiffeltårnet og se ud over hele byen. Du kan også se det store kunstmuseum Louvre, hvor Mona Lisa hænger. Om sommeren kan man bade ved stranden i syd."],
      s: ["🚴", "Hver sommer cykler de bedste ryttere i tre uger rundt i Frankrig. Det hedder Tour de France. Mange står langs vejen og vinker. Og så siger de bonjour!"],
      animals: ["raev", "ulv"]
    },
    {
      id: "it", cont: "europa", name: "Italien", emoji: "🇮🇹", i: "i Italien",
      capital: "Rom", pv: "ca. 59 mio.", people: "ca. 59 millioner", ps: "nioghalvtreds millioner",
      cur: "Euro", curSay: "euro", lang: "Italiensk", langSay: "italiensk",
      hello: { text: "Ciao", say: "tjau" },
      intro: "Italien ligger i Sydeuropa og ligner en lang støvle, der sparker til en bold. Landet ligger ved Middelhavet og har høje bjerge i nord. Her ligger hovedstaden Rom. Italienerne er glade for mad, fodbold og at snakke højt.",
      m: ["🍕", "Pizza kommer fra Italien! Den første rigtige pizza kom fra byen Napoli. Italienerne spiser også pasta i mange former, som spaghetti og makaroni. Og så er der is, som hedder gelato."],
      o: ["🗼", "I byen Pisa står et tårn, der hælder helt skævt. Det hedder Det Skæve Tårn. I Venedig er der kanaler i stedet for veje, og man sejler rundt i gondoler."],
      s: ["🌋", "I Italien ligger vulkanen Vesuv. For længe siden dækkede den byen Pompeji med aske. I dag kan man gå rundt i byen. Italienerne siger ciao, både når de siger hej og farvel."],
      animals: ["ulv"]
    },
    {
      id: "gr", cont: "europa", name: "Grækenland", emoji: "🇬🇷", i: "i Grækenland",
      capital: "Athen", pv: "ca. 10 mio.", people: "ca. 10 millioner", ps: "ti millioner",
      cur: "Euro", curSay: "euro", lang: "Græsk", langSay: "græsk",
      hello: { text: "Yassou", say: "jasu" },
      intro: "Grækenland ligger i det sydlige Europa, ved Middelhavet. Landet har mange bjerge og mange øer med hvide huse og blåt hav. Her ligger hovedstaden Athen, som er en af verdens ældste byer. Grækerne siger yassou, når de hilser.",
      m: ["🥗", "I Grækenland spiser man salat med agurk, tomat og hvid ost, som hedder feta. Man spiser også souvlaki, som er små spyd med kød. Og man dypper brød i god olivenolie."],
      o: ["🏛️", "I Athen ligger Akropolis, en gammel tempelby på en høj klippe. Den er omkring to og et halvt tusind år gammel. Man kan også sejle med færge mellem øerne og bade i det klare blå hav."],
      s: ["🏺", "Grækerne holdt de første olympiske lege for rigtig mange år siden. De fortalte også historier om guder, og Zeus var guden for lyn og torden. Prøv at sige yassou til en ven!"],
      animals: ["brunbjoern", "ulv"]
    },
    // ---------- Afrika ----------
    {
      id: "eg", cont: "afrika", name: "Egypten", emoji: "🇪🇬", i: "i Egypten",
      capital: "Kairo", pv: "ca. 110 mio.", people: "ca. 110 millioner", ps: "hundrede og ti millioner",
      cur: "Egyptisk pund", curSay: "egyptiske pund", lang: "Arabisk", langSay: "arabisk",
      hello: { text: "Ahlan", say: "ahlan" },
      intro: "Egypten ligger i det nordlige Afrika, og en lille del ligger i Asien. Det meste af landet er en stor, varm ørken. Floden Nilen løber gennem landet, og de fleste bor tæt ved den. Her ligger de gamle pyramider.",
      m: ["🥙", "I Egypten spiser man fladbrød og hummus. En kendt ret hedder koshari. Den er lavet af ris, pasta, linser og tomatsovs. Til dessert kan man få søde kager med honning."],
      o: ["🐪", "I Egypten kan du se de store pyramider og Sfinksen, som har en løves krop og et menneskehoved. Du kan ride på en kamel i ørkenen og sejle på Nilen i en gammel sejlbåd."],
      s: ["🐱", "For længe siden skrev egypterne med små billeder i stedet for bogstaver. Det hedder hieroglyffer. De holdt også meget af katte. I dag siger man ahlan, når man hilser."],
      animals: []
    },
    {
      id: "ke", cont: "afrika", name: "Kenya", emoji: "🇰🇪", i: "i Kenya",
      capital: "Nairobi", pv: "ca. 55 mio.", people: "ca. 55 millioner", ps: "femoghalvtreds millioner",
      cur: "Kenyansk shilling", curSay: "kenyanske shilling", lang: "Swahili og engelsk", langSay: "swahili og engelsk",
      hello: { text: "Jambo", say: "djambo" },
      intro: "Kenya ligger i Østafrika, og ækvator går lige gennem landet. Her er varm savanne, grønne bjerge og en lang kyst ved Det Indiske Ocean. Mange rejser til Kenya på safari for at se vilde dyr. Hovedstaden hedder Nairobi.",
      m: ["🍚", "I Kenya spiser man ugali, en fast grød lavet af majsmel. Man spiser den med fingrene og dypper den i grøntsager og sovs. Man kan også få chapati, som er et rundt, blødt brød."],
      o: ["🦓", "Hvert år går mere end en million gnuer og mange zebraer over de store sletter i Kenya og Tanzania. Det kaldes den store vandring. Man kan sidde i en safaribil og se dyrene helt tæt på."],
      s: ["🕺", "Masaierne er et stolt folk i Kenya. De bærer røde klæder og farvestrålende perler. Når de danser, hopper de højt op i luften. Og i Kenya siger man jambo, når man hilser."],
      animals: ["giraf", "zebra"]
    },
    {
      id: "za", cont: "afrika", name: "Sydafrika", emoji: "🇿🇦", i: "i Sydafrika",
      capital: "Pretoria", pv: "ca. 60 mio.", people: "ca. 60 millioner", ps: "tres millioner",
      cur: "Rand", curSay: "rand", lang: "Zulu, afrikaans og engelsk", langSay: "mange sprog, for eksempel zulu, afrikaans og engelsk",
      hello: { text: "Sawubona", say: "sawubona" },
      intro: "Sydafrika ligger helt nede i den sydlige ende af Afrika. Landet har lange strande, store bjerge og vilde nationalparker. Her bor både løver, elefanter og pingviner. Det har kyst mod både Atlanterhavet og Det Indiske Ocean. Hovedstaden hedder Pretoria.",
      m: ["🥩", "I Sydafrika kan man godt lide at grille sammen med familien. Det hedder en braai. Man spiser også biltong, som er tørret kød, som man kan tygge på."],
      o: ["🦏", "I Sydafrika kan du tage på safari i Krugerparken og se løver, elefanter og næsehorn. Du kan også tage en kabelbane op på Taffelbjerget ved Kapstaden, som har en helt flad top."],
      s: ["🐧", "Ved Kapstaden bor der pingviner på stranden! De lyder lidt som æsler, når de kalder. I Sydafrika siger man sawubona på zulu, når man hilser."],
      animals: ["naesehorn", "loeve"]
    },
    {
      id: "ma", cont: "afrika", name: "Marokko", emoji: "🇲🇦", i: "i Marokko",
      capital: "Rabat", pv: "ca. 37 mio.", people: "ca. 37 millioner", ps: "syvogtredive millioner",
      cur: "Dirham", curSay: "dirham", lang: "Arabisk og berberisk", langSay: "arabisk og berberisk",
      hello: { text: "Salam", say: "salam" },
      intro: "Marokko ligger i det nordvestlige hjørne af Afrika, lige over for Spanien. Landet har både havkyst, høje bjerge og den store Sahara-ørken. Her ligger farverige byer med store markeder, som dufter af krydderier. Hovedstaden hedder Rabat.",
      m: ["🍲", "I Marokko laver man mad i en tagine. Det er en lerpotte med en spids hat. Der er kød, grøntsager og søde frugter i. Man drikker også sød mynte-te."],
      o: ["🐪", "I Marokko kan du gå på markedet i en gammel by, hvor man køber krydderier, tæpper og lamper. Du kan også ride på kamel i Sahara og sove i et telt under millioner af stjerner."],
      s: ["🐐", "I Marokko klatrer geder op i træer! Det er argantræet, og geden elsker frugterne. Det ser helt skørt ud. Og folk siger salam, når de hilser."],
      animals: []
    },
    {
      id: "mg", cont: "afrika", name: "Madagaskar", emoji: "🇲🇬", i: "på Madagaskar",
      capital: "Antananarivo", pv: "ca. 30 mio.", people: "ca. 30 millioner", ps: "tredive millioner",
      cur: "Ariary", curSay: "ariary", lang: "Malagassisk og fransk", langSay: "malagassisk og fransk",
      hello: { text: "Salama", say: "salama" },
      intro: "Madagaskar er en kæmpestor ø ud for Afrikas østkyst, i Det Indiske Ocean. Det er den fjerde største ø i verden. Her bor mange dyr og planter, som ikke findes andre steder, for eksempel lemurer. Hovedstaden hedder Antananarivo.",
      m: ["🍚", "På Madagaskar spiser man ris til næsten alle måltider. Man spiser den med kød, grøntsager og sovs. Der vokser også vanilje på øen, og den bruges i is og kage."],
      o: ["🌳", "På Madagaskar står en lang række af kæmpestore baobabtræer. De ligner træer, der står på hovedet, med rødderne i vejret. Man kan også gå på tur og møde lemurer, der hopper fra gren til gren."],
      s: ["🐒", "Lemurerne på Madagaskar kan hoppe langt, og nogle af dem synger! Der findes over hundrede slags lemurer, og de bor kun her. Folk på Madagaskar siger salama, når de hilser."],
      animals: ["lemur"]
    },
    // ---------- Asien ----------
    {
      id: "in", cont: "asien", name: "Indien", emoji: "🇮🇳", i: "i Indien",
      capital: "New Delhi", pv: "ca. 1,4 mia.", people: "ca. 1,4 milliarder", ps: "en komma fire milliarder",
      cur: "Indisk rupee", curSay: "indiske rupee", lang: "Hindi, engelsk og mange flere, for eksempel tamil", langSay: "hindi og engelsk. Og man taler mange andre sprog, for eksempel tamil",
      hello: { text: "Namaste", say: "namaste" },
      intro: "Indien ligger i Sydasien og er et kæmpestort land med snedækkede bjerge, varme strande og store byer. Her bor næsten lige så mange mennesker som i Kina. Hovedstaden hedder New Delhi. I Indien taler man mange forskellige sprog.",
      m: ["🍛", "I Indien spiser man karry med krydderier, ris og nanbrød. Maden kan være stærk, så man drikker ofte en kølig lassi bagefter. Det er en sød drik lavet af yoghurt."],
      o: ["🐘", "I Indien kan du se det smukke Taj Mahal. Du kan også komme til Holi, en fest hvor alle kaster farvet pulver på hinanden. Så bliver alle røde, gule, grønne og blå!"],
      s: ["🏏", "I Indien hilser man ved at samle hænderne og sige namaste. På tamil siger man vanakkam. Mange børn spiller cricket, og der laves store film med sang og dans."],
      animals: ["tiger", "paafugl"]
    },
    {
      id: "cn", cont: "asien", name: "Kina", emoji: "🇨🇳", i: "i Kina",
      capital: "Beijing", pv: "ca. 1,4 mia.", people: "ca. 1,4 milliarder", ps: "en komma fire milliarder",
      cur: "Yuan", curSay: "yuan", lang: "Kinesisk", langSay: "kinesisk",
      hello: { text: "Ni hao", say: "ni hau" },
      intro: "Kina ligger i Østasien og er et af verdens største lande. Det har høje bjerge, store ørkener og lange floder. Her bor omkring en komma fire milliarder mennesker, og her bor også de søde pandaer, som elsker bambus. Hovedstaden hedder Beijing.",
      m: ["🥟", "I Kina spiser man ris og nudler, og man bruger spisepinde i stedet for gaffel. Man elsker også dumplings, som er små, dampede dejlommer fyldt med kød eller grønt."],
      o: ["🐼", "I Kina bor de søde pandaer, og man kan besøge dem i en stor park. Her ligger også Den Kinesiske Mur. Til nytår tænder man røde lamper og danser med en drage lavet af stof."],
      s: ["🪁", "Kineserne fandt på papir, fyrværkeri og papirdrager for mange hundrede år siden. Til nytår danser man med en stor drage. Kinesere siger ni hao, når de hilser."],
      animals: ["panda"]
    },
    {
      id: "jp", cont: "asien", name: "Japan", emoji: "🇯🇵", i: "i Japan",
      capital: "Tokyo", pv: "ca. 125 mio.", people: "ca. 125 millioner", ps: "hundrede og femogtyve millioner",
      cur: "Yen", curSay: "yen", lang: "Japansk", langSay: "japansk",
      hello: { text: "Konnichiwa", say: "konnitsjiwa" },
      intro: "Japan er et land af øer i Østasien, ude i Stillehavet. Der er over seks tusind øer, men fire store, hvor de fleste mennesker bor. Hovedstaden hedder Tokyo. Her kører lynhurtige tog, og her står den berømte vulkan Fuji.",
      m: ["🍣", "I Japan spiser man sushi, som er små ruller af ris og fisk. Man spiser også onigiri, som er små trekanter af ris, og man bruger spisepinde."],
      o: ["🗻", "I Japan kan du se vulkanen Fuji, som er et helt perfekt bjerg. Du kan køre i de lynhurtige tog, som hedder Shinkansen. Om foråret blomstrer kirsebærtræerne lyserødt, og så holder alle picnic under dem."],
      s: ["🤖", "I Japan tager man skoene af, når man går indenfor. Der står automater på gaden, som sælger drikkevarer, og der findes robotter, som kan danse. Japanerne siger konnichiwa, når de hilser."],
      animals: ["makak"]
    },
    {
      id: "th", cont: "asien", name: "Thailand", emoji: "🇹🇭", i: "i Thailand",
      capital: "Bangkok", pv: "ca. 70 mio.", people: "ca. 70 millioner", ps: "halvfjerds millioner",
      cur: "Baht", curSay: "baht", lang: "Thai", langSay: "thai",
      hello: { text: "Sawasdee", say: "sawatdi" },
      intro: "Thailand ligger i Sydøstasien og har varme strande, grønne jungler og gyldne templer. Landet ligner lidt en elefant med en lang snabel. Her kan man møde elefanter i junglen og spise sød mango på stranden. Hovedstaden hedder Bangkok.",
      m: ["🍜", "I Thailand spiser man meget ris og nudler. En kendt ret hedder pad thai, med nudler, æg og jordnødder. Til dessert får man sød mango med klistret ris."],
      o: ["🐘", "I Thailand kan du besøge et elefantreservat og se elefanter bade og lege i vandet. Du kan sejle i en lang båd på en flod og besøge flydende markeder."],
      s: ["🎉", "Til festen Songkran kaster alle vand på hinanden for at fejre nytår. Børn og voksne har store vandpistoler! I Thailand bøjer man sig lidt og siger sawasdee, når man hilser."],
      animals: ["elefant", "tiger"]
    },
    {
      id: "lk", cont: "asien", name: "Sri Lanka", emoji: "🇱🇰", i: "i Sri Lanka",
      capital: "Colombo", pv: "ca. 22 mio.", people: "ca. 22 millioner", ps: "toogtyve millioner",
      cur: "Srilankansk rupee", curSay: "srilankanske rupee", lang: "Singalesisk og tamil", langSay: "singalesisk og tamil",
      hello: { text: "Ayubowan", say: "ajubowan" },
      intro: "Sri Lanka er en ø i Det Indiske Ocean, lige syd for Indien. Øen ligner en dråbe. Her er grønne bjerge, hvide strande og store tepladser. Mange børn i Sri Lanka taler tamil, og andre taler singalesisk.",
      m: ["🍵", "I Sri Lanka spiser man ris og karry med kokosmælk. Man spiser også hoppers, som er små skålformede pandekager. Og Sri Lanka er kendt for sin te, som hedder Ceylon-te."],
      o: ["🐘", "I Sri Lanka kan du se elefanter, som går i store flokke i nationalparkerne. Du kan også tage et tog gennem bjergene og se te-planter helt ud til horisonten."],
      s: ["😄", "I Sri Lanka siger man ayubowan på singalesisk. På tamil siger man vanakkam. Så hvis du kan tamil, kan du hilse på mange i Sri Lanka! Hvert år er der en stor fest med pyntede elefanter."],
      animals: ["elefant"]
    },
    // ---------- Nordamerika ----------
    {
      id: "us", cont: "nordamerika", name: "USA", emoji: "🇺🇸", i: "i USA",
      capital: "Washington D.C.", capSay: "Washington", pv: "ca. 335 mio.", people: "ca. 335 millioner", ps: "tre hundrede og femogtredive millioner",
      cur: "Amerikanske dollar", curSay: "amerikanske dollar", lang: "Engelsk", langSay: "engelsk",
      hello: { text: "Hello", say: "hellåu" },
      intro: "USA ligger i Nordamerika og er et kæmpestort land med mange stater. Her er høje bjerge, store ørkener, lange strande og store byer. Her bor både bjørne og alligatorer. Hovedstaden hedder Washington. Man taler engelsk, og man elsker sport.",
      m: ["🍔", "I USA spiser man burgere og pommes frites. Man spiser pandekager med sirup til morgenmad. Man kan også få popcorn i biografen og en sød chokoladekage, som hedder brownie."],
      o: ["🗽", "I USA kan du se Frihedsgudinden i New York og høje skyskrabere. Du kan besøge Grand Canyon eller varme kilder, hvor vandet sprøjter højt op i luften. Og i Florida er der store forlystelsesparker."],
      s: ["🏀", "Basketball blev opfundet i USA for over hundrede år siden. De første kurve var rigtige frugtkurve, som man hang op på væggen. Amerikanerne siger hello, når de hilser."],
      animals: ["alligator", "havoern"]
    },
    {
      id: "ca", cont: "nordamerika", name: "Canada", emoji: "🇨🇦", i: "i Canada",
      capital: "Ottawa", pv: "ca. 40 mio.", people: "ca. 40 millioner", ps: "fyrre millioner",
      cur: "Canadiske dollar", curSay: "canadiske dollar", lang: "Engelsk og fransk", langSay: "engelsk og fransk",
      hello: { text: "Hello", say: "hellåu" },
      intro: "Canada ligger i den nordlige del af Nordamerika og er verdens næststørste land. Her er store skove, tusindvis af søer og høje bjerge. I nord er det iskoldt, og her bor både isbjørne og vaskebjørne. Hovedstaden hedder Ottawa.",
      m: ["🍁", "I Canada elsker man ahornsirup. Om foråret tapper man saften fra ahorntræerne og koger den til sirup. Man hælder den på pandekager. Det smager sødt og dejligt."],
      o: ["🌊", "I Canada ligger Niagara Falls, et af verdens mest kendte vandfald, som man kan sejle helt tæt på. Man kan også se isbjørne i nord og stå på ski i de høje bjerge."],
      s: ["🏒", "Canadierne elsker ishockey, og om vinteren leger mange børn på frosne søer. Bæveren er et kendt symbol for Canada. Og i Canada siger man hello og bonjour, når man hilser."],
      animals: ["isbjoern", "vaskebjoern"]
    },
    {
      id: "mx", cont: "nordamerika", name: "Mexico", emoji: "🇲🇽", i: "i Mexico",
      capital: "Mexico City", pv: "ca. 130 mio.", people: "ca. 130 millioner", ps: "hundrede og tredive millioner",
      cur: "Mexicanske pesos", curSay: "mexicanske pesos", lang: "Spansk", langSay: "spansk",
      hello: { text: "Hola", say: "ola" },
      intro: "Mexico ligger i det sydlige Nordamerika, lige syd for USA. Landet har varme strande, ørkener, vulkaner og regnskov. Her boede mayaerne og aztekerne for mange hundrede år siden. Her spiser man tacos og danser til fest. Hovedstaden hedder Mexico City.",
      m: ["🌮", "I Mexico spiser man tacos, som er bløde pandekager fyldt med kød og grønt. Man spiser også guacamole, en grøn dip lavet af avocado, og masser af bønner."],
      o: ["🏛️", "I Mexico kan du klatre op på gamle pyramider, som mayaerne byggede. Du kan bade i klart blåt vand ved kysten og se store sommerfugle, som flyver mange tusind kilometer."],
      s: ["🎉", "Til fødselsdage i Mexico slår børn til en piñata, en farvet figur fyldt med slik. Når den går i stykker, regner det med slik! Mexicanerne siger hola, når de hilser."],
      animals: ["kalkun"]
    },
    {
      id: "gl", cont: "nordamerika", name: "Grønland", emoji: "🇬🇱", i: "på Grønland",
      capital: "Nuuk", pv: "ca. 56 tusind", people: "ca. 56 tusind", ps: "seksoghalvtreds tusind",
      cur: "Danske kroner", curSay: "danske kroner", lang: "Grønlandsk og dansk", langSay: "grønlandsk og dansk",
      hello: { text: "Aluu", say: "aluu" },
      intro: "Grønland er verdens største ø og ligger i Nordatlanten, mellem Canada og Island. Det meste af landet er dækket af tyk is, og kun kysten er fri. Hovedstaden hedder Nuuk. Der bor langt færre mennesker end i København.",
      m: ["🐟", "På Grønland fanger fiskerne rejer og torsk i det kolde hav. Man spiser også tørret fisk og kød fra rensdyr. Om sommeren plukker man søde, blå bær."],
      o: ["🛷", "På Grønland kan du køre på en hundeslæde over sneen. Om vinteren danser nordlyset i grønne og lilla farver på himlen. Du kan også sejle forbi store isbjerge, som flyder i havet."],
      s: ["🏔️", "På Grønland er der ingen veje mellem byerne! Man rejser med båd, fly eller helikopter. Grønlænderne siger aluu, når de hilser."],
      animals: ["isbjoern"]
    },
    {
      id: "cr", cont: "nordamerika", name: "Costa Rica", emoji: "🇨🇷", i: "i Costa Rica",
      capital: "San José", pv: "ca. 5 mio.", people: "ca. 5 millioner", ps: "fem millioner",
      cur: "Colón", curSay: "colón", lang: "Spansk", langSay: "spansk",
      hello: { text: "Hola", say: "ola" },
      intro: "Costa Rica ligger i Mellemamerika, mellem Stillehavet og Det Caribiske Hav. Landet er lille, men fyldt med regnskov, vulkaner og strande. Navnet betyder den rige kyst. Her kan man møde dovendyr, aber og farverige papegøjer. Hovedstaden hedder San José.",
      m: ["🍚", "I Costa Rica spiser man ofte ris og bønner, som hedder gallo pinto. Man får det til morgenmad, med æg og stegt banan. Der vokser også kaffe og ananas."],
      o: ["🦥", "I Costa Rica kan du gå gennem regnskoven på høje hængebroer og se dovendyr, aber og farverige frøer. Du kan også se en vulkan og bade i varme kilder."],
      s: ["😄", "Pura vida betyder det rene liv. Folk i Costa Rica siger det til hinanden som hej, farvel og alt er godt. Man kan også sige hola. Det er et glad og roligt land."],
      animals: ["dovendyr"]
    },
    // ---------- Sydamerika ----------
    {
      id: "br", cont: "sydamerika", name: "Brasilien", emoji: "🇧🇷", i: "i Brasilien",
      capital: "Brasilia", pv: "ca. 210 mio.", people: "ca. 210 millioner", ps: "to hundrede og ti millioner",
      cur: "Real", curSay: "brasiliansk real", lang: "Portugisisk", langSay: "portugisisk",
      hello: { text: "Olá", say: "ola" },
      intro: "Brasilien er det største land i Sydamerika. Her ligger Amazonas, verdens største regnskov. Landet har lange strande, store byer og meget fodbold. Her bor både jaguarer og farverige papegøjer. Hovedstaden hedder Brasilia. I Brasilien taler man portugisisk, og ikke spansk.",
      m: ["🍫", "I Brasilien spiser man ris og sorte bønner i en gryde, som hedder feijoada. Man spiser også brigadeiro, som er små, bløde chokoladekugler. Det smager helt vildt godt!"],
      o: ["🏖️", "I Brasilien kan du sejle på Amazonfloden og se regnskoven. Du kan gå på Copacabana-stranden i Rio de Janeiro. Hvert år er der karneval med sang, dans og farvestrålende kostumer."],
      s: ["⚽", "Brasilien har vundet verdensmesterskabet i fodbold fem gange. Det er flere end noget andet land! Brasilianerne spiller fodbold overalt, på stranden, på gaden og i skolen. De siger olá, når de hilser."],
      animals: ["ara", "jaguar"]
    },
    {
      id: "ar", cont: "sydamerika", name: "Argentina", emoji: "🇦🇷", i: "i Argentina",
      capital: "Buenos Aires", pv: "ca. 46 mio.", people: "ca. 46 millioner", ps: "seksogfyrre millioner",
      cur: "Argentinske pesos", curSay: "argentinske pesos", lang: "Spansk", langSay: "spansk",
      hello: { text: "Hola", say: "ola" },
      intro: "Argentina ligger i den sydlige del af Sydamerika. Det er et langt og stort land med bjerge i vest og flade græssletter, som hedder pampas. Helt i syd er der gletsjere og kolde fjelde. Hovedstaden hedder Buenos Aires.",
      m: ["🥩", "I Argentina elsker man grillet kød, som hedder asado. Man spiser også empanadas, som er små bagte dejlommer med fyld, og søde kager med karamel."],
      o: ["🧊", "I Argentina kan du se en kæmpe gletsjer, som hedder Perito Moreno. Store stykker is falder af den og plasker i vandet. Du kan også se tango, en dans som er født i Buenos Aires."],
      s: ["🦕", "I Argentina har man fundet nogle af de største dinosaurer, der nogensinde har levet. Den hed Argentinosaurus og var omkring tredive meter lang. Og fodboldspilleren Lionel Messi er født i Argentina."],
      animals: ["flamingo"]
    },
    {
      id: "pe", cont: "sydamerika", name: "Peru", emoji: "🇵🇪", i: "i Peru",
      capital: "Lima", pv: "ca. 34 mio.", people: "ca. 34 millioner", ps: "fireogtredive millioner",
      cur: "Peruansk sol", curSay: "peruansk sol", lang: "Spansk og quechua", langSay: "spansk og quechua",
      hello: { text: "Hola", say: "ola" },
      intro: "Peru ligger i Sydamerika, langs Stillehavet. Landet har tre dele: en tør kyst, de høje Andesbjerge og en grøn regnskov. Her boede inkaerne for mange hundrede år siden. Her bor lamaer, og her ligger den berømte by Machu Picchu. Hovedstaden hedder Lima.",
      m: ["🥔", "I Peru findes mange tusind slags kartofler i rød, gul og lilla. Kartoflen kommer oprindeligt fra Andesbjergene. Man spiser også majs med kæmpestore kerner og drikker saft lavet af lilla majs."],
      o: ["🦙", "I Peru kan du besøge Machu Picchu, en gammel by i bjergene. Du kan møde lamaer og alpakaer med bløde pelse. Og du kan sejle på Titicaca-søen i en båd lavet af siv."],
      s: ["🎵", "I Peru findes en hund uden hår. Den hedder peruansk nøgenhund. Man spiller også smuk musik på panfløjte i bjergene. Når man hilser, siger man hola."],
      animals: ["lama", "ara"]
    },
    {
      id: "co", cont: "sydamerika", name: "Colombia", emoji: "🇨🇴", i: "i Colombia",
      capital: "Bogotá", pv: "ca. 52 mio.", people: "ca. 52 millioner", ps: "tooghalvtreds millioner",
      cur: "Colombianske pesos", curSay: "colombianske pesos", lang: "Spansk", langSay: "spansk",
      hello: { text: "Hola", say: "ola" },
      intro: "Colombia ligger i det nordlige Sydamerika og har kyst mod både Stillehavet og Det Caribiske Hav. Her er regnskov, høje bjerge og farverige byer. Landet er kendt for sine blomster og sin kaffe. Hovedstaden hedder Bogotá.",
      m: ["🫓", "I Colombia spiser man arepas, som er runde majsbrød fyldt med ost. Man spiser også masser af frisk frugt, som mango og passionsfrugt. Og landet er kendt for sin gode kaffe."],
      o: ["🌈", "I Colombia ligger en flod, som kaldes regnbuefloden, for den skifter til rødt, gult, grønt og blåt. I en dal vokser verdens højeste palmer, som er lige så høje som et tårn."],
      s: ["🌼", "I Colombia dyrker man mange blomster, og store blomsterfester fylder gaderne. Der bor flere slags fugle her end i noget andet land i verden! Colombianerne siger hola, når de hilser."],
      animals: ["ara", "jaguar"]
    },
    {
      id: "cl", cont: "sydamerika", name: "Chile", emoji: "🇨🇱", i: "i Chile",
      capital: "Santiago", pv: "ca. 20 mio.", people: "ca. 20 millioner", ps: "tyve millioner",
      cur: "Chilenske pesos", curSay: "chilenske pesos", lang: "Spansk", langSay: "spansk",
      hello: { text: "Hola", say: "ola" },
      intro: "Chile er et meget langt og smalt land i Sydamerika. Det ligger mellem Andesbjergene og Stillehavet. Mod nord er der en af verdens tørreste ørkener, og mod syd er der gletsjere. Her kan man se både sne og ørken. Hovedstaden hedder Santiago.",
      m: ["🥟", "I Chile spiser man empanadas, som er bagte dejlommer med kød, ost eller grønt. Man spiser også masser af fisk fra det lange hav. Og man dyrker søde druer."],
      o: ["🗿", "I Chile kan du se Påskeøens store stenhoveder, som hedder moai. Du kan kigge på stjerner i en ørken, hvor himlen er helt klar. Mod syd kan du se blå gletsjere og høje, spidse bjerge."],
      s: ["📏", "Chile er omkring fire tusind kilometer langt, men kun et par hundrede kilometer bredt. Det er som en lang, tynd pølse! Her kan man have både ørken og sne i samme land. Man siger hola."],
      animals: ["flamingo", "lama"]
    },
    // ---------- Australien og Oceanien ----------
    {
      id: "au", cont: "australien", name: "Australien", emoji: "🇦🇺", i: "i Australien",
      capital: "Canberra", pv: "ca. 26 mio.", people: "ca. 26 millioner", ps: "seksogtyve millioner",
      cur: "Australske dollar", curSay: "australske dollar", lang: "Engelsk", langSay: "engelsk",
      hello: { text: "G'day", say: "gedaj" },
      intro: "Australien ligger på den sydlige halvkugle, langt væk fra Danmark. Det er både et land og et helt kontinent. Her er røde ørkener, regnskov og lange strande. Hovedstaden hedder Canberra og ikke Sydney, som mange tror.",
      m: ["🍞", "I Australien spiser mange brød med vegemite, et tykt, sort og meget salt pålæg. Nogle elsker det, og andre synes, det er mærkeligt. Man spiser også lamingtons, som er kokoskager med chokolade."],
      o: ["🏄", "I Australien kan du bade og surfe på lange strande og snorkle ved Det Store Barriere-rev. Du kan se kænguruer hoppe rundt og se den røde sten Uluru midt i ørkenen."],
      s: ["🪃", "Aboriginerne fandt på bumerangen, som kan flyve tilbage til dig, hvis du kaster den rigtigt. I Australien kan man se kænguruer hoppe rundt på golfbaner! Og man siger g'day, når man hilser."],
      animals: ["kaenguru", "koala"]
    },
    {
      id: "nz", cont: "australien", name: "New Zealand", emoji: "🇳🇿", i: "på New Zealand",
      capital: "Wellington", pv: "ca. 5,2 mio.", people: "ca. 5,2 millioner", ps: "fem komma to millioner",
      cur: "Newzealandske dollar", curSay: "newzealandske dollar", lang: "Engelsk og maori", langSay: "engelsk og maori",
      hello: { text: "Kia ora", say: "kia ora" },
      intro: "New Zealand ligger i Stillehavet, sydøst for Australien. Landet består af to store øer med bjerge, vulkaner, grønne bakker og fjorde. Hovedstaden hedder Wellington. Her bor flere får end mennesker, og her bor den lille kiwifugl, som ikke kan flyve.",
      m: ["🥝", "New Zealand er kendt for lammekød og for masser af frisk fisk. Man spiser også kiwifrugter, som er grønne indeni og behårede udenpå."],
      o: ["🌋", "På New Zealand kan du se varme kilder og store geysere, der sprøjter vand højt op i luften. Du kan sejle i dybe fjorde og vandre i bjergene, hvor filmen Ringenes Herre blev filmet."],
      s: ["🏉", "Før de spiller rugby, danser newzealænderne en kraftig dans, som hedder haka. Maorierne, som er de første folk på New Zealand, fandt på den. Og man siger kia ora, når man hilser."],
      animals: ["kiwi"]
    },
    {
      id: "fj", cont: "australien", name: "Fiji", emoji: "🇫🇯", i: "på Fiji",
      capital: "Suva", pv: "ca. 900 tusind", people: "ca. 900 tusind", ps: "ni hundrede tusind",
      cur: "Fijiansk dollar", curSay: "fijiansk dollar", lang: "Engelsk og fijiansk", langSay: "engelsk og fijiansk",
      hello: { text: "Bula", say: "bula" },
      intro: "Fiji er en gruppe af omkring tre hundrede øer i Sydpacifik. Her er hvide strande, palmer og varmt, klart vand. Hovedstaden hedder Suva. Fijianerne er kendt for at være glade og venlige, og de siger bula, når de hilser.",
      m: ["🥥", "På Fiji spiser man kokosnødder, fisk og søde kartofler. Man laver også fisk med kokosmælk og lime. Man spiser tropisk frugt som ananas og papaya."],
      o: ["🏝️", "På Fiji kan du snorkle ved koralrev og se farverige fisk. Du kan sove i et hus på en lille ø og bade i varmt vand. Nogle steder kan man også se havskildpadder."],
      s: ["🏉", "Bula betyder liv og sundhed, og på Fiji siger man det med et stort smil til alle, man møder. Rugby er meget populært, og børn spiller det på stranden."],
      animals: ["havskildpadde"]
    },
    {
      id: "pg", cont: "australien", name: "Papua Ny Guinea", emoji: "🇵🇬", i: "i Papua Ny Guinea",
      capital: "Port Moresby", pv: "ca. 10 mio.", people: "ca. 10 millioner", ps: "ti millioner",
      cur: "Kina", curSay: "kina", lang: "Tok pisin, engelsk og mange hundrede sprog", langSay: "tok pisin, engelsk og mange hundrede andre sprog",
      hello: { text: "Halo", say: "halo" },
      intro: "Papua Ny Guinea ligger nord for Australien og fylder den østlige halvdel af øen Ny Guinea. Landet har tæt regnskov, høje bjerge og mange små øer. Hovedstaden hedder Port Moresby. Her taler man over otte hundrede sprog.",
      m: ["🍠", "I Papua Ny Guinea spiser man mange søde kartofler, som hedder kaukau. Man spiser også banan og kokosnød. Nogle steder laver man mad i et hul i jorden med varme sten."],
      o: ["🦜", "I Papua Ny Guinea lever paradisfugle med fantastiske, farverige fjer. Hannerne danser for at vise sig frem. I den tætte regnskov bor også trækænguruer, som klatrer i træerne."],
      s: ["🗣️", "I Papua Ny Guinea taler man over otte hundrede sprog, flere end i noget andet land! På tok pisin siger man halo, og tak hedder tenkyu."],
      animals: ["havskildpadde"]
    },
    // ---------- Antarktis: steder, ikke lande ----------
    {
      place: true, id: "pole", cont: "antarktis", name: "Sydpolen", emoji: "🧭",
      intro: "Sydpolen er det sted, der ligger allerlængst nede i bunden af jorden, midt i Antarktis. Her er der is, sne og vind. Kun forskere bor her i en lille station, og isen under dem er flere kilometer tyk.",
      tiles: [
        ["Jordens bund", "Sydpolen er det sted, der ligger helt nede i bunden af jorden."],
        ["Et lille punkt", "Sydpolen er kun et lille punkt, men rundt om den er der en endeløs, hvid slette af sne."],
        ["ca. minus 50 grader", "Her er det omkring minus halvtreds grader, når man tager hele året med, og om vinteren er det endnu koldere."],
        ["Ingen dyr", "Der bor ingen dyr lige ved Sydpolen, for det er alt for koldt og alt for langt fra havet."]
      ],
      o: ["🌀", "Ved Sydpolen står en lille stang med en blank kugle. Hvis man står lige ved den og drejer sig én gang rundt, har man været hele jorden rundt!"],
      f: ["🔬", "Forskere bor i en station, som står på høje ben, så sneen ikke dækker den. De måler vejret og kigger på stjernerne. Frisk mad kommer med fly."],
      s: ["🌅", "På Sydpolen er der kun én solopgang og én solnedgang om året! Solen står op i september og går ned i marts. Så det er dag i et halvt år og nat i et halvt år."],
      animals: []
    },
    {
      place: true, id: "halvoe", cont: "antarktis", name: "Antarktishalvøen", emoji: "🏔️",
      intro: "Antarktishalvøen er den del af Antarktis, der stikker langt ud mod Sydamerika. Her er det mildere end andre steder i Antarktis. Det er derfor, der bor mange pingviner, sæler og hvaler. Mange turister kommer med skib for at se dem.",
      tiles: [
        ["Halvø", "Antarktishalvøen er en lang halvø, der stikker ud som en finger mod Sydamerika."],
        ["Over 1.000 km lang", "Antarktishalvøen er mere end tusind kilometer lang."],
        ["ca. 0 grader om sommeren", "Her er det varmere end ved Sydpolen. Om sommeren er det omkring nul grader, og om vinteren er det omkring minus ti grader."],
        ["Pingviner, sæler og hvaler", "Her bor mange pingviner, sæler og hvaler."]
      ],
      o: ["🚤", "Her kan man sejle i en lille gummibåd mellem isbjerge og se pingviner springe i vandet. Nogle gange dukker en hval op helt tæt på båden."],
      f: ["🔬", "På halvøen bor der forskere i små stationer. De tæller pingviner og sæler for at se, om de har det godt. De har tykke, varme handsker på, når de skriver."],
      s: ["🪨", "Nogle pingviner bygger rede af små sten. Hvis en pingvin finder en rigtig fin sten, giver den den til en anden pingvin som en gave!"],
      animals: ["leopardsael", "spaekhugger"]
    },
    {
      place: true, id: "ross", cont: "antarktis", name: "Ross-ishylden", emoji: "🧊",
      intro: "Ross-ishylden er en kæmpe plade af flydende is ved kysten af Antarktis. Den er næsten lige så stor som Frankrig. Kanten er en lang væg af is, som er høj som et højhus. Her bor pingviner og sæler tæt på.",
      tiles: [
        ["Flydende is", "Ross-ishylden er en kæmpe plade af is, der flyder ovenpå havet."],
        ["Næsten som Frankrig", "Ross-ishylden er næsten lige så stor som hele Frankrig."],
        ["ca. minus 20 grader", "Her er det koldt hele året, ofte omkring minus tyve grader."],
        ["Pingviner og hvaler", "Her bor pingviner, sæler og hvaler, især ved kysten."]
      ],
      o: ["🧱", "Man kan stå ved kanten af ishylden og se en lang hvid væg af is, der er høj som et højhus. Nogle gange knækker store stykker af og bliver til isbjerge, som flyder rundt i havet."],
      f: ["🔬", "Tæt ved Ross-ishylden ligger forskerbyen McMurdo. Om sommeren bor der mange forskere, som studerer sæler, pingviner og isen. De kører rundt på store snescootere."],
      s: ["⛵", "Ross-ishylden er opkaldt efter James Clark Ross, som sejlede der med to skibe for næsten to hundrede år siden. Ishylden ligner et stort, hvidt bord, men den flyder faktisk!"],
      animals: ["kejserpingvin", "spaekhugger"]
    },
    {
      place: true, id: "vinson", cont: "antarktis", name: "Mount Vinson", emoji: "⛰️",
      intro: "Mount Vinson ligger i den vestlige del af Antarktis, i en bjergkæde som hedder Ellsworth-bjergene. Det er det højeste bjerg i hele Antarktis, næsten fem tusind meter højt. Det er dækket af sne og is.",
      tiles: [
        ["Bjerg", "Mount Vinson er det højeste bjerg i hele Antarktis."],
        ["ca. 4.900 meter højt", "Mount Vinson er næsten fem tusind meter højt."],
        ["ca. minus 30 grader", "Selv om sommeren er det omkring minus tredive grader, og vinden blæser hårdt."],
        ["Ingen dyr", "Der bor ingen dyr på bjerget. Der er kun sne, sten og is."]
      ],
      o: ["🎿", "Bjergbestigere kommer hertil fra hele verden, men kun nogle få klatrer helt til toppen. De flyver ind i et lille fly, som lander på isen, og går så videre på ski."],
      f: ["⛺", "Forskere og bjergbestigere sover i stærke telte, som kan klare hård vind. De har tykke soveposer og drikker varm kakao for at holde varmen. Brrr!"],
      s: ["✈️", "Bjerget var så godt gemt, at ingen kendte det før for omkring halvfjerds år siden. Så fik et fly øje på det fra luften! Tænk, hvis man var den første, der så det."],
      animals: []
    }
  ];

  const COUNTRIES = RAW.map((r) => (r.place ? buildPlace(r) : buildCountry(r)));

  // ---------- Flere lande: lette poster fra geo-<kontinent>.js (id, navn, hovedstad, tal, valuta, sprog, hilsen, historie) ----------
  const flagEmoji = (id) => [...id.toUpperCase()].map((ch) => String.fromCodePoint(0x1F1E6 + ch.charCodeAt(0) - 65)).join("");
  function buildLight(r) {
    const I = cap(r.i);
    return {
      id: r.id, cont: r.cont, kind: "country", name: r.name, emoji: flagEmoji(r.id),
      capital: r.capital, people: r.pv, currency: r.cur, language: r.lang,
      hello: r.hello || null, intro: r.intro, introFile: `${r.id}-intro`,
      tiles: [
        { key: "capital", icon: "🏙️", label: "Hovedstad", value: r.capital, say: `Hovedstaden ${r.i} hedder ${r.capSay || r.capital}.`, file: `${r.id}-capital` },
        { key: "people", icon: "👨‍👩‍👧", label: "Indbyggere", value: r.pv, say: `${I} bor der omkring ${r.ps} mennesker.`, file: `${r.id}-people` },
        { key: "currency", icon: "💰", label: "Valuta", value: r.cur, say: `${I} betaler man med ${r.curSay}.`, file: `${r.id}-currency` },
        { key: "language", icon: "🗣️", label: "Sprog", value: r.lang, say: `${I} taler man ${r.langSay}.`, file: `${r.id}-language` }
      ],
      specials: [],
      animals: [],
      light: true
    };
  }
  const MORE_NAMES = ["europa", "afrika", "asien", "nordamerika", "sydamerika", "australien"];
  const MORE_PRON = {};
  const globalScope = typeof self !== "undefined" ? self : {};
  for (const name of MORE_NAMES) {
    let part = null;
    if (typeof module === "object" && module.exports) {
      try { part = require(`./geo-${name}.js`); } catch (error) { if (error.code !== "MODULE_NOT_FOUND") throw error; }
    } else {
      part = globalScope[`TalbasketGeo${name.charAt(0).toUpperCase()}${name.slice(1)}`] || null;
    }
    if (!part) continue;
    for (const row of part.rows) COUNTRIES.push(buildLight(row));
    Object.assign(MORE_PRON, part.pron || {});
  }
  const seenIds = new Set();
  for (const c of COUNTRIES) {
    if (seenIds.has(c.id)) throw new Error(`geo: id bruges to gange: ${c.id}`);
    seenIds.add(c.id);
  }
  const ids = COUNTRIES.map((c) => c.id);
  const byId = {};
  for (const c of COUNTRIES) byId[c.id] = c;

  // Udtale til lydgeneratoren (kun den talte tekst). Længste nøgle først, så "Mexico City" rammes før "Mexico".
  const PRON_RAW = {
    "Mexico City": "Meksiko Siti", "Mexico": "Meksiko", "mexicanske": "meksikanske",
    "Costa Rica": "Kosta Rika", "colón": "kolon", "San José": "San Hose",
    "New Zealand": "Nju Ziland", "newzealandske": "njuzilandske", "newzealænderne": "njuzilænderne",
    "Papua Ny Guinea": "Papua Ny Ginea", "Port Moresby": "Port Moresbi", "tok pisin": "tåk pisin", "tenkyu": "tenkju",
    "Mount Vinson": "Maunt Vinsen", "Mount Everest": "Maunt Everest", "Machu Picchu": "Matsju Piktsju",
    "Rio de Janeiro": "Rio de Sjaneiro", "Buenos Aires": "Buenos Ajres", "brasiliansk real": "brasiliansk reaal",
    "New Delhi": "Nju Deli", "indiske rupee": "indiske rupi", "srilankanske rupee": "sri lankanske rupi",
    "New York": "Nju Jårk", "Grand Canyon": "Grand Kanjon", "Colorado": "Kolorado", "Niagara Falls": "Najagara Fålls",
    "London Eye": "London Aj", "Tour de France": "Tur de Frans", "James Clark Ross": "Dsjejms Klark Ross",
    "Lionel Messi": "Lajonel Messi", "Chichén Itzá": "Tjitjen Itsa", "Taj Mahal": "Tadsj Mahal",
    "Colosseum": "Kolosseum", "Kilimanjaro": "Kilimandjaro", "Victoriafaldene": "Viktoriafaldene",
    "Tanzania": "Tansania", "Giza": "Gisa",
    "Sydney": "Sidney", "Canberra": "Kanberra", "Washington": "Wåshington", "USA": "U Es A",
    "Canada": "Kanada", "canadiske": "kanadiske", "Ottawa": "Otawa", "Kenya": "Kenja", "kenyanske": "kenjanske",
    "Nairobi": "Najrobi", "Beijing": "Bejdsjing", "Tokyo": "Tokio", "Fiji": "Fidji", "fijiansk": "fidjiansk",
    "Thailand": "Tajland", "Colombia": "Kolombia", "colombianske": "kolombianske", "Colombianerne": "Kolombianerne",
    "Colombo": "Kolombo", "Chile": "Tjile", "chilenske": "tjilenske", "Bogotá": "Bogota", "Nuuk": "Nuk",
    "McMurdo": "Mekmørdo", "Ellsworth": "Elsvørt", "Titicaca": "Titikaka",
    "bonjour": "bongsjur", "baguettes": "bagetter", "croissant": "kroasang", "Louvre": "Luvr",
    "ciao": "tjau", "gelato": "dsjelato", "yassou": "jasu", "souvlaki": "suvlaki", "koshari": "kosjari",
    "jambo": "djambo", "chapati": "tjapati", "braai": "brai", "biltong": "biltång", "tagine": "tadjin",
    "hello": "hellåu", "pad thai": "pad taj", "Songkran": "Sångkran", "Ceylon": "Seilon", "hoppers": "hopers",
    "ayubowan": "ajubowan", "quechua": "ketsjua", "piñata": "pinjata", "guacamole": "gvakamole", "tacos": "takos",
    "feijoada": "fejsjoada", "brigadeiro": "brigadejro", "Shinkansen": "Sjinkansen", "Fuji": "Fudji",
    "konnichiwa": "konnitsjiwa", "sawasdee": "sawatdi", "ni hao": "ni hau", "olá": "ola", "hola": "ola",
    "g'day": "gedaj", "moai": "moaj", "joey": "dsjoi", "vegemite": "vedjemajt", "gallo pinto": "gajo pinto",
    "Pura vida": "Pura bida", "Big Ben": "Bigg Benn"
  };
  const PRON = {};
  Object.assign(PRON_RAW, MORE_PRON);
  Object.keys(PRON_RAW).sort((a, b) => b.length - a.length).forEach((k) => { PRON[k] = PRON_RAW[k]; });

  // Alle talte tekster og deres filnavne. Fejl her opdages med det samme, når filen indlæses.
  const clips = [];
  const fileOf = new Map();
  const usedFiles = new Set();
  function addClip(text, file) {
    if (typeof text !== "string" || !text.trim()) throw new Error(`geo: tom tekst (${file})`);
    if (typeof file !== "string" || !file) throw new Error(`geo: filnavn mangler for "${text.slice(0, 30)}"`);
    if (!/^[a-z0-9-]+$/.test(file)) throw new Error(`geo: ugyldigt filnavn ${file}`);
    if (usedFiles.has(file)) throw new Error(`geo: filnavn bruges to gange: ${file}`);
    if (fileOf.has(text)) throw new Error(`geo: samme tekst har to filer: ${file}`);
    usedFiles.add(file);
    fileOf.set(text, `${file}.mp3`);
    clips.push(text);
  }
  for (const c of CONTINENTS) {
    addClip(c.intro, c.introFile);
    c.facts.forEach((f) => addClip(f.text, f.file));
    c.animals.forEach((a) => addClip(a.fact, a.file));
    c.landmarks.forEach((l) => addClip(l.fact, l.file));
  }
  for (const c of COUNTRIES) {
    addClip(c.intro, c.introFile);
    c.tiles.forEach((t) => addClip(t.say, t.file));
    c.specials.forEach((s) => addClip(s.text, s.file));
    // Hilsen på landets sprog (stavet, så den danske stemme siger den nogenlunde rigtigt)
    if (c.hello) {
      c.helloFile = `${c.id}-hej`;
      c.helloLine = `I ${c.name} siger man ${c.hello.say}.`;
      addClip(c.helloLine, c.helloFile);
    }
    // Geografi-skud: spørgsmålet læses højt. Lette lande (uden eget klip) bruger enhedens stemme.
    if (c.kind === "country") {
      c.q = {
        flag: { text: `Hvilket flag har ${c.name}?`, file: `${c.id}-sp-flag` },
        capital: { text: `${c.capital} er hovedstaden i hvilket land?`, file: `${c.id}-sp-capital` },
        currency: { text: `Hvilket land bruger ${c.currency.toLowerCase()}?`, file: `${c.id}-sp-currency` }
      };
      if (c.light) {
        for (const q of Object.values(c.q)) q.file = null;
      } else {
        // Samme spørgsmål (fx om euro) deler ét klip
        for (const q of Object.values(c.q)) {
          if (fileOf.has(q.text)) q.file = fileOf.get(q.text).replace(/\.mp3$/, "");
          else addClip(q.text, q.file);
        }
      }
    }
  }

  const continent = (id) => CONTINENTS.find((c) => c.id === id) || null;
  const country = (id) => byId[id] || null;
  const countriesOf = (contId) => COUNTRIES.filter((c) => c.cont === contId);
  function findIn(listName, id) {
    for (const c of CONTINENTS) {
      const hit = c[listName].find((x) => x.id === id);
      if (hit) return Object.assign({}, hit, { cont: c.id });
    }
    return null;
  }
  const animal = (id) => findIn("animals", id);
  const landmark = (id) => findIn("landmarks", id);

  const allClips = () => clips.slice();
  const clipFile = (text) => fileOf.get(text);
  const allFiles = () => [...fileOf.values()];

  return { continents: CONTINENTS, countries: COUNTRIES, pron: PRON, byId, ids, continent, country, countriesOf, animal, landmark, allClips, clipFile, allFiles };

});
