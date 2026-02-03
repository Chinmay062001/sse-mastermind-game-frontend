
export type Guess = {
  value: string;               // the actual guessed string
  correctPositions: number;    // correct digit in correct position
  correctDigits: number;       // correct digit in wrong position
};

export type Player = {
  id: string;
  name: string;
  guesses: Guess[];            // all guesses by this player
};

export type Lobby = {
  id: string;
  numGames: number;
  maxWinners: number;
  showAllGuesses: boolean;     // show all guesses to all players
  codeLength: number;
  turnIndex: number;
  winners: string[];
  players: Player[];
  started: boolean;
};
