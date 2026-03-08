"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useStore, AspectRatio } from "../store/useStore";

export const BottomBar: React.FC = () => {
  const { aspectRatio, setAspectRatio, sourceMode, bottomBarVisible } =
    useStore();
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      animationId = requestAnimationFrame(measureFPS);
    };
    animationId = requestAnimationFrame(measureFPS);

    return () => cancelAnimationFrame(animationId);
  }, []);

  const ratios: AspectRatio[] = [
    "ORIGINAL",
    "16:9",
    "4:3",
    "1:1",
    "3:4",
    "9:16",
  ];

  return (
    <motion.div
      initial={{ y: 0, opacity: 1, scale: 1 }}
      animate={{
        y: bottomBarVisible ? 0 : 80,
        opacity: bottomBarVisible ? 1 : 0,
        scale: bottomBarVisible ? 1 : 0.95,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 1,
      }}
      className={`absolute bottom-6.5 left-1/2 -translate-x-1/2 w-max max-w-[95vw] py-3 bg-[#1d1d1f]/70 backdrop-blur-3xl rounded-full z-40 flex items-center px-6 shadow-[0_12px_48px_rgba(0,0,0,0.5)] gap-6 lg:gap-10 ${
        !bottomBarVisible ? "pointer-events-none" : ""
      }`}
    >
      <div className="flex items-center gap-2 text-white/80 text-[13px] font-medium whitespace-nowrap">
        <span>Render: Live / Image</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center justify-center text-[12px] text-white/50 font-mono font-medium whitespace-nowrap">
          {fps} FPS
        </div>

        <div className="w-[1px] h-[18px] bg-white/15 rounded-full" />

        <div className="flex gap-1 bg-black/40 rounded-full p-1 border border-white/5 shadow-inner">
          {ratios.map((r, i) => (
            <button
              key={r}
              onClick={() => setAspectRatio(r)}
              className={`relative px-4 py-1.5 text-[12px] font-semibold rounded-full transition-colors duration-300 ease-out flex items-center justify-center whitespace-nowrap outline-none focus:outline-none ${
                aspectRatio === r
                  ? "text-black"
                  : "bg-transparent text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {aspectRatio === r && (
                <motion.div
                  layoutId="aspectRatioPill"
                  className="absolute inset-0 bg-white rounded-full shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{r}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};