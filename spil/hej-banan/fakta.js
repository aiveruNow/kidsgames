// Fakta om junglernes dyr til Hej Banan: danske tekster, latinske navne og kendetegn.
// Teksten ("tekst") er præcis det, Christel siger i lydklippet lyd/<id>.mp3, og den vises også i dyrebogen.
// Spillet, service workeren (sw.js) og lydgeneratoren (lydvaerktoej/lav-lyd.mjs hej-banan) bruger denne ene fil.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.BananFakta = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // latin = videnskabeligt navn, str = størrelse, lever = hvor dyret bor, tegn = sådan kender du det
  const F = {
    // ---------- Amazonas ----------
    ara: { latin: "Ara macao", str: "80–90 cm", lever: "Regnskov i Amazonas, Sydamerika", tegn: ["Skarpt rød krop", "Gule og blå vingefjer", "Stort, kraftigt næb"],
      tekst: "Den røde ara er en af regnskovens mest farverige fugle, med røde, gule og blå fjer. Dens næb er så stærkt, at det kan knække hårde nødder, og foden bruger den som en hånd til at holde på maden. Ara-par holder ofte sammen hele livet. De skriger så højt, at man hører dem længe, før man ser dem." },
    tukan: { latin: "Ramphastos toco", str: "55–65 cm", lever: "Skov og skovbryn i Sydamerika", tegn: ["Kæmpestort, orange næb", "Sort krop med hvid hals", "Blå ring om øjet"],
      tekst: "Tukanens næb er så stort, at det næsten ser for tungt ud. Men det er let, fordi det er næsten hult indeni. Fuglen bruger det til at række ud efter frugt på de tynde grene, og det hjælper den også med at komme af med varme. Tukaner bor i huller i træerne og flyver kun korte stykker ad gangen. Man kan kende dem på de lave, kvækkende kald." },
    dovendyr: { latin: "Bradypus variegatus", str: "50–60 cm", lever: "Regnskov i Sydamerika", tegn: ["Langsom, hænger i træer", "Tre lange kløer på hver fod", "Mørk stribe over øjnene"],
      tekst: "Dovendyret bevæger sig så langsomt, at der vokser grønne alger i dets pels. Det hænger med hovedet nedad i træerne og spiser blade, som giver meget lidt energi. Derfor er det ikke dovent, det sparer bare på kræfterne. Kun omkring en gang om ugen kravler det ned på jorden. Og så kan det faktisk svømme." },
    morfo: { latin: "Morpho menelaus", str: "Vingefang 12–15 cm", lever: "Regnskov i Sydamerika", tegn: ["Skinnende metalblå vinger", "Stor sommerfugl", "Brun underside med øjepletter"],
      tekst: "Den blå morfo-sommerfugl glimter metalblå, når den flyver gennem skoven. Farven kommer ikke fra maling, men fra bittesmå skæl på vingerne, som kaster lyset tilbage. På undersiden er vingerne brune med pletter som øjne, så sommerfuglen næsten forsvinder, når den lander. Den drikker saft fra overmoden frugt." },
    jaguar: { latin: "Panthera onca", str: "1,2–1,8 m", lever: "Regnskov og sump i Sydamerika", tegn: ["Gylden pels med sorte roser", "Kraftig, muskuløs kat", "Stort hoved"],
      tekst: "Jaguaren er Amerikas største kat og en fremragende jæger. Den kan lide vand og både svømmer og fisker, og dens bid er utroligt kraftigt. Pelsen har pletter formet som roser, ofte med en lille plet i midten. Jaguaren går alene og næsten lydløst gennem skoven, så hold dig højt oppe i træerne, når den er i nærheden." },
    harpyoern: { latin: "Harpia harpyja", str: "Vingefang op til 2 m", lever: "Regnskov i Mellem- og Sydamerika", tegn: ["Gråt hoved med to fjerspidser", "Sort bånd over brystet", "Enorme kløer"],
      tekst: "Harpyørnen er en af verdens største og stærkeste ørne. Dens kløer er næsten lige så store som en bjørns, og på hovedet har den fjer, som kan rejse sig som en krone. Den svæver gennem skoven og snupper dovendyr og aber fra grenene. Harpyørnen er en fremragende jæger, så hold dig tæt ind til stammen, når du ser den." },
    anakonda: { latin: "Eunectes murinus", str: "4–6 m", lever: "Floder og sumpe i Sydamerika", tegn: ["Meget tyk, grøn slange", "Sorte pletter langs ryggen", "Øjne og næse øverst på hovedet"],
      tekst: "Anakondaen er en af verdens største slanger, og den er tyk som et lår. Den bruger det meste af tiden i vandet, hvor den kan ligge med kun øjne og næsebor over overfladen. Den er ikke giftig, men snor sig om sit bytte og klemmer. Ungerne bliver født levende, ikke i æg. Hold afstand til vandet og de lave grene." },
    fuglespider: { latin: "Theraphosa blondi", str: "Benspænd op til 30 cm", lever: "Regnskovens bund i det nordlige Sydamerika", tegn: ["Meget stor og behårede ben", "Brun, kraftig krop", "Stærke fortænder"],
      tekst: "Goliat-fuglespideren er en af verdens største edderkopper, og med benene spredt kan den fylde en hel middagstallerken. Den spiser mest insekter og orme og sidder ofte i et hul i jorden. Er den bange, hvæser den ved at gnide benene mod hinanden og sparker små, kløende hår af. Hold god afstand, den bider kun for at forsvare sig." },
    giftfroe: { latin: "Dendrobates tinctorius", str: "3–5 cm", lever: "Regnskov i det nordlige Sydamerika", tegn: ["Skinnende blå hud", "Sorte pletter", "Lille frø med klæbrige tæer"],
      tekst: "Den blå pilegiftfrø er lille, men dens skarpe farve siger til rovdyrene: Spis mig ikke! Giften i huden kommer fra de myrer og andre små dyr, den selv spiser. Navnet kommer af, at folk i skoven engang smurte giften fra nogle af dens slægtninge på pilespidser. Hannen bærer haletudserne på ryggen hen til vandet. Frøen er giftig at røre ved, så hold afstand." },

    // ---------- Congo ----------
    graa_papegoeje: { latin: "Psittacus erithacus", str: "30–35 cm", lever: "Regnskov i Congo og Vestafrika", tegn: ["Grå krop", "Skarp rød hale", "Hvid hud om øjnene"],
      tekst: "Den grå papegøje er en af verdens bedste til at efterligne lyde. I naturen kopierer den fløjt og kald fra andre fugle, og nogle lærer også at sige mange menneskeord. Den er meget klog og lever i store flokke. Om aftenen samles de ofte i de samme sovetræer. Den kan kendes på den røde hale, som lyser op mod den grå krop." },
    turako: { latin: "Corythaeola cristata", str: "70–75 cm", lever: "Regnskov i Congo og Centralafrika", tegn: ["Blågrå krop med fjerkam", "Gult næb med rød spids", "Lang, bred hale"],
      tekst: "Den blå turako er en stor fugl med en fjerkam på hovedet som en lille krone. Den er ikke så god til at flyve, så den hopper og løber rundt i grenene. Den spiser mest frugt og blade, og dens høje, rullende kald høres langt gennem skoven. Den har et gult næb med en rød spids, så den er let at kende i løvet." },
    kamaeleon: { latin: "Chamaeleo dilepis", str: "25–35 cm", lever: "Skov og buskads i Afrika", tegn: ["Grøn eller brun, skælklædt krop", "Øjne, der drejer hver for sig", "Rullet hale"],
      tekst: "Kamæleonens øjne kan kigge hver sin vej på samme tid, så den ser både frem og tilbage uden at dreje hovedet. Når den får øje på en græshoppe, skyder den den lange, klistrede tunge ud som en elastik. Den skifter farve, men mest for at vise, hvordan den har det, og for at holde varmen. Den bruger sin hale som en femte hånd." },
    bonobo: { latin: "Pan paniscus", str: "70–85 cm", lever: "Regnskov i Congo, Afrika", tegn: ["Sort ansigt og røde læber", "Slank krop og lange arme", "Hår med skilning midt på hovedet"],
      tekst: "Bonoboen er en af vores nærmeste slægtninge og ligner chimpansen, men er slankere. Den har sort ansigt, røde læber og hår med en skilning midt på hovedet. Bonoboer bor kun i Congo og er kendt for at være fredelige. De deler gerne mad og løser ofte uenigheder med kram og leg i stedet for slagsmål. Hunnerne har stor indflydelse i flokken." },
    leopard: { latin: "Panthera pardus", str: "1–1,9 m", lever: "Skove og savanne i Afrika og Asien", tegn: ["Gylden pels med sorte roser", "Slank, stærk kat", "Lange knurhår"],
      tekst: "Leoparden er en fremragende klatrer og en stille jæger. Den kan trække et stort bytte op i et træ, så andre dyr ikke tager det. Pelsen har pletter som roser, og en sort panter er faktisk en leopard med mørk pels. Leoparden er fremragende til at snige sig ind på byttet og jager mest om natten, så hold dig oppe i grenene og vær helt stille." },
    kronoern: { latin: "Stephanoaetus coronatus", str: "Vingefang 1,5–1,8 m", lever: "Regnskov i Afrika", tegn: ["Fjerkrone på hovedet", "Brune og hvide striber på maven", "Korte, brede vinger"],
      tekst: "Kroneørnen er en af Afrikas stærkeste ørne og jager aber højt oppe i træerne. Den har korte, brede vinger og en lang hale, så den kan svinge mellem grenene. På hovedet har den fjer, som kan rejse sig som en krone. Den bygger en kæmpestor rede af grene og bruger den år efter år. Kroneørnen er en dygtig jæger, så se dig for oppefra." },
    groen_mamba: { latin: "Dendroaspis (slægt)", str: "1,5–2,5 m", lever: "Skov og træer i Afrika", tegn: ["Slank, grøn slange", "Lille, smalt hoved", "Lever i træerne"],
      tekst: "Den grønne mamba er en slank slange, som næsten er usynlig mellem bladene. Den er hurtig og lever i træerne, hvor den jager fugle, æg og små pattedyr. Den er giftig, men genert og vil helst undgå mennesker. Den bruger kun giften, når den føler sig truet. Dens grønne farve gør, at man let overser den, så hold afstand og stå stille, hvis du ser en." },
    haermyre: { latin: "Dorylus (slægt)", str: "Op til 1 cm", lever: "Regnskov og savanne i Afrika", tegn: ["Små, mørke myrer i lange rækker", "Store kæber", "Ingen fast rede"],
      tekst: "Hærmyrer har ikke noget fast hjem. De vandrer rundt i lange rækker med millioner af myrer, som en hel hær. Soldaterne har store kæber og står på vagt langs rækken, mens de andre finder insekter og små dyr på skovbunden. Hærmyrerne er ikke onde, de er bare sultne. Men gå uden om dem, for de bider, hvis man står i vejen." },
    tsetse: { latin: "Glossina (slægt)", str: "8–17 mm", lever: "Skov og savanne i Afrika", tegn: ["Brun flue, lidt større end husflue", "Vinger foldet som en saks", "Stikker efter blod"],
      tekst: "Tsetseflueen er en stikkende flue i Afrika. Den kan kendes på, at vingerne ligger oven på hinanden som en saks, når den sidder stille. Den drikker blod fra dyr og mennesker, og i nogle områder kan den smitte med en sygdom, der hedder sovesyge. En tsetsehun får kun én unge ad gangen, som hun føder som en larve. Slå ikke efter den, men gå væk." },

    // ---------- Borneo ----------
    naesehornsfugl: { latin: "Buceros rhinoceros", str: "90–110 cm", lever: "Regnskov på Borneo og i Sydøstasien", tegn: ["Kæmpenæb med et horn ovenpå", "Sort krop med hvid hale", "Orange-rødt horn"],
      tekst: "Næsehornsfuglen har et enormt næb med et let og næsten hult horn ovenpå. Når hunnen skal lægge æg, lukker hun sig inde i et hul i et træ med mudder, så kun en lille sprække er åben. Hannen fodrer hende og ungerne gennem sprækken. Så er æggene i sikkerhed for slanger og aber. Når fuglen flyver, kan man ofte høre vingerne suse." },
    flyverav: { latin: "Pteropus (slægt)", str: "Vingefang op til 1,5 m", lever: "Skove og kyster i Asien", tegn: ["Hoved som en rævs", "Store, læderagtige vinger", "Hænger med hovedet nedad"],
      tekst: "Flyveræven er ikke en ræv, men en stor flagermus med et hoved, der ligner en ræves. Om dagen hænger den med hovedet nedad i træerne sammen med mange andre. Om natten flyver den ud efter frugt og blomster. Den hjælper skoven, for den spreder frøene fra frugterne. De største kan have et vingefang på op til halvanden meter." },
    naesabe: { latin: "Nasalis larvatus", str: "55–75 cm", lever: "Mangrove og skov ved floder på Borneo", tegn: ["Meget stor næse hos hannen", "Rødbrun pels og rund mave", "Hvid hale"],
      tekst: "Næseaben har en kæmpestor næse, især hannerne, hvor den kan hænge ned over munden. Den bor langs floder og i mangroveskov på Borneo og er god til at svømme. Den har en rund mave, fordi den spiser mange blade, som tager lang tid at fordøje. Når den bliver ophidset, kan den lave høje, snøvlende lyde med næsen." },
    flyvedrage: { latin: "Draco volans", str: "20 cm", lever: "Regnskov i Sydøstasien", tegn: ["Lille, brunt firben", "Hudflapper langs siderne", "Gul hudlap under hagen"],
      tekst: "Flyvedragen er et lille firben, der kan svæve fra træ til træ. På siderne har den hud, som er spændt ud over lange ribben, så den kan folde den ud som vinger. Den flyver ikke ved at slå med dem, men glider gennem luften. Hannen har en gul hudlap under hagen, som han folder ud for at vise sig frem. Den spiser myrer." },
    skyleopard: { latin: "Neofelis diardi", str: "70–110 cm", lever: "Regnskov på Borneo og Sumatra", tegn: ["Skyformede pletter", "Meget lang hale", "Gråbrun pels"],
      tekst: "Skyleoparden har fået sit navn efter de skyformede pletter på pelsen. Den bor i træerne, og dens bøjelige ankler og lange hale gør, at den kan klatre ned ad stammen med hovedet først. Den har meget lange hjørnetænder, og den er en sky og sjælden kat. Hold øje med grenene over dig, men du ser den sjældent." },
    netpyton: { latin: "Malayopython reticulatus", str: "3–6 m", lever: "Regnskov og floder i Sydøstasien", tegn: ["Mønster som et net", "Meget lang, kraftig slange", "Gule og brune ruder"],
      tekst: "Netpytonen er en af verdens længste slanger og kan blive over seks meter lang. Dens mønster ligner et net og gør den næsten usynlig mellem blade og skygger. Den er ikke giftig, men snor sig om sit bytte og klemmer. Den er en god svømmer, og hunnen lægger sig rundt om sine æg for at holde dem varme. Hold afstand fra de lave grene." },
    slangeoern: { latin: "Spilornis cheela", str: "55–75 cm", lever: "Skov i Sydøstasien", tegn: ["Brun rovfugl med lille fjerkam", "Hvide pletter på brystet", "Gult ansigt"],
      tekst: "Slangeørnen sidder stille højt oppe i et træ og spejder efter bytte. Den spiser mest slanger, men også firben og frøer, som den fanger på jorden. På nakken har den en lille fjerkam. Dens kald er højt og klagende og kan høres langt væk gennem skoven. Hold dig under bladene, når den kredser over dig." },
    tusindben: { latin: "Spirostreptida (orden)", str: "15–30 cm", lever: "Regnskov i Afrika og Asien", tegn: ["Lang, rund, mørk krop", "Mange små ben", "Krøller sig sammen som en snegl"],
      tekst: "Tusindben har ikke tusind ben, men de store kan have flere hundrede. Hver kropsring har to par ben, og de bevæger sig i bølger. Når et kæmpe-tusindben bliver bange, krøller det sig sammen som en snegl og lader en lugtende væske sive ud, som kan irritere huden. Det spiser mest rådne blade. Rør det ikke, og vask hænder, hvis du kommer til det." },
    kaempehornet: { latin: "Vespa mandarinia", str: "3–5 cm", lever: "Skove i Asien", tegn: ["Stor gul og orange hveps", "Orange hoved", "Kraftige kæber"],
      tekst: "Kæmpehornetten er verdens største hveps og kan blive flere centimeter lang. Den har orange hoved og kraftige kæber og bor i store samfund i en rede, som den bygger af tygget træ. Den jager insekter og bier. Den angriber ikke uden grund, men den forsvarer sin rede kraftigt. Hold god afstand, hvis du hører den summe." },

    // ---------- Indien ----------
    paafugl: { latin: "Pavo cristatus", str: "Hanen op til 2 m med slæb", lever: "Skov og buskads i Indien", tegn: ["Blå hals og bryst", "Meget langt fjerslæb med øjne", "Lille fjerkam på hovedet"],
      tekst: "Påfuglen er hannen, og han har en af junglens smukkeste haler. Han kan folde sine lange, blå og grønne fjer ud som en kæmpe vifte med mange øjne og danse for hunnen. Hunnen er brun og grå. Påfuglen er Indiens nationalfugl. Om natten sover den højt oppe i træerne, og dens skrig høres langt væk." },
    parakit: { latin: "Psittacula krameri", str: "38–42 cm", lever: "Skove og byer i Indien og Afrika", tegn: ["Grøn papegøje med lang hale", "Rødt næb", "Sort og lyserød ring om halsen hos hannen"],
      tekst: "Halsbåndsparakitten er en grøn papegøje med lang hale. Hannen har en sort og lyserød streg om halsen, som et halsbånd. I Indien flyver den rundt i store flokke, som skriger højt. Den er så tilpasningsdygtig, at den også lever vildt i mange byer, helt op i Europa. Den bor i huller i træer og bygninger." },
    hanuman: { latin: "Semnopithecus entellus", str: "60–80 cm", lever: "Skove og templer i Indien", tegn: ["Grå pels og sort ansigt", "Meget lang hale", "Lange arme og ben"],
      tekst: "Hanuman-languren er opkaldt efter en abegud i Indien, og mange mennesker passer godt på den, fordi den er hellig. Den har grå pels, sort ansigt og en endnu længere hale end kroppen. Den spiser mest blade og har bakterier i maven, der hjælper med at fordøje dem. Den kan springe flere meter fra gren til gren." },
    kaempeegern: { latin: "Ratufa indica", str: "Op til 1 m med hale", lever: "Skov i Indien", tegn: ["Rødbrun og creme pels", "Meget stor, busket hale", "Store, runde ører"],
      tekst: "Kæmpeegernet er næsten lige så langt som en lille hund, når man regner halen med. Pelsen er rødbrun og creme, og den buskede hale hjælper den med at holde balancen. Den bor højt oppe i træerne og kan springe flere meter mellem grenene. Den spiser nødder, frugt og bark og bygger runde reder af grene og blade." },
    tiger: { latin: "Panthera tigris tigris", str: "2,5–3 m med hale", lever: "Skove og sumpe i Indien", tegn: ["Orange pels med sorte striber", "Hvid mave", "Stor, kraftig kat"],
      tekst: "Den bengalske tiger er verdens største kat. Dens striber er som fingeraftryk, for ingen tigre har de samme. Tigre er gode til at svømme og kan godt lide at ligge i vandet i varmen. De bor alene og jager mest i skumringen og om natten. Ser du striber mellem træerne, så vær helt stille og hold afstand." },
    kongekobra: { latin: "Ophiophagus hannah", str: "3–4 m", lever: "Skov i Indien og Sydøstasien", tegn: ["Lang, olivengrøn slange", "Kan brede en hætte ud", "Lyse bånd på kroppen"],
      tekst: "Kongekobraen er verdens længste giftslange og kan blive over tre meter lang. Den spiser mest andre slanger. Når den er truet, rejser den forkroppen og breder en hætte ud, og den kan brumme som en hund. Hunnen bygger en rede af blade til sine æg, det er den eneste slange, der gør det. Hold afstand." },
    ornoeugle: { latin: "Bubo bengalensis", str: "50–56 cm", lever: "Klipper og skov i Indien", tegn: ["Store, orange øjne", "To fjer som horn", "Gylden, plettet fjerdragt"],
      tekst: "Den bengalske ørneugle er en stor ugle med orange øjne og to fjer, der ligner horn, selvom de ikke er horn. Den jager om natten og flyver næsten lydløst, fordi dens fjer har bløde kanter. Den fanger mus, rotter og fugle. Om dagen sidder den ofte stille og sover mellem klipper eller i træer." },
    skorpion: { latin: "Heterometrus swammerdami", str: "10–20 cm", lever: "Skove og klipper i Indien og Asien", tegn: ["Sort, blank krop", "To store klosakse", "Hale med brod"],
      tekst: "Den asiatiske skovskorpion er sort og kraftig med to store klosakse og en lang hale med en brod. Den holder sig under sten og træ om dagen og jager insekter om natten. I ultraviolet lys lyser skorpioner blågrønt. Hunnen bærer sine små unger på ryggen. Den stikker kun, hvis den føler sig truet, så løft ikke sten i junglen." },
    kaempehonningbi: { latin: "Apis dorsata", str: "17–20 mm", lever: "Skove og klipper i Asien", tegn: ["Stor, gul-brun bi", "Kæmpe, åben vokskage", "Hænger i store sværme"],
      tekst: "Kæmpehonningbien bygger kun én stor vokskage, som hænger frit fra en gren eller en klippe, og den kan være mere end en meter bred. Hvis nogen kommer for tæt på, laver bierne bølger over kagens overflade, så det ser ud, som om hele kagen skælver. Bierne forsvarer deres bo, og de kan stikke, så hold god afstand og vær rolig." },

    // ---------- Sri Lanka ----------
    loris: { latin: "Loris tardigradus", str: "20–26 cm", lever: "Regnskov på Sri Lanka", tegn: ["Meget store, runde øjne", "Lille og slank, ingen hale", "Lange, tynde arme"],
      tekst: "Den slanke loris har kæmpestore øjne og er kun aktiv om natten. Den bevæger sig langsomt og lydløst gennem grenene og kan stå helt stille i lang tid. Så opdager byttet den ikke, før den pludselig snupper et insekt med hænderne. Den er sjælden og truet, fordi dens skov bliver mindre og mindre." },
    lilla_langur: { latin: "Semnopithecus vetulus", str: "50–70 cm", lever: "Regnskov på Sri Lanka", tegn: ["Mørk pels med lys krans om ansigtet", "Sort ansigt", "Lang hale"],
      tekst: "Den lilla-ansigtede langur bor kun på Sri Lanka og ellers ingen andre steder. Den har mørk pels og en lys krans af hår rundt om det mørke ansigt, som ligner et skæg. Den lever i flokke i træerne, spiser mest blade og frugt og kommer sjældent ned på jorden. Den er truet, fordi skoven bliver mindre." },
    junglehoene: { latin: "Gallus lafayettii", str: "35–70 cm", lever: "Skov på Sri Lanka", tegn: ["Orange og guldgul hane", "Rød kam med gult midterfelt", "Mørk hale"],
      tekst: "Den ceylonske junglehøne er Sri Lankas nationalfugl. Hanen er smuk med orange og gule fjer og en rød kam med en gul plet. Hønen er brun og meget mindre. De er i familie med de høns, vi kender fra gårdene, men de kan flyve op i træerne for at sove. Om dagen skraber de i bladene efter frø og insekter." },
    ceylonleopard: { latin: "Panthera pardus kotiya", str: "1–1,4 m", lever: "Skov og klipper på Sri Lanka", tegn: ["Gylden pels med sorte roser", "Kraftig kat", "Bor kun på Sri Lanka"],
      tekst: "Ceylonleoparden bor kun på Sri Lanka, og den er øens største rovdyr, fordi der hverken er tigre eller løver. Den jager hjorte og mindre dyr. Den kan ligge længe i træerne eller på klipperne og vente. Der er ikke mange tilbage, så den er meget vigtig for øen. Hold dig stille og oppe i træerne." },
    indisk_kobra: { latin: "Naja naja", str: "1–1,5 m", lever: "Skov og marker i Indien og Sri Lanka", tegn: ["Hætte med briller-tegning", "Brun eller gullig slange", "Rejser forkroppen"],
      tekst: "Den indiske kobra har et mønster på hætten, der ligner et par briller. Når den er truet, rejser den forkroppen og breder hætten ud som en advarsel. Den spiser mest rotter og mus, så den hjælper faktisk bønderne. Den er giftig, men vil helst undgå mennesker. Hold afstand, og lad den være." },
    hoegeoern: { latin: "Nisaetus kelaarti", str: "60–70 cm", lever: "Bjergskov på Sri Lanka", tegn: ["Brun og hvid rovfugl", "Lille fjerkam på hovedet", "Stribet bryst"],
      tekst: "Den ceylonske høgeørn bor i skoven på Sri Lanka. Den sidder ofte længe og stille højt oppe i et træ og spejder. Når den ser et bytte, styrter den hurtigt ned efter det. På hovedet har den en lille fjerkam. Den er en sjælden fugl, som kun få mennesker nogensinde ser. Den er en dygtig jæger, så kig op, hvis du hører et højt kald." },
    tretarantel: { latin: "Poecilotheria fasciata", str: "Benspænd 15–20 cm", lever: "Hule træer på Sri Lanka", tegn: ["Stor og behåret edderkop", "Grå og brune mønstre", "Stribede ben"],
      tekst: "Træ-tarantellen er en stor, behåret edderkop med et smukt mønster på kroppen og stribede ben. Den bor i hule træer og kommer ud om natten for at jage insekter. Den er hurtig og kan løbe lodret op ad træer. Dens bid kan være meget smertefuldt, men den bruger det kun til at forsvare sig. Hold afstand, hvis du ser den. Den er sjælden." },
    toque_makak: { latin: "Macaca sinica", str: "35–55 cm", lever: "Skove og byer på Sri Lanka", tegn: ["Brun pels med lys mave", "Hårvirvel på issen som en hue", "Rødligt ansigt"],
      tekst: "Toque-makakken bor kun på Sri Lanka. Dens navn kommer af hårene på toppen af hovedet, som ligger i en virvel og ligner en lille hue. Den har kindposer, hvor den kan gemme mad, mens den skynder sig væk. Den lever i store flokke og spiser frugt, blade og insekter. Du kan spille som Toque-makakken." },

    // ---------- Madagaskar ----------
    sifaka: { latin: "Propithecus verreauxi", str: "40–45 cm", lever: "Tørre skove på Madagaskar", tegn: ["Hvid pels med mørk hætte", "Lang hale", "Kraftige ben"],
      tekst: "Sifaka er en lemur, der danser! På jorden hopper den sidelæns på to ben med armene i vejret. I træerne springer den fra stamme til stamme og svæver flere meter gennem luften. Dens navn lyder ligesom dens kald. Den spiser blade, blomster og frugt og bor kun på Madagaskar. Den er hvid, så den er let at få øje på." },
    fingerdyr: { latin: "Daubentonia madagascariensis", str: "Krop 40 cm", lever: "Regnskov på Madagaskar", tegn: ["Meget langt, tyndt langfinger", "Store ører og store øjne", "Busket hale"],
      tekst: "Fingerdyret er en natlig primat med et utroligt langt, tyndt langfinger. Det banker på barken og lytter efter hulrum, hvor der bor larver. Så gnaver det et hul og fisker larven ud med fingeren. Det ligner en spætte! Fingerdyret har tænder, der bliver ved med at vokse, så de ikke slides væk, og store ører, som lytter efter larverne inde i træet." },
    panterkamaeleon: { latin: "Furcifer pardalis", str: "Hanner op til 50 cm", lever: "Skove på Madagaskar", tegn: ["Skarpe farver, blå og orange", "Rullet hale", "Små pletter og striber"],
      tekst: "Panterkamæleonen kan skifte farve fra grøn til rød, blå og orange, især når hannen vil imponere en hun eller skræmme en rival. Hannerne er meget farverigere end hunnerne. Hunnen graver sine æg ned i jorden, hvor ungerne senere klækkes. Panterkamæleonen findes kun på Madagaskar." },
    komet: { latin: "Argema mittrei", str: "Vingefang op til 20 cm", lever: "Regnskov på Madagaskar", tegn: ["Gule vinger", "Meget lange haler", "Øjepletter på vingerne"],
      tekst: "Kometsommerfuglen er egentlig en stor møl. Den har lange, smalle haler på bagvingerne, som ligner halen på en komet. Den voksne møl har ingen mund og kan slet ikke spise. Den lever kun omkring en uge, og det er nok til at finde en make. Hannen finder hunnen ved hjælp af duft med sine fjeragtige følehorn." },
    fossa: { latin: "Cryptoprocta ferox", str: "Krop 70–80 cm", lever: "Skove på Madagaskar", tegn: ["Slank, rødbrun krop", "Meget lang hale", "Stor, kattelignende hoved"],
      tekst: "Fossa er Madagaskars største rovdyr. Den ligner en lang, slank kat med en hale, der er næsten lige så lang som kroppen, men den er i familie med mangusterne. Den er så adræt, at den kan løbe med hovedet først ned ad en stamme og jage lemurer. Fossaen er en fremragende jæger, så hold dig højt oppe i grenene." },
    mad_boa: { latin: "Acrantophis madagascariensis", str: "2–3 m", lever: "Skove på Madagaskar", tegn: ["Brun med mørke mønstre", "Tyk og kraftig slange", "Skælklædt krop"],
      tekst: "Madagaskar-boaen er en stor slange, som ikke er giftig. Den snor sig om sit bytte og klemmer det, og jager mest om natten. Den ligger stille på skovbunden mellem bladene, hvor mønstrene gør den næsten usynlig. Ungerne bliver født levende. Boaen spiser mest små pattedyr og fugle, så hold dig oppe i grenene." },
    mad_hoenshoeg: { latin: "Accipiter henstii", str: "50–60 cm", lever: "Skove på Madagaskar", tegn: ["Gråbrun rovfugl", "Lang hale", "Korte, runde vinger"],
      tekst: "Madagaskar-hønsehøgen er en rovfugl, der bor i skovene på Madagaskar. Den har korte, runde vinger og en lang hale, så den kan flyve hurtigt mellem træerne. Den spiser blandt andet små lemurer, firben og fugle. Høgen sidder skjult i grenene og slår til pludseligt, så se dig for, hvis du hører bladene rasle." },
    tomatfroe: { latin: "Dyscophus antongilii", str: "6–10 cm", lever: "Vådområder på Madagaskar", tegn: ["Knaldrød, rund frø", "Fedtet krop", "Hunnen er størst"],
      tekst: "Tomatfrøen er rød som en moden tomat og rund som en. Når den bliver bange, puster den sig op og lader en klistret hvid slim sive ud af huden, som kan irritere et rovdyrs mund. Hunnen er størst og rødest, hannen er mindre og mere orange. Den bor kun på Madagaskar. Hold afstand, for slimen kan også irritere huden." },

    // ---------- Costa Rica ----------
    quetzal: { latin: "Pharomachrus mocinno", str: "Op til 1 m med halefjer", lever: "Tågeskov i Costa Rica og Mellemamerika", tegn: ["Skinnende grøn krop", "Rødt bryst", "Meget lange halefjer"],
      tekst: "Quetzal er en af verdens smukkeste fugle. Hannen skinner grøn som metal, har rødt bryst og to meget lange halefjer, der flagrer bag ham, når han flyver. Den bor i tågeskoven og bygger rede i et hul i et gammelt træ. Maya-folket regnede fuglen for hellig, og i Guatemala er den nationalfugl." },
    broleabe: { latin: "Alouatta palliata", str: "40–65 cm", lever: "Regnskov i Costa Rica og Mellemamerika", tegn: ["Sort pels med lys stribe på siden", "Kraftig underkæbe", "Lang, gribende hale"],
      tekst: "Brøleaben har en af de kraftigste stemmer blandt landdyr. Hannens brøl kan høres flere kilometer væk og lyder næsten som vinden i en stor skov. Den har en stor, hul knogle i halsen, som gør lyden endnu kraftigere. Brøleaber lever i flokke og spiser mest blade. Den bruger halen som en ekstra hånd, når den klatrer." },
    totaaet_dovendyr: { latin: "Choloepus hoffmanni", str: "60–70 cm", lever: "Regnskov i Costa Rica og Mellem- og Sydamerika", tegn: ["Brunlig pels, rundt ansigt", "To kløer på forbenene", "Hænger med hovedet nedad"],
      tekst: "Det totåede dovendyr har to lange kløer på hver forfod og hænger i træerne med hovedet nedad. Det er mest vågen om natten og sover meget om dagen. En unge klamrer sig til moderens mave og bliver båret rundt i skoven. Dovendyret spiser blade, blomster og frugt. Det bevæger sig så roligt, at ingen rovdyr lægger mærke til det." },
    loevfroe: { latin: "Agalychnis callidryas", str: "5–7 cm", lever: "Regnskov i Costa Rica og Mellemamerika", tegn: ["Store, røde øjne", "Grøn krop med blå sider", "Orange tæer"],
      tekst: "Den rødøjede løvfrø har store, røde øjne, som får rovdyr til at fare sammen. Om dagen sover den på et blad med benene foldet ind under sig, så den ligner et grønt blad. Om natten jager den insekter. Hunnen lægger sine æg på blade over vand, og når haletudserne klækkes, falder de ned i vandet." },
    puma: { latin: "Puma concolor", str: "1–1,5 m", lever: "Skove og bjerge i hele Amerika", tegn: ["Ensfarvet, gylden til brun pels", "Lang hale med sort spids", "Stor, slank kat"],
      tekst: "Pumaen er en stor, ensfarvet kat med mange navne, for eksempel bjergløve. Den kan springe flere meter op i luften og lige så langt frem. Den kan spinde som en huskat, men kan ikke brøle. Den lever i flere slags natur end næsten noget andet vildt landpattedyr i Amerika, fra Canada til det sydligste Sydamerika. Pas på, og hold dig højt oppe." },
    buskmester: { latin: "Lachesis stenophrys", str: "2–2,5 m", lever: "Regnskov i Costa Rica og Mellemamerika", tegn: ["Brun med mørke ruder", "Tyk, kraftig slange", "Lille, smalt hoved"],
      tekst: "Buskmesteren er en af de største giftslanger i Amerika. Den har to små gruber foran øjnene, som kan føle varme og hjælpe den med at finde bytte i mørke. Den ligger ofte helt stille på skovbunden og venter. Hunnen lægger æg og holder vagt over dem. Den er genert, men hold god afstand." },
    prydhoegeoern: { latin: "Spizaetus ornatus", str: "60–70 cm", lever: "Regnskov i Mellem- og Sydamerika", tegn: ["Fjerkam på hovedet", "Rødbrun hals", "Stribet mave"],
      tekst: "Prydhøgeørnen har en smuk fjerkam på hovedet og en rødbrun hals. Den flyver i toppen af regnskoven og jager fugle og små pattedyr. Den har korte, brede vinger, så den kan manøvrere mellem grenene. Den kalder højt og klart, når den flyver. Hold øje med den, hvis du hører et højt kald." },
    bananedderkop: { latin: "Phoneutria boliviensis", str: "Benspænd op til 15 cm", lever: "Regnskov i Costa Rica og Sydamerika", tegn: ["Brun og behåret edderkop", "Lange ben", "Rejser forbenene som en advarsel"],
      tekst: "Bananedderkoppen bygger ikke spind, men løber rundt om natten og jager insekter. Om dagen gemmer den sig gerne i bananer og hulrum. Hvis den bliver truet, rejser den forbenene som en advarsel. Den er giftig og bider, hvis den bliver generet. Hold god afstand og se dig for, når du rører ved frugt." },
    kuglemyre: { latin: "Paraponera clavata", str: "2,5–3 cm", lever: "Regnskov i Mellem- og Sydamerika", tegn: ["Stor, sort myre", "Kraftige kæber", "Bor ved roden af træer"],
      tekst: "Kuglemyren er en af verdens største myrer, og dens stik gør meget ondt i lang tid. Folk siger, at stikket føles, som om man blev ramt af en kugle, og derfor har den fået sit navn. Den bor i reder ved foden af store træer og går op i træerne om natten for at finde mad. Den stikker kun for at forsvare sig, så hold afstand." },

    // ---------- De otte spilbare aber ----------
    chimpanse: { latin: "Pan troglodytes", str: "Op til 1,5 m (stående)", lever: "Regnskov og savanne i Afrika", tegn: ["Sort pels og lyst ansigt", "Store, runde ører", "Ingen hale"],
      tekst: "Chimpansen bruger værktøj! Den stikker kviste ind i et termithul og trækker dem ud fuldt af termitter, og den knækker nødder med sten. Den er en menneskeabe uden hale og en af vores nærmeste slægtninge. Chimpanser griner, når de kildes, og de bor i store flokke med mange venner og slægtninge. Du kan spille som chimpansen." },
    doedningehovedabe: { latin: "Saimiri sciureus", str: "25–35 cm", lever: "Regnskov i Amazonas, Sydamerika", tegn: ["Hvid maske med sort snude", "Gullig ryg og lang hale", "Lille og livlig"],
      tekst: "Dødningehovedaben er en lille og livlig abe med et hvidt ansigt og en sort snude, som ligner et lille dødningehoved. Den bor i store flokke i Amazonas og spiser frugt og insekter. Den har en meget stor hjerne i forhold til sin størrelse og larmer med fløjt og kvidren, når den bevæger sig gennem skoven. Du kan spille som dødningehovedaben." },
    gorilla: { latin: "Gorilla gorilla", str: "1,2–1,8 m (stående)", lever: "Regnskov i Congo, Afrika", tegn: ["Meget stor og kraftig, sort pels", "Bred brystkasse", "Ingen hale"],
      tekst: "Gorillaen er den største af alle aber, men den er blid og spiser mest planter. Den slår sig på brystet for at vise, hvor stærk den er, men gør det sjældent for at skræmme. Hver aften bygger den en ny rede af blade til natten. Den ældste hanne i flokken har sølvgråt hår på ryggen. Du kan spille som gorillaen." },
    orangutang: { latin: "Pongo pygmaeus", str: "1,2–1,4 m", lever: "Regnskov på Borneo", tegn: ["Orange, langhåret pels", "Meget lange arme", "Hannen har store kinder"],
      tekst: "Orangutangens navn kommer fra malajisk og betyder skovens menneske. Den klatrer meget og har så lange arme, at de kan række næsten to meter fra hånd til hånd. Hver aften bygger den en ny seng af grene og blade højt oppe i et træ. Ungerne bliver hos moren i mange år. Du kan spille som orangutangen." },
    rhesusabe: { latin: "Macaca mulatta", str: "45–65 cm", lever: "Skove, marker og byer i Indien og Asien", tegn: ["Brun-grå pels", "Rødt ansigt og rød bagdel", "Kort hale"],
      tekst: "Rhesusaben er en klog og nysgerrig abe, der bor mange steder i Indien, både i skoven og ved templer og landsbyer. Den lever i store flokke og har kindposer, hvor den kan gemme mad, til den får tid til at spise. Den er også en god svømmer og går ikke af vejen for et bad. Forskere har lært meget af at studere dem. Du kan spille som Rhesusaben." },
    ringhalet_maki: { latin: "Lemur catta", str: "Krop 40–45 cm", lever: "Klippeskov og bjerge på Madagaskar", tegn: ["Hvid og sort stribet hale", "Grå krop og hvidt ansigt", "Sort omkring øjnene"],
      tekst: "Den ringhalede maki har en hale med tretten sorte og hvide ringe. Om morgenen sidder den med strakte arme og lader solen varme maven, som om den lavede yoga. Den bruger også halen til at sprede duft på rivaler, når den vil vinde en duftkamp. Makien er en lemur og bor i flokke ledet af hunnerne. Du kan spille som den ringhalede maki." },
    kapucinerabe: { latin: "Cebus capucinus", str: "33–45 cm", lever: "Regnskov i Costa Rica og Mellemamerika", tegn: ["Hvidt ansigt, bryst og skuldre", "Sort krop", "Lang, gribende hale"],
      tekst: "Kapucinerabens navn kommer af, at dens lyse ansigtsramme minder om en munkehætte. Den er en meget klog og nysgerrig abe, der bruger sin lange hale til at holde fast i grenene, og den spiser frugt, insekter og endda små dyr. Den lever i flokke og kan finde på de sjoveste ting. Du kan spille som kapucinerabe." }
  };

  // Velkomst til hver jungle (id = junglens id i arter.js)
  const VERDEN = {
    amazonas: "Velkommen til Amazonas. Det er verdens største regnskov og ligger i Sydamerika, hvor den store Amazonflod snor sig gennem træerne. Her bor flere slags dyr end næsten noget andet sted, fra farverige papegøjer og langsomme dovendyr til lydløse jaguarer og store slanger. Tryk på et dyr for at høre mere om det.",
    congo: "Velkommen til Congo. Det er Afrikas største regnskov og ligger midt i Afrika, omkring den mægtige Congoflod. Her bor gorillaer, chimpanser og bonoboer, og i træerne sidder papegøjer og kamæleoner, mens leoparder og ørne holder øje med alt. Tryk på et dyr for at høre mere om det.",
    borneo: "Velkommen til Borneo. Det er en kæmpestor ø i Asien, som tre lande deler, og den er dækket af gammel, tæt regnskov. Her bor orangutangerne, og her kan du møde flyvende ræve, store næsehornsfugle og stille slanger i grenene. Tryk på et dyr for at høre mere om det.",
    indien: "Velkommen til Indien. Her ligger de Vestlige Ghats, en lang bjergkæde med tæt skov langs kysten. Skovene er hjem for tigre og elefanter, og i træerne sidder aber, påfugle og papegøjer. Men pas på kobraerne og de små dyr, der kan stikke. Tryk på et dyr for at høre mere om det.",
    srilanka: "Velkommen til Sri Lanka. Det er en lille ø lige syd for Indien, men her bor utroligt mange slags dyr. Mange af dem findes slet ikke andre steder i verden, som ceylonleoparden og de lilla-ansigtede langurer. Hold også øje med slanger og store edderkopper. Tryk på et dyr for at høre mere om det.",
    madagaskar: "Velkommen til Madagaskar. Det er en kæmpestor ø i Det Indiske Ocean ud for Afrikas østkyst. Øen har været for sig selv i millioner af år, så mange af dyrene findes ingen andre steder, som lemurerne og kamæleonerne. Se også efter den hurtige fossa. Tryk på et dyr for at høre mere om det.",
    costarica: "Velkommen til Costa Rica. Det er et lille land i Mellemamerika med vulkaner og tågeskove højt oppe på bjergene. Skovene er ofte indhyllet i skyer, så alt er vådt og grønt, og her bor Quetzal, brøleaber og dovendyr. Tryk på et dyr for at høre mere om det."
  };

  // Ord, som stemmen sandsynligvis udtaler forkert: teksten skrives med det rigtige navn,
  // og lydgeneratoren erstatter ordet med udtalestavningen før oplæsning.
  const PRON = {
    "Quetzal": "Ketsal",
    "Fossa": "Fossa",
    "Sifaka": "Sifaka",
    "Aye-aye": "Ai-ai",
    "Toque": "Tåk",
    "Rhesus": "Resus",
    "Ceylon": "Sejlon",
    "Ceylonsk": "Sejlonsk",
    "Madagaskar-boa": "Madagaskar-boa",
    "Goliat": "Goliat",
    "Bonobo": "Bonobo",
    "Tsetse": "Tsetse",
    "Pilegiftfrø": "Pilegiftfrø",
    "Chimpanse": "Shimpanse",
    "chimpanse": "shimpanse",
    "Hanuman": "Hanuman",
    "Langur": "Langur",
    "Costa Rica": "Kosta Rika",
    "Congo": "Kongo",
    "Ghats": "Gats",
    "Brøleabe": "Brøleabe",
    "Kapucinerabe": "Kapucinerabe"
  };

  // Lydgeneratoren: alle sætninger, og hvilken fil hver sætning gemmes i
  const fileOf = new Map();
  for (const id of Object.keys(F)) fileOf.set(F[id].tekst, `${id}.mp3`);
  for (const id of Object.keys(VERDEN)) fileOf.set(VERDEN[id], `verden-${id}.mp3`);
  const allClips = () => [...fileOf.keys()];
  const clipFile = (text) => fileOf.get(text);
  const allFiles = () => [...fileOf.values()];

  return { fakta: F, verden: VERDEN, pron: PRON, allClips, clipFile, allFiles };
});
