import { parseIthkuilProgram } from "./ithkuil-program-parser.js";
import { seedRootCompatibleWithMode } from "./ikal-mode-compatibility.js";
import { parseProgramme as parsePocProgramme } from "./poc-parser.js";

const BLOCKING_DIAGNOSTICS = new Set([
  "incompatible-layer-mode",
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
    line: layer.line,
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

function diagnostic({ code, line, message, severity = "warning", token }) {
  return {
    code,
    line,
    message,
    severity,
    token,
  };
}

function layerModeDiagnostics(layer) {
  const diagnostics = [];

  for (const program of layer.sequence) {
    const domain = program.seedRoot?.domain;

    if (!domain || seedRootCompatibleWithMode(program.seedRoot, layer.mode)) {
      continue;
    }

    diagnostics.push(diagnostic({
      code: "incompatible-layer-mode",
      line: layer.line,
      message: "mot « " + program.text + " » du domaine " + domain + " incompatible avec le mode " + layer.mode,
      severity: "error",
      token: program.text,
    }));
  }

  return diagnostics;
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

  const layers = ithkuil.layers.map(lineToLayer);

  if (layers.length === 0) {
    return {
      error: "aucune couche IKAL exploitable",
    };
  }

  const sourceLines = ithkuil.text.split("\n");
  const modeDiagnostics = layers.flatMap(layerModeDiagnostics);
  const diagnostics = [...ithkuil.diagnostics, ...modeDiagnostics];
  const blocking = blockingDiagnostic(diagnostics);
  const error = diagnosticError(blocking, sourceLines.length);

  if (error) {
    return { error };
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
    diagnostics,
    layers,
    ...groups,
    sequence: firstSequence(layers, groups.musicLayers),
    sourceSyntax: "ithkuil",
    tempo: ithkuil.tempo ?? null,
    text: ithkuil.text,
    words: ithkuil.words,
  };
}
