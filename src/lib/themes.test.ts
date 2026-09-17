import assert from "node:assert/strict";
import test from "node:test";
import { applyThemePreset, clearInlineThemeStyles } from "./themes.js";

test("preset colors follow the requested mode while the DOM still has the previous mode", () => {
  const values = new Map<string, string>();
  const original = Object.getOwnPropertyDescriptor(globalThis, "document");
  let domIsDark = false;
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement: {
        classList: { contains: () => domIsDark },
        style: {
          setProperty: (name: string, value: string) => values.set(name, value),
          removeProperty: (name: string) => values.delete(name),
        },
      },
    },
  });
  try {
    applyThemePreset("ocean", true);
    assert.equal(values.get("--theme-primary"), "rgba(14, 165, 233, 0.85)");
    assert.equal(values.get("--theme-primary-50"), "hsl(199, 50%, 15%)");
    domIsDark = true;
    applyThemePreset("ocean", false);
    assert.equal(values.get("--theme-primary"), "rgba(14, 165, 233, 1)");
    assert.equal(values.get("--theme-primary-50"), "hsl(199, 100%, 95%)");
    clearInlineThemeStyles();
    assert.deepEqual([...values], []);
  } finally {
    if (original) Object.defineProperty(globalThis, "document", original);
    else Reflect.deleteProperty(globalThis, "document");
  }
});
