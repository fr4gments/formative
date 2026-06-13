// Composition à la volée des formes IKAL canoniques : le vocabulaire des
// suggestions n'est plus stocké dans des manifests, il est calculé depuis les
// règles (graines × affixes × degrés × affiliations) via le runtime
// morphologique embarqué. La grammaire reste fermée (mots-clés connus), les
// combinaisons sont illimitées.
import { generateIthkuilWord } from "./ithkuil-adapter.js";
import { IKAL_MARKED_AFFILIATIONS } from "./ikal-affiliations.js";
import {
  DEFAULT_AUDIO_AFFIX_DEGREES,
  IKAL_AUDIO_AFFIXES,
  IKAL_AUDIO_SOURCE_ROOTS,
} from "./ikal-audio-affixes.js";
import {
  DEFAULT_VISUAL_AFFIX_DEGREES,
  IKAL_VISUAL_AFFIXES,
  IKAL_VISUAL_SOURCE_ROOTS,
} from "./ikal-visual-affixes.js";
import { IKAL_SEED_ROOTS } from "./ithkuil-seed-roots.js";

// Les racines de « matière visuelle » : celles qui acceptent une Affiliation
// marquée (la conjugaison). Le vocabulaire visuel étant symétrique, les mots
// de mouvement (tr, gl) en font partie.
export const IKAL_MATTER_ROOTS = Object.freeze([
  "llw", "šp", "fř", "ft", "vt", "fth", "mzm", "tçv", "tr", "gl",
]);

const composedFormCache = new Map();

function affixKey(affix) {
  return affix.cs + ":" + affix.degree + ":" + (affix.type || 1);
}

function plainAffix(definition, degree) {
  return {
    cs: definition.cs,
    degree,
    type: definition.type,
  };
}

function combinations(items, size, start = 0, prefix = []) {
  if (prefix.length === size) {
    return [prefix];
  }

  const result = [];

  for (let i = start; i < items.length; i++) {
    result.push(...combinations(items, size, i + 1, [...prefix, items[i]]));
  }

  return result;
}

export function composeIkalForm(seed, {
  affiliation = null,
  configuration = null,
  fn = null,
  slotVIIAffixes = [],
  stem = null,
} = {}) {
  const key = [
    seed.form,
    affiliation || "",
    configuration || "",
    fn || "",
    stem ?? "",
    slotVIIAffixes.map(affixKey).join(","),
  ].join("|");

  if (composedFormCache.has(key)) {
    return composedFormCache.get(key);
  }

  const ca = { ...(seed.ca || {}) };

  if (affiliation) {
    ca.affiliation = affiliation;
  }

  if (configuration) {
    ca.configuration = configuration;
  }

  const form = generateIthkuilWord({
    ca,
    function: fn || seed.function || "STA",
    root: seed.cr,
    slotVIIAffixes,
    stem: stem ?? seed.stem ?? 1,
  });

  composedFormCache.set(key, form);

  return form;
}

function suggestionEntry(seed, kind, { affiliation = null, slotVIIAffixes = [] } = {}) {
  const entry = {
    baseForm: seed.form,
    form: composeIkalForm(seed, { affiliation, slotVIIAffixes }),
    kind,
    root: seed.cr,
  };

  if (affiliation) {
    entry.affiliation = affiliation;
  }

  if (slotVIIAffixes.length > 0) {
    entry.slotVIIAffixes = slotVIIAffixes;
  }

  return entry;
}

function affixedEntriesForSeed(seed, definitions, defaultDegrees, comboSizes) {
  const entries = [];

  for (const definition of definitions) {
    for (let degree = 1; degree <= 9; degree++) {
      entries.push(suggestionEntry(seed, "single", {
        slotVIIAffixes: [plainAffix(definition, degree)],
      }));
    }
  }

  for (const size of comboSizes) {
    for (const combo of combinations(definitions, size)) {
      entries.push(suggestionEntry(seed, "combo-default", {
        slotVIIAffixes: combo.map((definition) => (
          plainAffix(definition, defaultDegrees[definition.abbreviation])
        )),
      }));
    }
  }

  return entries;
}

let audioSuggestionCache = null;

export function ikalAudioSuggestionForms() {
  if (!audioSuggestionCache) {
    const soundSeeds = IKAL_SEED_ROOTS.filter((seed) => IKAL_AUDIO_SOURCE_ROOTS.includes(seed.cr));

    audioSuggestionCache = soundSeeds.flatMap((seed) => (
      affixedEntriesForSeed(seed, IKAL_AUDIO_AFFIXES, DEFAULT_AUDIO_AFFIX_DEGREES, [2, 3])
    ));
  }

  return audioSuggestionCache;
}

let visualSuggestionCache = null;

export function ikalVisualSuggestionForms() {
  if (!visualSuggestionCache) {
    const visualSeeds = IKAL_SEED_ROOTS.filter((seed) => IKAL_VISUAL_SOURCE_ROOTS.includes(seed.cr));

    visualSuggestionCache = visualSeeds.flatMap((seed) => (
      affixedEntriesForSeed(seed, IKAL_VISUAL_AFFIXES, DEFAULT_VISUAL_AFFIX_DEGREES, [2])
    ));
  }

  return visualSuggestionCache;
}

// Sources à hauteur : un mot = un MOTIF. Les formes-motifs sont ÉNUMÉRÉES
// (comme les formes affixées audio/visuelles) pour qu'on les trouve en tapant
// leur approximation ASCII (emz -> emžvuža…) — la façon dont on écrit les mots
// dans tout le projet. Dimensions : octave (Stem), nb de notes (Configuration),
// contour + intervalle (affixes fb / řks), note de départ (affixe lc).
const IKAL_TONE_SOURCE_ROOTS = Object.freeze(["mžv", "žb", "řż", "žd", "lly"]);
// degrés représentatifs, cohérents avec ikal-motif-affixes.js
// (fb : 1-3 montant, 4-6 ondulant, 7-9 descendant · řks : >=6 sauts)
const MOTIF_CONTOUR_FORMS = [
  { contour: "up", fb: null },
  { contour: "wave", fb: 5 },
  { contour: "down", fb: 8 },
];
const MOTIF_INTERVAL_FORMS = [
  { interval: "step", rks: null },
  { interval: "leap", rks: 7 },
];
const MOTIF_COUNT_CONFIG = { 1: null, 2: "DPX", 3: "MFC" };

let motifSuggestionCache = null;

export function ikalMotifSuggestionForms() {
  if (motifSuggestionCache) {
    return motifSuggestionCache;
  }

  const entries = [];
  const seen = new Set();

  for (const cr of IKAL_TONE_SOURCE_ROOTS) {
    const seed = IKAL_SEED_ROOTS.find((root) => root.cr === cr);

    if (!seed) {
      continue;
    }

    for (const stem of [1, 2, 3]) {
      for (const count of [1, 2, 3]) {
        // contour / intervalle n'ont de sens qu'à partir de 2 notes.
        const contours = count === 1 ? [MOTIF_CONTOUR_FORMS[0]] : MOTIF_CONTOUR_FORMS;
        const intervals = count === 1 ? [MOTIF_INTERVAL_FORMS[0]] : MOTIF_INTERVAL_FORMS;

        for (const c of contours) {
          for (const iv of intervals) {
            for (let start = 1; start <= 9; start++) {
              const slotVIIAffixes = [];

              if (start !== 1) {
                slotVIIAffixes.push({ cs: "lc", degree: start, type: 1 });
              }

              if (c.fb) {
                slotVIIAffixes.push({ cs: "fb", degree: c.fb, type: 1 });
              }

              if (iv.rks) {
                slotVIIAffixes.push({ cs: "řks", degree: iv.rks, type: 1 });
              }

              let form;

              try {
                form = composeIkalForm(seed, {
                  configuration: MOTIF_COUNT_CONFIG[count],
                  fn: count > 1 ? "DYN" : null,
                  slotVIIAffixes,
                  stem,
                });
              } catch {
                continue;
              }

              if (seen.has(form)) {
                continue;
              }

              seen.add(form);
              entries.push({
                affixCount: slotVIIAffixes.length,
                baseForm: seed.form,
                form,
                motif: { contour: c.contour, count, interval: iv.interval, start, stem },
                root: cr,
              });
            }
          }
        }
      }
    }
  }

  motifSuggestionCache = entries;

  return entries;
}

let affiliationSuggestionCache = null;

export function ikalAffiliationSuggestionForms() {
  if (!affiliationSuggestionCache) {
    affiliationSuggestionCache = [];

    for (const cr of IKAL_MATTER_ROOTS) {
      const seed = IKAL_SEED_ROOTS.find((root) => root.cr === cr);

      if (!seed) {
        continue;
      }

      for (const entry of IKAL_MARKED_AFFILIATIONS) {
        affiliationSuggestionCache.push(suggestionEntry(seed, "affiliation", {
          affiliation: entry.code,
        }));
      }
    }
  }

  return affiliationSuggestionCache;
}
