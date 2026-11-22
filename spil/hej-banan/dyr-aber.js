// Aber og andre primater til Hej Banan: de otte spilbare aber og deres venner (lemurer, langurer, bonobo m.fl.).
// Alle bruger samme lille "skelet" (krop, hoved, fire lemmer, hale), men hver art har sine egne farver og kendetegn.
// Poser: sit, swing, fly, eat, dizzy (andre navne tegnes som sit).
(function () {
  "use strict";
  const T = window.BananTegn;
  const { dk, lt, rad, eyeDark, PI2 } = T;
  const PI = Math.PI, sin = Math.sin, cos = Math.cos, hyp = Math.hypot;
  const OL = "rgba(30,18,12,.55)";

  // ---------- Tegnehjælp ----------
  function ell(c, x, y, rx, ry, rot, fill, lw) {
    c.fillStyle = fill; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, PI2); c.fill();
    if (lw) { c.strokeStyle = OL; c.lineWidth = lw; c.stroke(); }
  }
  // Blød pels: lys fra øverst til venstre
  const shade = (c, x, y, R, col, k) => rad(c, x, y, 0, R * 1.2, [[0, lt(col, .26 * (k || 1))], [.55, col], [1, dk(col, .36 * (k || 1))]], x - R * .35, y - R * .4);
  const seg = (c, a, b) => { c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };

  // Krans af hårtotter langs en ellipse fra vinkel a0 til a1
  function tufts(c, cx, cy, rx, ry, rot, a0, a1, n, amp, col) {
    const cr = cos(rot), sr = sin(rot);
    const pt = (a, k) => { const x = rx * cos(a) * k, y = ry * sin(a) * k; c.lineTo(cx + x * cr - y * sr, cy + x * sr + y * cr); };
    c.fillStyle = col; c.beginPath();
    const x0 = rx * cos(a0), y0 = ry * sin(a0);
    c.moveTo(cx + x0 * cr - y0 * sr, cy + x0 * sr + y0 * cr);
    for (let i = 0; i < n; i++) {
      pt(a0 + (a1 - a0) * (i + .5) / n, 1 + amp * (.65 + .35 * sin(i * 2.7 + 1)));
      pt(a0 + (a1 - a0) * (i + 1) / n, 1);
    }
    c.closePath(); c.fill();
  }

  // To-leddet arm/ben: finder albuen, så hånden når målet (eller strækkes mod det)
  function ik(a, b, l1, l2, pref) {
    let dx = b[0] - a[0], dy = b[1] - a[1], d = hyp(dx, dy) || .001;
    const mx = (l1 + l2) * .995;
    if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
    const k = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - k * k));
    const px = a[0] + dx * k / d, py = a[1] + dy * k / d;
    const e1 = [px - dy * h / d, py + dx * h / d], e2 = [px + dy * h / d, py - dx * h / d];
    const s1 = (e1[0] - px) * pref[0] + (e1[1] - py) * pref[1], s2 = (e2[0] - px) * pref[0] + (e2[1] - py) * pref[1];
    return [a, s1 >= s2 ? e1 : e2, [a[0] + dx, a[1] + dy]];
  }

  function limb(c, J, w1, w2, col) {
    const o = dk(col, .55);
    c.strokeStyle = o; c.lineWidth = w1 + .05; seg(c, J[0], J[1]);
    c.lineWidth = w2 + .05; seg(c, J[1], J[2]);
    c.strokeStyle = col; c.lineWidth = w1; seg(c, J[0], J[1]);
    c.lineWidth = w2; seg(c, J[1], J[2]);
    c.strokeStyle = lt(col, .2); c.lineWidth = w1 * .28;
    for (let i = 0; i < 2; i++) {
      const a = J[i], b = J[i + 1], l = hyp(b[0] - a[0], b[1] - a[1]) || 1;
      let nx = -(b[1] - a[1]) / l, ny = (b[0] - a[0]) / l;
      if (nx + ny > 0) { nx = -nx; ny = -ny; }
      const w = (i ? w2 : w1) * .22;
      seg(c, [a[0] + nx * w, a[1] + ny * w], [b[0] + nx * w, b[1] + ny * w]);
    }
  }
  // Pelsstrå langs et lem (til de strithårede)
  function limbFur(c, J, w, col) {
    c.strokeStyle = col; c.lineWidth = .035; c.beginPath();
    for (let i = 0; i < 2; i++) for (let k = 0; k < 4; k++) {
      const u = (k + .5) / 4, x = J[i][0] + (J[i + 1][0] - J[i][0]) * u, y = J[i][1] + (J[i + 1][1] - J[i][1]) * u;
      c.moveTo(x + w * .3, y); c.quadraticCurveTo(x + w * .55, y + .1, x + w * .2, y + .2);
    }
    c.stroke();
  }

  function hand(c, x, y, ang, r, col) {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.lineWidth = r * .62; c.strokeStyle = dk(col, .5);
    c.beginPath(); for (let i = -1; i <= 1; i++) { c.moveTo(r * .7, i * r * .38); c.lineTo(r * 1.4, i * r * .5); } c.stroke();
    c.lineWidth = r * .46; c.strokeStyle = col; c.stroke();
    ell(c, r * .2, 0, r * 1.1, r * .85, 0, shade(c, 0, 0, r, col), .03);
    c.restore();
  }
  // Hånd, der griber om liane: knytnæve med fingre foran
  function fist(c, col) {
    ell(c, 0, 0, .15, .19, 0, shade(c, 0, 0, .19, col), .035);
    c.strokeStyle = dk(col, .5); c.lineWidth = .03; c.beginPath();
    for (let i = -1; i <= 1; i++) { c.moveTo(.06, i * .07); c.quadraticCurveTo(.2, i * .07, .17, i * .07 + .05); }
    c.stroke();
  }
  function foot(c, x, y, ang, len, wid, col) {
    c.save(); c.translate(x, y); c.rotate(ang);
    ell(c, len * .3, 0, len, wid, 0, shade(c, len * .3, 0, len, col), .03);
    c.fillStyle = dk(col, .35);
    c.beginPath(); for (let i = -1; i <= 1; i++) { c.moveTo(len * 1.3, i * wid * .55); c.arc(len * 1.15, i * wid * .55, wid * .26, 0, PI2); } c.fill();
    c.restore();
  }

  // ---------- Hale ----------
  function tailPts(x, y, a, len, n, kf) {
    const pts = [[x, y]], ds = len / n;
    for (let i = 1; i <= n; i++) { a += kf((i - .5) / n) * ds; x += cos(a) * ds; y += sin(a) * ds; pts.push([x, y]); }
    return pts;
  }
  function tailPath(s, P, t) {
    const k = s.tail, m = P.mode, hip = P.hip;
    if (!k.t || k.t === "none") return null;
    let L = k.len;
    const n = k.t === "curl" ? 18 : 16, sw = (u, p) => sin(t * 1.4 + u * 3.2 + p);
    const curl = k.t === "curl" ? (u) => (u > .55 ? 11 * (u - .55) : 0) : () => 0;
    let x = hip[0] - .22, y = hip[1] + .2, a, kf;
    if (k.t === "ringS") {
      const A = 1.9 * (1 + .12 * sin(t * 1.1));
      if (m === "swing") { a = PI / 2 + .5; L *= .75; kf = (u) => A * .7 * sin(PI * 2 * u + t * 1.3); }
      else if (m === "fly") { a = PI + .2; L *= .6; kf = (u) => A * .6 * sin(PI * 2 * u - t * 2.5); }
      else { x = hip[0] - .35; y = hip[1] - .1; a = -PI / 2 - .5; L *= .8; kf = (u) => 1.4 * A * sin(PI * 2 * u) / 1.9 + .1 * sin(t * 1.5); }
    } else if (m === "swing") {
      a = PI / 2 + .4; kf = (u) => .6 * sw(u, 0) - .5 + curl(u) * .8; L *= .62;
    } else if (m === "fly") {
      a = PI + .1; kf = (u) => .45 * sin(t * 3 - u * 5) + curl(u) * .5; L *= .6;
    } else {
      y = hip[1] + .3; a = PI - .2 + (m === "dizzy" ? .15 : 0);
      kf = (u) => (k.t === "short" ? 1.8 * u + .5 * sw(u, 0) : -.1 + 4 * u * u + .3 * sw(u, 0) + curl(u));
      L *= .66;
    }
    return tailPts(x, y, a, L, n, kf);
  }
  function drawTail(c, s, pts) {
    const k = s.tail, n = pts.length - 1;
    const wAt = (i) => { const u = i / n; return k.w * (k.t === "bushy" ? .55 + .6 * sin(u * 2.4 + .2) : 1 - .42 * u); };
    const colAt = (i) => {
      const u = i / n;
      if (k.rings) return i === n - 1 || i === n - 2 ? k.tip : (i % 2 ? k.rings : k.c);
      return k.tip && u > .84 ? k.tip : k.c;
    };
    c.strokeStyle = dk(k.c, .55);
    for (let i = 0; i < n; i++) { c.lineWidth = wAt(i) + .05; seg(c, pts[i], pts[i + 1]); }
    for (let i = 0; i < n; i++) { c.strokeStyle = colAt(i); c.lineWidth = wAt(i); seg(c, pts[i], pts[i + 1]); }
    // lys kant langs oversiden
    c.strokeStyle = "rgba(255,255,255,.16)"; c.lineWidth = k.w * .25; c.beginPath();
    for (let i = 0; i < n - 1; i++) c.lineTo(pts[i][0] - .015, pts[i][1] - .02);
    c.stroke();
  }

  // ---------- Banan ----------
  function banana(c, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], l = hyp(dx, dy) || 1;
    const q = [(a[0] + b[0]) / 2 - dy / l * l * .22, (a[1] + b[1]) / 2 + dx / l * l * .22];
    // skræl, der er trukket ned fra den ene ende
    for (let i = -1; i <= 1; i++) {
      const ex = a[0] + i * .2 - dy / l * .05, ey = a[1] + .36 + (i === 0 ? .06 : 0);
      c.strokeStyle = "#b8901e"; c.lineWidth = .15;
      c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(a[0] + i * .22, a[1] + .12, ex, ey); c.stroke();
      c.strokeStyle = "#f3d13c"; c.lineWidth = .1; c.stroke();
    }
    const path = () => { c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(q[0], q[1], b[0], b[1]); };
    c.strokeStyle = "#9a7418"; c.lineWidth = .27; path(); c.stroke();
    c.strokeStyle = "#f6d83e"; c.lineWidth = .21; path(); c.stroke();
    c.strokeStyle = "#fff3a6"; c.lineWidth = .06; c.beginPath(); c.moveTo(a[0] + .03, a[1] - .04); c.quadraticCurveTo(q[0] + .03, q[1] - .02, b[0] + .01, b[1] + .06); c.stroke();
    ell(c, b[0], b[1], .08, .07, 0, "#5a3a14");
  }

  // ---------- Øjne ----------
  function eyeIris(c, x, y, r, iris) {
    ell(c, x, y, r, r, 0, "#17110e");
    ell(c, x, y, r * .88, r * .88, 0, rad(c, x, y, r * .1, r * .9, [[0, lt(iris, .35)], [.7, iris], [1, dk(iris, .35)]], x, y));
    ell(c, x + r * .05, y, r * .45, r * .5, 0, "#05060a");
    ell(c, x - r * .3, y - r * .34, r * .26, r * .26, 0, "rgba(255,255,255,.95)");
    ell(c, x + r * .3, y + r * .3, r * .1, r * .1, 0, "rgba(255,255,255,.55)");
  }
  function spiralEye(c, x, y, r, t) {
    ell(c, x, y, r * 1.05, r * 1.05, 0, "#f6f1e4", .03);
    c.strokeStyle = "#2a2230"; c.lineWidth = r * .22; c.beginPath();
    for (let i = 0; i <= 26; i++) { const a = i * .55 + t * 2.2, rr = r * .86 * i / 26; c.lineTo(x + cos(a) * rr, y + sin(a) * rr); }
    c.stroke();
  }

  // ---------- Hoved ----------
  function mouthPos(s, h) {
    const z = s.muz, lx = (z.x + z.rx * .8) * s.hr, ly = (z.y + z.ry * .3) * s.hr, cr = cos(h.rot), sr = sin(h.rot);
    return [h.x + lx * cr - ly * sr, h.y + lx * sr + ly * cr];
  }

  function drawHead(c, s, h, t) {
    const f = s.face, z = s.muz, e = s.eye, ea = s.ear, sk = s.skull, mo = h.mo;
    c.save(); c.translate(h.x, h.y); c.rotate(h.rot); c.scale(s.hr, s.hr);
    if (s.pre) s.pre(c, s, h);
    if (s.fringe) tufts(c, 0, 0, sk.rx, sk.ry, 0, s.fringe[0], s.fringe[1], s.fringe[2], s.fringe[3], s.fringe[4] || s.fur);
    const ear = (x, y, k, col) => {
      ell(c, x, y, ea.r * k, ea.r * ea.ry * k, ea.rot, shade(c, x, y, ea.r * k, col), .035);
      ell(c, x + ea.r * .08, y + ea.r * .05, ea.r * .55 * k, ea.r * ea.ry * .55 * k, ea.rot, ea.in);
    };
    if (ea.r > 0 && ea.fx !== undefined) ear(ea.fx, ea.fy, .92, dk(ea.c, .2));
    if (ea.r > 0 && ea.behind) ear(ea.x, ea.y, 1, ea.c);
    ell(c, 0, 0, sk.rx, sk.ry, 0, shade(c, 0, 0, 1, s.fur), .04);
    c.strokeStyle = dk(s.fur, .4); c.lineWidth = .03; c.beginPath();
    for (let i = 0; i < 8; i++) { const a = PI * (1.12 + i * .1); c.moveTo(cos(a) * .5 * sk.rx, sin(a) * .5 * sk.ry); c.quadraticCurveTo(cos(a - .08) * .7, sin(a) * .72, cos(a - .04) * .9 * sk.rx, sin(a) * .88 * sk.ry); }
    c.stroke();
    if (s.mid) s.mid(c, s, h);
    if (ea.r > 0 && !ea.behind) ear(ea.x, ea.y, 1, ea.c);

    // ansigt
    ell(c, f.x, f.y, f.rx, f.ry, 0, shade(c, f.x, f.y, f.ry, f.c, .7), .035);
    if (s.deco) s.deco(c, s, h);
    // øjenpletter / øjenringe og brynsryg
    const eyes = [[e.x, e.y, e.r], [e.x + e.dx, e.y + .03, e.r * .82]];
    if (s.patch.c) for (const p of eyes) ell(c, p[0] + (s.patch.dx || 0), p[1] + (s.patch.dy || 0), s.patch.rx * p[2] / e.r, s.patch.ry * p[2] / e.r, s.patch.rot, s.patch.c);
    if (s.brow.ridge) ell(c, e.x + e.dx * .5, e.y - e.r * 1.55, e.dx * .5 + e.r * 1.9, e.r * 1.05, -.05, s.brow.ridge);

    // mund og snude
    const mx = z.x, my = z.y, rx = z.rx, ry = z.ry;
    const ri = ry * (.05 + .6 * mo);
    if (mo > .06) {
      ell(c, mx + rx * .05, my + ry * .9 + ri + ry * .28, rx * .78, ry * .5, 0, shade(c, mx, my + ry * 1.2, ry, z.c, .6), .03);
      if (z.lc) ell(c, mx + rx * .12, my + ry * .92, rx * .82, ri + ry * .2, 0, z.lc);
      ell(c, mx + rx * .12, my + ry * .92, rx * .74, ri, 0, "#4a1620");
      if (mo > .3) ell(c, mx + rx * .12, my + ry * .92 + ri * .5, rx * .45, ri * .55, 0, "#e87a86");
      if (h.tongue) { ell(c, mx + rx * .3, my + ry * 1.5 + ri * .6, rx * .3, ry * .75, 0, "#ec7c88", .03); c.strokeStyle = "rgba(150,40,60,.6)"; c.lineWidth = .025; seg(c, [mx + rx * .3, my + ry * 1.2], [mx + rx * .3, my + ry * 1.75]); }
    } else {
      ell(c, mx - rx * .05, my + ry * .62, rx * .8, ry * .55, 0, shade(c, mx, my + ry, ry, z.c, .5));
    }
    ell(c, mx, my, rx, ry, 0, shade(c, mx, my, ry * 1.1, z.c, .7), .035);
    if (mo <= .06) {
      if (z.lip) ell(c, mx + rx * .12, my + ry * .68, rx * .72, ry * .3, 0, z.lc);
      c.strokeStyle = z.lc ? dk(z.lc, .45) : dk(z.c, .5); c.lineWidth = .035;
      c.beginPath(); c.moveTo(mx - rx * .3, my + ry * .56); c.quadraticCurveTo(mx + rx * .35, my + ry * 1.05, mx + rx * .95, my + ry * .55); c.stroke();
    }

    // øjne
    const q = (t + s.ph) % 4.8, bl = h.eye === "dizzy" ? 0 : (q < .18 ? sin(q / .18 * PI) : 0);
    for (let i = 0; i < 2; i++) {
      const p = eyes[i];
      if (h.eye === "dizzy") { spiralEye(c, p[0], p[1], p[2] * 1.15, t * (i ? -1 : 1)); continue; }
      if (bl > .6) {
        c.strokeStyle = "#1e1410"; c.lineWidth = .05; c.beginPath(); c.moveTo(p[0] - p[2], p[1]); c.quadraticCurveTo(p[0], p[1] + p[2] * .9, p[0] + p[2], p[1]); c.stroke();
        continue;
      }
      if (e.k === "iris") eyeIris(c, p[0], p[1], p[2], e.iris);
      else eyeDark(c, p[0], p[1], p[2], e.c);
    }
    // bryn
    if (s.brow.w > 0) {
      c.strokeStyle = s.brow.c; c.lineWidth = s.brow.w; c.beginPath();
      const up = h.eye === "dizzy" ? -.05 : 0;
      for (let i = 0; i < 2; i++) { const p = eyes[i], r = p[2]; c.moveTo(p[0] - r * 1.3, p[1] - r * 1.5 + up); c.quadraticCurveTo(p[0], p[1] - r * 2.2 + up, p[0] + r * 1.3, p[1] - r * 1.5 + up + (i ? .03 : -.03)); }
      c.stroke();
    }
    // næse
    const n = s.nose;
    if (n.t === "tip") {
      ell(c, mx + rx * .88, my - ry * .35, n.r * 1.5, n.r * 1.2, -.3, n.c);
      ell(c, mx + rx * .84, my - ry * .45, n.r * .5, n.r * .35, 0, "rgba(255,255,255,.55)");
    } else {
      const k = n.t === "wide" ? 1.5 : 1;
      ell(c, mx + rx * .5, my - ry * .2, n.r * 1.4 * k, n.r * k, .4, n.c);
      ell(c, mx + rx * .86, my - ry * .28, n.r * 1.2 * k, n.r * .9 * k, .3, n.c);
    }
    if (s.post) s.post(c, s, h, t);
    c.restore();
  }

  // ---------- Krop ----------
  function drawTorso(c, s, P) {
    const hip = P.hip, sh = P.sh, g = s.tw;
    const dx = sh[0] - hip[0], dy = sh[1] - hip[1], l = hyp(dx, dy), ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
    const cx = (hip[0] + sh[0]) / 2, cy = (hip[1] + sh[1]) / 2, rot = Math.atan2(dy, dx), rx = l / 2 + g * .62;
    if (s.shag) tufts(c, cx, cy, rx, g, rot, PI * 1.02, PI * 1.98, 9, .2, s.shag);
    if (s.hump) ell(c, sh[0] - nx * g * .3 - ux * .08, sh[1] - ny * g * .3 - uy * .08, s.hump, s.hump * .9, 0, s.fur, .04); // brede skuldre
    if (s.rump) { // bagdelen titter frem bag kroppen
      const r = s.rump;
      ell(c, hip[0] - nx * g * .72 - ux * g * .3, hip[1] - ny * g * .72 - uy * g * .3, r.r, r.r * .9, 0, shade(c, hip[0], hip[1], r.r, r.c, .4));
    }
    ell(c, cx, cy, rx, g, rot, shade(c, cx, cy, g + l * .3, s.fur), .04);
    if (s.saddle) ell(c, cx - nx * g * .38 + ux * l * .12, cy - ny * g * .38 + uy * l * .12, l * .42 + g * .2, g * .46, rot, shade(c, cx, cy, g + l * .3, s.saddle, .7));
    if (s.belly) ell(c, cx + nx * g * .36, cy + ny * g * .36, l / 2 + g * .3, g * .6, rot, shade(c, cx, cy, g + l * .3, s.belly, .7));
    if (s.flank) ell(c, cx - ux * l * .18 - nx * g * .05, cy - uy * l * .18 - ny * g * .05, l * .4, g * .42, rot, shade(c, cx, cy, g, s.flank, .7));
    if (s.cape) ell(c, sh[0] - ux * .05 + nx * g * .1, sh[1] - uy * .05 + ny * g * .1, g * .85, g * .8, rot, shade(c, sh[0], sh[1], g * .8, s.cape, .7));
    // pelsstrå
    c.save(); c.translate(cx, cy); c.rotate(rot);
    c.strokeStyle = dk(s.fur, .4); c.lineWidth = .028; c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (((i * .37) % 1) - .5) * (l + g * .8), b = (((i * .61 + .1) % 1) - .5) * g * 1.4;
      c.moveTo(a, b); c.quadraticCurveTo(a - .07, b + .02, a - .15, b + .01);
    }
    c.stroke(); c.restore();
  }

  // ---------- Poser ----------
  function pose(s, o) {
    const t = o.t || 0, m = ["swing", "fly", "eat", "dizzy"].includes(o.mode) ? o.mode : "sit";
    const tl = s.tl, hr = s.hr, A = s.arm[0] + s.arm[1], Lg = s.leg[0] + s.leg[1], g = s.tw;
    const P = { mode: m, mo: 0, eye: "open", tongue: false, sway: 0, ax: 0, ay: 1, k: s.sc };
    const add = (p, x, y) => [p[0] + x, p[1] + y];
    let hip, sh, hd, rot = 0, aN, aF, lN, lF, pa = [-.5, 1], pl = [.4, -1], footAng = .05;
    const spine = (hp, a) => [hp[0] + tl * sin(a), hp[1] - tl * cos(a)];
    if (m === "swing") {
      const w = sin(t * 2.2);
      P.sway = .12 * w; P.ay = 0; P.ax = 0;
      sh = [-.1, A * .97]; hip = [sh[0] + tl * sin(.12 + .05 * w), sh[1] + tl * cos(.12)];
      hd = add(sh, hr * .75, hr * .12); rot = -.12;
      aN = [[0, 0], [-1, 0]]; aF = [add(sh, .62 + .3 * sin(t * 2.2 + 1.7), A * .66), [-.3, .6]];
      lN = [add(hip, .12 + .3 * sin(t * 2.2 + .6), Lg * .8), [.8, .2]]; lF = [add(hip, -.1 + .3 * sin(t * 2.2 + 2.1), Lg * .76), [.8, .2]];
      footAng = -.8;
      const ext = (sh[1] + tl + Lg * .8 + .2) * s.sc;
      P.k = s.sc * Math.min(1, 2.62 / ext);
    } else if (m === "fly") {
      const b = sin(t * 2.6) * .04;
      P.ay = 0; hip = [-.55, .3 + b]; sh = [hip[0] + tl * cos(-.4), hip[1] + tl * sin(-.4)];
      hd = add(sh, hr * .8, -hr * .1); rot = -.15; P.mo = .75;
      aN = [add(sh, .9, -1.1), [0, 1]]; aF = [add(sh, 1.3, -.9), [0, 1]];
      lN = [add(hip, -1, .5 + .08 * sin(t * 3)), [0, 1]]; lF = [add(hip, -.85, .85 + .08 * sin(t * 3 + 1)), [0, 1]];
      footAng = PI - .25;
    } else {
      const dz = m === "dizzy", lean = dz ? .55 : s.lean;
      const br = sin(t * 1.7) * .012;
      hip = [-.3, 1 - g * (dz ? .6 : .9)]; sh = spine(hip, lean); sh[1] -= br;
      const d = dz ? [s.hd[0] + .1, s.hd[1] + .3] : s.hd;
      hd = add(sh, hr * d[0], hr * d[1] - br);
      if (dz) { P.mo = .45; P.tongue = true; P.eye = "dizzy"; hd[0] += sin(t * 1.7) * .08; rot = sin(t * 1.7) * .2; }
      else rot = sin(t * .8) * .04;
      const sa = s.sitHand;
      aN = [add(sh, sa[0], sa[1]), pa]; aF = [add(sh, sa[0] + .4, sa[1] + .06), pa];
      if (dz) { aN[0] = [sh[0] + .55, .93]; aF[0] = [sh[0] + .95, .95]; }
      lN = [[.42, .92], pl]; lF = [[.8, .94], pl];
    }
    if (m === "eat") {
      const mid = .12 + .13 * (.5 + .5 * sin(t * 5));
      P.mo = mid; hd[1] -= .015 * sin(t * 5);
      P.mouth = mouthPos(s, { x: hd[0], y: hd[1], rot });
      aN = [add(P.mouth, -.1, .62), [-.4, 1]];
    }
    P.hip = hip; P.sh = sh; P.head = { x: hd[0], y: hd[1], rot, mo: P.mo, eye: P.eye, tongue: P.tongue };
    const aw = s.arm, lw = s.leg;
    const gx = m === "fly" || m === "swing" ? 0 : .04;
    P.lgN = ik(add(hip, gx, .06), lN[0], lw[0], lw[1], lN[1]);
    P.lgF = ik(add(hip, -gx - .03, .04), lF[0], lw[0], lw[1], lF[1]);
    // hænderne hviler på knæene (ellers på jorden)
    if ((m === "sit") && s.rest === "knee") { aN[0] = add(P.lgN[1], .06, -.04); aF[0] = add(P.lgF[1], .04, -.03); }
    P.arN = ik(add(sh, .02, .03), aN[0], aw[0], aw[1], aN[1]);
    P.arF = ik(add(sh, -.04, .02), aF[0], aw[0], aw[1], aF[1]);
    P.footAng = footAng;
    P.tail = tailPath(s, P, t);
    return P;
  }

  function drawFoot(c, s, J, P, col) {
    const f = J[2], a = J[1], dir = Math.atan2(f[1] - a[1], f[0] - a[0]);
    const ang = P.footAng === .05 ? .05 : (P.mode === "swing" ? dir - .8 : dir);
    foot(c, f[0], f[1], ang, s.lw * .62, s.lw * .42, col);
  }
  function drawHandAt(c, s, J, col) {
    const h = J[2], a = J[1];
    hand(c, h[0], h[1], Math.atan2(h[1] - a[1], h[0] - a[0]), s.aw * .62, col);
  }

  function ape(c, s, o) {
    const t = o.t || 0, P = pose(s, o), m = P.mode;
    c.save();
    c.lineCap = c.lineJoin = "round";
    if (P.sway) c.rotate(P.sway);
    c.translate(P.ax, P.ay); c.scale(P.k, P.k); c.translate(-P.ax, -P.ay);
    if (P.tail) drawTail(c, s, P.tail);
    // fjerne lemmer
    limb(c, P.arF, s.aw * .95, s.aw * .8, dk(s.limb, .18));
    if (s.shagLimb) limbFur(c, P.arF, s.aw, dk(s.limb, .3));
    drawHandAt(c, s, P.arF, dk(s.hand, .18));
    limb(c, P.lgF, s.lw * 1.2, s.lw * .8, dk(s.legc, .18));
    drawFoot(c, s, P.lgF, P, dk(s.foot, .18));
    drawTorso(c, s, P);
    limb(c, P.lgN, s.lw * 1.35, s.lw * .88, s.legc);
    if (s.shagLimb) limbFur(c, P.lgN, s.lw, dk(s.legc, .3));
    drawFoot(c, s, P.lgN, P, s.foot);
    const nearArm = () => {
      limb(c, P.arN, s.aw * 1.1, s.aw * .85, s.limb);
      if (s.shagLimb) limbFur(c, P.arN, s.aw, dk(s.limb, .3));
      if (m === "eat") banana(c, [P.arN[2][0], P.arN[2][1] - .02], P.mouth);
      if (m === "swing") fist(c, s.hand);
      else drawHandAt(c, s, P.arN, s.hand);
    };
    if (m === "fly") nearArm(); // armene rækker op bag hovedet, så ansigtet ses
    drawHead(c, s, P.head, t);
    if (m !== "fly") nearArm();
    if (s.finger) { // aye-ayens lange tynde langfinger (i swing på den hængende hånd)
      const J = m === "swing" ? P.arF : P.arN, h = J[2], e = J[1];
      const a = m === "fly" ? Math.atan2(h[1] - e[1], h[0] - e[0]) : (m === "swing" ? 1.1 : -.8);
      const p1 = [h[0] + cos(a) * .42, h[1] + sin(a) * .42], p2 = [p1[0] + cos(a + .5) * .34, p1[1] + sin(a + .5) * .34];
      c.strokeStyle = "#17110e"; c.lineWidth = .085; c.beginPath(); c.moveTo(h[0], h[1]); c.lineTo(p1[0], p1[1]); c.lineTo(p2[0], p2[1]); c.stroke();
      c.strokeStyle = "#5a463c"; c.lineWidth = .04; c.stroke();
      ell(c, p2[0], p2[1], .055, .055, 0, "#d8a89c", .02);
    }
    c.restore();
  }

  // ---------- Registrering ----------
  const DEF = {
    sc: 1, tl: .78, tw: .5, hr: .58, lean: .2, hd: [.7, -.85], sitHand: [.5, 1.1], rest: "knee",
    arm: [.62, .6], leg: [.6, .55], aw: .2, lw: .24,
    fur: "#6a4a30",
    skull: { rx: 1, ry: .96 },
    face: { c: "#d8a98a", x: .44, y: .14, rx: .6, ry: .6 },
    muz: { x: .8, y: .38, rx: .36, ry: .28, c: null, lc: null },
    nose: { t: "dots", c: "#2a1a14", r: .04 },
    eye: { k: "dark", x: .3, dx: .5, y: -.1, r: .16, c: "#2e2018", iris: "#e0a020" },
    brow: { c: null, w: .07, ridge: null },
    ear: { x: -.7, y: .05, r: .3, ry: 1, rot: 0, c: null, in: null, behind: false },
    tail: { t: "none" },
    patch: { c: null, rx: .24, ry: .18, rot: 0 }
  };
  const NEST = ["skull", "face", "muz", "nose", "eye", "brow", "ear", "tail", "patch"];
  function L(id, kind, p) {
    const s = Object.assign({}, DEF, p);
    for (const k of NEST) s[k] = Object.assign({}, DEF[k], p[k]);
    s.aw = (p.aw || DEF.aw) * 1.4; s.lw = (p.lw || DEF.lw) * 1.3;
    s.limb = p.limb || p.fur; s.legc = p.legc || s.limb;
    s.hand = p.hand || dk(s.limb, .2); s.foot = p.foot || s.hand;
    if (!s.muz.c) s.muz.c = lt(s.face.c, .14);
    if (!s.brow.c) s.brow.c = dk(s.fur, .25);
    if (!s.ear.c) s.ear.c = s.face.c;
    if (!s.ear.in) s.ear.in = dk(s.ear.c, .22);
    s.ph = (id.length * 1.7) % 3;
    T.look(id, kind, s);
  }
  T.addKind("ape", ape);
  T.addKind("halvabe", ape);

  // ===== De otte spilbare aber =====
  L("chimpanse", "ape", {
    fur: "#3f2d22", belly: "#4c382b", hand: "#d9a889", foot: "#c99a7e", arm: [.66, .64], leg: [.58, .54], aw: .21, lw: .25, tw: .52,
    rump: { c: "#fff8ee", r: .17 },
    face: { c: "#e2b595", x: .44, y: .16, rx: .66, ry: .64 }, muz: { x: .82, y: .4, rx: .4, ry: .3, c: "#eecdae", lc: "#b97d68" },
    brow: { c: "#2b1e17", w: .08, ridge: "#c99679" },
    ear: { x: -.62, y: .12, r: .36, c: "#dba88a", in: "#b98466" },
    fringe: [PI * 1.05, PI * 1.95, 8, .1],
    post: (c) => { // hårtopper i panden
      c.fillStyle = "#3f2d22"; c.beginPath(); c.moveTo(-.2, -.78); c.quadraticCurveTo(.4, -.98, .95, -.62); c.quadraticCurveTo(.5, -.62, .2, -.42); c.quadraticCurveTo(-.05, -.55, -.2, -.78); c.fill();
    }
  });

  L("doedningehovedabe", "ape", {
    sc: .88, fur: "#8f8a60", belly: "#efe3bd", limb: "#e8a43a", legc: "#e8a43a", hand: "#e08a2c", foot: "#df8428",
    tl: .62, tw: .4, hr: .62, arm: [.5, .5], leg: [.52, .5], aw: .15, lw: .17, lean: .15, hd: [.7, -.78],
    skull: { rx: 1, ry: .97 },
    face: { c: "#f7f3ea", x: .5, y: .14, rx: .66, ry: .66 },
    muz: { x: .86, y: .4, rx: .34, ry: .27, c: "#33292a", lc: "#6a4a50" }, nose: { t: "dots", c: "#0e0a0a", r: .035 },
    eye: { k: "dark", x: .34, dx: .46, y: -.1, r: .17, c: "#241812" }, brow: { c: "#2e2826", w: .06 },
    ear: { x: -.6, y: .06, r: .27, c: "#f4efe4", in: "#ddc7b8" },
    tail: { t: "long", len: 1.9, w: .11, c: "#8f8a60", tip: "#25201e" },
    fringe: [PI * 1.08, PI * 1.92, 7, .1],
    mid: (c) => { ell(c, .45, -.38, .5, .3, 0, "#f7f3ea"); }
  });

  L("gorilla", "ape", {
    fur: "#34343b", saddle: "#a8adb6", hump: .44, rest: "ground", tw: .72, tl: .8, hr: .64, lean: .35, hd: [.55, -.5], sitHand: [.55, 1.1],
    arm: [.8, .74], leg: [.44, .4], aw: .31, lw: .3, hand: "#26262c", foot: "#26262c", shagLimb: true,
    skull: { rx: 1, ry: 1 },
    face: { c: "#2d2528", x: .46, y: .2, rx: .62, ry: .6 }, muz: { x: .8, y: .42, rx: .42, ry: .3, c: "#42363a", lc: "#6a5358" },
    nose: { t: "wide", c: "#0e0a0b", r: .05 }, brow: { c: "#17141a", w: .12, ridge: "#1c181b" },
    eye: { k: "dark", x: .3, dx: .5, y: -.02, r: .15, c: "#4a2e1c" },
    ear: { x: -.5, y: .22, r: .17, c: "#2f2629" },
    pre: (c) => { ell(c, -.35, -.8, .62, .46, -.4, "#34343b", .04); } // pandeknold bag issen
  });

  L("orangutang", "ape", {
    fur: "#c25a22", rest: "ground", tw: .56, tl: .8, hr: .6, arm: [.86, .8], leg: [.46, .42], aw: .25, lw: .26, lean: .25, hd: [.65, -.75],
    hand: "#7a4e3e", foot: "#7a4e3e", shag: "#b54f1d", shagLimb: true,
    skull: { rx: 1.02, ry: 1 }, fringe: [PI * .95, PI * 2.05, 11, .16, "#cf6a28"],
    face: { c: "#6d4a40", x: .46, y: .18, rx: .74, ry: .66 }, muz: { x: .82, y: .46, rx: .4, ry: .27, c: "#8b6454", lc: "#4a2e28" },
    eye: { k: "dark", x: .3, dx: .5, y: -.06, r: .15, c: "#2a1a14" }, brow: { c: "#4a2c20", w: .06 },
    patch: { c: "#dcc0a4", rx: .24, ry: .2, rot: 0 }, ear: { r: 0 },
    mid: (c) => { // kindpuder
      ell(c, -.05, .3, .42, .56, .15, shade(c, -.05, .3, .5, "#62423a"), .03);
      ell(c, 1.05, .25, .2, .42, -.1, shade(c, 1.05, .25, .4, "#5c3d36"), .03);
    },
    post: (c) => {
      tufts(c, .72, .78, .3, .3, 0, .1, PI - .1, 5, .75, "#c25a22");
      c.fillStyle = "#c25a22"; c.beginPath(); c.moveTo(.0, -.68); c.quadraticCurveTo(.5, -.9, 1.0, -.5); c.quadraticCurveTo(.55, -.62, .0, -.4); c.fill();
    }
  });

  L("rhesusabe", "ape", {
    fur: "#a28b69", belly: "#dccaa2", flank: "#c3925d", rump: { c: "#d94a4a", r: .22 }, hand: "#d49a85", foot: "#d49a85",
    tl: .74, tw: .5, arm: [.6, .58], leg: [.56, .5], aw: .19, lw: .22,
    face: { c: "#eca696", x: .46, y: .16, rx: .64, ry: .62 }, muz: { x: .82, y: .4, rx: .38, ry: .28, c: "#f0b4a6", lc: "#a8504a" },
    brow: { c: "#4a3624", w: .12, ridge: "#d0867a" }, eye: { k: "dark", x: .32, dx: .46, y: -.06, r: .16, c: "#3a2412" },
    ear: { x: -.62, y: .1, r: .3, c: "#eca696", in: "#c9766c" }, fringe: [PI * 1.05, PI * 1.95, 9, .1, "#8d7656"],
    tail: { t: "short", len: .8, w: .13, c: "#a28b69" },
    post: (c) => {
      c.fillStyle = "#8d7656"; c.beginPath(); c.moveTo(-.4, -.7); c.quadraticCurveTo(.3, -1.0, 1.0, -.6); c.lineTo(.9, -.45); c.lineTo(.7, -.55); c.lineTo(.5, -.4); c.lineTo(.3, -.55); c.lineTo(.05, -.38); c.lineTo(-.1, -.5); c.closePath(); c.fill();
    }
  });

  L("toque_makak", "ape", {
    fur: "#a85a32", belly: "#ecd6aa", hand: "#d9a38d", foot: "#d9a38d", tl: .74, tw: .48, arm: [.6, .58], leg: [.56, .5], aw: .18, lw: .21,
    face: { c: "#eeaa9a", x: .46, y: .16, rx: .62, ry: .6 }, muz: { x: .82, y: .4, rx: .36, ry: .27, c: "#f2bcae", lc: "#b05a52" },
    eye: { k: "dark", x: .32, dx: .46, y: -.06, r: .17, c: "#3a2212" }, brow: { c: "#6a4026", w: .07 },
    ear: { x: -.6, y: .1, r: .3, c: "#eeaa9a", in: "#cc7a72" }, skull: { rx: 1, ry: .95 },
    tail: { t: "long", len: 2.0, w: .12, c: "#a85a32", tip: "#8a4626" },
    post: (c) => { // "kasket" af hår, der stråler ud fra issen
      c.fillStyle = shade(c, 0, -.6, 1, "#c58648", .6); c.beginPath(); c.ellipse(0, 0, 1.03, .98, 0, PI, PI * 1.8);
      c.lineTo(.62, -.27); c.lineTo(.5, -.44); c.lineTo(.3, -.2); c.lineTo(.14, -.42); c.lineTo(-.06, -.16); c.lineTo(-.25, -.34); c.lineTo(-.5, -.05); c.lineTo(-.75, -.1); c.closePath(); c.fill();
      c.strokeStyle = "#8a5426"; c.lineWidth = .03; c.beginPath();
      for (let i = 0; i < 11; i++) { const a = PI * (1.05 + i * .075); c.moveTo(-.05, -.72); c.lineTo(-.05 + cos(a) * 1.0, -.72 + (sin(a) + .6) * .5); }
      c.stroke();
    }
  });

  L("ringhalet_maki", "halvabe", {
    sc: .96, fur: "#8f857c", belly: "#f4f0e9", limb: "#a59c93", hand: "#3a3434", foot: "#3a3434", tl: .74, tw: .44, hr: .55,
    arm: [.6, .55], leg: [.66, .6], aw: .15, lw: .19, lean: .1, hd: [.7, -.82], sitHand: [.4, .75],
    skull: { rx: .98, ry: .94 },
    face: { c: "#f7f4ee", x: .5, y: .16, rx: .56, ry: .58 }, muz: { x: 1.0, y: .42, rx: .52, ry: .24, c: "#f7f4ee", lc: "#3a3030" },
    nose: { t: "tip", c: "#1c1618", r: .1 }, eye: { k: "iris", x: .36, dx: .5, y: -.08, r: .2, iris: "#e8a826" },
    patch: { c: "#231e20", rx: .36, ry: .27, rot: -.5 }, brow: { w: 0 },
    ear: { x: -.25, y: -.82, r: .24, ry: 1.2, rot: .2, c: "#8a8077", in: "#e8dfd6", fx: .28, fy: -.92 },
    tail: { t: "ringS", len: 2.4, w: .21, c: "#fbfaf6", rings: "#2a2426", tip: "#2a2426" },
    mid: (c) => { tufts(c, .3, .5, .8, .45, 0, .1, PI - .1, 7, .22, "#f4f0e9"); }
  });

  L("kapucinerabe", "ape", {
    sc: .94, fur: "#1f1b1c", cape: "#efe0bf", hand: "#2a2223", foot: "#2a2223", tl: .7, tw: .46, hr: .6,
    arm: [.56, .54], leg: [.52, .5], aw: .17, lw: .2, hd: [.7, -.78],
    face: { c: "#efe2c4", x: .46, y: .16, rx: .6, ry: .62 }, muz: { x: .82, y: .42, rx: .36, ry: .27, c: "#dfb4a0", lc: "#9a5a50" },
    eye: { k: "dark", x: .32, dx: .46, y: -.06, r: .17, c: "#3a2414" }, brow: { c: "#2a1e1a", w: .05 },
    patch: { c: "#dba790", rx: .22, ry: .18, rot: 0 }, ear: { x: -.6, y: .1, r: .28, c: "#e6cfb2", in: "#c9a58f" },
    tail: { t: "curl", len: 1.9, w: .13, c: "#1f1b1c" },
    pre: (c) => { tufts(c, .35, .35, .92, .78, 0, -.2, PI + .2, 12, .13, "#efe0bf"); ell(c, .3, .35, .92, .78, 0, "#efe0bf"); },
    post: (c) => { // sort spids i panden
      c.fillStyle = "#1f1b1c"; c.beginPath(); c.moveTo(-.1, -.85); c.quadraticCurveTo(.5, -.85, .98, -.4); c.quadraticCurveTo(.65, -.4, .5, -.22); c.quadraticCurveTo(.3, -.45, .0, -.45); c.fill();
    }
  });

  // ===== Venner =====
  L("bonobo", "ape", {
    fur: "#1f1b1b", hand: "#8a6a58", foot: "#8a6a58", tl: .82, tw: .4, hr: .55, arm: [.68, .64], leg: [.7, .64], aw: .15, lw: .19, lean: .12,
    face: { c: "#5a463f", x: .46, y: .16, rx: .62, ry: .6 }, muz: { x: .84, y: .4, rx: .4, ry: .3, c: "#7a5e52", lc: "#e8707a", lip: true },
    eye: { k: "dark", x: .32, dx: .46, y: -.06, r: .18, c: "#3a2416" }, brow: { c: "#0e0b0b", w: .06 },
    ear: { x: -.6, y: .12, r: .22, c: "#b58878", in: "#8a5a4e" }, fringe: [PI * 1.0, PI * 2.0, 10, .1],
    mid: (c) => { tufts(c, .0, .4, .7, .6, 0, PI * .55, PI * 1.25, 5, .2, "#1f1b1b"); },
    post: (c) => { // midterskilning
      c.fillStyle = "#1f1b1b"; c.beginPath(); c.moveTo(-.5, -.7); c.quadraticCurveTo(.1, -1.0, .35, -.85); c.quadraticCurveTo(.35, -.6, .5, -.4); c.quadraticCurveTo(0, -.5, -.5, -.3); c.fill();
      c.beginPath(); c.moveTo(.35, -.85); c.quadraticCurveTo(.75, -.8, .95, -.5); c.quadraticCurveTo(.7, -.55, .5, -.4); c.fill();
      c.strokeStyle = "#9a7a68"; c.lineWidth = .05; c.beginPath(); c.moveTo(.34, -.92); c.quadraticCurveTo(.36, -.65, .5, -.4); c.stroke();
    }
  });

  L("naesabe", "ape", {
    fur: "#bd6a38", belly: "#d9a77a", limb: "#cdbba2", legc: "#cdbba2", hand: "#bfae98", foot: "#bfae98", tw: .7, tl: .76, hr: .58,
    arm: [.6, .58], leg: [.55, .5], aw: .18, lw: .22,
    skull: { rx: 1, ry: .96 }, face: { c: "#e6a784", x: .44, y: .16, rx: .6, ry: .6 }, muz: { x: .8, y: .46, rx: .34, ry: .26, c: "#eab592", lc: "#b2625a" },
    eye: { k: "dark", x: .3, dx: .46, y: -.06, r: .16, c: "#2c1a10" }, brow: { c: "#8a4a22", w: .06 }, nose: { t: "dots", c: "#7a3e32", r: .03 },
    ear: { x: -.58, y: .12, r: .24, c: "#e6a784" }, fringe: [PI * 1.0, PI * 2.0, 9, .1, "#e89a44"],
    tail: { t: "long", len: 2.0, w: .13, c: "#bfb4a2" },
    post: (c, s, h, t) => { // den store, hængende næse
      const b = .04 * sin(t * 1.6);
      c.fillStyle = shade(c, 1.4, .3, .6, "#eea682", .8); c.beginPath(); c.moveTo(.95, .04); c.bezierCurveTo(1.4, -.04, 1.9, .14, 1.86, .56 + b); c.bezierCurveTo(1.82, .9 + b, 1.44, .92 + b, 1.32, .64 + b); c.bezierCurveTo(1.2, .4, 1.05, .3, .95, .3); c.closePath(); c.fill();
      c.strokeStyle = OL; c.lineWidth = .035; c.stroke();
      ell(c, 1.56, .8 + b, .1, .06, -.2, "#7a3e32"); c.strokeStyle = "rgba(160,70,60,.5)"; c.lineWidth = .03; seg(c, [1.45, .16], [1.55, .72 + b]);
      ell(c, 1.3, .08, .16, .07, -.2, "rgba(255,255,255,.3)");
    }
  });

  L("hanuman", "ape", {
    fur: "#b9b7ac", belly: "#e6e3d8", hand: "#27231f", foot: "#27231f", tl: .78, tw: .38, hr: .56, arm: [.74, .72], leg: [.74, .68], aw: .13, lw: .16, lean: .15,
    skull: { rx: 1, ry: .96 }, face: { c: "#2b2527", x: .48, y: .14, rx: .6, ry: .62 }, muz: { x: .84, y: .4, rx: .36, ry: .27, c: "#3a3234", lc: "#5a4a4c" },
    eye: { k: "dark", x: .32, dx: .46, y: -.06, r: .16, c: "#6a4818" }, brow: { c: "#f1ebdc", w: .13 },
    ear: { x: -.5, y: .12, r: .2, c: "#2e282a", in: "#4a4044" },
    tail: { t: "long", len: 2.8, w: .1, c: "#b4b2a6", tip: "#6a6862" },
    pre: (c) => { tufts(c, .35, .1, 1.1, 1.1, 0, 0, PI2, 17, .17, "#e8e4d4"); }
  });

  L("lilla_langur", "ape", {
    fur: "#3b2b25", belly: "#4a3830", hand: "#2a201e", foot: "#2a201e", tl: .76, tw: .42, hr: .58, arm: [.68, .66], leg: [.66, .6], aw: .15, lw: .18, lean: .15,
    face: { c: "#463548", x: .5, y: .16, rx: .56, ry: .6 }, muz: { x: .86, y: .42, rx: .36, ry: .26, c: "#54405a", lc: "#7a5a7a" },
    eye: { k: "dark", x: .34, dx: .46, y: -.06, r: .16, c: "#3a2410" }, brow: { c: "#cfc9c0", w: .07 },
    ear: { r: 0 }, fringe: [PI * 1.05, PI * 1.95, 9, .1],
    tail: { t: "long", len: 2.3, w: .12, c: "#3b2b25" },
    mid: (c) => { // bred hvid bakkenbart og skæg
      tufts(c, .2, .35, .95, .72, 0, -.15, PI + .15, 11, .28, "#e2ded6"); ell(c, .2, .35, .95, .72, 0, "#e2ded6");
    }
  });

  L("loris", "halvabe", {
    sc: .82, fur: "#b79d78", belly: "#e8dec9", hand: "#d2b8a0", foot: "#d2b8a0", tl: .56, tw: .38, hr: .66, arm: [.55, .5], leg: [.5, .48], aw: .11, lw: .13, lean: .3, hd: [.65, -.78], sitHand: [.45, .75],
    skull: { rx: .98, ry: .96 }, face: { c: "#cdb593", x: .46, y: .14, rx: .62, ry: .62 }, muz: { x: .98, y: .4, rx: .3, ry: .2, c: "#d8c6a6", lc: "#6a4a40" },
    nose: { t: "tip", c: "#d28a86", r: .06 }, eye: { k: "dark", x: .14, dx: .66, y: -.04, r: .28, c: "#1c1410" }, brow: { w: 0 },
    patch: { c: "#4a3a32", rx: .37, ry: .36, rot: 0 }, ear: { x: -.5, y: -.3, r: .15, c: "#b79d78", in: "#d8a8a0" },
    deco: (c) => { ell(c, .5, -.35, .075, .62, 0, "#f4efe3"); ell(c, .6, .12, .12, .3, -.15, "#f4efe3"); } // lys lodret stribe mellem øjnene
  });

  L("sifaka", "halvabe", {
    fur: "#f5f1e6", cape: "#5a3a27", hand: "#2a211e", foot: "#2a211e", tl: .84, tw: .45, hr: .55, arm: [.52, .5], leg: [.82, .78], aw: .15, lw: .2, lean: .06, hd: [.7, -.8], sitHand: [.4, .65],
    skull: { rx: 1, ry: .96 }, face: { c: "#231c1d", x: .5, y: .16, rx: .54, ry: .58 }, muz: { x: .9, y: .4, rx: .4, ry: .26, c: "#2e2527", lc: "#4a3a3c" },
    nose: { t: "tip", c: "#0e0a0b", r: .07 }, eye: { k: "iris", x: .34, dx: .48, y: -.08, r: .19, iris: "#e9a824" }, brow: { w: 0 },
    ear: { r: 0 },
    tail: { t: "long", len: 2.1, w: .17, c: "#efe9db", tip: "#c9c0ae" },
    pre: (c) => { tufts(c, .2, .25, 1.05, .95, 0, -.2, PI + .2, 9, .12, "#f5f1e6"); },
    mid: (c) => { ell(c, 0, -.35, 1.0, .72, 0, shade(c, 0, -.4, .9, "#5a3a27")); }
  });

  L("fingerdyr", "halvabe", {
    fur: "#3a2d26", shag: "#e0d6c6", hand: "#2a211d", foot: "#2a211d", tl: .74, tw: .46, hr: .56, arm: [.56, .52], leg: [.56, .5], aw: .14, lw: .18, lean: .22, finger: true, sitHand: [.45, .85],
    face: { c: "#b8978b", x: .5, y: .2, rx: .56, ry: .56 }, muz: { x: .88, y: .44, rx: .34, ry: .24, c: "#dcbcae", lc: "#8a5a58" },
    nose: { t: "tip", c: "#d8837f", r: .07 }, eye: { k: "iris", x: .32, dx: .46, y: -.04, r: .21, iris: "#f2a424" }, brow: { w: 0 },
    ear: { x: -.5, y: -.55, r: .42, ry: 1.1, rot: -.2, c: "#8c766b", in: "#5a4540" },
    tail: { t: "bushy", len: 2.0, w: .26, c: "#3a2d26" },
    fringe: [PI * 1.0, PI * 2.0, 13, .3, "#e0d6c6"],
    pre: (c) => { tufts(c, 0, 0, 1.0, .96, 0, PI * 1.05, PI * 1.95, 10, .22, "#d8cebe"); }
  });

  L("broleabe", "ape", {
    fur: "#201b1b", flank: "#b97a3c", hand: "#2a2222", foot: "#2a2222", tl: .78, tw: .56, hr: .56, arm: [.62, .6], leg: [.58, .54], aw: .19, lw: .22, lean: .2,
    face: { c: "#2d2527", x: .48, y: .16, rx: .56, ry: .58 }, muz: { x: .84, y: .42, rx: .36, ry: .27, c: "#3e3234", lc: "#5a4648" },
    nose: { t: "dots", c: "#0e0a0b", r: .04 }, eye: { k: "dark", x: .32, dx: .44, y: -.06, r: .16, c: "#5a3a22" }, brow: { c: "#0e0b0b", w: .07 },
    ear: { r: 0 }, fringe: [PI * 1.0, PI * 2.0, 9, .12],
    tail: { t: "curl", len: 2.0, w: .14, c: "#201b1b" },
    mid: (c) => { tufts(c, .35, .5, .85, .75, 0, .05, PI - .05, 9, .5, "#201b1b"); ell(c, .35, .5, .85, .7, 0, "#201b1b"); }
  });
})();
