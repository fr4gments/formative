import { IKAL_GENERATED_VISUAL_AFFIX_FORMS } from "./generated/ikal-visual-affixed-forms.js";

export const MAX_ACTIVE_VISUAL_EFFECTS = 3;

export const DEFAULT_VISUAL_AFFIX_DEGREES = Object.freeze({
  CLD: 6,
  COL: 2,
  DCP: 3,
  DSG: 2,
  SIZ: 6,
  VTS: 2,
});

export const IKAL_VISUAL_SOURCE_ROOTS = Object.freeze([
  "llw",
  "šp",
  "fř",
  "ft",
  "vt",
  "fth",
  "mzm",
  "tçv",
]);

export const ZERO_VISUAL_AFFIX_EFFECTS = Object.freeze({
  colorAttribute: 0,
  colorDimension: 0,
  concentration: 0,
  organization: 0,
  scale: 0,
  transition: 0,
});

const VISUAL_FAMILIES = new Set([
  "cloud",
  "color",
  "filament",
  "light",
  "shape",
  "spark-scatter",
  "texture",
  "trace",
]);

const CLD_PROFILES = {
  1: { brightness: 0.42, chroma: 0.08, label: "pale-extra-light" },
  2: { brightness: 0.34, chroma: 0.16, label: "light-colored" },
  3: { brightness: 0.32, chroma: 0.44, contrast: 0.10, label: "bright-warm" },
  4: { chroma: 0.08, contrast: 0.12, label: "dull-desaturated" },
  5: { chroma: 0.20, label: "medium-colored" },
  6: { chroma: 0.58, contrast: 0.14, label: "vivid" },
  7: { contrast: 0.18, darkness: 0.28, label: "dim-colored" },
  8: { contrast: 0.24, darkness: 0.42, label: "dark-subdued" },
  9: { chroma: 0.40, contrast: 0.36, darkness: 0.34, label: "deep-extra-dark" },
};

const COL_PROFILES = {
  1: { contrast: 0.22, glow: 0.20, label: "shiny-glossy" },
  2: { brightness: 0.36, glow: 0.82, label: "luminescent-glowing" },
  3: { brightness: 0.22, chroma: 0.46, glow: 0.72, label: "fluorescent" },
  4: { chroma: 0.36, colorShift: 0.66, glow: 0.34, label: "iridescent" },
  5: { chroma: 0.26, label: "x-colored" },
  6: { brightness: 0.18, contrast: 0.10, label: "transparent" },
  7: { brightness: 0.10, contrast: 0.18, glow: 0.16, label: "translucent" },
  8: { contrast: 0.42, label: "opaque" },
  9: { contrast: 0.16, texture: 0.32, label: "matte" },
};

export const IKAL_VISUAL_AFFIXES = [
  {
    abbreviation: "SIZ",
    aliases: ["size", "scale"],
    cs: "x",
    id: "scale",
    label: "scale",
    params(degree) {
      return { scale: degree / 10 };
    },
    type: 1,
  },
  {
    abbreviation: "DCP",
    aliases: ["density", "dense", "concentration", "scatter", "spread"],
    cs: "xv",
    id: "concentration",
    label: "concentration",
    params(degree) {
      const density = clamp01((10 - degree) / 10);
      const spread = clamp01(degree / 10);

      return {
        density,
        label: degree <= 4
          ? "concentrated-condensed"
          : degree >= 6
            ? "dissipated-scattered"
            : "standard-concentration",
        spread,
      };
    },
    type: 1,
  },
  {
    abbreviation: "DSG",
    aliases: ["chaos", "turbulence", "random", "organized", "structure"],
    cs: "vh",
    id: "organization",
    label: "organization",
    params(degree) {
      const turbulence = clamp01((10 - degree) / 10);
      const order = clamp01(degree / 10);

      return {
        label: degree <= 4
          ? "chaotic-disorganized"
          : degree >= 7
            ? "organized-structured"
            : "balanced-organization",
        order,
        turbulence,
      };
    },
    type: 1,
  },
  {
    abbreviation: "CLD",
    aliases: ["chroma", "color", "colour", "vivid"],
    cs: "lb",
    id: "colorDimension",
    label: "color-dimension",
    params(degree) {
      return CLD_PROFILES[degree] || {};
    },
    type: 1,
  },
  {
    abbreviation: "COL",
    aliases: ["glow", "glowing", "iridescent", "surface"],
    cs: "ňv",
    id: "colorAttribute",
    label: "color-attribute",
    params(degree) {
      return COL_PROFILES[degree] || {};
    },
    type: 1,
  },
  {
    abbreviation: "VTS",
    aliases: ["break", "fracture", "glitch", "transition", "disjointed"],
    cs: "ňf",
    id: "transition",
    label: "transition",
    params(degree) {
      const transitionGlitch = clamp01((10 - degree) / 10);
      const smoothness = clamp01(degree / 10);

      return {
        colorShift: transitionGlitch * 0.46,
        fracture: transitionGlitch * 0.68,
        label: degree <= 3
          ? "disjointed-variable-transition"
          : degree >= 7
            ? "smooth-gradual-transition"
            : "variable-transition",
        smoothness,
        transitionGlitch,
      };
    },
    type: 1,
  },
];

const VISUAL_AFFIX_BY_KEY = new Map(IKAL_VISUAL_AFFIXES.map((affix) => [keyForAffix(affix), affix]));

export const IKAL_VISUAL_AFFIX_FORMS = IKAL_GENERATED_VISUAL_AFFIX_FORMS;

function keyForAffix(affix) {
  return String(affix.cs) + "/" + String(affix.type || 1);
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

export function emptyVisualAffixEffects() {
  return { ...ZERO_VISUAL_AFFIX_EFFECTS };
}

export function visualAffixDefinitionFor(affix) {
  return VISUAL_AFFIX_BY_KEY.get(keyForAffix(affix));
}

export function isVisualAffixDegreeValid(affix) {
  return Number.isInteger(affix?.degree) && affix.degree >= 1 && affix.degree <= 9;
}

export function visualAffixCompatibleWithFamily(_definition, family) {
  return VISUAL_FAMILIES.has(family);
}

export function visualEffectsForAffix(definition, degree) {
  const effects = definition.params(degree);
  const clean = {};

  for (const [key, value] of Object.entries(effects || {})) {
    if (typeof value === "number" && Number.isFinite(value)) {
      clean[key] = clamp01(value);
    }
  }

  return clean;
}

export function labelForVisualAffixDegree(definition, degree) {
  return definition.params(degree)?.label || definition.label;
}

export function visualAffixNames() {
  return IKAL_VISUAL_AFFIXES.map((affix) => affix.abbreviation);
}

export function formatVisualAffixSignature(affixes = []) {
  return affixes
    .map((affix) => {
      const definition = visualAffixDefinitionFor(affix);

      if (!definition || !isVisualAffixDegreeValid(affix)) {
        return null;
      }

      return definition.abbreviation
        + "/" + affix.degree
        + " " + labelForVisualAffixDegree(definition, affix.degree);
    })
    .filter(Boolean)
    .join(", ");
}
