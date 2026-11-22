// Pattedyr til Hej Banan: store katte, dovendyr, flyveræv og kæmpeegern. Alt tegnes med canvas.
(function () {
  "use strict";
  const T = window.BananTegn;
  const { mix, dk, lt, lin, rad, eyeDark } = T;
  const sin = Math.sin, cos = Math.cos, PI = Math.PI, TAU = Math.PI * 2;
  const rnd = (i) => { const x = sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const lerp = (a, b, k) => a + (b - a) * k;

  // ---------- Fælles hjælpere ----------
  // Rude/bånd langs et punktspor med bredde til hver side (L = venstre af retningen, R = højre)
  function geom(P, WL, WR) {
    const n = P.length, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      L.push([P[i][0] - dy * WL[i], P[i][1] + dx * WL[i]]);
      R.push([P[i][0] + dy * WR[i], P[i][1] - dx * WR[i]]);
    }
    return { P, L, R, WL, WR };
  }
  function capCtl(g, i, dir) {
    const P = g.P, j = dir > 0 ? i - 1 : i + 1;
    let dx = P[i][0] - P[j][0], dy = P[i][1] - P[j][1]; const d = Math.hypot(dx, dy) || 1;
    const w = (g.WL[i] + g.WR[i]) * .72;
    return [P[i][0] + dx / d * w, P[i][1] + dy / d * w];
  }
  // Rudens kontur som Path2D (bygges én gang og bruges til fyld, klipning og streg)
  function ribbonPath(g) {
    if (g.p) return g.p;
    const { L, R } = g, n = L.length, p = new Path2D();
    p.moveTo(L[0][0], L[0][1]);
    for (let i = 1; i < n - 1; i++) p.quadraticCurveTo(L[i][0], L[i][1], (L[i][0] + L[i + 1][0]) / 2, (L[i][1] + L[i + 1][1]) / 2);
    p.lineTo(L[n - 1][0], L[n - 1][1]);
    let q = capCtl(g, n - 1, 1); p.quadraticCurveTo(q[0], q[1], R[n - 1][0], R[n - 1][1]);
    for (let i = n - 2; i > 0; i--) p.quadraticCurveTo(R[i][0], R[i][1], (R[i][0] + R[i - 1][0]) / 2, (R[i][1] + R[i - 1][1]) / 2);
    p.lineTo(R[0][0], R[0][1]);
    q = capCtl(g, 0, -1); p.quadraticCurveTo(q[0], q[1], L[0][0], L[0][1]);
    p.closePath();
    return (g.p = p);
  }
  // Punkt på en rude: f = indeks langs sporet, v = -1 (højre kant) .. 0 (midte) .. 1 (venstre kant)
  function gpt(g, f, v) {
    const n = g.P.length, i = Math.max(0, Math.min(n - 2, Math.floor(f))), u = Math.max(0, Math.min(1, f - i));
    const E = v > 0 ? g.L : g.R, a = Math.abs(v);
    const px = lerp(g.P[i][0], g.P[i + 1][0], u), py = lerp(g.P[i][1], g.P[i + 1][1], u);
    return [px + (lerp(E[i][0], E[i + 1][0], u) - px) * a, py + (lerp(E[i][1], E[i + 1][1], u) - py) * a];
  }
  // To-leds ben/arm: retter knæet/albuen. bend = +1 eller -1 vælger retning
  function ik(ax, ay, bx, by, l1, l2, bend) {
    let dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || .001;
    const dd = Math.min(Math.max(d, Math.abs(l1 - l2) + .02), l1 + l2 - .005);
    const a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    dx /= d; dy /= d;
    return [ax + dx * a - dy * h * bend, ay + dy * a + dx * h * bend];
  }
  function ell(c, x, y, rx, ry, rot, a0, a1) {
    const cr = cos(rot), sr = sin(rot), ca = rx * cos(a0), sa = ry * sin(a0);
    c.moveTo(x + ca * cr - sa * sr, y + ca * sr + sa * cr);
    c.ellipse(x, y, rx, ry, rot, a0, a1);
  }
  // Rund, rolig klump med let skygge
  function blob(c, x, y, rx, ry, rot, col, edge) {
    c.save();
    if (typeof col === "string") {
      c.translate(x, y); c.rotate(rot);
      c.fillStyle = rad(c, 0, 0, 0, Math.max(rx, ry), [[0, lt(col, .06)], [.7, col], [1, dk(col, .14)]], -rx * .25, -ry * .3);
      c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, TAU); c.fill();
      c.translate(-x, -y); c.rotate(-rot);
    } else { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); c.fill(); }
    if (edge) { c.translate(x, y); c.rotate(rot); c.strokeStyle = edge; c.globalAlpha = .55; c.lineWidth = .02; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, .2, 1.9); c.stroke(); }
    c.restore();
  }
  const blinkOf = (t, seed) => { const p = (t + seed) % 4.6; return p < .16 ? sin(p / .16 * PI) : 0; };

  // ---------- Katte ----------
  // Stillingen: rygsøjle (hofte -> skulder), ben, hale og hoved for "move", "attack" og "sit"
  function catPose(s, o) {
    const t = o.t || 0, th = s.th, hr = s.head;
    const mode = o.mode === "attack" ? "attack" : o.mode === "sit" ? "sit" : "move";
    const ang = mode === "attack" || (!!o.angry && mode === "move");
    const P = { mode, ang, legs: [], tilt: 0, k: 1, dx: 0 };
    const lw = s.legw;
    let hip, sh, arch, hd;
    const tail = { len: s.tail.len, base: null, curl: s.tail.curl, wave: .2 };
    const ph = t / s.gait;

    const leg = (front, far, joint, foot) => {
      const w = lw * (front ? 1 : 1.08);
      let pts;
      if (front) {
        const L = Math.hypot(foot[0] - joint[0], foot[1] - joint[1]) * .62;
        const k = ik(joint[0], joint[1], foot[0], foot[1] - .06, L, L, 1);
        pts = [joint, k, [foot[0], foot[1] - .06], foot];
      } else {
        const stretched = mode === "attack";
        let hock;
        if (stretched) {
          const dx = joint[0] - foot[0], dy = joint[1] - foot[1], d = Math.hypot(dx, dy);
          hock = [foot[0] + dx / d * .3, foot[1] + dy / d * .3];
        } else hock = [foot[0] - .11, foot[1] - .27 * (th > 1 ? .8 : 1)];
        const L = Math.hypot(hock[0] - joint[0], hock[1] - joint[1]) * .64;
        const k = ik(joint[0], joint[1], hock[0], hock[1], L, L, -1);
        pts = [joint, k, hock, foot];
      }
      const ws = front ? [w * 1.25, w * .92, w * .78, w * .8] : [w * 1.5, w * 1.0, w * .72, w * .8];
      return { pts, ws, far, front };
    };

    if (mode === "move") {
      const yb = 1 - s.clear, bob = sin(ph * TAU * 2) * .012;
      hip = [-s.len * .55, yb - .3 * th - .02 + bob];
      sh = [s.len * .45, yb - .34 * th - .02 - bob];
      arch = -.05;
      const hj = [hip[0] + .1, hip[1] + .09 * th], fj = [sh[0] - .06, sh[1] + .1 * th];
      const foot = (jx, off) => {
        const p = ((ph + off) % 1 + 1) % 1, st = s.stride;
        if (p < .55) return [jx + st * (1 - 2 * p / .55), .94];
        const q = (p - .55) / .45;
        return [jx - st + 2 * st * q * q * (3 - 2 * q), .94 - .14 * sin(q * PI)];
      };
      P.legs.push(leg(false, true, hj, foot(hj[0], .5)), leg(true, true, fj, foot(fj[0] + .1, .75)),
        leg(false, false, hj, foot(hj[0], 0)), leg(true, false, fj, foot(fj[0], .25)));
      hd = { x: sh[0] + .18 + .62 * hr, y: sh[1] - .08 + sin(ph * TAU * 2 + 1) * .012, rot: .08, gape: ang ? .24 + .03 * sin(t * 3) : 0 };
      tail.base = [hip[0] - .1, hip[1] - .03]; tail.theta = PI - .2; tail.curl = s.tail.curl; tail.wave = .16; tail.pw = 2.4; tail.pf = 2;
    } else if (mode === "sit") {
      hip = [-.5, .5]; sh = [.3, -.08]; arch = -.12;
      const fj = [sh[0] + .02, sh[1] + .3];
      const ff = [sh[0] + .15, .94];
      P.legs.push(leg(true, true, fj, [ff[0] + .22, .94]), leg(true, false, fj, ff));
      const hp = [[hip[0] + .1, .95], [hip[0] + .38, .95], [hip[0] + .72, .95]];
      P.legs.push({ pts: hp, ws: [lw * 1.0, lw * .86, lw * .78], far: false, front: false, paw: [hp[2][0] + .02, .93, .17, .09, 0], sitFoot: true });
      hd = { x: sh[0] + .16 + .1 * hr, y: sh[1] - .16 - hr * .5 + sin(t * .9) * .01, rot: -.04 + sin(t * .7) * .025, gape: 0 };
      P.tk = 1.18;
      tail.base = [hip[0] - .22, .8]; tail.theta = PI + .1; tail.curl = s.tail.curl * .9; tail.wave = .1; tail.pw = .9; tail.pf = 2.5; tail.len *= .8;
    } else {
      hip = [-.76, .12]; sh = [.5, -.08]; arch = .0;
      P.tilt = -.1 + sin(t * 4) * .02; P.k = .88; P.dx = .15;
      const hj = [hip[0] + .1, hip[1] + .1], fj = [sh[0] - .04, sh[1] + .1];
      P.legs.push(leg(false, true, hj, [-1.28, .68]), leg(true, true, fj, [1.3, .56]),
        leg(false, false, hj, [-1.46, .5]), leg(true, false, fj, [1.5, .26]));
      hd = { x: sh[0] + .3 + .5 * hr, y: sh[1] - .28, rot: -.16, gape: .82 + .05 * sin(t * 6) };
      tail.base = [hip[0] - .1, hip[1] - .02]; tail.theta = PI + .05; tail.curl = .3; tail.wave = .09; tail.pw = 3; tail.pf = 1.5; tail.len *= .85;
    }
    // poter
    for (const lg of P.legs) {
      if (lg.paw) continue;
      const f = lg.pts[lg.pts.length - 1];
      lg.paw = mode === "attack" ? (lg.front ? [f[0] + .04, f[1] + .02, .16 * s.paw, .1 * s.paw, .35] : [f[0] - .02, f[1] + .02, .17 * s.paw, .09 * s.paw, .5])
        : [f[0] + .05, f[1] - .02, .17 * s.paw, .09 * s.paw, 0];
    }
    // rygsøjle: bezier fra hofte til skulder og videre op til hovedet
    const mx = (hip[0] + sh[0]) / 2, my = (hip[1] + sh[1]) / 2;
    let dx = sh[0] - hip[0], dy = sh[1] - hip[1]; const dl = Math.hypot(dx, dy); dx /= dl; dy /= dl;
    const C = [mx - dy * arch, my + dx * arch], sp = [];
    for (let i = 0; i < 7; i++) { const u = i / 6, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), d = u * u; sp.push([a * hip[0] + b * C[0] + d * sh[0], a * hip[1] + b * C[1] + d * sh[1]]); }
    const nk = (.2 + .3 * hr) * (mode === "sit" ? 1.2 : 1), tk = P.tk || 1;
    sp.push([lerp(sh[0], hd.x, .5), lerp(sh[1], hd.y, .5) + (mode === "attack" ? 0 : .03)], [hd.x - .05, hd.y]);
    const top = [.3, .34, .33, .33, .35, .35, .3, nk, nk * .96].map((v, i) => v * (i < 7 ? th * tk : 1));
    const bot = [.27, .24, .18, .22, .32, .4, .3, nk, nk * .96].map((v, i) => v * (i < 7 ? th * tk : 1));
    P.body = geom(sp, bot, top); // L = bugen (ned), R = ryggen (op)
    P.hip = hip; P.sh = sh; P.hd = hd; P.tail = tail;
    return P;
  }

  function drawTail(c, s, P, t) {
    const tl = P.tail, N = 9, pts = [], base = tl.base, step = tl.len / (N - 1), tc = s.tail;
    let x = base[0], y = base[1];
    for (let i = 0; i < N; i++) {
      pts.push([x, y]);
      const f = i / (N - 1), th = tl.theta + tl.curl * Math.pow(f, 1.5) + tl.wave * sin(t * 1.7 - f * tl.pw) * Math.pow(f, tl.pf > 2 ? 1 : .7) * 1.2;
      x += cos(th) * step; y += sin(th) * step;
    }
    const wl = pts.map((_, i) => lerp(tc.w0, tc.w1, i / (N - 1)) / 2 * (i === N - 1 ? .75 : 1));
    const g = geom(pts, wl, wl);
    const col = tc.color || s.body, rp = ribbonPath(g);
    c.fillStyle = col; c.fill(rp);
    c.save(); c.clip(rp);
    if (tc.under) { // lysere underside
      c.fillStyle = tc.under; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < N; i++) c.lineTo(pts[i][0], pts[i][1]);
      for (let i = N - 1; i >= 0; i--) c.lineTo(g.R[i][0] , g.R[i][1]);
      c.fill();
    }
    c.fillStyle = s.dark;
    c.beginPath();
    const band = (k) => { c.moveTo(g.L[k][0], g.L[k][1]); c.lineTo(g.L[k + 1][0], g.L[k + 1][1]); c.lineTo(g.R[k + 1][0], g.R[k + 1][1]); c.lineTo(g.R[k][0], g.R[k][1]); c.closePath(); };
    for (const k of tc.rings || []) band(k);
    if (tc.tip) for (let k = N - 1 - tc.tip; k < N - 1; k++) band(k);
    c.fill();
    if (tc.spots) { // prikker på halen
      c.beginPath();
      for (let i = 1; i < N - 2; i += 2) { const p = gpt(g, i, -.4 + (i % 4) * .3); c.moveTo(p[0] + .035, p[1]); c.arc(p[0], p[1], .035, 0, TAU); }
      c.fill();
    }
    c.restore();
    c.strokeStyle = dk(col, .6); c.lineWidth = .028; c.stroke(rp);
  }

  function drawLeg(c, s, lg, ang) {
    const col = lg.far ? (s.farLeg || dk(s.body, .16)) : s.body, E = dk(s.body, .62);
    const g = geom(lg.pts, lg.ws.map((w) => w / 2), lg.ws.map((w) => w / 2)), rp = ribbonPath(g);
    c.lineJoin = "round"; c.lineCap = "round";
    c.fillStyle = col; c.fill(rp); c.strokeStyle = E; c.lineWidth = .028; c.stroke(rp);
    const p = lg.paw;
    c.save(); c.translate(p[0], p[1]); c.rotate(p[4]);
    c.fillStyle = lg.far ? dk(s.pawC || col, .2) : (s.pawC || col);
    c.beginPath(); c.ellipse(0, 0, p[2], p[3], 0, 0, TAU); c.fill(); c.stroke();
    c.restore();
    if (ang && lg.front) { // kløer på forpoterne
      c.fillStyle = "#f4eed8"; c.strokeStyle = "#5a4a3a"; c.lineWidth = .014; c.beginPath();
      for (let k = 0; k < 3; k++) {
        const a = p[4] - .35 + k * .28, bx = p[0] + cos(a) * p[2] * .9 + .02, by = p[1] + sin(a) * p[3] * 1.3 - .03 + k * .02;
        c.moveTo(bx, by - .035); c.quadraticCurveTo(bx + .14, by - .02, bx + .15, by + .12); c.quadraticCurveTo(bx + .07, by + .03, bx, by + .035); c.closePath();
      }
      c.fill(); c.stroke();
    }
  }

  // Mønstre: tabel over pletter i (indeks langs kroppen, tværs) - laves én gang pr. udseende
  function spotTable(s) {
    if (s._sp) return s._sp;
    const a = [], k = s.pat;
    if (k === "ros" || k === "rosDot" || k === "rosFine") {
      s.rows.forEach((row, ri) => {
        for (let j = 0; j < row[1]; j++) {
          const id = ri * 31 + j * 7 + s.seed;
          const f = .35 + (j + (ri % 2) * .5) * (7.1 / row[1]) + (rnd(id) - .5) * .35;
          a.push({ f, v: row[0] + (rnd(id + 1) - .5) * .16, r: row[2] * (.85 + rnd(id + 2) * .35), q: .75 + rnd(id + 3) * .35, rot: rnd(id + 4) * PI, a0: rnd(id + 5) * TAU, gap: .7 + rnd(id + 6) * .8 });
        }
      });
    } else if (k === "tiger") {
      for (let i = 0; i < 20; i++) a.push({ f: .2 + i * (7.2 / 20) + (rnd(i + s.seed) - .5) * .2, v: .2 + rnd(i * 3 + 1) * .6, w: .03 + rnd(i + 9) * .02, lean: .25 + rnd(i + 3) * .2, long: i % 2 === 0 });
    } else if (k === "cloud") {
      [[-.55, 3], [-.02, 3], [.48, 3]].forEach((row, ri) => {
        for (let j = 0; j < row[1]; j++) { const id = ri * 17 + j * 5 + s.seed; a.push({ f: .9 + (j + (ri % 2) * .5) * (6.3 / row[1]), v: row[0] + (rnd(id) - .5) * .1, rx: .22 + rnd(id + 1) * .05, ry: .12 + rnd(id + 2) * .03, rot: -.3 + rnd(id + 3) * .6 }); }
      });
    }
    s._sp = a; return a;
  }

  function drawPattern(c, s, G) {
    const sp = spotTable(s), k = s.pat, D = s.dark;
    if (k === "ros" || k === "rosDot" || k === "rosFine") {
      c.lineCap = "round"; c.strokeStyle = D; c.lineWidth = s.ringW; c.beginPath();
      for (const o of sp) { const p = gpt(G, o.f, o.v); ell(c, p[0], p[1], o.r, o.r * o.q, o.rot, o.a0, o.a0 + TAU - o.gap); }
      c.stroke();
      c.fillStyle = D; c.beginPath();
      if (k === "rosDot") for (const o of sp) { const p = gpt(G, o.f, o.v); c.moveTo(p[0] + .03, p[1]); c.arc(p[0] + (o.q - .9) * .04, p[1], .018 + o.r * .12, 0, TAU); }
      else if (k === "rosFine") for (let i = 0; i < 9; i++) { const p = gpt(G, .4 + i * .75 + rnd(i) * .3, -.9 + (i % 5) * .38 + rnd(i + 5) * .1); c.moveTo(p[0] + .025, p[1]); c.arc(p[0], p[1], .02 + rnd(i + 2) * .012, 0, TAU); }
      else for (let i = 0; i < 5; i++) { const p = gpt(G, .6 + i * 1.5, -.97); c.moveTo(p[0] + .03, p[1]); c.arc(p[0], p[1], .03, 0, TAU); }
      c.fill();
    } else if (k === "tiger") {
      c.fillStyle = D; c.beginPath();
      for (const o of sp) {
        const a = gpt(G, o.f, -1.12), b = gpt(G, o.f - o.lean, o.long ? o.v : o.v * .45), m = gpt(G, o.f - o.lean * .3, o.v * .5 - .15);
        const tx = b[0] - a[0], ty = b[1] - a[1], d = Math.hypot(tx, ty) || 1, nx = -ty / d * o.w, ny = tx / d * o.w;
        c.moveTo(a[0] - nx * 1.2, a[1] - ny * 1.2); c.quadraticCurveTo(m[0] - nx * .8, m[1] - ny * .8, b[0], b[1]); c.quadraticCurveTo(m[0] + nx * .8, m[1] + ny * .8, a[0] + nx * 1.2, a[1] + ny * 1.2); c.closePath();
      }
      c.fill();
    } else if (k === "cloud") {
      c.beginPath();
      for (const o of sp) { const p = gpt(G, o.f, o.v); ell(c, p[0], p[1], o.rx, o.ry, o.rot, 0, TAU); }
      c.fillStyle = D; c.fill();
      c.beginPath();
      for (const o of sp) { const p = gpt(G, o.f, o.v); ell(c, p[0], p[1], o.rx - .045, o.ry - .04, o.rot, 0, TAU); }
      c.fillStyle = mix(s.body, s.dark, s.cloudIn || .22); c.fill();
      c.beginPath(); // lysere midte
      for (const o of sp) { const p = gpt(G, o.f, o.v); ell(c, p[0] - .01, p[1], o.rx * .55, o.ry * .45, o.rot, 0, TAU); }
      c.fillStyle = mix(s.body, s.dark, .1); c.fill();
      c.lineCap = "round"; c.strokeStyle = D; c.lineWidth = .05; c.beginPath(); // sorte striber langs nakken
      for (let i = 0; i < 2; i++) { const a = gpt(G, 5.9, -.8 + i * .5), b = gpt(G, 7.7, -.75 + i * .45); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
      c.stroke();
      c.fillStyle = D; c.beginPath();
      for (let i = 0; i < 10; i++) { const p = gpt(G, .5 + i * .72, -.95 + (i % 2) * .25); c.moveTo(p[0] + .03, p[1]); c.arc(p[0], p[1], .028, 0, TAU); }
      c.fill();
    }
  }

  // Dekoration på benene
  function legMarks(c, s, lg) {
    if (lg.far || lg.sitFoot) return;
    const k = s.pat;
    if (k === "plain" || k === "puma") return;
    const p = lg.pts;
    c.fillStyle = s.dark; c.strokeStyle = s.dark; c.lineCap = "round";
    if (k === "tiger") {
      c.lineWidth = .04; c.beginPath();
      for (const f of [.3, .62]) { const x = lerp(p[1][0], p[2][0], f), y = lerp(p[1][1], p[2][1], f), w = lg.ws[1] * .38; c.moveTo(x - w, y - .03); c.lineTo(x + w * .8, y + .02); }
      for (const f of [.45]) { const x = lerp(p[0][0], p[1][0], f), y = lerp(p[0][1], p[1][1], f), w = lg.ws[0] * .38; c.moveTo(x - w, y - .03); c.lineTo(x + w * .8, y + .03); }
      c.stroke();
    } else {
      c.beginPath();
      for (const [a, b, f, r] of [[0, 1, .5, .028], [1, 2, .4, .024], [1, 2, .75, .022]]) { const x = lerp(p[a][0], p[b][0], f), y = lerp(p[a][1], p[b][1], f); c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); }
      c.fill();
    }
  }

  // Hovedet tegnes i enheder af hovedets størrelse (R). Hvile- og gabestilling ud fra h.gape
  function drawHead(c, s, h, P, t) {
    const R = s.head, sn = s.sn, g = h.gape, ang = P.ang, calm = P.mode === "sit";
    const X = (x) => x > .4 ? .4 + (x - .4) * sn : x, rf = s.ruff || 0;
    const E = dk(s.body, .62), chin = s.chin || s.belly;
    c.save(); c.translate(h.x, h.y); c.rotate(h.rot); c.scale(R, R);
    c.lineJoin = "round"; c.lineCap = "round"; c.lineWidth = .05; c.strokeStyle = E;
    const pinned = ang ? 1 : 0;

    // ører (bag hovedet)
    const ear = (x, y, far) => {
      const es = s.earS * (pinned ? .85 : 1), rot = pinned ? -.75 : -.2;
      c.save(); c.translate(x, y); c.rotate(rot); if (pinned) c.scale(1, .72);
      c.fillStyle = far ? dk(s.earC, .25) : s.earC;
      c.beginPath();
      if (s.earS > 1.2) c.arc(0, 0, .33 * es, 0, TAU); // fossaens store runde ører
      else { c.moveTo(-.34 * es, .25); c.quadraticCurveTo(-.36 * es, -.36 * es, -.04 * es, -.44 * es); c.quadraticCurveTo(.34 * es, -.3 * es, .34 * es, .25); c.closePath(); }
      c.fill(); c.stroke();
      c.fillStyle = far ? "#8d6a64" : (s.earIn || "#c99890"); c.beginPath(); c.ellipse(.0, .0, .17 * es, .2 * es, 0, 0, TAU); c.fill();
      c.restore();
    };
    ear(pinned ? -.18 : .0, pinned ? -.66 : -.8, true);
    ear(pinned ? -.55 : -.42, pinned ? -.55 : -.68, false);

    const up = new Path2D();
    up.moveTo(-.84, .2);
    up.bezierCurveTo(-.9, -.42, -.5, -.8, .1, -.8);
    up.bezierCurveTo(.5, -.8, X(.85), -.5, X(1.0), -.3);
    up.bezierCurveTo(X(1.15), -.25, X(1.32), -.14, X(1.38), 0);
    up.bezierCurveTo(X(1.42), .1, X(1.38), .22, X(1.26), .29);
    up.lineTo(X(1.2), .3);
    up.quadraticCurveTo(X(.9), .42, X(.5), .4); up.lineTo(.34, .42);
    up.bezierCurveTo(.3, .75 + rf * .5, -.2, 1 + rf, -.62, .85 + rf * .7);
    up.bezierCurveTo(-.85, .7, -.9, .4, -.8, .2); up.closePath();
    const H = [.34, .42], F = [X(1.2), .31];
    // mundens indre og underkæben
    if (g > .03) {
      const cg = cos(g), sg = sin(g), rot = (p) => [H[0] + (p[0] - H[0]) * cg - (p[1] - H[1]) * sg, H[1] + (p[0] - H[0]) * sg + (p[1] - H[1]) * cg];
      const Fr = rot(F);
      c.fillStyle = "#6a1824"; c.beginPath(); c.moveTo(.1, .3); c.lineTo(F[0] + .02, F[1] - .02); c.lineTo(Fr[0], Fr[1]); c.lineTo(.12, .62); c.closePath(); c.fill();
    }
    c.save(); c.translate(H[0], H[1]); c.rotate(g); c.translate(-H[0], -H[1]);
    c.fillStyle = chin;
    c.beginPath(); c.moveTo(.2, .39); c.lineTo(F[0], F[1] + .01); c.bezierCurveTo(X(1.3), .38, X(1.25), .56, X(1.05), .63);
    c.quadraticCurveTo(X(.7), .75, .3, .7); c.lineTo(.1, .55); c.closePath(); c.fill(); c.stroke();
    if (g > .3) { // tunge og underste hjørnetand
      c.fillStyle = "#d9707c"; c.beginPath(); c.ellipse(X(.75), .39, .34 * sn, .075, .04, 0, TAU); c.fill();
    }
    if (ang || g > .1 || s.fang > 1.4) {
      const fl = (g > .3 ? .24 : ang ? .15 : .1) * s.fang;
      c.fillStyle = "#fbf6e6"; c.lineWidth = .025; c.beginPath(); c.moveTo(X(.98) - .06, .36); c.lineTo(X(.98) + .02, .36 - fl * .9); c.lineTo(X(.98) + .06, .36); c.closePath(); c.fill(); c.stroke();
    }
    c.restore();

    // hovedets krop
    c.fillStyle = rad(c, 0, 0, 0, 1.6, [[0, lt(s.body, .22)], [.6, s.body], [1, dk(s.body, .24)]], -.3, -.45);
    c.fill(up);
    c.save(); c.clip(up);
    c.lineWidth = .05;
    headMarks(c, s, X, ang, t);
    c.restore();
    c.lineWidth = .05; c.strokeStyle = E; c.stroke(up);

    // snuden: næse, snurrehår, tænder
    c.fillStyle = s.nose || "#3a2028"; c.beginPath(); c.moveTo(X(1.26), -.09); c.quadraticCurveTo(X(1.42), -.06, X(1.38), .06); c.quadraticCurveTo(X(1.34), .16, X(1.2), .08); c.quadraticCurveTo(X(1.16), -.04, X(1.26), -.09); c.fill();
    if (ang || g > .1 || s.fang > 1.4) {
      const fl = (g > .3 ? .3 : ang ? .2 : .13) * s.fang;
      c.fillStyle = "#fbf6e6"; c.lineWidth = .025; c.strokeStyle = "#5a4a3a"; c.beginPath();
      c.moveTo(X(1.0) - .08, .38); c.lineTo(X(1.0) + .01, .38 + fl); c.lineTo(X(1.0) + .08, .36); c.closePath();
      if (g > .3) { for (let i = 0; i < 3; i++) { const x = X(1.12) + i * .05 * sn; c.moveTo(x, .31); c.lineTo(x + .02, .31 + .07); c.lineTo(x + .04, .31); } }
      c.fill(); c.stroke();
    }
    if (ang) { // løftet overlæbe: rynker på snuden
      c.strokeStyle = dk(s.body, .5); c.lineWidth = .03; c.beginPath();
      for (let i = 0; i < 2; i++) { c.moveTo(X(.9) - i * .1, -.2 + i * .04); c.quadraticCurveTo(X(.98) - i * .1, -.1 + i * .04, X(.92) - i * .09, .0 + i * .04); }
      c.stroke();
    }
    c.strokeStyle = "rgba(255,250,235,.8)"; c.lineWidth = .014; c.beginPath();
    for (let i = 0; i < 2; i++) { c.moveTo(X(.95), .18 + i * .06); c.quadraticCurveTo(X(1.3), .1 + i * .2, X(1.7), .02 + i * .4 - (g > .3 ? .05 : 0)); }
    c.stroke();

    // øje
    const ex = .5, ey = -.2, er = s.eye, bl = calm ? blinkOf(t, 1) : 0;
    c.fillStyle = "#1a100a"; c.beginPath(); c.ellipse(ex, ey, er * 1.22, er * 1.1 * (1 - bl * .9) + .01, 0, 0, TAU); c.fill();
    if (bl < .6) {
      c.fillStyle = rad(c, ex + .02, ey, er * .15, er, [[0, lt(s.iris, .4)], [.6, s.iris], [1, dk(s.iris, .3)]], ex - er * .1, ey - er * .2);
      c.beginPath(); c.arc(ex, ey, er * .97, 0, TAU); c.fill();
      c.fillStyle = "#0a0604"; c.beginPath(); c.arc(ex + er * .1, ey, er * (ang ? .38 : .46), 0, TAU); c.fill();
      c.fillStyle = "rgba(255,255,255,.95)"; c.beginPath(); c.arc(ex - er * .28, ey - er * .33, er * .24, 0, TAU); c.fill();
      c.fillStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.arc(ex + er * .35, ey + er * .35, er * .1, 0, TAU); c.fill();
    }
    if (ang) { // sammenknebne, vrede øjne: et skråt låg
      const A = [ex - er * 1.6, ey - er * 1.0], B = [ex + er * 1.6, ey + er * .1];
      c.fillStyle = mix(s.body, "#000000", .1); c.beginPath(); c.moveTo(A[0], A[1] - er * .5); c.lineTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.lineTo(B[0], B[1] - er * 1.3); c.closePath(); c.fill();
      c.strokeStyle = "#1a100a"; c.lineWidth = .06; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke();
    }
    c.restore();
  }

  // Aftegninger på hovedet (inde i hovedets klipning)
  function headMarks(c, s, X, ang, t) {
    const k = s.face, D = s.dark;
    if (s.muzzle) { c.fillStyle = s.muzzle; c.beginPath(); c.ellipse(X(1.0), .2, .5 * s.sn, .3, 0, 0, TAU); c.fill(); }
    if (k === "tiger") {
      c.fillStyle = "#fbf4e4"; c.beginPath(); c.ellipse(.0, .6, .7, .34, .1, 0, TAU); c.fill();
      c.beginPath(); c.ellipse(X(.52), -.22, .3, .2, -.1, 0, TAU); c.fill(); // hvid øjenomkreds og bryn
      c.beginPath(); c.ellipse(X(.7), -.5, .3, .1, .35, 0, TAU); c.fill();
      c.strokeStyle = D; c.lineCap = "round"; c.lineWidth = .1; c.beginPath();
      c.moveTo(-.85, .15); c.quadraticCurveTo(-.55, .22, -.32, .3); c.moveTo(-.85, .42); c.quadraticCurveTo(-.55, .42, -.3, .5); c.moveTo(-.6, .75); c.quadraticCurveTo(-.4, .68, -.2, .7);
      c.stroke(); c.lineWidth = .07; c.beginPath();
      c.moveTo(-.15, -.95); c.quadraticCurveTo(-.05, -.78, -.12, -.58); c.moveTo(.2, -.92); c.quadraticCurveTo(.25, -.75, .18, -.58); c.moveTo(.5, -.85); c.quadraticCurveTo(.52, -.7, .46, -.55);
      c.moveTo(-.5, -.8); c.quadraticCurveTo(-.45, -.62, -.52, -.45);
      c.moveTo(.3, -.05); c.quadraticCurveTo(.2, .1, .24, .28);
      c.stroke();
    } else if (k === "spots") {
      c.fillStyle = D; c.beginPath();
      const pts = [[-.3, -.7], [.28, -.7], [-.5, -.42], [.0, -.45], [-.5, .1], [-.25, .3], [-.1, .55], [X(.9), .12], [X(.78), .2], [X(.7), -.4]];
      pts.forEach((p, i) => { const r = .045 + rnd(i + s.seed) * .02; c.moveTo(p[0] + r, p[1]); c.arc(p[0], p[1], r, 0, TAU); });
      c.fill();
      if (s.tear) { c.strokeStyle = D; c.lineWidth = .07; c.lineCap = "round"; c.beginPath(); c.moveTo(.45, -.02); c.quadraticCurveTo(.4, .2, .5, .38); c.stroke(); }
    } else if (k === "cloud") {
      c.fillStyle = D; c.beginPath();
      [[-.3, -.7], [-.55, -.4], [.12, -.42], [-.5, .1], [-.2, .25], [X(.9), .14], [X(.72), -.4]].forEach((p, i) => { const r = .05 + rnd(i + 3) * .03; c.moveTo(p[0] + r, p[1]); c.arc(p[0], p[1], r, 0, TAU); });
      c.fill();
      c.strokeStyle = D; c.lineWidth = .09; c.lineCap = "round"; c.beginPath();
      c.moveTo(.45, -.02); c.quadraticCurveTo(.35, .25, .5, .4); c.moveTo(-.1, -.2); c.quadraticCurveTo(-.4, -.15, -.7, .05);
      c.stroke();
    } else if (k === "puma") {
      c.fillStyle = D; c.beginPath(); c.ellipse(X(1.3), -.04, .17, .17, 0, 0, TAU); c.fill();
      c.beginPath(); ell(c, X(1.0), .17, .26, .1, .2, 0, TAU); c.fill();
      c.beginPath(); ell(c, X(.68), -.38, .35, .07, .15, 0, TAU); c.fill();
      c.strokeStyle = D; c.lineWidth = .07; c.lineCap = "round"; c.beginPath(); c.moveTo(.45, -.02); c.quadraticCurveTo(.4, .2, .5, .38); c.stroke();
    }
  }

  // Pletter på låret, når katten sidder
  function blobPat(c, s, x, y, rx, ry) {
    const k = s.pat;
    if (k === "plain") return;
    c.save(); c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.clip();
    c.strokeStyle = s.dark; c.fillStyle = s.dark; c.lineCap = "round";
    const sp = [[-.45, -.35], [.2, -.5], [.55, .05], [-.2, .15], [-.5, .5], [.25, .55]];
    if (k === "tiger") {
      c.lineWidth = .06; c.beginPath();
      for (const p of sp) { c.moveTo(x + p[0] * rx - .06, y + p[1] * ry - .12); c.lineTo(x + p[0] * rx + .06, y + p[1] * ry + .1); }
      c.stroke();
    } else if (k === "cloud") {
      c.beginPath(); ell(c, x - rx * .25, y - ry * .3, rx * .42, ry * .3, -.3, 0, TAU); ell(c, x + rx * .2, y + ry * .35, rx * .38, ry * .28, .2, 0, TAU); c.fill();
      c.fillStyle = mix(s.body, s.dark, s.cloudIn || .22); c.beginPath(); ell(c, x - rx * .25, y - ry * .3, rx * .34, ry * .21, -.3, 0, TAU); ell(c, x + rx * .2, y + ry * .35, rx * .3, ry * .19, .2, 0, TAU); c.fill();
    } else {
      c.lineWidth = s.ringW; c.beginPath();
      sp.slice(0, 5).forEach((p, i) => ell(c, x + p[0] * rx, y + p[1] * ry, .075, .07, i, i, i + TAU - .7));
      c.stroke();
      if (k === "rosDot") { c.beginPath(); sp.slice(0, 5).forEach((p) => { c.moveTo(x + p[0] * rx + .02, y + p[1] * ry); c.arc(x + p[0] * rx, y + p[1] * ry, .02, 0, TAU); }); c.fill(); }
    }
    c.restore();
  }

  T.addKind("kat", function (c, s, o) {
    const t = o.t || 0, P = catPose(s, o);
    c.save();
    c.translate((s.ox || 0) + P.dx, s.oy || 0); c.scale(s.sc * P.k, s.sc * P.k);
    if (P.tilt) c.rotate(P.tilt);
    c.lineJoin = "round"; c.lineCap = "round";
    for (const lg of P.legs) if (lg.far) drawLeg(c, s, lg, P.mode === "attack");
    drawTail(c, s, P, t);
    // krop og hals
    const G = P.body, E = dk(s.body, .62);
    let y0 = 9, y1 = -9;
    for (const p of G.L) y1 = Math.max(y1, p[1]);
    for (const p of G.R) y0 = Math.min(y0, p[1]);
    const bg = lin(c, 0, y0, 0, y1, [[0, lt(s.body, .12)], [.5, s.body], [.68, s.body], [.9, mix(s.body, s.belly, .85)], [1, s.belly]]);
    const bg2 = lin(c, 0, y0, 0, y1, [[0, lt(s.body, .1)], [.55, s.body], [1, mix(s.body, s.belly, .3)]]);
    c.fillStyle = bg;
    const rg = ribbonPath(G);
    c.fill(rg);
    c.strokeStyle = E; c.lineWidth = .028; c.stroke(rg);
    for (const lg of P.legs) if (!lg.far) drawLeg(c, s, lg, P.mode === "attack");
    // lår og skulder
    const hl = P.legs.find((l) => !l.far && !l.front), fl = P.legs.find((l) => !l.far && l.front);
    if (P.mode === "sit") blob(c, P.hip[0] + .04, P.hip[1] + .2, .46, .34 * s.th + .06, -.45, bg2, E);
    else if (hl) blob(c, hl.pts[0][0] + .0, hl.pts[0][1] + .08, .26 * s.th + .03, .34 * s.th + .02, .35, bg2, E);
    if (fl) blob(c, fl.pts[0][0] + .02, fl.pts[0][1] + .0, .2 * s.th + .04, .3 * s.th + .02, -.1, bg2, E);
    c.save(); c.clip(rg);
    drawPattern(c, s, G);
    c.restore();
    if (P.mode === "sit") blobPat(c, s, P.hip[0] + .04, P.hip[1] + .2, .46, .34 * s.th + .06);
    for (const lg of P.legs) legMarks(c, s, lg);
    drawHead(c, s, P.hd, P, t);
    c.restore();
  });

  const cat = (id, p) => T.look(id, "kat", Object.assign({ earS: 1, earC: "#2a1c14", fang: 1, eye: .15, gait: .95, stride: .27, paw: 1, sc: .9, ox: -.05, oy: 0, seed: 1, pat: "plain", face: "plain", ringW: .034, iris: "#d8a41e", sn: 1 }, p));
  cat("jaguar", { body: "#dba434", belly: "#f6eedb", dark: "#1c120c", pat: "rosDot", face: "spots", th: 1.15, len: 1.2, clear: .36, legw: .3, head: .56, sn: .8, earS: .82, ringW: .04,
    rows: [[-.62, 6, .08], [-.02, 6, .085], [.5, 5, .065]], tail: { len: 1.05, w0: .22, w1: .17, curl: 2.0, tip: 1, rings: [5, 7], color: "#dba434", spots: true }, muzzle: "#f6eedb", fang: 1.1, stride: .24, paw: 1.2, seed: 3, eye: .14 });
  cat("leopard", { body: "#e6b64e", belly: "#fcf6e6", dark: "#1d140e", pat: "ros", face: "spots", tear: true, th: .86, len: 1.45, clear: .5, legw: .19, head: .44, sn: 1.0, earS: .8,
    rows: [[-.66, 7, .056], [-.2, 7, .064], [.3, 7, .06]], tail: { len: 1.3, w0: .14, w1: .1, curl: 2.5, tip: 2, under: "#fff7e4" }, muzzle: "#fcf6e6", stride: .3, gait: .9, seed: 7, eye: .15, ringW: .028, iris: "#a8b53a" });
  cat("skyleopard", { body: "#a9966a", belly: "#d8cfb4", dark: "#17120d", pat: "cloud", face: "cloud", th: .98, len: 1.3, clear: .42, legw: .26, head: .5, sn: .72, earS: .8, earC: "#4a3a28", cloudIn: .3,
    tail: { len: 1.4, w0: .3, w1: .26, curl: 2.3, rings: [1, 3, 5, 7], tip: 1, color: "#a9966a" }, fang: 1.9, muzzle: "#d8cfb4", paw: 1.15, seed: 5, iris: "#b8a238", gait: 1.0, stride: .22, ringW: .03 });
  cat("tiger", { body: "#e8821c", belly: "#fbf3e2", dark: "#17100a", pat: "tiger", face: "tiger", th: 1.25, len: 1.4, clear: .4, legw: .33, head: .6, sn: .85, earS: .72, ruff: .2, pawC: "#f0dfc0", farLeg: "#e8d3a8", chin: "#fbf3e2",
    tail: { len: 1.2, w0: .22, w1: .18, curl: 2.1, rings: [1, 3, 5, 7], tip: 1, color: "#e8821c" }, muzzle: "#fbf3e2", stride: .26, gait: 1.05, paw: 1.25, iris: "#d9b02a", seed: 11, eye: .14, nose: "#a85a58", sc: .84 });
  cat("ceylonleopard", { body: "#e39a22", belly: "#f8ecd0", dark: "#160e08", pat: "rosFine", face: "spots", tear: false, th: 1.02, len: 1.3, clear: .4, legw: .26, head: .53, sn: .85, earS: .8,
    rows: [[-.72, 6, .054], [-.3, 6, .062], [.12, 6, .062], [.5, 4, .046]], tail: { len: 1.2, w0: .17, w1: .12, curl: 2.2, tip: 2, rings: [4, 6], under: "#f8ecd0" }, muzzle: "#f8ecd0", paw: 1.15, seed: 9, eye: .15, iris: "#cfa326", ringW: .036, stride: .24 });
  cat("fossa", { body: "#b9703a", belly: "#d8a574", dark: "#6a3a1c", th: .95, len: 1.6, clear: .3, legw: .2, head: .47, sn: 1.2, earS: 1.2, earC: "#a8622f", earIn: "#cc9078", pawC: "#a8622f", fang: 1,
    tail: { len: 1.4, w0: .15, w1: .11, curl: 2.4, color: "#b9703a" }, stride: .27, gait: .85, paw: 1.0, eye: .2, iris: "#8a5a22", sc: .84, nose: "#2a1a18", chin: "#d8a574", face: "plain", muzzle: "#d8b080" });
  cat("puma", { body: "#c7a577", belly: "#f3ead8", dark: "#2a1a10", pat: "plain", face: "puma", th: 1.05, len: 1.5, clear: .46, legw: .24, head: .44, sn: 1.0, earS: .78, earC: "#2a1c14", muzzle: "#f3ead8", chin: "#f6efe0",
    tail: { len: 1.3, w0: .19, w1: .17, curl: 2.3, tip: 2, color: "#c7a577", under: "#e6d4b4" }, stride: .3, gait: .92, iris: "#a8b44a", eye: .15, nose: "#4a2a2a", seed: 4, sc: .86 });

  // ---------- Dovendyr ----------
  // Lodden kontur: spidse totter rundt om en ellipse
  function shaggy(cx, cy, rx, ry, n, amp, seed, rot) {
    const p = new Path2D();
    for (let i = 0; i < n * 2; i++) {
      const a = i / (n * 2) * TAU + (rot || 0), tuft = i % 2, r = tuft ? 1 + amp * (.5 + rnd(seed + i) * .9) : 1 - amp * .35;
      const x = cx + cos(a) * rx * r, y = cy + sin(a) * ry * r + (tuft && sin(a) > 0 ? amp * ry * .5 : 0);
      if (i) p.lineTo(x, y); else p.moveTo(x, y);
    }
    p.closePath();
    return p;
  }
  // Lange bøjede kløer, der holder om grenen
  function claws(c, x, y, n, len, col, edge, dir) {
    c.fillStyle = col; c.strokeStyle = edge; c.lineWidth = .016; c.beginPath();
    for (let k = 0; k < n; k++) {
      const by = y - .05 + k * (.2 / n + .02) * (n === 2 ? 1.5 : 1), l = len * (1 - k * .06);
      c.moveTo(x, by); c.quadraticCurveTo(x + l * .8 * dir, by - .06, x + l * dir, by + l * .55);
      c.quadraticCurveTo(x + l * .55 * dir, by + .03, x, by + .08); c.closePath();
    }
    c.fill(); c.stroke();
  }
  function sloth(c, s, o) {
    const t = o.t || 0, E = dk(s.fur, .62), two = s.toes === 2;
    const sway = sin(t * .7) * .012;
    c.save(); c.lineJoin = "round"; c.lineCap = "round";
    const limb = (pts, ws, col, from) => {
      const g = geom(pts, ws.map((w) => w / 2), ws.map((w) => w / 2));
      c.fillStyle = col; c.fill(ribbonPath(g));
      if (from === undefined) from = 0;
      c.strokeStyle = E; c.lineWidth = .026;
      c.stroke(ribbonPath(from ? geom(pts.slice(from), ws.slice(from).map((w) => w / 2), ws.slice(from).map((w) => w / 2)) : g));
    };
    const paw = (x, y, col) => { c.fillStyle = col; c.strokeStyle = E; c.lineWidth = .02; c.beginPath(); c.ellipse(x, y, .15, .11, .3, 0, TAU); c.fill(); c.stroke(); };
    const fcol = (k) => lin(c, 0, -.4, 0, 1, [[0, lt(s.fur, .1 + k)], [.6, s.fur], [1, dk(s.fur, .22)]]);
    // fjerneste arm og bagben
    limb([[-.05, -.1], [.38, .4], [.58 + sway, .86]], [.3, .24, .2], dk(s.fur, .2));
    paw(.6 + sway, .86, dk(s.fur, .2));
    claws(c, .62 + sway, .86, s.toes, .4, s.claw, dk(s.claw, .5), 1);
    limb([[-.55, .5], [-.4, .82], [-.2, .94]], [.34, .26, .2], dk(s.fur, .12));
    paw(-.2, .93, dk(s.fur, .12));
    claws(c, -.18, .93, s.toes, .3, s.claw, dk(s.claw, .5), 1);
    // krop
    c.save(); c.translate(-.15, .95); c.scale(1, 1 + sin(t * 1.4) * .012); c.translate(.15, -.95);
    const bp = shaggy(-.15, .2, .78, .8, 18, .06, s.seed, .3);
    c.fillStyle = fcol(0); c.fill(bp); c.strokeStyle = E; c.lineWidth = .026; c.stroke(bp);
    // pelsstrøg og alger
    c.save(); c.clip(bp);
    c.fillStyle = s.alg; c.beginPath();
    for (let i = 0; i < 6; i++) ell(c, -.7 + rnd(i + s.seed) * 1.2, -.3 + rnd(i + 20) * 1.2, .2 + rnd(i + 5) * .15, .1 + rnd(i + 9) * .08, rnd(i + 3) * 2, 0, TAU);
    c.fill();
    c.lineWidth = .022;
    for (let pass = 0; pass < 2; pass++) {
      c.strokeStyle = pass ? lt(s.fur, .3) : dk(s.fur, .38); c.beginPath();
      for (let i = 0; i < 12; i++) {
        const id = i * 3 + pass * 50 + s.seed, x = -.8 + rnd(id) * 1.3, y = -.5 + rnd(id + 1) * 1.3;
        c.moveTo(x, y); c.quadraticCurveTo(x + .03, y + .1, x - .01 + rnd(id + 2) * .06, y + .2);
      }
      c.stroke();
    }
    c.restore();
    c.restore();
    // nærmeste arm og lår
    limb([[.15, -.2], [.62, .3 + sway], [.78, .86]], [.34, .27, .22], dk(s.fur, .06), 1);
    paw(.8, .86, dk(s.fur, .06));
    claws(c, .82, .86, s.toes, .42, s.claw, dk(s.claw, .5), 1);
    limb([[-.5, .4], [-.3, .78], [-.05, .95]], [.4, .3, .22], lt(s.fur, .02), 1);
    paw(-.03, .95, lt(s.fur, .02));
    claws(c, -.01, .95, s.toes, .32, s.claw, dk(s.claw, .5), 1);
    // armens pelstotter
    c.strokeStyle = dk(s.fur, .38); c.lineWidth = .02; c.beginPath();
    for (let i = 0; i < 5; i++) { const f = .2 + i * .17, x = lerp(.5, .8, f) - .06 + rnd(i) * .1, y = lerp(.3, .86, f); c.moveTo(x, y - .06); c.quadraticCurveTo(x + .02, y, x, y + .1); }
    c.stroke();
    // hoved
    const hx = .3 + sin(t * .7) * .025, hy = -.72 + sin(t * 1.4) * .01, R = s.head, rot = sin(t * .5) * .06;
    c.save(); c.translate(hx, hy); c.rotate(rot); c.scale(R, R);
    const hp = shaggy(0, 0, 1, .98, 16, .07, s.seed + 40, .2);
    c.fillStyle = rad(c, 0, 0, 0, 1.4, [[0, lt(s.fur, .12)], [.7, s.fur], [1, dk(s.fur, .25)]], -.3, -.4); c.fill(hp); c.strokeStyle = E; c.lineWidth = .05; c.stroke(hp);
    const fx = two ? .22 : .12;
    // ansigtet
    c.save(); c.beginPath(); c.ellipse(fx, .1, .74, .68, 0, 0, TAU); c.clip();
    c.fillStyle = rad(c, fx, .1, 0, .8, [[0, lt(s.face, .15)], [.8, s.face], [1, dk(s.face, .12)]], fx - .2, -.2); c.fillRect(-1, -1, 3, 3);
    if (!two) {
      c.strokeStyle = s.mask; c.lineWidth = .3; c.beginPath();
      c.moveTo(fx - .12, -.02); c.quadraticCurveTo(fx - .5, -.12, fx - .72, .16);
      c.moveTo(fx + .3, -.02); c.quadraticCurveTo(fx + .55, -.12, fx + .76, .16);
      c.stroke();
    } else { c.fillStyle = lt(s.face, .08); c.beginPath(); c.ellipse(fx + .32, .3, .4, .3, 0, 0, TAU); c.fill(); }
    c.restore();
    c.strokeStyle = dk(s.face, .35); c.lineWidth = .04; c.beginPath(); c.ellipse(fx, .1, .74, .68, 0, 0, TAU); c.stroke();
    if (two) { // lang, lys snude uden for ansigtet
      c.fillStyle = rad(c, fx + .7, .28, 0, .5, [[0, lt(s.face, .2)], [1, s.face]], fx + .6, .2); c.strokeStyle = dk(s.face, .4); c.lineWidth = .04;
      c.beginPath(); c.ellipse(fx + .62, .38, .46, .28, .1, 0, TAU); c.fill(); c.stroke();
    }
    const bl = blinkOf(t, 2.1);
    const eye = (x, y, r) => {
      if (bl > .5) { c.strokeStyle = "#20140c"; c.lineWidth = .05; c.beginPath(); c.arc(x, y + .03, r * .9, .15 * PI, .85 * PI); c.stroke(); }
      else eyeDark(c, x, y, r, "#4a3020");
    };
    if (two) { eye(fx - .06, -.06, .085); eye(fx + .5, -.06, .075); }
    else { eye(fx - .12, -.02, .1); eye(fx + .34, -.02, .09); }
    // næse og smil
    const nx = two ? fx + .96 : fx + .12, ny = two ? .3 : .24;
    c.fillStyle = s.nose; c.beginPath(); c.ellipse(nx, ny, .13, two ? .1 : .09, 0, 0, TAU); c.fill();
    c.fillStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.arc(nx - .04, ny - .03, .03, 0, TAU); c.fill();
    c.strokeStyle = "#2a1810"; c.lineWidth = .04; c.beginPath();
    if (two) { c.moveTo(fx + .4, .6); c.quadraticCurveTo(fx + .7, .64, fx + .98, .52); }
    else { c.moveTo(fx - .2, .44); c.quadraticCurveTo(fx + .12, .66, fx + .44, .44); }
    c.stroke();
    // pandelokker
    c.strokeStyle = dk(s.fur, .3); c.lineWidth = .04; c.beginPath();
    for (let i = 0; i < 5; i++) { const x = -.6 + i * .3; c.moveTo(x, -.82 + (i % 2) * .05); c.quadraticCurveTo(x + .06, -.62, x + .0, -.5); }
    c.stroke();
    c.restore();
    c.restore();
  }
  T.addKind("dovendyr", sloth);
  T.look("dovendyr", "dovendyr", { toes: 3, fur: "#8a7c56", alg: "rgba(110,150,64,.32)", face: "#dccfa4", mask: "#3a2a1a", nose: "#2a1a14", claw: "#e6dcc0", head: .5, seed: 2 });
  T.look("totaaet_dovendyr", "dovendyr", { toes: 2, fur: "#b8a584", alg: "rgba(120,150,80,.22)", face: "#d8caa8", mask: "#6a5a40", nose: "#8a6860", claw: "#e6dcc0", head: .48, seed: 6 });

  // ---------- Flyveræv ----------
  function wing(c, s, sx, sy, a, far, hx, hy) {
    const K = 1.05, E = [sx + .26 * K * cos(a), sy + .26 * K * sin(a)], a2 = a - .2, W = [E[0] + .44 * K * cos(a2), E[1] + .44 * K * sin(a2)];
    const lens = [.52, .54, .46, .34].map((v) => v * K), offs = [0, .5, 1.0, 1.5], tips = [];
    for (let k = 0; k < 4; k++) { const b = a2 - offs[k]; tips.push([W[0] + lens[k] * cos(b), W[1] + lens[k] * sin(b)]); }
    const mem = far ? dk(s.wing, .25) : s.wing, bone = far ? "#1a0f0c" : "#2a1a16";
    c.fillStyle = lin(c, sx, sy, tips[3][0], tips[3][1], [[0, mix(mem, s.mane, .22)], [.4, mem], [1, dk(mem, .15)]]);
    c.beginPath(); c.moveTo(sx, sy); c.lineTo(E[0], E[1]); c.lineTo(W[0], W[1]); c.lineTo(tips[0][0], tips[0][1]);
    for (let k = 0; k < 3; k++) {
      const m = [(tips[k][0] + tips[k + 1][0]) / 2, (tips[k][1] + tips[k + 1][1]) / 2];
      c.quadraticCurveTo(lerp(m[0], W[0], .3), lerp(m[1], W[1], .3), tips[k + 1][0], tips[k + 1][1]);
    }
    const m = [(tips[3][0] + hx) / 2, (tips[3][1] + hy) / 2];
    c.quadraticCurveTo(lerp(m[0], W[0], .25), lerp(m[1], W[1], .25), hx, hy); c.closePath(); c.fill();
    c.strokeStyle = bone; c.lineCap = "round"; c.lineJoin = "round"; c.lineWidth = .026; c.stroke();
    c.lineWidth = .028; c.beginPath();
    for (const p of tips) { c.moveTo(W[0], W[1]); c.lineTo(p[0], p[1]); }
    c.stroke();
    c.lineWidth = .055; c.beginPath(); c.moveTo(sx, sy); c.lineTo(E[0], E[1]); c.lineTo(W[0], W[1]); c.stroke();
    c.strokeStyle = "rgba(255,200,160,.16)"; c.lineWidth = .02; c.beginPath(); // vingehindens årer
    for (let k = 0; k < 3; k++) { const p = tips[k], q = tips[k + 1]; c.moveTo(lerp(p[0], W[0], .35), lerp(p[1], W[1], .35)); c.lineTo(lerp(q[0], W[0], .35), lerp(q[1], W[1], .35)); }
    c.stroke();
    c.fillStyle = "#e8dcc0"; c.beginPath(); c.moveTo(W[0], W[1]); c.quadraticCurveTo(W[0] + .1 * cos(a2 - .5), W[1] + .1 * sin(a2 - .5) - .04, W[0] + .14 * cos(a2 - 1.1), W[1] + .14 * sin(a2 - 1.1)); c.lineTo(W[0] + .03, W[1] + .03); c.fill();
  }
  // Rævehoved set fra siden
  function foxHead(c, s, t, tilt) {
    const E = dk(s.face, .6);
    c.save(); c.rotate(tilt || 0); c.lineJoin = "round"; c.lineCap = "round";
    const ear = (x, y, far) => {
      c.fillStyle = far ? dk(s.face, .3) : dk(s.face, .1); c.strokeStyle = E; c.lineWidth = .022;
      c.beginPath(); c.moveTo(x - .1, y + .1); c.quadraticCurveTo(x - .14, y - .12, x - .03, y - .26); c.quadraticCurveTo(x + .1, y - .1, x + .11, y + .1); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = far ? "#6a4a40" : "#a9776a"; c.beginPath(); c.moveTo(x - .05, y + .06); c.quadraticCurveTo(x - .07, y - .06, x - .02, y - .15); c.quadraticCurveTo(x + .05, y - .05, x + .06, y + .06); c.closePath(); c.fill();
    };
    ear(.52, -.3, true); ear(.4, -.27, false);
    const head = () => {
      c.beginPath(); c.moveTo(.3, -.06);
      c.bezierCurveTo(.3, -.3, .5, -.38, .68, -.3);
      c.bezierCurveTo(.8, -.24, .9, -.16, 1.04, -.08);
      c.bezierCurveTo(1.12, -.04, 1.12, .05, 1.04, .08);
      c.quadraticCurveTo(.9, .13, .8, .13); c.bezierCurveTo(.66, .2, .46, .24, .36, .16);
      c.bezierCurveTo(.28, .1, .28, 0, .3, -.06); c.closePath();
    };
    c.fillStyle = rad(c, .66, -.04, 0, .5, [[0, lt(s.face, .18)], [.65, s.face], [1, dk(s.face, .25)]], .5, -.2);
    head(); c.fill(); c.lineWidth = .026; c.strokeStyle = E; c.stroke();
    c.fillStyle = dk(s.face, .35); c.beginPath(); c.ellipse(.93, .0, .13, .08, .15, 0, TAU); c.fill(); // mørk snude
    c.fillStyle = "#1a0e0c"; c.beginPath(); c.ellipse(1.09, -.02, .04, .035, 0, 0, TAU); c.fill();
    c.strokeStyle = "#1a0e0c"; c.lineWidth = .016; c.beginPath(); c.moveTo(1.02, .075); c.quadraticCurveTo(.9, .12, .78, .1); c.stroke();
    const bl = blinkOf(t, 3.3);
    if (bl > .5) { c.strokeStyle = "#140a08"; c.lineWidth = .03; c.beginPath(); c.arc(.64, -.14, .07, .1 * PI, .9 * PI); c.stroke(); }
    else eyeDark(c, .64, -.14, .085, "#2a1812");
    c.restore();
  }
  function manes(c, s, cx, cy, rx, ry, rot, n) {
    c.save(); c.translate(cx, cy); c.rotate(rot);
    c.fillStyle = rad(c, 0, 0, 0, Math.max(rx, ry) * 1.1, [[0, s.mane2], [.6, s.mane], [1, dk(s.mane, .3)]], -rx * .2, -ry * .3);
    c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, TAU); c.fill();
    c.strokeStyle = dk(s.mane, .35); c.lineWidth = .018; c.lineCap = "round"; c.beginPath();
    for (let i = 0; i < n; i++) { const a = rnd(i + 7) * TAU, r = .45 + rnd(i + 3) * .5; c.moveTo(cos(a) * rx * r, sin(a) * ry * r); c.lineTo(cos(a) * rx * (r + .3), sin(a) * ry * (r + .3)); }
    c.stroke();
    c.restore();
  }
  T.addKind("flaggermus", function (c, s, o) {
    const t = o.t || 0, mode = o.mode === "fly" ? "fly" : "sit";
    c.save(); c.lineJoin = "round"; c.lineCap = "round";
    if (mode === "fly") {
      const w = t * TAU * .8, a = -1.2 + .85 * sin(w);
      c.translate(-.1, -sin(w - .4) * .07); c.rotate(-.1 + cos(w) * .035);
      const hip = [-.5, .14];
      wing(c, s, .3, -.06, a + .3, true, hip[0] + .1, hip[1] - .02);
      // bagben (bagved)
      c.strokeStyle = dk(s.body, .2); c.lineWidth = .06; c.beginPath(); c.moveTo(-.5, .2); c.lineTo(-.78, .34); c.lineTo(-.95, .3); c.moveTo(-.42, .22); c.lineTo(-.7, .44); c.stroke();
      // krop
      c.fillStyle = rad(c, -.15, .05, 0, .7, [[0, lt(s.body, .15)], [.6, s.body], [1, dk(s.body, .4)]], -.25, -.1);
      c.beginPath(); c.ellipse(-.2, .06, .55, .3, -.08, 0, TAU); c.fill(); c.strokeStyle = dk(s.body, .6); c.lineWidth = .026; c.stroke();
      wing(c, s, .18, -.04, a, false, hip[0], hip[1]);
      manes(c, s, .32, -.02, .3, .3, -.2, 12);
      c.save(); c.translate(.0, .0); foxHead(c, s, t, .05); c.restore();
    } else { // hænger i fødderne med vingerne foldet om kroppen
      c.translate(0, -1.3); c.rotate(sin(t * .9) * .03);
      c.strokeStyle = dk(s.body, .2); c.lineWidth = .07; c.beginPath(); c.moveTo(-.07, .02); c.lineTo(-.1, .3); c.moveTo(.08, .02); c.lineTo(.1, .3); c.stroke();
      c.fillStyle = "#e8dcc0"; c.strokeStyle = "#5a4a3a"; c.lineWidth = .015; c.beginPath(); // kløer om grenen
      for (const x of [-.1, .08]) { c.moveTo(x - .05, .0); c.quadraticCurveTo(x, -.14, x + .12, -.05); c.quadraticCurveTo(x + .02, -.07, x - .02, .02); c.closePath(); }
      c.fill(); c.stroke();
      const br = 1 + sin(t * 1.5) * .012;
      c.save(); c.translate(0, .3); c.scale(br, 1);
      // kokon af vinger
      c.fillStyle = lin(c, -.5, 0, .6, 0, [[0, dk(s.wing, .2)], [.5, s.wing], [1, lt(s.wing, .06)]]);
      c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-.65, .2, -.7, 1.1, -.08, 1.55); c.bezierCurveTo(.1, 1.62, .45, 1.2, .62, .72); c.bezierCurveTo(.62, .3, .3, .0, 0, 0); c.closePath();
      c.fill(); c.strokeStyle = "#1a0f0c"; c.lineWidth = .03; c.stroke();
      // fremme vinge med knogler
      c.strokeStyle = "#1a0f0c"; c.lineWidth = .05; c.beginPath(); c.moveTo(.0, .06); c.quadraticCurveTo(.5, .2, .46, .78); c.stroke();
      c.lineWidth = .026; c.beginPath();
      c.moveTo(.46, .78); c.quadraticCurveTo(.5, 1.2, .16, 1.5); c.moveTo(.46, .78); c.quadraticCurveTo(.35, 1.2, .04, 1.52); c.moveTo(.46, .78); c.quadraticCurveTo(.2, 1.1, -.14, 1.45);
      c.moveTo(.46, .78); c.quadraticCurveTo(.0, .9, -.38, 1.1);
      c.stroke();
      c.strokeStyle = "rgba(255,200,160,.16)"; c.beginPath(); c.moveTo(.2, .85); c.quadraticCurveTo(.0, 1.1, -.1, 1.3); c.moveTo(.08, .8); c.quadraticCurveTo(-.2, 1.0, -.3, 1.1); c.stroke();
      c.fillStyle = "#e8dcc0"; c.beginPath(); c.moveTo(.46, .74); c.quadraticCurveTo(.58, .66, .62, .54); c.lineTo(.5, .64); c.fill();
      c.restore();
      manes(c, s, .0, 1.88, .5, .34, .1, 14);
      c.save(); c.translate(-.35, 2.12 + .0); c.rotate(sin(t * .8) * .05); c.scale(1.05, 1.05); foxHead(c, s, t, 0); c.restore();
    }
    c.restore();
  });
  T.look("flyverav", "flaggermus", { body: "#2a1c18", mane: "#d8651f", mane2: "#f2a24c", wing: "#583830", face: "#7a4a30" });

  // ---------- Kæmpeegern ----------
  T.addKind("egern", function (c, s, o) {
    const t = o.t || 0, E = dk(s.back, .62), ch = sin(t * 9.5), br = 1 + sin(t * 1.6) * .01;
    c.save(); c.lineJoin = "round"; c.lineCap = "round";
    c.translate(.2, 1); c.scale(1, br); c.translate(0, -1);
    // den store busklede hale
    const tp = [[-.5, .7], [-.95, .62], [-1.22, .28], [-1.3, -.25], [-1.16, -.7], [-.88, -1.05], [-.58, -1.2]];
    tp.forEach((p, i) => { p[0] += sin(t * .8 - i * .6) * .035 * i / 6; });
    const tw = [.2, .42, .6, .7, .66, .5, .3].map((w, i) => w / 2 + (i % 2 ? .02 : 0));
    const tg = geom(tp, tw, tw);
    c.fillStyle = lin(c, -.5, .7, -.6, -1.1, [[0, s.tail[0]], [.45, s.tail[1]], [.85, s.tail[2]], [1, s.tail[2]]]);
    const tr = ribbonPath(tg);
    c.fill(tr); c.strokeStyle = E; c.lineWidth = .03; c.stroke(tr);
    c.save(); c.clip(tr);
    c.fillStyle = s.tip; c.globalAlpha = .45; c.beginPath(); c.moveTo(tg.L[4][0], tg.L[4][1]); c.lineTo(tg.L[5][0], tg.L[5][1]); c.lineTo(tg.R[5][0], tg.R[5][1]); c.lineTo(tg.R[4][0], tg.R[4][1]); c.closePath(); c.fill(); // mørk spids
    c.globalAlpha = 1; c.beginPath(); c.moveTo(tg.L[5][0], tg.L[5][1]); c.lineTo(tg.L[6][0], tg.L[6][1]); c.lineTo(tg.R[6][0], tg.R[6][1]); c.lineTo(tg.R[5][0], tg.R[5][1]); c.closePath(); c.fill();
    c.strokeStyle = lt(s.tail[2], .25); c.globalAlpha = .55; c.lineWidth = .025; c.beginPath(); // pelsstrøg langs halen
    for (let i = 0; i < 12; i++) { const f = .6 + rnd(i) * 3.8, v = -.8 + rnd(i + 4) * 1.6, a = gpt(tg, f, v), b = gpt(tg, f + .9, v + (rnd(i + 8) - .5) * .2); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
    c.stroke(); c.globalAlpha = 1;
    c.restore();
    // bagben og fod
    c.fillStyle = s.foot; c.strokeStyle = E; c.lineWidth = .026; c.beginPath(); c.ellipse(.15, .93, .38, .1, 0, 0, TAU); c.fill(); c.stroke();
    // krop
    c.fillStyle = lin(c, -.6, 0, .5, 0, [[0, dk(s.back, .15)], [.4, s.back], [.62, mix(s.back, s.belly, .45)], [.78, s.belly], [1, lt(s.belly, .1)]]);
    c.beginPath(); c.ellipse(-.06, .08, .56, .8, .16, 0, TAU); c.fill(); c.stroke();
    blob(c, -.34, .6, .5, .42, -.3, dk(s.back, .2), E);
    c.fillStyle = s.back;
    // arme og nød
    const ar = geom([[.26, -.2], [.5, .06], [.66, -.34]], [.1, .08, .06], [.1, .08, .06]);
    const arp = ribbonPath(ar); c.fillStyle = s.belly; c.fill(arp); c.stroke(arp);
    const jaw = ch * .008, nutx = .74, nuty = -.42 + ch * .004;
    // hoved
    c.save(); c.translate(.34, -.72); c.rotate(sin(t * .6) * .02);
    const ear = (x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.stroke(); c.fillStyle = "#8a5a52"; c.beginPath(); c.arc(x + .01, y + .01, r * .55, 0, TAU); c.fill(); };
    ear(-.14, -.38, .14, dk(s.back, .25)); ear(-.28, -.34, .15, s.back);
    c.fillStyle = lin(c, 0, -.4, 0, .4, [[0, s.back], [.5, mix(s.back, s.belly, .35)], [1, s.belly]]);
    c.beginPath(); c.ellipse(0, 0, .44, .4, 0, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = s.belly; c.beginPath(); c.ellipse(.06, .18 + ch * .004, .36, .24, .1, 0, TAU); c.fill();
    c.fillStyle = lt(s.belly, .25); c.beginPath(); c.ellipse(.36, .16, .2, .16, 0, 0, TAU); c.fill(); c.strokeStyle = E; c.lineWidth = .02; c.stroke();
    c.fillStyle = "#4a2428"; c.beginPath(); c.ellipse(.54, .08, .06, .045, .2, 0, TAU); c.fill(); // næse
    c.fillStyle = "#fbf6e6"; c.beginPath(); c.rect(.45, .26 + jaw, .035, .045); c.rect(.49, .26 + jaw, .035, .045); c.fill(); // fortænder
    c.strokeStyle = "rgba(255,250,235,.7)"; c.lineWidth = .012; c.beginPath();
    for (let i = 0; i < 3; i++) { c.moveTo(.45, .14 + i * .04); c.quadraticCurveTo(.7, .1 + i * .08, .85, .08 + i * .13); }
    c.stroke();
    if (blinkOf(t, 1.7) > .5) { c.strokeStyle = "#140a08"; c.lineWidth = .025; c.beginPath(); c.arc(.2, -.06, .06, .1 * PI, .9 * PI); c.stroke(); }
    else eyeDark(c, .2, -.06, .075, "#2a1410");
    c.restore();
    // nød og poter
    c.save(); c.translate(nutx, nuty);
    c.fillStyle = rad(c, 0, 0, 0, .16, [[0, lt(s.nut, .3)], [.7, s.nut], [1, dk(s.nut, .35)]], -.04, -.05);
    c.beginPath(); c.ellipse(0, 0, .12, .14, .3, 0, TAU); c.fill(); c.strokeStyle = E; c.lineWidth = .02; c.stroke();
    c.fillStyle = dk(s.nut, .5); c.beginPath(); c.arc(.03, -.12, .025, 0, TAU); c.fill();
    c.restore();
    c.fillStyle = s.belly; c.strokeStyle = E; c.lineWidth = .02; c.beginPath();
    c.ellipse(.62, -.34, .08, .06, .4, 0, TAU); c.ellipse(.84, -.33, .07, .06, -.4, 0, TAU); c.fill(); c.stroke();
    c.strokeStyle = dk(s.belly, .4); c.lineWidth = .012; c.beginPath();
    c.moveTo(.66, -.4); c.lineTo(.7, -.44); c.moveTo(.8, -.39); c.lineTo(.77, -.44);
    c.stroke();
    c.restore();
  });
  T.look("kaempeegern", "egern", { back: "#74303c", belly: "#e8d49a", tail: ["#7a3a3c", "#c98a4a", "#ecd080"], tip: "#4a2030", foot: "#6a3a2e", nut: "#b07a3a" });
})();
