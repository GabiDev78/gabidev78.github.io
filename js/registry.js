/**
 * CommandRegistry — register, look up, and complete commands.
 *
 * Command shape:
 *   {
 *     name:    'use',                  required, lowercase
 *     aliases: ['u'],                  optional
 *     summary: 'Select a module',      one-liner for `help`
 *     usage:   'use <module-path>',
 *     hidden:  false,                  if true, omitted from bare `help`
 *     group:   'msf' | 'core' | ...    grouping label for `help`
 *     run(ctx, parsed):     async      returns void; prints to ctx.term
 *     complete(ctx, info):  async?     returns string[] candidates
 *     help():                         optional; returns Node/string/Array
 *   }
 *
 * Categories (loaded separately from data/) are also indexed here so
 * `use category/module` can resolve in O(1).
 */

export class CommandRegistry {
  constructor() {
    this._cmds = new Map();    // name -> cmd
    this._aliases = new Map(); // alias -> name
    this._categories = new Map(); // id -> {category, modules: Map<id, module>}
  }

  register(cmd) {
    if (!cmd || !cmd.name) throw new Error("command requires a name");
    const name = cmd.name.toLowerCase();
    if (this._cmds.has(name)) {
      throw new Error(`command already registered: ${name}`);
    }
    this._cmds.set(name, cmd);
    for (const a of cmd.aliases || []) {
      this._aliases.set(a.toLowerCase(), name);
    }
  }

  get(nameOrAlias) {
    if (!nameOrAlias) return null;
    const key = nameOrAlias.toLowerCase();
    if (this._cmds.has(key)) return this._cmds.get(key);
    const aliased = this._aliases.get(key);
    return aliased ? this._cmds.get(aliased) : null;
  }

  all({ includeHidden = false } = {}) {
    const out = [];
    for (const cmd of this._cmds.values()) {
      if (!includeHidden && cmd.hidden) continue;
      out.push(cmd);
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  }

  names({ includeHidden = false, includeAliases = true } = {}) {
    const out = [];
    for (const cmd of this._cmds.values()) {
      if (!includeHidden && cmd.hidden) continue;
      out.push(cmd.name);
    }
    if (includeAliases) {
      for (const alias of this._aliases.keys()) out.push(alias);
    }
    return out.sort();
  }

  /* ---------- Categories ---------- */

  loadCategories(cats) {
    for (const cat of cats) {
      const modMap = new Map();
      for (const mod of cat.modules || []) modMap.set(mod.id, mod);
      this._categories.set(cat.id, { category: cat, modules: modMap });
    }
  }

  getCategory(id) {
    const entry = this._categories.get(id);
    return entry ? entry.category : null;
  }

  getModule(path) {
    if (!path) return null;
    const [catId, modId] = path.split("/");
    const entry = this._categories.get(catId);
    if (!entry) return null;
    if (!modId) return null;
    return entry.modules.get(modId) || null;
  }

  allCategoryIds() {
    return Array.from(this._categories.keys()).sort();
  }

  /** Returns array of "category/module" path strings for completion. */
  allModulePaths() {
    const out = [];
    for (const [catId, entry] of this._categories) {
      for (const modId of entry.modules.keys()) {
        out.push(`${catId}/${modId}`);
      }
    }
    return out.sort();
  }

  /** Search across all modules. Returns [{path, module, score}], best first. */
  searchModules(term) {
    const q = String(term || "").toLowerCase().trim();
    if (!q) return [];
    const results = [];
    for (const [catId, entry] of this._categories) {
      for (const [modId, mod] of entry.modules) {
        const haystack = [
          mod.title || "",
          mod.org || "",
          mod.summary || "",
          (mod.tags || []).join(" "),
          modId,
        ].join(" ").toLowerCase();
        if (haystack.includes(q)) {
          // Heavier weight if title/id matches.
          let score = 1;
          if ((mod.title || "").toLowerCase().includes(q)) score += 3;
          if (modId.toLowerCase().includes(q)) score += 2;
          if ((mod.tags || []).some((t) => t.toLowerCase() === q)) score += 4;
          results.push({ path: `${catId}/${modId}`, module: mod, score });
        }
      }
    }
    return results.sort((a, b) => b.score - a.score);
  }
}
