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
    cr: "sč",
    domain: "glitch",
    family: "break-apart",
    form: "sčala",
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

  const candidates = IKAL_SEED_ROOTS.filter((root) => root.cr === ithkuil.root);
  const exact = candidates.find((root) => root.function && root.function === ithkuil.function);

  return exact || candidates.find((root) => !root.function) || candidates[0];
}
