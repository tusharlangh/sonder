import { useStore } from '../store/useStore';
import { AsciiShader } from './AsciiShader';

export function generateWebGLCodeExport(): string {
  const store = useStore.getState();

  const vertexShader = AsciiShader.vertexShader.trim();
  const fragmentShader = AsciiShader.fragmentShader.trim();

  const hex = parseInt(store.backgroundColor.replace(/^#/, ""), 16);
  const bgColorArray = [
    ((hex >> 16) & 255) / 255,
    ((hex >> 8) & 255) / 255,
    (hex & 255) / 255,
  ];

  const FX_MAP: Record<string, number> = {
    none: 0, noise: 1, field: 2, intervals: 3,
    "beam sweep": 4, glitch: 5, "CRT monitor": 6, "matrix rain": 7,
  };

  const STYLE_MAP: Record<string, number> = {
    classic: 0, braille: 1, halftone: 2, dot: 3, cross: 4,
    line: 5, particles: 6, terminal: 7, retro: 8, claude: 9,
  };

  const fxMode = FX_MAP[store.fxPreset] || 0;
  const artStyle = STYLE_MAP[store.artStyle] || 0;

  const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sonder WebGL Export</title>
    <style>
        body { margin: 0; overflow: hidden; background: ${store.backgroundColor}; }
        canvas { display: block; width: 100vw; height: 100vh; }
    </style>
    <!-- Import Three.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
<script>

    function createAtlas(chars) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const length = chars.length;
        const cols = Math.ceil(Math.sqrt(length));
        const rows = Math.ceil(length / cols);
        const size = 64;
        canvas.width = size * cols;
        canvas.height = size * rows;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'bold 62px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';

        for (let i = 0; i < length; i++) {
            const x = (i % cols) * size + size / 2;
            const y = Math.floor(i / cols) * size + size / 2;
            ctx.fillText(chars[i], x, y);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        return { texture, cols, rows, totalChars: length };
    }

    const atlasDefs = {
        0: "@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\\\|()1{}[]?-_+~<>i!lI;:,\\"^\\'\`. ",
        1: " ⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿⡀⡁⡂⡃⡄⡅⡆⡇⡈⡉⡊⡋⡌⡍⡎⡏⡐⡑⡒⡓⡔⡕⡖⡗⡘⡙⡚⡛⡜⡝⡞⡟⡠⡡⡢⡣⡤⡥⡦⡧⡨⡩⡪⡫⡬⡭⡮⡯⡰⡱⡲⡳⡴⡵⡶⡷⡸⡹⡺⡻⡼⡽⡾⡿⣀⣁⣂⣃⣄⣅⣆⣇⣈⣉⣊⣋⣌⣍⣎⣏⣐⣑⣒⣓⣔⣕⣖⣗⣘⣙⣚⣛⣜⣝⣞⣟⣠⣡⣢⣣⣤⣥⣦⣧⣨⣩⣪⣫⣬⣭⣮⣯⣰⣱⣲⣳⣴⣵⣶⣷⣸⣹⣺⣻⣼⣽⣾⣿",
        7: "  ▂▃▄▅▆▇█",
        8: " ░▒▓█",
        9: " .,:;=+-*/<>{}[]()$#"
    };

    let charString = atlasDefs[${artStyle}] || atlasDefs[0];
    if (${artStyle} === 0) {
        charString = \`${store.customCharacterSet}\` || atlasDefs[0];
    }

    const mainAtlas = createAtlas(charString);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    const uniforms = {
        tDiffuse: { value: null },
        tAscii: { value: mainAtlas.texture },
        tMatrix: { value: null },
        tBraille: { value: mainAtlas.texture },
        tTerminal: { value: mainAtlas.texture },
        tRetro: { value: mainAtlas.texture },
        tClaude: { value: mainAtlas.texture },

        uAsciiData: { value: new THREE.Vector3(mainAtlas.cols, mainAtlas.rows, mainAtlas.totalChars) },
        uMatrixData: { value: new THREE.Vector3(1, 1, 1) },
        uBrailleData: { value: new THREE.Vector3(mainAtlas.cols, mainAtlas.rows, mainAtlas.totalChars) },
        uTerminalData: { value: new THREE.Vector3(mainAtlas.cols, mainAtlas.rows, mainAtlas.totalChars) },
        uRetroData: { value: new THREE.Vector3(mainAtlas.cols, mainAtlas.rows, mainAtlas.totalChars) },
        uClaudeData: { value: new THREE.Vector3(mainAtlas.cols, mainAtlas.rows, mainAtlas.totalChars) },

        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uCharSize: { value: ${16.0 + (1.0 - store.resolution / 100.0) * 26.0} },
        uFontScale: { value: ${store.fontScale} },
        uBrightness: { value: ${store.brightness} },
        uContrast: { value: ${store.contrast} },
        uColorMode: { value: ${store.colorMode ? 1.0 : 0.0} },
        uFxMode: { value: ${fxMode} },
        uDither: { value: ${store.dithering} },
        uBgDither: { value: ${store.bgDither ? 1.0 : 0.0} },
        uInverseDither: { value: ${store.inverseDither ? 1.0 : 0.0} },
        uVignette: { value: ${store.vignette} },
        uArtStyle: { value: ${artStyle} },
        uTime: { value: 0.0 },
        uBgColor: { value: [${bgColorArray[0]}, ${bgColorArray[1]}, ${bgColorArray[2]}] },

        uAsciiOpacity: { value: ${store.asciiOpacity} },
        uAsciiDensity: { value: ${store.asciiDensity} },
        uImageVisibility: { value: ${store.imageVisibility} },
        uCharacterRamp: { value: ${store.characterRamp} },
    };

    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: \`${vertexShader}\`,
        fragmentShader: \`${fragmentShader}\`
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = 512; sourceCanvas.height = 512;
    const sCtx = sourceCanvas.getContext('2d');
    const sourceTexture = new THREE.CanvasTexture(sourceCanvas);
    uniforms.tDiffuse.value = sourceTexture;

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    });

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.016;
        uniforms.uTime.value = time;

        const cx = 256 + Math.sin(time) * 100;
        const cy = 256 + Math.cos(time * 1.3) * 100;
        const grad = sCtx.createRadialGradient(cx, cy, 0, 256, 256, 400);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, '#000000');
        sCtx.fillStyle = grad;
        sCtx.fillRect(0, 0, 512, 512);
        sourceTexture.needsUpdate = true;

        renderer.render(scene, camera);
    }
    animate();
</script>
</body>
</html>`;

  return htmlTemplate;
}