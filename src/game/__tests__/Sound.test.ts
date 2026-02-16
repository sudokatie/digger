import { Sound } from '../Sound';

describe('Sound System', () => {
  beforeEach(() => {
    Sound.resetContext();
    Sound.setEnabled(true);
    Sound.setVolume(0.3);
  });

  describe('singleton pattern', () => {
    it('returns the same instance', () => {
      const instance1 = Sound;
      const instance2 = Sound;
      expect(instance1).toBe(instance2);
    });
  });

  describe('enabled state', () => {
    it('can be enabled and disabled', () => {
      Sound.setEnabled(false);
      expect(Sound.isEnabled()).toBe(false);

      Sound.setEnabled(true);
      expect(Sound.isEnabled()).toBe(true);
    });

    it('does not throw when playing while disabled', () => {
      Sound.setEnabled(false);
      expect(() => Sound.play('move')).not.toThrow();
    });
  });

  describe('volume control', () => {
    it('can set and get volume', () => {
      Sound.setVolume(0.5);
      expect(Sound.getVolume()).toBe(0.5);
    });

    it('clamps volume to 0-1 range', () => {
      Sound.setVolume(-0.5);
      expect(Sound.getVolume()).toBe(0);

      Sound.setVolume(1.5);
      expect(Sound.getVolume()).toBe(1);
    });
  });

  describe('sound playback', () => {
    it('plays move sound without error', () => {
      expect(() => Sound.play('move')).not.toThrow();
    });

    it('plays dig sound without error', () => {
      expect(() => Sound.play('dig')).not.toThrow();
    });

    it('plays collect sound without error', () => {
      expect(() => Sound.play('collect')).not.toThrow();
    });

    it('plays trapGuard sound without error', () => {
      expect(() => Sound.play('trapGuard')).not.toThrow();
    });

    it('plays guardDeath sound without error', () => {
      expect(() => Sound.play('guardDeath')).not.toThrow();
    });

    it('plays guardEscape sound without error', () => {
      expect(() => Sound.play('guardEscape')).not.toThrow();
    });

    it('plays levelComplete sound without error', () => {
      expect(() => Sound.play('levelComplete')).not.toThrow();
    });

    it('plays death sound without error', () => {
      expect(() => Sound.play('death')).not.toThrow();
    });
  });
});
