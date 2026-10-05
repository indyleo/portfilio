// theme.js — theme switcher shared by every page.
// Loaded in <head> (no defer) so the saved theme applies before first paint.
(function () {
  const THEMES = ["gruvbox", "nord", "catppuccin", "tokyonight"];
  const KEY = "theme";

  function saved() {
    try {
      const t = localStorage.getItem(KEY);
      return THEMES.includes(t) ? t : THEMES[0];
    } catch (e) {
      return THEMES[0];
    }
  }

  function setTheme(name) {
    if (!THEMES.includes(name)) return false;
    document.documentElement.setAttribute("data-theme", name);
    try {
      localStorage.setItem(KEY, name);
    } catch (e) {}
    const btn = document.getElementById("theme-btn");
    if (btn) btn.textContent = "theme: " + name;
    return true;
  }

  function cycle() {
    const cur = document.documentElement.getAttribute("data-theme");
    setTheme(THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length]);
  }

  document.documentElement.setAttribute("data-theme", saved());
  window.THEMES = THEMES;
  window.setTheme = setTheme;

  document.addEventListener("DOMContentLoaded", function () {
    const btn = document.createElement("button");
    btn.id = "theme-btn";
    btn.className = "theme-btn";
    btn.type = "button";
    btn.title = "Switch color theme";
    btn.addEventListener("click", cycle);
    document.body.appendChild(btn);
    btn.textContent = "theme: " + document.documentElement.getAttribute("data-theme");
  });
})();
