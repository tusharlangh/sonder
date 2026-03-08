'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { AsciiRenderer } from '../graphics/AsciiRenderer';
import { SceneManager } from '../graphics/SceneManager';
import { useStore } from '../store/useStore';

export const CanvasView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<AsciiRenderer | null>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const uploadedVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const cameraVideo = document.createElement('video');
    cameraVideo.autoplay = true;
    cameraVideo.playsInline = true;
    cameraVideo.muted = true;
    videoRef.current = cameraVideo;

    const fileVideo = document.createElement('video');
    fileVideo.autoplay = true;
    fileVideo.loop = true;
    fileVideo.playsInline = true;
    fileVideo.muted = true;
    uploadedVideoRef.current = fileVideo;

    return () => {
      cameraVideo.srcObject = null;
      fileVideo.src = '';
    };
  }, []);

  const {
    resolution,
    brightness,
    contrast,
    colorMode,
    fxPreset,
    dithering,
    artStyle,
    activeScene,
    activeTemplate,
    sourceMode,
    uploadedImage,
    uploadedVideo,
    customText,
    customFont,
    backgroundColor,
    asciiOpacity,
    asciiDensity,
    imageVisibility,
    characterRamp,
    bloomStrength,
    aspectRatio,
    customCharacterSet,
    fontScale,
    bgDither,
    inverseDither,
    vignette,
  } = useStore();

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {

    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getContainerStyle = (): React.CSSProperties => {
    if (aspectRatio === 'ORIGINAL' || windowSize.width === 0) {
      return {
        position: 'relative' as const,
        width: '100%',
        height: '100%',
        background: '#000',
        zIndex: 0,
        animation: 'hardwareWake 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
      };
    }

    const paddingX = 48;
    const sidebarWidth = 420;
    const availW = (windowSize.width - sidebarWidth) - paddingX;
    const paddingY = 120;
    const availH = windowSize.height - paddingY;

    const [wRatio, hRatio] = aspectRatio.split(':').map(Number);
    const targetRatio = wRatio / hRatio;

    let finalW = availW;
    let finalH = finalW / targetRatio;

    if (finalH > availH) {
      finalH = availH;
      finalW = finalH * targetRatio;
    }

    return {
      position: 'relative' as const,
      width: `${Math.floor(finalW)}px`,
      height: `${Math.floor(finalH)}px`,
      background: '#000',
      zIndex: 0,
      animation: 'hardwareWake 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
    };
  };

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

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.updateSettings({
        resolution,
        brightness,
        contrast,
        colorMode,
        fxPreset,
        dithering,
        artStyle,
        bgColor: backgroundColor,
        asciiOpacity,
        asciiDensity,
        imageVisibility,
        characterRamp,
        bloomStrength,
        customCharacterSet,
        fontScale,
        bgDither,
        inverseDither,
        vignette,
      });
    }
  }, [resolution, brightness, contrast, colorMode, fxPreset, dithering, artStyle, backgroundColor, asciiOpacity, asciiDensity, imageVisibility, characterRamp, bloomStrength, customCharacterSet, fontScale, bgDither, inverseDither, vignette]);

  useEffect(() => {
    if (rendererRef.current) {

      const timer = setTimeout(() => {
        if (containerRef.current) {
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;
          rendererRef.current?.onResize();
          sceneManagerRef.current?.resize(w, h);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [aspectRatio, windowSize]);

  useEffect(() => {
    if (sceneManagerRef.current && sourceMode === 'scenes') {
      sceneManagerRef.current.setScene(activeScene);
    }
  }, [activeScene, sourceMode]);

  useEffect(() => {
    if (sceneManagerRef.current) {
      if (sourceMode === 'templates' && activeTemplate) {
        sceneManagerRef.current.setTemplate(activeTemplate);
      } else if (sourceMode !== 'templates') {
        sceneManagerRef.current.setTemplate(null);
      }
    }
  }, [activeTemplate, sourceMode]);

  useEffect(() => {
    if (rendererRef.current) {
      if (sourceMode === 'image' && uploadedImage) {
        rendererRef.current.setImageSource(uploadedImage);
      } else if (sourceMode === 'text' || sourceMode === 'camera' || sourceMode === 'video') {

      } else {
        rendererRef.current.setImageSource(null);
      }
    }
  }, [uploadedImage, sourceMode]);

  useEffect(() => {
    if (!rendererRef.current) return;
    const fileVideo = uploadedVideoRef.current;
    if (!fileVideo) return;

    if (sourceMode === 'video' && uploadedVideo) {
      fileVideo.src = uploadedVideo;
      fileVideo.play().catch(console.error);
      rendererRef.current.setVideoSource(fileVideo, false);
    } else if (sourceMode === 'video' && !uploadedVideo) {
      rendererRef.current.setVideoSource(null, false);
    } else {
      fileVideo.pause();
    }
  }, [uploadedVideo, sourceMode]);

  useEffect(() => {
    if (!rendererRef.current) return;
    const video = videoRef.current;
    if (!video) return;

    if (sourceMode === 'camera') {
      navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
          rendererRef.current?.setVideoSource(video, true);
        })
        .catch((err) => {
          console.error('Error accessing webcam:', err);
        });
    } else {
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      }
    }
  }, [sourceMode]);

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

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let fontSize = 200;

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
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: aspectRatio !== 'ORIGINAL' ? '24px 24px 80px 24px' : '0' }}>
      <div
        ref={containerRef}
        style={getContainerStyle()}
      >
        <style>{`
        @keyframes hardwareWake {
          0% { opacity: 0; filter: blur(20px); }
          100% { opacity: 1; filter: blur(0px); }
        }
      `}</style>
      </div>
    </div>
  );
};