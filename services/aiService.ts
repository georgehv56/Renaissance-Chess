
import { ChessEngine } from './chessEngine';
import type { Move, Board, AIPersonality } from '../types';
import { PlayerColor, PieceType } from '../types';
import { PIECE_VALUES, PIECE_POSITION_SCORES } from '../constants';
import { getOpening } from './openingBook';
import { queryTablebase, uciToMove } from './tablebaseService';
import { polyglotBookService } from './polyglotBookService';

// Initialize the headless opening book
polyglotBookService.initialize();

function evaluateBoard(board: Board, personality: AIPersonality): number {
  let score = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        let pieceValue = PIECE_VALUES[piece.type];

        // AI Personality tweaks
        if (personality === 'Stockfish The Grandmaster' && piece.type === PieceType.Knight) {
            pieceValue *= 1.1; // Prefers knights
        }
        if (personality === 'LC0 The Oracle' && piece.type === PieceType.Pawn) {
            pieceValue *= 1.2; // Prefers strong pawn structure
        }

        const positionalScore = PIECE_POSITION_SCORES[piece.type][piece.color][row][col];
        const totalValue = pieceValue + positionalScore;
        
        score += piece.color === PlayerColor.White ? totalValue : -totalValue;
      }
    }
  }
  return score;
}

function minimax(
  engine: ChessEngine,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean,
  personality: AIPersonality
): number {
  if (depth === 0) {
    return evaluateBoard(engine.getBoard(), personality);
  }

  const player = isMaximizingPlayer ? PlayerColor.White : PlayerColor.Black;
  const moves = engine.getAllValidMoves(player);

  if (moves.length === 0) {
    if (engine.isCheckmate(player)) return isMaximizingPlayer ? -Infinity : Infinity;
    return 0; // Stalemate
  }

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newEngine = new ChessEngine(engine);
      newEngine.movePiece(move.from, move.to);
      const evaluation = minimax(newEngine, depth - 1, alpha, beta, false, personality);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) {
        break;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newEngine = new ChessEngine(engine);
      newEngine.movePiece(move.from, move.to);
      const evaluation = minimax(newEngine, depth - 1, alpha, beta, true, personality);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) {
        break;
      }
    }
    return minEval;
  }
}

export async function findBestMove(engine: ChessEngine, depth: number, personality: AIPersonality): Promise<Move | null> {
  const playerToMove = engine.getCurrentPlayer();
  const moves = engine.getAllValidMoves(playerToMove);
  if (moves.length === 0) return null;

  // --- New Orchestration ---
  const MAX_BOOK_MOVES = 30; // 15 moves per player
  
  // 1. Headless Polyglot Opening Book (transposition aware)
  if (engine.getMoveHistory().length < MAX_BOOK_MOVES) {
    const bookMoveUci = polyglotBookService.getBookMove(engine.getZobristKey());
    if (bookMoveUci) {
        const bookMove = uciToMove(bookMoveUci);
        // Verify move is legal before playing
        if (moves.some(m => m.from.row === bookMove.from.row && m.from.col === bookMove.from.col && m.to.row === bookMove.to.row && m.to.col === bookMove.to.col)) {
          return bookMove;
        }
    }
  }
  
  // 2. Fallback to simple book for White's first move if headless fails
  if (playerToMove === PlayerColor.White && engine.getUciMoveHistory().length === 0) {
     const { bookMove } = getOpening(engine.getUciMoveHistory());
     if(bookMove) return uciToMove(bookMove);
  }


  // 3. Endgame Tablebase
  if (engine.countPieces() <= 7) {
    const fen = engine.toFEN();
    const tablebaseMove = await queryTablebase(fen);
    if (tablebaseMove) {
      return tablebaseMove;
    }
  }

  // 4. Minimax Search
  let currentDepth = depth;
  if (playerToMove === PlayerColor.Black && engine.isKingInCheck(PlayerColor.Black)) {
    currentDepth++;
  }

  let bestMove: Move | null = null;
  const isMaximizingPlayer = playerToMove === PlayerColor.White;
  let bestValue = isMaximizingPlayer ? -Infinity : Infinity;

  for (const move of moves) {
    const newEngine = new ChessEngine(engine);
    newEngine.movePiece(move.from, move.to);
    const boardValue = minimax(newEngine, currentDepth - 1, -Infinity, Infinity, !isMaximizingPlayer, personality);
    
    if (isMaximizingPlayer) {
        if (boardValue > bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    } else {
        if (boardValue < bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    }
  }

  return bestMove || moves[Math.floor(Math.random() * moves.length)];
}
