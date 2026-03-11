"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
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
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  function renderCategoryIcon() {
    if (!category.icon) return null;
    return (
      <span
        dangerouslySetInnerHTML={{ __html: category.icon }}
        className="inline-flex items-center [&>svg]:w-5 [&>svg]:h-5"
        aria-hidden="true"
      />
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={cardInitial}
      animate={isInView ? cardAnimate : cardInitial}
      transition={{
        duration: 0.5,
        ease: [0.19, 1, 0.22, 1],
        delay: 0.15 + index * 0.1,
      }}
      className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#121212]/5 dark:border-white/5 overflow-hidden"
    >
      {/* 分类标题栏 */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-[#121212]/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-200"
        aria-expanded={isExpanded}
        aria-controls={`skills-${category.id}`}
      >
        <div className="flex items-center gap-3">
          {category.icon ? (
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--theme-primary)]/10 dark:bg-[var(--theme-secondary)]/10 text-[var(--theme-primary)] dark:text-[var(--theme-secondary)]">
              {renderCategoryIcon()}
            </span>
          ) : null}
          <h3 className="text-base font-semibold text-[#121212] dark:text-white">
            {category.name}
          </h3>
          <span className="text-xs text-[#121212]/40 dark:text-white/40 tabular-nums">
            {category.skills.length}
          </span>
        </div>
        <motion.span
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={collapseTransition}
          className="text-[#121212]/40 dark:text-white/40"
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
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 flex flex-wrap gap-2">
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
