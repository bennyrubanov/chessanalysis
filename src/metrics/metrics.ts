//@ts-nocheck - TODO: remove this after fixing the typing with capture
import { Chess, Square, UnambiguousPieceSymbol, PrettyMove } from '../../cjsmin/src/chess';
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

// DONE
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

// DONE 
// take a start and end board position and return the distances moved
export async function getMoveDistanceSingleGame(game: FileReaderGame) {
  const chess = new Chess();
  const moveGenerator = chess.historyGenerator(game.moves);

  // create an object to track distance value for each piece
  const distanceMap: { [key: string]: number } = {};

  let lastMove: PrettyMove | null = null;

  // Initialize variables to keep track of the maximum distance and the piece
  let maxDistance = -1;
  let maxDistancePiece: UnambiguousPieceSymbol;

  // evaluate each move, update the correct unambiguous piece's distance
  for (let moveInfo of moveGenerator) {
    const { move, board } = moveInfo;

    lastMove = move;
    let piece = lastMove.unambiguousSymbol;

    if (!distanceMap[piece]) {
      distanceMap[piece] = 0;
    }

    const fromMove = moveInfo.move.from
    const toMove = moveInfo.move.to

    let distance = 0;

    // Check if the move is a castling move
    if (moveInfo.move.flags === 'k' || moveInfo.move.flags === 'q') {
      // move was done by black
      if (moveInfo.move.color === 'b'){
        // queenside castle
        if (moveInfo.move.flags === 'q') {
          distanceMap['k'] += 2
          distanceMap['ra'] = (distanceMap['ra'] || 0) + 3
        }
        //kingside castle
        else {
          distanceMap['k'] += 2
          distanceMap['rh'] = (distanceMap['rh'] || 0) + 2
        }
      }
      // move was done by white
      else {
        // queenside castle
        if (moveInfo.move.flags === 'q') {
          distanceMap['K'] += 2
          distanceMap['RA'] = (distanceMap['RA'] || 0) + 3
        }
        // kingside castle
        else {
          distanceMap['K'] += 2
          distanceMap['RH'] = (distanceMap['RH'] || 0) + 2
        }
      }

    } else {
      // Calculate the file (column) distance by subtracting ASCII values
      const fileDist = Math.abs(fromMove.charCodeAt(0) - toMove.charCodeAt(0));
      // Calculate the rank (row) distance by subtracting numeric values
      const rankDist = Math.abs(Number(fromMove[1]) - Number(toMove[1]));
      // The distance moved is the maximum of fileDist and rankDist
      distance = Math.max(fileDist, rankDist);

      distanceMap[piece] += distance;

    }

    if (distanceMap[piece] > maxDistance) {
      maxDistance = distanceMap[piece];
      maxDistancePiece = piece;
    }
  }

  return {
    maxDistancePiece,
    maxDistance,
    distanceMap,
  };
}

// DONE 
// returns the piece that moved the furthest, the game it moved the furthest in, the distance it moved, and the number of games analyzed in the set
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

// DONE
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

// DONE
// calculates piece with highest K/D ratio and also contains assists by that piece
export async function getKillDeathRatios(games: FileReaderGame[]) {

  // create an object to track kills, deaths, and assists of each piece
  // The killsDeathsAssistsMap is an object where each key is a piece and the value is another object with kills, deaths, and assists properties.
  const killsDeathsAssistsMap: {
    [key: string]: { kills: number; deaths: number; assists: number };
  } = {};
  
  const killDeathRatios = {}

  let lastMove: PrettyMove | null = null;

  // look at each game and find the piece with the largest kill/death ratio
  for (const game of games) {

    const chess = new Chess();
    const moveGenerator = chess.historyGenerator(game.moves);
    const siteLink = game.metadata[1].match(/"(.*?)"/)[1];
    console.log(`lichess link to game played: ${siteLink}`);

    for (let moveInfo of moveGenerator) {
      const { move, board } = moveInfo;

      lastMove = move;
      let piece = lastMove.unambiguousSymbol;

      if (!killsDeathsAssistsMap[piece]) {
        killsDeathsAssistsMap[piece] = { kills: 0, deaths: 0, assists: 0 };
      }

      const movedPiece = lastMove.unambiguousSymbol;
    
      // Check if movedPiece is not undefined
      if (movedPiece) {
        // update the kill & death counts of movedPiece
        if (lastMove.capture) {
          killsDeathsAssistsMap[movedPiece].kills++;

          const capturedPiece = board[lastMove.toIndex]?.unambiguousSymbol; // Get the unambiguous piece symbol from the board state

          if (capturedPiece) {
            if (!killsDeathsAssistsMap[capturedPiece]) {
              killsDeathsAssistsMap[capturedPiece] = { kills: 0, deaths: 0, assists: 0 };
            }
            killsDeathsAssistsMap[capturedPiece].deaths++;
          }
        }


      } 
      else {
        console.log('No piece found for square:', move.from);
        console.log("move: ", move)
      }


    }

    // Check if the game is in checkmate after the last move
    if (chess.isCheckmate()) {

      const { unambigMatingPiece, unambigMatedPiece } = getMateAndAssistsFromHistoryGenerator(game.moves);      
      console.log(`${unambigMatingPiece} was the unambiguous piece that delivered checkmate`)
    
      if (unambigMatingPiece) {
        killsDeathsAssistsMap[unambigMatingPiece].kills++;
      }

      if (unambigMatedPiece) {
        killsDeathsAssistsMap[unambigMatedPiece].deaths++;
      }
    }


  }

  // calculate the kill death ratios of each piece
  for (const piece of Object.keys(killsDeathsAssistsMap)) {
    const kills = killsDeathsAssistsMap[piece].kills;
    const deaths = killsDeathsAssistsMap[piece].deaths || 0;
    if (deaths !== 0) {
      killDeathRatios[piece] = kills / deaths;
    }
  }

  // Log the killDeathRatios and killsDeathsAssistsMap
  console.log('killDeathRatios:', killDeathRatios);
  console.log('killsDeathsAssistsMap:', killsDeathsAssistsMap);

  // find the piece with the highest kill death ratio
  let maxKillDeathRatio = 0;
  let pieceWithHighestKillDeathRatio = null;

  for (const piece of Object.keys(killDeathRatios)) {
    const ratio = killDeathRatios[piece];
    if (ratio > maxKillDeathRatio) {
      maxKillDeathRatio = ratio;
      pieceWithHighestKillDeathRatio = piece;
    }
  }

  return {
    killDeathRatios,
    killsDeathsAssistsMap,
    pieceWithHighestKillDeathRatio,
  };
}

// Need to decide how we assign the openings to a game (and get a db of openings)
function checkOpening() {}

// take a board and move and see if a capture occurred
function checkForCapture(board: Chess, move: string) {}

// DONE
// One edge case currently unaccounted for is when pieces "share" a mate, or check. This can be at most 2 due to discovery checks (currently we disregard this by just referring to whatever the PGN says. If the piece that moves causes checkmate, then it is the "mating piece")
export function getMateAndAssists(pgnMoveLine: string) {
  const chess = new Chess();
  const moveGenerator = chess.historyGenerator(pgnMoveLine);

  let matingPiece;
  let assistingPiece;
  let hockeyAssist;
  let unambigMatingPiece;
  let unambigMatedPiece;
  let unambigAssistingPiece;
  let unambigHockeyAssistPiece;
  let lastPieceMoved;
  let lastMove: PrettyMove | null = null;

  // Keep track of the last few moves
  let lastFewMoves: PrettyMove[] = [];

  for (let moveInfo of moveGenerator) {
    const { move, board } = moveInfo;

    lastMove = move;

    // Add the current move to the start of the array
    lastFewMoves.unshift(move);

    // If we have more than 5 moves in the array, remove the oldest one
    if (lastFewMoves.length > 5) {
      lastFewMoves.pop();
    }

  }
  console.log("last move: ", lastMove)

  if (lastMove) {
    lastPieceMoved = lastMove.unambiguousSymbol;

    if (lastMove.originalString.includes('#')) {
      matingPiece = lastMove.piece;
      unambigMatingPiece = lastMove.unambiguousSymbol;

      // Determine the color of the mated king
      const matedKingColor = lastMove.color === 'w' ? 'b' : 'w';
      unambigMatedPiece = matedKingColor === 'w' ? 'K' : 'k';

      // If mate see if also assist
      if (lastFewMoves[2] && lastFewMoves[2].originalString.includes('+') && lastFewMoves[2].unambiguousSymbol !== unambigMatingPiece) {
        assistingPiece = lastFewMoves[2].piece;
        unambigAssistingPiece = lastFewMoves[2].unambiguousSymbol;

        // If assist check for hockey assist
        if (lastFewMoves[4] && lastFewMoves[4].originalString.includes('+') && lastFewMoves[4].unambiguousSymbol !== unambigAssistingPiece && lastFewMoves[4].unambiguousSymbol !== unambigMatingPiece) {
          hockeyAssist = lastFewMoves[4].piece;
          unambigHockeyAssistPiece = lastFewMoves[4].unambiguousSymbol;
        }
      }
    } else {
      // Handle non-checkmate endings here
      console.log('The game did not end in a checkmate. The last piece that moved was:', lastPieceMoved);
    }
  }
  console.log("mating piece: ", matingPiece);
  console.log("assisting piece: ", assistingPiece);
  console.log("hockey assisting piece: ", hockeyAssist);
  console.log("unambig mating piece: ", unambigMatingPiece);
  console.log("unambig mated piece: ", unambigMatedPiece);
  console.log("unambig assisting piece: ", unambigAssistingPiece);
  console.log("unambig hockey assisting piece: ", unambigHockeyAssistPiece);
  console.log("last piece moved: ", lastPieceMoved);
  
  return {
    matingPiece,
    assistingPiece,
    hockeyAssist,
    unambigMatingPiece,
    unambigMatedPiece,
    unambigAssistingPiece,
    unambigHockeyAssistPiece,
    lastPieceMoved
  };
}

// convert PGN string to GameHistoryObject
export function pgnToGameHistory(pgn: string): GameHistoryMove[] {
  const chess = new Chess();
  chess.loadPgn(pgn);
  return chess.history({ verbose: true });
}

// convert gameHistory object to a PGN string
export function gameHistoryToPgn(gameHistory: GameHistoryMove[]): string {
  const chess = new Chess();

  for (const move of gameHistory) {
    chess.move(move);
  }

  return chess.pgn();
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
