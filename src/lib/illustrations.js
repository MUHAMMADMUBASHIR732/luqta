// Small, warm item illustrations used as demo photos and decorative art. Returned as SVG data URIs.

const COLORS = {
  black: "#2f2a28",
  white: "#f4efe9",
  grey: "#8d8582",
  gray: "#8d8582",
  silver: "#b8bcc2",
  blue: "#3b5f8f",
  red: "#a8362c",
  green: "#3f6b4f",
  brown: "#7a4b32",
  yellow: "#d9a73a",
  pink: "#cf7a8a",
  default: "#95271d",
};

function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + amount);
  const g = clamp(((n >> 8) & 255) + amount);
  const b = clamp((n & 255) + amount);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const glyphs = {
  backpack: (c, d, l) => `
    <rect x="78" y="40" width="84" height="104" rx="26" fill="${c}"/>
    <path d="M104 40v-8a16 16 0 0 1 32 0v8" fill="none" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
    <rect x="92" y="96" width="56" height="36" rx="10" fill="${d}"/>
    <rect x="100" y="104" width="40" height="5" rx="2.5" fill="${l}" opacity=".7"/>
    <rect x="104" y="58" width="32" height="6" rx="3" fill="${l}" opacity=".6"/>
    <path d="M78 70c-14 6-18 30-6 58" fill="none" stroke="${d}" stroke-width="8" stroke-linecap="round"/>
    <path d="M162 70c14 6 18 30 6 58" fill="none" stroke="${d}" stroke-width="8" stroke-linecap="round"/>`,
  bag: (c, d, l) => `
    <path d="M82 66h76l10 74a8 8 0 0 1-8 9H80a8 8 0 0 1-8-9z" fill="${c}"/>
    <path d="M100 66c0-30 40-30 40 0" fill="none" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
    <rect x="75" y="92" width="90" height="6" fill="${d}" opacity=".5"/>
    <circle cx="120" cy="110" r="6" fill="${l}"/>`,
  laptop: (c, d, l) => `
    <rect x="66" y="42" width="108" height="72" rx="8" fill="${d}"/>
    <rect x="72" y="48" width="96" height="60" rx="4" fill="${l}" opacity=".4"/>
    <path d="M50 118h140l-8 16a6 6 0 0 1-5 3H63a6 6 0 0 1-5-3z" fill="${c}"/>
    <rect x="104" y="124" width="32" height="4" rx="2" fill="${d}"/>`,
  phone: (c, d, l) => `
    <rect x="92" y="28" width="56" height="124" rx="14" fill="${c}"/>
    <rect x="98" y="40" width="44" height="96" rx="6" fill="${l}" opacity=".45"/>
    <rect x="112" y="33" width="16" height="3" rx="1.5" fill="${d}"/>
    <circle cx="120" cy="144" r="3" fill="${d}"/>`,
  wallet: (c, d, l) => `
    <rect x="58" y="56" width="124" height="82" rx="14" fill="${c}"/>
    <path d="M58 78h124" stroke="${d}" stroke-width="3" opacity=".5"/>
    <rect x="132" y="88" width="60" height="30" rx="10" fill="${d}"/>
    <circle cx="148" cy="103" r="6" fill="${l}"/>`,
  keys: (c, d, l) => `
    <circle cx="92" cy="78" r="26" fill="none" stroke="${c}" stroke-width="9"/>
    <path d="M110 92l54 38" stroke="${c}" stroke-width="11" stroke-linecap="round"/>
    <path d="M146 118l10-11M158 127l10-11" stroke="${c}" stroke-width="8" stroke-linecap="round"/>
    <path d="M78 100l-12 44" stroke="${d}" stroke-width="11" stroke-linecap="round"/>
    <path d="M70 130l12 3M67 140l12 3" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="92" cy="78" r="5" fill="${l}"/>`,
  id_card: (c, d) => `
    <rect x="54" y="48" width="132" height="88" rx="12" fill="#fff8f3"/>
    <path d="M54 60a12 12 0 0 1 12-12h108a12 12 0 0 1 12 12v10H54z" fill="${c}"/>
    <circle cx="88" cy="100" r="14" fill="${d}"/>
    <rect x="112" y="90" width="58" height="7" rx="3.5" fill="${d}" opacity=".6"/>
    <rect x="112" y="106" width="44" height="7" rx="3.5" fill="${d}" opacity=".35"/>
    <rect x="70" y="122" width="100" height="6" rx="3" fill="${d}" opacity=".25"/>`,
  bottle: (c, d, l) => `
    <rect x="108" y="24" width="24" height="20" rx="5" fill="${d}"/>
    <path d="M104 44h32l8 22v70a12 12 0 0 1-12 12h-24a12 12 0 0 1-12-12V66z" fill="${c}"/>
    <rect x="100" y="86" width="40" height="34" rx="6" fill="${l}" opacity=".55"/>`,
  clothing: (c, d) => `
    <path d="M92 36l-40 20 12 28 18-8v66h76V76l18 8 12-28-40-20c-4 12-14 18-28 18s-24-6-28-18z" fill="${c}"/>
    <path d="M92 36c4 12 14 18 28 18s24-6 28-18" fill="none" stroke="${d}" stroke-width="5" stroke-linecap="round"/>`,
  umbrella: (c, d) => `
    <path d="M42 90a78 62 0 0 1 156 0c-13-10-26-10-39 0-13-10-26-10-39 0-13-10-26-10-39 0-13-10-26-10-39 0z" fill="${c}"/>
    <path d="M120 90v52a12 12 0 0 1-24 0" fill="none" stroke="${d}" stroke-width="8" stroke-linecap="round"/>
    <rect x="117" y="22" width="6" height="14" rx="3" fill="${d}"/>`,
  earphones: (c, d, l) => `
    <circle cx="86" cy="58" r="15" fill="${c}"/>
    <circle cx="154" cy="58" r="15" fill="${c}"/>
    <circle cx="86" cy="58" r="6" fill="${l}" opacity=".7"/>
    <circle cx="154" cy="58" r="6" fill="${l}" opacity=".7"/>
    <path d="M86 73c0 46 22 62 34 62s34-16 34-62" fill="none" stroke="${d}" stroke-width="5" stroke-linecap="round"/>
    <rect x="112" y="132" width="16" height="16" rx="4" fill="${d}"/>`,
  other: (c, d, l) => `
    <rect x="76" y="52" width="88" height="88" rx="18" fill="${c}"/>
    <path d="M104 86a16 16 0 1 1 22 14c-4 2-6 4-6 10" fill="none" stroke="${l}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="120" cy="125" r="5" fill="${d}"/>`,
};

export function illustrate(category = "other", colorName = "default") {
  const base = COLORS[String(colorName).toLowerCase()] || COLORS.default;
  const draw = glyphs[category] || glyphs.other;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7ebe3"/><stop offset="1" stop-color="#ead7cb"/></linearGradient></defs>
    <rect width="240" height="180" fill="url(#g)"/>
    <circle cx="120" cy="88" r="64" fill="#fff8f3" opacity=".7"/>
    <ellipse cx="120" cy="157" rx="54" ry="7" fill="#60241e" opacity=".12"/>
    ${draw(base, shade(base, -34), shade(base, 60))}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, " "))}`;
}
