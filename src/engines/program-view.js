const FAMILY_ROOTS = {
  "break-apart": "s",
  breath: "s",
  click: "k",
  color: "s",
  distortion: "s",
  impact: "k",
  light: "r",
  "linear-motion": "r",
  music: "r",
  noise: "s",
  "random-motion": "s",
  roll: "r",
  shape: "r",
  texture: "s",
  "visual-design": "r",
};

function unique(values) {
  return [...new Set(values)];
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

export function legacyProgramView(program) {
  if (!program) {
    return null;
  }

  const suffixes = Array.isArray(program.suffixes) ? program.suffixes : [];

  if (!program.params) {
    return {
      ...program,
      matter: program.matter || "NRM",
      motion: program.motion || "STA",
      number: program.number || "UPX",
      root: program.root || "r",
      suffixes,
    };
  }

  const params = program.params;

  return {
    ...program,
    matter: params.representation?.essence === "RPV" || params.representation?.ghost > 0 ? "RPV" : "NRM",
    motion: params.motion?.kind === "dynamic" ? "DYN" : "STA",
    number: numberForMultiplicity(params.multiplicity),
    root: rootForFamily(params.family),
    suffixes: unique([...suffixes, ...suffixesForEffects(params.effects)]),
  };
}
