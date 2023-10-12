import {
  Chess,
  Color,
  PieceSymbol,
  Square,
  UnambiguousPieceSymbols,
} from '../cjsmin/src/chess';
import { FileReaderGame } from './types';

type GameHistoryMove = {
  originalString: string;
  color: Color;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  flags: string;
};

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
export async function getMoveDistanceSingleGame(game: FileReaderGame) {
  const basePieceSquares = new Map<Square, UnambiguousPieceSymbols>();
  basePieceSquares.set('a1', 'ra');
  basePieceSquares.set('b1', 'nb');
  basePieceSquares.set('c1', 'bc');
  basePieceSquares.set('d1', 'q');
  basePieceSquares.set('e1', 'k');
  basePieceSquares.set('f1', 'bf');
  basePieceSquares.set('g1', 'ng');
  basePieceSquares.set('h1', 'rh');
  basePieceSquares.set('a2', 'pa');
  basePieceSquares.set('b2', 'pb');
  basePieceSquares.set('c2', 'pc');
  basePieceSquares.set('d2', 'pd');
  basePieceSquares.set('e2', 'pe');
  basePieceSquares.set('f2', 'pf');
  basePieceSquares.set('g2', 'pg');
  basePieceSquares.set('h2', 'ph');
  basePieceSquares.set('a8', 'RA');
  basePieceSquares.set('b8', 'NB');
  basePieceSquares.set('c8', 'BC');
  basePieceSquares.set('d8', 'Q');
  basePieceSquares.set('e8', 'K');
  basePieceSquares.set('f8', 'BF');
  basePieceSquares.set('g8', 'NG');
  basePieceSquares.set('h8', 'RH');
  basePieceSquares.set('a7', 'PA');
  basePieceSquares.set('b7', 'PB');
  basePieceSquares.set('c7', 'PC');
  basePieceSquares.set('d7', 'PD');
  basePieceSquares.set('e7', 'PE');
  basePieceSquares.set('f7', 'PF');
  basePieceSquares.set('g7', 'PG');
  basePieceSquares.set('h7', 'PH');

  const chess = new Chess(); // Create a new instance of the Chess class
  chess.loadPgn(game.moves);
  const moveHistory = chess.history();

  // duplicate the base map
  const pieceSquares = new Map<Square, UnambiguousPieceSymbols>(
    basePieceSquares
  );

  // create an object to track distance value for each piece
  const distanceMap: { [key: string]: number } = {};
  for (const piece of pieceSquares.values()) {
    distanceMap[piece] = 0;
  }

  // Initialize variables to keep track of the maximum distance and the piece
  let maxDistance = -1;
  let maxDistancePiece: UnambiguousPieceSymbols;

  // TODO: we'll need to update the labels we use in cjsmin to be unique to do things this way
  for (const { from, to } of moveHistory) {
    const fileDist = Math.abs(from.charCodeAt(0) - to.charCodeAt(0));
    const rankDist = Math.abs(Number(from[1]) - Number(to[1]));
    const distance = Math.max(fileDist, rankDist);
    const movedPiece = pieceSquares.get(from);

    // we'll update the map as pieces move. To avoid additional operations we only update (no delete). Can change this if we use this elsewhere
    pieceSquares.set(to, movedPiece);
    distanceMap[movedPiece] += distance;

    if (distanceMap[movedPiece] > maxDistance) {
      maxDistance = distanceMap[movedPiece];
      maxDistancePiece = movedPiece;
    }
  }

  return {
    maxDistancePiece,
    maxDistance,
    distanceMap
  };
}

export function getAverageDistance(distanceMap: { [key: string]: number }, gameCount: number ) {
  let maxAverageDistance = 0;
  let pieceWithHighestAverageDistance = null;
  for (const piece of Object.keys(distanceMap)) {
    const averageDistance = distanceMap[piece] / gameCount;
    if (averageDistance > maxAverageDistance) {
      maxAverageDistance = averageDistance;
      pieceWithHighestAverageDistance = piece;
    }
  }
  return { pieceWithHighestAverageDistance, maxAverageDistance };
}

// Need to decide how we assign the openings to a game (and get a db of openings)
function checkOpening() {}

// take a board and move and see if a capture occurred
function checkForCapture(board: Chess, move: string) {}

// start from back of history. For this to be accurate we need to know which piece checks the king at this index
// the edge case here is when pieces "share" a mate, or check. This can be at most 2 due to discovery checks
// the board configuration will also have to be as it was in the instance of checkmate, or the previous mate.
// So this is going to need to hook into the loadPGN, probably.
export function getMateAndAssists(gameHistory: GameHistoryMove[]) {
  let assistingPiece;
  let matingPiece;
  let hockeyAssist;

  // check for mate
  if (gameHistory[gameHistory.length - 1].originalString.includes('#')) {
    matingPiece = gameHistory[gameHistory.length - 1].piece; // this doesn't disambiguate to the starting square of the piece; we'd want a chess.js rewrite to do that.

    // If mate see if also assist
    if (gameHistory[gameHistory.length - 3].originalString.includes('+')) {
      assistingPiece = gameHistory[gameHistory.length - 3].piece;

      // If assist check for hockey assist
      if (gameHistory[gameHistory.length - 5].originalString.includes('+')) {
        hockeyAssist = gameHistory[gameHistory.length - 5].piece;
      }
    }
  }

  // This is where we DO need to disambiguate, the same piece type but a different piece could provide the assist.
  // Pausing further work till we've fixed that

  return {
    matingPiece,
    assistingPiece,
    hockeyAssist,
  };
}

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
