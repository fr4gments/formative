// Prototype Étape 5.6 — moteur visuel unifié en CHAMPS.
//
// Idée démontrée ici :
//   - une primitive = un champ : une fonction (x, y, temps) -> intensité 0..1 ;
//   - un effet / affixe = une TRANSFORMATION du champ (SIZ dilate les coordonnées,
//     DSG les tord, VTS les fracture) ou de sa traduction couleur (CLD, COL) ;
//   - deux mots sur une ligne se CONJUGUENT par un opérateur (territoires séparés,
//     l'un sculpte l'autre, l'un déforme l'autre) — rien ne s'additionne ;
//   - image fixe = ce calcul avec le temps figé ; animation = le même calcul
//     avec le temps qui s'écoule.
//
// Le vocabulaire est une table locale jouet : le vrai parser par décomposition
// (Étape 7) remplacera ces lookups. Ne pas brancher tel quel dans l'app.

const VOCAB = {
  // primitives
  "avtala": { family: "filament" },
  "ufthala": { family: "cloud" },
  "amzmala": { family: "trace" },
  "etçvala": { family: "spark" },
  "fřala": { family: "shape" },
  "ftala": { family: "texture" },
  // formes affixées de démo (mêmes formes que le manifest de l'app)
  "avtalöxa": { family: "filament", affixes: { SIZ: 6 } },
  "avtalävha": { family: "filament", affixes: { DSG: 2 } },
  "avtaläňfa": { family: "filament", affixes: { VTS: 2 } },
  "avtalexva": { family: "filament", affixes: { DCP: 3 } },
  "ufthalölba": { family: "cloud", affixes: { CLD: 6 } },
  "amzmaläňva": { family: "trace", affixes: { COL: 2 } },
  "etçvalöxäňva": { family: "spark", affixes: { SIZ: 6, COL: 2 } },
};

const PALETTES = {
  filament: [[12, 255, 194], [255, 47, 179], [255, 245, 179]],
  cloud: [[71, 43, 132], [0, 221, 255], [255, 238, 183]],
  trace: [[0, 239, 255], [255, 47, 179], [255, 186, 67]],
  spark: [[255, 186, 67], [0, 239, 255], [255, 255, 255]],
  shape: [[91, 141, 255], [0, 239, 255], [236, 252, 255]],
  texture: [[71, 255, 137], [255, 186, 67], [255, 86, 193]],
};

// Rampe d'intensité : du vide au plein, avec des lettres Ithkuil au milieu.
const RAMP = [" ", "·", ":", ";", "ç", "ļ", "ž", "š", "ř", "x", "#", "▓", "█"];

export const OPERATORS = {
  independant: "chaque mot garde son territoire (maximum)",
  complementaire: "le 2e mot sculpte la matière du 1er (multiplication)",
  conflictuel: "le 2e mot déforme les coordonnées du 1er (déplacement)",
};

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(edge0, edge1, value) {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function hash2(ix, iy, seed) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function valueNoise(x, y, seed) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x, y, seed) {
  let total = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let octave = 0; octave < 3; octave++) {
    total += amplitude * valueNoise(x * frequency, y * frequency, seed + octave * 101);
    amplitude *= 0.5;
    frequency *= 2.07;
  }
  return total / 0.875;
}

// ---------------------------------------------------------------------------
// Les primitives : chaque famille est un champ (x, y, temps) -> intensité.
// ---------------------------------------------------------------------------

const FIELDS = {
  filament(p, t, seed, ctx) {
    const strands = 6;
    let intensity = 0;
    for (let k = 0; k < strands; k++) {
      const phase = (seed % 977) * 0.013 + k * 1.73;
      const lane = ctx.center.y + (k - (strands - 1) / 2) * 0.052;
      const wave = 0.13 * Math.sin(p.x * 4.6 + phase + t * 0.35)
        + 0.045 * Math.sin(p.x * 11.3 + phase * 1.7 - t * 0.5);
      const d = p.y - (lane + wave);
      const sigma = 0.011 + 0.004 * (0.5 + 0.5 * Math.sin(p.x * 7 + phase));
      intensity += Math.exp(-(d * d) / (2 * sigma * sigma));
    }
    const envelope = smoothstep(0, 0.07, p.x) * smoothstep(1, 0.93, p.x);
    return clamp01(intensity * envelope);
  },

  cloud(p, t, seed, ctx) {
    const n = fbm(p.x * 3.1 + t * 0.05, p.y * 3.1, seed);
    const dx = p.x - ctx.center.x;
    const dy = p.y - ctx.center.y;
    const r = Math.sqrt(dx * dx + dy * dy);
    return clamp01(smoothstep(0.45, 0.8, n * 0.95 + 0.22 - r * 1.15));
  },

  trace(p, t, seed, ctx) {
    const angle = -0.55 + ((seed % 211) / 211 - 0.5) * 0.4;
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    const dx = p.x - ctx.center.x;
    const dy = p.y - ctx.center.y;
    const s = (dx * dirX + dy * dirY) / 0.85 + 0.5;
    if (s < 0 || s > 1) {
      return 0;
    }
    const perp = -dx * dirY + dy * dirX;
    const bend = 0.06 * Math.sin(s * 6.8 + (seed % 631) * 0.01 + t * 0.25);
    const d = perp - bend;
    const sigma = 0.009 + 0.026 * s;
    const fade = clamp01(1.15 - Math.abs(s - 0.4) * 2.0) * (1 - s * 0.45);
    return clamp01(Math.exp(-(d * d) / (2 * sigma * sigma)) * fade);
  },

  spark(p, t, seed, ctx) {
    const grid = 9;
    const gx = Math.floor(p.x * grid);
    const gy = Math.floor(p.y * grid);
    const dxC = p.x - ctx.center.x;
    const dyC = p.y - ctx.center.y;
    const cluster = Math.exp(-(dxC * dxC + dyC * dyC) * 5.5);
    let intensity = 0;
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const cellX = gx + ox;
        const cellY = gy + oy;
        const h = hash2(cellX, cellY, seed);
        if (h > 0.62) {
          continue;
        }
        const px = (cellX + hash2(cellX, cellY, seed + 1)) / grid;
        const py = (cellY + hash2(cellX, cellY, seed + 2)) / grid;
        const dx = p.x - px;
        const dy = p.y - py;
        const sigma = 0.011 + 0.02 * hash2(cellX, cellY, seed + 3);
        const twinkle = 0.65 + 0.35 * Math.sin(t * 2.6 + h * 39);
        intensity += Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma)) * twinkle;
      }
    }
    return clamp01(intensity * (0.3 + cluster * 1.2));
  },

  shape(p, t, seed, ctx) {
    const dx = p.x - ctx.center.x;
    const dy = p.y - ctx.center.y;
    const r = Math.sqrt(dx * dx + dy * dy);
    const theta = Math.atan2(dy, dx);
    const lobes = 5 + (seed % 3);
    const ring = 0.24 * (1
      + 0.13 * Math.sin(theta * lobes + (seed % 359) * 0.017)
      + 0.04 * Math.sin(theta * (lobes * 2 + 1) - t * 0.3));
    const d = r - ring;
    const edge = Math.exp(-(d * d) / (2 * 0.011 * 0.011));
    const fill = 0.16 * smoothstep(0.02, -0.08, d);
    return clamp01(edge + fill);
  },

  texture(p, t, seed, ctx) {
    const weave = 0.5 + 0.5 * Math.sin(p.x * 38 + seed * 0.01) * Math.sin(p.y * 27 + t * 0.4);
    const grain = fbm(p.x * 6.2, p.y * 6.2, seed);
    const window = smoothstep(0.05, 0.2, p.x) * smoothstep(0.95, 0.8, p.x)
      * smoothstep(0.02, 0.14, p.y / ctx.aspectY) * smoothstep(0.98, 0.86, p.y / ctx.aspectY);
    return clamp01(smoothstep(0.52, 0.86, weave * 0.55 + grain * 0.55) * window);
  },
};

// ---------------------------------------------------------------------------
// Les affixes : transformations de coordonnées (SIZ, DSG, VTS, DCP)
// ou de la traduction couleur (CLD, COL). Jamais d'ajout de matière.
// ---------------------------------------------------------------------------

function transformPoint(p, affixes, seed, t, ctx) {
  let x = p.x;
  let y = p.y;

  // VTS : fracture en bandes horizontales décalées (glitch de transition).
  const vts = (affixes.VTS || 0) / 10;
  if (vts > 0) {
    const band = Math.floor((y / ctx.aspectY) * 26);
    const h = hash2(band, 0, seed + 11);
    if (h < vts * 0.9) {
      x += (hash2(band, 1, seed + 12) - 0.5) * 0.5 * vts
        * (1 + 0.4 * Math.sin(t * 0.7 + band));
    }
  }

  // DSG : turbulence — les coordonnées sont tordues par du bruit.
  const dsg = (affixes.DSG || 0) / 10;
  if (dsg > 0) {
    x += (fbm(x * 2.6, y * 2.6, seed + 21) - 0.5) * 0.62 * dsg;
    y += (fbm(x * 2.6 + 7.3, y * 2.6, seed + 22) - 0.5) * 0.62 * dsg;
  }

  // SIZ : dilate la forme (on contracte les coordonnées autour du centre).
  const siz = (affixes.SIZ || 0) / 10;
  if (siz > 0) {
    const zoom = 1 / (1 + 1.3 * siz);
    x = ctx.center.x + (x - ctx.center.x) * zoom;
    y = ctx.center.y + (y - ctx.center.y) * zoom;
  }

  // DCP : concentre (l'inverse — on dilate les coordonnées).
  const dcp = (affixes.DCP || 0) / 10;
  if (dcp > 0) {
    const zoom = 1 + 1.1 * dcp;
    x = ctx.center.x + (x - ctx.center.x) * zoom;
    y = ctx.center.y + (y - ctx.center.y) * zoom;
  }

  return { x, y };
}

function mixChannel(a, b, t) {
  return a + (b - a) * t;
}

function paletteColor(palette, value) {
  const v = clamp01(value);
  const [p0, p1, p2] = palette;
  const from = v < 0.5 ? p0 : p1;
  const to = v < 0.5 ? p1 : p2;
  const local = v < 0.5 ? v * 2 : (v - 0.5) * 2;
  return [
    mixChannel(from[0], to[0], local),
    mixChannel(from[1], to[1], local),
    mixChannel(from[2], to[2], local),
  ];
}

function applyColorAffixes(color, affixes, value) {
  let [r, g, b] = color;

  // CLD : vivacité — pousse les canaux loin du gris.
  const cld = (affixes.CLD || 0) / 10;
  if (cld > 0) {
    const mean = (r + g + b) / 3;
    const boost = 1 + 1.5 * cld;
    r = mean + (r - mean) * boost;
    g = mean + (g - mean) * boost;
    b = mean + (b - mean) * boost;
  }

  // COL : luminescence — tire vers le blanc là où la matière est dense.
  const col = (affixes.COL || 0) / 10;
  if (col > 0) {
    const lift = col * 0.8 * clamp01(value);
    r = mixChannel(r, 255, lift);
    g = mixChannel(g, 255, lift);
    b = mixChannel(b, 255, lift);
  }

  return [
    Math.round(Math.max(0, Math.min(255, r))),
    Math.round(Math.max(0, Math.min(255, g))),
    Math.round(Math.max(0, Math.min(255, b))),
  ];
}

// ---------------------------------------------------------------------------
// Parsing jouet (table + tolérance ASCII pour la saisie) et compilation.
// ---------------------------------------------------------------------------

function stripDiacritics(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const ASCII_INDEX = new Map(
  Object.keys(VOCAB).map((word) => [stripDiacritics(word), word]),
);

export function compileProgram(text) {
  const layers = [];
  const diagnostics = [];

  for (const rawLine of String(text || "").split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }
    const words = [];
    for (const token of line.split(/\s+/)) {
      const canonical = VOCAB[token] ? token : ASCII_INDEX.get(stripDiacritics(token));
      if (!canonical) {
        diagnostics.push("mot inconnu du prototype : " + token);
        continue;
      }
      const entry = VOCAB[canonical];
      words.push({
        affixes: entry.affixes || {},
        family: entry.family,
        palette: PALETTES[entry.family],
        seed: hashString(canonical + ":" + words.length),
        text: canonical,
      });
    }
    if (words.length) {
      layers.push({ words });
    }
  }

  return { diagnostics, layers };
}

// ---------------------------------------------------------------------------
// Conjugaison + rendu d'une frame.
// ---------------------------------------------------------------------------

function evalWord(word, p, t, ctx) {
  const q = transformPoint(p, word.affixes, word.seed, t, ctx);
  return FIELDS[word.family](q, t, word.seed, ctx);
}

function evalLayer(layer, operator, p, t, ctx) {
  const words = layer.words;
  const values = new Array(words.length).fill(0);
  let intensity = 0;

  if (operator === "complementaire" && words.length > 1) {
    // Le premier mot pose la matière, les suivants la sculptent.
    let v = evalWord(words[0], p, t, ctx);
    values[0] = v;
    for (let i = 1; i < words.length; i++) {
      values[i] = evalWord(words[i], p, t, ctx);
      v = clamp01(v * (0.3 + 2.1 * values[i]));
    }
    intensity = v;
    values[0] = intensity;
  } else if (operator === "conflictuel" && words.length > 1) {
    // Les mots suivants déplacent les coordonnées du premier : ils déforment
    // sa matière sans en ajouter.
    let qx = p.x;
    let qy = p.y;
    for (let i = 1; i < words.length; i++) {
      const d = evalWord(words[i], p, t, ctx);
      values[i] = d * 0.28;
      qx += (d - 0.5) * 0.2;
      qy += (d - 0.5) * 0.14;
    }
    intensity = evalWord(words[0], { x: qx, y: qy }, t, ctx);
    values[0] = intensity;
  } else {
    // indépendant : chacun son territoire.
    for (let i = 0; i < words.length; i++) {
      values[i] = evalWord(words[i], p, t, ctx);
      intensity = Math.max(intensity, values[i]);
    }
  }

  return { intensity, values };
}

export function renderFrame(compiled, { cols = 110, rows = 50, t = 0, operator = "independant" } = {}) {
  const aspectY = (rows * 2) / cols;
  const ctx = { aspectY, center: { x: 0.5, y: aspectY / 2 } };
  const cells = [];

  for (let row = 0; row < rows; row++) {
    const line = [];
    for (let col = 0; col < cols; col++) {
      const p = { x: (col + 0.5) / cols, y: ((row + 0.5) / rows) * aspectY };
      let best = 0;
      let red = 0;
      let green = 0;
      let blue = 0;
      let weightTotal = 0;

      for (const layer of compiled.layers) {
        const { intensity, values } = evalLayer(layer, operator, p, t, ctx);
        best = Math.max(best, intensity);
        for (let i = 0; i < layer.words.length; i++) {
          const word = layer.words[i];
          const weight = values[i] * values[i];
          if (weight <= 0.0001) {
            continue;
          }
          const color = applyColorAffixes(
            paletteColor(word.palette, values[i]),
            word.affixes,
            values[i],
          );
          red += color[0] * weight;
          green += color[1] * weight;
          blue += color[2] * weight;
          weightTotal += weight;
        }
      }

      const dither = (hash2(col, row, 7) - 0.5) * 0.05;
      const level = clamp01(best + dither * best);
      const ch = RAMP[Math.min(RAMP.length - 1, Math.floor(level * RAMP.length))];
      const color = weightTotal > 0
        ? [
            Math.round(red / weightTotal),
            Math.round(green / weightTotal),
            Math.round(blue / weightTotal),
          ]
        : [10, 12, 14];
      line.push({ ch, color });
    }
    cells.push(line);
  }

  return { cells, cols, rows };
}

function quantize(channel) {
  return Math.min(255, Math.round(channel / 24) * 24);
}

export function frameToHtml(frame) {
  const parts = [];
  for (const row of frame.cells) {
    let runColor = null;
    let runText = "";
    for (const cell of row) {
      const key = cell.ch === " "
        ? "transparent"
        : "rgb(" + quantize(cell.color[0]) + "," + quantize(cell.color[1]) + "," + quantize(cell.color[2]) + ")";
      if (key !== runColor) {
        if (runText) {
          parts.push('<span style="color:' + runColor + '">' + runText + "</span>");
        }
        runColor = key;
        runText = "";
      }
      runText += cell.ch === "&" ? "&amp;" : cell.ch === "<" ? "&lt;" : cell.ch;
    }
    if (runText) {
      parts.push('<span style="color:' + runColor + '">' + runText + "</span>");
    }
    parts.push("\n");
  }
  return parts.join("");
}

export function frameToText(frame) {
  return frame.cells.map((row) => row.map((cell) => cell.ch).join("")).join("\n");
}

export function vocabularyEntries() {
  return Object.entries(VOCAB).map(([word, entry]) => ({
    affixes: entry.affixes || {},
    family: entry.family,
    word,
  }));
}
