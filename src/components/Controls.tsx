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
import { Logo } from "./Logo";

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
    bottomBarVisible,
    setBottomBarVisible,
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
    customCharacterSet,
    setCustomCharacterSet,
    fontScale,
    setFontScale,
    bgDither,
    setBgDither,
    inverseDither,
    setInverseDither,
    vignette,
    setVignette,
    exportFormat,
    setExportFormat,
    exportQuality,
    setExportQuality,
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
    { key: "braille", label: "BRAILLE" },
    { key: "halftone", label: "HALFTONE" },
    { key: "dot", label: "DOT" },
    { key: "cross", label: "CROSS" },
    { key: "line", label: "LINE" },
    { key: "particles", label: "PARTICLES" },
    { key: "terminal", label: "TERMINAL" },
    { key: "retro", label: "RETRO" },
    { key: "claude", label: "CLAUDE" },
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

    if (exportFormat === 'webgl') {
        const { generateWebGLCodeExport } = await import("../graphics/WebGLCodeGenerator");
        const codeString = generateWebGLCodeExport();
        const blob = new Blob([codeString], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `sonder-webgl-${Date.now()}.html`;
        link.click();
        URL.revokeObjectURL(url);
        return;
    }

    if (exportFormat === 'png') {

        const originalWidth = canvas.width;
        const originalHeight = canvas.height;
        const originalStyleWidth = canvas.style.width;
        const originalStyleHeight = canvas.style.height;

        const qt = exportQuality;
        canvas.width = originalWidth * qt;
        canvas.height = originalHeight * qt;

        await new Promise(resolve => setTimeout(resolve, 100));

        const dataUrl = canvas.toDataURL("image/png", 1.0);
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `sonder-capture-${Date.now()}.png`;
        link.click();

        canvas.width = originalWidth;
        canvas.height = originalHeight;
        canvas.style.width = originalStyleWidth;
        canvas.style.height = originalStyleHeight;
        return;
    }

    if (isRecording) {

      if (recorderRef.current) {
        if (exportFormat === 'mp4') {

            (recorderRef.current as MediaRecorder).stop();
        } else {

             (recorderRef.current as any).stopRecording(() => {
                const blob = (recorderRef.current as any).getBlob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `sonder-animation-${Date.now()}.gif`;
                link.click();
                (recorderRef.current as any).destroy();
                recorderRef.current = null;
            });
        }
      }
      setIsRecording(false);
    } else {

      const stream = canvas.captureStream(30);

      if (exportFormat === 'mp4') {

          const mimeType = MediaRecorder.isTypeSupported('video/mp4')
            ? 'video/mp4'
            : 'video/webm; codecs=vp9';

          const mediaRecorder = new MediaRecorder(stream, {
              mimeType: mimeType,
              videoBitsPerSecond: 8000000 * exportQuality,
          });

          const chunks: Blob[] = [];
          mediaRecorder.ondataavailable = (e) => {
              if (e.data.size > 0) chunks.push(e.data);
          };
          mediaRecorder.onstop = () => {
              const blob = new Blob(chunks, { type: mimeType });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
              link.download = `sonder-video-${Date.now()}.${ext}`;
              link.click();
              URL.revokeObjectURL(url);
              recorderRef.current = null;
          };

          mediaRecorder.start();
          recorderRef.current = mediaRecorder as any;
          setIsRecording(true);
      } else {

          const { default: RecordRTC } = await import("recordrtc");
          recorderRef.current = new RecordRTC(stream, {
            type: "gif",
            frameRate: 30,
            canvas: {
              width: (canvas.width / 2) * exportQuality,
              height: (canvas.height / 2) * exportQuality,
            },
          });
          (recorderRef.current as any).startRecording();
          setIsRecording(true);
      }
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

      <div className="w-full h-full flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto pt-10 px-10 pb-[120px] flex flex-col">
          <div className="flex flex-col gap-[6px] mb-8">
            <div className="flex items-center gap-[14px]">
              <div className="w-[26px] h-7 text-white">
                <Logo />
              </div>
              <h1
                className="text-[36px] leading-tight tracking-[0.1em] text-white font-bold m-0"
                style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
              >
                SONDER
              </h1>
            </div>
            <p className="text-[13px] text-white/50 m-0 font-medium tracking-wide">
              Visual Essence Generator
            </p>
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
              className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/5 rounded-xl p-3 text-white/80 cursor-pointer transition-all duration-300 ease-out text-[13px] font-medium hover:bg-white/10 hover:text-white shadow-sm"
            >
              <Grid size={16} />
              Browse Gallery
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
              className="h-[140px] border border-white/10 rounded-xl flex flex-col items-center justify-center bg-white/[0.02] cursor-pointer transition-all duration-300 p-4 hover:bg-white/5 hover:border-white/20"
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
                  <p className="text-[11px] text-white/50 m-0 mt-2 font-medium">
                    Click to replace
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[13px] text-white/80 m-0 mb-1 font-semibold">
                    Drop Media
                  </p>
                  <p className="text-[11px] text-white/40 m-0">
                    Image or Video
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
              className={`w-full flex items-center justify-center gap-2 border rounded-xl p-3 cursor-pointer transition-all duration-300 ease-out text-[13px] font-medium ${
                sourceMode === "camera"
                  ? "bg-white text-black border-white shadow-md"
                  : "bg-white/5 border-white/5 text-white/80 hover:bg-white/10 hover:text-white shadow-sm"
              }`}
            >
              <Video size={16} />
              {sourceMode === "camera" ? "Camera Active" : "Start Live Feed"}
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
                placeholder="Type your text..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-[13px] outline-none transition-all duration-300 font-medium focus:border-white/30 focus:bg-white/10 hover:border-white/20"
              />

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
                      className={`border rounded-lg py-2 px-1 text-[11px] cursor-pointer transition-all duration-300 ease-out ${
                        isActive
                          ? "bg-white/10 border-white/20 text-white font-semibold shadow-sm"
                          : "bg-white/5 border-white/5 text-white/60 font-medium hover:bg-white/10 hover:border-white/10 hover:text-white"
                      }`}
                      style={{ fontFamily: f.key }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-white/40 m-0 mt-1 text-center font-medium">
                Text renders with effects applied
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
                    className={`border rounded-lg py-2.5 px-2 text-[12px] cursor-pointer transition-all duration-300 ease-out ${
                      isActive
                        ? "bg-white/10 border-white/20 text-white font-semibold shadow-sm"
                        : "bg-white/5 border-white/5 text-white/60 font-medium hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[12px] font-semibold text-white/60 uppercase tracking-wider">
                  Custom Character Set
                </span>
              </div>
              <input
                type="text"
                value={customCharacterSet}
                onChange={(e) => setCustomCharacterSet(e.target.value)}
                placeholder="e.g. 01 or /\\"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-[12px] outline-none transition-all duration-300 font-mono focus:border-white/30 hover:border-white/20 mb-1"
              />
              <p className="text-[10px] text-white/40 m-0 leading-tight">
                Characters ordered from dark to light. Clear or leave as default for classic gradient.
              </p>
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
                    className={`border rounded-lg py-2.5 px-2 text-[12px] cursor-pointer transition-all duration-300 ease-out ${
                      isActive
                        ? "bg-white/10 border-white/20 text-white font-semibold shadow-sm"
                        : "bg-white/5 border-white/5 text-white/60 font-medium hover:bg-white/10 hover:text-white"
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
                  className="bg-white/5 border border-white/5 rounded-xl p-3 text-white/70 text-[12px] font-medium cursor-pointer transition-all duration-300 ease-out hover:bg-white/10 hover:text-white shadow-sm"
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
              <SliderControl
                label="FONT SCALE"
                value={fontScale}
                min={0.1}
                max={3.0}
                step={0.01}
                onChange={setFontScale}
              />

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span className="text-[12px] font-semibold text-white/60 uppercase tracking-wider">
                    Background Color
                  </span>
                </div>
                <div className="grid grid-cols-[repeat(7,1fr)] gap-[6px]">
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
                    "#000000",
                    "#120A05",
                    "#0A1220",
                    "#1A0D16",
                    "#08140F",
                    "#FFFFFF",
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
              <SliderControl
                label="VIGNETTE"
                value={vignette}
                min={0}
                max={1}
                step={0.01}
                onChange={setVignette}
              />

              <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-medium text-white/70">
                    Background Dither
                  </span>
                  <button
                    onClick={() => setBgDither(!bgDither)}
                    className={`border rounded-lg py-1 px-3 text-[11px] font-medium transition-all duration-300 ease-out cursor-pointer ${
                      bgDither
                        ? "bg-white text-black border-white shadow-sm"
                        : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {bgDither ? "On" : "Off"}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-medium text-white/70">
                    Inverse Dither
                  </span>
                  <button
                    onClick={() => setInverseDither(!inverseDither)}
                    className={`border rounded-lg py-1 px-3 text-[11px] font-medium transition-all duration-300 ease-out cursor-pointer ${
                      inverseDither
                        ? "bg-white text-black border-white shadow-sm"
                        : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {inverseDither ? "On" : "Off"}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mt-2 pt-4 border-t border-white/10">
                <span className="text-[12px] font-medium text-white/70">
                  Color Mode
                </span>
                <button
                  onClick={() => setColorMode(!colorMode)}
                  className={`border rounded-lg py-1.5 px-4 text-[12px] font-medium transition-all duration-300 ease-out cursor-pointer ${
                    colorMode
                      ? "bg-white text-black border-white shadow-sm"
                      : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {colorMode ? "On" : "Off"}
                </button>
              </div>

              <div className="flex justify-between items-center mt-2 pt-4 border-t border-white/10">
                <span className="text-[12px] font-medium text-white/70">
                  Bottom Bar
                </span>
                <button
                  onClick={() => setBottomBarVisible(!bottomBarVisible)}
                  className={`border rounded-lg py-1.5 px-4 text-[12px] font-medium transition-all duration-300 ease-out cursor-pointer ${
                    bottomBarVisible
                      ? "bg-white text-black border-white shadow-sm"
                      : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {bottomBarVisible ? "Visible" : "Hidden"}
                </button>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem
            title="EXPORT SETTINGS"
            id="export"
            openSection={openSection}
            setOpenSection={setOpenSection}
            sourceMode={sourceMode}
          >
            <div className="flex flex-col gap-5">
              <div>
                <span className="text-[12px] font-semibold text-white/60 uppercase tracking-wider block mb-3">
                  Format
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "png", label: "Image (PNG)" },
                    { key: "mp4", label: "Video (MP4)" },
                    { key: "gif", label: "Animation (GIF)" },
                    { key: "webgl", label: "WebGL Code" },
                  ].map((fmt) => (
                    <button
                      key={fmt.key}
                      onClick={() => setExportFormat(fmt.key as any)}
                      className={`border rounded-lg py-2.5 px-2 text-[12px] cursor-pointer transition-all duration-300 ease-out ${
                        exportFormat === fmt.key
                          ? "bg-white/10 border-white/20 text-white font-semibold shadow-sm"
                          : "bg-white/5 border-white/5 text-white/60 font-medium hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[12px] font-semibold text-white/60 uppercase tracking-wider block mb-3">
                  Quality
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 1.0, label: "Standard (1x)" },
                    { value: 2.0, label: "High (2x)" },
                    { value: 4.0, label: "Ultra (4x)" },
                  ].map((q) => (
                    <button
                      key={q.value}
                      onClick={() => setExportQuality(q.value)}
                      className={`border rounded-lg py-2 px-1 text-[11px] cursor-pointer transition-all duration-300 ease-out text-center ${
                        exportQuality === q.value
                          ? "bg-white/10 border-white/20 text-white font-semibold shadow-sm"
                          : "bg-white/5 border-white/5 text-white/60 font-medium hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-white/40 m-0 leading-tight">
                High/Ultra quality temporarily scales the renderer during PNG captures and increases bitrates for videos. Video recording and GIF creation may perform poorly on 4x.
              </p>
            </div>
          </AccordionItem>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[100px] px-8 flex flex-col justify-center bg-black/40 backdrop-blur-2xl border-t border-white/5 z-50">
          <div className="flex gap-3 w-full">
            <button
              onClick={handleRandomize}
              className="flex-1 bg-white/10 border border-white/10 rounded-xl text-white text-[13px] font-medium h-[44px] cursor-pointer transition-all duration-300 hover:bg-white/15 active:scale-[0.98] shadow-sm"
            >
              Randomize
            </button>
            <button
              onClick={handleExport}
              className={`flex-1 rounded-xl text-[13px] font-medium h-[44px] cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
                isRecording || exportFormat === 'png' || exportFormat === 'webgl'
                  ? exportFormat === 'png' || exportFormat === 'webgl'
                    ? "bg-white text-black border border-white hover:bg-gray-200"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-white text-black border border-white hover:bg-gray-100 active:scale-[0.98]"
              }`}
            >
              {isRecording ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
                  Stop Recording
                </>
              ) : exportFormat === "png" ? (
                "Save Image"
              ) : exportFormat === "webgl" ? (
                 "Download Code"
              ) : (
                `Record ${exportFormat.toUpperCase()}`
              )}
            </button>
          </div>
          <div className="absolute bottom-2 left-0 right-0 text-center text-[8px] text-white/20 tracking-[0.1em] font-normal pointer-events-none">
            © SONDER {new Date().getFullYear()}
          </div>
        </div>
      </div>
      <TemplateModal />
    </>
  );
};

const SliderControl: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
}> = ({ label, value, min, max, step, onChange }) => (
  <div>
    <div className="flex justify-between items-center mb-3">
      <span className="text-[12px] text-white/70 font-medium">{label}</span>
      <span className="text-[12px] font-medium" style={{ color: ACCENT_70 }}>
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

  const isSourceActive =
    (id === "gallery" &&
      (sourceMode === "scenes" || sourceMode === "templates")) ||
    (id === "image" && (sourceMode === "image" || sourceMode === "video")) ||
    (id === "text" && sourceMode === "text") ||
    (id === "webcam" && sourceMode === "camera");

  return (
    <div className="border-b border-white/5 relative">
      {isSourceActive && (
        <div className="absolute -left-5 top-2 bottom-2 w-[1px] rounded-[1px] bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
      )}
      <button
        onClick={() => setOpenSection(isOpen ? "" : id)}
        className={`w-full flex justify-between items-center bg-transparent border-none py-[20px] text-[14px] font-semibold cursor-pointer transition-colors duration-300 ease-out outline-none ${
          isOpen || isSourceActive
            ? "text-white"
            : "text-white/60 hover:text-white/80"
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