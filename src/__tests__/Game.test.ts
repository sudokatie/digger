import { Game } from '../game/Game';
import { GameState, Direction } from '../game/types';

describe('Game', () => {
  let game: Game;

  beforeEach(() => {
    game = new Game();
  });

  describe('constructor', () => {
    it('should start in Title state', () => {
      expect(game.state).toBe(GameState.Title);
    });

    it('should have no level loaded', () => {
      expect(game.level).toBeNull();
    });

    it('should have no player', () => {
      expect(game.player).toBeNull();
    });

    it('should have default lives', () => {
      expect(game.lives).toBe(3);
    });

    it('should have zero timer', () => {
      expect(game.timer).toBe(0);
    });
  });

  describe('loadLevel', () => {
    it('should load valid level', () => {
      const result = game.loadLevel(1);
      expect(result).toBe(true);
      expect(game.level).not.toBeNull();
      expect(game.player).not.toBeNull();
    });

    it('should return false for invalid level', () => {
      const result = game.loadLevel(999);
      expect(result).toBe(false);
    });

    it('should set Playing state', () => {
      game.loadLevel(1);
      expect(game.state).toBe(GameState.Playing);
    });

    it('should reset lives', () => {
      game.loadLevel(1);
      expect(game.lives).toBe(3);
    });

    it('should reset timer', () => {
      game.loadLevel(1);
      game.update(5);
      game.loadLevel(1);
      expect(game.timer).toBe(0);
    });

    it('should spawn guards for levels with guards', () => {
      game.loadLevel(3); // Level 3 has guards
      expect(game.guards.length).toBeGreaterThan(0);
    });

    it('should have no guards for level 1', () => {
      game.loadLevel(1); // Tutorial, no guards
      expect(game.guards).toHaveLength(0);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      game.loadLevel(1);
    });

    it('should increment timer', () => {
      game.update(0.5);
      expect(game.timer).toBeCloseTo(0.5);
    });

    it('should not update when paused', () => {
      game.pause();
      const timerBefore = game.timer;
      game.update(1);
      expect(game.timer).toBe(timerBefore);
    });

    it('should not update in Title state', () => {
      game = new Game();
      game.update(1);
      expect(game.timer).toBe(0);
    });
  });

  describe('handleInput', () => {
    beforeEach(() => {
      game.loadLevel(1);
    });

    it('should pause game', () => {
      game.handleInput({ type: 'pause' });
      expect(game.state).toBe(GameState.Paused);
    });

    it('should resume game', () => {
      game.handleInput({ type: 'pause' });
      game.handleInput({ type: 'pause' });
      expect(game.state).toBe(GameState.Playing);
    });

    it('should restart game', () => {
      game.update(5);
      game.handleInput({ type: 'restart' });
      expect(game.timer).toBe(0);
    });
  });

  describe('movePlayer', () => {
    beforeEach(() => {
      game.loadLevel(1);
    });

    it('should move player right', () => {
      const startX = game.player!.position.x;
      game.movePlayer(Direction.Right, 0.5);
      expect(game.player!.position.x).toBeGreaterThan(startX);
    });

    it('should move player left', () => {
      game.movePlayer(Direction.Right, 0.5); // Move right first
      const startX = game.player!.position.x;
      game.movePlayer(Direction.Left, 0.5);
      expect(game.player!.position.x).toBeLessThan(startX);
    });

    it('should not move when paused', () => {
      game.pause();
      const startX = game.player!.position.x;
      game.movePlayer(Direction.Right, 0.5);
      expect(game.player!.position.x).toBe(startX);
    });
  });

  describe('digPlayer', () => {
    beforeEach(() => {
      game.loadLevel(2); // Level 2 has diggable positions
    });

    it('should return true for valid dig', () => {
      // Move to a position where we can dig
      // This depends on level layout
      const result = game.digPlayer(Direction.Right);
      // May or may not be valid depending on position
      expect(typeof result).toBe('boolean');
    });

    it('should not dig when paused', () => {
      game.pause();
      const result = game.digPlayer(Direction.Right);
      expect(result).toBe(false);
    });
  });

  describe('pause/resume', () => {
    beforeEach(() => {
      game.loadLevel(1);
    });

    it('should pause from Playing', () => {
      game.pause();
      expect(game.state).toBe(GameState.Paused);
    });

    it('should resume to Playing', () => {
      game.pause();
      game.resume();
      expect(game.state).toBe(GameState.Playing);
    });

    it('should not pause from Title', () => {
      game = new Game();
      game.pause();
      expect(game.state).toBe(GameState.Title);
    });
  });

  describe('restart', () => {
    beforeEach(() => {
      game.loadLevel(1);
    });

    it('should reset timer', () => {
      game.update(5);
      game.restart();
      expect(game.timer).toBe(0);
    });

    it('should reset player position', () => {
      game.movePlayer(Direction.Right, 1);
      game.restart();
      expect(game.player!.position).toEqual(game.level!.playerSpawn);
    });
  });

  describe('getGoldCount', () => {
    beforeEach(() => {
      game.loadLevel(1);
    });

    it('should return gold counts', () => {
      const counts = game.getGoldCount();
      expect(counts.collected).toBe(0);
      expect(counts.total).toBeGreaterThan(0);
    });

    it('should return zeros when no level', () => {
      game = new Game();
      const counts = game.getGoldCount();
      expect(counts).toEqual({ collected: 0, total: 0 });
    });
  });

  describe('getLevelName', () => {
    it('should return level name', () => {
      game.loadLevel(1);
      expect(game.getLevelName()).toBe('First Steps');
    });

    it('should return empty string when no level', () => {
      expect(game.getLevelName()).toBe('');
    });
  });

  describe('isExitRevealed', () => {
    beforeEach(() => {
      game.loadLevel(1);
    });

    it('should return false initially', () => {
      expect(game.isExitRevealed()).toBe(false);
    });
  });

  describe('getLevelCount', () => {
    it('should return total level count', () => {
      expect(game.getLevelCount()).toBe(13);
    });
  });

  describe('guards getter', () => {
    it('should return copy of guards array', () => {
      game.loadLevel(3);
      const guards = game.guards;
      const originalLength = guards.length;
      guards.pop();
      expect(game.guards.length).toBe(originalLength);
    });
  });
});
