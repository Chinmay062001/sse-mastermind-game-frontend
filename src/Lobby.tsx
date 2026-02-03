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
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          background: radial-gradient(1200px 600px at top, #1b235a, #050814);
          color: #e5e7eb;
        }

        .page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 16px;
        }

        .card {
          width: 100%;
          max-width: 420px;
          background: linear-gradient(
            180deg,
            rgba(255,255,255,0.08),
            rgba(255,255,255,0.02)
          );
          border-radius: 20px;
          padding: 28px 24px;
          backdrop-filter: blur(18px);
          box-shadow:
            0 20px 60px rgba(0,0,0,0.45),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .logo {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          margin: 0 auto 14px;
          background: linear-gradient(135deg, #7dd3fc, #a855f7);
          display: grid;
          place-items: center;
          font-size: 26px;
        }

        h1 {
          margin: 0;
          text-align: center;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.4px;
        }

        .subtitle {
          text-align: center;
          margin: 6px 0 22px;
          font-size: 14px;
          color: #9ca3af;
        }

        .section {
          margin-bottom: 18px;
        }

        .label {
          font-size: 11px;
          letter-spacing: 0.08em;
          color: #94a3b8;
          margin-bottom: 6px;
        }

        .input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.35);
          color: white;
          font-size: 14px;
        }

        .input:focus {
          outline: none;
          border-color: #7dd3fc;
        }

        .config {
          background: rgba(0,0,0,0.35);
          border-radius: 14px;
          padding: 14px;
          margin-top: 10px;
        }

        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }

        .checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #cbd5f5;
        }

        .checkbox input {
          accent-color: #7dd3fc;
        }

        .primary {
          width: 100%;
          margin-top: 18px;
          padding: 14px;
          border-radius: 14px;
          border: none;
          font-size: 15px;
          font-weight: 600;
          color: #050814;
          background: linear-gradient(135deg, #7dd3fc, #a855f7);
          cursor: pointer;
        }

        .primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .divider {
          margin: 22px 0 14px;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
        }

        .joinRow {
          display: flex;
          gap: 10px;
        }

        .secondary {
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .secondary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
        }

        @media (min-width: 640px) {
          .card {
            padding: 32px;
          }
        }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="logo">🎯</div>

          <h1>MASTERMIND</h1>
          <p className="subtitle">Crack the code. Outsmart the lobby.</p>

          <div className="section">
            <div className="label">PLAYER NAME</div>
            <input
              className="input"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="section">
            <div className="label">MATCH CONFIGURATION</div>

            <div className="config">
              <div className="row">
                <input
                  type="number"
                  className="input"
                  value={numGames}
                  onChange={e => setNumGames(+e.target.value)}
                  placeholder="Rounds"
                />
                <input
                  type="number"
                  className="input"
                  value={maxWinners}
                  onChange={e => setMaxWinners(+e.target.value)}
                  placeholder="Winners / round"
                />
              </div>

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={showAllGuesses}
                  onChange={e => setShowAllGuesses(e.target.checked)}
                />
                Public guesses (Easy mode)
              </label>
            </div>
          </div>

          <button className="primary" onClick={create} disabled={!name}>
            Initialize Lobby
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
            Systems Online • SSE Connected
          </div>
        </div>
      </div>
    </>
  );
}
