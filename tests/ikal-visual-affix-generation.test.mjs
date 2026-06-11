import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { formatGeneratedVisualAffixedForms } from "../scripts/generate-visual-affixed-forms.mjs";

const generatedPath = new URL("./fixtures/ikal-visual-affixed-forms.js", import.meta.url);
const current = readFileSync(generatedPath, "utf8");

assert.equal(current, formatGeneratedVisualAffixedForms());

console.log("ikal-visual-affix-generation ok");
