// Adaptateur morphologique : toute forme tapée est DÉCOMPOSÉE par les règles
// Ithkuil (parseWord, extrait de @zsnout/ithkuil), plus aucune consultation de
// listes de formes pré-générées. La grammaire IKAL reste fermée (racines +
// affixes + degrés connus), mais ses combinaisons sont illimitées : c'est la
// couche sens -> params qui dit ce qu'IKAL sait faire d'une décomposition.
import { parseWord, wordToIthkuil } from "./generated/ithkuil-runtime.js";
import { seedRootForIthkuil } from "./ithkuil-seed-roots.js";

function normalizeText(text) {
  return text.trim();
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function glossesFor(gloss) {
  return {
    full: gloss,
    short: gloss,
  };
}

function normalizedAffix(affix) {
  return {
    cs: affix.cs,
    degree: affix.degree,
    type: affix.type,
  };
}

function formativeFromParsed(source, normalized, parsed) {
  const slotVAffixes = (parsed.slotVAffixes || []).map(normalizedAffix);
  const slotVIIAffixes = (parsed.slotVIIAffixes || []).map(normalizedAffix);
  const ca = clonePlain(parsed.ca || {});
  const fn = parsed.function || "STA";
  const stem = parsed.stem ?? 1;
  const ithkuil = {
    affixes: {
      slotV: slotVAffixes,
      slotVII: slotVIIAffixes,
    },
    ca,
    case: parsed.case || "THM",
    caseScope: parsed.caseScope ?? null,
    concatenationType: parsed.concatenationType ?? null,
    context: parsed.context || "EXS",
    formativeType: parsed.type,
    function: fn,
    gloss: "",
    glosses: null,
    normalized,
    parsed: clonePlain(parsed),
    root: String(parsed.root),
    source,
    specification: parsed.specification || "BSC",
    stem,
    type: "formative",
    version: parsed.version || null,
    vn: parsed.vn ?? null,
    wordType: "formative",
  };
  const seed = seedRootForIthkuil(ithkuil);
  const gloss = seed ? "S1-" + seed.sense : "S" + stem + "-" + ithkuil.root;

  ithkuil.gloss = gloss;
  ithkuil.glosses = glossesFor(gloss);

  return { ithkuil };
}

function referentialFromParsed(source, normalized, parsed) {
  const referents = clonePlain(parsed.referents || []);
  const gloss = referents.join("+") + "-" + String(parsed.case || "THM");

  return {
    ithkuil: {
      gloss,
      glosses: glossesFor(gloss),
      normalized,
      parsed: clonePlain(parsed),
      source,
      type: "referential",
      wordType: "referential",
    },
  };
}

function adjunctFromParsed(source, normalized, parsed) {
  const gloss = typeof parsed === "string" ? parsed : "adjunct";

  return {
    ithkuil: {
      gloss,
      glosses: glossesFor(gloss),
      normalized,
      parsed: clonePlain(parsed),
      source,
      type: "adjunct",
      wordType: "adjunct",
    },
  };
}

export function parseIthkuilWord(text) {
  const source = normalizeText(text);

  if (!source) {
    return {
      error: "mot Ithkuil vide",
    };
  }

  const normalized = source.normalize("NFC");
  let parsed;

  try {
    parsed = parseWord(normalized);
  } catch {
    parsed = undefined;
  }

  if (parsed === undefined || parsed === null) {
    return {
      error: "forme Ithkuil non reconnue : « " + source + " »",
    };
  }

  if (typeof parsed === "object" && "root" in parsed) {
    return formativeFromParsed(source, normalized, parsed);
  }

  if (typeof parsed === "object" && "referents" in parsed) {
    return referentialFromParsed(source, normalized, parsed);
  }

  return adjunctFromParsed(source, normalized, parsed);
}

export function generateIthkuilWord(word) {
  try {
    return wordToIthkuil({
      ca: word.ca || {},
      function: word.function || "STA",
      root: word.root,
      shortcut: false,
      slotVAffixes: word.slotVAffixes || [],
      slotVIIAffixes: word.slotVIIAffixes || [],
      stem: word.stem ?? 1,
      type: word.type || "UNF/C",
    });
  } catch (error) {
    throw new Error("forme IKAL non générable pour root=" + (word.root || "") + " : " + String(error?.message || error));
  }
}
