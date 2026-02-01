import { findPath, heuristic, getNeighbors } from '../game/Pathfinding';
import { Level } from '../game/Level';
import { LevelData } from '../game/types';

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
....H.......................
....H.......................
############################
############################
############################
`.trim(),
  playerSpawn: { x: 4, y: 12 },
  guardSpawns: [],
  goldPositions: [],
  exitPosition: { x: 15, y: 12 },
  par: 30,
};

const levelWithObstacles: LevelData = {
  id: 2,
  name: 'Obstacle Level',
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
....H.....X.................
....H.....X.................
######X#####################
############################
############################
`.trim(),
  playerSpawn: { x: 4, y: 12 },
  guardSpawns: [],
  goldPositions: [],
  exitPosition: { x: 15, y: 12 },
  par: 30,
};

describe('Pathfinding', () => {
  describe('heuristic', () => {
    it('should calculate Manhattan distance', () => {
      expect(heuristic({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(7);
    });

    it('should return 0 for same position', () => {
      expect(heuristic({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
    });

    it('should be symmetric', () => {
      const a = { x: 1, y: 2 };
      const b = { x: 5, y: 8 };
      expect(heuristic(a, b)).toBe(heuristic(b, a));
    });
  });

  describe('findPath', () => {
    let level: Level;

    beforeEach(() => {
      level = new Level(testLevelData);
    });

    it('should find direct horizontal path', () => {
      const path = findPath({ x: 2, y: 12 }, { x: 6, y: 12 }, level);
      expect(path.length).toBeGreaterThan(0);
      expect(path[path.length - 1]).toEqual({ x: 6, y: 12 });
    });

    it('should find path using ladder', () => {
      const path = findPath({ x: 4, y: 12 }, { x: 4, y: 11 }, level);
      expect(path.length).toBeGreaterThan(0);
      expect(path[path.length - 1]).toEqual({ x: 4, y: 11 });
    });

    it('should return empty path for same position', () => {
      const path = findPath({ x: 4, y: 12 }, { x: 4, y: 12 }, level);
      expect(path).toEqual([]);
    });

    it('should avoid holes', () => {
      const holes = [{ x: 5, y: 12 }];
      const path = findPath({ x: 4, y: 12 }, { x: 6, y: 12 }, level, holes);
      // Path should not go through hole at x=5
      const goesThrough = path.some(p => p.x === 5 && p.y === 12);
      expect(goesThrough).toBe(false);
    });

    it('should navigate around obstacles using ladder', () => {
      const obstacleLevel = new Level(levelWithObstacles);
      // Path from x=4 to x=8 (before the obstacle at x=10)
      const path = findPath({ x: 4, y: 12 }, { x: 8, y: 12 }, obstacleLevel);
      expect(path.length).toBeGreaterThan(0);
      expect(path[path.length - 1]).toEqual({ x: 8, y: 12 });
    });

    it('should return empty for unreachable goal', () => {
      // Goal is in solid ground
      const path = findPath({ x: 4, y: 12 }, { x: 4, y: 14 }, level);
      expect(path).toEqual([]);
    });
  });

  describe('getNeighbors', () => {
    let level: Level;

    beforeEach(() => {
      level = new Level(testLevelData);
    });

    it('should return horizontal neighbors on ground', () => {
      const neighbors = getNeighbors({ x: 5, y: 12 }, level, []);
      const hasLeft = neighbors.some(n => n.x === 4 && n.y === 12);
      const hasRight = neighbors.some(n => n.x === 6 && n.y === 12);
      expect(hasLeft).toBe(true);
      expect(hasRight).toBe(true);
    });

    it('should return vertical neighbors on ladder', () => {
      const neighbors = getNeighbors({ x: 4, y: 12 }, level, []);
      const hasUp = neighbors.some(n => n.x === 4 && n.y === 11);
      expect(hasUp).toBe(true);
    });

    it('should exclude holes from neighbors', () => {
      const holes = [{ x: 5, y: 12 }];
      const neighbors = getNeighbors({ x: 4, y: 12 }, level, holes);
      const hasHole = neighbors.some(n => n.x === 5 && n.y === 12);
      expect(hasHole).toBe(false);
    });
  });
});
