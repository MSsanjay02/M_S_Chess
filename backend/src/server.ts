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
    socket.emit("boardState", game.chess.fen());

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
    if (!game) return;

    const playerIndex = game.players.indexOf(socket.id);
    const playerColor = playerIndex === 0 ? "w" : "b";

    if (game.chess.turn() !== playerColor) return;

    try {
      const result = game.chess.move(move);
      if (result) {
        io.to(gameId).emit("boardState", game.chess.fen());
      }
    } catch {
      console.log("Invalid move");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});