"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Code,
  Database,
  Globe,
  Layout,
  Server,
  Terminal,
  Cpu,
  Cloud,
  Shield,
  Smartphone,
  Palette,
  GitBranch,
  Box,
  Layers,
  Zap,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Skill } from "@/lib/types";

// 精确导入常用图标 map，避免 barrel import 导致的 bundle 膨胀
const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Database,
  Globe,
  Layout,
  Server,
  Terminal,
  Cpu,
  Cloud,
  Shield,
  Smartphone,
  Palette,
  GitBranch,
  Box,
  Layers,
  Zap,
  Settings,
};

// 模块级动画配置，避免渲染时重建
const badgeInitial = { opacity: 0, scale: 0.8 };
const badgeAnimate = { opacity: 1, scale: 1 };
const badgeHover = { scale: 1.05 };

interface SkillBadgeProps {
  skill: Skill;
  index: number;
}

export default function SkillBadge({ skill, index }: SkillBadgeProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  function renderIcon() {
    if (!skill.icon) return null;

    const LucideComp = ICON_MAP[skill.icon];
    return LucideComp ? (
      <LucideComp size={14} aria-hidden="true" />
    ) : (
      <span
        dangerouslySetInnerHTML={{ __html: skill.icon }}
        className="inline-flex items-center [&>svg]:w-3.5 [&>svg]:h-3.5"
        aria-hidden="true"
      />
    );
  }

  return (
    <motion.span
      ref={ref}
      initial={badgeInitial}
      animate={isInView ? badgeAnimate : badgeInitial}
      whileHover={badgeHover}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium cursor-default select-none bg-[var(--theme-primary)]/8 text-[var(--theme-primary)] dark:bg-[var(--theme-secondary)]/10 dark:text-[var(--theme-secondary)] border border-[var(--theme-primary)]/15 dark:border-[var(--theme-secondary)]/15 transition-colors duration-200"
    >
      {renderIcon()}
      {skill.name}
    </motion.span>
  );
}
