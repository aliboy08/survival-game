import { EventEmitter } from './EventEmitter.js';

export class GameObject extends EventEmitter {
  // Override these in subclasses. Call super.*() to also fire registered listeners.

  init() {
    this.emit('init');
  }

  update(dt) {
    this.emit('update', dt);
  }

  draw(ctx) {
    this.emit('draw', ctx);
  }

  destroy() {
    this.emit('destroy');
  }
}
