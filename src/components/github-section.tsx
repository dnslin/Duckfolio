"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GitGraph } from "lucide-react";
import { useProfileStore } from "@/lib/store";
import GitHubHeatmap from "@/components/github-heatmap";
import type { ContributionWeek } from "@/components/github-heatmap";

interface GitHubData {
  contributions: {
    totalContributions: number;
    weeks: ContributionWeek[];
  };
  stats: {
    totalStars: number;
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
  };
  fetchedAt: string;
}

const sectionTransition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1] as const,
  filter: { duration: 0.4 },
};

export default function GitHubSection() {
  const github = useProfileStore((s) => s.github);
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/github-data.json")
      .then((res) => (res.ok ? (res.json() as Promise<GitHubData>) : null))
      .then((d) => setData(d))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const showGraph = github?.showContributionGraph;
  const showStats = github?.showStats;

  return (
    <motion.div
      key="github"
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
      transition={sectionTransition}
      className="mx-auto w-full pt-24 md:pt-32 pb-16"
    >
      <motion.h2
        className="text-2xl sm:text-3xl font-bold mb-8 md:mb-12 flex items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="bg-[var(--theme-primary)]/10 dark:bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] dark:text-[var(--theme-secondary)] p-3 rounded-xl mr-4 flex items-center justify-center">
          <GitGraph size={24} />
        </span>
        GitHub
      </motion.h2>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin motion-reduce:animate-none rounded-full border-2 border-[var(--theme-primary)] border-t-transparent" />
        </div>
      ) : !data ? (
        <p className="text-center text-[#121212]/50 dark:text-white/50 py-12">
          GitHub data is not available.
        </p>
      ) : (
        <div className="space-y-8">
          {/* Stats cards */}
          {showStats && data.stats ? (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              <StatCard label="Stars" value={data.stats.totalStars} />
              <StatCard label="Commits" value={data.stats.totalCommits} />
              <StatCard label="PRs" value={data.stats.totalPRs} />
              <StatCard label="Issues" value={data.stats.totalIssues} />
            </motion.div>
          ) : null}

          {/* Heatmap */}
          {showGraph && data.contributions ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            >
              <p className="text-sm text-[#121212]/60 dark:text-white/60 mb-4">
                {data.contributions.totalContributions} contributions in the last year
              </p>
              <GitHubHeatmap
                weeks={data.contributions.weeks}
                totalContributions={data.contributions.totalContributions}
              />
            </motion.div>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#121212]/5 dark:border-white/5 bg-white/50 dark:bg-[#1a1a1a]/50 p-4 text-center">
      <p className="text-2xl font-bold text-[var(--theme-primary)] dark:text-[var(--theme-secondary)]">
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-[#121212]/50 dark:text-white/50 mt-1">{label}</p>
    </div>
  );
}
