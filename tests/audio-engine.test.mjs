import assert from "node:assert/strict";

import {
  compileProgram,
  createAudioEngine,
  voiceKindForProgram,
} from "../src/engines/audio-engine.js";
import { EFFECTS, TIMBRES, reverbAmountFor } from "../src/engines/audio-kit.js";
import { parseIkalProgram } from "../src/parser/ikal-parser.js";

// ─── 1) Choix de la voix selon la famille du mot ────────────────────────────
const tone = parseIkalProgram("amžvala").sequence[0];
const click = parseIkalProgram("ļtala").sequence[0];
const noise = parseIkalProgram("ačxwuža").sequence[0];
const roll = parseIkalProgram("alxrasa").sequence[0];

assert.equal(voiceKindForProgram(tone), "tone");
assert.equal(voiceKindForProgram(click), "click");
assert.equal(voiceKindForProgram(noise), "noise");
assert.equal(voiceKindForProgram(roll), "roll");
// Programme POC hérité (sans params) → routé par la consonne.
assert.equal(voiceKindForProgram({ root: "k", suffixes: [] }), "click");
assert.equal(voiceKindForProgram({ root: "s", suffixes: [] }), "noise");
assert.equal(voiceKindForProgram({ root: "r", suffixes: [] }), "roll");

// ─── 2) Compilation d'un mot en CRÉNEAUX (accord vs arpège) ─────────────────
function toneWord(deploy, count) {
  return {
    params: {
      family: "tone",
      effects: {},
      motif: { start: 1, contour: "up", interval: "step", count, stem: 2, deploy, timbre: "resonant" },
    },
  };
}

// Accord (Function STA) : toutes les notes dans UN créneau, jouées ensemble.
const chord = compileProgram(toneWord("chord", 3));
assert.equal(chord.length, 1);
assert.equal(chord[0].length, 3);
assert.deepEqual(chord[0].map((n) => Math.round(n.spec.freq)), [262, 294, 330]); // Do Ré Mi (Stem 2)

// Arpège (Function DYN) : une note par créneau, égrenées.
const arp = compileProgram(toneWord("sequence", 3));
assert.equal(arp.length, 3);
assert.ok(arp.every((slot) => slot.length === 1));
assert.equal(arp[0][0].spec.kind, "tone");
assert.equal(arp[0][0].spec.timbre, "resonant");

// Un mot-texture = un seul créneau, une seule voix.
const clickSlots = compileProgram(click);
assert.equal(clickSlots.length, 1);
assert.equal(clickSlots[0].length, 1);
assert.equal(clickSlots[0][0].spec.kind, "click");

// Le compte (Configuration) arrive jusqu'à la voix texture.
const duplexRoll = compileProgram(parseIkalProgram("alxrasa").sequence[0]);
assert.equal(duplexRoll[0][0].spec.count, 2); // alxrasa = duplex (DPX)

// ─── 3) Réverb propre au timbre ─────────────────────────────────────────────
assert.equal(reverbAmountFor({ reverb: 0 }, "bell"), TIMBRES.bell.reverb);
assert.equal(reverbAmountFor({ reverb: 0 }, "dark"), TIMBRES.dark.reverb);
assert.equal(Math.round(reverbAmountFor({ reverb: 0.2 }, "dark") * 100), 36); // 0.2 + 0.16
assert.equal(reverbAmountFor({ reverb: 0.3 }, "inconnu"), 0.3); // timbre inconnu → pas de base
// La réverb est bornée à 1.
assert.equal(reverbAmountFor({ reverb: 0.9 }, "bell"), 1);

// ─── 4) Intensité des effets depuis les contrôles d'un mot ──────────────────
function amountOf(key, controls) {
  return EFFECTS.find((effect) => effect.key === key).amount(controls);
}

assert.equal(amountOf("bitcrush", {}), 0); // mot nu = aucun effet
assert.equal(amountOf("drive", {}), 0);
assert.ok(amountOf("bitcrush", { bitcrush: 0.9 }) > 0.6);
assert.ok(amountOf("drive", { drive: 0.9 }) > 0.6);
assert.ok(amountOf("drive", { distortion: 1 }) > 0); // la distorsion alimente le drive
assert.ok(amountOf("jitter", { tear: 0.9 }) > 0.5);
assert.ok(amountOf("ghost", { ghost: 0.5 }) > 0.4);
// Croissance monotone (un degré plus fort → plus d'effet).
assert.ok(amountOf("bitcrush", { bitcrush: 0.9 }) > amountOf("bitcrush", { bitcrush: 0.1 }));
assert.ok(amountOf("drive", { drive: 0.9 }) > amountOf("drive", { drive: 0.1 }));

// Effets cohérents avec un vrai mot affixé (parité avec l'ancien moteur).
const crushed = parseIkalProgram("sčala").sequence[0];
const crushedControls = compileProgram(crushed)[0][0].controls;
assert.ok(amountOf("bitcrush", crushedControls) > 0.5);
assert.ok(amountOf("jitter", crushedControls) > 0.5);

// ═══ 5) Cycle de vie avec un faux navigateur (le SON, lui, se valide à l'oreille)
const contexts = [];

function fakeParam(value = 0) {
  return {
    value,
    setValueAtTime() { return this; },
    exponentialRampToValueAtTime() { return this; },
    linearRampToValueAtTime() { return this; },
    cancelScheduledValues() { return this; },
    connect() {},
  };
}

class FakeAudioContext {
  constructor() {
    contexts.push(this);
    this.currentTime = 0;
    this.sampleRate = 44100;
    this.state = "suspended";
    this.destination = {};
    this.counts = { osc: 0, gain: 0, biquad: 0, shaper: 0, convolver: 0, bufferSrc: 0, compressor: 0, wave: 0, buffer: 0 };
    this.started = [];
    this.stopped = [];
  }

  resume() {
    this.state = "running";
    return Promise.resolve();
  }

  createGain() {
    this.counts.gain++;
    return { gain: fakeParam(1), connect() {}, disconnect() {} };
  }

  createOscillator() {
    this.counts.osc++;
    const ctx = this;
    return {
      type: "sine",
      frequency: fakeParam(440),
      detune: fakeParam(0),
      onended: null,
      connect() {}, disconnect() {}, setPeriodicWave() {},
      start(t) { ctx.started.push(t); },
      stop(t) { ctx.stopped.push(t); },
    };
  }

  createBiquadFilter() {
    this.counts.biquad++;
    return { type: "lowpass", frequency: fakeParam(350), Q: fakeParam(1), connect() {}, disconnect() {} };
  }

  createWaveShaper() {
    this.counts.shaper++;
    return { curve: null, oversample: "none", connect() {}, disconnect() {} };
  }

  createConvolver() {
    this.counts.convolver++;
    return { buffer: null, connect() {}, disconnect() {} };
  }

  createBufferSource() {
    this.counts.bufferSrc++;
    const ctx = this;
    return {
      buffer: null, loop: false, onended: null,
      connect() {}, disconnect() {},
      start(t) { ctx.started.push(t); },
      stop(t) { ctx.stopped.push(t); },
    };
  }

  createDynamicsCompressor() {
    this.counts.compressor++;
    return {
      threshold: fakeParam(-24), knee: fakeParam(30), ratio: fakeParam(12),
      attack: fakeParam(0.003), release: fakeParam(0.25),
      connect() {}, disconnect() {},
    };
  }

  createPeriodicWave() {
    this.counts.wave++;
    return {};
  }

  createBuffer(channels, length, sampleRate) {
    this.counts.buffer++;
    const data = [];
    for (let c = 0; c < channels; c++) {
      data.push(new Float32Array(length));
    }
    return { length, numberOfChannels: channels, sampleRate, getChannelData: (c) => data[c] };
  }
}

let capturedTick = null;
const fakeWin = {
  AudioContext: FakeAudioContext,
  setInterval: (fn) => { capturedTick = fn; return 1; },
  clearInterval: () => {},
};

const engine = createAudioEngine({ win: fakeWin });
assert.equal(engine.getVisualProgram(), null);
assert.equal(engine.isRunning(), false);

await engine.start();
const ctx = contexts[0];
assert.equal(contexts.length, 1);
assert.equal(engine.isRunning(), true);
assert.equal(ctx.state, "running"); // resume appelé
assert.equal(ctx.counts.convolver, 1); // une seule réverb partagée
assert.equal(ctx.counts.compressor, 1); // un limiteur de sécurité
assert.equal(typeof capturedTick, "function"); // séquenceur armé

// start() est idempotent : pas de 2e contexte ni de 2e horloge.
await engine.start();
assert.equal(contexts.length, 1);

// Une couche avec un mot à hauteur → un cycle du séquenceur crée des voix.
const oscBefore = ctx.counts.osc;
engine.setLayers([{ sequence: [tone], text: "amžvala" }]);
ctx.currentTime += 0.06; // on atteint l'instant de départ du 1er créneau
capturedTick();
assert.ok(ctx.counts.osc > oscBefore, "un oscillateur a été planifié");
assert.ok(ctx.started.length > 0, "une source a démarré");
assert.equal(engine.getVisualProgram(), tone);
assert.deepEqual(engine.getVisualPrograms(), [tone]);

// Un mot avec effet (drive) insère un WaveShaper dans la chaîne.
const shaperBefore = ctx.counts.shaper;
const drivenTone = { params: { family: "tone", effects: { drive: 0.8 }, motif: { start: 1, contour: "up", interval: "step", count: 1, stem: 2, deploy: "chord", timbre: "resonant" } } };
engine.setLayers([{ sequence: [drivenTone] }]);
ctx.currentTime += 0.06;
capturedTick();
assert.ok(ctx.counts.shaper > shaperBefore, "l'effet drive a créé un WaveShaper");

// clearSequence coupe les voix en cours et vide l'affichage.
const stoppedBefore = ctx.stopped.length;
engine.clearSequence();
assert.ok(ctx.stopped.length > stoppedBefore, "les sources actives ont été arrêtées");
assert.equal(engine.getVisualProgram(), null);
assert.deepEqual(engine.getVisualPrograms(), []);

// setTempo : à vitesse rapide, un cycle du séquenceur planifie PLUS de notes
// (plus de créneaux tiennent dans la fenêtre d'anticipation) qu'à vitesse lente.
const arp5 = { params: { family: "tone", effects: {}, motif: { start: 1, contour: "up", interval: "step", count: 5, stem: 2, deploy: "sequence", timbre: "resonant" } } };

engine.setTempo(0.04); // rapide
engine.setLayers([{ sequence: [arp5] }]);
ctx.currentTime += 0.06;
const beforeFast = ctx.started.length;
engine._tick();
const firedFast = ctx.started.length - beforeFast;

engine.setTempo(0.4); // lent
engine.setLayers([{ sequence: [arp5] }]);
ctx.currentTime += 0.06;
const beforeSlow = ctx.started.length;
engine._tick();
const firedSlow = ctx.started.length - beforeSlow;

assert.ok(firedFast > firedSlow, `tempo rapide (${firedFast}) doit planifier plus de notes que lent (${firedSlow})`);

// setTempo(null) → retour à la vitesse par défaut (pas de crash).
engine.setTempo(null);
engine.clearSequence();

// ─── 6) Erreur lisible si Web Audio est absent ──────────────────────────────
await assert.rejects(() => createAudioEngine({ win: {} }).start(), /Web Audio API indisponible/);

console.log("audio-engine ok");
