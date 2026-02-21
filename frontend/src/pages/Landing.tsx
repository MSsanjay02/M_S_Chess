import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-[#f5f5f5] flex flex-col items-center justify-center">

      {/* TITLE */}
      <h1 className="text-5xl font-bold text-[#2f6d3c] mb-4">
        MS_Chess
      </h1>

      {/* TAGLINE */}
      <p className="text-lg text-gray-700 mb-10">
        Play real-time chess with friends anywhere.
      </p>

      {/* BUTTONS */}
      <div className="flex flex-col gap-4 w-64">

        <button
          onClick={() => navigate("/login")}
          className="bg-[#2f6d3c] text-white py-3 rounded-lg text-lg hover:bg-[#24532d]"
        >
          Play Online
        </button>

        <button
          onClick={() => navigate("/login")}
          className="bg-white border border-[#2f6d3c] text-[#2f6d3c] py-3 rounded-lg text-lg hover:bg-[#EEEED2]"
        >
          Create Room
        </button>

        <button
          onClick={() => navigate("/login")}
          className="bg-white border border-[#2f6d3c] text-[#2f6d3c] py-3 rounded-lg text-lg hover:bg-[#EEEED2]"
        >
          Join Room
        </button>

      </div>
    </div>
  );
};

export default Landing;