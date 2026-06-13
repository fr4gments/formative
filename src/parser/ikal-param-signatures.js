const ROOT_PARAM_FAMILIES = {
  bj: "impact",
  "čxw": "noise",
  ffr: "distortion",
  fth: "cloud",
  fř: "shape",
  ft: "texture",
  gl: "random-motion",
  llw: "light",
  lk: "music",
  lxr: "roll",
  ly: "visual-design",
  "mžv": "tone",
  mzm: "trace",
  psw: "breath",
  "sč": "break-apart",
  "tçv": "spark-scatter",
  tr: "linear-motion",
  vt: "filament",
  "šp": "color",
  "ļt": "click",
};

const FAMILY_EFFECTS = {
  "break-apart": { bitcrush: 0.55, roughness: 0.7, tear: 0.9 },
  breath: { roughness: 0.25 },
  click: { roughness: 0.18 },
  color: { saturation: 0.55 },
  distortion: { distortion: 0.9, drive: 0.75, saturation: 0.35 },
  impact: { drive: 0.25, roughness: 0.35 },
  light: { saturation: 0.18 },
  noise: { roughness: 0.78 },
  roll: { roughness: 0.16 },
  texture: { roughness: 0.5 },
};

const CONFIGURATION_DENSITY = {
  DPX: 0.45,
  MFC: 0.88,
  MFS: 0.78,
  UPX: 0.2,
};

const SIGNATURES_BY_FAMILY = {
  "break-apart": [
    { field: "tear", group: "effects", label: "tear" },
    { field: "bitcrush", group: "effects", label: "bitcrush" },
    { field: "roughness", group: "effects", label: "roughness" },
  ],
  breath: [
    { field: "roughness", group: "effects", label: "roughness" },
    { field: "ghost", group: "representation", label: "ghost" },
  ],
  click: [
    { field: "roughness", group: "effects", label: "roughness" },
    { field: "amount", group: "motion", label: "motion" },
    { field: "ghost", group: "representation", label: "ghost" },
  ],
  color: [
    { field: "saturation", group: "effects", label: "saturation" },
  ],
  distortion: [
    { field: "distortion", group: "effects", label: "distortion" },
    { field: "drive", group: "effects", label: "drive" },
    { field: "saturation", group: "effects", label: "saturation" },
  ],
  impact: [
    { field: "drive", group: "effects", label: "drive" },
    { field: "roughness", group: "effects", label: "roughness" },
  ],
  light: [
    { field: "saturation", group: "effects", label: "saturation" },
  ],
  "linear-motion": [
    { field: "amount", group: "motion", label: "motion" },
  ],
  noise: [
    { field: "roughness", group: "effects", label: "roughness" },
    { field: "density", group: "multiplicity", label: "density" },
    { field: "amount", group: "motion", label: "motion" },
  ],
  "random-motion": [
    { field: "amount", group: "motion", label: "motion" },
  ],
  roll: [
    { field: "amount", group: "motion", label: "motion" },
    { field: "density", group: "multiplicity", label: "density" },
    { field: "ghost", group: "representation", label: "ghost" },
  ],
  texture: [
    { field: "roughness", group: "effects", label: "roughness" },
  ],
};

function setNested(target, group, field, value) {
  if (!target[group]) {
    target[group] = {};
  }

  target[group][field] = value;
}

function roundDisplay(value) {
  return Number(value.toFixed(2)).toString();
}

function defaultValueForSlot(seedRoot, slot) {
  const family = paramFamilyForSeedRoot(seedRoot);

  if (slot.group === "effects") {
    return FAMILY_EFFECTS[family]?.[slot.field] || 0;
  }

  if (slot.group === "motion") {
    return (seedRoot.function || "STA") === "DYN" ? 1 : 0;
  }

  if (slot.group === "multiplicity") {
    const configuration = seedRoot.ca?.configuration || "UPX";

    return CONFIGURATION_DENSITY[configuration] || 0.2;
  }

  if (slot.group === "representation") {
    return seedRoot.ca?.essence === "RPV" ? 0.6 : 0;
  }

  return 0;
}

export function paramFamilyForSeedRoot(seedRoot) {
  return ROOT_PARAM_FAMILIES[seedRoot?.cr] || null;
}

export function paramSignatureForFamily(family) {
  return SIGNATURES_BY_FAMILY[family] || [];
}

export function paramSignatureForSeedRoot(seedRoot) {
  return paramSignatureForFamily(paramFamilyForSeedRoot(seedRoot));
}

export function userParamsFromPositionals(seedRoot, values) {
  const signature = paramSignatureForSeedRoot(seedRoot);

  if (values.length > 0 && signature.length === 0) {
    return {
      error: "ce mot IKAL n'accepte pas encore de paramètres : « " + seedRoot.form + " »",
    };
  }

  if (values.length > signature.length) {
    return {
      error: "trop de paramètres pour « " + seedRoot.form + " » : attendu " + signature.length + ", reçu " + values.length,
    };
  }

  const userParams = {};

  for (let i = 0; i < values.length; i++) {
    const slot = signature[i];

    setNested(userParams, slot.group, slot.field, values[i]);
  }

  return { userParams };
}

export function formatParamSignatureForSeedRoot(seedRoot) {
  return paramSignatureForSeedRoot(seedRoot)
    .map((slot) => roundDisplay(defaultValueForSlot(seedRoot, slot)) + " (" + slot.label + ")")
    .join(", ");
}
