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

console.log("poc-parser ok");
