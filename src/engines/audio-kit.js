// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  BANQUE DE SONS IKAL — le point d'EXTENSION du moteur audio.               ║
// ║                                                                            ║
// ║  Tout ce qui se « rajoute » au fil du temps vit ICI, en données :          ║
// ║    • un nouveau TIMBRE   = une entrée dans TIMBRES                          ║
// ║    • une nouvelle VOIX   = une entrée dans VOICE_BUILDERS                   ║
// ║    • un nouvel EFFET     = une entrée dans EFFECTS                          ║
// ║  Le moteur (audio-engine.js) ne connaît AUCUN timbre/effet en dur : il     ║
// ║  lit ces tables. Ajouter un son ne demande pas de toucher au moteur.       ║
// ║                                                                            ║
// ║  100 % briques natives Web Audio (oscillateurs, filtres, WaveShaper,       ║
// ║  convolution) — aucun calcul échantillon par échantillon. Le grain « sale »║
// ║  (bitcrush, drive, déchirure) est un EFFET dosé, pas un plafond.           ║
// ╚══════════════════════════════════════════════════════════════════════════╝

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

// ─── TIMBRES (sources à hauteur) ────────────────────────────────────────────
// Un timbre = la « couleur » (harmoniques) + une forme dans le temps (attaque/
// déclin) + un filtre + une dose de réverb. Valeurs reprises des prototypes
// validés à l'oreille (prototypes/tone-synth.html, motif-synth.html).
//   • harmonics : amplitudes des partiels ENTIERS 1,2,3… (→ PeriodicWave, son
//     « musical », band-limité donc propre).
//   • partials  : [rapport, amplitude] pour des partiels NON entiers (→ sinus
//     individuels). Seul moyen d'un vrai caractère cloche/métal.
//   • attack    : montée du son, en secondes (court = sec, long = doux).
//   • decay     : fraction de la durée de note où le son retombe au silence
//     (0.86 = retombe tôt, 0.99 = tient presque tout du long).
//   • filter    : filtre natif appliqué à la voix (sombre = lowpass, etc.).
//   • reverb    : envoi de réverb propre au timbre (0..1).
// Le timbre d'un mot vient du SENS de sa racine (porté par le motif.timbre) :
// resonant=mžv, bell=žb, dark=řż, crystal=žd, voice=lly.
export const TIMBRES = {
  resonant: {
    harmonics: [1, 0.5, 0.33, 0.2, 0.12, 0.07, 0.04],
    attack: 0.006, decay: 0.98, reverb: 0.26,
  },
  bell: {
    partials: [[1, 1], [2.76, 0.6], [5.40, 0.35], [8.93, 0.22]],
    attack: 0.001, decay: 0.96, reverb: 0.38,
  },
  dark: {
    harmonics: [1, 0.12, 0.04],
    attack: 0.012, decay: 0.99, reverb: 0.16,
    filter: { type: "lowpass", freq: 850, q: 0.9 },
  },
  crystal: {
    harmonics: [1, 0.2, 0.55, 0.3, 0.5, 0.28, 0.4, 0.22, 0.3],
    attack: 0.002, decay: 0.86, reverb: 0.34,
    filter: { type: "highpass", freq: 350 },
  },
  voice: {
    // Fondamentale en retrait + 2e partiel dominant = caractère « voyelle ».
    harmonics: [0.35, 1, 0.92, 0.55, 0.3, 0.15],
    attack: 0.014, decay: 0.94, reverb: 0.24,
  },
};

export const DEFAULT_TIMBRE = "resonant";

// ─── Réverb propre au timbre (envoi) ────────────────────────────────────────
export function reverbAmountFor(controls, timbreName) {
  const base = TIMBRES[timbreName]?.reverb || 0;
  return clamp01((controls.reverb || 0) + base);
}

// ─── Fabriques de tampons (le hasard vit dans des buffers, pas dans un worklet)
export function makeImpulseResponse(ctx, seconds, decay) {
  const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }

  return buf;
}

export function makeNoiseBuffer(ctx, seconds) {
  const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);

  for (let i = 0; i < len; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  return buf;
}

// Tampon de « porte » aléatoire (0/1) pour l'effet de déchirure (jitter) :
// un gate qui hache le son par blocs, sans avoir besoin d'un calcul par
// échantillon en continu — le hasard est figé une fois dans le buffer.
export function makeGateBuffer(ctx, seconds, rateHz = 80) {
  const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  const block = Math.max(1, Math.floor(ctx.sampleRate / rateHz));
  let value = 1;

  for (let i = 0; i < len; i++) {
    if (i % block === 0) {
      value = Math.random() < 0.62 ? 1 : 0; // plutôt ouvert, se ferme par à-coups
    }
    data[i] = value;
  }

  return buf;
}

// Fabrique de PeriodicWave (timbres à harmoniques entières), mise en cache par
// contexte audio. Renvoie une fonction waveFor(nomDeTimbre).
export function createWaveFactory(ctx) {
  const cache = new Map();

  return function waveFor(timbreName) {
    if (cache.has(timbreName)) {
      return cache.get(timbreName);
    }

    const timbre = TIMBRES[timbreName] || TIMBRES[DEFAULT_TIMBRE];
    const real = new Float32Array([0, ...(timbre.harmonics || [1])]);
    const imag = new Float32Array(real.length);
    const wave = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
    cache.set(timbreName, wave);
    return wave;
  };
}

// ─── Enveloppe d'amplitude (attaque → retombée), exactement comme les prototypes
function applyEnvelope(gainParam, startTime, dur, attack, decay, peak) {
  gainParam.setValueAtTime(0.0001, startTime);
  gainParam.exponentialRampToValueAtTime(peak, startTime + attack);
  gainParam.exponentialRampToValueAtTime(0.0008, startTime + dur * decay);
}

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  VOIX — comment chaque FAMILLE de mot fabrique son son.                    ║
// ║  Signature : build(ctx, spec, sched, shared) → { output, sources, stopAt } ║
// ║    spec   : { kind, freq?, timbre?, count? }                               ║
// ║    sched  : { startTime, stepDur, peak }                                   ║
// ║    shared : { noiseBuffer, gateBuffer, waveFor }                           ║
// ║    output : le nœud de sortie de la voix (à brancher dans les effets)      ║
// ║    sources: les nœuds-sources à démarrer/arrêter (oscillateurs, buffers)   ║
// ║    stopAt : instant où la voix se tait (pour le nettoyage + les effets)    ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// tone — source à hauteur (le motif). Oscillateur(s) → enveloppe → filtre timbre.
function buildToneVoice(ctx, spec, sched, shared) {
  const timbre = TIMBRES[spec.timbre] || TIMBRES[DEFAULT_TIMBRE];
  const dur = Math.min(sched.stepDur * 1.9, 1.0); // la note résonne au-delà du pas
  const peak = sched.peak;

  const gain = ctx.createGain();
  applyEnvelope(gain.gain, sched.startTime, dur, timbre.attack, timbre.decay, peak);

  let output = gain;

  if (timbre.filter) {
    const filter = ctx.createBiquadFilter();
    filter.type = timbre.filter.type;
    filter.frequency.value = timbre.filter.freq;
    if (timbre.filter.q) {
      filter.Q.value = timbre.filter.q;
    }
    gain.connect(filter);
    output = filter;
  }

  const sources = [];

  if (timbre.partials) {
    // Partiels inharmoniques → un sinus par partiel.
    for (const [ratio, amp] of timbre.partials) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = spec.freq * ratio;
      const partialGain = ctx.createGain();
      partialGain.gain.value = amp;
      osc.connect(partialGain);
      partialGain.connect(gain);
      sources.push(osc);
    }
  } else {
    // Harmoniques entières → une PeriodicHomogène band-limitée.
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(shared.waveFor(spec.timbre || DEFAULT_TIMBRE));
    osc.frequency.value = spec.freq;
    osc.connect(gain);
    sources.push(osc);
  }

  const stopAt = sched.startTime + dur + 0.05;
  for (const osc of sources) {
    osc.start(sched.startTime);
    osc.stop(stopAt);
  }

  return { output, sources, stopAt };
}

// noise — souffle/bruit filtré (familles s : noise, breath, texture…).
function buildNoiseVoice(ctx, spec, sched, shared) {
  const dur = sched.stepDur;
  const peak = sched.peak * 0.8;
  const bands = Math.max(1, spec.count || 1);

  const gain = ctx.createGain();
  applyEnvelope(gain.gain, sched.startTime, dur, 0.012, 0.96, peak);

  const sources = [];
  for (let i = 0; i < bands; i++) {
    const src = ctx.createBufferSource();
    src.buffer = shared.noiseBuffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 240 + i * 420;
    filter.Q.value = 0.8 + i * 0.6;
    const bandGain = ctx.createGain();
    bandGain.gain.value = 1 / bands;
    src.connect(filter);
    filter.connect(bandGain);
    bandGain.connect(gain);
    sources.push(src);
  }

  const stopAt = sched.startTime + dur + 0.05;
  for (const src of sources) {
    src.start(sched.startTime);
    src.stop(stopAt);
  }

  return { output: gain, sources, stopAt };
}

// click — salve(s) percussive(s) brève(s) (familles k : click, impact…).
function buildClickVoice(ctx, spec, sched, shared) {
  const n = Math.max(1, spec.count || 1);
  const peak = sched.peak * 1.1;
  const offsets = [0, 0.06, 0.11];
  const cutoffs = [1200, 1700, 2200];

  const gain = ctx.createGain();
  gain.gain.value = 1;

  const sources = [];
  for (let i = 0; i < n; i++) {
    const t0 = sched.startTime + offsets[i];
    const src = ctx.createBufferSource();
    src.buffer = shared.noiseBuffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = cutoffs[i];
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(peak * (1 - i * 0.18), t0 + 0.001);
    env.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.03);
    src.connect(filter);
    filter.connect(env);
    env.connect(gain);
    src.start(t0);
    src.stop(t0 + 0.06);
    sources.push(src);
  }

  return { output: gain, sources, stopAt: sched.startTime + 0.2 };
}

// roll — basse continue avec trémolo (familles r : roll, music…).
function buildRollVoice(ctx, spec, sched, _shared) {
  const dur = sched.stepDur;
  const peak = sched.peak * 0.85;
  const n = Math.max(1, spec.count || 1);

  const gain = ctx.createGain();
  applyEnvelope(gain.gain, sched.startTime, dur, 0.02, 0.97, peak);

  // Trémolo : un oscillateur lent module un gain autour de 0.5.
  const trem = ctx.createGain();
  trem.gain.value = 0.5;
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 6 + n * 3;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 0.45;
  lfo.connect(lfoDepth);
  lfoDepth.connect(trem.gain);

  const sources = [lfo];
  for (let i = 0; i < n; i++) {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 96 * (1 + i * 0.15);
    const voiceGain = ctx.createGain();
    voiceGain.gain.value = 1 / n;
    osc.connect(voiceGain);
    voiceGain.connect(trem);
    sources.push(osc);
  }
  trem.connect(gain);

  const stopAt = sched.startTime + dur + 0.05;
  for (const src of sources) {
    src.start(sched.startTime);
    src.stop(stopAt);
  }

  return { output: gain, sources, stopAt };
}

export const VOICE_BUILDERS = {
  tone: buildToneVoice,
  noise: buildNoiseVoice,
  click: buildClickVoice,
  roll: buildRollVoice,
};

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  EFFETS (le grain « sale », dosé) — chaîne en série après la voix.         ║
// ║  Chaque effet : { key, amount(controls) → 0..1, build(...) }              ║
// ║    amount : intensité déduite des contrôles du mot (0 = effet absent)      ║
// ║    build(ctx, amount, sched, shared) → { input, output, sources }          ║
// ║  L'ordre du tableau = l'ordre de la chaîne. Ajouter un effet = une entrée. ║
// ╚══════════════════════════════════════════════════════════════════════════╝

function makeCurve(fn, length = 2048) {
  const curve = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const x = (i / (length - 1)) * 2 - 1;
    curve[i] = Math.max(-1, Math.min(1, fn(x)));
  }
  return curve;
}

// Mélange sec/traité figé dans la courbe : amount fixe pour la note.
function shaper(ctx, dryWetFn) {
  const node = ctx.createWaveShaper();
  node.curve = makeCurve(dryWetFn);
  node.oversample = "2x";
  return { input: node, output: node, sources: [] };
}

export const EFFECTS = [
  {
    // ghost — son creusé / fantomatique.
    key: "ghost",
    amount: (c) => clamp01(c.ghost || 0),
    build: (ctx, amount) =>
      shaper(ctx, (x) => ((1 - amount) * x + amount * 0.5 * Math.sin(x * Math.PI)) * (1 - amount * 0.35)),
  },
  {
    // jitter — déchirure : un gate aléatoire hache le son (hasard pris au buffer).
    key: "jitter",
    amount: (c) => clamp01((c.tear || 0) * 0.65 + (c.roughness || 0) * 0.18 + (c.motion || 0) * 0.04),
    build: (ctx, amount, sched, shared) => {
      const gate = ctx.createGain();
      gate.gain.value = 1 - amount;
      const mod = ctx.createBufferSource();
      mod.buffer = shared.gateBuffer;
      mod.loop = true;
      const depth = ctx.createGain();
      depth.gain.value = amount;
      mod.connect(depth);
      depth.connect(gate.gain);
      mod.start(sched.startTime);
      mod.stop(sched.stopAt);
      return { input: gate, output: gate, sources: [mod] };
    },
  },
  {
    // drive — saturation douce (distorsion / fold / chaleur).
    key: "drive",
    amount: (c) =>
      clamp01((c.drive || 0) + (c.distortion || 0) * 0.35 + (c.saturation || 0) * 0.18 + (c.ghost || 0) * 0.10),
    build: (ctx, amount) => {
      const k = amount * 4.2;
      return shaper(ctx, (x) => (1 - amount) * x + amount * Math.tanh(x * (1 + k)));
    },
  },
  {
    // bitcrush — quantification d'amplitude (le grain « 8 bits », dosé).
    key: "bitcrush",
    amount: (c) => clamp01((c.bitcrush || 0) + (c.ghost || 0) * 0.12),
    build: (ctx, amount) => {
      const bits = Math.max(3, Math.round(16 - amount * 12));
      const steps = 2 ** bits;
      return shaper(ctx, (x) => (1 - amount) * x + amount * (Math.round(x * steps) / steps));
    },
  },
];
