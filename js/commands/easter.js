/**
 * Easter eggs. Hidden from bare `help`; surfaced via `help --all`.
 *
 *   sudo <anything>    — BOFH-style denials, xkcd sandwich
 *   nmap [target]      — mock scan against localhost
 *   matrix             — fullscreen katakana rain
 *   hack <target>      — fake progress bars / hex dumps
 *   cowsay <msg>       — classic cow; -f dragon swap
 *   fortune            — short pithy quote
 */

import { c, accent, accent2, red, yellow, green, cyan, dim, muted, bold } from "../render.js";
import { profile } from "../data/profile.js";

export function registerEasterCommands(registry) {
  registerSudo(registry);
  registerNmap(registry);
  registerMatrix(registry);
  registerHack(registry);
  registerCowsay(registry);
  registerFortune(registry);
}

/* ---------- sudo ---------- */

const BOFH_DENIALS = [
  "Incident will be reported.",
  "Nice try.",
  "sudo: 3 incorrect password attempts",
  "Permission denied. Your audacity has been logged.",
  "You are not in the sudoers file. This incident will be reported.",
  "sudo: a password is required. (and better intentions.)",
];

function registerSudo(registry) {
  registry.register({
    name: "sudo",
    group: "easter",
    hidden: true,
    summary: "Execute a command as root (results may vary)",
    usage: "sudo <command>",
    run(ctx, { rest }) {
      if (!rest) {
        ctx.term.printError("usage: sudo <command>");
        return;
      }
      const lower = rest.toLowerCase().trim();
      if (lower === "make me a sandwich") {
        ctx.term.print(c`${muted("okay.")} ${dim("(xkcd://149)")}`);
        ctx.term.print("      🥪");
        return;
      }
      if (lower === "rm -rf /" || lower === "rm -rf /*") {
        ctx.term.print(c`${red("refusing to participate in societal collapse.")}`);
        return;
      }
      const msg = BOFH_DENIALS[Math.floor(Math.random() * BOFH_DENIALS.length)];
      ctx.term.print(c`${red("[!]")} ${msg}`);
    },
  });
}

/* ---------- nmap ---------- */

function registerNmap(registry) {
  registry.register({
    name: "nmap",
    group: "easter",
    hidden: true,
    summary: "Network scan (localhost only — the rest is off-limits)",
    usage: "nmap [target]",
    async run(ctx, { args }) {
      const target = (args[0] || "localhost").toLowerCase();
      const allowed = ["localhost", "127.0.0.1", "::1", "0.0.0.0"];
      if (!allowed.includes(target)) {
        ctx.term.print(c`${red("[!]")} scanning ${accent(target)} is prohibited. ${dim("nice try.")}`);
        ctx.term.print(c`${muted("(only localhost is permitted from this terminal)")}`);
        return;
      }

      ctx.term.print(c`${dim("Starting Nmap 7.94 ( https://nmap.org ) at")} ${new Date().toISOString().slice(0, 19).replace("T", " ")}`);
      ctx.term.print(c`${dim(`Nmap scan report for`)} ${accent(target)} ${dim("(127.0.0.1)")}`);
      ctx.term.print(c`${dim("Host is up (0.00012s latency).")}`);
      ctx.term.println();
      await wait(180);

      const ports = [
        { p: "22/tcp",    state: "open",     svc: "ssh",        banner: "OpenSSH 9.6 (protocol 2.0)" },
        { p: "80/tcp",    state: "open",     svc: "http",       banner: "nginx 1.27" },
        { p: "443/tcp",   state: "open",     svc: "https",      banner: "nginx 1.27 (TLS 1.3)" },
        { p: "31337/tcp", state: "open",     svc: "elite",      banner: profile.tagline || "hello world" },
        { p: "8080/tcp",  state: "filtered", svc: "http-proxy", banner: "—" },
      ];

      // Header line, then animate one row at a time using aligned text.
      ctx.term.print(c`${bold(accent2("PORT"))}      ${bold(accent2("STATE"))}      ${bold(accent2("SERVICE"))}       ${bold(accent2("BANNER"))}`);
      for (const row of ports) {
        const stateCls = row.state === "open" ? "fg-green" : row.state === "closed" ? "fg-red" : "fg-yellow";
        const line = document.createDocumentFragment();
        const pad = (s, n) => String(s).padEnd(n, " ");
        line.appendChild(document.createTextNode(pad(row.p, 10)));
        const st = document.createElement("span"); st.className = stateCls; st.textContent = pad(row.state, 11); line.appendChild(st);
        line.appendChild(document.createTextNode(pad(row.svc, 14)));
        line.appendChild(document.createTextNode(row.banner));
        ctx.term.print(line);
        await wait(120);
      }

      ctx.term.println();
      ctx.term.print(c`${dim("Nmap done: 1 IP address (1 host up) scanned in")} ${accent("0.42")} ${dim("seconds")}`);
    },
  });
}

function stateColor(state) {
  const s = document.createElement("span");
  s.textContent = state;
  s.className = state === "open" ? "fg-green" : state === "closed" ? "fg-red" : "fg-yellow";
  return s;
}

/* ---------- matrix rain ---------- */

function registerMatrix(registry) {
  registry.register({
    name: "matrix",
    group: "easter",
    hidden: true,
    summary: "Katakana rain (Esc to exit)",
    usage: "matrix [--force]",
    run(ctx, { flags }) {
      const rm = window.matchMedia?.("(prefers-reduced-motion: reduce)");
      if (rm?.matches && !flags.force) {
        ctx.term.printWarn("reduced motion is enabled. run `matrix --force` to override.");
        return;
      }
      startMatrix(ctx);
    },
  });
}

function startMatrix(ctx) {
  const overlay = document.createElement("div");
  overlay.className = "matrix-overlay";
  overlay.setAttribute("role", "presentation");
  overlay.setAttribute("aria-hidden", "true");

  const canvas = document.createElement("canvas");
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  overlay.appendChild(canvas);

  const hint = document.createElement("div");
  hint.className = "matrix-hint";
  hint.textContent = "press esc to exit";
  overlay.appendChild(hint);

  document.body.appendChild(overlay);

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const resize = () => {
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
  };
  resize();
  window.addEventListener("resize", resize);

  const c2d = canvas.getContext("2d");
  const fontSize = 16 * dpr;
  const glyphs = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>/\\|-+={}[]".split("");
  const maxCols = Math.min(80, Math.floor(canvas.width / fontSize));
  const step = Math.floor(canvas.width / maxCols);
  const drops = new Array(maxCols).fill(0).map(() => Math.random() * -canvas.height);

  // 30fps cap.
  const frameMs = 1000 / 30;
  let last = 0;
  let running = true;
  let autoExit = null;

  const primary = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#39ff14";
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#000";

  function draw(ts) {
    if (!running) return;
    if (document.hidden) { requestAnimationFrame(draw); last = ts; return; }
    if (ts - last < frameMs) { requestAnimationFrame(draw); return; }
    last = ts;

    c2d.fillStyle = bg + "33";
    c2d.fillRect(0, 0, canvas.width, canvas.height);
    c2d.fillStyle = primary;
    c2d.font = `${fontSize}px "JetBrains Mono", monospace`;

    for (let i = 0; i < drops.length; i++) {
      const ch = glyphs[(Math.random() * glyphs.length) | 0];
      c2d.fillText(ch, i * step, drops[i]);
      drops[i] += fontSize;
      if (drops[i] > canvas.height && Math.random() > 0.975) drops[i] = 0;
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  const stop = () => {
    if (!running) return;
    running = false;
    window.removeEventListener("resize", resize);
    document.removeEventListener("keydown", onKey, true);
    overlay.removeEventListener("click", onClick);
    if (autoExit) clearTimeout(autoExit);
    overlay.remove();
    ctx.term.focus();
  };

  const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); stop(); } };
  const onClick = () => stop();

  document.addEventListener("keydown", onKey, true);
  overlay.addEventListener("click", onClick);
  autoExit = setTimeout(stop, 60 * 1000);
}

/* ---------- hack ---------- */

function registerHack(registry) {
  registry.register({
    name: "hack",
    group: "easter",
    hidden: true,
    summary: "Run the penetration on a \"target\" (for entertainment purposes)",
    usage: "hack <target>",
    async run(ctx, { args }) {
      const target = args.join(" ") || "the-pentagon";
      const steps = [
        `resolving ${target}...`,
        "bypassing firewall...",
        "exploiting CVE-2001-0001...",
        "pivoting through jump host...",
        "escalating privileges...",
        "exfiltrating data...",
      ];

      for (const step of steps) {
        await animateProgress(ctx.term, step);
      }
      ctx.term.println();
      ctx.term.print(c`${green(bold("[+] ACCESS GRANTED"))}`);
      ctx.term.print(c`${muted("(just kidding. this is a portfolio.)")}`);
    },
  });
}

async function animateProgress(term, label) {
  const line = term.print(label);
  const total = 28;
  for (let i = 0; i <= total; i++) {
    const filled = "#".repeat(i);
    const empty = "-".repeat(total - i);
    const pct = Math.round((i / total) * 100).toString().padStart(3, " ");
    term.replaceLine(line, `${label} [${filled}${empty}] ${pct}%`);
    await wait(22 + Math.random() * 18);
  }
}

/* ---------- cowsay ---------- */

function registerCowsay(registry) {
  registry.register({
    name: "cowsay",
    group: "easter",
    hidden: true,
    summary: "Print a message in a cow's speech bubble",
    usage: "cowsay [-f dragon] <message>",
    run(ctx, { rest, flags }) {
      const f = flags.f || (flags.dragon ? "dragon" : "cow");
      const msg = rest
        .replace(/^-f\s+\S+\s*/, "")
        .replace(/^--dragon\s*/, "")
        .trim() || "moo.";

      const bubble = buildBubble(msg);
      const speaker = f === "dragon" ? DRAGON : COW;
      ctx.term.printBanner(bubble + speaker);
    },
  });
}

function buildBubble(msg) {
  const lines = msg.split("\n");
  const width = Math.max(...lines.map((l) => l.length));
  const top = " " + "_".repeat(width + 2);
  const bot = " " + "-".repeat(width + 2);
  const body = lines.map((l) => `< ${l.padEnd(width, " ")} >`).join("\n");
  return `${top}\n${body}\n${bot}\n`;
}

const COW = `        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
`;

const DRAGON = `        \\                    / \\  //\\
         \\    |\\___/|      /   \\//  \\\\
              /0  0  \\__  /    //  | \\ \\
             /     /  \\/_/    //   |  \\  \\
             @_^_@'/   \\/_   //    |   \\   \\
             //_^_/     \\/_ //     |    \\    \\
          ( //) |        \\///      |     \\     \\
        ( / /) _|_ /   )  //       |      \\     _\\
      ( // /) '/,_ _ _/  ( ; -.    |    _ _\\.-~        .-~~~^-.
    (( / / )) ,-{        _      \`-.|.-~-.           .~         \`.
   (( // / ))  '/\\      /                 ~-. _ .-~      .-~^-.  \\
   (( /// ))      \`.   {            }                   /      \\  \\
    (( / ))     .----~-.\\        \\-'                 .~         \\  \`.
`;

/* ---------- fortune ---------- */

const FORTUNES = [
  "The best defense is reading the logs your predecessor ignored.",
  "Every protocol is a suggestion until someone fuzzes it.",
  "Security is what happens while you're busy making other features.",
  "If your threat model doesn't include your past self, it's incomplete.",
  "The shortest path to root is often spelled `admin:admin`.",
];

function registerFortune(registry) {
  registry.register({
    name: "fortune",
    group: "easter",
    hidden: true,
    summary: "A pithy thought",
    usage: "fortune",
    run(ctx) {
      const f = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
      ctx.term.print(c`${cyan(`"${f}"`)}`);
    },
  });
}

/* ---------- util ---------- */

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }
