import { Position, PlayerState, Direction, BoundingBox } from './types';
import { Level } from './Level';
import {
  PLAYER_RUN_SPEED,
  PLAYER_CLIMB_SPEED,
  PLAYER_HANG_SPEED,
  FALL_SPEED,
  DIG_DURATION,
  TILE_SIZE,
} from './constants';

export class Player {
  private _position: Position;
  private _state: PlayerState;
  private _facing: Direction;
  private _digTimer: number;
  private _digTarget: Position | null;
  private _fallDistance: number;

  constructor(spawn: Position) {
    this._position = { x: spawn.x, y: spawn.y };
    this._state = PlayerState.Idle;
    this._facing = Direction.Right;
    this._digTimer = 0;
    this._digTarget = null;
    this._fallDistance = 0;
  }

  get position(): Position {
    return { ...this._position };
  }

  get state(): PlayerState {
    return this._state;
  }

  get facing(): Direction {
    return this._facing;
  }

  isDigging(): boolean {
    return this._state === PlayerState.Digging;
  }

  isDead(): boolean {
    return this._state === PlayerState.Dead;
  }

  move(direction: Direction, level: Level, dt: number): void {
    if (this._state === PlayerState.Dead || this._state === PlayerState.Digging) {
      return;
    }

    // Check for falling first
    if (this.shouldFall(level)) {
      this._state = PlayerState.Falling;
      this._position.y += FALL_SPEED * dt;
      this._fallDistance += FALL_SPEED * dt;
      
      // Check if landed
      const gridY = Math.floor(this._position.y);
      if (level.hasSupport(Math.floor(this._position.x), gridY)) {
        this._position.y = gridY;
        this._state = PlayerState.Idle;
        this._fallDistance = 0;
      }
      return;
    }

    // Reset fall distance when on ground
    this._fallDistance = 0;

    const gridX = Math.floor(this._position.x);
    const gridY = Math.floor(this._position.y);

    // Handle movement based on direction
    switch (direction) {
      case Direction.Left:
        this._facing = Direction.Left;
        if (this.canMoveHorizontal(gridX - 1, gridY, level)) {
          this._state = level.isHangable(gridX, gridY) ? PlayerState.Hanging : PlayerState.Running;
          this._position.x -= this.getHorizontalSpeed() * dt;
        }
        break;

      case Direction.Right:
        this._facing = Direction.Right;
        if (this.canMoveHorizontal(gridX + 1, gridY, level)) {
          this._state = level.isHangable(gridX, gridY) ? PlayerState.Hanging : PlayerState.Running;
          this._position.x += this.getHorizontalSpeed() * dt;
        }
        break;

      case Direction.Up:
        if (level.isClimbable(gridX, gridY)) {
          this._state = PlayerState.Climbing;
          this._position.y -= PLAYER_CLIMB_SPEED * dt;
        } else if (level.isHangable(gridX, gridY - 1)) {
          // Grab bar above
          this._state = PlayerState.Hanging;
          this._position.y = gridY - 1;
        }
        break;

      case Direction.Down:
        if (level.isClimbable(gridX, gridY) || level.isClimbable(gridX, gridY + 1)) {
          this._state = PlayerState.Climbing;
          this._position.y += PLAYER_CLIMB_SPEED * dt;
        } else if (this._state === PlayerState.Hanging) {
          // Drop from bar
          this._state = PlayerState.Falling;
        }
        break;

      case Direction.None:
        if (this._state !== PlayerState.Hanging) {
          this._state = PlayerState.Idle;
        }
        break;
    }

    // Clamp position to grid boundaries
    this._position.x = Math.max(0, Math.min(this._position.x, 27));
    this._position.y = Math.max(0, Math.min(this._position.y, 15));
  }

  private shouldFall(level: Level): boolean {
    const gridX = Math.floor(this._position.x);
    const gridY = Math.floor(this._position.y);

    // Don't fall if on ladder
    if (level.isClimbable(gridX, gridY)) {
      return false;
    }

    // Don't fall if hanging on bar
    if (level.isHangable(gridX, gridY) && this._state === PlayerState.Hanging) {
      return false;
    }

    // Don't fall if there's support below
    if (level.hasSupport(gridX, gridY)) {
      return false;
    }

    return true;
  }

  private canMoveHorizontal(targetX: number, gridY: number, level: Level): boolean {
    // Check bounds
    if (targetX < 0 || targetX >= 28) {
      return false;
    }

    // Can move through empty space, ladders, bars
    const targetTile = level.getTile(targetX, gridY);
    
    // Can't walk into solid walls (brick/stone blocks movement at same level)
    if (level.isWalkable(targetX, gridY) && !level.isClimbable(targetX, gridY)) {
      // It's a solid floor tile - check if it blocks us
      // We can walk ON it but not INTO it
      return true;
    }

    return true;
  }

  private getHorizontalSpeed(): number {
    return this._state === PlayerState.Hanging ? PLAYER_HANG_SPEED : PLAYER_RUN_SPEED;
  }

  canDig(direction: Direction, level: Level): boolean {
    if (this._state === PlayerState.Dead || 
        this._state === PlayerState.Digging ||
        this._state === PlayerState.Falling ||
        this._state === PlayerState.Climbing ||
        this._state === PlayerState.Hanging) {
      return false;
    }

    const gridX = Math.floor(this._position.x);
    const gridY = Math.floor(this._position.y);

    // Must have support to dig
    if (!level.hasSupport(gridX, gridY)) {
      return false;
    }

    // Determine target tile based on direction
    let targetX = gridX;
    if (direction === Direction.Left) {
      targetX = gridX - 1;
    } else if (direction === Direction.Right) {
      targetX = gridX + 1;
    } else {
      return false; // Can only dig left or right
    }

    // Target must be diggable (brick) and below current position
    const targetY = gridY + 1;
    return level.isDiggable(targetX, targetY);
  }

  startDig(direction: Direction, level: Level): boolean {
    if (!this.canDig(direction, level)) {
      return false;
    }

    const gridX = Math.floor(this._position.x);
    const gridY = Math.floor(this._position.y);

    let targetX = gridX;
    if (direction === Direction.Left) {
      targetX = gridX - 1;
      this._facing = Direction.Left;
    } else if (direction === Direction.Right) {
      targetX = gridX + 1;
      this._facing = Direction.Right;
    }

    this._state = PlayerState.Digging;
    this._digTimer = DIG_DURATION;
    this._digTarget = { x: targetX, y: gridY + 1 };

    return true;
  }

  updateDig(dt: number): Position | null {
    if (this._state !== PlayerState.Digging || !this._digTarget) {
      return null;
    }

    this._digTimer -= dt;

    if (this._digTimer <= 0) {
      const target = { ...this._digTarget };
      this._state = PlayerState.Idle;
      this._digTimer = 0;
      this._digTarget = null;
      return target;
    }

    return null;
  }

  die(): void {
    this._state = PlayerState.Dead;
  }

  respawn(position: Position): void {
    this._position = { x: position.x, y: position.y };
    this._state = PlayerState.Idle;
    this._facing = Direction.Right;
    this._digTimer = 0;
    this._digTarget = null;
    this._fallDistance = 0;
  }

  getBoundingBox(): BoundingBox {
    return {
      x: this._position.x * TILE_SIZE,
      y: this._position.y * TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE,
    };
  }

  getGridPosition(): Position {
    return {
      x: Math.floor(this._position.x),
      y: Math.floor(this._position.y),
    };
  }
}
