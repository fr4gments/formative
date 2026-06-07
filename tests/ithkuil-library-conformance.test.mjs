import assert from "node:assert/strict";

import { wordToIthkuil } from "@zsnout/ithkuil/generate/index.js";
import { glossWord } from "@zsnout/ithkuil/gloss/index.js";
import { parseWord } from "@zsnout/ithkuil/parse/index.js";

const simple = parseWord("kšala");
assert.equal(simple.root, "kš");
assert.equal(simple.function, "STA");
assert.equal(simple.case, "THM");

const simpleGloss = glossWord(simple);
assert.equal(typeof simpleGloss.short, "string");
assert.equal(simpleGloss.short.length > 0, true);

const complexWord = wordToIthkuil({
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

const complex = parseWord(complexWord);
assert.equal(complex.root, "kš");
assert.equal(complex.function, "DYN");
assert.equal(complex.version, "CPT");
assert.equal(complex.specification, "OBJ");
assert.equal(complex.context, "AMG");
assert.equal(complex.ca.configuration, "MFC");
assert.equal(complex.slotVAffixes.length, 1);

const affixed = parseWord("malëuţřait");
assert.equal(affixed.root, "m");
assert.equal(affixed.slotVIIAffixes.length, 2);
assert.equal(affixed.slotVIIAffixes[0].cs, "ţř");

console.log("ithkuil-library-conformance ok");
