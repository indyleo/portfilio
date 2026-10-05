# Portfolio

Personal site for **indyleo**: a terminal-themed, no-build static site.
Live at [www.linuxlab.work](https://www.linuxlab.work).

## Features

- **Interactive terminal.** After the intro animation, type commands
  (`help`, `ls`, `cat about.txt`, `projects`, `github`, `install`,
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
- **Open Graph / Twitter tags**, an SVG favicon and a 1200x630 preview image.

## Install Catalyst

```sh
curl -fsSL https://www.linuxlab.work/linux | bash
```

The `linux` file in this repo is the bootstrap script served at that URL. It
clones Catalyst and lets you pick a branch to run or view with `fzf`
(requires `git` and `fzf`). Read it before piping anything into your shell.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Home: terminal, projects, install, links |
| `uses.html` | Setup and tools |
| `resume.html` | Resume (printable) |
| `404.html` | Not-found page, styled as a failed `cat` |
| `style.css` | All styles, with theme variables at the top |
| `terminal.js` | Typing animation, interactive prompt, copy buttons |
| `theme.js` | Theme switcher (loaded in `<head>` to avoid a flash) |
| `github.js` | Live repo data from the GitHub API |
| `linux` | Install script served at `/linux` |
| `favicon.svg`, `og-image.png` | Favicon and social preview image |
| `CNAME` | Custom domain for GitHub Pages |

## Run locally

No build step. Serve the folder with any static server:

```sh
python -m http.server 8000
```

Then open <http://localhost:8000>. Open the pages through a server rather
than as `file://` URLs so the GitHub API calls and clipboard access work.

## Customizing

- **Add a command:** add an entry to `COMMANDS` (or a file to `CAT`) in
  `terminal.js`.
- **Add a theme:** add a `:root[data-theme="name"]` block in `style.css`
  and the name to `THEMES` in `theme.js`.
- **Resume:** add Experience and Education using the commented blocks in
  `resume.html`.
- **Preview image:** replace `og-image.png` (1200x630) and keep the filename.

## Deploy

Hosted on GitHub Pages. Pushing to the default branch publishes the site,
and `CNAME` points it at `www.linuxlab.work`.
