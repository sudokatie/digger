'use client';

interface HUDProps {
  levelName: string;
  gold: { collected: number; total: number };
  lives: number;
  timer: number;
}

export function HUD({ levelName, gold, lives, timer }: HUDProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hearts = Array(3).fill(0).map((_, i) => (
    <span key={i} className={i < lives ? 'text-red-500' : 'text-gray-600'}>
      ♥
    </span>
  ));

  return (
    <div className="flex justify-between items-center mb-2 px-4 py-2 bg-gray-800 rounded text-white">
      <div className="flex items-center gap-4">
        <span className="font-bold">{levelName}</span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">$</span>
          <span>{gold.collected}/{gold.total}</span>
        </div>
        
        <div className="flex items-center gap-1 text-xl">
          {hearts}
        </div>
        
        <div className="font-mono">
          {formatTime(timer)}
        </div>
      </div>
    </div>
  );
}
