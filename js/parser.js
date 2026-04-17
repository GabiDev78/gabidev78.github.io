/**
 * Shell-lite tokenizer.
 *
 *   parse('use experience --verbose acme-corp')
 *     → { raw, verb: 'use', args: ['experience', 'acme-corp'],
 *         flags: { verbose: true }, rest: 'experience --verbose acme-corp' }
 *
 *   parse('echo "hello world"')
 *     → { verb: 'echo', args: ['hello world'], flags: {} }
 *
 * Supports:
 *   - whitespace tokenization
 *   - "double" and 'single' quoted strings (no nesting)
 *   - --key=value, --flag, -f short flags
 *   - !N and !! history references (passed through; resolved upstream)
 */

export function tokenize(line) {
  const tokens = [];
  const src = line;
  let i = 0;

  while (i < src.length) {
    const ch = src[i];

    if (/\s/.test(ch)) { i++; continue; }

    if (ch === '"' || ch === "'") {
      const quote = ch;
      let buf = "";
      i++;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === "\\" && i + 1 < src.length) {
          buf += src[i + 1];
          i += 2;
        } else {
          buf += src[i++];
        }
      }
      if (src[i] === quote) i++;
      tokens.push(buf);
      continue;
    }

    let buf = "";
    while (i < src.length && !/\s/.test(src[i])) {
      buf += src[i++];
    }
    tokens.push(buf);
  }

  return tokens;
}

export function parse(line) {
  const raw = line;
  const trimmed = line.trim();
  const tokens = tokenize(trimmed);

  const verb = tokens.shift() || "";
  const args = [];
  const flags = {};

  for (const t of tokens) {
    if (t.startsWith("--")) {
      const eq = t.indexOf("=");
      if (eq > -1) {
        flags[t.slice(2, eq)] = t.slice(eq + 1);
      } else {
        flags[t.slice(2)] = true;
      }
    } else if (t.startsWith("-") && t.length > 1 && !/^-?\d/.test(t)) {
      // -abc → {a:true, b:true, c:true}
      for (const ch of t.slice(1)) flags[ch] = true;
    } else {
      args.push(t);
    }
  }

  // `rest` is everything after the verb in raw form, useful for
  // commands like `echo`, `cowsay`, `sudo` that want the literal string.
  const verbInRaw = trimmed.indexOf(verb);
  const rest = verbInRaw === -1
    ? ""
    : trimmed.slice(verbInRaw + verb.length).replace(/^\s+/, "");

  return { raw, verb: verb.toLowerCase(), args, flags, rest };
}
