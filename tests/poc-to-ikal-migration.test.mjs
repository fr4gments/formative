import assert from "node:assert/strict";

import { parseIthkuilWord } from "../src/parser/ithkuil-adapter.js";
import { seedRootForForm, seedRootForIthkuil } from "../src/parser/ithkuil-seed-roots.js";
import {
  migrationForIthkuilForm,
  migrationForPocToken,
  POC_TO_IKAL_MIGRATION,
} from "../src/parser/poc-to-ikal-migration.js";

const expectedPocTokens = ["kal", "ras", "suš", "sus", "kul", "sal", "ruř", "rur", "-tx", "-šk", "-sk"];

for (const token of expectedPocTokens) {
  assert.ok(migrationForPocToken(token), token);
}

assert.equal(migrationForPocToken("sus").poc, "suš");
assert.equal(migrationForPocToken("rur").poc, "ruř");
assert.equal(migrationForPocToken("-sk").poc, "-šk");

for (const entry of POC_TO_IKAL_MIGRATION) {
  const seedRoot = seedRootForForm(entry.ikal);

  assert.ok(seedRoot, entry.ikal);
  assert.equal(migrationForIthkuilForm(entry.ikal), entry, entry.ikal);

  const parsed = parseIthkuilWord(entry.ikal);

  assert.equal(parsed.error, undefined, entry.ikal);
  assert.equal(parsed.ithkuil.type, "formative", entry.ikal);
  assert.equal(seedRootForIthkuil(parsed.ithkuil).form, entry.ikal, entry.ikal);
}

console.log("poc-to-ikal-migration ok");
