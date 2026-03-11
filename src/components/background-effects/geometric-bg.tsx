"use client";

const SHAPES = [
  { cx: "10%", cy: "15%", r: 40, delay: "0s", dur: "20s" },
  { cx: "85%", cy: "25%", r: 30, delay: "2s", dur: "25s" },
  { cx: "50%", cy: "70%", r: 50, delay: "4s", dur: "22s" },
  { cx: "20%", cy: "80%", r: 25, delay: "1s", dur: "18s" },
  { cx: "75%", cy: "60%", r: 35, delay: "3s", dur: "24s" },
] as const;

const TRIANGLES = [
  { x: 300, y: 100, size: 60, delay: "1.5s", dur: "28s" },
  { x: 700, y: 500, size: 45, delay: "3.5s", dur: "22s" },
] as const;

const RECTS = [
  { x: 150, y: 400, w: 50, h: 50, delay: "2.5s", dur: "26s" },
  { x: 600, y: 200, w: 40, h: 40, delay: "0.5s", dur: "20s" },
] as const;

function trianglePath(x: number, y: number, size: number): string {
  const h = (size * Math.sqrt(3)) / 2;
  return `M${x},${y - h / 2} L${x - size / 2},${y + h / 2} L${x + size / 2},${y + h / 2} Z`;
}

export default function GeometricBg() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none opacity-[0.18] dark:opacity-[0.12] motion-reduce:hidden"
      aria-hidden="true"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1000 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {SHAPES.map((s, i) => (
          <circle
            key={`c-${i}`}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="var(--theme-primary-500)"
            opacity="0.5"
            style={{
              animation: `bg-geo-float ${s.dur} ease-in-out ${s.delay} infinite`,
              transformOrigin: `${s.cx} ${s.cy}`,
            }}
          />
        ))}
        {TRIANGLES.map((t, i) => (
          <path
            key={`t-${i}`}
            d={trianglePath(t.x, t.y, t.size)}
            fill="var(--theme-secondary-500)"
            opacity="0.45"
            style={{
              animation: `bg-geo-spin ${t.dur} linear ${t.delay} infinite`,
              transformOrigin: `${t.x}px ${t.y}px`,
            }}
          />
        ))}
        {RECTS.map((r, i) => (
          <rect
            key={`r-${i}`}
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            rx={4}
            fill="var(--theme-primary)"
            opacity="0.4"
            style={{
              animation: `bg-geo-drift ${r.dur} ease-in-out ${r.delay} infinite`,
              transformOrigin: `${r.x + r.w / 2}px ${r.y + r.h / 2}px`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
