// Sommerfugle, flyvende farer, edderkopper, tusindben, skorpion og myrer til Hej Banan.
(function () {
  "use strict";
  const T = window.BananTegn;
  const { PI2, mix, dk, lt, eyeDark, lin, rad } = T;
  const sin = Math.sin, cos = Math.cos, PI = Math.PI, max = Math.max, min = Math.min;
  const D = PI / 180;

  // ---------- Fælles små hjælpere ----------
  const ell = (c, x, y, rx, ry, rot) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, PI2); };
  const fillC = (c, col) => { c.fillStyle = col; c.fill(); };
  const strokeC = (c, col, w) => { c.strokeStyle = col; c.lineWidth = w; c.stroke(); };
  const poly = (c, p) => { c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); };
  const bz = (a, b, d, e, t) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * d + t * t * t * e; };
  const rnd = (c) => { c.lineCap = "round"; c.lineJoin = "round"; };

  // Kuppelformet klump med let kontur
  function blob(c, x, y, rx, ry, col, rot, ol, lw) {
    c.save(); c.translate(x, y); c.rotate(rot || 0);
    c.fillStyle = rad(c, 0, 0, 0, max(rx, ry) * 1.1, [[0, lt(col, .32)], [.55, col], [1, dk(col, .4)]], -rx * .3, -ry * .35);
    c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, PI2); c.fill();
    if (ol) strokeC(c, ol, lw || .03);
    c.restore();
  }

  // Tilspidset, svagt krummet klinge (kæber, fingre, sting): peger mod +x fra (0,0)
  function blade(c, len, w, curl) {
    c.beginPath(); c.moveTo(0, -w);
    c.bezierCurveTo(len * .35, -w * 1.1, len * .75, -w * .4 + curl, len, curl);
    c.bezierCurveTo(len * .7, w * .4 + curl * .5, len * .3, w, 0, w); c.closePath();
  }

  // Vrede øjenbryn på et sideøje (facer mod +x)
  function brow(c, x, y, r, col) {
    c.save(); rnd(c); c.beginPath(); c.moveTo(x - r * 1.1, y - r * 1.3); c.lineTo(x + r * 1.05, y - r * .35);
    strokeC(c, col || "#241008", r * .5); c.restore();
  }

  // Bagkrop som en dråbe fra x0 (bred ende) til x1 (spids), halv højde hh
  function drop(c, x0, x1, hh) {
    const L = x0 - x1;
    c.beginPath(); c.moveTo(x0, -hh * .45);
    c.bezierCurveTo(x0 - L * .25, -hh * 1.3, x0 - L * .7, -hh * 1.05, x1, -hh * .08);
    c.bezierCurveTo(x0 - L * .7, hh * 1.1, x0 - L * .25, hh * 1.35, x0, hh * .45); c.closePath();
  }

  // ---------- Sommerfugle ----------
  // Vingen tegnes i eget plan (u frem langs kroppen, v ud langs vingen) og drejes om kroppens akse: én affin transform
  const sh = (s, ...c) => ({ s, c });
  const wpath = (c, w) => { c.beginPath(); c.moveTo(w.s[0], w.s[1]); for (const k of w.c) c.bezierCurveTo(k[0], k[1], k[2], k[3], k[4], k[5]); c.closePath(); };
  const wpt = (w, i, t) => { const p = i ? [w.c[i - 1][4], w.c[i - 1][5]] : w.s; const k = w.c[i]; return [bz(p[0], k[0], k[2], k[4], t), bz(p[1], k[1], k[3], k[5], t)]; };
  function wdots(c, w, list, r, col, inset) {
    c.beginPath();
    for (const [i, t] of list) {
      const p = wpt(w, i, t), dx = -.1 - p[0], dy = .55 - p[1], l = Math.hypot(dx, dy) || 1;
      const x = p[0] + dx / l * inset, y = p[1] + dy / l * inset; c.moveTo(x + r, y); c.arc(x, y, r, 0, PI2);
    }
    fillC(c, col);
  }
  function ocellus(c, x, y, r, rings) {
    for (let i = 0; i < rings.length; i += 2) { c.beginPath(); c.arc(x, y, r * rings[i], 0, PI2); fillC(c, rings[i + 1]); }
    c.beginPath(); c.arc(x - r * .22, y - r * .24, r * .13, 0, PI2); fillC(c, "rgba(255,255,255,.85)");
  }

  const MORFO_W = sh([.35, 0], [.45, .5, .62, 1.1, .6, 1.45], [.45, 1.58, .1, 1.5, -.1, 1.2], [-.3, 1.3, -.75, 1.15, -.9, .7], [-1, .4, -.85, .1, -.5, .02]);
  const MORFO_DOTS = [[1, .25], [1, .5], [1, .75], [2, .12], [2, .38], [2, .62], [2, .88], [0, .9]];
  function morfoTop(c, k) {
    wpath(c, MORFO_W); c.save(); c.clip();
    c.fillStyle = lin(c, 0, 0, 0, 1.5, [[0, "#16339a"], [.4, mix("#2b78ee", "#7e5cff", k * .55)], [.75, "#3cc4ff"], [1, mix("#6fdcff", "#dcfcff", k)]]);
    c.fillRect(-1.2, -.1, 2, 1.8);
    const p = .22 + .5 * k;
    c.fillStyle = lin(c, -.9, .2, .6, 1, [[0, "rgba(255,255,255,0)"], [p, "rgba(255,255,255,.34)"], [p + .25, "rgba(255,255,255,0)"]]);
    c.fillRect(-1.2, -.1, 2, 1.8);
    c.beginPath(); c.moveTo(.1, 0); c.lineTo(.3, 1.3); c.moveTo(-.1, 0); c.lineTo(-.2, 1.2); c.moveTo(-.3, 0); c.lineTo(-.7, .9);
    strokeC(c, "rgba(10,20,80,.3)", .02);
    wpath(c, MORFO_W); strokeC(c, "#0a0e1c", .3);
    c.restore();
    wdots(c, MORFO_W, MORFO_DOTS, .036, "#f4f8ff", .07);
    wpath(c, MORFO_W); strokeC(c, "rgba(5,8,20,.8)", .025);
  }
  function morfoUnder(c) {
    wpath(c, MORFO_W); c.save(); c.clip();
    c.fillStyle = lin(c, 0, 0, 0, 1.5, [[0, "#5e3a1e"], [.6, "#946239"], [1, "#b98a58"]]);
    c.fillRect(-1.2, -.1, 2, 1.8);
    c.beginPath(); c.moveTo(.5, .45); c.bezierCurveTo(.2, .6, -.1, .35, -.6, .6); c.moveTo(.58, 1.1); c.bezierCurveTo(.2, 1.3, -.2, .95, -.85, 1.0);
    strokeC(c, "rgba(60,32,14,.55)", .05);
    wpath(c, MORFO_W); strokeC(c, "#4a2c14", .12);
    c.restore();
    const ring = [1, "#e2b866", .75, "#3a2210", .45, "#8a5a2a"];
    ocellus(c, .22, 1.0, .12, ring);
    ocellus(c, .3, .55, .08, ring);
    ocellus(c, -.45, .62, .17, ring);
    ocellus(c, -.2, 1.02, .1, ring);
    ocellus(c, -.72, .3, .08, ring);
    wdots(c, MORFO_W, MORFO_DOTS, .03, "#efe0bc", .075);
  }

  const KOMET_W = sh([.4, 0], [.5, .5, .64, 1, .56, 1.3], [.3, 1.46, 0, 1.3, -.15, 1.05], [-.35, 1.1, -.65, 1, -.85, .72],
    [-1.2, .7, -1.65, .56, -2.05, .12], [-1.75, .32, -1.3, .52, -.98, .5], [-.85, .3, -.6, .08, -.4, .02]);
  const KOMET_EYE = [1, "#5a2418", .86, "#d9622a", .64, "#f0c24a", .4, "#f7f2cc"];
  function kometWing(c, k, under) {
    wpath(c, KOMET_W); c.save(); c.clip();
    c.fillStyle = under
      ? lin(c, 0, 0, 0, 1.5, [[0, "#b9c866"], [.6, "#dde6a0"], [1, "#f0f2c0"]])
      : lin(c, 0, 0, 0, 1.5, [[0, mix("#8cbc34", "#7ab838", k)], [.45, "#c4dc58"], [1, mix("#e8ee8c", "#f4f6a8", k)]]);
    c.fillRect(-1.8, -.1, 2.6, 1.8);
    c.beginPath(); c.moveTo(.1, 0); c.lineTo(.35, 1.25); c.moveTo(0, 0); c.lineTo(-.1, 1.1); c.moveTo(-.1, 0); c.lineTo(-.55, .9); c.moveTo(-.2, .05); c.lineTo(-1.2, .6);
    strokeC(c, under ? "rgba(120,130,40,.3)" : "rgba(60,110,20,.28)", .018);
    wpath(c, KOMET_W); strokeC(c, "rgba(100,120,30,.7)", .06);
    c.restore();
    c.beginPath(); c.moveTo(.4, 0); c.bezierCurveTo(.5, .5, .64, 1, .56, 1.3); strokeC(c, under ? "#a85c3c" : "#a8452a", .07);
    ocellus(c, .17, .88, .17, KOMET_EYE);
    ocellus(c, -.5, .62, .12, KOMET_EYE);
    c.beginPath(); c.arc(.17, .88, .11, .9 * PI, 1.55 * PI); strokeC(c, "rgba(40,20,10,.7)", .03);
    wpath(c, KOMET_W); strokeC(c, "rgba(70,70,20,.55)", .02);
  }

  // Sommerfuglekrop (vender mod +x); ly = hvor benene ender
  function bflyBody(c, s, t, ly, sit) {
    const b = s.body, f = b.fluff;
    rnd(c);
    c.beginPath();
    for (let i = 0; i < 3; i++) {
      const x = .42 - i * .2, w = sit ? 0 : sin(t * 3 + i) * .03;
      c.moveTo(x, .3); c.lineTo(x + .1 + w, (.3 + ly) / 2); c.lineTo(x - .08 + (sit ? .22 * (1 - i) : -.1) + w, ly);
    }
    strokeC(c, b.leg, .03);
    // bagkrop (spidser bagud), bryst og hoved
    c.save(); c.translate(.15, .2); c.rotate(.1);
    drop(c, 0, -1.2, f ? .24 : .12);
    c.fillStyle = lin(c, 0, f ? -.24 : -.12, 0, f ? .24 : .12, [[0, lt(b.abd, .25)], [.6, b.abd], [1, dk(b.abd, .3)]]); c.fill();
    strokeC(c, b.line, .025);
    c.restore();
    blob(c, .33, .12, f ? .36 : .28, f ? .26 : .17, b.col, 0, b.line);
    blob(c, .8, .1, f ? .2 : .14, f ? .2 : .14, b.col, 0, b.line);
    if (f) { // fnug langs kanten
      c.beginPath(); c.ellipse(.33, .12, .36, .26, 0, 0, PI2); c.moveTo(.3, .0); c.ellipse(.8, .1, .2, .2, 0, 0, PI2);
      c.setLineDash([.004, .035]); strokeC(c, "rgba(255,255,255,.9)", .06); c.setLineDash([]);
    }
    eyeDark(c, .86, .06, .075, b.eye);
    // følehorn
    const w = sin(t * 1.5) * .03;
    const ants = [[.9, 0, 1.1, -.4 + w, 1.4, -.5 + w], [.88, -.02, 1.0, -.45 + w, 1.2, -.68 + w]];
    c.beginPath(); for (const a of ants) { c.moveTo(a[0], a[1]); c.quadraticCurveTo(a[2], a[3], a[4], a[5]); } strokeC(c, f ? "#b09070" : b.leg, f ? .035 : .03);
    if (f) { // fjeragtige følehorn
      c.beginPath();
      for (const a of ants) for (let i = 1; i < 9; i++) {
        const u = i / 9, x = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * a[2] + u * u * a[4], y = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * a[3] + u * u * a[5];
        c.moveTo(x - .07, y + .1); c.lineTo(x + .02, y - .1);
      }
      strokeC(c, "#fffdf4", .028);
    } else {
      c.beginPath(); c.arc(1.4, -.5 + w, .04, 0, PI2); c.arc(1.2, -.68 + w, .04, 0, PI2); fillC(c, b.leg);
    }
  }

  T.addKind("sommerfugl", function (c, s, o) {
    const t = o.t || 0, sit = o.mode === "sit";
    const ph = t * s.w, k = .5 + .5 * sin(ph);
    const bn = sit ? (80 + 4 * sin(t * .7)) * D : (30 + 45 * sin(ph)) * D;
    const bf = sit ? bn + .1 : (30 + 45 * sin(ph - .25)) * D;
    c.save();
    c.translate(s.dx || 0, sit ? .38 : .05 + sin(ph * .5) * .05);
    if (!sit) c.rotate(-.08);
    const hx = .3, hy = .12;
    for (const z of [-1, 1]) {
      c.save();
      const be = z > 0 ? bn : bf, co = cos(be), cy = -sin(be) + .42 * co * z;
      c.transform(1, 0, -.4 * max(0, sin(be)) - .28 * co * z, cy, hx, hy);
      if ((cy > 0) === (z > 0)) s.top(c, k); else s.under(c);
      c.restore();
      if (z < 0) bflyBody(c, s, t, sit ? .62 : .6, sit);
    }
    c.restore();
  });

  const bodyBlue = { col: "#5a3a22", abd: "#4a2e1a", leg: "#2e1c10", eye: "#1a100a", line: "#24140a" };
  T.look("morfo", "sommerfugl", { w: 8.5, top: morfoTop, under: morfoUnder, body: bodyBlue });
  T.look("komet", "sommerfugl", { w: 6.5, dx: .14, top: (c, k) => kometWing(c, k, false), under: (c) => kometWing(c, 0, true),
    body: { fluff: true, col: "#f6f3ea", abd: "#efe9dc", leg: "#9a7a58", eye: "#2a1a12", line: "rgba(120,100,80,.5)" } });

  // ---------- Flyvende farer ----------
  function wingBlade(c, len, wid) {
    c.beginPath(); c.moveTo(0, 0);
    c.bezierCurveTo(len * .15, wid * .8, len * .65, wid * .75, len, wid * .05);
    c.bezierCurveTo(len * 1.02, -wid * .35, len * .45, -wid * .55, 0, 0);
  }
  // Vinge fra (px,py): flyver = uskarpt flimmer, ellers foldet og halvgennemsigtig
  function wing(c, k, px, py, len, wid, aFly, aFold, near, tint) {
    c.save(); c.translate(px, py);
    if (k.fly) {
      const j = sin(k.t * 44 + (near ? 0 : 1.3)) * .1;
      for (let i = -1; i <= 1; i++) {
        c.save(); c.rotate(PI + aFly + i * .27 + j); wingBlade(c, len, wid);
        fillC(c, "rgba(" + (tint || "222,236,248") + "," + (i ? .15 : .24) + ")");
        if (!i) strokeC(c, "rgba(70,55,40,.3)", .02);
        c.restore();
      }
    } else {
      c.rotate(PI + aFold); wingBlade(c, len, wid);
      fillC(c, "rgba(" + (tint || "222,236,248") + "," + (near ? .52 : .4) + ")");
      strokeC(c, "rgba(70,55,40,.55)", .025);
      c.beginPath(); c.moveTo(len * .08, wid * .12); c.lineTo(len * .85, wid * .12); c.moveTo(len * .08, wid * .12); c.lineTo(len * .6, wid * .4);
      strokeC(c, "rgba(70,55,40,.35)", .015);
    }
    c.restore();
  }
  function insLegs(c, list, col, w, k, off) {
    rnd(c); c.beginPath();
    for (const [ox, oy, kx, ky, fx, fy] of list) {
      const sw = k.fly ? sin(k.t * 3 + ox * 4) * .04 : 0, fl = k.fly ? -.14 : 0;
      c.moveTo(ox + off, oy); c.lineTo(kx + off + sw, ky); c.lineTo(fx + off + sw + (k.fly ? -.2 : 0), fy + fl);
    }
    strokeC(c, col, w);
  }
  function clipBands(c, bands, base, hh, x0, x1) {
    c.save(); drop(c, x0, x1, hh); c.clip();
    c.fillStyle = base; c.fillRect(x1 - .3, -1, x0 - x1 + .6, 2);
    for (const [a, b, col] of bands) { c.fillStyle = col; c.fillRect(a, -1, b - a, 2); }
    c.fillStyle = lin(c, 0, -hh, 0, hh, [[0, "rgba(255,255,255,.3)"], [.45, "rgba(255,255,255,0)"], [1, "rgba(0,0,0,.42)"]]);
    c.fillRect(x1 - .3, -1, x0 - x1 + .6, 2);
    c.restore();
  }
  function sting(c, x, y, len, col) {
    c.save(); c.translate(x, y); c.rotate(.28); blade(c, len, .05, .04); fillC(c, col); c.restore();
  }

  const FLY = {};

  FLY.hornet = function (c, s, k) {
    const a = k.ang, O = "#f0a020", BR = "#5c2c10";
    wing(c, k, .4, -.34, 1.6, .5, .85, .12, false);
    insLegs(c, [[.65, .3, .85, .5, .98, .64], [.45, .34, .55, .56, .5, .7], [.22, .34, .05, .56, -.15, .7]], "#7a3a10", .07, k, .1);
    clipBands(c, [[-.3, -.52, BR], [-.74, -.96, BR], [-1.16, -1.5, BR]], "#eb8a1c", .46, -.12, -1.38);
    drop(c, -.12, -1.38, .46); strokeC(c, "#4a2208", .035);
    sting(c, -1.34, .04, a ? .42 : .3, "#4a2208");
    c.beginPath(); c.moveTo(-.02, .02); c.lineTo(-.22, .04); strokeC(c, BR, .13);
    blob(c, .4, -.04, .5, .42, "#5e2c12", 0, "#2e1306");
    blob(c, .3, -.3, .3, .13, "#c4601a", 0);
    insLegs(c, [[.65, .3, .85, .5, .98, .64], [.45, .34, .55, .56, .5, .7], [.22, .34, .05, .56, -.15, .7]], "#a8501a", .075, k, 0);
    blob(c, 1.05, .04, .42, .4, O, 0, "#6a3208");
    blob(c, 1.26, .2, .17, .12, "#f6b83a", 0);
    eyeDark(c, 1.1, -.1, .18, "#2a1208");
    if (a) brow(c, 1.1, -.1, .18);
    const op = a ? .8 : .3;
    for (const z of [0, 1]) {
      c.save(); c.translate(1.3, .22); c.rotate(.4 + (z ? op * .4 : -op * .1) - .35); blade(c, .3, .08, .05);
      fillC(c, z ? "#6a3410" : "#4a2208"); c.restore();
    }
    const w = sin(k.t * 2) * .03;
    c.beginPath(); c.moveTo(1.3, -.3); c.quadraticCurveTo(1.52, -.62 + w, 1.66, -.5 + w); c.moveTo(1.2, -.34); c.quadraticCurveTo(1.35, -.7 + w, 1.52, -.66 + w);
    strokeC(c, "#9a4a10", .045);
    wing(c, k, .45, -.38, 1.7, .52, .7, .18, true);
  };

  FLY.bi = function (c, s, k) {
    const a = k.ang;
    wing(c, k, .4, -.32, 1.55, .46, .85, .1, false);
    insLegs(c, [[.65, .3, .85, .5, .98, .64], [.45, .34, .55, .56, .5, .7], [.22, .34, .05, .56, -.15, .7]], "#2a1a0c", .06, k, .1);
    clipBands(c, [[-.34, -.6, "#1a1208"], [-.74, -1.0, "#1a1208"], [-1.14, -1.5, "#1a1208"]], "#e8a81e", .44, -.1, -1.3);
    drop(c, -.1, -1.3, .44); strokeC(c, "#2a1a08", .035);
    c.beginPath(); for (const x of [-.34, -.74, -1.14]) { c.moveTo(x, -.3 + (x + .34) * -.1); c.lineTo(x, .3 - (x + .34) * -.1); } strokeC(c, "rgba(255,225,120,.45)", .04);
    sting(c, -1.26, .06, a ? .3 : .16, "#2a1a08");
    c.beginPath(); c.moveTo(0, .02); c.lineTo(-.2, .04); strokeC(c, "#1a1208", .12);
    blob(c, .42, -.04, .5, .44, "#e3a021", 0, "#8a5a10");
    c.beginPath(); // gyldne hår langs brystet
    for (let i = 0; i < 14; i++) { const an = PI * (1 + i * .1) - .1, x = .42 + cos(an) * .5, y = -.04 + sin(an) * .44; c.moveTo(x, y); c.lineTo(x + cos(an) * .1, y + sin(an) * .1); }
    strokeC(c, "#f8d878", .028);
    c.beginPath(); c.ellipse(.42, -.2, .3, .1, 0, 0, PI2); fillC(c, "rgba(255,240,170,.28)");
    insLegs(c, [[.65, .3, .85, .5, .98, .64], [.45, .34, .55, .56, .5, .7], [.22, .34, .05, .56, -.15, .7]], "#3a2410", .065, k, 0);
    blob(c, 1.0, .04, .34, .34, "#2c1e10", 0, "#0e0804");
    blob(c, 1.2, .2, .12, .1, "#7a5a28", 0);
    eyeDark(c, 1.06, -.03, .2, "#120c08");
    if (a) brow(c, 1.06, -.03, .2, "#120c08");
    const w = sin(k.t * 2) * .03;
    c.beginPath(); c.moveTo(1.2, -.25); c.quadraticCurveTo(1.45, -.55 + w, 1.62, -.42 + w); strokeC(c, "#2a1a0c", .04);
    wing(c, k, .45, -.36, 1.7, .5, .7, .14, true);
  };

  FLY.tsetse = function (c, s, k) {
    const a = k.ang, G = "#8c7a60";
    if (k.fly) wing(c, k, .15, -.3, 1.65, .5, .95, 0, false, "232,226,214");
    else wing(c, k, .15, -.3, 1.7, .36, 0, -.04, false, "232,226,214");
    insLegs(c, [[.45, .3, .62, .5, .74, .66], [.25, .34, .32, .56, .26, .7], [.02, .34, -.15, .56, -.34, .7]], "#4a3a2a", .06, k, .1);
    clipBands(c, [[-.5, -.68, "#5c4a36"], [-.88, -1.06, "#5c4a36"], [-1.26, -1.5, "#5c4a36"]], "#a69478", .34, -.3, -1.5);
    drop(c, -.3, -1.5, .34); strokeC(c, "#30241a", .03);
    blob(c, .1, -.04, .52, .4, G, 0, "#30241a");
    c.save(); ell(c, .1, -.04, .5, .38); c.clip();
    c.beginPath(); c.moveTo(-.4, -.3); c.lineTo(.5, -.3); c.moveTo(-.4, -.12); c.lineTo(.5, -.12); c.moveTo(-.4, .06); c.lineTo(.45, .06); strokeC(c, "rgba(40,28,16,.5)", .06);
    c.restore();
    insLegs(c, [[.45, .3, .62, .5, .74, .66], [.25, .34, .32, .56, .26, .7], [.02, .34, -.15, .56, -.34, .7]], "#5c4a36", .065, k, 0);
    blob(c, .85, .02, .36, .33, "#7a6850", 0, "#30241a");
    // lang spids snabel
    c.beginPath(); c.moveTo(1.06, .18); c.lineTo(1.58, .34); c.lineTo(1.08, .3); c.closePath(); fillC(c, "#2e2216");
    blob(c, 1.04, .26, .1, .09, "#4a3a2a", 0);
    eyeDark(c, .88, -.06, .24, "#5a2a1a");
    if (a) brow(c, .88, -.06, .24);
    c.beginPath(); c.moveTo(1.0, -.28); c.quadraticCurveTo(1.12, -.5, 1.28, -.5); strokeC(c, "#4a3a2a", .04);
    if (k.fly) wing(c, k, .2, -.3, 1.5, .46, .75, 0, true, "232,226,214");
    else wing(c, k, .2, -.3, 1.7, .36, .16, 0, true, "232,226,214");
  };

  T.addKind("flyver", function (c, s, o) {
    const t = o.t || 0, fly = o.mode !== "sit";
    c.save();
    if (fly) { c.translate(sin(t * 2.3) * .03, .08 + sin(t * 3.1) * .05); c.rotate(-.05 + sin(t * 1.7) * .03); } else c.translate(0, .32);
    FLY[s.art](c, s, { fly, ang: !!o.angry, t });
    c.restore();
  });
  T.look("tsetse", "flyver", { art: "tsetse" });
  T.look("kaempehornet", "flyver", { art: "hornet" });
  T.look("kaempehonningbi", "flyver", { art: "bi" });

  // ---------- Edderkopper ----------
  function fang(c, x, y, len, rot, col) {
    c.save(); c.translate(x, y); c.rotate(rot);
    c.beginPath(); c.moveTo(-.05, 0); c.bezierCurveTo(-.05, len * .5, 0, len * .85, .06, len);
    c.bezierCurveTo(.08, len * .6, .06, len * .3, .05, 0); c.closePath(); fillC(c, col);
    c.beginPath(); c.moveTo(-.01, .02); c.quadraticCurveTo(-.01, len * .5, .03, len * .8); strokeC(c, "rgba(255,255,255,.4)", .018);
    c.restore();
  }
  // Børster: korte tværstreger langs en sti (smalle "butte" streger med mellemrum)
  function hairs(c, w, col, len, gap) {
    c.save(); c.lineCap = "butt"; c.setLineDash([len, gap]); strokeC(c, col, w); c.restore();
  }
  function spiderLegs(c, s, t, far) {
    const L = s.legs, r = s.reach || 1, w = s.legW;
    const col = far ? dk(s.leg, .4) : s.leg, hair = far ? dk(s.hair, .4) : s.hair;
    c.save(); rnd(c);
    for (let i = 0; i < 4; i++) {
      let [ox, oy, kx, ky, fx, fy] = L[i];
      kx = ox + (kx - ox) * r; ky = oy + (ky - oy) * r; fx = ox + (fx - ox) * r; fy = oy + (fy - oy) * r;
      if (far) { const f = s.farOff || [.1, -.14]; kx += f[0]; ky += f[1]; fx += f[0] + .03; fy += f[1] + .04; }
      const ph = i * 1.3 + (far ? 2.1 : 0), sw = sin(t * 1.6 + ph), sv = cos(t * 1.3 + ph);
      kx += sw * .03; ky += sv * .03; fx += sw * .07; fy += sv * .05;
      const mx = kx + (fx - kx) * .55, my = ky + (fy - ky) * .55;
      c.beginPath(); c.moveTo(ox, oy); c.lineTo(kx, ky); c.lineTo(fx, fy);
      hairs(c, w * 1.4, hair, .012, .05);
      c.beginPath(); c.moveTo(ox, oy); c.lineTo(kx, ky); strokeC(c, col, w);
      if (far) { c.beginPath(); c.moveTo(kx, ky); c.lineTo(fx, fy); strokeC(c, col, w * .62); continue; }
      c.beginPath(); c.moveTo(kx, ky); c.lineTo(mx, my); strokeC(c, col, w * .76);
      c.beginPath(); c.moveTo(mx, my); c.lineTo(fx, fy); strokeC(c, s.accent || col, w * .52);
      c.beginPath(); c.moveTo(ox + (kx - ox) * .1, oy + (ky - oy) * .1 - w * .2); c.lineTo(kx, ky - w * .2); strokeC(c, "rgba(255,255,255,.16)", w * .3);
      if (s.ring) { c.beginPath(); c.arc(kx, ky, w * .5, 0, PI2); fillC(c, s.ring); }
    }
    c.restore();
  }

  T.addKind("edderkop", function (c, s, o) {
    const t = o.t || 0, ang = !!o.angry, sp = s.spread + (ang ? .2 : 0);
    c.save(); rnd(c);
    c.beginPath(); c.moveTo(0, -s.top); c.lineTo(0, -1.1); strokeC(c, "rgba(245,245,235,.9)", .035);
    c.translate(0, sin(t * 1.4) * .03);
    c.rotate(s.tilt + sin(t * .9) * .06 - (ang ? .05 : 0));
    spiderLegs(c, s, t, true);
    // bagkrop
    const ab = s.ab;
    blob(c, ab.x, ab.y, ab.rx, ab.ry, s.abCol, 0, dk(s.abCol, .55), .035);
    c.save(); ell(c, ab.x, ab.y, ab.rx, ab.ry); c.clip();
    if (s.pat === "fur") {
      c.beginPath(); c.ellipse(ab.x, ab.y, ab.rx * .96, ab.ry * .94, 0, 0, PI2); hairs(c, .13, s.hair, .012, .04);
      c.beginPath(); ell(c, ab.x - .1, ab.y - .18, ab.rx * .6, ab.ry * .35); fillC(c, "rgba(190,100,60,.3)");
    } else if (s.pat === "leaf") {
      c.save(); c.translate(0, -.14); c.scale(1, .75);
      c.beginPath(); poly(c, [.05, 0, -.15, -.22, -.3, -.12, -.45, -.28, -.6, -.14, -.75, -.22, -.98, 0, -.75, .22, -.6, .14, -.45, .28, -.3, .12, -.15, .22]); c.closePath();
      fillC(c, "#2c2824"); strokeC(c, "#f2eee2", .035);
      c.restore();
      c.beginPath(); c.arc(-.3, .28, .05, 0, PI2); c.arc(-.55, .3, .045, 0, PI2); c.arc(-.8, .24, .04, 0, PI2); fillC(c, "rgba(40,36,30,.6)");
    } else if (s.pat === "spots") {
      c.beginPath(); for (let i = 0; i < 4; i++) { const x = -.12 - i * .22; c.moveTo(x + .055, -.28 + i * .02); c.arc(x, -.28 + i * .02, .055, 0, PI2); } fillC(c, "#d8c298");
      c.beginPath(); poly(c, [.05, -.05, -1.0, -.05]); strokeC(c, "rgba(40,26,14,.5)", .07);
    }
    c.fillStyle = lin(c, 0, ab.y - ab.ry, 0, ab.y + ab.ry, [[0, "rgba(255,255,255,.14)"], [.5, "rgba(0,0,0,0)"], [1, "rgba(0,0,0,.3)"]]);
    c.fillRect(ab.x - ab.rx, ab.y - ab.ry, ab.rx * 2, ab.ry * 2);
    c.restore();
    // hoved og rygskjold
    const cp = s.cp;
    blob(c, cp.x, cp.y, cp.rx, cp.ry, s.cpCol, 0, dk(s.cpCol, .55), .035);
    if (s.pat === "leaf") { c.beginPath(); poly(c, [.2, -.04, .7, -.04]); strokeC(c, "rgba(30,26,22,.5)", .07); }
    spiderLegs(c, s, t, false);
    // palper, kæber og hugtænder
    const hx = cp.x + cp.rx * .8, hy = cp.y + cp.ry * .3;
    c.beginPath(); poly(c, [hx - .05, hy - .04, hx + .2, hy + .08, hx + .24, hy + .28]);
    hairs(c, .14, s.hair, .012, .04); strokeC(c, s.leg, .09);
    for (const z of [-1, 1]) {
      const cx = hx + z * .05, col = z > 0 ? s.chel : dk(s.chel, .3);
      fang(c, cx, hy + .2, s.fangLen, z > 0 ? -.1 - sp * .3 : .08 + sp * .2, z > 0 ? s.fang : dk(s.fang, .3));
      blob(c, cx, hy + .1, .11, .17, col, .15, dk(s.chel, .6), .025);
      if (s.chelFur) { c.beginPath(); c.ellipse(cx, hy + .1, .11, .16, .15, 0, PI2); hairs(c, .06, s.chelFur, .01, .035); }
    }
    for (const [ex, ey, er] of s.eyes) eyeDark(c, cp.x + ex, cp.y + ey, er, ang ? "#4a1410" : "#201410");
    c.restore();
  });

  const LEGS_STD = [[.55, .06, 1.12, -.5, 1.5, .2], [.42, .1, .95, -.7, 1.22, .8], [.25, .12, .3, -.75, .05, 1.0], [.08, .1, -.55, -.6, -1.12, .55]];

  T.look("fuglespider", "edderkop", {
    top: .1, tilt: .2, spread: .3, legs: LEGS_STD, reach: 1.0, legW: .17, leg: "#5c3d28", hair: "#c06a3e",
    ab: { x: -.5, y: .06, rx: .64, ry: .54 }, abCol: "#6e4a30", pat: "fur", cp: { x: .4, y: .0, rx: .42, ry: .3 }, cpCol: "#5a3b26",
    chel: "#4a2e1e", chelFur: "#c06a3e", fang: "#c0432b", fangLen: .36, eyes: [[.3, -.14, .075], [.2, -.2, .06]]
  });
  T.look("tretarantel", "edderkop", {
    top: .1, tilt: .15, spread: .3, legs: LEGS_STD, reach: 1.06, legW: .085, leg: "#8e8678", hair: "#d8d0bc", accent: "#e8a52a", ring: "#f2eee2",
    ab: { x: -.52, y: .06, rx: .62, ry: .4 }, abCol: "#b8b2a4", pat: "leaf", cp: { x: .38, y: 0, rx: .38, ry: .27 }, cpCol: "#a29a88",
    chel: "#4a3e32", fang: "#2a1c14", fangLen: .3, eyes: [[.28, -.12, .07], [.18, -.18, .055]]
  });
  T.look("bananedderkop", "edderkop", {
    top: .1, tilt: -.35, spread: .6,
    legs: [[.55, -.02, .85, -1.0, 1.35, -.55], [.4, 0, 1.0, -.65, 1.5, -.1], [.2, .1, .0, -.55, -.3, .9], [-.05, .1, -.75, -.35, -1.15, .5]],
    reach: 1.0, legW: .11, leg: "#6e5030", hair: "#b89a6c", ring: "#3a2614", farOff: [-.3, .05],
    ab: { x: -.5, y: .08, rx: .64, ry: .44 }, abCol: "#7a5a38", pat: "spots", cp: { x: .38, y: 0, rx: .42, ry: .31 }, cpCol: "#6a4a2c",
    chel: "#e0451c", fang: "#2a1a10", fangLen: .36, eyes: [[.3, -.13, .08], [.2, -.2, .06]]
  });

  // ---------- Kæmpe-tusindben ----------
  T.addKind("tusindben", function (c, s, o) {
    const t = o.t || 0, ang = !!o.angry, N = 19;
    const yAt = (x) => .3 + .05 * sin(x * 3.2 - t * 2) + (ang ? -.03 * max(0, x) : 0);
    c.save(); rnd(c);
    // ben (fjerne og nære)
    for (const far of [true, false]) {
      c.beginPath();
      for (let i = 0; i < N; i++) {
        const x = 1.0 - i * .13 + (far ? -.05 : 0), y = yAt(x), ph = x * 5 - t * 3.2 + (far ? PI : 0);
        const fx = x - .08 + sin(ph) * .09, fy = .97 - max(0, cos(ph)) * .07 - (far ? .03 : 0);
        c.moveTo(x, y + .1); c.quadraticCurveTo(x + .13 + sin(ph) * .05, .7, fx, fy);
      }
      c.setLineDash([]); strokeC(c, far ? "#a8841c" : "#f0c838", .05);
    }
    // bageste fælesben
    c.beginPath(); c.moveTo(-1.35, yAt(-1.35) + .05); c.quadraticCurveTo(-1.5, .6, -1.62 + sin(t * 2) * .03, .92); strokeC(c, "#f0c838", .05);
    c.beginPath(); c.moveTo(-1.38, yAt(-1.38) + .02); c.quadraticCurveTo(-1.55, .5, -1.62 + sin(t * 2 + 1) * .03, .75); strokeC(c, "#c9a22a", .045);
    // led
    const gA = lin(c, 0, .02, 0, .58, [[0, "#c4501c"], [.5, "#8e2e16"], [1, "#4e160c"]]);
    const gB = lin(c, 0, .02, 0, .58, [[0, "#e07a28"], [.5, "#b8481c"], [1, "#6a2210"]]);
    for (let i = N - 1; i >= 0; i--) {
      const x = 1.0 - i * .13, y = yAt(x), ry = .27 - .07 * (i / N);
      c.beginPath(); c.ellipse(x, y, .085, ry, 0, 0, PI2); c.fillStyle = i % 2 ? gA : gB; c.fill();
      strokeC(c, "#3a0e08", .028);
    }
    c.beginPath(); for (let i = 0; i < N; i++) { const x = 1.0 - i * .13, y = yAt(x) - (.27 - .07 * (i / N)) * .72; if (i) c.lineTo(x, y); else c.moveTo(x, y); }
    strokeC(c, "rgba(255,210,140,.5)", .035);
    // hoved
    const hy = yAt(1.1) + .0 - (ang ? .05 : 0);
    c.save(); c.translate(1.2, hy);
    c.beginPath(); c.moveTo(.15, .12); c.lineTo(.35, .3 + 0); c.lineTo(.12, .32); c.closePath(); fillC(c, "#5a1a0c");
    blob(c, 0, 0, .23, .21, "#e0551d", 0, "#6a1c0a", .035);
    // tangformede hugtænder
    const open = ang ? .45 : .12;
    for (const z of [0, 1]) {
      c.save(); c.translate(.12, .16); c.rotate(.25 + (z ? 1 : -1) * open * .5 + (z ? .2 : 0));
      c.beginPath(); c.moveTo(0, -.05); c.bezierCurveTo(.15, -.05, .34, .08, .36, .26); c.bezierCurveTo(.26, .14, .14, .09, .0, .06); c.closePath();
      fillC(c, z ? "#8a2a10" : "#5a1a0c"); strokeC(c, "#2a0a04", .02);
      c.beginPath(); c.moveTo(.3, .1); c.lineTo(.36, .27); strokeC(c, "#1a0402", .035); c.restore();
    }
    eyeDark(c, .08, -.05, .065, "#2a1410");
    if (ang) brow(c, .08, -.05, .065, "#3a0c04");
    // følehorn
    const w = sin(t * 1.5) * .06;
    c.beginPath(); c.moveTo(.15, -.12); c.quadraticCurveTo(.3 + w, -.35 - (ang ? .1 : 0), .4 + w * 1.5, -.5);
    c.moveTo(.08, -.15); c.quadraticCurveTo(.15 + w, -.5, .26 - w, -.68);
    strokeC(c, "#f0a838", .035);
    c.restore();
    c.restore();
  });
  T.look("tusindben", "tusindben", {});

  // ---------- Skovskorpion ----------
  T.addKind("skorpion", function (c, s, o) {
    const t = o.t || 0, ang = !!o.angry, br = sin(t * 1.8) * .012;
    c.save(); rnd(c); c.translate(-.12, 0);
    const BLK = "#232838", MID = "#38405a", LEG = "#5a3c30";
    // ben
    for (const far of [true, false]) {
      c.beginPath();
      for (let i = 0; i < 4; i++) {
        const x = .5 - i * .3 + (far ? .1 : 0), sw = sin(t * 1.6 + i * 1.4 + (far ? 2 : 0)) * .05, d = i < 2 ? 1 : -1;
        c.moveTo(x, .5); c.lineTo(x + .22 * d, .7 + (far ? -.03 : 0)); c.lineTo(x + .38 * d + sw, 1.0 - (far ? .02 : 0));
      }
      strokeC(c, far ? "#3a2820" : LEG, .08);
    }
    c.translate(0, -.07);
    // hale (bøjet op over ryggen): kæde af led
    const lift = ang ? .22 : 0, sw = sin(t * 1.4) * .04;
    const P = [[-.9, .42], [-1.8, .3], [-1.5 - sw, -1.3 - lift], [-.35, -.85 - lift * .6 + sw]];
    const at = (u) => [bz(P[0][0], P[1][0], P[2][0], P[3][0], u), bz(P[0][1], P[1][1], P[2][1], P[3][1], u)];
    for (let i = 0; i < 6; i++) {
      const a = at(i * .16), b = at(i * .16 + .18), w = .21 - i * .02;
      c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); strokeC(c, "#10121a", w + .035); strokeC(c, MID, w);
      c.beginPath(); c.moveTo(a[0] + .03, a[1] - .05); c.lineTo(b[0] + .03, b[1] - .05); strokeC(c, "rgba(190,205,240,.35)", .03);
    }
    const e = at(.99), d = at(.9), ang2 = Math.atan2(e[1] - d[1], e[0] - d[0]);
    c.save(); c.translate(e[0], e[1]); c.rotate(ang2 + .5); blade(c, .4, .06, .1); fillC(c, "#8a3a1c"); strokeC(c, "#10121a", .02); c.restore();
    blob(c, e[0], e[1], .12, .1, MID, ang2, "#10121a");
    // krop
    blob(c, -.35, .42 + br, .62, .3, BLK, 0, "#0a0c12");
    c.beginPath(); for (const x of [-.65, -.4, -.15]) { c.moveTo(x, .2); c.quadraticCurveTo(x - .08, .42, x, .68); } strokeC(c, "rgba(120,130,170,.35)", .03);
    c.beginPath(); c.ellipse(-.35, .42 + br, .5, .22, 0, PI * 1.1, PI * 1.62); strokeC(c, "rgba(220,230,255,.35)", .035);
    blob(c, .4, .45 + br, .38, .27, MID, 0, "#0a0c12");
    // klosakse: håndled og fast finger er ét stykke, den bevægelige finger lukker mod spidsen
    for (const far of [true, false]) {
      c.save(); if (far) c.translate(-.08, -.22);
      const open = (ang ? .5 : .08) + sin(t * 1.5 + (far ? 1 : 0)) * .05, body = far ? "#1c2132" : "#454f6e", fin = far ? "#2a3045" : "#5a6688";
      c.beginPath(); c.moveTo(.62, .55); c.lineTo(.8, .58); strokeC(c, "#0b0d14", .19); strokeC(c, body, .15);
      c.translate(1.0, .45); c.rotate(.04);
      c.save(); c.translate(.3, -.12); c.rotate(.6 - open); blade(c, .42, .075, .03); fillC(c, fin); strokeC(c, "#0b0d14", .03); c.restore();
      c.beginPath(); c.moveTo(-.3, 0); c.bezierCurveTo(-.3, -.26, .1, -.28, .3, -.12); c.bezierCurveTo(.42, -.04, .52, .04, .64, .1);
      c.bezierCurveTo(.52, .15, .4, .12, .3, .18); c.bezierCurveTo(.1, .3, -.3, .28, -.3, 0); c.closePath();
      c.fillStyle = lin(c, 0, -.28, 0, .3, [[0, lt(body, .2)], [.6, body], [1, dk(body, .35)]]); c.fill(); strokeC(c, "#0b0d14", .035);
      if (!far) { c.beginPath(); c.ellipse(-.02, -.02, .22, .17, -.05, PI * 1.1, PI * 1.6); strokeC(c, "rgba(230,238,255,.5)", .035); }
      c.restore();
    }
    eyeDark(c, .55, .3 + br, .07, "#403028");
    if (ang) brow(c, .55, .3 + br, .07, "#08090d");
    c.restore();
  });
  T.look("skorpion", "skorpion", {});

  // ---------- Myrer ----------
  T.addKind("myre", function (c, s, o) {
    const t = o.t || 0, ang = !!o.angry, bob = sin(t * 2.2) * .015;
    c.save(); rnd(c); c.translate(0, bob);
    const H = s.head, G = s.gaster, th = s.thorax;
    const legs = [[.5, .3, .8, .1, .85, 1.0], [.3, .34, .42, .08, .3, 1.0], [.1, .32, -.2, .08, -.55, 1.0]];
    // ben og følehorn: fjerne først
    for (const far of [true, false]) {
      c.beginPath();
      legs.forEach(([ox, oy, kx, ky, fx, fy], i) => {
        const ph = t * 2.4 + i * 2.1 + (far ? PI : 0), dx = sin(ph) * .07, lift = max(0, cos(ph)) * .06 * (ang ? 0 : 1);
        c.moveTo(ox + (far ? .06 : 0), oy); c.lineTo(kx + (far ? .06 : 0) + dx * .4, ky); c.lineTo(fx + (far ? .06 : 0) + dx, fy - lift - bob);
      });
      strokeC(c, far ? dk(s.leg, .35) : s.leg, .09);
      const w = sin(t * 1.7 + (far ? 1 : 0)) * .05, hx = H.x + H.rx * .6, hy = H.y - H.ry * .7;
      c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + .3, hy - .35 + w); c.lineTo(hx + .48 - w, hy - .05 + (far ? .0 : .1));
      strokeC(c, far ? dk(s.leg, .35) : s.leg, .05);
    }
    // bagkrop med stikbrod
    if (s.sting) { c.save(); c.translate(G.x - G.rx * .95, G.y + .08); c.rotate(PI - .6); blade(c, .28, .045, .06); fillC(c, "#1a0a06"); c.restore(); }
    blob(c, G.x, G.y, G.rx, G.ry, s.col, 0, s.line, .035);
    c.beginPath(); for (const x of [-.25, -.05, .15]) { c.moveTo(G.x + x * 1.1, G.y - G.ry * .85); c.quadraticCurveTo(G.x + x * 1.1 - .1, G.y, G.x + x * 1.1, G.y + G.ry * .85); } strokeC(c, "rgba(0,0,0,.28)", .03);
    c.beginPath(); c.ellipse(G.x, G.y, G.rx * .78, G.ry * .76, 0, PI * 1.12, PI * 1.62); strokeC(c, "rgba(255,255,255," + (s.shine || .25) + ")", .045);
    // tynd talje
    c.beginPath(); c.moveTo(G.x + G.rx * .7, G.y - .05); c.lineTo(th.x - th.rx * .8, th.y); strokeC(c, s.line, .1); strokeC(c, dk(s.col, .15), .075);
    blob(c, -.25, .08, .1, .15, s.col, 0, s.line, .03);
    blob(c, th.x, th.y, th.rx, th.ry, s.col, -.05, s.line, .035);
    blob(c, th.x + th.rx * .5, th.y - th.ry * .5, th.rx * .4, th.ry * .5, lt(s.col, .12), 0);
    // nære ben (foran hovedet er hovedet tegnet over dem)
    c.beginPath(); legs.forEach(([ox, oy, kx, ky, fx, fy], i) => {
      const ph = t * 2.4 + i * 2.1, dx = sin(ph) * .07, lift = max(0, cos(ph)) * .06 * (ang ? 0 : 1);
      c.moveTo(ox, oy); c.lineTo(kx + dx * .4, ky); c.lineTo(fx + dx, fy - lift - bob);
    });
    strokeC(c, s.leg, .095);
    // hoved og kæber
    const mx = H.x + H.rx * .78, my = H.y + H.ry * .38, open = ang ? .6 : .22, ow = sin(t * 2) * .04;
    c.save(); c.translate(mx, my); c.rotate(-.03 - open * .4 - ow); blade(c, s.mand, .14, .12); fillC(c, dk(s.mandCol, .3)); c.restore();
    blob(c, H.x, H.y, H.rx, H.ry, s.headCol, 0, s.line, .035);
    c.save(); c.translate(mx, my + .02); c.rotate(.05 + open * .7 + ow); blade(c, s.mand, .16, -.16); fillC(c, s.mandCol); strokeC(c, s.line, .025); c.restore();
    eyeDark(c, H.x + .06, H.y - H.ry * .35, s.eye, "#2a1a12");
    if (ang) brow(c, H.x + .06, H.y - H.ry * .35, s.eye, "#1a0a04");
    // nære følehorn
    const w2 = sin(t * 1.7) * .05;
    const hx2 = H.x + H.rx * .6, hy2 = H.y - H.ry * .7;
    c.beginPath(); c.moveTo(hx2, hy2); c.lineTo(hx2 + .3, hy2 - .35 + w2); c.lineTo(hx2 + .48 - w2, hy2 - .05 + .1); strokeC(c, s.leg, .055);
    c.restore();
  });

  T.look("haermyre", "myre", {
    col: "#c05a22", headCol: "#cc6828", leg: "#8a3c16", line: "#3a1608", mandCol: "#7a2a10", mand: .45, eye: .1, shine: .3, sting: false,
    head: { x: .86, y: .12, rx: .4, ry: .37 }, gaster: { x: -1.0, y: .24, rx: .54, ry: .4 }, thorax: { x: .38, y: .14, rx: .4, ry: .22 }
  });
  T.look("kuglemyre", "myre", {
    col: "#4a1a10", headCol: "#52200f", leg: "#2e120a", line: "#140604", mandCol: "#2e0e08", mand: .4, eye: .08, shine: .42, sting: true,
    head: { x: .86, y: .14, rx: .36, ry: .33 }, gaster: { x: -.98, y: .22, rx: .58, ry: .44 }, thorax: { x: .36, y: .13, rx: .42, ry: .25 }
  });
})();
