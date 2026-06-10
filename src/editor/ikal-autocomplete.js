import { IKAL_SEED_ROOTS } from "../parser/ithkuil-seed-roots.js";
import {
  compatibleModesForSeedRoot,
  modeForDeclaration,
} from "../parser/ikal-mode-compatibility.js";
import {
  DEFAULT_AUDIO_AFFIX_DEGREES,
  IKAL_AUDIO_AFFIX_FORMS,
  audioAffixDefinitionFor,
  formatAudioAffixSignature,
} from "../parser/ikal-audio-affixes.js";
import {
  DEFAULT_VISUAL_AFFIX_DEGREES,
  IKAL_VISUAL_AFFIX_FORMS,
  formatVisualAffixSignature,
  labelForVisualAffixDegree,
  visualAffixDefinitionFor,
} from "../parser/ikal-visual-affixes.js";
import { formatParamSignatureForSeedRoot } from "../parser/ikal-param-signatures.js";

const TOKEN_DELIMITER = /[\s(),:]/;
const NOOP_AUTOCOMPLETE = {
  handleKeyDown: () => false,
  hide: () => {},
  refresh: () => {},
};
const AUDIO_BASE_PRIORITY = ["ļtala", "ačxwuža", "alxrasa", "pswala", "abjala"];
const VISUAL_BASE_PRIORITY = ["avtala", "ufthala", "amzmala", "etçvala", "allwala", "ftala", "špala", "fřala"];
const MODE_HEADER = "mode";

export function asciiFold(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function completionTokenAt(value, caret) {
  const end = Math.max(0, Math.min(caret ?? value.length, value.length));
  let start = end;

  while (start > 0 && !TOKEN_DELIMITER.test(value[start - 1])) {
    start--;
  }

  return {
    end,
    start,
    text: value.slice(start, end),
  };
}

export function modeContextAt(value, caret) {
  const end = Math.max(0, Math.min(caret ?? value.length, value.length));
  const lineStart = value.lastIndexOf("\n", end - 1) + 1;
  const previousLines = value.slice(0, lineStart).replace(/\r\n?/g, "\n").split("\n");
  const currentLine = value.slice(lineStart, end);
  let mode = null;

  for (const line of previousLines) {
    const trimmed = line.trim();
    const header = trimmed.endsWith(":") ? trimmed.slice(0, -1) : "";
    const declared = modeForDeclaration(header);

    if (declared && trimmed === header + ":") {
      mode = declared;
    }
  }

  if (mode && currentLine.length > 0 && !/^\s/.test(currentLine)) {
    return {
      implicit: false,
      mode: MODE_HEADER,
    };
  }

  if (mode) {
    return {
      implicit: false,
      mode,
    };
  }

  return {
    implicit: true,
    mode: null,
  };
}

function inspectionTokenAt(value, caret) {
  const end = Math.max(0, Math.min(caret ?? value.length, value.length));
  const lineStart = value.lastIndexOf("\n", end - 1) + 1;
  let depth = 0;
  let start = null;

  for (let i = lineStart; i < end; i++) {
    const char = value[i];

    if (start === null) {
      if (/\s/.test(char)) {
        continue;
      }

      start = i;
      depth = 0;
    }

    if (char === "(") {
      depth++;
    } else if (char === ")") {
      depth = Math.max(0, depth - 1);
    } else if (/\s/.test(char) && depth === 0) {
      start = null;
    }
  }

  if (start === null) {
    return {
      end,
      start: end,
      text: "",
    };
  }

  const raw = value.slice(start, end);
  const open = raw.indexOf("(");
  const text = open >= 0 ? raw.slice(0, open) : raw;

  return {
    end,
    start,
    text,
  };
}

function aliasesForRoot(root) {
  const migrationAliases = (root.migrationFrom || []).map(asciiFold);
  const searchAliases = (root.aliases || []).map(asciiFold);

  return [
    asciiFold(root.form),
    ...migrationAliases,
    ...migrationAliases.map((alias) => alias.replace(/^-+/, "")),
    ...searchAliases,
  ];
}

function scoreRoot(root, query) {
  const foldedForm = asciiFold(root.form);
  const foldedCr = asciiFold(root.cr);
  const aliases = aliasesForRoot(root);
  const foldedFamily = asciiFold(root.family);
  const foldedSense = asciiFold(root.sense);

  if (root.form === query) {
    return 1000;
  }

  if (foldedForm === query) {
    return 900;
  }

  if (aliases.includes(query)) {
    return 850;
  }

  if (foldedForm.startsWith(query)) {
    return 700 - foldedForm.length / 100;
  }

  if (aliases.some((alias) => alias.startsWith(query))) {
    return 650;
  }

  if (foldedCr.startsWith(query)) {
    return 520;
  }

  if (foldedForm.includes(query)) {
    return 430;
  }

  if (foldedFamily.includes(query)) {
    return 320;
  }

  if (foldedSense.includes(query)) {
    return 220;
  }

  return 0;
}

function suggestionFromRoot(root, score) {
  return {
    compatibleModes: compatibleModesForSeedRoot(root),
    cr: root.cr,
    domain: root.domain,
    family: root.family,
    form: root.form,
    migrationFrom: root.migrationFrom || [],
    paramSignature: formatParamSignatureForSeedRoot(root),
    score,
    sense: root.sense,
  };
}

function isCompletableAudioForm(form) {
  return !form.slotVAffixes
    && (form.slotVIIAffixes?.length || 0) > 0
    && (form.slotVIIAffixes?.length || 0) <= 3
    && !form.kind?.startsWith("diagnostic");
}

function baseRootForAudioForm(form, roots) {
  return roots.find((root) => root.form === form.baseForm);
}

function aliasesForAudioForm(form) {
  const affixes = form.slotVIIAffixes || [];
  const labels = affixes
    .map((affix) => audioAffixDefinitionFor(affix))
    .filter(Boolean)
    .flatMap((definition) => [
      definition.abbreviation,
      definition.id,
      definition.label,
      definition.abbreviation + String(affixes.find((affix) => audioAffixDefinitionFor(affix) === definition)?.degree || ""),
      definition.id + String(affixes.find((affix) => audioAffixDefinitionFor(affix) === definition)?.degree || ""),
      definition.label + String(affixes.find((affix) => audioAffixDefinitionFor(affix) === definition)?.degree || ""),
    ]);
  const compactAffixes = affixes
    .map((affix) => {
      const definition = audioAffixDefinitionFor(affix);

      return definition ? definition.abbreviation + String(affix.degree) : "";
    })
    .join("");
  const compactLabels = affixes
    .map((affix) => audioAffixDefinitionFor(affix)?.id || "")
    .join("");
  const base = asciiFold(form.baseForm || "");

  return [
    asciiFold(form.form),
    base + compactAffixes.toLowerCase(),
    base + "+" + compactAffixes.toLowerCase(),
    base + compactLabels.toLowerCase(),
    ...labels.map(asciiFold),
  ].filter(Boolean);
}

function isDefaultDegreeAudioForm(form) {
  return (form.slotVIIAffixes || []).every((affix) => {
    const definition = audioAffixDefinitionFor(affix);

    return definition && DEFAULT_AUDIO_AFFIX_DEGREES[definition.abbreviation] === affix.degree;
  });
}

function scoreAudioForm(form, query) {
  const foldedForm = asciiFold(form.form);
  const aliases = aliasesForAudioForm(form);
  const defaultBoost = isDefaultDegreeAudioForm(form) ? 20 : 0;
  const singleBoost = (form.slotVIIAffixes?.length || 0) === 1 ? 30 : 0;

  if (form.form === query) {
    return 980 + defaultBoost;
  }

  if (foldedForm === query) {
    return 880 + defaultBoost;
  }

  if (aliases.includes(query)) {
    return 760 + defaultBoost + singleBoost;
  }

  if (foldedForm.startsWith(query)) {
    return 600 + defaultBoost - foldedForm.length / 100;
  }

  if (aliases.some((alias) => alias.startsWith(query))) {
    return 640 + defaultBoost + singleBoost;
  }

  if (foldedForm.includes(query)) {
    return 420 + defaultBoost;
  }

  return 0;
}

function audioBaseRank(form) {
  const index = AUDIO_BASE_PRIORITY.indexOf(form.baseForm);

  return index >= 0 ? index : AUDIO_BASE_PRIORITY.length;
}

function suggestionFromAudioForm(form, roots, score) {
  const baseRoot = baseRootForAudioForm(form, roots);
  const signature = formatAudioAffixSignature(form.slotVIIAffixes);

  return {
    compatibleModes: ["music"],
    cr: baseRoot?.cr || "",
    domain: baseRoot?.domain || "music",
    family: baseRoot?.family || "audio-affix",
    form: form.form,
    migrationFrom: [],
    paramSignature: signature,
    score,
    sortRank: audioBaseRank(form),
    sense: (baseRoot?.sense || "sound") + " + " + signature,
  };
}

function isCompletableVisualForm(form) {
  return !form.slotVAffixes
    && (form.slotVIIAffixes?.length || 0) > 0
    && (form.slotVIIAffixes?.length || 0) <= 2
    && !form.kind?.startsWith("diagnostic");
}

function baseRootForVisualForm(form, roots) {
  return roots.find((root) => root.form === form.baseForm);
}

function aliasesForVisualForm(form) {
  const affixes = form.slotVIIAffixes || [];
  const labels = affixes
    .map((affix) => visualAffixDefinitionFor(affix))
    .filter(Boolean)
    .flatMap((definition) => {
      const degree = affixes.find((affix) => visualAffixDefinitionFor(affix) === definition)?.degree || "";
      const label = degree ? labelForVisualAffixDegree(definition, degree) : definition.label;

      return [
        definition.abbreviation,
        ...(definition.aliases || []),
        definition.id,
        definition.label,
        label,
        definition.abbreviation + String(degree),
        definition.id + String(degree),
      ];
    });
  const compactAffixes = affixes
    .map((affix) => {
      const definition = visualAffixDefinitionFor(affix);

      return definition ? definition.abbreviation + String(affix.degree) : "";
    })
    .join("");
  const compactLabels = affixes
    .map((affix) => visualAffixDefinitionFor(affix)?.id || "")
    .join("");
  const base = asciiFold(form.baseForm || "");

  return [
    asciiFold(form.form),
    base + compactAffixes.toLowerCase(),
    base + "+" + compactAffixes.toLowerCase(),
    base + compactLabels.toLowerCase(),
    ...labels.map(asciiFold),
  ].filter(Boolean);
}

function isDefaultDegreeVisualForm(form) {
  return (form.slotVIIAffixes || []).every((affix) => {
    const definition = visualAffixDefinitionFor(affix);

    return definition && DEFAULT_VISUAL_AFFIX_DEGREES[definition.abbreviation] === affix.degree;
  });
}

function scoreVisualForm(form, query) {
  const foldedForm = asciiFold(form.form);
  const aliases = aliasesForVisualForm(form);
  const defaultBoost = isDefaultDegreeVisualForm(form) ? 20 : 0;
  const singleBoost = (form.slotVIIAffixes?.length || 0) === 1 ? 30 : 0;

  if (form.form === query) {
    return 975 + defaultBoost;
  }

  if (foldedForm === query) {
    return 875 + defaultBoost;
  }

  if (aliases.includes(query)) {
    return 750 + defaultBoost + singleBoost;
  }

  if (foldedForm.startsWith(query)) {
    return 590 + defaultBoost - foldedForm.length / 100;
  }

  if (aliases.some((alias) => alias.startsWith(query))) {
    return 630 + defaultBoost + singleBoost;
  }

  if (foldedForm.includes(query)) {
    return 410 + defaultBoost;
  }

  return 0;
}

function visualBaseRank(form) {
  const index = VISUAL_BASE_PRIORITY.indexOf(form.baseForm);

  return index >= 0 ? index : VISUAL_BASE_PRIORITY.length;
}

function suggestionFromVisualForm(form, roots, score) {
  const baseRoot = baseRootForVisualForm(form, roots);
  const signature = formatVisualAffixSignature(form.slotVIIAffixes);

  return {
    compatibleModes: ["image", "animation"],
    cr: baseRoot?.cr || "",
    domain: baseRoot?.domain || "image",
    family: baseRoot?.family || "visual-affix",
    form: form.form,
    migrationFrom: [],
    paramSignature: signature,
    score,
    sortRank: visualBaseRank(form),
    sense: (baseRoot?.sense || "image") + " + " + signature,
  };
}

export function suggestIkalWords(query, {
  limit = 8,
  mode = null,
  roots = IKAL_SEED_ROOTS,
} = {}) {
  const foldedQuery = asciiFold(query.trim());

  if (!foldedQuery) {
    return [];
  }

  if (mode && hasIncompatibleExactRootMatch(foldedQuery, query.trim(), roots, mode)) {
    return [];
  }

  const rootSuggestions = roots
    .map((root) => suggestionFromRoot(root, scoreRoot(root, foldedQuery)))
    .filter((suggestion) => suggestion.score > 0)
    .filter((suggestion) => suggestionCompatibleWithMode(suggestion, mode));
  const audioSuggestions = IKAL_AUDIO_AFFIX_FORMS
    .filter(isCompletableAudioForm)
    .map((form) => suggestionFromAudioForm(form, roots, scoreAudioForm(form, foldedQuery)))
    .filter((suggestion) => suggestion.score > 0)
    .filter((suggestion) => suggestionCompatibleWithMode(suggestion, mode));
  const visualSuggestions = IKAL_VISUAL_AFFIX_FORMS
    .filter(isCompletableVisualForm)
    .map((form) => suggestionFromVisualForm(form, roots, scoreVisualForm(form, foldedQuery)))
    .filter((suggestion) => suggestion.score > 0)
    .filter((suggestion) => suggestionCompatibleWithMode(suggestion, mode));

  return [...rootSuggestions, ...audioSuggestions, ...visualSuggestions]
    .sort((a, b) => b.score - a.score || (a.sortRank || 0) - (b.sortRank || 0) || a.form.localeCompare(b.form))
    .slice(0, limit);
}

function suggestionCompatibleWithMode(suggestion, mode) {
  if (!mode) {
    return true;
  }

  return suggestion.compatibleModes?.includes(mode);
}

function hasIncompatibleExactRootMatch(foldedQuery, query, roots, mode) {
  return roots.some((root) => {
    const exact = root.form === query || asciiFold(root.form) === foldedQuery;

    return exact && !compatibleModesForSeedRoot(root).includes(mode);
  });
}

export function replaceCompletionToken(value, token, form) {
  const next = value[token.end] || "";
  const suffix = next && /[\s),:]/.test(next) ? "" : " ";
  const replacement = form + suffix;
  const nextValue = value.slice(0, token.start) + replacement + value.slice(token.end);
  const caret = token.start + replacement.length;

  return {
    caret,
    value: nextValue,
  };
}

function isCanonicalExactToken(token, suggestion) {
  return token.text === suggestion.form;
}

function previousCompletionTokenBefore(value, end) {
  let tokenEnd = Math.max(0, Math.min(end, value.length));

  while (tokenEnd > 0 && /\s/.test(value[tokenEnd - 1])) {
    tokenEnd--;
  }

  let tokenStart = tokenEnd;

  while (tokenStart > 0 && !TOKEN_DELIMITER.test(value[tokenStart - 1])) {
    tokenStart--;
  }

  return {
    end: tokenEnd,
    start: tokenStart,
    text: value.slice(tokenStart, tokenEnd),
  };
}

function createSuggestionRow(doc, suggestion, index, selected) {
  const row = doc.createElement("button");
  const form = doc.createElement("span");
  const meta = doc.createElement("span");
  const signature = doc.createElement("span");
  const sense = doc.createElement("span");

  row.type = "button";
  row.className = "suggestion" + (selected ? " selected" : "");
  row.dataset.index = String(index);
  row.setAttribute("role", "option");
  row.setAttribute("aria-selected", selected ? "true" : "false");

  form.className = "suggestion-form";
  form.textContent = suggestion.form;

  meta.className = "suggestion-meta";
  meta.textContent = suggestionMeta(suggestion);

  signature.className = "suggestion-signature";
  signature.textContent = suggestion.paramSignature;
  signature.hidden = !suggestion.paramSignature;

  sense.className = "suggestion-sense";
  sense.textContent = suggestion.sense;

  row.append(form, meta, signature, sense);
  return row;
}

function createInspectorRow(doc, suggestion) {
  const row = doc.createElement("div");
  const form = doc.createElement("span");
  const meta = doc.createElement("span");
  const signature = doc.createElement("span");
  const sense = doc.createElement("span");

  row.className = "suggestion inspector";

  form.className = "suggestion-form";
  form.textContent = suggestion.form;

  meta.className = "suggestion-meta";
  meta.textContent = suggestionMeta(suggestion);

  signature.className = "suggestion-signature";
  signature.textContent = suggestion.paramSignature;

  sense.className = "suggestion-sense";
  sense.textContent = suggestion.sense;

  row.append(form, meta, signature, sense);
  return row;
}

function suggestionMeta(suggestion) {
  const modes = suggestion.compatibleModes?.length
    ? " · modes " + suggestion.compatibleModes.join(", ")
    : "";

  return suggestion.domain + " / " + suggestion.family + modes;
}

export function createIkalAutocomplete({
  limit = 7,
  panel,
  roots = IKAL_SEED_ROOTS,
  textarea,
} = {}) {
  if (!textarea || !panel) {
    return NOOP_AUTOCOMPLETE;
  }

  const doc = panel.ownerDocument || document;
  const state = {
    open: false,
    inspecting: null,
    selectedIndex: 0,
    suggestions: [],
    token: null,
  };

  textarea.setAttribute("aria-autocomplete", "list");
  textarea.setAttribute("aria-expanded", "false");
  panel.setAttribute("role", "listbox");

  function hide() {
    state.open = false;
    state.inspecting = null;
    state.suggestions = [];
    state.token = null;
    panel.hidden = true;
    panel.replaceChildren();
    textarea.setAttribute("aria-expanded", "false");
  }

  function render() {
    panel.replaceChildren();

    if (state.inspecting) {
      panel.append(createInspectorRow(doc, state.inspecting));
      panel.hidden = false;
      textarea.setAttribute("aria-expanded", "true");
      return;
    }

    for (let i = 0; i < state.suggestions.length; i++) {
      const row = createSuggestionRow(doc, state.suggestions[i], i, i === state.selectedIndex);

      row.addEventListener("mousedown", (event) => {
        event.preventDefault();
        state.selectedIndex = i;
        acceptSelected();
      });

      panel.append(row);
    }

    panel.hidden = false;
    textarea.setAttribute("aria-expanded", "true");
  }

  function showInspectionForCaret(caret, mode = null) {
    const inspectionToken = inspectionTokenAt(textarea.value, caret);
    const inspection = suggestIkalWords(inspectionToken.text, { limit: 1, mode, roots })
      .find((suggestion) => isCanonicalExactToken(inspectionToken, suggestion));

    if (!inspection) {
      return false;
    }

    state.open = false;
    state.inspecting = inspection;
    state.suggestions = [];
    state.token = inspectionToken;
    render();
    return true;
  }

  function normalizeDetachedOpeningParen(caret, mode = null) {
    const value = textarea.value;

    if (caret <= 1 || value[caret - 1] !== "(" || !/\s/.test(value[caret - 2])) {
      return caret;
    }

    let gapStart = caret - 1;

    while (gapStart > 0 && /\s/.test(value[gapStart - 1])) {
      gapStart--;
    }

    const previousToken = previousCompletionTokenBefore(value, gapStart);
    const inspection = suggestIkalWords(previousToken.text, { limit: 1, mode, roots })
      .find((suggestion) => isCanonicalExactToken(previousToken, suggestion));

    if (!inspection?.paramSignature) {
      return caret;
    }

    const removed = (caret - 1) - gapStart;
    const nextCaret = caret - removed;

    textarea.value = value.slice(0, gapStart) + value.slice(caret - 1);
    textarea.selectionStart = nextCaret;
    textarea.selectionEnd = nextCaret;
    return nextCaret;
  }

  function refresh() {
    let caret = typeof textarea.selectionStart === "number"
      ? textarea.selectionStart
      : textarea.value.length;

    const modeContext = modeContextAt(textarea.value, caret);
    caret = normalizeDetachedOpeningParen(caret, modeContext.mode);
    const token = completionTokenAt(textarea.value, caret);

    if (!token.text) {
      if (showInspectionForCaret(caret, modeContext.mode)) {
        return;
      }

      hide();
      return;
    }

    const candidates = suggestIkalWords(token.text, { limit, mode: modeContext.mode, roots });
    const exact = candidates.find((suggestion) => isCanonicalExactToken(token, suggestion));
    const suggestions = candidates.filter((suggestion) => !isCanonicalExactToken(token, suggestion));

    if (exact) {
      state.open = false;
      state.inspecting = exact;
      state.suggestions = [];
      state.token = token;
      render();
      return;
    }

    if (suggestions.length === 0) {
      if (showInspectionForCaret(caret, modeContext.mode)) {
        return;
      }

      hide();
      return;
    }

    state.open = true;
    state.inspecting = null;
    state.selectedIndex = 0;
    state.suggestions = suggestions;
    state.token = token;
    render();
  }

  function acceptSelected() {
    const suggestion = state.suggestions[state.selectedIndex];
    const token = state.token;

    if (!suggestion || !token) {
      return false;
    }

    const next = replaceCompletionToken(textarea.value, token, suggestion.form);
    textarea.value = next.value;
    textarea.selectionStart = next.caret;
    textarea.selectionEnd = next.caret;
    hide();
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  }

  function moveSelection(delta) {
    const count = state.suggestions.length;

    if (count === 0) {
      return;
    }

    state.selectedIndex = (state.selectedIndex + delta + count) % count;
    render();
  }

  function handleKeyDown(event) {
    if (state.inspecting) {
      if (event.key === "Escape") {
        event.preventDefault();
        hide();
        return true;
      }

      return false;
    }

    if (!state.open && event.key === "ArrowDown") {
      refresh();

      if (!state.open) {
        return false;
      }
    }

    if (!state.open) {
      return false;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveSelection(1);
      return true;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveSelection(-1);
      return true;
    }

    if (event.key === "Tab" || (event.key === "Enter" && !event.ctrlKey && !event.metaKey)) {
      event.preventDefault();
      return acceptSelected();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      hide();
      return true;
    }

    return false;
  }

  textarea.addEventListener("input", refresh);
  textarea.addEventListener("click", refresh);
  textarea.addEventListener("keyup", (event) => {
    if (!["ArrowDown", "ArrowUp", "Tab", "Enter", "Escape"].includes(event.key)) {
      refresh();
    }
  });

  hide();

  return {
    handleKeyDown,
    hide,
    refresh,
  };
}
