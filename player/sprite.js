const BASE_PATH = 'assets/player/rotations';

const DIRECTIONS = [
  'south', 'south-east', 'east', 'north-east',
  'north', 'north-west', 'west', 'south-west',
];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load sprite: ${src}`));
    img.src = src;
  });
}

export async function loadPlayerSprites() {
  const entries = await Promise.all(
    DIRECTIONS.map(async (dir) => {
      const img = await loadImage(`${BASE_PATH}/${dir}.png`);
      return [dir, img];
    })
  );
  return Object.fromEntries(entries);
}
