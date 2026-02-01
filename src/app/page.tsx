'use client';

import { useState, useCallback } from 'react';
import { LevelSelect } from '@/components/LevelSelect';
import { GameCanvas } from '@/components/GameCanvas';

type Screen = 'title' | 'playing' | 'win' | 'lose';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('title');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState<Map<number, number>>(new Map());

  const handleSelectLevel = useCallback((levelId: number) => {
    setCurrentLevel(levelId);
    setScreen('playing');
  }, []);

  const handleWin = useCallback(() => {
    setCompletedLevels(prev => {
      const next = new Map(prev);
      // Store best time (we'd need to track this properly)
      if (!next.has(currentLevel)) {
        next.set(currentLevel, 0);
      }
      return next;
    });
    setScreen('win');
  }, [currentLevel]);

  const handleLose = useCallback(() => {
    setScreen('lose');
  }, []);

  const handleQuit = useCallback(() => {
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

  return (
    <main className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center p-4">
      {screen === 'title' && (
        <LevelSelect
          completedLevels={completedLevels}
          onSelect={handleSelectLevel}
        />
      )}

      {(screen === 'playing' || screen === 'win' || screen === 'lose') && (
        <GameCanvas
          levelId={currentLevel}
          onWin={handleWin}
          onLose={handleLose}
          onQuit={handleQuit}
        />
      )}
    </main>
  );
}
