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

const generated = generateIthkuilWord({
  type: "UNF/C",
  root: "lxr",
  function: "DYN",
  ca: {
    configuration: "MFC",
    essence: "RPV",
  },
});

assert.equal(generated, "alxružla");

const mapped = parseIthkuilWord("ļtutļa");
assert.equal(mapped.error, undefined);
assert.equal(mapped.ithkuil.type, "formative");
assert.equal(mapped.ithkuil.root, "ļt");
assert.equal(mapped.ithkuil.function, "DYN");
assert.equal(mapped.ithkuil.ca.essence, "RPV");
assert.equal(mapped.ithkuil.parsed.case, "THM");

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
