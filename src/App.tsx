import { useState } from "react";
import LobbyScreen from "./Lobby";
import GameScreen from "./Game";
import type { Lobby, Player } from "./types";
import "./index.css";
import "./App.css";

export default function App() {
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white flex items-center justify-center px-4">
      
      {/* Main Card */}
      <div className="w-full max-w-md rounded-2xl bg-slate-900/80 backdrop-blur border border-white/10 shadow-2xl overflow-hidden">

        {/* Content */}
        <main className="p-6 min-h-[420px] flex items-center justify-center">
          {!lobby || !player ? (
            <LobbyScreen setLobby={setLobby} setPlayer={setPlayer} />
          ) : (
            <GameScreen
              lobby={lobby}
              player={player}
              setLobby={setLobby}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-white/10 text-center text-xs text-slate-500">
          Real-time multiplayer • SSE powered
        </footer>
      </div>
    </div>
  );
}
