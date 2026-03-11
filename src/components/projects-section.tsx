"use client";

import { motion } from "framer-motion";
import { FolderKanban } from "lucide-react";
import { useProfileStore } from "@/lib/store";
import ProjectCard from "@/components/project-card";

const sectionTransition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1] as const,
  filter: { duration: 0.4 },
};

export default function ProjectsSection() {
  const projects = useProfileStore((s) => s.projects);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </motion.div>
  );
}
