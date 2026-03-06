'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { AsciiRenderer } from '../graphics/AsciiRenderer';
import { SceneManager } from '../graphics/SceneManager';
import { useStore } from '../store/useStore';

const ART_STYLE_MAP: Record<string, number> = {
  classic: 0,
  braille: 1,
  halftone: 2,
  dotcross: 3,
  line: 4,
};

export const CanvasView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<AsciiRenderer | null>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  const {
    resolution,
    brightness,
    contrast,
    colorMode,
    artStyle,
    noise,
    dithering,
    activeScene,
    activeTemplate,
    sourceMode,
    uploadedImage,
    customText,
    customFont,
    backgroundColor,
  } = useStore();

  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new AsciiRenderer(containerRef.current);
    const sceneManager = new SceneManager();

    renderer.setSceneAndCamera(sceneManager.scene, sceneManager.camera);

    rendererRef.current = renderer;
    sceneManagerRef.current = sceneManager;

    let animationId: number;
    const animate = (time: number) => {
      animationId = requestAnimationFrame(animate);
      const seconds = time * 0.001;
      sceneManager.update(seconds);
      renderer.render(seconds);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      renderer.destroy();
    };
  }, []);

  // Update renderer settings
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.updateSettings({
        resolution,
        brightness,
        contrast,
        colorMode,
        artStyle: ART_STYLE_MAP[artStyle] ?? 0,
        noise,
        dithering,
        bgColor: backgroundColor,
      });
    }
  }, [resolution, brightness, contrast, colorMode, artStyle, noise, dithering, backgroundColor]);

  // Update active scene
  useEffect(() => {
    if (sceneManagerRef.current && sourceMode === 'scenes') {
      sceneManagerRef.current.setScene(activeScene);
    }
  }, [activeScene, sourceMode]);

  // Update template
  useEffect(() => {
    if (sceneManagerRef.current) {
      if (sourceMode === 'templates' && activeTemplate) {
        sceneManagerRef.current.setTemplate(activeTemplate);
      } else if (sourceMode !== 'templates') {
        sceneManagerRef.current.setTemplate(null);
      }
    }
  }, [activeTemplate, sourceMode]);

  // Image source
  useEffect(() => {
    if (rendererRef.current) {
      if (sourceMode === 'image' && uploadedImage) {
        rendererRef.current.setImageSource(uploadedImage);
      } else if (sourceMode === 'text') {
        // Don't clear here — text effect handles its own rendering
      } else {
        rendererRef.current.setImageSource(null);
      }
    }
  }, [uploadedImage, sourceMode]);

  // Text source — render text to an offscreen canvas and feed as image
  useEffect(() => {
    if (!rendererRef.current) return;
    if (sourceMode !== 'text') return;

    const text = customText || 'SONDER';
    const canvasWidth = window.innerWidth * 2;
    const canvasHeight = window.innerHeight * 2;

    const offscreen = document.createElement('canvas');
    offscreen.width = canvasWidth;
    offscreen.height = canvasHeight;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    // Black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // White bold text, auto-sized to fill canvas
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Auto-size font to fit canvas width with padding
    let fontSize = 200;
    // We add a fallback to sans-serif just in case the font isn't loaded yet
    const fontStr = (size: number) => `800 ${size}px ${customFont || "'Manrope', 'Arial Black', sans-serif"}`;
    
    ctx.font = fontStr(fontSize);
    const textWidth = ctx.measureText(text).width;
    const maxWidth = canvasWidth * 0.85;
    if (textWidth > maxWidth) {
      fontSize = Math.floor(fontSize * (maxWidth / textWidth));
    }
    ctx.font = fontStr(fontSize);

    ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);

    const dataUrl = offscreen.toDataURL('image/png');
    rendererRef.current.setImageSource(dataUrl);
  }, [customText, customFont, sourceMode]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: '#000',
        zIndex: 0,
      }}
    />
  );
};
