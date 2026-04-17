/**
 * Session-wide context passed to every command's run/complete.
 * Created once in main.js.
 */

export function createContext({ term, registry, history, theme }) {
  return {
    term,
    registry,
    history,
    theme,
    state: {
      currentModule: null, // e.g. "experience/acme-corp"
      vars: {},            // user-set variables (theme, PROMPT, VERBOSE, ...)
    },
    /** Convenience to update prompt + state when entering/leaving a module. */
    enterModule(path) {
      this.state.currentModule = path || null;
      updatePrompt(this);
    },
    leaveModule() {
      this.state.currentModule = null;
      updatePrompt(this);
    },
  };
}

export function updatePrompt(ctx) {
  const base = ctx.state.vars.PROMPT || "msf6";
  if (ctx.state.currentModule) {
    // "experience/acme-corp" → "msf6 experience(acme-corp) > "
    const [cat, mod] = ctx.state.currentModule.split("/");
    const label = mod ? `${cat}(${mod})` : cat;
    ctx.term.setPrompt(`${base} ${label} > `);
  } else {
    ctx.term.setPrompt(`${base} > `);
  }
}
