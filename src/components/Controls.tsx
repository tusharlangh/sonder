'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useStore, type ArtStyle, type SourceMode, type FXPreset } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Grid, ChevronDown, Video } from 'lucide-react';
import { TemplateModal } from './TemplateModal';

/* ─── Black & White palette ─── */
const ACCENT = 'rgba(255, 255, 255, 0.9)';
const ACCENT_70 = 'rgba(255, 255, 255, 0.6)';
const ACCENT_40 = 'rgba(255, 255, 255, 0.30)';
const ACCENT_20 = 'rgba(255, 255, 255, 0.15)';
const ACCENT_10 = 'rgba(255, 255, 255, 0.08)';
const ACCENT_05 = 'rgba(255, 255, 255, 0.04)';

export const Controls: React.FC = () => {
  const {
    sourceMode, setSourceMode,
    artStyle, setArtStyle,
    fxPreset, setFxPreset,
    brightness, setBrightness,
    contrast, setContrast,
    noise, setNoise,
    dithering, setDithering,
    colorMode, setColorMode,
    resolution, setResolution,
    activeScene, setActiveScene,
    activeTemplate, setActiveTemplate,
    uploadedImage, setUploadedImage,
    uploadedVideo, setUploadedVideo,
    controlsVisible, setControlsVisible,
    setIsTemplateModalOpen,
    customText, setCustomText,
    customFont, setCustomFont,
    backgroundColor, setBackgroundColor,
    asciiOpacity, setAsciiOpacity,
    asciiDensity, setAsciiDensity,
    imageVisibility, setImageVisibility,
    characterRamp, setCharacterRamp,
    bloomStrength, setBloomStrength,
  } = useStore();

  const [openSection, setOpenSection] = useState<string>('gallery');
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<any>(null);

  const scenes = [
    { label: 'SCULPTURE', index: 0 },
    { label: 'ROSE', index: 1 },
    { label: 'TERRAIN', index: 2 },
    { label: 'GALAXY', index: 3 },
    { label: 'WATERFALL', index: 4 },
    { label: 'OCEAN', index: 5 },
    { label: 'FOREST', index: 6 },
    { label: 'MOUNTAINS', index: 7 },
    { label: 'SUNSET', index: 8 },
    { label: 'AURORA', index: 9 },
    { label: 'RAINSTORM', index: 10 },
    { label: 'DESERT', index: 11 },
  ];

  const artStyles: Array<{ key: ArtStyle; label: string }> = [
    { key: 'classic', label: 'CLASSIC' },
  ];

  const fxPresets: Array<{ key: FXPreset; label: string }> = [
    { key: 'none', label: 'NONE' },
    { key: 'noise', label: 'NOISE' },
    { key: 'field', label: 'FIELD' },
    { key: 'intervals', label: 'INTERVALS' },
    { key: 'beam sweep', label: 'BEAM SWEEP' },
    { key: 'glitch', label: 'GLITCH' },
    { key: 'CRT monitor', label: 'CRT MONITOR' },
    { key: 'matrix rain', label: 'MATRIX RAIN' },
  ];

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setUploadedVideo(url);
      setSourceMode('video');
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedImage(ev.target?.result as string);
        setSourceMode('image');
      };
      reader.readAsDataURL(file);
    }
  }, [setUploadedImage, setUploadedVideo, setSourceMode]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setUploadedVideo(url);
      setSourceMode('video');
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedImage(ev.target?.result as string);
        setSourceMode('image');
      };
      reader.readAsDataURL(file);
    }
  }, [setUploadedImage, setUploadedVideo, setSourceMode]);

  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  const handleRandomize = () => {
    setActiveScene(Math.floor(Math.random() * 12));
    setSourceMode('scenes');
    setArtStyle(artStyles[Math.floor(Math.random() * artStyles.length)].key);
    setOpenSection('gallery');
  };

  const handleExport = async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    if (isRecording) {
      // Stop recording
      if (recorderRef.current) {
        recorderRef.current.stopRecording(() => {
          const blob = recorderRef.current!.getBlob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `sonder-animation-${Date.now()}.gif`;
          link.click();
          recorderRef.current!.destroy();
          recorderRef.current = null;
        });
      }
      setIsRecording(false);
    } else {
      // Start recording a GIF
      const { default: RecordRTC } = await import('recordrtc');
      
      // Ensure canvas is captured at 30fps
      const stream = canvas.captureStream(30);
      recorderRef.current = new RecordRTC(stream, {
        type: 'gif',
        frameRate: 30,
        canvas: {
          width: canvas.width / 2,
          height: canvas.height / 2
        }
      });
      
      recorderRef.current.startRecording();
      setIsRecording(true);
    }
  };

  const gridItemStyle = (isActive: boolean): React.CSSProperties => ({
    background: isActive ? ACCENT_10 : 'rgba(255,255,255,0.02)',
    border: `1px solid ${isActive ? ACCENT_40 : 'rgba(255,255,255,0.05)'}`,
    borderRadius: '14px',
    padding: '14px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    borderBottom: isActive ? `2px solid ${ACCENT_70}` : `1px solid ${isActive ? ACCENT_40 : 'rgba(255,255,255,0.05)'}`,
    fontFamily: 'inherit',
  });

  return (
    <>
      {/* ─── TOGGLE BUTTON (when controls are hidden) ─── */}
      <AnimatePresence>
        {!controlsVisible && (
          <motion.button
            onClick={() => setControlsVisible(true)}
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            style={{
              position: 'fixed', top: '20px', left: '20px', zIndex: 100,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(24px)',
              border: `1px solid rgba(255,255,255,0.1)`, borderRadius: '12px',
              color: 'rgba(255,255,255,0.6)', padding: '10px 18px 10px 14px',
              cursor: 'pointer', fontSize: '11px', fontFamily: "'Manrope', sans-serif",
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
              letterSpacing: '0.12em',
            }}
          >
            <Menu size={16} />
            <span>CONTROLS</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── AMBIENT GLOW (behind sidebar) ─── */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              top: '-100px',
              left: '-100px',
              width: '500px',
              height: '600px',
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)',
              zIndex: 40,
              pointerEvents: 'none',
              filter: 'blur(40px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* ─── SIDEBAR CONTROLS ─── */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: -20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, x: -20, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: '16px', left: '16px', bottom: '16px',
              width: '290px', zIndex: 50,
              background: 'linear-gradient(160deg, rgba(20,16,12,0.88) 0%, rgba(10,10,10,0.92) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              borderRadius: '22px',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              boxShadow: '0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 120px 20px', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '15px',
                  fontWeight: 400,
                  letterSpacing: '0.45em',
                  color: ACCENT,
                  fontFamily: "'Pixelify Sans', sans-serif",
                }}>
                  SONDER
                </span>
              </div>
              <button 
                onClick={() => setControlsVisible(false)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  width: '30px', height: '30px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  lineHeight: 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                }}
              >×</button>
            </div>

            <AccordionItem title="GALLERY" id="gallery" openSection={openSection} setOpenSection={setOpenSection} sourceMode={sourceMode}>
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  padding: '16px',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = ACCENT_10;
                  e.currentTarget.style.borderColor = ACCENT_40;
                  e.currentTarget.style.color = ACCENT;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                }}
              >
                <Grid size={14} />
                BROWSE GALLERY
              </button>
            </AccordionItem>

            <AccordionItem title="MEDIA" id="image" openSection={openSection} setOpenSection={setOpenSection} sourceMode={sourceMode}>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{
                  height: '130px',
                  border: '1px dashed rgba(255,255,255,0.12)',
                  borderRadius: '14px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.01)', cursor: 'pointer',
                  transition: 'all 0.25s',
                  padding: '12px'
                }}
                onClick={() => document.getElementById('sidebar-file-upload')?.click()}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.background = ACCENT_05; 
                  e.currentTarget.style.borderColor = ACCENT_20;
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; 
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                }}
              >
                {(uploadedImage && sourceMode === 'image') || (uploadedVideo && sourceMode === 'video') ? (
                  <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {sourceMode === 'image' ? (
                      <img src={uploadedImage!} alt="Uploaded" style={{ flex: 1, minHeight: 0, objectFit: 'contain', borderRadius: '8px', marginBottom: '8px' }} />
                    ) : (
                      <video src={uploadedVideo!} style={{ flex: 1, minHeight: 0, objectFit: 'contain', borderRadius: '8px', marginBottom: '8px' }} />
                    )}
                    <p style={{ fontSize: '8px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 500 }}>CLICK TO REPLACE</p>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px 0', fontWeight: 500 }}>DROP MEDIA</p>
                    <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', margin: 0, letterSpacing: '0.1em' }}>IMAGE OR VIDEO</p>
                  </>
                )}
                <input id="sidebar-file-upload" type="file" accept="image/*,video/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </div>
            </AccordionItem>

            <AccordionItem title="WEBCAM" id="webcam" openSection={openSection} setOpenSection={setOpenSection} sourceMode={sourceMode}>
              <button
                onClick={() => setSourceMode('camera')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: sourceMode === 'camera' ? ACCENT_10 : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${sourceMode === 'camera' ? ACCENT_40 : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  color: sourceMode === 'camera' ? ACCENT : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  if (sourceMode !== 'camera') {
                    e.currentTarget.style.background = ACCENT_05;
                    e.currentTarget.style.borderColor = ACCENT_20;
                  }
                }}
                onMouseLeave={(e) => {
                  if (sourceMode !== 'camera') {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  }
                }}
              >
                <Video size={14} />
                {sourceMode === 'camera' ? 'CAMERA ACTIVE' : 'START LIVE FEED'}
              </button>
            </AccordionItem>

            <AccordionItem title="TEXT" id="text" openSection={openSection} setOpenSection={setOpenSection} sourceMode={sourceMode}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => {
                    setCustomText(e.target.value);
                    setSourceMode('text');
                  }}
                  onFocus={() => setSourceMode('text')}
                  placeholder="TYPE YOUR TEXT..."
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    color: '#fff',
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '13px',
                    letterSpacing: '0.05em',
                    outline: 'none',
                    transition: 'all 0.25s',
                    fontWeight: 500,
                  }}
                />
                
                {/* Font Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '4px' }}>
                  {[
                    { key: "'Manrope', sans-serif", label: 'MODERN' },
                    { key: "'Playfair Display', serif", label: 'SERIF' },
                    { key: "'JetBrains Mono', monospace", label: 'MONO' }
                  ].map((f) => {
                    const isActive = customFont === f.key;
                    return (
                      <button
                        key={f.key}
                        onClick={() => {
                          setCustomFont(f.key);
                          setSourceMode('text');
                        }}
                        style={{
                          background: isActive ? ACCENT_20 : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isActive ? ACCENT_40 : 'rgba(255,255,255,0.05)'}`,
                          borderRadius: '8px',
                          padding: '8px 4px',
                          color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                          fontSize: '8px',
                          letterSpacing: '0.1em',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontFamily: f.key,
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>

                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', margin: 0, textAlign: 'center' }}>
                  TEXT WILL RENDER WITH EFFECTS
                </p>
              </div>
            </AccordionItem>

            <AccordionItem title="ART STYLE" id="artStyle" openSection={openSection} setOpenSection={setOpenSection} sourceMode={sourceMode}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {artStyles.map((s) => {
                  const isActive = artStyle === s.key;
                  return (
                    <button 
                      key={s.key} 
                      onClick={() => setArtStyle(s.key)} 
                      style={{
                        background: isActive ? ACCENT_10 : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isActive ? ACCENT_40 : 'rgba(255,255,255,0.05)'}`,
                        borderBottom: isActive ? `2px solid ${ACCENT_70}` : `1px solid ${isActive ? ACCENT_40 : 'rgba(255,255,255,0.05)'}`,
                        borderRadius: '12px', padding: '12px 4px',
                        color: isActive ? ACCENT : 'rgba(255,255,255,0.5)',
                        fontSize: '9px', letterSpacing: '0.15em', cursor: 'pointer', transition: 'all 0.25s',
                        fontFamily: "'Manrope', sans-serif", fontWeight: isActive ? 600 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                        }
                      }}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </AccordionItem>

            <AccordionItem title="FX PRESETS" id="fxPresets" openSection={openSection} setOpenSection={setOpenSection} sourceMode={sourceMode}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {fxPresets.map((s) => {
                  const isActive = fxPreset === s.key;
                  return (
                    <button 
                      key={s.key} 
                      onClick={() => setFxPreset(s.key)} 
                      style={{
                        background: isActive ? ACCENT_10 : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isActive ? ACCENT_40 : 'rgba(255,255,255,0.05)'}`,
                        borderBottom: isActive ? `2px solid ${ACCENT_70}` : `1px solid ${isActive ? ACCENT_40 : 'rgba(255,255,255,0.05)'}`,
                        borderRadius: '12px', padding: '12px 4px',
                        color: isActive ? ACCENT : 'rgba(255,255,255,0.5)',
                        fontSize: '9px', letterSpacing: '0.15em', cursor: 'pointer', transition: 'all 0.25s',
                        fontFamily: "'Manrope', sans-serif", fontWeight: isActive ? 600 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                        }
                      }}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </AccordionItem>

            <AccordionItem title="PRO PRESETS" id="proPresets" openSection={openSection} setOpenSection={setOpenSection} sourceMode={sourceMode}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                {[
                  {
                    label: 'CINEMATIC RGB',
                    apply: () => {
                      setBackgroundColor('#050505');
                      setColorMode(true);
                      setBrightness(1.1);
                      setContrast(1.3);
                      setFxPreset('CRT monitor');
                      setBloomStrength(0.8);
                      setDithering(0.2);
                      setCharacterRamp(1.2);
                      setAsciiOpacity(0.95);
                      setAsciiDensity(1.1);
                    }
                  },
                  {
                    label: 'MONOCHROME FINE',
                    apply: () => {
                      setBackgroundColor('#000000');
                      setColorMode(false);
                      setBrightness(1.0);
                      setContrast(1.5);
                      setFxPreset('none');
                      setBloomStrength(0.0);
                      setDithering(0.5);
                      setCharacterRamp(2.0);
                      setAsciiOpacity(1.0);
                      setAsciiDensity(2.0);
                    }
                  },
                  {
                    label: 'LUCID DREAM',
                    apply: () => {
                      setBackgroundColor('#020005');
                      setColorMode(true);
                      setBrightness(1.3);
                      setContrast(1.4);
                      setFxPreset('none');
                      setBloomStrength(1.8);
                      setDithering(0.0);
                      setCharacterRamp(1.0);
                      setAsciiOpacity(1.0);
                      setAsciiDensity(1.0);
                    }
                  },
                  {
                    label: 'RAW CONTRAST',
                    apply: () => {
                      setBackgroundColor('#000000');
                      setColorMode(false);
                      setBrightness(0.8);
                      setContrast(2.5);
                      setFxPreset('noise');
                      setBloomStrength(0.3);
                      setDithering(1.2);
                      setCharacterRamp(0.8);
                      setAsciiOpacity(1.0);
                      setAsciiDensity(1.3);
                    }
                  }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={preset.apply}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid rgba(255,255,255,0.05)`,
                      borderRadius: '12px', padding: '14px 12px',
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '10px', letterSpacing: '0.2em', cursor: 'pointer', transition: 'all 0.25s',
                      fontFamily: "'Manrope', sans-serif", fontWeight: 600,
                      textAlign: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = ACCENT_10;
                      e.currentTarget.style.borderColor = ACCENT_40;
                      e.currentTarget.style.color = '#FFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </AccordionItem>

            <AccordionItem title="CONTROLLER" id="controller" openSection={openSection} setOpenSection={setOpenSection} sourceMode={sourceMode}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <SliderControl label="RESOLUTION" value={resolution} min={1} max={100} step={1} onChange={setResolution} />
                
                {/* BG COLOR PRESETS */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.6)' }}>BG COLOR</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                    {/* Custom Color Picker */}
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '1' }}>
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        style={{
                          opacity: 0,
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          cursor: 'pointer',
                          zIndex: 2,
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                        border: '2px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                        pointerEvents: 'none',
                      }}>
                        <div style={{
                          width: '45%',
                          height: '45%',
                          borderRadius: '50%',
                          background: backgroundColor,
                          border: '1px solid rgba(255,255,255,0.4)',
                        }} />
                      </div>
                    </div>
                    {[
                      '#000000', // Black
                      '#120A05', // Deep Brown
                      '#0A1220', // Deep Navy
                      '#1A0D16', // Deep Plum
                      '#08140F', // Deep Forest
                      '#FFFFFF', // White
                    ].map((color) => {
                      const isActive = backgroundColor === color;
                      return (
                        <button
                          key={color}
                          onClick={() => setBackgroundColor(color)}
                          style={{
                            aspectRatio: '1',
                            borderRadius: '50%',
                            background: color,
                            border: `2px solid ${isActive ? '#fff' : 'rgba(255,255,255,0.1)'}`,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            boxShadow: isActive ? `0 0 10px ${color}` : 'none',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                <SliderControl label="BRIGHTNESS" value={brightness} min={0} max={4} step={0.01} onChange={setBrightness} />
                <SliderControl label="CONTRAST" value={contrast} min={0} max={4} step={0.01} onChange={setContrast} />
                <SliderControl label="GLOW (BLOOM)" value={bloomStrength} min={0} max={3} step={0.01} onChange={setBloomStrength} />
                <SliderControl label="IMAGE VISIBILITY" value={imageVisibility} min={0} max={1} step={0.01} onChange={setImageVisibility} />
                <SliderControl label="ASCII OPACITY" value={asciiOpacity} min={0} max={1} step={0.01} onChange={setAsciiOpacity} />
                <SliderControl label="ASCII DENSITY" value={asciiDensity} min={0.1} max={2} step={0.01} onChange={setAsciiDensity} />
                <SliderControl label="CHAR RAMP" value={characterRamp} min={0.1} max={3} step={0.01} onChange={setCharacterRamp} />
                <SliderControl label="DITHERING" value={dithering} min={0} max={2} step={0.01} onChange={setDithering} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>COLOR MODE</span>
                  <button
                    onClick={() => setColorMode(!colorMode)}
                    style={{
                      background: colorMode ? ACCENT_20 : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${colorMode ? ACCENT_40 : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '999px', padding: '4px 14px', fontSize: '9px', letterSpacing: '0.1em',
                      color: colorMode ? ACCENT : 'rgba(255,255,255,0.4)', cursor: 'pointer',
                      fontFamily: "'Manrope', sans-serif", fontWeight: 600, transition: 'all 0.2s',
                    }}
                  >{colorMode ? 'ON' : 'OFF'}</button>
                </div>
              </div>
            </AccordionItem>
          </div>

          {/* Bottom actions fixed at bottom of sidebar */}
          <div style={{ 
            padding: '18px 20px', 
            display: 'flex', flexDirection: 'column', gap: '12px', 
            borderTop: '1px solid rgba(255,255,255,0.06)', 
            background: 'linear-gradient(0deg, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.6) 100%)', 
            backdropFilter: 'blur(20px)', 
            position: 'absolute', bottom: 0, left: 0, right: 0 
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Primary CTA — Qualytics solid orange style */}
              <button
                onClick={handleRandomize}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '999px',
                  color: '#000',
                  fontSize: '10px',
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase' as const,
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 4px 16px rgba(255,255,255,0.1)',
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(255,255,255,0.2)'; 
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,255,255,0.1)'; 
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                RANDOM
              </button>
              {/* Secondary — outlined ghost */}
              <button
                onClick={handleExport}
                style={{
                  flex: 1,
                  background: isRecording ? 'rgba(255,50,50,0.2)' : 'transparent',
                  border: `1px solid ${isRecording ? 'rgba(255,50,50,0.8)' : ACCENT_40}`,
                  borderRadius: '999px',
                  color: isRecording ? '#ffb3b3' : ACCENT,
                  fontSize: '10px',
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase' as const,
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => { 
                  if (!isRecording) {
                    e.currentTarget.style.background = ACCENT_10; 
                    e.currentTarget.style.borderColor = ACCENT_70;
                  }
                }}
                onMouseLeave={(e) => { 
                  if (!isRecording) {
                    e.currentTarget.style.background = 'transparent'; 
                    e.currentTarget.style.borderColor = ACCENT_40;
                  }
                }}
              >
                {isRecording ? (
                  <>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff4444', animation: 'pulse 1s infinite' }} />
                    STOP
                  </>
                ) : (
                  'EXPORT GIF'
                )}
              </button>
            </div>
            {/* CSS Animation for the recording pulse */}
            <style>{`
              @keyframes pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(0.8); }
                100% { opacity: 1; transform: scale(1); }
              }
            `}</style>
            <div style={{ textAlign: 'center', fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', fontWeight: 400 }}>
              © SONDER {new Date().getFullYear()}
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
      <TemplateModal />
    </>
  );
};

// ─── Shared UI parts ───

const SliderControl: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (val: number) => void; }> = ({ label, value, min, max, step, onChange }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <span style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '9px', color: ACCENT_70, fontFamily: "'Space Mono', monospace", fontWeight: 400 }}>{Number.isInteger(step) ? value : value.toFixed(2)}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
  </div>
);

const AccordionItem = ({
  title, id, children, openSection, setOpenSection, sourceMode
}: {
  title: string; id: string; children: React.ReactNode;
  openSection: string; setOpenSection: (id: string) => void; sourceMode: SourceMode;
}) => {
  const isOpen = openSection === id;

  // For scenes, templates, image we highlight title if it's the active sourceMode
  const isSourceActive = (id === 'gallery' && (sourceMode === 'scenes' || sourceMode === 'templates')) || (id === 'image' && (sourceMode === 'image' || sourceMode === 'video')) || (id === 'text' && sourceMode === 'text') || (id === 'webcam' && sourceMode === 'camera');

  return (
    <div style={{ 
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'relative',
    }}>
      {/* Active left accent bar */}
      {isSourceActive && (
        <div style={{
          position: 'absolute',
          left: '-20px',
          top: '12px',
          bottom: '12px',
          width: '3px',
          borderRadius: '0 3px 3px 0',
          background: `linear-gradient(180deg, ${ACCENT} 0%, ${ACCENT_40} 100%)`,
        }} />
      )}
      <button 
        onClick={() => setOpenSection(isOpen ? '' : id)}
        style={{ 
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'none', border: 'none', 
          color: isOpen ? ACCENT : isSourceActive ? ACCENT : 'rgba(255,255,255,0.7)', 
          padding: '16px 0', fontSize: '12px', letterSpacing: '0.18em', fontWeight: 700, 
          cursor: 'pointer', fontFamily: "'Manrope', sans-serif", transition: 'all 0.2s',
          textTransform: 'uppercase',
        }}
        onMouseEnter={(e) => { 
          if (!isOpen && !isSourceActive) { e.currentTarget.style.color = '#fff'; }
        }}
        onMouseLeave={(e) => { 
          if (!isOpen && !isSourceActive) { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }
        }}
      >
        <span>{title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ color: isOpen ? ACCENT_70 : 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center' }}
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingBottom: '16px' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
