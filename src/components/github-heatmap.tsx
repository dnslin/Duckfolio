"use client";

import { useState, useMemo, useCallback } from "react";

// --- Types ---

export interface ContributionDay {
  date: string;
  contributionCount: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface GitHubHeatmapProps {
  weeks: ContributionWeek[];
  totalContributions: number;
}

// --- Constants (module-level, avoid re-creation per render) ---

const CELL_SIZE = 12;
const CELL_GAP = 3;
const CELL_RADIUS = 2;
const MONTH_LABEL_HEIGHT = 20;
const DAY_LABEL_WIDTH = 28;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const DAY_LABELS = [
  { index: 1, label: "Mon" },
  { index: 3, label: "Wed" },
  { index: 5, label: "Fri" },
] as const;

const LEVEL_FILLS = [
  "var(--heatmap-empty)",
  "var(--theme-primary-200)",
  "var(--theme-primary-400)",
  "var(--theme-primary-600)",
  "var(--theme-primary)",
] as const;

// --- Utilities ---

function getLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 7) return 2;
  if (count <= 12) return 3;
  return 4;
}

function parseMonth(dateStr: string): number {
  return parseInt(dateStr.substring(5, 7), 10) - 1;
}

// --- Component ---

export default function GitHubHeatmap({ weeks, totalContributions }: GitHubHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    day: ContributionDay;
    x: number;
    y: number;
  } | null>(null);

  const monthLabels = useMemo(() => {
    const labels: { label: string; x: number }[] = [];
    let lastMonth = -1;
    let lastX = -Infinity;

    for (let i = 0; i < weeks.length; i++) {
      const first = weeks[i].contributionDays[0];
      if (!first) continue;
      const m = parseMonth(first.date);
      if (m !== lastMonth) {
        const x = DAY_LABEL_WIDTH + i * (CELL_SIZE + CELL_GAP);
        if (x - lastX >= (CELL_SIZE + CELL_GAP) * 3) {
          labels.push({ label: MONTHS[m], x });
          lastX = x;
        }
        lastMonth = m;
      }
    }
    return labels;
  }, [weeks]);

  const svgWidth = DAY_LABEL_WIDTH + weeks.length * (CELL_SIZE + CELL_GAP);
  const svgHeight = MONTH_LABEL_HEIGHT + 7 * (CELL_SIZE + CELL_GAP);

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent, day: ContributionDay) => {
      setTooltip({ day, x: e.clientX, y: e.clientY });
    },
    [],
  );

  const handlePointerLeave = useCallback(() => setTooltip(null), []);

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto scrollbar-hide" style={{ touchAction: "pan-x" }}>
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          role="img"
          aria-label={`GitHub contributions: ${totalContributions} in the last year`}
          onPointerLeave={handlePointerLeave}
        >
          {/* Month labels */}
          {monthLabels.map((m) => (
            <text
              key={`${m.label}-${m.x}`}
              x={m.x}
              y={12}
              fill="currentColor"
              fontSize={10}
              className="text-[#121212]/50 dark:text-white/50"
            >
              {m.label}
            </text>
          ))}

          {/* Day labels */}
          {DAY_LABELS.map(({ index, label }) => (
            <text
              key={label}
              x={0}
              y={MONTH_LABEL_HEIGHT + index * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 1}
              fill="currentColor"
              fontSize={10}
              className="text-[#121212]/50 dark:text-white/50"
            >
              {label}
            </text>
          ))}

          {/* Contribution cells */}
          {weeks.map((week, wi) =>
            week.contributionDays.map((day, di) => (
              <rect
                key={day.date}
                x={DAY_LABEL_WIDTH + wi * (CELL_SIZE + CELL_GAP)}
                y={MONTH_LABEL_HEIGHT + di * (CELL_SIZE + CELL_GAP)}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={CELL_RADIUS}
                fill={LEVEL_FILLS[getLevel(day.contributionCount)]}
                className="transition-opacity hover:opacity-80 motion-reduce:transition-none"
                onPointerEnter={(e) => handlePointerEnter(e, day)}
              >
                <title>{`${day.date}: ${day.contributionCount} contributions`}</title>
              </rect>
            )),
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 text-[10px] text-[#121212]/50 dark:text-white/50">
        <span>Less</span>
        {LEVEL_FILLS.map((fill, i) => (
          <span
            key={i}
            className="inline-block rounded-sm"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: fill,
            }}
          />
        ))}
        <span>More</span>
      </div>

      {/* Tooltip (fixed position, outside scroll container) */}
      {tooltip ? (
        <div
          className="fixed z-50 pointer-events-none px-3 py-1.5 rounded-md text-xs shadow-lg bg-[#24292f] text-white dark:bg-[#f0f0f0] dark:text-[#24292f] -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y - 12 }}
        >
          <span className="font-semibold">{tooltip.day.contributionCount}</span>
          {" contributions on "}
          <span className="font-semibold">{tooltip.day.date}</span>
        </div>
      ) : null}
    </div>
  );
}
