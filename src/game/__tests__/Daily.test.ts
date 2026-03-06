import {
  SeededRNG,
  todayString,
  seedForDate,
  todaySeed,
  DailyLeaderboard,
  generateShareCode,
  parseShareCode,
  getDailyLevelIds,
} from '../Daily';

describe('SeededRNG', () => {
  it('produces deterministic sequence', () => {
    const rng1 = new SeededRNG(12345);
    const rng2 = new SeededRNG(12345);

    for (let i = 0; i < 10; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  it('produces values between 0 and 1', () => {
    const rng = new SeededRNG(99999);
    for (let i = 0; i < 100; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('nextInt returns integers in range', () => {
    const rng = new SeededRNG(42);
    for (let i = 0; i < 50; i++) {
      const val = rng.nextInt(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThan(10);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('pick selects from array', () => {
    const rng = new SeededRNG(123);
    const arr = ['a', 'b', 'c'];
    const picked = rng.pick(arr);
    expect(arr).toContain(picked);
  });

  it('shuffle preserves elements', () => {
    const rng = new SeededRNG(456);
    const original = [1, 2, 3, 4, 5];
    const shuffled = rng.shuffle([...original]);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it('different seeds produce different sequences', () => {
    const rng1 = new SeededRNG(100);
    const rng2 = new SeededRNG(200);
    let same = true;
    for (let i = 0; i < 5; i++) {
      if (rng1.next() !== rng2.next()) same = false;
    }
    expect(same).toBe(false);
  });
});

describe('Date functions', () => {
  it('todayString returns YYYY-MM-DD format', () => {
    const str = todayString();
    expect(str).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('seedForDate produces consistent seeds', () => {
    expect(seedForDate('2026-03-06')).toBe(seedForDate('2026-03-06'));
    expect(seedForDate('2026-03-06')).not.toBe(seedForDate('2026-03-07'));
  });

  it('seedForDate handles invalid input', () => {
    expect(seedForDate('invalid')).toBe(0);
    expect(seedForDate('')).toBe(0);
  });

  it('todaySeed returns number', () => {
    const seed = todaySeed();
    expect(typeof seed).toBe('number');
    expect(seed).toBeGreaterThan(0);
  });
});

describe('Share codes', () => {
  it('generateShareCode creates valid code', () => {
    const code = generateShareCode('2026-03-06', 1500);
    expect(code).toBe('DIGGER-20260306-1500');
  });

  it('parseShareCode extracts data', () => {
    const result = parseShareCode('DIGGER-20260306-1500');
    expect(result).toEqual({ date: '2026-03-06', score: 1500 });
  });

  it('parseShareCode rejects invalid codes', () => {
    expect(parseShareCode('HOPPER-20260306-1500')).toBeNull();
    expect(parseShareCode('DIGGER-2026030-1500')).toBeNull();
    expect(parseShareCode('DIGGER-20260306-abc')).toBeNull();
    expect(parseShareCode('invalid')).toBeNull();
  });

  it('round-trips correctly', () => {
    const date = '2026-03-06';
    const score = 2500;
    const code = generateShareCode(date, score);
    const parsed = parseShareCode(code);
    expect(parsed).toEqual({ date, score });
  });
});

describe('getDailyLevelIds', () => {
  it('returns 3 levels for sufficient total', () => {
    const levels = getDailyLevelIds(10);
    expect(levels).toHaveLength(3);
  });

  it('returns fewer if not enough levels', () => {
    const levels = getDailyLevelIds(2);
    expect(levels).toHaveLength(2);
  });

  it('returns same levels for same date', () => {
    const levels1 = getDailyLevelIds(10);
    const levels2 = getDailyLevelIds(10);
    expect(levels1).toEqual(levels2);
  });

  it('returns valid level IDs', () => {
    const levels = getDailyLevelIds(10);
    for (const id of levels) {
      expect(id).toBeGreaterThanOrEqual(1);
      expect(id).toBeLessThanOrEqual(10);
    }
  });
});

describe('DailyLeaderboard', () => {
  beforeEach(() => {
    DailyLeaderboard.resetCache();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('starts empty', () => {
    const entries = DailyLeaderboard.getToday();
    expect(entries).toHaveLength(0);
  });

  it('wouldRank returns true for empty board', () => {
    expect(DailyLeaderboard.wouldRank(100)).toBe(true);
  });

  it('getBest returns null when empty', () => {
    expect(DailyLeaderboard.getBest()).toBeNull();
  });
});
