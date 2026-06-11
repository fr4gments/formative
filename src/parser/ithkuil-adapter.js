import { IKAL_AFFILIATION_FORMS } from "./ikal-affiliations.js";
import { IKAL_AUDIO_AFFIX_FORMS } from "./ikal-audio-affixes.js";
import { IKAL_VISUAL_AFFIX_FORMS } from "./ikal-visual-affixes.js";
import { IKAL_SEED_ROOTS, seedRootForForm } from "./ithkuil-seed-roots.js";

const EXTRA_FORMATIVES = new Map([
  ["kšala", {
    cr: "kš",
    domain: "unmapped",
    family: "unmapped",
    form: "kšala",
    sense: "unmapped Ithkuil root used by parser diagnostics",
  }],
]);

const REFERENTIALS = new Map([
  ["royež", {
    case: "ERG",
    gloss: "1m:BEN-ERG",
    referents: ["1m:BEN"],
  }],
]);

const GENERATED_FORMATIVES = new Map([
  ...IKAL_AUDIO_AFFIX_FORMS.map((form) => [form.form, form]),
  ...IKAL_VISUAL_AFFIX_FORMS.map((form) => [form.form, form]),
  ...IKAL_AFFILIATION_FORMS.map((form) => [form.form, form]),
]);

function normalizeText(text) {
  return text.trim();
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function glossesForSeed(seed) {
  const gloss = "S1-" + seed.sense;
  return {
    full: gloss,
    short: gloss,
  };
}

function formativeFromSeed(source, seed, overrides = {}) {
  const ca = clonePlain({ ...(seed.ca || {}), ...(overrides.ca || {}) });
  const fn = seed.function || "STA";
  const stem = seed.stem || 1;
  const slotVAffixes = clonePlain(overrides.slotVAffixes || []);
  const slotVIIAffixes = clonePlain(overrides.slotVIIAffixes || []);
  const parsed = {
    ca,
    case: "THM",
    context: "EXS",
    function: fn,
    root: seed.cr,
    shortcut: false,
    slotVAffixes,
    slotVIIAffixes,
    specification: "BSC",
    stem,
    type: "UNF/C",
  };
  const glosses = glossesForSeed(seed);

  return {
    ithkuil: {
      affixes: {
        slotV: slotVAffixes,
        slotVII: slotVIIAffixes,
      },
      ca,
      case: parsed.case,
      caseScope: null,
      concatenationType: null,
      context: parsed.context,
      formativeType: parsed.type,
      function: fn,
      gloss: glosses.short,
      glosses,
      normalized: overrides.normalized || seed.form,
      parsed: clonePlain(parsed),
      root: seed.cr,
      source,
      specification: parsed.specification,
      stem: parsed.stem,
      type: "formative",
      version: null,
      vn: null,
      wordType: "formative",
    },
  };
}

function referentialFromFixture(source, referential) {
  const parsed = {
    case: referential.case,
    referents: clonePlain(referential.referents),
  };

  return {
    ithkuil: {
      gloss: referential.gloss,
      glosses: {
        full: referential.gloss,
        short: referential.gloss,
      },
      normalized: source,
      parsed,
      source,
      type: "referential",
      wordType: "referential",
    },
  };
}

function matchesCa(seedCa = {}, wordCa = {}) {
  for (const [key, value] of Object.entries(seedCa)) {
    if (wordCa[key] !== value) {
      return false;
    }
  }

  return true;
}

export function parseIthkuilWord(text) {
  const source = normalizeText(text);

  if (!source) {
    return {
      error: "mot Ithkuil vide",
    };
  }

  const seed = seedRootForForm(source) || EXTRA_FORMATIVES.get(source);

  if (seed) {
    return formativeFromSeed(source, seed);
  }

  const generated = GENERATED_FORMATIVES.get(source);

  if (generated) {
    const baseSeed = seedRootForForm(generated.baseForm);

    if (baseSeed) {
      return formativeFromSeed(source, baseSeed, {
        ca: generated.affiliation ? { affiliation: generated.affiliation } : undefined,
        normalized: source,
        slotVAffixes: generated.slotVAffixes,
        slotVIIAffixes: generated.slotVIIAffixes,
      });
    }
  }

  const referential = REFERENTIALS.get(source);

  if (referential) {
    return referentialFromFixture(source, referential);
  }

  return {
    error: "forme Ithkuil non reconnue : « " + source + " »",
  };
}

export function generateIthkuilWord(word) {
  const fn = word.function || "STA";
  const stem = word.stem || 1;
  const seed = IKAL_SEED_ROOTS.find((candidate) => (
    candidate.cr === word.root
    && (candidate.function || "STA") === fn
    && (candidate.stem || 1) === stem
    && matchesCa(candidate.ca, word.ca)
  ));

  if (!seed) {
    throw new Error("forme IKAL non mappée pour root=" + (word.root || ""));
  }

  return seed.form;
}
