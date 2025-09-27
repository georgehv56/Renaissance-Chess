import React from 'react';
import Piece from './Piece';
import type { Board, SquareIdentifier, Move } from '../types';

interface ChessboardProps {
  board: Board;
  onSquareClick: (row: number, col: number) => void;
  selectedSquare: SquareIdentifier | null;
  validMoves: Move[];
  kingInCheckSquare: SquareIdentifier | null;
  hint: Move | null;
}

const Chessboard: React.FC<ChessboardProps> = ({ board, onSquareClick, selectedSquare, validMoves, kingInCheckSquare, hint }) => {
  return (
    // Container is 488x488px with a 4px border. Content area is 480x480.
    // Each square in the grid will be exactly 60x60.
    // The `contain` property isolates rendering for performance.
    <div 
      className="w-[488px] h-[488px] grid grid-cols-8 grid-rows-8 border-4 border-stone-700 shadow-2xl relative"
      style={{ contain: 'layout paint size' }}
    >
      {board.flat().map((piece, index) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        
        const isLight = (row + col) % 2 !== 0;
        const isSelected = selectedSquare?.row === row && selectedSquare?.col === col;
        const isKingInCheck = kingInCheckSquare?.row === row && kingInCheckSquare?.col === col;
        const isHintFrom = hint?.from.row === row && hint?.from.col === col;
        const isHintTo = hint?.to.row === row && hint?.to.col === col;
        const isValidMove = validMoves.some(move => move.to.row === row && move.to.col === col);

        const squareClasses = `
          flex items-center justify-center relative transition-colors duration-300
          ${isLight ? 'bg-amber-200' : 'bg-amber-600'}
          ${isSelected ? '!bg-yellow-400' : ''}
          ${isKingInCheck ? 'bg-red-500/70' : ''}
          ${isHintFrom || isHintTo ? 'bg-blue-400/80' : ''}
        `;

        return (
          <div key={`${row}-${col}`} className={squareClasses} onClick={() => onSquareClick(row, col)}>
            {piece && <Piece piece={piece} />}
            {isValidMove && (
              <div className="absolute w-full h-full flex items-center justify-center">
                <div className={`
                  rounded-full
                  ${piece ? 'w-full h-full border-4 border-amber-400/50' : 'w-6 h-6 bg-amber-400/50'}
                `}></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(Chessboard);