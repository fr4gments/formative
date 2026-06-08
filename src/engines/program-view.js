const FAMILY_ROOTS = {
  "break-apart": "s",
  breath: "s",
  click: "k",
  cloud: "s",
  color: "s",
  distortion: "s",
  filament: "r",
  impact: "k",
  light: "r",
  "linear-motion": "r",
  music: "r",
  noise: "s",
  "random-motion": "s",
  roll: "r",
  shape: "r",
  "spark-scatter": "k",
  texture: "s",
  trace: "r",
  "visual-design": "r",
};

function unique(values) {
  return [...new Set(values)];
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function rootForFamily(family) {
  return FAMILY_ROOTS[family] || "r";
}

function numberForMultiplicity(multiplicity = {}) {
  if (multiplicity.count >= 3 || multiplicity.configuration?.startsWith("M")) {
    return "MPX";
  }

  if (multiplicity.count === 2 || multiplicity.configuration?.startsWith("D")) {
    return "DPX";
  }

  return "UPX";
}

function densityForMultiplicity(multiplicity = {}) {
  if (typeof multiplicity.density === "number") {
    return clamp01(multiplicity.density);
  }

  if (multiplicity.count >= 3 || multiplicity.configuration?.startsWith("M")) {
    return 0.8;
  }

  if (multiplicity.count === 2 || multiplicity.configuration?.startsWith("D")) {
    return 0.45;
  }

  return 0.2;
}

function suffixesForEffects(effects = {}) {
  const suffixes = [];

  if ((effects.tear || 0) >= 0.45 || (effects.bitcrush || 0) >= 0.45) {
    suffixes.push("tx");
  }

  if (
    (effects.distortion || 0) >= 0.45 ||
    (effects.drive || 0) >= 0.50 ||
    (effects.saturation || 0) >= 0.65
  ) {
    suffixes.push("šk");
  }

  return suffixes;
}

function controlsFromParams(params = {}) {
  const effects = params.effects || {};
  const visual = params.visualEffects || {};

  return {
    bitcrush: clamp01(effects.bitcrush || 0),
    brightness: clamp01(visual.brightness || 0),
    chroma: clamp01(visual.chroma || 0),
    contrastBoost: clamp01(visual.contrast || 0),
    diffusion: clamp01(visual.diffusion || 0),
    deformation: clamp01(visual.deformation || 0),
    density: densityForMultiplicity(params.multiplicity),
    distortion: clamp01(effects.distortion || 0),
    drive: clamp01(effects.drive || 0),
    fracture: clamp01(visual.fracture || 0),
    ghost: clamp01(params.representation?.ghost || 0),
    glow: clamp01(visual.glow || 0),
    motion: clamp01(params.motion?.amount || 0),
    reverb: clamp01(effects.reverb || 0),
    roughness: clamp01(effects.roughness || 0),
    saturation: clamp01(effects.saturation || 0),
    strands: clamp01(visual.strands || 0),
    structure: clamp01(visual.structure || 0),
    tear: clamp01(effects.tear || 0),
    trails: clamp01(visual.trails || 0),
    visualTexture: clamp01(visual.texture || 0),
  };
}

function controlsFromLegacy(view) {
  const hasTx = view.suffixes.includes("tx");
  const hasSk = view.suffixes.includes("šk");

  return {
    bitcrush: hasTx ? 0.62 : hasSk ? 0.16 : 0,
    brightness: 0,
    chroma: 0,
    contrastBoost: 0,
    diffusion: 0,
    deformation: 0,
    density: view.number === "MPX" ? 0.8 : view.number === "DPX" ? 0.45 : 0.2,
    distortion: hasSk ? 0.9 : 0,
    drive: hasSk ? 0.72 : view.matter === "RPV" ? 0.12 : 0,
    fracture: 0,
    ghost: view.matter === "RPV" ? 0.45 : 0,
    glow: 0,
    motion: view.motion === "DYN" ? 1 : 0,
    reverb: 0,
    roughness: hasTx ? 0.7 : 0,
    saturation: hasSk ? 0.7 : 0,
    strands: 0,
    structure: 0,
    tear: hasTx ? 0.9 : 0,
    trails: 0,
    visualTexture: 0,
  };
}

export function legacyProgramView(program) {
  if (!program) {
    return null;
  }

  const suffixes = Array.isArray(program.suffixes) ? program.suffixes : [];

  if (!program.params) {
    const view = {
      ...program,
      matter: program.matter || "NRM",
      motion: program.motion || "STA",
      number: program.number || "UPX",
      root: program.root || "r",
      suffixes,
    };

    return {
      ...view,
      controls: controlsFromLegacy(view),
    };
  }

  const params = program.params;
  const controls = controlsFromParams(params);

  return {
    ...program,
    controls,
    matter: params.representation?.essence === "RPV" || controls.ghost > 0 ? "RPV" : "NRM",
    motion: params.motion?.kind === "dynamic" ? "DYN" : "STA",
    number: numberForMultiplicity(params.multiplicity),
    root: rootForFamily(params.family),
    suffixes: unique([...suffixes, ...suffixesForEffects(params.effects)]),
  };
}
