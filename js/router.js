// Hash-based router. A screen id is a path-like hash ('intro', '1', '1/code',
// '3') mapped to a file under steps/. Navigation is driven by <a href="#id">
// links inside the screens; the swap is animated with the View Transitions API.
import { hideKeyboard } from "./keyboard.js";

const slot = document.getElementById("slot");
const back = document.getElementById("back");
const missionEl = document.getElementById("mission-name");

// The id is sanitized so a hash can never fetch outside steps/.
function fileFor(id) {
  const safe = id.replace(/[^\w/-]/g, "");
  return "steps/" + safe + ".html";
}

// The socle's top UI shows the mission. A screen can override the label with a
// [data-mission] element (its way of talking to the socle); else it's derived here.
function missionLabel(id) {
  const seg = id.split("/")[0];
  if (seg === "intro") return "INTRO";
  if (/^\d+$/.test(seg)) return "MISSION " + seg;
  return seg.toUpperCase();
}

// <script> inserted via innerHTML is parsed but never executed; re-create each
// one so per-screen scripts run (works for inline and external src scripts).
function runScripts(container) {
  for (const old of container.querySelectorAll("script")) {
    const s = document.createElement("script");
    for (const a of old.attributes) s.setAttribute(a.name, a.value);
    s.textContent = old.textContent;
    old.replaceWith(s);
  }
}

async function show() {
  const id = location.hash.slice(1) || "debug"; // the debug index is the home page
  const res = await fetch(fileFor(id));
  if (!res.ok) {
    console.warn("No screen for #" + id);
    return;
  }
  const fragment = await res.text();

  const update = () => {
    slot.innerHTML = fragment;
    runScripts(slot);
    back.hidden = id === "debug"; // home page (no back)
    missionEl.textContent =
      slot.querySelector("[data-mission]")?.getAttribute("data-mission") ??
      missionLabel(id);
    hideKeyboard(); // reset the keyboard between screens
  };

  if (document.startViewTransition) document.startViewTransition(update);
  else update();
}

back.onclick = () => history.back(); // returns to wherever you came from
window.addEventListener("hashchange", show);
show();
