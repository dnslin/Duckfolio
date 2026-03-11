"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import { Star, GitFork, ExternalLink, Code } from "lucide-react";
import type { Project } from "@/lib/types";

const MAX_VISIBLE_TAGS = 4;

const cardHover = {
  y: -4,
  boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)",
};

const cardTap = { scale: 0.98 };

interface ProjectCardProps {
  project: Project;
  index: number;
  isFocused: boolean;
  onHover: (index: number | null) => void;
}

export default function ProjectCard({
  project,
  index,
  isFocused,
  onHover,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const spotlightBg = useMotionTemplate`radial-gradient(
    350px circle at ${mouseX}px ${mouseY}px,
    var(--theme-primary-300) 0%,
    transparent 80%
  )`;

  const visibleTags = project.tags.slice(0, MAX_VISIBLE_TAGS);
  const extraCount = project.tags.length - MAX_VISIBLE_TAGS;
  const hasStats =
    project.stats &&
    ((project.stats.stars != null && project.stats.stars > 0) ||
      (project.stats.forks != null && project.stats.forks > 0));

  function handleMouseMove(e: React.MouseEvent) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  return (
    <motion.article
      ref={cardRef}
      className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#121212]/5 dark:border-white/5 hover:border-[var(--theme-primary)]/20 dark:hover:border-[var(--theme-secondary)]/20 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        filter: isFocused ? "none" : "blur(1.5px)",
        scale: isFocused ? 1 : 0.98,
      }}
      transition={{
        duration: 0.5,
        ease: [0.19, 1, 0.22, 1],
        delay: 0.15 + index * 0.1,
        filter: { duration: 0.3 },
        scale: { duration: 0.3 },
      }}
      whileHover={cardHover}
      whileTap={cardTap}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Spotlight 光斑覆层 */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 group-hover:opacity-[0.08] dark:group-hover:opacity-[0.12] transition-opacity duration-300"
        style={{ background: spotlightBg }}
        aria-hidden="true"
      />

      {/* Featured 渐变边框 */}
      {project.featured ? (
        <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-[var(--theme-primary)]/20 to-[var(--theme-secondary)]/20 blur-[1px]" />
      ) : null}

      {/* 封面图 */}
      <div className="relative aspect-video overflow-hidden bg-[#f5f5f5] dark:bg-[#252525]">
        {project.cover ? (
          <Image
            src={project.cover}
            alt={`${project.title} 封面`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#121212]/20 dark:text-white/20">
            <Code size={48} />
          </div>
        )}

        {/* Featured 角标 */}
        {project.featured ? (
          <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--theme-primary)] text-white dark:bg-[var(--theme-secondary)] dark:text-[#121212] shadow-sm">
            Featured
          </div>
        ) : null}
      </div>

      {/* 信息区域 */}
      <div className="p-5 space-y-3">
        <h3 className="text-lg font-semibold text-[#121212] dark:text-white leading-snug truncate">
          {project.title}
        </h3>

        <p className="text-sm text-[#121212]/70 dark:text-white/70 leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {project.description}
        </p>

        {/* 技术标签 */}
        <div className="flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[var(--theme-primary)]/8 text-[var(--theme-primary)] dark:bg-[var(--theme-secondary)]/10 dark:text-[var(--theme-secondary)]"
            >
              {tag}
            </span>
          ))}
          {extraCount > 0 ? (
            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#121212]/5 text-[#121212]/50 dark:bg-white/5 dark:text-white/50">
              +{extraCount}
            </span>
          ) : null}
        </div>

        {/* 底部栏 */}
        <div className="flex items-center justify-between pt-2 border-t border-[#121212]/5 dark:border-white/5">
          <div className="flex items-center gap-3 text-xs text-[#121212]/50 dark:text-white/50">
            {hasStats ? (
              <>
                {project.stats!.stars != null && project.stats!.stars > 0 ? (
                  <span className="flex items-center gap-1">
                    <Star size={13} />
                    {project.stats!.stars}
                  </span>
                ) : null}
                {project.stats!.forks != null && project.stats!.forks > 0 ? (
                  <span className="flex items-center gap-1">
                    <GitFork size={13} />
                    {project.stats!.forks}
                  </span>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {project.links.demo ? (
              <a
                href={project.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} Demo`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--theme-primary)] text-white dark:bg-[var(--theme-secondary)] dark:text-[#121212] hover:opacity-90 transition-opacity"
              >
                <ExternalLink size={12} />
                Demo
              </a>
            ) : null}
            {project.links.code ? (
              <a
                href={project.links.code}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} 源码`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#121212]/10 dark:border-white/10 text-[#121212]/70 dark:text-white/70 hover:text-[var(--theme-primary)] dark:hover:text-[var(--theme-secondary)] hover:border-[var(--theme-primary)]/30 dark:hover:border-[var(--theme-secondary)]/30 transition-colors"
              >
                <Code size={12} />
                Code
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
