import * as THREE from "three";
import { AsciiShader } from "./AsciiShader";
import {
  create2DAsciiTextureAtlas,
  createMatrixTextureAtlas,
  createBrailleTextureAtlas,
  createTerminalTextureAtlas,
  createRetroTextureAtlas,
  createClaudeTextureAtlas,
} from "./GlyphAtlas";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

export class AsciiRenderer {
  private renderer: THREE.WebGLRenderer;
  private renderTarget: THREE.WebGLRenderTarget;
  private asciiPassScene: THREE.Scene;
  private asciiPassCamera: THREE.OrthographicCamera;
  private asciiMaterial: THREE.ShaderMaterial;
  private container: HTMLElement;

  public scene: THREE.Scene | null = null;
  public camera: THREE.PerspectiveCamera | null = null;

  private imageScene: THREE.Scene;
  private imageCamera: THREE.OrthographicCamera;
  private imageMesh: THREE.Mesh | null = null;
  private imageTexture: THREE.Texture | null = null;
  private useImageSource: boolean = false;

  private currentCharacterSet: string = "@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";

  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;

  private resizeObserver: ResizeObserver;

  constructor(container: HTMLElement) {
    this.container = container;

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.renderTarget = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });

    this.asciiPassScene = new THREE.Scene();
    this.asciiPassCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const charString = this.currentCharacterSet;
    const asciiData = create2DAsciiTextureAtlas(charString);
    const matrixData = createMatrixTextureAtlas();
    const brailleData = createBrailleTextureAtlas();
    const terminalData = createTerminalTextureAtlas();
    const retroData = createRetroTextureAtlas();
    const claudeData = createClaudeTextureAtlas();

    this.asciiMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: this.renderTarget.texture },
        tAscii: { value: asciiData.texture },
        tMatrix: { value: matrixData.texture },
        tBraille: { value: brailleData.texture },
        tTerminal: { value: terminalData.texture },
        tRetro: { value: retroData.texture },
        tClaude: { value: claudeData.texture },

        uAsciiData: {
          value: new THREE.Vector3(
            asciiData.cols,
            asciiData.rows,
            asciiData.totalChars,
          ),
        },
        uMatrixData: {
          value: new THREE.Vector3(
            matrixData.cols,
            matrixData.rows,
            matrixData.totalChars,
          ),
        },
        uBrailleData: { value: new THREE.Vector3(brailleData.cols, brailleData.rows, brailleData.totalChars) },
        uTerminalData: { value: new THREE.Vector3(terminalData.cols, terminalData.rows, terminalData.totalChars) },
        uRetroData: { value: new THREE.Vector3(retroData.cols, retroData.rows, retroData.totalChars) },
        uClaudeData: { value: new THREE.Vector3(claudeData.cols, claudeData.rows, claudeData.totalChars) },

        uResolution: { value: new THREE.Vector2(w, h) },
        uCharSize: { value: 16.0 },
        uFontScale: { value: 1.0 },
        uBrightness: { value: 1.0 },
        uContrast: { value: 1.0 },
        uColorMode: { value: 1.0 },
        uFxMode: { value: 0.0 },
        uDither: { value: 0.0 },
        uBgDither: { value: 0.0 },
        uInverseDither: { value: 0.0 },
        uVignette: { value: 0.0 },
        uArtStyle: { value: 0.0 },
        uTime: { value: 0.0 },
        uBgColor: { value: [0, 0, 0] },

        uAsciiOpacity: { value: 0.8 },
        uAsciiDensity: { value: 1.0 },
        uImageVisibility: { value: 0.5 },
        uCharacterRamp: { value: 1.0 },
      },
      vertexShader: AsciiShader.vertexShader,
      fragmentShader: AsciiShader.fragmentShader,
    });

    const quad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      this.asciiMaterial,
    );
    this.asciiPassScene.add(quad);

    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(
      this.asciiPassScene,
      this.asciiPassCamera,
    );
    renderPass.clear = true;
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      0.5,
      0.4,
      0.85,
    );
    this.composer.addPass(this.bloomPass);

    this.imageScene = new THREE.Scene();
    this.imageScene.background = new THREE.Color(0x000000);
    this.imageCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container);
    window.addEventListener("resize", this.onResize);
  }

  public updateSettings(opts: {
    resolution: number;
    brightness: number;
    contrast: number;
    colorMode: boolean;
    fxPreset: string;
    dithering: number;
    artStyle: string;
    bgColor: string;
    asciiOpacity: number;
    asciiDensity: number;
    imageVisibility: number;
    characterRamp: number;
    bloomStrength: number;
    customCharacterSet: string;
    fontScale: number;
    bgDither: boolean;
    inverseDither: boolean;
    vignette: number;
  }) {

    if (opts.customCharacterSet !== this.currentCharacterSet && opts.customCharacterSet.length > 0) {
      this.currentCharacterSet = opts.customCharacterSet;
      const newAtlas = create2DAsciiTextureAtlas(this.currentCharacterSet);

      if (this.asciiMaterial.uniforms.tAscii.value) {
        this.asciiMaterial.uniforms.tAscii.value.dispose();
      }

      this.asciiMaterial.uniforms.tAscii.value = newAtlas.texture;
      this.asciiMaterial.uniforms.uAsciiData.value.set(
        newAtlas.cols,
        newAtlas.rows,
        newAtlas.totalChars
      );
    }

    const t = 1.0 - opts.resolution / 100.0;
    const mappedSize = 6.0 + t * 26.0;

    this.asciiMaterial.uniforms.uCharSize.value = mappedSize;
    this.asciiMaterial.uniforms.uBrightness.value = opts.brightness;
    this.asciiMaterial.uniforms.uContrast.value = opts.contrast;
    this.asciiMaterial.uniforms.uColorMode.value = opts.colorMode ? 1.0 : 0.0;

    const FX_MAP: Record<string, number> = {
      none: 0,
      noise: 1,
      field: 2,
      intervals: 3,
      "beam sweep": 4,
      glitch: 5,
      "CRT monitor": 6,
      "matrix rain": 7,
    };
    this.asciiMaterial.uniforms.uFxMode.value = FX_MAP[opts.fxPreset] || 0;
    this.asciiMaterial.uniforms.uDither.value = opts.dithering;
    this.asciiMaterial.uniforms.uFontScale.value = opts.fontScale;
    this.asciiMaterial.uniforms.uBgDither.value = opts.bgDither ? 1.0 : 0.0;
    this.asciiMaterial.uniforms.uInverseDither.value = opts.inverseDither ? 1.0 : 0.0;
    this.asciiMaterial.uniforms.uVignette.value = opts.vignette;

    const STYLE_MAP: Record<string, number> = {
      classic: 0,
      braille: 1,
      halftone: 2,
      dot: 3,
      cross: 4,
      line: 5,
      particles: 6,
      terminal: 7,
      retro: 8,
      claude: 9,
    };
    this.asciiMaterial.uniforms.uArtStyle.value = STYLE_MAP[opts.artStyle] || 0;

    this.asciiMaterial.uniforms.uAsciiOpacity.value = opts.asciiOpacity;
    this.asciiMaterial.uniforms.uAsciiDensity.value = opts.asciiDensity;
    this.asciiMaterial.uniforms.uImageVisibility.value = opts.imageVisibility;
    this.asciiMaterial.uniforms.uCharacterRamp.value = opts.characterRamp;

    this.bloomPass.strength = opts.bloomStrength;

    const hex = parseInt(opts.bgColor.replace(/^#/, ""), 16);
    this.asciiMaterial.uniforms.uBgColor.value = [
      ((hex >> 16) & 255) / 255,
      ((hex >> 8) & 255) / 255,
      (hex & 255) / 255,
    ];
  }

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

          float speed = uTime * 0.2;
          float waveX = sin(uv.y * 5.0 + speed) * 0.01;
          float waveY = cos(uv.x * 4.0 + speed * 0.8) * 0.01;

          uv.x += waveX;
          uv.y += waveY;

          vec4 color = texture2D(tDiffuse, uv);
          gl_FragColor = color;
        }
      `;

      const material = new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: { value: texture },
          uTime: { value: 0.0 },
        },
        vertexShader,
        fragmentShader,
      });

      const geometry = new THREE.PlaneGeometry(2, 2);
      this.imageMesh = new THREE.Mesh(geometry, material);
      this.imageScene.add(this.imageMesh);
    });
  }

  public setVideoSource(
    videoElement: HTMLVideoElement | null,
    isWebcam: boolean = false,
  ) {
    if (!videoElement) {
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
    const texture = new THREE.VideoTexture(videoElement);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;

    if (this.imageTexture) this.imageTexture.dispose();
    this.imageTexture = texture;

    if (this.imageMesh) {
      this.imageScene.remove(this.imageMesh);
      this.imageMesh.geometry.dispose();
      (this.imageMesh.material as THREE.Material).dispose();
    }

    const material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: texture },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
        void main() {
          vec2 uv = vUv;
          ${isWebcam ? "uv.x = 1.0 - uv.x;" : ""}
          gl_FragColor = texture2D(tDiffuse, uv);
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    this.imageMesh = new THREE.Mesh(geometry, material);
    this.imageScene.add(this.imageMesh);
  }

  public onResize = () => {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;

    if (this.camera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }

    this.renderer.setSize(w, h);

    this.renderTarget.setSize(w, h);
    this.composer.setSize(w, h);
    this.asciiMaterial.uniforms.uResolution.value.set(w, h);
  };

  public setSceneAndCamera(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
  ) {
    this.scene = scene;
    this.camera = camera;
  }

  public render = (time: number = 0) => {
    this.asciiMaterial.uniforms.uTime.value = time;

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

    this.composer.render();
  };

  public destroy() {
    window.removeEventListener("resize", this.onResize);
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