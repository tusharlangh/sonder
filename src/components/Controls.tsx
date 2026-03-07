"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  useStore,
  type ArtStyle,
  type SourceMode,
  type FXPreset,
} from "../store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeftOpen,
  PanelLeftClose,
  Grid,
  ChevronDown,
  Video,
  X,
} from "lucide-react";
import { TemplateModal } from "./TemplateModal";

/* ─── Black & White palette ─── */
const ACCENT = "rgba(255, 255, 255, 0.9)";
const ACCENT_70 = "rgba(255, 255, 255, 0.6)";
const ACCENT_40 = "rgba(255, 255, 255, 0.30)";
const ACCENT_20 = "rgba(255, 255, 255, 0.15)";
const ACCENT_10 = "rgba(255, 255, 255, 0.08)";
const ACCENT_05 = "rgba(255, 255, 255, 0.04)";

export const Controls: React.FC = () => {
  const {
    sourceMode,
    setSourceMode,
    artStyle,
    setArtStyle,
    fxPreset,
    setFxPreset,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    noise,
    setNoise,
    dithering,
    setDithering,
    colorMode,
    setColorMode,
    resolution,
    setResolution,
    activeScene,
    setActiveScene,
    activeTemplate,
    setActiveTemplate,
    uploadedImage,
    setUploadedImage,
    uploadedVideo,
    setUploadedVideo,
    controlsVisible,
    setControlsVisible,
    setIsTemplateModalOpen,
    customText,
    setCustomText,
    customFont,
    setCustomFont,
    backgroundColor,
    setBackgroundColor,
    asciiOpacity,
    setAsciiOpacity,
    asciiDensity,
    setAsciiDensity,
    imageVisibility,
    setImageVisibility,
    characterRamp,
    setCharacterRamp,
    bloomStrength,
    setBloomStrength,
  } = useStore();

  const [openSection, setOpenSection] = useState<string>("gallery");
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<any>(null);

  const scenes = [
    { label: "SCULPTURE", index: 0 },
    { label: "ROSE", index: 1 },
    { label: "TERRAIN", index: 2 },
    { label: "GALAXY", index: 3 },
    { label: "WATERFALL", index: 4 },
    { label: "OCEAN", index: 5 },
    { label: "FOREST", index: 6 },
    { label: "MOUNTAINS", index: 7 },
    { label: "SUNSET", index: 8 },
    { label: "AURORA", index: 9 },
    { label: "RAINSTORM", index: 10 },
    { label: "DESERT", index: 11 },
  ];

  const artStyles: Array<{ key: ArtStyle; label: string }> = [
    { key: "classic", label: "CLASSIC" },
  ];

  const fxPresets: Array<{ key: FXPreset; label: string }> = [
    { key: "none", label: "NONE" },
    { key: "noise", label: "NOISE" },
    { key: "field", label: "FIELD" },
    { key: "intervals", label: "INTERVALS" },
    { key: "beam sweep", label: "BEAM SWEEP" },
    { key: "glitch", label: "GLITCH" },
    { key: "CRT monitor", label: "CRT MONITOR" },
    { key: "matrix rain", label: "MATRIX RAIN" },
  ];

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        setUploadedVideo(url);
        setSourceMode("video");
      } else if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setUploadedImage(ev.target?.result as string);
          setSourceMode("image");
        };
        reader.readAsDataURL(file);
      }
    },
    [setUploadedImage, setUploadedVideo, setSourceMode],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        setUploadedVideo(url);
        setSourceMode("video");
      } else if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setUploadedImage(ev.target?.result as string);
          setSourceMode("image");
        };
        reader.readAsDataURL(file);
      }
    },
    [setUploadedImage, setUploadedVideo, setSourceMode],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => e.preventDefault(),
    [],
  );

  const handleRandomize = () => {
    setActiveScene(Math.floor(Math.random() * 12));
    setSourceMode("scenes");
    setArtStyle(artStyles[Math.floor(Math.random() * artStyles.length)].key);
    setOpenSection("gallery");
  };

  const handleExport = async () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    if (isRecording) {
      // Stop recording
      if (recorderRef.current) {
        recorderRef.current.stopRecording(() => {
          const blob = recorderRef.current!.getBlob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
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
      const { default: RecordRTC } = await import("recordrtc");

      // Ensure canvas is captured at 30fps
      const stream = canvas.captureStream(30);
      recorderRef.current = new RecordRTC(stream, {
        type: "gif",
        frameRate: 30,
        canvas: {
          width: canvas.width / 2,
          height: canvas.height / 2,
        },
      });

      recorderRef.current.startRecording();
      setIsRecording(true);
    }
  };

  const gridItemStyle = (isActive: boolean): React.CSSProperties => ({
    background: isActive ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
    border: `1px solid ${isActive ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.02)"}`,
    borderRadius: "2px",
    padding: "14px 8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
  });

  return (
    <>
      {/* ─── AMBIENT GLOW (removed for flat aesthetic) ─── */}

      {/* ─── SIDEBAR CONTROLS ─── */}
      <div className="w-full h-full flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto pt-10 px-10 pb-[120px] flex flex-col">
          <div className="flex flex-col gap-[6px] mb-4">
            <h1
              className="text-[32px] leading-none tracking-[0.2em] text-white font-bold m-0"
              style={{ fontFamily: "var(--font-pixelify), sans-serif" }}
            >
              SONDER
            </h1>
          </div>

          <AccordionItem
            title="GALLERY"
            id="gallery"
            openSection={openSection}
            setOpenSection={setOpenSection}
            sourceMode={sourceMode}
          >
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-transparent border-none rounded-none p-4 text-white/70 cursor-pointer transition-colors duration-200 text-[9px] tracking-[0.1em]  font-medium hover:bg-white/5 hover:text-white"
            >
              <Grid size={14} />
              BROWSE GALLERY
            </button>
          </AccordionItem>

          <AccordionItem
            title="MEDIA"
            id="image"
            openSection={openSection}
            setOpenSection={setOpenSection}
            sourceMode={sourceMode}
          >
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="h-[130px] border border-transparent rounded-none flex flex-col items-center justify-center bg-transparent cursor-pointer transition-colors duration-200 p-3 hover:bg-white/5"
              onClick={() =>
                document.getElementById("sidebar-file-upload")?.click()
              }
            >
              {(uploadedImage && sourceMode === "image") ||
              (uploadedVideo && sourceMode === "video") ? (
                <div
                  style={{
                    textAlign: "center",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {sourceMode === "image" ? (
                    <img
                      src={uploadedImage!}
                      alt="Uploaded"
                      style={{
                        flex: 1,
                        minHeight: 0,
                        objectFit: "contain",
                        borderRadius: "0px",
                        marginBottom: "8px",
                      }}
                    />
                  ) : (
                    <video
                      src={uploadedVideo!}
                      style={{
                        flex: 1,
                        minHeight: 0,
                        objectFit: "contain",
                        borderRadius: "0px",
                        marginBottom: "8px",
                      }}
                    />
                  )}
                  <p className="text-[8px] tracking-[0.1em] text-white/40 m-0 font-medium">
                    CLICK TO REPLACE
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] tracking-[0.1em] text-white/50 m-0 mb-1 font-medium">
                    DROP MEDIA
                  </p>
                  <p className="text-[9px] text-white/25 m-0 tracking-[0.1em]">
                    IMAGE OR VIDEO
                  </p>
                </>
              )}
              <input
                id="sidebar-file-upload"
                type="file"
                accept="image/*,video/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </div>
          </AccordionItem>

          <AccordionItem
            title="WEBCAM"
            id="webcam"
            openSection={openSection}
            setOpenSection={setOpenSection}
            sourceMode={sourceMode}
          >
            <button
              onClick={() => setSourceMode("camera")}
              className={`w-full flex items-center justify-center gap-2 border-none rounded-none p-4 cursor-pointer transition-colors duration-200 text-[9px] tracking-[0.1em]  font-medium ${
                sourceMode === "camera"
                  ? "bg-white/5 text-white"
                  : "bg-transparent text-white/60 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              <Video size={14} />
              {sourceMode === "camera" ? "CAMERA ACTIVE" : "START LIVE FEED"}
            </button>
          </AccordionItem>

          <AccordionItem
            title="TEXT"
            id="text"
            openSection={openSection}
            setOpenSection={setOpenSection}
            sourceMode={sourceMode}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <input
                type="text"
                value={customText}
                onChange={(e) => {
                  setCustomText(e.target.value);
                  setSourceMode("text");
                }}
                onFocus={() => setSourceMode("text")}
                placeholder="TYPE YOUR TEXT..."
                className="w-full bg-transparent border-none border-b border-white/10 rounded-none px-4 py-[14px] text-white  text-[12px] tracking-[0.1em] outline-none transition-colors duration-200 font-normal focus:border-white/30 hover:border-white/20"
              />

              {/* Font Selection */}
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[
                  {
                    key: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    label: "MODERN",
                  },
                  { key: "'Playfair Display', serif", label: "SERIF" },
                  { key: "'JetBrains Mono', monospace", label: "MONO" },
                ].map((f) => {
                  const isActive = customFont === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => {
                        setCustomFont(f.key);
                        setSourceMode("text");
                      }}
                      className={`border rounded-sm py-2 px-1 text-[8px] tracking-[0.1em] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isActive
                          ? "bg-white/10 border-white/15 text-white font-semibold"
                          : "bg-white/5 border-white/5 text-white/50 font-normal hover:bg-white/10 hover:border-white/10 hover:text-white/70"
                      }`}
                      style={{ fontFamily: f.key }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              <p className="text-[9px] text-white/25 tracking-[0.1em] m-0 text-center">
                TEXT WILL RENDER WITH EFFECTS
              </p>
            </div>
          </AccordionItem>

          <AccordionItem
            title="ART STYLE"
            id="artStyle"
            openSection={openSection}
            setOpenSection={setOpenSection}
            sourceMode={sourceMode}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              {artStyles.map((s) => {
                const isActive = artStyle === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setArtStyle(s.key)}
                    className={`border-none rounded-none py-3 px-1 text-[9px] tracking-[0.1em] cursor-pointer transition-colors duration-200  ${
                      isActive
                        ? "bg-white/5 text-white font-semibold"
                        : "bg-transparent text-white/50 font-normal hover:bg-white/5"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </AccordionItem>

          <AccordionItem
            title="FX PRESETS"
            id="fxPresets"
            openSection={openSection}
            setOpenSection={setOpenSection}
            sourceMode={sourceMode}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              {fxPresets.map((s) => {
                const isActive = fxPreset === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setFxPreset(s.key)}
                    className={`border-none rounded-none py-3 px-1 text-[9px] tracking-[0.1em] cursor-pointer transition-colors duration-200  ${
                      isActive
                        ? "bg-white/5 text-white font-semibold"
                        : "bg-transparent text-white/50 font-normal hover:bg-white/5"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </AccordionItem>

          <AccordionItem
            title="PRO PRESETS"
            id="proPresets"
            openSection={openSection}
            setOpenSection={setOpenSection}
            sourceMode={sourceMode}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "8px",
              }}
            >
              {[
                {
                  label: "CINEMATIC RGB",
                  apply: () => {
                    setBackgroundColor("#050505");
                    setColorMode(true);
                    setBrightness(1.1);
                    setContrast(1.3);
                    setFxPreset("CRT monitor");
                    setBloomStrength(0.8);
                    setDithering(0.2);
                    setCharacterRamp(1.2);
                    setAsciiOpacity(0.95);
                    setAsciiDensity(1.1);
                  },
                },
                {
                  label: "MONOCHROME FINE",
                  apply: () => {
                    setBackgroundColor("#000000");
                    setColorMode(false);
                    setBrightness(1.0);
                    setContrast(1.5);
                    setFxPreset("none");
                    setBloomStrength(0.0);
                    setDithering(0.5);
                    setCharacterRamp(2.0);
                    setAsciiOpacity(1.0);
                    setAsciiDensity(2.0);
                  },
                },
                {
                  label: "LUCID DREAM",
                  apply: () => {
                    setBackgroundColor("#020005");
                    setColorMode(true);
                    setBrightness(1.3);
                    setContrast(1.4);
                    setFxPreset("none");
                    setBloomStrength(1.8);
                    setDithering(0.0);
                    setCharacterRamp(1.0);
                    setAsciiOpacity(1.0);
                    setAsciiDensity(1.0);
                  },
                },
                {
                  label: "RAW CONTRAST",
                  apply: () => {
                    setBackgroundColor("#000000");
                    setColorMode(false);
                    setBrightness(0.8);
                    setContrast(2.5);
                    setFxPreset("noise");
                    setBloomStrength(0.3);
                    setDithering(1.2);
                    setCharacterRamp(0.8);
                    setAsciiOpacity(1.0);
                    setAsciiDensity(1.3);
                  },
                },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={preset.apply}
                  style={{
                    background: "transparent",
                    border: "none",
                    borderRadius: "0px",
                    padding: "14px 12px",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "9px",
                    letterSpacing: "0.25em",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
                    fontWeight: 500,
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "#FFF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </AccordionItem>

          <AccordionItem
            title="CONTROLLER"
            id="controller"
            openSection={openSection}
            setOpenSection={setOpenSection}
            sourceMode={sourceMode}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                background: "transparent",
                padding: "16px 0",
                borderRadius: "0",
                border: "none",
              }}
            >
              <SliderControl
                label="RESOLUTION"
                value={resolution}
                min={1}
                max={100}
                step={1}
                onChange={setResolution}
              />

              {/* BG COLOR PRESETS */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.15em",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    BG COLOR
                  </span>
                </div>
                <div className="grid grid-cols-[repeat(7,1fr)] gap-[6px]">
                  {/* Custom Color Picker */}
                  <div className="relative w-full aspect-square">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-[2]"
                    />
                    <div
                      className="absolute inset-0 rounded-full border-2 border-white/10 flex items-center justify-center z-[1] pointer-events-none"
                      style={{
                        background:
                          "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                      }}
                    >
                      <div
                        className="w-[45%] h-[45%] rounded-full border border-white/40"
                        style={{ background: backgroundColor }}
                      />
                    </div>
                  </div>
                  {[
                    "#000000", // Black
                    "#120A05", // Deep Brown
                    "#0A1220", // Deep Navy
                    "#1A0D16", // Deep Plum
                    "#08140F", // Deep Forest
                    "#FFFFFF", // White
                  ].map((color) => {
                    const isActive = backgroundColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setBackgroundColor(color)}
                        className="aspect-square rounded-full flex items-center justify-center cursor-pointer transition-all duration-200"
                        style={{
                          background: color,
                          border: `2px solid ${isActive ? "#fff" : "rgba(255,255,255,0.1)"}`,
                          boxShadow: isActive ? `0 0 10px ${color}` : "none",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <SliderControl
                label="BRIGHTNESS"
                value={brightness}
                min={0}
                max={4}
                step={0.01}
                onChange={setBrightness}
              />
              <SliderControl
                label="CONTRAST"
                value={contrast}
                min={0}
                max={4}
                step={0.01}
                onChange={setContrast}
              />
              <SliderControl
                label="GLOW (BLOOM)"
                value={bloomStrength}
                min={0}
                max={3}
                step={0.01}
                onChange={setBloomStrength}
              />
              <SliderControl
                label="IMAGE VISIBILITY"
                value={imageVisibility}
                min={0}
                max={1}
                step={0.01}
                onChange={setImageVisibility}
              />
              <SliderControl
                label="ASCII OPACITY"
                value={asciiOpacity}
                min={0}
                max={1}
                step={0.01}
                onChange={setAsciiOpacity}
              />
              <SliderControl
                label="ASCII DENSITY"
                value={asciiDensity}
                min={0.1}
                max={2}
                step={0.01}
                onChange={setAsciiDensity}
              />
              <SliderControl
                label="CHAR RAMP"
                value={characterRamp}
                min={0.1}
                max={3}
                step={0.01}
                onChange={setCharacterRamp}
              />
              <SliderControl
                label="DITHERING"
                value={dithering}
                min={0}
                max={2}
                step={0.01}
                onChange={setDithering}
              />

              <div className="flex justify-between items-center mt-2 pt-[14px] border-t border-white/5">
                <span className="text-[9px] tracking-[0.1em] text-white/50 font-medium">
                  COLOR MODE
                </span>
                <button
                  onClick={() => setColorMode(!colorMode)}
                  className={`border-none rounded-none py-[6px] px-[14px] text-[8px] tracking-[0.1em] cursor-pointer  font-medium transition-colors duration-200 ${
                    colorMode
                      ? "bg-white/5 text-white"
                      : "bg-transparent text-white/50 hover:bg-white/5 hover:text-white/70"
                  }`}
                >
                  {colorMode ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          </AccordionItem>
        </div>

        {/* Bottom actions fixed at bottom of sidebar */}
        <div className="absolute bottom-0 left-0 right-0 h-[100px] px-10 flex flex-col justify-center bg-transparent backdrop-blur-[40px] z-50">
          <div className="flex gap-2 w-full relative top-[-6px]">
            {/* Primary CTA */}
            <button
              onClick={handleRandomize}
              className="flex-1 bg-white border-none rounded-none text-black text-[9px]  font-semibold tracking-[0.2em] uppercase h-[38px] cursor-pointer transition-all duration-200 hover:bg-[#E6E6E6] hover:scale-[0.98]"
            >
              RANDOM
            </button>
            {/* Secondary CTA */}
            <button
              onClick={handleExport}
              className={`flex-1 rounded-none text-[9px]  font-medium tracking-[0.2em] uppercase h-[38px] cursor-pointer transition-all duration-500 flex items-center justify-center gap-2 border ${
                isRecording
                  ? "bg-[#ff3232]/10 border-[#ff3232]/40 text-[#ffb3b3]"
                  : "bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:border-white/30 hover:text-white/90"
              }`}
            >
              {isRecording ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#ff4444] animate-pulse" />
                  STOP
                </>
              ) : (
                "EXPORT GIF"
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
          <div className="absolute bottom-4 left-0 right-0 text-center text-[8px] text-white/20 tracking-[0.1em] font-normal pointer-events-none">
            © SONDER {new Date().getFullYear()}
          </div>
        </div>
      </div>
      <TemplateModal />
    </>
  );
};

// ─── Shared UI parts ───

const SliderControl: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
}> = ({ label, value, min, max, step, onChange }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-[9px] tracking-[0.1em] text-white/45 uppercase font-medium">
        {label}
      </span>
      <span
        className="text-[9px] font-mono font-normal"
        style={{ color: ACCENT_70 }}
      >
        {Number.isInteger(step) ? value : value.toFixed(2)}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full cursor-pointer"
    />
  </div>
);

const AccordionItem = ({
  title,
  id,
  children,
  openSection,
  setOpenSection,
  sourceMode,
}: {
  title: string;
  id: string;
  children: React.ReactNode;
  openSection: string;
  setOpenSection: (id: string) => void;
  sourceMode: SourceMode;
}) => {
  const isOpen = openSection === id;

  // For scenes, templates, image we highlight title if it's the active sourceMode
  const isSourceActive =
    (id === "gallery" &&
      (sourceMode === "scenes" || sourceMode === "templates")) ||
    (id === "image" && (sourceMode === "image" || sourceMode === "video")) ||
    (id === "text" && sourceMode === "text") ||
    (id === "webcam" && sourceMode === "camera");

  return (
    <div className="border-b border-white/5 relative">
      {/* Active left accent bar */}
      {isSourceActive && (
        <div className="absolute -left-5 top-2 bottom-2 w-[1px] rounded-[1px] bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
      )}
      <button
        onClick={() => setOpenSection(isOpen ? "" : id)}
        className={`w-full flex justify-between items-center bg-transparent border-none py-[18px] text-[10px] tracking-[0.2em] font-medium cursor-pointer  transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] uppercase outline-none ${
          isOpen || isSourceActive
            ? "text-white/95"
            : "text-white/40 hover:text-white/70"
        }`}
      >
        <span>{title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`flex items-center ${isOpen ? "text-white/60" : "text-white/15"}`}
        >
          <ChevronDown size={14} />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
