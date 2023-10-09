import { Chess } from 'chess.js';

interface GameHistory {
  before: string; // FEN notation of the board before the move
  after: string; // FEN notation of the board after the move
  color: string;
  piece: string;
  from: string;
  to: string;
  san: string; // Move notation type
  lan: string; // Move notation type (long)
  flags: string; // idk what this is
}

// TODO: if needed we can overwrite the history code to store only what we need https://github.com/jhlywa/chess.js/blob/master/README.md#history-options-
function getGameHistory(game: string[]) {
  // TODO: implement
}

// Need to decide how we assign the openings to a game (and get a db of openings)
function checkOpening() {}

// Should return an object for the metrics we want to track, not sure how best to structure so an exercise for the reader
function initializeMetricMaps() {
  // kd ratio, distances moved,

  const squareInfo = {
    kills: {
      pawn: 0,
      knight: 0,
      bishop: 0,
      rook: 0,
      queen: 0,
      king: 0,
    },
    deaths: {
      pawn: 0,
      knight: 0,
      bishop: 0,
      rook: 0,
      queen: 0,
      king: 0,
    },
  };

  const chessboard: any = [];
  for (let i = 0; i < 8; i++) {
    const row: any = [];
    for (let j = 0; j < 8; j++) {
      // Determine the color of the square based on the row and column
      row.push({});
    }
    chessboard.push(row);
  }

  return {
    pawn: {},
    knight: {},
    bishop: {},
    rook: {},
    queen: {},
    king: {},
  };
}

// take a start and end board position and return the distance moveds
function getMoveDistance(start: string, end: string) {}

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
