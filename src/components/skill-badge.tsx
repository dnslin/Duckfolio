"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { Skill } from "@/lib/types";

// 模块级动画配置
const badgeInitial = { opacity: 0, scale: 0.8, y: 10 };
const badgeAnimate = { opacity: 1, scale: 1, y: 0 };
const badgeHover = {
  scale: 1.06,
  boxShadow: "0 0 24px -4px var(--theme-primary-300)",
};

interface SkillBadgeProps {
  skill: Skill;
  index: number;
}

export default function SkillBadge({ skill, index }: SkillBadgeProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.span
      ref={ref}
      initial={badgeInitial}
      animate={isInView ? badgeAnimate : badgeInitial}
      whileHover={badgeHover}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group/badge inline-flex items-center gap-2.5 rounded-xl px-4 py-2.5 cursor-default select-none bg-white/80 dark:bg-white/[0.06] backdrop-blur-sm border border-[#121212]/[0.06] dark:border-white/[0.08] hover:border-[var(--theme-primary)]/30 dark:hover:border-[var(--theme-secondary)]/30 transition-[border-color] duration-300"
    >
      {skill.icon ? (
        // eslint-disable-next-line @next/next/no-img-element -- external SVG from svgl CDN, next/image optimization不适用
        <img
          src={skill.icon}
          alt=""
          width={20}
          height={20}
          className="w-5 h-5 object-contain dark:brightness-110 dark:contrast-110"
          loading="lazy"
        />
      ) : null}
      <span className="text-sm font-medium text-[#121212]/80 dark:text-white/80 group-hover/badge:text-[var(--theme-primary)] dark:group-hover/badge:text-[var(--theme-secondary)] transition-colors duration-300">
        {skill.name}
      </span>
    </motion.span>
  );
}
