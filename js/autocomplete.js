/**
 * Tab completion, bash-style.
 *
 *  - Parses the current line up to the caret.
 *  - Single token, no trailing space → complete the verb.
 *  - Otherwise → ask the command's complete(ctx, {argIndex, current, args}).
 *  - Single match → replace + trailing space.
 *  - Multiple matches → fill the longest common prefix. On a second Tab
 *    in a row (no other input change), list candidates below.
 *
 * State is held module-local; main.js just calls handleTab(ctx, term).
 */

import { tokenize } from "./parser.js";
import { c, dim, muted, accent } from "./render.js";

let lastTabValue = null;
let lastTabDoubled = false;

export function handleTab(ctx, term) {
  const inputEl = term.inputEl;
  const value = inputEl.value;
  const caret = inputEl.selectionStart ?? value.length;
  const before = value.slice(0, caret);
  const after = value.slice(caret);

  const trailingSpace = /\s$/.test(before);
  const tokens = tokenize(before);

  // Token currently being typed (empty string if we're at/after whitespace).
  const current = trailingSpace ? "" : (tokens[tokens.length - 1] || "");
  const committed = trailingSpace ? tokens : tokens.slice(0, -1);

  let candidates = [];
  if (committed.length === 0) {
    candidates = ctx.registry.names({ includeHidden: false });
  } else {
    const cmd = ctx.registry.get(committed[0]);
    if (cmd?.complete) {
      const args = committed.slice(1);
      const argIndex = args.length; // zero-based index of the arg being typed
      try {
        candidates = cmd.complete(ctx, { argIndex, current, args }) || [];
      } catch { candidates = []; }
    }
  }

  // Filter by prefix.
  const matches = candidates.filter((n) => String(n).startsWith(current));
  if (matches.length === 0) {
    lastTabValue = value;
    lastTabDoubled = false;
    return;
  }

  if (matches.length === 1) {
    applyReplacement(inputEl, before, after, current, matches[0], /*addSpace=*/ true);
    term._renderInput();
    resetTabState();
    return;
  }

  // Multiple: complete to longest common prefix.
  const lcp = longestCommonPrefix(matches);
  if (lcp.length > current.length) {
    applyReplacement(inputEl, before, after, current, lcp, /*addSpace=*/ false);
    term._renderInput();
    lastTabValue = inputEl.value;
    lastTabDoubled = false;
    return;
  }

  // Same as last time (no progress): second Tab lists candidates.
  if (lastTabValue === value && !lastTabDoubled) {
    lastTabDoubled = true;
    // Echo the current input line once (bash-like) then list columns.
    term.echo(term.promptEl.textContent, value);
    const listNode = document.createDocumentFragment();
    const line = document.createElement("div");
    line.textContent = matches.join("   ");
    line.className = "fg-muted";
    listNode.appendChild(line);
    term.print(listNode);
    return;
  }

  lastTabValue = value;
  lastTabDoubled = false;
}

function applyReplacement(inputEl, before, after, current, replacement, addSpace) {
  const beforeBase = before.slice(0, before.length - current.length);
  const tail = addSpace ? " " : "";
  const newValue = beforeBase + replacement + tail + after;
  inputEl.value = newValue;
  const newCaret = (beforeBase + replacement + tail).length;
  inputEl.setSelectionRange(newCaret, newCaret);
}

function longestCommonPrefix(strs) {
  if (!strs.length) return "";
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return "";
    }
  }
  return prefix;
}

function resetTabState() {
  lastTabValue = null;
  lastTabDoubled = false;
}
