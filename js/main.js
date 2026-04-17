/**
 * Entry point. Wires DOM → Terminal → Registry → run loop.
 *
 * Top-level dispatch:
 *   runLine(ctx, line) — parse, look up command, execute, print errors.
 */

import { Terminal } from "./terminal.js";
import { CommandRegistry } from "./registry.js";
import { createContext, updatePrompt } from "./context.js";
import { parse } from "./parser.js";
import { History } from "./history.js";
import { ThemeManager } from "./theme.js";
import { handleTab } from "./autocomplete.js";
import { boot } from "./boot.js";
import { setupMobile } from "./mobile.js";
import { registerAllCommands } from "./commands/index.js";
import { CATEGORIES } from "./data/index.js";

const root = document.getElementById("terminal");
const transcript = document.getElementById("transcript");
const inputLine = document.getElementById("input-line");
const promptEl = document.getElementById("prompt");
const displayEl = document.getElementById("input-display");
const cursorEl = document.getElementById("cursor");
const inputEl = document.getElementById("term-input");

const term = new Terminal({
  root, transcript, inputLine,
  promptEl, displayEl, cursorEl, inputEl,
});

const registry = new CommandRegistry();
const history = new History();
const theme = new ThemeManager();
theme.init();

const ctx = createContext({ term, registry, history, theme });

registry.loadCategories(CATEGORIES);
registerAllCommands(registry);
updatePrompt(ctx);

term.onSubmit = async (line) => {
  await runLine(ctx, line);
};

term.onKey = (e) => {
  // History navigation
  if (e.key === "ArrowUp") {
    const prev = history.prev(term.getInputValue());
    if (prev !== null && prev !== undefined) {
      e.preventDefault();
      term.setInputValue(prev);
      // place caret at end
      const n = prev.length;
      inputEl.setSelectionRange(n, n);
    }
    return;
  }
  if (e.key === "ArrowDown") {
    const nxt = history.next();
    if (nxt !== null && nxt !== undefined) {
      e.preventDefault();
      term.setInputValue(nxt);
      const n = nxt.length;
      inputEl.setSelectionRange(n, n);
    }
    return;
  }

  // Ctrl+C — abort current input (just clears the line and echoes ^C)
  if (e.ctrlKey && (e.key === "c" || e.key === "C")) {
    e.preventDefault();
    const partial = term.getInputValue();
    term.echo(promptEl.textContent, partial + "^C");
    term.setInputValue("");
    history.resetCursor();
    return;
  }

  // Ctrl+L — clear
  if (e.ctrlKey && (e.key === "l" || e.key === "L")) {
    e.preventDefault();
    term.clear();
    return;
  }

  // Tab — autocomplete
  if (e.key === "Tab") {
    e.preventDefault();
    handleTab(ctx, term);
    return;
  }
};

setupMobile(term, (cmd) => runLine(ctx, cmd));

// Hide the input line during boot (prevent flash of prompt before banner).
inputLine.style.visibility = "hidden";

(async () => {
  try { await boot(ctx, term); } catch (e) { console.error("boot error", e); }
  inputLine.style.visibility = "";
  term.focus();
})();

/* ---------- Top-level run ---------- */

export async function runLine(ctx, line) {
  // Handle !N / !! history expansion before echoing.
  const expanded = history.expand(line);
  const effective = expanded != null ? expanded : line;
  if (expanded != null) {
    // Show the user what ran (bash-style).
    term.echo(promptEl.textContent, effective);
  } else {
    term.echo(promptEl.textContent, line);
  }

  if (effective.trim() === "") {
    history.resetCursor();
    return;
  }

  history.push(effective);

  const parsed = parse(effective);
  if (!parsed.verb) return;

  const cmd = registry.get(parsed.verb);
  if (!cmd) {
    term.printError(`unknown command: ${parsed.verb}  (try \`help\`)`);
    return;
  }

  try {
    await cmd.run(ctx, parsed);
  } catch (err) {
    console.error(err);
    term.printError(`${parsed.verb}: ${err.message || err}`);
  }
}
