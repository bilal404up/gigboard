// Draws an original illustrated avatar for each demo person.
// Writes public/avatars/<username>.svg. Run once: node scripts/make-avatars.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "public/avatars";
const INK = "#1E1F22";

function mix(a, b, t) {
  const parse = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const ch = (x, y) => Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
  return `#${ch(r1, r2)}${ch(g1, g2)}${ch(b1, b2)}`;
}
const darken = (hex, t) => mix(hex, "#000000", t);
const lighten = (hex, t) => mix(hex, "#FFFFFF", t);
const circles = (list, fill) => list.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`).join("");

const BUZZ = "M34 38C35 28 40.5 24.5 48 24.5C55.5 24.5 61 28 62 38C58.5 33.5 53.5 31.5 48 31.5C42.5 31.5 37.5 33.5 34 38Z";

// Each style returns hair drawn behind the head (back) and over it (front).
const HAIR = {
  short: (c) => ({ back: "", front: `<path d="M33.5 41C32.5 28 39.5 23 48 23C56.5 23 63.5 28 62.5 41C60.5 34.5 55.5 31.5 48 31.5C40.5 31.5 35.5 34.5 33.5 41Z" fill="${c}"/>` }),
  side: (c) => ({ back: "", front: `<path d="M33.5 42C31.5 27.5 39 21.5 49 22C58.5 22.5 64.5 28 62.5 41C61.5 36 59 33 55 31.5C49 29.5 41.5 32 37 36.5C35.5 38 34.3 39.8 33.5 42Z" fill="${c}"/>` }),
  buzz: (c) => ({ back: "", front: `<path d="${BUZZ}" fill="${c}"/>` }),
  curly: (c) => ({
    back: "",
    front: `<path d="${BUZZ}" fill="${c}"/>` + circles([[37, 31, 6], [42, 26.5, 6.5], [48.5, 24.5, 7], [55, 26.5, 6.5], [59.5, 31, 6], [34.5, 37, 4.5], [62, 37, 4.5]], c),
  }),
  long: (c) => ({
    back: `<path d="M30 46C28.5 27 38 20 48 20C58 20 67.5 27 66 46L68 76C60 80 36 80 28 76Z" fill="${c}"/>`,
    front: `<path d="M33.5 43C32 27.5 40 21.5 48.5 22C57 22.5 64.5 28 62.5 43C60 35 54.5 30.5 47 30.5C41 30.5 36 35 33.5 43Z" fill="${c}"/>`,
  }),
  wavy: (c) => ({
    back: `<path d="M29.5 47C27.5 27 38 19.5 48 19.5C58.5 19.5 68.5 27 66.5 47C69.5 54 65.5 60.5 68.5 68C61 77 35 77 27.5 68C30.5 60.5 26.5 54 29.5 47Z" fill="${c}"/>`,
    front: `<path d="M33.5 43C33 28 40.5 22 48 23C55.5 22 63 28 62.5 43C60.5 35 55.5 30.5 48 29.5C40.5 30.5 35.5 35 33.5 43Z" fill="${c}"/>`,
  }),
  bob: (c) => ({
    back: `<path d="M30.5 51C28.5 28.5 38 20.5 48 20.5C58 20.5 67.5 28.5 65.5 51C65.5 57 63 60 60 60C58.5 60 58 57 59 52L37 52C38 57 37.5 60 36 60C33 60 30.5 57 30.5 51Z" fill="${c}"/>`,
    front: `<path d="M33 37.5C33 27 40.5 22 48 22C55.5 22 63 27 63 37.5C57.5 35.5 38.5 35.5 33 37.5Z" fill="${c}"/>`,
  }),
  bun: (c) => ({
    back: "",
    front: `<circle cx="48" cy="18.5" r="7.5" fill="${c}"/><path d="M33.5 41C32.5 27.5 40 23 48 23C56 23 63.5 27.5 62.5 41C60 33.5 55 30 48 30C41 30 36 33.5 33.5 41Z" fill="${c}"/>`,
  }),
  curlyLong: (c) => ({
    back: circles([[30.5, 37, 8], [33.5, 28, 8], [40.5, 22, 8], [48, 20, 8.5], [55.5, 22, 8], [62.5, 28, 8], [65.5, 37, 8], [30.5, 47.5, 7.5], [65.5, 47.5, 7.5], [31.5, 57.5, 7], [64.5, 57.5, 7]], c),
    front: `<path d="${BUZZ}" fill="${c}"/>` + circles([[40, 27.5, 5.5], [48, 25.5, 6], [56, 27.5, 5.5]], c),
  }),
};
const COVERS_EARS = new Set(["long", "wavy", "bob", "curlyLong"]);

const TOPS = {
  crew: (p, s) => `<path d="M41 67.5Q48 76 55 67.5Z" fill="${s}"/>`,
  vneck: (p, s) => `<path d="M41.5 67.5L48 78L54.5 67.5Z" fill="${s}"/>`,
  collar: (p, s) => {
    const c = lighten(p.topColor, 0.55);
    return `<path d="M42 68L48 77L54 68Z" fill="${s}"/><path d="M41 67L47.5 75L42 78.5L38.5 70Z" fill="${c}"/><path d="M55 67L48.5 75L54 78.5L57.5 70Z" fill="${c}"/>`;
  },
  blazer: (p, s) => {
    const lapel = lighten(p.topColor, 0.14);
    return `<path d="M41 67.5L48 86L55 67.5Z" fill="#F4F4F1"/><path d="M43 67.5L48 75L53 67.5Z" fill="${s}"/><path d="M41 67.5L48 86L37.5 78L39.5 69.5Z" fill="${lapel}"/><path d="M55 67.5L48 86L58.5 78L56.5 69.5Z" fill="${lapel}"/>`;
  },
  hoodie: (p, s) => {
    const hood = darken(p.topColor, 0.18);
    const cord = lighten(p.topColor, 0.6);
    return `<path d="M33 72C38 64 58 64 63 72C59 77.5 37 77.5 33 72Z" fill="${hood}"/><path d="M41 68.5Q48 74 55 68.5Z" fill="${s}"/><path d="M45 75.5L44.5 84M51 75.5L51.5 84" stroke="${cord}" stroke-width="1.4" stroke-linecap="round"/>`;
  },
};

function avatar(p) {
  const shade = darken(p.skin, 0.12);
  const hair = HAIR[p.hair](p.hairColor);
  const brow = darken(p.hairColor, 0.35);
  const lip = darken(p.skin, 0.45);
  const beardColor = p.beardColor ?? p.hairColor;

  const ears = COVERS_EARS.has(p.hair) ? "" : `<circle cx="33.5" cy="43" r="3.6" fill="${p.skin}"/><circle cx="62.5" cy="43" r="3.6" fill="${p.skin}"/>`;
  const beard = p.beard
    ? `<path d="M34.5 46C35 56.5 41 62 48 62C55 62 61 56.5 61.5 46C59 52.5 55 55 48 55C41 55 37 52.5 34.5 46Z" fill="${beardColor}"/><path d="M43.5 50.5C45.5 49 50.5 49 52.5 50.5C50.5 51.5 45.5 51.5 43.5 50.5Z" fill="${beardColor}"/>`
    : "";
  const face =
    `<path d="M39.5 40Q42.5 38.5 45.5 40M50.5 40Q53.5 38.5 56.5 40" stroke="${brow}" stroke-width="1.6" stroke-linecap="round" fill="none"/>` +
    `<circle cx="42.5" cy="44.5" r="1.75" fill="${INK}"/><circle cx="53.5" cy="44.5" r="1.75" fill="${INK}"/>` +
    `<path d="M44.5 51.8Q48 54.6 51.5 51.8" stroke="${lip}" stroke-width="1.6" stroke-linecap="round" fill="none"/>`;
  const glasses =
    p.glasses === "round"
      ? `<g stroke="${INK}" stroke-width="1.5" fill="none"><circle cx="42.5" cy="44.5" r="5" fill="#FFFFFF" fill-opacity="0.12"/><circle cx="53.5" cy="44.5" r="5" fill="#FFFFFF" fill-opacity="0.12"/><path d="M47.5 44.5Q48 43.6 48.5 44.5M37.5 44L34.5 43M58.5 44L61.5 43" stroke-linecap="round"/></g>`
      : p.glasses === "rect"
        ? `<g stroke="${INK}" stroke-width="1.5" fill="none"><rect x="37" y="40.2" width="10.5" height="8.6" rx="2.6" fill="#FFFFFF" fill-opacity="0.12"/><rect x="48.5" y="40.2" width="10.5" height="8.6" rx="2.6" fill="#FFFFFF" fill-opacity="0.12"/><path d="M47.5 44L48.5 44M37 43.5L34.5 42.8M59 43.5L61.5 42.8" stroke-linecap="round"/></g>`
        : "";
  const earrings = p.earrings ? `<circle cx="34.5" cy="50.5" r="1.6" fill="#C9A227"/><circle cx="61.5" cy="50.5" r="1.6" fill="#C9A227"/>` : "";
  const headset = p.headset
    ? `<path d="M31.5 43C31.5 21 64.5 21 64.5 43" stroke="#2A2D32" stroke-width="3.2" stroke-linecap="round" fill="none"/><rect x="28.5" y="38" width="6.5" height="12" rx="3" fill="#2A2D32"/><rect x="61" y="38" width="6.5" height="12" rx="3" fill="#2A2D32"/><path d="M31.8 48C33 56 39 59 45 58" stroke="#2A2D32" stroke-width="2" stroke-linecap="round" fill="none"/><circle cx="45.5" cy="58" r="2" fill="${INK}"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
<defs><clipPath id="a"><circle cx="48" cy="48" r="48"/></clipPath></defs>
<circle cx="48" cy="48" r="48" fill="${p.bg}"/>
<g clip-path="url(#a)">
${hair.back}
<rect x="42" y="52" width="12" height="18" rx="5" fill="${shade}"/>
<path d="M13 98C13 79 27 68.5 48 68.5C69 68.5 83 79 83 98Z" fill="${p.topColor}"/>
${TOPS[p.top](p, shade)}
${ears}
<ellipse cx="48" cy="41" rx="14.5" ry="17" fill="${p.skin}"/>
${beard}
${hair.front}
${face}
${glasses}
${earrings}
${headset}
</g>
</svg>
`;
}

const PEOPLE = {
  maraKade: { bg: "#F1EBF3", skin: "#F1D2B6", hair: "bob", hairColor: "#D8B16A", top: "crew", topColor: "#2A2D32", glasses: "round" },
  ishaRao: { bg: "#E9EEF5", skin: "#C68B60", hair: "long", hairColor: "#1F1A17", top: "hoodie", topColor: "#2F4A80", earrings: true },
  lenaOrtiz: { bg: "#ECF2EA", skin: "#D9A479", hair: "bun", hairColor: "#4A3022", top: "collar", topColor: "#4A7C59" },
  priyaNair: { bg: "#F2EFE6", skin: "#A86F47", hair: "wavy", hairColor: "#2A1E17", top: "vneck", topColor: "#8A4A5E", earrings: true },
  aylaDemir: { bg: "#F3ECF0", skin: "#EFC9A8", hair: "curlyLong", hairColor: "#8A3B1E", top: "crew", topColor: "#C9A227", earrings: true },
  tomasWebb: { bg: "#E7EFF2", skin: "#E6B78E", hair: "short", hairColor: "#6B4630", top: "crew", topColor: "#2F6F73", glasses: "rect" },
  samOkafor: { bg: "#F5ECE7", skin: "#7A4E2F", hair: "curly", hairColor: "#1F1A17", top: "blazer", topColor: "#2A2D32", beard: true },
  jonasWeber: { bg: "#EDEEF0", skin: "#F1D2B6", hair: "side", hairColor: "#B5652E", top: "collar", topColor: "#7FA3C8" },
  demo_admin: { bg: "#E9EEF5", skin: "#C68B60", hair: "buzz", hairColor: "#1F1A17", top: "crew", topColor: "#121417", headset: true },
  demo_buyer: { bg: "#F2EFE6", skin: "#E6B78E", hair: "side", hairColor: "#3B2A20", top: "hoodie", topColor: "#B05A3C" },
};

mkdirSync(OUT, { recursive: true });
for (const [username, person] of Object.entries(PEOPLE)) {
  writeFileSync(`${OUT}/${username}.svg`, avatar(person));
  console.log("wrote", `${OUT}/${username}.svg`);
}
