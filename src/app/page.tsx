'use client';

import { useState, useCallback, useEffect } from 'react';
import { LevelSelect } from '@/components/LevelSelect';
import { GameCanvas } from '@/components/GameCanvas';
import { Music } from '@/game/Music';

type Screen = 'title' | 'playing' | 'win' | 'lose';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('title');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState<Map<number, number>>(new Map());

  const handleSelectLevel = useCallback((levelId: number) => {
    setCurrentLevel(levelId);
    setScreen('playing');
  }, []);

  const handleWin = useCallback((time: number) => {
    setCompletedLevels(prev => {
      const next = new Map(prev);
      const existingTime = prev.get(currentLevel);
      // Store best time (lower is better)
      if (existingTime === undefined || time < existingTime) {
        next.set(currentLevel, time);
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

  // Switch music tracks based on screen
  useEffect(() => {
    switch (screen) {
      case 'title':
        Music.play('menu');
        break;
      case 'playing':
        Music.play('gameplay');
        break;
      case 'win':
        Music.play('victory');
        break;
      case 'lose':
        Music.play('gameover');
        break;
    }
  }, [screen]);

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
          onNext={handleNextLevel}
        />
      )}
    </main>
  );
}
