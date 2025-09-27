
import React from 'react';
import { FaChessPawn, FaChessRook, FaChessKnight, FaChessBishop, FaChessQueen, FaChessKing } from 'react-icons/fa';
import type { Piece as PieceType } from '../types';
import { PlayerColor } from '../types';

interface PieceProps {
  piece: PieceType;
}

const Piece: React.FC<PieceProps> = ({ piece }) => {
  const iconProps = {
    className: `
      text-4xl md:text-5xl cursor-pointer 
      ${piece.color === PlayerColor.White ? 'text-stone-100' : 'text-stone-900'}
      drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]
    `
  };

  switch (piece.type) {
    case 'Pawn': return <FaChessPawn {...iconProps} />;
    case 'Rook': return <FaChessRook {...iconProps} />;
    case 'Knight': return <FaChessKnight {...iconProps} />;
    case 'Bishop': return <FaChessBishop {...iconProps} />;
    case 'Queen': return <FaChessQueen {...iconProps} />;
    case 'King': return <FaChessKing {...iconProps} />;
    default: return null;
  }
};

export default Piece;
