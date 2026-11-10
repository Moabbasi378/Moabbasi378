import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const USERNAME = "Moabbasi378";
const assetsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");

const BG = "#0D1117";
const TITLE = "#7C8CFF";
const TEXT = "#C9D1D9";
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Ubuntu,Sans-Serif";

const LANG_COLORS = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Shell: "#89e051",
  Go: "#00add8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4f5d95",
  Ruby: "#701516",
  Swift: "#f05138",
  Kotlin: "#a97bff",
  Dart: "#00b4ab",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Dockerfile: "#384d54",
};

const ICONS = {
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  commit: '<circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/>',
  pr: '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/>',
  issue: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  repo: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
};

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "profile-stats-generator",
};
if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c],
  );

function icon(name, x, y) {
  return `<g transform="translate(${x} ${y}) scale(0.6667)" stroke="${TITLE}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</g>`;
}

function statsCard(name, rows) {
  const height = 195;
  const body = rows
    .map(([iconName, label, value], i) => {
      const y = 62 + i * 25;
      return `  ${icon(iconName, 25, y - 13)}
  <text x="50" y="${y}" font-family="${FONT}" font-size="14" fill="${TEXT}">${esc(label)}</text>
  <text x="470" y="${y}" text-anchor="end" font-family="${FONT}" font-size="14" font-weight="600" fill="${TEXT}">${esc(value)}</text>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="495" height="${height}" viewBox="0 0 495 ${height}" role="img" aria-label="GitHub stats for ${esc(USERNAME)}">
  <rect width="495" height="${height}" rx="10" fill="${BG}"/>
  <text x="25" y="35" font-family="${FONT}" font-size="18" font-weight="600" fill="${TITLE}">${esc(name)}'s GitHub Stats</text>
${body}
</svg>
`;
}

function topLangsCard(entries) {
  const height = 55 + entries.length * 25 + 12;
  const body = entries
    .map(([lang, pct], i) => {
      const y = 58 + i * 25;
      const color = LANG_COLORS[lang] || TITLE;
      const width = Math.max((pct / 100) * 250, 4);
      return `  <text x="25" y="${y}" font-family="${FONT}" font-size="13" font-weight="600" fill="${TEXT}">${esc(lang)}</text>
  <rect x="150" y="${y - 9}" width="250" height="8" rx="4" fill="${TEXT}" opacity="0.12"/>
  <rect x="150" y="${y - 9}" width="${width.toFixed(1)}" height="8" rx="4" fill="${color}"/>
  <text x="470" y="${y}" text-anchor="end" font-family="${FONT}" font-size="12.5" fill="${TEXT}">${pct.toFixed(1)}%</text>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="495" height="${height}" viewBox="0 0 495 ${height}" role="img" aria-label="Most used languages by ${esc(USERNAME)}">
  <rect width="495" height="${height}" rx="10" fill="${BG}"/>
  <text x="25" y="35" font-family="${FONT}" font-size="18" font-weight="600" fill="${TITLE}">Most Used Languages</text>
${body}
</svg>
`;
}

const [user, firstPage, commits, prs, issues] = await Promise.all([
  gh(`/users/${USERNAME}`),
  gh(`/users/${USERNAME}/repos?per_page=100&type=owner`),
  gh(`/search/commits?q=author:${USERNAME}`),
  gh(`/search/issues?q=author:${USERNAME}+type:pr`),
  gh(`/search/issues?q=author:${USERNAME}+type:issue`),
]);

const repos = [...firstPage];
for (let page = 2; repos.length === (page - 1) * 100; page++) {
  repos.push(...(await gh(`/users/${USERNAME}/repos?per_page=100&type=owner&page=${page}`)));
}

const stars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
const rows = [
  ["star", "Total Stars Earned", stars],
  ["commit", "Total Commits", commits.total_count],
  ["pr", "Total PRs", prs.total_count],
  ["issue", "Total Issues", issues.total_count],
  ["repo", "Public Repos", user.public_repos],
];

const langCounts = new Map();
for (const repo of repos) {
  if (repo.fork || !repo.language) continue;
  langCounts.set(repo.language, (langCounts.get(repo.language) || 0) + 1);
}
const langTotal = [...langCounts.values()].reduce((a, b) => a + b, 0);
const topLangs = [...langCounts.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8)
  .map(([lang, count]) => [lang, (count / langTotal) * 100]);

mkdirSync(assetsDir, { recursive: true });
writeFileSync(join(assetsDir, "stats.svg"), statsCard(user.name || USERNAME, rows));
writeFileSync(join(assetsDir, "top-langs.svg"), topLangsCard(topLangs));

console.log(`Stats: ${stars} stars, ${commits.total_count} commits, ${prs.total_count} PRs, ${issues.total_count} issues, ${user.public_repos} repos`);
console.log(`Languages: ${topLangs.map(([lang, pct]) => `${lang} ${pct.toFixed(1)}%`).join(", ")}`);