/**
 * @jest-environment jsdom
 */

import { Leaderboard } from '../Leaderboard';

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorage.clear();
    Leaderboard.resetCache();
  });

  describe('load', () => {
    it('should return empty array when no data', () => {
      expect(Leaderboard.load()).toEqual([]);
    });

    it('should load existing data', () => {
      const data = [{ name: 'Test', score: 100, level: 2, goldCollected: 10, completedAt: '2026-01-01' }];
      localStorage.setItem('digger_leaderboard', JSON.stringify(data));
      Leaderboard.resetCache();
      expect(Leaderboard.load()[0].name).toBe('Test');
    });
  });

  describe('recordScore', () => {
    it('should add new high score', () => {
      const rank = Leaderboard.recordScore('Player', 500, 3, 15);
      expect(rank).toBe(1);
      expect(Leaderboard.getTop()[0].score).toBe(500);
    });

    it('should sort by score descending', () => {
      Leaderboard.recordScore('Low', 100, 1, 5);
      Leaderboard.recordScore('High', 1000, 5, 20);
      Leaderboard.recordScore('Mid', 500, 3, 12);
      
      const top = Leaderboard.getTop();
      expect(top[0].name).toBe('High');
      expect(top[1].name).toBe('Mid');
      expect(top[2].name).toBe('Low');
    });

    it('should limit to max entries', () => {
      for (let i = 0; i < 15; i++) {
        Leaderboard.recordScore(`P${i}`, i * 100, i, i * 5);
      }
      expect(Leaderboard.getTop().length).toBe(10);
    });

    it('should persist to localStorage', () => {
      Leaderboard.recordScore('Saved', 250, 2, 8);
      const stored = JSON.parse(localStorage.getItem('digger_leaderboard')!);
      expect(stored[0].name).toBe('Saved');
    });
  });

  describe('wouldRank', () => {
    it('should return true when not full', () => {
      expect(Leaderboard.wouldRank(1)).toBe(true);
    });

    it('should check against worst score when full', () => {
      for (let i = 0; i < 10; i++) {
        Leaderboard.recordScore(`P${i}`, 1000 + i * 100, i, i);
      }
      expect(Leaderboard.wouldRank(2000)).toBe(true);
      expect(Leaderboard.wouldRank(500)).toBe(false);
    });
  });

  describe('getBest', () => {
    it('should return best score', () => {
      Leaderboard.recordScore('Second', 500, 2, 10);
      Leaderboard.recordScore('First', 1000, 5, 20);
      expect(Leaderboard.getBest()?.name).toBe('First');
    });

    it('should return null when empty', () => {
      expect(Leaderboard.getBest()).toBeNull();
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      Leaderboard.recordScore('Gone', 100, 1, 5);
      Leaderboard.clear();
      expect(Leaderboard.getTop().length).toBe(0);
    });
  });
});
