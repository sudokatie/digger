import { Hole, HoleManager } from '../game/Hole';
import { HOLE_TIMEOUT, HOLE_WARNING } from '../game/constants';

describe('Hole', () => {
  let hole: Hole;

  beforeEach(() => {
    hole = new Hole({ x: 5, y: 10 });
  });

  describe('constructor', () => {
    it('should initialize at given position', () => {
      expect(hole.position).toEqual({ x: 5, y: 10 });
    });

    it('should start with full timer', () => {
      expect(hole.timer).toBe(HOLE_TIMEOUT);
    });

    it('should not be in warning state initially', () => {
      expect(hole.isWarning).toBe(false);
    });
  });

  describe('update', () => {
    it('should decrement timer', () => {
      hole.update(1);
      expect(hole.timer).toBe(HOLE_TIMEOUT - 1);
    });

    it('should return false while timer active', () => {
      expect(hole.update(1)).toBe(false);
    });

    it('should return true when timer expires', () => {
      expect(hole.update(HOLE_TIMEOUT + 0.1)).toBe(true);
    });

    it('should set warning state at threshold', () => {
      expect(hole.isWarning).toBe(false);
      // Warning at 1 second remaining, so update for 4+ seconds
      hole.update(HOLE_WARNING + 0.1);
      expect(hole.isWarning).toBe(true);
    });
  });

  describe('getTimeRemaining', () => {
    it('should return remaining time', () => {
      hole.update(2);
      expect(hole.getTimeRemaining()).toBe(HOLE_TIMEOUT - 2);
    });

    it('should not go negative', () => {
      hole.update(10);
      expect(hole.getTimeRemaining()).toBe(0);
    });
  });

  describe('shouldWarn', () => {
    it('should return false initially', () => {
      expect(hole.shouldWarn()).toBe(false);
    });

    it('should return true after warning threshold', () => {
      // Warning at 1 second remaining, so update for 4+ seconds
      hole.update(HOLE_WARNING + 0.1);
      expect(hole.shouldWarn()).toBe(true);
    });
  });

  describe('position immutability', () => {
    it('should return copy of position', () => {
      const pos = hole.position;
      pos.x = 999;
      expect(hole.position.x).toBe(5);
    });
  });
});

describe('HoleManager', () => {
  let manager: HoleManager;

  beforeEach(() => {
    manager = new HoleManager();
  });

  describe('createHole', () => {
    it('should add hole at position', () => {
      manager.createHole({ x: 5, y: 10 });
      expect(manager.getHoleCount()).toBe(1);
    });

    it('should not duplicate holes at same position', () => {
      manager.createHole({ x: 5, y: 10 });
      manager.createHole({ x: 5, y: 10 });
      expect(manager.getHoleCount()).toBe(1);
    });

    it('should allow holes at different positions', () => {
      manager.createHole({ x: 5, y: 10 });
      manager.createHole({ x: 6, y: 10 });
      expect(manager.getHoleCount()).toBe(2);
    });
  });

  describe('update', () => {
    it('should update all holes', () => {
      manager.createHole({ x: 5, y: 10 });
      manager.createHole({ x: 6, y: 10 });
      manager.update(1);
      const holes = manager.holes;
      expect(holes[0].timer).toBe(HOLE_TIMEOUT - 1);
      expect(holes[1].timer).toBe(HOLE_TIMEOUT - 1);
    });

    it('should return filled hole positions', () => {
      manager.createHole({ x: 5, y: 10 });
      const filled = manager.update(HOLE_TIMEOUT + 0.1);
      expect(filled).toEqual([{ x: 5, y: 10 }]);
    });

    it('should remove filled holes', () => {
      manager.createHole({ x: 5, y: 10 });
      manager.update(HOLE_TIMEOUT + 0.1);
      expect(manager.getHoleCount()).toBe(0);
    });

    it('should only remove expired holes', () => {
      manager.createHole({ x: 5, y: 10 });
      manager.createHole({ x: 6, y: 10 });
      manager.update(2); // Not enough to expire
      manager.update(HOLE_TIMEOUT - 1); // First hole expires
      expect(manager.getHoleCount()).toBe(0); // Both expired
    });
  });

  describe('getHoleAt', () => {
    it('should return hole at position', () => {
      manager.createHole({ x: 5, y: 10 });
      const hole = manager.getHoleAt({ x: 5, y: 10 });
      expect(hole).not.toBeNull();
      expect(hole?.position).toEqual({ x: 5, y: 10 });
    });

    it('should return null for empty position', () => {
      const hole = manager.getHoleAt({ x: 5, y: 10 });
      expect(hole).toBeNull();
    });
  });

  describe('isHole', () => {
    it('should return true for hole position', () => {
      manager.createHole({ x: 5, y: 10 });
      expect(manager.isHole(5, 10)).toBe(true);
    });

    it('should return false for non-hole position', () => {
      expect(manager.isHole(5, 10)).toBe(false);
    });
  });

  describe('getHolePositions', () => {
    it('should return all hole positions', () => {
      manager.createHole({ x: 5, y: 10 });
      manager.createHole({ x: 6, y: 11 });
      const positions = manager.getHolePositions();
      expect(positions).toHaveLength(2);
      expect(positions).toContainEqual({ x: 5, y: 10 });
      expect(positions).toContainEqual({ x: 6, y: 11 });
    });

    it('should return empty array when no holes', () => {
      expect(manager.getHolePositions()).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should remove all holes', () => {
      manager.createHole({ x: 5, y: 10 });
      manager.createHole({ x: 6, y: 10 });
      manager.clear();
      expect(manager.getHoleCount()).toBe(0);
    });
  });

  describe('holes getter', () => {
    it('should return copy of holes array', () => {
      manager.createHole({ x: 5, y: 10 });
      const holes = manager.holes;
      holes.pop();
      expect(manager.getHoleCount()).toBe(1);
    });
  });
});
