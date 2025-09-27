import { Board, Piece, PlayerColor, PieceType, Move, CastlingRights, SquareIdentifier } from "../types";

// Maps piece type and color to a single index (0-11)
const pieceIndexMap: Record<PlayerColor, Record<PieceType, number>> = {
    [PlayerColor.White]: {
        [PieceType.Pawn]: 0,
        [PieceType.Knight]: 1,
        [PieceType.Bishop]: 2,
        [PieceType.Rook]: 3,
        [PieceType.Queen]: 4,
        [PieceType.King]: 5,
    },
    [PlayerColor.Black]: {
        [PieceType.Pawn]: 6,
        [PieceType.Knight]: 7,
        [PieceType.Bishop]: 8,
        [PieceType.Rook]: 9,
        [PieceType.Queen]: 10,
        [PieceType.King]: 11,
    }
};

export class Zobrist {
    private pieceKeys: bigint[][][]; // [piece][row][col]
    private blackToMoveKey: bigint;
    private castlingKeys: bigint[]; // [wK, wQ, bK, bQ]
    private enPassantFileKeys: bigint[]; // [file a, file b, ..., file h]

    constructor() {
        this.pieceKeys = Array(12).fill(0).map(() => 
            Array(8).fill(0).map(() => 
                Array(8).fill(0n)
            )
        );
        this.blackToMoveKey = 0n;
        this.castlingKeys = Array(4).fill(0n);
        this.enPassantFileKeys = Array(8).fill(0n);
        this.initRandomKeys();
    }

    private random64(): bigint {
        const a = BigInt(Math.floor(Math.random() * 0xFFFFFFFF));
        const b = BigInt(Math.floor(Math.random() * 0xFFFFFFFF));
        return (a << 32n) | b;
    }

    private initRandomKeys() {
        for (let piece = 0; piece < 12; piece++) {
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    this.pieceKeys[piece][row][col] = this.random64();
                }
            }
        }
        this.blackToMoveKey = this.random64();
        for (let i = 0; i < 4; i++) {
            this.castlingKeys[i] = this.random64();
        }
        for (let i = 0; i < 8; i++) {
            this.enPassantFileKeys[i] = this.random64();
        }
    }

    public computeHash(board: Board, currentPlayer: PlayerColor, castlingRights: CastlingRights, enPassantTarget: SquareIdentifier | null): bigint {
        let h = 0n;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const pieceIndex = pieceIndexMap[piece.color][piece.type];
                    h ^= this.pieceKeys[pieceIndex][row][col];
                }
            }
        }
        if (currentPlayer === PlayerColor.Black) {
            h ^= this.blackToMoveKey;
        }
        if (castlingRights.wK) h ^= this.castlingKeys[0];
        if (castlingRights.wQ) h ^= this.castlingKeys[1];
        if (castlingRights.bK) h ^= this.castlingKeys[2];
        if (castlingRights.bQ) h ^= this.castlingKeys[3];

        if (enPassantTarget) {
            h ^= this.enPassantFileKeys[enPassantTarget.col];
        }

        return h;
    }

    public updatePiece(hash: bigint, piece: Piece, row: number, col: number): bigint {
        const pieceIndex = pieceIndexMap[piece.color][piece.type];
        return hash ^ this.pieceKeys[pieceIndex][row][col];
    }

    public updateSideToMove(hash: bigint): bigint {
        return hash ^ this.blackToMoveKey;
    }

    public updateCastling(hash: bigint, rights: { wK?: boolean, wQ?: boolean, bK?: boolean, bQ?: boolean }): bigint {
        let newHash = hash;
        if (rights.wK) newHash ^= this.castlingKeys[0];
        if (rights.wQ) newHash ^= this.castlingKeys[1];
        if (rights.bK) newHash ^= this.castlingKeys[2];
        if (rights.bQ) newHash ^= this.castlingKeys[3];
        return newHash;
    }
    
    public updateEnPassant(hash: bigint, col: number): bigint {
        return hash ^ this.enPassantFileKeys[col];
    }
}