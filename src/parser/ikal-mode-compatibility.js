export const IKAL_LAYER_MODES = ["music", "image", "animation"];

export const IKAL_MODE_DECLARATIONS = {
  alkala: "music",
  lyala: "image",
  lyula: "animation",
};

const MODE_ROOT_FORMS = new Set(Object.keys(IKAL_MODE_DECLARATIONS));

const COMPATIBLE_MODES_BY_DOMAIN = {
  animation: new Set(["animation"]),
  glitch: new Set(IKAL_LAYER_MODES),
  image: new Set(["image"]),
  music: new Set(["music"]),
  visual: new Set(["image"]),
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
