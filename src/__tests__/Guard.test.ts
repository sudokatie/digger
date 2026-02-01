import { Guard } from '../game/Guard';
import { Level } from '../game/Level';
import { GuardState, Direction, LevelData } from '../game/types';

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
  playerSpawn: { x: 1, y: 12 },
  guardSpawns: [{ x: 10, y: 12 }],
  goldPositions: [],
  exitPosition: { x: 15, y: 12 },
  par: 30,
};

describe('Guard', () => {
  let guard: Guard;
  let level: Level;

  beforeEach(() => {
    level = new Level(testLevelData);
    guard = new Guard({ x: 10, y: 12 });
  });

  describe('constructor', () => {
    it('should initialize at spawn position', () => {
      expect(guard.position).toEqual({ x: 10, y: 12 });
    });

    it('should start in Idle state', () => {
      expect(guard.state).toBe(GuardState.Idle);
    });

    it('should not be trapped initially', () => {
      expect(guard.isTrapped()).toBe(false);
    });

    it('should not be dead initially', () => {
      expect(guard.isDead()).toBe(false);
    });

    it('should not carry gold by default', () => {
      expect(guard.carryingGold).toBe(false);
    });

    it('should carry gold if specified', () => {
      const guardWithGold = new Guard({ x: 10, y: 12 }, true);
      expect(guardWithGold.carryingGold).toBe(true);
    });
  });

  describe('update - chasing', () => {
    it('should move toward player', () => {
      const startX = guard.position.x;
      // Player is to the left at x=1
      guard.update({ x: 1, y: 12 }, level, [], 0.5);
      expect(guard.position.x).toBeLessThan(startX);
    });

    it('should set Running state when moving', () => {
      guard.update({ x: 1, y: 12 }, level, [], 0.5);
      expect(guard.state).toBe(GuardState.Running);
    });

    it('should update facing direction', () => {
      guard.update({ x: 1, y: 12 }, level, [], 0.1);
      expect(guard.facing).toBe(Direction.Left);
      
      guard = new Guard({ x: 1, y: 12 });
      guard.update({ x: 10, y: 12 }, level, [], 0.1);
      expect(guard.facing).toBe(Direction.Right);
    });
  });

  describe('fallInHole', () => {
    it('should set Trapped state', () => {
      guard.fallInHole();
      expect(guard.state).toBe(GuardState.Trapped);
      expect(guard.isTrapped()).toBe(true);
    });
  });

  describe('update - trapped', () => {
    beforeEach(() => {
      guard.fallInHole();
    });

    it('should count down stuck timer', () => {
      expect(guard.isTrapped()).toBe(true);
      // After 3+ seconds, should escape
      guard.update({ x: 1, y: 12 }, level, [], 3.1);
      expect(guard.isTrapped()).toBe(false);
    });

    it('should remain trapped while timer active', () => {
      guard.update({ x: 1, y: 12 }, level, [], 1);
      expect(guard.isTrapped()).toBe(true);
    });
  });

  describe('escapeHole', () => {
    it('should return to Idle state', () => {
      guard.fallInHole();
      guard.escapeHole();
      expect(guard.state).toBe(GuardState.Idle);
    });

    it('should drop gold if carrying', () => {
      const guardWithGold = new Guard({ x: 10, y: 12 }, true);
      guardWithGold.fallInHole();
      const result = guardWithGold.escapeHole();
      expect(result.droppedGold).toBe(true);
      expect(guardWithGold.carryingGold).toBe(false);
    });

    it('should not drop gold if not carrying', () => {
      guard.fallInHole();
      const result = guard.escapeHole();
      expect(result.droppedGold).toBe(false);
    });

    it('should move up one tile', () => {
      guard = new Guard({ x: 10, y: 13 });
      guard.fallInHole();
      const yBefore = guard.position.y;
      guard.escapeHole();
      expect(guard.position.y).toBe(yBefore - 1);
    });
  });

  describe('die', () => {
    it('should set Dead state', () => {
      guard.die();
      expect(guard.state).toBe(GuardState.Dead);
      expect(guard.isDead()).toBe(true);
    });

    it('should drop gold when dying', () => {
      const guardWithGold = new Guard({ x: 10, y: 12 }, true);
      guardWithGold.die();
      expect(guardWithGold.carryingGold).toBe(false);
    });
  });

  describe('respawn', () => {
    it('should reset to spawn position', () => {
      guard.update({ x: 1, y: 12 }, level, [], 1);
      guard.die();
      guard.respawn();
      expect(guard.position).toEqual({ x: 10, y: 12 });
    });

    it('should reset to Idle state', () => {
      guard.die();
      guard.respawn();
      expect(guard.state).toBe(GuardState.Idle);
    });
  });

  describe('update - dead respawn', () => {
    it('should respawn after timer', () => {
      guard.die();
      expect(guard.isDead()).toBe(true);
      // GUARD_RESPAWN_TIME is 3 seconds
      guard.update({ x: 1, y: 12 }, level, [], 3.1);
      expect(guard.isDead()).toBe(false);
      expect(guard.position).toEqual({ x: 10, y: 12 });
    });
  });

  describe('pickupGold', () => {
    it('should set carryingGold to true', () => {
      expect(guard.carryingGold).toBe(false);
      guard.pickupGold();
      expect(guard.carryingGold).toBe(true);
    });
  });

  describe('getBoundingBox', () => {
    it('should return correct bounding box', () => {
      const box = guard.getBoundingBox();
      expect(box).toHaveProperty('x');
      expect(box).toHaveProperty('y');
      expect(box.width).toBe(24);
      expect(box.height).toBe(24);
    });
  });

  describe('getGridPosition', () => {
    it('should return floored position', () => {
      expect(guard.getGridPosition()).toEqual({ x: 10, y: 12 });
    });
  });

  describe('update - hole detection', () => {
    it('should fall into hole when on hole position', () => {
      const holes = [{ x: 10, y: 12 }];
      guard.update({ x: 1, y: 12 }, level, holes, 0.1);
      expect(guard.isTrapped()).toBe(true);
    });
  });
});
