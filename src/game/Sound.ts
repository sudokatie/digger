/**
 * Sound system for Digger using Web Audio API.
 * Generates retro-style synthesized sounds.
 */

type SoundType =
  | 'move'
  | 'dig'
  | 'collect'
  | 'trapGuard'
  | 'guardDeath'
  | 'guardEscape'
  | 'levelComplete'
  | 'death';

class SoundSystem {
  private static instance: SoundSystem;
  private context: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;

  private constructor() {}

  static getInstance(): SoundSystem {
    if (!SoundSystem.instance) {
      SoundSystem.instance = new SoundSystem();
    }
    return SoundSystem.instance;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.context) {
      try {
        this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        return null;
      }
    }

    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    return this.context;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(): number {
    return this.volume;
  }

  resetContext(): void {
    this.context = null;
  }

  play(sound: SoundType): void {
    if (!this.enabled) return;

    const ctx = this.getContext();
    if (!ctx) return;

    switch (sound) {
      case 'move':
        this.playMove(ctx);
        break;
      case 'dig':
        this.playDig(ctx);
        break;
      case 'collect':
        this.playCollect(ctx);
        break;
      case 'trapGuard':
        this.playTrapGuard(ctx);
        break;
      case 'guardDeath':
        this.playGuardDeath(ctx);
        break;
      case 'guardEscape':
        this.playGuardEscape(ctx);
        break;
      case 'levelComplete':
        this.playLevelComplete(ctx);
        break;
      case 'death':
        this.playDeath(ctx);
        break;
    }
  }

  private playMove(ctx: AudioContext): void {
    // Light footstep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(this.volume * 0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  }

  private playDig(ctx: AudioContext): void {
    // Digging sound with crumble
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 10) * 0.7;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);

    noise.connect(gain);
    gain.connect(ctx.destination);

    noise.start(ctx.currentTime);
  }

  private playCollect(ctx: AudioContext): void {
    // Sparkly gold collection
    const notes = [659.25, 880, 1046.50]; // E5, A5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + i * 0.06;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);

      osc.start(startTime);
      osc.stop(startTime + 0.12);
    });
  }

  private playTrapGuard(ctx: AudioContext): void {
    // Descending tone + thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }

  private playGuardDeath(ctx: AudioContext): void {
    // Squash sound
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const impact = Math.sin(2 * Math.PI * 50 * t) * Math.exp(-t * 20);
      const noise = (Math.random() * 2 - 1) * 0.3;
      data[i] = (impact + noise * Math.exp(-t * 10)) * Math.exp(-t * 5);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);

    source.connect(gain);
    gain.connect(ctx.destination);

    source.start(ctx.currentTime);
  }

  private playGuardEscape(ctx: AudioContext): void {
    // Rising tone for escape
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  private playLevelComplete(ctx: AudioContext): void {
    // Victory fanfare
    const melody = [
      { freq: 523.25, time: 0, dur: 0.12 },
      { freq: 659.25, time: 0.12, dur: 0.12 },
      { freq: 783.99, time: 0.24, dur: 0.12 },
      { freq: 1046.50, time: 0.36, dur: 0.25 },
    ];

    melody.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'square';
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + time;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.02);
      gain.gain.setValueAtTime(this.volume * 0.3, startTime + dur - 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + dur);

      osc.start(startTime);
      osc.stop(startTime + dur);
    });
  }

  private playDeath(ctx: AudioContext): void {
    // Sad descending tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(this.volume * 0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  }
}

export const Sound = SoundSystem.getInstance();
