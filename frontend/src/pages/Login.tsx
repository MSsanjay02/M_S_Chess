import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      return;
    }

    localStorage.setItem("ms_chess_username", username.trim());
    navigate("/lobby");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-6xl mb-4">♔</h1>
          <h1 className="text-5xl font-bold text-white mb-2">
            M&S Chess
          </h1>
          <p className="text-gray-300 text-lg">
            Play chess online with friends
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Enter Your Username
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-4 border-2 border-white/30 rounded-xl bg-white/10 text-white placeholder-gray-400 text-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
            >
              Continue
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 mt-6 text-sm">
          Start playing chess in seconds
        </p>
      </div>
    </div>
  );
};

export default Login;
