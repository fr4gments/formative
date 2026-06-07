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

function groupedLayers(layers) {
  return {
    animationLayers: layers.filter((layer) => layer.mode === "animation"),
    imageLayers: layers.filter((layer) => layer.mode === "image"),
    musicLayers: layers.filter((layer) => layer.mode === "music"),
  };
}

function firstSequence(layers, musicLayers) {
  return musicLayers[0]?.sequence || layers[0]?.sequence || [];
}

function lineToLayer(layer) {
  return {
    bodyText: layer.bodyText ?? layer.text,
    diagnostics: layer.diagnostics,
    implicitMode: layer.implicitMode ?? true,
    mode: layer.mode || "music",
    modeToken: layer.modeToken || null,
    modeWord: layer.modeWord || null,
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
    if (poc.stop) {
      return {
        ...poc,
        sourceSyntax: "poc",
      };
    }

    const layers = (poc.layers || [{ sequence: poc.sequence, text: poc.text }]).map((layer) => ({
      ...layer,
      bodyText: layer.text,
      implicitMode: true,
      mode: "music",
      modeToken: null,
    }));

    return {
      ...poc,
      animationLayers: layers,
      imageLayers: layers,
      layers,
      musicLayers: layers,
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

  if (layers.length === 0) {
    return {
      error: "aucune couche IKAL exploitable",
    };
  }

  const emptyLayerIndex = layers.findIndex((layer) => layer.sequence.length === 0);

  if (emptyLayerIndex >= 0) {
    return {
      error: layers.length === 1
        ? "aucun mot IKAL exploitable dans la ligne"
        : "ligne " + (emptyLayerIndex + 1) + " : aucun mot IKAL exploitable dans la ligne",
    };
  }

  const groups = groupedLayers(layers);

  return {
    diagnostics: ithkuil.diagnostics,
    layers,
    ...groups,
    sequence: firstSequence(layers, groups.musicLayers),
    sourceSyntax: "ithkuil",
    text: ithkuil.text,
    words: ithkuil.words,
  };
}
