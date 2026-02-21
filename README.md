# M&S Chess

A beautiful, modern real-time chess game built with React, TypeScript, Socket.io, and Express.

## Features

- ✨ **Modern UI/UX** - Beautiful gradient design with smooth animations
- 🎯 **Real-time Multiplayer** - Play with friends in real-time using Socket.io
- 🖱️ **Drag & Drop** - Intuitive drag and drop piece movement
- 📱 **Responsive Design** - Works on desktop and mobile devices
- ✅ **Move Validation** - Real-time move validation with error feedback
- ♟️ **Check Detection** - Visual indicators when king is in check
- 📜 **Move History** - Track all moves during the game
- 🎨 **Captured Pieces** - Visual display of captured pieces
- 🚀 **Promotion Dialog** - Easy pawn promotion selection
- ⚡ **Last Move Highlight** - See the last move made

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Socket.io Client
- Chess.js

### Backend
- Node.js
- Express
- Socket.io
- TypeScript
- Chess.js

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd M_S_Chess
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
npm install
```

### Running Locally

1. Start the backend server
```bash
cd backend
npm run dev
```
The server will run on `http://localhost:5000`

2. Start the frontend (in a new terminal)
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

3. Open your browser and navigate to `http://localhost:5173`

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import your repository to Vercel
3. Set the following environment variable:
   - `VITE_SOCKET_URL`: Your backend WebSocket URL (e.g., `https://your-backend.onrender.com`)
4. Deploy!

### Backend (Render)

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Use these settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or let Render assign it)
6. Deploy!

### Environment Variables

#### Frontend (.env)
```
VITE_SOCKET_URL=http://localhost:5000
```

#### Backend
```
PORT=5000
NODE_ENV=production
```

## How to Play

1. Enter your username on the login page
2. Create a new room or join an existing one with a room code
3. Wait for an opponent to join
4. Make moves by:
   - **Clicking**: Click on a piece, then click on the destination square
   - **Dragging**: Drag and drop pieces to move them
5. The game will automatically detect check, checkmate, and stalemate
6. When a pawn reaches the end, select a piece to promote to

## Project Structure

```
M_S_Chess/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── chessBoard.tsx
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Lobby.tsx
│   │   └── App.tsx
│   └── package.json
├── backend/
│   ├── src/
│   │   └── server.ts
│   └── package.json
└── README.md
```

## License

MIT
