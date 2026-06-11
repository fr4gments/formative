import { OPERATOR_FOR_AFFILIATION } from "../parser/ikal-affiliations.js";
import { legacyProgramView } from "./program-view.js";

// Moteur visuel unifié en champs (Étape 5.6).
//
// Une primitive = un champ (x, y, temps) -> intensité 0..1.
// Les contrôles d'un mot transforment SON champ (zoom, torsion, fracture) ;
// rien n'est fusionné globalement entre les mots.
// Les mots d'une ligne se conjuguent par un opérateur choisi par l'Affiliation
// Ithkuil du mot (vérifié sur ithkuil.net, chapitre 3) :
//   CSL consolidatif -> territoires indépendants (maximum) ;
//   ASO associatif   -> renforcement mutuel (fusion écran) ;
//   COA coalescent   -> le mot sculpte la matière accumulée (multiplication) ;
//   VAR variatif     -> le mot déforme les coordonnées des autres (déplacement).
// Image fixe = ce calcul avec t figé ; animation = le même calcul avec t qui
// s'écoule, la séquence d'une ligne lyula: avançant d'un mot par pas.

export const STEP_SECONDS = 0.8;

const EFFECT_FAMILIES = new Set(["break-apart", "distortion"]);

const PALETTES = {
  "break-apart": [[255, 47, 179], [0, 239, 255], [255, 255, 220]],
  cloud: [[71, 43, 132], [0, 221, 255], [255, 238, 183]],
  color: [[0, 239, 255], [255, 47, 179], [255, 186, 67]],
  distortion: [[108, 63, 255], [255, 47, 179], [255, 186, 67]],
  filament: [[12, 255, 194], [255, 47, 179], [255, 245, 179]],
  light: [[232, 255, 198], [0, 239, 255], [255, 255, 255]],
  "linear-motion": [[0, 239, 255], [91, 141, 255], [255, 255, 255]],
  "random-motion": [[219, 255, 52], [14, 255, 116], [255, 255, 220]],
  roll: [[108, 63, 255], [255, 47, 179], [255, 186, 67]],
  shape: [[91, 141, 255], [0, 239, 255], [236, 252, 255]],
  "spark-scatter": [[255, 186, 67], [0, 239, 255], [255, 255, 255]],
  texture: [[71, 255, 137], [255, 186, 67], [255, 86, 193]],
  trace: [[0, 239, 255], [255, 47, 179], [255, 186, 67]],
  "visual-design": [[91, 141, 255], [0, 239, 255], [236, 252, 255]],
  rest: [[67, 255, 113], [124, 252, 106], [232, 255, 198]],
};

// Rampe d'intensité : du vide au plein, lettres Ithkuil au milieu.
const RAMP = [" ", "·", ":", ";", "ç", "ļ", "ž", "š", "ř", "x", "#", "▓", "█"];

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
// Champs par famille IKAL.
// ---------------------------------------------------------------------------

const FIELDS = {
  filament(p, t, word, ctx) {
    const controls = word.controls;
    const strands = 4 + Math.round(controls.density * 4 + controls.strands * 4);
    let intensity = 0;

    for (let k = 0; k < strands; k++) {
      const phase = (word.seed % 977) * 0.013 + k * 1.73;
      const lane = ctx.center.y + (k - (strands - 1) / 2) * (0.04 + controls.spread * 0.03);
      const wave = 0.13 * Math.sin(p.x * 4.6 + phase + t * 0.5)
        + 0.045 * Math.sin(p.x * 11.3 + phase * 1.7 - t * 0.7);
      const d = p.y - (lane + wave);
      const sigma = 0.011 + 0.004 * (0.5 + 0.5 * Math.sin(p.x * 7 + phase));
      intensity += Math.exp(-(d * d) / (2 * sigma * sigma));
    }

    const envelope = smoothstep(0, 0.07, p.x) * smoothstep(1, 0.93, p.x);
    return clamp01(intensity * envelope);
  },

  cloud(p, t, word, ctx) {
    const controls = word.controls;
    const n = fbm(p.x * 3.1 + t * 0.07, p.y * 3.1, word.seed);
    const dx = p.x - ctx.center.x;
    const dy = p.y - ctx.center.y;
    const r = Math.sqrt(dx * dx + dy * dy);
    const coverage = 0.22 + controls.density * 0.12 + controls.diffusion * 0.08;
    return clamp01(smoothstep(0.45, 0.8, n * 0.95 + coverage - r * (1.15 - controls.spread * 0.3)));
  },

  trace(p, t, word, ctx) {
    const controls = word.controls;
    const angle = -0.55 + ((word.seed % 211) / 211 - 0.5) * 0.4;
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    const dx = p.x - ctx.center.x;
    const dy = p.y - ctx.center.y;
    const s = (dx * dirX + dy * dirY) / 0.85 + 0.5 - t * 0.04;

    if (s < 0 || s > 1) {
      return 0;
    }

    const perp = -dx * dirY + dy * dirX;
    const bend = 0.06 * Math.sin(s * 6.8 + (word.seed % 631) * 0.01 + t * 0.3);
    const d = perp - bend;
    const sigma = 0.009 + (0.022 + controls.trails * 0.02) * s;
    const fade = clamp01(1.15 - Math.abs(s - 0.4) * 2.0) * (1 - s * (0.45 - controls.trails * 0.25));
    return clamp01(Math.exp(-(d * d) / (2 * sigma * sigma)) * fade);
  },

  "spark-scatter"(p, t, word, ctx) {
    const controls = word.controls;
    const grid = 9;
    const gx = Math.floor(p.x * grid);
    const gy = Math.floor(p.y * grid);
    const dxC = p.x - ctx.center.x;
    const dyC = p.y - ctx.center.y;
    const cluster = Math.exp(-(dxC * dxC + dyC * dyC) * (5.5 - controls.spread * 2.5));
    const keep = 0.62 + controls.density * 0.25;
    let intensity = 0;

    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const cellX = gx + ox;
        const cellY = gy + oy;
        const h = hash2(cellX, cellY, word.seed);

        if (h > keep) {
          continue;
        }

        const px = (cellX + hash2(cellX, cellY, word.seed + 1)) / grid;
        const py = (cellY + hash2(cellX, cellY, word.seed + 2)) / grid;
        const dx = p.x - px;
        const dy = p.y - py;
        const sigma = 0.011 + 0.02 * hash2(cellX, cellY, word.seed + 3);
        const twinkle = 0.65 + 0.35 * Math.sin(t * 2.6 + h * 39);
        intensity += Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma)) * twinkle;
      }
    }

    return clamp01(intensity * (0.3 + cluster * 1.2));
  },

  shape(p, t, word, ctx) {
    const controls = word.controls;
    const dx = p.x - ctx.center.x;
    const dy = p.y - ctx.center.y;
    const r = Math.sqrt(dx * dx + dy * dy);
    const theta = Math.atan2(dy, dx);
    const lobes = 4 + (word.seed % 3) + Math.round(controls.order * 3);
    const ring = (0.2 + controls.spread * 0.08) * (1
      + 0.13 * Math.sin(theta * lobes + (word.seed % 359) * 0.017)
      + 0.04 * Math.sin(theta * (lobes * 2 + 1) - t * 0.4));
    const d = r - ring;
    const edge = Math.exp(-(d * d) / (2 * 0.011 * 0.011));
    const fill = (0.12 + controls.structure * 0.2) * smoothstep(0.02, -0.08, d);
    return clamp01(edge + fill);
  },

  texture(p, t, word, ctx) {
    const controls = word.controls;
    const ordered = controls.order;
    const weave = 0.5 + 0.5 * Math.sin(p.x * 38 + word.seed * 0.01) * Math.sin(p.y * 27 + t * 0.5);
    const grain = fbm(p.x * 6.2, p.y * 6.2, word.seed);
    const window = smoothstep(0.05, 0.2, p.x) * smoothstep(0.95, 0.8, p.x)
      * smoothstep(0.02, 0.14, p.y / ctx.aspectY) * smoothstep(0.98, 0.86, p.y / ctx.aspectY);
    const mixed = weave * (0.4 + ordered * 0.3) + grain * (0.7 - ordered * 0.3);
    const threshold = 0.55 - controls.density * 0.08 - controls.visualTexture * 0.06;
    return clamp01(smoothstep(threshold, threshold + 0.32, mixed) * window);
  },

  light(p, t, word, ctx) {
    const controls = word.controls;
    const dx = p.x - ctx.center.x;
    const dy = p.y - ctx.center.y;
    const r = Math.sqrt(dx * dx + dy * dy);
    const size = 0.16 + controls.scale * 0.12 + controls.glow * 0.06;
    const ring = Math.exp(-Math.pow(r - size - Math.sin(t * 0.6) * 0.012, 2) / (2 * 0.022 * 0.022));
    const aura = clamp01(1 - r / (size * 2.4)) * (0.4 + controls.glow * 0.3);
    const shimmer = (0.5 + 0.5 * Math.sin(r * 46 - t * 1.3 + p.x * 3)) * controls.glow * 0.2;
    return clamp01(aura + ring * (0.5 + controls.glow * 0.3) + shimmer);
  },

  "linear-motion"(p, t, word) {
    const controls = word.controls;
    const speed = 0.5 + controls.motion * 1.4;
    const angle = 0.45 + ((word.seed % 173) / 173 - 0.5) * 0.5;
    const along = p.x * Math.cos(angle) + p.y * Math.sin(angle);
    const band = 0.5 + 0.5 * Math.sin(along * 22 - t * speed * 4);
    const carrier = 0.5 + 0.5 * Math.sin(along * 5.2 - t * speed * 1.6);
    return clamp01(Math.pow(band, 2.6) * (0.35 + carrier * 0.65));
  },

  "random-motion"(p, t, word) {
    const controls = word.controls;
    const grid = 11;
    const jitterT = Math.floor(t * (1.5 + controls.motion * 4));
    const gx = Math.floor(p.x * grid + hash2(jitterT, 1, word.seed) * 2);
    const gy = Math.floor(p.y * grid + hash2(jitterT, 2, word.seed) * 2);
    const cell = hash2(gx, gy, word.seed + jitterT);
    const speck = cell > 0.78 - controls.density * 0.18 ? cell : 0;
    return clamp01(speck * (0.5 + 0.5 * hash2(gy, gx, word.seed + jitterT + 1)));
  },

  roll(p, t, word) {
    const controls = word.controls;
    const move = t * (0.6 + controls.motion * 1.8);
    const a = 0.5 + 0.5 * Math.sin((p.x * 9 + move) * 2.2);
    const b = 0.5 + 0.5 * Math.sin((p.y * 9 - move) * 2.0);
    const c = 0.5 + 0.5 * Math.sin((p.x + p.y) * 12 - move * 1.4);
    const mixed = controls.density < 0.5
      ? a * (1 - controls.density * 2) + ((a + b) / 2) * controls.density * 2
      : ((a + b) / 2) * (1 - (controls.density - 0.5) * 2) + ((a + b + c) / 3) * (controls.density - 0.5) * 2;
    return clamp01(Math.pow(mixed, 1.6));
  },
};

FIELDS["visual-design"] = FIELDS.shape;
FIELDS.color = FIELDS.light;

function nebula(p, t, word) {
  return clamp01(smoothstep(0.45, 0.85, fbm(p.x * 4 + t * 0.1, p.y * 4, word.seed)));
}

function fieldForFamily(family) {
  return FIELDS[family] || nebula;
}

// ---------------------------------------------------------------------------
// Transformations de coordonnées : chaque mot tord SON champ ; les mots-effets
// (affrala distortion, sčala break-apart) tordent toute la ligne.
// ---------------------------------------------------------------------------

function warpAndGlitch(p, amountWarp, amountGlitch, seed, t, ctx) {
  let x = p.x;
  let y = p.y;

  if (amountGlitch > 0) {
    const band = Math.floor((y / ctx.aspectY) * 26);
    const h = hash2(band, Math.floor(t * 2.4), seed + 11);

    if (h < amountGlitch * 0.9) {
      x += (hash2(band, 1, seed + 12) - 0.5) * 0.5 * amountGlitch;
    }
  }

  if (amountWarp > 0) {
    x += (fbm(x * 2.6, y * 2.6, seed + 21) - 0.5) * 0.62 * amountWarp;
    y += (fbm(x * 2.6 + 7.3, y * 2.6, seed + 22) - 0.5) * 0.62 * amountWarp;
  }

  return { x, y };
}

function wordWarp(controls) {
  return clamp01(controls.turbulence * 0.6 + controls.deformation * 0.6 + controls.distortion * 0.35);
}

function wordGlitch(controls) {
  return clamp01(controls.fracture * 0.7 + controls.transitionGlitch * 0.7 + controls.tear * 0.45);
}

function evalWord(word, p, t, ctx) {
  let q = p;
  const controls = word.controls;
  const warp = wordWarp(controls);
  const glitch = wordGlitch(controls);

  if (warp > 0 || glitch > 0) {
    q = warpAndGlitch(q, warp, glitch, word.seed, t, ctx);
  }

  if (controls.scale > 0) {
    const zoom = 1 / (1 + 1.3 * controls.scale);
    q = {
      x: ctx.center.x + (q.x - ctx.center.x) * zoom,
      y: ctx.center.y + (q.y - ctx.center.y) * zoom,
    };
  }

  const speed = 0.35 + controls.motion * 1.4;
  let value = word.field(q, t * speed, word, ctx);

  if (controls.ghost > 0) {
    value *= 1 - controls.ghost * 0.4;
  }

  return clamp01(value);
}

// ---------------------------------------------------------------------------
// Compilation des programmes et conjugaison.
// ---------------------------------------------------------------------------

export function operatorForProgram(program) {
  const affiliation = program?.ithkuil?.ca?.affiliation || "CSL";
  return OPERATOR_FOR_AFFILIATION[affiliation] || "independant";
}

function compileWord(program, index) {
  const view = legacyProgramView(program);
  const family = view?.params?.family || "rest";

  return {
    controls: view?.controls || {},
    family,
    field: fieldForFamily(family),
    isEffect: EFFECT_FAMILIES.has(family),
    operator: operatorForProgram(program),
    palette: PALETTES[family] || PALETTES.rest,
    program,
    // La graine vient du mot de base, pas du texte tapé : une variante
    // d'affixe ou d'Affiliation garde la même matière que son mot de base,
    // seule la transformation / conjugaison change.
    seed: hashString((program?.seedRoot?.form || program?.text || "?") + "/" + index),
  };
}

function compileLayer(layer) {
  const words = (layer.sequence || []).filter(Boolean).map(compileWord);
  const matter = words.filter((word) => !word.isEffect);
  const effects = words.filter((word) => word.isEffect);
  let warp = 0;
  let glitch = 0;

  for (const word of effects) {
    const controls = word.controls;
    warp += controls.distortion * 0.5 + controls.deformation * 0.4 + controls.drive * 0.25;
    glitch += controls.fracture * 0.6 + controls.tear * 0.6 + controls.bitcrush * 0.3;
  }

  return {
    displacers: matter.filter((word) => word.operator === "conflictuel"),
    effects,
    glitch: clamp01(glitch),
    matter,
    seed: hashString(layer.text || (layer.sequence || []).map((p) => p?.text).join(" ")),
    warp: clamp01(warp),
    words,
  };
}

// En animation, seuls les mots de matière prennent un pas dans la séquence :
// les mots glitch (affrala, sčala) transforment la ligne en continu, comme en
// image fixe. Une ligne faite uniquement de mots glitch reste visible.
function visibleAnimationWords(words) {
  const matter = words.filter((word) => !word.isEffect);
  return matter.length ? matter : words;
}

export function activeWordIndex(layer, t) {
  const words = (layer.sequence || []).filter(Boolean).map(compileWord);
  const length = visibleAnimationWords(words).length;

  if (length === 0) {
    return -1;
  }

  return Math.floor(Math.max(0, t) / STEP_SECONDS) % length;
}

// Conjugaison d'une ligne lyala: : tous les mots simultanés.
function evalStillLayer(compiled, p, t, ctx) {
  let q = p;

  if (compiled.warp > 0 || compiled.glitch > 0) {
    q = warpAndGlitch(q, compiled.warp, compiled.glitch, compiled.seed, t, ctx);
  }

  const values = [];
  let intensity = 0;

  // Les mots VAR (variatif : fonctions divergentes) déplacent les coordonnées
  // des autres : ils déforment la matière de la ligne sans en ajouter.
  let sx = q.x;
  let sy = q.y;

  for (const word of compiled.displacers) {
    const d = evalWord(word, q, t, ctx);
    values.push({ value: d * 0.3, word });
    sx += (d - 0.5) * 0.2;
    sy += (d - 0.5) * 0.14;
  }

  const shifted = { x: sx, y: sy };
  let first = true;

  for (const word of compiled.matter) {
    if (word.operator === "conflictuel") {
      continue;
    }

    const value = evalWord(word, shifted, t, ctx);
    values.push({ value, word });

    if (first) {
      intensity = value;
      first = false;
    } else if (word.operator === "complementaire") {
      // COA coalescent : rôles complémentaires — le mot sculpte la matière.
      intensity = clamp01(intensity * (0.3 + 2.1 * value));
    } else if (word.operator === "associatif") {
      // ASO associatif : but partagé — renforcement mutuel borné (fusion écran).
      intensity = clamp01(intensity + value - intensity * value);
    } else {
      // CSL consolidatif : territoires indépendants.
      intensity = Math.max(intensity, value);
    }
  }

  if (first && compiled.displacers.length) {
    intensity = values.reduce((max, item) => Math.max(max, item.value), 0);
  }

  return { intensity, values };
}

// Ligne lyula: : la séquence avance d'un mot de matière par pas de temps ;
// les mots glitch de la ligne déforment chaque pas sans en occuper un.
function evalAnimationLayer(compiled, p, t, ctx) {
  const pool = visibleAnimationWords(compiled.words);

  if (pool.length === 0) {
    return { intensity: 0, values: [] };
  }

  const word = pool[Math.floor(Math.max(0, t) / STEP_SECONDS) % pool.length];
  let q = p;

  if (compiled.warp > 0 || compiled.glitch > 0) {
    q = warpAndGlitch(q, compiled.warp, compiled.glitch, compiled.seed, t, ctx);
  }

  const value = word.isEffect
    ? clamp01(nebula(q, t * 3, word) * 0.8)
    : evalWord(word, q, t, ctx);

  return { intensity: value, values: [{ value, word }] };
}

// ---------------------------------------------------------------------------
// Couleur.
// ---------------------------------------------------------------------------

function mixChannel(a, b, t) {
  return a + (b - a) * t;
}

function wordColor(word, value) {
  const controls = word.controls;
  const palette = word.palette;
  const shifted = clamp01(value + controls.colorShift * 0.25 * Math.sin(value * 9 + word.seed));
  const from = shifted < 0.5 ? palette[0] : palette[1];
  const to = shifted < 0.5 ? palette[1] : palette[2];
  const local = shifted < 0.5 ? shifted * 2 : (shifted - 0.5) * 2;
  let r = mixChannel(from[0], to[0], local);
  let g = mixChannel(from[1], to[1], local);
  let b = mixChannel(from[2], to[2], local);

  const chroma = clamp01(controls.chroma + controls.saturation * 0.3);

  if (chroma > 0) {
    const mean = (r + g + b) / 3;
    const boost = 1 + 1.5 * chroma;
    r = mean + (r - mean) * boost;
    g = mean + (g - mean) * boost;
    b = mean + (b - mean) * boost;
  }

  const lift = clamp01(controls.glow * 0.6 + controls.brightness * 0.4) * clamp01(value);

  if (lift > 0) {
    r = mixChannel(r, 255, lift);
    g = mixChannel(g, 255, lift);
    b = mixChannel(b, 255, lift);
  }

  const dark = 1 - clamp01(controls.darkness) * 0.5 - clamp01(controls.ghost) * 0.3;

  return [
    Math.round(Math.max(0, Math.min(255, r * dark))),
    Math.round(Math.max(0, Math.min(255, g * dark))),
    Math.round(Math.max(0, Math.min(255, b * dark))),
  ];
}

// ---------------------------------------------------------------------------
// Rendu d'une frame.
// ---------------------------------------------------------------------------

export function renderFieldFrame({ layers = [], cols = 110, rows = 50, t = 0, mode = "image" } = {}) {
  const cleanLayers = layers.filter((layer) => (layer?.sequence || []).length);
  const compiled = cleanLayers.map(compileLayer);
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

      for (let i = 0; i < compiled.length; i++) {
        const { intensity, values } = mode === "animation"
          ? evalAnimationLayer(compiled[i], p, t, ctx)
          : evalStillLayer(compiled[i], p, t, ctx);
        best = Math.max(best, intensity);

        for (const { value, word } of values) {
          const weight = value * value;

          if (weight <= 0.0001) {
            continue;
          }

          const color = wordColor(word, value);
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

function escapeChar(ch) {
  return ch === "&" ? "&amp;" : ch === "<" ? "&lt;" : ch;
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

      runText += escapeChar(cell.ch);
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

// ---------------------------------------------------------------------------
// Consommateur DOM : image fixe = une frame figée, animation = boucle.
// ---------------------------------------------------------------------------

export function createFieldVisual({ screen, win = globalThis.window } = {}) {
  let rafHandle = null;
  let startedAt = 0;

  function enterFieldMode() {
    screen.classList?.add("field-mode");
  }

  function leaveFieldMode() {
    screen.classList?.remove("field-mode");
  }

  function renderInto({ cols, rows, layers, t, mode }) {
    const frame = renderFieldFrame({ cols, layers, mode, rows, t });
    screen.innerHTML = frameToHtml(frame);
    return frame;
  }

  function stop() {
    if (rafHandle !== null) {
      win?.cancelAnimationFrame?.(rafHandle);
      rafHandle = null;
    }
  }

  function drawStill({ cols = 110, rows = 50, layers = [] } = {}) {
    stop();
    enterFieldMode();
    return renderInto({ cols, layers, mode: "image", rows, t: 0 });
  }

  function animate({ cols = 110, rows = 50, layers = [] } = {}) {
    stop();
    enterFieldMode();
    startedAt = 0;
    let lastDrawn = -1;

    function loop(now) {
      rafHandle = win.requestAnimationFrame(loop);

      if (!startedAt) {
        startedAt = now;
      }

      if (now - lastDrawn < 33) {
        return;
      }

      lastDrawn = now;
      renderInto({ cols, layers, mode: "animation", rows, t: (now - startedAt) / 1000 });
    }

    rafHandle = win.requestAnimationFrame(loop);
  }

  function clear() {
    stop();
    leaveFieldMode();
    screen.innerHTML = "";
  }

  return {
    animate,
    clear,
    drawStill,
    stop,
  };
}
