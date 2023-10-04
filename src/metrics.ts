interface GameHistory {
  // before: string; // FEN notation of the board before the move
  // after: string; // FEN notation of the board after the move
  color: string;
  piece: string;
  from: string;
  to: string;
  // san: string; // Move notation type
  // lan: string; // Move notation type (long)
  flags: string; // idk what this is
}

// Need to decide how we assign the openings to a game (and get a db of openings)
function checkOpening() {}

// take a start and end board position and return the distance moveds
export function getMoveDistance(start: string, end: string): number {
  return (
    Math.abs(start[0].charCodeAt(0) - end[0].charCodeAt(0)) +
    Math.abs(parseInt(start[1]) - parseInt(end[1]))
  );
}

// take a board and move and see if a capture occurred.
// This is trivial because of move history.
// function checkForCapture(board: Chess, move: string) {}

// start from back of history
// function getMateAssists(history: GameHistory[]) {
//   const finalMate = history[history.length - 1].to === '#';
//   if (history[history.length - 2] === '#') {
//     return history[history.length - 1].color;
//   }
// }

// This one could get complex if lib doesn't work https://github.com/jhlywa/chess.js/blob/master/README.md#isgameover
function determineEndType() {}

// I think this data may not exist in lichess
function timeQuit() {}

function miscChecksFromMove() {
  // en passant
  // castling
  // promotion
  // check
}

function isFork() {
  // a
}
