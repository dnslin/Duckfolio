"use client";

import { useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { SkillCategory } from "@/lib/types";
import SkillBadge from "@/components/skill-badge";

// 模块级动画配置
const cardInitial = { opacity: 0, y: 20 };
const cardAnimate = { opacity: 1, y: 0 };

const collapseTransition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1] as const,
};

const contentVariants = {
  open: { height: "auto", opacity: 1 },
  closed: { height: 0, opacity: 0 },
};

interface SkillCategoryCardProps {
  category: SkillCategory;
  index: number;
}

export default function SkillCategoryCard({
  category,
  index,
}: SkillCategoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  // 鼠标追踪光斑
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlightBg = useMotionTemplate`radial-gradient(
    400px circle at ${mouseX}px ${mouseY}px,
    var(--theme-primary-300) 0%,
    transparent 80%
  )`;

  function handleMouseMove(e: React.MouseEvent) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  return (
    <motion.div
      ref={cardRef}
      initial={cardInitial}
      animate={isInView ? cardAnimate : cardInitial}
      transition={{
        duration: 0.5,
        ease: [0.19, 1, 0.22, 1],
        delay: 0.15 + index * 0.1,
      }}
      onMouseMove={handleMouseMove}
      className="group relative rounded-2xl bg-white/70 dark:bg-[#1a1a1a]/70 backdrop-blur-sm border border-[#121212]/5 dark:border-white/[0.06] hover:border-[var(--theme-primary)]/20 dark:hover:border-[var(--theme-secondary)]/20 transition-[border-color] duration-300 overflow-hidden"
    >
      {/* 光斑覆层 */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 group-hover:opacity-[0.07] dark:group-hover:opacity-[0.10] transition-opacity duration-300"
        style={{ background: spotlightBg }}
        aria-hidden="true"
      />

      {/* 分类标题栏 */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="relative z-20 w-full flex items-center justify-between p-5 sm:p-6 text-left"
        aria-expanded={isExpanded}
        aria-controls={`skills-${category.id}`}
      >
        <div className="flex items-center gap-3">
          {category.icon ? (
            <span
              dangerouslySetInnerHTML={{ __html: category.icon }}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--theme-primary)]/10 dark:bg-[var(--theme-secondary)]/10 text-[var(--theme-primary)] dark:text-[var(--theme-secondary)] [&>svg]:w-5 [&>svg]:h-5"
              aria-hidden="true"
            />
          ) : null}
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-semibold text-[#121212] dark:text-white">
              {category.name}
            </h3>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--theme-primary)]/8 text-[var(--theme-primary)]/70 dark:bg-[var(--theme-secondary)]/10 dark:text-[var(--theme-secondary)]/70 tabular-nums">
              {category.skills.length}
            </span>
          </div>
        </div>
        <motion.span
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={collapseTransition}
          className="text-[#121212]/30 dark:text-white/30 group-hover:text-[var(--theme-primary)] dark:group-hover:text-[var(--theme-secondary)] transition-colors duration-200"
        >
          <ChevronDown size={18} aria-hidden="true" />
        </motion.span>
      </button>

      {/* 技能标签区域 */}
      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            id={`skills-${category.id}`}
            role="region"
            initial="closed"
            animate="open"
            exit="closed"
            variants={contentVariants}
            transition={collapseTransition}
            className="relative z-20 overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-wrap gap-2.5">
              {category.skills.map((skill, skillIndex) => (
                <SkillBadge
                  key={skill.name}
                  skill={skill}
                  index={skillIndex}
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
