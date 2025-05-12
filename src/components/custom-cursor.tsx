"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

export function CustomCursor() {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const [clicked, setClicked] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [isMagnetic, setIsMagnetic] = useState(false);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // 保存所有具有磁吸效果的元素
  const magneticElementsRef = useRef<Element[]>([]);
  const currentMagnetRef = useRef<{
    element: Element;
    rect: DOMRect;
    strength: number;
  } | null>(null);

  const animateCursor = useCallback(
    (time: number) => {
      if (previousTimeRef.current !== null) {
        const currentX = cursorX.get();
        const currentY = cursorY.get();

        // 检查是否有磁吸元素
        if (currentMagnetRef.current) {
          const { rect, strength } = currentMagnetRef.current;
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          // 计算磁吸效果 - 根据距离中心点的远近调整速度
          const magnetX = currentX + (centerX - currentX) * (strength * 0.3);
          const magnetY = currentY + (centerY - currentY) * (strength * 0.3);

          cursorX.set(magnetX);
          cursorY.set(magnetY);
        } else {
          // 正常的光标跟随逻辑 - 使用优化的缓动系数
          const speedFactor = 0.2;
          cursorX.set(
            currentX + (mousePositionRef.current.x - currentX) * speedFactor
          );
          cursorY.set(
            currentY + (mousePositionRef.current.y - currentY) * speedFactor
          );
        }
      }

      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animateCursor);
    },
    [cursorX, cursorY]
  );

  // 检查鼠标是否在磁吸元素附近
  const checkMagneticElements = useCallback(
    (mouseX: number, mouseY: number) => {
      const elements = magneticElementsRef.current;
      if (!elements.length) return;

      let closestElement: Element | null = null;
      let closestDistance = Infinity;
      let closestRect: DOMRect | null = null;
      let maxStrength = 0;

      // 寻找最近的磁吸元素
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distance = Math.sqrt(
          Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
        );

        // 磁吸范围 (120px)
        if (distance < 120 && distance < closestDistance) {
          closestDistance = distance;
          closestElement = element;
          closestRect = rect;
          // 根据距离计算强度 (1 = 最强, 0 = 最弱)
          maxStrength = 1 - distance / 120;
        }
      });

      // 如果找到了磁吸元素
      if (closestElement && closestRect) {
        currentMagnetRef.current = {
          element: closestElement,
          rect: closestRect,
          strength: maxStrength,
        };
        setIsMagnetic(true);
      } else {
        currentMagnetRef.current = null;
        setIsMagnetic(false);
      }
    },
    [] // 不再依赖于magneticElements状态，而是使用ref
  );

  const handleMouseEvent = useCallback(
    (e: MouseEvent) => {
      mousePositionRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      // 检查磁吸元素
      checkMagneticElements(e.clientX, e.clientY);

      if (e.type === "mousedown") setClicked(true);
      if (e.type === "mouseup") setClicked(false);

      const target = e.target as HTMLElement;
      if (e.type === "mouseover") {
        setLinkHovered(
          !!target.closest(
            "a, button, [role=button], input, label, [data-hoverable]"
          )
        );
      }

      if (e.type === "mouseleave") setHidden(true);
      if (e.type === "mouseenter") setHidden(false);

      if (!requestRef.current) {
        requestRef.current = requestAnimationFrame(animateCursor);
      }
    },
    [animateCursor, checkMagneticElements]
  );

  // 更新磁吸元素引用的函数 - 使用防抖处理
  const updateMagneticElements = useCallback(() => {
    const elements = document.querySelectorAll(".magnetic-element");
    magneticElementsRef.current = Array.from(elements);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setHidden(false);
    }, 1000);

    cursorX.set(window.innerWidth / 2);
    cursorY.set(window.innerHeight / 2);
    mousePositionRef.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    // 初始化磁吸元素引用
    updateMagneticElements();

    // 创建防抖函数
    let debounceTimeout: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        updateMagneticElements();
      }, 100); // 100ms防抖
    };

    // 订阅DOM变化，以防抖方式更新磁吸元素列表
    const observer = new MutationObserver(() => {
      debouncedUpdate();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("mousemove", handleMouseEvent, { passive: true });
    window.addEventListener("mouseover", handleMouseEvent, { passive: true });
    window.addEventListener("mousedown", handleMouseEvent, { passive: true });
    window.addEventListener("mouseup", handleMouseEvent, { passive: true });
    window.addEventListener("mouseleave", handleMouseEvent);
    window.addEventListener("mouseenter", handleMouseEvent);

    document.body.classList.add("custom-cursor");

    return () => {
      clearTimeout(timeout);
      clearTimeout(debounceTimeout);
      observer.disconnect();
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener("mousemove", handleMouseEvent);
      window.removeEventListener("mouseover", handleMouseEvent);
      window.removeEventListener("mousedown", handleMouseEvent);
      window.removeEventListener("mouseup", handleMouseEvent);
      window.removeEventListener("mouseleave", handleMouseEvent);
      window.removeEventListener("mouseenter", handleMouseEvent);
      document.body.classList.remove("custom-cursor");
    };
  }, [handleMouseEvent, updateMagneticElements, cursorX, cursorY]);

  return (
    <>
      <motion.div
        ref={dotRef}
        className="cursor-dot"
        style={{
          translateX: cursorX,
          translateY: cursorY,
          x: -4,
          y: -4,
        }}
        animate={{
          scale: clicked ? 0.8 : linkHovered ? 1.5 : isMagnetic ? 1.4 : 1,
          opacity: hidden ? 0 : 1,
        }}
        transition={{
          scale: { type: "spring", stiffness: 300, damping: 25 },
          opacity: { duration: 0.2 },
        }}
      />
      <motion.div
        ref={ringRef}
        className="cursor-ring"
        style={{
          translateX: cursorX,
          translateY: cursorY,
          x: -16,
          y: -16,
        }}
        animate={{
          scale: clicked ? 0.7 : linkHovered ? 1.3 : isMagnetic ? 1.2 : 1,
          opacity: hidden ? 0 : isMagnetic ? 0.9 : linkHovered ? 0.4 : 0.7,
        }}
        transition={{
          scale: { type: "spring", stiffness: 150, damping: 15 },
          opacity: { duration: 0.2 },
        }}
      />
    </>
  );
}
