import { Game } from './Game';
import { TileType, PlayerState, GuardState } from './types';
import { Level } from './Level';
import { Player } from './Player';
import { Guard } from './Guard';
import { Hole, HoleManager } from './Hole';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TILE_SIZE,
  CANVAS_SCALE,
  COLORS,
  GRID_WIDTH,
  GRID_HEIGHT,
} from './constants';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrame: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = ctx;
    this.animationFrame = 0;

    // Set canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.style.width = `${CANVAS_WIDTH * CANVAS_SCALE}px`;
    canvas.style.height = `${CANVAS_HEIGHT * CANVAS_SCALE}px`;
    canvas.style.imageRendering = 'pixelated';
  }

  render(game: Game): void {
    this.animationFrame++;
    this.clear();

    if (!game.level || !game.player) {
      return;
    }

    this.renderLevel(game.level, game.holeManager);
    this.renderGold(game.level);
    this.renderExit(game.level);
    this.renderPlayer(game.player);
    this.renderGuards(game.guards);
    this.renderHoles(game.holeManager);
  }

  clear(): void {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  private renderLevel(level: Level, holeManager: HoleManager): void {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const tile = level.getTile(x, y);
        
        // Skip holes (rendered separately)
        if (holeManager.isHole(x, y)) {
          continue;
        }

        const screenX = x * TILE_SIZE;
        const screenY = y * TILE_SIZE;

        switch (tile) {
          case TileType.Brick:
            this.renderBrick(screenX, screenY);
            break;
          case TileType.Stone:
            this.renderStone(screenX, screenY);
            break;
          case TileType.Ladder:
            this.renderLadder(screenX, screenY);
            break;
          case TileType.Bar:
            this.renderBar(screenX, screenY);
            break;
        }
      }
    }
  }

  private renderBrick(x: number, y: number): void {
    this.ctx.fillStyle = COLORS.brick;
    this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    
    // Add brick pattern
    this.ctx.strokeStyle = '#8b6914';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE / 2 - 1);
    this.ctx.strokeRect(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 2 - 1, TILE_SIZE / 2 - 1);
    this.ctx.strokeRect(x + 1, y + TILE_SIZE / 2, TILE_SIZE / 2 - 1, TILE_SIZE / 2 - 1);
  }

  private renderStone(x: number, y: number): void {
    this.ctx.fillStyle = COLORS.stone;
    this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    
    // Add texture
    this.ctx.strokeStyle = '#555555';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  }

  private renderLadder(x: number, y: number): void {
    this.ctx.strokeStyle = COLORS.ladder;
    this.ctx.lineWidth = 3;
    
    // Vertical rails
    const railOffset = 6;
    this.ctx.beginPath();
    this.ctx.moveTo(x + railOffset, y);
    this.ctx.lineTo(x + railOffset, y + TILE_SIZE);
    this.ctx.moveTo(x + TILE_SIZE - railOffset, y);
    this.ctx.lineTo(x + TILE_SIZE - railOffset, y + TILE_SIZE);
    this.ctx.stroke();
    
    // Rungs
    this.ctx.lineWidth = 2;
    for (let i = 4; i < TILE_SIZE; i += 6) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + railOffset, y + i);
      this.ctx.lineTo(x + TILE_SIZE - railOffset, y + i);
      this.ctx.stroke();
    }
  }

  private renderBar(x: number, y: number): void {
    this.ctx.strokeStyle = COLORS.bar;
    this.ctx.lineWidth = 4;
    
    // Horizontal bar
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + TILE_SIZE / 2);
    this.ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE / 2);
    this.ctx.stroke();
  }

  private renderGold(level: Level): void {
    const positions = level.getGoldPositions();
    
    for (const pos of positions) {
      const screenX = pos.x * TILE_SIZE;
      const screenY = pos.y * TILE_SIZE;
      
      // Gold nugget
      this.ctx.fillStyle = COLORS.gold;
      const size = TILE_SIZE * 0.6;
      const offset = (TILE_SIZE - size) / 2;
      this.ctx.fillRect(screenX + offset, screenY + offset, size, size);
      
      // Sparkle effect
      const sparkle = Math.sin(this.animationFrame * 0.1) > 0;
      if (sparkle) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(screenX + offset + 2, screenY + offset + 2, 3, 3);
      }
    }
  }

  private renderExit(level: Level): void {
    const exit = level.getExitPosition();
    const screenX = exit.x * TILE_SIZE;
    const screenY = exit.y * TILE_SIZE;
    
    if (level.isExitRevealed()) {
      // Pulsing exit
      const pulse = Math.sin(this.animationFrame * 0.05) * 0.3 + 0.7;
      this.ctx.fillStyle = COLORS.exit;
      this.ctx.globalAlpha = pulse;
      this.ctx.fillRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      this.ctx.globalAlpha = 1;
      
      // Border
      this.ctx.strokeStyle = COLORS.exit;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    } else {
      // Hidden exit - faint outline
      this.ctx.strokeStyle = '#333344';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(screenX + 4, screenY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    }
  }

  private renderPlayer(player: Player): void {
    const pos = player.position;
    const screenX = pos.x * TILE_SIZE;
    const screenY = pos.y * TILE_SIZE;
    
    this.ctx.fillStyle = COLORS.player;
    
    // Different visual based on state
    switch (player.state) {
      case PlayerState.Digging:
        // Crouched
        this.ctx.fillRect(screenX + 2, screenY + TILE_SIZE / 2, TILE_SIZE - 4, TILE_SIZE / 2 - 2);
        break;
      case PlayerState.Dead:
        // X eyes
        this.ctx.fillStyle = '#666666';
        this.ctx.fillRect(screenX + 4, screenY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        break;
      default:
        // Normal
        this.ctx.fillRect(screenX + 4, screenY + 2, TILE_SIZE - 8, TILE_SIZE - 4);
        // Face direction indicator
        const faceX = player.facing === 'left' ? screenX + 5 : screenX + TILE_SIZE - 9;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(faceX, screenY + 6, 4, 4);
    }
  }

  private renderGuards(guards: Guard[]): void {
    for (const guard of guards) {
      this.renderGuard(guard);
    }
  }

  private renderGuard(guard: Guard): void {
    const pos = guard.position;
    const screenX = pos.x * TILE_SIZE;
    const screenY = pos.y * TILE_SIZE;
    
    if (guard.isDead()) {
      return; // Don't render dead guards
    }
    
    if (guard.isTrapped()) {
      // Half height when trapped
      this.ctx.fillStyle = COLORS.guardTrapped;
      this.ctx.fillRect(screenX + 4, screenY + TILE_SIZE / 2, TILE_SIZE - 8, TILE_SIZE / 2 - 2);
    } else {
      this.ctx.fillStyle = COLORS.guard;
      this.ctx.fillRect(screenX + 4, screenY + 2, TILE_SIZE - 8, TILE_SIZE - 4);
    }
    
    // Gold indicator
    if (guard.carryingGold) {
      this.ctx.fillStyle = COLORS.gold;
      this.ctx.fillRect(screenX + TILE_SIZE - 8, screenY + 2, 6, 6);
    }
  }

  private renderHoles(holeManager: HoleManager): void {
    for (const hole of holeManager.holes) {
      this.renderHole(hole);
    }
  }

  private renderHole(hole: Hole): void {
    const pos = hole.position;
    const screenX = pos.x * TILE_SIZE;
    const screenY = pos.y * TILE_SIZE;
    
    // Dark hole
    this.ctx.fillStyle = COLORS.hole;
    this.ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
    
    // Warning flash
    if (hole.shouldWarn()) {
      const flash = Math.sin(this.animationFrame * 0.3) > 0;
      if (flash) {
        this.ctx.strokeStyle = COLORS.holeWarning;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(screenX + 1, screenY + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      }
    }
    
    // Timer indicator
    const remaining = hole.getTimeRemaining();
    const maxTime = 5; // HOLE_TIMEOUT
    const fillHeight = (remaining / maxTime) * (TILE_SIZE - 4);
    this.ctx.fillStyle = '#444444';
    this.ctx.fillRect(screenX + TILE_SIZE - 4, screenY + TILE_SIZE - 2 - fillHeight, 2, fillHeight);
  }

  tileToScreen(x: number, y: number): { x: number; y: number } {
    return {
      x: x * TILE_SIZE * CANVAS_SCALE,
      y: y * TILE_SIZE * CANVAS_SCALE,
    };
  }
}
