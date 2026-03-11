"use client";

const LAYERS = [
  { opacity: 0.6, dur: "12s", dy: 0, amplitude: 40 },
  { opacity: 0.45, dur: "16s", dy: 30, amplitude: 30 },
  { opacity: 0.3, dur: "20s", dy: 60, amplitude: 20 },
] as const;

function wavePath(amplitude: number, dy: number): string {
  const y = 600 + dy;
  return [
    `M0,${y}`,
    `C250,${y - amplitude} 350,${y + amplitude} 500,${y}`,
    `C650,${y - amplitude} 750,${y + amplitude} 1000,${y}`,
    `C1250,${y - amplitude} 1350,${y + amplitude} 1500,${y}`,
    `C1750,${y - amplitude} 1850,${y + amplitude} 2000,${y}`,
    `V800 H0 Z`,
  ].join(" ");
}

export default function WavesBg() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-20 dark:opacity-[0.12] motion-reduce:hidden"
      aria-hidden="true"
    >
      <svg
        className="absolute bottom-0 left-0 h-full w-full"
        viewBox="0 0 1000 800"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {LAYERS.map((layer, i) => (
          <path
            key={i}
            d={wavePath(layer.amplitude, layer.dy)}
            fill={i % 2 === 0 ? "var(--theme-primary-500)" : "var(--theme-secondary-500)"}
            opacity={layer.opacity}
            style={{
              animation: `bg-wave-shift ${layer.dur} linear infinite`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
