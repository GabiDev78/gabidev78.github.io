/**
 * Command history with localStorage persistence.
 *
 * - Ring buffer capped at MAX entries
 * - Dedupes consecutive duplicates
 * - Up/Down arrows navigate (via cursor() / prev() / next())
 * - `history` command lists; `!N` re-runs entry N; `!!` re-runs last
 * - `history -c` clears
 */

const KEY = "portfolio.history";
const MAX = 500;

function tryStorageGet() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(-MAX) : [];
  } catch { return []; }
}

function tryStorageSet(arr) {
  try { localStorage.setItem(KEY, JSON.stringify(arr.slice(-MAX))); }
  catch { /* private mode etc — silently no-op */ }
}

function tryStorageClear() {
  try { localStorage.removeItem(KEY); } catch { /* */ }
}

export class History {
  constructor() {
    this._entries = tryStorageGet();
    this._cursor = this._entries.length;   // points one past last
    this._draft = "";                       // text in flight when browsing history
  }

  get all() { return this._entries.slice(); }
  get length() { return this._entries.length; }

  /** Push a new line. Skips empty + consecutive dupes. */
  push(line) {
    const t = String(line || "").trim();
    if (!t) return;
    const last = this._entries[this._entries.length - 1];
    if (t !== last) {
      this._entries.push(t);
      if (this._entries.length > MAX) this._entries.splice(0, this._entries.length - MAX);
      tryStorageSet(this._entries);
    }
    this._cursor = this._entries.length;
    this._draft = "";
  }

  /**
   * Move backward in history.
   * `currentInput` is what's typed at the prompt right now (saved as draft
   * the first time we step back so Down can restore it).
   * Returns the entry to display, or null if no movement possible.
   */
  prev(currentInput) {
    if (this._entries.length === 0) return null;
    if (this._cursor === this._entries.length) {
      this._draft = currentInput || "";
    }
    if (this._cursor === 0) return this._entries[0];
    this._cursor--;
    return this._entries[this._cursor];
  }

  /** Move forward. Returns entry, or "" when stepping past the newest. */
  next() {
    if (this._cursor >= this._entries.length) return null;
    this._cursor++;
    if (this._cursor >= this._entries.length) {
      const draft = this._draft;
      this._draft = "";
      return draft;
    }
    return this._entries[this._cursor];
  }

  /** Reset the cursor (e.g., after the user presses Enter). */
  resetCursor() {
    this._cursor = this._entries.length;
    this._draft = "";
  }

  /** Resolve `!N` (1-based per-display) and `!!` references. */
  expand(line) {
    const t = String(line || "");
    if (t === "!!") return this._entries[this._entries.length - 1] || null;
    const m = t.match(/^!(\d+)$/);
    if (m) {
      const idx = parseInt(m[1], 10) - 1;
      return this._entries[idx] || null;
    }
    return null;
  }

  clear() {
    this._entries = [];
    this._cursor = 0;
    this._draft = "";
    tryStorageClear();
  }
}
