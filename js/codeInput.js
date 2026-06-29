// Answer-"slots" helper. Wires a row of circle <span class="slot"> elements to a
// hidden, focusable <input> so the on-screen keyboard can fill them: tapping the
// row focuses the input (raising the keyboard); typing fills the circles in order.
//
//   wireCode(slotsEl, inputEl)  ->  render()
//
// Returns a render() you can call after setting inputEl.value programmatically
// (e.g. clearing it), since that doesn't fire an "input" event.
//
// Exposed on window so screens (whose inline <script> runs as a classic script,
// not a module) can call wireCode(...) directly.
export function wireCode(slotsEl, inputEl) {
  const slots = [...slotsEl.querySelectorAll(".slot")];
  const render = () => slots.forEach((s, i) => (s.textContent = inputEl.value[i] || "X"));
  inputEl.addEventListener("input", render);
  slotsEl.addEventListener("click", () => inputEl.focus());
  render();
  return render;
}

window.wireCode = wireCode;
