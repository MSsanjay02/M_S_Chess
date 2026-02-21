import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

const Lobby = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("ms_chess_username");
  const [roomInput, setRoomInput] = useState("");

  const createRoom = () => {
    const roomId = uuidv4().slice(0, 6);
    navigate(`/room/${roomId}`);
  };

  const joinRoom = () => {
    if (!roomInput.trim()) return;
    navigate(`/room/${roomInput}`);
  };

  return (
    <div className="h-screen bg-[#f5f5f5] flex flex-col items-center justify-center">

      <h1 className="text-3xl font-bold text-[#2f6d3c] mb-2">
        Welcome, {username}
      </h1>

      <p className="mb-8 text-gray-600">
        Start or join a game
      </p>

      <div className="flex flex-col gap-4 w-72">

        <button
          onClick={createRoom}
          className="bg-[#2f6d3c] text-white py-3 rounded-lg text-lg hover:bg-[#24532d]"
        >
          Create Room
        </button>

        <input
          type="text"
          placeholder="Enter Room Code"
          className="px-4 py-3 border border-gray-300 rounded-lg"
          value={roomInput}
          onChange={(e) => setRoomInput(e.target.value)}
        />

        <button
          onClick={joinRoom}
          className="bg-white border border-[#2f6d3c] text-[#2f6d3c] py-3 rounded-lg text-lg hover:bg-[#EEEED2]"
        >
          Join Room
        </button>

      </div>

    </div>
  );
};

export default Lobby;