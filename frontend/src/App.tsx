import { Routes, Route } from "react-router-dom";
import ChessBoard from "./components/ChessBoard";
import Home from "./pages/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomId" element={<ChessBoard />} />
    </Routes>
  );
}

export default App;