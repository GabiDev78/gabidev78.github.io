/**
 * ThemeManager — applies, persists, and lists themes.
 * Themes are defined in styles/themes.css as [data-theme="..."] blocks.
 */

const KEY = "portfolio.theme";
const DEFAULT = "matrix";
const THEMES = ["matrix", "amber", "dracula", "solarized-dark"];

function tryGet() { try { return localStorage.getItem(KEY); } catch { return null; } }
function trySet(v) { try { localStorage.setItem(KEY, v); } catch { /* */ } }

export class ThemeManager {
  constructor() {
    this._themes = THEMES.slice();
    this._current = DEFAULT;
  }

  /** Decide initial theme from URL > localStorage > default, then apply. */
  init() {
    let chosen = null;
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get("theme");
      if (fromUrl && this._themes.includes(fromUrl)) chosen = fromUrl;
    } catch { /* */ }
    if (!chosen) {
      const stored = tryGet();
      if (stored && this._themes.includes(stored)) chosen = stored;
    }
    this.apply(chosen || DEFAULT, { persist: false });
  }

  apply(name, { persist = true } = {}) {
    const lower = String(name || "").toLowerCase();
    if (!this._themes.includes(lower)) {
      const e = new Error(`unknown theme: ${name}`);
      e.code = "UNKNOWN_THEME";
      throw e;
    }
    document.documentElement.dataset.theme = lower;
    this._current = lower;
    if (persist) trySet(lower);
  }

  current() { return this._current; }
  list() { return this._themes.slice(); }
}
