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

export function composeIkalForm(seed, { affiliation = null, slotVIIAffixes = [] } = {}) {
  const key = seed.form
    + "|" + (affiliation || "")
    + "|" + slotVIIAffixes.map(affixKey).join(",");

  if (composedFormCache.has(key)) {
    return composedFormCache.get(key);
  }

  const ca = { ...(seed.ca || {}) };

  if (affiliation) {
    ca.affiliation = affiliation;
  }

  const form = generateIthkuilWord({
    ca,
    function: seed.function || "STA",
    root: seed.cr,
    slotVIIAffixes,
    stem: seed.stem ?? 1,
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
