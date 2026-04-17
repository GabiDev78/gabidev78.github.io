/**
 * Mobile polish.
 *
 * - Populates the helper row with tap-friendly buttons (shown by CSS on ≤640px).
 * - Enables the Virtual Keyboard API when supported.
 */

export function setupMobile(term, runCommand) {
  populateHelperRow(term, runCommand);
  enableVirtualKeyboardOverlay();
}

function populateHelperRow(term, runCommand) {
  const row = document.getElementById("helper-row");
  if (!row) return;

  const mk = (label, onPress, { kbdKey = null } = {}) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    // Prevent the input from losing focus on tap (iOS quirk).
    b.addEventListener("mousedown", (e) => e.preventDefault());
    b.addEventListener("touchstart", (e) => e.preventDefault(), { passive: false });
    b.addEventListener("click", (e) => {
      e.preventDefault();
      if (kbdKey) {
        term.inputEl.focus();
        term.inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: kbdKey, bubbles: true, cancelable: true }));
      } else if (typeof onPress === "function") {
        onPress();
      }
      term.focus();
    });
    return b;
  };

  row.appendChild(mk("Tab",  null, { kbdKey: "Tab" }));
  row.appendChild(mk("↑",    null, { kbdKey: "ArrowUp" }));
  row.appendChild(mk("↓",    null, { kbdKey: "ArrowDown" }));
  row.appendChild(mk("^C",   null, { kbdKey: "c" })); // sent without ctrlKey — safe no-op
  row.appendChild(mk("help", () => runCommand("help")));
  row.appendChild(mk("clear", () => runCommand("clear")));
}

function enableVirtualKeyboardOverlay() {
  if (!("virtualKeyboard" in navigator)) return;
  try {
    navigator.virtualKeyboard.overlaysContent = true;
  } catch { /* */ }
}
