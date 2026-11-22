// Løven Aris egne billeder (SVG-tegninger) til ordene med 2 bogstaver, så spillet ikke bruger emoji, der ikke siger noget.
// Alle tegninger har viewBox 0 0 100 100 og bruges som innerHTML. Ord uden tegning bruger emoji fra ord.js.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.LoevenArt = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const INK = "#3b2a1a";
  const SKIN = "#fcd5b0";
  const svg = (body) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">` +
    `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;

  // Tyk streg med kant: en mørk streg bagved og en farvet streg foran
  const thick = (d, w, color) =>
    `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 5}"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
  const starPts = (cx, cy, R, r, n = 5) => Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI / n) * i - Math.PI / 2;
    const rad = i % 2 ? r : R;
    return `${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)}`;
  }).join(" ");
  const sparkle = (cx, cy, s, color = "#fde047") =>
    `<polygon points="${starPts(cx, cy, s, s * .34, 4)}" fill="${color}" stroke-width="2"/>`;
  const shadow = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="4" fill="#000" opacity=".12" stroke="none"/>`;
  const digit = (t, x, y, size, color) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="900" font-size="${size}" fill="${color}" stroke="${INK}" stroke-width="2.4" paint-order="stroke">${t}</text>`;
  const eye = (x, y, r = 4) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}" stroke="none"/><circle cx="${x - r * .3}" cy="${y - r * .35}" r="${r * .38}" fill="#fff" stroke="none"/>`;

  const ART = {
    // Bi: stribet krop, vinger og følehorn
    BI: () => svg(
      `<ellipse cx="38" cy="30" rx="12" ry="20" transform="rotate(-25 38 30)" fill="#e0f2fe"/>` +
      `<ellipse cx="60" cy="30" rx="12" ry="20" transform="rotate(22 60 30)" fill="#e0f2fe"/>` +
      `<path d="M76 58L92 58L78 64Z" fill="${INK}"/>` +
      `<ellipse cx="52" cy="60" rx="28" ry="22" fill="#fbbf24"/>` +
      `<path d="M42 40Q38 60 42 79" stroke-width="8" stroke-linecap="butt" fill="none"/>` +
      `<path d="M58 38.5Q54 60 58 80.5" stroke-width="8" stroke-linecap="butt" fill="none"/>` +
      `<path d="M72 44Q70 60 72 75" stroke-width="7" stroke-linecap="butt" fill="none"/>` +
      `<ellipse cx="52" cy="60" rx="28" ry="22" fill="none"/>` +
      `<path d="M20 50Q14 38 12 30M30 48Q30 36 34 28" fill="none"/>` +
      `<circle cx="12" cy="29" r="3.5" fill="${INK}"/><circle cx="34" cy="27" r="3.5" fill="${INK}"/>` +
      `<circle cx="26" cy="58" r="15" fill="#fbbf24"/>` +
      eye(21, 54, 4) + eye(32, 54, 4) +
      `<path d="M20 64Q26 70 33 64" fill="none"/>` + shadow(50, 92, 26)
    ),

    // Ko: kohoved med horn, pletter og lyserød mule
    KO: () => svg(
      `<ellipse cx="14" cy="44" rx="12" ry="7" transform="rotate(-18 14 44)" fill="#fff"/>` +
      `<ellipse cx="86" cy="44" rx="12" ry="7" transform="rotate(18 86 44)" fill="#fff"/>` +
      `<path d="M33 24Q27 8 38 8Q42 16 43 24Z" fill="#fde68a"/><path d="M67 24Q73 8 62 8Q58 16 57 24Z" fill="#fde68a"/>` +
      `<ellipse cx="50" cy="48" rx="28" ry="31" fill="#fff"/>` +
      `<path d="M28 30Q36 20 46 24Q48 36 40 44Q28 44 25 38Z" fill="${INK}" stroke="none"/>` +
      `<path d="M70 52Q80 48 76 62Q72 66 68 62Z" fill="${INK}" stroke="none"/>` +
      `<ellipse cx="50" cy="68" rx="20" ry="14" fill="#f9a8c0"/>` +
      `<ellipse cx="42" cy="68" rx="3.2" ry="4.4" fill="${INK}" stroke="none"/><ellipse cx="58" cy="68" rx="3.2" ry="4.4" fill="${INK}" stroke="none"/>` +
      eye(37, 42, 4.5) + eye(63, 42, 4.5)
    ),

    // So: grisehoved
    SO: () => svg(
      `<path d="M20 30L30 12L44 24Z" fill="#f472b6"/><path d="M80 30L70 12L56 24Z" fill="#f472b6"/>` +
      `<circle cx="50" cy="54" r="34" fill="#f9a8c0"/>` +
      `<ellipse cx="50" cy="64" rx="17" ry="13" fill="#f472b6"/>` +
      `<ellipse cx="44" cy="64" rx="3" ry="5" fill="${INK}" stroke="none"/><ellipse cx="56" cy="64" rx="3" ry="5" fill="${INK}" stroke="none"/>` +
      eye(34, 46, 4.5) + eye(66, 46, 4.5) +
      `<circle cx="24" cy="60" r="5" fill="#fb7185" opacity=".5" stroke="none"/><circle cx="76" cy="60" r="5" fill="#fb7185" opacity=".5" stroke="none"/>`
    ),

    // Is: vaffelis med to kugler og kirsebær
    IS: () => svg(
      `<path d="M30 54L70 54L50 94Z" fill="#e5a550"/>` +
      `<path d="M38 54L54 80M50 54L58 70M62 54L46 82M32 66L66 66" stroke-width="2" fill="none" opacity=".7"/>` +
      `<path d="M25 54Q22 40 36 38Q50 32 64 38Q78 40 75 54Q68 62 62 56Q56 63 50 56Q44 63 38 56Q32 62 25 54Z" fill="#f9a8c0"/>` +
      `<circle cx="50" cy="31" r="17" fill="#a7f3d0"/>` +
      `<path d="M50 14Q52 6 60 4" fill="none"/><circle cx="50" cy="13" r="6" fill="#ef4444"/>` +
      `<ellipse cx="44" cy="26" rx="4" ry="2.6" fill="#fff" opacity=".7" stroke="none"/>`
    ),

    // To: tallet 2 og to æbler
    TO: () => {
      const apple = (x) =>
        `<circle cx="${x}" cy="74" r="16" fill="#ef4444"/><path d="M${x} 58Q${x} 52 ${x + 4} 49" fill="none"/>` +
        `<path d="M${x + 1} 56Q${x + 10} 48 ${x + 16} 54Q${x + 8} 60 ${x + 1} 56Z" fill="#4ade80" stroke-width="2.4"/>` +
        `<ellipse cx="${x - 6}" cy="70" rx="3" ry="5" fill="#fff" opacity=".5" stroke="none"/>`;
      return svg(digit("2", 50, 46, 50, "#2563eb") + apple(28) + apple(72));
    },

    // Ni: tallet 9 og ni prikker
    NI: () => {
      const dots = [];
      for (const y of [58, 74, 90]) for (const x of [32, 50, 68]) dots.push(`<circle cx="${x}" cy="${y}" r="6.5" fill="#fbbf24" stroke-width="2.4"/>`);
      return svg(digit("9", 50, 44, 50, "#2563eb") + dots.join(""));
    },

    // Tå: en fod med den store tå fremhævet
    TAA: () => svg(
      `<circle cx="62" cy="36" r="10" fill="${SKIN}"/><circle cx="46" cy="32" r="7" fill="${SKIN}"/>` +
      `<circle cx="36" cy="35" r="6" fill="${SKIN}"/><circle cx="29" cy="42" r="5.5" fill="${SKIN}"/><circle cx="25" cy="51" r="4.6" fill="${SKIN}"/>` +
      `<path d="M34 95Q20 74 24 56Q28 44 44 43Q68 42 72 58Q77 80 68 95Z" fill="${SKIN}"/>` +
      `<ellipse cx="62" cy="32" rx="5.5" ry="3.8" fill="#fff" opacity=".7" stroke="none"/>` +
      `<circle cx="62" cy="36" r="19" fill="none" stroke="#ef4444" stroke-width="4" stroke-dasharray="9 6"/>`
    ),

    // Hø: halmballe med bånd og strå
    HOE: () => svg(
      `<path d="M26 46L22 26M38 44L40 22M52 44L56 20M66 46L74 26M78 50L90 34" stroke="#d99a1c" stroke-width="3.4" fill="none"/>` +
      `<rect x="12" y="44" width="76" height="42" rx="8" fill="#f5c542"/>` +
      `<path d="M20 56H80M18 66H82M20 76H80" stroke="#d99a1c" stroke-width="2.4" fill="none"/>` +
      `<path d="M36 44V86M64 44V86" stroke="#92400e" stroke-width="5" fill="none"/>` + shadow(50, 92, 40)
    ),

    // Sø: lille sø med siv, åkande og bakke
    SOE: () => svg(
      `<path d="M0 54Q24 22 52 44Q76 26 100 50V60H0Z" fill="#86c46a" stroke="none"/>` +
      `<ellipse cx="50" cy="70" rx="45" ry="25" fill="#86c46a"/>` +
      `<ellipse cx="50" cy="70" rx="38" ry="19" fill="#5eb7f5"/>` +
      `<path d="M26 68Q34 63 42 68M58 76Q68 71 76 76M48 62Q54 58 60 62" stroke="#e0f2fe" stroke-width="2.6" fill="none"/>` +
      `<ellipse cx="68" cy="66" rx="8" ry="3.8" fill="#4ade80" stroke-width="2"/><circle cx="68" cy="64.5" r="2.6" fill="#f472b6" stroke-width="1.6"/>` +
      `<path d="M14 66L12 38M22 70L24 44" fill="none" stroke="#4d7c0f"/><rect x="9.5" y="26" width="5" height="13" rx="2.5" fill="#92400e" stroke-width="2"/><rect x="21.5" y="32" width="5" height="13" rx="2.5" fill="#92400e" stroke-width="2"/>` +
      `<g stroke-width="2.4"><circle cx="78" cy="22" r="9" fill="#fde047"/></g>`
    ),

    // By: huse og kirketårn
    BY: () => svg(
      `<path d="M0 88H100" fill="none"/>` +
      `<rect x="6" y="52" width="28" height="36" fill="#f87171"/><path d="M3 52L20 34L37 52Z" fill="#7c3a2a"/>` +
      `<rect x="38" y="32" width="24" height="56" fill="#fde68a"/><path d="M36 32L50 8L64 32Z" fill="#475569"/><circle cx="50" cy="42" r="6" fill="#fff" stroke-width="2.4"/><path d="M50 38V42H53" fill="none" stroke-width="2"/>` +
      `<rect x="66" y="46" width="30" height="42" fill="#60a5fa"/><path d="M63 46L81 28L99 46Z" fill="#7c3a2a"/>` +
      `<g fill="#fff" stroke-width="2.2"><rect x="12" y="60" width="9" height="9"/><rect x="24" y="60" width="7" height="9"/><rect x="72" y="54" width="9" height="9"/><rect x="85" y="54" width="8" height="9"/><rect x="72" y="70" width="9" height="9"/></g>` +
      `<rect x="45" y="62" width="10" height="26" rx="5" fill="#92400e" stroke-width="2.4"/><rect x="84" y="70" width="9" height="18" fill="#92400e" stroke-width="2.2"/><rect x="14" y="74" width="9" height="14" fill="#92400e" stroke-width="2.2"/>`
    ),

    // Du: barn der peger på dig
    DU: () => svg(
      `<path d="M10 96Q10 66 36 64Q62 66 62 96Z" fill="#3b82f6"/>` +
      `<circle cx="36" cy="36" r="22" fill="${SKIN}"/>` +
      `<path d="M14 34Q12 12 36 12Q60 12 58 34Q50 24 36 24Q22 24 14 34Z" fill="#7c4a1e"/>` +
      eye(28, 38, 3.8) + eye(44, 38, 3.8) +
      `<path d="M28 48Q36 55 44 48" fill="none"/>` +
      thick("M52 72L70 62", 12, "#3b82f6") +
      `<circle cx="74" cy="60" r="8.5" fill="${SKIN}"/>` +
      thick("M78 56L94 44", 6.4, SKIN) +
      `<path d="M90 28L94 34M97 42L92 40M84 24L86 30" stroke="#f59e0b" stroke-width="2.6" fill="none"/>`
    ),

    // Te: kop med damp og tepose
    TE: () => svg(
      `<ellipse cx="50" cy="84" rx="38" ry="8" fill="#e5e7eb"/>` +
      thick("M78 50Q98 50 92 64Q88 74 72 70", 6, "#60a5fa") +
      `<path d="M20 44H78Q78 78 50 80Q22 78 20 44Z" fill="#60a5fa"/>` +
      `<path d="M21 56H77" stroke="#fff" stroke-width="4" fill="none"/>` +
      `<ellipse cx="49" cy="44" rx="29" ry="6" fill="#b45309"/>` +
      `<path d="M38 44Q32 32 26 28" fill="none" stroke-width="2"/><rect x="14" y="19" width="14" height="12" rx="2" fill="#fef08a" stroke-width="2.2" transform="rotate(-15 21 25)"/>` +
      `<path d="M52 34Q44 26 52 20Q60 14 52 6M66 34Q58 26 66 20Q74 14 66 8" fill="none" stroke="#9ca3af" stroke-width="3"/>`
    ),

    // Fe: fe med vinger, kjole og tryllestav
    FE: () => svg(
      `<ellipse cx="28" cy="46" rx="16" ry="26" transform="rotate(25 28 46)" fill="#bae6fd" opacity=".95"/>` +
      `<ellipse cx="72" cy="46" rx="16" ry="26" transform="rotate(-25 72 46)" fill="#bae6fd" opacity=".95"/>` +
      `<path d="M44 84V95M56 84V95" fill="none" stroke-width="4"/>` +
      thick("M56 54L74 40", 6, SKIN) +
      `<path d="M50 50L32 88H68Z" fill="#f472b6"/>` +
      `<circle cx="50" cy="34" r="13" fill="${SKIN}"/>` +
      `<path d="M36 34Q34 16 50 17Q66 16 64 34Q58 26 50 26Q42 26 36 34Z" fill="#f5b942"/><circle cx="36" cy="30" r="6" fill="#f5b942"/>` +
      eye(45, 36, 2.6) + eye(56, 36, 2.6) +
      `<path d="M45 42Q50 46 55 42" fill="none" stroke-width="2.2"/>` +
      `<polygon points="${starPts(80, 32, 11, 4.8)}" fill="#fde047" stroke-width="2.4"/>` + sparkle(92, 52, 5) + sparkle(66, 20, 4)
    ),

    // Sy: nål med tråd, stof og trådrulle
    SY: () => svg(
      `<rect x="8" y="52" width="84" height="38" rx="5" fill="#fda4af"/>` +
      `<path d="M16 71H84" stroke="#fff" stroke-width="3.4" stroke-dasharray="7 6" fill="none"/>` +
      `<rect x="10" y="14" width="22" height="30" rx="3" fill="#fde68a"/><rect x="7" y="12" width="28" height="6" rx="2" fill="#a16207"/><rect x="7" y="40" width="28" height="6" rx="2" fill="#a16207"/>` +
      `<path d="M12 24Q21 28 30 24M12 32Q21 36 30 32" stroke="#ef4444" stroke-width="3.4" fill="none"/>` +
      `<path d="M72 12L46 64" stroke="#cbd5e1" stroke-width="5" fill="none"/>` +
      `<path d="M72 12L46 64" stroke="#f8fafc" stroke-width="2" fill="none"/>` +
      `<ellipse cx="73" cy="16" rx="2.4" ry="4.4" fill="#fff" stroke-width="2" transform="rotate(25 73 16)"/>` +
      `<path d="M74 14Q96 30 80 46Q66 56 52 52" stroke="#ef4444" stroke-width="3.4" fill="none"/>`
    ),

    // Le: ansigt der griner højt
    LE: () => svg(
      `<circle cx="50" cy="50" r="40" fill="#fde047"/>` +
      `<path d="M25 42Q33 31 41 42M59 42Q67 31 75 42" fill="none" stroke-width="4.4"/>` +
      `<path d="M22 56Q50 98 78 56Z" fill="#7f1d1d"/>` +
      `<path d="M25 58Q50 68 75 58L72 52Q50 59 28 52Z" fill="#fff" stroke-width="2"/>` +
      `<ellipse cx="50" cy="75" rx="13" ry="7" fill="#f87171" stroke-width="2"/>` +
      `<circle cx="22" cy="54" r="6" fill="#fb7185" opacity=".5" stroke="none"/><circle cx="78" cy="54" r="6" fill="#fb7185" opacity=".5" stroke="none"/>` +
      `<path d="M10 44Q4 54 10 58Q16 54 10 44Z" fill="#7dd3fc" stroke-width="2"/><path d="M90 44Q84 54 90 58Q96 54 90 44Z" fill="#7dd3fc" stroke-width="2"/>`
    ),

    // Se: to store øjne
    SE: () => svg(
      `<ellipse cx="28" cy="56" rx="21" ry="26" fill="#fff"/><ellipse cx="72" cy="56" rx="21" ry="26" fill="#fff"/>` +
      `<circle cx="33" cy="58" r="12.5" fill="#38bdf8"/><circle cx="77" cy="58" r="12.5" fill="#38bdf8"/>` +
      `<circle cx="34" cy="58" r="6.4" fill="${INK}" stroke="none"/><circle cx="78" cy="58" r="6.4" fill="${INK}" stroke="none"/>` +
      `<circle cx="30" cy="53" r="3" fill="#fff" stroke="none"/><circle cx="74" cy="53" r="3" fill="#fff" stroke="none"/>` +
      `<path d="M8 24Q26 10 46 22M54 22Q74 10 92 24" fill="none" stroke-width="4.6"/>`
    ),

    // Gå: barn der går
    GAA: () => svg(
      shadow(50, 96, 36) +
      thick("M48 60L36 92", 9, "#1d4ed8") + thick("M48 60L64 90", 9, "#2563eb") +
      `<ellipse cx="32" cy="94" rx="9" ry="4.4" fill="#ef4444" stroke-width="2.4"/><ellipse cx="68" cy="92" rx="9" ry="4.4" fill="#ef4444" stroke-width="2.4"/>` +
      thick("M50 38L66 52", 7, SKIN) + thick("M50 38L34 52", 7, SKIN) +
      thick("M50 32L48 62", 16, "#f59e0b") +
      `<circle cx="52" cy="20" r="13" fill="${SKIN}"/>` +
      `<path d="M39 20Q38 6 52 6Q66 6 65 20Q60 13 52 13Q46 13 39 20Z" fill="#7c4a1e"/>` +
      eye(58, 22, 2.8) + `<path d="M56 29Q60 31 63 28" fill="none" stroke-width="2.2"/>`
    ),

    // Ja: grøn cirkel med hak
    JA: () => svg(
      `<circle cx="50" cy="50" r="42" fill="#4ade80"/>` +
      `<path d="M28 52L44 68L73 34" fill="none" stroke="${INK}" stroke-width="19"/>` +
      `<path d="M28 52L44 68L73 34" fill="none" stroke="#fff" stroke-width="12"/>`
    ),

    // Ny: skinnende ny sko med glimt
    NY: () => svg(
      `<path d="M14 72V52Q14 46 22 46L38 44Q44 32 56 30L60 46Q80 52 90 62V74Z" fill="#ef4444"/>` +
      `<path d="M38 44Q44 52 60 46" fill="none" stroke-width="2.4"/>` +
      `<path d="M46 40L52 46M52 36L58 42" stroke="#fff" stroke-width="3.2" fill="none"/>` +
      `<path d="M14 66Q40 70 90 66" fill="none" stroke="#b91c1c" stroke-width="2.4"/>` +
      `<path d="M12 72H92Q96 82 86 86H20Q8 84 12 72Z" fill="#fff"/>` +
      sparkle(16, 28, 10) + sparkle(84, 30, 8) + sparkle(66, 12, 6) + sparkle(30, 12, 5)
    ),

    // Op: ballon der stiger til vejrs med pil opad
    OP: () => svg(
      `<path d="M38 66L32 74H44Z" fill="#b91c1c"/>` +
      `<path d="M38 74Q30 82 38 88Q46 94 38 98" fill="none" stroke-width="2.4"/>` +
      `<ellipse cx="38" cy="38" rx="26" ry="30" fill="#ef4444"/>` +
      `<ellipse cx="28" cy="26" rx="5.5" ry="9" fill="#fff" opacity=".55" stroke="none" transform="rotate(20 28 26)"/>` +
      `<path d="M82 6L98 28H88V68H76V28H66Z" fill="#22c55e"/>`
    ),

    // Ål: slangeformet fisk i vand
    AAL: () => svg(
      `<g transform="translate(2 0) scale(.95)">` +
      `<path d="M4 90Q16 84 28 90T52 90T76 90T104 88" fill="none" stroke="#38bdf8" stroke-width="4"/>` +
      `<path d="M8 62C20 36 32 38 44 54S68 72 80 52S90 42 92 44" transform="translate(0 -9)" fill="none" stroke="#4d7c0f" stroke-width="4" stroke-dasharray="4 4"/>` +
      thick("M8 62C20 36 32 38 44 54S68 72 80 52S90 42 92 44", 10, "#6b8e5a") +
      `<path d="M8 63C20 38 32 40 44 56S68 74 80 54" fill="none" stroke="#d9e8c4" stroke-width="2.6" transform="translate(0 2)"/>` +
      `<ellipse cx="92" cy="45" rx="9" ry="7.5" fill="#6b8e5a" transform="rotate(-20 92 45)"/>` +
      eye(93, 41, 3.2) + `<path d="M91 49Q95 51 99 47" fill="none" stroke-width="2.2"/>` +
      `</g>`
    ),

    // Ur: vækkeur med ringeklokker
    UR: () => svg(
      `<path d="M26 22Q16 10 28 8Q40 10 38 22Z" fill="#fbbf24"/><path d="M74 22Q84 10 72 8Q60 10 62 22Z" fill="#fbbf24"/>` +
      `<path d="M30 84L22 96M70 84L78 96" fill="none" stroke-width="6"/>` +
      `<circle cx="50" cy="54" r="38" fill="#ef4444"/>` +
      `<circle cx="50" cy="54" r="29" fill="#fff"/>` +
      `<path d="M50 30V35M50 73V78M26 54H31M69 54H74" fill="none" stroke-width="3.4"/>` +
      `<path d="M50 54V38M50 54L64 62" fill="none" stroke-width="4.6"/>` +
      `<circle cx="50" cy="54" r="3.6" fill="${INK}"/>` +
      `<path d="M6 40Q2 32 6 24M94 40Q98 32 94 24" fill="none" stroke="#f59e0b" stroke-width="3"/>`
    ),

    // El: lyspære med stråler
    EL: () => svg(
      `<path d="M50 4V12M18 18L24 24M82 18L76 24M6 46H14M94 46H86" stroke="#f59e0b" stroke-width="4" fill="none"/>` +
      `<path d="M50 14C28 14 20 32 26 48C30 58 38 62 38 72H62C62 62 70 58 74 48C80 32 72 14 50 14Z" fill="#fde047"/>` +
      `<polygon points="53,24 42,46 50,46 46,64 60,40 52,40" fill="#f59e0b" stroke-width="2.4"/>` +
      `<ellipse cx="38" cy="30" rx="4" ry="8" fill="#fff" opacity=".6" stroke="none" transform="rotate(20 38 30)"/>` +
      `<rect x="38" y="72" width="24" height="8" rx="2" fill="#9ca3af"/><rect x="40" y="80" width="20" height="7" rx="2" fill="#6b7280"/>` +
      `<path d="M44 94H56" stroke-width="5" fill="none"/>`
    ),

    // Ro: barn der sover i seng
    RO: () => svg(
      `<rect x="6" y="46" width="6" height="46" rx="2" fill="#92400e"/><rect x="88" y="62" width="6" height="30" rx="2" fill="#92400e"/>` +
      `<rect x="6" y="78" width="88" height="10" rx="3" fill="#b45309"/>` +
      `<rect x="12" y="52" width="32" height="24" rx="10" fill="#fff"/>` +
      `<circle cx="28" cy="58" r="15" fill="${SKIN}"/>` +
      `<path d="M13 56Q12 40 28 42Q44 42 42 54Q34 48 26 50Q18 52 13 56Z" fill="#7c4a1e"/>` +
      `<path d="M21 60Q24 63 27 60M31 60Q34 63 37 60" fill="none" stroke-width="2.4"/>` +
      `<path d="M26 67Q29 69 32 67" fill="none" stroke-width="2.2"/>` +
      `<path d="M34 62Q40 54 56 56L90 58Q94 60 92 78H30Q28 70 34 62Z" fill="#60a5fa"/>` +
      `<path d="M50 58V78M66 58V78M80 58V78" stroke="#bfdbfe" stroke-width="3" fill="none"/>` +
      digit("Z", 60, 36, 20, "#fde047") + digit("Z", 74, 24, 26, "#fde047") + digit("Z", 90, 12, 14, "#fde047")
    ),

    // Kø: tre børn i kø foran en kiosk
    KOE: () => {
      const kid = (x, shirt, hair) =>
        `<path d="M${x - 9} 92Q${x - 9} 62 ${x} 60Q${x + 9} 62 ${x + 9} 92Z" fill="${shirt}"/>` +
        `<circle cx="${x}" cy="46" r="11" fill="${SKIN}"/>` +
        `<path d="M${x - 11} 44Q${x - 12} 32 ${x} 33Q${x + 12} 32 ${x + 11} 44Q${x + 6} 38 ${x} 38Q${x - 6} 38 ${x - 11} 44Z" fill="${hair}"/>` +
        eye(x + 3, 47, 2.4);
      return svg(
        `<path d="M2 92H98" fill="none"/>` +
        kid(14, "#f59e0b", "#7c4a1e") + kid(38, "#ef4444", "#fbbf24") + kid(62, "#22c55e", "#1f1410") +
        `<rect x="76" y="46" width="22" height="46" fill="#fde68a"/>` +
        `<path d="M74 46H100L96 30H78Z" fill="#ef4444"/><path d="M82 30L80 46M90 30L92 46" stroke="#fff" stroke-width="3" fill="none"/>` +
        `<rect x="80" y="56" width="14" height="10" fill="#fff" stroke-width="2.2"/>`
      );
    },

    // Tø: snemand der smelter i solen
    TOE: () => svg(
      `<ellipse cx="46" cy="90" rx="38" ry="7" fill="#7dd3fc"/>` +
      `<path d="M20 90Q18 74 28 70H64Q76 74 72 90Z" fill="#fff"/>` +
      `<circle cx="46" cy="58" r="22" fill="#fff"/>` +
      `<circle cx="46" cy="38" r="15" fill="#fff"/>` +
      `<path d="M32 28L58 22L56 14L36 18Z" fill="${INK}" stroke-width="2.4"/>` +
      `<path d="M46 40L62 44L46 46Z" fill="#f97316" stroke-width="2.4"/>` +
      eye(41, 34, 2.4) + eye(52, 33, 2.4) +
      `<circle cx="46" cy="56" r="2.6" fill="${INK}" stroke="none"/><circle cx="46" cy="66" r="2.6" fill="${INK}" stroke="none"/>` +
      `<path d="M26 54Q18 50 12 52" fill="none"/>` +
      `<circle cx="84" cy="20" r="9" fill="#fde047"/>` +
      `<path d="M72 74Q68 80 72 84Q76 80 72 74Z" fill="#38bdf8" stroke-width="2"/><path d="M60 80Q57 85 60 88Q63 85 60 80Z" fill="#38bdf8" stroke-width="2"/>`
    ),

    // Av: plaster med smertestjerner
    AV: () => svg(
      `<g transform="rotate(-28 50 54)">` +
      `<rect x="8" y="38" width="84" height="32" rx="16" fill="#f4c28f"/>` +
      `<rect x="34" y="38" width="32" height="32" fill="#fde7c8"/>` +
      `<g fill="#d99a63" stroke="none"><circle cx="18" cy="48" r="2"/><circle cx="18" cy="60" r="2"/><circle cx="26" cy="54" r="2"/><circle cx="82" cy="48" r="2"/><circle cx="82" cy="60" r="2"/><circle cx="74" cy="54" r="2"/></g>` +
      `<path d="M34 38V70M66 38V70" fill="none" stroke-width="2.4"/>` +
      `</g>` +
      `<polygon points="${starPts(18, 18, 12, 5, 6)}" fill="#fde047" stroke-width="2.4"/>` +
      `<polygon points="${starPts(84, 82, 11, 4.6, 6)}" fill="#fde047" stroke-width="2.4"/>` +
      `<path d="M78 16L88 8M86 26L96 24M14 84L6 92" stroke="#ef4444" stroke-width="3.4" fill="none"/>`
    ),

    // Fy: ansigt der synes, noget er klamt
    FY: () => svg(
      `<circle cx="50" cy="54" r="38" fill="#bef264"/>` +
      `<path d="M26 40L40 46L26 52M74 40L60 46L74 52" fill="none" stroke-width="4.4"/>` +
      `<path d="M26 72Q34 64 42 72T58 72T74 72" fill="none" stroke-width="3.8"/>` +
      `<path d="M52 72Q52 92 62 90Q70 88 66 72Z" fill="#fb7185" stroke-width="2.6"/>` +
      `<path d="M30 14Q24 22 30 28Q36 34 30 40M50 8Q44 16 50 22Q56 28 50 34M70 14Q64 22 70 28Q76 34 70 40" fill="none" stroke="#65a30d" stroke-width="3" transform="translate(0 -4) scale(1 .6) translate(0 12)"/>` +
      `<path d="M84 34Q78 44 84 48Q90 44 84 34Z" fill="#7dd3fc" stroke-width="2"/>`
    )
  };

  function get(word) {
    const draw = ART[word.replace(/Å/g, "AA").replace(/Ø/g, "OE").replace(/Æ/g, "AE")];
    return draw ? draw() : null;
  }

  return { get };
});
