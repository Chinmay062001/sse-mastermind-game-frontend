import { useEffect, useRef, useState } from "react";
import type { Guess, Lobby, Player } from "./types";
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
  const [trophies, setTrophies] = useState<Record<string, number>>({});
  const [prevWinners, setPrevWinners] = useState<string[]>([]);

  const lobbyRef = useRef(lobby);
  const playerRef = useRef(player);

  // SSE listener
  useEffect(() => {
    const es = listen(lobby.id, player.id, (updatedLobby: Lobby) => {
      if (updatedLobby.turnIndex >= updatedLobby.players.length) {
        updatedLobby.turnIndex = 0;
      }

      setLobby(updatedLobby);

      const t = { ...trophies };
      updatedLobby.players.forEach(p => {
        t[p.id] ??= 0;
      });

      const newWins = updatedLobby.winners.filter(
        w => !prevWinners.includes(w)
      );
      newWins.forEach(w => {
        t[w] += 1;
      });

      if (newWins.length) setPrevWinners(updatedLobby.winners);
      setTrophies(t);
    });

    return () => es.close();
  }, [lobby.id]);

  useEffect(() => {
    lobbyRef.current = lobby;
    playerRef.current = player;
  }, [lobby, player]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
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
    if (!guess) return;
    await submitGuess(lobby.id, player.id, guess);
    setGuess("");
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; background: #f9fafc; }
        .page { display: flex; justify-content: center; padding: 24px; }
        .card { max-width: 700px; width: 100%; background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .lobbyTag { font-size: 12px; background: #e5e7eb; color: #374151; padding: 4px 10px; border-radius: 999px; }
        .title { font-size: 20px; font-weight: 700; margin: 6px 0; }
        .turn { font-size: 14px; color: #2563eb; margin-top: 4px; }
        .players { display: flex; gap: 8px; }
        .player { font-size: 13px; padding: 6px 10px; border-radius: 999px; background: #f1f5f9; display: flex; align-items: center; gap: 6px; }
        .player.active { background: #2563eb; color: white; }
        .content { display: flex; gap: 16px; flex-wrap: wrap; }
        .panel { flex: 1; min-width: 250px; background: #f8fafc; border-radius: 12px; padding: 16px; }
        .panel h4 { font-size: 12px; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 12px; }
        .guessRow { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-radius: 8px; background: #fff; font-size: 13px; border: 1px solid #e5e7eb; margin-bottom: 8px; }
        .guessRow.me { border-color: #2563eb; }
        .mono { font-family: ui-monospace, monospace; }
        .inputRow { display: flex; gap: 8px; margin-top: 12px; }
        input { flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 14px; }
        button { border: none; padding: 10px 14px; border-radius: 8px; font-weight: 600; cursor: pointer; background: #2563eb; color: white; }
        button.secondary { width: 100%; background: #10b981; margin-top: 16px; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        .rules { font-size: 13px; color: #374151; line-height: 1.5; }
        .footer { margin-top: 20px; font-size: 12px; color: #6b7280; display: flex; justify-content: space-between; }
        @media (max-width: 600px) { .content { flex-direction: column; } }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="header">
            <div>
              <div className="lobbyTag">LOBBY {lobby.id}</div>
              <div className="title">{lobby.codeLength}-digit mastermind</div>
              <div className="turn">{myTurn ? "Your turn" : `Turn: ${currentPlayer?.name}`}</div>
            </div>

            <div className="players">
              {lobby.players.map((p, i) => (
                <div
                  key={p.id}
                  className={`player ${i === lobby.turnIndex && lobby.started ? "active" : ""}`}
                >
                  {p.name}
                  {Array.from({ length: trophies[p.id] || 0 }).map((_, i) => (
                    <span key={i}>🏆</span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="content">
            {/* Guess History */}
            <div className="panel">
              <h4>GUESS HISTORY</h4>
              {lobby.players.map(playerItem => {
                if (!lobby.showAllGuesses && playerItem.id !== player.id) return null;

                return playerItem.guesses.map((g, i) => (
                  <div key={`${playerItem.id}-${i}`} className={`guessRow ${playerItem.id === player.id ? "me" : ""}`}>
                    <span className="mono">#{i + 1} {g.value.split("").join(" ")}</span>
                    <span>{g.correctPositions} pos / {g.correctDigits} digit</span>
                  </div>
                ));
              })}

              {lobby.started && myTurn && (
                <div className="inputRow">
                  
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={guess}
                    onChange={e => {
                      const onlyDigits = e.target.value.replace(/\D/g, "");
                      setGuess(onlyDigits.slice(0, lobby.codeLength));
                    }}
                    maxLength={lobby.codeLength}
                    placeholder={`Enter ${lobby.codeLength}-digit guess`}
                  />
                  <button onClick={submit}>Guess ↵</button>
                </div>
              )}
            </div>

            {/* Rules */}
            <div className="panel">
              <h4>RULES</h4>
              <div className="rules">
                • {lobby.codeLength} unique digits between 0 and 9<br />
                • <b>pos</b> = correct digit in correct spot<br />
                • <b>digit</b> = correct digit, wrong spot<br /><br />
                Real-time multiplayer • SSE powered
              </div>
            </div>
          </div>

          <div className="footer">
            <span>⚡ Fast, low-latency turns</span>
            <span>Best of {lobby.numGames} rounds</span>
          </div>

          {!lobby.started && !lobby.winners.length && (
            <button className="secondary" onClick={() => startGame(lobby.id)}>Start Game</button>
          )}
        </div>
      </div>
    </>
  );
}
