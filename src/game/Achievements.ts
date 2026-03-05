/**
 * Achievement system for Digger (Dig Dug clone)
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'exploration' | 'mastery' | 'daily';
}

export interface AchievementProgress { unlockedAt: number; }
export type AchievementStore = Record<string, AchievementProgress>;

export const ACHIEVEMENTS: Achievement[] = [
  // Skill
  { id: 'first_pump', name: 'Inflator', description: 'Inflate your first enemy', icon: '🎈', category: 'skill' },
  { id: 'first_rock', name: 'Crusher', description: 'Crush an enemy with a rock', icon: '🪨', category: 'skill' },
  { id: 'multi_crush', name: 'Avalanche', description: 'Crush 2+ enemies with one rock', icon: '💥', category: 'skill' },
  { id: 'level_clear', name: 'Exterminator', description: 'Clear level 1', icon: '🌟', category: 'skill' },
  { id: 'close_call', name: 'Close Call', description: 'Kill enemy within 1 tile of you', icon: '😰', category: 'skill' },
  { id: 'veggie_collect', name: 'Vegetarian', description: 'Collect a bonus vegetable', icon: '🥕', category: 'skill' },

  // Exploration
  { id: 'tunnel_master', name: 'Tunnel Master', description: 'Dig 100 tiles in one game', icon: '⛏️', category: 'exploration' },
  { id: 'deep_diver', name: 'Deep Diver', description: 'Reach the bottom row', icon: '⬇️', category: 'exploration' },
  { id: 'edge_walker', name: 'Edge Walker', description: 'Dig along both edges of the map', icon: '↔️', category: 'exploration' },

  // Mastery
  { id: 'level_5', name: 'Veteran Digger', description: 'Reach level 5', icon: '🎖️', category: 'mastery' },
  { id: 'level_10', name: 'Master Digger', description: 'Reach level 10', icon: '👑', category: 'mastery' },
  { id: 'score_10000', name: 'High Scorer', description: 'Score 10,000 points', icon: '💯', category: 'mastery' },
  { id: 'score_25000', name: 'Elite Digger', description: 'Score 25,000 points', icon: '🏆', category: 'mastery' },
  { id: 'perfect_level', name: 'Untouchable', description: 'Clear a level without taking damage', icon: '🛡️', category: 'mastery' },
  { id: 'rocks_only', name: 'Geologist', description: 'Clear a level using only rocks', icon: '🗿', category: 'mastery' },

  // Daily
  { id: 'daily_complete', name: 'Daily Digger', description: 'Complete a daily challenge', icon: '📅', category: 'daily' },
  { id: 'daily_top_10', name: 'Daily Contender', description: 'Top 10 in daily', icon: '🔟', category: 'daily' },
  { id: 'daily_top_3', name: 'Daily Champion', description: 'Top 3 in daily', icon: '🥉', category: 'daily' },
  { id: 'daily_first', name: 'Daily Legend', description: 'First place in daily', icon: '🥇', category: 'daily' },
  { id: 'daily_streak_3', name: 'Consistent', description: '3-day streak', icon: '🔥', category: 'daily' },
  { id: 'daily_streak_7', name: 'Dedicated', description: '7-day streak', icon: '💪', category: 'daily' },
];

const STORAGE_KEY = 'digger_achievements';
const STREAK_KEY = 'digger_daily_streak';

export class AchievementManager {
  private store: AchievementStore;
  private dailyStreak: { lastDate: string; count: number };

  constructor() {
    this.store = this.load();
    this.dailyStreak = this.loadStreak();
  }

  private load(): AchievementStore {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
  }
  private save(): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store)); } catch {}
  }
  private loadStreak() {
    try { return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"lastDate":"","count":0}'); } catch { return { lastDate: '', count: 0 }; }
  }
  private saveStreak(): void {
    try { localStorage.setItem(STREAK_KEY, JSON.stringify(this.dailyStreak)); } catch {}
  }

  isUnlocked(id: string): boolean { return id in this.store; }
  getProgress(): AchievementStore { return { ...this.store }; }
  getUnlockedCount(): number { return Object.keys(this.store).length; }
  getTotalCount(): number { return ACHIEVEMENTS.length; }
  getAchievement(id: string) { return ACHIEVEMENTS.find((a) => a.id === id); }
  getAllAchievements() { return ACHIEVEMENTS; }

  unlock(id: string): Achievement | null {
    if (this.isUnlocked(id)) return null;
    const a = this.getAchievement(id);
    if (!a) return null;
    this.store[id] = { unlockedAt: Date.now() };
    this.save();
    return a;
  }

  checkAndUnlock(ids: string[]): Achievement[] {
    return ids.map((id) => this.unlock(id)).filter((a): a is Achievement => a !== null);
  }

  recordDailyCompletion(rank: number): Achievement[] {
    const unlocked: Achievement[] = [];
    let a = this.unlock('daily_complete'); if (a) unlocked.push(a);
    if (rank <= 10) { a = this.unlock('daily_top_10'); if (a) unlocked.push(a); }
    if (rank <= 3) { a = this.unlock('daily_top_3'); if (a) unlocked.push(a); }
    if (rank === 1) { a = this.unlock('daily_first'); if (a) unlocked.push(a); }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (this.dailyStreak.lastDate === yesterday) this.dailyStreak.count++;
    else if (this.dailyStreak.lastDate !== today) this.dailyStreak.count = 1;
    this.dailyStreak.lastDate = today;
    this.saveStreak();

    if (this.dailyStreak.count >= 3) { a = this.unlock('daily_streak_3'); if (a) unlocked.push(a); }
    if (this.dailyStreak.count >= 7) { a = this.unlock('daily_streak_7'); if (a) unlocked.push(a); }
    return unlocked;
  }

  reset(): void { this.store = {}; this.dailyStreak = { lastDate: '', count: 0 }; this.save(); this.saveStreak(); }
}

let instance: AchievementManager | null = null;
export function getAchievementManager(): AchievementManager {
  if (!instance) instance = new AchievementManager();
  return instance;
}
