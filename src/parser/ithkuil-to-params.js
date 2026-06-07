export const IKAL_PARAMS_VERSION = 1;

const ZERO_EFFECTS = {
  bitcrush: 0,
  distortion: 0,
  drive: 0,
  roughness: 0,
  saturation: 0,
  tear: 0,
};

const ROOT_PARAM_RULES = {
  lk: { family: "music", mode: "music", role: "mode" },
  ly: { family: "visual-design", role: "mode" },
  llw: { family: "light", role: "modifier" },
  šp: { family: "color", role: "modifier" },
  tr: { family: "linear-motion", role: "modifier" },
  gl: { family: "random-motion", role: "modifier" },
  čxw: { family: "noise", role: "voice" },
  bj: { family: "impact", role: "voice" },
  ļt: { family: "click", role: "voice" },
  lxr: { family: "roll", role: "voice" },
  psw: { family: "breath", role: "voice" },
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

function representationParams(ca = {}) {
  const essence = ca.essence || "NRM";
  const representative = essence === "RPV";

  return {
    essence,
    ghost: representative ? 0.6 : 0,
    kind: representative ? "representative" : "normal",
  };
}

function unsupportedFeatureDiagnostics(ithkuil) {
  const diagnostics = [];
  const slotVCount = ithkuil.affixes?.slotV?.length || 0;
  const slotVIICount = ithkuil.affixes?.slotVII?.length || 0;

  if (slotVCount + slotVIICount > 0) {
    diagnostics.push(diagnostic(
      "unsupported-affixes",
      "forme Ithkuil valide, mais les affixes ne sont pas encore mappes artistiquement par IKAL",
    ));
  }

  return diagnostics;
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
  const effects = mergeEffects(
    FAMILY_EFFECTS[family],
    representation.ghost ? { bitcrush: 0.08, drive: 0.08 } : null,
  );
  const baseParams = {
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
    motion,
    multiplicity,
    representation,
    role,
    source: ithkuil.source,
    version: IKAL_PARAMS_VERSION,
  };
  const resolved = resolveIkalParams(baseParams, userParams);

  return {
    baseParams,
    diagnostics: [
      ...unsupportedFeatureDiagnostics(ithkuil),
      ...resolved.diagnostics,
    ],
    params: resolved.params,
    userParams,
  };
}
