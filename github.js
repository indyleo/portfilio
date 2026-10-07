// github.js — live repo data from the GitHub API.
// Fills in stars/language/last-updated on project cards and lists recently
// updated repos. Cached in sessionStorage (the API allows 60 requests/hour
// per IP without a token). Fails silently: the static cards still work.
const GH_USER = "indyleo";
const GH_KEY = "gh-repos-v1";

function ghAgo(iso) {
  const days = Math.floor((Date.now() - new Date(iso)) / 864e5);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return days + " days ago";
  const months = Math.floor(days / 30);
  if (months < 12) return months + (months === 1 ? " month ago" : " months ago");
  const years = Math.floor(months / 12);
  return years + (years === 1 ? " year ago" : " years ago");
}

window.ghRepoCount = fetch(`https://api.github.com/users/${GH_USER}`)
  .then((res) => {
    if (!res.ok) throw new Error(res.status);
    return res.json();
  })
  .then((user) => user.public_repos)
  .catch(() => null);

window.ghRepos = (async function () {
  try {
    const cached = sessionStorage.getItem(GH_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  try {
    const res = await fetch(
      `https://api.github.com/users/${GH_USER}/repos?sort=pushed&per_page=100`,
    );
    if (!res.ok) throw new Error(res.status);
    const repos = (await res.json())
      .filter((r) => !r.fork)
      .map((r) => ({
        name: r.name,
        url: r.html_url,
        desc: r.description || "",
        stars: r.stargazers_count,
        lang: r.language || "",
        pushed: r.pushed_at,
      }));
    try {
      sessionStorage.setItem(GH_KEY, JSON.stringify(repos));
    } catch (e) {}
    return repos;
  } catch (e) {
    return [];
  }
})();

function ghMeta(r) {
  const parts = [];
  if (r.lang) parts.push(r.lang);
  if (r.stars) parts.push("★ " + r.stars);
  parts.push("updated " + ghAgo(r.pushed));
  return parts;
}

window.ghRepos.then((repos) => {
  if (!repos.length) return;
  const shown = new Set();

  document.querySelectorAll(".project-card").forEach((card) => {
    const link = card.querySelector("a");
    if (!link) return;
    const name = link.href.split("/").pop().toLowerCase();
    const repo = repos.find((r) => r.name.toLowerCase() === name);
    if (!repo) return;
    shown.add(repo.name);
    const meta = card.querySelector(".repo-meta");
    if (meta)
      ghMeta(repo).forEach((t) => {
        const s = document.createElement("span");
        s.textContent = t;
        meta.appendChild(s);
      });
  });

  const list = document.getElementById("recent-list");
  if (!list) return;
  const others = repos.filter((r) => !shown.has(r.name)).slice(0, 6);
  if (!others.length) return;
  others.forEach((r) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = r.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = r.name;
    li.appendChild(a);
    const meta = document.createElement("span");
    meta.className = "repo-meta";
    ghMeta(r).forEach((t) => {
      const s = document.createElement("span");
      s.textContent = t;
      meta.appendChild(s);
    });
    li.appendChild(meta);
    if (r.desc) {
      const d = document.createElement("span");
      d.className = "desc";
      d.textContent = r.desc;
      li.appendChild(d);
    }
    list.appendChild(li);
  });
  document.getElementById("recent").hidden = false;
});