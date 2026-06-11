import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { formatGeneratedAffiliationForms } from "../scripts/generate-affiliation-forms.mjs";

const generatedPath = new URL("../src/parser/generated/ikal-affiliation-forms.js", import.meta.url);
const current = readFileSync(generatedPath, "utf8");

assert.equal(current, formatGeneratedAffiliationForms());

console.log("ikal-affiliation-generation ok");
