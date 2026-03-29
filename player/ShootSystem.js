import { GameObject } from '../core/GameObject.js';
import { Laser }      from '../projectile/Laser.js';
import { Melee }      from '../weapon/melee/Melee.js';
import { Enemy }      from '../enemy/enemy.js';

const DIRECTION_VECTORS = {
  'north':      { x:  0, y: -1 },
  'north-east': { x:  1, y: -1 },
  'east':       { x:  1, y:  0 },
  'south-east': { x:  1, y:  1 },
  'south':      { x:  0, y:  1 },
  'south-west': { x: -1, y:  1 },
  'west':       { x: -1, y:  0 },
  'north-west': { x: -1, y: -1 },
};

export class ShootSystem extends GameObject {
  #game;
  #player;
  #input;
  #selector;
  #cooldown        = 0;
  #autoShoot       = false;
  #activeLaser     = null;
  #meleeFlash      = 0;
  #meleeFlashTotal = 0;
  #reloadTimer     = 0;
  #targetIndicator = null;

  constructor(game, player, input, selector) {
    super();
    this.#game     = game;
    this.#player   = player;
    this.#input    = input;
    this.#selector = selector;
  }

  get autoShoot()                { return this.#autoShoot; }
  set targetIndicator(ti)        { this.#targetIndicator = ti; }

  toggleAutoShoot() {
    this.#autoShoot = !this.#autoShoot;
    return this.#autoShoot;
  }

  reload() {
    const weapon = this.#player.activeWeapon;
    if (!weapon?.reloadTime) return;
    if (this.#reloadTimer > 0) return;
    if (weapon.currentMagazine >= weapon.magazine) return;
    this.#reloadTimer = weapon.reloadTime;
  }

  update(dt) {
    const selectorWeapon = this.#selector.activeWeapon;
    const activeWeapon   = this.#player.activeWeapon;
    const hasEnemy       = this.#game.getEntities(Enemy).length > 0;
    const shouldShoot    = this.#input.shootHeld || (this.#autoShoot && hasEnemy);

    if (selectorWeapon === 'laser') {
      this.#updateLaser(shouldShoot);
    } else if (activeWeapon instanceof Melee) {
      this.#killLaser();
      this.#updateMelee(dt, shouldShoot);
    } else {
      this.#killLaser();
      this.#updateGun(dt, shouldShoot);
    }

    if (this.#meleeFlash > 0) this.#meleeFlash -= dt;
    super.update(dt);
  }

  draw(ctx) {
    if (this.#meleeFlash <= 0) return;

    const player  = this.#player;
    const weapon  = player.activeWeapon;
    if (!(weapon instanceof Melee)) return;

    const progress = this.#meleeFlash / this.#meleeFlashTotal;
    const alpha    = progress * 0.45;
    const dir      = DIRECTION_VECTORS[player.facing] ?? DIRECTION_VECTORS['south'];
    const angle    = Math.atan2(dir.y, dir.x);
    const spread   = Math.PI / 3; // 60° half-angle = 120° total cone

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = '#f39c12';
    ctx.shadowColor = '#f39c12';
    ctx.shadowBlur  = 18;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.arc(player.x, player.y, weapon.range, angle - spread, angle + spread);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    super.draw(ctx);
  }

  get reloading() { return this.#reloadTimer > 0; }

  #updateGun(dt, shouldShoot) {
    if (this.#cooldown > 0) this.#cooldown -= dt;

    const player = this.#player;
    const weapon = player.activeWeapon;
    if (!weapon) return;

    // Reload tick
    if (this.#reloadTimer > 0) {
      this.#reloadTimer -= dt;
      if (this.#reloadTimer <= 0) {
        const needed = weapon.magazine - weapon.currentMagazine;
        const refill = player.infiniteAmmo ? needed : Math.min(needed, weapon.ammo);
        weapon.ammo            -= player.infiniteAmmo ? 0 : refill;
        weapon.currentMagazine += refill;
      }
      return;
    }

    if (this.#cooldown > 0 || !shouldShoot) return;

    const canvasTarget = this.#input.canvasShootTarget;
    const activeTarget = canvasTarget ?? (this.#targetIndicator?.target ?? null);
    const dir          = DIRECTION_VECTORS[player.facing] ?? DIRECTION_VECTORS['south'];
    const target       = activeTarget ?? { x: player.x + dir.x * 100, y: player.y + dir.y * 100 };

    if (weapon.projectileSpeed === -1) {
      this.#hitscan(player, weapon, target);
    } else {
      this.#game.add(new weapon.projectile(
        player.x, player.y, target, this.#game,
        { velocity: weapon.projectileSpeed, damage: weapon.damage, range: weapon.range },
      ));
    }
    this.#cooldown = weapon.fireRate;

    if (!player.infiniteAmmo) weapon.currentMagazine--;
    if (weapon.currentMagazine <= 0) this.#reloadTimer = weapon.reloadTime;
  }

  #updateMelee(dt, shouldShoot) {
    if (this.#cooldown > 0) this.#cooldown -= dt;
    if (this.#cooldown > 0 || !shouldShoot) return;

    const player     = this.#player;
    const weapon     = player.activeWeapon;
    const activeTarget = this.#targetIndicator?.target ?? null;
    const dir          = DIRECTION_VECTORS[player.facing] ?? DIRECTION_VECTORS['south'];
    const rawNx        = activeTarget ? activeTarget.x - player.x : dir.x;
    const rawNy        = activeTarget ? activeTarget.y - player.y : dir.y;
    const dirLen     = Math.hypot(rawNx, rawNy) || 1;
    const dirNx      = rawNx / dirLen;
    const dirNy      = rawNy / dirLen;

    for (const enemy of this.#game.getEntities(Enemy)) {
      const ex   = enemy.x - player.x;
      const ey   = enemy.y - player.y;
      const dist = Math.hypot(ex, ey);
      if (dist > weapon.range) continue;

      const dot = (ex / dist) * dirNx + (ey / dist) * dirNy;
      if (dot < 0.5) continue; // ~60° half-angle cone

      enemy.takeDamage(weapon.damage);
    }

    this.#cooldown        = weapon.attackSpeed;
    this.#meleeFlashTotal = weapon.attackSpeed * 0.35;
    this.#meleeFlash      = this.#meleeFlashTotal;
  }

  #updateLaser(shouldShoot) {
    if (shouldShoot) {
      if (!this.#activeLaser || this.#activeLaser.dead) {
        this.#activeLaser = new Laser(this.#player, this.#game);
        this.#game.add(this.#activeLaser);
      }
    } else {
      this.#killLaser();
    }
  }

  #killLaser() {
    if (this.#activeLaser) {
      this.#activeLaser.dead = true;
      this.#activeLaser = null;
    }
  }

  #hitscan(player, weapon, target) {
    const dx      = target.x - player.x;
    const dy      = target.y - player.y;
    const len     = Math.hypot(dx, dy) || 1;
    const nx      = dx / len;
    const ny      = dy / len;
    const maxDist = weapon.range === -1
      ? Math.max(this.#game.canvas.width, this.#game.canvas.height) * 2
      : weapon.range;

    let firstEnemy = null;
    let firstT     = Infinity;

    for (const enemy of this.#game.getEntities(Enemy)) {
      const ex = enemy.x - player.x;
      const ey = enemy.y - player.y;
      const t  = ex * nx + ey * ny;
      if (t < 0 || t > maxDist) continue;
      const perpX = ex - t * nx;
      const perpY = ey - t * ny;
      if (Math.hypot(perpX, perpY) < enemy.width / 2 && t < firstT) {
        firstT     = t;
        firstEnemy = enemy;
      }
    }

    if (firstEnemy) firstEnemy.takeDamage(weapon.damage);
  }
}
