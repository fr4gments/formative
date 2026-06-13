import assert from "node:assert/strict";

import {
  PENTATONIC,
  generateMotif,
  freqForMidi,
  midiForStep,
  motifFrequencies,
} from "../src/engines/motif.js";

// Pentatonique majeure : Do Ré Mi Sol La.
assert.deepEqual(PENTATONIC, [0, 2, 4, 7, 9]);

// Degrés 1..6 (Stem 2 = Do4 = MIDI 60) → pentatonique ascendante sur 1 octave+.
assert.deepEqual([1, 2, 3, 4, 5, 6].map((s) => midiForStep(s, 2)), [60, 62, 64, 67, 69, 72]);

// Stem décale l'octave : Stem 1 = Do3 (48), Stem 3 = Do5 (72).
assert.equal(midiForStep(1, 1), 48);
assert.equal(midiForStep(1, 3), 72);

// Degrés 0 et négatifs tombent proprement sous la tonique (pas de trou).
assert.equal(midiForStep(0, 2), 57); // La3
assert.equal(midiForStep(-1, 2), 55); // Sol3

assert.equal(freqForMidi(69), 440);

// Les trois motifs par défaut du prototype motif-synth.html (référence sonore).
assert.deepEqual(generateMotif({ start: 1, contour: "up", interval: "step", count: 4 }), [1, 2, 3, 4]);
assert.deepEqual(generateMotif({ start: 5, contour: "down", interval: "step", count: 3 }), [5, 4, 3]);
assert.deepEqual(generateMotif({ start: 3, contour: "wave", interval: "leap", count: 5 }), [3, 5, 7, 5, 3]);

// Par sauts (leap) = arpège (pas de 2 degrés).
assert.deepEqual(generateMotif({ start: 1, contour: "up", interval: "leap", count: 3 }), [1, 3, 5]);

// Défauts : une seule note (tonique).
assert.deepEqual(generateMotif(), [1]);
assert.deepEqual(generateMotif({ count: 1 }), [1]);

// count est borné à >= 1.
assert.deepEqual(generateMotif({ count: 0 }), [1]);

// motifFrequencies enchaîne génération + fréquences.
const freqs = motifFrequencies({ start: 5, contour: "up", interval: "step", count: 1 }, 2);
assert.equal(freqs.length, 1);
assert.equal(Math.round(freqs[0]), 440); // degré 5 stem 2 = La4 = 440 Hz

console.log("motif ok");
