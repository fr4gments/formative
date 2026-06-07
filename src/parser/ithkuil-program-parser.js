import { parseIthkuilWord } from "./ithkuil-adapter.js";
import { userParamsFromPositionals } from "./ikal-param-signatures.js";
import { seedRootForIthkuil } from "./ithkuil-seed-roots.js";
import { paramsForIthkuilWord } from "./ithkuil-to-params.js";

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
    .map((line) => line.trim())
    .filter(Boolean);
  const diagnostics = [];
  const layers = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const words = [];
    const tokenized = tokenizeLine(lines[i]);

    if (tokenized.error) {
      return {
        error: lines.length === 1 ? tokenized.error : "ligne " + lineNumber + " : " + tokenized.error,
      };
    }

    for (const token of tokenized.tokens) {
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
