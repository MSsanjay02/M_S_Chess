import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const Home = () => {
  const navigate = useNavigate();

  const createRoom = () => {
    const roomId = uuidv4().slice(0, 6);
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Multiplayer Chess</h1>

      <button
        onClick={createRoom}
        className="px-6 py-3 bg-green-600 text-white rounded-lg text-lg"
      >
        Create Room
      </button>
    </div>
  );
};

export default Home;