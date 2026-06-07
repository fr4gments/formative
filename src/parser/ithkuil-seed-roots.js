export const IKAL_SEED_ROOTS = [
  {
    cr: "lk",
    domain: "music",
    family: "music",
    form: "alkala",
    section: "4.5.1.3 Music",
    sense: "music/play music/compose music",
  },
  {
    cr: "ly",
    domain: "image",
    family: "visual-design",
    form: "lyala",
    section: "4.5.4 Visual Sense",
    sense: "visual design/artistic representation",
  },
  {
    cr: "ly",
    domain: "animation",
    family: "visual-design",
    form: "lyula",
    function: "DYN",
    section: "4.5.4 Visual Sense",
    sense: "visual design/artistic representation with dynamic function",
  },
  {
    cr: "llw",
    domain: "visual",
    family: "light",
    form: "allwala",
    section: "6.3 Physics and Cosmological/Astronomical Phenomena",
    sense: "light/illumination/brightness",
  },
  {
    cr: "šp",
    domain: "visual",
    family: "color",
    form: "špala",
    section: "4.5.4 Visual Sense",
    sense: "color",
  },
  {
    cr: "tr",
    domain: "animation",
    family: "linear-motion",
    form: "trala",
    section: "3.2 Motion And Spatial Position",
    sense: "linear motion",
  },
  {
    cr: "gl",
    domain: "animation",
    family: "random-motion",
    form: "glala",
    section: "3.2 Motion And Spatial Position",
    sense: "horizontal-planar range of motion / random directed movement",
  },
  {
    cr: "čxw",
    domain: "music",
    family: "noise",
    form: "ačxwala",
    section: "4.5.1.1 Various Types of Sounds",
    sense: "raucous sound/noise",
  },
  {
    cr: "čxw",
    ca: { configuration: "MFC" },
    domain: "music",
    family: "noise-cloud",
    form: "ačxwuža",
    function: "DYN",
    migrationFrom: ["suš", "sus"],
    section: "4.5.1.1 Various Types of Sounds",
    sense: "raucous sound/noise, dynamic multiplex fuzzy connected",
  },
  {
    cr: "bj",
    domain: "music",
    family: "impact-sound",
    form: "abjala",
    section: "4.5.1.1 Various Types of Sounds",
    sense: "bang/boom/explosive sound",
  },
  {
    cr: "ļt",
    domain: "music",
    family: "click-sound",
    form: "ļtala",
    section: "4.5.1.1 Various Types of Sounds",
    sense: "ticking/clicking/tapping sound",
  },
  {
    cr: "ļt",
    ca: { essence: "RPV" },
    domain: "music",
    family: "ghost-click-sound",
    form: "ļtutļa",
    function: "DYN",
    migrationFrom: ["kul"],
    section: "4.5.1.1 Various Types of Sounds",
    sense: "ticking/clicking/tapping sound, dynamic representative",
  },
  {
    cr: "lxr",
    domain: "music",
    family: "roll",
    form: "alxrala",
    section: "3.2 Motion And Spatial Position",
    sense: "roll/wheeling/winding",
  },
  {
    cr: "lxr",
    ca: { configuration: "DPX" },
    domain: "music",
    family: "duplex-roll",
    form: "alxrasa",
    migrationFrom: ["ras"],
    section: "3.2 Motion And Spatial Position",
    sense: "roll/wheeling/winding, duplex",
  },
  {
    cr: "lxr",
    ca: { configuration: "MFC", essence: "RPV" },
    domain: "music",
    family: "ghost-roll-cloud",
    form: "alxružla",
    function: "DYN",
    migrationFrom: ["ruř", "rur"],
    section: "3.2 Motion And Spatial Position",
    sense: "roll/wheeling/winding, dynamic multiplex fuzzy connected representative",
  },
  {
    cr: "psw",
    domain: "music",
    family: "breath",
    form: "pswala",
    section: "4.5.1.1 Various Types of Sounds",
    sense: "respiration/breathing/panting/gasping",
  },
  {
    cr: "psw",
    ca: { essence: "RPV" },
    domain: "music",
    family: "ghost-breath",
    form: "pswatļa",
    migrationFrom: ["sal"],
    section: "4.5.1.1 Various Types of Sounds",
    sense: "respiration/breathing/panting/gasping, representative",
  },
  {
    cr: "fř",
    domain: "image",
    family: "shape",
    form: "fřala",
    section: "6.4.2 Shapes and Forms",
    sense: "shape/form/figure",
  },
  {
    cr: "ft",
    domain: "image",
    family: "texture",
    form: "ftala",
    section: "4.5.5 Tactile Sense",
    sense: "touch/feel/texture",
  },
  {
    cr: "ffr",
    domain: "glitch",
    family: "distortion",
    form: "affrala",
    migrationFrom: ["-šk", "-sk"],
    section: "2.0 Common States and Acts",
    sense: "bending/distortion/twisting/warping",
  },
  {
    cr: "sč",
    domain: "glitch",
    family: "break-apart",
    form: "sčala",
    migrationFrom: ["-tx"],
    section: "2.0 Common States and Acts",
    sense: "break apart/break into pieces/crumble",
  },
];

export function seedRootForCr(cr) {
  return IKAL_SEED_ROOTS.find((root) => root.cr === cr);
}

export function seedRootForForm(form) {
  return IKAL_SEED_ROOTS.find((root) => root.form === form);
}

export function seedRootForIthkuil(ithkuil) {
  if (!ithkuil?.root) {
    return undefined;
  }

  const exactForm = seedRootForForm(ithkuil.normalized || ithkuil.source);

  if (exactForm) {
    return exactForm;
  }

  const candidates = IKAL_SEED_ROOTS.filter((root) => root.cr === ithkuil.root);
  const scored = candidates
    .filter((root) => rootMatchesIthkuil(root, ithkuil))
    .map((root) => ({
      root,
      score: rootSpecificity(root),
    }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.root || candidates.find((root) => !root.function && !root.ca) || candidates[0];
}

function rootMatchesIthkuil(root, ithkuil) {
  const expectedFunction = root.function || "STA";
  const actualFunction = ithkuil.function || "STA";

  if (expectedFunction !== actualFunction) {
    return false;
  }

  for (const [key, value] of Object.entries(root.ca || {})) {
    if (ithkuil.ca?.[key] !== value) {
      return false;
    }
  }

  return true;
}

function rootSpecificity(root) {
  return (root.function ? 1 : 0) + Object.keys(root.ca || {}).length;
}
