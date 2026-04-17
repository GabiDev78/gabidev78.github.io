/**
 * Boot sequence. Non-blocking, cancellable.
 *
 *   await boot(ctx, term, { skip })
 *
 * Behavior:
 *   - Prints a randomized ASCII banner line-by-line.
 *   - Prints module-count, tip, version lines with a mild typewriter feel.
 *   - Any keydown during boot → abort → fast-forward to final state.
 *   - URL ?skip=1 / ?boot=0 → no animation, final state only.
 *   - Returning visitors (localStorage.portfolio.seen=1) → 2× speed by default.
 *   - prefers-reduced-motion → no delays, final frame only.
 *
 * The caller is expected to hide the input line until boot resolves.
 */

import { pickBanner } from "./data/banners.js";
import { profile } from "./data/profile.js";
import { c, accent, accent2, dim, muted, cyan, green, yellow } from "./render.js";

const SEEN_KEY = "portfolio.seen";
const URL_SKIP_KEYS = ["skip", "boot"];

export async function boot(ctx, term, { skip: forcedSkip = false } = {}) {
  const { skip, speed } = decidePacing(forcedSkip);

  // Abort machinery: any keydown (except modifier-only) snaps to the end.
  let aborted = skip;
  const onKey = (e) => {
    if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
    aborted = true;
  };
  window.addEventListener("keydown", onKey, { once: false });

  // Buffer for input typed during boot; flushed after.
  const buffered = [];
  const onType = () => {
    // Input already mirrors; we just note it.
    buffered.push(term.inputEl.value);
  };
  term.inputEl.addEventListener("input", onType);

  try {
    await printBanner(term, speed, () => aborted);
    await printPostBanner(ctx, term, speed, () => aborted);
  } finally {
    window.removeEventListener("keydown", onKey);
    term.inputEl.removeEventListener("input", onType);
  }

  // Mark "seen" so future loads are faster.
  try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* */ }

  // If the user typed during boot, keep whatever is now in the input.
  // (Buffered values are not replayed; we trust term.inputEl as source of truth.)
}

function decidePacing(forced) {
  // Respect reduced motion.
  const rm = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  if (rm?.matches) return { skip: true, speed: 1 };

  // URL override.
  try {
    const params = new URLSearchParams(window.location.search);
    for (const k of URL_SKIP_KEYS) {
      if (params.has(k) && params.get(k) !== "1" && params.get(k) !== "true") continue;
      if (params.has(k)) return { skip: true, speed: 1 };
    }
  } catch { /* */ }

  if (forced) return { skip: true, speed: 1 };

  // Returning visitor: faster.
  let fast = false;
  try { fast = localStorage.getItem(SEEN_KEY) === "1"; } catch { /* */ }

  return { skip: false, speed: fast ? 0.5 : 1 };
}

function wait(ms) {
  if (ms <= 0) return Promise.resolve();
  return new Promise((r) => setTimeout(r, ms));
}

async function printBanner(term, speed, aborted) {
  const banner = pickBanner(window.innerWidth);
  const lines = banner.split("\n");

  // Single <pre> we append to line-by-line so the monospace alignment is perfect.
  const pre = document.createElement("pre");
  pre.className = "banner";
  const wrap = document.createElement("div");
  wrap.className = "line";
  wrap.appendChild(pre);
  term.transcriptEl.appendChild(wrap);

  for (const line of lines) {
    if (aborted()) {
      pre.textContent = banner; // snap to end
      break;
    }
    pre.textContent += line + "\n";
    term._scrollToBottom();
    await wait(8 * speed);
  }
}

async function printPostBanner(ctx, term, speed, aborted) {
  // Faux module/version lines to evoke msfconsole's boot.
  const catCount = ctx.registry.allCategoryIds().length;
  const modCount = ctx.registry.allModulePaths().length;

  const linesToPrint = [
    c`       ${accent("=[")} ${accent2(`portfolio ${profile.versionTagline || "v1.0"}`)} ${accent("]")}`,
    c`${muted("+")} ${accent("--=[")} ${cyan(`${modCount} modules across ${catCount} categories`)} ${accent("]")}`,
    c`${muted("+")} ${accent("--=[")} ${yellow(`themes:`)} ${ctx.theme.list().join(", ")} ${accent("]")}`,
    c`${muted("+")} ${accent("--=[")} ${green(`tip:`)} type ${accent("help")} to list commands, ${accent("Tab")} to autocomplete ${accent("]")}`,
    "",
    c`${dim(`Last updated ${profile.cv?.lastUpdated || "—"}.`)}`,
    "",
  ];

  for (const line of linesToPrint) {
    if (aborted()) {
      // Snap-print remainder and stop.
      const idx = linesToPrint.indexOf(line);
      for (const remaining of linesToPrint.slice(idx)) {
        term.print(remaining || "\u00A0");
      }
      return;
    }
    term.print(line || "\u00A0");
    await wait(60 * speed);
  }
}
