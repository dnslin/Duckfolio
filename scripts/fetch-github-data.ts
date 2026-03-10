#!/usr/bin/env tsx

/**
 * GitHub GraphQL 数据获取脚本
 * 构建时执行，获取贡献日历 + 统计数据 → public/github-data.json
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// --- 类型定义 ---

interface GitHubData {
  contributions: {
    totalContributions: number;
    weeks: Array<{
      contributionDays: Array<{
        date: string;
        contributionCount: number;
      }>;
    }>;
  };
  stats: {
    totalStars: number;
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
  };
  fetchedAt: string;
}

interface GraphQLResponse {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{
              date: string;
              contributionCount: number;
              color: string;
            }>;
          }>;
        };
        totalCommitContributions: number;
      };
      repositories: {
        totalCount: number;
        nodes: Array<{ stargazerCount: number }>;
      };
      pullRequests: { totalCount: number };
      issues: { totalCount: number };
    };
  };
  errors?: Array<{ message: string }>;
}

// --- 常量 ---

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(__dirname, '../public/platform-config.json');
const OUTPUT_PATH = resolve(__dirname, '../public/github-data.json');
const GITHUB_API = 'https://api.github.com/graphql';

const QUERY = `
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
          }
        }
      }
      totalCommitContributions
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {field: STARGAZERS, direction: DESC}) {
      totalCount
      nodes {
        stargazerCount
      }
    }
    pullRequests(first: 1) { totalCount }
    issues(first: 1) { totalCount }
  }
}`;

// --- 核心函数 ---

function loadConfig(): { username: string; statsOverrides?: Record<string, number> } | null {
  const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  if (!raw.github?.username) return null;
  return {
    username: raw.github.username,
    statsOverrides: raw.github.statsOverrides,
  };
}

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

  return res.json() as Promise<GraphQLResponse>;
}

function parseResponse(data: GraphQLResponse): GitHubData {
  const user = data.data?.user;
  if (!user) {
    throw new Error('GitHub API 未返回用户数据，请检查 username 是否正确');
  }

  const calendar = user.contributionsCollection.contributionCalendar;
  const totalStars = user.repositories.nodes.reduce((sum, r) => sum + r.stargazerCount, 0);

  return {
    contributions: {
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

function buildFallbackData(overrides?: Record<string, number>): GitHubData {
  return {
    contributions: {
      totalContributions: 0,
      weeks: [],
    },
    stats: {
      totalStars: overrides?.totalStars ?? 0,
      totalCommits: overrides?.totalCommits ?? 0,
      totalPRs: overrides?.totalPRs ?? 0,
      totalIssues: overrides?.totalIssues ?? 0,
    },
    fetchedAt: new Date().toISOString(),
  };
}

// --- 入口 ---

async function main() {
  const config = loadConfig();
  if (!config) {
    console.log('⏭ platform-config.json 中无 github 配置，跳过');
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('⚠ 未设置 GITHUB_TOKEN 环境变量，使用 fallback 数据');
    const fallback = buildFallbackData(config.statsOverrides);
    writeFileSync(OUTPUT_PATH, JSON.stringify(fallback, null, 2) + '\n');
    console.log('✓ 已写入 fallback 数据到 public/github-data.json');
    return;
  }

  console.log(`→ 获取 ${config.username} 的 GitHub 数据...`);

  try {
    const response = await fetchGitHubData(config.username, token);

    if (response.errors?.length) {
      const msg = response.errors.map(e => e.message).join('; ');
      throw new Error(`GraphQL 错误: ${msg}`);
    }

    const result = parseResponse(response);
    writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2) + '\n');

    console.log(`✓ 数据已写入 public/github-data.json`);
    console.log(`  贡献: ${result.contributions.totalContributions} | Stars: ${result.stats.totalStars} | Commits: ${result.stats.totalCommits} | PRs: ${result.stats.totalPRs} | Issues: ${result.stats.totalIssues}`);
  } catch (err) {
    console.error('✗ GitHub 数据获取失败:', (err as Error).message);
    console.warn('  使用 fallback 数据');
    const fallback = buildFallbackData(config.statsOverrides);
    writeFileSync(OUTPUT_PATH, JSON.stringify(fallback, null, 2) + '\n');
  }
}

main();
