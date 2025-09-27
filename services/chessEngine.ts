import { INITIAL_BOARD } from '../constants';
import type { Piece, SquareIdentifier, Move, Board, CastlingRights } from '../types';
import { PlayerColor, PieceType } from '../types';
import { Zobrist } from './zobrist';

export class ChessEngine {
  private board: Board;
  private currentPlayer: PlayerColor;
  private moveHistory: string[];
  private uciMoveHistory: string[];
  private zobrist: Zobrist;
  private zobristKey: bigint;
  private castlingRights: CastlingRights;
  private enPassantTarget: SquareIdentifier | null;
  
  constructor(engineToCopy?: ChessEngine) {
    if(engineToCopy){
      this.board = JSON.parse(JSON.stringify(engineToCopy.board));
      this.currentPlayer = engineToCopy.currentPlayer;
      this.moveHistory = [...engineToCopy.moveHistory];
      this.uciMoveHistory = [...engineToCopy.uciMoveHistory];
      this.zobrist = engineToCopy.zobrist; // Share the same zobrist table instance
      this.zobristKey = engineToCopy.zobristKey;
      this.castlingRights = JSON.parse(JSON.stringify(engineToCopy.castlingRights));
      this.enPassantTarget = engineToCopy.enPassantTarget ? {...engineToCopy.enPassantTarget} : null;
    } else {
      this.board = JSON.parse(JSON.stringify(INITIAL_BOARD));
      this.currentPlayer = PlayerColor.White;
      this.moveHistory = [];
      this.uciMoveHistory = [];
      this.zobrist = new Zobrist();
      this.castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
      this.enPassantTarget = null;
      this.zobristKey = this.zobrist.computeHash(this.board, this.currentPlayer, this.castlingRights, this.enPassantTarget);
    }
  }

  getBoard(): Board {
    return this.board;
  }
  
  getCurrentPlayer(): PlayerColor {
    return this.currentPlayer;
  }
  
  getMoveHistory(): string[] {
    return this.moveHistory;
  }
  
  getUciMoveHistory(): string[] {
    return this.uciMoveHistory;
  }

  getZobristKey(): bigint {
    return this.zobristKey;
  }

  private isOutOfBounds(row: number, col: number): boolean {
    return row < 0 || row > 7 || col < 0 || col > 7;
  }

  private getPseudoLegalMoves(from: SquareIdentifier): Move[] {
    const piece = this.board[from.row][from.col];
    if (!piece) return [];

    const moves: Move[] = [];
    const { row, col } = from;

    const addMove = (toRow: number, toCol: number) => {
        if (this.isOutOfBounds(toRow, toCol)) return;
        const targetPiece = this.board[toRow][toCol];
        if (!targetPiece || targetPiece.color !== piece.color) {
            moves.push({ from, to: { row: toRow, col: toCol } });
        }
    };
    
    const addSlidingMoves = (directions: number[][]) => {
        for (const [dr, dc] of directions) {
            let r = row + dr;
            let c = col + dc;
            while (!this.isOutOfBounds(r, c)) {
                const targetPiece = this.board[r][c];
                if (targetPiece) {
                    if (targetPiece.color !== piece.color) {
                        moves.push({ from, to: { row: r, col: c } });
                    }
                    break;
                }
                moves.push({ from, to: { row: r, col: c } });
                r += dr;
                c += dc;
            }
        }
    };

    switch (piece.type) {
      case PieceType.Pawn:
        const dir = piece.color === PlayerColor.White ? -1 : 1;
        const startRow = piece.color === PlayerColor.White ? 6 : 1;

        // 1-step forward
        if (!this.isOutOfBounds(row + dir, col) && !this.board[row + dir][col]) {
            moves.push({ from, to: { row: row + dir, col: col } });
            // 2-step forward
            if (row === startRow && !this.board[row + 2 * dir][col]) {
                moves.push({ from, to: { row: row + 2 * dir, col: col } });
            }
        }
        // Captures
        for (const dc of [-1, 1]) {
            if (!this.isOutOfBounds(row + dir, col + dc)) {
                const target = this.board[row + dir][col + dc];
                if (target && target.color !== piece.color) {
                    moves.push({ from, to: { row: row + dir, col: col + dc } });
                }
                 // En-passant
                const epTarget = this.enPassantTarget;
                if (epTarget && epTarget.row === row + dir && epTarget.col === col + dc) {
                    moves.push({ from, to: { row: row + dir, col: col + dc } });
                }
            }
        }
        break;
      case PieceType.Rook:
        addSlidingMoves([[0, 1], [0, -1], [1, 0], [-1, 0]]);
        break;
      case PieceType.Bishop:
        addSlidingMoves([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
        break;
      case PieceType.Queen:
        addSlidingMoves([[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]);
        break;
      case PieceType.Knight:
        const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        knightMoves.forEach(([dr, dc]) => addMove(row + dr, col + dc));
        break;
      case PieceType.King:
        const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        kingMoves.forEach(([dr, dc]) => addMove(row + dr, col + dc));
        break;
    }

    return moves;
  }
  
  getValidMoves(from: SquareIdentifier): Move[] {
    const pseudoLegalMoves = this.getPseudoLegalMoves(from);
    const validMoves: Move[] = [];
    for (const move of pseudoLegalMoves) {
      if (!this.moveResultsInCheck(move)) {
        validMoves.push(move);
      }
    }
    return validMoves;
  }
  
  getAllValidMoves(color: PlayerColor): Move[] {
    const allMoves: Move[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.color === color) {
          const moves = this.getValidMoves({ row: r, col: c });
          allMoves.push(...moves);
        }
      }
    }
    return allMoves;
  }

  isKingInCheck(color: PlayerColor): boolean {
    const kingPos = this.findKing(color);
    if (!kingPos) return false;
    const opponentColor = color === PlayerColor.White ? PlayerColor.Black : PlayerColor.White;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.color === opponentColor) {
          const moves = this.getPseudoLegalMoves({ row: r, col: c });
          if (moves.some(m => m.to.row === kingPos.row && m.to.col === kingPos.col)) {
            return true;
          }
        }
      }
    }
    return false;
  }
  
  getKingInCheckSquare(): SquareIdentifier | null {
    if (this.isKingInCheck(this.currentPlayer)) {
        return this.findKing(this.currentPlayer);
    }
    return null;
  }

  private findKing(color: PlayerColor): SquareIdentifier | null {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.type === PieceType.King && piece.color === color) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  }

  private moveResultsInCheck(move: Move): boolean {
    const piece = this.board[move.from.row][move.from.col];
    if (!piece) return false;
    const tempEngine = new ChessEngine(this);
    tempEngine.performMove(move);
    return tempEngine.isKingInCheck(piece.color);
  }

  isCheckmate(color: PlayerColor): boolean {
    return this.isKingInCheck(color) && this.getAllValidMoves(color).length === 0;
  }

  isStalemate(color: PlayerColor): boolean {
    return !this.isKingInCheck(color) && this.getAllValidMoves(color).length === 0;
  }

  private moveToUci(move: Move): string {
    const files = 'abcdefgh';
    const ranks = '87654321';
    return `${files[move.from.col]}${ranks[move.from.row]}${files[move.to.col]}${ranks[move.to.row]}`;
  }
  
  private toAlgebraic(move: Move): string {
    const piece = this.board[move.from.row][move.from.col];
    const target = this.board[move.to.row][move.to.col];
    const files = 'abcdefgh';
    const ranks = '87654321';
    
    let notation = '';
    if (piece?.type !== PieceType.Pawn) {
      notation += piece?.type === PieceType.Knight ? 'N' : piece?.type.charAt(0);
    }
    if (target) {
        if(piece?.type === PieceType.Pawn) notation += files[move.from.col];
        notation += 'x';
    }
    notation += files[move.to.col] + ranks[move.to.row];
    
    // Check for check/checkmate after move for notation
    const tempEngine = new ChessEngine(this);
    tempEngine.performMove(move);
    const opponentColor = this.currentPlayer === PlayerColor.White ? PlayerColor.Black : PlayerColor.White;
    if (tempEngine.isCheckmate(opponentColor)) {
      notation += '#';
    } else if (tempEngine.isKingInCheck(opponentColor)) {
      notation += '+';
    }
    
    return notation;
  }

  private performMove(move: Move): {isCapture: boolean} {
    let newHash = this.zobristKey;
    const piece = this.board[move.from.row][move.from.col];
    if (!piece) return {isCapture: false};

    const capturedPiece = this.board[move.to.row][move.to.col];
    const isCapture = capturedPiece !== null;
    
    // --- Zobrist and State Update ---
    
    // 1. Clear old en-passant square from hash if it exists
    if (this.enPassantTarget) {
      newHash = this.zobrist.updateEnPassant(newHash, this.enPassantTarget.col);
    }
    
    // 2. Handle captures, including en-passant captures
    let isEnPassantCapture = false;
    if (piece.type === PieceType.Pawn && this.enPassantTarget && 
        move.to.row === this.enPassantTarget.row && move.to.col === this.enPassantTarget.col) {
        isEnPassantCapture = true;
        const capturedPawnRow = move.from.row;
        const capturedPawnCol = move.to.col;
        const capturedPawn = this.board[capturedPawnRow][capturedPawnCol]!;
        newHash = this.zobrist.updatePiece(newHash, capturedPawn, capturedPawnRow, capturedPawnCol);
        this.board[capturedPawnRow][capturedPawnCol] = null;
    } else if (capturedPiece) {
        newHash = this.zobrist.updatePiece(newHash, capturedPiece, move.to.row, move.to.col);
    }
    
    // 3. Move the piece on the board and update hash
    newHash = this.zobrist.updatePiece(newHash, piece, move.from.row, move.from.col); // XOR out from old square
    this.board[move.from.row][move.from.col] = null;
    newHash = this.zobrist.updatePiece(newHash, piece, move.to.row, move.to.col); // XOR in to new square
    this.board[move.to.row][move.to.col] = piece;

    // 4. Set new en-passant square if applicable
    this.enPassantTarget = null;
    if (piece.type === PieceType.Pawn && Math.abs(move.from.row - move.to.row) === 2) {
      this.enPassantTarget = { row: (move.from.row + move.to.row) / 2, col: move.from.col };
      newHash = this.zobrist.updateEnPassant(newHash, this.enPassantTarget.col);
    }

    // 5. Update castling rights
    const oldRights = { ...this.castlingRights };
    if (piece.type === PieceType.King) {
        if (piece.color === PlayerColor.White) { this.castlingRights.wK = false; this.castlingRights.wQ = false; }
        else { this.castlingRights.bK = false; this.castlingRights.bQ = false; }
    }
    if (piece.type === PieceType.Rook) {
        if (move.from.row === 7 && move.from.col === 0) this.castlingRights.wQ = false;
        if (move.from.row === 7 && move.from.col === 7) this.castlingRights.wK = false;
        if (move.from.row === 0 && move.from.col === 0) this.castlingRights.bQ = false;
        if (move.from.row === 0 && move.from.col === 7) this.castlingRights.bK = false;
    }
    // If a rook is captured on its home square
    if (capturedPiece?.type === PieceType.Rook) {
        if (move.to.row === 7 && move.to.col === 0) this.castlingRights.wQ = false;
        if (move.to.row === 7 && move.to.col === 7) this.castlingRights.wK = false;
        if (move.to.row === 0 && move.to.col === 0) this.castlingRights.bQ = false;
        if (move.to.row === 0 && move.to.col === 7) this.castlingRights.bK = false;
    }
    
    const changedRights = {
        wK: oldRights.wK !== this.castlingRights.wK,
        wQ: oldRights.wQ !== this.castlingRights.wQ,
        bK: oldRights.bK !== this.castlingRights.bK,
        bQ: oldRights.bQ !== this.castlingRights.bQ,
    };
    newHash = this.zobrist.updateCastling(newHash, changedRights);

    // 6. Handle pawn promotion
    if (piece.type === PieceType.Pawn && (move.to.row === 0 || move.to.row === 7)) {
        const promotedQueen = { ...piece, type: PieceType.Queen };
        newHash = this.zobrist.updatePiece(newHash, piece, move.to.row, move.to.col); // XOR out original pawn at destination
        newHash = this.zobrist.updatePiece(newHash, promotedQueen, move.to.row, move.to.col); // XOR in new queen
        this.board[move.to.row][move.to.col] = promotedQueen;
    }

    // 7. Flip side to move
    newHash = this.zobrist.updateSideToMove(newHash);
    
    this.zobristKey = newHash;

    return { isCapture: isCapture || isEnPassantCapture };
  }


  movePiece(from: SquareIdentifier, to: SquareIdentifier): { isCapture: boolean } | null {
    const validMoves = this.getValidMoves(from);
    const move = validMoves.find(m => m.to.row === to.row && m.to.col === to.col);
    if (!move) return null;

    this.moveHistory.push(this.toAlgebraic(move));
    this.uciMoveHistory.push(this.moveToUci(move));
    const moveResult = this.performMove(move);
    this.currentPlayer = this.currentPlayer === PlayerColor.White ? PlayerColor.Black : PlayerColor.White;
    
    return moveResult;
  }

  public countPieces(): number {
    let count = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.board[r][c]) {
          count++;
        }
      }
    }
    return count;
  }

  public toFEN(): string {
    let fen = '';
    for (let r = 0; r < 8; r++) {
      let emptyCount = 0;
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece) {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          let char = '';
          switch (piece.type) {
            case PieceType.Pawn: char = 'p'; break;
            case PieceType.Knight: char = 'n'; break;
            case PieceType.Bishop: char = 'b'; break;
            case PieceType.Rook: char = 'r'; break;
            case PieceType.Queen: char = 'q'; break;
            case PieceType.King: char = 'k'; break;
          }
          fen += (piece.color === PlayerColor.White) ? char.toUpperCase() : char;
        } else {
          emptyCount++;
        }
      }
      if (emptyCount > 0) {
        fen += emptyCount;
      }
      if (r < 7) {
        fen += '/';
      }
    }

    fen += this.currentPlayer === PlayerColor.White ? ' w' : ' b';
    
    let castlingStr = '';
    if (this.castlingRights.wK) castlingStr += 'K';
    if (this.castlingRights.wQ) castlingStr += 'Q';
    if (this.castlingRights.bK) castlingStr += 'k';
    if (this.castlingRights.bQ) castlingStr += 'q';
    fen += ` ${castlingStr || '-'}`;

    if (this.enPassantTarget) {
      const files = 'abcdefgh';
      const ranks = '87654321';
      fen += ` ${files[this.enPassantTarget.col]}${ranks[this.enPassantTarget.row]}`;
    } else {
      fen += ' -';
    }

    fen += ' 0 1'; // Simplified halfmove/fullmove for tablebase

    return fen;
  }
}