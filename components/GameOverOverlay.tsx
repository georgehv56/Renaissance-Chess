
import React from 'react';

interface GameOverOverlayProps {
  result: string;
  onNewGame: () => void;
}

const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ result, onNewGame }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-stone-800 border-2 border-amber-400 p-8 rounded-lg shadow-2xl text-center transform scale-100 animate-fade-in-up">
        <h2 className="text-4xl font-bold text-amber-200 mb-4">Campaign Concluded</h2>
        <p className="text-2xl text-stone-300 mb-8">{result}</p>
        <button
          onClick={onNewGame}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          Start Anew
        </button>
        <style>{`
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(20px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
};

export default GameOverOverlay;
