import { Replay, ReplayData, ReplayFrame } from '../Replay';
import { Direction, InputAction } from '../types';

describe('Replay', () => {
  let replay: Replay;

  beforeEach(() => {
    replay = new Replay();
  });

  describe('recording', () => {
    it('should start recording', () => {
      replay.startRecording(1);
      expect(replay.isRecording).toBe(true);
      expect(replay.isPlaying).toBe(false);
    });

    it('should record input actions', () => {
      replay.startRecording(1);
      
      const action: InputAction = { type: 'move', direction: Direction.Left };
      replay.recordInput(action);
      
      const data = replay.stopRecording(false);
      expect(data.frames.length).toBe(1);
      expect(data.frames[0].action).toEqual(action);
    });

    it('should not record pause/restart', () => {
      replay.startRecording(1);
      
      replay.recordInput({ type: 'pause' });
      replay.recordInput({ type: 'restart' });
      replay.recordInput({ type: 'move', direction: Direction.Up });
      
      const data = replay.stopRecording(true);
      expect(data.frames.length).toBe(1);
    });

    it('should track timing', () => {
      replay.startRecording(1);
      
      replay.recordInput({ type: 'move', direction: Direction.Left });
      
      const data = replay.stopRecording(true);
      expect(data.frames[0].time).toBeGreaterThanOrEqual(0);
      expect(data.duration).toBeGreaterThanOrEqual(0);
    });

    it('should include level and completion info', () => {
      replay.startRecording(5);
      replay.recordInput({ type: 'dig', direction: Direction.Right });
      
      const data = replay.stopRecording(true, 1000);
      
      expect(data.levelId).toBe(5);
      expect(data.completed).toBe(true);
      expect(data.score).toBe(1000);
      expect(data.version).toBe(1);
    });

    it('should not record when not started', () => {
      replay.recordInput({ type: 'move', direction: Direction.Left });
      
      replay.startRecording(1);
      const data = replay.stopRecording(false);
      
      expect(data.frames.length).toBe(0);
    });
  });

  describe('playback', () => {
    const testData: ReplayData = {
      version: 1,
      levelId: 1,
      timestamp: Date.now(),
      duration: 1000,
      frames: [
        { time: 0, action: { type: 'move', direction: Direction.Left } },
        { time: 100, action: { type: 'move', direction: Direction.Right } },
        { time: 200, action: { type: 'dig', direction: Direction.Left } },
      ],
      completed: true,
    };

    it('should start playback', () => {
      replay.startPlayback(testData);
      expect(replay.isPlaying).toBe(true);
      expect(replay.isRecording).toBe(false);
    });

    it('should return first action immediately', () => {
      replay.startPlayback(testData);
      
      const action = replay.getNextAction();
      expect(action).toEqual({ type: 'move', direction: Direction.Left });
    });

    it('should not return future actions', () => {
      // Create data with future timestamps
      const futureData: ReplayData = {
        ...testData,
        frames: [
          { time: 10000, action: { type: 'move', direction: Direction.Up } },
        ],
      };
      
      replay.startPlayback(futureData);
      const action = replay.getNextAction();
      expect(action).toBeNull();
    });

    it('should detect playback complete', () => {
      const shortData: ReplayData = {
        ...testData,
        frames: [
          { time: 0, action: { type: 'move', direction: Direction.Left } },
        ],
      };
      
      replay.startPlayback(shortData);
      expect(replay.isPlaybackComplete).toBe(false);
      
      replay.getNextAction();
      expect(replay.isPlaybackComplete).toBe(true);
    });

    it('should stop playback', () => {
      replay.startPlayback(testData);
      replay.stopPlayback();
      
      expect(replay.isPlaying).toBe(false);
    });

    it('should track playback progress', () => {
      const data: ReplayData = {
        ...testData,
        frames: [
          { time: 0, action: { type: 'move', direction: Direction.Left } },
          { time: 0, action: { type: 'move', direction: Direction.Right } },
        ],
      };
      
      replay.startPlayback(data);
      expect(replay.playbackProgress).toBe(0);
      
      replay.getNextAction();
      expect(replay.playbackProgress).toBe(0.5);
      
      replay.getNextAction();
      expect(replay.playbackProgress).toBe(1);
    });
  });

  describe('encoding/decoding', () => {
    const testData: ReplayData = {
      version: 1,
      levelId: 3,
      timestamp: 1709700000000,
      duration: 5000,
      frames: [
        { time: 0, action: { type: 'move', direction: Direction.Left } },
        { time: 500, action: { type: 'move', direction: Direction.Right } },
        { time: 1000, action: { type: 'move', direction: Direction.Up } },
        { time: 1500, action: { type: 'move', direction: Direction.Down } },
        { time: 2000, action: { type: 'dig', direction: Direction.Left } },
        { time: 2500, action: { type: 'dig', direction: Direction.Right } },
      ],
      completed: true,
      score: 1500,
    };

    it('should encode replay to string', () => {
      const encoded = Replay.encode(testData);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    it('should decode encoded replay', () => {
      const encoded = Replay.encode(testData);
      const decoded = Replay.decode(encoded);
      
      expect(decoded).not.toBeNull();
      expect(decoded!.version).toBe(testData.version);
      expect(decoded!.levelId).toBe(testData.levelId);
      expect(decoded!.duration).toBe(testData.duration);
      expect(decoded!.completed).toBe(testData.completed);
      expect(decoded!.score).toBe(testData.score);
      expect(decoded!.frames.length).toBe(testData.frames.length);
    });

    it('should preserve frame data through encode/decode', () => {
      const encoded = Replay.encode(testData);
      const decoded = Replay.decode(encoded);
      
      expect(decoded!.frames[0].action).toEqual({ type: 'move', direction: Direction.Left });
      expect(decoded!.frames[4].action).toEqual({ type: 'dig', direction: Direction.Left });
    });

    it('should return null for invalid encoded data', () => {
      expect(Replay.decode('invalid')).toBeNull();
      expect(Replay.decode('')).toBeNull();
    });

    it('should handle replay with no frames', () => {
      const emptyData: ReplayData = {
        ...testData,
        frames: [],
      };
      
      const encoded = Replay.encode(emptyData);
      const decoded = Replay.decode(encoded);
      
      expect(decoded!.frames.length).toBe(0);
    });
  });

  describe('statistics', () => {
    it('should calculate stats correctly', () => {
      const data: ReplayData = {
        version: 1,
        levelId: 1,
        timestamp: Date.now(),
        duration: 2000,
        frames: [
          { time: 0, action: { type: 'move', direction: Direction.Left } },
          { time: 500, action: { type: 'move', direction: Direction.Right } },
          { time: 1000, action: { type: 'dig', direction: Direction.Left } },
          { time: 1500, action: { type: 'dig', direction: Direction.Right } },
        ],
        completed: true,
      };
      
      const stats = Replay.getStats(data);
      
      expect(stats.totalInputs).toBe(4);
      expect(stats.moveCount).toBe(2);
      expect(stats.digCount).toBe(2);
      expect(stats.inputsPerSecond).toBe(2); // 4 inputs / 2 seconds
    });

    it('should handle empty replay', () => {
      const data: ReplayData = {
        version: 1,
        levelId: 1,
        timestamp: Date.now(),
        duration: 0,
        frames: [],
        completed: false,
      };
      
      const stats = Replay.getStats(data);
      
      expect(stats.totalInputs).toBe(0);
      expect(stats.inputsPerSecond).toBe(0);
    });
  });

  describe('Direction encoding', () => {
    it('should encode all move directions', () => {
      const directions = [Direction.Left, Direction.Right, Direction.Up, Direction.Down, Direction.None];
      
      for (const direction of directions) {
        const data: ReplayData = {
          version: 1,
          levelId: 1,
          timestamp: Date.now(),
          duration: 100,
          frames: [{ time: 0, action: { type: 'move', direction } }],
          completed: true,
        };
        
        const encoded = Replay.encode(data);
        const decoded = Replay.decode(encoded);
        
        expect(decoded!.frames[0].action).toEqual({ type: 'move', direction });
      }
    });

    it('should encode dig directions', () => {
      for (const direction of [Direction.Left, Direction.Right]) {
        const data: ReplayData = {
          version: 1,
          levelId: 1,
          timestamp: Date.now(),
          duration: 100,
          frames: [{ time: 0, action: { type: 'dig', direction } }],
          completed: true,
        };
        
        const encoded = Replay.encode(data);
        const decoded = Replay.decode(encoded);
        
        expect(decoded!.frames[0].action).toEqual({ type: 'dig', direction });
      }
    });
  });
});
