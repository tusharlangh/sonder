"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import { useStore } from "../store/useStore";

const ACCENT = "rgba(255, 255, 255, 0.9)";
const ACCENT_70 = "rgba(255, 255, 255, 0.6)";
const ACCENT_40 = "rgba(255, 255, 255, 0.30)";
const ACCENT_20 = "rgba(255, 255, 255, 0.15)";
const ACCENT_10 = "rgba(255, 255, 255, 0.08)";

interface GalleryItem {
  id: string;
  emoji: string;
  label: string;
  category: "scenes" | "emojis";
  sceneIndex?: number;
}

const GALLERY_ITEMS: GalleryItem[] = [

  {
    id: "scene-sculpture",
    emoji: "🗿",
    label: "Sculpture",
    category: "scenes",
    sceneIndex: 0,
  },
  {
    id: "scene-rose",
    emoji: "🌹",
    label: "Rose",
    category: "scenes",
    sceneIndex: 1,
  },
  {
    id: "scene-terrain",
    emoji: "🏔️",
    label: "Terrain",
    category: "scenes",
    sceneIndex: 2,
  },
  {
    id: "scene-galaxy",
    emoji: "🌌",
    label: "Galaxy",
    category: "scenes",
    sceneIndex: 3,
  },
  {
    id: "scene-waterfall",
    emoji: "💧",
    label: "Waterfall",
    category: "scenes",
    sceneIndex: 4,
  },
  {
    id: "scene-ocean",
    emoji: "🌊",
    label: "Ocean",
    category: "scenes",
    sceneIndex: 5,
  },
  {
    id: "scene-forest",
    emoji: "🌲",
    label: "Forest",
    category: "scenes",
    sceneIndex: 6,
  },
  {
    id: "scene-mountains",
    emoji: "⛰️",
    label: "Mountains",
    category: "scenes",
    sceneIndex: 7,
  },
  {
    id: "scene-sunset",
    emoji: "🌅",
    label: "Sunset",
    category: "scenes",
    sceneIndex: 8,
  },
  {
    id: "scene-aurora",
    emoji: "🌌",
    label: "Aurora",
    category: "scenes",
    sceneIndex: 9,
  },
  {
    id: "scene-rainstorm",
    emoji: "⛈️",
    label: "Rainstorm",
    category: "scenes",
    sceneIndex: 10,
  },
  {
    id: "scene-desert",
    emoji: "🏜️",
    label: "Desert",
    category: "scenes",
    sceneIndex: 11,
  },
  {
    id: "scene-blackhole",
    emoji: "🕳️",
    label: "Black Hole",
    category: "scenes",
    sceneIndex: 12,
  },
  {
    id: "scene-earth",
    emoji: "🌍",
    label: "Earth",
    category: "scenes",
    sceneIndex: 13,
  },
  {
    id: "scene-mars",
    emoji: "🔴",
    label: "Mars",
    category: "scenes",
    sceneIndex: 14,
  },
  {
    id: "scene-gasgiant",
    emoji: "🪐",
    label: "Gas Giant",
    category: "scenes",
    sceneIndex: 15,
  },

  { id: "laugh", emoji: "😂", label: "Laugh", category: "emojis" },
  { id: "heart", emoji: "❤️", label: "Heart", category: "emojis" },
  { id: "rofl", emoji: "🤣", label: "ROFL", category: "emojis" },
  { id: "thumbs_up", emoji: "👍", label: "Thumbs Up", category: "emojis" },
  { id: "cry", emoji: "😭", label: "Cry", category: "emojis" },
  { id: "pray", emoji: "🙏", label: "Pray", category: "emojis" },
  { id: "kiss", emoji: "😘", label: "Kiss", category: "emojis" },
  { id: "hearts", emoji: "🥰", label: "Hearts", category: "emojis" },
  { id: "heart_eyes", emoji: "😍", label: "Heart Eyes", category: "emojis" },
  { id: "smile", emoji: "😊", label: "Smile", category: "emojis" },
  { id: "fire", emoji: "🔥", label: "Fire", category: "emojis" },
  { id: "sparkles", emoji: "✨", label: "Sparkles", category: "emojis" },
];

export const TemplateModal: React.FC = () => {
  const {
    isTemplateModalOpen,
    setIsTemplateModalOpen,
    setActiveTemplate,
    setSourceMode,
    activeTemplate,
    setActiveScene,
    activeScene,
    sourceMode,
  } = useStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = new Set(GALLERY_ITEMS.map((t) => t.category));
    return ["all", ...Array.from(cats)];
  }, []);

  const filteredItems = useMemo(() => {
    return GALLERY_ITEMS.filter((t) => {
      const matchesSearch = t.label
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const handleSelect = (item: GalleryItem) => {
    if (item.category === "scenes" && item.sceneIndex !== undefined) {
      setActiveScene(item.sceneIndex);
      setSourceMode("scenes");
    } else {
      setActiveTemplate(item.id);
      setSourceMode("templates");
    }
    setIsTemplateModalOpen(false);
  };

  const isItemActive = (item: GalleryItem) => {
    if (item.category === "scenes") {
      return sourceMode === "scenes" && activeScene === item.sceneIndex;
    }
    return sourceMode === "templates" && activeTemplate === item.id;
  };

  return (
    <AnimatePresence>
      {isTemplateModalOpen && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px) saturate(100%)" }}
          animate={{ opacity: 1, backdropFilter: "blur(100px) saturate(200%)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px) saturate(100%)" }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsTemplateModalOpen(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="w-full h-full max-w-[1200px] max-h-[85vh] bg-[#1c1c1e]/80 backdrop-blur-3xl border border-white/10 shadow-2xl rounded-3xl py-10 px-12 flex flex-col overflow-hidden box-border"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="m-0 text-[36px] font-semibold text-white tracking-tight">
                  Gallery
                </h2>
                <p className="mt-1 mb-0 text-[14px] text-white/50 font-medium tracking-wide">
                  Choose a Visual Essence
                </p>
              </div>

              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="bg-white/5 border border-white/5 rounded-full w-[44px] h-[44px] flex items-center justify-center text-white/70 cursor-pointer transition-all duration-300 ease-out hover:bg-white/10 hover:text-white hover:scale-105 shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-6 py-4 px-2 mb-4">
              <div className="w-[300px] relative flex items-center">
                <Search
                  size={16}
                  className="absolute left-4 text-white/40"
                />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-full py-2.5 pr-4 pl-10 text-white text-[14px] outline-none transition-all duration-300 font-medium focus:border-white/30 focus:bg-black/60 shadow-inner"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`py-1.5 px-4 text-[13px] font-medium capitalize rounded-full cursor-pointer whitespace-nowrap transition-all duration-300 ease-out border ${
                        isActive
                          ? "bg-white text-black border-white shadow-sm"
                          : "bg-transparent border-transparent text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 lg:p-6 grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-4 content-start">
              {filteredItems.length === 0 ? (
                <div className="col-[1/-1] text-center py-[60px] text-white/40 text-[14px] font-medium">
                  No items found
                </div>
              ) : (
                filteredItems.map((t) => {
                  const isActive = isItemActive(t);
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelect(t)}
                      className={`border border-transparent rounded-2xl py-6 px-4 flex flex-col items-center gap-3 cursor-pointer transition-all duration-300 ease-out  ${
                        isActive
                          ? "bg-white/10 border-white/20 shadow-md transform scale-[1.02]"
                          : "bg-black/20 hover:bg-white/5 hover:border-white/10 hover:-translate-y-1"
                      }`}
                    >
                      <span
                        className="text-[42px] leading-none transition-all duration-300"
                        style={{
                          filter: isActive
                            ? `drop-shadow(0 4px 12px rgba(255,255,255,0.4))`
                            : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                          opacity: isActive ? 1 : 0.8,
                        }}
                      >
                        {t.emoji}
                      </span>
                      <span
                        className={`text-[12px] font-medium ${
                          isActive
                            ? "text-white"
                            : "text-white/60"
                        }`}
                      >
                        {t.label}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};