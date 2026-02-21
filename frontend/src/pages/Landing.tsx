import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "var(--chess-bg)" }}>
      <div className="w-full max-w-2xl text-center">
        <div className="mb-10">
          <p className="chess-piece text-7xl mb-4">♔ ♚</p>
          <h1 className="text-5xl md:text-6xl font-bold mb-3" style={{ color: "var(--chess-text)" }}>
            M&S Chess
          </h1>
          <p className="text-lg opacity-90 mb-1" style={{ color: "var(--chess-text)" }}>
            Play real-time chess with friends anywhere
          </p>
          <p className="text-base opacity-70" style={{ color: "var(--chess-text)" }}>
            Drag and drop or click to move
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-semibold text-white bg-green-600 hover:bg-green-500 transition-colors shadow-lg"
          >
            Play Online
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-semibold border-2 transition-colors"
            style={{ color: "var(--chess-text)", borderColor: "var(--chess-border)", background: "var(--chess-surface)" }}
          >
            Join Room
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl p-6 border" style={{ background: "var(--chess-surface)", borderColor: "var(--chess-border)" }}>
            <p className="text-3xl mb-2">⚡</p>
            <h3 className="font-semibold mb-1" style={{ color: "var(--chess-text)" }}>Real-time</h3>
            <p className="text-sm opacity-75" style={{ color: "var(--chess-text)" }}>Play with friends live</p>
          </div>
          <div className="rounded-xl p-6 border" style={{ background: "var(--chess-surface)", borderColor: "var(--chess-border)" }}>
            <p className="text-3xl mb-2">♟</p>
            <h3 className="font-semibold mb-1 chess-piece" style={{ color: "var(--chess-text)" }}>Chess</h3>
            <p className="text-sm opacity-75" style={{ color: "var(--chess-text)" }}>Standard rules</p>
          </div>
          <div className="rounded-xl p-6 border" style={{ background: "var(--chess-surface)", borderColor: "var(--chess-border)" }}>
            <p className="text-3xl mb-2">👆</p>
            <h3 className="font-semibold mb-1" style={{ color: "var(--chess-text)" }}>Easy</h3>
            <p className="text-sm opacity-75" style={{ color: "var(--chess-text)" }}>Drag & drop or click</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
