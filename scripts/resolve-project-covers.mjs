#!/usr/bin/env node

// Resolve project cover images from GitHub.
// Custom Social Preview → use it; otherwise → fallback to socialify.git.ci
//
// Usage: node scripts/resolve-project-covers.mjs
// Requires: gh CLI authenticated

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(__dirname, '../public/platform-config.json');

const SOCIALIFY_BASE = 'https://socialify.git.ci';
const SOCIALIFY_PARAMS = 'description=1&font=Inter&language=1&name=1&owner=1&pattern=Plus&theme=Auto';
const CUSTOM_PREVIEW_HOST = 'repository-images.githubusercontent.com';

function parseGitHubUrl(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

function fetchOgImage(owner, repo) {
  const query = `query { repository(owner:"${owner}", name:"${repo}") { openGraphImageUrl } }`;
  try {
    const raw = execSync(`gh api graphql -f query='${query}'`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    const data = JSON.parse(raw);
    return data?.data?.repository?.openGraphImageUrl ?? null;
  } catch {
    console.warn(`  ⚠ Failed to fetch OG image for ${owner}/${repo}`);
    return null;
  }
}

function buildSocialifyUrl(owner, repo) {
  return `${SOCIALIFY_BASE}/${owner}/${repo}/image?${SOCIALIFY_PARAMS}`;
}

function main() {
  const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  const projects = config.projects ?? [];

  if (!projects.length) {
    console.log('No projects found in config.');
    return;
  }

  let changed = false;
  for (const project of projects) {
    const codeUrl = project.links?.code;
    if (!codeUrl) continue;

    const gh = parseGitHubUrl(codeUrl);
    if (!gh) continue;

    console.log(`→ ${gh.owner}/${gh.repo}`);
    const ogUrl = fetchOgImage(gh.owner, gh.repo);

    let cover;
    if (ogUrl && ogUrl.includes(CUSTOM_PREVIEW_HOST)) {
      cover = ogUrl;
      console.log(`  ✓ Custom Social Preview`);
    } else {
      cover = buildSocialifyUrl(gh.owner, gh.repo);
      console.log(`  ↪ Fallback to socialify.git.ci`);
    }

    if (project.cover !== cover) {
      project.cover = cover;
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
    console.log('\n✓ platform-config.json updated');
  } else {
    console.log('\n— No changes needed');
  }
}

main();
