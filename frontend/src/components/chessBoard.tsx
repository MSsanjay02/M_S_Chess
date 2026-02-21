import { useEffect, useState, useRef } from "react";
import { Chess, type Square } from "chess.js";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
const chess = new Chess();

interface Move {
  from: string;
  to: string;
  san: string;
  color: string;
  captured?: string;
}

const ChessBoard = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(chess.board());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [playerColor, setPlayerColor] = useState<string | null>(null);
  const [turn, setTurn] = useState<string>("w");
  const [status, setStatus] = useState<string>("");
  const [gameStatus, setGameStatus] = useState<"playing" | "checkmate" | "stalemate" | "draw">("playing");
  const [playerCount, setPlayerCount] = useState(1);
  const [players, setPlayers] = useState<any[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [isInCheck, setIsInCheck] = useState<{ white: boolean; black: boolean }>({ white: false, black: false });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSquare, setDraggedSquare] = useState<string | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) return;

    const username = localStorage.getItem("ms_chess_username");
    if (!username) {
      navigate("/login");
      return;
    }

    socket.emit("joinGame", {
      gameId: roomId,
      username,
    });

    socket.on("playerColor", setPlayerColor);

    socket.on("boardState", (payload: { fen: string; history?: Move[] } | string) => {
      const fen = typeof payload === "string" ? payload : payload.fen;
      const serverHistory = typeof payload === "string" ? [] : payload.history ?? [];
      chess.load(fen);
      setBoard(chess.board());
      setTurn(chess.turn());

      // Update check status
      setIsInCheck({
        white: chess.inCheck() && chess.turn() === "b",
        black: chess.inCheck() && chess.turn() === "w",
      });

      // Update game status
      if (chess.isCheckmate()) {
        setStatus("Checkmate!");
        setGameStatus("checkmate");
      } else if (chess.isStalemate()) {
        setStatus("Stalemate!");
        setGameStatus("stalemate");
      } else if (chess.isDraw()) {
        setStatus("Draw!");
        setGameStatus("draw");
      } else if (chess.isCheck()) {
        setStatus(`Check! ${chess.turn() === "w" ? "White" : "Black"} is in check`);
        setGameStatus("playing");
      } else {
        setStatus("");
        setGameStatus("playing");
      }

      // Move history from server (FEN does not include history)
      setMoveHistory(serverHistory);

      // Update last move
      if (serverHistory.length > 0) {
        const last = serverHistory[serverHistory.length - 1];
        setLastMove({ from: last.from, to: last.to });
      } else {
        setLastMove(null);
      }

      // Rebuild captured from server history
      const blackCaptured: string[] = [];
      const whiteCaptured: string[] = [];
      for (const move of serverHistory) {
        if (move.captured) {
          if (move.color === "w") blackCaptured.push(move.captured);
          else whiteCaptured.push(move.captured);
        }
      }
      setCapturedBlack(blackCaptured);
      setCapturedWhite(whiteCaptured);
    });

    socket.on("moveError", (error: string) => {
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(""), 3000);
    });

    socket.on("playerCount", setPlayerCount);
    socket.on("playersUpdate", (data) => setPlayers(data.players));

    return () => {
      socket.removeAllListeners();
    };
  }, [roomId, navigate]);

  const getPieceSymbol = (piece: any) => {
    const symbols: any = {
      p: piece.color === "w" ? "♙" : "♟",
      r: piece.color === "w" ? "♖" : "♜",
      n: piece.color === "w" ? "♘" : "♞",
      b: piece.color === "w" ? "♗" : "♝",
      q: piece.color === "w" ? "♕" : "♛",
      k: piece.color === "w" ? "♔" : "♚",
    };
    return symbols[piece.type];
  };

  const getSquareFromPosition = (row: number, col: number): Square => {
    return (String.fromCharCode(97 + col) + (8 - row)) as Square;
  };

  const handleSquareClick = (row: number, col: number) => {
    if (playerCount < 2 || gameStatus !== "playing") return;

    const square = getSquareFromPosition(row, col);
    const squarePiece = chess.get(square);

    // Select piece
    if (!selectedSquare) {
      if (!squarePiece) return;
      if (squarePiece.color !== playerColor) return;
      if (chess.turn() !== playerColor) {
        setErrorMessage("Not your turn!");
        setTimeout(() => setErrorMessage(""), 2000);
        return;
      }

      setSelectedSquare(square);
      const moves = chess.moves({ square: square as Square, verbose: true });
      setPossibleMoves(moves.map((m) => m.to));
      return;
    }

    // Move piece
    if (chess.turn() !== playerColor) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    // Check if promotion is needed
    const piece = chess.get(selectedSquare as Square);
    if (piece?.type === "p" && ((piece.color === "w" && row === 0) || (piece.color === "b" && row === 7))) {
      setPendingPromotion({ from: selectedSquare, to: square });
      setShowPromotionDialog(true);
      return;
    }

    makeMove(selectedSquare, square);
    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  const makeMove = (from: string, to: string, promotion: string = "q") => {
    if (!roomId) return;

    socket.emit("move", {
      gameId: roomId,
      move: {
        from,
        to,
        promotion,
      },
    });

    setSelectedSquare(null);
    setPossibleMoves([]);
    setShowPromotionDialog(false);
    setPendingPromotion(null);
  };

  const handlePromotion = (piece: string) => {
    if (!pendingPromotion) return;
    makeMove(pendingPromotion.from, pendingPromotion.to, piece);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, row: number, col: number) => {
    if (playerCount < 2 || gameStatus !== "playing") {
      e.preventDefault();
      return;
    }

    const square = getSquareFromPosition(row, col);
    const squarePiece = chess.get(square);

    if (!squarePiece || squarePiece.color !== playerColor) {
      e.preventDefault();
      return;
    }

    if (chess.turn() !== playerColor) {
      e.preventDefault();
      setErrorMessage("Not your turn!");
      setTimeout(() => setErrorMessage(""), 2000);
      return;
    }

    setIsDragging(true);
    setDraggedSquare(square);
    setSelectedSquare(square);
    const moves = chess.moves({ square: square as Square, verbose: true });
    setPossibleMoves(moves.map((m) => m.to));

    // Set drag image
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    setIsDragging(false);

    if (!draggedSquare) {
      setDraggedSquare(null);
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    const targetSquare = getSquareFromPosition(row, col);

    // Only allow drop on a valid move square
    if (!possibleMoves.includes(targetSquare)) {
      setErrorMessage("Invalid move");
      setTimeout(() => setErrorMessage(""), 2000);
      setSelectedSquare(null);
      setPossibleMoves([]);
      setDraggedSquare(null);
      return;
    }

    if (chess.turn() !== playerColor) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      setDraggedSquare(null);
      return;
    }

    // Check if promotion is needed
    const piece = chess.get(draggedSquare as Square);
    if (piece?.type === "p" && ((piece.color === "w" && row === 0) || (piece.color === "b" && row === 7))) {
      setPendingPromotion({ from: draggedSquare, to: targetSquare });
      setShowPromotionDialog(true);
      setDraggedSquare(null);
      return;
    }

    makeMove(draggedSquare, targetSquare);
    setDraggedSquare(null);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (!selectedSquare) {
      setDraggedSquare(null);
    }
  };


  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--chess-bg)" }}>
      {/* Top bar */}
      <header className="flex-shrink-0 border-b px-4 py-3 flex flex-wrap items-center justify-between gap-3" style={{ borderColor: "var(--chess-border)", background: "var(--chess-surface)" }}>
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg" style={{ color: "var(--chess-text)" }}>Room: {roomId}</span>
          <button
            onClick={() => navigate("/lobby")}
            className="px-4 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Leave Game
          </button>
        </div>
        {players.length === 2 ? (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1.5 rounded-lg font-semibold bg-stone-200 text-stone-800">{players[0]?.username} (White)</span>
            <span className="font-bold" style={{ color: "var(--chess-text)" }}>vs</span>
            <span className="px-3 py-1.5 rounded-lg font-semibold bg-stone-700 text-stone-100">{players[1]?.username} (Black)</span>
          </div>
        ) : (
          <span className="px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white">Waiting for opponent...</span>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1.5 rounded-lg font-semibold ${turn === playerColor ? "bg-green-600 text-white" : "bg-stone-600 text-stone-200"}`}>
            Turn: {turn === "w" ? "White" : "Black"}
          </span>
          {isInCheck.white && <span className="px-3 py-1.5 rounded-lg font-bold bg-red-600 text-white animate-pulse">White in Check</span>}
          {isInCheck.black && <span className="px-3 py-1.5 rounded-lg font-bold bg-red-600 text-white animate-pulse">Black in Check</span>}
        </div>
      </header>

      {/* Error toast */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 font-semibold">
            <span>⚠️</span> {errorMessage}
          </div>
        </div>
      )}

      {/* Status banner */}
      {status && (
        <div className={`fixed top-4 right-4 z-50 animate-slide-down px-6 py-3 rounded-lg shadow-xl font-bold text-white ${
          gameStatus === "checkmate" ? "bg-red-600" : gameStatus === "stalemate" || gameStatus === "draw" ? "bg-amber-600" : "bg-orange-500"
        }`}>
          {status}
        </div>
      )}

      {/* Main: board center, side panels same width so no empty space */}
      <main className="flex-1 flex items-center justify-center gap-6 p-4 overflow-auto">
        {/* Left panel */}
        <div className="flex-shrink-0 w-56 flex flex-col gap-4">
          <section className="rounded-xl p-4 border overflow-hidden" style={{ background: "var(--chess-surface)", borderColor: "var(--chess-border)" }}>
            <h3 className="font-bold mb-3 text-sm uppercase tracking-wider" style={{ color: "var(--chess-text)" }}>Captured</h3>
            <div className="mb-3">
              <p className="text-xs mb-1 opacity-75">By White</p>
              <div className="min-h-8 flex flex-wrap gap-1 p-2 rounded bg-stone-800">
                {capturedBlack.length === 0 ? <span className="text-stone-500 text-sm">—</span> : capturedBlack.map((p, i) => (
                  <span key={i} className="chess-piece text-2xl text-stone-300">{getPieceSymbol({ type: p, color: "b" })}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs mb-1 opacity-75">By Black</p>
              <div className="min-h-8 flex flex-wrap gap-1 p-2 rounded bg-stone-700">
                {capturedWhite.length === 0 ? <span className="text-stone-500 text-sm">—</span> : capturedWhite.map((p, i) => (
                  <span key={i} className="chess-piece text-2xl text-stone-200">{getPieceSymbol({ type: p, color: "w" })}</span>
                ))}
              </div>
            </div>
          </section>
          <section className="rounded-xl p-4 border flex-1 min-h-0 flex flex-col overflow-hidden" style={{ background: "var(--chess-surface)", borderColor: "var(--chess-border)" }}>
            <h3 className="font-bold mb-3 text-sm uppercase tracking-wider" style={{ color: "var(--chess-text)" }}>Moves ({moveHistory.length})</h3>
            <div className="flex-1 overflow-y-auto space-y-1 text-sm">
              {moveHistory.length === 0 ? (
                <p className="opacity-60">No moves yet</p>
              ) : (
                moveHistory.map((move, index) => (
                  <div key={index} className={`p-2 rounded font-mono ${index % 2 === 0 ? "bg-white/5" : "bg-white/10"}`} style={{ color: "var(--chess-text)" }}>
                    {Math.floor(index / 2) + 1}.{index % 2 === 0 ? " " : " … "}{move.san}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Board */}
        <div className="flex-shrink-0" ref={boardRef}>
          <div className="w-[min(72vw,560px)] aspect-square max-w-full grid grid-cols-8 rounded-lg overflow-hidden border-4 shadow-2xl" style={{ borderColor: "var(--chess-border)", background: "var(--chess-board-dark)" }}>
            {board.map((row, rowIndex) =>
              row.map((squarePiece, colIndex) => {
                const square = getSquareFromPosition(rowIndex, colIndex);
                const isDark = (rowIndex + colIndex) % 2 === 1;
                const isSelected = selectedSquare === square;
                const isMoveOption = possibleMoves.includes(square);
                const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
                const isKingInCheck = squarePiece?.type === "k" && ((squarePiece.color === "w" && isInCheck.white) || (squarePiece.color === "b" && isInCheck.black));

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                    onDragStart={(e) => handleDragStart(e, rowIndex, colIndex)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                    onDragEnd={handleDragEnd}
                    draggable={!!squarePiece && squarePiece.color === playerColor && chess.turn() === playerColor}
                    className={`
                      aspect-square flex items-center justify-center relative cursor-pointer transition-colors
                      ${isDark ? "bg-[#b58863]" : "bg-[#f0d9b5]"}
                      ${isSelected ? "ring-2 ring-blue-500 ring-offset-1 z-10 bg-blue-300" : ""}
                      ${isLastMove ? "bg-amber-300/70" : ""}
                      ${isKingInCheck ? "bg-red-400 animate-pulse" : ""}
                      ${isMoveOption && !squarePiece ? "bg-green-400/60" : ""}
                      ${isMoveOption && squarePiece ? "bg-red-400/60" : ""}
                      ${isDragging && draggedSquare === square ? "opacity-60" : ""}
                    `}
                  >
                    {isMoveOption && !squarePiece && <div className="absolute w-5 h-5 rounded-full bg-green-600/80 border-2 border-green-800" />}
                    {isMoveOption && squarePiece && <div className="absolute inset-0 bg-red-500/50 rounded border-2 border-red-700" />}
                    {squarePiece && (
                      <span className={`chess-piece select-none text-4xl md:text-5xl ${isDragging && draggedSquare === square ? "opacity-60 scale-110" : ""} ${squarePiece.color === "w" ? "text-stone-900" : "text-stone-900"}`}>
                        {getPieceSymbol(squarePiece)}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-shrink-0 w-56 rounded-xl p-4 border flex flex-col gap-4" style={{ background: "var(--chess-surface)", borderColor: "var(--chess-border)" }}>
          <div>
            <p className="text-xs uppercase tracking-wider opacity-75">You play as</p>
            <p className="font-bold text-lg chess-piece">{playerColor === "w" ? "White ♔" : "Black ♚"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider opacity-75">Total moves</p>
            <p className="font-bold text-xl" style={{ color: "var(--chess-text)" }}>{moveHistory.length}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider opacity-75">Status</p>
            <p className={`font-bold ${gameStatus === "playing" ? "text-green-400" : gameStatus === "checkmate" ? "text-red-400" : "text-amber-400"}`}>
              {gameStatus.charAt(0).toUpperCase() + gameStatus.slice(1)}
            </p>
          </div>
        </div>
      </main>

      {/* Promotion dialog */}
      {showPromotionDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-stone-800 rounded-xl p-6 shadow-2xl border border-stone-600">
            <h3 className="text-lg font-bold mb-4 text-center text-white">Promote to</h3>
            <div className="flex gap-4">
              {["q", "r", "b", "n"].map((piece) => (
                <button
                  key={piece}
                  onClick={() => handlePromotion(piece)}
                  className="chess-piece text-5xl p-4 rounded-lg bg-stone-700 hover:bg-stone-600 text-white transition-colors"
                >
                  {getPieceSymbol({ type: piece, color: playerColor || "w" })}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessBoard;
