/**
 * Theme commands.
 *
 *   theme               — show current theme + available themes
 *   theme <name>        — switch to <name>
 *   set theme <name>    — same, routed through `set` (registered in msf.js)
 */

import { c, accent, accent2, dim, muted } from "../render.js";

export function registerThemeCommands(registry) {
  registry.register({
    name: "theme",
    aliases: ["themes"],
    group: "theme",
    summary: "Show or change the color theme",
    usage: "theme [name]   (matrix | amber | dracula | solarized-dark)",
    run(ctx, { args }) {
      const tm = ctx.theme;
      if (args.length === 0) {
        ctx.term.print(c`current theme: ${accent(tm.current())}`);
        ctx.term.print(buildAvailableLine(tm));
        ctx.term.print(c`${dim("usage:")} ${accent("theme dracula")}   ${dim("or")}   ${accent("set theme dracula")}`);
        return;
      }
      try {
        tm.apply(args[0]);
        ctx.term.print(c`${accent2("[+]")} theme set to ${accent(tm.current())}`);
      } catch (err) {
        if (err.code === "UNKNOWN_THEME") {
          ctx.term.printError(`unknown theme: ${args[0]}`);
          ctx.term.print(c`${dim("available:")} ${tm.list().join(", ")}`);
        } else {
          ctx.term.printError(err.message || String(err));
        }
      }
    },
    complete(ctx, { argIndex }) {
      if (argIndex === 0) return ctx.theme.list();
      return [];
    },
  });
}

function buildAvailableLine(tm) {
  // Produce: "available: matrix · amber · dracula · solarized-dark"
  // with the current theme in accent-2 and others muted.
  const parts = [];
  parts.push(c`${dim("available:")} `);
  const list = tm.list();
  list.forEach((name, i) => {
    const isCurrent = name === tm.current();
    parts.push(c`${isCurrent ? accent2(name) : muted(name)}`);
    if (i < list.length - 1) parts.push(c`${muted(" · ")}`);
  });
  const frag = document.createDocumentFragment();
  for (const p of parts) frag.appendChild(p);
  return frag;
}
