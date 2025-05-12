"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import Image from "next/image";

interface InteractiveCardProps {
  imageSrc: string;
  alt: string;
  className?: string;
}

export default function InteractiveCard({
  imageSrc,
  alt,
  className,
}: InteractiveCardProps) {
  // 引用卡片容器
  const cardRef = useRef<HTMLDivElement>(null);

  // 创建motion值来跟踪鼠标位置
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 将x/y坐标转换为旋转角度 - 减小旋转角度使效果更微妙
  const rotateX = useTransform(y, [-300, 300], [20, -20]);
  const rotateY = useTransform(x, [-300, 300], [-20, 20]);

  // 图片Z轴突出效果 - 根据倾斜程度动态调整
  const imageZ = useTransform(
    [rotateX, rotateY],
    ([latestRotateX, latestRotateY]) => {
      const rotateValue =
        Math.abs(latestRotateX as number) + Math.abs(latestRotateY as number);
      // 将旋转值转换为Z轴位移量，最大值约30px
      return Math.min(30, rotateValue * 0.5);
    }
  );

  // 根据鼠标位置计算光照强度和位置
  const lightX = useTransform(x, [-300, 300], [-20, 20]);
  const lightY = useTransform(y, [-300, 300], [-20, 20]);

  // 根据鼠标位置计算发光效果的强度
  const glowOpacity = useTransform(
    [rotateX, rotateY],
    ([latestRotateX, latestRotateY]) => {
      const rotateValue =
        Math.abs(latestRotateX as number) + Math.abs(latestRotateY as number);
      // 将旋转值映射到0.2-0.6之间的透明度值 - 减小最大值使效果更微妙
      return 0.2 + Math.min(0.4, rotateValue * 0.01);
    }
  );

  // 新增：环境光效果
  const ambientLightOpacity = useTransform(
    [rotateX, rotateY],
    ([latestRotateX, latestRotateY]) => {
      const rotateValue =
        Math.abs(latestRotateX as number) + Math.abs(latestRotateY as number);
      return 0.1 + Math.min(0.3, rotateValue * 0.008);
    }
  );

  // 新增：边缘高光效果
  const edgeGlowSize = useTransform(
    [rotateX, rotateY],
    ([latestRotateX, latestRotateY]) => {
      const rotateValue =
        Math.abs(latestRotateX as number) + Math.abs(latestRotateY as number);
      return Math.min(6, rotateValue * 0.15);
    }
  );

  // 处理鼠标移动
  function handleMouseMove(event: React.MouseEvent) {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();

    // 计算鼠标相对于卡片中心的位置
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 更新motion值
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  // 处理鼠标离开
  function handleMouseLeave() {
    // 平滑地将卡片恢复到初始状态 - 使用更自然的缓动函数
    animate(x, 0, { duration: 0.8, ease: "easeOut" });
    animate(y, 0, { duration: 0.8, ease: "easeOut" });
  }

  // 处理触摸事件 - 优化移动端体验
  function handleTouchMove(event: React.TouchEvent) {
    if (!cardRef.current || event.touches.length === 0) return;

    const rect = cardRef.current.getBoundingClientRect();
    const touch = event.touches[0];

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 减小移动端的效果幅度
    x.set((touch.clientX - centerX) * 0.5);
    y.set((touch.clientY - centerY) * 0.5);
  }

  function handleTouchEnd() {
    animate(x, 0, { duration: 0.8, ease: "easeOut" });
    animate(y, 0, { duration: 0.8, ease: "easeOut" });
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        perspective: "1200px", // 透视效果
      }}
    >
      {/* 卡片本体 - 将被倾斜 */}
      <motion.div
        className="relative w-full h-full rounded-3xl"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d", // 保持3D变换效果
          transition: "transform 0.1s cubic-bezier(0.22, 1, 0.36, 1)", // 使用贝塞尔曲线代替变量
        }}
      >
        {/* 背景渐变和发光效果 - 优化 */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: `radial-gradient(circle at ${lightX}% ${lightY}%, 
                         var(--theme-primary-400) 0%, 
                         var(--theme-secondary-600) 50%, 
                         var(--theme-primary-800) 100%)`,
            filter: `blur(18px)`,
            opacity: glowOpacity,
            transform: "translateZ(-10px) rotate(-6deg) scale(0.95)",
          }}
        />

        {/* 新增：环境光效果 */}
        <motion.div
          className="absolute inset-0 rounded-3xl overflow-hidden"
          style={{
            background: `linear-gradient(
              to bottom right,
              rgba(255, 255, 255, 0.4) 0%,
              rgba(255, 255, 255, 0) 50%,
              rgba(0, 0, 0, 0.2) 100%
            )`,
            opacity: ambientLightOpacity,
            transform: "translateZ(-5px)",
          }}
        />

        {/* 卡片主体 */}
        <motion.div
          className="absolute inset-0 rounded-3xl overflow-hidden border-2 border-[#121212]/10 dark:border-white/10 bg-[#f8f8f8] dark:bg-[#1a1a1a]"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* 新增：边缘高光效果 */}
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              boxShadow: `inset 0 0 ${edgeGlowSize}px 1px rgba(255, 255, 255, 0.8)`,
              opacity: 0.6,
              zIndex: 10,
            }}
          />

          {/* 图片容器 - 将相对于卡片向前突出 */}
          <motion.div
            className="w-full h-full"
            style={{
              transform: `translateZ(${imageZ}px)`, // 动态Z轴突出效果
              transformStyle: "preserve-3d",
            }}
          >
            <Image
              src={imageSrc}
              alt={alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
