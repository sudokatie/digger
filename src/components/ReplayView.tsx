'use client';

import { useState } from 'react';
import { Replay, ReplayData } from '../game/Replay';

interface ReplayViewProps {
  replayData: ReplayData | null;
  onWatch: () => void;
  onClose: () => void;
}

export function ReplayView({ replayData, onWatch, onClose }: ReplayViewProps) {
  const [copied, setCopied] = useState(false);
  
  if (!replayData) return null;
  
  const stats = Replay.getStats(replayData);
  const code = Replay.encode(replayData);
  
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Replay {replayData.completed ? 'Saved' : 'Recorded'}
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700 p-3 rounded">
            <p className="text-gray-400 text-sm">Level</p>
            <p className="text-white text-xl font-mono">{replayData.levelId}</p>
          </div>
          <div className="bg-gray-700 p-3 rounded">
            <p className="text-gray-400 text-sm">Duration</p>
            <p className="text-white text-xl font-mono">{formatTime(replayData.duration)}</p>
          </div>
          <div className="bg-gray-700 p-3 rounded">
            <p className="text-gray-400 text-sm">Total Inputs</p>
            <p className="text-white text-xl font-mono">{stats.totalInputs}</p>
          </div>
          <div className="bg-gray-700 p-3 rounded">
            <p className="text-gray-400 text-sm">Inputs/sec</p>
            <p className="text-white text-xl font-mono">{stats.inputsPerSecond.toFixed(1)}</p>
          </div>
          <div className="bg-gray-700 p-3 rounded">
            <p className="text-gray-400 text-sm">Moves</p>
            <p className="text-white text-xl font-mono">{stats.moveCount}</p>
          </div>
          <div className="bg-gray-700 p-3 rounded">
            <p className="text-gray-400 text-sm">Digs</p>
            <p className="text-white text-xl font-mono">{stats.digCount}</p>
          </div>
        </div>
        
        {replayData.completed && (
          <div className="mb-4">
            <p className="text-gray-400 text-sm mb-2">Share Code</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={code}
                className="flex-1 bg-gray-900 text-gray-300 px-3 py-2 rounded font-mono text-xs overflow-hidden"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded transition ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={onWatch}
            className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded transition"
          >
            Watch Replay
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface ReplayImportProps {
  onImport: (data: ReplayData) => void;
  onClose: () => void;
}

export function ReplayImport({ onImport, onClose }: ReplayImportProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleImport = () => {
    const data = Replay.decode(code.trim());
    if (data) {
      onImport(data);
    } else {
      setError('Invalid replay code');
    }
  };
  
  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Import Replay
        </h2>
        
        <div className="mb-4">
          <p className="text-gray-400 text-sm mb-2">Paste replay code</p>
          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(null);
            }}
            placeholder="Paste replay code here..."
            className="w-full bg-gray-900 text-gray-300 px-3 py-2 rounded font-mono text-xs h-24 resize-none"
          />
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={!code.trim()}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition"
          >
            Watch Replay
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
