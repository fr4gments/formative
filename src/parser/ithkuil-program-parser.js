import { parseIthkuilWord } from "./ithkuil-adapter.js";
import { userParamsFromPositionals } from "./ikal-param-signatures.js";
import { seedRootForIthkuil } from "./ithkuil-seed-roots.js";
import { paramsForIthkuilWord } from "./ithkuil-to-params.js";

const DEFAULT_LAYER_MODE = "music";
const MODE_DECLARATIONS = new Map([
  ["alkala", "music"],
  ["lyala", "image"],
  ["lyula", "animation"],
]);

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
  const tokens = [];
  let current = "";
  let depth = 0;

  for (const char of text) {
    if (/\s/.test(char) && depth === 0) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    if (char === "(") {
      depth++;
    } else if (char === ")") {
      depth--;

      if (depth < 0) {
        return { error: "parenthèse fermante inattendue" };
      }
    }

    current += char;
  }

  if (depth > 0) {
    return { error: "parenthèse non fermée" };
  }

  if (current) {
    tokens.push(current);
  }

  return { tokens };
}

function parseModeDeclaration(line, lineNumber) {
  const match = /^([^\s:]+):\s*(.*)$/.exec(line);

  if (!match) {
    return null;
  }

  const modeToken = match[1];
  const mode = MODE_DECLARATIONS.get(modeToken);

  if (!mode) {
    return {
      error: "déclaration de mode invalide : « " + modeToken + ": » (attendu : alkala:, lyala: ou lyula:)",
    };
  }

  const modeResult = analyzeIthkuilToken(modeToken, lineNumber);

  if (modeResult.error) {
    return {
      error: modeResult.error,
    };
  }

  if (match[2].trim()) {
    return {
      error: "déclaration de mode invalide : « " + modeToken + ": » doit être seule sur sa ligne",
    };
  }

  return {
    mode,
    modeToken,
    modeWord: modeResult.word,
  };
}

function parsePositionValue(text) {
  const value = text.trim();

  if (!/^(?:0(?:\.\d{1,2})?|1(?:\.0{1,2})?)$/.test(value)) {
    return {
      error: "paramètre invalide : « " + text + " » (attendu : nombre entre 0 et 1, maximum 2 décimales)",
    };
  }

  return {
    value: Number(value),
  };
}

function parseTokenSyntax(token) {
  const open = token.indexOf("(");

  if (open < 0) {
    return {
      form: token,
      positionals: [],
      text: token,
    };
  }

  if (!token.endsWith(")")) {
    return {
      error: "syntaxe de paramètres invalide : « " + token + " »",
    };
  }

  const form = token.slice(0, open);
  const argsText = token.slice(open + 1, -1);

  if (!form) {
    return {
      error: "mot IKAL manquant avant les paramètres",
    };
  }

  if (argsText.includes("(") || argsText.includes(")")) {
    return {
      error: "parenthèses imbriquées non supportées : « " + token + " »",
    };
  }

  if (!argsText.trim()) {
    return {
      form,
      positionals: [],
      text: token,
    };
  }

  const positionals = [];

  for (const rawPart of argsText.split(",")) {
    if (!rawPart.trim()) {
      return {
        error: "paramètre vide dans « " + token + " »",
      };
    }

    const parsed = parsePositionValue(rawPart);

    if (parsed.error) {
      return parsed;
    }

    positionals.push(parsed.value);
  }

  return {
    form,
    positionals,
    text: token,
  };
}

export function analyzeIthkuilToken(token, line = 1) {
  const tokenSyntax = parseTokenSyntax(token);

  if (tokenSyntax.error) {
    return {
      error: tokenSyntax.error,
    };
  }

  const parsed = parseIthkuilWord(tokenSyntax.form);

  if (parsed.error) {
    return {
      error: parsed.error,
    };
  }

  const ithkuil = parsed.ithkuil;
  const diagnostics = [];
  let baseParams = null;
  const seedRoot = seedRootForIthkuil(ithkuil);
  let params = null;
  let userParams = {};

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
  } else {
    const positionals = userParamsFromPositionals(seedRoot, tokenSyntax.positionals);

    if (positionals.error) {
      return {
        error: positionals.error,
      };
    }

    userParams = positionals.userParams;
    const paramsResult = paramsForIthkuilWord({ ithkuil, seedRoot, userParams });

    baseParams = paramsResult.baseParams;
    params = paramsResult.params;
    userParams = paramsResult.userParams;
    diagnostics.push(...paramsResult.diagnostics.map((item) => diagnostic({
      code: item.code,
      line,
      message: item.message,
      severity: item.severity,
      token,
    })));
  }

  return {
    diagnostics,
    word: {
      baseParams,
      diagnostics,
      ithkuil,
      params,
      seedRoot: seedRoot || null,
      text: tokenSyntax.text,
      userParams,
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
    .map((raw, index) => ({
      lineNumber: index + 1,
      raw,
      text: raw.trim(),
    }))
    .filter((line) => line.text);
  const diagnostics = [];
  const layers = [];
  let activeMode = DEFAULT_LAYER_MODE;
  let activeModeToken = null;
  let activeModeWord = null;
  let activeModeImplicit = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const declaration = parseModeDeclaration(line.text, line.lineNumber);

    if (declaration?.error) {
      return {
        error: lines.length === 1 ? declaration.error : "ligne " + line.lineNumber + " : " + declaration.error,
      };
    }

    if (declaration) {
      activeMode = declaration.mode;
      activeModeToken = declaration.modeToken;
      activeModeWord = declaration.modeWord;
      activeModeImplicit = false;
      continue;
    }

    if (!activeModeImplicit && !/^\s/.test(line.raw)) {
      const error = "instruction de bloc non indentée : « " + line.text + " »";

      return {
        error: lines.length === 1 ? error : "ligne " + line.lineNumber + " : " + error,
      };
    }

    const words = [];
    const body = line.text;
    const tokenized = body ? tokenizeLine(body) : { tokens: [] };

    if (tokenized.error) {
      return {
        error: lines.length === 1 ? tokenized.error : "ligne " + line.lineNumber + " : " + tokenized.error,
      };
    }

    for (const token of tokenized.tokens) {
      const result = analyzeIthkuilToken(token, line.lineNumber);

      if (result.error) {
        return {
          error: lines.length === 1 ? result.error : "ligne " + line.lineNumber + " : " + result.error,
        };
      }

      words.push(result.word);
      diagnostics.push(...result.diagnostics);
    }

    layers.push({
      bodyText: body,
      diagnostics: words.flatMap((word) => word.diagnostics),
      implicitMode: activeModeImplicit,
      mode: activeMode,
      modeToken: activeModeToken,
      modeWord: activeModeWord,
      text: line.text,
      words,
    });
  }

  return {
    diagnostics,
    layers,
    text: lines.map((line) => line.text).join("\n"),
    words: layers.flatMap((layer) => layer.words),
  };
}
