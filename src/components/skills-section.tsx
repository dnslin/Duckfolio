"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Brain } from "lucide-react";
import { useProfileStore } from "@/lib/store";
import SkillCategoryCard from "@/components/skill-category-card";
import {
  sectionVariants,
  sectionReducedVariants,
  slideUp,
  staggerContainer,
  reducedItem,
} from "@/lib/animations";

export default function SkillsSection() {
  const skills = useProfileStore((s) => s.skills);
  const reduced = useReducedMotion();

  const sVariants = reduced ? sectionReducedVariants : sectionVariants;
  const itemVariants = reduced ? reducedItem : slideUp;

  return (
    <motion.div
      key="skills"
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
          <Brain size={24} />
        </span>
        技能树
      </motion.h2>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={staggerContainer}
      >
        {skills.map((category, index) => (
          <SkillCategoryCard
            key={category.id}
            category={category}
            index={index}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
