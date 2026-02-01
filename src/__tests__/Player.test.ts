import { Player } from '../game/Player';
import { Level } from '../game/Level';
import { PlayerState, Direction, LevelData } from '../game/types';

// Test level with various terrain
// Row 11: bars for hanging tests (x=3-6)
// Row 12: brick at x=2, ladder at x=4, brick at x=8
// Row 13: brick at x=2 (for dig test), stone at x=6-7 (for no-dig test), rest brick
const testLevelData: LevelData = {
  id: 1,
  name: 'Test Level',
  grid: `
............................
............................
............................
............................
............................
............................
............................
............................
............................
............................
............................
...----.....................
..#.H...#...................
#####XX#####################
############################
############################
`.trim(),
  playerSpawn: { x: 4, y: 12 },
  guardSpawns: [],
  goldPositions: [],
  exitPosition: { x: 15, y: 12 },
  par: 30,
};

describe('Player', () => {
  let player: Player;
  let level: Level;

  beforeEach(() => {
    level = new Level(testLevelData);
    player = new Player({ x: 4, y: 12 });
  });

  describe('constructor', () => {
    it('should initialize at spawn position', () => {
      expect(player.position).toEqual({ x: 4, y: 12 });
    });

    it('should start in Idle state', () => {
      expect(player.state).toBe(PlayerState.Idle);
    });

    it('should face right by default', () => {
      expect(player.facing).toBe(Direction.Right);
    });

    it('should not be digging', () => {
      expect(player.isDigging()).toBe(false);
    });

    it('should not be dead', () => {
      expect(player.isDead()).toBe(false);
    });
  });

  describe('move - horizontal', () => {
    it('should move right on ground', () => {
      const startX = player.position.x;
      player.move(Direction.Right, level, 0.1);
      expect(player.position.x).toBeGreaterThan(startX);
    });

    it('should move left on ground', () => {
      const startX = player.position.x;
      player.move(Direction.Left, level, 0.1);
      expect(player.position.x).toBeLessThan(startX);
    });

    it('should update facing direction', () => {
      player.move(Direction.Left, level, 0.1);
      expect(player.facing).toBe(Direction.Left);
      player.move(Direction.Right, level, 0.1);
      expect(player.facing).toBe(Direction.Right);
    });

    it('should set Running state when moving', () => {
      player.move(Direction.Right, level, 0.1);
      expect(player.state).toBe(PlayerState.Running);
    });
  });

  describe('move - climbing', () => {
    beforeEach(() => {
      // Position player on ladder (x=4, y=12 has ladder)
      player = new Player({ x: 4, y: 12 });
    });

    it('should climb up on ladder', () => {
      const startY = player.position.y;
      player.move(Direction.Up, level, 0.1);
      expect(player.position.y).toBeLessThan(startY);
    });

    it('should climb down on ladder', () => {
      player = new Player({ x: 4, y: 11 }); // Start higher
      const startY = player.position.y;
      player.move(Direction.Down, level, 0.1);
      expect(player.position.y).toBeGreaterThan(startY);
    });

    it('should set Climbing state', () => {
      player.move(Direction.Up, level, 0.1);
      expect(player.state).toBe(PlayerState.Climbing);
    });
  });

  describe('move - hanging', () => {
    beforeEach(() => {
      // Position player on bar (row 11 has bars at x=3-6)
      player = new Player({ x: 4, y: 11 });
    });

    it('should set Hanging state on bar', () => {
      player.move(Direction.Right, level, 0.1);
      expect(player.state).toBe(PlayerState.Hanging);
    });

    it('should move along bar', () => {
      const startX = player.position.x;
      player.move(Direction.Right, level, 0.1);
      expect(player.position.x).toBeGreaterThan(startX);
    });
  });

  describe('move - falling', () => {
    beforeEach(() => {
      // Position in empty space (should fall)
      player = new Player({ x: 10, y: 10 });
    });

    it('should fall when no support', () => {
      const startY = player.position.y;
      player.move(Direction.None, level, 0.1);
      expect(player.position.y).toBeGreaterThan(startY);
    });

    it('should set Falling state', () => {
      player.move(Direction.None, level, 0.1);
      expect(player.state).toBe(PlayerState.Falling);
    });
  });

  describe('move - idle', () => {
    it('should set Idle state when not moving', () => {
      player.move(Direction.Right, level, 0.1);
      expect(player.state).toBe(PlayerState.Running);
      player.move(Direction.None, level, 0.1);
      expect(player.state).toBe(PlayerState.Idle);
    });
  });

  describe('move - boundaries', () => {
    it('should not move past left edge', () => {
      player = new Player({ x: 0, y: 12 });
      player.move(Direction.Left, level, 1);
      expect(player.position.x).toBeGreaterThanOrEqual(0);
    });

    it('should not move past right edge', () => {
      player = new Player({ x: 27, y: 12 });
      player.move(Direction.Right, level, 1);
      expect(player.position.x).toBeLessThanOrEqual(27);
    });
  });

  describe('canDig', () => {
    beforeEach(() => {
      // Position player above brick (x=2 has brick at y=12)
      player = new Player({ x: 3, y: 12 });
    });

    it('should return true when brick is diggable', () => {
      expect(player.canDig(Direction.Left, level)).toBe(true);
    });

    it('should return false when not brick', () => {
      // Position at x=5, digging right targets x=6 at y=13 which is stone (X)
      player = new Player({ x: 5, y: 12 });
      expect(player.canDig(Direction.Right, level)).toBe(false);
    });

    it('should return false when falling', () => {
      player = new Player({ x: 10, y: 10 });
      player.move(Direction.None, level, 0.01); // Start falling
      expect(player.canDig(Direction.Left, level)).toBe(false);
    });

    it('should return false when dead', () => {
      player.die();
      expect(player.canDig(Direction.Left, level)).toBe(false);
    });

    it('should return false for up/down directions', () => {
      expect(player.canDig(Direction.Up, level)).toBe(false);
      expect(player.canDig(Direction.Down, level)).toBe(false);
    });
  });

  describe('startDig', () => {
    beforeEach(() => {
      player = new Player({ x: 3, y: 12 });
    });

    it('should start digging when valid', () => {
      expect(player.startDig(Direction.Left, level)).toBe(true);
      expect(player.isDigging()).toBe(true);
    });

    it('should return false when invalid', () => {
      // Position at x=5, digging right targets stone at x=6
      player = new Player({ x: 5, y: 12 });
      expect(player.startDig(Direction.Right, level)).toBe(false);
    });

    it('should set Digging state', () => {
      player.startDig(Direction.Left, level);
      expect(player.state).toBe(PlayerState.Digging);
    });

    it('should update facing direction', () => {
      player.startDig(Direction.Left, level);
      expect(player.facing).toBe(Direction.Left);
    });
  });

  describe('updateDig', () => {
    beforeEach(() => {
      player = new Player({ x: 3, y: 12 });
      player.startDig(Direction.Left, level);
    });

    it('should return null while digging', () => {
      expect(player.updateDig(0.1)).toBeNull();
    });

    it('should return hole position when complete', () => {
      const result = player.updateDig(0.5); // DIG_DURATION is 0.3
      expect(result).toEqual({ x: 2, y: 13 });
    });

    it('should reset state after completion', () => {
      player.updateDig(0.5);
      expect(player.state).toBe(PlayerState.Idle);
      expect(player.isDigging()).toBe(false);
    });

    it('should return null when not digging', () => {
      player = new Player({ x: 4, y: 12 });
      expect(player.updateDig(0.5)).toBeNull();
    });
  });

  describe('die', () => {
    it('should set Dead state', () => {
      player.die();
      expect(player.state).toBe(PlayerState.Dead);
      expect(player.isDead()).toBe(true);
    });

    it('should prevent movement when dead', () => {
      player.die();
      const startX = player.position.x;
      player.move(Direction.Right, level, 0.1);
      expect(player.position.x).toBe(startX);
    });
  });

  describe('respawn', () => {
    it('should reset position', () => {
      player.die();
      player.respawn({ x: 10, y: 10 });
      expect(player.position).toEqual({ x: 10, y: 10 });
    });

    it('should reset state to Idle', () => {
      player.die();
      player.respawn({ x: 10, y: 10 });
      expect(player.state).toBe(PlayerState.Idle);
    });

    it('should reset facing to Right', () => {
      player.move(Direction.Left, level, 0.1);
      player.die();
      player.respawn({ x: 10, y: 10 });
      expect(player.facing).toBe(Direction.Right);
    });
  });

  describe('getBoundingBox', () => {
    it('should return correct bounding box', () => {
      const box = player.getBoundingBox();
      expect(box).toHaveProperty('x');
      expect(box).toHaveProperty('y');
      expect(box).toHaveProperty('width');
      expect(box).toHaveProperty('height');
      expect(box.width).toBe(24); // TILE_SIZE
      expect(box.height).toBe(24);
    });
  });

  describe('getGridPosition', () => {
    it('should return floored grid position', () => {
      player = new Player({ x: 4.7, y: 12.3 });
      expect(player.getGridPosition()).toEqual({ x: 4, y: 12 });
    });
  });
});
