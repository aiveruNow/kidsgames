// Europæiske flag til Talbasket (40 stk.) som inline SVG i 60 x 40 boksen; våbenskjolde er forenklede.
// Kun simple former, ingen id'er, defs, clipPath eller tekst.
(function () {
  "use strict";
  var F = (typeof module === "object" && module.exports) ? require("./flags.js") : window.TalbasketFlag;
  var h = F.h, n = h.n, rect = h.rect, poly = h.poly, path = h.path, circle = h.circle, star = h.star, burst = h.burst, stripesH = h.stripesH, stripesV = h.stripesV, W = h.W;

  // Polygon i lokale koordinater (centrum cx,cy, skala s), så ingen koordinater falder uden for boksen.
  function tp(cx, cy, s, pts, fill) {
    return poly(pts.split(" ").map(function (p) {
      var a = p.split(",");
      return n(cx + a[0] * s) + "," + n(cy + a[1] * s);
    }).join(" "), fill);
  }
  var EAGLE = "0,-3 3,-3.5 6.5,-6 10,-9.5 10.5,-4 9,-2 10.5,1 7.5,2 8,5 4.5,4.5 3.5,9 0,10.5 -3.5,9 -4.5,4.5 -8,5 -7.5,2 -10.5,1 -9,-2 -10.5,-4 -10,-9.5 -6.5,-6 -3,-3.5";
  var CROWN = "-2.5,-10.5 -2.5,-13 -1,-11.8 0,-13.5 1,-11.8 2.5,-13 2.5,-10.5";
  // Tohovedet ørn: vinger, to halse med hoveder og næb.
  function eagle(cx, cy, s, fill) {
    return tp(cx, cy, s, EAGLE, fill) + tp(cx, cy, s, "-2.5,-3 -5.4,-8.4 -3.6,-8.6 0,-3", fill) + tp(cx, cy, s, "2.5,-3 5.4,-8.4 3.6,-8.6 0,-3", fill) +
      circle(cx - 4.4 * s, cy - 8.6 * s, 1.7 * s, fill) + circle(cx + 4.4 * s, cy - 8.6 * s, 1.7 * s, fill) +
      tp(cx, cy, s, "-5.7,-9.6 -8,-8.7 -5.7,-7.6", fill) + tp(cx, cy, s, "5.7,-9.6 8,-8.7 5.7,-7.6", fill);
  }
  function nordic(bg, outer, inner, x0, x1, y0, y1, ix0, ix1, iy0, iy1) {
    var s = rect(0, 0, 60, 40, bg) + rect(x0, 0, x1 - x0, 40, outer) + rect(0, y0, 60, y1 - y0, outer);
    if (inner) s += rect(ix0, 0, ix1 - ix0, 40, inner) + rect(0, iy0, 60, iy1 - iy0, inner);
    return s;
  }
  function checker(x, y, cell, red) {
    var out = rect(x, y, cell * 5, cell * 5, W), i, j;
    for (i = 0; i < 5; i++) for (j = 0; j < 5; j++) if ((i + j) % 2 === 0) out += rect(x + i * cell, y + j * cell, cell, cell, red);
    return out;
  }

  F.add({
    se: function () { return nordic("#006AA7", "#FECC00", null, 18.75, 26.25, 16, 24); },
    no: function () { return nordic("#BA0C2F", W, "#00205B", 16.36, 27.27, 15, 25, 19.09, 24.55, 17.5, 22.5); },
    fi: function () { return rect(0, 0, 60, 40, W) + rect(16.67, 0, 8.33, 40, "#003580") + rect(0, 14.55, 60, 10.9, "#003580"); },
    is: function () { return nordic("#02529C", W, "#DC1E35", 16.8, 26.4, 15.56, 24.44, 19.2, 24, 17.78, 22.22); },
    de: function () { return stripesH(["#000", "#DD0000", "#FFCE00"]); },
    nl: function () { return stripesH(["#AE1C28", W, "#21468B"]); },
    be: function () { return stripesV(["#000", "#FAE042", "#ED2939"]); },
    lu: function () { return stripesH(["#ED2939", W, "#00A2E1"]); },
    ie: function () { return stripesV(["#169B62", W, "#FF883E"]); },
    es: function () {
      var r = "#AA151B", y = "#F1BF00";
      return stripesH([r, y, r], [1, 2, 1]) +
        rect(16, 15, 1.6, 10, "#E0E0E0") + rect(25.4, 15, 1.6, 10, "#E0E0E0") + rect(15.6, 14.5, 2.4, .9, r) + rect(25, 14.5, 2.4, .9, r) +
        rect(18.5, 15.5, 6, 7, W) + rect(18.5, 15.5, 3, 3.5, r) + rect(21.5, 19, 3, 3.5, r) + rect(18.5, 19, 3, 3.5, y) +
        '<rect x="18.5" y="15.5" width="6" height="7" fill="none" stroke="' + r + '" stroke-width=".5"/>' +
        poly("18.5,22.5 24.5,22.5 21.5,25.5", r) + poly("18.8,14.6 18.8,12.2 20.2,13.4 21.5,11.8 22.8,13.4 24.2,12.2 24.2,14.6", "#C8960C");
    },
    pt: function () {
      var g = "#FFE000";
      return rect(0, 0, 60, 40, "#FF0000") + rect(0, 0, 24, 40, "#006600") +
        circle(24, 20, 7, "none", 'stroke="' + g + '" stroke-width="1.1"') + '<ellipse cx="24" cy="20" rx="3.2" ry="7" fill="none" stroke="' + g + '" stroke-width=".7"/>' +
        '<path d="M20 15.6h8v5.4q0 3.2-4 5-4-1.8-4-5z" fill="#FF0000" stroke="#fff" stroke-width=".6"/>' +
        path("M21.5 17h5v3.8q0 2.2-2.5 3.4-2.5-1.2-2.5-3.4z", W) +
        circle(24, 17.9, .55, "#003399") + circle(24, 21.9, .55, "#003399") + circle(22.4, 19.9, .55, "#003399") + circle(25.6, 19.9, .55, "#003399") + circle(24, 19.9, .55, "#003399");
    },
    ad: function () {
      var r = "#D50032", y = "#FEDD00";
      return stripesV(["#10069F", y, r], [7, 6, 7]) +
        '<path d="M26 14h8v7q0 4-4 6-4-2-4-6z" fill="' + y + '" stroke="' + r + '" stroke-width=".7"/>' +
        rect(29.5, 14.4, .8, 5.5, r) + rect(31.6, 14.4, .8, 5.5, r) + rect(27.4, 14.4, .8, 5.5, r) +
        path("M26.5 20.5h7q-.2 3-3.5 5-3.3-2-3.5-5z", r) + circle(30, 22, .9, y);
    },
    ch: function () {
      return rect(0, 0, 60, 40, "#D52B1E") + rect(26.25, 7.5, 7.5, 25, W) + rect(17.5, 16.25, 25, 7.5, W);
    },
    at: function () { return stripesH(["#ED2939", W, "#ED2939"]); },
    li: function () {
      var g = "#FFD83D";
      return stripesH(["#002B7F", "#CE1126"]) + path("M6 15h9l.8-6.5-3.2 2.4L10.5 6.5 8.9 10.9 5.2 8.5z", g) + circle(10.5, 5.3, .9, g) + rect(6.2, 15, 8.6, .9, "#C8960C");
    },
    pl: function () { return stripesH([W, "#DC143C"]); },
    cz: function () { return stripesH([W, "#D7141A"]) + poly("0,0 30,20 0,40", "#11457E"); },
    sk: function () {
      var r = "#EE1C25", b = "#0B4EA2";
      return stripesH([W, b, r]) +
        path("M12 11h14v10q0 6.5-7 9-7-2.5-7-9z", W) + path("M12.8 11.8h12.4v9.2q0 5.6-6.2 8-6.2-2.4-6.2-8z", r) +
        poly("12.8,23 16,19.5 19,22.5 22,19.5 25.2,23 25,24 19,28.6 13,24", b) +
        rect(18.4, 13, 1.2, 10, W) + rect(16.6, 15, 4.8, 1.1, W) + rect(15.8, 18, 6.4, 1.1, W);
    },
    hu: function () { return stripesH(["#CE2939", W, "#477050"]); },
    si: function () {
      var b = "#005DA4", y = "#FFDD00";
      return stripesH([W, b, "#ED1C24"]) +
        '<path d="M10.5 3.5h11v9.5q0 5.5-5.5 7.5-5.5-2-5.5-7.5z" fill="' + b + '" stroke="#ED1C24" stroke-width=".7"/>' +
        poly("11.8,14 14.3,10 16,12 17.6,8.8 20.2,14", W) +
        '<path d="M11.8 16q1.1-.9 2.2 0t2.2 0 2.2 0 2-.1M12.5 18q1-.8 2 0t2 0 2 0 1.5-.1" stroke="#fff" stroke-width=".6" fill="none"/>' +
        star(16, 5.8, 1.3, y) + star(13.6, 8, 1.1, y) + star(18.4, 8, 1.1, y);
    },
    hr: function () {
      return stripesH(["#FF0000", W, "#171796"]) + checker(24.5, 14.5, 2.2, "#FF0000") +
        '<rect x="24.5" y="14.5" width="11" height="11" fill="none" stroke="#FF0000" stroke-width=".5"/>' +
        poly("24.5,14.5 24.5,11 26.3,12.6 28,10.3 30,12.4 32,10.3 33.7,12.6 35.5,11 35.5,14.5", "#0093DD") + rect(24.5, 14.5, 11, .8, "#FF0000");
    },
    ba: function () {
      var out = rect(0, 0, 60, 40, "#002F6C") + poly("16,0 47,0 47,40", "#FECB00"), i, t;
      for (i = 0; i < 7; i++) {
        t = 0.1 + i * 0.13;
        out += star(16 + 31 * t - 3.1, 40 * t + 2.4, 2.5, W);
      }
      return out;
    },
    rs: function () {
      return stripesH(["#C6363C", "#0C4076", W]) + eagle(20, 20, 1, W) +
        tp(20, 20, 1, "-3.2,-2.5 3.2,-2.5 3.2,3 0,6.2 -3.2,3", "#C6363C") + tp(20, 20, 1, "-.4,-1.8 .4,-1.8 .4,4.5 -.4,4.5", W) + tp(20, 20, 1, "-2,.5 2,.5 2,1.3 -2,1.3", W) +
        tp(20, 20, 1, CROWN, "#F2C200");
    },
    me: function () {
      var g = "#D4AF37";
      return rect(0, 0, 60, 40, g) + rect(1.6, 1.6, 56.8, 36.8, "#C40308") + eagle(30, 21, 1.25, g) +
        tp(30, 21, 1.25, "-3,-2 3,-2 3,3 0,6 -3,3", "#1D5E91") + tp(30, 21, 1.25, "-3,2.5 -1,0.5 1,2 3,1 3,3 0,6 -3,3", "#4E8C3A") +
        tp(30, 21, 1.25, CROWN, g);
    },
    mk: function () {
      var y = "#F8E92E", out = rect(0, 0, 60, 40, "#D82126");
      ["30,20 26,0 34,0", "30,20 26,40 34,40", "30,20 0,16 0,24", "30,20 60,16 60,24", "30,20 0,4 6,0", "30,20 54,0 60,4", "30,20 0,36 6,40", "30,20 54,40 60,36"].forEach(function (p) { out += poly(p, y); });
      return out + circle(30, 20, 7.5, "#D82126") + circle(30, 20, 6.2, y);
    },
    al: function () {
      return rect(0, 0, 60, 40, "#E41E20") + eagle(30, 20, 1.55, "#000");
    },
    bg: function () { return stripesH([W, "#00966E", "#D62612"]); },
    ro: function () { return stripesV(["#002B7F", "#FCD116", "#CE1126"]); },
    md: function () {
      var b = "#B0763A";
      return stripesV(["#0046AE", "#FFD200", "#CC092F"]) + tp(30, 20, 1.2, "0,-4 3,-5 7,-8 8,-3 6.5,0 7.5,3 4,4 1,4 1,8 -1,8 -1,4 -4,4 -7.5,3 -6.5,0 -8,-3 -7,-8 -3,-5", b) +
        circle(30, 14.4, 1.7, b) + tp(30, 20, 1.2, "-1.8,-6.5 -4,-5.8 -1.8,-4.8", b) +
        tp(30, 20, 1.2, "-2.8,-2 2.8,-2 2.8,3 0,6 -2.8,3", "#CC092F") + tp(30, 20, 1.2, "-2.8,2 2.8,2 2.8,3 0,6 -2.8,3", "#0046AE");
    },
    ua: function () { return stripesH(["#0057B7", "#FFD700"]); },
    by: function () {
      var r = "#CF101A", out = rect(0, 0, 60, 26.67, r) + rect(0, 26.67, 60, 13.33, "#007C30") + rect(0, 0, 6.67, 40, W), i, y;
      for (i = 0; i < 6; i++) {
        y = 3.33 + i * 6.67;
        out += poly("3.33," + n(y - 3.1) + " 6,"  + n(y) + " 3.33," + n(y + 3.1) + " .67," + n(y), r) + poly("3.33," + n(y - 1.3) + " 4.5," + n(y) + " 3.33," + n(y + 1.3) + " 2.17," + n(y), W);
      }
      return out;
    },
    ru: function () { return stripesH([W, "#0039A6", "#D52B1E"]); },
    ee: function () { return stripesH(["#0072CE", "#000", W]); },
    lv: function () { return stripesH(["#9E3039", W, "#9E3039"], [2, 1, 2]); },
    lt: function () { return stripesH(["#FDB913", "#006A44", "#C1272D"]); },
    mt: function () {
      var r = "#CF142B";
      return rect(0, 0, 30, 40, W) + rect(30, 0, 30, 40, r) +
        rect(5.4, 1.6, 5.2, 12.8, r) + rect(1.6, 5.4, 12.8, 5.2, r) + rect(6.4, 2.6, 3.2, 10.8, "#A6A6A6") + rect(2.6, 6.4, 10.8, 3.2, "#A6A6A6");
    },
    cy: function () {
      var g = "#4E5B31";
      return rect(0, 0, 60, 40, W) +
        poly("14,25 16,22 20,21 23,18 27,19 30,17 34,18 37,17 41,15 46,13 50,10 49,13 46,16 43,19 40,21 37,23 32,24 28,25 24,26 19,27 15,27", "#D57800") +
        '<path d="M21.5 29q8.5 6.5 17 0M23 31.5q7 4.5 14 0" stroke="' + g + '" stroke-width="1" fill="none"/>' +
        '<ellipse cx="22" cy="28.5" rx="1.6" ry=".8" fill="' + g + '"/><ellipse cx="38" cy="28.5" rx="1.6" ry=".8" fill="' + g + '"/>' +
        '<ellipse cx="25" cy="31.5" rx="1.5" ry=".7" fill="' + g + '"/><ellipse cx="35" cy="31.5" rx="1.5" ry=".7" fill="' + g + '"/>';
    },
    mc: function () { return stripesH(["#CE1126", W]); },
    sm: function () {
      var b = "#5EB6E4", g = "#3E8E41";
      return stripesH([W, b]) +
        '<path d="M23.5 15.5q-.5 8 6.5 11.5 7-3.5 6.5-11.5M25 14.5q-1 8.5 5 12" stroke="' + g + '" stroke-width="1" fill="none"/>' +
        '<path d="M26.5 14.5h7v6q0 3-3.5 4.5-3.5-1.5-3.5-4.5z" fill="' + b + '" stroke="#777" stroke-width=".5"/>' +
        rect(27.4, 17, 1.3, 3.6, W) + rect(29.4, 16.2, 1.3, 4.4, W) + rect(31.4, 17, 1.3, 3.6, W) +
        poly("26.5,14.2 26.5,11.2 28.2,12.6 30,10.5 31.8,12.6 33.5,11.2 33.5,14.2", "#E0A800");
    },
    va: function () {
      var g = "#F2C200";
      return rect(0, 0, 30, 40, "#FFE000") + rect(30, 0, 30, 40, W) +
        '<path d="M38.5 14L51.5 33" stroke="' + g + '" stroke-width="1.6" fill="none"/><path d="M51.5 14L38.5 33" stroke="#A6A6A6" stroke-width="1.6" fill="none"/>' +
        '<circle cx="38" cy="33.5" r="1.8" fill="none" stroke="#A6A6A6" stroke-width="1"/><circle cx="52" cy="33.5" r="1.8" fill="none" stroke="' + g + '" stroke-width="1"/>' +
        path("M45 22q-5 5-7 10M45 22q5 5 7 10", "none", 'stroke="#CE1126" stroke-width=".7"') +
        '<path d="M40.8 17.5q-.3-9 4.2-12.5 4.5 3.5 4.2 12.5z" fill="#E6E6E6" stroke="#999" stroke-width=".5"/>' +
        '<path d="M41.2 13.5h7.6M41 10h8M42 7h6" stroke="' + g + '" stroke-width="1" fill="none"/>' +
        circle(45, 4.4, .9, g);
    }
  });
})();
