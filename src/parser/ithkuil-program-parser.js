import { parseIthkuilWord } from "./ithkuil-adapter.js";
import { seedRootForIthkuil } from "./ithkuil-seed-roots.js";

function diagnostic({ code, line, message, severity = "warning", token }) {
  return {
    code,
    line,
    message,
    severity,
    token,
  };
}

function tokenizeLine(text) {
  return text.split(/\s+/).filter(Boolean);
}

export function analyzeIthkuilToken(token, line = 1) {
  const parsed = parseIthkuilWord(token);

  if (parsed.error) {
    return {
      error: parsed.error,
    };
  }

  const ithkuil = parsed.ithkuil;
  const diagnostics = [];
  const seedRoot = seedRootForIthkuil(ithkuil);

  if (ithkuil.type !== "formative") {
    diagnostics.push(diagnostic({
      code: "unsupported-word-type",
      line,
      message: "forme Ithkuil valide, mais IKAL ne mappe encore que les formatives : type=" + ithkuil.type,
      token,
    }));
  } else if (!seedRoot) {
    diagnostics.push(diagnostic({
      code: "unmapped-root",
      line,
      message: "forme Ithkuil valide, mais racine non encore mappée par IKAL : root=" + ithkuil.root,
      token,
    }));
  }

  return {
    diagnostics,
    word: {
      diagnostics,
      ithkuil,
      seedRoot: seedRoot || null,
      text: token,
    },
  };
}

export function parseIthkuilProgram(text) {
  const source = text.replace(/\r\n?/g, "\n").trim();

  if (!source) {
    return { stop: true };
  }

  const lines = source
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const diagnostics = [];
  const layers = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const words = [];

    for (const token of tokenizeLine(lines[i])) {
      const result = analyzeIthkuilToken(token, lineNumber);

      if (result.error) {
        return {
          error: lines.length === 1 ? result.error : "ligne " + lineNumber + " : " + result.error,
        };
      }

      words.push(result.word);
      diagnostics.push(...result.diagnostics);
    }

    layers.push({
      diagnostics: words.flatMap((word) => word.diagnostics),
      text: lines[i],
      words,
    });
  }

  return {
    diagnostics,
    layers,
    text: lines.join("\n"),
    words: layers.flatMap((layer) => layer.words),
  };
}
