const CACHE = "regnespil-v1.28.1";

// Prinsesse Riyanas lydklip hentes fra samme replikliste som spillet bruger
let prinsesseClips = [];
try {
  importScripts("spil/prinsesse-tal/replikker.js");
  prinsesseClips = PrinsesseReplikker.allClips().map((text) => `spil/prinsesse-tal/lyd/${PrinsesseReplikker.clipFile(text)}`);
} catch (error) {
  console.warn("Kunne ikke læse replikkerne til Prinsesse Riyana.", error);
}

// Farvehavens lydklip hentes fra samme replikliste som spillet bruger
let clipFiles = [];
try {
  importScripts("spil/farvehaven/replikker.js");
  clipFiles = FarvehavenReplikker.allClips().map((text) => `spil/farvehaven/lyd/${FarvehavenReplikker.clipFile(text)}`);
} catch (error) {
  console.warn("Kunne ikke læse replikkerne til Farvehaven.", error);
}

// Urundais tamilske lydklip hentes fra samme ordliste som spillet bruger
let urundaiClips = [];
try {
  importScripts("spil/urundai/ord.js");
  urundaiClips = UrundaiOrd.allClips().map((c) => `spil/urundai/lyd/${UrundaiOrd.clipFile(c.id)}`);
} catch (error) {
  console.warn("Kunne ikke læse ordene til Urundai.", error);
}

// Løven Aris ordklip hentes fra samme ordliste som spillet bruger
let leoClips = [];
try {
  importScripts("spil/loeven-leo/ord.js");
  leoClips = LoevenOrd.allClips().map((word) => `spil/loeven-leo/lyd/${LoevenOrd.clipFile(word)}`);
} catch (error) {
  console.warn("Kunne ikke læse ordene til Løven Ari.", error);
}

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
  "spil/loeven-leo/ord.js",
  "spil/aris-maal/aris-maal.html",
  "spil/dino-broen/dino-broen.html",
  "spil/prinsesse-tal/prinsesse-tal.html",
  "spil/prinsesse-tal/replikker.js",
  "spil/farvehaven/farvehaven.html",
  "spil/farvehaven/replikker.js",
  "spil/urundai/urundai.html",
  "spil/urundai/ord.js",
  "spil/urundai/billeder.js",
  "spil/urundai/laengder.js",
  "spil/hej-haj/hej-haj.html",
  ...clipFiles,
  ...prinsesseClips,
  ...urundaiClips,
  ...leoClips
];

// Forsiden spørger, hvor mange filer der skal gemmes, så den kan vise offline-status
self.addEventListener("message", (event) => {
  if (event.data === "antal" && event.ports[0]) event.ports[0].postMessage(FILES.length);
});

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
