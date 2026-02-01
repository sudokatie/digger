'use client';

interface GameOverProps {
  won: boolean;
  time: number;
  levelId: number;
  onNext: () => void;
  onRetry: () => void;
  onQuit: () => void;
}

export function GameOver({ won, time, levelId, onNext, onRetry, onQuit }: GameOverProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg text-center">
        <h2 className={`text-3xl font-bold mb-4 ${won ? 'text-green-400' : 'text-red-400'}`}>
          {won ? 'LEVEL COMPLETE!' : 'GAME OVER'}
        </h2>
        
        {won && (
          <div className="mb-6">
            <p className="text-gray-400">Time</p>
            <p className="text-2xl text-white font-mono">{formatTime(time)}</p>
          </div>
        )}

        {!won && (
          <p className="text-gray-400 mb-6">
            Better luck next time!
          </p>
        )}

        <div className="flex flex-col gap-3">
          {won && levelId < 10 && (
            <button
              onClick={onNext}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded transition"
            >
              Next Level
            </button>
          )}
          
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded transition"
          >
            {won ? 'Play Again' : 'Try Again'}
          </button>
          
          <button
            onClick={onQuit}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition"
          >
            Level Select
          </button>
        </div>
      </div>
    </div>
  );
}
