import { uciToMove } from './tablebaseService';

// --- Configuration ---
const OPENING_BOOK_ENABLED = true;
const OPENING_BOOK_DEBUG = false; // Set to true to log book moves to console
const BOOK_PATHS = [
    "/books/mainline.json",
    // "/books/human.json", // Add more books as needed
];
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface BookMove {
    uci: string;
    weight: number;
}

interface CacheEntry {
    uci: string;
    timestamp: number;
}

type PolyglotBook = Record<string, BookMove[]>;

class PolyglotBookService {
    private isInitialized = false;
    private isEnabled = false;
    private book: PolyglotBook = {};
    private bookCache = new Map<bigint, CacheEntry>();

    public async initialize() {
        if (this.isInitialized || !OPENING_BOOK_ENABLED) {
            return;
        }
        this.isInitialized = true;

        try {
            const allBooks = await Promise.all(
                BOOK_PATHS.map(path => fetch(path).then(res => {
                    if (!res.ok) throw new Error(`Failed to load book: ${path}`);
                    return res.json();
                }))
            );
            
            // Blend all books into one, merging moves for the same position
            this.book = allBooks.reduce((merged: PolyglotBook, currentBook: PolyglotBook) => {
                for (const key in currentBook) {
                    if (merged[key]) {
                        merged[key].push(...currentBook[key]); // Blend by concatenating moves
                    } else {
                        merged[key] = currentBook[key]; // Add new entry
                    }
                }
                return merged;
            }, {});
            
            this.isEnabled = true;
            if (OPENING_BOOK_DEBUG) {
                console.log('[Telemetry] Polyglot opening book loaded successfully.');
            }

        } catch (error) {
            this.isEnabled = false;
            console.error("Failed to initialize Polyglot opening book:", error);
        }
    }

    // Simple seeded PRNG for deterministic testing
    private seededRandom(seed: number): number {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    public getBookMove(zobristKey: bigint, seed?: number): string | null {
        if (!this.isEnabled) {
            return null;
        }

        // Check cache first for performance, respecting TTL
        const cachedEntry = this.bookCache.get(zobristKey);
        if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_TTL_MS)) {
            return cachedEntry.uci;
        }

        const keyStr = zobristKey.toString(16).toUpperCase();
        const moves = this.book[keyStr];

        if (moves && moves.length > 0) {
            // Weighted random selection
            const totalWeight = moves.reduce((sum, move) => sum + move.weight, 0);
            const randomValue = seed !== undefined ? this.seededRandom(seed) : Math.random();
            let random = randomValue * totalWeight;
            
            for (const move of moves) {
                random -= move.weight;
                if (random <= 0) {
                    if (OPENING_BOOK_DEBUG) {
                       console.log(`[Telemetry] Book move found for key ${keyStr}: ${move.uci} (Source: Polyglot)`);
                    }
                    this.bookCache.set(zobristKey, { uci: move.uci, timestamp: Date.now() });
                    return move.uci;
                }
            }
        }
        
        if (OPENING_BOOK_DEBUG) {
            const history = (window as any).chessApp?.engine.getUciMoveHistory() || [];
            if(history.length < 10) console.log(`[Telemetry] Out of book. Key: ${keyStr}`);
        }

        return null;
    }
}

export const polyglotBookService = new PolyglotBookService();