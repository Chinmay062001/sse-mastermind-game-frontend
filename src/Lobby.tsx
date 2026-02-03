import { useState } from "react";
import { createLobby, joinLobby } from "./api";
import type { Lobby, Player } from "./types";

export default function LobbyScreen({
  setLobby,
  setPlayer
}: {
  setLobby: (l: Lobby) => void;
  setPlayer: (p: Player) => void;
}) {
  const [name, setName] = useState("");
  const [lobbyId, setLobbyId] = useState("");

  const [numGames, setNumGames] = useState(5);
  const [maxWinners, setMaxWinners] = useState(1);
  const [showAllGuesses, setShowAllGuesses] = useState(true);

  async function create() {
    const lobby = await createLobby(numGames, maxWinners, showAllGuesses);
    const res = await joinLobby(lobby.id, name);
    setLobby(res.lobby);
    setPlayer(res.player);
  }

  async function join() {
    const res = await joinLobby(lobbyId, name);
    setLobby(res.lobby);
    setPlayer(res.player);
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f5f7fb;
        }

        .page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 16px;
        }

        .card {
          width: 100%;
          max-width: 380px;
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
          text-align: center;
        }

        .icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 12px;
          border-radius: 12px;
          background: #2f80ed;
          display: grid;
          place-items: center;
          color: white;
          font-size: 22px;
        }

        h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
        }

        .subtitle {
          margin: 6px 0 20px;
          font-size: 14px;
          color: #6b7280;
        }

        .input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .input:focus {
          outline: none;
          border-color: #2f80ed;
        }

        .settings {
          background: #f1f6fb;
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 16px;
          text-align: left;
        }

        .settings h4 {
          font-size: 12px;
          margin: 0 0 10px;
          color: #6b7280;
          letter-spacing: .05em;
        }

        .row {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .row label {
          font-size: 12px;
          color: #374151;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #374151;
        }

        button {
          cursor: pointer;
          border: none;
          font-size: 14px;
          font-weight: 600;
        }

        .primary {
          width: 100%;
          padding: 12px;
          background: #2f80ed;
          color: white;
          border-radius: 10px;
        }

        .primary:disabled {
          opacity: .4;
          cursor: not-allowed;
        }

        .divider {
          margin: 16px 0;
          font-size: 12px;
          color: #9ca3af;
        }

        .joinRow {
          display: flex;
          gap: 8px;
        }

        .secondary {
          padding: 10px 14px;
          background: #eef2f7;
          border-radius: 8px;
        }

        .footer {
          margin-top: 14px;
          font-size: 12px;
          color: #6b7280;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
        }

        .dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
        }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="icon">🎯</div>

          <h1>Mastermind</h1>
          <p className="subtitle">Guess the code. Beat the lobby.</p>

          <input
            className="input"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <div className="settings">
            <h4>LOBBY SETTINGS</h4>

            <div className="row">
              <label>
                Rounds
                <input
                  type="number"
                  min={1}
                  className="input"
                  value={numGames}
                  onChange={e => setNumGames(+e.target.value)}
                />
              </label>

              <label>
                Winners / round
                <input
                  type="number"
                  min={1}
                  className="input"
                  value={maxWinners}
                  onChange={e => setMaxWinners(+e.target.value)}
                />
              </label>
            </div>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={showAllGuesses}
                onChange={e => setShowAllGuesses(e.target.checked)}
              />
              Show all guesses
            </label>
          </div>

          <button
            className="primary"
            onClick={create}
            disabled={!name}
          >
            Create Lobby
          </button>

          <div className="divider">OR JOIN EXISTING</div>

          <div className="joinRow">
            <input
              className="input"
              placeholder="Lobby ID"
              value={lobbyId}
              onChange={e => setLobbyId(e.target.value)}
            />
            <button
              className="secondary"
              onClick={join}
              disabled={!name || !lobbyId}
            >
              Join
            </button>
          </div>

          <div className="footer">
            <span className="dot" />
            Real-time multiplayer • SSE powered
          </div>
        </div>
      </div>
    </>
  );
}
