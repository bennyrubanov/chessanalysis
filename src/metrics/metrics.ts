import { Chess, Square, UnambiguousPieceSymbol } from '../../cjsmin/src/chess';
import { FileReaderGame, GameHistoryMove } from '../types';

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

// calculates how many games in the dataset
export function countGamesInDataset(datasetPath: string): number {
  const fs = require('fs');
  const path = require('path');

  let data = fs.readFileSync(
    path.join(__dirname, '../data/10.10.23_test_set'),
    'utf8'
  );
  let games = data.split('\n[Event');
  // If the first game doesn't start with a newline, add 1 back to the count
  if (data.startsWith('[Event')) {
    console.log(`Number of games: ${games.length}`);
    return games.length;
  } else {
    console.log(`Number of games: ${games.length - 1}`); // Subtract 1 because the first split item will be an empty string
    return games.length - 1;
  }
}

// take a start and end board position and return the distances moved
export async function getMoveDistanceSingleGame(game: FileReaderGame) {
  const basePieceSquares = new Map<Square, UnambiguousPieceSymbol>();
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
  const pieceSquares = new Map<Square, UnambiguousPieceSymbol>(
    basePieceSquares
  );

  // create an object to track distance value for each piece
  const distanceMap: { [key: string]: number } = {};
  for (const piece of pieceSquares.values()) {
    distanceMap[piece] = 0;
  }

  // Initialize variables to keep track of the maximum distance and the piece
  let maxDistance = -1;
  let maxDistancePiece: UnambiguousPieceSymbol;

  // TODO: we'll need to update the labels we use in cjsmin to be unique to do things this way
  for (const { from, to } of moveHistory) {
    // Calculate the file (column) distance by subtracting ASCII values
    const fileDist = Math.abs(from.charCodeAt(0) - to.charCodeAt(0));
    // Calculate the rank (row) distance by subtracting numeric values
    const rankDist = Math.abs(Number(from[1]) - Number(to[1]));
    // The distance moved is the maximum of fileDist and rankDist
    const distance = Math.max(fileDist, rankDist);
    // Get the piece that moved from the pieceSquares map
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
    distanceMap,
  };
}

//returns the piece that moved the furthest, the game it moved the furthest in, the distance it moved, and the number of games analyzed in the set
export async function getMoveDistanceSetOfGames(games: FileReaderGame[]) {
  let maxDistance = 0;
  let pieceThatMovedTheFurthest = null;
  let totalDistanceMap: { [key: string]: number } = {};
  let gameWithFurthestPiece = null;
  let siteWithFurthestPiece = null;
  let lastGame;

  let gameCount = 0;
  for await (const game of games) {
    // progress tracker
    gameCount++;
    if (gameCount % 20 == 0) {
      console.log('number of games analyzed: ', gameCount);
    }

    const {
      maxDistancePiece,
      maxDistance: distance,
      distanceMap,
    } = await getMoveDistanceSingleGame(game);

    if (distance > maxDistance) {
      maxDistance = distance;
      pieceThatMovedTheFurthest = maxDistancePiece;
      gameWithFurthestPiece = game;
      let site = game.metadata
        .find((item) => item.startsWith('[Site "'))
        ?.replace('[Site "', '')
        .replace('"]', '');
      siteWithFurthestPiece = site;
    }

    for (const piece of Object.keys(distanceMap)) {
      if (!totalDistanceMap[piece]) {
        totalDistanceMap[piece] = 0;
      }
      totalDistanceMap[piece] += distanceMap[piece];
    }

    lastGame = game;
  }

  console.log('Last game analyzed: ', lastGame);

  return {
    pieceThatMovedTheFurthest,
    maxDistance,
    gameCount,
    siteWithFurthestPiece,
    totalDistanceMap,
    lastGame,
  };
}

// calculates piece with highest average distance and that piece's average distance covered per game in a set of games
export function getAverageDistance(
  distanceMap: { [key: string]: number },
  gameCount: number
) {
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

// calculates piece with highest K/D ratio and also contains assists by that piece
export async function getkillDeathRatios(games: FileReaderGame[]) {
  const killDeathRatios = {};
  const kills = {};
  const deaths = {};
  const assists = {};

  // look at each game and find the piece with the largest kill/death ratio
  for (const game of games) {
    const basePieceSquares = new Map<Square, UnambiguousPieceSymbol>();
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
    const pieceSquares = new Map<Square, UnambiguousPieceSymbol>(
      basePieceSquares
    );

    // create an object to track kills, deaths, and assists of each piece
    const killDeathMap: {
      [key: string]: { kills: number; deaths: number; assists: number };
    } = {};
    for (const piece of pieceSquares.values()) {
      killDeathMap[piece] = { kills: 0, deaths: 0, assists: 0 };
    }

    //
    for (const move of moveHistory) {
      if (move.captured) {
        if (!kills[move.piece]) {
          kills[move.piece] = 0;
        }
        kills[move.piece]++;

        if (!deaths[move.captured.type]) {
          deaths[move.captured.type] = 0;
        }
        deaths[move.captured.type]++;
      }

      // Check if the game is in checkmate after the move
      if (chess.isCheckmate()) {
        if (!kills[move.piece]) {
          kills[move.piece] = 0;
        }
        kills[move.piece]++;
      }
    }
  }

  for (const piece of Object.keys(kills)) {
    if (!deaths[piece]) {
      deaths[piece] = 0;
    }
    killDeathRatios[piece] = kills[piece] / deaths[piece];
  }

  return killDeathRatios;
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
    const assistCandidate = gameHistory[gameHistory.length - 3].piece;
    if (
      gameHistory[gameHistory.length - 3].originalString.includes('+') &&
      matingPiece !== assistCandidate
    ) {
      assistingPiece = assistCandidate;

      // If assist check for hockey assist
      const hockeyCandidate = gameHistory[gameHistory.length - 5].piece;
      if (
        gameHistory[gameHistory.length - 5].originalString.includes('+') &&
        assistingPiece !== hockeyCandidate &&
        matingPiece !== hockeyCandidate
      ) {
        hockeyAssist = hockeyCandidate;
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
