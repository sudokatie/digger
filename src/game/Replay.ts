import { InputAction, Direction } from './types';

/**
 * A single recorded input with timestamp
 */
export interface ReplayFrame {
  time: number;  // ms since replay start
  action: InputAction;
}

/**
 * Complete replay data for a level attempt
 */
export interface ReplayData {
  version: number;
  levelId: number;
  timestamp: number;  // Unix timestamp when recorded
  duration: number;   // Total replay duration in ms
  frames: ReplayFrame[];
  completed: boolean;
  score?: number;
}

/**
 * Encodes an InputAction to a compact string format
 * Format: type:direction (e.g., "m:l" for move left)
 */
function encodeAction(action: InputAction): string {
  switch (action.type) {
    case 'move':
      const moveDir = action.direction === Direction.Left ? 'l' :
                      action.direction === Direction.Right ? 'r' :
                      action.direction === Direction.Up ? 'u' :
                      action.direction === Direction.Down ? 'd' : 'n';
      return `m:${moveDir}`;
    case 'dig':
      const digDir = action.direction === Direction.Left ? 'l' : 'r';
      return `d:${digDir}`;
    case 'pause':
      return 'p';
    case 'restart':
      return 'x';
    default:
      return '';
  }
}

/**
 * Decodes a compact string back to InputAction
 */
function decodeAction(str: string): InputAction | null {
  if (str === 'p') return { type: 'pause' };
  if (str === 'x') return { type: 'restart' };
  
  const [type, dir] = str.split(':');
  
  if (type === 'm') {
    const direction = dir === 'l' ? Direction.Left :
                      dir === 'r' ? Direction.Right :
                      dir === 'u' ? Direction.Up :
                      dir === 'd' ? Direction.Down : Direction.None;
    return { type: 'move', direction };
  }
  
  if (type === 'd') {
    const direction = dir === 'l' ? Direction.Left : Direction.Right;
    return { type: 'dig', direction };
  }
  
  return null;
}

/**
 * Replay recorder and player
 */
export class Replay {
  private _frames: ReplayFrame[] = [];
  private _startTime: number = 0;
  private _isRecording: boolean = false;
  private _isPlaying: boolean = false;
  private _playbackIndex: number = 0;
  private _playbackStartTime: number = 0;
  private _levelId: number = 0;

  /**
   * Start recording inputs for a level
   */
  startRecording(levelId: number): void {
    this._frames = [];
    this._startTime = Date.now();
    this._isRecording = true;
    this._isPlaying = false;
    this._levelId = levelId;
  }

  /**
   * Record an input action with current timestamp
   */
  recordInput(action: InputAction): void {
    if (!this._isRecording) return;
    
    // Don't record pause/restart in replays
    if (action.type === 'pause' || action.type === 'restart') return;
    
    this._frames.push({
      time: Date.now() - this._startTime,
      action,
    });
  }

  /**
   * Stop recording and return the replay data
   */
  stopRecording(completed: boolean, score?: number): ReplayData {
    this._isRecording = false;
    
    return {
      version: 1,
      levelId: this._levelId,
      timestamp: this._startTime,
      duration: Date.now() - this._startTime,
      frames: [...this._frames],
      completed,
      score,
    };
  }

  /**
   * Check if currently recording
   */
  get isRecording(): boolean {
    return this._isRecording;
  }

  /**
   * Start playback of a replay
   */
  startPlayback(data: ReplayData): void {
    this._frames = [...data.frames];
    this._playbackIndex = 0;
    this._playbackStartTime = Date.now();
    this._isPlaying = true;
    this._isRecording = false;
    this._levelId = data.levelId;
  }

  /**
   * Get next action if its time has come
   * Returns null if no action ready or playback complete
   */
  getNextAction(): InputAction | null {
    if (!this._isPlaying || this._playbackIndex >= this._frames.length) {
      return null;
    }

    const elapsed = Date.now() - this._playbackStartTime;
    const frame = this._frames[this._playbackIndex];

    if (elapsed >= frame.time) {
      this._playbackIndex++;
      return frame.action;
    }

    return null;
  }

  /**
   * Check if playback is complete
   */
  get isPlaybackComplete(): boolean {
    return this._isPlaying && this._playbackIndex >= this._frames.length;
  }

  /**
   * Check if currently playing back
   */
  get isPlaying(): boolean {
    return this._isPlaying;
  }

  /**
   * Stop playback
   */
  stopPlayback(): void {
    this._isPlaying = false;
    this._playbackIndex = 0;
  }

  /**
   * Get playback progress (0-1)
   */
  get playbackProgress(): number {
    if (!this._isPlaying || this._frames.length === 0) return 0;
    return this._playbackIndex / this._frames.length;
  }

  /**
   * Encode replay data to a shareable string
   * Format: version|levelId|timestamp|duration|completed|score|frames
   * Frames: time,action;time,action;...
   */
  static encode(data: ReplayData): string {
    const framesStr = data.frames
      .map(f => `${f.time},${encodeAction(f.action)}`)
      .join(';');
    
    const parts = [
      data.version,
      data.levelId,
      data.timestamp,
      data.duration,
      data.completed ? 1 : 0,
      data.score ?? 0,
      framesStr,
    ];
    
    return btoa(parts.join('|'));
  }

  /**
   * Decode a replay string back to ReplayData
   */
  static decode(encoded: string): ReplayData | null {
    try {
      const decoded = atob(encoded);
      const parts = decoded.split('|');
      
      if (parts.length < 7) return null;
      
      const [version, levelId, timestamp, duration, completed, score, framesStr] = parts;
      
      const frames: ReplayFrame[] = framesStr
        .split(';')
        .filter(f => f.length > 0)
        .map(f => {
          const [time, actionStr] = f.split(',');
          const action = decodeAction(actionStr);
          if (!action) return null;
          return { time: parseInt(time, 10), action };
        })
        .filter((f): f is ReplayFrame => f !== null);
      
      return {
        version: parseInt(version, 10),
        levelId: parseInt(levelId, 10),
        timestamp: parseInt(timestamp, 10),
        duration: parseInt(duration, 10),
        frames,
        completed: completed === '1',
        score: parseInt(score, 10) || undefined,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get replay statistics
   */
  static getStats(data: ReplayData): {
    totalInputs: number;
    inputsPerSecond: number;
    moveCount: number;
    digCount: number;
  } {
    let moveCount = 0;
    let digCount = 0;
    
    for (const frame of data.frames) {
      if (frame.action.type === 'move') moveCount++;
      if (frame.action.type === 'dig') digCount++;
    }
    
    const durationSec = data.duration / 1000;
    
    return {
      totalInputs: data.frames.length,
      inputsPerSecond: durationSec > 0 ? data.frames.length / durationSec : 0,
      moveCount,
      digCount,
    };
  }
}
