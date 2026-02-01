import { Level } from '../game/Level';
import { TileType, LevelData } from '../game/types';

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
............................
..#.H.X.-...................
############################
############################
############################
`.trim(),
  playerSpawn: { x: 1, y: 13 },
  guardSpawns: [{ x: 10, y: 12 }],
  goldPositions: [{ x: 5, y: 12 }, { x: 8, y: 12 }],
  exitPosition: { x: 15, y: 12 },
  par: 30,
};

describe('Level', () => {
  let level: Level;

  beforeEach(() => {
    level = new Level(testLevelData);
  });

  describe('constructor', () => {
    it('should parse level data correctly', () => {
      expect(level.id).toBe(1);
      expect(level.name).toBe('Test Level');
      expect(level.playerSpawn).toEqual({ x: 1, y: 13 });
      expect(level.par).toBe(30);
    });

    it('should copy spawn positions', () => {
      const spawn = level.playerSpawn;
      spawn.x = 999;
      expect(level.playerSpawn.x).toBe(1);
    });
  });

  describe('getTile', () => {
    it('should return correct tile types', () => {
      // Row 12: ..#.H.X.-.
      expect(level.getTile(0, 12)).toBe(TileType.Empty);
      expect(level.getTile(2, 12)).toBe(TileType.Brick);
      expect(level.getTile(4, 12)).toBe(TileType.Ladder);
      expect(level.getTile(6, 12)).toBe(TileType.Stone);
      expect(level.getTile(8, 12)).toBe(TileType.Bar);
    });

    it('should return Stone for out of bounds', () => {
      expect(level.getTile(-1, 0)).toBe(TileType.Stone);
      expect(level.getTile(100, 0)).toBe(TileType.Stone);
      expect(level.getTile(0, -1)).toBe(TileType.Stone);
      expect(level.getTile(0, 100)).toBe(TileType.Stone);
    });
  });

  describe('isWalkable', () => {
    it('should return true for brick', () => {
      expect(level.isWalkable(2, 12)).toBe(true);
    });

    it('should return true for stone', () => {
      expect(level.isWalkable(6, 12)).toBe(true);
    });

    it('should return true for ladder', () => {
      expect(level.isWalkable(4, 12)).toBe(true);
    });

    it('should return false for empty', () => {
      expect(level.isWalkable(0, 12)).toBe(false);
    });

    it('should return false for bar', () => {
      expect(level.isWalkable(8, 12)).toBe(false);
    });
  });

  describe('isClimbable', () => {
    it('should return true only for ladder', () => {
      expect(level.isClimbable(4, 12)).toBe(true);
      expect(level.isClimbable(2, 12)).toBe(false);
      expect(level.isClimbable(6, 12)).toBe(false);
    });
  });

  describe('isHangable', () => {
    it('should return true only for bar', () => {
      expect(level.isHangable(8, 12)).toBe(true);
      expect(level.isHangable(2, 12)).toBe(false);
      expect(level.isHangable(4, 12)).toBe(false);
    });
  });

  describe('isDiggable', () => {
    it('should return true only for brick', () => {
      expect(level.isDiggable(2, 12)).toBe(true);
      expect(level.isDiggable(6, 12)).toBe(false);
      expect(level.isDiggable(4, 12)).toBe(false);
    });
  });

  describe('hasSupport', () => {
    it('should return true when brick below', () => {
      // Row 13 and 14 are all brick
      expect(level.hasSupport(0, 12)).toBe(true);
    });

    it('should return true when stone below', () => {
      expect(level.hasSupport(0, 13)).toBe(true);
    });

    it('should return true when on ladder', () => {
      expect(level.hasSupport(4, 12)).toBe(true);
    });

    it('should return false when empty below and not on ladder', () => {
      expect(level.hasSupport(0, 5)).toBe(false);
    });
  });

  describe('digHole', () => {
    it('should create hole in brick tile', () => {
      expect(level.digHole(2, 12)).toBe(true);
      expect(level.getTile(2, 12)).toBe(TileType.Hole);
    });

    it('should return false for non-brick tile', () => {
      expect(level.digHole(6, 12)).toBe(false);
      expect(level.getTile(6, 12)).toBe(TileType.Stone);
    });

    it('should store original tile type', () => {
      level.digHole(2, 12);
      level.fillHole(2, 12);
      expect(level.getTile(2, 12)).toBe(TileType.Brick);
    });
  });

  describe('fillHole', () => {
    it('should restore original tile', () => {
      level.digHole(2, 12);
      expect(level.getTile(2, 12)).toBe(TileType.Hole);
      level.fillHole(2, 12);
      expect(level.getTile(2, 12)).toBe(TileType.Brick);
    });

    it('should do nothing for non-hole tiles', () => {
      level.fillHole(6, 12);
      expect(level.getTile(6, 12)).toBe(TileType.Stone);
    });
  });

  describe('gold collection', () => {
    it('should track gold positions', () => {
      expect(level.hasGold(5, 12)).toBe(true);
      expect(level.hasGold(8, 12)).toBe(true);
      expect(level.hasGold(0, 0)).toBe(false);
    });

    it('should collect gold and reduce count', () => {
      expect(level.getRemainingGold()).toBe(2);
      expect(level.collectGold(5, 12)).toBe(true);
      expect(level.getRemainingGold()).toBe(1);
      expect(level.hasGold(5, 12)).toBe(false);
    });

    it('should return false when collecting non-existent gold', () => {
      expect(level.collectGold(0, 0)).toBe(false);
    });

    it('should reveal exit when all gold collected', () => {
      expect(level.isExitRevealed()).toBe(false);
      level.collectGold(5, 12);
      expect(level.isExitRevealed()).toBe(false);
      level.collectGold(8, 12);
      expect(level.isExitRevealed()).toBe(true);
    });
  });

  describe('exit', () => {
    it('should return exit position', () => {
      expect(level.getExitPosition()).toEqual({ x: 15, y: 12 });
    });

    it('should initially be hidden', () => {
      expect(level.isExitRevealed()).toBe(false);
    });

    it('should be revealed manually', () => {
      level.revealExit();
      expect(level.isExitRevealed()).toBe(true);
    });
  });

  describe('getGoldPositions', () => {
    it('should return all gold positions', () => {
      const positions = level.getGoldPositions();
      expect(positions).toHaveLength(2);
      expect(positions).toContainEqual({ x: 5, y: 12 });
      expect(positions).toContainEqual({ x: 8, y: 12 });
    });

    it('should update when gold is collected', () => {
      level.collectGold(5, 12);
      const positions = level.getGoldPositions();
      expect(positions).toHaveLength(1);
      expect(positions).toContainEqual({ x: 8, y: 12 });
    });
  });

  describe('getTotalGold', () => {
    it('should return initial gold count', () => {
      expect(level.getTotalGold()).toBe(2);
    });

    it('should not change when gold is collected', () => {
      level.collectGold(5, 12);
      expect(level.getTotalGold()).toBe(2);
    });
  });
});
