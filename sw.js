const CACHE = "regnespil-v1.41.0";

// Listen over filer der gemmes til offline laves af tools\build-precache.mjs (kører i opdater.ps1)
importScripts("precache.js");
const FILES = self.PRECACHE;

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
