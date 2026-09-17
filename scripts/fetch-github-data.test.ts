import assert from "node:assert/strict";
import test from "node:test";
import { collectGitHubData } from "./fetch-github-data.js";

const config = { username: "octocat" };
const zeroResponse = {
  data: {
    user: {
      contributionsCollection: {
        startedAt: "2025-09-17T00:00:00Z",
        endedAt: "2026-09-17T00:00:00Z",
        contributionCalendar: {
          totalContributions: 0,
          weeks: [{ contributionDays: [{ date: "2026-09-17", contributionCount: 0 }] }],
        },
        totalCommitContributions: 0,
      },
      repositories: { nodes: [] },
      pullRequests: { totalCount: 0 },
      issues: { totalCount: 0 },
    },
  },
};

test("missing configuration and missing token never masquerade as successful zero activity", async (t) => {
  t.mock.method(globalThis, "fetch", () => { throw new Error("Network must not be used"); });
  const unconfigured = await collectGitHubData(undefined, "token");
  assert.deepEqual(unconfigured, {
    status: "unconfigured", stats: {}, contributions: null, fetchedAt: null,
  });
  const missingToken = await collectGitHubData({ ...config, statsOverrides: { totalStars: 0, totalPRs: 12 } }, undefined);
  assert.deepEqual(missingToken, {
    status: "missing-token", stats: { totalStars: 0, totalPRs: 12 }, contributions: null, fetchedAt: null,
  });
});

test("successful zero activity retains the calendar and its actual collection interval", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json(zeroResponse));
  const result = await collectGitHubData(config, "stub-token");
  assert.equal(result.status, "success");
  assert.deepEqual(result.stats, { totalStars: 0, totalCommits: 0, totalPRs: 0, totalIssues: 0 });
  assert.deepEqual(result.contributions, {
    ...zeroResponse.data.user.contributionsCollection.contributionCalendar,
    startedAt: "2025-09-17T00:00:00Z",
    endedAt: "2026-09-17T00:00:00Z",
  });
  assert.ok(result.fetchedAt && Number.isFinite(Date.parse(result.fetchedAt)));
});

test("request failures retain only explicit overrides instead of inventing zero statistics", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 401 }));
  const result = await collectGitHubData({ ...config, statsOverrides: { totalCommits: 0 } }, "stub-token");
  assert.deepEqual(result, {
    status: "error", stats: { totalCommits: 0 }, contributions: null, fetchedAt: null,
  });
});

test("GraphQL partial errors and unknown users do not publish successful statistics", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => Response.json({
    ...zeroResponse, errors: [{ message: "Resource unavailable" }],
  }));
  const partial = await collectGitHubData(config, "stub-token");
  assert.equal(partial.status, "error");
  assert.equal(partial.contributions, null);
  fetchMock.mock.mockImplementation(async () => Response.json({ data: { user: null } }));
  const unknown = await collectGitHubData(config, "stub-token");
  assert.equal(unknown.status, "error");
  assert.deepEqual(unknown.stats, {});
});

test("star statistics sum the returned repository sample rather than its connection count", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({
    data: { user: { ...zeroResponse.data.user, repositories: { totalCount: 150, nodes: [{ stargazerCount: 21 }, { stargazerCount: 3 }] } } },
  }));
  const result = await collectGitHubData(config, "stub-token");
  assert.equal(result.status, "success");
  assert.equal(result.stats.totalStars, 24);
});
