import { Direction } from './types';

type ActionCallback = () => void;

export class Input {
  private keys: Set<string>;
  private callbacks: Map<string, ActionCallback>;
  private attached: boolean;

  private handleKeyDown: (e: KeyboardEvent) => void;
  private handleKeyUp: (e: KeyboardEvent) => void;

  constructor() {
    this.keys = new Set();
    this.callbacks = new Map();
    this.attached = false;

    this.handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Prevent default for game keys
      if (this.isGameKey(key)) {
        e.preventDefault();
      }

      this.keys.add(key);

      // Trigger action callbacks
      if (key === 'escape' || key === 'p') {
        this.callbacks.get('pause')?.();
      }
      if (key === 'r') {
        this.callbacks.get('restart')?.();
      }
    };

    this.handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      this.keys.delete(key);
    };
  }

  private isGameKey(key: string): boolean {
    const gameKeys = [
      'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
      'w', 'a', 's', 'd',
      'q', 'e', 'z', 'x',
      'escape', 'p', 'r'
    ];
    return gameKeys.includes(key);
  }

  attach(): void {
    if (this.attached) return;
    
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
      this.attached = true;
    }
  }

  detach(): void {
    if (!this.attached) return;
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
      this.attached = false;
    }
    this.keys.clear();
  }

  isPressed(key: string): boolean {
    return this.keys.has(key.toLowerCase());
  }

  getDirection(): Direction {
    // Check arrow keys and WASD
    // Priority: last direction wins if multiple pressed
    
    if (this.isPressed('arrowup') || this.isPressed('w')) {
      return Direction.Up;
    }
    if (this.isPressed('arrowdown') || this.isPressed('s')) {
      return Direction.Down;
    }
    if (this.isPressed('arrowleft') || this.isPressed('a')) {
      return Direction.Left;
    }
    if (this.isPressed('arrowright') || this.isPressed('d')) {
      return Direction.Right;
    }
    
    return Direction.None;
  }

  getDigDirection(): Direction | null {
    // Q/Z for dig left, E/X for dig right
    if (this.isPressed('q') || this.isPressed('z')) {
      return Direction.Left;
    }
    if (this.isPressed('e') || this.isPressed('x')) {
      return Direction.Right;
    }
    return null;
  }

  onAction(action: string, callback: ActionCallback): void {
    this.callbacks.set(action, callback);
  }

  clearCallbacks(): void {
    this.callbacks.clear();
  }

  isAttached(): boolean {
    return this.attached;
  }
}
