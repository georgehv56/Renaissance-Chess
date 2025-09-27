
import { Piece, PieceType, PlayerColor, Board } from './types';

const R = PieceType.Rook;
const N = PieceType.Knight;
const B = PieceType.Bishop;
const Q = PieceType.Queen;
const K = PieceType.King;
const P = PieceType.Pawn;

const W = PlayerColor.White;
const Bl = PlayerColor.Black;

export const INITIAL_BOARD: Board = [
  [{type: R, color: Bl}, {type: N, color: Bl}, {type: B, color: Bl}, {type: Q, color: Bl}, {type: K, color: Bl}, {type: B, color: Bl}, {type: N, color: Bl}, {type: R, color: Bl}],
  [{type: P, color: Bl}, {type: P, color: Bl}, {type: P, color: Bl}, {type: P, color: Bl}, {type: P, color: Bl}, {type: P, color: Bl}, {type: P, color: Bl}, {type: P, color: Bl}],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [{type: P, color: W}, {type: P, color: W}, {type: P, color: W}, {type: P, color: W}, {type: P, color: W}, {type: P, color: W}, {type: P, color: W}, {type: P, color: W}],
  [{type: R, color: W}, {type: N, color: W}, {type: B, color: W}, {type: Q, color: W}, {type: K, color: W}, {type: B, color: W}, {type: N, color: W}, {type: R, color: W}],
];

export const PIECE_VALUES: { [key in PieceType]: number } = {
  [PieceType.Pawn]: 10,
  [PieceType.Knight]: 30,
  [PieceType.Bishop]: 30,
  [PieceType.Rook]: 50,
  [PieceType.Queen]: 90,
  [PieceType.King]: 900,
};

// Piece-Square Tables for positional evaluation
// (From white's perspective)

const pawnEvalWhite = [
    [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
    [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
    [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
    [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
    [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
    [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
    [0.5,  1.0,  1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
    [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
];
const pawnEvalBlack = pawnEvalWhite.slice().reverse();

const knightEval = [
    [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
    [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
    [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
    [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
    [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
    [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
    [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
    [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
];

const bishopEvalWhite = [
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
    [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
    [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
    [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
    [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];
const bishopEvalBlack = bishopEvalWhite.slice().reverse();

const rookEvalWhite = [
    [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
    [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
];
const rookEvalBlack = rookEvalWhite.slice().reverse();

const queenEval = [
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

const kingEvalWhite = [
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
    [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
];
const kingEvalBlack = kingEvalWhite.slice().reverse();

export const PIECE_POSITION_SCORES = {
    [PieceType.Pawn]: { [PlayerColor.White]: pawnEvalWhite, [PlayerColor.Black]: pawnEvalBlack },
    [PieceType.Knight]: { [PlayerColor.White]: knightEval, [PlayerColor.Black]: knightEval },
    [PieceType.Bishop]: { [PlayerColor.White]: bishopEvalWhite, [PlayerColor.Black]: bishopEvalBlack },
    [PieceType.Rook]: { [PlayerColor.White]: rookEvalWhite, [PlayerColor.Black]: rookEvalBlack },
    [PieceType.Queen]: { [PlayerColor.White]: queenEval, [PlayerColor.Black]: queenEval },
    [PieceType.King]: { [PlayerColor.White]: kingEvalWhite, [PlayerColor.Black]: kingEvalBlack },
};
