'use client';

import { DailyLeaderboard, generateShareCode, todayString } from '@/game/Daily';
import { useState, useEffect } from 'react';

interface DailyCompleteProps {
  score: number;
  goldCollected: number;
  levelsCompleted: number;
  onPlayAgain: () => void;
  onQuit: () => void;
}

export function DailyComplete({ 
  score, 
  goldCollected, 
  levelsCompleted,
  onPlayAgain, 
  onQuit 
}: DailyCompleteProps) {
  const [playerName, setPlayerName] = useState('');
  const [rank, setRank] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShareCode(generateShareCode(todayString(), score));
  }, [score]);

  const handleSubmit = () => {
    if (!playerName.trim()) return;
    
    const newRank = DailyLeaderboard.recordScore(
      playerName.trim(),
      score,
      levelsCompleted,
      goldCollected,
      0 // timeSeconds - we could track this but keeping simple
    );
    
    setRank(newRank);
    setSubmitted(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaderboard = DailyLeaderboard.getToday();

  return (
    <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="bg-gradient-to-b from-purple-900 to-indigo-900 p-8 rounded-lg text-center max-w-md w-full">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2">
          DAILY COMPLETE!
        </h2>
        <p className="text-gray-300 mb-6">{todayString()}</p>

        <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-6">
          <div className="text-4xl font-bold text-white mb-2">
            {score.toLocaleString()}
          </div>
          <div className="text-gray-400 text-sm">
            {levelsCompleted} levels • {goldCollected} gold
          </div>
        </div>

        {!submitted ? (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.slice(0, 12))}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded mb-3 text-center"
              maxLength={12}
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={!playerName.trim()}
              className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded transition"
            >
              Submit Score
            </button>
          </div>
        ) : (
          <div className="mb-6">
            {rank && rank <= 10 ? (
              <p className="text-green-400 font-bold">
                You ranked #{rank} today!
              </p>
            ) : (
              <p className="text-gray-400">Score submitted!</p>
            )}
          </div>
        )}

        {/* Share Code */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-2">Share your score:</p>
          <div className="flex gap-2">
            <code className="flex-1 px-3 py-2 bg-gray-800 text-green-400 rounded font-mono text-sm">
              {shareCode}
            </code>
            <button
              onClick={handleCopyCode}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
            >
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Today's Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-2">Today&apos;s Best</h3>
            <div className="bg-black bg-opacity-30 rounded p-2 max-h-32 overflow-y-auto">
              {leaderboard.slice(0, 5).map((entry, i) => (
                <div 
                  key={i} 
                  className={`flex justify-between py-1 text-sm ${
                    entry.score === score && submitted ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <span>#{i + 1} {entry.name}</span>
                  <span className="font-mono">{entry.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={onPlayAgain}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded transition"
          >
            Play Again
          </button>
          <button
            onClick={onQuit}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
