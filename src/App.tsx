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
<>
      {!lobby || !player ? (
        <LobbyScreen setLobby={setLobby} setPlayer={setPlayer} />
      ) : (
        <GameScreen
          lobby={lobby}
          player={player}
          setLobby={setLobby}
        />
      )}
</>
        
  );
}
