import { Position, GuardState, Direction, BoundingBox } from './types';
import { Level } from './Level';
import { findPath } from './Pathfinding';
import {
  GUARD_SPEED,
  FALL_SPEED,
  GUARD_STUCK_TIME,
  GUARD_RESPAWN_TIME,
  GUARD_PATH_INTERVAL,
  TILE_SIZE,
} from './constants';

export class Guard {
  private _position: Position;
  private _state: GuardState;
  private _spawnPosition: Position;
  private _carryingGold: boolean;
  private _stuckTimer: number;
  private _respawnTimer: number;
  private _pathTimer: number;
  private _path: Position[];
  private _facing: Direction;

  constructor(spawn: Position, carryingGold: boolean = false) {
    this._position = { x: spawn.x, y: spawn.y };
    this._spawnPosition = { x: spawn.x, y: spawn.y };
    this._state = GuardState.Idle;
    this._carryingGold = carryingGold;
    this._stuckTimer = 0;
    this._respawnTimer = 0;
    this._pathTimer = 0;
    this._path = [];
    this._facing = Direction.Left;
  }

  get position(): Position {
    return { ...this._position };
  }

  get state(): GuardState {
    return this._state;
  }

  get spawnPosition(): Position {
    return { ...this._spawnPosition };
  }

  get carryingGold(): boolean {
    return this._carryingGold;
  }

  get facing(): Direction {
    return this._facing;
  }

  isTrapped(): boolean {
    return this._state === GuardState.Trapped;
  }

  isDead(): boolean {
    return this._state === GuardState.Dead;
  }

  update(
    playerPos: Position,
    level: Level,
    holePositions: Position[],
    dt: number
  ): void {
    // Handle dead state (respawn timer)
    if (this._state === GuardState.Dead) {
      this._respawnTimer -= dt;
      if (this._respawnTimer <= 0) {
        this.respawn();
      }
      return;
    }

    // Handle trapped state
    if (this._state === GuardState.Trapped) {
      this._stuckTimer -= dt;
      if (this._stuckTimer <= 0) {
        this.escapeHole();
      }
      return;
    }

    // Check if we're in a hole
    const gridPos = this.getGridPosition();
    for (const hole of holePositions) {
      if (hole.x === gridPos.x && hole.y === gridPos.y) {
        this.fallInHole();
        return;
      }
    }

    // Check for falling
    if (this.shouldFall(level)) {
      this._state = GuardState.Falling;
      this._position.y += FALL_SPEED * dt;
      
      const newGridY = Math.floor(this._position.y);
      if (level.hasSupport(gridPos.x, newGridY)) {
        this._position.y = newGridY;
        this._state = GuardState.Idle;
      }
      return;
    }

    // Recalculate path periodically
    this._pathTimer -= dt;
    if (this._pathTimer <= 0 || this._path.length === 0) {
      this._path = findPath(gridPos, playerPos, level, holePositions);
      this._pathTimer = GUARD_PATH_INTERVAL;
    }

    // Follow path
    if (this._path.length > 0) {
      const target = this._path[0];
      const dx = target.x - this._position.x;
      const dy = target.y - this._position.y;
      
      // Move toward target
      const speed = GUARD_SPEED * dt;
      
      if (Math.abs(dx) > 0.1) {
        this._facing = dx > 0 ? Direction.Right : Direction.Left;
        this._state = GuardState.Running;
        this._position.x += Math.sign(dx) * Math.min(speed, Math.abs(dx));
      }
      
      if (Math.abs(dy) > 0.1) {
        this._state = dy < 0 ? GuardState.Climbing : GuardState.Climbing;
        this._position.y += Math.sign(dy) * Math.min(speed, Math.abs(dy));
      }
      
      // Check if reached target
      if (Math.abs(this._position.x - target.x) < 0.2 &&
          Math.abs(this._position.y - target.y) < 0.2) {
        this._position.x = target.x;
        this._position.y = target.y;
        this._path.shift();
      }
    } else {
      this._state = GuardState.Idle;
    }
  }

  private shouldFall(level: Level): boolean {
    const gridX = Math.floor(this._position.x);
    const gridY = Math.floor(this._position.y);

    if (level.isClimbable(gridX, gridY)) {
      return false;
    }

    if (level.isHangable(gridX, gridY) && this._state === GuardState.Hanging) {
      return false;
    }

    if (level.hasSupport(gridX, gridY)) {
      return false;
    }

    return true;
  }

  fallInHole(): void {
    this._state = GuardState.Trapped;
    this._stuckTimer = GUARD_STUCK_TIME;
    this._path = [];
  }

  escapeHole(): { droppedGold: boolean } {
    const hadGold = this._carryingGold;
    if (this._carryingGold) {
      this._carryingGold = false;
    }
    this._state = GuardState.Idle;
    this._stuckTimer = 0;
    // Move up one tile to escape
    this._position.y -= 1;
    return { droppedGold: hadGold };
  }

  die(): void {
    this._state = GuardState.Dead;
    this._respawnTimer = GUARD_RESPAWN_TIME;
    this._path = [];
    if (this._carryingGold) {
      this._carryingGold = false;
    }
  }

  respawn(): void {
    this._position = { ...this._spawnPosition };
    this._state = GuardState.Idle;
    this._stuckTimer = 0;
    this._respawnTimer = 0;
    this._path = [];
    this._pathTimer = 0;
  }

  pickupGold(): void {
    this._carryingGold = true;
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
