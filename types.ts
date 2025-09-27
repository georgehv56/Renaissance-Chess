export enum PlayerColor {
  White = 'White',
  Black = 'Black',
}

export enum PieceType {
  Pawn = 'Pawn',
  Rook = 'Rook',
  Knight = 'Knight',
  Bishop = 'Bishop',
  Queen = 'Queen',
  King = 'King',
}

export interface Piece {
  type: PieceType;
  color: PlayerColor;
}

export type Square = Piece | null;

export type Board = Square[][];

export interface SquareIdentifier {
  row: number;
  col: number;
}

export interface Move {
  from: SquareIdentifier;
  to: SquareIdentifier;
}

export interface CastlingRights {
  wK: boolean;
  wQ: boolean;
  bK: boolean;
  bQ: boolean;
}

export type GameStatus = 
  | "White's Turn"
  | "Black's Turn"
  | "White's Turn - Check!"
  | "Black's Turn - Check!"
  | "Checkmate! White wins."
  | "Checkmate! Black wins."
  | "Stalemate! The game is a draw."
  | "Black is contemplating...";

export type AIPersonality = 'Minimax The Tactician' | 'Stockfish The Grandmaster' | 'LC0 The Oracle';

export interface Opening {
  eco: string;
  name: string;
  nextMoveUci?: string;
}

export type TablebaseCategory = "win" | "loss" | "draw" | "dtz-win" | "dtz-loss" | "blessed-loss" | "cursed-win";