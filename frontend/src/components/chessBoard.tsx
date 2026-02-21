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
  const [players, setPlayers] = useState<any[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const username = localStorage.getItem("ms_chess_username");

    socket.emit("joinGame", {
      gameId: roomId,
      username,
    });

    socket.on("playerColor", setPlayerColor);

    socket.on("boardState", (fen: string) => {
      chess.load(fen);
      setBoard(chess.board());
      setTurn(chess.turn());

      if (chess.isCheckmate()) setStatus("Checkmate!");
      else if (chess.isCheck()) setStatus("Check!");
      else setStatus("");

      // Detect captures
      const history = chess.history({ verbose: true });
      if (history.length > 0) {
        const lastMove = history[history.length - 1];
        if (lastMove.captured) {
          if (lastMove.color === "w") {
            setCapturedBlack(prev => [...prev, lastMove.captured!]);
          } else {
            setCapturedWhite(prev => [...prev, lastMove.captured!]);
          }
        }
      }
    });

    socket.on("playerCount", setPlayerCount);
    socket.on("playersUpdate", (data) => setPlayers(data.players));

    return () => {
      socket.removeAllListeners();
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
    if (playerCount < 2) return;

    const square = String.fromCharCode(97 + col) + (8 - row);
    const squarePiece = chess.get(square);

    // Select piece
    if (!selectedSquare) {
      if (!squarePiece) return;
      if (squarePiece.color !== playerColor) return;

      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setPossibleMoves(moves.map((m) => m.to));
      return;
    }

    // Move piece
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5]">

      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-lg font-semibold">Room: {roomId}</h2>

        {players.length === 2 ? (
          <p className="text-xl font-bold mt-2">
            {players[0]?.username} (White ♔) vs {players[1]?.username} (Black ♚)
          </p>
        ) : (
          <p className="text-blue-600 font-bold mt-2">
            Waiting for opponent...
          </p>
        )}

        <p className="mt-2 font-medium">
          Turn: {turn === "w" ? "White" : "Black"}
        </p>

        {status && (
          <p className="text-red-600 font-bold mt-2">{status}</p>
        )}
      </div>

      {/* Board + Captured Panel */}
      <div className="flex gap-8 items-start">

        {/* Chess Board */}
        <div className="w-[560px] aspect-square border-4 border-black">
          <div className="grid grid-cols-8 w-full h-full">
            {board.map((row, rowIndex) =>
              row.map((squarePiece, colIndex) => {
                const square =
                  String.fromCharCode(97 + colIndex) + (8 - rowIndex);

                const isDark = (rowIndex + colIndex) % 2 === 1;
                const isSelected = selectedSquare === square;
                const isMoveOption = possibleMoves.includes(square);

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                    className={`
                      aspect-square
                      flex items-center justify-center
                      text-4xl
                      relative
                      cursor-pointer
                      ${isDark ? "bg-[#769656]" : "bg-[#EEEED2]"}
                      ${isSelected ? "ring-4 ring-black z-10" : ""}
                    `}
                  >
                    {isMoveOption && (
                      <div className="absolute w-4 h-4 bg-yellow-500 rounded-full"></div>
                    )}

                    {squarePiece && getPieceSymbol(squarePiece)}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Captured Pieces */}
        <div className="w-48 flex flex-col gap-6">

          <div>
            <h3 className="font-semibold mb-2">Captured Black</h3>
            <div className="flex flex-wrap gap-2 text-2xl">
              {capturedBlack.map((p, i) => (
                <span key={i}>
                  {getPieceSymbol({ type: p, color: "b" })}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Captured White</h3>
            <div className="flex flex-wrap gap-2 text-2xl">
              {capturedWhite.map((p, i) => (
                <span key={i}>
                  {getPieceSymbol({ type: p, color: "w" })}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ChessBoard;