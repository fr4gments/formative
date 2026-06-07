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

const ctrlEnter = keyEvent("Enter", { ctrlKey: true });
assert.equal(autocomplete.handleKeyDown(ctrlEnter), false);
assert.equal(ctrlEnter.prevented, false);

const tab = keyEvent("Tab");
assert.equal(autocomplete.handleKeyDown(tab), true);
assert.equal(tab.prevented, true);
assert.equal(textarea.value, "ačxwuža ");
assert.equal(textarea.selectionStart, "ačxwuža ".length);
assert.equal(panel.hidden, true);

console.log("ikal-autocomplete ok");
