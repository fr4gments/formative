import { parseIthkuilProgram } from "./ithkuil-program-parser.js";
import { parseProgramme as parsePocProgramme } from "./poc-parser.js";

const BLOCKING_DIAGNOSTICS = new Set([
  "unmapped-root",
  "unmapped-params-root",
  "unsupported-word-type",
]);

function blockingDiagnostic(diagnostics = []) {
  return diagnostics.find((item) => BLOCKING_DIAGNOSTICS.has(item.code));
}

function diagnosticError(diagnostic, lineCount) {
  if (!diagnostic) {
    return null;
  }

  return lineCount === 1
    ? diagnostic.message
    : "ligne " + diagnostic.line + " : " + diagnostic.message;
}

function wordToProgram(word) {
  return {
    baseParams: word.baseParams,
    diagnostics: word.diagnostics,
    gloss: word.seedRoot?.sense || word.ithkuil.glosses.short,
    ithkuil: word.ithkuil,
    params: word.params,
    seedRoot: word.seedRoot,
    sourceSyntax: "ithkuil",
    suffixes: [],
    text: word.text,
    userParams: word.userParams,
  };
}

function lineToLayer(layer) {
  return {
    diagnostics: layer.diagnostics,
    sequence: layer.words
      .filter((word) => word.params && word.params.role !== "mode")
      .map(wordToProgram),
    text: layer.text,
    words: layer.words,
  };
}

export function parseIkalProgram(text) {
  const poc = parsePocProgramme(text);

  if (!poc.error) {
    return {
      ...poc,
      sourceSyntax: "poc",
    };
  }

  const ithkuil = parseIthkuilProgram(text);

  if (ithkuil.error) {
    return ithkuil;
  }

  const sourceLines = ithkuil.text.split("\n");
  const blocking = blockingDiagnostic(ithkuil.diagnostics);
  const error = diagnosticError(blocking, sourceLines.length);

  if (error) {
    return { error };
  }

  const layers = ithkuil.layers.map(lineToLayer);
  const emptyLayerIndex = layers.findIndex((layer) => layer.sequence.length === 0);

  if (emptyLayerIndex >= 0) {
    return {
      error: layers.length === 1
        ? "aucun mot IKAL exploitable dans la ligne"
        : "ligne " + (emptyLayerIndex + 1) + " : aucun mot IKAL exploitable dans la ligne",
    };
  }

  return {
    diagnostics: ithkuil.diagnostics,
    layers,
    sequence: layers[0].sequence,
    sourceSyntax: "ithkuil",
    text: ithkuil.text,
    words: ithkuil.words,
  };
}
