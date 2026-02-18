import { Direction } from './types';

type ActionCallback = () => void;

// Minimum swipe distance in pixels
const SWIPE_THRESHOLD = 30;

export class Input {
  private keys: Set<string>;
  private callbacks: Map<string, ActionCallback>;
  private attached: boolean;

  private handleKeyDown: (e: KeyboardEvent) => void;
  private handleKeyUp: (e: KeyboardEvent) => void;

  // Touch tracking
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchStartTime: number = 0;
  private currentTouchDirection: Direction = Direction.None;

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

  private handleTouchStart = (event: TouchEvent): void => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
    event.preventDefault();
  };

  private handleTouchEnd = (event: TouchEvent): void => {
    if (event.changedTouches.length !== 1) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const deltaTime = Date.now() - this.touchStartTime;
    event.preventDefault();

    // Quick tap - restart
    if (Math.abs(deltaX) < SWIPE_THRESHOLD && Math.abs(deltaY) < SWIPE_THRESHOLD && deltaTime < 200) {
      this.callbacks.get('restart')?.();
      return;
    }

    // Swipe detection
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      this.currentTouchDirection = deltaX > SWIPE_THRESHOLD ? Direction.Right : 
                                   deltaX < -SWIPE_THRESHOLD ? Direction.Left : Direction.None;
    } else {
      // Vertical swipe
      this.currentTouchDirection = deltaY > SWIPE_THRESHOLD ? Direction.Down :
                                   deltaY < -SWIPE_THRESHOLD ? Direction.Up : Direction.None;
    }

    // Clear direction after a delay
    setTimeout(() => {
      this.currentTouchDirection = Direction.None;
    }, 150);
  };

  attach(): void {
    if (this.attached) return;
    
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
      window.addEventListener('touchstart', this.handleTouchStart, { passive: false });
      window.addEventListener('touchend', this.handleTouchEnd, { passive: false });
      this.attached = true;
    }
  }

  detach(): void {
    if (!this.attached) return;
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
      window.removeEventListener('touchstart', this.handleTouchStart);
      window.removeEventListener('touchend', this.handleTouchEnd);
      this.attached = false;
    }
    this.keys.clear();
    this.currentTouchDirection = Direction.None;
  }

  isPressed(key: string): boolean {
    return this.keys.has(key.toLowerCase());
  }

  getDirection(): Direction {
    // Check touch direction first (mobile)
    if (this.currentTouchDirection !== Direction.None) {
      return this.currentTouchDirection;
    }
    
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
