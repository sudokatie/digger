/**
 * Leaderboard - High score tracking for Digger
 */

export interface HighScore {
  name: string;
  score: number;
  level: number;
  goldCollected: number;
  completedAt: string;
}

const STORAGE_KEY = 'digger_leaderboard';
const MAX_ENTRIES = 10;

export class Leaderboard {
  private static entries: HighScore[] | null = null;

  static load(): HighScore[] {
    if (this.entries !== null) return this.entries;
    if (typeof window === 'undefined') {
      this.entries = [];
      return this.entries;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      this.entries = stored ? JSON.parse(stored) : [];
    } catch {
      this.entries = [];
    }
    return this.entries;
  }

  private static save(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch {}
  }

  static recordScore(
    name: string,
    score: number,
    level: number,
    goldCollected: number
  ): number | null {
    const entries = this.load();
    const now = new Date().toISOString();

    entries.push({ name, score, level, goldCollected, completedAt: now });
    entries.sort((a, b) => b.score - a.score);

    const rank = entries.findIndex(e => e.completedAt === now);
    this.entries = entries.slice(0, MAX_ENTRIES);
    this.save();

    return rank >= 0 && rank < MAX_ENTRIES ? rank + 1 : null;
  }

  static getTop(count: number = 10): HighScore[] {
    return this.load().slice(0, count);
  }

  static wouldRank(score: number): boolean {
    const entries = this.load();
    if (entries.length < MAX_ENTRIES) return true;
    return score > entries[entries.length - 1].score;
  }

  static getBest(): HighScore | null {
    return this.load()[0] || null;
  }

  static clear(): void {
    this.entries = [];
    this.save();
  }

  static resetCache(): void {
    this.entries = null;
  }
}
