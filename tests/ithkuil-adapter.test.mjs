import assert from "node:assert/strict";

import { generateIthkuilWord, parseIthkuilWord } from "../src/parser/ithkuil-adapter.js";

const simple = parseIthkuilWord("kšala");
assert.equal(simple.error, undefined);
assert.equal(simple.ithkuil.source, "kšala");
assert.equal(simple.ithkuil.normalized, "kšala");
assert.equal(simple.ithkuil.type, "formative");
assert.equal(simple.ithkuil.wordType, "formative");
assert.equal(simple.ithkuil.formativeType, "UNF/C");
assert.equal(simple.ithkuil.root, "kš");
assert.equal(simple.ithkuil.stem, 1);
assert.equal(simple.ithkuil.function, "STA");
assert.equal(simple.ithkuil.specification, "BSC");
assert.equal(simple.ithkuil.context, "EXS");
assert.deepEqual(simple.ithkuil.ca, {});
assert.deepEqual(simple.ithkuil.affixes, {
  slotV: [],
  slotVII: [],
});
assert.equal(simple.ithkuil.parsed.root, "kš");
assert.equal(simple.ithkuil.parsed.function, "STA");
assert.equal(simple.ithkuil.parsed.case, "THM");
assert.equal(typeof simple.ithkuil.gloss, "string");
assert.equal(simple.ithkuil.gloss.length > 0, true);
assert.equal(simple.ithkuil.gloss, simple.ithkuil.glosses.short);
assert.equal(simple.ithkuil.glosses.full.length > 0, true);
assert.equal(simple.ithkuil.gloss.includes("[object Object]"), false);

const complexWord = generateIthkuilWord({
  type: "UNF/C",
  concatenationType: 2,
  version: "CPT",
  stem: 2,
  root: "kš",
  function: "DYN",
  specification: "OBJ",
  context: "AMG",
  slotVAffixes: [
    {
      referents: ["1m:BEN"],
      case: "ERG",
    },
  ],
  ca: {
    configuration: "MFC",
    affiliation: "COA",
    extension: "GRA",
  },
  vn: "REP",
});

assert.equal(complexWord, "hwikšöeroeržžgeiha");

const complex = parseIthkuilWord(complexWord);
assert.equal(complex.error, undefined);
assert.equal(complex.ithkuil.type, "formative");
assert.equal(complex.ithkuil.parsed.root, "kš");
assert.equal(complex.ithkuil.parsed.function, "DYN");
assert.equal(complex.ithkuil.parsed.version, "CPT");
assert.equal(complex.ithkuil.parsed.specification, "OBJ");
assert.equal(complex.ithkuil.parsed.context, "AMG");
assert.equal(complex.ithkuil.parsed.ca.configuration, "MFC");
assert.equal(complex.ithkuil.parsed.slotVAffixes.length, 1);

const affixed = parseIthkuilWord("malëuţřait");
assert.equal(affixed.error, undefined);
assert.equal(affixed.ithkuil.type, "formative");
assert.equal(affixed.ithkuil.parsed.root, "m");
assert.equal(affixed.ithkuil.parsed.slotVIIAffixes.length, 2);
assert.equal(affixed.ithkuil.parsed.slotVIIAffixes[0].cs, "ţř");

const referential = parseIthkuilWord("royež");
assert.equal(referential.error, undefined);
assert.equal(referential.ithkuil.type, "referential");
assert.equal(referential.ithkuil.root, undefined);
assert.deepEqual(referential.ithkuil.parsed.referents, ["1m:BEN"]);
assert.equal(referential.ithkuil.parsed.case, "ERG");

assert.equal(
  parseIthkuilWord("").error,
  "mot Ithkuil vide",
);
assert.equal(
  parseIthkuilWord("hlarrau-laza").error,
  "forme Ithkuil non reconnue : « hlarrau-laza »",
);

console.log("ithkuil-adapter ok");
