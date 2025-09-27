
import React from 'react';
import type { AIPersonality } from '../types';

interface GameControlsProps {
  onNewGame: () => void;
  setAiPersonality: (personality: AIPersonality) => void;
  isGameActive: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({ onNewGame, setAiPersonality, isGameActive }) => {
  const personalities: AIPersonality[] = ['Minimax The Tactician', 'Stockfish The Grandmaster', 'LC0 The Oracle'];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="ai-personality" className="block mb-2 text-sm font-medium text-stone-300">Choose your Rival</label>
        <select
          id="ai-personality"
          disabled={isGameActive}
          onChange={(e) => setAiPersonality(e.target.value as AIPersonality)}
          className="bg-stone-700 border border-stone-600 text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {personalities.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <button 
        onClick={onNewGame}
        className="w-full bg-amber-800 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-xl border border-amber-900">
        Begin a New Campaign
      </button>
    </div>
  );
};

export default GameControls;
