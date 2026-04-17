/**
 * Core shell commands: help, clear, banner, history, exit, echo, whoami.
 * (Banner content + history navigation are wired in later steps.)
 */

import { c, accent, accent2, dim, muted, bold, ok } from "../render.js";
import { BANNERS, pickBanner } from "../data/banners.js";

export function registerCoreCommands(registry) {
  registry.register({
    name: "help",
    aliases: ["?", "h"],
    group: "core",
    summary: "List commands or show usage for one",
    usage: "help [command] [--all]",
    run(ctx, { args, flags }) {
      if (args.length === 0) {
        printGroupedHelp(ctx, registry, !!flags.all);
        return;
      }
      const name = args[0];
      const cmd = registry.get(name);
      if (!cmd) {
        ctx.term.printError(`no help for unknown command: ${name}`);
        return;
      }
      ctx.term.print(c`${accent(bold(cmd.name))}${cmd.aliases?.length ? muted(` (aka ${cmd.aliases.join(", ")})`) : ""}`);
      if (cmd.summary) ctx.term.print(c`  ${cmd.summary}`);
      if (cmd.usage)   ctx.term.print(c`  ${dim("usage:")} ${cmd.usage}`);
      if (typeof cmd.help === "function") {
        const extra = cmd.help(ctx);
        if (extra) ctx.term.print(extra);
      }
    },
    complete(ctx, { argIndex, current }) {
      if (argIndex === 0) return registry.names({ includeHidden: false });
      return [];
    },
  });

  registry.register({
    name: "clear",
    aliases: ["cls"],
    group: "core",
    summary: "Clear the screen",
    usage: "clear",
    run(ctx) { ctx.term.clear(); },
  });

  registry.register({
    name: "echo",
    group: "core",
    summary: "Print a line to the terminal",
    usage: "echo <text>",
    run(ctx, { args }) {
      ctx.term.print(args.join(" "));
    },
  });

  registry.register({
    name: "exit",
    aliases: ["quit", "logout"],
    group: "core",
    summary: "Close the session (politely)",
    usage: "exit",
    run(ctx) {
      ctx.term.print(c`${dim("Connection to portfolio closed.")}`);
      ctx.term.print(c`${muted("(refresh the page to start a new session)")}`);
    },
  });

  registry.register({
    name: "whoami",
    group: "core",
    summary: "Identify the current user",
    usage: "whoami",
    run(ctx) {
      // If `use about` is active, content.js (later) will register a
      // higher-priority handler. For now, the cheeky default:
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const day = days[new Date().getDay()];
      ctx.term.print(c`a curious visitor on a ${accent2(day)} afternoon`);
    },
  });

  registry.register({
    name: "banner",
    group: "core",
    summary: "Print the ASCII banner",
    usage: "banner",
    run(ctx) {
      const banner = pickBanner(window.innerWidth);
      ctx.term.printBanner(banner);
    },
  });

  registry.register({
    name: "history",
    group: "core",
    summary: "Show command history",
    usage: "history [-c]   (-c clears)",
    run(ctx, { flags }) {
      if (flags.c) {
        ctx.history.clear();
        ctx.term.print(c`${ok("history cleared")}`);
        return;
      }
      const all = ctx.history.all;
      if (all.length === 0) {
        ctx.term.print(c`${dim("(no history yet)")}`);
        return;
      }
      const rows = all.map((line, i) => [
        String(i + 1).padStart(4, " "),
        line,
      ]);
      ctx.term.printTable(rows);
      ctx.term.print(c`${dim("re-run with")} ${accent("!N")} ${dim("(by index) or")} ${accent("!!")} ${dim("(last)")}`);
    },
  });
}

function printGroupedHelp(ctx, registry, includeHidden) {
  const cmds = registry.all({ includeHidden });
  const groups = new Map();
  for (const cmd of cmds) {
    const g = cmd.group || "misc";
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(cmd);
  }

  const order = ["msf", "content", "core", "theme", "easter", "misc"];
  const sortedGroups = [...groups.keys()].sort((a, b) => {
    const ai = order.indexOf(a); const bi = order.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  ctx.term.print(c`${accent(bold("Available commands"))}`);
  for (const g of sortedGroups) {
    ctx.term.println();
    ctx.term.print(c`  ${accent2(bold(groupLabel(g)))}`);
    const rows = [];
    for (const cmd of groups.get(g)) {
      rows.push([cmd.name, cmd.summary || ""]);
    }
    ctx.term.printTable(rows);
  }
  ctx.term.println();
  ctx.term.print(c`${dim("Tip:")} ${muted("type")} ${accent("help <command>")} ${muted("for usage. Press")} ${accent("Tab")} ${muted("to autocomplete.")}`);
  if (!includeHidden) {
    ctx.term.print(c`${muted("(some commands are hidden — try")} ${accent("help --all")}${muted(")")}`);
  }
}

function groupLabel(g) {
  switch (g) {
    case "msf":     return "Modules (msf)";
    case "core":    return "Shell";
    case "content": return "Content";
    case "theme":   return "Appearance";
    case "easter":  return "Misc";
    default:        return g;
  }
}
