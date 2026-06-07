import assert from "node:assert/strict";

import {
  asciiFold,
  completionTokenAt,
  createIkalAutocomplete,
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

textarea.value = "affrala(0.85) ";
textarea.selectionStart = textarea.value.length;
textarea.selectionEnd = textarea.value.length;
autocomplete.refresh();
assert.equal(panel.hidden, true);

console.log("ikal-autocomplete ok");
