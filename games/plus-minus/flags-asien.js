// Flag til Talbasket: 41 asiatiske landeflag (in, cn, jp, th, lk ligger i flags.js).
// Kun simple former, ingen id'er, defs, clipPath eller tekst. Skrift og våbenskjolde er forenklet til små figurer.
(function () {
  "use strict";
  var F = (typeof module === "object" && module.exports) ? require("./flags.js") : window.TalbasketFlag;
  var h = F.h, n = h.n, rect = h.rect, poly = h.poly, path = h.path, circle = h.circle, star = h.star, burst = h.burst,
    stripesH = h.stripesH, stripesV = h.stripesV, W = h.W;

  // Streg uden fyld (afrundede ender).
  function st(d, c, w, extra) {
    return path(d, "none", 'stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (extra ? " " + extra : ""));
  }
  // Hvid halvmåne: stor cirkel minus en cirkel i baggrundsfarve forskudt i (dx,dy).
  function crescent(cx, cy, r, dx, dy, k, fill, bg) {
    return circle(cx, cy, r, fill) + circle(cx + dx, cy + dy, r * k, bg);
  }
  // Savtakket kant: farvet felt fra x=0 til x0 med count spidser, der peger til x1.
  function teeth(x0, x1, count, fill) {
    var d = "M0 0H" + x0, s = 40 / count, i;
    for (i = 0; i < count; i++) d += "L" + x1 + " " + n(s * (i + 0.5)) + "L" + x0 + " " + n(s * (i + 1));
    return path(d + "H0z", fill);
  }
  // Mange ens stjerner i én path; pts = [[x, y], ...].
  function stars(pts, R, fill) {
    var d = "", i, k, a, r;
    for (i = 0; i < pts.length; i++) {
      for (k = 0; k < 10; k++) {
        a = k * Math.PI / 5; r = k % 2 ? R * 0.382 : R;
        d += (k ? "L" : "M") + n(pts[i][0] + r * Math.sin(a)) + " " + n(pts[i][1] - r * Math.cos(a));
      }
      d += "z";
    }
    return path(d, fill);
  }
  function pent(cx, cy, r, count, a0, a1, R, fill) {
    var pts = [], i, a;
    for (i = 0; i < count; i++) {
      a = (a0 + (a1 - a0) * i / (count - 1)) * Math.PI / 180;
      pts.push([cx + r * Math.sin(a), cy - r * Math.cos(a)]);
    }
    return stars(pts, R, fill);
  }

  F.add({
    pk: function () {
      var g = "#01411C";
      return rect(0, 0, 60, 40, g) + rect(0, 0, 15, 40, W) + crescent(37.5, 20.5, 10, 3.7, -2.8, 0.84, W, g) + star(45, 15, 3.8, W, 0.382, 45);
    },
    bd: function () { return rect(0, 0, 60, 40, "#006A4E") + circle(27, 20, 12, "#F42A41"); },
    np: function () {
      var b = "#003893", r = "#DC143C", x = 14;
      return rect(0, 0, 60, 40, "#9ecbe8") +
        '<g transform="translate(' + x + ' 0)">' +
        poly("0,0 32,17.5 13,17.5 32,40 0,40", b) +
        poly("1.8,3.6 24,16 10,16 12.4,19.2 25.4,38.2 1.8,38.2", r) +
        path("M3.2 14.4a3.4 3.4 0 0 0 7 0a3.9 3.4 0 0 1-7 0z", W) + star(6.7, 10.4, 1.7, W, 0.45, 0) +
        burst(6.6, 30.5, 4.6, W, 12, 0.6, 0) + circle(6.6, 30.5, 2.4, r) +
        "</g>";
    },
    bt: function () {
      var w = W;
      return rect(0, 0, 60, 40, "#FF4E12") + poly("0,0 60,0 0,40", "#FFD520") +
        st("M10 33C14 26 18 33 22 27S30 27 33 21 42 21 45 15 50 12 52 9", w, 3.2) +
        st("M19 29l-1.5 5M29 25l1 5M38 20l2 4.5M47 13l3 3", w, 1.4) +
        poly("4,35.5 10,30.5 12.5,36.5", w) + circle(7, 32.5, .8, "#FF4E12") + circle(51.5, 8.5, 1.6, w);
    },
    mv: function () {
      var g = "#007E3A";
      return rect(0, 0, 60, 40, "#D21034") + rect(9, 8, 42, 24, g) + crescent(30, 20, 7, 2.6, 0, 0.82, W, g);
    },
    af: function () {
      return stripesV(["#000", "#D32011", "#007A36"]) +
        circle(30, 20, 7.8, "none", 'stroke="#fff" stroke-width="1"') +
        path("M26.3 25.5v-6.5a3.7 3.7 0 0 1 7.4 0v6.5z", W) + path("M28 25.5v-6a2 2 0 0 1 4 0v6z", "#D32011") +
        rect(24, 26.5, 12, 1.4, W) + circle(30, 14.2, 1.1, W) +
        st("M23 22q-.5-5 2-8M37 22q.5-5-2-8", W, .9);
    },
    ir: function () {
      var r = "#DA0000", g = "#239F40";
      return stripesH([g, W, r]) +
        st("M0 12.6H60", W, 1.2, 'stroke-dasharray="1.1 .9" stroke-linecap="butt"') +
        st("M0 27.4H60", W, 1.2, 'stroke-dasharray="1.1 .9" stroke-linecap="butt"') +
        st("M25 15.8Q24.4 23 30 25.1Q35.6 23 35 15.8", r, 1.5) + rect(29.55, 14.5, .9, 11.2, r) +
        path("M26 14.2a4 4 0 0 0 8 0a4.3 3 0 0 1-8 0z", r) + st("M28 18.5q2-1.5 4 0", r, .8);
    },
    iq: function () {
      var g = "#007A3D";
      return stripesH(["#CE1126", W, "#000"]) +
        st("M18.5 20.5q1.8-4 3.6 0t3.6 0M28 17.5v5M30.5 18.5q1.2 3 3 0t3.6 0M40 17.5v5M42 20.5h2", g, 1.3) +
        circle(24, 16.6, .6, g) + circle(34, 15.6, .6, g);
    },
    tr: function () {
      return rect(0, 0, 60, 40, "#E30A17") + crescent(20, 20, 10, 2.5, 0, 0.8, W, "#E30A17") + star(32.83, 20, 5, W, 0.382, -90);
    },
    sy: function () {
      return stripesH(["#CE1126", W, "#000"]) + star(19.5, 20, 4.2, "#007A3D") + star(40.5, 20, 4.2, "#007A3D");
    },
    lb: function () {
      var g = "#00A651";
      return stripesH(["#ED1C24", W, "#ED1C24"], [1, 2, 1]) +
        poly("30,9.5 26.2,15.5 33.8,15.5", g) + poly("30,12.5 24.4,19.5 35.6,19.5", g) + poly("30,16 22.8,23.8 37.2,23.8", g) +
        rect(29.2, 23.5, 1.6, 4.5, "#7B5230");
    },
    il: function () {
      var b = "#0038B8", s = ' fill="none" stroke="' + b + '" stroke-width="1.1"';
      return rect(0, 0, 60, 40, W) + rect(0, 3.75, 60, 6.25, b) + rect(0, 30, 60, 6.25, b) +
        '<path d="M30 13.2L35.9 23.4H24.1z"' + s + "/>" + '<path d="M30 26.8L35.9 16.6H24.1z"' + s + "/>";
    },
    jo: function () {
      return stripesH(["#000", W, "#007A3D"]) + poly("0,0 30,20 0,40", "#CE1126") + burst(9.5, 20, 3.6, W, 7, 0.45, 0);
    },
    sa: function () {
      var w = W;
      return rect(0, 0, 60, 40, "#006C35") +
        st("M15 15.5q2.2-5 4.4 0t4.4 0M26.5 11v9M30 15q1.8-4 3.6 0t3.6 0M40.5 11.5v8.5M43.5 14.5q2-3 3.8 0M18 20.5q3 3 6 0M30 19.5q3 2.5 6 0", w, 1.5) +
        circle(22, 11.8, .7, w) + circle(34, 11.4, .7, w) + circle(46, 11, .7, w) +
        poly("13,29.4 17,27.6 45.5,27.6 45.5,30.4 17,30.4", w) + rect(44.8, 26.2, 1.4, 5.6, w) + rect(46, 28, 4.5, 2, w) + circle(51.2, 29, 1.3, w);
    },
    ye: function () { return stripesH(["#CE1126", W, "#000"]); },
    om: function () {
      return stripesH([W, "#DB161B", "#008000"]) + rect(0, 0, 15, 40, "#DB161B") +
        st("M3.5 12L11.5 3M11.5 12L3.5 3", W, 1.1) + st("M3.6 6.8Q7.5 12.6 11.4 6.8", W, 1) + circle(7.5, 7.6, 1.2, W);
    },
    ae: function () {
      return stripesH(["#009739", W, "#000"]) + rect(0, 0, 15, 40, "#EF3340");
    },
    qa: function () {
      return rect(0, 0, 60, 40, "#8A1538") + teeth(14, 21, 9, W);
    },
    bh: function () {
      return rect(0, 0, 60, 40, "#CE1126") + teeth(14, 21, 5, W);
    },
    kw: function () {
      return stripesH(["#007A3D", W, "#CE1126"]) + poly("0,0 15,13.33 15,26.67 0,40", "#000");
    },
    am: function () { return stripesH(["#D90012", "#0033A0", "#F2A800"]); },
    ge: function () {
      var r = "#FF0000", out = rect(0, 0, 60, 40, W) + rect(26.5, 0, 7, 40, r) + rect(0, 16.5, 60, 7, r), i, cx, cy;
      for (i = 0; i < 4; i++) {
        cx = i % 2 ? 46.75 : 13.25; cy = i < 2 ? 8.25 : 31.75;
        out += rect(cx - 3.2, cy - 1, 6.4, 2, r) + rect(cx - 1, cy - 3.2, 2, 6.4, r);
      }
      return out;
    },
    az: function () {
      var r = "#EF3340";
      return stripesH(["#00B5E2", r, "#509E2F"]) + crescent(26.5, 20, 5.6, 1.8, 0, 0.8, W, r) + burst(33, 20, 3.3, W, 8, 0.6, 0);
    },
    kz: function () {
      var y = "#FEC50C", out = rect(0, 0, 60, 40, "#00AFCA"), i;
      for (i = 0; i < 7; i++) out += poly("4.5," + n(i * 5.71 + .2) + " 7.5," + n(i * 5.71 + 2.86) + " 4.5," + n(i * 5.71 + 5.5) + " 1.5," + n(i * 5.71 + 2.86), y);
      return out + rect(0, 0, 1, 40, y) + rect(8.6, 0, .6, 40, y) +
        burst(34, 15, 8.2, y, 16, 0.78, 0) + circle(34, 15, 5.2, "#00AFCA") + circle(34, 15, 4.2, y) +
        path("M19 31Q24 23 34 27Q44 23 49 31Q42 28 34 32Q26 28 19 31z", y) + path("M32 29h4v5h-4z", y);
    },
    uz: function () {
      var rd = "#CE1126", b = "#0099B5", out = stripesH([b, rd, W, rd, "#1EB53A"], [13.3, .8, 11.8, .8, 13.3]), r, c, p = [];
      out += crescent(6.5, 6.65, 4.3, 1.7, 0, 0.8, W, b);
      for (r = 0; r < 3; r++) for (c = 0; c < r + 3; c++) p.push([16.5 + c * 3.4, 3.3 + r * 3.35]);
      return out + stars(p, 1.25, W);
    },
    tm: function () {
      var g = "#00843D", out = rect(0, 0, 60, 40, g) + rect(6, 0, 8, 40, "#D22630"), i, p = [];
      for (i = 0; i < 5; i++) out += poly("10," + n(i * 8 + 1) + " 13," + n(i * 8 + 4) + " 10," + n(i * 8 + 7) + " 7," + n(i * 8 + 4), "#3A2A2A") + circle(10, 4 + i * 8, 1.2, W);
      out += crescent(21, 7.5, 5.2, 2.4, 0, 0.85, W, g);
      for (i = 0; i < 5; i++) p.push([26.5 + 2.9 * Math.sin(i * 1.2566), 7.5 - 2.9 * Math.cos(i * 1.2566)]);
      return out + stars(p, 1.3, W);
    },
    kg: function () {
      var r = "#E8112D", y = "#FFEF00";
      return rect(0, 0, 60, 40, r) + burst(30, 20, 11.8, y, 20, 0.85, 0) + circle(30, 20, 8.6, r) + circle(30, 20, 7.6, y) +
        circle(30, 20, 4.4, "none", 'stroke="' + r + '" stroke-width=".8"') +
        st("M25.6 20h8.8M27.8 16.2l4.4 7.6M27.8 23.8l4.4-7.6", r, .7);
    },
    tj: function () {
      var y = "#F8C300";
      return stripesH(["#CC0000", W, "#006600"], [2, 3, 2]) +
        path("M25.5 24Q25.5 17.8 30 17.8Q34.5 17.8 34.5 24z", y) + rect(25, 24, 10, 1.3, y) +
        pent(30, 24, 8.6, 7, -64, 64, 1.3, y);
    },
    mn: function () {
      var y = "#F9CF02";
      return stripesV(["#C4272F", "#015197", "#C4272F"]) +
        path("M10 3.6q-2.2 2.5 0 4.4q2.2-1.900 0-4.4z", y) + circle(10, 10.4, 1.4, y) +
        path("M7.7 13.2a2.3 2.3 0 0 0 4.6 0a2.6 1.7 0 0 1-4.6 0z", y) +
        poly("7.4,16.2 12.6,16.2 10,21", y) + circle(10, 25, 2.5, y) + path("M10 22.5a1.25 1.25 0 0 1 0 2.5a1.25 1.25 0 0 0 0 2.5a2.5 2.5 0 0 1 0-5z", "#C4272F") +
        poly("7,29 13,29 10,32.5", y) +
        rect(4.8, 4.5, 1.7, 31, y) + rect(13.5, 4.5, 1.7, 31, y) + rect(4.8, 34, 10.4, 1.7, y);
    },
    kr: function () {
      var out = rect(0, 0, 60, 40, W) + '<g transform="translate(30 20) scale(.4167)">',
        bar = function (x, y, broken) {
          return broken ? rect(x, y, 4.2, 4, "#000") + rect(x + 7.8, y, 4.2, 4, "#000") : rect(x, y, 12, 4, "#000");
        }, t = [[-56.31, 0, 0, 0], [56.31, 1, 0, 1], [123.69, 1, 1, 1], [-123.69, 0, 1, 0]], i, a, k;
      for (i = 0; i < 4; i++) {
        a = t[i];
        out += '<g transform="rotate(' + a[0] + ')">';
        for (k = 0; k < 3; k++) out += bar(-6, -44 + k * 6.6 - 3, a[1 + k]);
        out += "</g>";
      }
      return out +
        '<g transform="rotate(33.69)">' +
        path("M12 0a18 18 0 1 1-36 0 24 24 0 1 1 48 0", "#CD2E3A") +
        path("M-24 0a24 24 0 1 0 48 0A12 12 0 1 0 0 0a12 12 0 1 1-24 0", "#0047A0") + "</g></g>";
    },
    kp: function () {
      var r = "#ED1C27";
      return stripesH(["#024FA2", W, r, W, "#024FA2"], [6.67, 1.67, 23.33, 1.67, 6.67]) +
        circle(22, 20, 8.6, W) + star(22, 20.3, 7.6, r);
    },
    vn: function () { return rect(0, 0, 60, 40, "#DA251D") + star(30, 20.8, 12.4, "#FFFF00"); },
    la: function () {
      return stripesH(["#CE1126", "#002868", "#CE1126"], [1, 2, 1]) + circle(30, 20, 8, W);
    },
    kh: function () {
      var w = W;
      return stripesH(["#032EA1", "#E00025", "#032EA1"], [1, 2, 1]) +
        path("M27.2 23.5V19.5Q27.2 14 30 10Q32.8 14 32.8 19.5V23.5z", w) +
        path("M21.4 23.5V20Q21.4 15.500 24 12.500Q26.6 15.500 26.600 20V23.500z", w) +
        path("M33.4 23.5V20Q33.4 15.500 36 12.500Q38.6 15.500 38.600 20V23.500z", w) +
        path("M16.200 25.500V22.500Q16.200 19 18.500 16.500Q20.800 19 20.800 22.500V25.500z", w) +
        path("M39.200 25.500V22.500Q39.200 19 41.500 16.500Q43.800 19 43.800 22.500V25.500z", w) +
        rect(15.500, 25.500, 29, 1.500, w) + rect(14, 27, 32, 1.500, w) + rect(12.500, 28.500, 35, 1.500, w);
    },
    mm: function () {
      return stripesH(["#FECB00", "#34B233", "#EA2839"]) + star(30, 21.2, 14.4, W);
    },
    my: function () {
      var y = "#FFCC00", b = "#010066", cols = [], i;
      for (i = 0; i < 14; i++) cols.push(i % 2 ? W : "#CC0001");
      return stripesH(cols) + rect(0, 0, 30, 22.86, b) + crescent(11.2, 11.43, 6.8, 2.4, 0, 0.8, y, b) + burst(19, 11.43, 6.2, y, 14, 0.5, 0);
    },
    sg: function () {
      var r = "#ED2939";
      return rect(0, 0, 60, 40, W) + rect(0, 0, 60, 20, r) + crescent(12, 10, 6.4, 2, 0, 0.84, W, r) +
        [0, 1, 2, 3, 4].map(function (i) {
          var a = i * 72 * Math.PI / 180;
          return star(22.4 + 3.6 * Math.sin(a), 10.2 - 3.6 * Math.cos(a), 1.7, W, 0.382, i * 72);
        }).join("");
    },
    bn: function () {
      var r = "#CF1126";
      return rect(0, 0, 60, 40, "#F7E017") + poly("13.6,0 60,25.5 60,33 0,0", W) + poly("0,0 60,33 60,39 0,6", "#000") +
        rect(29.4, 11, 1.2, 14, r) + path("M23 14Q30 6 37 14z", r) + circle(30, 8.2, 1, r) +
        path("M30 20Q21 15 19.500 22Q25 19.500 30 23z", r) + path("M30 20Q39 15 40.500 22Q35 19.500 30 23z", r) +
        path("M22.500 27a7.500 7.500 0 0 0 15 0a8 4 0 0 1-15 0z", r);
    },
    id: function () { return stripesH(["#E70011", W]); },
    ph: function () {
      var y = "#FCD116";
      return stripesH(["#0038A8", "#CE1126"]) + poly("0,0 34.6,20 0,40", W) +
        burst(11.5, 20, 8.6, y, 8, 0.32, 0) + burst(11.5, 20, 6.6, y, 8, 0.4, 22.5) + circle(11.5, 20, 3.8, y) +
        star(4.2, 5.6, 2.3, y, 0.382, -36) + star(4.2, 34.4, 2.3, y, 0.382, -144) + star(30.2, 20, 2.3, y, 0.382, 90);
    },
    tl: function () {
      return rect(0, 0, 60, 40, "#DC241F") + poly("0,0 30,20 0,40", "#FFC72C") + poly("0,0 20,20 0,40", "#000") + star(6.4, 20, 4.6, W, 0.382, -90);
    }
  });
})();
