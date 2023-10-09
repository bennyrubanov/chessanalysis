import { Chess, Square, UnambiguousPieceSymbols } from '../cjsmin/src/chess';
import { gameChunks } from './fileReader';

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

// take a start and end board position and return the distances moved
export async function getMoveDistance(filePath: string) {
  for await (const game of gameChunks(filePath)) {
    const chess = new Chess(); // Create a new instance of the Chess class
    chess.loadPgn(game.moves);
    const moveHistory = chess.history();

    // Initialize variables to keep track of the maximum distance and the piece
    let maxDistance = -1;
    let maxDistancePiece;

    const pieceSquares = new Map<Square, UnambiguousPieceSymbols>();
    pieceSquares.set('a1', 'ra');
    pieceSquares.set('b1', 'nb');
    pieceSquares.set('c1', 'bc');
    pieceSquares.set('d1', 'q');
    pieceSquares.set('e1', 'k');
    pieceSquares.set('f1', 'bf');
    pieceSquares.set('g1', 'ng');
    pieceSquares.set('h1', 'rh');
    pieceSquares.set('a2', 'pa');
    pieceSquares.set('b2', 'pb');
    pieceSquares.set('c2', 'pc');
    pieceSquares.set('d2', 'pd');
    pieceSquares.set('e2', 'pe');
    pieceSquares.set('f2', 'pf');
    pieceSquares.set('g2', 'pg');
    pieceSquares.set('h2', 'ph');
    pieceSquares.set('a8', 'RA');
    pieceSquares.set('b8', 'NB');
    pieceSquares.set('c8', 'BC');
    pieceSquares.set('d8', 'Q');
    pieceSquares.set('e8', 'K');
    pieceSquares.set('f8', 'BF');
    pieceSquares.set('g8', 'NG');
    pieceSquares.set('h8', 'RH');
    pieceSquares.set('a7', 'PA');
    pieceSquares.set('b7', 'PB');
    pieceSquares.set('c7', 'PC');
    pieceSquares.set('d7', 'PD');
    pieceSquares.set('e7', 'PE');
    pieceSquares.set('f7', 'PF');
    pieceSquares.set('g7', 'PG');
    pieceSquares.set('h7', 'PH');

    // create an object to track distance value for each piece
    const distanceMap: { [key: string]: number } = {};
    for (const piece of pieceSquares.values()) {
      distanceMap[piece] = 0;
    }

    // TODO: we'll need to update the labels we use in cjsmin to be unique to do things this way
    for (const { from, to, piece } of moveHistory) {
      const fileDist = Math.abs(from.charCodeAt(0) - to.charCodeAt(0));
      const rankDist = Math.abs(Number(from[1]) - Number(to[1]));
      const distance = Math.max(fileDist, rankDist);

      // we'll update the keys of this map as we track piece movements. To avoid additional operations I will only update and not delete,
      // unless we have a need to only have the current position in the future this will work for distance calcs
      pieceSquares.set(to, pieceSquares.get(from));
      distanceMap[piece] += distance;

      // Update statistics for the piece and track which piece moved the furthest
      if (distanceMap[piece] > maxDistance) {
        maxDistance = distanceMap[piece];
        maxDistancePiece = piece;
      }
    }

    // At this point, maxDistancePiece should contain the name of the piece with the maximum distance moved
    console.log(`Piece with the maximum distance moved: ${maxDistancePiece}`);
    console.log(`Distance moved: ${maxDistance}`);

    return {
      maxDistancePiece,
      maxDistance,
    };
  }
}
// Need to decide how we assign the openings to a game (and get a db of openings)
function checkOpening() {}

// take a board and move and see if a capture occurred
function checkForCapture(board: Chess, move: string) {}

// start from back of history
function getMateAndAssists() {}

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
