#!/usr/bin/env node

// Resolve project cover images from GitHub.
// Custom Social Preview → use it; otherwise → fallback to socialify.git.ci
//
// Usage: node scripts/resolve-project-covers.mjs
// Optional: gh CLI (authenticated). Without it, all covers use socialify.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(__dirname, '../public/platform-config.json');

const SOCIALIFY_BASE = 'https://socialify.git.ci';
const SOCIALIFY_PARAMS = 'description=1&font=Inter&language=1&name=1&owner=1&pattern=Plus&theme=Auto';
const CUSTOM_PREVIEW_HOST = 'repository-images.githubusercontent.com';

function isGhAvailable() {
  try {
    execFileSync('gh', ['auth', 'status'], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function parseGitHubUrl(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

function fetchRepoMeta(owner, repo) {
  const query = 'query($owner:String!,$name:String!){repository(owner:$owner,name:$name){isPrivate openGraphImageUrl}}';
  try {
    const raw = execFileSync('gh', [
      'api', 'graphql',
      '-f', `query=${query}`,
      '-f', `owner=${owner}`,
      '-f', `name=${repo}`,
    ], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const data = JSON.parse(raw);
    const repoData = data?.data?.repository;
    return {
      isPrivate: repoData?.isPrivate ?? false,
      ogImageUrl: repoData?.openGraphImageUrl ?? null,
    };
  } catch {
    console.warn(`  ⚠ Failed to fetch repo metadata for ${owner}/${repo} — treating as private for safety`);
    return { isPrivate: true, ogImageUrl: null };
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

  const ghReady = isGhAvailable();
  if (!ghReady) {
    console.log('gh CLI not available, using socialify.git.ci for all covers.');
  }

  let changed = false;
  const privateRepos = [];

  for (const project of projects) {
    const codeUrl = project.links?.code;
    if (!codeUrl) continue;

    const gh = parseGitHubUrl(codeUrl);
    if (!gh) continue;

    console.log(`→ ${gh.owner}/${gh.repo}`);

    let cover;
    if (ghReady) {
      const meta = fetchRepoMeta(gh.owner, gh.repo);

      if (meta.isPrivate) {
        console.warn(`  ⛔ Private repo detected — will be excluded from build output`);
        privateRepos.push(project.id);
        continue;
      }

      if (meta.ogImageUrl && meta.ogImageUrl.includes(CUSTOM_PREVIEW_HOST)) {
        cover = meta.ogImageUrl;
        console.log(`  ✓ Custom Social Preview`);
      }
    }

    if (!cover) {
      cover = buildSocialifyUrl(gh.owner, gh.repo);
      if (ghReady) {
        console.log(`  ↪ Fallback to socialify.git.ci`);
      }
    }

    if (project.cover !== cover) {
      project.cover = cover;
      changed = true;
    }
  }

  // Filter out private repos from build output
  if (privateRepos.length > 0) {
    config.projects = projects.filter((p) => !privateRepos.includes(p.id));
    changed = true;
    console.log(`\n⚠ Filtered out ${privateRepos.length} private repo(s): ${privateRepos.join(', ')}`);
  }

  if (changed) {
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
    console.log('\n✓ platform-config.json updated');
  } else {
    console.log('\n— No changes needed');
  }
}

main();
