const CACHE = "regnespil-v1.22.0";
const FILES = [
  "./",
  "index.html",
  "menu.html",
  "topbar.js",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "spil/plus-minus/plus-minus.html",
  "spil/positionsvaerdi/positionsvaerdi.html",
  "spil/tabeller/tabeller.html",
  "spil/loeven-leo/loeven-leo.html",
  "spil/aris-maal/aris-maal.html",
  "spil/dino-broen/dino-broen.html",
  "spil/prinsesse-tal/prinsesse-tal.html",
  "spil/farvehaven/farvehaven.html",
  ...[
    "du-valgte-blaa", "du-valgte-brun", "du-valgte-groen", "du-valgte-gul",
    "du-valgte-lilla", "du-valgte-lyseroed", "du-valgte-orange", "du-valgte-roed",
    "find-den-blaa-blomst", "find-den-brune-blomst", "find-den-groenne-blomst", "find-den-gule-blomst",
    "find-den-lilla-blomst", "find-den-lyseroede-blomst", "find-den-orange-blomst", "find-den-roede-blomst",
    "hvor-er-du-dygtig-tak-for-hjaelpen-siger-pjuske",
    "ja-nu-planter-pjuske-en-blaa-blomst", "ja-nu-planter-pjuske-en-brun-blomst",
    "ja-nu-planter-pjuske-en-groen-blomst", "ja-nu-planter-pjuske-en-gul-blomst",
    "ja-nu-planter-pjuske-en-lilla-blomst", "ja-nu-planter-pjuske-en-lyseroed-blomst",
    "ja-nu-planter-pjuske-en-orange-blomst", "ja-nu-planter-pjuske-en-roed-blomst"
  ].map((name) => `spil/farvehaven/lyd/${name}.mp3`)
];

// Hver fil caches for sig, så én manglende fil ikke vælter hele installationen
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.allSettled(FILES.map((f) => cache.add(new Request(f, { cache: "reload" })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache først, så spillene virker uden net. Eksterne kald (oplæsning) går direkte til nettet.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  // Fetch-handler: kald der eksplicit springer cache over (fx tjek af ny version) går direkte til nettet
  if (req.cache === "no-store" || req.cache === "reload") return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true })
      .then((hit) => (hit && req.headers.has("range") ? rangeResponse(hit, req) : hit || fetch(req)))
      .catch(() => (req.mode === "navigate" ? caches.match("index.html") : Response.error()))
  );
});

// Safari afspiller kun lyd fra cachen, hvis serveren svarer på Range-forespørgsler (206)
async function rangeResponse(hit, req) {
  const buffer = await hit.arrayBuffer();
  const match = /bytes=(\d*)-(\d*)/.exec(req.headers.get("range"));
  const start = match && match[1] ? Number(match[1]) : 0;
  const end = match && match[2] ? Math.min(Number(match[2]), buffer.byteLength - 1) : buffer.byteLength - 1;
  if (start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${buffer.byteLength}` } });
  return new Response(buffer.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Type": hit.headers.get("Content-Type") || "audio/mpeg",
      "Content-Range": `bytes ${start}-${end}/${buffer.byteLength}`,
      "Content-Length": String(end - start + 1)
    }
  });
}
