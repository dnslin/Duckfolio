import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import GitHubStats from "../github-stats.js";

test("real zero statistics render as zero rather than unavailable", () => {
  const html = renderToStaticMarkup(createElement(GitHubStats, {
    stats: { totalStars: 0, totalCommits: 0, totalPRs: 0, totalIssues: 0 },
  }));
  assert.equal((html.match(/<span>0<\/span>/g) ?? []).length, 4);
  assert.doesNotMatch(html, />--</);
});

test("a zero override takes precedence while missing statistics remain unavailable", () => {
  const html = renderToStaticMarkup(createElement(GitHubStats, {
    stats: { totalStars: 42 }, overrides: { totalStars: 0 },
  }));
  assert.match(html, /<span>0<\/span>/);
  assert.equal((html.match(/>--</g) ?? []).length, 3);
});
