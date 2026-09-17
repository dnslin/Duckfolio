import assert from "node:assert/strict";
import test from "node:test";
import profileConfig from "../../public/platform-config.json" with { type: "json" };
import { getConfig } from "./config.js";

test("unsupported background effects are rejected at the configuration boundary", () => {
  const originalEffect = profileConfig.theme.backgroundEffect;
  profileConfig.theme.backgroundEffect = "unsupported-effect";
  try {
    assert.throws(() => getConfig(), Error);
  } finally {
    profileConfig.theme.backgroundEffect = originalEffect;
  }
  assert.equal(getConfig().theme?.backgroundEffect, originalEffect);
});
