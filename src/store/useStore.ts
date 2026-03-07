import { create } from 'zustand';

export type ArtStyle = 'classic';
export type FXPreset = 'none' | 'noise' | 'field' | 'intervals' | 'beam sweep' | 'glitch' | 'CRT monitor' | 'matrix rain';
export type SourceMode = 'scenes' | 'templates' | 'image' | 'video' | 'text' | 'camera';
export type AspectRatio = 'ORIGINAL' | '16:9' | '4:3' | '1:1' | '3:4' | '9:16';

interface AppState {
  // Source toggle
  sourceMode: SourceMode;
  setSourceMode: (val: SourceMode) => void;

  // Art style
  artStyle: ArtStyle;
  setArtStyle: (val: ArtStyle) => void;

  // FX Preset
  fxPreset: FXPreset;
  setFxPreset: (val: FXPreset) => void;

  // Controller sliders
  brightness: number;
  setBrightness: (val: number) => void;
  contrast: number;
  setContrast: (val: number) => void;

  // Noise & dithering
  noise: number;
  setNoise: (val: number) => void;
  dithering: number;
  setDithering: (val: number) => void;

  // Color mode
  colorMode: boolean;
  setColorMode: (val: boolean) => void;

  // Active scene index (for procedural scenes)
  activeScene: number;
  setActiveScene: (val: number) => void;

  // Resolution (char size)
  resolution: number;
  setResolution: (val: number) => void;

  // Aspect Ratio
  aspectRatio: AspectRatio;
  setAspectRatio: (val: AspectRatio) => void;

  // Template selection
  activeTemplate: string | null;
  setActiveTemplate: (val: string | null) => void;

  // Uploaded image (data URL)
  uploadedImage: string | null;
  setUploadedImage: (val: string | null) => void;

  // Uploaded video (blob URL)
  uploadedVideo: string | null;
  setUploadedVideo: (val: string | null) => void;

  // Controls panel visibility
  controlsVisible: boolean;
  setControlsVisible: (val: boolean) => void;

  // Template Modal visibility
  isTemplateModalOpen: boolean;
  setIsTemplateModalOpen: (val: boolean) => void;

  // Custom text input
  customText: string;
  setCustomText: (val: string) => void;

  // Custom font selection
  customFont: string;
  setCustomFont: (val: string) => void;

  // Background color
  backgroundColor: string;
  setBackgroundColor: (val: string) => void;

  // Dual-Layer Settings
  asciiOpacity: number;
  setAsciiOpacity: (val: number) => void;
  asciiDensity: number;
  setAsciiDensity: (val: number) => void;
  imageVisibility: number;
  setImageVisibility: (val: number) => void;
  characterRamp: number;
  setCharacterRamp: (val: number) => void;

  // Post-processing
  bloomStrength: number;
  setBloomStrength: (val: number) => void;
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
  
  bloomStrength: 0.5, // Default glowing effect
  setBloomStrength: (val) => set({ bloomStrength: val }),
}));
