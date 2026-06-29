// Custom on-screen keyboard.
// A field opts in with inputmode="none" (suppress the native keyboard) plus
// data-keyboard="numbers" | "letters". The matching layout is shown while the
// field is focused, and its keys edit the field at the caret.
const kb = document.getElementById("keyboard");

const LAYOUTS = {
  numbers: [..."0123456789"],
  letters: [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"],
};

let activeInput = null;

function actionKey(action, label, cls) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "key " + cls;
  b.dataset.action = action;
  b.textContent = label;
  return b;
}

function renderKeyboard(type) {
  kb.className = "keyboard keyboard--" + type;
  kb.replaceChildren();
  for (const ch of LAYOUTS[type]) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "key";
    b.dataset.key = ch;
    b.textContent = ch;
    kb.append(b);
  }
  kb.append(actionKey("backspace", "⌫", "key--back"));
  kb.append(actionKey("enter", "Enter", "key--enter"));
}

export function hideKeyboard() {
  kb.hidden = true;
  activeInput = null;
}

function insertAtCaret(input, text) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  // Respect maxlength (setRangeText bypasses it) so 4-/8-digit codes stay bounded.
  if (input.maxLength > 0 && start === end && input.value.length >= input.maxLength) return;
  input.setRangeText(text, start, end, "end"); // caret-aware, replaces selection
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function backspace(input) {
  let start = input.selectionStart,
    end = input.selectionEnd;
  if (start === end && start > 0) start--; // no selection: delete char before caret
  input.setRangeText("", start, end, "end");
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

// The iPad return key: submit the field's form so a screen can react via
// <form onsubmit="…">. The global submit handler below stops a real reload.
function enter(input) {
  if (input.form) input.form.requestSubmit();
}

// Pressing a key must NOT steal focus from the field, or the caret is lost.
// Use mousedown (not pointerdown): on desktop, preventing the mousedown default
// is what actually stops focus from moving; `click` still fires to insert.
kb.addEventListener("mousedown", (e) => {
  if (e.target.closest(".key")) e.preventDefault();
});
kb.addEventListener("click", (e) => {
  const key = e.target.closest(".key");
  if (!key || !activeInput) return;
  if (key.dataset.action === "backspace") backspace(activeInput);
  else if (key.dataset.action === "enter") enter(activeInput);
  else insertAtCaret(activeInput, key.dataset.key);
});

// Forms here drive in-page navigation, never a server round-trip — keep Enter
// (and any submit) from reloading. Screens add their own onsubmit to react.
document.addEventListener("submit", (e) => e.preventDefault());

document.addEventListener("focusin", (e) => {
  const input = e.target.closest("[data-keyboard]");
  if (input && LAYOUTS[input.dataset.keyboard]) {
    activeInput = input;
    renderKeyboard(input.dataset.keyboard);
    kb.hidden = false;
  }
});
document.addEventListener("focusout", () => {
  // Once focus settles, hide unless it landed on another keyboard field.
  setTimeout(() => {
    if (!document.activeElement?.closest("[data-keyboard]")) hideKeyboard();
  });
});
