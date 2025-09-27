import React from 'react';
import type { GameStatus as GameStatusType } from '../types';

interface GameStatusProps {
  status: GameStatusType;
}

const GameStatus: React.FC<GameStatusProps> = ({ status }) => {
  return (
    <div className="text-center p-4 bg-stone-800/50 rounded-lg border border-stone-600">
      <h2 className="text-xl font-bold text-amber-100 tracking-wider truncate" title={status}>
        {status}
      </h2>
    </div>
  );
};

export default GameStatus;