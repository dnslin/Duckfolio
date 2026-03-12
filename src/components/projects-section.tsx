"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderKanban } from "lucide-react";
import { useProfileStore } from "@/lib/store";
import ProjectCard from "@/components/project-card";

const ALL_CATEGORY = "all";

const sectionTransition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1] as const,
  filter: { duration: 0.4 },
};

const cardExitTransition = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1] as const,
};

const cardEnterTransition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function ProjectsSection() {
  const projects = useProfileStore((s) => s.projects);
  const [hovered, setHovered] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);

  const categories = useMemo(
    () => [ALL_CATEGORY, ...new Set(projects.map((p) => p.category))],
    [projects],
  );

  const filtered = useMemo(
    () =>
      activeCategory === ALL_CATEGORY
        ? projects
        : projects.filter((p) => p.category === activeCategory),
    [projects, activeCategory],
  );

  const handleHover = useCallback((index: number | null) => {
    setHovered(index);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    setHovered(null);
  }, []);

  return (
    <motion.div
      key="projects"
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
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <span className="bg-[var(--theme-primary)]/10 dark:bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] dark:text-[var(--theme-secondary)] p-3 rounded-xl mr-4 flex items-center justify-center">
          <FolderKanban size={24} />
        </span>
        我的项目
      </motion.h2>

      {/* FilterBar */}
      <div className="mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3" role="tablist" aria-label="项目分类过滤">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            const label = category === ALL_CATEGORY ? "全部" : category;
            return (
              <button
                key={category}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleCategoryChange(category)}
                className={`relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-2 ${isActive ? "" : "bg-[#f8f8f8] dark:bg-[#2a2a2a]"}`}
              >
                {isActive ? (
                  <motion.div
                    layoutId="activeFilter"
                    className="absolute inset-0 rounded-full bg-[var(--theme-primary)] dark:bg-[var(--theme-secondary)]"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    aria-hidden="true"
                  />
                ) : null}
                <span
                  className={
                    isActive
                      ? "relative z-10 text-white dark:text-[#121212]"
                      : "relative z-10 text-[#121212]/70 dark:text-white/70 hover:text-[#121212] dark:hover:text-white"
                  }
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Project Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((project, index) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                opacity: cardEnterTransition,
                scale: cardExitTransition,
              }}
            >
              <ProjectCard
                project={project}
                index={index}
                isFocused={hovered === null || hovered === index}
                onHover={handleHover}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
