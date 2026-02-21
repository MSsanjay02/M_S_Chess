import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username.trim()) return;

    localStorage.setItem("ms_chess_username", username);
    navigate("/lobby");
  };

  return (
    <div className="h-screen bg-[#f5f5f5] flex flex-col items-center justify-center">

      <h1 className="text-4xl font-bold text-[#2f6d3c] mb-6">
        Enter Your Username
      </h1>

      <input
        type="text"
        placeholder="Username"
        className="px-4 py-3 border border-gray-300 rounded-lg w-72 mb-4 text-lg"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="bg-[#2f6d3c] text-white py-3 rounded-lg w-72 text-lg hover:bg-[#24532d]"
      >
        Continue
      </button>

    </div>
  );
};

export default Login;