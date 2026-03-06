import * as THREE from 'three';
import { AsciiShader } from './AsciiShader';
import { createAsciiTextureAtlas, createBrailleTextureAtlas } from './createAsciiTextureAtlas';

export class AsciiRenderer {
  private renderer: THREE.WebGLRenderer;
  private renderTarget: THREE.WebGLRenderTarget;
  private asciiPassScene: THREE.Scene;
  private asciiPassCamera: THREE.OrthographicCamera;
  private asciiMaterial: THREE.ShaderMaterial;
  private container: HTMLElement;

  // The actual 3D scene and camera to render
  public scene: THREE.Scene | null = null;
  public camera: THREE.PerspectiveCamera | null = null;

  // For image mode — a flat quad showing the uploaded texture
  private imageScene: THREE.Scene;
  private imageCamera: THREE.OrthographicCamera;
  private imageMesh: THREE.Mesh | null = null;
  private imageTexture: THREE.Texture | null = null;
  private useImageSource: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    // WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Render Target
    this.renderTarget = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });

    // ASCII post-processing pass
    this.asciiPassScene = new THREE.Scene();
    this.asciiPassCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Character atlas
    const charString = ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';
    const asciiTexture = createAsciiTextureAtlas(charString);
    const brailleTexture = createBrailleTextureAtlas();

    // Shader material
    this.asciiMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: this.renderTarget.texture },
        tAscii: { value: asciiTexture },
        tBraille: { value: brailleTexture },
        uResolution: { value: new THREE.Vector2(w, h) },
        uFontCount: { value: charString.length },
        uBrailleFontCount: { value: 257.0 }, // 256 braille + space
        uFontAspect: { value: 0.5 },
        uCharSize: { value: 16.0 },
        uBrightness: { value: 1.0 },
        uContrast: { value: 1.0 },
        uColorMode: { value: 1.0 },
        uStyleMode: { value: 0.0 },
        uNoise: { value: 0.0 },
        uDither: { value: 0.0 },
        uTime: { value: 0.0 },
        uBgColor: { value: [0, 0, 0] },
      },
      vertexShader: AsciiShader.vertexShader,
      fragmentShader: AsciiShader.fragmentShader,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.asciiMaterial);
    this.asciiPassScene.add(quad);

    // Image source scene (flat quad for uploaded images)
    this.imageScene = new THREE.Scene();
    this.imageScene.background = new THREE.Color(0x000000);
    this.imageCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Resize handler
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container);
    window.addEventListener('resize', this.onResize);
  }

  private resizeObserver: ResizeObserver;

  // Dynamically update shader uniforms
  public updateSettings(opts: {
    resolution: number;
    brightness: number;
    contrast: number;
    colorMode: boolean;
    artStyle: number;
    noise: number;
    dithering: number;
    bgColor: string;
  }) {
    // Map resolution % (1-100) to pixel size (inverted)
    // 100% resolution = 6px cell height (very tiny, dense text)
    // 1% resolution = 32px cell height (very large chunks)
    const t = 1.0 - (opts.resolution / 100.0);
    const mappedSize = 6.0 + t * 26.0;
    this.asciiMaterial.uniforms.uCharSize.value = mappedSize;
    this.asciiMaterial.uniforms.uBrightness.value = opts.brightness;
    this.asciiMaterial.uniforms.uContrast.value = opts.contrast;
    this.asciiMaterial.uniforms.uColorMode.value = opts.colorMode ? 1.0 : 0.0;
    this.asciiMaterial.uniforms.uStyleMode.value = opts.artStyle;
    this.asciiMaterial.uniforms.uNoise.value = opts.noise;
    this.asciiMaterial.uniforms.uDither.value = opts.dithering;
    
    // Parse hex without Three.js Color to prevent automatic sRGB->Linear conversions
    // which makes dark background colors appear pitch black.
    const hex = parseInt(opts.bgColor.replace(/^#/, ''), 16);
    this.asciiMaterial.uniforms.uBgColor.value = [
      ((hex >> 16) & 255) / 255,
      ((hex >> 8) & 255) / 255,
      (hex & 255) / 255
    ];
  }

  // Load an uploaded image as a texture
  public setImageSource(dataUrl: string | null) {
    if (!dataUrl) {
      this.useImageSource = false;
      if (this.imageMesh) {
        this.imageScene.remove(this.imageMesh);
        this.imageMesh.geometry.dispose();
        (this.imageMesh.material as THREE.Material).dispose();
        this.imageMesh = null;
      }
      if (this.imageTexture) {
        this.imageTexture.dispose();
        this.imageTexture = null;
      }
      return;
    }

    this.useImageSource = true;
    const loader = new THREE.TextureLoader();
    loader.load(dataUrl, (texture) => {
      if (this.imageTexture) this.imageTexture.dispose();
      this.imageTexture = texture;

      if (this.imageMesh) {
        this.imageScene.remove(this.imageMesh);
        this.imageMesh.geometry.dispose();
        (this.imageMesh.material as THREE.Material).dispose();
      }

      const vertexShader = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

      const fragmentShader = `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          
          // Subtle, slow liquid wave distortion
          float speed = uTime * 0.2;
          float waveX = sin(uv.y * 5.0 + speed) * 0.02;
          float waveY = cos(uv.x * 4.0 + speed * 0.8) * 0.02;
          
          uv.x += waveX;
          uv.y += waveY;

          vec4 color = texture2D(tDiffuse, uv);
          gl_FragColor = color;
        }
      `;

      const material = new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: { value: texture },
          uTime: { value: 0.0 }
        },
        vertexShader,
        fragmentShader
      });

      const geometry = new THREE.PlaneGeometry(2, 2);
      this.imageMesh = new THREE.Mesh(geometry, material);
      this.imageScene.add(this.imageMesh);
    });
  }

  private onResize = () => {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;

    if (this.camera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }

    this.renderer.setSize(w, h);
    this.renderTarget.setSize(w, h);
    this.asciiMaterial.uniforms.uResolution.value.set(w, h);
  };

  public setSceneAndCamera(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;
  }

  public render = (time: number = 0) => {
    this.asciiMaterial.uniforms.uTime.value = time;

    // 1. Render source to the off-screen render target
    this.renderer.setRenderTarget(this.renderTarget);

    if (this.useImageSource && this.imageMesh) {
      const mat = this.imageMesh.material as THREE.ShaderMaterial;
      if (mat.uniforms && mat.uniforms.uTime) {
        mat.uniforms.uTime.value = time;
      }
      this.renderer.render(this.imageScene, this.imageCamera);
    } else if (this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }

    // 2. Render full-screen ASCII post-process
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.asciiPassScene, this.asciiPassCamera);
  };

  public destroy() {
    window.removeEventListener('resize', this.onResize);
    this.resizeObserver.disconnect();
    this.renderer.dispose();
    this.renderTarget.dispose();
    this.asciiMaterial.dispose();
    if (this.imageTexture) this.imageTexture.dispose();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
