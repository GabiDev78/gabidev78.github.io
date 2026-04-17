/**
 * msfconsole-style module verbs.
 *
 *   use <category[/module]>     — "enter" a module; prompt updates
 *   show [options|info|modules] — context-sensitive listing
 *   info <path>                 — one-shot module detail
 *   search <term>               — grep module titles/tags/summaries
 *   set <KEY> <VALUE>           — session var; special keys have hooks
 *   unset <KEY>                 — delete a var
 *   back                        — leave the current module
 *   run / exploit               — context-sensitive: opens link, mails, downloads
 *
 * Rendering helpers at the bottom keep the command bodies readable.
 */

import { c, accent, accent2, bold, dim, muted, link, red, yellow, cyan, green } from "../render.js";
import { skills as skillsData } from "../data/skills.js";

export function registerMsfCommands(registry) {
  registry.register({
    name: "use",
    group: "msf",
    summary: "Select a module (category or category/module)",
    usage: "use <category[/module]>",
    run(ctx, { args }) {
      if (args.length === 0) {
        ctx.term.printError("use: missing module path");
        ctx.term.print(c`${dim("example:")} ${accent("use experience/placeholder-role")}`);
        return;
      }
      const path = args[0];
      const [catId, modId] = path.split("/");

      const cat = registry.getCategory(catId);
      if (!cat) {
        ctx.term.printError(`unknown category: ${catId}`);
        ctx.term.print(c`${dim("available:")} ${registry.allCategoryIds().join(", ")}`);
        return;
      }

      if (!modId) {
        // Entering a category (no specific module yet).
        ctx.enterModule(catId);
        ctx.term.printInfo(`selected category: ${catId}`);
        ctx.term.println();
        // Render the category's content inline so visitors see something
        // immediately instead of having to know to type `show` next.
        if (catId === "about") {
          // Single-module category — render the bio directly.
          renderModuleDetail(ctx, "about/me");
          ctx.term.println();
          ctx.term.print(c`${dim("tip:")} ${accent("contact")} ${dim("·")} ${accent("download cv")} ${dim("·")} ${accent("back")}`);
        } else if (catId === "skills") {
          renderSkills(ctx);
        } else {
          renderCategoryListing(ctx, catId);
        }
        return;
      }

      const mod = registry.getModule(`${catId}/${modId}`);
      if (!mod) {
        ctx.term.printError(`unknown module: ${catId}/${modId}`);
        const paths = registry.allModulePaths().filter((p) => p.startsWith(catId + "/"));
        if (paths.length) {
          ctx.term.print(c`${dim("modules in")} ${accent(catId)}${dim(":")} ${paths.map((p) => p.split("/")[1]).join(", ")}`);
        }
        return;
      }
      ctx.enterModule(`${catId}/${modId}`);
      ctx.term.printInfo(`module: ${catId}/${modId}`);
      ctx.term.println();
      // Render the module's detail so the visitor sees it immediately.
      renderModuleDetail(ctx, `${catId}/${modId}`);
    },
    complete(ctx, { argIndex, current }) {
      if (argIndex > 0) return [];
      const paths = registry.allModulePaths();
      const cats = registry.allCategoryIds();
      // Complete to "category" or "category/module" based on slash position.
      return [...cats, ...paths];
    },
  });

  registry.register({
    name: "show",
    group: "msf",
    summary: "List categories/modules or show module detail",
    usage: "show [modules|info|options|<category>]",
    run(ctx, { args }) {
      const sub = args[0];

      // Inside a module with no sub: show its detail.
      if (!sub && ctx.state.currentModule) {
        const parts = ctx.state.currentModule.split("/");
        if (parts.length === 1) {
          // Inside a category only — list its modules.
          renderCategoryListing(ctx, parts[0]);
          return;
        }
        renderModuleDetail(ctx, ctx.state.currentModule);
        return;
      }

      // Bare `show` at root: list categories as an msf-style table.
      if (!sub) {
        renderRootListing(ctx);
        return;
      }

      // `show modules` — everything flat.
      if (sub === "modules") {
        renderAllModules(ctx);
        return;
      }

      // `show options` — current session vars.
      if (sub === "options") {
        renderOptions(ctx);
        return;
      }

      // `show info` — if inside a module.
      if (sub === "info") {
        if (!ctx.state.currentModule || !ctx.state.currentModule.includes("/")) {
          ctx.term.printError("show info: no module selected (use `use <cat>/<mod>` first)");
          return;
        }
        renderModuleDetail(ctx, ctx.state.currentModule);
        return;
      }

      // `show <category>` — list that category's modules.
      if (registry.getCategory(sub)) {
        renderCategoryListing(ctx, sub);
        return;
      }

      ctx.term.printError(`show: unknown argument: ${sub}`);
      ctx.term.print(c`${dim("try:")} ${accent("show")}${dim(",")} ${accent("show modules")}${dim(",")} ${accent("show options")}${dim(", or")} ${accent("show <category>")}`);
    },
    complete(ctx, { argIndex }) {
      if (argIndex > 0) return [];
      const cats = registry.allCategoryIds();
      return ["modules", "options", "info", ...cats];
    },
  });

  registry.register({
    name: "info",
    group: "msf",
    summary: "Show module details (one-shot; doesn't change prompt)",
    usage: "info <category/module>",
    run(ctx, { args }) {
      if (args.length === 0) {
        if (ctx.state.currentModule && ctx.state.currentModule.includes("/")) {
          renderModuleDetail(ctx, ctx.state.currentModule);
          return;
        }
        ctx.term.printError("info: missing module path");
        return;
      }
      const path = args[0];
      if (!path.includes("/")) {
        // Treat as category = list its modules.
        if (registry.getCategory(path)) { renderCategoryListing(ctx, path); return; }
        ctx.term.printError(`info: unknown: ${path}`);
        return;
      }
      const mod = registry.getModule(path);
      if (!mod) { ctx.term.printError(`info: unknown module: ${path}`); return; }
      renderModuleDetail(ctx, path);
    },
    complete(ctx, { argIndex }) {
      if (argIndex > 0) return [];
      return [...registry.allCategoryIds(), ...registry.allModulePaths()];
    },
  });

  registry.register({
    name: "search",
    group: "msf",
    summary: "Search modules by title, tag, or summary",
    usage: "search <term>",
    run(ctx, { args }) {
      if (args.length === 0) {
        ctx.term.printError("search: missing query");
        return;
      }
      const q = args.join(" ");
      const results = registry.searchModules(q);
      if (results.length === 0) {
        ctx.term.print(c`${muted(`no matches for "${q}"`)}`);
        return;
      }
      const rows = results.map(({ path, module }, i) => [
        String(i).padStart(3, " "),
        path,
        (module.tags || []).join(", "),
        module.title || "",
      ]);
      ctx.term.printTable(rows, { headers: ["#", "path", "tags", "title"] });
      ctx.term.print(c`${dim(`${results.length} match(es). Run`)} ${accent(`use ${results[0].path}`)} ${dim("to enter one.")}`);
    },
  });

  registry.register({
    name: "back",
    group: "msf",
    summary: "Leave the current module",
    usage: "back",
    run(ctx) {
      if (!ctx.state.currentModule) {
        ctx.term.print(c`${muted("(not inside a module)")}`);
        return;
      }
      const was = ctx.state.currentModule;
      ctx.leaveModule();
      ctx.term.printInfo(`left ${was}`);
    },
  });

  registry.register({
    name: "set",
    group: "msf",
    summary: "Set a session variable (special: theme, PROMPT)",
    usage: "set <KEY> <VALUE>",
    run(ctx, { args }) {
      if (args.length < 2) {
        ctx.term.printError("set: usage: set <KEY> <VALUE>");
        return;
      }
      const [key, ...rest] = args;
      const value = rest.join(" ");

      // Hooks for special keys.
      if (key.toLowerCase() === "theme") {
        try {
          ctx.theme.apply(value);
          ctx.term.print(c`${accent2("[+]")} theme set to ${accent(ctx.theme.current())}`);
        } catch (err) {
          ctx.term.printError(`unknown theme: ${value}`);
          ctx.term.print(c`${dim("available:")} ${ctx.theme.list().join(", ")}`);
        }
        ctx.state.vars[key] = value;
        return;
      }

      if (key === "PROMPT") {
        ctx.state.vars.PROMPT = value;
        // Trigger prompt rerender.
        import("../context.js").then(({ updatePrompt }) => updatePrompt(ctx));
        ctx.term.print(c`${accent2("[+]")} PROMPT = ${accent(value)}`);
        return;
      }

      ctx.state.vars[key] = value;
      ctx.term.print(c`${accent2("[+]")} ${accent(key)} = ${value}`);
    },
    complete(ctx, { argIndex, args }) {
      if (argIndex === 0) return ["theme", "PROMPT", "VERBOSE"];
      if (argIndex === 1 && (args[0] || "").toLowerCase() === "theme") return ctx.theme.list();
      return [];
    },
  });

  registry.register({
    name: "unset",
    group: "msf",
    summary: "Remove a session variable",
    usage: "unset <KEY>",
    run(ctx, { args }) {
      if (args.length === 0) { ctx.term.printError("unset: usage: unset <KEY>"); return; }
      const key = args[0];
      if (!(key in ctx.state.vars)) {
        ctx.term.print(c`${muted(`(${key} not set)`)}`);
        return;
      }
      delete ctx.state.vars[key];
      ctx.term.print(c`${accent2("[+]")} unset ${accent(key)}`);
    },
    complete(ctx, { argIndex }) {
      if (argIndex === 0) return Object.keys(ctx.state.vars);
      return [];
    },
  });

  registry.register({
    name: "run",
    aliases: ["exploit"],
    group: "msf",
    summary: "Fire the current module's default action (open link / mail / download)",
    usage: "run",
    run(ctx) {
      const path = ctx.state.currentModule;
      if (!path) {
        ctx.term.print(c`${muted("no module loaded. try")} ${accent("use <category/module>")} ${muted("first.")}`);
        return;
      }
      if (!path.includes("/")) {
        ctx.term.print(c`${muted(`inside category "${path}" only. use \`use ${path}/<id>\` to target a module.`)}`);
        return;
      }
      const mod = registry.getModule(path);
      if (!mod) { ctx.term.printError(`run: module not found: ${path}`); return; }

      // Pick default payload: first external link, else the category hook.
      const firstLink = (mod.links || [])[0];
      if (firstLink && firstLink.url) {
        ctx.term.printInfo(`opening ${firstLink.url}`);
        window.open(firstLink.url, "_blank", "noopener,noreferrer");
        return;
      }
      ctx.term.print(c`${yellow("[-]")} no payload configured on ${path}`);
    },
  });
}

/* ============== rendering helpers ============== */

function renderRootListing(ctx) {
  const rows = [];
  for (const id of ctx.registry.allCategoryIds()) {
    const cat = ctx.registry.getCategory(id);
    const count = (cat.modules || cat.groups || []).length;
    const label = cat.label || id;
    rows.push([id, String(count), label]);
  }
  ctx.term.print(c`${bold(accent("Categories"))}`);
  ctx.term.printTable(rows, { headers: ["id", "n", "label"] });
  ctx.term.print(c`${dim("use")} ${accent("use <id>")} ${dim("to enter a category, then")} ${accent("show")} ${dim("to list modules.")}`);
}

function renderCategoryListing(ctx, catId) {
  const cat = ctx.registry.getCategory(catId);
  if (!cat) { ctx.term.printError(`unknown category: ${catId}`); return; }

  // Skills is grouped (no "modules"), render its own table.
  if (catId === "skills" && cat.groups) {
    renderSkills(ctx, cat);
    return;
  }

  const rows = (cat.modules || []).map((m, i) => [
    String(i).padStart(3, " "),
    m.id,
    m.period || "",
    (m.tags || []).slice(0, 3).join(", "),
    m.title || "",
  ]);
  ctx.term.print(c`${bold(accent(cat.label || catId))}  ${muted(`(${rows.length})`)}`);
  ctx.term.printTable(rows, { headers: ["#", "id", "period", "tags", "title"] });
  ctx.term.print(c`${dim("use")} ${accent(`use ${catId}/<id>`)} ${dim("or")} ${accent(`info ${catId}/<id>`)} ${dim("to inspect.")}`);
}

function renderAllModules(ctx) {
  const paths = ctx.registry.allModulePaths();
  const rows = paths.map((p, i) => {
    const m = ctx.registry.getModule(p);
    return [
      String(i).padStart(3, " "),
      p,
      (m?.tags || []).slice(0, 3).join(", "),
      m?.title || "",
    ];
  });
  ctx.term.printTable(rows, { headers: ["#", "path", "tags", "title"] });
}

function renderModuleDetail(ctx, path) {
  const mod = ctx.registry.getModule(path);
  if (!mod) { ctx.term.printError(`unknown module: ${path}`); return; }

  // Header line matches msfconsole "Module Information" style.
  ctx.term.print(c`${bold(accent("Module"))} ${dim("::")} ${cyan(path)}`);
  ctx.term.println();

  // Key/value block
  const kv = [];
  if (mod.title) kv.push(["name", mod.title]);
  if (mod.org) kv.push(["org", mod.org]);
  if (mod.period) kv.push(["period", mod.period]);
  if (mod.location) kv.push(["location", mod.location]);
  if (mod.tags && mod.tags.length) kv.push(["tags", mod.tags.join(", ")]);
  ctx.term.printTable(kv);
  ctx.term.println();

  if (typeof mod.detail === "function") {
    const detailNode = mod.detail();
    ctx.term.print(detailNode);
  } else if (mod.summary) {
    ctx.term.print(mod.summary);
  }

  if (mod.links && mod.links.length) {
    ctx.term.println();
    ctx.term.print(c`${bold(accent2("Links"))}`);
    for (const l of mod.links) {
      ctx.term.print(c`  ${muted("•")} ${link(l.label, l.url)}`);
    }
  }
}

function renderSkills(ctx, cat) {
  ctx.term.print(c`${bold(accent(cat.label || "Skills"))}`);
  for (const group of cat.groups) {
    ctx.term.println();
    ctx.term.print(c`  ${bold(accent2(group.label))}`);
    const rows = group.items.map((it) => [
      it.name,
      levelGlyph(it.level) + " " + (it.level || ""),
    ]);
    ctx.term.printTable(rows);
  }
}

function levelGlyph(level) {
  switch ((level || "").toLowerCase()) {
    case "expert":     return "████";
    case "advanced":   return "███▒";
    case "proficient": return "██▒▒";
    case "familiar":   return "█▒▒▒";
    default:           return "·   ";
  }
}

function renderOptions(ctx) {
  const entries = Object.entries(ctx.state.vars);
  if (entries.length === 0) {
    ctx.term.print(c`${muted("(no session variables set)")}`);
    return;
  }
  const rows = entries.map(([k, v]) => [k, String(v)]);
  ctx.term.printTable(rows, { headers: ["KEY", "VALUE"] });
}
