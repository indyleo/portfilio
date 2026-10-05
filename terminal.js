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
  { type: "val", text: "Alacritty" },
  { type: "comment", text: "# Music" },
  { type: "val", text: "Feishin  Subsonic-Tui" },
  { type: "comment", text: "# Browser" },
  { type: "val", text: "LibreWolf" },
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
const outputEl = document.getElementById("term-output");
const promptEl = document.getElementById("term-prompt");
const hintEl = document.getElementById("term-hint");
const inputEl = document.getElementById("term-input");
const skipBtn = document.getElementById("skip-btn");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
let skipped = reducedMotion;

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

const sleep = (ms) => new Promise((r) => setTimeout(r, skipped ? 0 : ms));

// Type a command character by character, returns a Promise
function typeCmd(line) {
  return new Promise((resolve) => {
    const span = document.createElement("span");
    span.className = "cmd";
    codeEl.appendChild(span);

    let i = 0;
    const interval = setInterval(() => {
      i = skipped ? line.text.length : i + 1;
      span.textContent = line.text.slice(0, i);
      if (i === line.text.length) {
        clearInterval(interval);
        codeEl.appendChild(document.createTextNode("\n"));
        setTimeout(resolve, skipped ? 0 : CMD_PAUSE);
      }
    }, CHAR_DELAY);
  });
}

// Run through all lines sequentially
async function runTerminal() {
  for (const line of LINES) {
    if (line.type === "cmd") {
      if (skipped) {
        appendLine(line);
      } else {
        await typeCmd(line);
      }
    } else {
      appendLine(line);
      await sleep(LINE_PAUSE);
    }
  }
  startPrompt();
}

// ── Interactive prompt ─────────────────────────────────────────────────────
const FILES = ["about.txt", "contact.txt", "install.sh", "projects/", "resume.txt", "uses.txt"];
const PAGES = { uses: "uses.html", resume: "resume.html", home: "index.html" };
const INSTALL_CMD = "curl -fsSL https://www.linuxlab.work/linux | bash";
const history = [];
let histIdx = 0;

function print(html) {
  const span = document.createElement("span");
  span.innerHTML = html + "\n";
  codeEl.appendChild(span);
}
function printLines(rows) {
  rows.forEach((r) => print(r));
}
function link(href, text, external) {
  return `<a href="${href}"${external ? ' target="_blank" rel="noopener"' : ""}>${esc(text || href)}</a>`;
}
function scrollDown() {
  outputEl.scrollTop = outputEl.scrollHeight;
  promptEl.scrollIntoView({ block: "nearest" });
}

const CAT = {
  "about.txt": () => [
    `<span class="val">indyleo</span> — backend developer, Linux tinkerer, systems programmer.`,
    `Always learning. Mostly Rust, Go, C and shell.`,
  ],
  "contact.txt": () => [
    `github   ${link("https://github.com/indyleo", "github.com/indyleo", true)}`,
    `youtube  ${link("https://youtube.com/@Indy_leo", "@Indy_leo", true)}`,
    `twitch   ${link("https://twitch.tv/indy_leo", "indy_leo", true)}`,
    `reddit   ${link("https://www.reddit.com/user/AnnonRU", "u/AnnonRU", true)}`,
  ],
  "install.sh": () => [
    `<span class="comment"># Catalyst installer</span>`,
    `<span class="val">${esc(INSTALL_CMD)}</span>`,
  ],
  "resume.txt": () => [
    `Full resume: ${link("resume.html", "resume.html")}  (type <span class="cmd">cd resume</span> to open it)`,
  ],
  "uses.txt": () => [
    `Arch Linux, zsh + starship, Neovim, Alacritty, Gruvbox everywhere.`,
    `Full list: ${link("uses.html", "uses.html")}`,
  ],
};

const COMMANDS = {
  help: () => [
    `<span class="cmd">help</span>              this list`,
    `<span class="cmd">ls</span>                list files`,
    `<span class="cmd">cat &lt;file&gt;</span>       read a file (try <span class="val">about.txt</span>)`,
    `<span class="cmd">projects</span>          what I've built`,
    `<span class="cmd">github</span>            recently updated repos (live)`,
    `<span class="cmd">install</span>           the Catalyst one-liner`,
    `<span class="cmd">cd uses|resume</span>    open a page`,
    `<span class="cmd">theme [name]</span>     ${esc(window.THEMES.join(", "))}`,
    `<span class="cmd">neofetch</span>          system info`,
    `<span class="cmd">clear</span>             clear the screen`,
  ],
  whoami: () => ["indyleo"],
  pwd: () => ["/home/indyleo"],
  date: () => [new Date().toString()],
  ls: () => [`<span class="val">${FILES.join("   ")}</span>`],
  projects: () => {
    const cards = [...document.querySelectorAll(".project-card")];
    return cards.map((c) => {
      const a = c.querySelector("a");
      const d = c.querySelector(".project-desc").textContent.trim();
      return `${link(a.href, a.textContent.trim(), true)}  <span class="comment"># ${esc(d)}</span>`;
    });
  },
  install: () => [
    `<span class="comment"># clones Catalyst and lets you pick a branch with fzf (needs git + fzf)</span>`,
    `<span class="val">${esc(INSTALL_CMD)}</span>`,
  ],
  neofetch: () => [
    `<span class="val">indyleo</span>@<span class="val">arch</span>`,
    `---------------`,
    `<span class="cmd">OS</span>:       Arch Linux (btw)`,
    `<span class="cmd">Shell</span>:    zsh + starship`,
    `<span class="cmd">Editor</span>:   Neovim`,
    `<span class="cmd">Terminal</span>: Alacritty`,
    `<span class="cmd">Theme</span>:    ${esc(document.documentElement.getAttribute("data-theme"))}`,
  ],
  clear: () => {
    codeEl.textContent = "";
    return [];
  },
  sudo: () => [`<span class="err">indyleo is not in the sudoers file. This incident will be reported.</span>`],
  vim: () => [`<span class="comment">Nice try. Can't exit it from here either way. (:q!)</span>`],
  nvim: () => COMMANDS.vim(),
  exit: () => [`<span class="comment">There's no escape. Try closing the tab.</span>`],
  hello: () => ["Hi! Type <span class=\"cmd\">help</span> to look around."],
  "rm -rf /": () => [
    `<span class="err">rm: it is dangerous to operate recursively on '/'</span>`,
    `<span class="err">rm: use --no-preserve-root to override this failsafe</span>`,
    `<span class="comment"># nice try</span>`,
  ],
};

async function runCommand(raw) {
  const cmd = raw.trim().replace(/\s+/g, " ");
  print(`<span class="cmd">$ ${esc(raw)}</span>`);
  if (!cmd) return;
  const [name, ...args] = cmd.split(" ");

  if (COMMANDS[cmd]) return printLines(COMMANDS[cmd]());

  switch (name) {
    case "cat": {
      const f = args[0];
      if (!f) return print("usage: cat &lt;file&gt;");
      if (CAT[f]) return printLines(CAT[f]());
      return print(`<span class="err">cat: ${esc(f)}: no such file or directory</span>`);
    }
    case "cd": {
      const t = (args[0] || "home").replace(/^~\/?|\/$/g, "").replace(/\.html$/, "") || "home";
      if (PAGES[t]) {
        print(`<span class="comment"># opening ${PAGES[t]}…</span>`);
        setTimeout(() => (window.location.href = PAGES[t]), 400);
        return;
      }
      if (t === "projects") return printLines(COMMANDS.projects());
      return print(`<span class="err">cd: ${esc(t)}: no such directory</span>`);
    }
    case "theme": {
      if (!args[0]) {
        return print(
          `current: <span class="val">${esc(document.documentElement.getAttribute("data-theme"))}</span>  options: ${esc(window.THEMES.join(", "))}`,
        );
      }
      if (window.setTheme(args[0])) return print(`<span class="comment"># theme set to ${esc(args[0])}</span>`);
      return print(`<span class="err">theme: unknown theme '${esc(args[0])}'</span> — try ${esc(window.THEMES.join(", "))}`);
    }
    case "github": {
      print(`<span class="comment"># fetching from api.github.com…</span>`);
      const repos = await (window.ghRepos || Promise.resolve([]));
      if (!repos.length) return print(`<span class="err">couldn't reach the GitHub API (rate limited or offline)</span>`);
      return repos.slice(0, 8).forEach((r) =>
        print(`${link(r.url, r.name, true)}  <span class="comment"># ${esc(r.lang || "—")}, updated ${esc(ghAgo(r.pushed))}</span>`),
      );
    }
    case "echo":
      return print(esc(args.join(" ")));
    case "sudo":
      return printLines(COMMANDS.sudo());
    default:
      return print(`<span class="err">${esc(name)}: command not found</span> — try <span class="cmd">help</span>`);
  }
}

function startPrompt() {
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  promptEl.hidden = false;
  hintEl.hidden = false;
  skipBtn.hidden = true;
  inputEl.focus({ preventScroll: true });
}

promptEl.addEventListener("click", () => inputEl.focus());

inputEl.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const value = inputEl.value;
    inputEl.value = "";
    if (value.trim()) {
      history.push(value);
    }
    histIdx = history.length;
    await runCommand(value);
    scrollDown();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (histIdx > 0) inputEl.value = history[--histIdx];
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    histIdx = Math.min(histIdx + 1, history.length);
    inputEl.value = history[histIdx] || "";
  } else if (e.key === "Tab") {
    e.preventDefault();
    const v = inputEl.value;
    const pool = [...Object.keys(COMMANDS), ...FILES, "cat", "cd", "theme", "github", "echo"];
    const last = v.split(" ").pop();
    const hits = [...new Set(pool)].filter((c) => last && c.startsWith(last));
    if (hits.length === 1) inputEl.value = v.slice(0, v.length - last.length) + hits[0];
  } else if (e.key === "l" && e.ctrlKey) {
    e.preventDefault();
    COMMANDS.clear();
  }
});

// ── Skip animation ─────────────────────────────────────────────────────────
skipBtn.addEventListener("click", () => {
  skipped = true;
});

runTerminal();

// ── Copy to clipboard ──────────────────────────────────────────────────────
function flashCopied(btn, label) {
  btn.textContent = "copied!";
  btn.classList.add("copied");
  setTimeout(() => {
    btn.textContent = label;
    btn.classList.remove("copied");
  }, 2000);
}

function copyText(text, btn) {
  const label = btn.textContent;
  navigator.clipboard
    .writeText(text)
    .then(() => flashCopied(btn, label))
    .catch(() => {
      // Fallback for older browsers / http
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      flashCopied(btn, label);
    });
}

const copyBtn = document.getElementById("copy-btn");
copyBtn.addEventListener("click", () => copyText(plainText(), copyBtn));

const installBtn = document.getElementById("install-copy");
if (installBtn) {
  installBtn.addEventListener("click", () => copyText(INSTALL_CMD, installBtn));
}
