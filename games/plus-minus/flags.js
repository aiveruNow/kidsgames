// Flag til Talbasket: 29 landeflag som inline SVG i en 60 x 40 boks (3:2).
// Kun simple former, ingen id'er, defs, clipPath eller tekst, så samme flag kan indsættes mange gange på én side.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.TalbasketFlag = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var W = "#fff";
  var ORDER = ["dk", "gb", "fr", "it", "gr", "eg", "ke", "za", "ma", "mg", "in", "cn", "jp", "th", "lk", "us", "ca", "mx", "gl", "cr", "br", "ar", "pe", "co", "cl", "au", "nz", "fj", "pg"];

  function n(v) { return String(+v.toFixed(2)); }
  function rect(x, y, w, h, fill) {
    return "<rect" + (x ? ' x="' + n(x) + '"' : "") + (y ? ' y="' + n(y) + '"' : "") + ' width="' + n(w) + '" height="' + n(h) + '" fill="' + fill + '"/>';
  }
  function path(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '"' + (extra ? " " + extra : "") + "/>"; }
  function poly(pts, fill) { return '<polygon points="' + pts + '" fill="' + fill + '"/>'; }
  function circle(cx, cy, r, fill, extra) { return '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '" fill="' + fill + '"' + (extra ? " " + extra : "") + "/>"; }
  function burst(cx, cy, R, fill, points, ratio, rot) {
    var pts = [], i, a, r;
    for (i = 0; i < points * 2; i++) {
      a = ((rot || 0) + i * 180 / points) * Math.PI / 180;
      r = i % 2 ? R * ratio : R;
      pts.push(n(cx + r * Math.sin(a)) + "," + n(cy - r * Math.cos(a)));
    }
    return poly(pts.join(" "), fill);
  }
  // Femtakket stjerne; rotation i grader med uret (0 = en spids op).
  function star(cx, cy, R, fill, ratio, rot) { return burst(cx, cy, R, fill, 5, ratio == null ? 0.382 : ratio, rot); }
  // Hver stribe males ud til kanten, så der ikke opstår tynde sprækker mellem striber.
  function stripes(colors, weights, horizontal) {
    var size = horizontal ? 40 : 60, total = 0, pos = 0, out = "", i;
    for (i = 0; i < colors.length; i++) total += weights ? weights[i] : 1;
    for (i = 0; i < colors.length; i++) {
      out += horizontal ? rect(0, pos, 60, size - pos, colors[i]) : rect(pos, 0, size - pos, 40, colors[i]);
      pos += (weights ? weights[i] : 1) / total * size;
    }
    return out;
  }
  function stripesH(colors, weights) { return stripes(colors, weights, true); }
  function stripesV(colors, weights) { return stripes(colors, weights, false); }

  // Union Jack tegnet i en 600 x 300 boks (skaleres bagefter); røde diagonaler er forskudt som på det rigtige flag.
  var JACK_BODY = rect(0, 0, 600, 300, "#012169") +
    poly("0,0 67,0 600,266.5 600,300 533,300 0,33.5", W) + poly("600,0 533,0 0,266.5 0,300 67,300 600,33.5", W) +
    poly("0,0 300,150 255.3,150 0,22.4", "#C8102E") + poly("300,150 600,300 600,277.6 344.7,150", "#C8102E") +
    poly("600,0 300,150 300,127.6 555.3,0", "#C8102E") + poly("300,150 0,300 44.7,300 300,172.4", "#C8102E") +
    rect(250, 0, 100, 300, W) + rect(0, 100, 600, 100, W) + rect(270, 0, 60, 300, "#C8102E") + rect(0, 120, 600, 60, "#C8102E");
  function jack(sx, sy) { return '<g transform="scale(' + sx + " " + sy + ')">' + JACK_BODY + "</g>"; }
  function jackCanton() { return jack(0.05, 0.0667); }

  // Sydkorset: stjerner med positioner fra de officielle flag (skaleret til 60 x 40).
  function bigStar7(cx, cy, R) { return burst(cx, cy, R, W, 7, 0.444, 0); }

  var F = {};

  F.dk = function () {
    return rect(0, 0, 60, 40, "#C8102E") + rect(19.5, 0, 6.5, 40, W) + rect(0, 17.1, 60, 5.8, W);
  };
  F.gb = function () { return jack(0.1, 0.1333); };
  F.fr = function () { return stripesV(["#0055A4", W, "#EF4135"]); };
  F.it = function () { return stripesV(["#009246", W, "#CE2B37"]); };
  F.gr = function () {
    var b = "#0D5EAF";
    return stripesH([b, W, b, W, b, W, b, W, b]) + rect(0, 0, 22.22, 22.22, b) + rect(8.89, 0, 4.44, 22.22, W) + rect(0, 8.89, 22.22, 4.44, W);
  };
  F.eg = function () {
    var g = "#C09300";
    return stripesH(["#CE1126", W, "#000"]) +
      path("M26.5 17h7v7q0 3-3.5 4.5Q26.5 27 26.5 24z", g) +
      path("M26.5 17l-6-3 .5 4-1 3 1 3-1 3 6-2z", g) + path("M33.5 17l6-3-.5 4 1 3-1 3 1 3-6-2z", g) +
      circle(30, 14.6, 2.2, g) + path("M28.6 14.2l-2 .9 2 .9z", g);
  };
  F.ke = function () {
    return stripesH(["#000", W, "#BB0000", W, "#006600"], [12.5, 1.5, 12, 1.5, 12.5]) +
      '<path d="M22.5 31L37.5 9M37.5 31L22.5 9" stroke="#fff" stroke-width="1" fill="none"/>' +
      '<ellipse cx="30" cy="20" rx="6.8" ry="11.5" fill="#fff"/><ellipse cx="30" cy="20" rx="6" ry="10.7" fill="#000"/>' +
      '<ellipse cx="30" cy="20" rx="3" ry="7.5" fill="#BB0000"/>' +
      '<path d="M30 12.5v15M26.5 20h7" stroke="#fff" stroke-width=".7" fill="none"/>';
  };
  // Y-formen: sort trekant ved stangen, guldkant, grøn Y med hvide kanter. T = trekantens spids, d = lodret forskydning.
  function yShape(T, d, hb, fill) {
    var xt = d * T / 20, xj = (20 - hb + d) * T / 20;
    return poly("0,0 " + n(xt) + ",0 " + n(xj) + "," + n(20 - hb) + " 60," + n(20 - hb) + " 60," + n(20 + hb) + " " + n(xj) + "," + n(20 + hb) + " " + n(xt) + ",40 0,40", fill);
  }
  F.za = function () {
    var T = 15;
    return rect(0, 0, 60, 20, "#E03C31") + rect(0, 20, 60, 20, "#001489") +
      yShape(T, 14, 4.2, W) + yShape(T, 12, 3, "#007749") +
      poly("0,0 1.5,0 16.5,20 1.5,40 0,40", "#FFB81C") + poly("0,0 " + T + ",20 0,40", "#000");
  };
  F.ma = function () {
    var pts = [], i, a;
    for (i = 0; i < 5; i++) {
      a = (i * 2 % 5) * 72 * Math.PI / 180;
      pts.push(n(30 + 7.5 * Math.sin(a)) + "," + n(21 - 7.5 * Math.cos(a)));
    }
    return rect(0, 0, 60, 40, "#C1272D") + '<polygon points="' + pts.join(" ") + '" fill="none" stroke="#006233" stroke-width="1.3" stroke-linejoin="miter"/>';
  };
  F.mg = function () {
    return rect(0, 0, 60, 20, "#FC3D32") + rect(0, 20, 60, 20, "#007E3A") + rect(0, 0, 20, 40, W);
  };
  var SPOKES = (function () {
    var d = "", i, a;
    for (i = 0; i < 12; i++) {
      a = i * 15 * Math.PI / 180;
      d += "M" + n(30 + 5 * Math.sin(a)) + " " + n(20 - 5 * Math.cos(a)) + "L" + n(30 - 5 * Math.sin(a)) + " " + n(20 + 5 * Math.cos(a));
    }
    return d;
  })();
  F["in"] = function () {
    return stripesH(["#FF9933", W, "#138808"]) +
      circle(30, 20, 4.7, "none", 'stroke="#000080" stroke-width=".7"') + circle(30, 20, 1, "#000080") +
      '<path d="' + SPOKES + '" stroke="#000080" stroke-width=".35" fill="none"/>';
  };
  F.cn = function () {
    var y = "#FFDE00", s = [[20, 4], [24, 8], [24, 14], [20, 18]], out = rect(0, 0, 60, 40, "#DE2910") + star(10, 10, 6, y), i;
    for (i = 0; i < 4; i++) out += star(s[i][0], s[i][1], 2, y, 0.382, Math.atan2(10 - s[i][0], s[i][1] - 10) * 180 / Math.PI);
    return out;
  };
  F.jp = function () { return rect(0, 0, 60, 40, W) + circle(30, 20, 12, "#BC002D"); };
  F.th = function () { return stripesH(["#A51931", "#F4F5F8", "#2D2A4A", "#F4F5F8", "#A51931"], [1, 1, 2, 1, 1]); };
  F.lk = function () {
    var y = "#FFBE29", m = "#8D153A";
    return rect(0, 0, 60, 40, y) + rect(1.5, 1.5, 6.5, 37, "#00534E") + rect(8, 1.5, 6.5, 37, "#EB7400") + rect(14.5, 1.5, 44, 37, m) +
      '<rect x="16" y="3" width="41" height="34" fill="none" stroke="' + y + '" stroke-width=".8"/>' +
      '<ellipse cx="38" cy="22" rx="9" ry="5.5" fill="' + y + '"/>' + circle(28.5, 16, 4.6, y) + circle(26.8, 15.4, .7, m) +
      path("M29 25l-3 8h3.5l3-6zM43 26l1.5 7h3.5l-2-8z", y) +
      '<path d="M46 20q6-1 4-10" stroke="' + y + '" stroke-width="1.6" fill="none"/><path d="M23 27L25.5 11" stroke="' + y + '" stroke-width="1.3" fill="none"/>';
  };
  F.us = function () {
    var cols = [], i, rows5 = "", rows6 = "";
    for (i = 0; i < 13; i++) cols.push(i % 2 ? W : "#B22234");
    for (i = 0; i < 9; i++) {
      if (i % 2) rows5 += "M4 " + n(1.9 + i * 2.2) + "h16.5"; else rows6 += "M2 " + n(1.9 + i * 2.2) + "h20.5";
    }
    return stripesH(cols) + rect(0, 0, 24, 21.54, "#3C3B6E") +
      '<path d="' + rows6 + rows5 + '" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-dasharray="0 4" fill="none"/>';
  };
  F.ca = function () {
    return stripesV(["#D52B1E", W, "#D52B1E"], [1, 2, 1]) +
      path("M4890 4430l-45-863a95 95 0 0 1 111-98l859 151-116-320a65 65 0 0 1 20-73l941-762-212-99a65 65 0 0 1-34-79l186-572-542 115a65 65 0 0 1-73-38l-105-247-423 454a65 65 0 0 1-111-57l204-1052-327 189a65 65 0 0 1-91-27l-332-652-332 652a65 65 0 0 1-91 27l-327-189 204 1052a65 65 0 0 1-111 57l-423-454-105 247a65 65 0 0 1-73 38l-542-115 186 572a65 65 0 0 1-34 79l-212 99 941 762a65 65 0 0 1 20 73l-116 320 859-151a95 95 0 0 1 111 98l-45 863z", "#D52B1E", 'transform="translate(30 20) scale(.0067) translate(-4800 -2385)"');
  };
  F.mx = function () {
    var b = "#8B5A2B", g = "#3A8A3A";
    return stripesV(["#006847", W, "#CE1126"]) +
      '<path d="M23.5 22.5q1 8 6.5 9.5 5.5-1.5 6.5-9.5" stroke="' + g + '" stroke-width="1.3" fill="none"/>' +
      '<ellipse cx="30" cy="19" rx="2.8" ry="4.5" fill="' + b + '"/>' +
      path("M27.5 16.5l-5-3 1 3-1.5 2 1.5 2-1 2.5 5-2z", b) + path("M32.5 16.5l5-3-1 3 1.5 2-1.5 2 1 2.5-5-2z", b) +
      circle(30, 14, 1.8, b) + path("M28.4 13.6l-2.3.9 2.3.8z", b) + '<ellipse cx="30" cy="25.5" rx="4" ry="1.2" fill="' + g + '"/>';
  };
  F.gl = function () {
    return rect(0, 0, 60, 20, W) + rect(0, 20, 60, 20, "#D00C33") +
      path("M10 20a13.33 13.33 0 0 1 26.67 0z", "#D00C33") + path("M10 20a13.33 13.33 0 0 0 26.67 0z", W);
  };
  F.cr = function () {
    return stripesH(["#002B7F", W, "#CE1126", W, "#002B7F"], [1, 1, 2, 1, 1]);
  };
  F.br = function () {
    var dots = [[-600, -132], [-535, 177], [-625, 243], [-382, 250], [228, -228], [380, 40], [-130, 330]], i, d = "";
    for (i = 0; i < dots.length; i++) d += circle(dots[i][0], dots[i][1], 32, W);
    return rect(0, 0, 60, 40, "#009C3B") + poly("5.1,20 30,4.9 54.9,20 30,35.1", "#FFCB00") +
      '<ellipse cx="30" cy="20" rx="10.5" ry="10" fill="#302681"/>' +
      '<g transform="translate(30 20) scale(.01429 .0136)">' +
      path("M-672.3-297.1A1785 1785 0 0 1 727.8 102.9A735 735 0 0 1 701.6 219.2A1680 1680 0 0 0-711.5-184.5A735 735 0 0 1-672.3-297.1z", W) + d + "</g>";
  };
  F.ar = function () {
    var g = "#F6B40E";
    return stripesH(["#74ACDF", W, "#74ACDF"]) + burst(30, 20, 5.6, g, 16, 0.55, 0) + circle(30, 20, 3.1, g);
  };
  F.pe = function () { return stripesV(["#D91023", W, "#D91023"]); };
  F.co = function () { return stripesH(["#FCD116", "#003893", "#CE1126"], [2, 1, 1]); };
  F.cl = function () {
    return rect(0, 0, 60, 20, W) + rect(0, 20, 60, 20, "#D52B1E") + rect(0, 0, 20, 20, "#0039A6") + star(10, 10.4, 6.5, W);
  };
  function southern7() {
    return bigStar7(45, 33.33, 2.5) + bigStar7(37.5, 17.5, 2.5) + bigStar7(45, 6.67, 2.5) + bigStar7(51.67, 14.83, 2.5) + star(48, 21.67, 1.6, W, 0.382, 0);
  }
  F.au = function () {
    return rect(0, 0, 60, 40, "#012169") + jackCanton() + bigStar7(15, 30, 5.5) + southern7();
  };
  F.nz = function () {
    var p = [[45, 8, 3], [50.9, 14.9, 2.6], [38.1, 17.3, 3], [45, 32, 3.2]], i, out = rect(0, 0, 60, 40, "#00247D") + jackCanton();
    for (i = 0; i < p.length; i++) out += star(p[i][0], p[i][1], p[i][2], W) + star(p[i][0], p[i][1], p[i][2] * 0.68, "#CC142B");
    return out;
  };
  F.fj = function () {
    return rect(0, 0, 60, 40, "#68BFE5") + jackCanton() +
      '<path d="M35 9h18v13q0 7.5-9 11-9-3.5-9-11z" fill="#fff" stroke="#A7A9AC" stroke-width=".6"/>' +
      path("M35 9h18v6H35z", "#CE1126") + circle(44, 12, 1.7, "#FCD116") +
      '<path d="M44 15v18M35 22h18" stroke="#CE1126" stroke-width="1" fill="none"/>' +
      circle(39.5, 18.5, 1.6, "#2E8B3A") + circle(48.5, 18.5, 1.6, "#FCD116") + circle(39.5, 27, 1.6, "#68BFE5") + circle(48.5, 27, 1.6, "#E6A100");
  };
  F.pg = function () {
    var y = "#FCD116";
    return rect(0, 0, 60, 40, "#000") + poly("0,0 60,0 60,40", "#CE1126") +
      '<ellipse cx="46" cy="12.5" rx="4.5" ry="2.4" fill="' + y + '" transform="rotate(-20 46 12.5)"/>' +
      circle(50.5, 9, 1.9, y) + path("M52.2 8.4l3-.4-2.8 1.8z", y) +
      '<path d="M41.8 14q-6 4-6 8M42.5 13.5q-7 2-9 6" stroke="' + y + '" stroke-width="1" fill="none"/>' +
      '<path d="M45 11l-4-4M47 11l1-5" stroke="' + y + '" stroke-width="1.3" fill="none"/>' +
      star(13, 20, 2.8, W) + star(6, 27, 2.8, W) + star(20.5, 26, 2.8, W) + star(13, 35, 2.8, W) + star(15.5, 28.5, 1.5, W);
  };

  function inner(id) {
    return Object.prototype.hasOwnProperty.call(F, id) ? F[id]() : "";
  }
  function svg(id, attrs) {
    var body = inner(id);
    if (!body) return "";
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40"' + (attrs ? " " + attrs : "") + ">" + body + "</svg>";
  }

  return { ids: ORDER.slice(), inner: inner, svg: svg };
});
