"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { GitGraph } from "lucide-react";
import { useProfileStore } from "@/lib/store";
import GitHubHeatmap from "@/components/github/github-heatmap";
import GitHubStats from "@/components/github/github-stats";
import type { GitHubData } from "@/lib/types";
import {
  sectionVariants,
  sectionReducedVariants,
  slideUp,
  reducedItem,
} from "@/lib/animations";


export default function GitHubSection() {
  const github = useProfileStore((s) => s.github);
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const reduced = useReducedMotion();

  const sVariants = reduced ? sectionReducedVariants : sectionVariants;
  const itemVariants = reduced ? reducedItem : slideUp;

  useEffect(() => {
    fetch("/github-data.json")
      .then(async (res) => {
        if (!res.ok) return null;
        const data: GitHubData = await res.json();
        return data;
      })
      .then((d) => setData(d))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const showGraph = github?.showContributionGraph;
  const showStats = github?.showStats;
  const unavailableMessage = !github?.username || data?.status === "unconfigured"
    ? "GitHub is not configured."
    : data?.status === "missing-token"
      ? "GitHub data is unavailable: no token was configured at build time."
      : data?.status === "error"
        ? "GitHub data is unavailable: the build-time request failed."
        : !data
          ? "GitHub data is not available."
          : null;

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
      ) : (
        <motion.div className="space-y-8" variants={itemVariants}>
          {unavailableMessage ? (
            <p role="status" className="text-center text-[#121212]/50 dark:text-white/50 py-4">
              {unavailableMessage}
            </p>
          ) : null}
          {/* Stats cards */}
          {showStats ? (
            <div className="space-y-3">
              <GitHubStats stats={data?.stats ?? {}} overrides={github?.statsOverrides} />
              <p className="text-xs text-[#121212]/60 dark:text-white/60">
                Stars cover up to 100 accessible owned non-fork repositories, ordered by stars.
                Commits cover the year at snapshot time; PRs and issues are all-time.
                Configured overrides take precedence.
              </p>
            </div>
          ) : null}

          {data?.status === "success" ? (
            <p className="text-sm text-[#121212]/60 dark:text-white/60">
              Contribution period: {data.contributions.startedAt.slice(0, 10)} – {data.contributions.endedAt.slice(0, 10)}.
              {" "}Snapshot: <time dateTime={data.fetchedAt}>{data.fetchedAt.slice(0, 10)}</time>.
            </p>
          ) : null}

          {/* Heatmap */}
          {showGraph && data?.status === "success" ? (
            <div>
              <p className="text-sm text-[#121212]/60 dark:text-white/60 mb-4">
                {data.contributions.totalContributions} contributions in this period
              </p>
              <GitHubHeatmap
                weeks={data.contributions.weeks}
                totalContributions={data.contributions.totalContributions}
                startedAt={data.contributions.startedAt}
                endedAt={data.contributions.endedAt}
              />
            </div>
          ) : null}
        </motion.div>
      )}
    </motion.div>
  );
}
