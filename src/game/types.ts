// Tile types in the level grid
export enum TileType {
  Empty = 0,
  Brick = 1,
  Stone = 2,
  Ladder = 3,
  Bar = 4,
  Gold = 5,
  Exit = 6,
  Hole = 7,
}

// Player state machine
export enum PlayerState {
  Idle = 'idle',
  Running = 'running',
  Climbing = 'climbing',
  Hanging = 'hanging',
  Falling = 'falling',
  Digging = 'digging',
  Dead = 'dead',
}

// Guard state machine
export enum GuardState {
  Idle = 'idle',
  Running = 'running',
  Climbing = 'climbing',
  Hanging = 'hanging',
  Falling = 'falling',
  Trapped = 'trapped',
  Dead = 'dead',
}

// Overall game state
export enum GameState {
  Title = 'title',
  Playing = 'playing',
  Paused = 'paused',
  Win = 'win',
  Lose = 'lose',
}

// Movement direction
export enum Direction {
  None = 'none',
  Left = 'left',
  Right = 'right',
  Up = 'up',
  Down = 'down',
}

// Position in grid or pixel coordinates
export interface Position {
  x: number;
  y: number;
}

// Level data structure
export interface LevelData {
  id: number;
  name: string;
  grid: string;  // String representation to be parsed
  playerSpawn: Position;
  guardSpawns: Position[];
  goldPositions: Position[];
  exitPosition: Position;
  par: number;  // Par time in seconds
}

// Game configuration
export interface GameConfig {
  lives: number;
  holeTimeout: number;
  holeWarning: number;
  guardStuckTime: number;
  guardRespawnTime: number;
  digDuration: number;
}

// Input action types
export type InputAction =
  | { type: 'move'; direction: Direction }
  | { type: 'dig'; direction: Direction }
  | { type: 'pause' }
  | { type: 'restart' };

// Bounding box for collision detection
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
