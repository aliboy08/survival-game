const ANIMATION_FPS = {
  'breathing-idle': 8,
  'walk':           10,
};

export class Animator {
  #sprites;
  #currentAnim  = 'breathing-idle';
  #currentFrame = 0;
  #elapsed      = 0;

  constructor(sprites) {
    this.#sprites = sprites;
  }

  get frame() {
    return this.#sprites[this.#currentAnim];
  }

  setState(anim) {
    if (anim === this.#currentAnim) return;
    this.#currentAnim  = anim;
    this.#currentFrame = 0;
    this.#elapsed      = 0;
  }

  update(dt) {
    const fps      = ANIMATION_FPS[this.#currentAnim];
    const interval = 1 / fps;

    this.#elapsed += dt;
    if (this.#elapsed >= interval) {
      this.#elapsed -= interval;
      const frames = this.#sprites[this.#currentAnim];
      const frameCount = Object.values(frames)[0].length;
      this.#currentFrame = (this.#currentFrame + 1) % frameCount;
    }
  }

  getFrame(direction) {
    return this.#sprites[this.#currentAnim][direction][this.#currentFrame];
  }
}
