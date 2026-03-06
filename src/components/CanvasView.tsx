'use client';

import React, { useEffect, useRef, useCallback } from 'react';
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
        fxPreset,
        dithering,
        bgColor: backgroundColor,
        asciiOpacity,
        asciiDensity,
        imageVisibility,
        characterRamp,
        bloomStrength,
      });
    }
  }, [resolution, brightness, contrast, colorMode, fxPreset, dithering, backgroundColor, asciiOpacity, asciiDensity, imageVisibility, characterRamp, bloomStrength]);

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
      } else if (sourceMode === 'text' || sourceMode === 'camera' || sourceMode === 'video') {
        // Handled by their respective hooks
      } else {
        rendererRef.current.setImageSource(null);
      }
    }
  }, [uploadedImage, sourceMode]);

  // Uploaded Video source
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

  // Camera source
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
