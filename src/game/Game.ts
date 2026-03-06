import { GameState, Position, Direction, InputAction } from './types';
import { Level } from './Level';
import { Player } from './Player';
import { Guard } from './Guard';
import { HoleManager } from './Hole';
import { LEVELS, getLevel } from './levels';
import { DEFAULT_CONFIG } from './constants';
import { Sound } from './Sound';
import { getDailyLevelIds } from './Daily';

export class Game {
  private _state: GameState;
  private _level: Level | null;
  private _player: Player | null;
  private _guards: Guard[];
  private _holeManager: HoleManager;
  private _lives: number;
  private _timer: number;
  private _currentLevelId: number;
  private _goldCollected: number;
  
  // Daily challenge state
  private _isDaily: boolean;
  private _score: number;
  private _dailyLevelIds: number[];
  private _dailyLevelIndex: number;
  private _totalGoldCollected: number;

  constructor() {
    this._state = GameState.Title;
    this._level = null;
    this._player = null;
    this._guards = [];
    this._holeManager = new HoleManager();
    this._lives = DEFAULT_CONFIG.lives;
    this._timer = 0;
    this._currentLevelId = 0;
    this._goldCollected = 0;
    this._isDaily = false;
    this._score = 0;
    this._dailyLevelIds = [];
    this._dailyLevelIndex = 0;
    this._totalGoldCollected = 0;
  }

  get state(): GameState {
    return this._state;
  }

  get level(): Level | null {
    return this._level;
  }

  get player(): Player | null {
    return this._player;
  }

  get guards(): Guard[] {
    return [...this._guards];
  }

  get holeManager(): HoleManager {
    return this._holeManager;
  }

  get lives(): number {
    return this._lives;
  }

  get timer(): number {
    return this._timer;
  }

  get currentLevelId(): number {
    return this._currentLevelId;
  }

  loadLevel(levelId: number): boolean {
    const levelData = getLevel(levelId);
    if (!levelData) {
      return false;
    }

    this._level = new Level(levelData);
    this._player = new Player(this._level.playerSpawn);
    this._guards = this._level.guardSpawns.map(spawn => new Guard(spawn));
    this._holeManager.clear();
    this._lives = DEFAULT_CONFIG.lives;
    this._timer = 0;
    this._currentLevelId = levelId;
    this._goldCollected = 0;
    this._state = GameState.Playing;

    return true;
  }

  update(dt: number): void {
    if (this._state !== GameState.Playing) {
      return;
    }

    if (!this._level || !this._player) {
      return;
    }

    // Update timer
    this._timer += dt;

    // Update holes and check for fills
    const filledPositions = this._holeManager.update(dt);
    for (const pos of filledPositions) {
      this._level.fillHole(pos.x, pos.y);
      
      // Check if player is in filled hole
      const playerGrid = this._player.getGridPosition();
      if (playerGrid.x === pos.x && playerGrid.y === pos.y) {
        this.onPlayerDied();
        return;
      }

      // Check if any guard is in filled hole
      for (const guard of this._guards) {
        const guardGrid = guard.getGridPosition();
        if (guardGrid.x === pos.x && guardGrid.y === pos.y) {
          // Drop gold at death position
          if (guard.carryingGold) {
            this._level.addGold(guardGrid.x, guardGrid.y);
          }
          guard.die();
          Sound.play('guardDeath');
        }
      }
    }

    // Update player dig
    const holePos = this._player.updateDig(dt);
    if (holePos) {
      this._level.digHole(holePos.x, holePos.y);
      this._holeManager.createHole(holePos);
      Sound.play('dig');
    }

    // Check gold collection
    const playerGrid = this._player.getGridPosition();
    if (this._level.hasGold(playerGrid.x, playerGrid.y)) {
      if (this._level.collectGold(playerGrid.x, playerGrid.y)) {
        this._goldCollected++;
        Sound.play('collect');
      }
    }

    // Check win condition (all gold + exit)
    if (this._level.isExitRevealed()) {
      const exit = this._level.getExitPosition();
      if (playerGrid.x === exit.x && playerGrid.y === exit.y) {
        this._state = GameState.Win;
        Sound.play('levelComplete');
        return;
      }
    }

    // Update guards
    const holePositions = this._holeManager.getHolePositions();
    for (const guard of this._guards) {
      const wasTrapped = guard.isTrapped();
      const prevPos = guard.getGridPosition();
      
      guard.update(this._player.position, this._level, holePositions, dt);

      // Check if guard just escaped hole and dropped gold
      if (wasTrapped && !guard.isTrapped()) {
        Sound.play('guardEscape');
        // Guard escaped - check if gold was dropped
        if (!guard.carryingGold) {
          // Gold was dropped at the hole position
          this._level.addGold(prevPos.x, prevPos.y);
        }
      }

      // Check guard-player collision (only if guard not trapped/dead)
      if (!guard.isTrapped() && !guard.isDead()) {
        const guardGrid = guard.getGridPosition();
        if (guardGrid.x === playerGrid.x && guardGrid.y === playerGrid.y) {
          this.onPlayerDied();
          return;
        }
      }
    }

    // Check guard-guard collision in holes (guard falls on trapped guard)
    for (let i = 0; i < this._guards.length; i++) {
      const guard1 = this._guards[i];
      if (!guard1.isTrapped()) continue;
      
      const pos1 = guard1.getGridPosition();
      for (let j = 0; j < this._guards.length; j++) {
        if (i === j) continue;
        const guard2 = this._guards[j];
        if (guard2.isDead()) continue;
        
        const pos2 = guard2.getGridPosition();
        // If another guard is at the same position as trapped guard, both die
        if (pos1.x === pos2.x && pos1.y === pos2.y) {
          // Drop gold from both if carrying
          if (guard1.carryingGold) {
            this._level.addGold(pos1.x, pos1.y);
          }
          if (guard2.carryingGold) {
            this._level.addGold(pos2.x, pos2.y);
          }
          guard1.die();
          guard2.die();
          Sound.play('guardDeath');
        }
      }
    }
  }

  handleInput(action: InputAction): void {
    if (!this._player || !this._level) {
      return;
    }

    if (action.type === 'pause') {
      if (this._state === GameState.Playing) {
        this.pause();
      } else if (this._state === GameState.Paused) {
        this.resume();
      }
      return;
    }

    if (action.type === 'restart') {
      this.restart();
      return;
    }

    if (this._state !== GameState.Playing) {
      return;
    }

    if (action.type === 'move') {
      this._player.move(action.direction, this._level, 1/60);
    } else if (action.type === 'dig') {
      this._player.startDig(action.direction, this._level);
    }
  }

  movePlayer(direction: Direction, dt: number): void {
    if (this._state !== GameState.Playing || !this._player || !this._level) {
      return;
    }
    this._player.move(direction, this._level, dt);
  }

  digPlayer(direction: Direction): boolean {
    if (this._state !== GameState.Playing || !this._player || !this._level) {
      return false;
    }
    return this._player.startDig(direction, this._level);
  }

  private onPlayerDied(): void {
    this._lives--;
    Sound.play('death');
    
    if (this._lives <= 0) {
      this._state = GameState.Lose;
    } else if (this._player && this._level) {
      // Respawn
      this._player.respawn(this._level.playerSpawn);
    }
  }

  pause(): void {
    if (this._state === GameState.Playing) {
      this._state = GameState.Paused;
    }
  }

  resume(): void {
    if (this._state === GameState.Paused) {
      this._state = GameState.Playing;
    }
  }

  restart(): void {
    if (this._currentLevelId > 0) {
      this.loadLevel(this._currentLevelId);
    }
  }

  getGoldCount(): { collected: number; total: number } {
    if (!this._level) {
      return { collected: 0, total: 0 };
    }
    return {
      collected: this._goldCollected,
      total: this._level.getTotalGold(),
    };
  }

  getLevelName(): string {
    return this._level?.name ?? '';
  }

  isExitRevealed(): boolean {
    return this._level?.isExitRevealed() ?? false;
  }

  getLevelCount(): number {
    return LEVELS.length;
  }

  toggleSound(): boolean {
    const newState = !Sound.isEnabled();
    Sound.setEnabled(newState);
    return newState;
  }

  isSoundEnabled(): boolean {
    return Sound.isEnabled();
  }

  // === Daily Challenge Methods ===

  /** Start a daily challenge run */
  startDaily(): void {
    this._isDaily = true;
    this._score = 0;
    this._totalGoldCollected = 0;
    this._dailyLevelIds = getDailyLevelIds(LEVELS.length);
    this._dailyLevelIndex = 0;
    this._lives = DEFAULT_CONFIG.lives;
    
    if (this._dailyLevelIds.length > 0) {
      this.loadLevel(this._dailyLevelIds[0]);
    }
  }

  /** Check if currently in daily mode */
  get isDaily(): boolean {
    return this._isDaily;
  }

  /** Get current score */
  get score(): number {
    return this._score;
  }

  /** Get total gold collected across all daily levels */
  get totalGoldCollected(): number {
    return this._totalGoldCollected;
  }

  /** Get current daily level index (0-based) */
  get dailyLevelIndex(): number {
    return this._dailyLevelIndex;
  }

  /** Get total number of daily levels */
  get dailyLevelCount(): number {
    return this._dailyLevelIds.length;
  }

  /** Called when a daily level is completed - advances or ends challenge */
  completeDailyLevel(): boolean {
    // Add score for this level
    const levelScore = this.calculateLevelScore();
    this._score += levelScore;
    this._totalGoldCollected += this._goldCollected;

    this._dailyLevelIndex++;

    // Check if more levels remain
    if (this._dailyLevelIndex < this._dailyLevelIds.length) {
      // Load next daily level
      const nextLevelId = this._dailyLevelIds[this._dailyLevelIndex];
      this.loadLevel(nextLevelId);
      return false; // Not finished yet
    } else {
      // Daily challenge complete
      return true;
    }
  }

  /** Calculate score for the current level */
  private calculateLevelScore(): number {
    // Score formula: gold * 100 + time bonus + lives bonus
    const goldPoints = this._goldCollected * 100;
    
    // Time bonus: faster completion = more points (max 500)
    const parTime = 60; // Base par time in seconds
    const timeBonus = Math.max(0, Math.floor((parTime - this._timer) * 10));
    const cappedTimeBonus = Math.min(500, timeBonus);
    
    // Lives bonus: 200 per remaining life
    const livesBonus = this._lives * 200;

    return goldPoints + cappedTimeBonus + livesBonus;
  }

  /** Get detailed score breakdown for display */
  getScoreBreakdown(): { gold: number; time: number; lives: number; total: number } {
    const gold = this._goldCollected * 100;
    const parTime = 60;
    const timeBonus = Math.min(500, Math.max(0, Math.floor((parTime - this._timer) * 10)));
    const lives = this._lives * 200;
    return {
      gold,
      time: timeBonus,
      lives,
      total: gold + timeBonus + lives,
    };
  }

  /** Reset daily state (call when returning to title) */
  resetDaily(): void {
    this._isDaily = false;
    this._score = 0;
    this._dailyLevelIds = [];
    this._dailyLevelIndex = 0;
    this._totalGoldCollected = 0;
  }
}
