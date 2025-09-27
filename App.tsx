import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Chessboard from './components/Chessboard';
import GameStatus from './components/GameStatus';
import MoveHistory from './components/MoveHistory';
import GameControls from './components/GameControls';
import GameOverOverlay from './components/GameOverOverlay';
import OpeningDisplay from './components/OpeningDisplay';
import { ChessEngine } from './services/chessEngine';
import { findBestMove } from './services/aiService';
import { getOpening } from './services/openingBook';
import { soundService } from './services/soundService';
import type { SquareIdentifier, Move, GameStatus as GameStatusType, AIPersonality, Opening } from './types';
import { PlayerColor } from './types';


export default function App() {
  const [engine, setEngine] = useState(new ChessEngine());
  const [selectedSquare, setSelectedSquare] = useState<SquareIdentifier | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatusType>("White's Turn");
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiPersonality, setAiPersonality] = useState<AIPersonality>('Minimax The Tactician');
  const [hint, setHint] = useState<Move | null>(null);
  const [opening, setOpening] = useState<Opening | null>(null);
  const [isOutOfBook, setIsOutOfBook] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  const board = useMemo(() => engine.getBoard(), [engine]);
  const currentPlayer = useMemo(() => engine.getCurrentPlayer(), [engine]);
  const kingInCheckSquare = useMemo(() => engine.getKingInCheckSquare(), [engine]);
  const moveHistory = useMemo(() => engine.getMoveHistory(), [engine]);

  const updateOpeningStatus = useCallback(() => {
    if (isOutOfBook) return;
    
    const uciHistory = engine.getUciMoveHistory();
    if (uciHistory.length === 0) return;

    const { current, isStillInBook } = getOpening(uciHistory);
    
    if (current) {
        setOpening(current);
    }
    
    if (!isStillInBook) {
        setIsOutOfBook(true);
    }
  }, [engine, isOutOfBook]);
  
  const updateGameStatus = useCallback(() => {
    if (engine.isCheckmate(engine.getCurrentPlayer())) {
      const winner = engine.getCurrentPlayer() === PlayerColor.White ? 'Black' : 'White';
      setGameStatus(`Checkmate! ${winner} wins.`);
      setGameResult(`Checkmate! ${winner} wins.`);
      soundService.playEnd();
    } else if (engine.isStalemate(engine.getCurrentPlayer())) {
      setGameStatus('Stalemate! The game is a draw.');
      setGameResult('Stalemate! The game is a draw.');
      soundService.playEnd();
    } else if (engine.isKingInCheck(engine.getCurrentPlayer())) {
      setGameStatus(`${engine.getCurrentPlayer()}'s Turn - Check!`);
      soundService.playCheck();
    } else {
      setGameStatus(`${engine.getCurrentPlayer()}'s Turn`);
    }
    updateOpeningStatus();
  }, [engine, updateOpeningStatus]);

  const handlePlayerMove = useCallback((from: SquareIdentifier, to: SquareIdentifier) => {
    const moveResult = engine.movePiece(from, to);
    if (moveResult) {
      if (moveResult.isCapture) {
        soundService.playCapture();
      } else {
        soundService.playMove();
      }
      setEngine(new ChessEngine(engine)); // Create a new instance to trigger re-render
      setSelectedSquare(null);
      setValidMoves([]);
      setHint(null);
      updateGameStatus();
      return true;
    }
    return false;
  }, [engine, updateGameStatus]);

  const handleAiMove = useCallback(async () => {
    setIsAiThinking(true);
    setGameStatus("Black is contemplating...");
    
    // Natural delay for AI 'thinking'
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const bestMove = await findBestMove(engine, 3, aiPersonality);

    if (bestMove) {
      handlePlayerMove(bestMove.from, bestMove.to);
    }
    setIsAiThinking(false);
  }, [engine, handlePlayerMove, aiPersonality]);

  useEffect(() => {
    if (currentPlayer === PlayerColor.Black && !gameResult && !isAiThinking) {
      handleAiMove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, gameResult, engine]);

  const handleSquareClick = (row: number, col: number) => {
    if (!isAudioUnlocked) {
      soundService.unlockAudio();
      setIsAudioUnlocked(true);
    }

    if (gameResult || isAiThinking) return;

    if (selectedSquare) {
      const move = validMoves.find(m => m.to.row === row && m.to.col === col);
      if (move) {
        handlePlayerMove(selectedSquare, { row, col });
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } else {
      const piece = board[row][col];
      if (piece && piece.color === currentPlayer) {
        const moves = engine.getValidMoves({ row, col });
        setSelectedSquare({ row, col });
        setValidMoves(moves);
      }
    }
  };

  const handleNewGame = () => {
    setEngine(new ChessEngine());
    setSelectedSquare(null);
    setValidMoves([]);
    setGameStatus("White's Turn");
    setGameResult(null);
    setIsAiThinking(false);
    setHint(null);
    setOpening(null);
    setIsOutOfBook(false);
  };

  const handleRequestHint = async () => {
    if(currentPlayer === PlayerColor.White && !gameResult && !isAiThinking) {
        const hintMove = await findBestMove(engine, 3, aiPersonality);
        setHint(hintMove);
    }
  };

  return (
    <div 
        className="min-h-screen flex flex-col items-center justify-center p-4 bg-stone-900 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')]">
      <h1 className="text-5xl font-bold text-amber-100 mb-6 tracking-widest shadow-lg">Renaissance Chess</h1>
      <div className="flex flex-col lg:flex-row items-start gap-8">
        <Chessboard 
          board={board}
          onSquareClick={handleSquareClick}
          selectedSquare={selectedSquare}
          validMoves={validMoves}
          kingInCheckSquare={kingInCheckSquare}
          hint={hint}
        />
        <aside className="w-full lg:w-80 p-6 bg-stone-900/50 backdrop-blur-sm rounded-lg shadow-2xl border border-stone-700 flex flex-col gap-6">
          <GameStatus status={gameStatus} />
          <OpeningDisplay opening={opening} isOutOfBook={isOutOfBook} />
          <MoveHistory moves={moveHistory} onRequestHint={handleRequestHint} />
          <GameControls onNewGame={handleNewGame} setAiPersonality={setAiPersonality} isGameActive={moveHistory.length > 0} />
        </aside>
      </div>
      {gameResult && <GameOverOverlay result={gameResult} onNewGame={handleNewGame} />}
    </div>
  );
}