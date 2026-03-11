"use client";

export default function GradientBg() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none opacity-25 dark:opacity-[0.15] motion-reduce:hidden"
      aria-hidden="true"
      style={{
        background:
          "linear-gradient(-45deg, var(--theme-primary), var(--theme-secondary), var(--theme-primary-500), var(--theme-secondary-500))",
        backgroundSize: "400% 400%",
        animation: "bg-gradient-shift 15s ease infinite",
      }}
    />
  );
}
