// Flag til Talbasket: Nordamerika (19), Sydamerika (7) og Oceanien (10). Forenklede våbenskjold, ellers rigtige farver og lay-out.
(function () {
  "use strict";
  var F = (typeof module === "object" && module.exports) ? require("./flags.js") : window.TalbasketFlag;
  var h = F.h, n = h.n, rect = h.rect, poly = h.poly, path = h.path, circle = h.circle, star = h.star, burst = h.burst, stripesH = h.stripesH, stripesV = h.stripesV, W = h.W;

  function ellipse(cx, cy, rx, ry, fill, extra) {
    return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" fill="' + fill + '"' + (extra ? " " + extra : "") + "/>";
  }
  function ring(cx, cy, r, stroke, sw, extra) {
    return circle(cx, cy, r, "none", 'stroke="' + stroke + '" stroke-width="' + sw + '"' + (extra ? " " + extra : ""));
  }
  function diamond(cx, cy, rx, ry, fill) {
    return poly(n(cx) + "," + n(cy - ry) + " " + n(cx + rx) + "," + n(cy) + " " + n(cx) + "," + n(cy + ry) + " " + n(cx - rx) + "," + n(cy), fill);
  }
  // Diagonalbånd langs hjørne-til-hjørne i 60 x 40; w er halv vandret bredde. down: fra øverst til venstre til nederst til højre.
  function band(w, fill, down) {
    var k = w * 2 / 3;
    return down ?
      poly("0,0 " + n(w) + ",0 60," + n(40 - k) + " 60,40 " + n(60 - w) + ",40 0," + n(k), fill) :
      poly(n(60 - w) + ",0 60,0 60," + n(k) + " " + n(w) + ",40 0,40 0," + n(40 - k), fill);
  }
  function tri(pts, fill) { return poly(pts, fill); }

  F.add({
    // ---------- Nordamerika ----------
    cu: function () {
      return stripesH(["#002A8F", W, "#002A8F", W, "#002A8F"]) + tri("0,0 26,20 0,40", "#CF142B") + star(8.7, 20, 5, W);
    },
    jm: function () {
      var g = "#009B3A";
      return rect(0, 0, 60, 40, "#000") + tri("0,0 60,0 30,20", g) + tri("0,40 60,40 30,20", g) +
        band(5.5, "#FED100", true) + band(5.5, "#FED100", false);
    },
    ht: function () {
      return stripesH(["#00209F", "#D21034"]) + rect(20.5, 12.5, 19, 15, W) +
        path("M30 17.5q-5-4.5-8.3-2 4-.5 8.3 2zM30 17.5q5-4.5 8.3-2-4-.5-8.3 2zM30 17.5q-2-4.5 0-6.5 2 2 0 6.5z", "#2E8B3A") +
        rect(29.4, 17.5, 1.2, 7, "#8B5A2B") + ellipse(30, 25, 5.5, 1.3, "#2E8B3A") +
        rect(22.5, 22.5, 4.5, 1.1, "#555") + rect(33, 22.5, 4.5, 1.1, "#555") + rect(22.5, 14, 2.4, 1.6, "#00209F") + rect(35.1, 14, 2.4, 1.6, "#D21034");
    },
    "do": function () {
      var b = "#002D62", r = "#CE1126";
      return rect(0, 0, 60, 40, b) + rect(30, 0, 30, 20, r) + rect(0, 20, 30, 20, r) +
        rect(26.5, 0, 7, 40, W) + rect(0, 16.5, 60, 7, W) + circle(30, 20, 5.4, W) +
        ring(30, 20, 4.6, "#2E8B3A", 1.1) + rect(27.2, 17.6, 2.8, 4.8, b) + rect(30, 17.6, 2.8, 4.8, r) +
        rect(29.5, 17.6, 1, 4.8, W) + rect(27.2, 19.5, 5.6, 1, W);
    },
    bs: function () {
      return stripesH(["#00ABC9", "#FFC72C", "#00ABC9"]) + tri("0,0 26,20 0,40", "#000");
    },
    pa: function () {
      var b = "#005293", r = "#D21034";
      return rect(0, 0, 60, 40, W) + rect(30, 0, 30, 20, r) + rect(0, 20, 30, 20, b) + star(15, 10, 5.5, b) + star(45, 30, 5.5, r);
    },
    ni: function () {
      return stripesH(["#0067C6", W, "#0067C6"]) + tri("30,12 36.5,25 23.5,25", "#E6C229") + tri("30,14 35,24 25,24", "#8FD0F0") +
        tri("25.8,24 28.6,19.8 30,22 31.6,19.2 34.2,24", "#2E8B3A") + tri("30,14.6 31.3,17.2 28.7,17.2", "#CE1126");
    },
    hn: function () {
      var b = "#0073CF", s = [[30, 20], [23, 16.5], [37, 16.5], [23, 23.5], [37, 23.5]], i, out = stripesH([b, W, b]);
      for (i = 0; i < 5; i++) out += star(s[i][0], s[i][1], 2.3, b);
      return out;
    },
    sv: function () {
      return stripesH(["#0F47AF", W, "#0F47AF"]) + ring(30, 20, 5.5, "#4AA94B", 1.3) +
        tri("30,15.4 34.6,23.4 25.4,23.4", "#F7C948") + tri("30,17 33.4,22.6 26.6,22.6", "#8FD0F0") +
        tri("26.8,22.6 28.8,19.8 30,21.4 31.4,19.2 33.2,22.6", "#2E8B3A") + tri("30,15.4 31,17 29,17", "#CE1126");
    },
    gt: function () {
      return stripesV(["#4997D0", W, "#4997D0"]) + ring(30, 20, 6, "#3A8A3A", 1.5) +
        '<path d="M26.4 17.5L33.6 24M33.6 17.5L26.4 24" stroke="#8B7355" stroke-width="1" fill="none"/>' +
        ellipse(30, 19.5, 1.5, 3, "#2E8B3A") + circle(30, 15.8, 1.1, "#2E8B3A") + poly("30,22 29.2,26 30,25 30.8,26", "#CE1126") +
        ellipse(30, 25.8, 3, 1, "#F4C430");
    },
    bz: function () {
      var r = "#CE1126";
      return rect(0, 0, 60, 40, "#003F87") + rect(0, 0, 60, 4, r) + rect(0, 36, 60, 4, r) + circle(30, 20, 11.5, W) +
        ring(30, 20, 9.7, "#3A8A3A", 2.3, 'stroke-dasharray="2.6 1"') +
        poly("25.5,15 34.5,15 34.5,21.5 30,25.5 25.5,21.5", "#F2E3C0") + rect(25.5, 15, 9, 2.6, r) + rect(25.5, 17.6, 4.5, 3.6, "#003F87") +
        rect(30, 17.6, 4.5, 3.6, "#8B5A2B") + poly("26.4,21.2 33.6,21.2 30,24.6", "#00A3DD");
    },
    tt: function () {
      return rect(0, 0, 60, 40, "#CE1126") + band(10, W, true) + band(7, "#000", true);
    },
    bb: function () {
      var k = "#000";
      return stripesV(["#00267F", "#FFC726", "#00267F"]) +
        '<path d="M26.5 14v4.5q0 3.6 3.5 3.6t3.5-3.6V14M30 11v18" stroke="' + k + '" stroke-width="1.4" fill="none"/>' +
        tri("26.5,10.5 28.3,14 24.7,14", k) + tri("30,9.5 31.8,13 28.2,13", k) + tri("33.5,10.5 35.3,14 31.7,14", k) + rect(27.6, 27.5, 4.8, 1.2, k);
    },
    ag: function () {
      return rect(0, 0, 60, 40, "#CE1126") + tri("0,0 60,0 30,40", W) + tri("0,0 60,0 43.5,22 16.5,22", "#000") +
        burst(30, 20, 8.5, "#FCD116", 9, 0.55, 0) + tri("15,20 45,20 38.6,28.5 21.4,28.5", "#0072C6");
    },
    dm: function () {
      var y = "#FCD116", b = "#000", i, a, out = rect(0, 0, 60, 40, "#006B3F") +
        rect(26.4, 0, 2.4, 40, y) + rect(28.8, 0, 2.4, 40, b) + rect(31.2, 0, 2.4, 40, W) +
        rect(0, 16.4, 60, 2.4, y) + rect(0, 18.8, 60, 2.4, b) + rect(0, 21.2, 60, 2.4, W) + circle(30, 20, 9.8, "#D41C30");
      for (i = 0; i < 10; i++) {
        a = i * 36 * Math.PI / 180;
        out += star(30 + 7.7 * Math.sin(a), 20 - 7.7 * Math.cos(a), 1.3, "#006B3F");
      }
      return out + path("M30 14.4q3 .8 3 4.8l-1.2 5-1.8 1.8-1.8-1.8-1.2-5q0-4 3-4.8z", "#6D2E8C") +
        ellipse(31, 19.5, 1.1, 3, "#2E8B57") + circle(30, 15.6, 1.5, "#2E8B57") + tri("28.6,15 27,16.6 28.8,17", "#222");
    },
    gd: function () {
      var y = "#FCD116", i, out = rect(0, 0, 60, 40, "#CE1126") + rect(4, 4, 52, 32, "#007A5E") + tri("4,4 56,4 30,20", y) + tri("4,36 56,36 30,20", y);
      for (i = 0; i < 3; i++) out += star(15 + i * 15, 2, 1.6, y) + star(15 + i * 15, 38, 1.6, y);
      return out + circle(30, 20, 5, "#CE1126") + star(30, 20, 3.4, y) + ellipse(11, 20, 2.2, 1.4, y) + ellipse(11.5, 20, 1, .8, "#CE1126");
    },
    kn: function () {
      return rect(0, 0, 60, 40, "#CE1126") + tri("0,0 60,0 0,40", "#009E49") + band(10.5, "#FCD116", false) + band(7.7, "#000", false) +
        star(20, 26.7, 3.8, W) + star(40, 13.3, 3.8, W);
    },
    lc: function () {
      return rect(0, 0, 60, 40, "#65CFFF") + tri("30,5 45,35 15,35", W) + tri("30,10 41.5,33 18.5,33", "#000") + tri("30,18 39,33 21,33", "#FCD116");
    },
    vc: function () {
      var g = "#009E60";
      return stripesV(["#0072C6", "#FCD116", g], [1, 2, 1]) +
        diamond(25.6, 14, 3.1, 5, g) + diamond(34.4, 14, 3.1, 5, g) + diamond(30, 24.5, 3.1, 5, g);
    },

    // ---------- Sydamerika ----------
    ve: function () {
      var i, a, out = stripesH(["#FFCC00", "#00247D", "#CF142B"]);
      for (i = 0; i < 8; i++) {
        a = (-38 + i * 76 / 7) * Math.PI / 180;
        out += star(30 + 24 * Math.sin(a), 38 - 24 * Math.cos(a), 2, W, 0.382, a * 180 / Math.PI);
      }
      return out;
    },
    ec: function () {
      return stripesH(["#FFDD00", "#034EA2", "#ED1C24"], [2, 1, 1]) + ellipse(30, 21.5, 5.2, 6.4, "#8A6D3B") + ellipse(30, 21.5, 4.4, 5.6, "#7FC4E8") +
        path("M25.6 24.5q2.2-4.5 4.4-1.2 2.2-3.2 4.4 1.2v2q-4.4 3.5-8.8 0z", "#5A9A3C") + circle(30, 19, 1.3, "#FFDD00") +
        poly("30,12.4 24.5,14.4 27.4,15.6 30,14.6 32.6,15.6 35.5,14.4", "#4B3621");
    },
    bo: function () {
      return stripesH(["#D52B1E", "#F9E300", "#007934"]) + ellipse(30, 20, 3.8, 4.6, "#8A6D3B") + ellipse(30, 20, 3.1, 3.9, "#7FC4E8") +
        path("M27 22.2q1.5-3 3-.8 1.5-2.2 3 .8v1.6q-3 2-6 0z", "#3A8A3A");
    },
    py: function () {
      return stripesH(["#D52B1E", W, "#0038A8"]) + ring(30, 20, 5, "#3A8A3A", 1.3) + star(30, 20, 3.6, "#FEDF00");
    },
    uy: function () {
      var b = "#0038A8", c = "#FCD116", i, out = "";
      for (i = 0; i < 9; i++) out += rect(0, i * 40 / 9, 60, 40 - i * 40 / 9, i % 2 ? b : W);
      return out + rect(0, 0, 22.2, 22.2, W) + burst(11.1, 11.1, 9.5, c, 16, 0.58, 0) + circle(11.1, 11.1, 4.4, c);
    },
    gy: function () {
      return rect(0, 0, 60, 40, "#009E49") + tri("0,0 60,20 0,40", W) + tri("0,2.2 57,20 0,37.8", "#FCD116") +
        tri("0,0 37,20 0,40", "#000") + tri("0,3 31,20 0,37", "#CE1126");
    },
    sr: function () {
      return stripesH(["#377E3F", W, "#B40A2D", W, "#377E3F"], [2, 1, 4, 1, 2]) + star(30, 20, 6.5, "#ECC81D");
    },

    // ---------- Oceanien ----------
    ws: function () {
      return rect(0, 0, 60, 40, "#CE1126") + rect(0, 0, 30, 20, "#002B7F") + star(14, 4.2, 2.6, W) + star(21.5, 9.5, 2.6, W) +
        star(7, 9.5, 2.6, W) + star(14, 16.2, 2.6, W) + star(18.2, 12.8, 1.5, W);
    },
    to: function () {
      var r = "#C10000";
      return rect(0, 0, 60, 40, r) + rect(0, 0, 26, 20, W) + rect(10.7, 3.5, 4.6, 13, r) + rect(6.5, 7.7, 13, 4.6, r);
    },
    vu: function () {
      return stripesH(["#D21034", "#009543"], [1, 1]) + poly("0,0 11,0 30,15.5 60,15.5 60,24.5 30,24.5 11,40 0,40", "#000") +
        poly("0,0 8.5,0 28.5,16.9 60,16.9 60,23.1 28.5,23.1 8.5,40 0,40", "#FDCE12") + tri("0,0 23.7,20 0,40", "#000") +
        '<path d="M10.8 17.2A4 4 0 1 0 12 20.5M4.5 24l7-8.5" stroke="#FDCE12" stroke-width="1.1" fill="none"/>';
    },
    sb: function () {
      var s = [[6, 4], [16, 4], [11, 10], [6, 16], [16, 16]], i, out = rect(0, 0, 60, 40, "#215B33") + tri("0,0 60,0 0,40", "#0051BA") + band(4, "#FCD116", false);
      for (i = 0; i < 5; i++) out += star(s[i][0], s[i][1], 2.3, W);
      return out;
    },
    ki: function () {
      var c = "#FCD116";
      return rect(0, 0, 60, 20, "#CE1126") + burst(30, 20, 10.5, c, 17, 0.55, 0) + rect(0, 20, 60, 20, "#003F87") +
        rect(0, 23.3, 60, 3.3, W) + rect(0, 30, 60, 3.3, W) + rect(0, 36.7, 60, 3.3, W) +
        path("M30 6.5L19 3l5.5 5.5L30 8l5.5.5L41 3z", c) + ellipse(30, 9.5, 1.5, 2.6, c) + tri("28.6,11.5 30,10 31.4,11.5 33,15 30,13.2 27,15", c);
    },
    tv: function () {
      var s = [[47, 6], [55, 12], [45, 14], [51, 20], [41, 22], [46, 28], [36, 28], [40, 34], [30, 34]], i, out = rect(0, 0, 60, 40, "#5EB6E4") + h.jackCanton();
      for (i = 0; i < 9; i++) out += star(s[i][0], s[i][1], 2.3, "#FCD116");
      return out;
    },
    nr: function () {
      return rect(0, 0, 60, 40, "#002B7F") + rect(0, 18.8, 60, 2.5, "#FFC61E") + burst(10, 30, 6.3, W, 12, 0.6, 0);
    },
    mh: function () {
      return rect(0, 0, 60, 40, "#003893") + tri("0,40 60,5 60,19", "#DD7500") + tri("0,40 60,19 60,33", W) +
        burst(12, 10, 6.3, W, 24, 0.7, 0) + burst(12, 10, 9.6, W, 4, 0.16, 0);
    },
    fm: function () {
      var i, a, out = rect(0, 0, 60, 40, "#75B2DD");
      for (i = 0; i < 4; i++) {
        a = i * 90 * Math.PI / 180;
        out += star(30 + 9.5 * Math.sin(a), 20 - 9.5 * Math.cos(a), 3.5, W, 0.382, i * 90);
      }
      return out;
    },
    pw: function () {
      return rect(0, 0, 60, 40, "#4AADD6") + circle(26.5, 20, 12, "#FFDE00");
    }
  });
})();
