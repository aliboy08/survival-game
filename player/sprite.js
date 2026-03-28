const BASE_PATH = 'assets/player/animations';

const DIRECTIONS = [
  'south', 'south-east', 'east', 'north-east',
  'north', 'north-west', 'west', 'south-west',
];

const ANIMATIONS = {
  'breathing-idle': 4,
  'walk':           6,
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

// Returns { [animName]: { [direction]: Image[] } }
export async function loadPlayerSprites() {
  const result = {};

  for (const [anim, frameCount] of Object.entries(ANIMATIONS)) {
    result[anim] = {};

    for (const dir of DIRECTIONS) {
      result[anim][dir] = await Promise.all(
        Array.from({ length: frameCount }, (_, i) => {
          const idx = String(i).padStart(3, '0');
          return loadImage(`${BASE_PATH}/${anim}/${dir}/frame_${idx}.png`);
        })
      );
    }
  }

  return result;
}
