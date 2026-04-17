/**
 * Content commands: contact, download, about.
 * (whoami's context-aware behavior is handled here too by re-registering
 * a smarter variant that falls back to core when `use about` isn't active.)
 */

import { profile } from "../data/profile.js";
import { c, accent, accent2, bold, dim, muted, link } from "../render.js";

export function registerContentCommands(registry) {
  registry.register({
    name: "contact",
    group: "content",
    summary: "Show contact details",
    usage: "contact",
    run(ctx) {
      const k = (label, value, isLink = false) => {
        const v = isLink ? link(value, value) : value;
        ctx.term.print(c`  ${dim(label.padEnd(10))} ${v}`);
      };
      ctx.term.print(c`${bold(accent("Contact"))}`);
      ctx.term.println();
      if (profile.contact.email)    k("email:",    profile.contact.email, true);
      if (profile.contact.github)   k("github:",   profile.contact.github, true);
      if (profile.contact.linkedin) k("linkedin:", profile.contact.linkedin, true);
      for (const [key, val] of Object.entries(profile.contact)) {
        if (["email", "github", "linkedin"].includes(key)) continue;
        if (!val) continue;
        k(key + ":", val, typeof val === "string" && /^https?:\/\//.test(val));
      }
    },
  });

  registry.register({
    name: "download",
    group: "content",
    summary: "Download the CV as PDF",
    usage: "download [cv]",
    run(ctx, { args }) {
      const what = (args[0] || "cv").toLowerCase();
      if (what !== "cv" && what !== "resume") {
        ctx.term.printError(`download: unknown target: ${what}  (try: download cv)`);
        return;
      }
      const url = profile.cv?.pdfUrl || "./assets/cv.pdf";
      ctx.term.printInfo(`triggering download: ${url}`);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cv.pdf";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
    complete(ctx, { argIndex }) {
      if (argIndex === 0) return ["cv"];
      return [];
    },
  });

  // Re-register a smarter `whoami` that wins over core.js by being loaded
  // later. We do that by first deleting from the registry's internal map.
  // (Alternative: set a flag in context and have core.js check it. Simpler
  // to just replace.)
  const prev = registry.get("whoami");
  if (prev) {
    registry._cmds.delete("whoami");
  }
  registry.register({
    name: "whoami",
    group: "core",
    summary: "Identify the current user (context-aware)",
    usage: "whoami",
    run(ctx) {
      // If `use about` (or about/me) is active, show real bio.
      if ((ctx.state.currentModule || "").startsWith("about")) {
        ctx.term.print(c`${bold(accent(profile.name))}  ${muted("·")}  ${accent2(profile.tagline)}`);
        for (const line of profile.about || []) {
          ctx.term.print(c`  ${muted("•")} ${line}`);
        }
        return;
      }
      // Cheeky default.
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const day = days[new Date().getDay()];
      ctx.term.print(c`a curious visitor on a ${accent2(day)} afternoon`);
      ctx.term.print(c`${dim("(try")} ${accent("use about")} ${dim("for the real answer)")}`);
    },
  });
}
