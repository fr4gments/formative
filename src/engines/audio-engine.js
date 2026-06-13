// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  MOTEUR AUDIO IKAL — 100 % briques natives Web Audio.                      ║
// ║                                                                            ║
// ║  Rôle : prendre les COUCHES de mots (déjà parsées en paramètres) et les    ║
// ║  jouer. Pour chaque mot, il fabrique une « voix » (oscillateurs/bruit +    ║
// ║  enveloppe + filtre), lui applique sa chaîne d'effets, et la planifie sur  ║
// ║  l'horloge audio à l'avance (séquenceur « look-ahead », la méthode propre).║
// ║                                                                            ║
// ║  Il ne connaît AUCUN timbre/effet en dur : tout vient de la banque         ║
// ║  audio-kit.js. Les notes RÉSONNENT et se superposent (polyphonie) — c'est  ║
// ║  ce qui donne le son riche du prototype. Un accord (Function STA) joue ses ║
// ║  notes ensemble ; un arpège (DYN) les égrène. Le grain « sale » (bitcrush, ║
// ║  drive, déchirure) est un effet dosé, pas un défaut du moteur.             ║
// ╚══════════════════════════════════════════════════════════════════════════╝

import { motifFrequencies } from "./motif.js";
import { legacyProgramView } from "./program-view.js";
import {
  DEFAULT_TIMBRE,
  EFFECTS,
  VOICE_BUILDERS,
  createWaveFactory,
  makeGateBuffer,
  makeImpulseResponse,
  makeNoiseBuffer,
  reverbAmountFor,
} from "./audio-kit.js";

const STEP_SECONDS = 0.25; // durée d'un pas (une note d'arpège ou un mot-texture)
const PEAK = 0.3; // amplitude crête d'une voix avant mixage
const LOOKAHEAD = 0.12; // on planifie les événements jusqu'à 120 ms dans le futur
const TICK_MS = 25; // le séquenceur se réveille toutes les 25 ms
const EPS = 0.0001; // en dessous, un effet est considéré absent

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

// ─── Du mot vers des « créneaux » jouables ──────────────────────────────────
// Une famille de mot → quelle voix. tone via le motif, sinon via la consonne
// de la famille (s=noise, k=click, r=roll), exactement comme l'ancien routage.
export function voiceKindForProgram(program) {
  if (program?.params?.family === "tone") {
    return "tone";
  }

  const view = legacyProgramView(program);
  return view.root === "s" ? "noise" : view.root === "k" ? "click" : "roll";
}

function countForView(view) {
  return view.number === "MPX" ? 3 : view.number === "DPX" ? 2 : 1;
}

// Un mot → une liste de CRÉNEAUX (slots). Un créneau = les voix qui démarrent
// au même instant. Un mot-texture = 1 créneau. Un mot à hauteur :
//   • accord  (deploy "chord", Function STA) → 1 créneau, toutes les notes ensemble
//   • arpège  (deploy "sequence", Function DYN) → 1 créneau par note (égrené)
export function compileProgram(program) {
  const view = legacyProgramView(program);
  const controls = view.controls;
  const motif = program?.params?.motif;

  if (motif) {
    const timbre = motif.timbre || DEFAULT_TIMBRE;
    const reverbAmount = reverbAmountFor(controls, timbre);
    const notes = motifFrequencies(motif, motif.stem).map((freq) => ({
      spec: { kind: "tone", freq, timbre },
      controls,
      reverbAmount,
      program,
    }));

    if (notes.length === 0) {
      return [];
    }

    return motif.deploy === "chord" ? [notes] : notes.map((note) => [note]);
  }

  return [[{
    spec: { kind: voiceKindForProgram(program), count: countForView(view) },
    controls,
    reverbAmount: clamp01(controls.reverb),
    program,
  }]];
}

function normalizeLayer(layer) {
  const sequence = Array.isArray(layer) ? layer : layer.sequence || [];
  const text = Array.isArray(layer) ? "" : layer.text || "";
  const slots = sequence.flatMap(compileProgram);

  return { sequence, slots, text };
}

function normalizeLayers(layers) {
  return layers
    .map(normalizeLayer)
    .filter((layer) => layer.slots.length > 0);
}

export function createAudioEngine({
  win = typeof window !== "undefined" ? window : globalThis,
  stepSeconds = STEP_SECONDS,
  peak = PEAK,
} = {}) {
  let ctx = null;
  let voicesBus = null; // tout le son passe ici → permet une coupure sans clic
  let convolver = null;
  let shared = null;
  let startPromise = null;

  let layers = [];
  let playStart = 0; // instant audio du créneau d'index 0
  const cursors = []; // par couche : { nextIndex, nextTime }
  const activeVoices = []; // { sources, stopAt } pour le nettoyage

  const setInterval = win.setInterval ? win.setInterval.bind(win) : globalThis.setInterval;

  function now() {
    return ctx ? ctx.currentTime : 0;
  }

  function resetClock() {
    playStart = now() + 0.06;
    cursors.length = 0;
    for (let i = 0; i < layers.length; i++) {
      cursors.push({ nextIndex: 0, nextTime: playStart });
    }
  }

  function scheduleVoice(instance, when) {
    const builder = VOICE_BUILDERS[instance.spec.kind] || VOICE_BUILDERS.tone;
    const voice = builder(ctx, instance.spec, { startTime: when, stepDur: stepSeconds, peak }, shared);

    let node = voice.output;
    const sources = [...voice.sources];

    for (const effect of EFFECTS) {
      const amount = effect.amount(instance.controls);

      if (amount <= EPS) {
        continue;
      }

      const built = effect.build(ctx, amount, { startTime: when, stopAt: voice.stopAt }, shared);
      node.connect(built.input);
      node = built.output;

      if (built.sources) {
        sources.push(...built.sources);
      }
    }

    node.connect(voicesBus);

    if (instance.reverbAmount > EPS) {
      const send = ctx.createGain();
      send.gain.value = instance.reverbAmount;
      node.connect(send);
      send.connect(convolver);
    }

    activeVoices.push({ sources, stopAt: voice.stopAt });
  }

  function fireSlot(slot, when) {
    for (const instance of slot) {
      scheduleVoice(instance, when);
    }
  }

  function sweepFinished() {
    const cutoff = now() - 0.1;
    for (let i = activeVoices.length - 1; i >= 0; i--) {
      if (activeVoices[i].stopAt < cutoff) {
        activeVoices.splice(i, 1);
      }
    }
  }

  function tick() {
    if (!ctx || layers.length === 0) {
      return;
    }

    const horizon = now() + LOOKAHEAD;

    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const cursor = cursors[i];

      while (cursor.nextTime < horizon) {
        fireSlot(layer.slots[cursor.nextIndex % layer.slots.length], cursor.nextTime);
        cursor.nextIndex++;
        cursor.nextTime += stepSeconds;
      }
    }

    sweepFinished();
  }

  function stopActiveVoices() {
    if (!ctx) {
      return;
    }

    const at = now();

    // Fondu propre (sans clic) : on baisse le bus à zéro, on coupe les sources
    // PENDANT le silence, puis on rouvre le bus. Les nouvelles voix repartent à
    // at+0.06 (voir resetClock) → dans la fenêtre de réouverture, donc en fondu.
    voicesBus.gain.cancelScheduledValues(at);
    voicesBus.gain.setValueAtTime(voicesBus.gain.value, at);
    voicesBus.gain.linearRampToValueAtTime(0.0001, at + 0.03); // sortie
    voicesBus.gain.setValueAtTime(0.0001, at + 0.05); // silence tenu pendant la coupe
    voicesBus.gain.linearRampToValueAtTime(1, at + 0.10); // réouverture

    for (const voice of activeVoices) {
      for (const source of voice.sources) {
        try {
          source.stop(at + 0.04); // coupe dans la fenêtre de silence
        } catch {
          /* source déjà arrêtée */
        }
      }
    }

    activeVoices.length = 0;
  }

  function ensureGraph() {
    if (voicesBus) {
      return;
    }

    voicesBus = ctx.createGain();
    voicesBus.gain.value = 1;

    const master = ctx.createGain();
    master.gain.value = 0.9;

    // Limiteur de sécurité : empêche la saturation quand des notes se superposent.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -3;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.12;

    voicesBus.connect(master);
    master.connect(limiter);
    limiter.connect(ctx.destination);

    convolver = ctx.createConvolver();
    convolver.buffer = makeImpulseResponse(ctx, 1.8, 3.0);
    convolver.connect(voicesBus);

    shared = {
      noiseBuffer: makeNoiseBuffer(ctx, 2.0),
      gateBuffer: makeGateBuffer(ctx, 1.0),
      waveFor: createWaveFactory(ctx),
    };
  }

  function setLayers(nextLayers) {
    layers = normalizeLayers(nextLayers);

    if (ctx) {
      stopActiveVoices();
      resetClock();
    }
  }

  function setSequence(nextSequence) {
    setLayers([{ sequence: nextSequence }]);
  }

  function clearSequence() {
    stopActiveVoices();
    layers = [];
    cursors.length = 0;
  }

  function currentSlotIndex(layerIndex) {
    const layer = layers[layerIndex];

    if (!layer || layer.slots.length === 0) {
      return 0;
    }

    const elapsed = now() - playStart;

    if (elapsed < 0) {
      return 0;
    }

    return Math.floor(elapsed / stepSeconds) % layer.slots.length;
  }

  function getVisualPrograms() {
    return layers
      .map((layer, index) => layer.slots[currentSlotIndex(index)]?.[0]?.program)
      .filter(Boolean);
  }

  async function start() {
    const AudioContextImpl = win.AudioContext || win.webkitAudioContext;

    if (!AudioContextImpl) {
      throw new Error("Web Audio API indisponible dans ce navigateur");
    }

    if (!ctx) {
      ctx = new AudioContextImpl();
    }

    if (!startPromise) {
      ensureGraph();
      resetClock();
      setInterval(tick, TICK_MS);
      startPromise = Promise.resolve();
    }

    await startPromise;

    if (ctx.state === "suspended") {
      await ctx.resume();
    }
  }

  return {
    clearSequence,
    getCurrentStep: () => currentSlotIndex(0),
    getLayers: () => layers.map((layer) => ({ sequence: layer.sequence, text: layer.text })),
    getSequence: () => layers[0]?.sequence || [],
    getVisualProgram: () => getVisualPrograms()[0] || null,
    getVisualPrograms,
    isRunning: () => Boolean(ctx),
    setLayers,
    setSequence,
    start,
    // exposé pour les tests : déclenche un cycle du séquenceur manuellement.
    _tick: tick,
  };
}
