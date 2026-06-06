import assert from "node:assert/strict";

import { parseMot, parseProgramme } from "../src/parser/poc-parser.js";

assert.deepEqual(parseProgramme(""), { stop: true });

assert.equal(parseMot("wat").error, "mot inconnu : « wat »");
assert.equal(parseMot("kal-nope").error, "suffixe inconnu : « -nope »");

const one = parseMot("rur-sk-tx");
assert.equal(one.prog.root, "r");
assert.equal(one.prog.motion, "DYN");
assert.deepEqual(one.prog.suffixes, ["šk", "tx"]);
assert.equal(one.prog.text, "rur-sk-tx");

const sequence = parseProgramme("kal ras sus");
assert.equal(sequence.text, "kal ras sus");
assert.equal(sequence.sequence.length, 3);
assert.equal(sequence.sequence[2].root, "s");
assert.equal(sequence.sequence[2].number, "MPX");
assert.equal(sequence.layers.length, 1);
assert.equal(sequence.layers[0].sequence, sequence.sequence);

const layers = parseProgramme("kal ras\nsus-tx kul");
assert.equal(layers.text, "kal ras\nsus-tx kul");
assert.equal(layers.layers.length, 2);
assert.equal(layers.layers[0].sequence.length, 2);
assert.equal(layers.layers[1].sequence.length, 2);
assert.equal(layers.layers[1].sequence[0].root, "s");
assert.deepEqual(layers.layers[1].sequence[0].suffixes, ["tx"]);

assert.equal(
  parseProgramme("kal\nwat").error,
  "ligne 2 : mot inconnu : « wat »",
);

console.log("poc-parser ok");
