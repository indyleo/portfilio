// theme.js
const root = document.documentElement;
const btn = document.getElementById("theme-toggle");

// Load saved theme
const saved = localStorage.getItem("theme");
if (saved === "gruvbox") {
  root.classList.add("gruvbox");
  btn.textContent = "Switch to Nord";
} else {
  btn.textContent = "Switch to Gruvbox";
}

btn.addEventListener("click", () => {
  root.classList.toggle("gruvbox");
  const isGruv = root.classList.contains("gruvbox");
  localStorage.setItem("theme", isGruv ? "gruvbox" : "nord");
  btn.textContent = isGruv ? "Switch to Nord" : "Switch to Gruvbox";
});
