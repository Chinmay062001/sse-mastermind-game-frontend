import { useEffect, useRef, useState } from "react";
import type { Lobby, Player } from "./types";
import { listen, submitGuess, startGame, leaveLobby } from "./api";

export default function GameScreen({
  lobby,
  player,
  setLobby,
}: {
  lobby: Lobby;
  player: Player;
  setLobby: (l: Lobby) => void;
}) {
  const [guess, setGuess] = useState("");
  const [points, setPoints] = useState<Record<string, number>>({});
  const [prevWinners, setPrevWinners] = useState<string[]>([]);

  const lobbyRef = useRef(lobby);
  const playerRef = useRef(player);

  /* ===================== SSE ===================== */
  useEffect(() => {
    const es = listen(lobby.id, player.id, (data: { lobby: Lobby }) => {
      const updatedLobby = data.lobby;
      if (!updatedLobby) return;

      if (updatedLobby.turnIndex >= updatedLobby.players.length) {
        updatedLobby.turnIndex = 0;
      }

      setLobby(updatedLobby);

      setPoints(prev => {
        const next = { ...prev };
        updatedLobby.players.forEach(p => {
          if (next[p.id] == null) next[p.id] = 0;
        });

        const newWinners = updatedLobby.winners.filter(
          w => !prevWinners.includes(w)
        );

        newWinners.forEach(w => (next[w] += 10));
        return next;
      });

      if (updatedLobby.winners.length !== prevWinners.length) {
        setPrevWinners(updatedLobby.winners);
      }
    });

    return () => es.close();
  }, [lobby.id, player.id, prevWinners]);

  useEffect(() => {
    lobbyRef.current = lobby;
    playerRef.current = player;
  }, [lobby, player]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const l = lobbyRef.current;
      const p = playerRef.current;
      if (l && p) leaveLobby(l.id, p.id);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const currentPlayer = lobby.players[lobby.turnIndex];
  const myTurn = currentPlayer?.id === player.id;

  async function submit() {
    if (!guess || !myTurn) return;
    await submitGuess(lobby.id, player.id, guess);
    setGuess("");
  }

  /* ===================== UI ===================== */
  return (
    <>
      <style>{`
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Inter, system-ui, sans-serif;
  background: radial-gradient(circle at top, #0f172a, #020617);
  color: #e5e7eb;
}

/* ---------- Layout ---------- */
.game {
  max-width: 1100px;
  margin: auto;
  padding: 16px;
}

.topBar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title {
  font-size: 18px;
  font-weight: 700;
}

.subtitle {
  font-size: 12px;
  opacity: 0.6;
}

.lobbyTag {
  font-size: 11px;
  padding: 6px 10px;
  background: rgba(255,255,255,0.08);
  border-radius: 999px;
}

/* ---------- Players ---------- */
.players {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.playerCard {
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(145deg, #020617, #020617) padding-box,
              linear-gradient(145deg, #2563eb, #22d3ee) border-box;
  border: 1px solid transparent;
}

.playerCard.active {
  box-shadow: 0 0 0 1px #2563eb;
}

.playerName {
  font-weight: 600;
  font-size: 14px;
}

.playerStatus {
  font-size: 12px;
  opacity: 0.6;
}

/* ---------- Main ---------- */
.main {
  display: grid;
  gap: 16px;
}

/* ---------- Guess History ---------- */
.panel {
  background: rgba(255,255,255,0.03);
  border-radius: 16px;
  padding: 14px;
}

.panelTitle {
  font-size: 12px;
  letter-spacing: 0.12em;
  opacity: 0.6;
  margin-bottom: 10px;
}

.guessRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255,255,255,0.04);
  border-radius: 10px;
  padding: 10px;
  font-size: 13px;
  margin-bottom: 8px;
}

.guessRow.me {
  outline: 1px solid #2563eb;
}

.mono {
  font-family: ui-monospace, monospace;
  letter-spacing: 0.15em;
}

/* ---------- Input ---------- */
.inputRow {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

input {
  flex: 1;
  background: #020617;
  border: 1px solid #1e293b;
  border-radius: 10px;
  padding: 12px;
  color: white;
  font-size: 14px;
}

button {
  background: linear-gradient(135deg, #2563eb, #22d3ee);
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  font-weight: 700;
  color: white;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ---------- Rules ---------- */
.rules {
  font-size: 13px;
  line-height: 1.6;
  opacity: 0.85;
}

/* ---------- Footer ---------- */
.footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  opacity: 0.5;
  margin-top: 14px;
}

/* ---------- Desktop ---------- */
@media (min-width: 768px) {
  .main {
    grid-template-columns: 2fr 1fr;
  }
}
      `}</style>

      <div className="game">
        <div className="topBar">
          <div>
            <div className="title">{lobby.codeLength}-Digit Mastermind</div>
            <div className="subtitle">Code breaking in progress</div>
          </div>
          <div className="lobbyTag">LOBBY {lobby.id}</div>
        </div>

        <div className="players">
          {lobby.players.map((p, i) => (
            <div
              key={p.id}
              className={`playerCard ${
                i === lobby.turnIndex && lobby.started ? "active" : ""
              }`}
            >
              <div className="playerName">
                {p.id === player.id ? "You" : p.name}
              </div>
              <div className="playerStatus">
                {i === lobby.turnIndex ? "Thinking..." : "Waiting..."} •{" "}
                {points[p.id] || 0} pts
              </div>
            </div>
          ))}
        </div>

        <div className="main">
          <div className="panel">
            <div className="panelTitle">GUESS HISTORY</div>

            {lobby.players.map(p =>
              p.guesses.map((g, i) => (
                <div
                  key={p.id + i}
                  className={`guessRow ${p.id === player.id ? "me" : ""}`}
                >
                  <span className="mono">{g.value.split("").join(" ")}</span>
                  <span>
                    {g.result.correctPositions} pos /{" "}
                    {g.result.correctDigits} digit
                  </span>
                </div>
              ))
            )}

            {lobby.started && myTurn && (
              <div className="inputRow">
                <input
                  inputMode="numeric"
                  value={guess}
                  onChange={e =>
                    setGuess(
                      e.target.value.replace(/\D/g, "").slice(0, lobby.codeLength)
                    )
                  }
                  placeholder={`Enter ${lobby.codeLength} digits`}
                />
                <button onClick={submit}>Guess</button>
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panelTitle">GAME RULES</div>
            <div className="rules">
              Guess <b>{lobby.codeLength} unique digits</b> (0–9)<br />
              <b>pos</b> → correct digit & position<br />
              <b>digit</b> → correct digit, wrong spot<br />
              Points rewarded for speed & accuracy
            </div>
          </div>
        </div>

        <div className="footer">
          <span>⚡ Low latency</span>
          <span>Best of {lobby.numGames}</span>
        </div>

        {!lobby.started && !lobby.winners.length && (
          <button style={{ width: "100%", marginTop: 16 }} onClick={() => startGame(lobby.id)}>
            Start Game
          </button>
        )}
      </div>
    </>
  );
}
