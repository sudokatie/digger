/**
 * @jest-environment jsdom
 */
import { Input } from '../game/Input';
import { Direction } from '../game/types';

describe('Input', () => {
  let input: Input;

  beforeEach(() => {
    input = new Input();
  });

  afterEach(() => {
    input.detach();
  });

  describe('keyboard input', () => {
    beforeEach(() => {
      input.attach();
    });

    it('should return None when no keys pressed', () => {
      expect(input.getDirection()).toBe(Direction.None);
    });

    it('should detect arrow keys', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(input.getDirection()).toBe(Direction.Up);
      
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(input.getDirection()).toBe(Direction.Down);
    });

    it('should detect WASD keys', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      expect(input.getDirection()).toBe(Direction.Up);
      
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
      expect(input.getDirection()).toBe(Direction.Down);
    });
  });

  describe('touch input', () => {
    beforeEach(() => {
      input.attach();
    });

    function createTouchEvent(type: string, x: number, y: number): TouchEvent {
      const touch = {
        clientX: x,
        clientY: y,
        identifier: 0,
        target: document.body,
      } as Touch;
      
      return new TouchEvent(type, {
        touches: type === 'touchstart' ? [touch] : [],
        changedTouches: [touch],
      });
    }

    it('should detect swipe right', () => {
      window.dispatchEvent(createTouchEvent('touchstart', 100, 100));
      window.dispatchEvent(createTouchEvent('touchend', 200, 100));
      expect(input.getDirection()).toBe(Direction.Right);
    });

    it('should detect swipe left', () => {
      window.dispatchEvent(createTouchEvent('touchstart', 200, 100));
      window.dispatchEvent(createTouchEvent('touchend', 100, 100));
      expect(input.getDirection()).toBe(Direction.Left);
    });

    it('should detect swipe up', () => {
      window.dispatchEvent(createTouchEvent('touchstart', 100, 200));
      window.dispatchEvent(createTouchEvent('touchend', 100, 100));
      expect(input.getDirection()).toBe(Direction.Up);
    });

    it('should detect swipe down', () => {
      window.dispatchEvent(createTouchEvent('touchstart', 100, 100));
      window.dispatchEvent(createTouchEvent('touchend', 100, 200));
      expect(input.getDirection()).toBe(Direction.Down);
    });
  });

  describe('attach/detach', () => {
    it('should not respond to events when detached', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(input.getDirection()).toBe(Direction.None);
    });

    it('should respond to events after attach', () => {
      input.attach();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(input.getDirection()).toBe(Direction.Up);
    });
  });
});
