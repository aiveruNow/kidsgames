// Slanger, kamæleoner, flyvedrage og frøer til Hej Banan (kinds: slange, kamaeleon, flyvedrage, froe).
// Slanger: "hang", "sit" og "attack". Kamæleoner og frøer: "sit". Flyvedrage: "fly" og "sit".
(function () {
  "use strict";
  const T = window.BananTegn;
  const { dk, lt, mix, lin, rad, eyeDark, PI2 } = T;
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const sm = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // ===================================================================
  //  SLANGER
  // ===================================================================
  // Kroppen er en rygrad af jævnt fordelte punkter (P) med tykkelse, og tegnes som bånd (ribbons) i lag.
  // Ryggen (q = +1) ligger på siden (TY, -TX) af retningen; q = -1 er bugen.

  // Catmull-Rom gennem punkter [x, y]: per delpunkter pr. stykke
  function catmull(pts, per) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < per; k++) {
        const u = k / per, u2 = u * u, u3 = u2 * u;
        out.push([
          .5 * (2 * p1[0] + (p2[0] - p0[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (3 * p1[0] - p0[0] - 3 * p2[0] + p3[0]) * u3),
          .5 * (2 * p1[1] + (p2[1] - p0[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (3 * p1[1] - p0[1] - 3 * p2[1] + p3[1]) * u3)]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  // n = antal stykker; er n 0, bruges ds (ønsket afstand mellem punkter)
  function resample(pts, n, ds) {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum[i] = cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const L = cum[cum.length - 1], X = [], Y = [];
    if (!n) n = Math.max(6, Math.round(L / ds));
    let k = 0;
    for (let i = 0; i <= n; i++) {
      const d = L * i / n;
      while (k < pts.length - 2 && cum[k + 1] < d) k++;
      const f = (d - cum[k]) / ((cum[k + 1] - cum[k]) || 1);
      X.push(pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f);
      Y.push(pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f);
    }
    return { X, Y, L };
  }

  function makeSpine(R, widthFn) {
    const n = R.X.length - 1, TX = [], TY = [], A = [], W = [];
    for (let i = 0; i <= n; i++) {
      const a = Math.max(0, i - 1), b = Math.min(n, i + 1);
      const dx = R.X[b] - R.X[a], dy = R.Y[b] - R.Y[a], d = Math.hypot(dx, dy) || 1;
      TX.push(dx / d); TY.push(dy / d); A.push(Math.atan2(dy, dx));
      W.push(widthFn(i, n, R.L * i / n, R.L));
    }
    return { n, X: R.X, Y: R.Y, TX, TY, A, W, ds: R.L / n, L: R.L };
  }

  // Bånd mellem q = qa og qb (−1 bug … +1 ryg) fra punkt i0 til i1; ex gør båndet bredere (kontur)
  function ribbon(c, P, i0, i1, qa, qb, ex) {
    ex = ex || 0;
    const px = (i, q) => P.X[i] + P.TY[i] * (P.W[i] + ex) * q, py = (i, q) => P.Y[i] - P.TX[i] * (P.W[i] + ex) * q;
    c.beginPath();
    c.moveTo(px(i0, qb), py(i0, qb));
    for (let i = i0 + 1; i < i1; i++) c.quadraticCurveTo(px(i, qb), py(i, qb), (px(i, qb) + px(i + 1, qb)) / 2, (py(i, qb) + py(i + 1, qb)) / 2);
    c.lineTo(px(i1, qb), py(i1, qb)); c.lineTo(px(i1, qa), py(i1, qa));
    for (let i = i1 - 1; i > i0; i--) c.quadraticCurveTo(px(i, qa), py(i, qa), (px(i, qa) + px(i - 1, qa)) / 2, (py(i, qa) + py(i - 1, qa)) / 2);
    c.lineTo(px(i0, qa), py(i0, qa));
    c.closePath(); c.fill();
  }

  // Punkt på rygraden ved (brøk-)punkt j: q på tværs (i halve bredder, +1 = ryg), langs kroppen følger rygraden
  function at(P, j, q) {
    j = clamp(j, 0, P.n); const i = Math.min(P.n - 1, Math.floor(j)), f = j - i, k = i + 1;
    const x = P.X[i] + (P.X[k] - P.X[i]) * f, y = P.Y[i] + (P.Y[k] - P.Y[i]) * f, w = (P.W[i] + (P.W[k] - P.W[i]) * f) * q;
    const tx = P.TX[i] + (P.TX[k] - P.TX[i]) * f, ty = P.TY[i] + (P.TY[k] - P.TY[i]) * f, d = Math.hypot(tx, ty) || 1;
    at.x = x + ty / d * w; at.y = y - tx / d * w; at.a = Math.atan2(ty, tx);
  }
  const mv = (c, P, j, q) => { at(P, j, q); c.moveTo(at.x, at.y); };
  const ln = (c, P, j, q) => { at(P, j, q); c.lineTo(at.x, at.y); };
  function blob(c, P, j, q, rx, ry) {
    const i = clamp(Math.round(j), 1, P.n - 1), dA = Math.atan2(sin(P.A[i + 1] - P.A[i - 1]), cos(P.A[i + 1] - P.A[i - 1]));
    rx = Math.min(rx, .45 * 2 * P.ds / (Math.abs(dA) + .02)); // mindre pletter i skarpe sving
    at(P, j, q);
    c.moveTo(at.x + cos(at.a) * rx, at.y + sin(at.a) * rx);
    c.ellipse(at.x, at.y, rx, ry, at.a, 0, PI2);
  }
  // Firkant på tværs af kroppen (til bånd)
  function band(c, P, j, h0, h1, q0, q1) { mv(c, P, j + h0, q0); ln(c, P, j + h1, q0); ln(c, P, j + h1, q1); ln(c, P, j + h0, q1); c.closePath(); }
  function diamond(c, P, j, qc, hq, hd) { mv(c, P, j, qc + hq); ln(c, P, j + hd, qc); ln(c, P, j, qc - hq); ln(c, P, j - hd, qc); c.closePath(); }
  const step = (P, per) => Math.max(1, Math.round(per / P.ds));
  const first = (a, k) => Math.ceil(a / k) * k;

  // Mønstre langs kroppen (a..b = punkter, der skal tegnes); k = punkter pr. gentagelse
  const PAT = {
    // store sorte ovaler med lys ring langs ryggen og små gulringede pletter på flanken
    anaconda(c, P, a, b, s) {
      const k = step(P, s.per), per = k * P.ds;
      c.fillStyle = s.ring; c.beginPath();
      for (let j = first(a, k); j <= b; j += k) { blob(c, P, j, .42, per * .4, P.W[j] * .5); blob(c, P, j + k / 2, -.18, per * .28, P.W[j] * .36); }
      c.fill();
      c.fillStyle = s.dark; c.beginPath();
      for (let j = first(a, k); j <= b; j += k) { blob(c, P, j, .42, per * .3, P.W[j] * .38); blob(c, P, j + k / 2, -.18, per * .18, P.W[j] * .22); }
      c.fill();
    },
    // næsten ensfarvet, blank grøn med lidt lysere skælkanter
    mamba(c, P, a, b, s) {
      const k = step(P, s.per);
      c.fillStyle = s.ring; c.beginPath();
      for (let j = first(a, k); j <= b; j += k) blob(c, P, j, .5, P.ds * k * .45, P.W[j] * .16);
      c.fill();
    },
    // netmønster: sort-brune ruder med lyse centre og små pletter på siden
    net(c, P, a, b, s) {
      const k = step(P, s.per);
      c.fillStyle = s.dark; c.beginPath();
      for (let j = first(a, k); j <= b; j += k) { diamond(c, P, j, .42, .62, k * .5); diamond(c, P, j + k / 2, -.5, .34, k * .27); }
      c.fill();
      c.fillStyle = s.light; c.beginPath();
      for (let j = first(a, k); j <= b; j += k) { diamond(c, P, j, .42, .34, k * .27); diamond(c, P, j + k / 2, -.5, .15, k * .12); }
      c.fill();
    },
    // lyse tværbånd (kongekobra)
    bands(c, P, a, b, s) {
      const k = step(P, s.per);
      c.fillStyle = s.light; c.beginPath();
      for (let j = first(a, k); j <= b; j += k) { mv(c, P, j + k * .12, 1.02); ln(c, P, j + k * .36, 1.02); ln(c, P, j + k * .03, -1.02); ln(c, P, j - k * .21, -1.02); c.closePath(); }
      c.fill();
    },
    // svage mørke tværbånd (indisk kobra)
    bars(c, P, a, b, s) {
      const k = step(P, s.per);
      c.fillStyle = s.dark; c.globalAlpha = .5; c.beginPath();
      for (let j = first(a, k); j <= b; j += k) { mv(c, P, j + k * .1, 1.02); ln(c, P, j + k * .36, 1.02); ln(c, P, j + k * .0, -1.02); ln(c, P, j - k * .26, -1.02); c.closePath(); }
      c.fill(); c.globalAlpha = 1;
    },
    // brede mørke sadler og pletter på siden (Dumerils boa)
    saddles(c, P, a, b, s) {
      const k = step(P, s.per), per = k * P.ds;
      c.fillStyle = s.dark; c.beginPath();
      for (let j = first(a, k); j <= b; j += k) {
        mv(c, P, j - k * .46, 1.02); ln(c, P, j + k * .46, 1.02); ln(c, P, j + k * .34, .08); ln(c, P, j - k * .34, .08); c.closePath();
        blob(c, P, j + k / 2, -.5, per * .3, P.W[j] * .26);
      }
      c.fill();
      c.fillStyle = s.light; c.beginPath();
      for (let j = first(a, k); j <= b; j += k) { mv(c, P, j - k * .2, .85); ln(c, P, j + k * .2, .85); ln(c, P, j + k * .14, .32); ln(c, P, j - k * .14, .32); c.closePath(); }
      c.fill();
    },
    // timeglas-ruder: brede på siden, smalle på ryggen, lys kerne (buskmester)
    hourglass(c, P, a, b, s) {
      const k = step(P, s.per), per = k * P.ds;
      c.fillStyle = s.dark; c.beginPath();
      for (let j = first(a, k); j <= b; j += k) {
        mv(c, P, j - k * .3, -1.02); ln(c, P, j - k * .1, .35); ln(c, P, j - k * .16, 1.02); ln(c, P, j + k * .16, 1.02); ln(c, P, j + k * .1, .35); ln(c, P, j + k * .3, -1.02); c.closePath();
      }
      c.fill();
      c.fillStyle = s.light; c.beginPath();
      for (let j = first(a, k); j <= b; j += k) blob(c, P, j, -.4, per * .17, P.W[j] * .22);
      c.fill();
    }
  };

  // Mønster på ringene i bunken: enkle former langs ringens midte (rm.t: blob/diamond/bar)
  function ringMarks(c, s, th, r) {
    const Cr = PI * (3 * (r.rx + r.ry) - Math.sqrt((3 * r.rx + r.ry) * (r.rx + 3 * r.ry)));
    const M = Math.max(4, Math.round(Cr / s.rm.per));
    for (const m of s.rm.layers) {
      c.beginPath();
      for (let i = 0; i < M; i++) {
        const a = PI / 2 - PI2 * i / M, ang = Math.atan2(-r.ry * cos(a), r.rx * sin(a));
        const x = r.cx + r.rx * cos(a), y = r.cy + r.ry * sin(a) + (m.dy || 0) * th, ca = cos(ang), sa = sin(ang), A = m.sx * th, B = m.sy * th;
        if (m.t === "blob") { c.moveTo(x + ca * A, y + sa * A); c.ellipse(x, y, A, B, ang, 0, PI2); }
        else if (m.t === "diamond") { c.moveTo(x + ca * A, y + sa * A); c.lineTo(x - sa * B, y + ca * B); c.lineTo(x - ca * A, y - sa * A); c.lineTo(x + sa * B, y - ca * B); c.closePath(); }
        else { // skrå bjælke på tværs af ringen
          const u = (m.sl || 0) * B;
          c.moveTo(x - sa * B + ca * (A - u), y + ca * B + sa * (A - u)); c.lineTo(x + sa * B + ca * (A + u), y - ca * B + sa * (A + u)); c.lineTo(x + sa * B + ca * (u - A), y - ca * B + sa * (u - A)); c.lineTo(x - sa * B - ca * (A + u), y + ca * B - sa * (A + u)); c.closePath();
        }
      }
      c.globalAlpha = m.a || 1; c.fillStyle = m.col; c.fill(); c.globalAlpha = 1;
    }
  }

  // Lag på ét stykke krop: kontur, bug, ryg, mønster, skæl, skygge og glans
  function chunk(c, s, P, i0, i1) {
    c.fillStyle = s.line; ribbon(c, P, i0, i1, -1, 1, .035);
    c.fillStyle = s.belly; ribbon(c, P, i0, i1, -1, 1, 0);
    c.fillStyle = s.base; ribbon(c, P, i0, i1, -.62, 1, 0);
    if (s.tail && i0 < P.n * .22) { c.globalAlpha = .55; c.fillStyle = s.tail; ribbon(c, P, i0, Math.min(i1, Math.round(P.n * .22)), -.62, 1, 0); c.globalAlpha = 1; }
    PAT[s.pat](c, P, i0, i1, s);
    // skæl: skråstreger på ryggen (skiftevis retning) og tværlinjer på bugen
    c.strokeStyle = s.scale || "rgba(0,0,0,.16)"; c.lineWidth = .014; c.beginPath();
    for (let j = i0; j <= i1; j++) {
      const d = j % 2 ? .9 : -.9;
      mv(c, P, j - d, .95); ln(c, P, j + d, -.5);
      if (j % 2 === 0) { mv(c, P, j, -.64); ln(c, P, j, -1); }
    }
    c.stroke();
    c.fillStyle = "rgba(0,0,0,.2)"; ribbon(c, P, i0, i1, -.62, -.05, 0);
    c.fillStyle = "rgba(255,255,255," + (s.gloss || .2) + ")"; ribbon(c, P, i0, i1, .32, .82, 0);
  }

  // ---- Poser: hver giver { P (hals/krop), under (hale), rings (bunke), hoodK, gape } ----

  // Tykkelse langs den hængende slange: tyndere i toppen (halen) og lidt smallere i nakken
  function profile(s) {
    const th = s.th / 2;
    return (i, n, d, L) => th * (.6 + .4 * sm(0, 1.6, d)) * (1 - .16 * sm(L - 2.4, L - .1, d));
  }
  // Hætten er en udvidelse af nakken lige bag hovedet
  function withHood(s, base, k) {
    if (!s.hood || k <= 1) return base;
    const hl = s.hood.len;
    return (i, n, d, L) => {
      const u = (L - d) / hl, f = u < 0 || u > 1 ? 0 : (.45 + .55 * sm(0, .3, u)) * (1 - sm(.35, 1, u));
      return base(i, n, d, L) * (1 + (k - 1) * f);
    };
  }

  function hangPose(s, o, t, angry) {
    const h = s.head, len = o.len || 6.5, Ls = Math.max(3, len - h.L * .5);
    const n = clamp(Math.round(Ls / .32), 22, 46), ds = Ls / n;
    const target = angry ? .1 : .3;
    const pts = [[0, 0]]; let x = 0, y = 0;
    for (let i = 0; i < n; i++) {
      const sa = (i + .5) * ds;
      const phi = PI / 2 + .5 * sin(sa * 1.45 - t * 1.4) * sm(0, 2.4, sa) * (1 - .55 * sm(Ls - 2.8, Ls, sa)) + (target - PI / 2) * (s.hood ? sm(Ls - 1.0, Ls - .1, sa) : sm(Ls - 3.1, Ls - .2, sa));
      x += cos(phi) * ds; y += sin(phi) * ds; pts.push([x, y]);
    }
    const hoodK = s.hood ? (angry ? s.hood.angry : s.hood.calm) : 1;
    const P = makeSpine(resample(pts, n), withHood(s, profile(s), hoodK));
    return { P, under: [], rings: [], hoodK, gape: angry ? .5 : .06 + .03 * sin(t * 2) };
  }

  // Bunke af ringe (kroppen set fra siden) med hals, der stiger op bag dem
  function pile(s, o, t, angry, att) {
    const g = s.coil, th = s.th * s.sitK, R = att ? g.rx * .92 : g.rx, Ry = g.ry, rise = th * .7;
    const cx = att ? g.cx - .08 : g.cx, cyb = 1 - Ry - th / 2, nr = att ? Math.max(1, g.rings - 1) : g.rings;
    const rings = [];
    for (let i = 0; i < nr; i++) rings.push({ cx: cx + i * .03, cy: cyb - i * rise, rx: R * (1 - .08 * i), ry: Ry });
    const top = rings[rings.length - 1], x0 = top.cx + top.rx * .35, y0 = top.cy, xr = top.cx + top.rx + th * .2, H = g.neck;
    let a;
    if (att) {
      const w = sin(t * 3.4), w2 = sin(t * 2.3 + 1);
      a = s.hood ? [[x0, y0 - .05], [xr - .1, y0 - .1], [xr + .1, y0 - H * .3], [xr + .1 + w2 * .03, y0 - H * .7], [xr + .1 + w * .03, y0 - H * 1.08], [xr + .3 + w * .04, y0 - H * 1.2 + w * .02], [xr + .62 + w * .06, y0 - H * 1.12 + w * .03]]
        : [[x0, y0 - .05], [xr - .1, y0 - .1], [xr + .12, y0 - H * .45], [xr + .06 + w2 * .05, y0 - H * .85], [xr + .2 + w * .04, y0 - H * 1.1 + w * .03], [xr + .48 + w * .07, y0 - H * 1.03 + w * .04], [xr + .72 + w * .08, y0 - H * .9 + w * .04]];
    } else {
      const sw = sin(t * 1.1) * .05, br = sin(t * 1.5) * .012;
      a = [[x0, y0 - .05], [xr - .1, y0 - .1], [xr + .05, y0 - H * .35], [xr + .02 + sw, y0 - H * .72], [xr + .2, y0 - H * .95 + br], [xr + .46, y0 - H + br]];
    }
    const hoodK = s.hood ? (att ? s.hood.attack : angry ? s.hood.angry : s.hood.calm) : 1;
    const nk = catmull([a[0], ...a], 5).slice(5);
    const wf = withHood(s, (i, n, d, L) => th / 2 * (1 - .16 * sm(L - 1.6, L - .1, d)), hoodK);
    const P = makeSpine(resample([a[0]].concat(nk), 0, .26), wf);
    // halespids, der stikker ud under bunken
    const tp = [[cx - R * .3, cyb + Ry * .8], [cx - R - .08, cyb + Ry * .6], [cx - R - .3, cyb + Ry * .3], [cx - R - .45, cyb - .02]];
    const TP = makeSpine(resample(catmull([tp[0], ...tp], 5).slice(5), 0, .26), (i, n) => th / 2 * .75 * (1 - Math.pow(i / n, 1.3)) + .004);
    return { P, under: [TP], rings, th, hoodK, gape: att ? .6 + .07 * sin(t * 5) : angry ? .38 : .05 + .03 * sin(t * 1.7) };
  }

  const ring = (c, s, th, r) => {
    c.beginPath(); c.ellipse(r.cx, r.cy, r.rx, r.ry, 0, 0, PI2);
    c.fillStyle = dk(s.base, .55); c.fill();
    c.strokeStyle = s.line; c.lineWidth = th + .07; c.stroke();
    c.strokeStyle = lin(c, 0, r.cy - r.ry - th / 2, 0, r.cy + r.ry + th / 2, [[0, lt(s.base, .22)], [.5, s.base], [1, dk(s.base, .3)]]); c.lineWidth = th; c.stroke();
    if (s.rm) ringMarks(c, s, th, r);
    c.strokeStyle = "rgba(255,255,255," + (s.gloss || .2) + ")"; c.lineWidth = th * .2;
    c.beginPath(); c.ellipse(r.cx, r.cy - th * .22, r.rx, r.ry, 0, 0, PI2); c.stroke();
  };

  // ---- Øjne ----
  // Slangeøje: mørk kant, farvet regnbuehinde, lodret (slit) eller rund pupil; vred = skrå øjenlåg
  function snakeEye(c, x, y, r, e, angry, headCol) {
    c.save(); c.translate(x, y);
    c.fillStyle = "#10130a"; c.beginPath(); c.arc(0, 0, r * 1.14, 0, PI2); c.fill();
    c.fillStyle = rad(c, 0, 0, 0, r, [[0, lt(e.iris, .35)], [.7, e.iris], [1, dk(e.iris, .35)]], -r * .2, -r * .25);
    c.beginPath(); c.arc(0, 0, r, 0, PI2); c.fill();
    c.fillStyle = "#06080a"; c.beginPath();
    if (e.pupil === "slit") c.ellipse(r * .08, 0, r * .2, r * .86, 0, 0, PI2); else c.arc(r * .1, 0, r * .52, 0, PI2);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.95)"; c.beginPath(); c.arc(-r * .32, -r * .4, r * .26, 0, PI2); c.fill();
    c.fillStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.arc(r * .38, r * .38, r * .1, 0, PI2); c.fill();
    if (e.ring) { c.strokeStyle = e.ring; c.lineWidth = r * .16; c.beginPath(); c.arc(0, 0, r * .92, 0, PI2); c.stroke(); }
    if (angry) { // øjenlåg, der skråner nedad mod snuden
      c.beginPath(); c.arc(0, 0, r * 1.14, 0, PI2); c.save(); c.clip();
      c.fillStyle = headCol; c.beginPath(); c.moveTo(-r * 1.5, -r * 1.6); c.lineTo(r * 1.5, -r * 1.6); c.lineTo(r * 1.5, r * .02); c.lineTo(-r * 1.5, -r * .62); c.closePath(); c.fill();
      c.strokeStyle = "#10130a"; c.lineWidth = r * .3; c.beginPath(); c.moveTo(-r * 1.5, -r * .62); c.lineTo(r * 1.5, r * .02); c.stroke();
      c.restore();
    }
    c.restore();
  }

  // ---- Hoved ----
  const HD = {
    // gul-orange kindstribe fra øjet og bagud
    anaconda(c, s, h) {
      c.strokeStyle = "#e6a53c"; c.lineWidth = h.L * .08; c.lineCap = "round";
      c.beginPath(); c.moveTo(h.L * .5, -h.hb * .3); c.quadraticCurveTo(h.L * .3, h.hb * .15, h.L * .02, h.hb * .5); c.stroke();
      c.strokeStyle = "rgba(20,24,8,.7)"; c.lineWidth = h.L * .05;
      c.beginPath(); c.moveTo(h.L * .5, -h.hb * .55); c.quadraticCurveTo(h.L * .28, -h.hb * .1, h.L * -.02, h.hb * .16); c.stroke();
      c.lineCap = "butt";
    },
    // mørk stribe fra snuden gennem øjet
    net(c, s, h) {
      c.strokeStyle = s.dark; c.lineWidth = h.L * .075; c.lineCap = "round";
      c.beginPath(); c.moveTo(h.L * .98, -h.sn * .15); c.lineTo(h.L * .55, -h.hb * .3); c.quadraticCurveTo(h.L * .25, -h.hb * .1, h.L * .02, h.hb * .45); c.stroke();
      c.lineCap = "butt";
    },
    mamba() {},
    kobra(c, s, h) {
      c.fillStyle = s.light; c.globalAlpha = .6; c.beginPath(); c.ellipse(h.L * .86, h.sn * .3, h.L * .16, h.sn * .22, 0, 0, PI2); c.fill(); c.globalAlpha = 1;
    },
    boa(c, s, h) {
      c.strokeStyle = s.dark; c.lineWidth = h.L * .07; c.lineCap = "round";
      c.beginPath(); c.moveTo(h.L * .55, -h.hb * .25); c.quadraticCurveTo(h.L * .3, h.hb * .05, h.L * .08, h.hb * .55); c.stroke(); c.lineCap = "butt";
    },
    // grubeorgan foran øjet og tung bryn
    viper(c, s, h) {
      c.fillStyle = s.dark; c.globalAlpha = .55;
      c.beginPath(); c.moveTo(h.L * .4, -h.hb * .15); c.lineTo(h.L * .1, h.hb * .6); c.lineTo(h.L * .3, h.hb * .75); c.lineTo(h.L * .6, h.hb * .1); c.closePath(); c.fill();
      c.globalAlpha = 1;
      c.fillStyle = "#1e1008"; c.beginPath(); c.ellipse(h.L * .74, h.sn * .02, h.L * .045, h.L * .035, -.3, 0, PI2); c.fill();
      c.strokeStyle = lt(s.base, .35); c.lineWidth = .02; c.beginPath(); c.ellipse(h.L * .74, h.sn * .02, h.L * .055, h.L * .045, -.3, 0, PI2); c.stroke();
    }
  };

  const fade = (col, a) => { const v = T.hx(col); return "rgba(" + v[0] + "," + v[1] + "," + v[2] + "," + a + ")"; };

  function headPath(c, h, hn) {
    const L = h.L, hb = h.hb, sn = h.sn, Cx = .3 * L, Cy = h.mc * hb, My = h.ms * sn;
    c.beginPath();
    c.moveTo(-.15 * L, -hn);
    if (h.ang) { // kantet hoved (huggorm)
      c.lineTo(.1 * L, -hb * h.bt); c.lineTo(.5 * L, -hb * h.bt * .62); c.lineTo(.9 * L, -sn * 1.05); c.lineTo(L, -sn * .5);
      c.lineTo(L, My - .01);
    } else {
      c.bezierCurveTo(.05 * L, -hb * h.bt, .38 * L, -hb * h.bt, .62 * L, -sn * h.st);
      c.bezierCurveTo(.82 * L, -sn * h.st * .97, L, -sn * .8, L, -sn * .1);
      c.bezierCurveTo(L, sn * .2, L * .99, My - .01, .97 * L, My);
    }
    c.lineTo(.97 * L, My);
    c.quadraticCurveTo(.62 * L, My + .03, Cx, Cy);
    c.lineTo(.12 * L, Cy + h.cd * hb * .85);
    c.quadraticCurveTo(0, Cy + h.cd * hb * .95, -.15 * L, hn);
  }

  function drawHead(c, s, h, hn, G, t, angry) {
    const L = h.L, hb = h.hb, sn = h.sn, Cx = .3 * L, Cy = h.mc * hb, My = h.ms * sn, g = G.gape;
    const hcol = s.headBase || s.base;
    // underkæbe (drejer om mundvigen)
    const jx = .67 * L, jty = My - Cy, jt = Math.max(.08, sn * .75);
    const tipX = Cx + jx * cos(g) - jty * sin(g), tipY = Cy + jx * sin(g) + jty * cos(g); // underkæbens spids
    c.save(); c.translate(Cx, Cy); c.rotate(g);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(jx, jty); c.quadraticCurveTo(jx + .05 * L, jty + jt * .45, jx - .03 * L, jty + jt);
    c.quadraticCurveTo(.3 * L, jty + jt + hb * .1, -.18 * L, hb * h.cd * .85); c.closePath();
    c.fillStyle = lin(c, 0, 0, 0, hb * .8, [[0, mix(s.belly, hcol, .3)], [1, dk(mix(s.belly, hcol, .45), .18)]]); c.fill();
    c.strokeStyle = s.line; c.lineWidth = .035; c.lineJoin = "round"; c.stroke();
    if (g > .08) { // mundens indre
      const ux = (L * .97 - Cx) * cos(g) + (My - Cy) * sin(g), uy = -(L * .97 - Cx) * sin(g) + (My - Cy) * cos(g);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(jx - .02, jty); c.lineTo(ux, uy); c.closePath();
      c.fillStyle = lin(c, 0, 0, jx, 0, [[0, "#6e1830"], [1, "#e4607e"]]); c.fill();
    }
    c.restore();
    const mouthY = (x) => My + (Cy - My) * (.97 * L - x) / (.67 * L);
    // tunge (flikker ind og ud i takt)
    const f = sm(.08, .8, .5 + .5 * sin(t * 4.6 + 1.5)), ext = .7 * L * f;
    if (ext > .02) {
      const ox = .97 * L - .3 * L * sm(.2, .5, g), oy = (My + tipY) / 2 + .005, wag = sin(t * 17) * .012, fx = .97 * L + ext * .72, fy = oy + wag + g * ext * .1;
      c.strokeStyle = "#d8284c"; c.lineWidth = .028; c.lineCap = "round"; c.lineJoin = "round";
      c.beginPath(); c.moveTo(ox, oy); c.lineTo(fx, fy);
      c.moveTo(fx, fy); c.lineTo(.97 * L + ext, fy - ext * .13); c.moveTo(fx, fy); c.lineTo(.97 * L + ext, fy + ext * .13);
      c.stroke(); c.lineCap = "butt";
    }
    // huggetænder
    const fs = sm(.08, .36, g);
    if (fs > .05) {
      const fl = (angry ? .3 : .22) * fs * (hb + .25);
      c.fillStyle = "#faf6e6"; c.strokeStyle = "rgba(60,50,40,.7)"; c.lineWidth = .012; c.beginPath();
      for (const fx of [.74, .86]) {
        const x = fx * L, y = mouthY(x) - .01;
        c.moveTo(x - .035, y); c.quadraticCurveTo(x - .02, y + fl * .6, x - .02, y + fl); c.quadraticCurveTo(x + .04, y + fl * .4, x + .035, y); c.closePath();
      }
      c.fill(); c.stroke();
    }
    // overhoved
    headPath(c, h, hn);
    c.fillStyle = lin(c, -.15 * L, 0, .14 * L, 0, [[0, fade(hcol, 0)], [1, hcol]]); c.fill(); // glider ud over halsen
    c.fillStyle = lin(c, 0, -hb, 0, hb, [[0, "rgba(255,255,255,.24)"], [.45, "rgba(255,255,255,0)"], [1, "rgba(0,0,0,.2)"]]); c.fill();
    c.save(); c.clip();
    c.fillStyle = s.belly; c.beginPath(); c.moveTo(-.2 * L, hn * .62); c.quadraticCurveTo(.1 * L, hn * .4 + Cy * .5, Cx, Cy + .02); c.lineTo(Cx, Cy + 1); c.lineTo(-.2 * L, hn + 1); c.closePath(); c.fill();
    HD[s.hd](c, s, h);
    c.restore();
    headPath(c, h, hn);
    c.strokeStyle = s.line; c.lineWidth = .04; c.lineJoin = "round"; c.stroke();
    // læbeskæl
    c.strokeStyle = "rgba(0,0,0,.28)"; c.lineWidth = .014; c.beginPath();
    for (let i = 0; i < 6; i++) { const x = (.38 + i * .1) * L, y = My + (Cy - My) * (1 - (x / L - .3) / .67); c.moveTo(x, y); c.lineTo(x + .01, y - .09 * (hb + .1)); }
    c.stroke();
    // glans på hovedet
    c.fillStyle = "rgba(255,255,255,.3)"; c.beginPath(); c.ellipse(L * .5, -hb * .62, L * .22, hb * .12, -.06, 0, PI2); c.fill();
    // næsebor
    c.fillStyle = "rgba(10,10,6,.8)"; c.beginPath(); c.ellipse(L * .9, -sn * .42, .022, .014, -.5, 0, PI2); c.fill();
    // øje
    const e = h.eye;
    snakeEye(c, e.x * L, e.y * hb, e.r, e, angry, hcol);
    if (h.brow) { c.strokeStyle = dk(hcol, .5); c.lineWidth = .04; c.lineCap = "round"; c.beginPath(); c.moveTo(e.x * L - e.r * 1.2, e.y * hb - e.r * 1.45); c.lineTo(e.x * L + e.r * 1.5, e.y * hb - e.r * .85); c.stroke(); c.lineCap = "butt"; }
  }

  // Brillerne på indisk kobras hætte
  function spectacle(c, s, P, G) {
    const j = Math.round(P.n - s.hood.len * .5 / P.ds);
    if (j < 1) return;
    const w = P.W[j], r = w * .31;
    c.save(); c.translate(P.X[j], P.Y[j]); c.rotate(P.A[j] + PI / 2);
    c.strokeStyle = s.dark; c.fillStyle = s.hoodMark; c.lineWidth = r * .3; c.lineCap = "round";
    for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * r * 1.1, -r * .4, r, 0, PI2); c.fill(); c.stroke(); c.fillStyle = s.dark; c.beginPath(); c.arc(sx * r * 1.1, -r * .4, r * .36, 0, PI2); c.fill(); c.fillStyle = s.hoodMark; }
    c.beginPath(); c.moveTo(-r * .2, -r * .5); c.quadraticCurveTo(0, -r * .9, r * .2, -r * .5); c.stroke();
    c.beginPath(); c.moveTo(-r * 1.2, r * .6); c.quadraticCurveTo(-r * .6, r * 2.2, 0, r * 2.6); c.quadraticCurveTo(r * .6, r * 2.2, r * 1.2, r * .6); c.stroke();
    c.restore();
  }

  T.addKind("slange", function (c, s, o) {
    const t = o.t || 0, mode = o.mode === "hang" || o.mode === "attack" ? o.mode : "sit", angry = !!o.angry || mode === "attack";
    const G = mode === "hang" ? hangPose(s, o, t, angry) : pile(s, o, t, angry, mode === "attack");
    const P = G.P;
    c.save();
    c.lineJoin = "round";
    if (mode === "hang") { // afrundet top, hvor slangen hænger i grenen
      c.fillStyle = s.line; c.beginPath(); c.arc(P.X[0], P.Y[0], P.W[0] + .035, 0, PI2); c.fill();
      c.fillStyle = s.base; c.beginPath(); c.arc(P.X[0], P.Y[0], P.W[0], 0, PI2); c.fill();
    }
    for (const U of G.under) chunk(c, s, U, 0, U.n);
    chunk(c, s, P, 0, P.n);
    if (s.hood && s.hood.mark && G.hoodK > 1.2) spectacle(c, s, P, G);
    for (const r of G.rings) ring(c, s, G.th, r);
    const n = P.n;
    c.translate(P.X[n], P.Y[n]); c.rotate(P.A[n]);
    drawHead(c, s, s.head, P.W[n], G, t, angry);
    c.restore();
  });

  const head = (o) => Object.assign({ mc: .15, ms: .3, cd: .5, bt: 1.05, st: .95 }, o);

  T.look("anakonda", "slange", {
    th: .5, sitK: 1.25, pat: "anaconda", per: .74, hd: "anaconda",
    base: "#76843c", belly: "#dcd6a0", line: "#222a10", dark: "#1c2210", ring: "#a4ae58", tail: "#58642c",
    rm: { per: .66, layers: [{ t: "blob", col: "#a4ae58", sx: .4, sy: .34 }, { t: "blob", col: "#1c2210", sx: .29, sy: .24 }] },
    coil: { cx: -.7, rx: .66, ry: .26, rings: 2, neck: 1.0 },
    head: head({ L: .9, hb: .24, sn: .15, bt: 1.1, eye: { x: .6, y: -.62, r: .09, iris: "#c4902c", pupil: "round" } })
  });
  T.look("groen_mamba", "slange", {
    th: .26, sitK: 1.35, pat: "mamba", per: .5, hd: "mamba", gloss: .38,
    base: "#52c63c", belly: "#dcec74", line: "#1a5a16", dark: "#2c8c28", ring: "rgba(190,240,110,.45)",
    coil: { cx: -.74, rx: .6, ry: .22, rings: 3, neck: 1.05 },
    head: head({ L: .82, hb: .14, sn: .09, bt: 1.0, st: 1, cd: .55, eye: { x: .55, y: -.12, r: .085, iris: "#3a2a0e", ring: "#d8b440", pupil: "round" } })
  });
  T.look("netpyton", "slange", {
    th: .42, sitK: 1.3, pat: "net", per: .75, hd: "net",
    base: "#c8a448", belly: "#f0e4b8", line: "#2a1c0e", dark: "#2e1c0e", light: "#e6cd82", tail: "#a8782c",
    rm: { per: .8, layers: [{ t: "diamond", col: "#2e1c0e", sx: .58, sy: .4 }, { t: "diamond", col: "#e6cd82", sx: .3, sy: .2 }] },
    coil: { cx: -.7, rx: .66, ry: .26, rings: 2, neck: 1.0 },
    head: head({ L: .98, hb: .18, sn: .11, bt: 1.0, st: 1, cd: .6, eye: { x: .52, y: -.3, r: .072, iris: "#b87a22", pupil: "slit" } })
  });
  T.look("kongekobra", "slange", {
    th: .4, sitK: 1.3, pat: "bands", per: .56, hd: "kobra", hood: { len: 1.9, calm: 2.5, angry: 2.9, attack: 3.0 },
    base: "#5a5230", belly: "#ecdc9c", line: "#1c1a0c", dark: "#2a2514", light: "#e6dba4",
    rm: { per: .58, layers: [{ t: "bar", col: "#e6dba4", sx: .08, sy: .46, sl: .5 }] },
    coil: { cx: -.7, rx: .66, ry: .26, rings: 2, neck: 1.05 },
    head: head({ L: .95, hb: .27, sn: .17, bt: 1.08, eye: { x: .52, y: -.28, r: .085, iris: "#8a5a1a", ring: "#d8b440", pupil: "round" } })
  });
  T.look("indisk_kobra", "slange", {
    th: .34, sitK: 1.3, pat: "bars", per: .8, hd: "kobra", hood: { len: 2.0, calm: 2.4, angry: 2.8, attack: 3.0, mark: true },
    base: "#b08c3c", belly: "#f0e2ac", line: "#3a2810", dark: "#5a3a14", light: "#e0c878", hoodMark: "#f0e2ac",
    coil: { cx: -.7, rx: .64, ry: .26, rings: 2, neck: 1.0 },
    head: head({ L: .82, hb: .21, sn: .13, eye: { x: .55, y: -.28, r: .08, iris: "#3a2410", ring: "#c8a040", pupil: "round" } })
  });
  T.look("mad_boa", "slange", {
    th: .46, sitK: 1.3, pat: "saddles", per: 1.0, hd: "boa",
    base: "#a89880", belly: "#e8dcc4", line: "#2e2018", dark: "#58361e", light: "#9c6a46", tail: "#b0562e",
    rm: { per: .85, layers: [{ t: "blob", col: "#58361e", sx: .36, sy: .3, dy: -.08 }, { t: "blob", col: "#9c6a46", sx: .2, sy: .15, dy: -.08 }] },
    coil: { cx: -.7, rx: .66, ry: .26, rings: 2, neck: 1.0 },
    head: head({ L: .96, hb: .26, sn: .17, st: 1, eye: { x: .56, y: -.3, r: .08, iris: "#c88a2a", pupil: "slit" } })
  });
  T.look("buskmester", "slange", {
    th: .42, sitK: 1.3, pat: "hourglass", per: 1.1, hd: "viper", scale: "rgba(60,30,10,.3)",
    base: "#cda27c", belly: "#f0dcbc", line: "#3a2214", dark: "#4e2c18", light: "#e8c8a0",
    rm: { per: .8, layers: [{ t: "diamond", col: "#4e2c18", sx: .5, sy: .4 }, { t: "blob", col: "#e8c8a0", sx: .12, sy: .1 }] },
    coil: { cx: -.7, rx: .66, ry: .26, rings: 2, neck: 1.0 },
    head: head({ L: 1.02, hb: .3, sn: .11, bt: 1.0, st: 1, ang: true, cd: .75, brow: true, eye: { x: .52, y: -.25, r: .072, iris: "#c88a24", pupil: "slit" } })
  });

  // ===================================================================
  //  FÆLLES HJÆLP TIL FIRBEN OG FRØER
  // ===================================================================
  // Led af tykke streger (lemmer): først alle konturer, så alle fyld, så der ikke er streger i samlingerne
  function limb(c, pts, ws, col, line) {
    c.lineCap = "round"; c.lineJoin = "round";
    for (let pass = 0; pass < 2; pass++) {
      c.strokeStyle = pass ? col : line;
      for (let i = 0; i < pts.length - 1; i++) {
        c.lineWidth = ws[i] + (pass ? 0 : .06);
        c.beginPath(); c.moveTo(pts[i][0], pts[i][1]); c.lineTo(pts[i + 1][0], pts[i + 1][1]); c.stroke();
      }
    }
  }
  const bz = (p0, p1, p2, p3, u) => {
    const v = 1 - u, a = v * v * v, b = 3 * v * v * u, d = 3 * v * u * u, e = u * u * u;
    return [a * p0[0] + b * p1[0] + d * p2[0] + e * p3[0], a * p0[1] + b * p1[1] + d * p2[1] + e * p3[1]];
  };
  // Hale/krop som bånd langs en kurve (genbruger slangens bånd): pts = [[x, y], ...]
  function tailRibbon(c, pts, w0, w1, col, line, bandCol, per) {
    const dense = catmull([pts[0], ...pts], 5).slice(5);
    const P = makeSpine(resample(dense, 0, .12), (i, n) => w0 + (w1 - w0) * Math.pow(i / n, .8));
    c.fillStyle = line; ribbon(c, P, 0, P.n, -1, 1, .03);
    c.fillStyle = col; ribbon(c, P, 0, P.n, -1, 1, 0);
    if (bandCol) { c.fillStyle = bandCol; c.beginPath(); for (let j = 1; j < P.n - 1; j += per) band(c, P, j, 0, per * .45, -1, 1); c.fill(); }
    c.fillStyle = "rgba(0,0,0,.2)"; ribbon(c, P, 0, P.n, -1, -.1, 0);
    c.fillStyle = "rgba(255,255,255,.22)"; ribbon(c, P, 0, P.n, .3, .8, 0);
    return P;
  }

  // ===================================================================
  //  KAMÆLEONER
  // ===================================================================
  function camEye(c, s, x, y, r, look, blink, far) {
    c.fillStyle = far ? dk(s.base, .25) : rad(c, x, y, 0, r * 1.2, [[0, lt(s.base, .3)], [.7, s.base], [1, dk(s.base, .3)]], x - r * .3, y - r * .3);
    c.beginPath(); c.arc(x, y, r, 0, PI2); c.fill();
    c.strokeStyle = s.line; c.lineWidth = .035; c.stroke();
    c.strokeStyle = dk(s.base, .35); c.lineWidth = .02; c.beginPath(); c.arc(x, y, r * .62, 0, PI2); c.stroke();
    if (blink) return;
    const px = x + cos(look) * r * .22, py = y + sin(look) * r * .22;
    c.fillStyle = s.iris; c.beginPath(); c.arc(px, py, r * .42, 0, PI2); c.fill();
    c.fillStyle = "#06080a"; c.beginPath(); c.arc(px, py, r * .26, 0, PI2); c.fill();
    c.fillStyle = "rgba(255,255,255,.9)"; c.beginPath(); c.arc(px - r * .1, py - r * .12, r * .1, 0, PI2); c.fill();
  }

  T.addKind("kamaeleon", function (c, s, o) {
    const t = o.t || 0, br = sin(t * 1.8), angry = !!o.angry;
    const blink = (t + 1.3) % 4.8 < .14;
    const lookN = sin(t * .8) * 1.3 + .3, lookF = sin(t * .55 + 1.7) * 1.3 - .2;
    c.save(); c.lineJoin = "round"; c.lineCap = "round";
    // krøllet hale (spiral): starter ved lænden og ruller ind
    const tp = [];
    for (let i = 0; i <= 16; i++) { const u = i / 16, a = -1.0 + u * PI2 * 1.45, r = .46 * (1 - u) + .06; tp.push([-1.08 + r * cos(a), .66 + r * sin(a)]); }
    tp.unshift([-.78, .22]);
    tailRibbon(c, tp, .12, .025, s.base, s.line, s.dark, 4);
    // fjerne ben (bagved kroppen)
    const darkLeg = dk(s.base, .3);
    limb(c, [[.7, .35], [.86, .68], [.8, .96]], [.14, .11], darkLeg, s.line);
    limb(c, [[-.28, .32], [-.1, .66], [-.2, .96]], [.16, .12], darkLeg, s.line);
    // krop og hoved med vejrtrækning (drejer om fødderne)
    c.save(); c.translate(0, .95); c.scale(1 + .008 * br, 1 + .02 * br); c.translate(0, -.95);
    const body = () => {
      c.beginPath(); c.moveTo(.66, -.28);
      c.bezierCurveTo(.4, -.64, -.1, -.7, -.55, -.5); c.bezierCurveTo(-.85, -.38, -.97, -.05, -.87, .2);
      c.bezierCurveTo(-.72, .52, -.2, .68, .3, .58); c.bezierCurveTo(.58, .52, .8, .38, .88, .18); c.lineTo(.8, -.12); c.closePath();
    };
    // rygkam (små tænder langs ryggen)
    c.fillStyle = s.line; c.beginPath();
    for (let i = 0; i < 9; i++) {
      const u = .05 + i * .11, p = bz([.66, -.28], [.4, -.64], [-.1, -.7], [-.55, -.5], u), q = bz([.66, -.28], [.4, -.64], [-.1, -.7], [-.55, -.5], u + .03);
      const dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1, nx = dy / d, ny = -dx / d;
      c.moveTo(p[0] - dx * .6, p[1] - dy * .6 + .03); c.lineTo(p[0] + nx * .1 + dx * .2, p[1] + ny * .1 + dy * .2); c.lineTo(q[0] + dx * .6, q[1] + dy * .6 + .03); c.closePath();
    }
    c.fill();
    body();
    c.fillStyle = lin(c, 0, -.7, 0, .7, [[0, s.top || lt(s.base, .15)], [.5, s.base], [1, dk(s.base, .18)]]); c.fill();
    c.save(); c.clip();
    c.fillStyle = s.belly; c.beginPath(); c.ellipse(.05, .86, 1.1, .38, 0, 0, PI2); c.fill();
    // tværstriber (lyse og mørke), let skrå
    c.fillStyle = s.dark; c.globalAlpha = s.barA || .5; c.beginPath();
    for (let i = 0; i < 6; i++) { const x = -.78 + i * .3; c.moveTo(x, -.8); c.lineTo(x + .1, -.8); c.lineTo(x - .02, .8); c.lineTo(x - .12, .8); c.closePath(); }
    c.fill(); c.fillStyle = s.light; c.globalAlpha = s.lightA || .5; c.beginPath();
    for (let i = 0; i < 6; i++) { const x = -.64 + i * .3; c.moveTo(x, -.8); c.lineTo(x + .07, -.8); c.lineTo(x - .05, .8); c.lineTo(x - .12, .8); c.closePath(); }
    c.fill(); c.globalAlpha = 1;
    if (s.spots) { // røde-orange pletter langs flanken
      c.fillStyle = s.spots; c.beginPath();
      for (const q of [[-.7, .02, .08], [-.5, -.18, .07], [-.45, .22, .09], [-.2, -.3, .07], [-.18, .08, .1], [-.05, .38, .08], [.12, -.22, .08], [.2, .15, .09], [.38, -.05, .07], [.42, .3, .08], [-.65, .35, .06], [.55, .12, .06]]) { c.moveTo(q[0] + q[2], q[1]); c.arc(q[0], q[1], q[2], 0, PI2); }
      c.fill();
      c.strokeStyle = s.light; c.lineWidth = .05; c.beginPath(); c.moveTo(.6, .02); c.bezierCurveTo(.2, .16, -.4, .2, -.85, .12); c.stroke();
    }
    c.restore();
    c.strokeStyle = s.line; c.lineWidth = .04; body(); c.stroke();
    c.fillStyle = "rgba(255,255,255,.22)"; c.beginPath(); c.ellipse(-.1, -.38, .5, .08, -.12, 0, PI2); c.fill();
    // nær baglem og forlem (grib om grenen)
    const cl = s.base;
    limb(c, [[-.5, .3], [-.3, .68], [-.42, .96]], [.2, .15], cl, s.line);
    limb(c, [[.5, .3], [.66, .68], [.56, .96]], [.18, .14], cl, s.line);
    for (const fx of [-.42, .56]) {
      c.fillStyle = cl; c.strokeStyle = s.line; c.lineWidth = .035; c.beginPath(); c.ellipse(fx, .96, .17, .07, 0, 0, PI2); c.fill(); c.stroke();
      c.strokeStyle = s.line; c.lineWidth = .03; c.beginPath(); c.moveTo(fx + .15, .93); c.lineTo(fx + .2, .99); c.moveTo(fx - .15, .93); c.lineTo(fx - .2, .99); c.stroke();
    }
    // tunge: et sjældent, hurtigt flik
    const ph = (t % 7) / 7, u = clamp((ph - .8) / .12, 0, 1), ext = Math.pow(sin(u * PI), 1.4) * 1.35;
    if (ext > .02) {
      c.strokeStyle = "#e0647a"; c.lineWidth = .06; c.beginPath(); c.moveTo(1.3, .13); c.lineTo(1.5 + ext, .1 - ext * .05); c.stroke();
      c.fillStyle = "#e0405a"; c.beginPath(); c.arc(1.5 + ext, .1 - ext * .05, .085, 0, PI2); c.fill();
    }
    // slør (hjelm) bagpå hovedet
    const cs = s.casque;
    c.beginPath(); c.moveTo(.76, -.2); c.quadraticCurveTo(.62 + (1 - cs) * .1, -.2 - .35 * cs, .66, -.2 - .65 * cs); c.quadraticCurveTo(.98, -.2 - .55 * cs, 1.14, -.2); c.lineTo(.95, -.02); c.closePath();
    c.fillStyle = lin(c, .6, -.9, 1.1, -.1, [[0, lt(s.base, .1)], [1, dk(s.base, .1)]]); c.fill();
    c.save(); c.clip(); c.strokeStyle = s.dark; c.globalAlpha = .55; c.lineWidth = .05; c.beginPath();
    for (let i = 0; i < 4; i++) { c.moveTo(.6, -.1 - i * .17 * cs); c.quadraticCurveTo(.9, -.28 - i * .17 * cs, 1.2, -.1 - i * .05); }
    c.stroke(); c.globalAlpha = 1; c.restore();
    c.strokeStyle = s.line; c.lineWidth = .04; c.beginPath(); c.moveTo(.76, -.2); c.quadraticCurveTo(.62 + (1 - cs) * .1, -.2 - .35 * cs, .66, -.2 - .65 * cs); c.quadraticCurveTo(.98, -.2 - .55 * cs, 1.14, -.2); c.stroke();
    // fjerne øje (kigger en anden vej)
    camEye(c, s, 1.14, -.26, .15, lookF, blink, true);
    // hoved
    const head = () => {
      c.beginPath(); c.moveTo(.7, -.24); c.bezierCurveTo(.95, -.32, 1.2, -.3, 1.38, -.12); c.bezierCurveTo(1.5, -.04, 1.58, 0, 1.58, .07);
      c.lineTo(1.55, .14); c.quadraticCurveTo(1.25, .24, .98, .22); c.bezierCurveTo(.9, .3, .86, .4, .82, .46); c.lineTo(.7, .2); c.closePath();
    };
    head();
    c.fillStyle = lin(c, 0, -.3, 0, .45, [[0, lt(s.base, .18)], [.5, s.base], [1, s.belly]]); c.fill();
    c.save(); c.clip();
    if (s.spots) { c.fillStyle = s.spots; c.beginPath(); for (const q of [[1.2, -.12, .05], [1.35, 0, .04], [.95, .1, .05], [1.12, .12, .04]]) { c.moveTo(q[0] + q[2], q[1]); c.arc(q[0], q[1], q[2], 0, PI2); } c.fill(); }
    c.restore();
    c.strokeStyle = s.line; c.lineWidth = .04; head(); c.stroke();
    // mund og næsebor
    c.strokeStyle = dk(s.base, .55); c.lineWidth = .03; c.beginPath(); c.moveTo(1.55, .12); c.quadraticCurveTo(1.25, .2, .98, .2); c.stroke();
    c.fillStyle = s.line; c.beginPath(); c.arc(1.46, .03, .02, 0, PI2); c.fill();
    camEye(c, s, 1.0, -.1, .21, lookN, blink, false);
    if (angry) { c.strokeStyle = s.line; c.lineWidth = .06; c.beginPath(); c.moveTo(.82, -.32); c.lineTo(1.18, -.12); c.stroke(); }
    c.restore();
    c.restore();
  });

  T.look("kamaeleon", "kamaeleon", {
    base: "#6aa83e", top: "#86c24e", belly: "#d4e6a0", light: "#d8e890", dark: "#2a5a28", line: "#1e3a18", iris: "#d8b030", casque: 1,
    lightA: .55, barA: .5
  });
  T.look("panterkamaeleon", "kamaeleon", {
    base: "#26b8b0", top: "#2f7ad8", belly: "#b8f0d8", light: "#d8fff0", dark: "#1a6a9a", line: "#0e3a52", iris: "#f08a30", casque: .22, spots: "#f0642e",
    lightA: .45, barA: .3
  });

  // ===================================================================
  //  FLYVEDRAGE (Draco volans)
  // ===================================================================
  // Hudvinge som en vifte: forkant fra skulderen ud til spidsen, rund ydre kant med buer, ribben som stråler ud fra kroppen
  function wing(c, s, sg, ext, sh, ph) {
    const A0 = [.42, sg * .1], A1 = [-.4, sg * .1], T = [.72 + sh, sg * ext * .92];
    const C1 = [.55 + sh * .5, sg * ext * 1.18], C2 = [-.25, sg * ext * 1.0], N = 6;
    c.beginPath(); c.moveTo(A0[0], A0[1]);
    c.quadraticCurveTo(.62 + sh * .6, sg * ext * .45, T[0], T[1]);
    for (let k = 1; k <= N; k++) {
      const p = bz(T, C1, C2, A1, k / N), q = bz(T, C1, C2, A1, (k - .5) / N), f = 1.09 + .035 * sin(ph + k * 1.4);
      c.quadraticCurveTo(.1 + (q[0] - .1) * f, sg * .3 + (q[1] - sg * .3) * f, p[0], p[1]);
    }
    c.closePath();
    c.fillStyle = lin(c, 0, A0[1], 0, T[1], [[0, s.wingA], [.55, s.wingB], [1, dk(s.wingB, .25)]]); c.fill();
    c.save(); c.clip();
    c.strokeStyle = s.wingDark; c.lineWidth = .04; c.beginPath();
    for (let k = 0; k <= N; k++) { const p = bz(T, C1, C2, A1, k / N), a = k / N; c.moveTo(A0[0] + (A1[0] - A0[0]) * a, A0[1]); c.lineTo(p[0], p[1]); }
    c.stroke();
    c.fillStyle = s.wingDark; c.globalAlpha = .65; c.beginPath();
    for (let k = 0; k < N; k++) { const p = bz(T, C1, C2, A1, (k + .5) / N), a = (k + .5) / N, x = A0[0] + (A1[0] - A0[0]) * a + (p[0] - A0[0] - (A1[0] - A0[0]) * a) * .62, y = A0[1] + (p[1] - A0[1]) * .62; c.moveTo(x + .05, y); c.arc(x, y, .05, 0, PI2); }
    c.fill(); c.globalAlpha = 1;
    c.restore();
    c.strokeStyle = s.line; c.lineWidth = .04; c.lineJoin = "round"; c.stroke();
  }

  T.addKind("flyvedrage", function (c, s, o) {
    const t = o.t || 0, fly = o.mode === "fly", fl = sin(t * 2.6), blink = (t + .6) % 4.4 < .13;
    c.save(); c.lineJoin = "round"; c.lineCap = "round";
    const oy = fly ? 0 : .52;           // krop i midten (fly) eller nede på grenen (sit)
    if (!fly) { c.translate(-.2, .97); c.scale(1.28, 1.28); c.translate(0, -.97); }
    c.translate(0, oy);
    const rot = fly ? 0 : -.1;
    // hale
    const tl = [];
    for (let i = 0; i <= 8; i++) {
      const u = i / 8;
      tl.push(fly ? [-.45 - u * 1.15, .02 + .09 * sin(u * 5 - t * 3) * u] : [-.5 - u * .8 * (1 - .2 * u), .12 + u * .45 - (u > .7 ? (u - .7) * 1.2 : 0)]);
    }
    tailRibbon(c, tl, .085, .012, s.base, s.line, s.dark, 3);
    if (fly) wing(c, s, -1, 1.0 + .08 * fl, .08 * fl, t * 2.6); // fjerne vinge (oppe)
    // ben
    const legc = dk(s.base, .12);
    if (fly) {
      limb(c, [[.3, .1], [.5, .28], [.62, .22]], [.07, .05], legc, s.line);
      limb(c, [[-.3, .1], [-.15, .3], [-.02, .26]], [.08, .05], legc, s.line);
    } else {
      limb(c, [[.35, .1], [.55, .27], [.5, .45 - .0]], [.08, .06], legc, s.line);
      limb(c, [[-.3, .12], [-.2, .3], [-.3, .45]], [.09, .06], legc, s.line);
    }
    // krop
    c.save(); c.rotate(rot);
    const bodyP = () => { c.beginPath(); c.moveTo(.7, -.1); c.bezierCurveTo(.4, -.28, -.2, -.26, -.55, -.08); c.bezierCurveTo(-.65, 0, -.65, .1, -.5, .17); c.bezierCurveTo(-.2, .26, .4, .24, .7, .12); c.closePath(); };
    bodyP();
    c.fillStyle = lin(c, 0, -.28, 0, .26, [[0, lt(s.base, .15)], [.55, s.base], [1, s.belly]]); c.fill();
    c.save(); c.clip();
    c.fillStyle = s.dark; c.globalAlpha = .4; c.beginPath();
    for (let i = 0; i < 6; i++) { const x = -.5 + i * .19; c.moveTo(x, -.3); c.lineTo(x + .09, -.3); c.lineTo(x + .03, .0); c.lineTo(x - .04, .0); c.closePath(); }
    c.fill(); c.globalAlpha = 1; c.restore();
    c.strokeStyle = s.line; c.lineWidth = .04; bodyP(); c.stroke();
    // hoved med hudlap under hagen
    const dw = .04 * sin(t * 2.2);
    c.beginPath(); c.moveTo(.96, .1); c.quadraticCurveTo(1.05 + dw, .32, 1.0 + dw * 2, .46); c.quadraticCurveTo(.88, .34, .74, .14); c.closePath();
    c.fillStyle = lin(c, 0, .1, 0, .46, [[0, "#ffe060"], [1, "#e8a820"]]); c.fill(); c.strokeStyle = s.line; c.lineWidth = .03; c.stroke();
    const headP = () => { c.beginPath(); c.moveTo(.62, -.14); c.bezierCurveTo(.8, -.24, 1.1, -.18, 1.32, -.06); c.bezierCurveTo(1.4, -.02, 1.4, .06, 1.32, .09); c.quadraticCurveTo(1.0, .16, .8, .16); c.quadraticCurveTo(.66, .14, .62, -.14); c.closePath(); };
    headP();
    c.fillStyle = lin(c, 0, -.2, 0, .18, [[0, lt(s.base, .2)], [1, s.base]]); c.fill(); c.strokeStyle = s.line; c.lineWidth = .04; c.stroke();
    c.strokeStyle = dk(s.base, .5); c.lineWidth = .025; c.beginPath(); c.moveTo(1.35, .06); c.quadraticCurveTo(1.05, .13, .84, .12); c.stroke();
    eyeDark(c, 1.0, -.06, .075, "#3a2a14");
    if (blink) { c.fillStyle = s.base; c.beginPath(); c.arc(1.0, -.06, .08, 0, PI2); c.fill(); c.strokeStyle = s.line; c.lineWidth = .025; c.beginPath(); c.moveTo(.93, -.06); c.lineTo(1.07, -.06); c.stroke(); }
    // små pigge i nakken
    c.fillStyle = dk(s.base, .3); c.beginPath(); for (let i = 0; i < 3; i++) { const x = .62 - i * .06; c.moveTo(x, -.2 + i * .01); c.lineTo(x - .04, -.3); c.lineTo(x - .09, -.2); c.closePath(); } c.fill();
    c.restore();
    if (fly) wing(c, s, 1, 1.0 - .08 * fl, -.08 * fl, t * 2.6 + 1);
    else { // sammenfoldet vinge langs siden
      c.save(); c.rotate(rot);
      c.beginPath(); c.moveTo(.38, -.02); c.quadraticCurveTo(.1, -.18, -.34, -.04); c.quadraticCurveTo(-.2, .12, .12, .14); c.closePath();
      c.fillStyle = lin(c, 0, -.1, 0, .14, [[0, s.wingA], [1, s.wingB]]); c.fill(); c.strokeStyle = s.line; c.lineWidth = .035; c.stroke();
      c.strokeStyle = s.wingDark; c.lineWidth = .035; c.beginPath(); for (let i = 0; i < 4; i++) { c.moveTo(.32 - i * .17, -.03); c.lineTo(.2 - i * .15, .11); } c.stroke();
      c.restore();
    }
    c.restore();
  });

  T.look("flyvedrage", "flyvedrage", {
    base: "#8a7a44", belly: "#d4c690", dark: "#4a3a1a", line: "#2a2010", wingA: "#e89a40", wingB: "#c46a28", wingDark: "#4a2810"
  });

  // ===================================================================
  //  FRØER
  // ===================================================================
  function frogEye(c, s, x, y, r, blink) {
    c.fillStyle = rad(c, x, y, 0, r * 1.25, [[0, lt(s.base, .3)], [.7, s.base], [1, dk(s.base, .3)]], x - r * .3, y - r * .4);
    c.beginPath(); c.arc(x, y, r * 1.1, 0, PI2); c.fill(); c.strokeStyle = s.line; c.lineWidth = .035; c.stroke();
    c.fillStyle = s.eyeCol[0]; c.beginPath(); c.arc(x, y, r, 0, PI2); c.fill();
    if (s.eye === "red") {
      c.fillStyle = rad(c, x, y, r * .1, r, [[0, "#ff6a40"], [.6, "#e01818"], [1, "#8a0c10"]], x - r * .2, y - r * .2);
      c.beginPath(); c.arc(x, y, r, 0, PI2); c.fill();
      c.fillStyle = "#08060a"; c.beginPath(); c.ellipse(x + r * .05, y, r * .14, r * .72, 0, 0, PI2); c.fill();
    } else if (s.eye === "gold") {
      c.fillStyle = rad(c, x, y, r * .1, r, [[0, "#f0d070"], [.7, "#b8802a"], [1, "#5a3a12"]], x - r * .2, y - r * .2);
      c.beginPath(); c.arc(x, y, r, 0, PI2); c.fill();
      c.fillStyle = "#08060a"; c.beginPath(); c.ellipse(x + r * .05, y, r * .55, r * .3, 0, 0, PI2); c.fill();
    } else {
      c.fillStyle = rad(c, x, y, r * .1, r, [[0, "#3a4a70"], [.55, "#0a1020"], [1, "#02040a"]], x - r * .3, y - r * .3);
      c.beginPath(); c.arc(x, y, r, 0, PI2); c.fill();
    }
    c.fillStyle = "rgba(255,255,255,.95)"; c.beginPath(); c.arc(x - r * .3, y - r * .38, r * .24, 0, PI2); c.fill();
    c.fillStyle = "rgba(255,255,255,.5)"; c.beginPath(); c.arc(x + r * .35, y + r * .35, r * .1, 0, PI2); c.fill();
    if (blink || s.lid) { // øjenlåg: lukket ved blink, ellers skråt og gnavent (tomatfrø)
      c.save(); c.beginPath(); c.arc(x, y, r * 1.08, 0, PI2); c.clip();
      c.fillStyle = s.base; c.beginPath();
      if (blink) { c.rect(x - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4); }
      else { c.moveTo(x - r * 1.3, y - r * 1.3); c.lineTo(x + r * 1.3, y - r * 1.3); c.lineTo(x + r * 1.3, y + r * .1); c.lineTo(x - r * 1.3, y - r * (.1 + s.lid * .9)); c.closePath(); }
      c.fill(); c.strokeStyle = s.line; c.lineWidth = .035; c.beginPath();
      if (blink) { c.moveTo(x - r, y + r * .1); c.lineTo(x + r, y + r * .1); } else { c.moveTo(x + r * 1.3, y + r * .1); c.lineTo(x - r * 1.3, y - r * (.1 + s.lid * .9)); }
      c.stroke(); c.restore();
    }
  }

  T.addKind("froe", function (c, s, o) {
    const t = o.t || 0, br = sin(t * 1.9), pulse = .5 + .5 * sin(t * 3.1), blink = (t + s.seed) % 4.3 < .13;
    c.save(); c.lineJoin = "round"; c.lineCap = "round";
    c.translate(0, 1); c.scale(s.sx, s.sy); c.translate(0, -1);
    const legc = s.leg || s.base, ts = s.legW || 1;
    // fjern forlem
    limb(c, [[.85, .5], [1.0, .78], [1.1, .97]], [.17 * ts, .12 * ts], dk(legc, .25), s.line);
    // krop
    c.save(); c.translate(0, .9); c.scale(1 + .012 * br, 1 + .03 * br); c.translate(0, -.9);
    const body = () => {
      c.beginPath(); c.moveTo(-.95, .72);
      c.bezierCurveTo(-1.05, .2, -.7, -.28, -.1, -.34); c.bezierCurveTo(.3, -.38, .6, -.34, .85, -.2);
      c.bezierCurveTo(1.12, -.08, 1.3, .12, 1.27, .3); c.bezierCurveTo(1.22, .42, 1.0, .46, .85, .5);
      c.bezierCurveTo(.8, .8, .35, .93, -.2, .93); c.bezierCurveTo(-.55, .93, -.85, .88, -.95, .72); c.closePath();
    };
    body();
    c.fillStyle = lin(c, 0, -.4, 0, .95, [[0, s.top], [.55, s.base], [1, s.bot]]); c.fill();
    c.save(); c.clip();
    c.fillStyle = s.belly; c.beginPath(); c.ellipse(.1, 1.0, 1.1, s.bellyH, 0, 0, PI2); c.fill();
    s.deco(c, s, t);
    c.restore();
    c.strokeStyle = s.line; c.lineWidth = .045; body(); c.stroke();
    // strube, der bevæger sig
    c.strokeStyle = "rgba(0,0,0,.18)"; c.lineWidth = .03; c.beginPath(); c.ellipse(1.0, .5, .2 + .025 * pulse, .09 + .02 * pulse, .3, .1, PI - .1); c.stroke();
    c.fillStyle = "rgba(255,255,255,.3)"; c.beginPath(); c.ellipse(-.1, -.2, .5, .07, -.1, 0, PI2); c.fill();
    // mund
    c.strokeStyle = dk(s.base, .55); c.lineWidth = .035; c.beginPath(); c.moveTo(1.26, .33); c.quadraticCurveTo(.95, s.mouth, .55, .36 + (s.mouth - .38) * .5); c.stroke();
    c.fillStyle = s.line; c.beginPath(); c.arc(1.19, .13, .022, 0, PI2); c.fill();
    c.restore();
    // bagben (foldet) og forben
    limb(c, [[-.6, .42], [.02, .68], [-.55, .94], [.15, .985]], [.42 * ts, .24 * ts, .13 * ts], legc, s.line);
    if (s.foot) limb(c, [[-.55, .94], [.15, .985]], [.13 * ts], s.foot, s.line);
    c.strokeStyle = "rgba(255,255,255,.2)"; c.lineWidth = .07; c.beginPath(); c.moveTo(-.62, .27); c.lineTo(-.05, .5); c.stroke();
    c.fillStyle = s.pad; c.strokeStyle = s.line; c.lineWidth = .02;
    for (const q of [[.32, .94], [.38, .985], [.32, 1.03]]) { c.beginPath(); c.moveTo(.1, .985); c.lineTo(q[0], q[1]); c.lineWidth = .06; c.strokeStyle = legc; c.stroke(); c.beginPath(); c.arc(q[0], q[1], .045, 0, PI2); c.fillStyle = s.pad; c.fill(); }
    limb(c, [[.5, .4], [.66, .74], [.8, .97]], [.22 * ts, .15 * ts], legc, s.line);
    if (s.foot) limb(c, [[.7, .85], [.8, .97]], [.13 * ts], s.foot, s.line);
    c.fillStyle = s.pad; for (const q of [[.9, .93], [.96, .98], [.9, 1.03]]) { c.beginPath(); c.moveTo(.8, .97); c.lineTo(q[0], q[1]); c.lineWidth = .05; c.strokeStyle = legc; c.stroke(); c.beginPath(); c.arc(q[0], q[1], .04, 0, PI2); c.fill(); }
    // øjne
    frogEye(c, s, .6, -.3, s.eyeR, blink);
    c.restore();
  });

  const spotsOf = (col, list) => (c) => { c.fillStyle = col; c.beginPath(); for (const q of list) { c.moveTo(q[0] + q[2], q[1]); c.ellipse(q[0], q[1], q[2], q[3] || q[2] * .8, q[4] || 0, 0, PI2); } c.fill(); };

  T.look("giftfroe", "froe", {
    sx: .9, sy: .9, seed: 1.1, base: "#1f52de", top: "#3f82f6", bot: "#15389a", belly: "#2e64e8", bellyH: .3, line: "#0a1430", leg: "#0e1a44", legW: .85, pad: "#8ab4ff",
    eye: "dark", eyeCol: ["#0a1020"], eyeR: .2, mouth: .4,
    deco: spotsOf("#080c1a", [[-.6, .1, .12, .09], [-.3, -.15, .1, .08], [0, .05, .14, .1], [-.1, .45, .11, .08], [.25, -.22, .09, .07], [.4, .25, .1, .08], [-.68, .5, .09, .07], [.62, .02, .07, .06], [.85, .12, .06, .05], [.18, .62, .08, .06], [-.4, .7, .1, .07], [.5, .6, .08, .06], [1.0, .28, .05, .04], [-.85, .3, .07, .06]])
  });
  T.look("tomatfroe", "froe", {
    sx: 1, sy: 1.08, seed: 2.2, base: "#e4461a", top: "#fa7a3a", bot: "#b02a0c", belly: "#f6d468", bellyH: .22, line: "#4a1406", leg: "#d83c14", legW: 1.05, pad: "#f08a50",
    eye: "gold", eyeCol: ["#5a3a12"], eyeR: .17, mouth: .5, lid: .55,
    deco(c) { c.strokeStyle = "rgba(120,20,0,.45)"; c.lineWidth = .05; c.beginPath(); c.moveTo(.4, -.24); c.bezierCurveTo(0, -.2, -.6, -.05, -.85, .25); c.stroke(); }
  });
  T.look("loevfroe", "froe", {
    sx: .96, sy: 1.0, seed: 3.3, base: "#4cc82c", top: "#78e048", bot: "#2e8a1e", belly: "#f0ecc0", bellyH: .3, line: "#10401a", leg: "#46c02a", legW: 1.0, pad: "#ff9a3a",
    eye: "red", eyeCol: ["#e01818"], eyeR: .27, mouth: .38, foot: "#f47a20",
    deco(c) {
      for (let i = 0; i < 3; i++) {
        const x = .02 + i * .16; c.fillStyle = "#f4d84a"; c.beginPath(); c.moveTo(x, -.05); c.lineTo(x + .1, -.05); c.lineTo(x - .02, .55); c.lineTo(x - .12, .55); c.closePath(); c.fill();
        c.fillStyle = "#2a62e0"; c.beginPath(); c.moveTo(x + .02, -.01); c.lineTo(x + .08, -.01); c.lineTo(x - .04, .5); c.lineTo(x - .1, .5); c.closePath(); c.fill();
      }
    }
  });
})();
