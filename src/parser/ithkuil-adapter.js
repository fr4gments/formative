import { wordToIthkuil } from "@zsnout/ithkuil/generate/index.js";
import { glossWord } from "@zsnout/ithkuil/gloss/index.js";
import { parseWord } from "@zsnout/ithkuil/parse/index.js";

function normalizeText(text) {
  return text.trim();
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function glossToString(gloss) {
  if (typeof gloss === "string") {
    return gloss;
  }

  return gloss?.short || gloss?.full || "";
}

function normalizeGloss(gloss) {
  if (typeof gloss === "string") {
    return {
      full: gloss,
      short: gloss,
    };
  }

  return {
    full: gloss?.full || "",
    short: gloss?.short || gloss?.full || "",
  };
}

function wordType(parsed) {
  if (!parsed || typeof parsed !== "object") {
    return "unknown";
  }

  if ("root" in parsed) {
    return "formative";
  }

  if ("referents" in parsed || "referents2" in parsed) {
    return "referential";
  }

  return "adjunct";
}

function formativeFields(parsed) {
  if (wordType(parsed) !== "formative") {
    return {};
  }

  return {
    affixes: {
      slotV: parsed.slotVAffixes || [],
      slotVII: parsed.slotVIIAffixes || [],
    },
    ca: parsed.ca || {},
    case: parsed.case || null,
    caseScope: parsed.caseScope || null,
    concatenationType: parsed.concatenationType || null,
    context: parsed.context || null,
    function: parsed.function || null,
    root: parsed.root || null,
    specification: parsed.specification || null,
    stem: parsed.stem || null,
    formativeType: parsed.type || null,
    version: parsed.version || null,
    vn: parsed.vn || null,
  };
}

export function parseIthkuilWord(text) {
  const source = normalizeText(text);

  if (!source) {
    return {
      error: "mot Ithkuil vide",
    };
  }

  try {
    const parsed = parseWord(source);

    if (!parsed) {
      return {
        error: "forme Ithkuil non reconnue : « " + source + " »",
      };
    }

    const generated = wordToIthkuil(parsed);

    const gloss = glossWord(parsed);

    const type = wordType(parsed);

    return {
      ithkuil: {
        ...formativeFields(parsed),
        source,
        normalized: generated,
        type,
        wordType: type,
        parsed: clonePlain(parsed),
        gloss: glossToString(gloss),
        glosses: normalizeGloss(gloss),
      },
    };
  } catch (error) {
    return {
      error: "forme Ithkuil invalide : « " + source + " » (" + error.message + ")",
    };
  }
}

export function generateIthkuilWord(word) {
  return wordToIthkuil(word);
}
