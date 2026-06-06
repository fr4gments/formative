const MOTS = {
  "kal": { root: "k", motion: "STA", number: "UPX", matter: "NRM", gloss: "clic · figé · 1 seul · net" },
  "ras": { root: "r", motion: "STA", number: "DPX", matter: "NRM", gloss: "roulement · figé · duo · net" },
  "suš": { root: "s", motion: "DYN", number: "MPX", matter: "NRM", gloss: "bruit · bouge · nuée · net" },
  "kul": { root: "k", motion: "DYN", number: "UPX", matter: "RPV", gloss: "clic · bouge · 1 seul · fantôme" },
  "sal": { root: "s", motion: "STA", number: "UPX", matter: "RPV", gloss: "souffle · figé · 1 seul · fantôme" },
  "ruř": { root: "r", motion: "DYN", number: "MPX", matter: "RPV", gloss: "roulement · bouge · nuée · fantôme" },
};

const SUFFIXES = {
  "tx": "déchire (XOR)",
  "šk": "sature (débordement)",
};

const ALIAS = {
  "sus": "suš",
  "rur": "ruř",
};

const ALIAS_SFX = {
  "sk": "šk",
};

export function parseMot(token) {
  const parts = token.split("-").map((part) => part.trim()).filter(Boolean);
  const brut = parts[0];
  const mot = ALIAS[brut] || brut;

  if (!MOTS[mot]) {
    return { error: "mot inconnu : « " + brut + " »" };
  }

  const suffixes = parts.slice(1).map((suffix) => ALIAS_SFX[suffix] || suffix);

  for (const suffix of suffixes) {
    if (!SUFFIXES[suffix]) {
      return { error: "suffixe inconnu : « -" + suffix + " »" };
    }
  }

  return {
    prog: {
      ...MOTS[mot],
      suffixes,
      text: token,
    },
  };
}

export function parseProgramme(str) {
  const text = str.trim();

  if (!text) {
    return { stop: true };
  }

  const sequence = [];

  for (const token of text.split(/\s+/)) {
    const result = parseMot(token);

    if (result.error) {
      return { error: result.error };
    }

    sequence.push(result.prog);
  }

  return { sequence, text };
}
