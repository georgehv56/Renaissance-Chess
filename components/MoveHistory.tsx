import React, { useRef, useEffect } from 'react';

interface MoveHistoryProps {
  moves: string[];
  onRequestHint: () => void;
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves, onRequestHint }) => {
  const historyEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [moves]);

  return (
    <div className="flex flex-col flex-grow">
      <h3 className="text-lg font-bold text-amber-200 mb-2 text-center">Move History</h3>
      <div className="bg-stone-800/50 rounded-lg p-2 flex-grow h-48 overflow-y-scroll border border-stone-600">
        <ol className="text-stone-300 grid grid-cols-[auto_1fr_1fr] gap-x-4">
          {moves.map((move, index) => {
            if (index % 2 === 0) {
              const moveNumber = Math.floor(index / 2) + 1;
              const blackMove = moves[index + 1] || '';
              return (
                <React.Fragment key={index}>
                  <li className="text-right text-stone-400">{moveNumber}.</li>
                  <li className="text-left text-stone-100">{move}</li>
                  <li className="text-left text-stone-300">{blackMove}</li>
                </React.Fragment>
              );
            }
            return null;
          })}
        </ol>
        <div ref={historyEndRef} />
      </div>
       <button 
        onClick={onRequestHint}
        className="mt-4 w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 shadow-lg border border-amber-800">
        Request Hint
      </button>
    </div>
  );
};

export default MoveHistory;