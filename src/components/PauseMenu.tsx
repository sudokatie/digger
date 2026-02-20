'use client';

import { useState } from 'react';
import { Music } from '../game/Music';
import { Sound } from '../game/Sound';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export function PauseMenu({ onResume, onRestart, onQuit }: PauseMenuProps) {
  const [musicVolume, setMusicVolume] = useState(Music.getVolume());
  const [soundVolume, setSoundVolume] = useState(Sound.getVolume());
  const [musicEnabled, setMusicEnabled] = useState(Music.isEnabled());
  const [soundEnabled, setSoundEnabled] = useState(Sound.isEnabled());

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMusicVolume(vol);
    Music.setVolume(vol);
  };

  const handleSoundVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setSoundVolume(vol);
    Sound.setVolume(vol);
  };

  const toggleMusic = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    Music.setEnabled(newState);
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    Sound.setEnabled(newState);
  };

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

        {/* Volume Controls */}
        <div className="mt-6 pt-4 border-t border-gray-700 text-left">
          <p className="font-bold text-white mb-3 text-center">Audio</p>
          
          {/* Music Volume */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-gray-400">Music</label>
              <button
                onClick={toggleMusic}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  musicEnabled
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                }`}
              >
                {musicEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={handleMusicVolumeChange}
              disabled={!musicEnabled}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 disabled:opacity-50"
            />
          </div>

          {/* Sound Volume */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-gray-400">Sound Effects</label>
              <button
                onClick={toggleSound}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  soundEnabled
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                }`}
              >
                {soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={soundVolume}
              onChange={handleSoundVolumeChange}
              disabled={!soundEnabled}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 disabled:opacity-50"
            />
          </div>
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
