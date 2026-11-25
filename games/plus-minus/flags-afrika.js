// Flag til Talbasket: 49 afrikanske landeflag (tilføjes til flags.js). Kun simple former, ingen id'er, defs, clipPath eller tekst.
(function () {
  "use strict";
  var F = (typeof module === "object" && module.exports) ? require("./flags.js") : window.TalbasketFlag;
  var h = F.h, n = h.n, rect = h.rect, poly = h.poly, path = h.path, circle = h.circle, star = h.star, burst = h.burst, stripesH = h.stripesH, stripesV = h.stripesV, W = h.W;

  // Halvmåne åben mod højre: ydre cirkel (cx,cy,R) minus indre cirkel (centrum forskudt dx, radius r).
  function crescent(cx, cy, R, dx, r, fill, extra) {
    var x0 = (R * R - r * r + dx * dx) / (2 * dx), y = Math.sqrt(R * R - x0 * x0), px = n(cx + x0);
    return path("M" + px + " " + n(cy - y) + "A" + R + " " + R + " 0 1 0 " + px + " " + n(cy + y) + "A" + r + " " + r + " 0 " + (x0 - dx > 0 ? 1 : 0) + " 1 " + px + " " + n(cy - y) + "z", fill, extra);
  }
  // Diagonalt bånd fra nederste venstre til øverste højre hjørne; v er den lodrette halvbredde.
  function band(v, fill) {
    return poly("0," + n(40 - v) + " " + n(60 - 1.5 * v) + ",0 60,0 60," + n(v) + " " + n(1.5 * v) + ",40 0,40", fill);
  }
  // Skråkors (hvidt andreaskors) med lodret halvbredde v.
  function saltire(v, fill) {
    return poly("0,0 " + n(1.5 * v) + ",0 60," + n(40 - v) + " 60,40 " + n(60 - 1.5 * v) + ",40 0," + n(v), fill) +
      poly("60,0 " + n(60 - 1.5 * v) + ",0 0," + n(40 - v) + " 0,40 " + n(1.5 * v) + ",40 60," + n(v), fill);
  }
  function line(x1, y1, x2, y2, stroke, w) {
    return '<path d="M' + n(x1) + " " + n(y1) + "L" + n(x2) + " " + n(y2) + '" stroke="' + stroke + '" stroke-width="' + w + '" fill="none"/>';
  }

  F.add({
    tn: function () {
      var r = "#E70013";
      return rect(0, 0, 60, 40, r) + circle(30, 20, 11, W) + crescent(29, 20, 7.6, 2, 6.2, r) + star(32.4, 20, 3.8, r, 0.382, 90);
    },
    dz: function () {
      var r = "#D21034";
      return rect(0, 0, 30, 40, "#006633") + rect(30, 0, 30, 40, W) + crescent(29.5, 20, 10, 3, 8, r) + star(34.5, 20, 4.8, r, 0.382, 90);
    },
    ly: function () {
      return stripesH(["#E70013", "#000", "#239E46"], [1, 2, 1]) + crescent(28, 20, 5.8, 1.6, 4.8, W) + star(33.2, 20, 2.8, W, 0.382, 90);
    },
    sd: function () {
      return stripesH(["#D21034", W, "#000"]) + poly("0,0 22,20 0,40", "#007229");
    },
    ss: function () {
      return stripesH(["#000", W, "#DA121D", W, "#078930"], [12, 2, 12, 2, 12]) + poly("0,0 26,20 0,40", "#0F47AF") + star(7.5, 20, 5, "#FCDD09");
    },
    et: function () {
      var y = "#FCDD09", b = "#0F47AF";
      return stripesH(["#078930", y, "#DA121D"]) + circle(30, 20, 9, b) + star(30, 20.2, 7.4, y) + star(30, 20.2, 4.2, b, 0.45);
    },
    er: function () {
      var y = "#FFC726";
      return poly("0,0 60,0 60,20", "#12AD2B") + poly("0,40 60,40 60,20", "#4189DD") + poly("0,0 60,20 0,40", "#EA0437") +
        circle(14, 20, 6.5, "none", 'stroke="' + y + '" stroke-width="1.8" stroke-dasharray="2.4 1.2"') + line(14, 13, 14, 27.5, y, 1) +
        '<ellipse cx="14" cy="22" rx="2.4" ry="3.6" fill="' + y + '"/>';
    },
    dj: function () {
      return rect(0, 0, 60, 20, "#6AB2E7") + rect(0, 20, 60, 20, "#12AD2B") + poly("0,0 27,20 0,40", W) + star(8, 20, 4.5, "#D7141A");
    },
    so: function () {
      return rect(0, 0, 60, 40, "#4189DD") + star(30, 20.6, 8.6, W);
    },
    ug: function () {
      var k = "#000", y = "#FCDC04", r = "#D90000", g = "#4A4A4A";
      return stripesH([k, y, r, k, y, r]) + circle(30, 20, 7.2, W) +
        '<ellipse cx="29.5" cy="22.2" rx="3.4" ry="2" fill="' + g + '"/>' +
        line(31.5, 21.2, 32.6, 16.6, g, 1.1) + circle(32.8, 15.8, 1, g) + path("M31.6 14.6l1.4-1.4.9 1.5z", r) +
        line(28, 23.8, 27, 27, g, .6) + line(30, 23.8, 30.4, 27.2, g, .6) + path("M26 21.5l-2.5 1 3 .6z", g);
    },
    tz: function () {
      return rect(0, 0, 60, 40, "#1EB53A") + poly("60,0 60,40 0,40", "#00A3DD") + band(7.4, "#FCD116") + band(5.4, "#000");
    },
    rw: function () {
      var y = "#E5BE01";
      return stripesH(["#00A9E0", "#FAD201", "#20603D"], [2, 1, 1]) + burst(50, 10, 6.6, y, 24, 0.62, 0) + circle(50, 10, 3.2, y);
    },
    bi: function () {
      return rect(0, 0, 60, 40, "#1EB53A") + poly("0,0 60,0 30,20", "#CE1126") + poly("0,40 60,40 30,20", "#CE1126") + saltire(3.3, W) +
        circle(30, 20, 8.3, W) + burst(30, 15.9, 3.6, "#1EB53A", 5, 0.382, 0) + burst(26.4, 22, 3.6, "#1EB53A", 5, 0.382, 0) + burst(33.6, 22, 3.6, "#1EB53A", 5, 0.382, 0) +
        star(30, 15.9, 2.6, "#CE1126") + star(26.4, 22, 2.6, "#CE1126") + star(33.6, 22, 2.6, "#CE1126");
    },
    cd: function () {
      return rect(0, 0, 60, 40, "#007FFF") + band(7.4, "#F7D618") + band(5.8, "#CE1021") + star(9.5, 9.5, 5.6, "#F7D618");
    },
    cg: function () {
      return rect(0, 0, 60, 40, "#FBDE4A") + poly("0,0 48,0 0,32", "#009543") + poly("60,8 60,40 12,40", "#DC241F");
    },
    ga: function () { return stripesH(["#009E60", "#FCD116", "#3A75C4"]); },
    gq: function () {
      return stripesH(["#3E9A00", W, "#E32118"]) + poly("0,0 14,20 0,40", "#0073CE") +
        path("M25.5 14.5h9v6q0 4-4.5 5.8-4.5-1.8-4.5-5.8z", "#B9B9B9") + circle(30, 18, 2.8, "#2E8B2E") + rect(29.5, 20, 1, 4, "#6B4423");
    },
    cm: function () {
      return stripesV(["#007A5E", "#CE1126", "#FCD116"]) + star(30, 20.5, 6, "#FCD116");
    },
    cf: function () {
      return stripesH(["#003082", W, "#289728", "#FFCE00"]) + rect(25.5, 0, 9, 40, "#D21034") + star(7.5, 5, 3.8, "#FFCE00");
    },
    td: function () { return stripesV(["#002664", "#FECB00", "#C60C30"]); },
    ne: function () {
      return stripesH(["#E05206", W, "#0DB02B"]) + circle(30, 20, 4.6, "#E05206");
    },
    ng: function () { return stripesV(["#008751", W, "#008751"]); },
    bj: function () {
      return rect(0, 0, 60, 20, "#FCD116") + rect(0, 20, 60, 20, "#E8112D") + rect(0, 0, 24, 40, "#008751");
    },
    tg: function () {
      var g = "#006A4E";
      return stripesH([g, "#FFCE00", g, "#FFCE00", g]) + rect(0, 0, 24, 24, "#D21034") + star(12, 12.3, 7, W);
    },
    gh: function () {
      return stripesH(["#CE1126", "#FCD116", "#006B3F"]) + star(30, 20.8, 8.6, "#000");
    },
    ci: function () { return stripesV(["#F77F00", W, "#009E60"]); },
    bf: function () {
      return stripesH(["#EF2B2D", "#009E49"]) + star(30, 20.8, 8.6, "#FCD116");
    },
    ml: function () { return stripesV(["#14B53A", "#FCD116", "#CE1126"]); },
    mr: function () {
      var y = "#FFC400";
      return rect(0, 0, 60, 40, "#00A95C") + rect(0, 0, 60, 5.5, "#D01C1F") + rect(0, 34.5, 60, 5.5, "#D01C1F") +
        '<g transform="rotate(-90 30 22)">' + crescent(30, 22, 10.5, 3, 9, y) + "</g>" + star(30, 17.5, 3.6, y);
    },
    sn: function () {
      return stripesV(["#00853F", "#FDEF42", "#E31B23"]) + star(30, 20.8, 6.2, "#00853F");
    },
    gm: function () {
      return stripesH(["#CE1126", W, "#0C1C8C", W, "#3A7728"], [6, 1, 4, 1, 6]);
    },
    gw: function () {
      return rect(0, 0, 60, 20, "#FCD116") + rect(0, 20, 60, 20, "#009E49") + rect(0, 0, 20, 40, "#CE1126") + star(10, 20.8, 6.2, "#000");
    },
    gn: function () { return stripesV(["#CE1126", "#FCD116", "#009460"]); },
    sl: function () { return stripesH(["#1EB53A", W, "#0072C6"]); },
    lr: function () {
      var cols = [], i;
      for (i = 0; i < 11; i++) cols.push(i % 2 ? W : "#BF0A30");
      return stripesH(cols) + rect(0, 0, 18.18, 18.18, "#002868") + star(9.09, 9.5, 6.2, W);
    },
    cv: function () {
      var out = stripesH(["#003893", W, "#CF2027", W, "#003893"], [21, 2, 4, 2, 11]), i, a;
      for (i = 0; i < 10; i++) {
        a = i * 36;
        out += star(22.5 + 9.5 * Math.sin(a * Math.PI / 180), 25 - 9.5 * Math.cos(a * Math.PI / 180), 1.9, "#F7D116", 0.382, a);
      }
      return out;
    },
    st: function () {
      return stripesH(["#12AD2B", "#FFCE00", "#12AD2B"], [1, 2, 1]) + poly("0,0 22,20 0,40", "#D21034") + star(34, 20.6, 4.8, "#000") + star(47, 20.6, 4.8, "#000");
    },
    ao: function () {
      var y = "#FFCB00";
      return stripesH(["#CC092F", "#000"]) +
        path("M22 27a8 8 0 0 1 8-9", "none", 'stroke="' + y + '" stroke-width="3" stroke-dasharray="1.3 1.1"') +
        '<path d="M24 29q7-1 12-9" stroke="' + y + '" stroke-width="1.3" fill="none"/>' +
        path("M36 20q2.5-3.5 1.5-6-3 3.5-1.5 6z", y) + star(30, 15.5, 4.6, y) + circle(25.8, 27.2, 1.2, y);
    },
    zm: function () {
      var o = "#EF7D00";
      return rect(0, 0, 60, 40, "#198A00") + rect(42, 18, 6, 22, "#DE2010") + rect(48, 18, 6, 22, "#000") + rect(54, 18, 6, 22, o) +
        poly("40,12 46,10 49,12.5 51,7 53,12.5 56,10 60,12 54,13 52,16 52,18 50,18 50,16 48,13", o);
    },
    mw: function () {
      var i, d = "", a;
      for (i = -7; i <= 7; i++) {
        a = i * 11.5 * Math.PI / 180;
        d += "M" + n(30 + 6.6 * Math.sin(a)) + " " + n(13.33 - 6.6 * Math.cos(a)) + "L" + n(30 + 9.2 * Math.sin(a)) + " " + n(13.33 - 9.2 * Math.cos(a));
      }
      return stripesH(["#000", "#CE1126", "#339E35"]) + '<path d="' + d + '" stroke="#CE1126" stroke-width=".8" fill="none"/>' +
        path("M24.5 13.33a5.5 5.5 0 0 1 11 0z", "#CE1126");
    },
    mz: function () {
      var y = "#FCE100";
      return stripesH(["#007168", W, "#000", W, y], [6, 1, 6, 1, 6]) + poly("0,0 21,20 0,40", "#D21034") +
        line(3.5, 17.5, 12.5, 28, "#000", 1.1) + line(3.5, 28, 12.5, 17.5, y, 1.1) +
        poly("5.2,21 8,20.5 10.8,21 10.8,25 8,24.5 5.2,25", W) + star(8, 13.8, 3.8, y);
    },
    zw: function () {
      var y = "#FFD200", r = "#D40000";
      return stripesH(["#006400", y, r, "#000", r, y, "#006400"]) + poly("0,0 24,20 0,40", "#000") + poly("0,2.2 21.4,20 0,37.8", W) +
        star(8.3, 20.2, 7, r) + '<ellipse cx="8.3" cy="20.4" rx="2.6" ry="1.2" fill="' + y + '"/>' + circle(10.8, 19.2, .9, y) + path("M5.8 20.4l-2.3 1.4 2.9-.1z", y);
    },
    bw: function () {
      return stripesH(["#75AADB", W, "#000", W, "#75AADB"], [9, 1, 4, 1, 9]);
    },
    na: function () {
      var g = "#FFCE00", b = "#003580";
      return rect(0, 0, 60, 40, b) + poly("60,0 60,40 0,40", "#009543") + band(8.2, W) + band(6, "#D21034") +
        burst(10, 9.5, 7, g, 12, 0.5, 0) + circle(10, 9.5, 3.6, b) + circle(10, 9.5, 2.8, g);
    },
    ls: function () {
      return stripesH(["#00209F", W, "#009543"], [3, 4, 3]) + path("M30 12.6q1.3.3 1.8 1.9l4.2 11.5H24l4.2-11.5q.5-1.6 1.8-1.9z", "#000") + circle(30, 12, 1.1, "#000");
    },
    sz: function () {
      var k = "#000";
      return stripesH(["#3E5EB9", "#FFD900", "#B10C0C", "#FFD900", "#3E5EB9"], [9, 1.5, 19, 1.5, 9]) +
        line(16.5, 25.5, 43.5, 14.5, k, .8) + line(17, 14.5, 43, 25.5, "#FFD900", .8) +
        '<ellipse cx="30" cy="20" rx="9.5" ry="4.6" fill="#fff" stroke="' + k + '" stroke-width=".5"/>' + path("M30 15.4A9.5 4.6 0 0 0 30 24.6z", k);
    },
    mu: function () { return stripesH(["#EA2839", "#1A206D", "#FFD500", "#00A551"]); },
    sc: function () {
      return poly("0,40 0,0 20,0", "#003F87") + poly("0,40 20,0 40,0", "#FCD856") + poly("0,40 40,0 60,0 60,13.33", "#D62828") +
        poly("0,40 60,13.33 60,26.67", W) + poly("0,40 60,26.67 60,40", "#007A3D");
    },
    km: function () {
      var out = stripesH(["#FFC61E", W, "#CE1126", "#3A75C4"]) + poly("0,0 21,20 0,40", "#3D8E33") +       crescent(7.8, 20, 7.4, 2.2, 6.2, W), i;
            for (i = 0; i < 4; i++) out += star(13.2, 14 + i * 4, 1.6, W);
      return out;
    }
  });
})();
