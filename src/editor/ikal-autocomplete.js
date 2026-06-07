import { IKAL_SEED_ROOTS } from "../parser/ithkuil-seed-roots.js";

const TOKEN_DELIMITER = /[\s(),:]/;
const NOOP_AUTOCOMPLETE = {
  handleKeyDown: () => false,
  hide: () => {},
  refresh: () => {},
};

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

function aliasesForRoot(root) {
  const migrationAliases = (root.migrationFrom || []).map(asciiFold);

  return [
    asciiFold(root.form),
    ...migrationAliases,
    ...migrationAliases.map((alias) => alias.replace(/^-+/, "")),
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
    cr: root.cr,
    domain: root.domain,
    family: root.family,
    form: root.form,
    migrationFrom: root.migrationFrom || [],
    score,
    sense: root.sense,
  };
}

export function suggestIkalWords(query, {
  limit = 8,
  roots = IKAL_SEED_ROOTS,
} = {}) {
  const foldedQuery = asciiFold(query.trim());

  if (!foldedQuery) {
    return [];
  }

  return roots
    .map((root) => suggestionFromRoot(root, scoreRoot(root, foldedQuery)))
    .filter((suggestion) => suggestion.score > 0)
    .sort((a, b) => b.score - a.score || a.form.localeCompare(b.form))
    .slice(0, limit);
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

function createSuggestionRow(doc, suggestion, index, selected) {
  const row = doc.createElement("button");
  const form = doc.createElement("span");
  const meta = doc.createElement("span");
  const sense = doc.createElement("span");

  row.type = "button";
  row.className = "suggestion" + (selected ? " selected" : "");
  row.dataset.index = String(index);
  row.setAttribute("role", "option");
  row.setAttribute("aria-selected", selected ? "true" : "false");

  form.className = "suggestion-form";
  form.textContent = suggestion.form;

  meta.className = "suggestion-meta";
  meta.textContent = suggestion.domain + " / " + suggestion.family;

  sense.className = "suggestion-sense";
  sense.textContent = suggestion.sense;

  row.append(form, meta, sense);
  return row;
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
    selectedIndex: 0,
    suggestions: [],
    token: null,
  };

  textarea.setAttribute("aria-autocomplete", "list");
  textarea.setAttribute("aria-expanded", "false");
  panel.setAttribute("role", "listbox");

  function hide() {
    state.open = false;
    state.suggestions = [];
    state.token = null;
    panel.hidden = true;
    panel.replaceChildren();
    textarea.setAttribute("aria-expanded", "false");
  }

  function render() {
    panel.replaceChildren();

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

  function refresh() {
    const caret = typeof textarea.selectionStart === "number"
      ? textarea.selectionStart
      : textarea.value.length;
    const token = completionTokenAt(textarea.value, caret);

    if (!token.text) {
      hide();
      return;
    }

    const suggestions = suggestIkalWords(token.text, { limit, roots })
      .filter((suggestion) => !isCanonicalExactToken(token, suggestion));

    if (suggestions.length === 0) {
      hide();
      return;
    }

    state.open = true;
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
