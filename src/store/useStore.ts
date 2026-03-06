import { create } from 'zustand';

export type ArtStyle = 'classic' | 'braille' | 'halftone' | 'dotcross' | 'line';
export type SourceMode = 'scenes' | 'templates' | 'image' | 'text';

interface AppState {
  // Source toggle
  sourceMode: SourceMode;
  setSourceMode: (val: SourceMode) => void;

  // Art style
  artStyle: ArtStyle;
  setArtStyle: (val: ArtStyle) => void;

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

  // Template selection
  activeTemplate: string | null;
  setActiveTemplate: (val: string | null) => void;

  // Uploaded image (data URL)
  uploadedImage: string | null;
  setUploadedImage: (val: string | null) => void;

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
}

export const useStore = create<AppState>((set) => ({
  sourceMode: 'scenes',
  setSourceMode: (val) => set({ sourceMode: val }),

  artStyle: 'classic',
  setArtStyle: (val) => set({ artStyle: val }),

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

  activeTemplate: null,
  setActiveTemplate: (val) => set({ activeTemplate: val }),

  uploadedImage: null,
  setUploadedImage: (val) => set({ uploadedImage: val }),

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
}));
