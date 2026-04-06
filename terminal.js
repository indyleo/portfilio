// terminal.js — typing animation + copy to clipboard

// Each entry is either:
//   { type: 'cmd',     text: '...' }   — typed out char by char in green
//   { type: 'output',  text: '...' }   — appears instantly as plain output
//   { type: 'comment', text: '...' }   — appears instantly in muted color
//   { type: 'val',     text: '...' }   — appears instantly in aqua
//   { type: 'blank' }                  — empty line
const LINES = [
  { type: "cmd", text: "$ whoami" },
  { type: "output", text: "indyleo" },
  { type: "blank" },
  { type: "cmd", text: "$ uname -a" },
  {
    type: "output",
    text: "Linux-first (Arch/Debian), also works with Windows",
  },
  { type: "blank" },
  { type: "cmd", text: "$ cat ~/languages.txt" },
  { type: "comment", text: "# Compiled" },
  { type: "val", text: "Go  Rust  C  C++  Zig  Asm x86_64" },
  { type: "comment", text: "# Scripting" },
  { type: "val", text: "Shell  PowerShell" },
  { type: "comment", text: "# Web" },
  { type: "val", text: "JavaScript  TypeScript  HTML  CSS" },
  { type: "comment", text: "# Interpreted" },
  { type: "val", text: "Python  Lua" },
  { type: "comment", text: "# Build Systems" },
  { type: "val", text: "Make  CMake  Just" },
  { type: "comment", text: "# Misc" },
  { type: "val", text: "Ino/Arduino  Markdown  Vim" },
  { type: "blank" },
  { type: "cmd", text: "$ cat ~/currently.txt" },
  { type: "comment", text: "# OS" },
  { type: "val", text: "Arch Linux (btw)" },
  { type: "comment", text: "# Shell" },
  { type: "val", text: "zsh + starship" },
  { type: "comment", text: "# Editor" },
  { type: "val", text: "Neovim" },
  { type: "comment", text: "# Terminal" },
  { type: "val", text: "Foot" },
  { type: "blank" },
  { type: "cmd", text: "$ echo $INTERESTS" },
  { type: "output", text: "Keyboards, workflows, tools, home servers, and AI" },
  { type: "blank" },
  { type: "cmd", text: "$ dotfiles > everything.txt" },
  { type: "output", text: "true" },
];

// Typing speed in ms per character for commands
const CHAR_DELAY = 38;
// Pause after a command finishes before output appears
const CMD_PAUSE = 120;
// Pause between lines
const LINE_PAUSE = 60;

const codeEl = document.getElementById("term-code");

// Build a plain-text version for the clipboard (no HTML tags)
function plainText() {
  return LINES.map((l) => (l.type === "blank" ? "" : l.text)).join("\n");
}

// Escape text so it's safe to inject as innerHTML
function esc(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Wrap text in the right span based on type
function wrapLine(line) {
  switch (line.type) {
    case "cmd":
      return `<span class="cmd">${esc(line.text)}</span>`;
    case "comment":
      return `<span class="comment">${esc(line.text)}</span>`;
    case "val":
      return `<span class="val">${esc(line.text)}</span>`;
    case "blank":
      return "";
    default:
      return esc(line.text);
  }
}

// Append a completed line node + newline to the code element
function appendLine(line) {
  const span = document.createElement("span");
  span.innerHTML = wrapLine(line) + "\n";
  codeEl.appendChild(span);
}

// Type a command character by character, returns a Promise
function typeCmd(line) {
  return new Promise((resolve) => {
    const span = document.createElement("span");
    span.className = "cmd";
    codeEl.appendChild(span);

    let i = 0;
    const interval = setInterval(() => {
      span.textContent = line.text.slice(0, ++i);
      if (i === line.text.length) {
        clearInterval(interval);
        // Append the newline after the span
        codeEl.appendChild(document.createTextNode("\n"));
        setTimeout(resolve, CMD_PAUSE);
      }
    }, CHAR_DELAY);
  });
}

// Run through all lines sequentially
async function runTerminal() {
  for (const line of LINES) {
    if (line.type === "cmd") {
      await typeCmd(line);
    } else {
      appendLine(line);
      await new Promise((r) => setTimeout(r, LINE_PAUSE));
    }
  }

  // Add blinking cursor at the end
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  codeEl.appendChild(cursor);
}

runTerminal();

// ── Copy to clipboard ──────────────────────────────────────────────────────
const copyBtn = document.getElementById("copy-btn");

copyBtn.addEventListener("click", () => {
  navigator.clipboard
    .writeText(plainText())
    .then(() => {
      copyBtn.textContent = "copied!";
      copyBtn.classList.add("copied");
      setTimeout(() => {
        copyBtn.textContent = "copy";
        copyBtn.classList.remove("copied");
      }, 2000);
    })
    .catch(() => {
      // Fallback for older browsers / http
      const ta = document.createElement("textarea");
      ta.value = plainText();
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      copyBtn.textContent = "copied!";
      setTimeout(() => {
        copyBtn.textContent = "copy";
      }, 2000);
    });
});
