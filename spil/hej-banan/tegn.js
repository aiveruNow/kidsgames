// Fælles tegnehjælp og register for alle dyr i Hej Banan (window.BananTegn).
// Hver dyrefil (dyr-*.js) registrerer sine tegnefunktioner ("kinds") og udseender ("looks") her.
//   BananTegn.addKind("cat", function (c, s, o) { ... })     tegnefunktion; s = udseendet (look), o = valg (se arter.js)
//   BananTegn.look("jaguar", "cat", { body: "#e0a030", ... }) hvordan netop denne art ser ud
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.BananTegn = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const PI2 = Math.PI * 2;
  const hx = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const mix = (c, t, k) => { const a = hx(c); const b = hx(t); return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const dk = (c, k = .3) => mix(c, "#000000", k);
  const lt = (c, k = .3) => mix(c, "#ffffff", k);

  // Et naturligt øje: hvid øjeæble med mørk kant, farvet regnbuehinde, pupil og to glans
  function eyeReal(c, x, y, r, iris, pupil) {
    c.fillStyle = "#f2efe4"; c.beginPath(); c.arc(x, y, r, 0, PI2); c.fill();
    c.strokeStyle = "rgba(10,16,24,.5)"; c.lineWidth = r * .16; c.stroke();
    const ir = r * .74;
    const g = c.createRadialGradient(x + r * .1, y, ir * .2, x + r * .1, y, ir);
    g.addColorStop(0, dk(iris || "#d9a93a", .35)); g.addColorStop(.7, iris || "#d9a93a"); g.addColorStop(1, dk(iris || "#d9a93a", .3));
    c.fillStyle = g; c.beginPath(); c.arc(x + r * .1, y, ir, 0, PI2); c.fill();
    c.fillStyle = pupil || "#080e16"; c.beginPath(); c.arc(x + r * .14, y, r * .42, 0, PI2); c.fill();
    c.fillStyle = "rgba(255,255,255,.95)"; c.beginPath(); c.arc(x - r * .16, y - r * .32, r * .22, 0, PI2); c.fill();
    c.fillStyle = "rgba(255,255,255,.6)"; c.beginPath(); c.arc(x + r * .34, y + r * .3, r * .09, 0, PI2); c.fill();
  }

  // Et mørkt, blankt øje uden hvidt (aber, frøer, insekter): kuppelformet med to glans
  function eyeDark(c, x, y, r, color) {
    const g = c.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r);
    g.addColorStop(0, lt(color || "#3a2a20", .35)); g.addColorStop(.6, color || "#1a120c"); g.addColorStop(1, "#05070a");
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI2); c.fill();
    c.fillStyle = "rgba(255,255,255,.92)"; c.beginPath(); c.arc(x - r * .32, y - r * .36, r * .26, 0, PI2); c.fill();
    c.fillStyle = "rgba(255,255,255,.5)"; c.beginPath(); c.arc(x + r * .3, y + r * .32, r * .1, 0, PI2); c.fill();
  }

  // Lineær og radial farveovergang med få ord: stops = [[0, "#fff"], [1, "#000"]]
  function lin(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); for (const [o, col] of stops) g.addColorStop(o, col); return g; }
  function rad(c, x, y, r0, r1, stops, fx, fy) { const g = c.createRadialGradient(fx === undefined ? x : fx, fy === undefined ? y : fy, r0, x, y, r1); for (const [o, col] of stops) g.addColorStop(o, col); return g; }

  // Rund, blød krop med lys fra øverst til venstre: bruges til "kuppel"-former (maver, hoveder, kinder)
  function dome(c, x, y, rx, ry, color, rot) {
    c.save(); c.translate(x, y); c.rotate(rot || 0);
    c.fillStyle = rad(c, 0, 0, 0, Math.max(rx, ry) * 1.1, [[0, lt(color, .32)], [.55, color], [1, dk(color, .38)]], -rx * .3, -ry * .35);
    c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, PI2); c.fill();
    c.restore();
  }

  const kinds = {}; // tegnefunktioner: kinds[navn](c, s, o)
  const looks = {}; // udseender: looks[id] = { kind, ...egenskaber }
  const addKind = (name, fn) => { kinds[name] = fn; };
  const look = (id, kind, props) => { looks[id] = Object.assign({ id, kind }, props); };

  return { PI2, hx, mix, dk, lt, eyeReal, eyeDark, lin, rad, dome, kinds, looks, addKind, look };
});
