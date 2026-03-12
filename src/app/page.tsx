"use client";

import { useProfileStore } from "@/lib/store";
import Image from "next/image";
import { useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion, useTransform } from "framer-motion";
import { ExternalLink, ChevronRight } from "lucide-react";
import InteractiveCard from "@/components/interactive-card";
import ProjectsSection from "@/components/projects-section";
import SkillsSection from "@/components/skills-section";
import GitHubSection from "@/components/github-section";
import BackgroundEffects from "@/components/background-effects";
import { useOverscrollNavigate } from "@/lib/use-overscroll-navigate";
import {
  sectionVariants,
  sectionReducedVariants,
  slideUp,
  scaleIn,
  staggerContainer,
  staggerItem,
  reducedItem,
  EASE_OUT_EXPO,
  EASE_OUT_QUINT,
} from "@/lib/animations";

// Section 类型与配置定义
type SectionKey = "profile" | "links" | "projects" | "skills" | "github";

interface SectionDef {
  key: SectionKey;
  label: string;
  alwaysShow?: boolean;
}

const SECTION_DEFS: SectionDef[] = [
  { key: "profile", label: "Profile", alwaysShow: true },
  { key: "links", label: "Links", alwaysShow: true },
  { key: "projects", label: "Projects" },
  { key: "skills", label: "Skills" },
  { key: "github", label: "GitHub" },
];

// 模块级 hover/tap 配置（避免渲染时重建对象）
const socialLinkHover = {
  scale: 1.1,
  boxShadow: "0 0 20px 4px var(--theme-primary-400)",
};
const socialLinkTap = { scale: 0.95 };
const linkCardHover = { scale: 1.02 };
const linkCardTap = { scale: 0.98 };
const linkShineTransition = { duration: 0.8, ease: EASE_OUT_EXPO };

export default function Home() {
  const { avatar, name, bio, socialLinks, websiteLinks, projects, skills, github, theme } =
    useProfileStore();
  const [activeSection, setActiveSection] = useState<SectionKey>("profile");
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // 滚动/滑动切换 section
  const activeSectionRef = useRef<SectionKey>(activeSection);
  activeSectionRef.current = activeSection;

  // 根据 reduced motion 偏好选择变体集
  const sVariants = reduced ? sectionReducedVariants : sectionVariants;
  const itemVariants = reduced ? reducedItem : slideUp;
  const childVariants = reduced ? reducedItem : staggerItem;

  // 根据 Store 数据动态过滤可见 Section
  const visibleSections = useMemo(() => {
    const dataMap: Partial<Record<SectionKey, boolean>> = {
      projects: projects.length > 0,
      skills: skills.length > 0,
      github: !!github?.showContributionGraph || !!github?.showStats,
    };
    return SECTION_DEFS.filter((s) => s.alwaysShow || dataMap[s.key]);
  }, [projects.length, skills.length, github?.showContributionGraph, github?.showStats]);

  // Overscroll energy accumulator — 阻尼感 section 切换
  const handleNavigate = useCallback(
    (dir: 1 | -1) => {
      const idx = visibleSections.findIndex(
        (s) => s.key === activeSectionRef.current
      );
      const next = idx + dir;
      if (next >= 0 && next < visibleSections.length) {
        setActiveSection(visibleSections[next].key);
        window.scrollTo({ top: 0 });
      }
    },
    [visibleSections]
  );

  const { energy, direction, nextSectionLabel } = useOverscrollNavigate({
    containerRef,
    visibleSections,
    activeSectionRef,
    onNavigate: handleNavigate,
    reduced,
  });

  // 从 energy MotionValue 派生视觉属性（无重渲染）
  const contentY = useTransform(energy, (v) => v * -(direction || 0) * 8);
  const barScaleX = energy;
  const pillOpacity = useTransform(energy, [0, 0.1, 0.25], [0, 0, 1]);
  const pillY = useTransform(energy, [0, 0.1, 0.3], [8, 8, 0]);
  const pillYNeg = useTransform(pillY, (v) => -v);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full text-[#121212] dark:text-[#f0f0f0] overflow-hidden flex flex-col"
    >
      {/* 动态背景效果 — 配置驱动 */}
      <BackgroundEffects effect={theme?.backgroundEffect} />

      {/* 环境光渐变 — 主题色漂浮 gradient blob */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-1/4 -left-1/4 h-[60vh] w-[60vh] rounded-full opacity-[0.12] dark:opacity-[0.08]"
          style={{
            background: "radial-gradient(circle, var(--theme-primary-300) 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "ambient-drift-1 25s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 h-[50vh] w-[50vh] rounded-full opacity-[0.10] dark:opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, var(--theme-secondary-400) 0%, transparent 70%)",
            filter: "blur(70px)",
            animation: "ambient-drift-2 30s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[40vh] w-[40vh] rounded-full opacity-[0.08] dark:opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, var(--theme-primary-200) 0%, var(--theme-secondary-300) 40%, transparent 70%)",
            filter: "blur(60px)",
            animation: "ambient-drift-3 35s ease-in-out infinite",
          }}
        />
      </div>
      {/* Navigation */}
      <nav aria-label="主导航" className="fixed top-0 left-0 w-full z-40 px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: 1,
            x: 0,
            ...(reduced ? {} : { rotate: [0, -10, 0] }),
          }}
          transition={{
            duration: 0.6,
            ease: EASE_OUT_QUINT,
            ...(reduced
              ? {}
              : {
                  rotate: {
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "loop" as const,
                  },
                }),
          }}
          className="text-xl font-medium"
        >
          <Image src="/logo.png" alt="Logo" width={40} height={40} priority />
        </motion.div>

        <motion.div
          className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: EASE_OUT_QUINT,
            delay: 0.2,
          }}
        >
          {visibleSections.map((section) => (
            <button
              key={section.key}
              aria-current={activeSection === section.key ? "page" : undefined}
              className={`text-sm uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                activeSection === section.key
                  ? "text-[#121212] dark:text-white"
                  : "text-[#121212]/60 dark:text-white/60 hover:text-[#121212] dark:hover:text-white"
              }`}
              onClick={() => setActiveSection(section.key)}
            >
              {section.label}
              {activeSection === section.key ? (
                <motion.div
                  className="h-0.5 bg-[var(--theme-primary)] dark:bg-[var(--theme-secondary)] mt-1"
                  layoutId="activeSection"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              ) : (
                <div className="h-0.5 mt-1" />
              )}
            </button>
          ))}
        </motion.div>
      </nav>

      {/* Main content */}
      <motion.main
        className="relative z-10 flex-1 px-4 sm:px-6 md:px-8 w-full md:w-4/5 lg:w-3/4 xl:w-2/3 2xl:w-1/2 mx-auto flex flex-col"
        style={reduced ? undefined : { y: contentY }}
      >
        <AnimatePresence mode="wait">
          {activeSection === "profile" ? (
            <motion.div
              key="profile"
              variants={sVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center h-full flex-1 my-auto pt-24 md:pt-16"
            >
              {/* Profile image - 3D Interactive Card */}
              <motion.div
                className="aspect-square w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto"
                variants={reduced ? reducedItem : scaleIn}
              >
                <InteractiveCard
                  imageSrc={avatar}
                  alt={name}
                  className="w-full h-full"
                />
              </motion.div>

              {/* Profile info */}
              <motion.div className="space-y-12" variants={staggerContainer}>
                <motion.div
                  className="space-y-4 md:space-y-6"
                  variants={itemVariants}
                >
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight flex flex-wrap items-center">
                    {reduced ? (
                      <>
                        Hello,{" "}
                        <span className="text-[var(--theme-primary)] dark:text-[var(--theme-secondary)]">
                          I&apos;m {name}
                        </span>
                      </>
                    ) : (
                      [..."Hello, ".split(""), ...("I'm " + name).split("")].map(
                        (char, index) => (
                          <motion.span
                            key={`title-${index}`}
                            className={`inline-block ${index >= 7 ? "text-[var(--theme-primary)] dark:text-[var(--theme-secondary)]" : ""}`}
                            animate={{
                              y: [0, -15, 0],
                            }}
                            transition={{
                              duration: 0.8,
                              ease: EASE_OUT_EXPO,
                              delay: index * 0.03,
                              repeat: Infinity,
                              repeatDelay: 3,
                            }}
                          >
                            {char === " " ? "\u00A0" : char}
                          </motion.span>
                        )
                      )
                    )}
                  </h1>
                  <p className="text-base sm:text-lg text-[#121212]/80 dark:text-white/80 max-w-lg">
                    {bio}
                  </p>
                </motion.div>

                <motion.div
                  className="flex flex-wrap gap-6"
                  variants={staggerContainer}
                >
                  {socialLinks.map((link) => (
                    <motion.a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative inline-flex items-center justify-center p-2 rounded-full bg-[#f8f8f8]/50 dark:bg-[#1a1a1a]/50 text-[#121212]/70 dark:text-white/70 hover:text-[var(--theme-primary)] dark:hover:text-[var(--theme-secondary)] transition-all duration-300 hover:scale-110 hover:shadow-md magnetic-element"
                      aria-label={link.platform}
                      variants={childVariants}
                      whileHover={reduced ? undefined : socialLinkHover}
                      whileTap={reduced ? undefined : socialLinkTap}
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: link.icon }}
                        className="text-2xl"
                      />
                    </motion.a>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          ) : activeSection === "links" ? (
            <motion.div
              key="links"
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
                  <ExternalLink size={24} />
                </span>
                我的链接
              </motion.h2>

              <motion.div className="space-y-6" variants={staggerContainer}>
                {websiteLinks.map((link) => (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block magnetic-element"
                    variants={childVariants}
                    whileHover={reduced ? undefined : linkCardHover}
                    whileTap={reduced ? undefined : linkCardTap}
                  >
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-primary-300)]/20 to-[var(--theme-secondary-300)]/20 dark:from-[var(--theme-primary-400)]/10 dark:to-[var(--theme-secondary-400)]/10 rounded-2xl transform origin-left group-hover:scale-x-[1.02] transition-transform duration-300" />

                      {/* 悬停时显示的光效 */}
                      {reduced ? null : (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 dark:from-transparent dark:via-white/10 dark:to-transparent rounded-2xl"
                          style={{
                            translateX: "-100%",
                          }}
                          whileHover={{
                            translateX: "100%",
                            transition: linkShineTransition,
                          }}
                        />
                      )}

                      <div className="relative flex items-center justify-between bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#121212]/5 dark:border-white/5 p-4 sm:p-6 group-hover:border-[var(--theme-primary)]/30 dark:group-hover:border-[var(--theme-secondary)]/30 transition-colors duration-300">
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-medium text-[#121212] dark:text-white group-hover:text-[var(--theme-primary)] dark:group-hover:text-[var(--theme-secondary)] transition-colors duration-300">
                            {link.title}
                          </h3>
                          {link.description ? (
                            <p className="text-sm sm:text-base text-[#121212]/70 dark:text-white/70 mt-2">
                              {link.description}
                            </p>
                          ) : null}
                        </div>
                        <div className="text-[#121212]/40 dark:text-white/40 group-hover:text-[var(--theme-primary)] dark:group-hover:text-[var(--theme-secondary)] transform group-hover:translate-x-1 transition-all duration-300">
                          <ChevronRight size={24} />
                        </div>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>
          ) : activeSection === "projects" ? (
            <ProjectsSection key="projects" />
          ) : activeSection === "skills" ? (
            <SkillsSection key="skills" />
          ) : activeSection === "github" ? (
            <GitHubSection key="github" />
          ) : null}
        </AnimatePresence>
      </motion.main>

      {/* Overscroll 视觉指示器 — reduced motion 时跳过 */}
      {reduced ? null : (
        <>
          {/* 进度条 */}
          <motion.div
            aria-hidden="true"
            className="fixed left-0 z-50 h-[3px] w-full pointer-events-none"
            style={{
              [direction >= 0 ? "bottom" : "top"]: 0,
              scaleX: barScaleX,
              transformOrigin: "left",
              background:
                "linear-gradient(to right, var(--theme-primary), var(--theme-secondary))",
            }}
          />

          {/* Section 标签 pill */}
          <motion.div
            aria-hidden="true"
            className="fixed left-1/2 z-50 -translate-x-1/2 pointer-events-none flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-[#121212]/80 dark:text-white/80 shadow-sm"
            style={{
              [direction >= 0 ? "bottom" : "top"]: 12,
              opacity: pillOpacity,
              y: direction >= 0 ? pillY : pillYNeg,
            }}
          >
            <span
              className="text-[10px]"
              style={{
                display: "inline-block",
                transform: direction > 0 ? "rotate(180deg)" : undefined,
              }}
            >
              ▲
            </span>
            {nextSectionLabel}
          </motion.div>
        </>
      )}

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8, ease: EASE_OUT_QUINT }}
        className="relative z-10 py-6 mt-auto text-center text-[#121212]/60 dark:text-white/60 text-sm"
      >
        <p className="mb-2">
          © {new Date().getFullYear()} {name}. All rights reserved.
        </p>
        <div className="flex justify-center space-x-4">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--theme-primary)]  dark:hover:text-[var(--theme-secondary)] transition-colors"
          >
            湘ICP备2025118043号
          </a>
        </div>
      </motion.footer>
    </div>
  );
}
