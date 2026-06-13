import assert from "node:assert/strict";

import {
  asciiFold,
  completionTokenAt,
  createIkalAutocomplete,
  decompositionInspection,
  modeContextAt,
  replaceCompletionToken,
  suggestIkalWords,
} from "../src/editor/ikal-autocomplete.js";

function createElement(tagName) {
  const listeners = new Map();

  return {
    attrs: new Map(),
    children: [],
    className: "",
    dataset: {},
    hidden: false,
    tagName,
    textContent: "",
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    append(...nodes) {
      this.children.push(...nodes);
    },
    dispatchEvent(event) {
      listeners.get(event.type)?.(event);
    },
    replaceChildren(...nodes) {
      this.children = nodes;
    },
    setAttribute(name, value) {
      this.attrs.set(name, value);
    },
  };
}

function createDomStubs() {
  const doc = {
    createElement,
  };
  const textarea = createElement("textarea");
  const panel = createElement("div");

  textarea.ownerDocument = doc;
  textarea.selectionStart = 0;
  textarea.selectionEnd = 0;
  textarea.value = "";
  panel.ownerDocument = doc;

  return { panel, textarea };
}

function keyEvent(key, options = {}) {
  return {
    key,
    ctrlKey: Boolean(options.ctrlKey),
    metaKey: Boolean(options.metaKey),
    prevented: false,
    preventDefault() {
      this.prevented = true;
    },
  };
}

assert.equal(asciiFold("ačxwuža ļt ř šp"), "acxwuza lt r sp");

assert.deepEqual(completionTokenAt("ļtala acxw", 9), {
  end: 9,
  start: 6,
  text: "acx",
});
assert.deepEqual(completionTokenAt("ļtala acxw", 10), {
  end: 10,
  start: 6,
  text: "acxw",
});
assert.deepEqual(modeContextAt("alkala:\n  acxw", "alkala:\n  acxw".length), {
  implicit: false,
  mode: "music",
});
assert.deepEqual(modeContextAt("lyala:\n  fr", "lyala:\n  fr".length), {
  implicit: false,
  mode: "image",
});
assert.deepEqual(modeContextAt("lyula:\n  tr", "lyula:\n  tr".length), {
  implicit: false,
  mode: "animation",
});
assert.deepEqual(modeContextAt("lyula:\ntr", "lyula:\ntr".length), {
  implicit: false,
  mode: "mode",
});

assert.equal(suggestIkalWords("acxwu")[0].form, "ačxwuža");
assert.equal(suggestIkalWords("ltu")[0].form, "ļtutļa");
assert.equal(suggestIkalWords("alxruz")[0].form, "alxružla");
assert.equal(suggestIkalWords("sus")[0].form, "ačxwuža");
assert.equal(suggestIkalWords("sk")[0].form, "affrala");
assert.equal(suggestIkalWords("scala")[0].form, "sčala");
assert.equal(
  suggestIkalWords("affr")[0].paramSignature,
  "0.9 (distortion), 0.75 (drive), 0.35 (saturation)",
);
assert.equal(
  suggestIkalWords("alxruz")[0].paramSignature,
  "1 (motion), 0.88 (density), 0.6 (ghost)",
);
assert.equal(suggestIkalWords("ity")[0].form, "ļtaloţma");
assert.equal(suggestIkalWords("ity")[0].paramSignature, "ITY/7 intensity = 0.7");
assert.equal(suggestIkalWords("degr")[0].form, "ļtalařča");
assert.equal(suggestIkalWords("reverb")[0].form, "ļtalompa");
assert.equal(suggestIkalWords("dts")[0].paramSignature, "DTS/7 reverb = 0.7");
assert.equal(suggestIkalWords("dts9")[0].form, "ļtalumpa");
assert.equal(suggestIkalWords("dts9")[0].paramSignature, "DTS/9 reverb = 0.9");
assert.equal(suggestIkalWords("reverb", { mode: "music" })[0].form, "ļtalompa");
assert.equal(suggestIkalWords("reverb", { mode: "image" }).length, 0);
assert.equal(suggestIkalWords("fr", { mode: "image" })[0].form, "fřala");
assert.equal(suggestIkalWords("fr", { mode: "animation" }).some((suggestion) => suggestion.form === "fřala"), true);
assert.equal(suggestIkalWords("nuage", { mode: "image" })[0].form, "ufthala");
assert.equal(suggestIkalWords("filament", { mode: "image" })[0].form, "avtala");
assert.equal(suggestIkalWords("eclat", { mode: "image" })[0].form, "etçvala");
assert.equal(suggestIkalWords("nuage", { mode: "music" }).length, 0);
assert.equal(suggestIkalWords("nuage", { mode: "animation" })[0].form, "ufthala");
assert.equal(suggestIkalWords("scale", { mode: "image" })[0].form, "avtalöxa");
assert.equal(suggestIkalWords("glow", { mode: "image" })[0].form, "avtaläňva");
assert.equal(suggestIkalWords("vivid", { mode: "image" })[0].form, "avtalölba");
assert.equal(suggestIkalWords("scale", { mode: "music" }).length, 0);
assert.equal(suggestIkalWords("scale", { mode: "animation" })[0].form, "avtalöxa");
assert.equal(suggestIkalWords("tr", { mode: "animation" })[0].form, "trala");
assert.equal(suggestIkalWords("tr", { mode: "image" }).some((suggestion) => suggestion.form === "trala"), true);
assert.equal(suggestIkalWords("affr", { mode: "music" })[0].form, "affrala");
assert.equal(suggestIkalWords("affr", { mode: "image" })[0].form, "affrala");
assert.equal(suggestIkalWords("affr", { mode: "animation" })[0].form, "affrala");

assert.equal(suggestIkalWords("coa", { mode: "image" })[0].form, "avtarļa");
assert.equal(suggestIkalWords("sculpte", { mode: "image" })[0].form, "avtarļa");
assert.equal(suggestIkalWords("renforce", { mode: "image" })[0].form, "avtanļa");
assert.equal(suggestIkalWords("deforme", { mode: "image" })[0].form, "avtaňa");
assert.equal(suggestIkalWords("aso", { mode: "animation" })[0].form, "avtanļa");
assert.equal(suggestIkalWords("coa", { mode: "music" }).length, 0);
assert.equal(
  suggestIkalWords("coa", { mode: "image" })[0].paramSignature,
  "COA coalescent · sculpte la ligne",
);
assert.equal(
  suggestIkalWords("var", { mode: "image" })[0].paramSignature,
  "VAR variatif · déforme la ligne",
);
assert.equal(suggestIkalWords("uftharļa", { mode: "image" })[0].form, "uftharļa");

// Composition libre : des combinaisons hors fenêtre énumérée sont composées à
// la volée (grammaire ouverte), y compris affiliation + affixe sur le même mot.
assert.equal(suggestIkalWords("ltalaity3mdl2dts4")[0].form, "ļtaleţmäjmimpa");
assert.equal(
  suggestIkalWords("ltalaity3mdl2dts4")[0].paramSignature,
  "ITY/3 intensity = 0.3, MDL/2 random-modulation = 0.2, DTS/4 reverb = 0.4",
);
assert.equal(suggestIkalWords("avtalacoasiz7", { mode: "image" })[0].form, "avtarļoxa");
assert.equal(suggestIkalWords("filament+sculpte+scale7", { mode: "image" })[0].form, "avtarļoxa");
assert.equal(
  suggestIkalWords("filament+sculpte+scale7", { mode: "image" })[0].paramSignature,
  "COA coalescent · sculpte la ligne · SIZ/7 scale",
);
assert.equal(suggestIkalWords("avtalacoasiz7", { mode: "music" }).length, 0);

// Inspection par décomposition : n'importe quelle forme valide, même jamais
// énumérée, est décomposée et expliquée.
assert.equal(decompositionInspection("avtarļoxa", "image").paramSignature, "COA coalescent · sculpte la ligne · SIZ/7 scale");
assert.equal(
  decompositionInspection("ļtaleţmäjmimpa", "music").paramSignature,
  "ITY/3 intensity = 0.3, MDL/2 random-modulation = 0.2, DTS/4 reverb = 0.4",
);
assert.equal(decompositionInspection("avtarļoxa", "music"), null);
assert.equal(decompositionInspection("wala", null), null);

// Mots-motifs (sources à hauteur, Étape 6) cherchés par approximation ASCII —
// comme TOUT le vocabulaire IKAL : on tape l'approximation, la forme à
// diacritiques est suggérée puis insérée. Pas d'« intention ».
assert.equal(suggestIkalWords("amz", { mode: "music" })[0].form, "amžvala"); // octave grave
assert.equal(suggestIkalWords("emz", { mode: "music" })[0].form, "emžvala"); // octave médium
assert.equal(suggestIkalWords("umz", { mode: "music" })[0].form, "umžvala"); // octave aiguë
// le fold ASCII d'un motif retombe sur la forme à diacritiques
assert.equal(suggestIkalWords("emzvuza", { mode: "music" })[0].form, "emžvuža");
assert.equal(
  suggestIkalWords("emzvuza", { mode: "music" })[0].paramSignature,
  "ton · montant · pas · 3 notes · octave 2 · départ 1",
);
// les sources à hauteur ne sont proposées qu'en musique
assert.equal(suggestIkalWords("emz", { mode: "image" }).length, 0);
// l'inspecteur décode le motif d'une forme à hauteur tapée
assert.equal(
  decompositionInspection("emžvuža", "music").paramSignature,
  "ton · montant · pas · 3 notes · octave 2 · départ 1",
);

// Les 5 timbres mélodiques (= 5 racines) sont trouvables par approximation ASCII
// et par alias sémantique.
assert.equal(suggestIkalWords("zb", { mode: "music" })[0].form, "žbala");     // cloche
assert.equal(suggestIkalWords("arz", { mode: "music" })[0].form, "ařżala");   // drone
assert.equal(suggestIkalWords("zd", { mode: "music" })[0].form, "ždala");     // blip
assert.equal(suggestIkalWords("ally", { mode: "music" })[0].form, "allyala"); // chant
assert.equal(suggestIkalWords("cloche", { mode: "music" })[0].form, "žbala");
assert.equal(suggestIkalWords("drone", { mode: "music" })[0].form, "ařżala");
assert.equal(suggestIkalWords("chant", { mode: "music" })[0].form, "allyala");

const replaced = replaceCompletionToken("acxw", completionTokenAt("acxw", 4), "ačxwuža");
assert.equal(replaced.value, "ačxwuža ");
assert.equal(replaced.caret, "ačxwuža ".length);

const { panel, textarea } = createDomStubs();
const autocomplete = createIkalAutocomplete({ panel, textarea });

textarea.value = "acxwu";
textarea.selectionStart = 5;
textarea.selectionEnd = 5;
autocomplete.refresh();

assert.equal(panel.hidden, false);
assert.equal(panel.children[0].children[0].textContent, "ačxwuža");
assert.equal(panel.children[0].children[2].textContent, "0.78 (roughness), 0.88 (density), 1 (motion)");

const ctrlEnter = keyEvent("Enter", { ctrlKey: true });
assert.equal(autocomplete.handleKeyDown(ctrlEnter), false);
assert.equal(ctrlEnter.prevented, false);

const tab = keyEvent("Tab");
assert.equal(autocomplete.handleKeyDown(tab), true);
assert.equal(tab.prevented, true);
assert.equal(textarea.value, "ačxwuža ");
assert.equal(textarea.selectionStart, "ačxwuža ".length);
assert.equal(panel.hidden, true);

textarea.value = "affrala";
textarea.selectionStart = textarea.value.length;
textarea.selectionEnd = textarea.value.length;
autocomplete.refresh();
assert.equal(panel.hidden, false);
assert.equal(panel.children[0].className, "suggestion inspector");
assert.equal(panel.children[0].children[0].textContent, "affrala");
assert.equal(panel.children[0].children[2].textContent, "0.9 (distortion), 0.75 (drive), 0.35 (saturation)");

textarea.value = "affrala(";
textarea.selectionStart = textarea.value.length;
textarea.selectionEnd = textarea.value.length;
autocomplete.refresh();
assert.equal(panel.hidden, false);
assert.equal(panel.children[0].className, "suggestion inspector");
assert.equal(panel.children[0].children[0].textContent, "affrala");
assert.equal(panel.children[0].children[2].textContent, "0.9 (distortion), 0.75 (drive), 0.35 (saturation)");

textarea.value = "affrala (";
textarea.selectionStart = textarea.value.length;
textarea.selectionEnd = textarea.value.length;
autocomplete.refresh();
assert.equal(textarea.value, "affrala(");
assert.equal(textarea.selectionStart, "affrala(".length);
assert.equal(panel.hidden, false);
assert.equal(panel.children[0].className, "suggestion inspector");
assert.equal(panel.children[0].children[0].textContent, "affrala");
assert.equal(panel.children[0].children[2].textContent, "0.9 (distortion), 0.75 (drive), 0.35 (saturation)");

textarea.value = "affrala(0.85";
textarea.selectionStart = textarea.value.length;
textarea.selectionEnd = textarea.value.length;
autocomplete.refresh();
assert.equal(panel.hidden, false);
assert.equal(panel.children[0].className, "suggestion inspector");
assert.equal(panel.children[0].children[0].textContent, "affrala");
assert.equal(panel.children[0].children[2].textContent, "0.9 (distortion), 0.75 (drive), 0.35 (saturation)");

textarea.value = "sčala(0.12, 0.34";
textarea.selectionStart = textarea.value.length;
textarea.selectionEnd = textarea.value.length;
autocomplete.refresh();
assert.equal(panel.hidden, false);
assert.equal(panel.children[0].className, "suggestion inspector");
assert.equal(panel.children[0].children[0].textContent, "sčala");
assert.equal(panel.children[0].children[2].textContent, "0.9 (tear), 0.55 (bitcrush), 0.7 (roughness)");

textarea.value = "ļtaloţmařčompa";
textarea.selectionStart = textarea.value.length;
textarea.selectionEnd = textarea.value.length;
autocomplete.refresh();
assert.equal(panel.hidden, false);
assert.equal(panel.children[0].className, "suggestion inspector");
assert.equal(panel.children[0].children[0].textContent, "ļtaloţmařčompa");
assert.equal(panel.children[0].children[2].textContent, "ITY/7 intensity = 0.7, OPF/1 degradation = 0.9, DTS/7 reverb = 0.7");

textarea.value = "ļtaleţmäjmimpa";
textarea.selectionStart = textarea.value.length;
textarea.selectionEnd = textarea.value.length;
autocomplete.refresh();
assert.equal(panel.hidden, false);
assert.equal(panel.children[0].className, "suggestion inspector");
assert.equal(panel.children[0].children[0].textContent, "ļtaleţmäjmimpa");
assert.equal(panel.children[0].children[2].textContent, "ITY/3 intensity = 0.3, MDL/2 random-modulation = 0.2, DTS/4 reverb = 0.4");

textarea.value = "reverb";
textarea.selectionStart = textarea.value.length;
textarea.selectionEnd = textarea.value.length;
autocomplete.refresh();
assert.equal(panel.hidden, false);
assert.equal(panel.children[0].children[0].textContent, "ļtalompa");
assert.equal(panel.children[0].children[2].textContent, "DTS/7 reverb = 0.7");

textarea.value = "dts9";
textarea.selectionStart = textarea.value.length;
textarea.selectionEnd = textarea.value.length;
autocomplete.refresh();
assert.equal(panel.hidden, false);
assert.equal(panel.children[0].children[0].textContent, "ļtalumpa");
assert.equal(panel.children[0].children[2].textContent, "DTS/9 reverb = 0.9");

textarea.value = "alkala:\n  reverb";
textarea.selectionStart = textarea.value.length;
textarea.selectionEnd = textarea.value.length;
autocomplete.refresh();
assert.equal(panel.hidden, false);
assert.equal(panel.children[0].children[0].textContent, "ļtalompa");

textarea.value = "lyala:\n  reverb";
textarea.selectionStart = textarea.value.length;
textarea.selectionEnd = textarea.value.length;
autocomplete.refresh();
assert.equal(panel.hidden, true);

textarea.value = "lyala:\n  fr";
textarea.selectionStart = textarea.value.length;
textarea.selectionEnd = textarea.value.length;
autocomplete.refresh();
assert.equal(panel.hidden, false);
assert.equal(panel.children[0].children[0].textContent, "fřala");

textarea.value = "lyula:\n  tr";
textarea.selectionStart = textarea.value.length;
textarea.selectionEnd = textarea.value.length;
autocomplete.refresh();
assert.equal(panel.hidden, false);
assert.equal(panel.children[0].children[0].textContent, "trala");

textarea.value = "lyula:\n  fřala";
textarea.selectionStart = textarea.value.length;
textarea.selectionEnd = textarea.value.length;
autocomplete.refresh();
assert.equal(panel.hidden, false);
assert.equal(panel.children[0].className, "suggestion inspector");

textarea.value = "lyala:\n  fřala";
textarea.selectionStart = textarea.value.length;
textarea.selectionEnd = textarea.value.length;
autocomplete.refresh();
assert.equal(panel.hidden, false);
assert.equal(panel.children[0].className, "suggestion inspector");
assert.equal(panel.children[0].children[1].textContent, "image / shape · modes image, animation");

textarea.value = "lyala:\n  avtarļa";
textarea.selectionStart = textarea.value.length;
textarea.selectionEnd = textarea.value.length;
autocomplete.refresh();
assert.equal(panel.hidden, false);
assert.equal(panel.children[0].className, "suggestion inspector");
assert.equal(panel.children[0].children[0].textContent, "avtarļa");
assert.equal(panel.children[0].children[2].textContent, "COA coalescent · sculpte la ligne");

textarea.value = "affrala(0.85) ";
textarea.selectionStart = textarea.value.length;
textarea.selectionEnd = textarea.value.length;
autocomplete.refresh();
assert.equal(panel.hidden, true);

console.log("ikal-autocomplete ok");
