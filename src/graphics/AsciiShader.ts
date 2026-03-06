import * as THREE from 'three';

/**
 * High-Fidelity Multi-style ASCII shader.
 * uFxMode: 0=None, 1=Noise, 2=Field, 3=Intervals, 4=Beam Sweep, 5=Glitch, 6=CRT, 7=Matrix
 */
export const AsciiShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tAscii: { value: null as THREE.Texture | null },
    tMatrix: { value: null as THREE.Texture | null },
    
    uAsciiData: { value: new THREE.Vector3(1, 1, 1) }, // x=cols, y=rows, z=totalChars
    uMatrixData: { value: new THREE.Vector3(1, 1, 1) },

    uResolution: { value: new THREE.Vector2() },
    uCharSize: { value: 10.0 }, // Maps directly to grid density now
    uBrightness: { value: 1.0 },
    uContrast: { value: 1.0 },
    uColorMode: { value: 1.0 },
    uFxMode: { value: 0.0 },
    uDither: { value: 0.0 },
    uTime: { value: 0.0 },
    uBgColor: { value: [0, 0, 0] },

    uAsciiOpacity: { value: 0.8 },
    uAsciiDensity: { value: 1.0 },
    uImageVisibility: { value: 0.5 },
    uCharacterRamp: { value: 1.0 },
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
    uniform sampler2D tMatrix;

    uniform vec3 uAsciiData;
    uniform vec3 uMatrixData;

    uniform vec2 uResolution;
    uniform float uCharSize;
    uniform float uBrightness;
    uniform float uContrast;
    uniform float uColorMode;
    uniform float uFxMode;
    uniform float uDither;
    uniform float uTime;
    uniform vec3 uBgColor;

    uniform float uAsciiOpacity;
    uniform float uAsciiDensity;
    uniform float uImageVisibility;
    uniform float uCharacterRamp;

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

    // ─── Texture Atlas 2D Sampler ───
    float sampleAtlas(sampler2D atlas, vec2 cellUv, float charIndex, vec3 atlasData) {
      float cols = atlasData.x;
      float rows = atlasData.y;
      
      float colIndex = mod(charIndex, cols);
      float rowIndex = floor(charIndex / cols);
      
      float atlasU = (colIndex + cellUv.x) / cols;
      float atlasV = ((rows - 1.0 - rowIndex) + cellUv.y) / rows;
      
      return texture2D(atlas, vec2(atlasU, atlasV)).r;
    }

    // ─── Compute luminance with brightness/contrast ───
    float getRawLuma(vec3 c) {
      return dot(c, vec3(0.299, 0.587, 0.114));
    }

    float getLuma(vec3 c) {
      float luma = getRawLuma(c);
      luma = (luma - 0.5) * uContrast + 0.5;
      luma *= uBrightness;
      return clamp(pow(clamp(luma, 0.0, 1.0), uCharacterRamp), 0.0, 1.0);
    }

    // ─── Sobel Edge Detection ───
    float edgeStrength(vec2 uv) {
      vec2 texel = 1.0 / uResolution;
      float tL = getRawLuma(texture2D(tDiffuse, uv + vec2(-texel.x,  texel.y)).rgb);
      float tC = getRawLuma(texture2D(tDiffuse, uv + vec2(       0.0,  texel.y)).rgb);
      float tR = getRawLuma(texture2D(tDiffuse, uv + vec2( texel.x,  texel.y)).rgb);
      float mL = getRawLuma(texture2D(tDiffuse, uv + vec2(-texel.x,       0.0)).rgb);
      float mR = getRawLuma(texture2D(tDiffuse, uv + vec2( texel.x,       0.0)).rgb);
      float bL = getRawLuma(texture2D(tDiffuse, uv + vec2(-texel.x, -texel.y)).rgb);
      float bC = getRawLuma(texture2D(tDiffuse, uv + vec2(       0.0, -texel.y)).rgb);
      float bR = getRawLuma(texture2D(tDiffuse, uv + vec2( texel.x, -texel.y)).rgb);

      float sobelX = tR + 2.0 * mR + bR - (tL + 2.0 * mL + bL);
      float sobelY = bL + 2.0 * bC + bR - (tL + 2.0 * tC + tR);
      return length(vec2(sobelX, sobelY));
    }

    // ─── Classic ASCII (High Density Gradient) ───
    vec4 renderClassic(vec2 grid, vec2 cellUv, vec2 centerUv, float luma, float edge, vec4 sceneColor) {
      float totalChars = uAsciiData.z;
      
      float edgeBias = min(edge * 1.5, 0.5);
      float adjustedLuma = clamp(luma - edgeBias, 0.0, 1.0);

      float dithered = adjustedLuma;
      if (uDither > 0.01) {
        float d = bayerDither(grid) - 0.5;
        dithered += d * uDither * (1.0 / sqrt(totalChars));
        dithered = clamp(dithered, 0.0, 1.0);
      }

      float charIndex = floor(dithered * uAsciiDensity * (totalChars - 1.0));
      charIndex = clamp(charIndex, 0.0, totalChars - 1.0);
      
      float mask = sampleAtlas(tAscii, cellUv, charIndex, uAsciiData);

      vec3 color = uColorMode > 0.5 ? sceneColor.rgb : vec3(1.0);
      color = pow(color, vec3(0.75)) * 1.8;

      vec3 baseImage = sceneColor.rgb * uImageVisibility;
      vec3 bgWithImage = mix(uBgColor, baseImage, clamp(uImageVisibility, 0.0, 1.0));
      float glyphAlpha = mask * uAsciiOpacity;
      vec3 finalCol = mix(bgWithImage, color, glyphAlpha);

      return vec4(finalCol, 1.0);
    }

    // ─── Matrix Style Mode (Procedural ASCII Rain) ───
    vec4 renderMatrix(vec2 grid, vec2 cellUv, vec2 centerUv, float luma, float edge, vec4 sceneColor) {
      float colHash = hash(vec2(grid.x, 0.0));
      float fallSpeed = 10.0 + colHash * 20.0;
      float timeOffset = uTime * fallSpeed;
      
      float dropY = mod(timeOffset, 200.0) - grid.y;
      
      float trailLength = 10.0 + colHash * 30.0;
      float trailFade = clamp(1.0 - (dropY / trailLength), 0.0, 1.0);
      trailFade = pow(trailFade, 1.5);
      
      float isHead = step(0.0, dropY) * step(dropY, 1.0);
      
      if (dropY < 0.0) trailFade = 0.0;
      
      float charTick = floor(uTime * (10.0 + colHash * 5.0));
      float charHash = hash(vec2(grid.x, grid.y + charTick));
      
      float totalChars = uMatrixData.z;
      float charIndex = floor(charHash * uAsciiDensity * (totalChars - 1.0));
      charIndex = clamp(charIndex, 0.0, totalChars - 1.0);
      float mask = sampleAtlas(tMatrix, cellUv, charIndex, uMatrixData);
      
      vec3 color = vec3(0.1, 0.8, 0.4) * trailFade;
      color = mix(color, vec3(0.8, 1.0, 0.9), isHead * 0.9);
      
      float sceneIntensity = clamp(luma * 1.5 + edge, 0.0, 1.0);
      color *= mix(0.15, 1.5, sceneIntensity);

      if (uColorMode > 0.5) {
         vec3 sceneGr = sceneColor.rgb;
         color = mix(color, sceneGr * (trailFade + isHead) * 1.5, 0.6);
      }

      vec3 baseImage = sceneColor.rgb * uImageVisibility;
      vec3 bgWithImage = mix(uBgColor, baseImage, clamp(uImageVisibility, 0.0, 1.0));
      float glyphAlpha = mask * uAsciiOpacity;
      vec3 finalCol = mix(bgWithImage, color, glyphAlpha);

      return vec4(finalCol, 1.0);
    }

    void main() {
      float cellH = uCharSize;
      float cellW = uCharSize * 0.35;

      vec2 cells = uResolution / vec2(cellW, cellH);
      vec2 baseUv = vUv;

      // 6 = CRT: barrel distortion
      if (uFxMode == 6.0) {
        vec2 d = baseUv - 0.5;
        float rSq = dot(d, d);
        baseUv += d * (rSq * 0.1); 
      }

      vec2 grid = floor(baseUv * cells);
      vec2 cellUv = fract(baseUv * cells);
      vec2 centerUv = (grid + 0.5) / cells;

      // 5 = Glitch: Blocky shifts and tearing
      if (uFxMode == 5.0) {
        float tear = sin(centerUv.y * 8.0 + uTime * 6.0) * sin(centerUv.y * 3.0 - uTime * 2.0);
        if (abs(tear) > 0.8) {
           centerUv.x += tear * 0.01;
        }
        if (centerUv.y < 0.15) {
           centerUv.x += (hash(vec2(grid.y, uTime)) - 0.5) * 0.08;
        }
      }

      // Sample scene
      vec4 sceneColor = texture2D(tDiffuse, centerUv);
      
      // Post-sampling FX (RGB splits)
      if (uFxMode == 2.0) { // Field chromatic aberration
         vec2 d = centerUv - 0.5;
         float str = dot(d, d) * 0.05; 
         sceneColor.r = texture2D(tDiffuse, centerUv + d * str).r;
         sceneColor.b = texture2D(tDiffuse, centerUv - d * str).b;
      }
      if (uFxMode == 5.0) { // Glitch RGB split
         float tear = sin(centerUv.y * 8.0 + uTime * 6.0);
         float shift = smoothstep(0.7, 1.0, abs(tear)) * 0.01;
         sceneColor.r = texture2D(tDiffuse, centerUv + vec2(shift, 0.0)).r;
         sceneColor.b = texture2D(tDiffuse, centerUv - vec2(shift, 0.0)).b;
      }

      float luma = getLuma(sceneColor.rgb);
      float edge = edgeStrength(centerUv);

      // 7 = Matrix Rain uses entirely custom rendering
      if (uFxMode == 7.0) {
         gl_FragColor = renderMatrix(grid, cellUv, centerUv, luma, edge, sceneColor);
         return;
      }

      // Base Classic Render
      vec4 result = renderClassic(grid, cellUv, centerUv, luma, edge, sceneColor);

      // 1 = Noise (Cinematic Film Grain)
      if (uFxMode == 1.0) {
         float noiseX = fract(sin(dot(vUv, vec2(12.9898,78.233)) * 2.0 + uTime) * 43758.5453);
         float grainAmount = (1.0 - abs(luma - 0.5) * 2.0) * 0.15; 
         result.rgb += (noiseX - 0.5) * grainAmount;
      }

      // 3 = Intervals (Cinematic Light Leaks)
      if (uFxMode == 3.0) {
         float leak1 = sin(uTime * 0.3 + vUv.x * 2.0) * 0.5 + 0.5;
         float leak2 = sin(uTime * 0.2 - vUv.y * 3.0) * 0.5 + 0.5;
         float gradient = smoothstep(0.2, 1.0, leak1 * leak2 * (1.0 - vUv.x));
         vec3 leakColor = vec3(1.0, 0.4, 0.1) * gradient * 0.6; // Warm orange leak
         vec3 leakColor2 = vec3(0.8, 0.1, 0.6) * smoothstep(0.5, 1.0, leak1 * vUv.y) * 0.4; // Magenta leak
         
         // Screen blend
         result.rgb = result.rgb + (leakColor + leakColor2) - (result.rgb * (leakColor + leakColor2));
      }

      // 4 = Beam Sweep (Shimmer Loading Effect)
      if (uFxMode == 4.0) {
         // Create a diagonal sweeping gradient (increased speed)
         float shimmerPosition = fract(uTime * 0.8);
         
         // Combine x and y for a diagonal angle
         float diagonalUv = vUv.x * 0.5 + vUv.y * 0.5;
         
         // Calculate distance from the shimmer position
         float dist = abs(diagonalUv - shimmerPosition);
         
         // Wrap the distance so the shimmer seamlessly loops
         if (dist > 0.5) dist -= 1.0;
         dist = abs(dist);

         // Soft falloff (much larger radius)
         float shimmerHighlight = smoothstep(0.40, 0.0, dist);
         float shimmerCore = smoothstep(0.15, 0.0, dist);
         
         // Pull from the underlying scene color if color mode is active, otherwise use a soft white
         vec3 baseShimmerColor = uColorMode > 0.5 ? sceneColor.rgb : vec3(1.0);
         
         // Color the shimmer by boosting the scene color to a bright shine
         // We still add a tiny bit of additive white (0.1) so it actually looks like light, even on dark colors.
         vec3 shimmerColor = (baseShimmerColor + vec3(0.1)) * shimmerCore * 0.5 + baseShimmerColor * shimmerHighlight * 0.15;
         
         // Add the shimmer very gently over the result. 
         // By multiplying by luma again, it interacts more with the bright parts of the image
         // rather than just laying a flat white bar over everything.
         result.rgb += shimmerColor * (luma * 2.0 + 0.05); 
      }

      // 6 = CRT (Broadcast Studio Quality)
      if (uFxMode == 6.0) {
         // Phosphor Mask
         vec3 phosphor = vec3(1.0);
         float modX = mod(vUv.x * uResolution.x, 3.0);
         if (modX < 1.0) phosphor = vec3(1.0, 0.3, 0.3);
         else if (modX < 2.0) phosphor = vec3(0.3, 1.0, 0.3);
         else phosphor = vec3(0.3, 0.3, 1.0);
         
         result.rgb = pow(result.rgb, vec3(1.2));
         result.rgb = mix(result.rgb, result.rgb * phosphor * 2.0, 0.4);

         float scanline = sin(baseUv.y * uResolution.y * 3.14159) * 0.05;
         result.rgb -= scanline;

         vec2 vDist = baseUv - 0.5;
         float vignette = dot(vDist, vDist);
         result.rgb *= smoothstep(0.5, 0.15, vignette);
      }

      gl_FragColor = result;
    }
  `,
};
