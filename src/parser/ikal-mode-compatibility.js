export const IKAL_LAYER_MODES = ["music", "image", "animation"];

export const IKAL_MODE_DECLARATIONS = {
  alkala: "music",
  lyala: "image",
  lyula: "animation",
};

const MODE_ROOT_FORMS = new Set(Object.keys(IKAL_MODE_DECLARATIONS));

// Depuis le moteur visuel unifié en champs, le vocabulaire visuel est
// symétrique : une primitive d'image s'anime dans lyula: (même champ, temps
// qui s'écoule) et un mot de mouvement se fige dans lyala: (le champ à t=0,
// comme une pose longue). Seule la musique reste un domaine séparé.
const VISUAL_MODES = new Set(["image", "animation"]);

const COMPATIBLE_MODES_BY_DOMAIN = {
  animation: VISUAL_MODES,
  glitch: new Set(IKAL_LAYER_MODES),
  image: VISUAL_MODES,
  music: new Set(["music"]),
  visual: VISUAL_MODES,
};

export function modeForDeclaration(form) {
  return IKAL_MODE_DECLARATIONS[form] || null;
}

export function compatibleModesForSeedRoot(root) {
  if (!root) {
    return [];
  }

  if (MODE_ROOT_FORMS.has(root.form)) {
    return ["mode"];
  }

  return [...(COMPATIBLE_MODES_BY_DOMAIN[root.domain] || [])];
}

export function seedRootCompatibleWithMode(root, mode) {
  if (!mode) {
    return true;
  }

  return compatibleModesForSeedRoot(root).includes(mode);
}
