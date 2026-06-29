// Entry point: wires the socle's modules together.
import "./keyboard.js"; // on-screen keyboard
import "./aide.js"; // shared Aide / hint overlay
import "./codeInput.js"; // wireCode() helper for answer-slot widgets
import "./fuzzy.js"; // fuzzyMatch() helper for free-text answers
import "./router.js"; // screen routing (imports keyboard for hideKeyboard)
