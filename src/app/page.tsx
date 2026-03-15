'use client';

import { useState, useCallback, useEffect } from 'react';
import { LevelSelect } from '@/components/LevelSelect';
import { GameCanvas } from '@/components/GameCanvas';
import { Music } from '@/game/Music';

type Screen = 'title' | 'playing' | 'daily' | 'win' | 'lose' | 'daily-complete';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('title');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState<Map<number, number>>(new Map());
  const [isDaily, setIsDaily] = useState(false);

  const handleSelectLevel = useCallback((levelId: number) => {
    setCurrentLevel(levelId);
    setIsDaily(false);
    setScreen('playing');
  }, []);

  const handleStartDaily = useCallback(() => {
    setIsDaily(true);
    setScreen('daily');
  }, []);

  const handleWin = useCallback((time: number) => {
    if (!isDaily) {
      setCompletedLevels(prev => {
        const next = new Map(prev);
        const existingTime = prev.get(currentLevel);
        // Store best time (lower is better)
        if (existingTime === undefined || time < existingTime) {
          next.set(currentLevel, time);
        }
        return next;
      });
    }
    setScreen('win');
  }, [currentLevel, isDaily]);

  const handleDailyComplete = useCallback(() => {
    setScreen('daily-complete');
  }, []);

  const handleLose = useCallback(() => {
    setScreen('lose');
  }, []);

  const handleQuit = useCallback(() => {
    setIsDaily(false);
    setScreen('title');
  }, []);

  const handleNextLevel = useCallback(() => {
    if (currentLevel < 10) {
      setCurrentLevel(currentLevel + 1);
      setScreen('playing');
    } else {
      setScreen('title');
    }
  }, [currentLevel]);

  // Switch music tracks based on screen
  useEffect(() => {
    switch (screen) {
      case 'title':
        Music.play('menu');
        break;
      case 'playing':
      case 'daily':
        Music.play('gameplay');
        break;
      case 'win':
      case 'daily-complete':
        Music.play('victory');
        break;
      case 'lose':
        Music.play('gameover');
        break;
    }
  }, [screen]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      {screen === 'title' && (
        <LevelSelect
          completedLevels={completedLevels}
          onSelect={handleSelectLevel}
          onDaily={handleStartDaily}
        />
      )}

      {(screen === 'playing' || screen === 'win' || screen === 'lose') && !isDaily && (
        <GameCanvas
          levelId={currentLevel}
          onWin={handleWin}
          onLose={handleLose}
          onQuit={handleQuit}
          onNext={handleNextLevel}
        />
      )}

      {(screen === 'daily' || screen === 'win' || screen === 'lose' || screen === 'daily-complete') && isDaily && (
        <GameCanvas
          levelId={0}
          isDaily={true}
          onWin={handleWin}
          onLose={handleLose}
          onQuit={handleQuit}
          onDailyComplete={handleDailyComplete}
        />
      )}
    </main>
  );
}
