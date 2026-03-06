import * as THREE from 'three';

/**
 * Creates a 2D canvas texture storing the ASCII character atlas.
 * Uses a grid to allow for high-capacity character strings without hitting texture max-width limits.
 * 
 * @param characterString The sequence of characters from dark to light.
 * @param fontFamily The font to use for rendering.
 * @returns An object containing the texture, column count, and row count.
 */
export function create2DAsciiTextureAtlas(
  characterString = '@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^\`\'. ',
  fontFamily = 'Courier New, Courier, monospace'
): { texture: THREE.CanvasTexture; cols: number; rows: number; totalChars: number } {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2d context for ASCII atlas');

  const charCount = characterString.length;
  // Determine grid dimensions
  const cols = Math.ceil(Math.sqrt(charCount));
  const rows = Math.ceil(charCount / cols);

  const cellHeight = 64;
  const cellWidth = 64; // Square cells are mathematically clean for UV grid
  
  // Increase fontSize so each glyph takes up more of the 64x64 cell.
  // 54px leaves padding; jumping to 62px significantly fattens characters.
  const fontSize = 62;

  canvas.width = cellWidth * cols;
  canvas.height = cellHeight * rows;

  // Black background
  context.fillStyle = '#000000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw each character centered in its cell
  context.font = `bold ${fontSize}px ${fontFamily}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#ffffff';

  for (let i = 0; i < charCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * cellWidth + cellWidth / 2;
    const y = row * cellHeight + cellHeight / 2;
    context.fillText(characterString[i], x, y);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  return { texture, cols, rows, totalChars: charCount };
}



/**
 * Creates a Matrix digital rain 2D atlas (Katakana, Latin, Numbers)
 */
export function createMatrixTextureAtlas(
  fontFamily = 'monospace'
): { texture: THREE.CanvasTexture; cols: number; rows: number; totalChars: number } {
  let chars = '';
  // Half-width Katakana range provides a great matrix look
  for (let i = 0xFF66; i <= 0xFF9D; i++) {
    chars += String.fromCharCode(i);
  }
  chars += '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>+-*/=!?';
  
  return create2DAsciiTextureAtlas(chars, fontFamily);
}
