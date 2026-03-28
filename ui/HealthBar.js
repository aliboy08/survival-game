const WIDTH  = 44;
const HEIGHT = 5;
const OFFSET = 10; // px above the entity

export class HealthBar {
  draw(ctx, entity) {
    const barX = Math.round(entity.x - WIDTH / 2);
    const barY = Math.round(entity.y - entity.height / 2) - OFFSET;

    // Background
    ctx.fillStyle = '#555';
    ctx.fillRect(barX, barY, WIDTH, HEIGHT);

    // Fill
    const fillWidth = Math.round((entity.hp / entity.maxHp) * WIDTH);
    ctx.fillStyle   = '#2ecc71';
    ctx.fillRect(barX, barY, fillWidth, HEIGHT);
  }
}
