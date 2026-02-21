import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const socket = io("http://localhost:5000");
const chess = new Chess();

const ChessBoard = () => {
  const { roomId } = useParams();

  const [board, setBoard] = useState(chess.board());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [playerColor, setPlayerColor] = useState<string | null>(null);
  const [turn, setTurn] = useState<string>("w");
  const [status, setStatus] = useState<string>("");
  const [playerCount, setPlayerCount] = useState(1);
  useEffect(() => {
    if (!roomId) return;

    socket.emit("joinGame", roomId);

    socket.on("playerColor", (color: string) => {
      setPlayerColor(color);
    });

    socket.on("boardState", (fen: string) => {
      chess.load(fen);
      setBoard(chess.board());
      setTurn(chess.turn());

      if (chess.isCheckmate()) {
        setStatus("Checkmate!");
      } else if (chess.isCheck()) {
        setStatus("Check!");
      } else {
        setStatus("");
      }
    });
    socket.on("playerCount", (count: number) => {
  setPlayerCount(count);
});

    return () => {
      socket.off("playerColor");
      socket.off("boardState");
    };
  }, [roomId]);

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

  const handleSquareClick = (row: number, col: number) => {
    const square = String.fromCharCode(97 + col) + (8 - row);
    const squarePiece = chess.get(square);

    // 🚫 Prevent selecting opponent pieces
    if (!selectedSquare) {
      if (squarePiece && squarePiece.color !== playerColor) return;

      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setPossibleMoves(moves.map((m) => m.to));
      return;
    }

    // 🚫 Prevent moving if not your turn
    if (chess.turn() !== playerColor) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    socket.emit("move", {
      gameId: roomId,
      move: {
        from: selectedSquare,
        to: square,
        promotion: "q",
      },
    });

    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">

      {/* PLAYER INFO */}
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold">
          Room: {roomId}
        </h2>

        <h2 className="text-lg">
          You are: {playerColor === "w" ? "White ♔" : "Black ♚"}
        </h2>

        <p className="text-lg">
          Turn: {turn === "w" ? "White" : "Black"}
        </p>

        {status && (
          <p className="text-red-600 font-bold text-xl">
            {status}
          </p>
        )}
      </div>
      {playerCount < 2 && (
  <p className="text-blue-600 font-bold text-lg">
    Waiting for opponent to join...
  </p>
)}

      {/* BOARD */}
      <div className={`grid grid-cols-8 w-[520px] h-[520px] border-4 border-gray-800 ${playerCount < 2 ? "opacity-50 pointer-events-none" : ""}`}>
        {board.map((row, rowIndex) =>
          row.map((squarePiece, colIndex) => {
            const square = String.fromCharCode(97 + colIndex) + (8 - rowIndex);
            const isDark = (rowIndex + colIndex) % 2 === 1;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                className={`
                  flex items-center justify-center text-4xl cursor-pointer
                  ${isDark ? "bg-green-700" : "bg-green-200"}
                  ${selectedSquare === square ? "ring-4 ring-yellow-400" : ""}
                  ${possibleMoves.includes(square) ? "bg-yellow-300" : ""}
                `}
              >
                {squarePiece && getPieceSymbol(squarePiece)}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChessBoard;