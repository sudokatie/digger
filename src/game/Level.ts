import { TileType, Position, LevelData } from './types';
import { GRID_WIDTH, GRID_HEIGHT, TILE_CHARS } from './constants';

export class Level {
  private grid: TileType[][];
  private originalTiles: Map<string, TileType>;
  private goldPositions: Set<string>;
  private exitRevealed: boolean;
  private totalGold: number;
  
  public readonly id: number;
  public readonly name: string;
  private readonly _playerSpawn: Position;
  private readonly _guardSpawns: Position[];
  private readonly _exitPosition: Position;
  public readonly par: number;
  
  get playerSpawn(): Position {
    return { ...this._playerSpawn };
  }
  
  get guardSpawns(): Position[] {
    return this._guardSpawns.map(p => ({ ...p }));
  }
  
  get exitPosition(): Position {
    return { ...this._exitPosition };
  }

  constructor(data: LevelData) {
    this.id = data.id;
    this.name = data.name;
    this._playerSpawn = { ...data.playerSpawn };
    this._guardSpawns = data.guardSpawns.map(p => ({ ...p }));
    this._exitPosition = { ...data.exitPosition };
    this.par = data.par;
    
    this.grid = this.parseGrid(data.grid);
    this.originalTiles = new Map();
    this.goldPositions = new Set(data.goldPositions.map(p => this.posKey(p)));
    this.totalGold = data.goldPositions.length;
    this.exitRevealed = false;
  }

  private parseGrid(gridString: string): TileType[][] {
    const lines = gridString.trim().split('\n');
    const grid: TileType[][] = [];
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
      const row: TileType[] = [];
      const line = lines[y] || '';
      
      for (let x = 0; x < GRID_WIDTH; x++) {
        const char = line[x] || '.';
        const tileType = TILE_CHARS[char] ?? TileType.Empty;
        row.push(tileType);
      }
      grid.push(row);
    }
    
    return grid;
  }

  private posKey(pos: Position): string {
    return `${pos.x},${pos.y}`;
  }

  getTile(x: number, y: number): TileType {
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
      return TileType.Stone; // Treat out of bounds as solid
    }
    return this.grid[y][x];
  }

  isWalkable(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile === TileType.Brick || 
           tile === TileType.Stone || 
           tile === TileType.Ladder;
  }

  isClimbable(x: number, y: number): boolean {
    return this.getTile(x, y) === TileType.Ladder;
  }

  isHangable(x: number, y: number): boolean {
    return this.getTile(x, y) === TileType.Bar;
  }

  isDiggable(x: number, y: number): boolean {
    return this.getTile(x, y) === TileType.Brick;
  }

  hasSupport(x: number, y: number): boolean {
    // Check if there's something to stand on below
    const below = this.getTile(x, y + 1);
    if (below === TileType.Brick || 
        below === TileType.Stone || 
        below === TileType.Ladder) {
      return true;
    }
    // Standing on a ladder also counts as support
    const current = this.getTile(x, y);
    return current === TileType.Ladder;
  }

  isHole(x: number, y: number): boolean {
    return this.getTile(x, y) === TileType.Hole;
  }

  hasGold(x: number, y: number): boolean {
    return this.goldPositions.has(this.posKey({ x, y }));
  }

  digHole(x: number, y: number): boolean {
    if (!this.isDiggable(x, y)) {
      return false;
    }
    const key = this.posKey({ x, y });
    this.originalTiles.set(key, this.grid[y][x]);
    this.grid[y][x] = TileType.Hole;
    return true;
  }

  fillHole(x: number, y: number): void {
    const key = this.posKey({ x, y });
    const original = this.originalTiles.get(key);
    if (original !== undefined) {
      this.grid[y][x] = original;
      this.originalTiles.delete(key);
    }
  }

  collectGold(x: number, y: number): boolean {
    const key = this.posKey({ x, y });
    if (this.goldPositions.has(key)) {
      this.goldPositions.delete(key);
      if (this.goldPositions.size === 0) {
        this.revealExit();
      }
      return true;
    }
    return false;
  }

  addGold(x: number, y: number): void {
    const key = this.posKey({ x, y });
    if (!this.goldPositions.has(key)) {
      this.goldPositions.add(key);
      // If exit was revealed but now there's gold again, hide it
      if (this.exitRevealed && this.goldPositions.size > 0) {
        this.exitRevealed = false;
      }
    }
  }

  revealExit(): void {
    this.exitRevealed = true;
  }

  getRemainingGold(): number {
    return this.goldPositions.size;
  }

  getTotalGold(): number {
    return this.totalGold;
  }

  isExitRevealed(): boolean {
    return this.exitRevealed;
  }

  getExitPosition(): Position {
    return this.exitPosition;
  }

  getGoldPositions(): Position[] {
    return Array.from(this.goldPositions).map(key => {
      const [x, y] = key.split(',').map(Number);
      return { x, y };
    });
  }

  getGrid(): TileType[][] {
    return this.grid.map(row => [...row]);
  }
}
