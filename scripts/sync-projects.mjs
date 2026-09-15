#!/usr/bin/env node
/**
 * Sync Maijied + Lorapok public repos → data/projects.json + README markers + portfolio/projects.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';

const CATEGORY_ORDER = ['flagship', 'ai', 'devtools', 'packages', 'games', 'other'];
const CATEGORY_HEADINGS = {
  flagship: 'Flagship — Lorapok Labs',
  ai: 'AI & agents',
  devtools: 'Developer tools',
  packages: 'Packages & distribution',
  games: 'Games and earlier work',
  other: 'More repositories',
};

const SITES = [
  { host: 'maizied.lorapok.tech', product: 'Personal portfolio' },
  { host: 'seeyou.lorapok.tech', product: 'SeeYou SEO platform' },
  { host: 'atlas.lorapok.tech', product: 'API Atlas' },
  { host: 'ai.lorapok.tech', product: 'Lorapok AI Agent' },
  { host: 'loragent.lorapok.tech', product: 'Loragent' },
  { host: 'cursor.lorapok.tech', product: 'Curse Monitor' },
  { host: 'reportkit.lorapok.tech', product: 'ReportKit' },
  { host: 'aswitchi.lorapok.tech', product: 'AswitchI' },
  { host: 'media.lorapok.tech', product: 'Media Player' },
  { host: 'lorapok.tech', product: 'Lorapok Labs hub' },
  { host: 'lorapok.github.io', product: 'Org GitHub Pages' },
];

function guessCategory(name, desc) {
  const blob = `${name} ${desc || ''}`.toLowerCase();
  if (/game|unity|hockey|jungle|flying|airhockey|love-and-lust|gamespark/.test(blob)) return 'games';
  if (/ai|agent|loragent|ollama|seeyou|sorcerer|red-bot/.test(blob)) return 'ai';
  if (/keyboard|subtitle|roast|packagist|npm|snap|execution-monitor|reportkit-ui/.test(blob)) return 'packages';
  if (/atlas|reportkit|cursor|curse|aswitchi|media|keyboard|linpad|git-geek|querycraft|tabman|monitor/.test(blob))
    return 'devtools';
  if (/lorapok|reportkit|seeyou|loragent/.test(blob)) return 'flagship';
  return 'other';
}

async function fetchAll(url) {
  const out = [];
  let page = 1;
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Maijied-sync-projects',
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  while (page <= 20) {
    const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}per_page=100&page=${page}`, { headers });
    if (!res.ok) throw new Error(`GitHub ${res.status} ${url}`);
    const batch = await res.json();
    if (!Array.isArray(batch) || !batch.length) break;
    out.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }
  return out;
}

function loadOverrides() {
  const p = path.join(ROOT, 'data/project-overrides.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function normalize(repo, overrides) {
  const o = overrides[repo.name] || {};
  const description = repo.description || '';
  const category = o.category || guessCategory(repo.name, description);
  return {
    name: repo.name,
    title: o.title || repo.name.replace(/[-_]/g, ' '),
    full_name: repo.full_name,
    owner: repo.owner?.login || repo.full_name.split('/')[0],
    description: o.blurb || description || 'Open-source project by Maijied / Lorapok Labs.',
    homepage: o.homepage || repo.homepage || '',
    html_url: repo.html_url,
    stars: repo.stargazers_count || 0,
    language: repo.language,
    category,
    featured: Boolean(o.featured),
    topics: repo.topics || [],
    updated_at: repo.updated_at,
  };
}

function renderReadmeTables(projects) {
  const byCat = Object.fromEntries(CATEGORY_ORDER.map((c) => [c, []]));
  for (const p of projects) {
    (byCat[p.category] || byCat.other).push(p);
  }
  let md = '';
  for (const cat of CATEGORY_ORDER) {
    const list = byCat[cat];
    if (!list.length) continue;
    list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.stars - a.stars || a.title.localeCompare(b.title));
    md += `\n### ${CATEGORY_HEADINGS[cat]}\n\n`;
    md += `| Project | Details | Links |\n|---|---|---|\n`;
    for (const p of list) {
      const links = [`[GitHub](${p.html_url})`];
      if (p.homepage) links.push(`[Live](${p.homepage})`);
      const star = p.stars ? ` · ⭐ ${p.stars}` : '';
      md += `| **${p.title}**${star} | ${p.description.replace(/\|/g, '\\|')} | ${links.join(' · ')} |\n`;
    }
  }
  md += `\n### Sites map (\`*.lorapok.tech\`)\n\n| Host | Product |\n|---|---|\n`;
  for (const s of SITES) {
    md += `| [${s.host}](https://${s.host}/) | ${s.product} |\n`;
  }
  return md.trim() + '\n';
}

function patchReadme(body) {
  const readmePath = path.join(ROOT, 'readme.md');
  let readme = fs.readFileSync(readmePath, 'utf8');
  const start = '<!-- PROJECTS:START -->';
  const end = '<!-- PROJECTS:END -->';
  if (!readme.includes(start) || !readme.includes(end)) {
    throw new Error('readme.md missing PROJECTS markers');
  }
  const re = /<!-- PROJECTS:START -->[\s\S]*?<!-- PROJECTS:END -->/;
  readme = readme.replace(re, `${start}\n${body}${end}`);
  fs.writeFileSync(readmePath, readme);
}

async function main() {
  const overrides = loadOverrides();
  const [userRepos, orgRepos] = await Promise.all([
    fetchAll('https://api.github.com/users/Maijied/repos'),
    fetchAll('https://api.github.com/orgs/Lorapok/repos'),
  ]);
  const seen = new Set();
  const projects = [];
  for (const repo of [...orgRepos, ...userRepos]) {
    if (repo.fork || repo.archived || repo.name.startsWith('.')) continue;
    if (seen.has(repo.name)) continue;
    seen.add(repo.name);
    projects.push(normalize(repo, overrides));
  }
  projects.sort((a, b) => Number(b.featured) - Number(a.featured) || b.stars - a.stars || a.name.localeCompare(b.name));

  fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'data/projects.json'), JSON.stringify(projects, null, 2) + '\n');
  fs.writeFileSync(path.join(ROOT, 'portfolio/projects.json'), JSON.stringify(projects, null, 2) + '\n');

  const table = renderReadmeTables(projects);
  patchReadme(table);
  console.log(`Synced ${projects.length} projects`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
