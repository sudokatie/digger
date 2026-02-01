import { GameConfig } from './types';

// Grid dimensions
export const GRID_WIDTH = 28;
export const GRID_HEIGHT = 16;
export const TILE_SIZE = 24;
export const CANVAS_SCALE = 2;

// Canvas dimensions (pixels)
export const CANVAS_WIDTH = GRID_WIDTH * TILE_SIZE;
export const CANVAS_HEIGHT = GRID_HEIGHT * TILE_SIZE;
export const DISPLAY_WIDTH = CANVAS_WIDTH * CANVAS_SCALE;
export const DISPLAY_HEIGHT = CANVAS_HEIGHT * CANVAS_SCALE;

// Movement speeds (tiles per second)
export const PLAYER_RUN_SPEED = 4;
export const PLAYER_CLIMB_SPEED = 3;
export const PLAYER_HANG_SPEED = 3;
export const FALL_SPEED = 8;
export const GUARD_SPEED = 3;

// Timers (seconds)
export const HOLE_TIMEOUT = 5;
export const HOLE_WARNING = 4;
export const GUARD_STUCK_TIME = 3;
export const GUARD_RESPAWN_TIME = 3;
export const DIG_DURATION = 0.3;
export const GUARD_PATH_INTERVAL = 0.5;

// Default game config
export const DEFAULT_CONFIG: GameConfig = {
  lives: 3,
  holeTimeout: HOLE_TIMEOUT,
  holeWarning: HOLE_WARNING,
  guardStuckTime: GUARD_STUCK_TIME,
  guardRespawnTime: GUARD_RESPAWN_TIME,
  digDuration: DIG_DURATION,
};

// Colors (8-bit aesthetic)
export const COLORS = {
  background: '#1a1a2e',
  brick: '#b8860b',
  stone: '#696969',
  ladder: '#8b4513',
  bar: '#c0c0c0',
  player: '#00ff00',
  guard: '#ff0000',
  guardTrapped: '#aa0000',
  gold: '#ffd700',
  exit: '#00ffff',
  exitHidden: '#1a1a2e',
  hole: '#2d2d2d',
  holeWarning: '#ff4444',
  text: '#ffffff',
  hud: '#333344',
};

// Tile character encoding for level strings
export const TILE_CHARS: Record<string, number> = {
  '.': 0,  // Empty
  '#': 1,  // Brick
  'X': 2,  // Stone
  'H': 3,  // Ladder
  '-': 4,  // Bar
  '$': 5,  // Gold
  'E': 6,  // Exit
};

// Reverse mapping
export const CHAR_TILES: Record<number, string> = {
  0: '.',
  1: '#',
  2: 'X',
  3: 'H',
  4: '-',
  5: '$',
  6: 'E',
  7: 'O',  // Hole
};
