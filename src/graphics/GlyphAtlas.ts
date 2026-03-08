import * as THREE from 'three';

export function create2DAsciiTextureAtlas(
  characterString = '@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^\`\'. ',
  fontFamily = 'Courier New, Courier, monospace'
): { texture: THREE.CanvasTexture; cols: number; rows: number; totalChars: number } {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2d context for ASCII atlas');

  const charCount = characterString.length;

  const cols = Math.ceil(Math.sqrt(charCount));
  const rows = Math.ceil(charCount / cols);

  const cellHeight = 64;
  const cellWidth = 64;

  const fontSize = 62;

  canvas.width = cellWidth * cols;
  canvas.height = cellHeight * rows;

  context.fillStyle = '#000000';
  context.fillRect(0, 0, canvas.width, canvas.height);

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

export function createMatrixTextureAtlas(
  fontFamily = 'monospace'
): { texture: THREE.CanvasTexture; cols: number; rows: number; totalChars: number } {
  let chars = '';

  for (let i = 0xFF66; i <= 0xFF9D; i++) {
    chars += String.fromCharCode(i);
  }
  chars += '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>+-*/=!?';

  return create2DAsciiTextureAtlas(chars, fontFamily);
}

export function createBrailleTextureAtlas(
  fontFamily = 'monospace'
): { texture: THREE.CanvasTexture; cols: number; rows: number; totalChars: number } {

  const chars = ' ⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿⡀⡁⡂⡃⡄⡅⡆⡇⡈⡉⡊⡋⡌⡍⡎⡏⡐⡑⡒⡓⡔⡕⡖⡗⡘⡙⡚⡛⡜⡝⡞⡟⡠⡡⡢⡣⡤⡥⡦⡧⡨⡩⡪⡫⡬⡭⡮⡯⡰⡱⡲⡳⡴⡵⡶⡷⡸⡹⡺⡻⡼⡽⡾⡿⣀⣁⣂⣃⣄⣅⣆⣇⣈⣉⣊⣋⣌⣍⣎⣏⣐⣑⣒⣓⣔⣕⣖⣗⣘⣙⣚⣛⣜⣝⣞⣟⣠⣡⣢⣣⣤⣥⣦⣧⣨⣩⣪⣫⣬⣭⣮⣯⣰⣱⣲⣳⣴⣵⣶⣷⣸⣹⣺⣻⣼⣽⣾⣿';
  return create2DAsciiTextureAtlas(chars, fontFamily);
}

export function createTerminalTextureAtlas(
  fontFamily = 'monospace'
): { texture: THREE.CanvasTexture; cols: number; rows: number; totalChars: number } {
  const chars = '  ▂▃▄▅▆▇█';
  return create2DAsciiTextureAtlas(chars, fontFamily);
}

export function createRetroTextureAtlas(
  fontFamily = 'monospace'
): { texture: THREE.CanvasTexture; cols: number; rows: number; totalChars: number } {
  const chars = ' ░▒▓█';
  return create2DAsciiTextureAtlas(chars, fontFamily);
}

export function createClaudeTextureAtlas(
  fontFamily = 'monospace'
): { texture: THREE.CanvasTexture; cols: number; rows: number; totalChars: number } {
  const chars = ' .,:;=+-*/<>{}[]()$#';
  return create2DAsciiTextureAtlas(chars, fontFamily);
}