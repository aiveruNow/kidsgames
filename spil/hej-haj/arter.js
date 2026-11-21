// Havets verdener og arter til Hej Haj. Spillet og service workeren bruger denne ene fil.
// Alle dyr er rigtige arter med danske navne og point (1, 2, 5 eller 10). Tegningerne er lavet med lærredet (canvas), så de kan bevæge sig.
// draw(ctx, art, { r, t, angry, chomp }): tegner arten i midten (0,0), vendt mod +x. r = størrelsen i pixel.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.HajArter = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const PI2 = Math.PI * 2;
  const hx = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const mix = (c, t, k) => { const a = hx(c); const b = hx(t); return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const dk = (c, k = .3) => mix(c, "#000000", k);
  const lt = (c, k = .3) => mix(c, "#ffffff", k);

  // ---------- Mønstre på fisk ----------
  const B = (x, w, c, e) => ({ t: "band", x, w, c, e }); // lodret bånd
  const S = (y, h, c) => ({ t: "stripe", y, h, c }); // vandret stribe
  const D = (n, c, r) => ({ t: "dots", n, c, r }); // pletter
  const Z = (c) => ({ t: "zig", c }); // zigzag på ryggen

  function pattern(c, p, L, H) {
    if (p.t === "band") {
      c.fillStyle = p.e || "#111";
      c.fillRect(L * p.x - L * p.w * .68, -H * 1.4, L * p.w * 1.36, H * 2.8);
      c.fillStyle = p.c;
      c.fillRect(L * p.x - L * p.w * .5, -H * 1.4, L * p.w, H * 2.8);
    } else if (p.t === "stripe") {
      c.fillStyle = p.c;
      c.fillRect(-L, H * p.y - H * p.h / 2, L * 2, H * p.h);
    } else if (p.t === "dots") {
      c.fillStyle = p.c;
      for (let i = 0; i < p.n; i++) {
        const a = Math.sin(i * 12.9 + 1.3) * .5 + .5;
        const b = Math.sin(i * 78.2 + .7) * .5 + .5;
        c.beginPath(); c.arc(L * (-.65 + 1.3 * a), H * (-.7 + 1.4 * b), H * p.r, 0, PI2); c.fill();
      }
    } else if (p.t === "zig") {
      c.strokeStyle = p.c; c.lineWidth = H * .12; c.beginPath();
      for (let i = 0; i < 7; i++) { const x = L * (-.7 + i * .22); c.moveTo(x, -H * .95); c.lineTo(x + L * .13, -H * .15); }
      c.stroke();
    }
  }

  // ---------- Almindelige fisk (også hajer) ----------
  function bodyPath(L, H, pt) {
    const p = new Path2D();
    p.moveTo(L, 0);
    p.bezierCurveTo(L * .7, -H * 1.15 * pt, -L * .35, -H * 1.1, -L * .85, -H * .28);
    p.lineTo(-L * .85, H * .28);
    p.bezierCurveTo(-L * .35, H * 1.1, L * .7, H * 1.15 * pt, L, 0);
    p.closePath();
    return p;
  }

  function fish(c, s, o) {
    const L = s.len || 1;
    const H = s.h || .6;
    const t = o.t || 0;
    const fin = s.fin || dk(s.body, .3);
    c.lineJoin = c.lineCap = "round";
    // hale
    const tl = s.tl || .7;
    c.save(); c.translate(-L * .8, 0); c.rotate(Math.sin(t * 9) * .2);
    c.fillStyle = s.tailc || fin; c.beginPath();
    if (s.tail === "round") { c.moveTo(0, 0); c.quadraticCurveTo(-tl * .6, -H * 1.1, -tl, -H * .7); c.quadraticCurveTo(-tl * .7, 0, -tl, H * .7); c.quadraticCurveTo(-tl * .6, H * 1.1, 0, 0); }
    else if (s.tail === "lunate") { c.moveTo(0, 0); c.quadraticCurveTo(-tl * .3, -H * 1.3, -tl * 1.1, -H * 1.6); c.quadraticCurveTo(-tl * .5, 0, -tl * 1.1, H * 1.6); c.quadraticCurveTo(-tl * .3, H * 1.3, 0, 0); }
    else { c.moveTo(0, 0); c.lineTo(-tl, -H * .95); c.quadraticCurveTo(-tl * .55, 0, -tl, H * .95); }
    c.closePath(); c.fill(); c.restore();
    // rygfinne og bugfinne
    const ds = s.dorsal == null ? .35 : s.dorsal;
    c.fillStyle = s.dfin || fin;
    if (ds > 0) {
      c.beginPath();
      if (s.tri) { c.moveTo(L * .15, -H * .88); c.lineTo(-L * .12, -H * (1 + ds * 2.3)); c.lineTo(-L * .42, -H * .8); }
      else { c.moveTo(L * .45, -H * .82); c.quadraticCurveTo(L * .05, -H * (1 + ds * 2.2), -L * .55, -H * .74); }
      c.closePath(); c.fill();
    }
    if (s.anal) { c.beginPath(); c.moveTo(L * .2, H * .8); c.quadraticCurveTo(-L * .1, H * (1 + s.anal * 2.2), -L * .55, H * .74); c.closePath(); c.fill(); }
    if (s.wing) { // flyvefisk: store brystfinner
      c.save(); c.rotate(-.5 + Math.sin(t * 6) * .12); c.fillStyle = lt(s.body, .35); c.globalAlpha = .85;
      c.beginPath(); c.moveTo(L * .35, -H * .3); c.quadraticCurveTo(-L * .2, -H * 2.2, -L * 1.0, -H * 1.2); c.quadraticCurveTo(-L * .3, -H * .6, L * .35, -H * .3); c.fill(); c.restore();
    }
    // krop
    const bp = bodyPath(L, H, s.pt || 1);
    const g = c.createLinearGradient(0, -H, 0, H);
    g.addColorStop(0, s.back || s.body); g.addColorStop(.55, s.body); g.addColorStop(1, s.belly || lt(s.body, .35));
    c.fillStyle = g; c.fill(bp);
    c.save(); c.clip(bp);
    for (const p of s.pat || []) pattern(c, p, L, H);
    c.restore();
    c.strokeStyle = dk(s.body, .45); c.lineWidth = .045; c.stroke(bp);
    // brystfinne
    c.fillStyle = fin; c.globalAlpha = .85; c.beginPath(); c.ellipse(L * .15, H * .5, H * .5, H * .18, .7, 0, PI2); c.fill(); c.globalAlpha = 1;
    if (s.gills) { c.strokeStyle = dk(s.body, .5); c.lineWidth = .035; c.beginPath(); for (let i = 0; i < 4; i++) { c.moveTo(L * (.3 - i * .06), -H * .4); c.quadraticCurveTo(L * (.26 - i * .06), 0, L * (.3 - i * .06), H * .4); } c.stroke(); }
    if (s.hammer) { c.fillStyle = s.body; c.beginPath(); c.ellipse(L * .9, 0, L * .13, H * 1.7, 0, 0, PI2); c.fill(); c.strokeStyle = dk(s.body, .45); c.lineWidth = .04; c.stroke(); }
    if (s.bill) { c.fillStyle = s.billc || "#aab4c2"; c.beginPath(); c.moveTo(L * .92, -H * .12); c.lineTo(L * (1 + s.bill), -H * .01); c.lineTo(L * .92, H * .14); c.closePath(); c.fill(); }
    if (s.lure) { // havtaskens lys
      c.strokeStyle = "#2b2b2b"; c.lineWidth = .045; c.beginPath(); c.moveTo(L * .45, -H * .9); c.quadraticCurveTo(L * .8, -H * 2.2, L * 1.15, -H * 1.5); c.stroke();
      const gl = c.createRadialGradient(L * 1.15, -H * 1.5, 0, L * 1.15, -H * 1.5, .45); gl.addColorStop(0, "#ffffd0"); gl.addColorStop(.35, "#fff27a"); gl.addColorStop(1, "rgba(255,240,100,0)");
      c.fillStyle = gl; c.beginPath(); c.arc(L * 1.15, -H * 1.5, .45, 0, PI2); c.fill();
    }
    if (s.glow) { // lysorganer langs maven
      for (let i = 0; i < 6; i++) { const x = L * (-.55 + i * .2); const gl = c.createRadialGradient(x, H * .55, 0, x, H * .55, .2); gl.addColorStop(0, "#fffcc0"); gl.addColorStop(1, "rgba(255,250,150,0)"); c.fillStyle = gl; c.beginPath(); c.arc(x, H * .55, .2, 0, PI2); c.fill(); }
    }
    if (s.mane) { // løvefiskens strålefinner
      for (let i = 0; i < 9; i++) {
        const x0 = L * (.45 - i * .11);
        c.strokeStyle = i % 2 ? "#f4e9dd" : "#8a2314"; c.lineWidth = .06; c.beginPath(); c.moveTo(x0, -H * .8); c.lineTo(x0 - L * .28 + Math.sin(t * 4 + i) * .03, -H * (1.9 + (i % 3) * .1)); c.stroke();
        c.beginPath(); c.moveTo(x0, H * .8); c.lineTo(x0 - L * .22, H * (1.5 + (i % 2) * .15)); c.stroke();
      }
    }
    if (s.spikes) { // pindsvinefisk
      c.fillStyle = dk(s.body, .35);
      for (let i = 0; i < 16; i++) { const a = i / 16 * PI2; const px = Math.cos(a) * L * .95; const py = Math.sin(a) * H * 1.05; c.beginPath(); c.moveTo(px * .92, py * .92); c.lineTo(px * 1.25, py * 1.25); c.lineTo(Math.cos(a + .2) * L * .93, Math.sin(a + .2) * H * 1.03); c.fill(); }
    }
    if (s.barbel) { c.strokeStyle = dk(s.body, .4); c.lineWidth = .04; c.beginPath(); c.moveTo(L * .8, H * .2); c.quadraticCurveTo(L * .8, H * .55, L * .62, H * .6); c.stroke(); }
    // øje
    const er = s.eye || Math.max(.1, H * .22);
    const ex = L * (s.ex || .56);
    const ey = -H * .2;
    c.fillStyle = "#fff"; c.beginPath(); c.arc(ex, ey, er, 0, PI2); c.fill();
    c.fillStyle = s.pupil || "#0f1c2c"; c.beginPath(); c.arc(ex + er * .22, ey, er * .58, 0, PI2); c.fill();
    c.fillStyle = "#fff"; c.beginPath(); c.arc(ex + er * .02, ey - er * .25, er * .2, 0, PI2); c.fill();
    if (o.angry) { c.strokeStyle = "#0f1c2c"; c.lineWidth = Math.max(.05, er * .7); c.beginPath(); c.moveTo(ex - er * 1.4, ey - er * 1.7); c.lineTo(ex + er * 1.5, ey - er * .6); c.stroke(); }
    // mund
    const ch = o.chomp || 0;
    if (ch > .05) { c.fillStyle = "#3b0a0a"; c.beginPath(); c.moveTo(L * .98, H * .05); c.quadraticCurveTo(L * .95, H * (.25 + .6 * ch), L * .5, H * (.22 + .2 * ch)); c.quadraticCurveTo(L * .75, H * .05, L * .98, H * .05); c.fill(); }
    c.strokeStyle = "#0f1c2c"; c.lineWidth = .045; c.beginPath(); c.moveTo(L * .97, H * .08); c.quadraticCurveTo(L * .78, H * .3, L * .55, H * .2); c.stroke();
    if (s.teeth || o.angry) {
      c.fillStyle = "#fff";
      for (let i = 0; i < 4; i++) { const x = L * (.9 - i * .1); c.beginPath(); c.moveTo(x, H * (.12 + i * .02)); c.lineTo(x - L * .035, H * (.3 + i * .03 + .25 * ch)); c.lineTo(x - L * .07, H * (.15 + i * .02)); c.fill(); }
    }
  }

  // ---------- Ål og muræner ----------
  function eel(c, s, o) {
    const L = s.len || 1.7;
    const W = s.h || .3;
    const t = o.t || 0;
    const N = 20;
    const pts = [];
    for (let i = 0; i <= N; i++) { const q = i / N; pts.push([L - q * 2 * L, Math.sin(t * 5 - q * 6) * .3 * (.2 + q)]); }
    c.lineCap = "round"; c.lineJoin = "round";
    for (const pass of [0, 1]) {
      for (let i = N - 1; i >= 0; i--) {
        const w = W * (1 - i / N * .6) * 2 * (i === 0 ? 1.35 : 1);
        c.strokeStyle = pass === 0 ? dk(s.body, .5) : (i % 2 ? s.body : lt(s.body, .06));
        c.lineWidth = pass === 0 ? w + .07 : w;
        c.beginPath(); c.moveTo(pts[i + 1][0], pts[i + 1][1]); c.lineTo(pts[i][0], pts[i][1]); c.stroke();
      }
    }
    if (s.spots) { c.fillStyle = s.spots; for (let i = 2; i < N - 2; i += 2) { c.beginPath(); c.arc(pts[i][0], pts[i][1] - W * .2, W * .22, 0, PI2); c.fill(); } }
    if (s.belly) { c.strokeStyle = s.belly; c.lineWidth = W * .5; c.beginPath(); for (let i = 1; i < N - 1; i++) { c.lineTo(pts[i][0], pts[i][1] + W * .55); } c.stroke(); }
    const hx0 = pts[0][0];
    const hy0 = pts[0][1];
    c.fillStyle = "#fff"; c.beginPath(); c.arc(hx0 - .05, hy0 - W * .45, W * .38, 0, PI2); c.fill();
    c.fillStyle = "#0f1c2c"; c.beginPath(); c.arc(hx0 - .02, hy0 - W * .45, W * .2, 0, PI2); c.fill();
    if (o.angry) { c.strokeStyle = "#0f1c2c"; c.lineWidth = W * .35; c.beginPath(); c.moveTo(hx0 - W * .7, hy0 - W * 1.3); c.lineTo(hx0 + W * .2, hy0 - W * .85); c.stroke(); }
    const open = Math.max(o.chomp || 0, o.angry ? .3 : 0);
    c.fillStyle = "#3b0a0a"; c.beginPath(); c.moveTo(hx0 + W * .9, hy0 + W * .1); c.lineTo(hx0 - W * .2, hy0 + W * .1 + W * .8 * open + W * .15); c.lineTo(hx0 - W * .4, hy0 + W * .1); c.fill();
    c.fillStyle = "#fff";
    for (let i = 0; i < 4; i++) { const x = hx0 + W * (.7 - i * .3); c.beginPath(); c.moveTo(x, hy0 + W * .1); c.lineTo(x - W * .1, hy0 + W * (.45 + .3 * open)); c.lineTo(x - W * .22, hy0 + W * .1); c.fill(); }
    if (s.spark) { // elektrisk ål
      c.strokeStyle = "#fff36b"; c.lineWidth = .05;
      for (let k = 0; k < 3; k++) { const px = pts[4 + k * 5][0]; const py = pts[4 + k * 5][1]; c.beginPath(); c.moveTo(px, py - W * 1.2); c.lineTo(px + .15, py - W * 2.0 - Math.sin(t * 20 + k) * .1); c.lineTo(px - .05, py - W * 2.4); c.stroke(); }
    }
  }

  // ---------- Vandmænd ----------
  function jelly(c, s, o) {
    const t = o.t || 0;
    const pul = 1 + Math.sin(t * 3) * .08;
    c.save(); c.scale(pul, 2 - pul);
    const g = c.createRadialGradient(0, -.3, .1, 0, -.1, 1.2);
    g.addColorStop(0, lt(s.body, .5)); g.addColorStop(1, s.body);
    c.globalAlpha = .88; c.fillStyle = g;
    c.beginPath(); c.moveTo(-1, .1); c.bezierCurveTo(-1, -1.25, 1, -1.25, 1, .1); c.quadraticCurveTo(0, .5, -1, .1); c.fill();
    c.globalAlpha = 1; c.strokeStyle = dk(s.body, .35); c.lineWidth = .04; c.stroke();
    c.restore();
    c.lineCap = "round";
    for (let i = 0; i < 7; i++) {
      const x = -.8 + i * .27;
      c.strokeStyle = i % 2 ? s.tent || dk(s.body, .15) : lt(s.body, .1); c.globalAlpha = .8; c.lineWidth = .07; c.beginPath(); c.moveTo(x, .2);
      c.bezierCurveTo(x + Math.sin(t * 4 + i) * .25, .7, x - Math.sin(t * 4 + i) * .25, 1.1, x + Math.sin(t * 3 + i) * .15, 1.7 + (i % 3) * .2); c.stroke();
    }
    c.globalAlpha = 1;
    c.fillStyle = "#fff"; c.beginPath(); c.arc(-.3, -.35, .1, 0, PI2); c.arc(.3, -.35, .1, 0, PI2); c.fill();
    c.fillStyle = "#1c2440"; c.beginPath(); c.arc(-.28, -.34, .05, 0, PI2); c.arc(.32, -.34, .05, 0, PI2); c.fill();
  }

  // ---------- Blæksprutter ----------
  function octo(c, s, o) {
    const t = o.t || 0;
    c.lineCap = "round";
    for (let i = 0; i < 8; i++) {
      const y0 = -.35 + i * .1;
      c.strokeStyle = dk(s.body, .15); c.lineWidth = .17 - i * .006; c.beginPath(); c.moveTo(-.1, y0);
      c.bezierCurveTo(-.7, y0 + Math.sin(t * 5 + i) * .35, -1.1, y0 + Math.cos(t * 4 + i) * .45, -1.7 - (i % 2) * .15, y0 + Math.sin(t * 3 + i * 2) * .5); c.stroke();
    }
    if (s.ears) { // dumbo: ørefinner
      c.fillStyle = lt(s.body, .15);
      for (const sg of [-1, 1]) { c.save(); c.translate(.3, sg * .75); c.rotate(sg * (.5 + Math.sin(t * 6) * .35)); c.beginPath(); c.ellipse(0, sg * .2, .28, .4, 0, 0, PI2); c.fill(); c.restore(); }
    }
    const g = c.createRadialGradient(.3, -.3, .1, .3, 0, 1);
    g.addColorStop(0, lt(s.body, .3)); g.addColorStop(1, s.body);
    c.fillStyle = g; c.beginPath(); c.ellipse(.3, 0, .85, .72, 0, 0, PI2); c.fill();
    c.strokeStyle = dk(s.body, .4); c.lineWidth = .045; c.stroke();
    if (s.dots) { c.fillStyle = s.dots; for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(-.1 + (i % 4) * .2, -.35 + Math.floor(i / 4) * .35, .06, 0, PI2); c.fill(); } }
    const ex = .55;
    c.fillStyle = "#fff"; c.beginPath(); c.arc(ex, -.1, .24, 0, PI2); c.fill();
    c.fillStyle = s.eye || "#101c2c"; c.beginPath(); c.arc(ex + .06, -.1, .13, 0, PI2); c.fill();
    c.fillStyle = "#fff"; c.beginPath(); c.arc(ex + .02, -.18, .045, 0, PI2); c.fill();
    if (o.angry) { c.strokeStyle = "#101c2c"; c.lineWidth = .09; c.beginPath(); c.moveTo(ex - .3, -.5); c.lineTo(ex + .3, -.28); c.stroke(); }
  }

  function squid(c, s, o) {
    const t = o.t || 0;
    c.lineCap = "round";
    for (let i = 0; i < 8; i++) {
      const y0 = -.28 + i * .08;
      c.strokeStyle = dk(s.body, .1); c.lineWidth = .08; c.beginPath(); c.moveTo(.9, y0);
      c.quadraticCurveTo(1.4, y0 + Math.sin(t * 6 + i) * .15, 1.9 + (i % 2) * .15, y0 + Math.sin(t * 5 + i) * .22); c.stroke();
    }
    for (const y0 of [-.1, .1]) { c.lineWidth = .06; c.beginPath(); c.moveTo(.9, y0); c.quadraticCurveTo(1.8, y0 + Math.sin(t * 4) * .3, 2.6, y0 + Math.sin(t * 5) * .45); c.stroke(); }
    c.fillStyle = s.body; c.beginPath(); c.moveTo(.95, 0); c.bezierCurveTo(.6, -.62, -1.1, -.5, -1.7, 0); c.bezierCurveTo(-1.1, .5, .6, .62, .95, 0); c.fill();
    c.fillStyle = dk(s.body, .2); c.beginPath(); c.moveTo(-1.0, 0); c.lineTo(-1.75, -.65); c.lineTo(-1.95, 0); c.lineTo(-1.75, .65); c.closePath(); c.fill();
    c.strokeStyle = dk(s.body, .45); c.lineWidth = .045; c.beginPath(); c.moveTo(.95, 0); c.bezierCurveTo(.6, -.62, -1.1, -.5, -1.7, 0); c.bezierCurveTo(-1.1, .5, .6, .62, .95, 0); c.stroke();
    if (s.dots) { c.fillStyle = s.dots; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(.5 - i * .22, Math.sin(i * 2.1) * .2, .06, 0, PI2); c.fill(); } }
    c.fillStyle = "#fff"; c.beginPath(); c.arc(.55, -.05, .28, 0, PI2); c.fill();
    c.fillStyle = "#101c2c"; c.beginPath(); c.arc(.62, -.05, .16, 0, PI2); c.fill();
    if (o.angry) { c.strokeStyle = "#101c2c"; c.lineWidth = .1; c.beginPath(); c.moveTo(.2, -.5); c.lineTo(.85, -.28); c.stroke(); }
  }

  // ---------- Søhest ----------
  function seahorse(c, s, o) {
    const t = o.t || 0;
    c.lineCap = c.lineJoin = "round";
    c.strokeStyle = dk(s.body, .4); c.lineWidth = .62;
    const body = () => { c.beginPath(); c.moveTo(.05, -.9); c.bezierCurveTo(-.4, -.45, .5, .1, -.05, .5); c.bezierCurveTo(-.45, .9, .15, 1.25, .4, .95); };
    body(); c.stroke();
    c.strokeStyle = s.body; c.lineWidth = .5; body(); c.stroke();
    c.strokeStyle = lt(s.body, .35); c.lineWidth = .16; c.beginPath(); c.moveTo(.2, -.4); c.bezierCurveTo(.3, -.1, .3, .15, .2, .4); c.stroke();
    // hoved og snude
    c.fillStyle = s.body; c.beginPath(); c.arc(.08, -1.02, .32, 0, PI2); c.fill();
    c.fillRect(.2, -1.05, .5, .16); c.beginPath(); c.arc(.7, -.97, .09, 0, PI2); c.fill();
    c.strokeStyle = dk(s.body, .45); c.lineWidth = .04; c.stroke();
    c.fillStyle = dk(s.body, .3); for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-.2 + i * .06, -1.25 + i * .02); c.lineTo(-.3 + i * .06, -1.55 + i * .05); c.lineTo(-.08 + i * .06, -1.3); c.fill(); }
    c.fillStyle = "#fff"; c.beginPath(); c.arc(.14, -1.07, .11, 0, PI2); c.fill();
    c.fillStyle = "#101c2c"; c.beginPath(); c.arc(.17, -1.07, .06, 0, PI2); c.fill();
    c.fillStyle = lt(s.body, .4); c.globalAlpha = .8; c.beginPath(); c.ellipse(-.35, -.1, .12, .3 + Math.sin(t * 12) * .05, 0, 0, PI2); c.fill(); c.globalAlpha = 1;
  }

  // ---------- Rokke ----------
  function manta(c, s, o) {
    const t = o.t || 0;
    const fl = Math.sin(t * 3) * .35;
    c.lineJoin = "round";
    c.strokeStyle = "#202a36"; c.lineWidth = .06; c.beginPath(); c.moveTo(-.9, 0); c.quadraticCurveTo(-1.6, .1, -2.4, .25); c.stroke();
    for (const sg of [-1, 1]) {
      c.fillStyle = sg < 0 ? s.body : dk(s.body, .15); c.beginPath(); c.moveTo(.95, 0);
      c.bezierCurveTo(.5, sg * .3, .2, sg * (.9 + fl), -.5, sg * (1.7 + fl));
      c.quadraticCurveTo(-.45, sg * .8, -.95, 0); c.closePath(); c.fill();
    }
    c.fillStyle = s.belly || "#f0f4f8"; c.globalAlpha = .9; c.beginPath(); c.ellipse(.15, .1, .6, .26, 0, 0, PI2); c.fill(); c.globalAlpha = 1;
    c.fillStyle = "#fff"; c.beginPath(); c.ellipse(.3, -.25, .22, .12, -.4, 0, PI2); c.fill();
    c.fillStyle = s.body; for (const sg of [-1, 1]) { c.beginPath(); c.ellipse(.98, sg * .2, .2, .08, sg * .3, 0, PI2); c.fill(); }
    c.fillStyle = "#fff"; c.beginPath(); c.arc(.62, -.18, .1, 0, PI2); c.fill();
    c.fillStyle = "#101c2c"; c.beginPath(); c.arc(.65, -.18, .055, 0, PI2); c.fill();
  }

  // ---------- Krebsdyr, søstjerner og andre på bunden ----------
  function crab(c, s, o) {
    const t = o.t || 0;
    const sc = Math.sin(t * 9) * .08;
    c.lineCap = c.lineJoin = "round";
    c.strokeStyle = dk(s.body, .25); c.lineWidth = .1;
    for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(sg * .3 - sg * i * .02, .3); c.lineTo(sg * (.75 + i * .12), .5 + sc * (i % 2 ? 1 : -1)); c.lineTo(sg * (.9 + i * .15), .82); c.stroke(); }
    if (s.shell) { // eremitkrebsens skal
      c.fillStyle = "#e8cfa0"; c.beginPath(); c.arc(-.15, -.55, .85, 0, PI2); c.fill(); c.strokeStyle = "#9a7a4a"; c.lineWidth = .06; c.stroke();
      c.beginPath(); c.arc(-.15, -.55, .55, .4, 4.6); c.arc(-.15, -.55, .25, .8, 5); c.stroke();
    }
    c.fillStyle = s.body; c.beginPath(); c.ellipse(0, .05, .95, .6, 0, 0, PI2); c.fill();
    c.strokeStyle = dk(s.body, .4); c.lineWidth = .05; c.stroke();
    c.fillStyle = lt(s.body, .3); c.beginPath(); c.ellipse(-.15, -.1, .5, .22, -.2, 0, PI2); c.fill();
    for (const sg of [0, 1]) { // klør
      const bx = .6; const by = sg ? -.5 : -.2;
      c.strokeStyle = s.body; c.lineWidth = .16; c.beginPath(); c.moveTo(.45, sg ? -.2 : .05); c.lineTo(bx + .3, by - .25 - sc * 2); c.stroke();
      c.fillStyle = s.claw || s.body; c.beginPath(); c.arc(bx + .38, by - .38 - sc * 2, .3, .4, 5.6); c.lineTo(bx + .38, by - .38 - sc * 2); c.closePath(); c.fill();
      c.strokeStyle = dk(s.body, .4); c.lineWidth = .045; c.stroke();
    }
    c.strokeStyle = dk(s.body, .3); c.lineWidth = .06; c.beginPath(); c.moveTo(.35, -.4); c.lineTo(.4, -.72); c.moveTo(.1, -.45); c.lineTo(.08, -.75); c.stroke();
    c.fillStyle = "#fff"; c.beginPath(); c.arc(.4, -.76, .11, 0, PI2); c.arc(.08, -.79, .11, 0, PI2); c.fill();
    c.fillStyle = "#101c2c"; c.beginPath(); c.arc(.42, -.76, .06, 0, PI2); c.arc(.1, -.79, .06, 0, PI2); c.fill();
  }

  function star(c, s, o) {
    const n = s.arms || 5;
    const ri = s.inner || .45;
    c.lineJoin = "round";
    c.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n; const r = i % 2 ? ri : 1; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    c.closePath(); c.fillStyle = s.body; c.fill(); c.strokeStyle = dk(s.body, .45); c.lineWidth = .06; c.stroke();
    c.fillStyle = lt(s.body, .35);
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / n; for (const d of [.3, .6]) { c.beginPath(); c.arc(Math.cos(a) * d, Math.sin(a) * d, .06, 0, PI2); c.fill(); } }
    if (s.spiky) { c.strokeStyle = s.spiky; c.lineWidth = .05; for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n; c.beginPath(); c.moveTo(Math.cos(a) * (i % 2 ? ri : .9), Math.sin(a) * (i % 2 ? ri : .9)); c.lineTo(Math.cos(a) * (i % 2 ? ri + .2 : 1.25), Math.sin(a) * (i % 2 ? ri + .2 : 1.25)); c.stroke(); } }
  }

  function urchin(c, s, o) {
    c.lineCap = "round";
    c.strokeStyle = s.spike || "#2b1b3a"; c.lineWidth = .07;
    for (let i = 0; i < 26; i++) { const a = i / 26 * PI2; c.beginPath(); c.moveTo(Math.cos(a) * .5, Math.sin(a) * .5); c.lineTo(Math.cos(a) * 1.05, Math.sin(a) * 1.05); c.stroke(); }
    const g = c.createRadialGradient(-.15, -.15, .05, 0, 0, .6); g.addColorStop(0, lt(s.body, .3)); g.addColorStop(1, s.body);
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, .55, 0, PI2); c.fill();
    c.fillStyle = "#fff"; c.beginPath(); c.arc(-.15, -.05, .1, 0, PI2); c.arc(.15, -.05, .1, 0, PI2); c.fill();
    c.fillStyle = "#101c2c"; c.beginPath(); c.arc(-.13, -.04, .05, 0, PI2); c.arc(.17, -.04, .05, 0, PI2); c.fill();
    c.strokeStyle = "#101c2c"; c.lineWidth = .06; c.beginPath(); c.moveTo(-.2, -.25); c.lineTo(-.05, -.15); c.moveTo(.2, -.25); c.lineTo(.05, -.15); c.stroke();
  }

  function turtle(c, s, o) {
    const t = o.t || 0;
    c.lineJoin = c.lineCap = "round";
    c.fillStyle = s.skin || "#8fb26a";
    c.save(); c.translate(.35, .35); c.rotate(Math.sin(t * 3) * .5 + .3); c.beginPath(); c.ellipse(.1, .35, .22, .6, -.2, 0, PI2); c.fill(); c.restore();
    c.save(); c.translate(-.7, .3); c.rotate(-Math.sin(t * 3) * .3); c.beginPath(); c.ellipse(-.1, .2, .16, .35, .3, 0, PI2); c.fill(); c.restore();
    c.beginPath(); c.ellipse(1.0, .02, .35, .27, .2, 0, PI2); c.fill();
    c.fillStyle = s.belly || "#e8dfa0"; c.beginPath(); c.ellipse(0, .22, .95, .3, 0, 0, PI2); c.fill();
    const g = c.createLinearGradient(0, -.7, 0, .3); g.addColorStop(0, lt(s.body, .25)); g.addColorStop(1, s.body);
    c.fillStyle = g; c.beginPath(); c.moveTo(-1, .15); c.bezierCurveTo(-1, -.95, 1, -.95, 1, .15); c.closePath(); c.fill();
    c.strokeStyle = dk(s.body, .45); c.lineWidth = .05; c.stroke();
    c.strokeStyle = dk(s.body, .3); c.lineWidth = .04;
    c.beginPath(); c.moveTo(-.4, -.7); c.lineTo(-.25, .1); c.moveTo(.25, -.7); c.lineTo(.2, .1); c.moveTo(-.9, -.3); c.lineTo(.9, -.3); c.stroke();
    c.fillStyle = "#fff"; c.beginPath(); c.arc(1.12, -.04, .08, 0, PI2); c.fill();
    c.fillStyle = "#101c2c"; c.beginPath(); c.arc(1.14, -.04, .045, 0, PI2); c.fill();
  }

  function chest(c, s, o) {
    const t = o.t || 0;
    for (let i = 0; i < 3; i++) { const x = -.5 + i * .5; const gl = c.createRadialGradient(x, -.55, 0, x, -.55, .35); gl.addColorStop(0, "#fff7a0"); gl.addColorStop(1, "rgba(255,220,60,0)"); c.fillStyle = gl; c.globalAlpha = .6 + .4 * Math.sin(t * 5 + i); c.beginPath(); c.arc(x, -.55, .35, 0, PI2); c.fill(); }
    c.globalAlpha = 1;
    c.fillStyle = "#7a4a22"; c.fillRect(-.9, -.1, 1.8, .85);
    c.beginPath(); c.moveTo(-.9, -.1); c.quadraticCurveTo(0, -.9, .9, -.1); c.fill();
    c.strokeStyle = "#3d230d"; c.lineWidth = .06; c.strokeRect(-.9, -.1, 1.8, .85);
    c.fillStyle = "#f2c230"; c.fillRect(-.55, -.4, .14, 1.15); c.fillRect(.41, -.4, .14, 1.15); c.fillRect(-.9, .0, 1.8, .12);
    c.beginPath(); c.arc(0, .12, .17, 0, PI2); c.fill(); c.fillStyle = "#3d230d"; c.fillRect(-.03, .1, .06, .16);
  }

  function tubeworm(c, s, o) {
    const t = o.t || 0;
    c.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const x = -.45 + i * .45; const h = .9 + (i % 2) * .5;
      c.strokeStyle = "#f2efe6"; c.lineWidth = .3; c.beginPath(); c.moveTo(x, .9); c.lineTo(x + Math.sin(t * 2 + i) * .06, .9 - h); c.stroke();
      c.fillStyle = "#e0261b"; c.beginPath(); c.ellipse(x + Math.sin(t * 2 + i) * .06, .9 - h - .12, .26, .2 + Math.sin(t * 4 + i) * .03, 0, 0, PI2); c.fill();
    }
  }

  function vent(c, s, o) {
    const t = o.t || 0;
    const g = c.createLinearGradient(0, -1.2, 0, .9); g.addColorStop(0, "#5a4a4a"); g.addColorStop(1, "#1a1414");
    c.fillStyle = g; c.beginPath(); c.moveTo(-.55, .9); c.lineTo(-.28, -1.1); c.lineTo(.28, -1.1); c.lineTo(.55, .9); c.closePath(); c.fill();
    const gl = c.createRadialGradient(0, -1.15, 0, 0, -1.15, .5); gl.addColorStop(0, "#ffb46b"); gl.addColorStop(1, "rgba(255,80,20,0)");
    c.fillStyle = gl; c.beginPath(); c.arc(0, -1.15, .5, 0, PI2); c.fill();
    for (let i = 0; i < 5; i++) { const q = ((t * .5 + i * .2) % 1); c.fillStyle = `rgba(40,30,30,${.55 * (1 - q)})`; c.beginPath(); c.arc(Math.sin(q * 6 + i) * .15, -1.3 - q * 1.6, .18 + q * .25, 0, PI2); c.fill(); }
  }

  const KINDS = { fish, eel, jelly, octo, squid, seahorse, manta, crab, star, urchin, turtle, chest, tubeworm, vent };

  function draw(c, art, o) {
    c.save();
    c.scale(o.r, o.r);
    (KINDS[art.kind] || fish)(c, art, o);
    c.restore();
  }

  // ---------- Arter ----------
  const A = {};
  const add = (id, da, pts, kind, props) => { A[id] = Object.assign({ id, da, pts, kind }, props); };

  // Små og almindelige (1 point), mellemstore (2), store (5) og sjældne (10)
  add("klovnefisk", "Klovnefisk", 2, "fish", { body: "#ff7a18", belly: "#ff9a45", len: .85, h: .62, tail: "round", dorsal: .25, fin: "#ff6a00", pat: [B(.4, .13, "#ffffff", "#161616"), B(-.15, .13, "#ffffff", "#161616"), B(-.68, .08, "#ffffff", "#161616")] });
  add("blaa_doktorfisk", "Blå doktorfisk", 1, "fish", { body: "#2d6fe0", belly: "#5aa0ff", len: .9, h: .72, tail: "fork", dorsal: .3, fin: "#1b3d99", tailc: "#ffd400", pat: [S(-.05, .3, "#0f1a3a")] });
  add("sommerfuglefisk", "Sommerfuglefisk", 1, "fish", { body: "#ffe14d", belly: "#fff1a0", len: .75, h: .85, tail: "round", dorsal: .3, fin: "#ffd000", pat: [B(.55, .12, "#111111", "#111111"), S(.2, .08, "#fff6c0")] });
  add("kejserfisk", "Kejserfisk", 2, "fish", { body: "#2a6bd6", belly: "#4a8be6", len: .9, h: .8, tail: "round", dorsal: .35, fin: "#ffd21f", tailc: "#ffd21f", pat: [S(-.45, .12, "#ffd21f"), S(-.05, .12, "#ffd21f"), S(.35, .12, "#ffd21f")] });
  add("papegoejefisk", "Papegøjefisk", 2, "fish", { body: "#28c7b7", belly: "#ff8ab8", len: 1, h: .7, tail: "fork", dorsal: .3, fin: "#1a8f9a", pat: [D(8, "#ff8ab8", .08)] });
  add("maurisk_idol", "Maurisk idol", 5, "fish", { body: "#fff6d0", belly: "#fffbe8", len: .8, h: .9, tail: "fork", dorsal: 1.0, sail: true, fin: "#222222", pat: [B(.25, .16, "#111111", "#111111"), B(-.4, .2, "#ffd21f", "#111111")] });
  add("sardin", "Sardin", 1, "fish", { body: "#9fb6c8", back: "#3d5f7a", belly: "#e8f0f5", len: 1.05, h: .38, tail: "fork", dorsal: .15, fin: "#7b97ab", pat: [S(.05, .12, "#d3e4ee")] });
  add("sild", "Sild", 1, "fish", { body: "#8fa8b8", back: "#37566b", belly: "#e6eef2", len: 1.1, h: .42, tail: "fork", dorsal: .15, fin: "#6f8c9f" });
  add("makrel", "Makrel", 2, "fish", { body: "#2f8f9f", back: "#1c4b6a", belly: "#e6f2f2", len: 1.1, h: .45, tail: "fork", dorsal: .25, fin: "#1f5a7a", pat: [Z("#0e2a3d")] });
  add("garibaldi", "Garibaldi", 2, "fish", { body: "#ff8a00", belly: "#ffae52", len: .9, h: .62, tail: "round", dorsal: .3, fin: "#ff7a00" });
  add("rodspaette", "Rødspætte", 2, "fish", { body: "#a98255", belly: "#d8c0a0", len: 1, h: .68, tail: "round", dorsal: .4, fin: "#8a6643", pat: [D(10, "#ff7b2e", .09)] });
  add("havoerred", "Havørred", 5, "fish", { body: "#9aaab0", back: "#5c6f66", belly: "#eef1f2", len: 1.15, h: .5, tail: "fork", dorsal: .25, fin: "#6d8089", pat: [D(14, "#2a2f33", .045)] });
  add("tangsnarre", "Tangsnarre", 1, "fish", { body: "#7da85f", belly: "#b9d39a", len: 1.5, h: .17, tail: "round", tl: .3, dorsal: .3, fin: "#4c7a38", bill: .35, billc: "#7da85f", pat: [B(.2, .05, "#355a2a", "#355a2a"), B(-.2, .05, "#355a2a", "#355a2a")] });
  add("hundestejle", "Hundestejle", 1, "fish", { body: "#7d8f4f", belly: "#e8553a", len: .8, h: .42, tail: "fork", dorsal: .15, fin: "#59683a" });
  add("lodde", "Lodde", 1, "fish", { body: "#a9c0ca", back: "#4a6577", belly: "#eef4f6", len: 1, h: .3, tail: "fork", dorsal: .12, fin: "#7d97a5" });
  add("polartorsk", "Polartorsk", 2, "fish", { body: "#7f8fa6", back: "#4c5c74", belly: "#dfe6ee", len: 1, h: .45, tail: "round", dorsal: .3, fin: "#5a6a82", pat: [D(8, "#33425a", .05)] });
  add("stenbider", "Stenbider", 2, "fish", { body: "#d9824a", belly: "#f0b070", len: .72, h: .72, tail: "round", tl: .4, dorsal: .35, fin: "#b8602c", pat: [D(9, "#f4c48a", .07)] });
  add("neontetra", "Neontetra", 1, "fish", { body: "#5a74a0", back: "#1f3cc0", belly: "#ff3a2a", len: .9, h: .3, tail: "fork", dorsal: .15, fin: "#8aa0c0", pat: [S(-.25, .2, "#2cd0ff")] });
  add("guppy", "Guppy", 1, "fish", { body: "#e06a3a", belly: "#f4a070", len: .75, h: .36, tail: "round", tl: 1.0, dorsal: .25, fin: "#2fb8c8", tailc: "#2fb8c8", pat: [D(5, "#fff3b0", .06)] });
  add("skalar", "Skalar", 2, "fish", { body: "#d4dbe0", belly: "#f1f4f6", len: .55, h: 1.0, tail: "round", tl: .4, dorsal: .9, anal: .8, fin: "#aab4bb", pat: [B(.1, .09, "#222222", "#222222"), B(-.35, .09, "#222222", "#222222")] });
  add("diskus", "Diskusfisk", 2, "fish", { body: "#f08a2a", belly: "#ffc27a", len: .7, h: .9, tail: "round", tl: .35, dorsal: .25, anal: .3, fin: "#2a7ad0", pat: [S(-.3, .1, "#2a7ad0"), S(.1, .1, "#2a7ad0"), S(.5, .1, "#2a7ad0")] });
  add("flyvefisk", "Flyvefisk", 2, "fish", { body: "#3d6ea8", back: "#264a78", belly: "#cfe0ee", len: 1, h: .4, tail: "fork", dorsal: .12, wing: true, fin: "#7aa0c8" });
  add("tun", "Tun", 5, "fish", { body: "#2c5aa0", back: "#15305c", belly: "#e8eef5", len: 1.3, h: .6, tail: "lunate", tl: .6, dorsal: .25, fin: "#f2d230" });
  add("mahimahi", "Mahi-mahi", 5, "fish", { body: "#33b86a", back: "#1c7a5a", belly: "#f2e36b", len: 1.25, h: .62, tail: "fork", dorsal: .3, fin: "#2ba8b8", pat: [D(7, "#2e7de0", .05)] });
  add("mola", "Månefisk", 10, "fish", { body: "#9ea8b0", belly: "#d4dadf", len: .8, h: 1.0, tail: "round", tl: .3, dorsal: .9, anal: .9, fin: "#7b868f", pat: [D(8, "#7a858e", .05)] });
  add("lanternefisk", "Lanternefisk", 1, "fish", { body: "#2e4468", belly: "#2e4468", len: .9, h: .38, tail: "fork", dorsal: .12, fin: "#1f2f4c", glow: true });

  // Rovfisk og hajer
  add("barracuda", "Barracuda", 5, "fish", { body: "#8c9ba5", back: "#46606f", belly: "#e6edf0", len: 1.8, h: .34, tail: "fork", dorsal: .15, fin: "#5b7080", teeth: true, pat: [S(.1, .08, "#c9d6dd")] });
  add("loevefisk", "Løvefisk", 5, "fish", { body: "#c5402a", belly: "#e8a58a", len: .8, h: .6, tail: "round", dorsal: 0, fin: "#8a2314", mane: true, pat: [B(.35, .1, "#fff0e0", "#6a1408"), B(-.1, .1, "#fff0e0", "#6a1408"), B(-.55, .1, "#fff0e0", "#6a1408")] });
  add("torsk", "Torsk", 5, "fish", { body: "#8a8a52", belly: "#e3dfc2", len: 1.15, h: .58, tail: "round", dorsal: .3, fin: "#6a6a3a", barbel: true, pat: [D(11, "#5f5c2c", .05)] });
  add("havkat", "Havkat", 5, "fish", { body: "#566a70", belly: "#8ea0a6", len: 1.5, h: .5, tail: "round", dorsal: .2, fin: "#3b4a50", teeth: true, pat: [B(.25, .1, "#2f3d41", "#2f3d41"), B(-.2, .1, "#2f3d41", "#2f3d41"), B(-.6, .1, "#2f3d41", "#2f3d41")] });
  add("piratfisk", "Piratfisk", 5, "fish", { body: "#7a8d99", belly: "#e3532f", len: .9, h: .75, tail: "fork", dorsal: .25, fin: "#5a6a75", teeth: true, pat: [D(10, "#c6d3dc", .04)] });
  add("arapaima", "Arapaima", 10, "fish", { body: "#4f6a4a", belly: "#9ab07a", len: 1.9, h: .5, tail: "round", dorsal: .15, fin: "#3a5a3a", tailc: "#c0392b", pat: [D(12, "#c0392b", .045)] });
  add("svaerdfisk", "Sværdfisk", 5, "fish", { body: "#4a5f80", back: "#2a3a58", belly: "#cfd8e4", len: 1.55, h: .5, tail: "lunate", tl: .7, dorsal: .45, bill: .55, fin: "#34445f" });
  add("marlin", "Blå marlin", 10, "fish", { body: "#1f4fa0", back: "#0f2a60", belly: "#d7e2f0", len: 1.65, h: .5, tail: "lunate", tl: .7, dorsal: 1.0, bill: .5, fin: "#1a3d80", pat: [B(.1, .05, "#6fa0e8", "#6fa0e8"), B(-.3, .05, "#6fa0e8", "#6fa0e8")] });
  add("havtaske", "Havtaske", 10, "fish", { body: "#4a3b2e", belly: "#7a6650", len: 1, h: .95, tail: "round", dorsal: .1, fin: "#2c2118", lure: true, teeth: true, pat: [D(10, "#2c2118", .07)] });
  add("viperfisk", "Hugorm-fisk", 5, "fish", { body: "#1f3a4d", belly: "#2f5870", len: 1.5, h: .36, tail: "fork", dorsal: .2, fin: "#12283a", teeth: true, glow: true });
  add("revhaj", "Revhaj", 5, "fish", { body: "#7a8b97", back: "#56707f", belly: "#eef3f5", len: 1.5, h: .5, tail: "fork", tl: 1, dorsal: 1, tri: true, gills: true, fin: "#5d7080" });
  add("hvid_haj", "Hvid haj", 10, "fish", { body: "#8296a2", back: "#5d707c", belly: "#ffffff", len: 1.7, h: .62, tail: "fork", tl: 1.1, dorsal: 1.1, tri: true, gills: true, fin: "#66798a", teeth: true });
  add("hammerhaj", "Hammerhaj", 10, "fish", { body: "#8d9aa3", back: "#68798a", belly: "#f1f4f6", len: 1.55, h: .48, tail: "fork", tl: 1, dorsal: 1, tri: true, hammer: true, fin: "#6e7d88" });
  add("tigerhaj", "Tigerhaj", 10, "fish", { body: "#7f9aa8", back: "#5c7a8a", belly: "#eef4f6", len: 1.65, h: .55, tail: "fork", tl: 1, dorsal: 1, tri: true, gills: true, fin: "#64808f", pat: [Z("#34505e")] });
  add("groenlandshaj", "Grønlandshaj", 10, "fish", { body: "#515a60", back: "#3a4248", belly: "#8a949a", len: 1.6, h: .55, tail: "round", tl: .6, dorsal: .35, tri: true, fin: "#3a4248", pat: [D(5, "#7c868c", .05)] });
  add("hvalhaj", "Hvalhaj", 10, "fish", { body: "#3d6a8a", back: "#2a4a66", belly: "#e8f0f4", len: 1.9, h: .62, tail: "fork", tl: .9, dorsal: .3, tri: true, fin: "#2e5470", pat: [D(34, "#f2f7fa", .04)] });

  // Andre havdyr
  add("soehest", "Søhest", 5, "seahorse", { body: "#f2a21c" });
  add("muraene", "Muræne", 5, "eel", { body: "#7d8a3a", belly: "#c8cf86", spots: "#c9a83a", len: 1.7, h: .3 });
  add("aal", "Ål", 5, "eel", { body: "#4f5e3a", belly: "#c7cf9a", len: 1.7, h: .24 });
  add("elektrisk_aal", "Elektrisk ål", 0, "eel", { body: "#3d3a3a", belly: "#e09a3a", spark: true, len: 1.8, h: .3, hazard: true });
  add("manta", "Mantarokke", 10, "manta", { body: "#2d3e56", belly: "#f0f4f8" });
  add("brandmand", "Brandmand", 0, "jelly", { body: "#e8734a", tent: "#a8431f", hazard: true, sting: true });
  add("orlogsmand", "Orlogsmand", 0, "jelly", { body: "#7a8cf0", tent: "#3a4ec0", hazard: true, sting: true });
  add("blaeksprutte", "Blæksprutte", 5, "octo", { body: "#d2563a", dots: "#f4a080" });
  add("vampyr_blaeksprutte", "Vampyrblæksprutte", 5, "octo", { body: "#8a1f2f", eye: "#3a6aff" });
  add("dumbo", "Dumbo-blæksprutte", 5, "octo", { body: "#f2a0c0", ears: true });
  add("kaempeblaeksprutte", "Kæmpeblæksprutte", 10, "squid", { body: "#b8402f", dots: "#f0b090" });
  add("krabbe", "Strandkrabbe", 5, "crab", { body: "#6a8a3a", claw: "#7c9d48", gy: .82, ground: true });
  add("eremitkrebs", "Eremitkrebs", 5, "crab", { body: "#e08a4a", shell: true, gy: .82, ground: true });
  add("yetikrabbe", "Yeti-krabbe", 5, "crab", { body: "#f2eee6", claw: "#e0d8c8", gy: .82, ground: true });
  add("soestjerne", "Søstjerne", 2, "star", { body: "#f08a2a", gy: 1, ground: true });
  add("tornekrone", "Tornekrone-søstjerne", 0, "star", { body: "#8a3a8a", arms: 9, inner: .6, spiky: "#d0b0e0", gy: 1, ground: true, hazard: true, sting: true });
  add("soepindsvin", "Søpindsvin", 0, "urchin", { body: "#4a2a6a", spike: "#2b1b3a", gy: .8, ground: true, hazard: true, sting: true });
  add("skildpadde", "Havskildpadde", 10, "turtle", { body: "#6a8a3a", skin: "#8fb26a", belly: "#e8dfa0" });
  add("kiste", "Skattekiste", 10, "chest", { gy: .75, ground: true });
  add("roerorm", "Rørorm", 2, "tubeworm", { gy: .9, ground: true });
  add("ryger", "Sort ryger", 0, "vent", { gy: .9, ground: true, hazard: true, sting: true });

  // ---------- Verdener ----------
  // grad = vandets farver (top, midte, bund), far = baggrund langt væk, near = tang i forgrunden, sand = bundens farve.
  const W = [
    { id: "koral", da: "Koralrevet", fact: "Hjem for klovnefisk og tusindvis af arter", grad: ["#3fd8ec", "#1da6c8", "#0a5f88"], far: "coral", farc: "#0f7fa0", weed: ["#ff7aa8", "#ffb347"], sand: "#f0dba0",
      food: ["klovnefisk", "blaa_doktorfisk", "sommerfuglefisk", "kejserfisk", "papegoejefisk", "maurisk_idol", "soehest"], evil: ["revhaj", "muraene", "loevefisk"], ground: ["soestjerne"], hazards: ["tornekrone"], float: [] },
    { id: "tang", da: "Tangskoven", fact: "Tang kan vokse en halv meter på en dag", grad: ["#6fd4a8", "#2a9a7a", "#0d4a45"], far: "kelp", farc: "#17705a", weed: ["#3a8a3a", "#5a9a2a"], sand: "#b9a46a",
      food: ["sardin", "garibaldi", "rodspaette", "sild", "havoerred"], evil: ["torsk", "hvid_haj"], ground: ["krabbe"], hazards: ["soepindsvin"], float: [] },
    { id: "skib", da: "Piratskibet", fact: "Gamle skibsvrag bliver til rev for fisk", grad: ["#2f8fb0", "#1b5f7e", "#0a2f45"], far: "ship", farc: "#0d3b52", weed: ["#2e6a4a", "#3a7a5a"], sand: "#8a7a58",
      food: ["makrel", "sardin", "kejserfisk", "papegoejefisk"], evil: ["barracuda", "muraene", "hammerhaj"], ground: ["krabbe", "kiste"], hazards: ["soepindsvin", "tornekrone"], float: [] },
    { id: "tidevand", da: "Tidevandsbassinet", fact: "Når vandet går, bor krabber og blæksprutter her", grad: ["#9ee6e0", "#5cc6c6", "#2a8a96"], far: "rocks", farc: "#3a8a90", weed: ["#7ab04a", "#a0c060"], sand: "#f3e2b0",
      food: ["tangsnarre", "hundestejle", "rodspaette", "blaeksprutte"], evil: ["aal", "havkat"], ground: ["eremitkrebs", "krabbe", "soestjerne"], hazards: ["soepindsvin"], float: ["brandmand"] },
    { id: "amazon", da: "Amazonfloden", fact: "Her lever både piratfisk og elektriske ål", grad: ["#9cc27a", "#5a8f4a", "#264a30"], far: "jungle", farc: "#2f5a35", weed: ["#4a7a3a", "#6a8a3a"], sand: "#8a6f45",
      food: ["neontetra", "guppy", "skalar", "diskus"], evil: ["piratfisk", "arapaima"], ground: [], hazards: [], float: ["elektrisk_aal"] },
    { id: "polar", da: "Polarhavet", fact: "Grønlandshajen kan blive flere hundrede år gammel", grad: ["#aeeaff", "#5ab4e8", "#17406e"], far: "ice", farc: "#8ac8e8", weed: ["#bfe6f4", "#dff4fa"], sand: "#dbe9f2",
      food: ["lodde", "polartorsk", "stenbider", "sild"], evil: ["havkat", "groenlandshaj"], ground: ["soestjerne"], hazards: [], float: ["brandmand"] },
    { id: "hav", da: "Det åbne hav", fact: "Hvalhajen er verdens største fisk", grad: ["#2f7ae0", "#1853b5", "#082a6a"], far: "open", farc: "#10408a", weed: ["#2a6ac0", "#3a7ad0"], sand: "#6a7a9a",
      food: ["makrel", "flyvefisk", "tun", "mahimahi", "mola", "hvalhaj", "manta"], evil: ["svaerdfisk", "marlin", "tigerhaj"], ground: [], hazards: [], float: ["orlogsmand"] },
    { id: "dyb", da: "Dybhavet", fact: "Mange dybhavsfisk laver deres eget lys", grad: ["#1c2d6a", "#0d1a47", "#050b22"], far: "deep", farc: "#12235a", weed: ["#2a4a8a", "#3a5aa0"], sand: "#2a2f4a",
      food: ["lanternefisk", "vampyr_blaeksprutte", "dumbo"], evil: ["havtaske", "viperfisk", "kaempeblaeksprutte"], ground: ["soestjerne"], hazards: [], float: [] },
    { id: "vulkan", da: "Vulkanhavet", fact: "Ved sorte rygere lever dyr uden sollys", grad: ["#5a2a3a", "#2a1a35", "#0e0a1a"], far: "vents", farc: "#3a1f2a", weed: ["#7a3a3a", "#9a4a3a"], sand: "#3a2a2a",
      food: ["lanternefisk", "dumbo", "vampyr_blaeksprutte"], evil: ["viperfisk", "havtaske"], ground: ["roerorm", "yetikrabbe"], hazards: ["ryger"], float: [] },
    { id: "atlantis", da: "Atlantis", fact: "Gamle ruiner bliver hjem for havets dyr", grad: ["#3fc6c0", "#1c8a9a", "#0b4455"], far: "temple", farc: "#0f5a6a", weed: ["#2e9a6a", "#4aaa7a"], sand: "#d8c78a",
      food: ["kejserfisk", "maurisk_idol", "tun", "skildpadde", "manta"], evil: ["hvid_haj", "kaempeblaeksprutte", "muraene"], ground: ["kiste"], hazards: ["tornekrone"], float: ["orlogsmand"] }
  ];

  // Alle arter til ét ikon (bruges i quizzen)
  function icon(art, size, angry) {
    const cv = document.createElement("canvas");
    cv.width = size * 2; cv.height = size * 1.3;
    const c = cv.getContext("2d");
    c.translate(cv.width / 2, cv.height / 2);
    draw(c, art, { r: size * .42, t: 0, angry: !!angry });
    return cv.toDataURL();
  }

  return { species: A, worlds: W, draw, icon, mix, dk, lt };
});
