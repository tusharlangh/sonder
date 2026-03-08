import { create } from 'zustand';

export type ArtStyle = 'classic' | 'braille' | 'halftone' | 'dot' | 'cross' | 'line' | 'particles' | 'terminal' | 'retro' | 'claude';
export type FXPreset = 'none' | 'noise' | 'field' | 'intervals' | 'beam sweep' | 'glitch' | 'CRT monitor' | 'matrix rain';
export type SourceMode = 'scenes' | 'templates' | 'image' | 'video' | 'text' | 'camera';
export type AspectRatio = 'ORIGINAL' | '16:9' | '4:3' | '1:1' | '3:4' | '9:16';

interface AppState {

  sourceMode: SourceMode;
  setSourceMode: (val: SourceMode) => void;

  artStyle: ArtStyle;
  setArtStyle: (val: ArtStyle) => void;

  fxPreset: FXPreset;
  setFxPreset: (val: FXPreset) => void;

  brightness: number;
  setBrightness: (val: number) => void;
  contrast: number;
  setContrast: (val: number) => void;

  noise: number;
  setNoise: (val: number) => void;
  dithering: number;
  setDithering: (val: number) => void;

  colorMode: boolean;
  setColorMode: (val: boolean) => void;

  activeScene: number;
  setActiveScene: (val: number) => void;

  resolution: number;
  setResolution: (val: number) => void;

  aspectRatio: AspectRatio;
  setAspectRatio: (val: AspectRatio) => void;

  activeTemplate: string | null;
  setActiveTemplate: (val: string | null) => void;

  uploadedImage: string | null;
  setUploadedImage: (val: string | null) => void;

  uploadedVideo: string | null;
  setUploadedVideo: (val: string | null) => void;

  controlsVisible: boolean;
  setControlsVisible: (val: boolean) => void;

  bottomBarVisible: boolean;
  setBottomBarVisible: (val: boolean) => void;

  isTemplateModalOpen: boolean;
  setIsTemplateModalOpen: (val: boolean) => void;

  customText: string;
  setCustomText: (val: string) => void;

  customFont: string;
  setCustomFont: (val: string) => void;

  backgroundColor: string;
  setBackgroundColor: (val: string) => void;

  asciiOpacity: number;
  setAsciiOpacity: (val: number) => void;
  asciiDensity: number;
  setAsciiDensity: (val: number) => void;
  imageVisibility: number;
  setImageVisibility: (val: number) => void;
  characterRamp: number;
  setCharacterRamp: (val: number) => void;

  bloomStrength: number;
  setBloomStrength: (val: number) => void;

  customCharacterSet: string;
  setCustomCharacterSet: (val: string) => void;
  fontScale: number;
  setFontScale: (val: number) => void;
  bgDither: boolean;
  setBgDither: (val: boolean) => void;
  inverseDither: boolean;
  setInverseDither: (val: boolean) => void;
  vignette: number;
  setVignette: (val: number) => void;

  exportFormat: 'gif' | 'mp4' | 'png' | 'webgl';
  setExportFormat: (val: 'gif' | 'mp4' | 'png' | 'webgl') => void;
  exportQuality: number;
  setExportQuality: (val: number) => void;
}

export const useStore = create<AppState>((set) => ({
  sourceMode: 'scenes',
  setSourceMode: (val) => set({ sourceMode: val }),

  artStyle: 'classic',
  setArtStyle: (val) => set({ artStyle: val }),

  fxPreset: 'none',
  setFxPreset: (val) => set({ fxPreset: val }),

  brightness: 1.2,
  setBrightness: (val) => set({ brightness: val }),
  contrast: 1.5,
  setContrast: (val) => set({ contrast: val }),

  noise: 0.0,
  setNoise: (val) => set({ noise: val }),
  dithering: 0.0,
  setDithering: (val) => set({ dithering: val }),

  colorMode: true,
  setColorMode: (val) => set({ colorMode: val }),
  activeScene: 0,
  setActiveScene: (val) => set({ activeScene: val }),
  resolution: 50,
  setResolution: (val) => set({ resolution: val }),

  aspectRatio: 'ORIGINAL',
  setAspectRatio: (val) => set({ aspectRatio: val }),

  activeTemplate: null,
  setActiveTemplate: (val) => set({ activeTemplate: val }),

  uploadedImage: null,
  setUploadedImage: (val) => set({ uploadedImage: val }),

  uploadedVideo: null,
  setUploadedVideo: (val) => set({ uploadedVideo: val }),

  controlsVisible: true,
  setControlsVisible: (val) => set({ controlsVisible: val }),

  bottomBarVisible: true,
  setBottomBarVisible: (val) => set({ bottomBarVisible: val }),

  isTemplateModalOpen: false,
  setIsTemplateModalOpen: (val) => set({ isTemplateModalOpen: val }),

  customText: 'SONDER',
  setCustomText: (val) => set({ customText: val }),

  customFont: 'Manrope',
  setCustomFont: (val) => set({ customFont: val }),

  backgroundColor: '#000000',
  setBackgroundColor: (val) => set({ backgroundColor: val }),

  asciiOpacity: 0.8,
  setAsciiOpacity: (val) => set({ asciiOpacity: val }),
  asciiDensity: 1.0,
  setAsciiDensity: (val) => set({ asciiDensity: val }),
  imageVisibility: 0.5,
  setImageVisibility: (val) => set({ imageVisibility: val }),
  characterRamp: 1.0,
  setCharacterRamp: (val) => set({ characterRamp: val }),

  bloomStrength: 0.5,
  setBloomStrength: (val) => set({ bloomStrength: val }),

  customCharacterSet: "@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
  setCustomCharacterSet: (val) => set({ customCharacterSet: val }),
  fontScale: 1.0,
  setFontScale: (val) => set({ fontScale: val }),
  bgDither: false,
  setBgDither: (val) => set({ bgDither: val }),
  inverseDither: false,
  setInverseDither: (val) => set({ inverseDither: val }),
  vignette: 0.0,
  setVignette: (val) => set({ vignette: val }),

  exportFormat: 'gif',
  setExportFormat: (val) => set({ exportFormat: val }),
  exportQuality: 1.0,
  setExportQuality: (val) => set({ exportQuality: val }),
}));