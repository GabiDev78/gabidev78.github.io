/**
 * Terminal — owns the DOM I/O for the prompt, transcript, and input.
 *
 * Core API:
 *   print(line)        — append a line (string | Node | DocumentFragment)
 *   println()          — append blank line
 *   printError/Info/Ok — msf-style prefixed status lines
 *   printTable(rows, {headers})
 *   echo(promptStr, command) — echo what the user typed
 *   clear()            — wipe transcript
 *   setPrompt(str)
 *   focus()
 *
 * Listeners (set from main.js):
 *   onSubmit(line)   — called with raw line (string) on Enter
 *   onKey(event)     — called for keydown events; main can preventDefault
 */

const MAX_LINES = 2000;

export class Terminal {
  constructor({ root, transcript, inputLine, promptEl, displayEl, cursorEl, inputEl }) {
    this.root = root;
    this.transcriptEl = transcript;
    this.inputLine = inputLine;
    this.promptEl = promptEl;
    this.displayEl = displayEl;
    this.cursorEl = cursorEl;
    this.inputEl = inputEl;

    this.onSubmit = null;
    this.onKey = null;

    this._wireEvents();
  }

  /* ---------- Prompt ---------- */

  setPrompt(text) {
    this.promptEl.textContent = text;
  }

  focus() {
    this.inputEl.focus({ preventScroll: false });
  }

  getInputValue() {
    return this.inputEl.value;
  }

  setInputValue(v) {
    this.inputEl.value = v;
    this._renderInput();
  }

  /* ---------- Transcript ---------- */

  print(content) {
    const line = document.createElement("div");
    line.className = "line";
    if (content instanceof Node) {
      line.appendChild(content);
    } else if (Array.isArray(content)) {
      for (const item of content) {
        if (item instanceof Node) line.appendChild(item);
        else line.appendChild(document.createTextNode(String(item)));
      }
    } else {
      line.textContent = String(content ?? "");
    }
    this.transcriptEl.appendChild(line);
    this._trim();
    this._scrollToBottom();
    return line;
  }

  println() {
    this.print("\u00A0"); // non-breaking space so the line has height
  }

  /** Replace contents of an existing line returned by print(). */
  replaceLine(node, content) {
    while (node.firstChild) node.removeChild(node.firstChild);
    if (content instanceof Node) node.appendChild(content);
    else node.textContent = String(content ?? "");
  }

  /** Echo the user's input as a transcript line: "msf6 > help" */
  echo(promptStr, command) {
    const line = document.createElement("div");
    line.className = "line echo";

    const p = document.createElement("span");
    p.className = "echo-prompt";
    p.textContent = promptStr;

    const cmd = document.createElement("span");
    cmd.textContent = command;

    line.appendChild(p);
    line.appendChild(cmd);
    this.transcriptEl.appendChild(line);
    this._trim();
    this._scrollToBottom();
    return line;
  }

  printError(msg) {
    const line = document.createElement("div");
    line.className = "line";
    const pre = document.createElement("span");
    pre.className = "prefix-err";
    pre.textContent = "[!] ";
    line.appendChild(pre);
    line.appendChild(document.createTextNode(String(msg)));
    this.transcriptEl.appendChild(line);
    this._trim();
    this._scrollToBottom();
  }

  printOk(msg) {
    const line = document.createElement("div");
    line.className = "line";
    const pre = document.createElement("span");
    pre.className = "prefix-ok";
    pre.textContent = "[+] ";
    line.appendChild(pre);
    line.appendChild(document.createTextNode(String(msg)));
    this.transcriptEl.appendChild(line);
    this._trim();
    this._scrollToBottom();
  }

  printInfo(msg) {
    const line = document.createElement("div");
    line.className = "line";
    const pre = document.createElement("span");
    pre.className = "prefix-info";
    pre.textContent = "[*] ";
    line.appendChild(pre);
    line.appendChild(document.createTextNode(String(msg)));
    this.transcriptEl.appendChild(line);
    this._trim();
    this._scrollToBottom();
  }

  printWarn(msg) {
    const line = document.createElement("div");
    line.className = "line";
    const pre = document.createElement("span");
    pre.className = "prefix-warn";
    pre.textContent = "[-] ";
    line.appendChild(pre);
    line.appendChild(document.createTextNode(String(msg)));
    this.transcriptEl.appendChild(line);
    this._trim();
    this._scrollToBottom();
  }

  /** Render an msf-style table. rows: Array<Array<string|Node>>. */
  printTable(rows, { headers } = {}) {
    const table = document.createElement("table");
    table.className = "term-table";

    if (headers && headers.length) {
      const thead = document.createElement("thead");
      const tr = document.createElement("tr");
      for (const h of headers) {
        const th = document.createElement("th");
        if (h instanceof Node) th.appendChild(h);
        else th.textContent = String(h);
        tr.appendChild(th);
      }
      thead.appendChild(tr);
      table.appendChild(thead);
    }

    const tbody = document.createElement("tbody");
    for (const row of rows) {
      const tr = document.createElement("tr");
      for (const cell of row) {
        const td = document.createElement("td");
        if (cell instanceof Node) td.appendChild(cell);
        else td.textContent = String(cell ?? "");
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    const wrapper = document.createElement("div");
    wrapper.className = "line";
    wrapper.appendChild(table);
    this.transcriptEl.appendChild(wrapper);
    this._trim();
    this._scrollToBottom();
  }

  /** Render an ASCII banner inside <pre class="banner"> */
  printBanner(text) {
    const pre = document.createElement("pre");
    pre.className = "banner";
    pre.textContent = String(text);

    const wrap = document.createElement("div");
    wrap.className = "line";
    wrap.appendChild(pre);
    this.transcriptEl.appendChild(wrap);
    this._scrollToBottom();
    return wrap;
  }

  clear() {
    while (this.transcriptEl.firstChild) {
      this.transcriptEl.removeChild(this.transcriptEl.firstChild);
    }
  }

  /* ---------- Input mirror ---------- */

  _renderInput() {
    this.displayEl.textContent = this.inputEl.value;
  }

  setCursorIdle(idle) {
    this.cursorEl.classList.toggle("idle", !!idle);
  }

  /* ---------- Internals ---------- */

  _wireEvents() {
    // Tap anywhere on the terminal → focus the hidden input (mobile)
    this.root.addEventListener("click", (e) => {
      // Don't steal focus from real anchors / buttons.
      if (e.target.closest("a, button")) return;
      this.focus();
    });

    this.inputEl.addEventListener("input", () => this._renderInput());

    this.inputEl.addEventListener("keydown", (e) => {
      if (this.onKey) this.onKey(e);
      if (e.defaultPrevented) return;

      if (e.key === "Enter") {
        e.preventDefault();
        const line = this.inputEl.value;
        this.inputEl.value = "";
        this._renderInput();
        if (this.onSubmit) this.onSubmit(line);
      }
    });

    // Refocus on blur after a tick (unless user clicked an actual link)
    this.inputEl.addEventListener("blur", () => {
      setTimeout(() => {
        if (!document.activeElement || document.activeElement === document.body) {
          this.focus();
        }
      }, 50);
    });
  }

  _scrollToBottom() {
    // Use root because it's the scroll container.
    this.root.scrollTop = this.root.scrollHeight;
  }

  _trim() {
    const lines = this.transcriptEl.children;
    while (lines.length > MAX_LINES) {
      this.transcriptEl.removeChild(lines[0]);
    }
  }
}
