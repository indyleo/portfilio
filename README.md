# Portfolio

Personal site for **indyleo**: a terminal-themed, no-build static site.
Live at [www.linuxlab.work](https://www.linuxlab.work).

## Features

- **Interactive terminal.** After the intro animation, type commands
  (`help`, `ls`, `cat about.txt`, `projects [tag]`, `github`, `install`,
  `theme nord`, `neofetch`, `cd uses`). Tab completes, up/down recalls history.
  There are a few easter eggs too.
- **Skip button.** Skips the typing animation. It is skipped automatically
  when the visitor prefers reduced motion.
- **Theme switcher.** Gruvbox (default), Nord, Catppuccin and Tokyo Night.
  Use the button in the top right or `theme <name>`. The choice is saved in
  `localStorage` and applies on every page.
- **Live GitHub data.** Project cards show language, stars and last-updated
  time, and a "Recently Updated" list is built from the GitHub API. Responses
  are cached per session, and the static cards still work if the API is
  unreachable or rate limited.
- **Install one-liner** for [Catalyst](https://github.com/indyleo/Catalyst),
  with a copy button.
- **Resume page** (`resume.html`) with a print stylesheet, so "save as pdf"
  produces a clean light-themed document.
- **`/uses` page** with a jump nav, hardware and desktop sections, and an
  automatic "last updated" date.