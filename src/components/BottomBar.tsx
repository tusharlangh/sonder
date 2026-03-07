"use client";

import React, { useEffect, useState } from "react";
import { useStore, AspectRatio } from "../store/useStore";

export const BottomBar: React.FC = () => {
  const { aspectRatio, setAspectRatio, sourceMode } = useStore();
  const [fps, setFps] = useState(0);

  // FPS Counter
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
    <div className="absolute bottom-0 left-0 right-0 h-[100px] bg-transparent z-40 flex items-center justify-between px-10">
      {/* Left side */}
      <div className="flex items-center gap-2 text-white/30 text-[9px] tracking-[0.1em] font-medium uppercase relative top-[-6px]">
        <span>RENDER: LIVE / IMAGE</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 relative top-[-6px]">
        {/* Reduce characters text */}

        {/* FPS */}
        <div className="px-5 border border-white/10 flex items-center justify-center text-[9px] text-white/50 tracking-[0.1em] font-mono h-[38px]">
          FPS {fps}
        </div>

        {/* Aspect Ratios grouped buttons */}
        <div className="flex h-[38px]">
          {ratios.map((r, i) => (
            <button
              key={r}
              onClick={() => setAspectRatio(r)}
              className={`px-5 text-[9px] tracking-[0.1em] border-y border-r border-white/10 transition-colors h-full flex items-center justify-center ${
                i === 0 ? "border-l" : ""
              } ${
                aspectRatio === r
                  ? "bg-white/10 text-white font-bold"
                  : "text-white/30 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
