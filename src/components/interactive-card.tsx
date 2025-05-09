"use client"

import React, { useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import Image from "next/image";

interface InteractiveCardProps {
  imageSrc: string;
  alt: string;
  className?: string;
}

export default function InteractiveCard({ imageSrc, alt, className }: InteractiveCardProps) {
  // 引用卡片容器
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 创建motion值来跟踪鼠标位置
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // 将x/y坐标转换为旋转角度
  // 注意: 这里我们使用了较大的旋转角度(30度)来达到明显的3D效果
  const rotateX = useTransform(y, [-300, 300], [30, -30]);
  const rotateY = useTransform(x, [-300, 300], [-30, 30]);
  
  // 图片Z轴突出效果 - 根据倾斜程度动态调整
  const imageZ = useTransform(
    [rotateX, rotateY],
    ([latestRotateX, latestRotateY]) => {
      const rotateValue = Math.abs(latestRotateX as number) + Math.abs(latestRotateY as number);
      // 将旋转值转换为Z轴位移量，最大值约40px
      return Math.min(40, rotateValue * 0.5);
    }
  );
  
  // 根据鼠标位置计算光照强度和位置，增强3D效果
  const lightX = useTransform(x, [-300, 300], [-20, 20]);
  const lightY = useTransform(y, [-300, 300], [-20, 20]);
  
  // 根据鼠标位置计算发光效果的强度
  const glowOpacity = useTransform(
    [rotateX, rotateY],
    ([latestRotateX, latestRotateY]) => {
      const rotateValue = Math.abs(latestRotateX as number) + Math.abs(latestRotateY as number);
      // 将旋转值映射到0.2-0.8之间的透明度值
      return 0.2 + Math.min(0.6, rotateValue * 0.01);
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
    // 平滑地将卡片恢复到初始状态
    animate(x, 0, { duration: 0.5, ease: "easeOut" });
    animate(y, 0, { duration: 0.5, ease: "easeOut" });
  }
  
  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1200px", // 透视效果，使3D变换更加明显
      }}
    >
      {/* 卡片本体 - 将被倾斜 */}
      <motion.div 
        className="relative w-full h-full rounded-3xl"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d", // 保持3D变换效果
          transition: "all 0.1s ease-out", // 平滑过渡
        }}
      >
        {/* 背景渐变和发光效果 */}
        <motion.div 
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] opacity-80 dark:opacity-60 blur-md transform -rotate-6 scale-95"
          style={{
            transform: "translateZ(-10px) rotate(-6deg) scale(0.95)",
            // 动态更新光照效果
            background: `radial-gradient(circle at ${lightX}% ${lightY}%, var(--theme-primary) 0%, var(--theme-secondary) 80%)`,
          }}
        />
        
        {/* 卡片边缘发光效果 */}
        <motion.div 
          className="absolute inset-0 rounded-3xl"
          style={{
            boxShadow: "0 0 30px 2px var(--theme-primary)",
            opacity: glowOpacity,
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