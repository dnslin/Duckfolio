#!/usr/bin/env tsx

/**
 * GitHub GraphQL 数据获取脚本
 * 构建时执行，获取贡献日历 + 统计数据 → public/github-data.json
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { getConfig } from '../src/lib/config.js';
import type { GitHubConfig, GitHubData, GitHubStatsData } from '../src/lib/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- 类型定义 ---


interface GraphQLResponse {
  data?: {
    user: {
      contributionsCollection: {
        startedAt: string;
        endedAt: string;
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{
              date: string;
              contributionCount: number;
            }>;
          }>;
        };
        totalCommitContributions: number;
      };
      repositories: {
        nodes: Array<{ stargazerCount: number } | null> | null;
      };
      pullRequests: { totalCount: number };
      issues: { totalCount: number };
    } | null;
  } | null;
  errors?: Array<{ message: string }>;
}

// --- 常量 ---

const OUTPUT_PATH = resolve(__dirname, '../public/github-data.json');
const GITHUB_API = 'https://api.github.com/graphql';

const QUERY = `
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      startedAt
      endedAt
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
      totalCommitContributions
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {field: STARGAZERS, direction: DESC}) {
      nodes {
        stargazerCount
      }
    }
    pullRequests(first: 1) { totalCount }
    issues(first: 1) { totalCount }
  }
}`;

// --- 核心函数 ---


async function fetchGitHubData(username: string, token: string): Promise<GraphQLResponse> {
  const res = await fetch(GITHUB_API, {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: QUERY, variables: { username } }),
  });

  if (!res.ok) {
    throw new Error(`GitHub API 返回 ${res.status}: ${res.statusText}`);
  }

  const data: GraphQLResponse = await res.json();
  return data;
}

function parseResponse(data: GraphQLResponse): Extract<GitHubData, { status: 'success' }> {
  const user = data.data?.user;
  if (!user) {
    throw new Error('GitHub API 未返回用户数据，请检查 username 是否正确');
  }

  const calendar = user.contributionsCollection.contributionCalendar;
  const repositories = user.repositories.nodes;
  if (!repositories) {
    throw new Error('GitHub API 未返回完整仓库数据');
  }
  const totalStars = repositories.reduce((sum, repository) => {
    if (!repository) throw new Error('GitHub API 未返回完整仓库数据');
    return sum + repository.stargazerCount;
  }, 0);

  return {
    status: 'success',
    contributions: {
      startedAt: user.contributionsCollection.startedAt,
      endedAt: user.contributionsCollection.endedAt,
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks.map(w => ({
        contributionDays: w.contributionDays.map(d => ({
          date: d.date,
          contributionCount: d.contributionCount,
        })),
      })),
    },
    stats: {
      totalStars,
      totalCommits: user.contributionsCollection.totalCommitContributions,
      totalPRs: user.pullRequests.totalCount,
      totalIssues: user.issues.totalCount,
    },
    fetchedAt: new Date().toISOString(),
  };
}

function buildUnavailableData(
  status: 'unconfigured' | 'missing-token' | 'error',
  overrides?: Partial<GitHubStatsData>,
): GitHubData {
  return { status, contributions: null, stats: overrides ?? {}, fetchedAt: null };
}

export async function collectGitHubData(
  config: GitHubConfig | undefined,
  token: string | undefined,
): Promise<GitHubData> {
  if (!config?.username) return buildUnavailableData('unconfigured');
  if (!token) return buildUnavailableData('missing-token', config.statsOverrides);

  try {
    const response = await fetchGitHubData(config.username, token);
    if (response.errors?.length) {
      throw new Error(response.errors.map(error => error.message).join('; '));
    }
    return parseResponse(response);
  } catch (error) {
    console.error('GitHub 数据获取失败:', error instanceof Error ? error.message : error);
    return buildUnavailableData('error', config.statsOverrides);
  }
}

async function main() {
  // tsx does not load .env.local; only the CLI entry loads it and writes the snapshot.
  const envPath = resolve(__dirname, '../.env.local');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
    }
  }

  const result = await collectGitHubData(getConfig().github, process.env.GITHUB_TOKEN);
  // Always replace the snapshot, including when configuration was removed.
  writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2) + '\n');
  console.log(`GitHub 数据状态: ${result.status}; 已写入 public/github-data.json`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main();
}
