"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import { useStore } from "../store/useStore";

/* ─── Black & White palette ─── */
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
  // Scenes
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
  // Emojis / Templates
  { id: "cat", emoji: "🐱", label: "Cat", category: "emojis" },
  { id: "dog", emoji: "🐶", label: "Dog", category: "emojis" },
  { id: "tree", emoji: "🌳", label: "Tree", category: "emojis" },
  { id: "fish", emoji: "🐟", label: "Fish", category: "emojis" },
  { id: "flower", emoji: "🌸", label: "Flower", category: "emojis" },
  { id: "skull", emoji: "💀", label: "Skull", category: "emojis" },
  { id: "sword", emoji: "🗡️", label: "Sword", category: "emojis" },
  { id: "shield", emoji: "🛡️", label: "Shield", category: "emojis" },
  { id: "car", emoji: "🚗", label: "Car", category: "emojis" },
  { id: "robot", emoji: "🤖", label: "Robot", category: "emojis" },
  { id: "apple", emoji: "🍎", label: "Apple", category: "emojis" },
  { id: "coffee", emoji: "☕", label: "Coffee", category: "emojis" },
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
            className="w-full h-full max-w-[1400px] bg-[#040404]/80 border border-white/10 shadow-2xl rounded-2xl py-[60px] px-[80px] flex flex-col overflow-hidden box-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="m-0 text-[48px] font-medium text-white ">
                  Gallery
                </h2>
                <p className="pl-1 mt-2 mb-0 text-[12px] text-white/40 font-normal ">
                  Choose a Visual Essence
                </p>
              </div>

              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="bg-transparent border-none rounded-none w-[38px] h-[38px] flex items-center justify-center text-white/50 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-white hover:scale-90"
              >
                <X size={18} />
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 py-4 px-8">
              <div className="flex-1 relative flex items-center">
                <Search
                  size={16}
                  className="absolute left-0 text-white/35"
                />
                <input
                  type="text"
                  placeholder="SEARCH..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent border-none border-b border-white/10 rounded-none py-3 pr-4 pl-8 text-white  text-[12px] tracking-[0.1em] outline-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] font-normal focus:border-white/40"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`bg-transparent border-none border-b rounded-none py-2 px-1 text-[10px] tracking-[0.2em] uppercase cursor-pointer whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]  ${
                        isActive
                          ? "border-white text-white font-medium"
                          : "border-transparent text-white/40 font-normal hover:text-white/70"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 content-start">
              {filteredItems.length === 0 ? (
                <div className="col-[1/-1] text-center py-[60px] text-white/25 text-[11px] tracking-[0.1em] font-normal uppercase">
                  NO ITEMS FOUND
                </div>
              ) : (
                filteredItems.map((t) => {
                  const isActive = isItemActive(t);
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelect(t)}
                      className={`border-none rounded-none py-8 px-4 flex flex-col items-center gap-4 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]  ${
                        isActive
                          ? "bg-white/[0.03]"
                          : "bg-transparent hover:bg-white/[0.01] hover:-translate-y-[2px]"
                      }`}
                    >
                      <span
                        className="text-[48px] leading-none transition-all duration-500"
                        style={{
                          filter: isActive
                            ? `drop-shadow(0 0 12px rgba(255,255,255,0.8))`
                            : "grayscale(40%) opacity(70%)",
                        }}
                      >
                        {t.emoji}
                      </span>
                      <span
                        className={`text-[10px] tracking-[0.1em] uppercase ${
                          isActive
                            ? "text-white font-medium"
                            : "text-white/50 font-normal"
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
