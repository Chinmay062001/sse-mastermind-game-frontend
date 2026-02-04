// const BASE = "http://localhost:4000";
const BASE = "https://sse-mastermind-game-backend-production.up.railway.app";


  export function createLobby(
    numGames = 5,
    maxWinners = 1,
    showAllGuesses = false
  ) {
    return fetch(`${BASE}/lobby/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numGames, maxWinners, showAllGuesses })
    }).then(r => r.json());
  }

  
export function joinLobby(id: string, name: string) {
  return fetch(`${BASE}/lobby/${id}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  }).then(r => r.json());
}

export function startGame(lobbyId: string) {
  return fetch(`${BASE}/lobby/${lobbyId}/start`, { method: "POST" });
}

export async function submitGuess(
  lobbyId: string,
  playerId: string,
  guess: string
) {
  const res = await fetch(`${BASE}/lobby/${lobbyId}/guess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId, guess })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown" }));
    throw new Error(err.error || "Failed to submit guess");
  }

  return res.json(); // ✅ parse JSON properly
}

export function restartGame(lobbyId: string) {
  return fetch(`${BASE}/lobby/${lobbyId}/restart`, {
    method: "POST"
  });
}

export function leaveLobby(lobbyId: string, playerId: string) {
  return fetch(`http://localhost:4000/lobby/${lobbyId}/leave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId })
  });
}


export function listen(
  lobbyId: string,
  playerId: string,
  onMessage: (data: any) => void
) {
  const es = new EventSource(
    `${BASE}/lobby/${lobbyId}/stream?playerId=${playerId}`
  );

  es.onmessage = (e) => {
    onMessage(JSON.parse(e.data));
  };

  return es; // 👈 important
}
