'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { useStore } from '../store/useStore';

/* ─── Black & White palette ─── */
const ACCENT = 'rgba(255, 255, 255, 0.9)';
const ACCENT_70 = 'rgba(255, 255, 255, 0.6)';
const ACCENT_40 = 'rgba(255, 255, 255, 0.30)';
const ACCENT_20 = 'rgba(255, 255, 255, 0.15)';
const ACCENT_10 = 'rgba(255, 255, 255, 0.08)';

interface GalleryItem {
  id: string;
  emoji: string;
  label: string;
  category: 'scenes' | 'emojis';
  sceneIndex?: number;
}

const GALLERY_ITEMS: GalleryItem[] = [
  // Scenes
  { id: 'scene-sculpture', emoji: '🗿', label: 'Sculpture', category: 'scenes', sceneIndex: 0 },
  { id: 'scene-rose', emoji: '🌹', label: 'Rose', category: 'scenes', sceneIndex: 1 },
  { id: 'scene-terrain', emoji: '🏔️', label: 'Terrain', category: 'scenes', sceneIndex: 2 },
  { id: 'scene-galaxy', emoji: '🌌', label: 'Galaxy', category: 'scenes', sceneIndex: 3 },
  { id: 'scene-waterfall', emoji: '💧', label: 'Waterfall', category: 'scenes', sceneIndex: 4 },
  { id: 'scene-ocean', emoji: '🌊', label: 'Ocean', category: 'scenes', sceneIndex: 5 },
  { id: 'scene-forest', emoji: '🌲', label: 'Forest', category: 'scenes', sceneIndex: 6 },
  { id: 'scene-mountains', emoji: '⛰️', label: 'Mountains', category: 'scenes', sceneIndex: 7 },
  { id: 'scene-sunset', emoji: '🌅', label: 'Sunset', category: 'scenes', sceneIndex: 8 },
  { id: 'scene-aurora', emoji: '🌌', label: 'Aurora', category: 'scenes', sceneIndex: 9 },
  { id: 'scene-rainstorm', emoji: '⛈️', label: 'Rainstorm', category: 'scenes', sceneIndex: 10 },
  { id: 'scene-desert', emoji: '🏜️', label: 'Desert', category: 'scenes', sceneIndex: 11 },
  { id: 'scene-blackhole', emoji: '🕳️', label: 'Black Hole', category: 'scenes', sceneIndex: 12 },
  { id: 'scene-earth', emoji: '🌍', label: 'Earth', category: 'scenes', sceneIndex: 13 },
  { id: 'scene-mars', emoji: '🔴', label: 'Mars', category: 'scenes', sceneIndex: 14 },
  { id: 'scene-gasgiant', emoji: '🪐', label: 'Gas Giant', category: 'scenes', sceneIndex: 15 },
  // Emojis / Templates
  { id: 'cat', emoji: '🐱', label: 'Cat', category: 'emojis' },
  { id: 'dog', emoji: '🐶', label: 'Dog', category: 'emojis' },
  { id: 'tree', emoji: '🌳', label: 'Tree', category: 'emojis' },
  { id: 'fish', emoji: '🐟', label: 'Fish', category: 'emojis' },
  { id: 'flower', emoji: '🌸', label: 'Flower', category: 'emojis' },
  { id: 'skull', emoji: '💀', label: 'Skull', category: 'emojis' },
  { id: 'sword', emoji: '🗡️', label: 'Sword', category: 'emojis' },
  { id: 'shield', emoji: '🛡️', label: 'Shield', category: 'emojis' },
  { id: 'car', emoji: '🚗', label: 'Car', category: 'emojis' },
  { id: 'robot', emoji: '🤖', label: 'Robot', category: 'emojis' },
  { id: 'apple', emoji: '🍎', label: 'Apple', category: 'emojis' },
  { id: 'coffee', emoji: '☕', label: 'Coffee', category: 'emojis' }
];

export const TemplateModal: React.FC = () => {
  const { isTemplateModalOpen, setIsTemplateModalOpen, setActiveTemplate, setSourceMode, activeTemplate, setActiveScene, activeScene, sourceMode } = useStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(GALLERY_ITEMS.map(t => t.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredItems = useMemo(() => {
    return GALLERY_ITEMS.filter(t => {
      const matchesSearch = t.label.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const handleSelect = (item: GalleryItem) => {
    if (item.category === 'scenes' && item.sceneIndex !== undefined) {
      setActiveScene(item.sceneIndex);
      setSourceMode('scenes');
    } else {
      setActiveTemplate(item.id);
      setSourceMode('templates');
    }
    setIsTemplateModalOpen(false);
  };

  const isItemActive = (item: GalleryItem) => {
    if (item.category === 'scenes') {
      return sourceMode === 'scenes' && activeScene === item.sceneIndex;
    }
    return sourceMode === 'templates' && activeTemplate === item.id;
  };

  return (
    <AnimatePresence>
      {isTemplateModalOpen && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.65)',
            padding: '24px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsTemplateModalOpen(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              width: '100%',
              maxWidth: '900px',
              maxHeight: '85vh',
              background: 'linear-gradient(160deg, rgba(18,14,10,0.92) 0%, rgba(8,8,8,0.95) 100%)',
              backdropFilter: 'blur(40px)',
              borderRadius: '22px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '28px 32px',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div>
                <h2 style={{
                  margin: 0,
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#fff',
                  fontFamily: "'Manrope', sans-serif"
                }}>
                  TEMPLATES
                </h2>
                <p style={{
                  margin: '6px 0 0',
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.35)',
                  fontWeight: 400,
                }}>
                  CHOOSE A PREBUILT ASCII ART
                </p>
              </div>
              
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = ACCENT_10;
                  e.currentTarget.style.borderColor = ACCENT_40;
                  e.currentTarget.style.color = ACCENT;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px 32px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              background: 'rgba(0,0,0,0.25)'
            }}>
              <div style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Search size={16} style={{ position: 'absolute', left: '16px', color: 'rgba(255,255,255,0.35)' }} />
                <input
                  type="text"
                  placeholder="SEARCH TEMPLATES..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '99px',
                    padding: '12px 16px 12px 42px',
                    color: '#fff',
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    outline: 'none',
                    transition: 'all 0.25s',
                    fontWeight: 400,
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = ACCENT_40;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT_10}`;
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                {categories.map(cat => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      style={{
                        background: isActive ? ACCENT_10 : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isActive ? ACCENT_40 : 'rgba(255,255,255,0.05)'}`,
                        borderRadius: '99px',
                        padding: '8px 16px',
                        color: isActive ? ACCENT : 'rgba(255,255,255,0.45)',
                        fontSize: '10px',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.25s',
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '32px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '16px',
              alignContent: 'start'
            }}>
              {filteredItems.length === 0 ? (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '60px 0',
                  color: 'rgba(255,255,255,0.25)',
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                  fontWeight: 400,
                }}>
                  NO ITEMS FOUND
                </div>
              ) : (
                filteredItems.map(t => {
                  const isActive = isItemActive(t);
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelect(t)}
                      style={{
                        background: isActive ? ACCENT_10 : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isActive ? ACCENT_40 : 'rgba(255,255,255,0.04)'}`,
                        borderBottom: isActive ? `2px solid ${ACCENT_70}` : `1px solid ${isActive ? ACCENT_40 : 'rgba(255,255,255,0.04)'}`,
                        borderRadius: '16px',
                        padding: '24px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.25s',
                        fontFamily: "'Manrope', sans-serif",
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                        }
                      }}
                    >
                      <span style={{ fontSize: '48px', lineHeight: 1, filter: isActive ? `drop-shadow(0 0 12px ${ACCENT_40})` : 'grayscale(30%) opacity(80%)' }}>
                        {t.emoji}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        letterSpacing: '0.2em',
                        color: isActive ? ACCENT : 'rgba(255,255,255,0.55)',
                        textTransform: 'uppercase',
                        fontWeight: isActive ? 700 : 400
                      }}>
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
