
import type { Move, TablebaseCategory } from '../types';

interface TablebaseResponse {
  wdl: -2 | -1 | 0 | 1 | 2;
  dtz: number | null;
  dtm: number | null;
  category: TablebaseCategory;
  moves: {
    uci: string;
    san: string;
    wdl: -2 | -1 | 0 | 1 | 2;
    dtz: number | null;
    dtm: number | null;
    category: TablebaseCategory;
  }[];
}

export function uciToMove(uci: string): Move {
    const files = 'abcdefgh';
    const ranks = '87654321';
    const fromCol = files.indexOf(uci[0]);
    const fromRow = ranks.indexOf(uci[1]);
    const toCol = files.indexOf(uci[2]);
    const toRow = ranks.indexOf(uci[3]);
    return { from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };
}

export async function queryTablebase(fen: string): Promise<Move | null> {
    try {
        const response = await fetch(`https://tablebase.lichess.ovh/standard?fen=${encodeURIComponent(fen)}`);
        if (!response.ok) {
            return null;
        }
        const data: TablebaseResponse = await response.json();
        
        // Prefer a winning move if available
        const winningMoves = data.moves.filter(m => m.category === 'win' || m.category === 'dtz-win' || m.category === 'cursed-win');
        if (winningMoves.length > 0) {
            return uciToMove(winningMoves[0].uci);
        }

        // Otherwise, take the first recommended move (e.g., to draw)
        if (data.moves.length > 0) {
            return uciToMove(data.moves[0].uci);
        }

        return null;
    } catch (error) {
        console.error("Tablebase query failed:", error);
        return null;
    }
}
