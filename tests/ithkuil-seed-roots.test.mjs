import assert from "node:assert/strict";

import { wordToIthkuil } from "@zsnout/ithkuil/generate/index.js";

import { parseIthkuilWord } from "../src/parser/ithkuil-adapter.js";
import {
  IKAL_SEED_ROOTS,
  seedRootForCr,
  seedRootForForm,
  seedRootForIthkuil,
} from "../src/parser/ithkuil-seed-roots.js";

assert.equal(IKAL_SEED_ROOTS.length >= 10, true);
assert.equal(seedRootForCr("lk").form, "alkala");
assert.equal(seedRootForForm("lyula").cr, "ly");
assert.equal(seedRootForForm("lyula").function, "DYN");
assert.equal(seedRootForIthkuil({ root: "ly", function: "DYN" }).form, "lyula");
assert.equal(seedRootForIthkuil({ root: "ly", function: "STA" }).form, "lyala");
assert.equal(seedRootForIthkuil({ root: "kš", function: "STA" }), undefined);

for (const candidate of IKAL_SEED_ROOTS) {
  const result = parseIthkuilWord(candidate.form);

  assert.equal(result.error, undefined, candidate.form);
  assert.equal(result.ithkuil.type, "formative", candidate.form);
  assert.equal(result.ithkuil.parsed.root, candidate.cr, candidate.form);
  assert.equal(result.ithkuil.glosses.short.length > 0, true, candidate.form);

  const generated = wordToIthkuil({
    type: "UNF/C",
    root: candidate.cr,
    ...(candidate.function ? { function: candidate.function } : {}),
  });

  assert.equal(generated, candidate.form, candidate.form);
}

console.log("ithkuil-seed-roots ok");
