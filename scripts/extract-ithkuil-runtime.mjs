// Extrait de @zsnout/ithkuil le sous-ensemble morphologique utilisé par IKAL
// dans le navigateur : parseWord (décomposition) + wordToIthkuil (génération).
// esbuild suit les imports depuis ces deux fonctions et ne garde que le code
// réellement atteint (tree-shaking) : ni le lexique officiel (data/), ni zod.
// Le résultat est UN module ES autonome, servi tel quel — zéro build au runtime.
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { build } from "esbuild";

const OUTPUT_PATH = resolve("src/parser/generated/ithkuil-runtime.js");

const ENTRY = [
  'export { parseWord } from "@zsnout/ithkuil/parse/index.js";',
  'export { wordToIthkuil } from "@zsnout/ithkuil/generate/index.js";',
].join("\n");

async function libraryVersion() {
  const raw = await readFile(resolve("node_modules/@zsnout/ithkuil/package.json"), "utf8");

  return JSON.parse(raw).version;
}

export async function extractIthkuilRuntime() {
  const version = await libraryVersion();
  const banner = [
    "// Généré par scripts/extract-ithkuil-runtime.mjs — ne pas éditer à la main.",
    "// Régénérer : npm run generate:ithkuil-runtime",
    "//",
    "// Ce fichier embarque un sous-ensemble de @zsnout/ithkuil@" + version,
    "// (parseWord + wordToIthkuil), extrait par tree-shaking esbuild.",
    "//",
    "// @zsnout/ithkuil — MIT License",
    "// Copyright (c) 2023 Zachary Sakowitz",
    "//",
    "// Permission is hereby granted, free of charge, to any person obtaining a copy",
    "// of this software and associated documentation files (the \"Software\"), to deal",
    "// in the Software without restriction, including without limitation the rights",
    "// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell",
    "// copies of the Software, and to permit persons to whom the Software is",
    "// furnished to do so, subject to the following conditions:",
    "//",
    "// The above copyright notice and this permission notice shall be included in all",
    "// copies or substantial portions of the Software.",
    "//",
    "// THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR",
    "// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,",
    "// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE",
    "// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER",
    "// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,",
    "// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE",
    "// SOFTWARE.",
  ].join("\n");
  const result = await build({
    absWorkingDir: resolve("."),
    banner: { js: banner },
    bundle: true,
    format: "esm",
    outfile: OUTPUT_PATH,
    stdin: {
      contents: ENTRY,
      loader: "js",
      resolveDir: resolve("."),
      sourcefile: "ithkuil-runtime-entry.js",
    },
    treeShaking: true,
    write: true,
  });

  if (result.errors.length > 0) {
    throw new Error("extraction esbuild en erreur : " + JSON.stringify(result.errors));
  }

  return OUTPUT_PATH;
}

async function verifyExtractedRuntime() {
  const bundled = await import(OUTPUT_PATH);
  const reference = await import("@zsnout/ithkuil/parse/index.js");
  const generator = await import("@zsnout/ithkuil/generate/index.js");
  const samples = [
    "alkala",
    "lyula",
    "ačxwuža",
    "ačxwalëiţma",
    "ļtaloţmařčompa",
    "avtanļa",
    "ufthalöxa",
    "royež",
  ];

  for (const sample of samples) {
    const fromBundle = JSON.stringify(bundled.parseWord(sample));
    const fromLibrary = JSON.stringify(reference.parseWord(sample));

    if (fromBundle !== fromLibrary) {
      throw new Error("divergence bundle/lib sur parseWord(" + sample + ")");
    }
  }

  const word = {
    ca: { affiliation: "COA" },
    root: "vt",
    shortcut: false,
    slotVIIAffixes: [{ cs: "sk", degree: 3, type: 1 }],
    type: "UNF/C",
  };
  const fromBundle = bundled.wordToIthkuil(word);
  const fromLibrary = generator.wordToIthkuil(word);

  if (fromBundle !== fromLibrary) {
    throw new Error("divergence bundle/lib sur wordToIthkuil");
  }

  return samples.length;
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  const path = await extractIthkuilRuntime();
  const checked = await verifyExtractedRuntime();
  console.log("généré " + path + " (conformité vérifiée sur " + checked + " formes)");
}