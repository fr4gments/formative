import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { formatGeneratedAudioAffixedForms } from "../scripts/generate-audio-affixed-forms.mjs";

const generatedPath = new URL("./fixtures/ikal-audio-affixed-forms.js", import.meta.url);
const current = readFileSync(generatedPath, "utf8");

assert.equal(current, formatGeneratedAudioAffixedForms());

console.log("ikal-audio-affix-generation ok");
