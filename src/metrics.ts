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

// start from back of history. For this to be accurate we need to know which piece checks the king at this index
// the edge case here is when pieces "share" a mate, or check. This can be at most 2 due to discovery checks
// the board configuration will also have to be as it was in the instance of checkmate, or the previous mate.
// So this is going to need to hook into the loadPGN, probably.
// function getMateAssists(history: GameHistory[], chess: Chess) {
//   const wasMate = history[history.length - 1].originalString.includes('#');
//   if (wasMate) {
//     const matingPieceSquares = chess._attackFromSquare();
//     return history[history.length - 2].color;
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

// function isFork(move, moveIndex, chess: Chess) {
//   if
// }
