import assert from "node:assert/strict";

import { parseIkalProgram } from "../src/parser/ikal-parser.js";

assert.deepEqual(parseIkalProgram(""), { sourceSyntax: "poc", stop: true });

const poc = parseIkalProgram("kal ras");
assert.equal(poc.error, undefined);
assert.equal(poc.sourceSyntax, "poc");
assert.equal(poc.sequence.length, 2);
assert.equal(poc.sequence[0].root, "k");

const one = parseIkalProgram("ļtala");
assert.equal(one.error, undefined);
assert.equal(one.sourceSyntax, "ithkuil");
assert.equal(one.sequence.length, 1);
assert.equal(one.sequence[0].text, "ļtala");
assert.equal(one.sequence[0].params.family, "click");
assert.equal(one.sequence[0].params.role, "voice");
assert.equal(one.sequence[0].baseParams.family, "click");
assert.deepEqual(one.sequence[0].userParams, {});

const sequence = parseIkalProgram("ļtala alxrasa ačxwuža");
assert.equal(sequence.error, undefined);
assert.equal(sequence.sourceSyntax, "ithkuil");
assert.equal(sequence.sequence.length, 3);
assert.deepEqual(
  sequence.sequence.map((program) => program.params.family),
  ["click", "roll", "noise"],
);
assert.equal(sequence.sequence[1].params.multiplicity.configuration, "DPX");
assert.equal(sequence.sequence[2].params.motion.kind, "dynamic");

const layers = parseIkalProgram("ļtala alxrasa\načxwuža pswatļa");
assert.equal(layers.error, undefined);
assert.equal(layers.sourceSyntax, "ithkuil");
assert.equal(layers.layers.length, 2);
assert.equal(layers.layers[0].sequence.length, 2);
assert.equal(layers.layers[1].sequence.length, 2);
assert.deepEqual(
  layers.layers.map((layer) => layer.sequence[0].params.family),
  ["click", "noise"],
);

const withModeWord = parseIkalProgram("alkala ļtala");
assert.equal(withModeWord.error, undefined);
assert.equal(withModeWord.sequence.length, 1);
assert.equal(withModeWord.sequence[0].text, "ļtala");
assert.equal(withModeWord.words[0].params.role, "mode");

assert.equal(
  parseIkalProgram("kšala").error,
  "forme Ithkuil valide, mais racine non encore mappée par IKAL : root=kš",
);
assert.equal(
  parseIkalProgram("ļtala\nkšala").error,
  "ligne 2 : forme Ithkuil valide, mais racine non encore mappée par IKAL : root=kš",
);
assert.equal(
  parseIkalProgram("alkala").error,
  "aucun mot IKAL exploitable dans la ligne",
);

console.log("ikal-parser ok");
