// Shell-level "Aide" overlay any screen can open: openAide("some help text").
const aide = document.getElementById("aide");

window.openAide = (text) => {
  document.getElementById("aide-body").textContent = text || "";
  aide.hidden = false;
};

document.getElementById("aide-close").addEventListener("click", () => (aide.hidden = true));
aide.addEventListener("click", (e) => {
  if (e.target === aide) aide.hidden = true;
});
