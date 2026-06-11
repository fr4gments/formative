export const MAX_ACTIVE_AUDIO_EFFECTS = 3;

export const DEFAULT_AUDIO_AFFIX_DEGREES = Object.freeze({
  DTS: 7,
  FLS: 2,
  FRC: 8,
  ITY: 7,
  MDL: 6,
  OPF: 1,
});

export const IKAL_AUDIO_SOURCE_ROOTS = Object.freeze(["bj", "čxw", "ļt", "lxr", "psw"]);

export const ZERO_AUDIO_EFFECTS = Object.freeze({
  degradation: 0,
  force: 0,
  instability: 0,
  intensity: 0,
  randomModulation: 0,
  reverb: 0,
});

const SOUND_FAMILIES = new Set(["breath", "click", "impact", "noise", "roll"]);

export const IKAL_AUDIO_AFFIXES = [
  {
    abbreviation: "ITY",
    cs: "ţm",
    direction: "normal",
    id: "intensity",
    label: "intensity",
    params(value) {
      return {
        distortion: value * 0.12,
        drive: value * 0.58,
        saturation: value * 0.28,
      };
    },
    type: 1,
  },
  {
    abbreviation: "MDL",
    cs: "jm",
    direction: "normal",
    id: "randomModulation",
    label: "random-modulation",
    params(value) {
      return {
        roughness: value * 0.28,
        tear: value * 0.24,
      };
    },
    type: 1,
  },
  {
    abbreviation: "FRC",
    cs: "sm",
    direction: "normal",
    id: "force",
    label: "force",
    params(value) {
      return {
        drive: value * 0.24,
        roughness: value * 0.38,
      };
    },
    type: 1,
  },
  {
    abbreviation: "OPF",
    cs: "řč",
    direction: "inverse",
    id: "degradation",
    label: "degradation",
    params(value) {
      return {
        bitcrush: value * 0.72,
        roughness: value * 0.18,
        tear: value * 0.48,
      };
    },
    type: 1,
  },
  {
    abbreviation: "FLS",
    cs: "mh",
    direction: "inverse",
    id: "instability",
    label: "instability",
    params(value) {
      return {
        roughness: value * 0.30,
        tear: value * 0.38,
      };
    },
    type: 1,
  },
  {
    abbreviation: "DTS",
    cs: "mp",
    direction: "normal",
    id: "reverb",
    label: "reverb",
    params(value) {
      return {
        reverb: value,
      };
    },
    type: 1,
  },
];

const AUDIO_AFFIX_BY_KEY = new Map(IKAL_AUDIO_AFFIXES.map((affix) => [keyForAffix(affix), affix]));

function keyForAffix(affix) {
  return String(affix.cs) + "/" + String(affix.type || 1);
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

export function emptyAudioEffects() {
  return { ...ZERO_AUDIO_EFFECTS };
}

export function audioAffixDefinitionFor(affix) {
  return AUDIO_AFFIX_BY_KEY.get(keyForAffix(affix));
}

export function isAudioAffixDegreeValid(affix) {
  return Number.isInteger(affix?.degree) && affix.degree >= 1 && affix.degree <= 9;
}

export function valueForAudioAffix(definition, degree) {
  if (definition.direction === "inverse") {
    return clamp01((10 - degree) / 10);
  }

  return clamp01(degree / 10);
}

export function audioAffixCompatibleWithFamily(_definition, family) {
  return SOUND_FAMILIES.has(family);
}

export function paramsEffectsForAudioAffix(definition, value) {
  return definition.params(clamp01(value));
}

export function audioAffixNames() {
  return IKAL_AUDIO_AFFIXES.map((affix) => affix.abbreviation);
}

export function formatAudioAffixSignature(affixes = []) {
  return affixes
    .map((affix) => {
      const definition = audioAffixDefinitionFor(affix);

      if (!definition || !isAudioAffixDegreeValid(affix)) {
        return null;
      }

      const value = valueForAudioAffix(definition, affix.degree);

      return definition.abbreviation
        + "/" + affix.degree
        + " " + definition.label
        + " = " + Number(value.toFixed(1)).toString();
    })
    .filter(Boolean)
    .join(", ");
}
