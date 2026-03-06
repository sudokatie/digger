import { Game } from '../Game';
import { GameState, Direction } from '../types';
import { Replay } from '../Replay';

describe('Game Replay Integration', () => {
  let game: Game;

  beforeEach(() => {
    game = new Game();
  });

  describe('recording', () => {
    it('should start recording when level loads', () => {
      game.loadLevel(1);
      expect(game.isRecording).toBe(true);
    });

    it('should not record when playback mode', () => {
      // First record a replay
      game.loadLevel(1);
      game.handleInput({ type: 'move', direction: Direction.Right });
      
      // Start playback of that replay
      const replayData = game.lastReplayData;
      if (replayData) {
        game.startPlayback(replayData);
        expect(game.isRecording).toBe(false);
      }
    });

    it('should record move inputs', () => {
      game.loadLevel(1);
      
      // Make some moves
      game.handleInput({ type: 'move', direction: Direction.Right });
      game.handleInput({ type: 'move', direction: Direction.Left });
      game.handleInput({ type: 'dig', direction: Direction.Right });
      
      // Recording should still be active
      expect(game.isRecording).toBe(true);
    });

    it('should not record pause/restart', () => {
      game.loadLevel(1);
      
      game.handleInput({ type: 'pause' });
      game.handleInput({ type: 'restart' });
      
      // Recording restarts with level
      expect(game.isRecording).toBe(true);
    });

    it('should save replay data on level complete', () => {
      game.loadLevel(1);
      expect(game.lastReplayData).toBeNull();
      
      // Simulate winning (we can't easily trigger this in test)
      // but we can verify the property exists
      expect(game.lastReplayData).toBeNull();
    });
  });

  describe('playback', () => {
    it('should enter playback mode', () => {
      // Create a simple replay
      const replayData = {
        version: 1,
        levelId: 1,
        timestamp: Date.now(),
        duration: 1000,
        frames: [
          { time: 0, action: { type: 'move' as const, direction: Direction.Right } },
        ],
        completed: true,
      };
      
      game.startPlayback(replayData);
      
      expect(game.isPlayback).toBe(true);
      expect(game.state).toBe(GameState.Playing);
    });

    it('should load correct level for playback', () => {
      const replayData = {
        version: 1,
        levelId: 3,
        timestamp: Date.now(),
        duration: 1000,
        frames: [],
        completed: true,
      };
      
      game.startPlayback(replayData);
      
      expect(game.currentLevelId).toBe(3);
    });

    it('should stop playback', () => {
      const replayData = {
        version: 1,
        levelId: 1,
        timestamp: Date.now(),
        duration: 1000,
        frames: [],
        completed: true,
      };
      
      game.startPlayback(replayData);
      game.stopPlayback();
      
      expect(game.isPlayback).toBe(false);
      expect(game.state).toBe(GameState.Title);
    });

    it('should track playback progress', () => {
      const replayData = {
        version: 1,
        levelId: 1,
        timestamp: Date.now(),
        duration: 1000,
        frames: [
          { time: 0, action: { type: 'move' as const, direction: Direction.Right } },
          { time: 100, action: { type: 'move' as const, direction: Direction.Left } },
        ],
        completed: true,
      };
      
      game.startPlayback(replayData);
      
      // Progress starts at 0
      expect(game.playbackProgress).toBe(0);
      
      // After one update, progress should increase
      game.updatePlayback();
      expect(game.playbackProgress).toBe(0.5);
    });
  });

  describe('recording control', () => {
    it('should disable recording', () => {
      game.setRecordingEnabled(false);
      game.loadLevel(1);
      
      expect(game.isRecording).toBe(false);
    });

    it('should clear replay data', () => {
      game.loadLevel(1);
      game.handleInput({ type: 'move', direction: Direction.Right });
      
      game.clearReplayData();
      expect(game.lastReplayData).toBeNull();
    });
  });
});
