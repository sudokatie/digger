'use client';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export function PauseMenu({ onResume, onRestart, onQuit }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-white mb-6">PAUSED</h2>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded transition"
          >
            Resume
          </button>
          
          <button
            onClick={onRestart}
            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded transition"
          >
            Restart Level
          </button>
          
          <button
            onClick={onQuit}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition"
          >
            Quit to Menu
          </button>
        </div>

        <div className="mt-6 text-gray-400 text-sm">
          <p className="font-bold mb-2">Controls</p>
          <p>Arrow Keys / WASD - Move</p>
          <p>Q / Z - Dig Left</p>
          <p>E / X - Dig Right</p>
          <p>ESC / P - Pause</p>
          <p>R - Restart</p>
        </div>
      </div>
    </div>
  );
}
