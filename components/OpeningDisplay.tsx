import React from 'react';
import type { Opening } from '../types';

interface OpeningDisplayProps {
  opening: Opening | null;
  isOutOfBook: boolean;
}

const OpeningDisplay: React.FC<OpeningDisplayProps> = ({ opening, isOutOfBook }) => {
  if (!opening) {
    return null; // Don't display anything if no opening has been identified yet
  }

  const status = isOutOfBook ? " (Out of book)" : "";
  const content = `${opening.eco}: ${opening.name}${status}`;

  return (
    <div className="text-center p-2 bg-stone-800/50 rounded-lg border border-stone-600">
      <h3 className="text-sm font-semibold text-amber-100 tracking-wider truncate" title={content}>
        {content}
      </h3>
    </div>
  );
};

export default OpeningDisplay;