import assert from "node:assert/strict";
import test from "node:test";
import { getConfig } from "./config.js";

test("a saved profile cannot replace deployed configuration", async () => {
  const storage = new Map<string, string>([
    ["duckfolio-storage", JSON.stringify({ state: { name: "Stale deployment", projects: [] }, version: 1 })],
    ["duckfolio-theme-preset", "ocean"],
  ]);
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    } },
  });
  try {
    // Load after browser storage exists to exercise module-time hydration.
    const { useProfileStore } = await import("./store.js");
    assert.equal(useProfileStore.getState().name, getConfig().profile.name);
    assert.deepEqual(useProfileStore.getState().projects, getConfig().projects);
    assert.equal(storage.get("duckfolio-theme-preset"), "ocean");
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
