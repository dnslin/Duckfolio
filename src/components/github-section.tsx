"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GitGraph } from "lucide-react";
import { useProfileStore } from "@/lib/store";
import GitHubHeatmap from "@/components/github-heatmap";
import GitHubStats from "@/components/github-stats";
import type { ContributionWeek } from "@/components/github-heatmap";
import {
  sectionVariants,
  sectionReducedVariants,
  slideUp,
  reducedItem,
} from "@/lib/animations";

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

export default function GitHubSection() {
  const github = useProfileStore((s) => s.github);
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const reduced = useReducedMotion();

  const sVariants = reduced ? sectionReducedVariants : sectionVariants;
  const itemVariants = reduced ? reducedItem : slideUp;

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
      variants={sVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="mx-auto w-full pt-24 md:pt-32 pb-16"
    >
      <motion.h2
        className="text-2xl sm:text-3xl font-bold mb-8 md:mb-12 flex items-center"
        variants={itemVariants}
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
        <motion.div className="space-y-8" variants={itemVariants}>
          {/* Stats cards */}
          {showStats && data.stats ? (
            <GitHubStats
              stats={data.stats}
              overrides={github?.statsOverrides}
            />
          ) : null}

          {/* Heatmap */}
          {showGraph && data.contributions ? (
            <div>
              <p className="text-sm text-[#121212]/60 dark:text-white/60 mb-4">
                {data.contributions.totalContributions} contributions in the last year
              </p>
              <GitHubHeatmap
                weeks={data.contributions.weeks}
                totalContributions={data.contributions.totalContributions}
              />
            </div>
          ) : null}
        </motion.div>
      )}
    </motion.div>
  );
}
