const CACHE = "regnespil-v1.21.0";
const FILES = [
  "./",
  "index.html",
  "menu.html",
  "topbar.js",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "spil/plus-minus.html",
  "spil/positionsvaerdi.html",
  "spil/tabeller.html",
  "spil/loeven-leo.html",
  "spil/aris-maal.html",
  "spil/dino-broen.html",
  "spil/prinsesse-tal.html",
  "spil/farvehaven.html"
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
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)).catch(() =>
      req.mode === "navigate" ? caches.match("index.html") : Response.error()
    )
  );
});
