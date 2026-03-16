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
            className={`text-xs ${i <= count ? 'text-[#dc2626]' : 'text-[#2a2a2a]'}`}
          >
            *
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-2xl mb-4">
        <div className="flex items-center justify-between">
          <a href="/games/" className="mc-link">&lt; BACK TO HUB</a>
          <span className="mc-header">MISSION SELECT</span>
        </div>
      </div>

      {/* Main Panel */}
      <div className="mc-panel p-6 w-full max-w-2xl">
        {/* Title Bar */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#2a2a2a]">
          <div className="mc-dot" />
          <h1 className="mc-header-primary text-2xl tracking-wider">DIGGER</h1>
        </div>
        
        {/* Level Grid */}
        <div className="grid grid-cols-5 gap-3 mb-6">
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
                  p-3 text-center transition border
                  ${isUnlocked 
                    ? 'bg-[#0d0d0d] border-[#2a2a2a] hover:border-[#dc2626] cursor-pointer' 
                    : 'bg-[#0d0d0d] border-[#1a1a1a] cursor-not-allowed opacity-40'}
                `}
              >
                <div className="text-xl font-mono text-white mb-1">
                  {level.id}
                </div>
                <div className="text-[10px] text-[#555555] truncate tracking-wider uppercase">
                  {level.name}
                </div>
                {bestTime !== undefined && (
                  <>
                    {renderStars(stars)}
                    <div className="text-[10px] text-[#dc2626] mt-1 font-mono">
                      {formatTime(bestTime)}
                    </div>
                  </>
                )}
                {!isUnlocked && (
                  <div className="text-[10px] text-[#333333] mt-1 tracking-wider">
                    LOCKED
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Daily Challenge */}
        {onDaily && (
          <div className="border-t border-[#2a2a2a] pt-6 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-[#dc2626]" />
              <span className="mc-header">DAILY CHALLENGE</span>
            </div>
            <div className="bg-[#0d0d0d] border border-[#2a2a2a] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#555555] text-xs font-mono">{todayString()}</span>
                <span className="text-[#555555] text-xs tracking-wider">3 SEEDED LEVELS</span>
              </div>
              
              {(() => {
                const best = DailyLeaderboard.getBest();
                return best ? (
                  <div className="mb-3 text-center">
                    <span className="mc-header block mb-1">BEST SCORE</span>
                    <span className="text-[#dc2626] font-mono text-2xl">{best.score.toLocaleString()}</span>
                  </div>
                ) : null;
              })()}

              <button
                onClick={onDaily}
                className="w-full py-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm tracking-widest font-medium transition-colors border border-[#dc2626]"
              >
                INITIATE DAILY
              </button>
            </div>
          </div>
        )}

        {/* Watch Replay */}
        {onImportReplay && (
          <button
            onClick={onImportReplay}
            className="w-full py-2 bg-transparent border border-[#2a2a2a] text-[#888888] text-xs tracking-widest transition-colors hover:text-white hover:border-[#3a3a3a]"
          >
            IMPORT REPLAY CODE
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="w-full max-w-2xl mt-4">
        <div className="flex items-center justify-center gap-2">
          <span className="mc-header text-[10px]">OBJECTIVE:</span>
          <span className="text-[#555555] text-xs font-mono">Collect gold to reveal exit | Dig holes to trap guards</span>
        </div>
      </div>
    </div>
  );
}
