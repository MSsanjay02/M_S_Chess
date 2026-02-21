import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";

const Lobby = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("ms_chess_username");
  const [roomInput, setRoomInput] = useState("");

  useEffect(() => {
    if (!username) {
      navigate("/login");
    }
  }, [username, navigate]);

  const createRoom = () => {
    const roomId = uuidv4().slice(0, 6).toUpperCase();
    navigate(`/room/${roomId}`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomInput.trim()) return;
    navigate(`/room/${roomInput.trim().toUpperCase()}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("ms_chess_username");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            Welcome, <span className="text-purple-300">{username}</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Start or join a game
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl space-y-6">
          {/* Create Room Button */}
          <button
            onClick={createRoom}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all shadow-lg"
          >
            🎮 Create New Room
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* Join Room Form */}
          <form onSubmit={joinRoom} className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">
                Enter Room Code
              </label>
              <input
                type="text"
                placeholder="e.g., A1B2C3"
                className="w-full px-4 py-4 border-2 border-white/30 rounded-xl bg-white/10 text-white placeholder-gray-400 text-lg uppercase focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transform hover:scale-105 transition-all shadow-lg"
            >
              🚪 Join Room
            </button>
          </form>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 py-3 rounded-xl text-sm font-semibold transition-all border border-red-500/30"
          >
            Logout
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
          <h3 className="text-white font-semibold mb-2">How to Play:</h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Create a room and share the code with a friend</li>
            <li>• Or join an existing room with a room code</li>
            <li>• Drag and drop pieces or click to move</li>
            <li>• Have fun playing chess!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
