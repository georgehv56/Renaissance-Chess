
import type { Opening } from '../types';

const openingBook: { moves: string; data: Opening }[] = [
  // 1-ply
  { moves: 'e2e4', data: { eco: 'B00', name: "King's Pawn Opening" } },
  { moves: 'd2d4', data: { eco: 'A40', name: "Queen's Pawn Opening" } },
  { moves: 'c2c4', data: { eco: 'A10', name: 'English Opening' } },
  { moves: 'g1f3', data: { eco: 'A04', name: 'Réti Opening' } },
  { moves: 'f2f4', data: { eco: 'A02', name: 'Bird\'s Opening' } },
  
  // 2-ply
  { moves: 'e2e4,e7e5', data: { eco: 'C20', name: 'King\'s Pawn Game' } },
  { moves: 'e2e4,c7c5', data: { eco: 'B20', name: 'Sicilian Defense' } },
  { moves: 'e2e4,e7e6', data: { eco: 'C00', name: 'French Defense' } },
  { moves: 'e2e4,d7d5', data: { eco: 'B01', name: 'Scandinavian Defense' } },
  { moves: 'e2e4,c7c6', data: { eco: 'B10', name: 'Caro-Kann Defense' } },
  { moves: 'd2d4,d7d5', data: { eco: 'D00', name: 'Queen\'s Pawn Game' } },
  { moves: 'd2d4,g8f6', data: { eco: 'A45', name: 'Indian Defense' } },
  { moves: 'c2c4,e7e5', data: { eco: 'A20', name: 'English Opening' } },
  { moves: 'g1f3,d7d5', data: { eco: 'A06', name: 'Réti Opening' } },
  
  // 3-ply
  { moves: 'e2e4,e7e5,g1f3', data: { eco: 'C40', name: "King's Knight Opening" } },
  { moves: 'e2e4,c7c5,g1f3', data: { eco: 'B21', name: 'Sicilian, Smith-Morra' } },
  { moves: 'd2d4,d7d5,c2c4', data: { eco: 'D06', name: "Queen's Gambit" } },
  { moves: 'e2e4,e7e6,d2d4', data: { eco: 'C01', name: 'French, Exchange' } },
  { moves: 'e2e4,c7c6,d2d4', data: { eco: 'B12', name: 'Caro-Kann, Advance' } },
  
  // 4-ply
  { moves: 'e2e4,e7e5,g1f3,b8c6', data: { eco: 'C44', name: 'Italian/Scotch Game' } },
  { moves: 'e2e4,e7e5,g1f3,g8f6', data: { eco: 'C42', name: "Petrov's Defense" } },
  { moves: 'e2e4,c7c5,g1f3,d7d6', data: { eco: 'B50', name: 'Sicilian Defense' } },
  { moves: 'e2e4,c7c5,g1f3,b8c6', data: { eco: 'B30', name: 'Sicilian, Rossolimo' } },
  { moves: 'd2d4,d7d5,c2c4,e7e6', data: { eco: 'D30', name: "Queen's Gambit Declined" } },
  { moves: 'd2d4,d7d5,c2c4,d5c4', data: { eco: 'D20', name: "Queen's Gambit Accepted" } },
  { moves: 'd2d4,d7d5,c2c4,c7c6', data: { eco: 'D10', name: 'Slav Defense' } },
  { moves: 'd2d4,g8f6,c2c4,e7e6', data: { eco: 'E10', name: 'Blumenfeld Countergambit' } },
  { moves: 'd2d4,g8f6,c2c4,g7g6', data: { eco: 'E60', name: 'King\'s Indian Defense' } },

  // 5-ply
  { moves: 'e2e4,e7e5,g1f3,b8c6,f1c4', data: { eco: 'C50', name: 'Italian Game' } },
  { moves: 'e2e4,e7e5,g1f3,b8c6,f1b5', data: { eco: 'C60', name: 'Ruy López' } },
  { moves: 'e2e4,e7e5,g1f3,b8c6,d2d4', data: { eco: 'C45', name: 'Scotch Game' } },
  { moves: 'e2e4,c7c5,g1f3,d7d6,d2d4', data: { eco: 'B53', name: 'Sicilian, Chekhover' } },
  { moves: 'd2d4,g8f6,c2c4,e7e6,g1f3', data: { eco: 'E12', name: 'Queen\'s Indian Defense' } },

  // 6-ply
  { moves: 'e2e4,e7e5,g1f3,b8c6,f1c4,f8c5', data: { eco: 'C53', name: 'Giuoco Piano' } },
  { moves: 'e2e4,e7e5,g1f3,b8c6,f1c4,g8f6', data: { eco: 'C55', name: 'Two Knights Defense' } },
  { moves: 'e2e4,e7e5,g1f3,b8c6,f1b5,a7a6', data: { eco: 'C70', name: 'Ruy López, Morphy Defense' } },
  { moves: 'e2e4,c7c5,g1f3,d7d6,d2d4,c5d4', data: { eco: 'B54', name: 'Sicilian, Modern Variations' } },
  { moves: 'd2d4,g8f6,c2c4,e7e6,g1f3,b7b6', data: { eco: 'E12', name: 'Queen\'s Indian Defense' } },
  { moves: 'd2d4,g8f6,c2c4,g7g6,b1c3,f8g7', data: { eco: 'E90', name: 'King\'s Indian, Classical' } },

  // 7-ply
  { moves: 'e2e4,e7e5,g1f3,b8c6,f1b5,a7a6,b5a4', data: { eco: 'C77', name: 'Ruy López, Morphy Defense' } },
  { moves: 'e2e4,c7c5,g1f3,d7d6,d2d4,c5d4,f3d4', data: { eco: 'B56', name: 'Sicilian' } },
  { moves: 'e2e4,e7e5,g1f3,b8c6,f1c4,f8c5,c2c3', data: { eco: 'C54', name: 'Giuoco Piano' } },

  // 8-ply
  { moves: 'e2e4,e7e5,g1f3,b8c6,f1b5,a7a6,b5a4,g8f6', data: { eco: 'C78', name: 'Ruy López, Morphy Defense' } },
  { moves: 'e2e4,c7c5,g1f3,d7d6,d2d4,c5d4,f3d4,g8f6', data: { eco: 'B90', name: 'Sicilian, Najdorf' } },
  { moves: 'e2e4,c7c5,g1f3,d7d6,d2d4,c5d4,f3d4,e7e6', data: { eco: 'B53', name: 'Sicilian, Taimanov' } },
  
  // 9-ply
  { moves: 'e2e4,e7e5,g1f3,b8c6,f1b5,a7a6,b5a4,g8f6,e1g1', data: { eco: 'C84', name: 'Ruy López, Closed' } },
  { moves: 'e2e4,c7c5,g1f3,d7d6,d2d4,c5d4,f3d4,g8f6,b1c3', data: { eco: 'B90', name: 'Sicilian, Najdorf' } },
];

interface OpeningBookResult {
    current: Opening | null;
    bookMove: string | null;
    isStillInBook: boolean;
}

export function getOpening(uciMoveHistory: string[]): OpeningBookResult {
    if (uciMoveHistory.length === 0) {
        return { current: null, bookMove: "e2e4", isStillInBook: true };
    }
    
    const moveKey = uciMoveHistory.join(',');
    
    let currentOpening: Opening | null = null;
    let longestMatch = '';

    // Find the opening name for the longest prefix of the current game
    for (const entry of openingBook) {
        if (moveKey.startsWith(entry.moves) && entry.moves.length > longestMatch.length) {
            longestMatch = entry.moves;
            currentOpening = entry.data;
        }
    }

    // Check if the game is still following any known book line
    const isStillInBook = openingBook.some(entry => entry.moves.startsWith(moveKey));
    
    // Find a potential book move for the AI
    let bookMove: string | null = null;
    if (isStillInBook) {
        const potentialReplies: string[] = [];
        const nextMovePrefix = moveKey + ',';

        for(const entry of openingBook) {
            if(entry.moves.startsWith(nextMovePrefix)) {
                const remainingMoves = entry.moves.substring(nextMovePrefix.length);
                const nextMove = remainingMoves.split(',')[0];
                if(nextMove) {
                    potentialReplies.push(nextMove);
                }
            }
        }
        if(potentialReplies.length > 0) {
            bookMove = potentialReplies[Math.floor(Math.random() * potentialReplies.length)];
        }
    }
    
    return {
      current: currentOpening,
      bookMove: bookMove,
      isStillInBook: isStillInBook,
    };
}
