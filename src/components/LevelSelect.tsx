'use client';

import { LEVELS } from '@/game/levels';
import { DailyLeaderboard, todayString } from '@/game/Daily';

interface LevelSelectProps {
  completedLevels: Map<number, number>;
  onSelect: (levelId: number) => void;
  onDaily?: () => void;
  onImportReplay?: () => void;
}

export function LevelSelect({ completedLevels, onSelect, onDaily, onImportReplay }: LevelSelectProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate stars based on par time
  // 3 stars: under par, 2 stars: under 1.5x par, 1 star: completed
  const getStars = (bestTime: number, par: number): number => {
    if (bestTime <= par) return 3;
    if (bestTime <= par * 1.5) return 2;
    return 1;
  };

  const renderStars = (count: number) => {
    return (
      <div className="flex justify-center gap-0.5 mt-1">
        {[1, 2, 3].map(i => (
          <span 
            key={i} 
            className={i <= count ? 'text-yellow-400' : 'text-gray-600'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-white text-center mb-2">DIGGER</h1>
      <p className="text-gray-400 text-center mb-8">Select a level</p>
      
      <div className="grid grid-cols-5 gap-4 max-w-2xl mx-auto">
        {LEVELS.map((level, index) => {
          const isUnlocked = index === 0 || completedLevels.has(index);
          const bestTime = completedLevels.get(level.id);
          const stars = bestTime !== undefined ? getStars(bestTime, level.par) : 0;
          
          return (
            <button
              key={level.id}
              onClick={() => isUnlocked && onSelect(level.id)}
              disabled={!isUnlocked}
              className={`
                p-4 rounded-lg text-center transition
                ${isUnlocked 
                  ? 'bg-gray-700 hover:bg-gray-600 cursor-pointer' 
                  : 'bg-gray-800 cursor-not-allowed opacity-50'}
              `}
            >
              <div className="text-2xl font-bold text-white mb-1">
                {level.id}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {level.name}
              </div>
              {bestTime !== undefined && (
                <>
                  {renderStars(stars)}
                  <div className="text-xs text-green-400 mt-1">
                    {formatTime(bestTime)}
                  </div>
                </>
              )}
              {!isUnlocked && (
                <div className="text-xs text-gray-500 mt-1">
                  Locked
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Daily Challenge Section */}
      {onDaily && (
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg max-w-md mx-auto">
          <h2 className="text-xl font-bold text-white text-center mb-2">
            Daily Challenge
          </h2>
          <p className="text-gray-300 text-center text-sm mb-3">
            {todayString()} • 3 seeded levels
          </p>
          
          {(() => {
            const best = DailyLeaderboard.getBest();
            return best ? (
              <div className="text-center mb-3">
                <p className="text-yellow-400 text-sm">Today&apos;s Best</p>
                <p className="text-white font-mono text-lg">{best.score.toLocaleString()}</p>
              </div>
            ) : null;
          })()}

          <button
            onClick={onDaily}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded transition"
          >
            PLAY DAILY
          </button>
        </div>
      )}

      {/* Watch Replay Section */}
      {onImportReplay && (
        <div className="mt-4 max-w-md mx-auto">
          <button
            onClick={onImportReplay}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition text-sm"
          >
            Watch Replay Code
          </button>
        </div>
      )}

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Collect all gold to reveal the exit</p>
        <p>Dig holes to trap guards</p>
      </div>
    </div>
  );
}
