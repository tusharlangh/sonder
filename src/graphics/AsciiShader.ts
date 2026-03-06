import * as THREE from 'three';

/**
 * Multi-style ASCII shader.
 * uStyleMode: 0 = Classic ASCII, 1 = Braille, 2 = Halftone, 3 = Dotcross
 *
 * KEY FIX: Each cell is a character-sized grid cell. We sample the atlas
 * with proper UV coordinates and apply a cell background so characters
 * are clearly visible against black, not blended into solid blocks.
 */
export const AsciiShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tAscii: { value: null as THREE.Texture | null },
    tBraille: { value: null as THREE.Texture | null },
    uResolution: { value: new THREE.Vector2() },
    uFontCount: { value: 1.0 },
    uBrailleFontCount: { value: 1.0 },
    uCharSize: { value: 10.0 },
    uBrightness: { value: 1.0 },
    uContrast: { value: 1.0 },
    uColorMode: { value: 1.0 },
    uStyleMode: { value: 0.0 },
    uNoise: { value: 0.0 },
    uDither: { value: 0.0 },
    uTime: { value: 0.0 },
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
    uniform sampler2D tAscii;
    uniform sampler2D tBraille;

    uniform vec2 uResolution;
    uniform float uFontCount;
    uniform float uBrailleFontCount;
    uniform float uCharSize;
    uniform float uBrightness;
    uniform float uContrast;
    uniform float uColorMode;
    uniform float uStyleMode;
    uniform float uNoise;
    uniform float uDither;
    uniform float uTime;
    uniform vec3 uBgColor;

    varying vec2 vUv;

    // ─── Noise helper ───
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    // ─── Bayer 4×4 dithering ───
    float bayerDither(vec2 cellCoord) {
      int x = int(mod(cellCoord.x, 4.0));
      int y = int(mod(cellCoord.y, 4.0));
      int idx = x + y * 4;
      float val = 0.0;
      // Bayer 4x4 matrix values
      if (idx ==  0) val = 0.0;    if (idx ==  1) val = 8.0;
      if (idx ==  2) val = 2.0;    if (idx ==  3) val = 10.0;
      if (idx ==  4) val = 12.0;   if (idx ==  5) val = 4.0;
      if (idx ==  6) val = 14.0;   if (idx ==  7) val = 6.0;
      if (idx ==  8) val = 3.0;    if (idx ==  9) val = 11.0;
      if (idx == 10) val = 1.0;    if (idx == 11) val = 9.0;
      if (idx == 12) val = 15.0;   if (idx == 13) val = 7.0;
      if (idx == 14) val = 13.0;   if (idx == 15) val = 5.0;
      return val / 16.0;
    }

    // ─── Compute luminance with brightness/contrast ───
    float getLuma(vec3 c) {
      float luma = dot(c, vec3(0.299, 0.587, 0.114));
      luma = (luma - 0.5) * uContrast + 0.5;
      luma *= uBrightness;
      return clamp(luma, 0.0, 1.0);
    }

    // ─── Classic ASCII ───
    vec4 renderClassic(vec2 grid, vec2 cellUv, vec2 centerUv, float luma) {
      vec4 sceneColor = texture2D(tDiffuse, centerUv);

      // Apply dithering
      float dithered = luma;
      if (uDither > 0.01) {
        float d = bayerDither(grid) - 0.5;
        dithered = luma + d * uDither * 0.5;
        dithered = clamp(dithered, 0.0, 1.0);
      }

      // Pick character index based on luminance
      float charIndex = floor(dithered * (uFontCount - 1.0));

      // Sample from atlas: each character occupies 1/uFontCount of atlas width
      float atlasU = (charIndex + cellUv.x) / uFontCount;
      float atlasV = cellUv.y;
      float mask = texture2D(tAscii, vec2(atlasU, atlasV)).r;

      vec3 color = uColorMode > 0.5 ? sceneColor.rgb : vec3(1.0);
      
      // Lift midtones and boost overall brightness for Classic ASCII 
      // because the character mask inherently darkens the image.
      // This allows the color to be bright without forcing luma to $
      color = pow(color, vec3(0.75)) * 1.8;

      if (uNoise > 0.01) {
        float n = hash(grid + uTime * 0.1) * uNoise * 0.3;
        color += n;
      }

      vec3 finalCol = mix(uBgColor, color, mask);
      return vec4(finalCol, 1.0);
    }

    // ─── Braille ───
    vec4 renderBraille(vec2 grid, vec2 cellUv, vec2 centerUv, float luma) {
      vec4 sceneColor = texture2D(tDiffuse, centerUv);

      float dithered = luma;
      if (uDither > 0.01) {
        dithered += (bayerDither(grid) - 0.5) * uDither * 0.5;
        dithered = clamp(dithered, 0.0, 1.0);
      }

      float charIndex = floor(dithered * (uBrailleFontCount - 1.0));
      float atlasU = (charIndex + cellUv.x) / uBrailleFontCount;
      float mask = texture2D(tBraille, vec2(atlasU, cellUv.y)).r;

      vec3 color = uColorMode > 0.5 ? sceneColor.rgb : vec3(1.0);
      color = pow(color, vec3(0.85)) * 1.4;

      if (uNoise > 0.01) {
        float n = hash(grid + uTime * 0.1) * uNoise * 0.3;
        color += n;
      }

      vec3 finalCol = mix(uBgColor, color, mask);
      return vec4(finalCol, 1.0);
    }

    // ─── Halftone (procedural dots) ───
    vec4 renderHalftone(vec2 grid, vec2 cellUv, vec2 centerUv, float luma) {
      vec4 sceneColor = texture2D(tDiffuse, centerUv);

      // Distance from center of the cell
      vec2 center = cellUv - 0.5;
      float dist = length(center);

      // Dot radius scales with luminance
      float radius = luma * 0.45;
      float dot = smoothstep(radius + 0.02, radius - 0.02, dist);

      vec3 color = uColorMode > 0.5 ? sceneColor.rgb : vec3(1.0);

      if (uNoise > 0.01) {
        float n = hash(grid + uTime * 0.1) * uNoise * 0.3;
        color += n;
      }

      vec3 finalCol = mix(uBgColor, color, dot);
      return vec4(finalCol, 1.0);
    }

    // ─── Dotcross (procedural crosses) ───
    vec4 renderDotcross(vec2 grid, vec2 cellUv, vec2 centerUv, float luma) {
      vec4 sceneColor = texture2D(tDiffuse, centerUv);

      // Cross shape: union of horizontal and vertical bars
      vec2 center = abs(cellUv - 0.5);
      float thickness = luma * 0.4;
      float cross = 0.0;

      // Horizontal bar
      if (center.y < thickness * 0.5 && center.x < luma * 0.45) cross = 1.0;
      // Vertical bar
      if (center.x < thickness * 0.5 && center.y < luma * 0.45) cross = 1.0;

      vec3 color = uColorMode > 0.5 ? sceneColor.rgb : vec3(1.0);

      if (uNoise > 0.01) {
        float n = hash(grid + uTime * 0.1) * uNoise * 0.3;
        color += n;
      }

      vec3 finalCol = mix(uBgColor, color, cross);
      return vec4(finalCol, 1.0);
    }

    // ─── Line (procedural directional lines) ───
    vec4 renderLine(vec2 grid, vec2 cellUv, vec2 centerUv, float luma) {
      vec4 sceneColor = texture2D(tDiffuse, centerUv);

      // Compute simple gradient for edge direction
      vec2 texel = 1.0 / uResolution;
      float lRight = getLuma(texture2D(tDiffuse, centerUv + vec2(texel.x, 0.0)).rgb);
      float lTop   = getLuma(texture2D(tDiffuse, centerUv + vec2(0.0, texel.y)).rgb);

      float dx = lRight - luma;
      float dy = lTop - luma;

      // Calculate angle perpendicular to gradient
      float angle = atan(dy, dx) + 1.57079632;
      
      // Snap to 4 directions (-pi/4, 0, pi/4, pi/2). pi/4 is approx 0.785398
      angle = floor((angle + 0.392699) / 0.785398) * 0.785398;

      // Rotate cell UV around center
      vec2 center = cellUv - 0.5;
      float c = cos(angle);
      float s = sin(angle);
      vec2 rotated = vec2(center.x * c - center.y * s, center.x * s + center.y * c);

      // Line thickness based on luminance
      float thickness = luma * 0.4;
      
      // Draw smooth line
      float line = smoothstep(thickness * 0.5 + 0.05, thickness * 0.5 - 0.05, abs(rotated.y));

      vec3 color = uColorMode > 0.5 ? sceneColor.rgb : vec3(1.0);

      if (uNoise > 0.01) {
        float n = hash(grid + uTime * 0.1) * uNoise * 0.3;
        color += n;
      }

      vec3 finalCol = mix(uBgColor, color, line);
      return vec4(finalCol, 1.0);
    }

    void main() {
      // Compute cell dimensions in pixels
      float cellH = uCharSize;
      float cellW = uCharSize * 0.6;

      // How many cells fit across the screen
      vec2 cells = uResolution / vec2(cellW, cellH);

      // Which cell are we in (grid coordinate)
      vec2 grid = floor(vUv * cells);

      // UV within this cell [0..1]
      vec2 cellUv = fract(vUv * cells);

      // Sample color from the center of this cell
      vec2 centerUv = (grid + 0.5) / cells;

      // Get luminance
      vec4 sceneColor = texture2D(tDiffuse, centerUv);
      float luma = getLuma(sceneColor.rgb);

      // Route to style renderer
      vec4 result;
      if (uStyleMode < 0.5) {
        result = renderClassic(grid, cellUv, centerUv, luma);
      } else if (uStyleMode < 1.5) {
        result = renderBraille(grid, cellUv, centerUv, luma);
      } else if (uStyleMode < 2.5) {
        result = renderHalftone(grid, cellUv, centerUv, luma);
      } else if (uStyleMode < 3.5) {
        result = renderDotcross(grid, cellUv, centerUv, luma);
      } else {
        result = renderLine(grid, cellUv, centerUv, luma);
      }

      gl_FragColor = result;
    }
  `,
};
