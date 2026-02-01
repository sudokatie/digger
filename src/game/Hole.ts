import { Position } from './types';
import { HOLE_TIMEOUT, HOLE_WARNING } from './constants';

export class Hole {
  private _position: Position;
  private _timer: number;
  private _warning: boolean;

  constructor(position: Position) {
    this._position = { x: position.x, y: position.y };
    this._timer = HOLE_TIMEOUT;
    this._warning = false;
  }

  get position(): Position {
    return { ...this._position };
  }

  get timer(): number {
    return this._timer;
  }

  get isWarning(): boolean {
    return this._warning;
  }

  update(dt: number): boolean {
    this._timer -= dt;
    
    // Check if warning threshold reached
    if (this._timer <= (HOLE_TIMEOUT - HOLE_WARNING) && !this._warning) {
      this._warning = true;
    }
    
    // Return true when hole should be filled
    return this._timer <= 0;
  }

  getTimeRemaining(): number {
    return Math.max(0, this._timer);
  }

  shouldWarn(): boolean {
    return this._warning;
  }
}

export class HoleManager {
  private _holes: Hole[];

  constructor() {
    this._holes = [];
  }

  get holes(): Hole[] {
    return [...this._holes];
  }

  createHole(position: Position): void {
    // Check if hole already exists at this position
    const existing = this.getHoleAt(position);
    if (!existing) {
      this._holes.push(new Hole(position));
    }
  }

  update(dt: number): Position[] {
    const filledPositions: Position[] = [];
    const remainingHoles: Hole[] = [];

    for (const hole of this._holes) {
      const filled = hole.update(dt);
      if (filled) {
        filledPositions.push(hole.position);
      } else {
        remainingHoles.push(hole);
      }
    }

    this._holes = remainingHoles;
    return filledPositions;
  }

  getHoleAt(position: Position): Hole | null {
    return this._holes.find(
      h => h.position.x === position.x && h.position.y === position.y
    ) || null;
  }

  isHole(x: number, y: number): boolean {
    return this._holes.some(h => h.position.x === x && h.position.y === y);
  }

  getHolePositions(): Position[] {
    return this._holes.map(h => h.position);
  }

  clear(): void {
    this._holes = [];
  }

  getHoleCount(): number {
    return this._holes.length;
  }
}
