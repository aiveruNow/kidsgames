// Urundais egne billeder (SVG-tegninger i samme stil), så spillet ikke bruger emoji.
// Bruges både i HTML (innerHTML) og på lærredet (som Image). Alle tegninger har viewBox 0 0 100 100.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.UrundaiArt = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Alle tegninger får et lys-filter (se REAL): blød skygge, form fra lys og skygge, glans og en fin kornethed, så de ser mere håndgribelige ud end flade ikoner.
  // Hver tegning får sit eget filter-id, fordi flere SVG'er ligger i samme side.
  let fid = 0;
  const REAL = (id) =>
    `<filter id="${id}" x="-12%" y="-12%" width="124%" height="130%" color-interpolation-filters="sRGB">` +
    // fine former (kanter mellem farver) og stor rundhed (hele figuren som en kuppel)
    `<feGaussianBlur in="SourceGraphic" stdDeviation="1.3" result="soft"/>` +
    `<feColorMatrix in="soft" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  .2 .3 .1 .4 0" result="h"/>` +
    `<feDiffuseLighting in="h" surfaceScale="4.5" diffuseConstant="1.05" lighting-color="#ffffff" result="d1"><feDistantLight azimuth="235" elevation="58"/></feDiffuseLighting>` +
    `<feGaussianBlur in="SourceAlpha" stdDeviation="5.5" result="dome"/>` +
    `<feDiffuseLighting in="dome" surfaceScale="17" diffuseConstant="1.05" lighting-color="#ffffff" result="d2"><feDistantLight azimuth="235" elevation="58"/></feDiffuseLighting>` +
    `<feComposite in="SourceGraphic" in2="d1" operator="arithmetic" k1="1.18" k2="0" k3="0" k4="0" result="lit1"/>` +
    `<feComposite in="lit1" in2="d2" operator="arithmetic" k1="1.18" k2="0" k3="0" k4="0" result="lit2a"/>` +
    `<feComposite in="SourceGraphic" in2="lit2a" operator="arithmetic" k1="0" k2=".3" k3=".7" k4="0" result="lit2"/>` +
    `<feSpecularLighting in="dome" surfaceScale="17" specularConstant=".5" specularExponent="22" lighting-color="#ffffff" result="sp"><feDistantLight azimuth="235" elevation="58"/></feSpecularLighting>` +
    `<feComposite in="sp" in2="SourceAlpha" operator="in" result="sp2"/>` +
    `<feComposite in="lit2" in2="sp2" operator="arithmetic" k1="0" k2="1" k3=".5" k4="0" result="shine"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7" result="nz"/>` +
    `<feColorMatrix in="nz" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="nz2"/>` +
    `<feComposite in="shine" in2="nz2" operator="arithmetic" k1="0" k2="1" k3=".14" k4="-.07" result="grain"/>` +
    `<feComposite in="grain" in2="SourceAlpha" operator="in" result="body"/>` +
    `<feGaussianBlur in="SourceAlpha" stdDeviation="1.8" result="sb"/><feOffset in="sb" dx="1" dy="2.6" result="so"/>` +
    `<feFlood flood-color="#06140c" flood-opacity=".34"/><feComposite in2="so" operator="in" result="shadow"/>` +
    `<feMerge><feMergeNode in="shadow"/><feMergeNode in="body"/></feMerge></filter>`;

  const svg = (body, attrs = "", flat = false) => {
    if (flat) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" ${attrs} aria-hidden="true" focusable="false">${body}</svg>`;
    const id = `rl${++fid}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" ${attrs} aria-hidden="true" focusable="false"><defs>${REAL(id)}</defs>` +
      `<g filter="url(#${id})" transform="translate(50 50) scale(.93) translate(-50 -50)">${body}</g></svg>`;
  };

  function mix(hex, to, k) {
    const a = parseInt(hex.slice(1), 16);
    const b = parseInt(to.slice(1), 16);
    const out = [16, 8, 0].map((s) => {
      const x = (a >> s) & 255;
      const y = (b >> s) & 255;
      return Math.round(x + (y - x) * k).toString(16).padStart(2, "0");
    });
    return `#${out.join("")}`;
  }
  const dark = (h, k = .25) => mix(h, "#000000", k);
  const light = (h, k = .35) => mix(h, "#ffffff", k);

  // ---------- Lotus (farver, kraftprik) ----------
  function lotus(color) {
    const petal = (rot, fill, sc) =>
      `<g transform="rotate(${rot} 50 80) translate(50 80) scale(${sc}) translate(-50 -80)"><path d="M50 80C31 64 33 36 50 14C67 36 69 64 50 80Z" fill="${fill}" stroke="${dark(color, .38)}" stroke-width="2.4" stroke-linejoin="round"/></g>`;
    return svg(
      `<ellipse cx="50" cy="87" rx="42" ry="9" fill="#2a8040"/><ellipse cx="50" cy="85" rx="37" ry="7" fill="#43a85a"/>` +
      petal(-66, dark(color, .2), .84) + petal(66, dark(color, .2), .84) +
      petal(-34, color, .95) + petal(34, color, .95) + petal(0, light(color, .2), 1) +
      `<path d="M50 70C45 57 46 42 50 28" stroke="${light(color, .65)}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".75"/>`
    );
  }

  // ---------- Olielampe (tal) ----------
  function diya() {
    return svg(
      `<circle cx="50" cy="38" r="30" fill="#ffd54f" opacity=".28"/>` +
      `<path d="M12 56Q50 100 88 56Z" fill="#b45309"/><path d="M22 66Q50 90 78 66Q50 76 22 66Z" fill="#92400e" opacity=".6"/>` +
      `<ellipse cx="50" cy="56" rx="38" ry="8" fill="#f59e0b"/><ellipse cx="50" cy="55" rx="30" ry="5" fill="#7c2d12"/>` +
      `<path d="M50 10C64 28 66 42 50 54C34 42 36 28 50 10Z" fill="#fb923c"/><path d="M50 26C58 36 58 45 50 52C42 45 42 36 50 26Z" fill="#fde047"/>`
    );
  }

  // ---------- Tempeltårn (gopuram) ----------
  function gopuram(flat) {
    const tiers = [
      [14, 84, 72, 14, "#e9b872"], [20, 68, 60, 16, "#d9632b"], [26, 53, 48, 15, "#e9b872"],
      [32, 40, 36, 13, "#d9632b"], [38, 29, 24, 11, "#e9b872"]
    ];
    let s = `<ellipse cx="50" cy="97" rx="46" ry="4" fill="#000" opacity=".18"/>`;
    for (const [x, y, w, h, c] of tiers) {
      s += `<rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="5" rx="2" fill="#7f1d1d"/>` +
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>` +
        `<path d="M${x} ${y + h * .35}H${x + w}M${x} ${y + h * .7}H${x + w}" stroke="#fff7e6" stroke-width="1.6" opacity=".8"/>`;
      const n = Math.max(2, Math.round(w / 14));
      for (let i = 0; i < n; i++) {
        const cx = x + (w / n) * (i + .5);
        s += `<rect x="${cx - 2.2}" y="${y + h * .4}" width="4.4" height="${h * .5}" rx="2.2" fill="#5b1c0c"/>`;
      }
    }
    s += `<path d="M38 29Q50 12 62 29Z" fill="#f59e0b"/><circle cx="50" cy="12" r="3.6" fill="#fcd34d"/>` +
      `<circle cx="40" cy="22" r="2.6" fill="#fcd34d"/><circle cx="60" cy="22" r="2.6" fill="#fcd34d"/>` +
      `<path d="M40 98V88Q50 76 60 88V98Z" fill="#2a0e06"/><path d="M38 98V88Q50 73 62 88V98" fill="none" stroke="#fcd34d" stroke-width="2.4"/>`;
    return svg(s, "", flat);
  }

  // ---------- Personer ----------
  function person(o) {
    const skin = o.skin || "#c98b4b";
    const hair = o.hair || "#1f1410";
    const sc = o.scale || 1;
    let back = "";
    let fringe = "";
    if (o.hairStyle === "bun") {
      back = `<circle cx="50" cy="13" r="9.5" fill="${hair}"/><ellipse cx="50" cy="38" rx="27" ry="27" fill="${hair}"/>`;
      fringe = true;
    } else if (o.hairStyle === "pigtails") {
      back = `<circle cx="18" cy="54" r="10" fill="${hair}"/><circle cx="82" cy="54" r="10" fill="${hair}"/><ellipse cx="50" cy="38" rx="26" ry="26" fill="${hair}"/>`;
      fringe = true;
    } else if (o.hairStyle === "short") {
      back = `<ellipse cx="50" cy="36" rx="25" ry="24" fill="${hair}"/>`;
      fringe = true;
    } else if (o.hairStyle === "tufts") {
      back = `<circle cx="26" cy="44" r="8" fill="${hair}"/><circle cx="74" cy="44" r="8" fill="${hair}"/>`;
    }
    const eyeY = 47;
    let s = `<g transform="translate(50 100) scale(${sc}) translate(-50 -100)">`;
    s += back;
    s += `<path d="M12 101C12 79 29 70 50 70S88 79 88 101Z" fill="${o.cloth}" stroke="${o.outline || "none"}" stroke-width="1.6"/>`;
    if (o.trim) s += `<path d="M50 70C58 80 72 84 88 81V101H72C72 90 62 80 50 70Z" fill="${o.trim}"/>`;
    s += `<rect x="43" y="58" width="14" height="16" rx="6" fill="${dark(skin, .14)}"/>`;
    s += `<circle cx="27" cy="48" r="4.4" fill="${skin}"/><circle cx="73" cy="48" r="4.4" fill="${skin}"/>`;
    s += `<ellipse cx="50" cy="46" rx="22.5" ry="25" fill="${skin}"/>`;
    if (fringe) s += `<path d="M27 42C25 14 75 14 73 42C65 29 35 29 27 42Z" fill="${hair}"/>`;
    if (o.earrings) s += `<circle cx="26" cy="56" r="2.8" fill="#fbbf24"/><circle cx="74" cy="56" r="2.8" fill="#fbbf24"/>`;
    s += `<ellipse cx="41" cy="${eyeY}" rx="3.1" ry="4" fill="#1b1b1b"/><ellipse cx="59" cy="${eyeY}" rx="3.1" ry="4" fill="#1b1b1b"/>`;
    s += `<circle cx="42.2" cy="${eyeY - 1.4}" r="1.1" fill="#fff"/><circle cx="60.2" cy="${eyeY - 1.4}" r="1.1" fill="#fff"/>`;
    s += `<ellipse cx="35" cy="56" rx="4.5" ry="3" fill="#e57373" opacity=".35"/><ellipse cx="65" cy="56" rx="4.5" ry="3" fill="#e57373" opacity=".35"/>`;
    if (o.glasses) s += `<circle cx="41" cy="${eyeY}" r="7.6" fill="none" stroke="#3b3b3b" stroke-width="1.8"/><circle cx="59" cy="${eyeY}" r="7.6" fill="none" stroke="#3b3b3b" stroke-width="1.8"/><path d="M48.6 ${eyeY}h2.8" stroke="#3b3b3b" stroke-width="1.8"/>`;
    if (o.bindi) s += `<circle cx="50" cy="34" r="2.7" fill="#d50000"/>`;
    if (o.moustache) s += `<path d="M37 58Q44 52 50 56Q56 52 63 58Q56 62 50 59Q44 62 37 58Z" fill="${o.moustache}"/>`;
    s += `<path d="M42 ${o.moustache ? 65 : 59}Q50 ${o.moustache ? 71 : 66} 58 ${o.moustache ? 65 : 59}" stroke="#7a2b1a" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    if (o.flowers) s += `<circle cx="44" cy="9" r="3" fill="#fff"/><circle cx="50" cy="6" r="3" fill="#fff"/><circle cx="56" cy="9" r="3" fill="#fff"/><circle cx="50" cy="10" r="2" fill="#fbbf24"/>`;
    if (o.bows) s += `<circle cx="18" cy="42" r="5" fill="#fde047"/><circle cx="82" cy="42" r="5" fill="#fde047"/>`;
    s += `</g>`;
    return svg(s);
  }

  // ---------- Dyr ----------
  const eyes = (y, dx, r = 3.2) =>
    `<circle cx="${50 - dx}" cy="${y}" r="${r}" fill="#1b1b1b"/><circle cx="${50 + dx}" cy="${y}" r="${r}" fill="#1b1b1b"/>` +
    `<circle cx="${50 - dx + 1.1}" cy="${y - 1.2}" r="1.1" fill="#fff"/><circle cx="${50 + dx + 1.1}" cy="${y - 1.2}" r="1.1" fill="#fff"/>`;

  const ANIMALS = {
    yaanai: () => svg(
      `<circle cx="21" cy="46" r="20" fill="#98a4b1"/><circle cx="21" cy="46" r="12.5" fill="#f4b6c2"/>` +
      `<circle cx="79" cy="46" r="20" fill="#98a4b1"/><circle cx="79" cy="46" r="12.5" fill="#f4b6c2"/>` +
      `<ellipse cx="50" cy="46" rx="25" ry="27" fill="#b2bdc8"/>` +
      `<path d="M39 58C39 78 37 89 46 95C53 100 62 94 58 86C56 91 53 90 52 84C51 75 61 70 61 58Z" fill="#b2bdc8" stroke="#8d99a6" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<path d="M30 70Q24 80 31 87Q34 78 38 72Z" fill="#fff8e1" stroke="#e4d4a8" stroke-width="1"/><path d="M70 70Q76 80 69 87Q66 78 62 72Z" fill="#fff8e1" stroke="#e4d4a8" stroke-width="1"/>` +
      `<path d="M32 30Q50 19 68 30L66 37Q50 27 34 37Z" fill="#f59e0b"/><circle cx="50" cy="29" r="3.2" fill="#d50000"/>` +
      eyes(44, 10, 3.4)
    ),
    poonai: () => svg(
      `<path d="M21 44L25 12L48 30Z" fill="#f59e0b"/><path d="M29 38L29 21L41 31Z" fill="#f9a8b8"/>` +
      `<path d="M79 44L75 12L52 30Z" fill="#f59e0b"/><path d="M71 38L71 21L59 31Z" fill="#f9a8b8"/>` +
      `<ellipse cx="50" cy="57" rx="31" ry="28" fill="#f59e0b"/>` +
      `<path d="M50 30V40M41 31L43 40M59 31L57 40" stroke="#b45309" stroke-width="3.2" stroke-linecap="round"/>` +
      `<ellipse cx="50" cy="68" rx="14" ry="10" fill="#fff4dd"/>` +
      `<ellipse cx="37" cy="55" rx="5.6" ry="6.6" fill="#3fa34d"/><ellipse cx="63" cy="55" rx="5.6" ry="6.6" fill="#3fa34d"/>` +
      `<ellipse cx="37" cy="55" rx="1.9" ry="5.4" fill="#111"/><ellipse cx="63" cy="55" rx="1.9" ry="5.4" fill="#111"/>` +
      `<circle cx="39" cy="52.5" r="1.3" fill="#fff"/><circle cx="65" cy="52.5" r="1.3" fill="#fff"/>` +
      `<path d="M46 63h8l-4 5.2z" fill="#ec6a8b"/><path d="M50 68.5Q46 75 40.5 72M50 68.5Q54 75 59.5 72" stroke="#7a3b13" fill="none" stroke-width="2" stroke-linecap="round"/>` +
      `<path d="M33 67L11 62M33 71L11 74M67 67L89 62M67 71L89 74" stroke="#7a3b13" stroke-width="1.6" opacity=".7" stroke-linecap="round"/>`
    ),
    naai: () => svg(
      `<ellipse cx="22" cy="52" rx="10.5" ry="23" fill="#6f4120" transform="rotate(14 22 52)"/><ellipse cx="78" cy="52" rx="10.5" ry="23" fill="#6f4120" transform="rotate(-14 78 52)"/>` +
      `<ellipse cx="50" cy="52" rx="25" ry="27" fill="#d9a468"/>` +
      `<ellipse cx="36" cy="44" rx="9" ry="10" fill="#8b5a2b" opacity=".85"/>` +
      `<ellipse cx="50" cy="68" rx="15" ry="12" fill="#f6e4c6"/>` +
      eyes(46, 11, 3.6) +
      `<ellipse cx="50" cy="61" rx="6.5" ry="4.8" fill="#2b1b12"/><ellipse cx="48" cy="59.6" rx="2" ry="1.2" fill="#fff" opacity=".6"/>` +
      `<path d="M50 66V71M50 71Q45 76 41 72M50 71Q55 76 59 72" stroke="#2b1b12" stroke-width="2" fill="none" stroke-linecap="round"/>` +
      `<path d="M45 73Q50 88 55 73Z" fill="#ec6a8b"/>`
    ),
    meen: () => svg(
      `<path d="M66 50L95 28Q91 50 95 72Z" fill="#f97316"/>` +
      `<path d="M30 30Q48 12 62 32Z" fill="#f97316"/><path d="M40 66Q52 84 62 68Z" fill="#fb923c"/>` +
      `<ellipse cx="46" cy="50" rx="34" ry="23" fill="#fb923c"/>` +
      `<path d="M52 30Q58 50 52 70M64 34Q69 50 64 66" stroke="#fff7ed" stroke-width="4.4" fill="none" stroke-linecap="round" opacity=".85"/>` +
      `<ellipse cx="40" cy="58" rx="22" ry="9" fill="#fed7aa" opacity=".6"/>` +
      `<circle cx="27" cy="45" r="6" fill="#fff"/><circle cx="25.6" cy="45" r="3.4" fill="#1b1b1b"/><circle cx="24.6" cy="43.6" r="1.1" fill="#fff"/>` +
      `<path d="M13 54Q18 59 24 55" stroke="#9a3412" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
      `<circle cx="10" cy="30" r="3" fill="#bfe3ff" opacity=".8"/><circle cx="16" cy="20" r="2" fill="#bfe3ff" opacity=".8"/>`
    ),
    paravai: () => svg(
      `<path d="M66 54L95 44L90 62L96 76L68 66Z" fill="#0d7bb8"/>` +
      `<ellipse cx="50" cy="58" rx="28" ry="23" fill="#29a8e8"/>` +
      `<ellipse cx="46" cy="66" rx="17" ry="12" fill="#e6f6ff"/>` +
      `<path d="M52 46Q76 46 74 66Q56 70 44 56Z" fill="#0d7bb8"/>` +
      `<circle cx="34" cy="38" r="16" fill="#29a8e8"/>` +
      `<path d="M31 24Q28 12 36 8Q36 18 40 24Z" fill="#f43f5e"/><path d="M36 23Q38 11 46 10Q43 19 42 25Z" fill="#fb7185"/>` +
      `<path d="M20 36L5 42L20 47Z" fill="#fbbf24"/><path d="M20 41.5L5 42L20 47Z" fill="#f59e0b"/>` +
      `<circle cx="32" cy="35" r="3.6" fill="#1b1b1b"/><circle cx="33.2" cy="33.8" r="1.2" fill="#fff"/>` +
      `<path d="M42 80V90M52 80V90M38 92H46M48 92H56" stroke="#f59e0b" stroke-width="2.6" stroke-linecap="round"/>`
    ),
    kurangu: () => svg(
      `<circle cx="17" cy="52" r="11.5" fill="#7a4a22"/><circle cx="17" cy="52" r="6.5" fill="#e8b98a"/>` +
      `<circle cx="83" cy="52" r="11.5" fill="#7a4a22"/><circle cx="83" cy="52" r="6.5" fill="#e8b98a"/>` +
      `<circle cx="50" cy="48" r="30" fill="#8d5a2b"/>` +
      `<path d="M50 46C42 30 24 38 26 54C28 68 40 76 50 76C60 76 72 68 74 54C76 38 58 30 50 46Z" fill="#f3d2a2"/>` +
      `<ellipse cx="50" cy="66" rx="17" ry="12" fill="#f8dfb8"/>` +
      eyes(50, 11, 3.5) +
      `<ellipse cx="46" cy="62" rx="1.7" ry="2.2" fill="#5b3418"/><ellipse cx="54" cy="62" rx="1.7" ry="2.2" fill="#5b3418"/>` +
      `<path d="M41 69Q50 77 59 69" stroke="#6b3a1b" stroke-width="2.6" fill="none" stroke-linecap="round"/>` +
      `<path d="M30 34Q50 22 70 34" stroke="#6a3f1c" stroke-width="4" fill="none" stroke-linecap="round"/>`
    ),
    singam: () => svg(
      `<circle cx="50" cy="52" r="40" fill="#c2570c"/><circle cx="50" cy="52" r="33" fill="#e07a1a"/>` +
      `<circle cx="24" cy="26" r="9" fill="#e07a1a"/><circle cx="76" cy="26" r="9" fill="#e07a1a"/>` +
      `<circle cx="24" cy="26" r="4.4" fill="#fcd9a6"/><circle cx="76" cy="26" r="4.4" fill="#fcd9a6"/>` +
      `<circle cx="50" cy="54" r="25" fill="#fbbf24"/>` +
      `<ellipse cx="50" cy="66" rx="14" ry="10.5" fill="#fff1c9"/>` +
      eyes(50, 11, 3.6) +
      `<path d="M44 59h12l-6 6z" fill="#7c2d12"/><path d="M50 65V70M50 70Q45 75 40 71M50 70Q55 75 60 71" stroke="#7c2d12" stroke-width="2" fill="none" stroke-linecap="round"/>` +
      `<circle cx="43" cy="72" r="1" fill="#7c2d12" opacity=".5"/><circle cx="57" cy="72" r="1" fill="#7c2d12" opacity=".5"/>`
    ),
    maadu: () => svg(
      `<path d="M30 26Q16 18 15 6Q30 8 36 22Z" fill="#f5e6c8" stroke="#d9c49a" stroke-width="1.2"/><path d="M70 26Q84 18 85 6Q70 8 64 22Z" fill="#f5e6c8" stroke="#d9c49a" stroke-width="1.2"/>` +
      `<ellipse cx="17" cy="42" rx="14" ry="7.5" fill="#8b5a2b" transform="rotate(-18 17 42)"/><ellipse cx="83" cy="42" rx="14" ry="7.5" fill="#8b5a2b" transform="rotate(18 83 42)"/>` +
      `<ellipse cx="50" cy="52" rx="25" ry="29" fill="#fffdf8" stroke="#e8e0d0" stroke-width="1.4"/>` +
      `<ellipse cx="38" cy="36" rx="11" ry="9" fill="#8b5a2b"/>` +
      `<ellipse cx="50" cy="76" rx="19" ry="12.5" fill="#f9a8b8"/>` +
      eyes(50, 12, 3.6) +
      `<ellipse cx="43" cy="76" rx="3" ry="4" fill="#9d3a52"/><ellipse cx="57" cy="76" rx="3" ry="4" fill="#9d3a52"/>` +
      `<path d="M38 66Q50 60 62 66" stroke="#f59e0b" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="1 5"/>`
    ),
    // personer
    amma: () => person({ cloth: "#c2185b", trim: "#fbbf24", hairStyle: "bun", bindi: true, earrings: true, flowers: true }),
    appa: () => person({ cloth: "#1e88e5", hairStyle: "short", moustache: "#1f1410" }),
    paatti: () => person({ cloth: "#2e7d32", trim: "#fde68a", hair: "#e5e7eb", hairStyle: "bun", glasses: true, earrings: true }),
    thaaththa: () => person({ cloth: "#f8fafc", outline: "#cbd5e1", hair: "#e5e7eb", hairStyle: "tufts", moustache: "#e5e7eb", glasses: true }),
    thambi: () => person({ cloth: "#fbbf24", hairStyle: "short", scale: .86 }),
    thangai: () => person({ cloth: "#ec4899", hairStyle: "pigtails", bindi: true, bows: true, scale: .86 })
  };

  // ---------- Flere ord: natur, mad, krop, dyr, ting og tal 11-20 ----------
  const starPts = (cx, cy, R, r) => Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r : R;
    return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ");
  const SKIN = "#e0a070";
  const SKIN_D = "#b8774a";
  const numeral = (n) => svg(
    `<circle cx="50" cy="50" r="43" fill="#fde68a" stroke="#f59e0b" stroke-width="5"/><circle cx="50" cy="50" r="35" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3 5"/>` +
    `<text x="50" y="66" font-size="${n >= 10 ? 44 : 52}" font-weight="900" text-anchor="middle" fill="#7c2d12" font-family="Trebuchet MS, Segoe UI, sans-serif">${n}</text>`
  );
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    return `<line x1="${(50 + Math.cos(a) * 30).toFixed(1)}" y1="${(50 + Math.sin(a) * 30).toFixed(1)}" x2="${(50 + Math.cos(a) * 44).toFixed(1)}" y2="${(50 + Math.sin(a) * 44).toFixed(1)}" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>`;
  }).join("");

  const MORE = {
    // Natur
    sooriyan: () => svg(rays + `<circle cx="50" cy="50" r="24" fill="#fbbf24" stroke="#f59e0b" stroke-width="3"/><circle cx="42" cy="46" r="3" fill="#7c2d12"/><circle cx="58" cy="46" r="3" fill="#7c2d12"/><path d="M40 57Q50 66 60 57" stroke="#7c2d12" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="36" cy="56" r="4" fill="#fb923c" opacity=".6"/><circle cx="64" cy="56" r="4" fill="#fb923c" opacity=".6"/>`),
    nilaa: () => svg(`<circle cx="50" cy="50" r="44" fill="#1e3a8a"/><path d="M62 16A36 36 0 1 0 62 84A28 28 0 1 1 62 16Z" fill="#fde68a" stroke="#f5c542" stroke-width="2"/><polygon points="${starPts(76, 30, 6, 2.6)}" fill="#fff"/><polygon points="${starPts(80, 62, 4.5, 2)}" fill="#fff"/><polygon points="${starPts(66, 78, 3.5, 1.6)}" fill="#fff"/>`),
    natchaththiram: () => svg(`<polygon points="${starPts(50, 52, 42, 18)}" fill="#fbbf24" stroke="#d97706" stroke-width="4" stroke-linejoin="round"/><circle cx="42" cy="52" r="3" fill="#7c2d12"/><circle cx="58" cy="52" r="3" fill="#7c2d12"/><path d="M43 61Q50 67 57 61" stroke="#7c2d12" stroke-width="3" fill="none" stroke-linecap="round"/>`),
    maram: () => svg(`<rect x="43" y="52" width="14" height="40" rx="3" fill="#8b5a2b"/><circle cx="50" cy="32" r="24" fill="#2e9a4f"/><circle cx="30" cy="50" r="18" fill="#3aaa5c"/><circle cx="70" cy="50" r="18" fill="#3aaa5c"/><circle cx="42" cy="26" r="8" fill="#5fc47e" opacity=".6"/><ellipse cx="50" cy="93" rx="30" ry="4" fill="#000" opacity=".12"/>`),
    poo: () => svg(`<path d="M50 62V94" stroke="#2e9a4f" stroke-width="5" stroke-linecap="round"/><path d="M50 84C62 70 76 76 78 82C70 90 56 90 50 84Z" fill="#43a85a"/>` + [0, 72, 144, 216, 288].map((a) => `<circle cx="${(50 + Math.cos(((a - 90) * Math.PI) / 180) * 21).toFixed(1)}" cy="${(40 + Math.sin(((a - 90) * Math.PI) / 180) * 21).toFixed(1)}" r="15" fill="#f472b6" stroke="#db2777" stroke-width="2"/>`).join("") + `<circle cx="50" cy="40" r="11" fill="#fde047" stroke="#ca8a04" stroke-width="2"/>`),
    mazhai: () => svg(`<path d="M24 54A16 16 0 0 1 30 24A22 22 0 0 1 70 26A15 15 0 0 1 76 54Z" fill="#cbd5e1" stroke="#94a3b8" stroke-width="3"/><g fill="#3b82f6"><path d="M30 62Q24 72 30 78Q36 72 30 62Z"/><path d="M50 66Q44 76 50 82Q56 76 50 66Z"/><path d="M70 62Q64 72 70 78Q76 72 70 62Z"/><path d="M40 82Q36 90 40 94Q44 90 40 82Z"/><path d="M60 84Q56 92 60 96Q64 92 60 84Z"/></g>`),
    malai: () => svg(`<circle cx="76" cy="26" r="10" fill="#fbbf24"/><path d="M4 88L34 34L56 66L68 48L96 88Z" fill="#7c9a68"/><path d="M18 88L50 22L84 88Z" fill="#8b7355"/><path d="M50 22L39 44L46 40L50 47L55 40L62 44Z" fill="#fff"/><path d="M18 88L50 22L50 88Z" fill="#000" opacity=".08"/>`),
    thee: () => svg(`<path d="M50 8C62 28 80 38 76 62C72 82 58 92 50 92C38 92 22 80 24 60C26 46 36 40 38 28C44 34 46 22 50 8Z" fill="#f97316"/><path d="M50 38C58 52 66 60 62 72C60 82 54 86 50 86C42 86 36 78 38 68C40 60 46 52 50 38Z" fill="#fde047"/><path d="M50 60C54 66 56 72 50 78C44 72 46 66 50 60Z" fill="#fff7ed"/>`),
    megam: () => svg(`<circle cx="50" cy="50" r="44" fill="#7dd3fc"/><path d="M22 66A13 13 0 0 1 28 42A18 18 0 0 1 62 40A14 14 0 0 1 80 54A12 12 0 0 1 76 66Z" fill="#fff" stroke="#bfdbfe" stroke-width="3"/>`),
    // Mad
    soru: () => svg(`<path d="M14 58Q50 -6 86 58Z" fill="#fff" stroke="#e5e7eb" stroke-width="3"/><g fill="#e5e7eb"><ellipse cx="40" cy="42" rx="5" ry="2.4" transform="rotate(-30 40 42)"/><ellipse cx="56" cy="34" rx="5" ry="2.4" transform="rotate(25 56 34)"/><ellipse cx="64" cy="48" rx="5" ry="2.4"/><ellipse cx="48" cy="52" rx="5" ry="2.4" transform="rotate(20 48 52)"/></g><path d="M8 56H92Q90 88 50 90Q10 88 8 56Z" fill="#c2410c"/><path d="M12 64H88" stroke="#fbbf24" stroke-width="3"/>`),
    paal: () => svg(`<path d="M24 16H76L70 90H30Z" fill="#e0f2fe" stroke="#93c5fd" stroke-width="3"/><path d="M27 34H73L69 88H31Z" fill="#fff"/><path d="M27 34Q50 42 73 34" fill="none" stroke="#dbeafe" stroke-width="3"/><circle cx="62" cy="14" r="0"/><path d="M60 6L66 24" stroke="#f43f5e" stroke-width="5" stroke-linecap="round"/>`),
    thanneer: () => svg(`<path d="M24 22H76L70 90H30Z" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="3"/><path d="M27 42H73L69 88H31Z" fill="#38bdf8"/><path d="M27 42Q40 36 50 42T73 42" fill="none" stroke="#bae6fd" stroke-width="3"/><circle cx="42" cy="66" r="3" fill="#e0f2fe"/><circle cx="58" cy="58" r="2.4" fill="#e0f2fe"/><path d="M50 4Q40 16 50 22Q60 16 50 4Z" fill="#38bdf8"/>`),
    idli: () => svg(`<ellipse cx="50" cy="72" rx="44" ry="16" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/><g fill="#fff" stroke="#d6dce6" stroke-width="2"><path d="M12 68Q12 44 30 44Q48 44 48 68Q30 74 12 68Z"/><path d="M52 68Q52 44 70 44Q88 44 88 68Q70 74 52 68Z"/><path d="M32 60Q32 34 50 34Q68 34 68 60Q50 66 32 60Z"/></g><path d="M38 40Q42 36 46 38" stroke="#e5e7eb" stroke-width="2" fill="none"/><ellipse cx="82" cy="78" rx="8" ry="4" fill="#dc2626"/>`),
    muttai: () => svg(`<path d="M50 8C72 8 84 44 84 62C84 80 69 93 50 93C31 93 16 80 16 62C16 44 28 8 50 8Z" fill="#fff7ed" stroke="#e7d3b0" stroke-width="3"/><ellipse cx="38" cy="38" rx="7" ry="13" fill="#fff" opacity=".8" transform="rotate(20 38 38)"/>`),
    aappil: () => svg(`<path d="M50 30C36 16 12 28 14 54C16 76 34 94 50 87C66 94 84 76 86 54C88 28 64 16 50 30Z" fill="#e11d48"/><path d="M50 30C50 20 54 12 62 8" stroke="#7c4a1e" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M58 18C66 8 80 10 82 14C76 22 64 22 58 18Z" fill="#43a047"/><ellipse cx="32" cy="48" rx="6" ry="12" fill="#fff" opacity=".35" transform="rotate(15 32 48)"/>`),
    thosai: () => svg(`<ellipse cx="50" cy="74" rx="46" ry="16" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/><path d="M6 70C14 30 60 22 94 52C80 78 30 84 6 70Z" fill="#f2b45a" stroke="#c98a2e" stroke-width="3"/><path d="M14 66C30 38 62 36 86 54" fill="none" stroke="#d99a3d" stroke-width="3"/><g fill="#c98a2e" opacity=".7"><circle cx="40" cy="62" r="2.5"/><circle cx="56" cy="56" r="2.5"/><circle cx="68" cy="64" r="2.5"/><circle cx="30" cy="68" r="2.5"/></g><ellipse cx="82" cy="30" rx="12" ry="6" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/><ellipse cx="82" cy="29" rx="9" ry="4" fill="#dc2626"/>`),
    maampazham: () => fruit("mango"),
    vaazhaippazham: () => fruit("banan"),
    thenkaai: () => fruit("kokos"),
    // Krop
    kan: () => svg(`<path d="M5 52Q50 6 95 52Q50 98 5 52Z" fill="#fff" stroke="#374151" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="52" r="20" fill="#8b5a2b"/><circle cx="50" cy="52" r="10" fill="#1b1b1b"/><circle cx="44" cy="45" r="4" fill="#fff"/><path d="M14 40L8 30M30 26L26 14M50 20V8M70 26L74 14M86 40L92 30" stroke="#374151" stroke-width="4" stroke-linecap="round"/>`),
    kaathu: () => svg(`<path d="M42 10C76 6 90 38 76 64C70 78 68 92 50 92C36 92 32 80 38 72C28 66 28 42 42 10Z" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="4" stroke-linejoin="round"/><path d="M50 28C68 28 72 50 60 62C56 68 58 78 52 80" fill="none" stroke="${SKIN_D}" stroke-width="5" stroke-linecap="round"/><path d="M40 40C44 34 52 34 54 40" fill="none" stroke="${SKIN_D}" stroke-width="4" stroke-linecap="round"/>`),
    mookku: () => svg(`<circle cx="50" cy="50" r="44" fill="#f6d3b0"/><circle cx="32" cy="30" r="4" fill="#1b1b1b"/><circle cx="68" cy="30" r="4" fill="#1b1b1b"/><path d="M50 22C46 42 34 54 34 64C34 74 42 77 50 74C58 77 66 74 66 64C66 54 54 42 50 22Z" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="3" stroke-linejoin="round"/><ellipse cx="43" cy="66" rx="3.4" ry="4.4" fill="#7c3f1c"/><ellipse cx="57" cy="66" rx="3.4" ry="4.4" fill="#7c3f1c"/>`),
    vaai: () => svg(`<path d="M8 50Q30 26 50 38Q70 26 92 50Q70 84 50 84Q30 84 8 50Z" fill="#e11d48"/><path d="M20 50Q50 70 80 50Q66 74 50 74Q34 74 20 50Z" fill="#7f1d1d"/><path d="M27 52Q50 64 73 52L70 58Q50 68 30 58Z" fill="#fff"/><path d="M30 44Q40 38 50 42" stroke="#fda4af" stroke-width="3" fill="none" stroke-linecap="round"/>`),
    kai: () => svg(`<g fill="${SKIN}" stroke="${SKIN_D}" stroke-width="3.4" stroke-linejoin="round"><rect x="30" y="12" width="11" height="48" rx="5.5"/><rect x="42.5" y="6" width="11" height="54" rx="5.5"/><rect x="55" y="10" width="11" height="50" rx="5.5"/><rect x="67" y="22" width="10" height="42" rx="5"/><path d="M30 54L16 38Q10 32 16 28Q22 24 28 30L36 40Z"/><rect x="28" y="46" width="50" height="42" rx="16"/></g><path d="M40 70Q52 78 66 68" fill="none" stroke="${SKIN_D}" stroke-width="3" stroke-linecap="round" opacity=".6"/>`),
    kaal: () => svg(`<path d="M34 28C28 40 38 54 36 68C34 84 44 94 56 92C68 90 70 76 66 64C62 52 68 40 62 28C56 18 40 18 34 28Z" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="3.4" stroke-linejoin="round"/><g fill="${SKIN}" stroke="${SKIN_D}" stroke-width="3"><circle cx="68" cy="20" r="6.5"/><circle cx="57" cy="12" r="5.6"/><circle cx="46" cy="10" r="5"/><circle cx="36" cy="13" r="4.6"/><circle cx="28" cy="20" r="4.2"/></g>`),
    // Dyr
    kuthirai: () => svg(`<path d="M32 6L42 26C28 32 18 48 12 70C10 82 20 90 32 86L42 80C50 92 72 94 82 82C90 68 82 42 72 28C68 16 60 10 50 12L42 4Z" fill="#a0612b" stroke="#7a4518" stroke-width="3" stroke-linejoin="round"/><path d="M46 14C66 12 76 30 80 46L70 54C66 40 58 28 46 24Z" fill="#3b2410"/><path d="M34 8L40 24L46 12Z" fill="#7a4518"/><circle cx="48" cy="46" r="5" fill="#fff"/><circle cx="49" cy="46" r="3" fill="#1b1b1b"/><ellipse cx="22" cy="76" rx="3.4" ry="5" fill="#4a2a10"/><path d="M16 68Q26 62 36 66" stroke="#7a4518" stroke-width="3" fill="none" stroke-linecap="round"/>`),
    kozhi: () => svg(`<path d="M72 44Q92 30 96 14Q82 22 78 36Z" fill="#c2410c"/><path d="M70 40Q94 40 96 56Q84 52 72 54Z" fill="#ea580c"/><ellipse cx="54" cy="58" rx="30" ry="24" fill="#fff7ed" stroke="#e7d3b0" stroke-width="3"/><path d="M42 60Q56 48 72 60Q60 78 42 60Z" fill="#fde68a" stroke="#e7c98a" stroke-width="2"/><circle cx="30" cy="34" r="15" fill="#fff7ed" stroke="#e7d3b0" stroke-width="3"/><path d="M24 22Q28 10 34 18Q38 8 42 20Z" fill="#dc2626"/><path d="M16 34L4 38L16 42Z" fill="#fb923c"/><path d="M22 46Q26 56 32 46Z" fill="#dc2626"/><circle cx="26" cy="32" r="3" fill="#1b1b1b"/><path d="M46 82V92M60 82V92M42 94H50M56 94H64" stroke="#fb923c" stroke-width="3" stroke-linecap="round"/>`),
    vaaththu: () => svg(`<path d="M6 74Q50 62 94 74Q80 94 50 94Q20 94 6 74Z" fill="#38bdf8" opacity=".5"/><ellipse cx="54" cy="64" rx="30" ry="20" fill="#fde047" stroke="#eab308" stroke-width="3"/><path d="M78 56Q94 46 96 36Q86 44 76 46Z" fill="#fde047" stroke="#eab308" stroke-width="3"/><circle cx="34" cy="38" r="15" fill="#fde047" stroke="#eab308" stroke-width="3"/><path d="M22 36Q6 36 8 44Q16 48 24 44Z" fill="#fb923c"/><circle cx="32" cy="34" r="3" fill="#1b1b1b"/><path d="M44 62Q58 54 70 64Q60 74 44 62Z" fill="#facc15" stroke="#eab308" stroke-width="2"/>`),
    muyal: () => svg(`<ellipse cx="36" cy="26" rx="10" ry="26" fill="#fff" stroke="#e5e7eb" stroke-width="3" transform="rotate(-12 36 26)"/><ellipse cx="36" cy="26" rx="5" ry="19" fill="#fbcfe8" transform="rotate(-12 36 26)"/><ellipse cx="64" cy="26" rx="10" ry="26" fill="#fff" stroke="#e5e7eb" stroke-width="3" transform="rotate(12 64 26)"/><ellipse cx="64" cy="26" rx="5" ry="19" fill="#fbcfe8" transform="rotate(12 64 26)"/><circle cx="50" cy="64" r="28" fill="#fff" stroke="#e5e7eb" stroke-width="3"/><circle cx="39" cy="58" r="3.4" fill="#1b1b1b"/><circle cx="61" cy="58" r="3.4" fill="#1b1b1b"/><path d="M46 66h8l-4 5z" fill="#f472b6"/><path d="M50 71Q46 77 41 74M50 71Q54 77 59 74" stroke="#9d3a52" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="46" y="75" width="3.6" height="6" rx="1" fill="#fff" stroke="#d1d5db" stroke-width="1"/><rect x="50.6" y="75" width="3.6" height="6" rx="1" fill="#fff" stroke="#d1d5db" stroke-width="1"/>`),
    paambu: () => svg(`<path d="M18 80C6 66 20 52 40 56C64 62 74 44 56 34C40 26 52 12 70 18" fill="none" stroke="#2e7d32" stroke-width="15" stroke-linecap="round"/><path d="M18 80C6 66 20 52 40 56C64 62 74 44 56 34C40 26 52 12 70 18" fill="none" stroke="#66bb6a" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 12"/><circle cx="78" cy="20" r="12" fill="#2e7d32"/><circle cx="76" cy="16" r="3" fill="#fff"/><circle cx="76" cy="16" r="1.6" fill="#1b1b1b"/><path d="M88 24L98 28M88 24L98 20" stroke="#dc2626" stroke-width="2.4" stroke-linecap="round"/><path d="M18 80L10 88L22 86Z" fill="#2e7d32"/>`),
    aamai: () => svg(`<ellipse cx="46" cy="84" rx="34" ry="5" fill="#000" opacity=".12"/><circle cx="86" cy="58" r="11" fill="#9bbb3a" stroke="#6b8a1e" stroke-width="3"/><circle cx="89" cy="55" r="2.6" fill="#1b1b1b"/><ellipse cx="28" cy="80" rx="9" ry="7" fill="#9bbb3a" stroke="#6b8a1e" stroke-width="3"/><ellipse cx="64" cy="80" rx="9" ry="7" fill="#9bbb3a" stroke="#6b8a1e" stroke-width="3"/><path d="M10 74Q10 24 46 24Q82 24 82 74Z" fill="#4d7c0f" stroke="#365a0a" stroke-width="3"/><path d="M46 28V74M24 50H68M28 36L40 50L28 66M64 36L52 50L64 66" fill="none" stroke="#a3c43c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`),
    // Ting
    veedu: () => svg(`<rect x="20" y="46" width="60" height="44" fill="#fde68a" stroke="#d6a93a" stroke-width="3"/><path d="M8 52L50 12L92 52Z" fill="#dc2626" stroke="#991b1b" stroke-width="3" stroke-linejoin="round"/><rect x="42" y="62" width="16" height="28" rx="3" fill="#7c4a1e"/><rect x="26" y="56" width="12" height="12" fill="#7dd3fc" stroke="#d6a93a" stroke-width="2"/><rect x="62" y="56" width="12" height="12" fill="#7dd3fc" stroke="#d6a93a" stroke-width="2"/><rect x="66" y="20" width="9" height="16" fill="#92400e"/>`),
    puththakam: () => svg(`<rect x="16" y="12" width="68" height="78" rx="5" fill="#2563eb" stroke="#1e3a8a" stroke-width="3"/><rect x="22" y="18" width="58" height="66" rx="3" fill="#fff" stroke="#cbd5e1" stroke-width="2"/><path d="M30 34H70M30 46H70M30 58H62" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/><path d="M62 12V34L67 29L72 34V12Z" fill="#f43f5e"/><rect x="16" y="12" width="9" height="78" rx="4" fill="#1d4ed8"/>`),
    panthu: () => svg(`<circle cx="50" cy="50" r="42" fill="#fff" stroke="#374151" stroke-width="3"/><path d="M50 50L50 8A42 42 0 0 1 86.4 29Z" fill="#ef4444"/><path d="M50 50L86.4 29A42 42 0 0 1 86.4 71Z" fill="#fde047"/><path d="M50 50L86.4 71A42 42 0 0 1 50 92Z" fill="#3b82f6"/><path d="M50 50L50 92A42 42 0 0 1 13.6 71Z" fill="#22c55e"/><path d="M50 50L13.6 71A42 42 0 0 1 13.6 29Z" fill="#ef4444"/><path d="M50 50L13.6 29A42 42 0 0 1 50 8Z" fill="#fde047"/><circle cx="50" cy="50" r="42" fill="none" stroke="#374151" stroke-width="3"/><ellipse cx="34" cy="30" rx="9" ry="14" fill="#fff" opacity=".4" transform="rotate(40 34 30)"/>`),
    kaar: () => svg(`<path d="M6 66L12 50Q18 38 32 36L40 24Q44 20 52 20H64Q72 20 78 30L84 38Q96 42 96 54V68H6Z" fill="#ef4444" stroke="#991b1b" stroke-width="3" stroke-linejoin="round"/><path d="M44 28H54V38H38Z" fill="#bae6fd"/><path d="M58 28H64Q68 28 72 38H58Z" fill="#bae6fd"/><circle cx="28" cy="70" r="13" fill="#1f2937"/><circle cx="28" cy="70" r="5.5" fill="#9ca3af"/><circle cx="76" cy="70" r="13" fill="#1f2937"/><circle cx="76" cy="70" r="5.5" fill="#9ca3af"/><rect x="88" y="52" width="8" height="6" rx="2" fill="#fde047"/>`),
    padagu: () => svg(`<path d="M50 10V62" stroke="#7c4a1e" stroke-width="4" stroke-linecap="round"/><path d="M54 14L88 58H54Z" fill="#fff" stroke="#cbd5e1" stroke-width="2.4" stroke-linejoin="round"/><path d="M46 22L18 58H46Z" fill="#ef4444" stroke="#991b1b" stroke-width="2.4" stroke-linejoin="round"/><path d="M8 62H92L78 84H22Z" fill="#92400e" stroke="#5b2c0a" stroke-width="3" stroke-linejoin="round"/><path d="M0 88Q12 80 24 88T48 88T72 88T96 88" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>`),
    kudai: () => svg(`<path d="M6 52C6 24 28 8 50 8S94 24 94 52C85 44 77 44 72 52C66 44 58 44 50 52C42 44 34 44 28 52C23 44 15 44 6 52Z" fill="#ef4444" stroke="#991b1b" stroke-width="3" stroke-linejoin="round"/><path d="M50 8C40 22 36 38 50 52C64 38 60 22 50 8Z" fill="#fde047"/><path d="M50 52V80Q50 92 38 88" stroke="#4b5563" stroke-width="6" fill="none" stroke-linecap="round"/>`),
    mani: () => svg(`<circle cx="50" cy="10" r="5" fill="none" stroke="#b45309" stroke-width="3"/><path d="M50 14Q64 14 68 34Q72 56 86 70H14Q28 56 32 34Q36 14 50 14Z" fill="#f59e0b" stroke="#b45309" stroke-width="3" stroke-linejoin="round"/><path d="M14 70H86" stroke="#b45309" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="80" r="8" fill="#b45309"/><path d="M38 30Q36 46 28 58" stroke="#fde68a" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>`),
    thoppi: () => svg(`<path d="M14 66Q14 22 52 22Q86 22 86 66Z" fill="#2563eb" stroke="#1e3a8a" stroke-width="3" stroke-linejoin="round"/><path d="M70 60Q98 58 96 74Q80 72 62 70Z" fill="#1e40af" stroke="#1e3a8a" stroke-width="3" stroke-linejoin="round"/><circle cx="52" cy="22" r="5" fill="#fde047"/><path d="M14 66H70" stroke="#fde047" stroke-width="4"/><path d="M30 34Q38 28 48 28" stroke="#93c5fd" stroke-width="4" fill="none" stroke-linecap="round"/>`),
    kadikaaram: () => svg(`<circle cx="26" cy="20" r="11" fill="#f59e0b" stroke="#b45309" stroke-width="3"/><circle cx="74" cy="20" r="11" fill="#f59e0b" stroke="#b45309" stroke-width="3"/><circle cx="50" cy="54" r="38" fill="#fff" stroke="#ef4444" stroke-width="7"/>` + Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return `<line x1="${(50 + Math.cos(a) * 29).toFixed(1)}" y1="${(54 + Math.sin(a) * 29).toFixed(1)}" x2="${(50 + Math.cos(a) * 33).toFixed(1)}" y2="${(54 + Math.sin(a) * 33).toFixed(1)}" stroke="#374151" stroke-width="3" stroke-linecap="round"/>`; }).join("") + `<path d="M50 54V32M50 54L64 62" stroke="#1f2937" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="54" r="4" fill="#ef4444"/>`)
  };
  for (let n = 1; n <= 20; n++) MORE[`n${n}`] = () => numeral(n);
  // Farveprøve (bruges til farverne i stedet for en blomst): blank, rund dråbe med kant og glans
  const swatch = (color) => {
    const edge = color.toLowerCase() === "#ffffff" ? "#b6bcc8" : dark(color, .35);
    return svg(`<ellipse cx="50" cy="91" rx="30" ry="5" fill="#000" opacity=".14"/><circle cx="50" cy="50" r="40" fill="${color}" stroke="${edge}" stroke-width="5"/><circle cx="50" cy="50" r="40" fill="url(#sw)" opacity=".0"/><ellipse cx="36" cy="33" rx="13" ry="8" fill="#fff" opacity="${color.toLowerCase() === "#ffffff" ? ".0" : ".45"}" transform="rotate(-35 36 33)"/><path d="M22 62A30 30 0 0 0 76 70" fill="none" stroke="#000" stroke-width="5" opacity=".1" stroke-linecap="round"/>`);
  };
  Object.assign(ANIMALS, MORE);

  // ---------- Bladene i junglen (baggrund) ----------
  function leaf(x, y, len, rot, color) {
    const w = len * .16;
    let veins = "";
    for (let i = 1; i < 6; i++) {
      const px = (len * i) / 6.4;
      veins += `M${px.toFixed(1)} 0L${(px + len * .1).toFixed(1)} ${(-w * .8).toFixed(1)}M${px.toFixed(1)} 0L${(px + len * .1).toFixed(1)} ${(w * .8).toFixed(1)}`;
    }
    return `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0C${len * .2} ${-w} ${len * .75} ${-w * 1.2} ${len} 0C${len * .75} ${w * 1.2} ${len * .2} ${w} 0 0Z" fill="${color}"/>` +
      `<path d="M0 0L${len} 0${veins}" stroke="${dark(color, .3)}" stroke-width="${Math.max(1, len * .012)}" fill="none" opacity=".6"/></g>`;
  }

  // Jungle med tempeltårne i baggrunden. c1 = øverst, c2 = nederst. wide = bredformat (vandret skærm).
  function scene(c1, c2, wide) {
    const W = wide ? 800 : 400;
    const H = wide ? 400 : 800;
    const g1 = "#1f7a3d";
    const g2 = "#2e9a4f";
    const g3 = "#145a2c";
    const corner = (x, y, sx, sy) => [
      [x, y + sy * 20, 260, 35, g3], [x, y + sy * 60, 230, 62, g1], [x, y, 200, 15, g2]
    ].map(([px, py, l, r, c]) => {
      // spejlet i hjørnet: sx/sy er -1 eller 1
      const rot = (sx < 0 ? 180 - r : r) * (sy < 0 ? -1 : 1);
      return leaf(px, py, l, sx < 0 && sy < 0 ? -(180 - r) : rot, c);
    }).join("");
    const inner = gopuram(true).replace(/<svg[^>]*>|<\/svg>/g, "");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
      `<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>` +
      `<rect width="${W}" height="${H}" fill="url(#sg)"/>` +
      `<g opacity=".2" transform="translate(${W / 2 - 100} ${H - 214}) scale(2)">${inner}</g>` +
      `<g opacity=".12" transform="translate(${W * .1} ${H - 150}) scale(1.2)">${inner}</g>` +
      `<g opacity=".12" transform="translate(${W * .72} ${H - 150}) scale(1.2)">${inner}</g>` +
      corner(-10, -10, 1, 1) + corner(W + 10, -10, -1, 1) + corner(-10, H + 10, 1, -1) + corner(W + 10, H + 10, -1, -1) +
      `</svg>`;
  }

  // Spøgelse i en farve (bruges i spørgsmålet efter et fang)
  function ghost(color) {
    return svg(
      `<path d="M14 90V48C14 27 30 12 50 12S86 27 86 48V90L74 79L62 90L50 79L38 90L26 79Z" fill="${color}"/>` +
      `<path d="M14 90V48C14 27 30 12 50 12S86 27 86 48" fill="none" stroke="${dark(color, .3)}" stroke-width="3"/>` +
      `<ellipse cx="37" cy="46" rx="11" ry="13" fill="#fff"/><ellipse cx="63" cy="46" rx="11" ry="13" fill="#fff"/>` +
      `<circle cx="40" cy="49" r="5.6" fill="#1b1b1b"/><circle cx="66" cy="49" r="5.6" fill="#1b1b1b"/>`
    );
  }

  // Frugt (bonus): mango, banan, kokosnød, jackfrugt
  function fruit(kind) {
    const f = {
      mango: `<path d="M52 18C60 8 74 12 72 24" stroke="#2e7d32" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M62 14C72 6 84 12 80 22C72 24 66 20 62 14Z" fill="#43a047"/><path d="M50 22C74 20 90 44 80 68C72 86 44 90 28 76C12 62 22 26 50 22Z" fill="#f5a623"/><path d="M62 28C82 36 86 58 74 74C80 56 74 38 62 28Z" fill="#e8590c" opacity=".55"/><ellipse cx="38" cy="42" rx="7" ry="12" fill="#fff" opacity=".3" transform="rotate(25 38 42)"/>`,
      banan: `<path d="M18 30C22 66 54 86 86 70C82 62 76 62 70 64C46 70 34 54 30 28Z" fill="#fde047" stroke="#ca8a04" stroke-width="3" stroke-linejoin="round"/><path d="M18 30L30 28L28 20L20 22Z" fill="#7c5a1a"/><path d="M86 70L80 62L90 64Z" fill="#7c5a1a"/>`,
      kokos: `<circle cx="50" cy="52" r="34" fill="#7b4a22"/><circle cx="50" cy="52" r="34" fill="none" stroke="#5a3416" stroke-width="3"/><circle cx="40" cy="44" r="5" fill="#2b1608"/><circle cx="60" cy="44" r="5" fill="#2b1608"/><ellipse cx="50" cy="60" rx="5" ry="6" fill="#2b1608"/><ellipse cx="36" cy="34" rx="8" ry="5" fill="#fff" opacity=".25" transform="rotate(-30 36 34)"/>`,
      jakfrugt: `<ellipse cx="50" cy="54" rx="32" ry="38" fill="#9bbb3a" stroke="#6b8a1e" stroke-width="3"/><g fill="#6b8a1e"><circle cx="36" cy="36" r="3.4"/><circle cx="52" cy="30" r="3.4"/><circle cx="66" cy="40" r="3.4"/><circle cx="42" cy="52" r="3.4"/><circle cx="60" cy="56" r="3.4"/><circle cx="34" cy="68" r="3.4"/><circle cx="50" cy="74" r="3.4"/><circle cx="66" cy="72" r="3.4"/></g><path d="M50 16V8" stroke="#6b8a1e" stroke-width="5" stroke-linecap="round"/>`
    };
    return svg(f[kind] || f.mango);
  }

  // Nøgler: "lotus:#hex", "ghost:#hex", "fruit:<navn>", "diya", "gopuram" eller et ord-id (dyr og personer)
  function get(key) {
    if (key.startsWith("lotus:")) return lotus(key.slice(6));
    if (key.startsWith("swatch:")) return swatch(key.slice(7));
    if (key.startsWith("ghost:")) return ghost(key.slice(6));
    if (key.startsWith("fruit:")) return fruit(key.slice(6));
    if (key === "diya") return diya();
    if (key === "gopuram") return gopuram();
    if (ANIMALS[key]) return ANIMALS[key]();
    return svg(`<circle cx="50" cy="50" r="30" fill="#ccc"/>`);
  }

  const dataUri = (markup) => `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`;

  return { get, lotus, swatch, diya, gopuram, ghost, scene, dataUri, mix, dark, light };
});
