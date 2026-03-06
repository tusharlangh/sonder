import * as THREE from 'three';

/**
 * Creates a canvas texture storing the ASCII character atlas.
 * Each character is centered in its cell with padding so characters
 * don't fill edge-to-edge (avoids the "block" look).
 *
 * @param characterString The sequence of characters from dark to light.
 * @param fontFamily The font to use for rendering.
 * @returns A THREE.CanvasTexture containing the rasterized characters in one row.
 */
export function createAsciiTextureAtlas(
  characterString = ' .`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  fontFamily = 'Courier New, Courier, monospace'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2d context for ASCII atlas');

  const charCount = characterString.length;
  const cellSize = 64; // Each cell in the atlas is 64x64 pixels
  const fontSize = 48; // Slightly smaller than cell so there's padding

  canvas.width = cellSize * charCount;
  canvas.height = cellSize;

  // Black background
  context.fillStyle = '#000000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw each character centered in its cell
  context.font = `bold ${fontSize}px ${fontFamily}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#ffffff';

  for (let i = 0; i < charCount; i++) {
    const x = i * cellSize + cellSize / 2;
    const y = cellSize / 2;
    context.fillText(characterString[i], x, y);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  return texture;
}

/**
 * Creates a braille character atlas for the Braille art style.
 * Uses Unicode braille characters ordered from empty to full.
 */
export function createBrailleTextureAtlas(): THREE.CanvasTexture {
  // Braille patterns ordered by density (number of dots shown)
  const brailleChars = ' ⠁⠂⠃⠄⠅⠆⠇⡀⡁⡂⡃⡄⡅⡆⡇⠈⠉⠊⠋⠌⠍⠎⠏⡈⡉⡊⡋⡌⡍⡎⡏⠐⠑⠒⠓⠔⠕⠖⠗⡐⡑⡒⡓⡔⡕⡖⡗⠘⠙⠚⠛⠜⠝⠞⠟⡘⡙⡚⡛⡜⡝⡞⡟⠠⠡⠢⠣⠤⠥⠦⠧⡠⡡⡢⡣⡤⡥⡦⡧⠨⠩⠪⠫⠬⠭⠮⠯⡨⡩⡪⡫⡬⡭⡮⡯⠰⠱⠲⠳⠴⠵⠶⠷⡰⡱⡲⡳⡴⡵⡶⡷⠸⠹⠺⠻⠼⠽⠾⠿⡸⡹⡺⡻⡼⡽⡾⡿⢀⢁⢂⢃⢄⢅⢆⢇⣀⣁⣂⣃⣄⣅⣆⣇⢈⢉⢊⢋⢌⢍⢎⢏⣈⣉⣊⣋⣌⣍⣎⣏⢐⢑⢒⢓⢔⢕⢖⢗⣐⣑⣒⣓⣔⣕⣖⣗⢘⢙⢚⢛⢜⢝⢞⢟⣘⣙⣚⣛⣜⣝⣞⣟⢠⢡⢢⢣⢤⢥⢦⢧⣠⣡⣢⣣⣤⣥⣦⣧⢨⢩⢪⢫⢬⢭⢮⢯⣨⣩⣪⣫⣬⣭⣮⣯⢰⢱⢲⢳⢴⢵⢶⢷⣰⣱⣲⣳⣴⣵⣶⣷⢸⢹⢺⢻⢼⢽⢾⢿⣸⣹⣺⣻⣼⣽⣾⣿';

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2d context for braille atlas');

  const charCount = brailleChars.length;
  const cellSize = 64;
  const fontSize = 48;

  canvas.width = cellSize * charCount;
  canvas.height = cellSize;

  context.fillStyle = '#000000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.font = `${fontSize}px monospace`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#ffffff';

  for (let i = 0; i < charCount; i++) {
    const x = i * cellSize + cellSize / 2;
    const y = cellSize / 2;
    context.fillText(brailleChars[i], x, y);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  return texture;
}
