import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { Chess } from "chess.js";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

interface GameRoom {
  chess: Chess;
  players: string[];
  usernames: Record<string, string>;
}

const games: Record<string, GameRoom> = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinGame", ({ gameId, username }) => {
    socket.join(gameId);

    if (!games[gameId]) {
      games[gameId] = {
        chess: new Chess(),
        players: [],
        usernames: {},
      };
    }

    const game = games[gameId];

    if (game.players.length < 2 && !game.players.includes(socket.id)) {
      game.players.push(socket.id);
      game.usernames[socket.id] = username;
    }

    const playerIndex = game.players.indexOf(socket.id);
    const color = playerIndex === 0 ? "w" : "b";

    socket.emit("playerColor", color);
    const history = game.chess.history({ verbose: true });
    socket.emit("boardState", {
      fen: game.chess.fen(),
      history: history.map((m) => ({ from: m.from, to: m.to, san: m.san, color: m.color, captured: m.captured })),
    });

    io.to(gameId).emit("playerCount", game.players.length);

    io.to(gameId).emit("playersUpdate", {
      players: game.players.map((id, index) => ({
        id,
        username: game.usernames[id],
        color: index === 0 ? "w" : "b",
      })),
    });
  });

  socket.on("move", ({ gameId, move }) => {
    const game = games[gameId];
    if (!game) {
      socket.emit("moveError", "Game not found");
      return;
    }

    const playerIndex = game.players.indexOf(socket.id);
    if (playerIndex === -1) {
      socket.emit("moveError", "You are not part of this game");
      return;
    }

    const playerColor = playerIndex === 0 ? "w" : "b";

    if (game.chess.turn() !== playerColor) {
      socket.emit("moveError", "Not your turn!");
      return;
    }

    try {
      const result = game.chess.move(move);
      if (result) {
        const history = game.chess.history({ verbose: true });
        io.to(gameId).emit("boardState", {
          fen: game.chess.fen(),
          history: history.map((m) => ({ from: m.from, to: m.to, san: m.san, color: m.color, captured: m.captured })),
        });
      } else {
        socket.emit("moveError", "Invalid move");
      }
    } catch (error: any) {
      console.log("Invalid move:", error.message);
      socket.emit("moveError", error.message || "Invalid move");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});