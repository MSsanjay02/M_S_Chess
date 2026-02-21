import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Lobby from "./pages/Lobby";
import ChessBoard from "./components/chessBoard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/lobby" element={<Lobby />} />
      <Route path="/room/:roomId" element={<ChessBoard />} />
    </Routes>
  );
}

export default App;