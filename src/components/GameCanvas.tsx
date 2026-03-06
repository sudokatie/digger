'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Game } from '@/game/Game';
import { Renderer } from '@/game/Renderer';
import { Input } from '@/game/Input';
import { GameState, Direction } from '@/game/types';
import { HUD } from './HUD';
import { PauseMenu } from './PauseMenu';
import { GameOver } from './GameOver';
import { DailyComplete } from './DailyComplete';

interface GameCanvasProps {
  levelId: number;
  isDaily?: boolean;
  onWin: (time: number) => void;
  onLose: () => void;
  onQuit: () => void;
  onNext?: () => void;
  onDailyComplete?: () => void;
}

export function GameCanvas({ levelId, isDaily, onWin, onLose, onQuit, onNext, onDailyComplete }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const inputRef = useRef<Input | null>(null);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const [gameState, setGameState] = useState<GameState>(GameState.Title);
  const [goldCount, setGoldCount] = useState({ collected: 0, total: 0 });
  const [lives, setLives] = useState(3);
  const [timer, setTimer] = useState(0);
  const [levelName, setLevelName] = useState('');
  const [dailyScore, setDailyScore] = useState(0);
  const [dailyLevelIndex, setDailyLevelIndex] = useState(0);
  const [dailyLevelCount, setDailyLevelCount] = useState(0);
  const [dailyGoldTotal, setDailyGoldTotal] = useState(0);
  const [showDailyComplete, setShowDailyComplete] = useState(false);

  const updateUI = useCallback(() => {
    if (!gameRef.current) return;
    
    setGameState(gameRef.current.state);
    setGoldCount(gameRef.current.getGoldCount());
    setLives(gameRef.current.lives);
    setTimer(gameRef.current.timer);
    setLevelName(gameRef.current.getLevelName());
    
    // Daily mode state
    if (gameRef.current.isDaily) {
      setDailyScore(gameRef.current.score);
      setDailyLevelIndex(gameRef.current.dailyLevelIndex);
      setDailyLevelCount(gameRef.current.dailyLevelCount);
      setDailyGoldTotal(gameRef.current.totalGoldCollected);
    }
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    if (!gameRef.current || !rendererRef.current || !inputRef.current) {
      frameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const dt = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = timestamp;

    // Cap dt to prevent huge jumps
    const cappedDt = Math.min(dt, 0.1);

    // Handle input
    if (gameRef.current.state === GameState.Playing) {
      const direction = inputRef.current.getDirection();
      gameRef.current.movePlayer(direction, cappedDt);

      const digDir = inputRef.current.getDigDirection();
      if (digDir) {
        gameRef.current.digPlayer(digDir);
      }
    }

    // Update game
    gameRef.current.update(cappedDt);

    // Check for win/lose
    if (gameRef.current.state === GameState.Win) {
      updateUI();
      if (gameRef.current.isDaily) {
        // Daily mode - check if we should advance or complete
        const isComplete = gameRef.current.completeDailyLevel();
        if (isComplete) {
          // Add final level score and show complete screen
          setDailyScore(gameRef.current.score);
          setDailyGoldTotal(gameRef.current.totalGoldCollected);
          setShowDailyComplete(true);
          onDailyComplete?.();
        } else {
          // Continue to next daily level
          updateUI();
        }
      } else {
        onWin(gameRef.current.timer);
      }
      return;
    }
    if (gameRef.current.state === GameState.Lose) {
      updateUI();
      onLose();
      return;
    }

    // Render
    rendererRef.current.render(gameRef.current);

    // Update UI state
    updateUI();

    frameRef.current = requestAnimationFrame(gameLoop);
  }, [onWin, onLose, updateUI]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize game
    const game = new Game();
    const renderer = new Renderer(canvasRef.current);
    const input = new Input();

    gameRef.current = game;
    rendererRef.current = renderer;
    inputRef.current = input;

    // Set up input callbacks
    input.onAction('pause', () => {
      if (game.state === GameState.Playing) {
        game.pause();
      } else if (game.state === GameState.Paused) {
        game.resume();
      }
      updateUI();
    });

    input.onAction('restart', () => {
      game.restart();
      updateUI();
    });

    // Load level and attach input
    if (isDaily) {
      game.startDaily();
    } else {
      game.loadLevel(levelId);
    }
    input.attach();
    updateUI();

    // Start game loop
    frameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(frameRef.current);
      input.detach();
    };
  }, [levelId, gameLoop, updateUI]);

  const handleResume = () => {
    gameRef.current?.resume();
    updateUI();
  };

  const handleRestart = () => {
    gameRef.current?.restart();
    updateUI();
  };

  return (
    <div className="relative">
      <HUD
        levelName={isDaily ? `Daily ${dailyLevelIndex + 1}/${dailyLevelCount}` : levelName}
        gold={goldCount}
        lives={lives}
        timer={timer}
        score={isDaily ? dailyScore : undefined}
      />
      
      <canvas
        ref={canvasRef}
        className="border-2 border-gray-700 rounded"
      />
      
      <div className="mt-2 text-sm text-gray-500 text-center">
        Arrows/WASD: Move | Q/E: Dig | ESC: Pause | R: Restart
      </div>

      {gameState === GameState.Paused && (
        <PauseMenu
          onResume={handleResume}
          onRestart={handleRestart}
          onQuit={onQuit}
        />
      )}

      {(gameState === GameState.Win || gameState === GameState.Lose) && !isDaily && (
        <GameOver
          won={gameState === GameState.Win}
          time={timer}
          levelId={levelId}
          onNext={onNext}
          onRetry={handleRestart}
          onQuit={onQuit}
        />
      )}

      {gameState === GameState.Lose && isDaily && (
        <GameOver
          won={false}
          time={timer}
          levelId={dailyLevelIndex + 1}
          onRetry={() => {
            gameRef.current?.startDaily();
            setShowDailyComplete(false);
            updateUI();
          }}
          onQuit={onQuit}
        />
      )}

      {showDailyComplete && (
        <DailyComplete
          score={dailyScore}
          goldCollected={dailyGoldTotal}
          levelsCompleted={dailyLevelCount}
          onPlayAgain={() => {
            gameRef.current?.startDaily();
            setShowDailyComplete(false);
            updateUI();
          }}
          onQuit={onQuit}
        />
      )}
    </div>
  );
}
