// Fuglene i Hej Banan: ét fælles fuglesystem (krop, hoved, næb, vinger, hale, ben) og 15 arter som udseender.
// Poser: "sit", "fly" og (kun rovfugle) "attack". Alt tegnes i lokale enheder, vendt mod +x.
(function () {
  "use strict";
  const T = window.BananTegn;
  const { dk, lt, lin, rad, dome } = T;
  const PI = Math.PI, TAU = PI * 2, sin = Math.sin, cos = Math.cos, hyp = Math.hypot;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const norm = (x, y) => { const l = hyp(x, y) || 1; return [x / l, y / l]; };
  const ell = (c, x, y, rx, ry, rot) => c.ellipse(x, y, rx, ry, rot || 0, 0, TAU);
  function fillEll(c, x, y, rx, ry, col, rot) { c.fillStyle = col; c.beginPath(); ell(c, x, y, rx, ry, rot); c.fill(); }
  function strokeLn(c, col, w, pts) { // pts = [x0,y0,x1,y1,...] som ét streg-sæt (par af punkter)
    c.strokeStyle = col; c.lineWidth = w; c.beginPath();
    for (let i = 0; i < pts.length; i += 4) { c.moveTo(pts[i], pts[i + 1]); c.lineTo(pts[i + 2], pts[i + 3]); }
    c.stroke();
  }

  // ---------- Dele: fjer, spidser, ribbon ----------
  // En fjer (rundet spids): rod (x,y), retning (dx,dy), længde l, halv bredde w, tw = bredde ved spidsen
  function feather(c, x, y, dx, dy, l, w, tw) {
    const qx = -dy * w, qy = dx * w, k = (tw === undefined ? .62 : tw) + .5;
    c.moveTo(x + qx, y + qy);
    c.quadraticCurveTo(x + dx * l * .6 + qx * k, y + dy * l * .6 + qy * k, x + dx * l, y + dy * l);
    c.quadraticCurveTo(x + dx * l * .6 - qx * k, y + dy * l * .6 - qy * k, x - qx, y - qy);
  }
  // Spidse fjer-toppe (kam): list = [[x0,y0,x1,y1,bredde],...]
  function spikes(c, list, col, edge, t) {
    c.beginPath();
    list.forEach((p, i) => {
      const sw = sin((t || 0) * 2 + i * 1.7) * .02, x1 = p[2] + sw, y1 = p[3] + sw * .5;
      const [dx, dy] = norm(x1 - p[0], y1 - p[1]), qx = -dy * p[4], qy = dx * p[4];
      const mx = (p[0] + x1) / 2, my = (p[1] + y1) / 2;
      c.moveTo(p[0] + qx, p[1] + qy);
      c.quadraticCurveTo(mx + qx * .8 + dy * .05, my + qy * .8 - dx * .05, x1, y1);
      c.quadraticCurveTo(mx - qx * .7, my - qy * .7, p[0] - qx, p[1] - qy);
      c.closePath();
    });
    c.fillStyle = col; c.fill();
    if (edge) { c.strokeStyle = edge; c.lineWidth = .016; c.stroke(); }
  }
  // Et bånd/en svajende fjer med spids (kubisk kurve): p = [x0,y0,x1,y1,x2,y2,x3,y3], w0 = bredde ved roden, w1 = bredde i midten
  function ribbon(c, p, w0, w1) {
    const [dx, dy] = norm(p[6] - p[0], p[7] - p[1]), nx = -dy, ny = dx;
    c.moveTo(p[0] + nx * w0, p[1] + ny * w0);
    c.bezierCurveTo(p[2] + nx * w1, p[3] + ny * w1, p[4] + nx * w1 * .7, p[5] + ny * w1 * .7, p[6], p[7]);
    c.bezierCurveTo(p[4] - nx * w1 * .7, p[5] - ny * w1 * .7, p[2] - nx * w1, p[3] - ny * w1, p[0] - nx * w0, p[1] - ny * w0);
    c.closePath();
  }

  // ---------- Fødder ----------
  // Fod med tæer: ankel (x,y), retning ang, tålængde len, spredning spr, tykkelse w, kløer
  function foot(c, x, y, ang, len, spr, w, col, claw, hind) {
    c.strokeStyle = col; c.lineWidth = w; c.beginPath();
    const tips = [];
    for (const d of [-spr, 0, spr]) {
      const a = ang + d, tx = x + cos(a) * len, ty = y + sin(a) * len;
      c.moveTo(x, y); c.lineTo(tx, ty); tips.push([tx, ty, a]);
    }
    const h = ang + PI + .3;
    c.moveTo(x, y); c.lineTo(x + cos(h) * len * (hind || .45), y + sin(h) * len * (hind || .45));
    c.stroke();
    c.strokeStyle = claw; c.lineWidth = w * .72; c.beginPath();
    const cl = len * .25;
    for (const [tx, ty, a] of tips) {
      const dx = cos(a), dy = sin(a), px = -dy, py = dx;
      c.moveTo(tx, ty);
      c.quadraticCurveTo(tx + dx * cl * .75 + px * cl * .1, ty + dy * cl * .75 + py * cl * .1, tx + dx * cl * .45 + px * cl * .85, ty + dy * cl * .45 + py * cl * .85);
    }
    c.stroke();
  }

  // ---------- Øjne ----------
  function eye(c, e, P, fierce) {
    c.save(); c.translate(e.x, e.y); c.scale(1, P.blink * (P.mode === "atk" ? .8 : 1));
    const r = e.r;
    if (e.ring) { c.fillStyle = e.ring; c.beginPath(); c.arc(0, 0, r * 1.3, 0, TAU); c.fill(); }
    c.fillStyle = dk(e.iris, .55); c.beginPath(); c.arc(0, 0, r * 1.02, 0, TAU); c.fill();
    c.fillStyle = rad(c, 0, 0, r * .15, r, [[0, dk(e.iris, .25)], [.55, e.iris], [1, dk(e.iris, .2)]], r * .1, r * .1);
    c.beginPath(); c.arc(0, 0, r * .94, 0, TAU); c.fill();
    c.fillStyle = e.pupil || "#0a0c10"; c.beginPath(); c.arc(r * .08, 0, r * (e.pr || .5), 0, TAU); c.fill();
    c.fillStyle = "rgba(255,255,255,.95)"; c.beginPath(); c.arc(-r * .28, -r * .34, r * .26, 0, TAU); c.fill();
    c.fillStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.arc(r * .3, r * .3, r * .1, 0, TAU); c.fill();
    c.restore();
    if (fierce) { // vredt, hængende øjenbryn
      c.strokeStyle = e.brow || "#241a14"; c.lineWidth = r * (e.bw || .8); c.beginPath();
      c.moveTo(e.x - r * 1.5 * (e.bl || 1), e.y - r * 1.75); c.lineTo(e.x + r * 1.75 * (e.bl || 1), e.y - r * .5); c.stroke();
    }
  }

  // ---------- Næb ----------
  function upperPath(c, L, H, hook) {
    c.beginPath();
    c.moveTo(0, -H * .5);
    c.bezierCurveTo(L * .35, -H * .66, L * .88, -H * .42, L, H * (.1 + .55 * hook));
    c.bezierCurveTo(L * .9, H * (.2 + .25 * hook), L * .55, H * .2, 0, H * .12);
    c.closePath();
  }
  function lowerPath(c, L, H, lh) {
    c.beginPath();
    c.moveTo(0, H * .1);
    c.bezierCurveTo(L * .4, H * .13, L * .75, H * .15, L * .84, H * .2);
    c.bezierCurveTo(L * .62, H * .2 + lh * .9, L * .22, H * .1 + lh * 1.05, 0, H * .1 + lh);
    c.closePath();
  }
  function beak(c, s, P) {
    const b = s.beak, L = b.L, H = b.H, lh = H * (b.low || .5), op = P.open * (b.open || 1);
    c.save(); c.translate(b.x, b.y);
    c.save();
    if (op > .02) {
      const a = op * .55, hy = H * .12;
      c.fillStyle = "#6c1f2c"; c.beginPath(); c.moveTo(0, hy); c.lineTo(L * .86, H * .17);
      const px = L * .84, py = H * .2 - hy;
      c.lineTo(px * cos(a) - py * sin(a), hy + px * sin(a) + py * cos(a)); c.closePath(); c.fill();
      c.translate(0, hy); c.rotate(a); c.translate(0, -hy);
    }
    lowerPath(c, L, H, lh);
    c.fillStyle = lin(c, 0, 0, 0, H * .7, [[0, b.lowCol || dk(b.col, .12)], [1, dk(b.lowCol || b.col, .3)]]); c.fill();
    c.strokeStyle = dk(b.lowCol || b.col, .55); c.lineWidth = .02; c.stroke();
    c.restore();
    upperPath(c, L, H, b.hook);
    c.fillStyle = lin(c, 0, -H * .5, 0, H * .25, [[0, lt(b.col, .3)], [.5, b.col], [1, dk(b.col, .22)]]); c.fill();
    if (b.zones) { // farvede zoner langs næbbet: [fra, til, farve] i brøkdele af længden
      c.save(); upperPath(c, L, H, b.hook); c.clip();
      for (const z of b.zones) { c.fillStyle = z[2]; c.fillRect(z[0] * L, -H, (z[1] - z[0]) * L, H * 2); }
      c.restore();
    }
    if (b.shine) { c.strokeStyle = "rgba(255,255,255,.4)"; c.lineWidth = H * .09; c.beginPath(); c.moveTo(L * .12, -H * .36); c.quadraticCurveTo(L * .5, -H * .5, L * .84, -H * .2); c.stroke(); }
    if (b.edge) { c.strokeStyle = b.edge; c.lineWidth = H * .1; c.beginPath(); c.moveTo(L * .1, H * .08); c.quadraticCurveTo(L * .5, H * .2, L * .88, H * .1); c.stroke(); }
    upperPath(c, L, H, b.hook); c.strokeStyle = dk(b.col, .55); c.lineWidth = .022; c.stroke();
    if (b.nostril) fillEll(c, L * .2, -H * .14, H * .09, H * .06, "rgba(0,0,0,.55)", -.3);
    if (b.extra) b.extra(c, b, P);
    c.restore();
  }

  // ---------- Pose ----------
  function pose(s, o, raptor) {
    const t = o.t || 0, ph = s.phase || 0;
    const mode = o.mode === "attack" && raptor ? "atk" : o.mode === "fly" || o.mode === "attack" ? "fly" : "sit";
    const M = s[mode === "atk" ? "atk" : mode], P = { mode, M, t, flap: 0, open: 0, hdx: 0, hdy: 0, hrot: 0, breath: 1, fierce: raptor || !!o.angry, cx: M.cx, cy: M.cy, rot: M.tilt };
    const bt = (t + ph * 3.7) % 3.9;
    P.blink = bt < .16 ? .12 + .88 * Math.abs(bt - .08) / .08 : 1;
    if (mode === "sit") {
      P.rot += sin(t * .8 + ph) * .012; P.breath = 1 + sin(t * 2.1 + ph) * .014;
      P.hdx = sin(t * .6 + ph) * .025; P.hdy = sin(t * 1.1 + ph) * .012; P.hrot = sin(t * .55 + ph * 2) * .05;
    } else if (mode === "fly") {
      const a = t * M.w + ph * 2; P.flap = sin(a);
      P.cy += P.flap * .05; P.rot -= P.flap * .03; P.hdy = -P.flap * .02; P.hrot = P.flap * .03;
    } else {
      P.rot += sin(t * 3) * .015; P.open = .75 + .15 * sin(t * 5); P.hdx = .06;
    }
    return P;
  }
  const tfm = (P, x, y) => [P.cx + x * cos(P.rot) - y * sin(P.rot), P.cy + x * sin(P.rot) + y * cos(P.rot)];

  // ---------- Hale ----------
  function tailFan(c, s, P) {
    const tl = s.tail, B = s.body, atk = P.mode === "atk";
    const len = tl.len * (P.mode === "sit" ? tl.sitK || .8 : 1) * (atk ? .9 : 1);
    const spr = tl.spread * (P.mode === "sit" ? .5 : atk ? 1.5 : 1);
    const ang = PI + (tl.droop || 0) + sin(P.t * 1.3 + 1) * .04 - P.flap * .06;
    const x0 = tl.x === undefined ? -B.rx * .8 : tl.x, y0 = tl.y === undefined ? B.ry * .05 : tl.y;
    const mk = () => {
      c.beginPath();
      for (let i = 0; i < tl.n; i++) {
        const u = tl.n > 1 ? i / (tl.n - 1) * 2 - 1 : 0, a = ang + u * spr;
        feather(c, x0, y0, cos(a), sin(a), len * (1 - (tl.taper || 0) * Math.abs(u)), tl.w, tl.tw);
      }
    };
    mk();
    c.fillStyle = lin(c, x0, y0, x0 + cos(ang) * len, y0 + sin(ang) * len, tl.stops || [[0, dk(tl.col, .1)], [1, tl.col2 || tl.col]]); c.fill();
    c.strokeStyle = dk(tl.col, .55); c.lineWidth = .016; c.stroke();
    if (tl.bands) {
      c.save(); c.clip();
      for (const b of tl.bands) { c.strokeStyle = b.col; c.lineWidth = b.w * len; c.beginPath(); c.arc(x0, y0, b.f * len, ang - spr - .6, ang + spr + .6); c.stroke(); }
      c.restore();
    }
  }

  // ---------- Vinger ----------
  function drop(c, x, y, len, h) { // sammenfoldet vinge: dråbe med spids bagud
    c.beginPath();
    c.moveTo(x + h * .15, y - h * .5);
    c.bezierCurveTo(x - len * .35, y - h * .85, x - len * .8, y - h * .35, x - len, y + len * .07);
    c.bezierCurveTo(x - len * .75, y + h * .7, x - len * .15, y + h * .88, x - len * .02, y + h * .7);
    c.bezierCurveTo(x + h * .7, y + h * .45, x + h * .6, y - h * .3, x + h * .15, y - h * .5);
    c.closePath();
  }
  function fold(c, s, P) {
    const w = s.wing, f = w.fold, cols = w.cols, K = [[1, 1, 0], [.72, .8, .05], [.45, .62, .12]];
    c.save(); c.translate(f.sh[0], f.sh[1]); c.rotate(f.rot || 0);
    for (let j = 0; j < cols.length; j++) {
      drop(c, K[j][2] * f.len * .3, 0, f.len * K[j][0], f.h * K[j][1]);
      c.fillStyle = lin(c, 0, -f.h * .5, 0, f.h * .7, [[0, lt(cols[j], .12)], [1, dk(cols[j], .22)]]); c.fill();
      c.strokeStyle = w.edge || dk(cols[j], .5); c.lineWidth = .016; c.stroke();
    }
    strokeLn(c, dk(cols[0], .5), .014, [-f.len * .5, -f.h * .15, -f.len * .9, f.len * .03, -f.len * .45, f.h * .15, -f.len * .88, f.len * .09, -f.len * .42, f.h * .4, -f.len * .8, f.len * .14]);
    c.restore();
  }
  function wing(c, s, P, far) {
    const w = s.wing, atk = P.mode === "atk", cols = w.cols;
    let ax, ay, nx, ny, L = w.L, W = w.W;
    const L0 = L;
    if (atk) { [ax, ay] = norm(-.97, -.06 + sin(P.t * 4) * .03); [nx, ny] = norm(-.8, .6); L *= 1.02; W *= .8; }
    else {
      // armen svinger fra op-bagud over bagud til ned-bagud; fjerene hænger bagud, så vingen aldrig klapper sammen
      const f = clamp(P.flap * (w.amp || 1) + (far ? -.1 : 0), -1, 1), A = -3.1 + f * 1.15 + (w.bias || 0);
      const nA = f >= 0 ? 2.2 + .7 * f : 2.2 - 1.2 * f;
      ax = cos(A); ay = sin(A); nx = cos(nA); ny = sin(nA);
      L *= .72 + .28 * Math.abs(f);
    }
    const sx = w.sh[0] + (far ? .14 : 0), sy = w.sh[1] - (far ? .08 : 0);
    const fan = w.fan === undefined ? .8 : w.fan;
    for (let j = 0; j < cols.length; j++) {
      const col = far ? dk(cols[j], .3) : cols[j], cnt = w.n - j * 2 - (far ? 1 : 0), fr = w.frac[j];
      c.beginPath();
      for (let i = 0; i < cnt; i++) {
        const u = .1 + .9 * (i / (cnt - 1)), rx = sx + ax * L * u, ry = sy + ay * L * u, k = clamp(fan * u * u, 0, .95);
        const [dx, dy] = norm(nx * (1 - k) + ax * k * 1.1, ny * (1 - k) + ay * k * 1.1);
        feather(c, rx, ry, dx, dy, W * fr * (1 - (w.taper || 0) * u * u) * (.76 + .24 * Math.min(1, u * 1.7)), (L0 / cnt) * (w.hw || .75), (w.tw === undefined ? .8 : w.tw) * .75);
      }
      c.fillStyle = lin(c, sx, sy, sx + (ax * .5 + nx) * W, sy + (ay * .5 + ny) * W, [[0, lt(col, .1)], [1, dk(col, .2)]]); c.fill();
      c.strokeStyle = w.edge && !far ? w.edge : dk(col, .5); c.lineWidth = .014; c.stroke();
    }
    // dækfjer-linse langs armen
    const tx = sx + ax * L * .92, ty = sy + ay * L * .92, mx = (sx + tx) / 2, my = (sy + ty) / 2, cov = W * w.frac[cols.length - 1] * 1.25, lc = far ? dk(cols[cols.length - 1], .3) : cols[cols.length - 1];
    c.beginPath(); c.moveTo(sx - nx * W * .06, sy - ny * W * .06);
    c.quadraticCurveTo(mx - nx * W * .14, my - ny * W * .14, tx, ty);
    c.quadraticCurveTo(mx + nx * cov, my + ny * cov, sx + nx * W * .05, sy + ny * W * .05);
    c.closePath();
    c.fillStyle = lin(c, sx, sy, sx + nx * cov, sy + ny * cov, [[0, lt(lc, .15)], [1, dk(lc, .15)]]); c.fill();
    c.strokeStyle = w.edge && !far ? w.edge : dk(lc, .5); c.lineWidth = .016; c.stroke();
  }

  // ---------- Ben ----------
  function legsSit(c, s, P) {
    const L = s.legs, hip = tfm(P, L.hip[0], L.hip[1]);
    for (const far of [true, false]) {
      const ax = hip[0] + (L.dx || 0) + (far ? L.gap : 0), ay = 1 - L.w * .5, col = far ? dk(L.col, .25) : L.col;
      c.strokeStyle = col; c.lineWidth = L.w; c.beginPath();
      c.moveTo(hip[0] + (far ? L.gap * .5 : 0), hip[1]); c.quadraticCurveTo((hip[0] + ax) / 2 - (L.knee || 0), (hip[1] + ay) / 2, ax, ay); c.stroke();
      foot(c, ax, ay, .1, L.toe, L.spr, L.w * .85, col, L.claw);
    }
  }
  function legsAir(c, s, P) {
    const L = s.legs, atk = P.mode === "atk";
    for (const far of [true, false]) {
      const col = far ? dk(L.col, .25) : L.col, hx = L.hip[0] + (far ? .1 : 0), hy = L.hip[1];
      c.strokeStyle = col; c.lineWidth = L.w;
      if (atk) { // kløerne strakt frem
        const ax = hx + (L.reach || .7) + (far ? .08 : 0), ay = hy + .2;
        c.beginPath(); c.moveTo(hx, hy); c.lineTo(ax, ay); c.stroke();
        foot(c, ax, ay, .35, L.toe * 1.1, .55, L.w * .9, col, L.claw, .3);
      } else if (L.trail) { // lange ben, der slæber bagud
        const ax = hx - .55 - (far ? .1 : 0), ay = hy + .12;
        c.beginPath(); c.moveTo(hx, hy); c.lineTo(ax, ay); c.stroke();
        foot(c, ax, ay, PI - .15, L.toe * .8, .3, L.w * .8, col, L.claw);
      } else { // ben trukket op under maven
        const ax = hx - .12 - (far ? .1 : 0), ay = hy + .2;
        c.beginPath(); c.moveTo(hx, hy); c.lineTo(ax, ay); c.stroke();
        foot(c, ax, ay, 2.5, L.toe * .6, .4, L.w * .8, col, L.claw);
      }
    }
  }
  function thigh(c, s, P) {
    const L = s.legs; if (!L.thigh) return;
    const t = L.thigh, k = P.mode === "sit" ? 1 : .78;
    c.save(); c.translate(L.hip[0] + (t.dx || 0), L.hip[1] + (t.dy || 0)); c.rotate(t.rot || .15); c.scale(k, k);
    c.fillStyle = lin(c, 0, -t.ry, 0, t.ry, [[0, lt(t.col, .1)], [1, dk(t.col, .22)]]);
    c.beginPath(); ell(c, 0, 0, t.rx, t.ry); c.fill();
    c.strokeStyle = dk(t.col, .5); c.lineWidth = .016; c.stroke();
    if (t.bars) {
      c.save(); c.beginPath(); ell(c, 0, 0, t.rx, t.ry); c.clip();
      c.strokeStyle = t.bars; c.lineWidth = t.ry * .16; c.beginPath();
      for (let i = -2; i <= 2; i++) { c.moveTo(-t.rx, i * t.ry * .36); c.lineTo(t.rx, i * t.ry * .36 + t.ry * .1); }
      c.stroke(); c.restore();
    }
    c.restore();
  }

  // ---------- Krop og hoved ----------
  function bodyPath(c, rx, ry) {
    c.beginPath();
    c.moveTo(-rx, ry * .05);
    c.bezierCurveTo(-rx * .55, -ry * 1.3, rx * .75, -ry * 1.15, rx, -ry * .15);
    c.bezierCurveTo(rx * 1.08, ry * .75, rx * .25, ry * 1.25, -rx * .3, ry * .9);
    c.bezierCurveTo(-rx * .7, ry * .7, -rx * .95, ry * .35, -rx, ry * .05);
    c.closePath();
  }
  function drawBody(c, s, P) {
    const B = s.body, rx = B.rx, ry = B.ry;
    bodyPath(c, rx, ry);
    c.fillStyle = lin(c, 0, -ry, 0, ry, [[0, lt(B.back, .06)], [clamp(B.split - .14, 0, 1), B.back], [clamp(B.split + .1, 0, 1), B.belly], [1, dk(B.belly, .15)]]); c.fill();
    if (s.marks) { c.save(); bodyPath(c, rx, ry); c.clip(); s.marks(c, s, P); c.restore(); }
    bodyPath(c, rx, ry);
    c.fillStyle = rad(c, 0, 0, ry * .3, rx * 1.2, [[0, "rgba(255,255,255,.12)"], [.5, "rgba(0,0,0,0)"], [1, "rgba(0,0,0,.3)"]], -rx * .15, -ry * .55); c.fill();
    c.strokeStyle = dk(B.back, .6); c.lineWidth = .02; c.stroke();
  }
  function drawHead(c, s, P) {
    const H = s.head;
    if (H.neck) { // hals mellem krop og hoved
      const [nx, ny, nw] = H.neck, dx = H.x - nx, dy = H.y - ny, ncol = H.neckCol || H.col;
      c.save(); c.translate((nx + H.x) / 2, (ny + H.y) / 2); c.rotate(Math.atan2(dy, dx));
      c.fillStyle = lin(c, 0, -nw, 0, nw, [[0, lt(ncol, .12)], [1, dk(ncol, .25)]]);
      c.beginPath(); ell(c, 0, 0, hyp(dx, dy) / 2 + nw * .35, nw); c.fill();
      c.restore();
    }
    if (s.mane) s.mane(c, s, P);
    // hovedet holdes mere vandret end kroppen
    const keep = P.mode === "sit" ? (H.up === undefined ? .8 : H.up) : P.mode === "atk" ? .5 : 0;
    c.save(); c.translate(H.x + P.hdx, H.y + P.hdy); c.rotate((H.rot || 0) + P.hrot - P.M.tilt * keep);
    if (H.fn) H.fn(c, s, P);
    else {
      if (s.crest) s.crest(c, s, P);
      if (s.beak) beak(c, s, P);
      dome(c, 0, 0, H.r, H.r * (H.sq || 1), H.col);
      if (s.face) s.face(c, s, P);
      eye(c, s.eye, P, P.fierce);
    }
    c.restore();
  }

  function bird(c, s, o, raptor) {
    const P = pose(s, o, raptor), sit = P.mode === "sit", M = P.M;
    c.save(); c.lineJoin = "round"; c.lineCap = "round";
    if (sit) { c.translate(M.ox || 0, 1); c.scale(M.sc, M.sc); c.translate(0, -1); } else { c.translate(M.ox || 0, M.oy || 0); c.scale(M.sc, M.sc); }
    if (sit) legsSit(c, s, P);
    c.save(); c.translate(P.cx, P.cy); c.rotate(P.rot); if (sit) c.scale(1, P.breath);
    if (!sit) wing(c, s, P, true);
    (s.tail.fn || tailFan)(c, s, P);
    drawBody(c, s, P);
    thigh(c, s, P);
    if (!sit) legsAir(c, s, P);
    drawHead(c, s, P);
    if (sit) fold(c, s, P); else wing(c, s, P, false);
    if (s.over) s.over(c, s, P);
    c.restore(); c.restore();
  }

  T.addKind("papegoje", (c, s, o) => bird(c, s, o, false));
  T.addKind("naeb", (c, s, o) => bird(c, s, o, false));
  T.addKind("hoens", (c, s, o) => bird(c, s, o, false));
  T.addKind("fugl", (c, s, o) => bird(c, s, o, false));
  T.addKind("rovfugl", (c, s, o) => bird(c, s, o, true));

  // ======================================================================
  // ARTERNE
  // ======================================================================

  // ---------- Rød ara ----------
  T.look("ara", "papegoje", {
    body: { rx: .74, ry: .5, back: "#d6241c", belly: "#e63d2b", split: .55 },
    head: { x: .62, y: -.52, r: .36, col: "#d9271d", rot: .05, neck: [.2, -.2, .36] },
    eye: { x: .13, y: -.04, r: .08, iris: "#f4eaa4", ring: "#f1e7d8" },
    beak: { x: .2, y: .06, L: .62, H: .46, hook: 1, col: "#ece5d2", lowCol: "#2b2b30", low: .5, shine: true, nostril: false },
    face(c) { // hvid bar hud med fine sorte fjerlinjer
      fillEll(c, .14, .02, .27, .22, "#f6efe3", -.2);
      c.strokeStyle = "rgba(30,20,20,.75)"; c.lineWidth = .016; c.beginPath();
      c.moveTo(-.08, .04); c.quadraticCurveTo(.1, .1, .26, .05);
      c.moveTo(-.04, .14); c.quadraticCurveTo(.12, .19, .24, .14); c.stroke();
    },
    marks(c) { fillEll(c, -.66, -.15, .26, .22, "#3a78dc", -.5); },
    wing: { sh: [.04, -.3], L: 1.3, W: .8, n: 7, sweep: .4, fan: .75, taper: .4, tw: .55, hw: .8, cols: ["#1c58c4", "#f2c515", "#d6241c"], frac: [1, .55, .3],
      fold: { sh: [.1, -.12], len: 1.15, h: .36, rot: .12 } },
    tail: { x: -.62, y: .12, len: 1.3, w: .1, n: 3, spread: .06, col: "#d6241c", tw: .5, sitK: .62,
      stops: [[0, "#d6241c"], [.6, "#cf2a1c"], [.76, "#2b66d0"], [1, "#2255b8"]] },
    legs: { hip: [.05, .34], col: "#6c6a68", w: .075, toe: .22, spr: .4, claw: "#2b2b2e", gap: .14, knee: 0, reach: .6 },
    sit: { cx: -.1, cy: .36, tilt: -.85, sc: .93, ox: -.1 },
    fly: { cx: .35, cy: .1, tilt: -.1, sc: .78, w: 5.2, ox: 0 },
  });

  // ---------- Tokotukan ----------
  T.look("tukan", "naeb", {
    body: { rx: .78, ry: .52, back: "#17181c", belly: "#202126", split: .6 },
    head: { x: .62, y: -.46, r: .34, col: "#17181c", rot: .05, neck: [.25, -.18, .34] },
    eye: { x: .06, y: -.05, r: .075, iris: "#4a2c1c", ring: "#35a6e0" },
    beak: { x: .2, y: -.04, L: 1.2, H: .52, hook: .3, col: "#f1881a", lowCol: "#e9791a", low: .55, shine: true, edge: "#ffe27a",
      zones: [[0, .05, "#16161a"], [.86, 1, "#16161a"]] },
    face(c) { // blå hud om øjet og hvid strube
      fillEll(c, .06, .26, .24, .17, "#f5f2ea", .3);
      fillEll(c, .08, -.04, .17, .15, "#f08a1a");
      fillEll(c, .06, -.05, .16, .14, "#37a6e0");
    },
    marks(c) {
      fillEll(c, .6, -.02, .4, .5, "#f6f3eb");
      fillEll(c, -.72, -.4, .2, .12, "#f3f0e6", -.3);
      fillEll(c, -.74, .42, .24, .13, "#e8402a", .3);
    },
    wing: { sh: [.0, -.3], L: 1.2, W: .75, n: 7, sweep: .45, fan: .6, taper: .25, tw: .75, hw: .85, cols: ["#101116", "#1a1b20", "#26272d"], frac: [1, .6, .32], edge: "#4a4c55",
      fold: { sh: [.1, -.1], len: 1.0, h: .4, rot: .1 } },
    tail: { x: -.64, y: .1, len: .72, w: .15, n: 4, spread: .12, col: "#17181c", tw: .8, sitK: .75 },
    legs: { hip: [.1, .36], col: "#6f8ea6", w: .08, toe: .24, spr: .4, claw: "#1b1b1f", gap: .14, reach: .6 },
    sit: { cx: -.25, cy: .3, tilt: -.5, sc: .96, ox: -.1 },
    fly: { cx: .1, cy: .1, tilt: -.05, sc: .76, w: 6.5, ox: -.1 },
  });

  // ---------- Grå papegøje ----------
  function scallops(c, rows, col) { // lyse fjerkanter i rækker: rows = [[x, y, antal, afstand, radius],...]
    c.strokeStyle = col; c.lineWidth = .02; c.beginPath();
    for (const [x, y, n, dx, r] of rows) for (let i = 0; i < n; i++) { c.moveTo(x + i * dx + r, y); c.arc(x + i * dx, y, r, 0, PI * .95); }
    c.stroke();
  }
  T.look("graa_papegoeje", "papegoje", {
    body: { rx: .68, ry: .5, back: "#8d9299", belly: "#b4b8bd", split: .6 },
    head: { x: .58, y: -.5, r: .34, col: "#9aa0a7", neck: [.2, -.2, .34] },
    eye: { x: .12, y: -.03, r: .072, iris: "#f4e27a", ring: "#f3e4e0", pr: .5 },
    beak: { x: .2, y: .06, L: .5, H: .42, hook: 1, col: "#2d2d33", lowCol: "#1d1d22", low: .5, shine: true },
    face(c) {
      fillEll(c, .14, .0, .27, .21, "#f4e8e4", -.2);
      fillEll(c, .06, .12, .12, .07, "#efc4c4", .2);
      strokeLn(c, "rgba(150,150,160,.55)", .014, [-.04, -.08, .06, -.14, -.06, .02, .08, -.04]);
    },
    marks(c) { scallops(c, [[.1, -.1, 4, .16, .09], [-.05, .06, 5, .16, .09], [.05, .22, 4, .17, .09], [-.3, -.08, 3, .15, .09]], "rgba(235,238,242,.5)"); },
    wing: { sh: [.04, -.3], L: 1.15, W: .78, n: 7, fan: .7, taper: .35, tw: .6, hw: .8, cols: ["#666b73", "#80868e", "#9ea4ab"], frac: [1, .58, .32], edge: "#c4c9ce",
      fold: { sh: [.1, -.12], len: 1.0, h: .36, rot: .1 } },
    tail: { x: -.58, y: .08, len: .66, w: .16, n: 4, spread: .14, col: "#e0201c", tw: .9, sitK: .85 },
    legs: { hip: [.05, .32], col: "#8e8e92", w: .07, toe: .2, spr: .4, claw: "#2b2b2e", gap: .14, reach: .6 },
    sit: { cx: -.1, cy: .36, tilt: -.8, sc: 1.08, ox: -.1 },
    fly: { cx: .3, cy: .05, tilt: -.1, sc: .95, w: 7, ox: 0 },
  });

  // ---------- Halsbåndsparakit ----------
  T.look("parakit", "papegoje", {
    body: { rx: .56, ry: .35, back: "#7cc638", belly: "#a2d84e", split: .6 },
    head: { x: .5, y: -.4, r: .28, col: "#88cf3e", neck: [.15, -.12, .28] },
    eye: { x: .1, y: -.04, r: .062, iris: "#f6e8a0", ring: "#ee3a3a", pr: .5 },
    beak: { x: .14, y: .04, L: .38, H: .3, hook: 1, col: "#e0262a", lowCol: "#b01a20", low: .5, shine: true },
    face(c) {
      c.lineCap = "butt";
      c.strokeStyle = "#ee86a2"; c.lineWidth = .07; c.beginPath(); c.arc(0, 0, .25, 1.35, 2.7); c.stroke();
      c.strokeStyle = "#17171a"; c.lineWidth = .05; c.beginPath(); c.arc(0, 0, .24, .75, 1.45); c.stroke();
      c.lineCap = "round";
    },
    wing: { sh: [.03, -.2], L: 1.0, W: .6, n: 6, fan: .6, taper: .6, tw: .5, hw: .85, cols: ["#2f8030", "#58a838", "#7cc040"], frac: [1, .6, .35],
      fold: { sh: [.08, -.08], len: .85, h: .26, rot: .1 } },
    tail: { x: -.5, y: .1, len: 1.4, w: .07, n: 3, spread: .05, col: "#5fb23e", tw: .5, sitK: .5,
      stops: [[0, "#5fb23e"], [.65, "#3f9a8a"], [.82, "#4aa6a0"], [1, "#d8e46c"]] },
    legs: { hip: [.05, .26], col: "#9a8f88", w: .06, toe: .17, spr: .4, claw: "#2b2b2e", gap: .12, reach: .5 },
    sit: { cx: -.12, cy: .4, tilt: -.8, sc: 1.2, ox: -.1 },
    fly: { cx: .35, cy: .05, tilt: -.1, sc: 1, w: 12, ox: 0 },
  });

  // ---------- Stor blå turako ----------
  T.look("turako", "fugl", {
    body: { rx: .76, ry: .5, back: "#5379a6", belly: "#cbc84c", split: .5 },
    head: { x: .62, y: -.5, r: .3, col: "#5f86b4", neck: [.25, -.2, .3] },
    eye: { x: .1, y: -.04, r: .068, iris: "#8e2a1a", ring: "#101418", pr: .5 },
    beak: { x: .18, y: .02, L: .52, H: .4, hook: .5, col: "#f2d21c", lowCol: "#e8c01a", low: .55, zones: [[.8, 1, "#e4301c"]], shine: true },
    crest(c, s, P) { // stive fjer med sorte spidser
      const base = [[-.2, -.15, -.55, -.5, .05], [-.12, -.22, -.4, -.68, .05], [-.02, -.26, -.12, -.76, .05], [.08, -.26, .18, -.7, .045], [.15, -.2, .34, -.58, .04]];
      spikes(c, base, "#6c92bc", "#2c4a70", P.t);
      spikes(c, base.map((p) => [p[0] + (p[2] - p[0]) * .62, p[1] + (p[3] - p[1]) * .62, p[2], p[3], p[4] * .55]), "#14181c", null, P.t);
    },
    face(c) { fillEll(c, .1, -.04, .13, .115, "#101418"); strokeLn(c, "#101418", .04, [.0, -.06, -.2, -.1]); },
    marks(c) { fillEll(c, .5, .1, .34, .34, "#a8c050"); fillEll(c, -.15, .42, .45, .14, "#a8532a"); },
    wing: { sh: [.0, -.3], L: 1.0, W: .85, n: 7, fan: .5, taper: .1, tw: 1, hw: .9, cols: ["#26426e", "#3c6296", "#5f86b4"], frac: [1, .6, .34],
      fold: { sh: [.1, -.1], len: 1.05, h: .42, rot: .12 } },
    tail: { x: -.6, y: .1, len: 1.5, w: .17, n: 5, spread: .1, col: "#2c5a82", tw: .95, sitK: .72,
      stops: [[0, "#2d6a8a"], [.5, "#2a4f86"], [1, "#23407a"]], bands: [{ f: .76, w: .14, col: "#0e1218" }, { f: .98, w: .1, col: "#c9d6dd" }] },
    legs: { hip: [.05, .36], col: "#4a4a50", w: .08, toe: .24, spr: .4, claw: "#1b1b1f", gap: .14, reach: .6 },
    sit: { cx: -.2, cy: .32, tilt: -.7, sc: .85, ox: -.15 },
    fly: { cx: .3, cy: .1, tilt: -.1, sc: .74, w: 5.2, ox: -.1 },
  });

  // ---------- Næsehornsfugl ----------
  T.look("naesehornsfugl", "naeb", {
    body: { rx: .85, ry: .56, back: "#18181d", belly: "#f2efe6", split: .6 },
    head: { x: .74, y: -.5, r: .33, col: "#1a1a20", neck: [.3, -.2, .34] },
    eye: { x: .08, y: -.06, r: .07, iris: "#d02a1a", ring: "#101014", pr: .45 },
    beak: { x: .2, y: -.02, L: 1.0, H: .5, hook: .35, col: "#f0c030", lowCol: "#e8a020", low: .5, shine: true, edge: "#ffe08a",
      extra(c, b) { // det oprejste, bøjede horn (casque)
        const L = b.L, H = b.H;
        c.beginPath(); c.moveTo(L * .02, -H * .42);
        c.bezierCurveTo(-L * .04, -H * 1.4, L * .4, -H * 1.95, L * .9, -H * 1.85);
        c.bezierCurveTo(L * .52, -H * 1.35, L * .74, -H * .95, L * .72, -H * .4);
        c.closePath();
        c.fillStyle = lin(c, 0, -H * 1.9, L * .5, -H * .4, [[0, "#f27a2a"], [1, "#d63a1a"]]); c.fill();
        c.strokeStyle = "#8a2410"; c.lineWidth = .022; c.stroke();
        c.strokeStyle = "rgba(255,230,160,.55)"; c.lineWidth = .03; c.beginPath(); c.moveTo(L * .1, -H * .9); c.quadraticCurveTo(L * .2, -H * 1.55, L * .6, -H * 1.75); c.stroke();
      } },
    marks(c) { fillEll(c, -.1, .52, .8, .2, "#f4f1e8"); },
    wing: { sh: [.05, -.32], L: 1.35, W: .9, n: 8, fan: .55, taper: .2, tw: .85, hw: .85, cols: ["#14141a", "#1e1e25", "#2a2a33"], frac: [1, .6, .32], edge: "#55555f",
      fold: { sh: [.15, -.1], len: 1.15, h: .46, rot: .08 } },
    tail: { x: -.72, y: .1, len: 1.05, w: .17, n: 5, spread: .08, col: "#f4f1e8", tw: .9, sitK: .75, bands: [{ f: .7, w: .2, col: "#17171c" }] },
    legs: { hip: [.1, .4], col: "#3a3a40", w: .09, toe: .26, spr: .4, claw: "#18181c", gap: .15, reach: .6 },
    sit: { cx: -.3, cy: .3, tilt: -.45, sc: .76, ox: -.15 },
    fly: { cx: .1, cy: .1, tilt: -.05, sc: .68, w: 4.5, ox: -.1 },
  });

  // ---------- Påfugl ----------
  function peacockTrain(c, s, P) {
    const t = P.t, sit = P.mode === "sit", n = 13, x0 = -.45, y0 = 0;
    const lift = .5 + .5 * sin(t * .7);
    const top = sit ? PI - .05 - lift * .3 : PI - .1, bot = sit ? PI + .62 : PI + .4;
    const ends = [];
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), a = top + (bot - top) * u + sin(t * .9 + i * .5) * .02;
      const len = (sit ? 2.1 : 1.8) * (.74 + .26 * ((i * 7) % 5) / 4);
      const ex = x0 + cos(a) * len, ey = y0 + sin(a) * len, mx = x0 + cos(a) * len * .55, my = y0 + sin(a) * len * .55 - .16 * len;
      const [dx, dy] = norm(ex - x0, ey - y0), qx = -dy * .17, qy = dx * .17;
      c.moveTo(x0, y0); c.quadraticCurveTo(mx + qx, my + qy, ex, ey); c.quadraticCurveTo(mx - qx, my - qy, x0, y0);
      ends.push([ex, ey, mx, my, Math.atan2(ey - my, ex - mx)]);
    }
    c.fillStyle = lin(c, x0, y0, x0 - 1.8, y0 + .5, [[0, "#1d6a3c"], [.6, "#3f9a4a"], [1, "#7cc050"]]); c.fill();
    c.strokeStyle = "#caa43a"; c.lineWidth = .016; c.stroke();
    c.beginPath(); for (const e of ends) { c.moveTo(x0, y0); c.quadraticCurveTo(e[2], e[3], e[0], e[1]); }
    c.strokeStyle = "#235a30"; c.lineWidth = .014; c.stroke();
    for (const [col, k] of [["#d6a226", 1], ["#2a6ed2", .72], ["#0e4a58", .4]]) {
      c.fillStyle = col; c.beginPath();
      for (const e of ends) ell(c, e[0], e[1], .12 * k, .17 * k, e[4] + PI / 2);
      c.fill();
    }
  }
  T.look("paafugl", "hoens", {
    body: { rx: .66, ry: .44, back: "#2f8f58", belly: "#1c46a8", split: .42 },
    head: { x: 1.0, y: -1.0, r: .2, col: "#2060d2", neck: [.45, -.2, .15], neckCol: "#1a58c6", up: .9 },
    eye: { x: .03, y: -.02, r: .048, iris: "#2a1a10", pr: .6 },
    beak: { x: .08, y: .02, L: .27, H: .17, hook: .3, col: "#a89a86", lowCol: "#8a7a68", low: .5 },
    crest(c, s, P) { // lille krone af fine fjer
      c.strokeStyle = "#17448e"; c.lineWidth = .014; c.beginPath();
      const tips = [];
      for (let i = 0; i < 7; i++) {
        const a = -2.35 + i * .3 + sin(P.t * 2 + i) * .04, x = -.04 + i * .012, tx = x + cos(a) * .3, ty = -.14 + sin(a) * .3;
        c.moveTo(x, -.14); c.lineTo(tx, ty); tips.push([tx, ty]);
      }
      c.stroke(); c.fillStyle = "#2fb0b8"; c.beginPath(); for (const p of tips) ell(c, p[0], p[1], .042, .036); c.fill();
    },
    face(c) { fillEll(c, .0, -.09, .1, .028, "#f6f6f6", -.1); fillEll(c, -.01, .07, .1, .03, "#f6f6f6", .1); },
    marks(c) { fillEll(c, .56, .05, .34, .42, "#1b56c4"); fillEll(c, -.1, -.34, .55, .2, "#4aa860"); },
    wing: { sh: [.05, -.3], L: 1.0, W: .8, n: 7, fan: .5, taper: .2, tw: .9, hw: .85, cols: ["#6a4a24", "#c8923a", "#3a8a50"], frac: [1, .6, .34],
      fold: { sh: [.1, -.12], len: .85, h: .34, rot: .12 } },
    tail: { fn: peacockTrain, x: -.45, y: 0, len: 1, w: .1, n: 3, spread: .1, col: "#2f8f58" },
    legs: { hip: [.0, .4], col: "#8f857a", w: .06, toe: .26, spr: .3, claw: "#3a342e", gap: .16, reach: .6, knee: .05 },
    sit: { cx: -.15, cy: .0, tilt: -.3, sc: .66, ox: .4 },
    fly: { cx: .35, cy: .1, tilt: -.05, sc: .7, w: 6, ox: .1 },
  });

  // ---------- Ceylonsk junglehøne ----------
  function sickles(c, s, P) { // buet, mørk-lilla hale
    const t = P.t, x0 = -.7, y0 = -.15;
    const defs = [[.5, 1.45, .12, 0], [.8, 1.3, .11, 1], [1.1, 1.1, .1, 2], [.2, .9, .1, 3]];
    for (const [lift, len, w, k] of defs) {
      const sw = sin(t * 1.2 + k) * .05, f = P.mode === "sit" ? 1 : .6;
      const p = [x0, y0, x0 - .3 * len, y0 - lift * .8 * f, x0 - .9 * len, y0 - lift * .9 * f + sw, x0 - 1.15 * len, y0 + lift * .35 + sw * 2];
      c.beginPath(); ribbon(c, p, w * .6, w);
      c.fillStyle = lin(c, x0, y0 - 1, x0 - 1.2, y0 + .3, [[0, "#4a58b8"], [.5, "#2a2a78"], [1, "#1a1a4a"]]); c.fill();
      c.strokeStyle = "#0e0e30"; c.lineWidth = .016; c.stroke();
    }
  }
  T.look("junglehoene", "hoens", {
    body: { rx: .8, ry: .52, back: "#a43a1a", belly: "#6a2814", split: .52 },
    head: { x: .78, y: -.66, r: .25, col: "#d62a1e", neck: [.35, -.28, .26], neckCol: "#e89a1c", up: .6 },
    eye: { x: .05, y: -.04, r: .056, iris: "#e8a020", pr: .5 },
    beak: { x: .12, y: .04, L: .32, H: .22, hook: .5, col: "#e8b84a", lowCol: "#d8a438", low: .5 },
    crest(c) { // rød kam med gul midte
      c.fillStyle = "#e02818"; c.beginPath(); c.moveTo(-.2, -.1);
      c.quadraticCurveTo(-.2, -.44, -.12, -.34); c.quadraticCurveTo(-.1, -.5, -.02, -.38);
      c.quadraticCurveTo(.02, -.52, .08, -.34); c.quadraticCurveTo(.16, -.42, .16, -.12); c.closePath(); c.fill();
      c.strokeStyle = "#8a140e"; c.lineWidth = .016; c.stroke();
      fillEll(c, -.02, -.27, .08, .07, "#f6d02c");
    },
    face(c) { fillEll(c, .1, .2, .05, .09, "#c81c16"); },
    mane(c) {
      spikes(c, [[.5, -.5, .0, -.05, .13], [.55, -.4, .15, .12, .13], [.58, -.3, .3, .3, .12], [.42, -.55, -.12, -.22, .12], [.3, -.5, -.25, -.32, .1]], "#f0a41c", "#a8680e");
      spikes(c, [[.5, -.45, .1, -.02, .04], [.55, -.35, .2, .15, .04], [.4, -.5, -.05, -.18, .04]], "#ffd75a");
    },
    marks(c) { fillEll(c, -.1, -.2, .5, .22, "#c04a1a", -.1); },
    wing: { sh: [.0, -.25], L: 1.05, W: .75, n: 7, fan: .6, taper: .3, tw: .8, hw: .8, cols: ["#3a2012", "#7a3418", "#c0561e"], frac: [1, .6, .35],
      fold: { sh: [.15, -.1], len: 1.1, h: .42, rot: .06 } },
    tail: { fn: sickles, x: -.7, y: -.15, len: 1, w: .1, n: 3, spread: .1, col: "#2a2a78" },
    legs: { hip: [.1, .38], col: "#d4bd62", w: .08, toe: .3, spr: .32, claw: "#3a3a3a", gap: .16, reach: .6, knee: .06 },
    sit: { cx: -.05, cy: .12, tilt: -.25, sc: .78, ox: .2 },
    fly: { cx: .2, cy: .1, tilt: -.05, sc: .78, w: 8, ox: .1 },
  });

  // ---------- Quetzal ----------
  function quetzalTail(c, s, P) {
    const t = P.t, sit = P.mode === "sit", x0 = -.5, y0 = .12;
    tailFan(c, { body: s.body, tail: s.tail.base }, P);
    const g = [sin(P.rot), cos(P.rot)], gA = Math.atan2(g[1], g[0]);
    const defs = sit ? [[1.15, .09, 0], [.95, .08, 1.5], [.75, .07, 3]] : [[1.7, .1, 0], [1.45, .09, 1.5], [1.1, .08, 3]];
    for (const [len, w, k] of defs) {
      const a = sit ? gA + .45 : PI + .12, dx = cos(a), dy = sin(a), px = -dy, py = dx, wv = (sit ? .1 : .16) * len;
      const w1 = sin(t * 1.3 + k) * wv, w2 = sin(t * 1.3 + k - 1) * wv * 1.3, w3 = sin(t * 1.3 + k - 2) * wv * 1.6;
      const p = [x0, y0, x0 + dx * len * .33 + px * w1, y0 + dy * len * .33 + py * w1, x0 + dx * len * .66 + px * w2, y0 + dy * len * .66 + py * w2, x0 + dx * len + px * w3, y0 + dy * len + py * w3];
      c.beginPath(); ribbon(c, p, w * .6, w);
      c.fillStyle = lin(c, x0, y0, p[6], p[7], [[0, "#0a8a5a"], [.5, "#18b878"], [1, "#46d49a"]]); c.fill();
      c.strokeStyle = "#065a3c"; c.lineWidth = .016; c.stroke();
    }
  }
  T.look("quetzal", "fugl", {
    body: { rx: .62, ry: .46, back: "#0ea46a", belly: "#d6202a", split: .42 },
    head: { x: .52, y: -.5, r: .3, col: "#10a064", neck: [.2, -.2, .34] },
    eye: { x: .09, y: -.03, r: .06, iris: "#2a1a10", pr: .62 },
    beak: { x: .14, y: .06, L: .27, H: .2, hook: .3, col: "#f2c82a", lowCol: "#e0b420", low: .5 },
    crest(c) { dome(c, -.06, -.14, .3, .32, "#12b06e"); },
    face(c) { fillEll(c, -.1, -.2, .16, .08, "rgba(255,255,255,.18)", -.4); },
    marks(c) { fillEll(c, .5, .14, .3, .42, "#d6202a"); },
    wing: { sh: [.0, -.28], L: 1.0, W: .8, n: 7, fan: .55, taper: .25, tw: .85, hw: .85, cols: ["#0b6a48", "#0f9a66", "#1cc080"], frac: [1, .6, .34],
      fold: { sh: [.08, -.1], len: .95, h: .38, rot: .12 } },
    tail: { fn: quetzalTail, base: { x: -.5, y: .1, len: .7, w: .12, n: 5, spread: .12, col: "#f4f4f0", tw: .9, sitK: .8, bands: [{ f: .5, w: .12, col: "#2a3a3a" }] } },
    legs: { hip: [.05, .34], col: "#b8776a", w: .07, toe: .2, spr: .4, claw: "#3a2a2a", gap: .14, reach: .6 },
    sit: { cx: -.15, cy: .38, tilt: -.75, sc: .85, ox: .1 },
    fly: { cx: .3, cy: .05, tilt: -.1, sc: .8, w: 6, ox: .1 },
  });

  // ======================================================================
  // ROVFUGLENE
  // ======================================================================
  const HORN = "#454b53", CERE = "#f0c53a";
  function dots(c, pts, r, col) { c.fillStyle = col; c.beginPath(); for (const p of pts) { c.moveTo(p[0] + r, p[1]); c.arc(p[0], p[1], r, 0, TAU); } c.fill(); }
  function hbars(c, x0, x1, y0, y1, n, col, lw) { // vandrette bånd (let buede) over maven
    c.strokeStyle = col; c.lineWidth = lw; c.beginPath();
    for (let i = 0; i < n; i++) { const y = y0 + (y1 - y0) * i / (n - 1); c.moveTo(x0, y); c.quadraticCurveTo((x0 + x1) / 2, y + .08, x1, y - .02); }
    c.stroke();
  }
  const rBeak = (L, H, col) => ({ x: .2, y: .04, L, H, hook: 1, col: col || HORN, lowCol: "#2f343a", low: .5, zones: [[0, .22, CERE]], nostril: true, open: 1 });

  // ---------- Harpyørn ----------
  T.look("harpyoern", "rovfugl", {
    body: { rx: .82, ry: .56, back: "#4e555d", belly: "#efefea", split: .5 },
    head: { x: .66, y: -.52, r: .33, col: "#7f8790", neck: [.25, -.2, .36], up: .85 },
    eye: { x: .12, y: -.06, r: .08, iris: "#3a2418", pr: .55 },
    beak: rBeak(.52, .47),
    crest(c, s, P) { spikes(c, [[-.12, -.22, -.55, -.8, .07], [.0, -.27, -.3, -.92, .07], [-.2, -.12, -.62, -.5, .06]], "#6a727b", "#2c3238", P.t); },
    face(c) { fillEll(c, .0, .1, .27, .2, "#99a1a9", .1); },
    marks(c) { fillEll(c, .62, -.2, .26, .42, "#1d2024", .2); },
    wing: { sh: [.08, -.35], L: 1.3, W: 1.05, n: 8, fan: .95, taper: .1, tw: .9, hw: .85, cols: ["#2d3238", "#444b53", "#5f6770"], frac: [1, .6, .34], edge: "#161a1d",
      fold: { sh: [.15, -.12], len: 1.2, h: .5, rot: .1 } },
    tail: { x: -.72, y: .08, len: 1.05, w: .16, n: 5, spread: .09, col: "#586069", tw: .9, sitK: .65,
      bands: [{ f: .35, w: .1, col: "#1e2226" }, { f: .62, w: .1, col: "#1e2226" }, { f: .92, w: .14, col: "#1e2226" }] },
    legs: { hip: [.12, .42], col: "#d4c46a", w: .12, toe: .5, spr: .45, claw: "#14171a", gap: .16, reach: .75, thigh: { col: "#dcdcd8", rx: .3, ry: .36, bars: "#8a9096" } },
    sit: { cx: -.2, cy: .28, tilt: -.95, sc: .85, ox: -.05 },
    fly: { cx: .2, cy: .1, tilt: -.05, sc: .66, w: 4.3, ox: 0 },
    atk: { cx: .1, cy: .05, tilt: .6, sc: .68, ox: 0 },
  });

  // ---------- Kroneørn ----------
  T.look("kronoern", "rovfugl", {
    body: { rx: .8, ry: .56, back: "#3b2c24", belly: "#efe6d4", split: .46 },
    head: { x: .65, y: -.5, r: .32, col: "#5a4638", neck: [.25, -.2, .36], neckCol: "#4a382c", up: .85 },
    eye: { x: .12, y: -.06, r: .08, iris: "#e8a020", pr: .45 },
    beak: rBeak(.5, .46),
    crest(c, s, P) { spikes(c, [[-.15, -.22, -.42, -.58, .07], [-.03, -.28, -.2, -.68, .07], [.07, -.3, .0, -.68, .06]], "#2e2018", "#140e0a", P.t); },
    marks(c) {
      fillEll(c, .5, -.05, .4, .42, "#bf7a38");
      dots(c, [[.45, -.1], [.6, .02], [.35, .06], [.5, .18], [.2, .2], [.05, .3], [-.15, .26], [-.3, .35], [.3, .34], [.1, .1]], .045, "#2a1a12");
      hbars(c, -.4, .2, .3, .5, 3, "#3a2c24", .035);
    },
    wing: { sh: [.05, -.36], L: 1.05, W: 1.1, n: 7, fan: .9, taper: 0, tw: .95, hw: .85, cols: ["#2a1f19", "#3e2e24", "#5a4436"], frac: [1, .6, .34], edge: "#120c08",
      fold: { sh: [.15, -.12], len: 1.05, h: .52, rot: .1 } },
    tail: { x: -.7, y: .08, len: .95, w: .17, n: 5, spread: .09, col: "#3a2c24", tw: .95, sitK: .75,
      bands: [{ f: .42, w: .1, col: "#cfc3b0" }, { f: .72, w: .1, col: "#cfc3b0" }] },
    legs: { hip: [.12, .42], col: "#f0c830", w: .14, toe: .5, spr: .45, claw: "#1a1410", gap: .16, reach: .75, thigh: { col: "#efe6d4", rx: .3, ry: .36, bars: "#2a2220" } },
    sit: { cx: -.2, cy: .28, tilt: -.95, sc: .85, ox: -.05 },
        fly: { cx: .2, cy: .1, tilt: -.05, sc: .67, w: 4.6, ox: 0 },
    atk: { cx: .1, cy: .05, tilt: .6, sc: .68, ox: 0 },
  });

  // ---------- Slangeørn ----------
  T.look("slangeoern", "rovfugl", {
    body: { rx: .78, ry: .52, back: "#7a5638", belly: "#cfa56a", split: .45 },
    head: { x: .64, y: -.5, r: .31, col: "#5a4030", neck: [.25, -.2, .34], up: .85 },
    eye: { x: .12, y: -.06, r: .08, iris: "#f4d23a", pr: .42 },
    beak: rBeak(.46, .42, "#5a5d62"),
    crest(c, s, P) {
      const base = [[-.2, -.15, -.62, -.4, .09], [-.12, -.22, -.52, -.64, .09], [-.02, -.26, -.3, -.74, .08]];
      spikes(c, base, "#26211e", "#0e0c0a", P.t);
      spikes(c, base.map((p) => [p[0] + (p[2] - p[0]) * .58, p[1] + (p[3] - p[1]) * .58, p[2], p[3], p[4] * .6]), "#f2eee4", null, P.t);
    },
    face(c) { fillEll(c, .13, -.02, .2, .15, "#f2c628"); },
    marks(c) { dots(c, [[.55, -.2], [.65, 0], [.4, -.05], [.5, .2], [.25, .15], [.15, .35], [.0, .2], [-.2, .3], [.35, .38], [-.4, .35], [.1, -.1]], .05, "#f6f0e2"); },
    wing: { sh: [.05, -.34], L: 1.15, W: .95, n: 7, fan: .85, taper: .1, tw: .9, hw: .85, cols: ["#4a3424", "#6a4a30", "#8a6440"], frac: [1, .6, .34], edge: "#1c120a",
      fold: { sh: [.15, -.12], len: 1.1, h: .48, rot: .1 } },
    tail: { x: -.7, y: .08, len: 1.0, w: .15, n: 5, spread: .08, col: "#3a2c22", tw: .9, sitK: .75,
      bands: [{ f: .4, w: .14, col: "#ece6d8" }, { f: .92, w: .1, col: "#ece6d8" }] },
    legs: { hip: [.12, .42], col: "#f0d040", w: .11, toe: .44, spr: .45, claw: "#1a1410", gap: .16, reach: .7, thigh: { col: "#a0784a", rx: .27, ry: .32 } },
    sit: { cx: -.2, cy: .28, tilt: -.95, sc: .85, ox: -.05 },
        fly: { cx: .2, cy: .1, tilt: -.05, sc: .68, w: 4.6, ox: 0 },
    atk: { cx: .1, cy: .05, tilt: .6, sc: .68, ox: 0 },
  });

  // ---------- Bengalsk ørneugle ----------
  function owlHead(c, s, P) {
    const t = P.t;
    spikes(c, [[-.3, -.3, -.46, -.98, .11], [.3, -.3, .46, -.98, .11]], "#6a3e1c", "#2a1608", t);
    spikes(c, [[-.3, -.3, -.4, -.8, .045], [.3, -.3, .4, -.8, .045]], "#d89a50", null, t);
    dome(c, 0, 0, .56, .46, "#b87430");
    c.fillStyle = "#e0b472"; c.beginPath(); ell(c, -.24, .05, .31, .31); ell(c, .24, .05, .31, .31); c.fill();
    c.strokeStyle = "#6a3e1c"; c.lineWidth = .028; c.stroke();
    strokeLn(c, "#5a3418", .03, [-.05, -.34, -.03, -.16, .05, -.34, .03, -.16, 0, -.4, 0, -.2]);
    // næbbet sidder mellem øjnene
    c.fillStyle = "#cdb878"; c.strokeStyle = "#5a4a2a"; c.lineWidth = .02;
    c.beginPath(); c.moveTo(-.08, .06); c.quadraticCurveTo(0, .0, .08, .06); c.quadraticCurveTo(.06, .2, 0, .3); c.quadraticCurveTo(-.06, .2, -.08, .06); c.closePath(); c.fill(); c.stroke();
    if (P.open > .02) { c.fillStyle = "#6c1f2c"; c.beginPath(); ell(c, 0, .3, .08, .05 + P.open * .05); c.fill(); }
    for (const sg of [1, -1]) { c.save(); c.scale(sg, 1); eye(c, { x: -.24, y: -.02, r: .19, iris: "#f58a14", pupil: "#0a0806", pr: .5, brow: "#2a1608", bw: .42, bl: .75 }, P, true); c.restore(); }
  }
  T.look("ornoeugle", "rovfugl", {
    body: { rx: .72, ry: .56, back: "#a8662a", belly: "#dca868", split: .4 },
    head: { x: .38, y: -.6, r: .5, col: "#b87430", fn: owlHead, up: 1 },
    marks(c) {
      c.strokeStyle = "#4a2810"; c.lineWidth = .035; c.beginPath();
      for (const [x, y] of [[.5, -.2], [.4, -.05], [.55, .05], [.3, .1], [.15, .0], [.2, .25], [0, .2], [-.15, .1], [.4, .3], [-.1, .35], [-.3, .22]]) { c.moveTo(x, y - .08); c.lineTo(x - .01, y + .1); }
      c.stroke();
    },
    wing: { sh: [.0, -.3], L: 1.1, W: 1.1, n: 7, fan: .55, taper: 0, tw: 1.1, hw: 1, cols: ["#5a3418", "#8a5428", "#c08040"], frac: [1, .6, .34], edge: "#2a1608",
      fold: { sh: [.1, -.1], len: 1.0, h: .5, rot: .08 } },
    tail: { x: -.65, y: .08, len: .75, w: .17, n: 5, spread: .1, col: "#8a5a2c", tw: 1.1, sitK: .8,
      bands: [{ f: .4, w: .1, col: "#3a2210" }, { f: .75, w: .1, col: "#3a2210" }] },
    legs: { hip: [.1, .4], col: "#e9c35a", w: .13, toe: .38, spr: .4, claw: "#1c1612", gap: .16, reach: .7, thigh: { col: "#d9a45e", rx: .32, ry: .42, bars: "#7a4a20" } },
    sit: { cx: -.15, cy: .26, tilt: -1.0, sc: .82, ox: -.05 },
    fly: { cx: .15, cy: .1, tilt: -.05, sc: .7, w: 4, ox: 0 },
    atk: { cx: .05, cy: .05, tilt: .55, sc: .66, ox: 0 },
  });

  // ---------- Ceylonsk høgeørn ----------
  T.look("hoegeoern", "rovfugl", {
    body: { rx: .78, ry: .5, back: "#5c4030", belly: "#eee2cc", split: .45 },
    head: { x: .64, y: -.5, r: .31, col: "#3e2c22", neck: [.25, -.2, .34], up: .85 },
    eye: { x: .12, y: -.06, r: .078, iris: "#e0a228", pr: .45 },
    beak: rBeak(.48, .43),
    crest(c, s, P) { spikes(c, [[-.15, -.2, -.64, -.55, .06], [-.05, -.26, -.52, -.74, .06], [.05, -.28, -.3, -.84, .055]], "#2a1e18", "#0e0a08", P.t); },
    marks(c) { hbars(c, -.5, .5, .0, .45, 5, "#7a5a3c", .045); strokeLn(c, "#6a4a30", .04, [.55, -.2, .5, .0, .4, -.28, .38, -.05]); },
    wing: { sh: [.05, -.34], L: 1.25, W: .95, n: 8, fan: .85, taper: .1, tw: .9, hw: .85, cols: ["#3a2a20", "#5a4030", "#7a5a44"], frac: [1, .6, .34], edge: "#150e0a",
      fold: { sh: [.15, -.12], len: 1.15, h: .46, rot: .1 } },
    tail: { x: -.7, y: .08, len: 1.05, w: .15, n: 5, spread: .08, col: "#6a5240", tw: .9, sitK: .75,
      bands: [{ f: .35, w: .08, col: "#2a2018" }, { f: .6, w: .08, col: "#2a2018" }, { f: .92, w: .14, col: "#2a2018" }] },
    legs: { hip: [.12, .42], col: "#e8d050", w: .11, toe: .45, spr: .45, claw: "#1a1410", gap: .16, reach: .72, thigh: { col: "#eee2cc", rx: .28, ry: .34, bars: "#6a4a30" } },
    sit: { cx: -.2, cy: .28, tilt: -.95, sc: .85, ox: -.05 },
        fly: { cx: .2, cy: .1, tilt: -.05, sc: .67, w: 4.6, ox: 0 },
    atk: { cx: .1, cy: .05, tilt: .6, sc: .68, ox: 0 },
  });

  // ---------- Madagaskar-hønsehøg ----------
  T.look("mad_hoenshoeg", "rovfugl", {
    body: { rx: .76, ry: .4, back: "#5a5a52", belly: "#ecebe6", split: .4 },
    head: { x: .62, y: -.42, r: .27, col: "#6a6a62", neck: [.22, -.15, .28], up: .85 },
    eye: { x: .11, y: -.05, r: .07, iris: "#f2d030", pr: .42 },
    beak: rBeak(.4, .36),
    marks(c) { hbars(c, -.55, .55, -.02, .38, 7, "#9a9a98", .03); },
    wing: { sh: [.05, -.26], L: 1.05, W: .82, n: 7, fan: .6, taper: .2, tw: .9, hw: .85, cols: ["#3e3e38", "#58584f", "#74746a"], frac: [1, .6, .34], edge: "#17170f",
      fold: { sh: [.12, -.1], len: 1.0, h: .36, rot: .08 } },
    tail: { x: -.66, y: .06, len: 1.4, w: .12, n: 4, spread: .05, col: "#6a665a", tw: .9, sitK: .7,
      bands: [{ f: .28, w: .07, col: "#2e2c28" }, { f: .48, w: .07, col: "#2e2c28" }, { f: .68, w: .07, col: "#2e2c28" }, { f: .88, w: .09, col: "#2e2c28" }] },
    legs: { hip: [.1, .3], col: "#f0d44a", w: .08, toe: .36, spr: .4, claw: "#1a1410", gap: .16, reach: .75, trail: true, thigh: { col: "#ecebe6", rx: .22, ry: .26 } },
    sit: { cx: -.15, cy: .1, tilt: -.8, sc: .95, ox: -.05 },
    fly: { cx: .3, cy: .1, tilt: -.05, sc: .7, w: 5, ox: 0 },
    atk: { cx: .1, cy: .05, tilt: .55, sc: .74, ox: 0 },
  });

  // ---------- Prydhøgeørn ----------
  T.look("prydhoegeoern", "rovfugl", {
    body: { rx: .78, ry: .54, back: "#3a2c26", belly: "#f0ece2", split: .5 },
    head: { x: .64, y: -.5, r: .31, col: "#f0ebe0", neck: [.25, -.2, .34], neckCol: "#b4552a", up: .85 },
    eye: { x: .12, y: -.04, r: .078, iris: "#e8a020", pr: .45 },
    beak: rBeak(.48, .43),
    crest(c, s, P) {
      const base = [[-.15, -.2, -.5, -.85, .065], [-.03, -.27, -.3, -.98, .065], [.08, -.28, .0, -.9, .06]];
      spikes(c, base, "#17151a", "#000", P.t);
      spikes(c, base.map((p) => [p[0] + (p[2] - p[0]) * .6, p[1] + (p[3] - p[1]) * .6, p[2], p[3], p[4] * .6]), "#f4f0e6", null, P.t);
    },
    face(c) {
      c.fillStyle = "#17151a"; c.beginPath(); c.moveTo(-.3, -.05); c.quadraticCurveTo(-.2, -.36, .12, -.3); c.quadraticCurveTo(.0, -.14, -.05, -.1); c.quadraticCurveTo(-.2, -.1, -.3, -.05); c.fill();
      strokeLn(c, "#17151a", .04, [.18, .1, .06, .28]);
    },
    marks(c) { fillEll(c, .52, -.1, .38, .4, "#b4552a"); hbars(c, -.5, .3, .22, .5, 4, "#17151a", .04); },
    wing: { sh: [.05, -.35], L: 1.15, W: 1.0, n: 7, fan: .85, taper: .1, tw: .9, hw: .85, cols: ["#241d1a", "#3e322c", "#5e4a3e"], frac: [1, .6, .34], edge: "#0c0806",
      fold: { sh: [.15, -.12], len: 1.1, h: .5, rot: .1 } },
    tail: { x: -.7, y: .08, len: 1.0, w: .16, n: 5, spread: .08, col: "#4a3c34", tw: .9, sitK: .75,
      bands: [{ f: .3, w: .09, col: "#e8e0d0" }, { f: .6, w: .09, col: "#e8e0d0" }, { f: .9, w: .1, col: "#e8e0d0" }] },
    legs: { hip: [.12, .42], col: "#f0c830", w: .14, toe: .5, spr: .45, claw: "#1a1410", gap: .16, reach: .75, thigh: { col: "#f0ece2", rx: .3, ry: .36, bars: "#2a2220" } },
    sit: { cx: -.2, cy: .28, tilt: -.95, sc: .85, ox: -.05 },
    fly: { cx: .2, cy: .1, tilt: -.05, sc: .67, w: 4.6, ox: 0 },
    atk: { cx: .1, cy: .05, tilt: .6, sc: .68, ox: 0 },
  });
})();
