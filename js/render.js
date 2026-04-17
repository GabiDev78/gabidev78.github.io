/**
 * Trusted tagged-template renderer.
 *
 * The ONLY module allowed to emit HTML into the transcript.
 * Whitelists span classes; everything else is escaped.
 *
 *   c`Hello ${red('world')} ${bold('strong')}`  →  DocumentFragment
 *
 * Color/style helpers below produce {tag:'span', class:'fg-red', text:'...'}
 * tokens that c() recognizes; raw strings are escaped via textContent.
 */

const ALLOWED_CLASSES = new Set([
  "fg-red", "fg-green", "fg-yellow", "fg-blue", "fg-magenta", "fg-cyan",
  "fg-dim", "fg-muted", "fg-accent", "fg-accent2", "fg-prompt",
  "bold", "italic", "underline",
  "prefix-err", "prefix-ok", "prefix-info", "prefix-warn",
  "echo", "echo-prompt", "banner",
]);

/** Make a styled token that c() will turn into a <span>. */
function token(cls, content) {
  if (!ALLOWED_CLASSES.has(cls)) {
    // Defensive: never emit unknown classes.
    return String(content);
  }
  return { __token: true, cls, content };
}

export const red     = (s) => token("fg-red",     s);
export const green   = (s) => token("fg-green",   s);
export const yellow  = (s) => token("fg-yellow",  s);
export const blue    = (s) => token("fg-blue",    s);
export const magenta = (s) => token("fg-magenta", s);
export const cyan    = (s) => token("fg-cyan",    s);
export const dim     = (s) => token("fg-dim",     s);
export const muted   = (s) => token("fg-muted",   s);
export const accent  = (s) => token("fg-accent",  s);
export const accent2 = (s) => token("fg-accent2", s);
export const prompt  = (s) => token("fg-prompt",  s);
export const bold    = (s) => token("bold",       s);
export const italic  = (s) => token("italic",     s);
export const underline = (s) => token("underline", s);

/** msfconsole-style status prefixes. */
export const ok    = (s) => [token("prefix-ok",   "[+] "), s];
export const err   = (s) => [token("prefix-err",  "[!] "), s];
export const info  = (s) => [token("prefix-info", "[*] "), s];
export const warn  = (s) => [token("prefix-warn", "[-] "), s];

/** Trusted link helper — href is sanitized to http(s)/mailto only. */
export function link(label, href) {
  return { __link: true, label: String(label), href: String(href) };
}

/**
 * Tagged-template that produces a DocumentFragment.
 * Strings (interpolated values) are escaped via textContent;
 * tokens, links, arrays, and nested fragments are rendered structurally.
 */
export function c(strings, ...values) {
  const frag = document.createDocumentFragment();

  for (let i = 0; i < strings.length; i++) {
    appendText(frag, strings[i]);
    if (i < values.length) appendValue(frag, values[i]);
  }
  return frag;
}

function appendText(frag, str) {
  if (!str) return;
  frag.appendChild(document.createTextNode(str));
}

function appendValue(frag, val) {
  if (val == null || val === false) return;

  if (Array.isArray(val)) {
    for (const v of val) appendValue(frag, v);
    return;
  }

  if (val instanceof Node) {
    frag.appendChild(val);
    return;
  }

  if (typeof val === "object" && val.__token) {
    const span = document.createElement("span");
    span.className = val.cls;
    appendValue(span, val.content);
    frag.appendChild(span);
    return;
  }

  if (typeof val === "object" && val.__link) {
    const a = document.createElement("a");
    const href = sanitizeHref(val.href);
    if (href) a.href = href;
    a.textContent = val.label;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    frag.appendChild(a);
    return;
  }

  // Fallback: stringify and escape.
  appendText(frag, String(val));
}

function sanitizeHref(href) {
  try {
    const u = new URL(href, window.location.href);
    if (u.protocol === "http:" || u.protocol === "https:" || u.protocol === "mailto:") {
      return u.toString();
    }
  } catch { /* fall through */ }
  return null;
}
