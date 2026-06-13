import { affiliationForCode } from "./ikal-affiliations.js";
import {
  MAX_ACTIVE_AUDIO_EFFECTS,
  audioAffixCompatibleWithFamily,
  audioAffixDefinitionFor,
  emptyAudioEffects,
  isAudioAffixDegreeValid,
  paramsEffectsForAudioAffix,
  valueForAudioAffix,
} from "./ikal-audio-affixes.js";
import {
  MAX_ACTIVE_VISUAL_EFFECTS,
  emptyVisualAffixEffects,
  isVisualAffixDegreeValid,
  visualAffixCompatibleWithFamily,
  visualAffixDefinitionFor,
  visualEffectsForAffix,
} from "./ikal-visual-affixes.js";
import {
  isMotifAffix,
  motifShapeFromAffixes,
} from "./ikal-motif-affixes.js";

export const IKAL_PARAMS_VERSION = 1;

const ZERO_EFFECTS = {
  bitcrush: 0,
  distortion: 0,
  drive: 0,
  reverb: 0,
  roughness: 0,
  saturation: 0,
  tear: 0,
};

const ZERO_VISUAL_EFFECTS = {
  brightness: 0,
  chroma: 0,
  contrast: 0,
  colorShift: 0,
  darkness: 0,
  density: 0,
  diffusion: 0,
  deformation: 0,
  fracture: 0,
  glow: 0,
  order: 0,
  scale: 0,
  smoothness: 0,
  spread: 0,
  strands: 0,
  structure: 0,
  texture: 0,
  transitionGlitch: 0,
  trails: 0,
  turbulence: 0,
};

const ROOT_PARAM_RULES = {
  lk: { family: "music", mode: "music", role: "mode" },
  ly: { family: "visual-design", role: "mode" },
  llw: { family: "light", role: "modifier" },
  šp: { family: "color", role: "modifier" },
  tr: { family: "linear-motion", role: "modifier" },
  gl: { family: "random-motion", role: "modifier" },
  fth: { family: "cloud", role: "primitive" },
  mzm: { family: "trace", role: "primitive" },
  tçv: { family: "spark-scatter", role: "primitive" },
  vt: { family: "filament", role: "primitive" },
  čxw: { family: "noise", role: "voice" },
  bj: { family: "impact", role: "voice" },
  ļt: { family: "click", role: "voice" },
  lxr: { family: "roll", role: "voice" },
  psw: { family: "breath", role: "voice" },
  "mžv": { family: "tone", role: "voice" },
  "žb": { family: "tone", role: "voice" },
  "řż": { family: "tone", role: "voice" },
  "žd": { family: "tone", role: "voice" },
  lly: { family: "tone", role: "voice" },
  fř: { family: "shape", role: "modifier" },
  ft: { family: "texture", role: "modifier" },
  ffr: { family: "distortion", role: "modifier" },
  sč: { family: "break-apart", role: "modifier" },
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
  tone: {},
};

const FAMILY_VISUAL_EFFECTS = {
  "break-apart": { fracture: 0.45, texture: 0.24 },
  cloud: { brightness: 0.24, chroma: 0.16, diffusion: 0.86, glow: 0.28, texture: 0.62 },
  color: { chroma: 0.86, contrast: 0.12 },
  distortion: { chroma: 0.28, deformation: 0.45, glow: 0.22 },
  filament: { chroma: 0.24, contrast: 0.18, strands: 0.9, structure: 0.34, texture: 0.28 },
  light: { brightness: 0.72, contrast: 0.24, glow: 0.66 },
  shape: { contrast: 0.22, structure: 0.78 },
  "spark-scatter": { brightness: 0.54, chroma: 0.44, contrast: 0.24, fracture: 0.58, glow: 0.46 },
  texture: { contrast: 0.12, texture: 0.74 },
  trace: { contrast: 0.3, structure: 0.22, trails: 0.84, texture: 0.24 },
  "visual-design": { chroma: 0.18, structure: 0.3 },
};

const CONFIGURATION_PARAMS = {
  UPX: { count: 1, density: 0.2, texture: "single" },
  DPX: { count: 2, density: 0.45, texture: "duplex" },
  MFC: { count: 3, density: 0.88, texture: "multiplex-fuzzy-connected" },
  MFS: { count: 3, density: 0.78, texture: "multiplex-fuzzy-separate" },
};

const USER_PARAM_FIELDS = {
  effects: new Set(["bitcrush", "distortion", "drive", "roughness", "saturation", "tear"]),
  motion: new Set(["amount"]),
  multiplicity: new Set(["density"]),
  representation: new Set(["ghost"]),
};

function diagnostic(code, message, severity = "warning") {
  return { code, message, severity };
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function mergeEffects(...effects) {
  const merged = { ...ZERO_EFFECTS };

  for (const effect of effects) {
    for (const [key, value] of Object.entries(effect || {})) {
      merged[key] = clamp01((merged[key] || 0) + value);
    }
  }

  return merged;
}

function mergeVisualEffects(...effects) {
  const merged = { ...ZERO_VISUAL_EFFECTS };

  for (const effect of effects) {
    for (const [key, value] of Object.entries(effect || {})) {
      merged[key] = clamp01((merged[key] || 0) + value);
    }
  }

  return merged;
}

function functionParams(fn) {
  const normalized = fn || "STA";
  const dynamic = normalized === "DYN";

  return {
    amount: dynamic ? 1 : 0,
    function: normalized,
    kind: dynamic ? "dynamic" : "static",
  };
}

function multiplicityParams(ca = {}) {
  const configuration = ca.configuration || "UPX";
  const fallback = configuration.startsWith("M")
    ? { count: 3, density: 0.7, texture: "multiplex" }
    : configuration.startsWith("D")
      ? { count: 2, density: 0.5, texture: "duplex" }
      : { count: 1, density: 0.2, texture: "single" };

  return {
    configuration,
    ...(CONFIGURATION_PARAMS[configuration] || fallback),
  };
}

function conjugationParams(ca = {}) {
  const affiliation = ca.affiliation || "CSL";
  const entry = affiliationForCode(affiliation) || affiliationForCode("CSL");

  return {
    affiliation,
    label: entry.label,
    operator: entry.operator,
  };
}

function representationParams(ca = {}) {
  const essence = ca.essence || "NRM";
  const representative = essence === "RPV";

  return {
    essence,
    ghost: representative ? 0.6 : 0,
    kind: representative ? "representative" : "normal",
  };
}

function cloneParams(params) {
  return JSON.parse(JSON.stringify(params));
}

function numericOverride(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function applyUserParam(params, group, field, value, diagnostics) {
  if (!USER_PARAM_FIELDS[group]?.has(field)) {
    diagnostics.push(diagnostic(
      "unsupported-user-param",
      "parametre utilisateur non supporte par IKAL pour l'instant : " + group + "." + field,
    ));
    return;
  }

  if (!numericOverride(value)) {
    diagnostics.push(diagnostic(
      "invalid-user-param",
      "parametre utilisateur ignore car sa valeur n'est pas numerique : " + group + "." + field,
    ));
    return;
  }

  params[group][field] = clamp01(value);
}

export function resolveIkalParams(baseParams, userParams = {}) {
  const params = cloneParams(baseParams);
  const diagnostics = [];

  for (const [group, values] of Object.entries(userParams || {})) {
    if (!USER_PARAM_FIELDS[group] || !values || typeof values !== "object" || Array.isArray(values)) {
      diagnostics.push(diagnostic(
        "unsupported-user-param",
        "groupe de parametres utilisateur non supporte par IKAL pour l'instant : " + group,
      ));
      continue;
    }

    for (const [field, value] of Object.entries(values)) {
      applyUserParam(params, group, field, value, diagnostics);
    }
  }

  return { diagnostics, params };
}

function affixLabel(affix) {
  return "cs=" + String(affix?.cs || "?") + ", type=" + String(affix?.type || "?") + ", degree=" + String(affix?.degree || "?");
}

function applyAudioEffect(audioEffects, definition, value) {
  audioEffects[definition.id] = clamp01(Math.max(audioEffects[definition.id] || 0, value));
}

function applyVisualAffixEffect(visualAffixes, definition, degree) {
  visualAffixes[definition.id] = Math.max(visualAffixes[definition.id] || 0, degree);
}

function unknownAffixDiagnostics(ithkuil, { isTone = false } = {}) {
  const diagnostics = [];

  for (const [slotName, affixes] of [
    ["Slot V", ithkuil.affixes?.slotV || []],
    ["Slot VII", ithkuil.affixes?.slotVII || []],
  ]) {
    for (const affix of affixes) {
      if (audioAffixDefinitionFor(affix) || visualAffixDefinitionFor(affix)) {
        continue;
      }

      // Les affixes de forme du motif (départ/contour/intervalle) ne sont
      // mappés que pour une source à hauteur (famille « tone »).
      if (isTone && isMotifAffix(affix)) {
        continue;
      }

      diagnostics.push(diagnostic(
        "unsupported-affixes",
        "forme Ithkuil valide, mais affixe " + slotName + " non mappe artistiquement par IKAL : " + affixLabel(affix),
      ));
    }
  }

  return diagnostics;
}

function audioParamsForAffixes(ithkuil, family) {
  const diagnostics = [];
  const audioEffects = emptyAudioEffects();
  const mappedParamsEffects = [];
  let activeCount = 0;

  for (const affix of ithkuil.affixes?.slotV || []) {
    const definition = audioAffixDefinitionFor(affix);

    if (definition) {
      diagnostics.push(diagnostic(
        "unsupported-audio-affix-slot",
        "affixe audio " + definition.abbreviation + " reconnu, mais IKAL attend les effets audio en Slot VII",
      ));
    }
  }

  for (const affix of ithkuil.affixes?.slotVII || []) {
    const definition = audioAffixDefinitionFor(affix);

    if (!definition) {
      continue;
    }

    if (!isAudioAffixDegreeValid(affix)) {
      diagnostics.push(diagnostic(
        "invalid-audio-affix-degree",
        "degre d'affixe audio invalide pour " + definition.abbreviation + " : " + String(affix.degree),
      ));
      continue;
    }

    if (!audioAffixCompatibleWithFamily(definition, family)) {
      diagnostics.push(diagnostic(
        "incompatible-audio-effect",
        "effet audio " + definition.label + " incompatible avec la famille IKAL : " + family,
      ));
      continue;
    }

    const value = valueForAudioAffix(definition, affix.degree);

    activeCount++;
    applyAudioEffect(audioEffects, definition, value);
    mappedParamsEffects.push(paramsEffectsForAudioAffix(definition, value));
  }

  if (activeCount > MAX_ACTIVE_AUDIO_EFFECTS) {
    diagnostics.push(diagnostic(
      "too-many-audio-effects",
      "trop d'effets audio sur le meme evenement : " + activeCount + " actifs, limite initiale " + MAX_ACTIVE_AUDIO_EFFECTS,
    ));
  }

  return {
    audioEffects,
    diagnostics,
    effects: mergeEffects(...mappedParamsEffects),
  };
}

function visualParamsForAffixes(ithkuil, family) {
  const diagnostics = [];
  const visualAffixes = emptyVisualAffixEffects();
  const mappedVisualEffects = [];
  let activeCount = 0;

  for (const affix of ithkuil.affixes?.slotV || []) {
    const definition = visualAffixDefinitionFor(affix);

    if (definition) {
      diagnostics.push(diagnostic(
        "unsupported-visual-affix-slot",
        "affixe visuel " + definition.abbreviation + " reconnu, mais IKAL attend les effets visuels en Slot VII",
      ));
    }
  }

  for (const affix of ithkuil.affixes?.slotVII || []) {
    const definition = visualAffixDefinitionFor(affix);

    if (!definition) {
      continue;
    }

    if (!isVisualAffixDegreeValid(affix)) {
      diagnostics.push(diagnostic(
        "invalid-visual-affix-degree",
        "degre d'affixe visuel invalide pour " + definition.abbreviation + " : " + String(affix.degree),
      ));
      continue;
    }

    if (!visualAffixCompatibleWithFamily(definition, family)) {
      diagnostics.push(diagnostic(
        "incompatible-visual-effect",
        "effet visuel " + definition.label + " incompatible avec la famille IKAL : " + family,
      ));
      continue;
    }

    activeCount++;
    applyVisualAffixEffect(visualAffixes, definition, affix.degree);
    mappedVisualEffects.push(visualEffectsForAffix(definition, affix.degree));
  }

  if (activeCount > MAX_ACTIVE_VISUAL_EFFECTS) {
    diagnostics.push(diagnostic(
      "too-many-visual-effects",
      "trop d'effets visuels sur le meme evenement : " + activeCount + " actifs, limite initiale " + MAX_ACTIVE_VISUAL_EFFECTS,
    ));
  }

  return {
    diagnostics,
    visualAffixes,
    visualEffects: mergeVisualEffects(...mappedVisualEffects),
  };
}

export function paramsForIthkuilWord({ ithkuil, seedRoot, userParams = {} }) {
  if (!ithkuil || ithkuil.type !== "formative") {
    return {
      baseParams: null,
      diagnostics: [diagnostic("unsupported-word-type", "IKAL ne produit des params que pour les formatives")],
      params: null,
      userParams,
    };
  }

  const rootRule = ROOT_PARAM_RULES[ithkuil.root];

  if (!seedRoot || !rootRule) {
    return {
      baseParams: null,
      diagnostics: [diagnostic(
        "unmapped-params-root",
        "racine Ithkuil valide, mais aucune regle sens -> params IKAL n'existe encore : root=" + ithkuil.root,
      )],
      params: null,
      userParams,
    };
  }

  const motion = functionParams(ithkuil.function);
  const multiplicity = multiplicityParams(ithkuil.ca);
  const representation = representationParams(ithkuil.ca);
  const family = rootRule.family;
  const role = rootRule.role;
  const mode = role === "mode" ? rootRule.mode || seedRoot.domain : null;
  const isTone = family === "tone";
  // Famille à hauteur : le mot décrit un MOTIF (une phrase), pas une note.
  // Sa forme vient des affixes (départ/contour/intervalle) + de la morphologie
  // structurelle (nb par Configuration, accord↔arpège par Function, octave par Stem).
  const motif = isTone
    ? motifShapeFromAffixes(ithkuil.affixes?.slotVII, {
        deploy: motion.kind === "dynamic" ? "sequence" : "chord",
        stem: ithkuil.stem || 1,
      })
    : null;

  // Le timbre vient du SENS de la racine (porté par le seed), pas des affixes.
  if (motif) {
    motif.timbre = seedRoot.timbre || "resonant";
  }

  const affixParams = audioParamsForAffixes(ithkuil, family);
  const visualAffixParams = visualParamsForAffixes(ithkuil, family);
  const effects = mergeEffects(
    FAMILY_EFFECTS[family],
    affixParams.effects,
    representation.ghost ? { bitcrush: 0.08, drive: 0.08 } : null,
  );
  const visualEffects = mergeVisualEffects(
    FAMILY_VISUAL_EFFECTS[family],
    visualAffixParams.visualEffects,
    representation.ghost ? { glow: 0.18 } : null,
  );
  const baseParams = {
    audioEffects: affixParams.audioEffects,
    conjugation: conjugationParams(ithkuil.ca),
    domain: seedRoot.domain,
    effects,
    family,
    lexical: {
      context: ithkuil.context || "EXS",
      function: motion.function,
      root: ithkuil.root,
      seedFamily: seedRoot.family,
      sense: seedRoot.sense,
      specification: ithkuil.specification || "BSC",
      stem: ithkuil.stem || 1,
    },
    mode,
    motif,
    motion,
    multiplicity,
    representation,
    role,
    source: ithkuil.source,
    version: IKAL_PARAMS_VERSION,
    visualAffixes: visualAffixParams.visualAffixes,
    visualEffects,
  };
  const resolved = resolveIkalParams(baseParams, userParams);

  return {
    baseParams,
    diagnostics: [
      ...affixParams.diagnostics,
      ...visualAffixParams.diagnostics,
      ...unknownAffixDiagnostics(ithkuil, { isTone }),
      ...resolved.diagnostics,
    ],
    params: resolved.params,
    userParams,
  };
}
