"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useInView, animate } from "framer-motion";
import { Star, GitCommit, GitPullRequest, MessageCircle } from "lucide-react";

// --- Types ---

interface StatsData {
  totalStars: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
}

interface GitHubStatsProps {
  stats: StatsData;
  overrides?: Partial<StatsData>;
}

// --- Constants (module-level, avoid re-creation per render) ---

const COUNTER_DURATION = 1.5;

const STAT_ITEMS = [
  { key: "totalStars" as const, label: "Total Stars", icon: Star },
  { key: "totalCommits" as const, label: "Total Commits", icon: GitCommit },
  { key: "totalPRs" as const, label: "Total PRs", icon: GitPullRequest },
  { key: "totalIssues" as const, label: "Total Issues", icon: MessageCircle },
];

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      delay: i * 0.08,
    },
  }),
};

// --- Helpers ---

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  if (n >= 1_000) return n.toLocaleString();
  return String(n);
}

// --- AnimatedCounter ---
// Uses motionValue + direct DOM update for zero React re-renders during animation

function AnimatedCounter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);

  useEffect(() => {
    const unsubscribe = motionValue.on("change", (v) => {
      if (ref.current) {
        ref.current.textContent = formatNumber(Math.round(v));
      }
    });
    return unsubscribe;
  }, [motionValue]);

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, value, {
        duration: COUNTER_DURATION,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [isInView, value, motionValue]);

  return <span ref={ref}>0</span>;
}

// --- GitHubStats ---

export default function GitHubStats({ stats, overrides }: GitHubStatsProps) {
  const merged: StatsData = {
    totalStars: overrides?.totalStars ?? stats.totalStars ?? 0,
    totalCommits: overrides?.totalCommits ?? stats.totalCommits ?? 0,
    totalPRs: overrides?.totalPRs ?? stats.totalPRs ?? 0,
    totalIssues: overrides?.totalIssues ?? stats.totalIssues ?? 0,
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {STAT_ITEMS.map((item, i) => {
        const Icon = item.icon;
        const value = merged[item.key];

        return (
          <motion.div
            key={item.key}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-xl border border-[#121212]/5 dark:border-white/5 bg-white/50 dark:bg-[#1a1a1a]/50 p-4 text-center"
          >
            <div className="flex justify-center mb-2">
              <Icon
                size={20}
                className="text-[var(--theme-primary)] dark:text-[var(--theme-secondary)]"
              />
            </div>
            <p className="text-2xl font-bold text-[var(--theme-primary)] dark:text-[var(--theme-secondary)]">
              {value === 0 ? (
                <span>--</span>
              ) : (
                <AnimatedCounter value={value} />
              )}
            </p>
            <p className="text-xs text-[#121212]/50 dark:text-white/50 mt-1">
              {item.label}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
