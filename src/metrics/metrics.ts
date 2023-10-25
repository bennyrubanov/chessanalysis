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
  const basePieceSquares = new Map<Square, UnambiguousPieceSymbol>();
  basePieceSquares.set('a1', 'RA');
  basePieceSquares.set('b1', 'NB');
  basePieceSquares.set('c1', 'BC');
  basePieceSquares.set('d1', 'Q');
  basePieceSquares.set('e1', 'K');
  basePieceSquares.set('f1', 'BF');
  basePieceSquares.set('g1', 'NG');
  basePieceSquares.set('h1', 'RH');
  basePieceSquares.set('a2', 'PA');
  basePieceSquares.set('b2', 'PB');
  basePieceSquares.set('c2', 'PC');
  basePieceSquares.set('d2', 'PD');
  basePieceSquares.set('e2', 'PE');
  basePieceSquares.set('f2', 'PF');
  basePieceSquares.set('g2', 'PG');
  basePieceSquares.set('h2', 'PH');
  basePieceSquares.set('a8', 'ra');
  basePieceSquares.set('b8', 'nb');
  basePieceSquares.set('c8', 'bc');
  basePieceSquares.set('d8', 'q');
  basePieceSquares.set('e8', 'k');
  basePieceSquares.set('f8', 'bf');
  basePieceSquares.set('g8', 'ng');
  basePieceSquares.set('h8', 'rh');
  basePieceSquares.set('a7', 'pa');
  basePieceSquares.set('b7', 'pb');
  basePieceSquares.set('c7', 'pc');
  basePieceSquares.set('d7', 'pd');
  basePieceSquares.set('e7', 'pe');
  basePieceSquares.set('f7', 'pf');
  basePieceSquares.set('g7', 'pg');
  basePieceSquares.set('h7', 'ph');

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

//DONE 
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

// IN PROGRESS
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
    console.log(`game.moves: ${game.moves}`);
    const siteLink = game.metadata[1].match(/"(.*?)"/)[1];
    console.log(`lichess link to game played: ${siteLink}`);

    for (let moveInfo of moveGenerator) {
      const { move, board } = moveInfo;
      //console.log("move: ", move)
      //console.log("board: ", board)
      lastMove = move;
      console.log(move.originalString)
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

          console.log(`captured piece: ${capturedPiece}`)

          if (capturedPiece) {
            if (!killsDeathsAssistsMap[capturedPiece]) {
              killsDeathsAssistsMap[capturedPiece] = { kills: 0, deaths: 0, assists: 0 };
            }
            killsDeathsAssistsMap[capturedPiece].deaths++;
          }
        }
        
        // Logs
        //console.log(`Move: ${move.originalString}, Captured: ${move.capture?.unambiguousSymbol}`);      
        // the line below logs only elements of the killsDeathsAssistsMap that are nonzero for kills, deaths, or assists
        // console.log(
        //   'killsDeathsAssistsMap:',
        //   Object.fromEntries(
        //     Object.entries(killsDeathsAssistsMap).filter(
        //       ([key, { kills, deaths, assists }]) => kills !== 0 || deaths !== 0 || assists !== 0
        //     )
        //   )
        // );

      } 
      else {
        console.log('No piece found for square:', move.from);
        console.log("move: ", move)
      }

    console.log("KDR map: ", killsDeathsAssistsMap)

    }

    // Check if the game is in checkmate after the last move
    if (chess.isCheckmate()) {
      // chess.loadPgn(game.moves);
      // console.log("chess: ", chess)
      // const gameMoves = chess.moves();
      console.log("game.moves: ", game.moves)
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

// IN PROGRESS - called on in getKillDeathRatios, need to finish before the other finishes too
// start from back of history. For this to be accurate we need to know which piece checks the king at this index
// the edge case here is when pieces "share" a mate, or check. This can be at most 2 due to discovery checks
// the board configuration will also have to be as it was in the instance of checkmate, or the previous mate.
// So this is going to need to hook into the loadPGN, probably.
export function getMateAndAssists(gameHistory: GameHistoryMove[]) {
  let matingPiece;
  let assistingPiece;
  let hockeyAssist;
  let unambigMatingPiece;
  let unambigMatedPiece;
  let unambigAssistingPiece;
  let unambigHockeyAssistPiece;
  let lastPieceMoved;
  let lastMove: PrettyMove | null = null;

  // ambiguous pieces
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

  // unambiguous pieces
  // This is where we DO need to disambiguate, the same piece type but a different piece could provide the assist.
  const basePieceSquares = new Map<Square, UnambiguousPieceSymbol>();
  basePieceSquares.set('a1', 'RA');
  basePieceSquares.set('b1', 'NB');
  basePieceSquares.set('c1', 'BC');
  basePieceSquares.set('d1', 'Q');
  basePieceSquares.set('e1', 'K');
  basePieceSquares.set('f1', 'BF');
  basePieceSquares.set('g1', 'NG');
  basePieceSquares.set('h1', 'RH');
  basePieceSquares.set('a2', 'PA');
  basePieceSquares.set('b2', 'PB');
  basePieceSquares.set('c2', 'PC');
  basePieceSquares.set('d2', 'PD');
  basePieceSquares.set('e2', 'PE');
  basePieceSquares.set('f2', 'PF');
  basePieceSquares.set('g2', 'PG');
  basePieceSquares.set('h2', 'PH');
  basePieceSquares.set('a8', 'ra');
  basePieceSquares.set('b8', 'nb');
  basePieceSquares.set('c8', 'bc');
  basePieceSquares.set('d8', 'q');
  basePieceSquares.set('e8', 'k');
  basePieceSquares.set('f8', 'bf');
  basePieceSquares.set('g8', 'ng');
  basePieceSquares.set('h8', 'rh');
  basePieceSquares.set('a7', 'pa');
  basePieceSquares.set('b7', 'pb');
  basePieceSquares.set('c7', 'pc');
  basePieceSquares.set('d7', 'pd');
  basePieceSquares.set('e7', 'pe');
  basePieceSquares.set('f7', 'pf');
  basePieceSquares.set('g7', 'pg');
  basePieceSquares.set('h7', 'ph');

  const moveHistory = gameHistory;

  // duplicate the base map
  const pieceSquares = new Map<Square, UnambiguousPieceSymbol>(
    basePieceSquares
  );

  // update the pieceSquares map after each move
  for (const move of moveHistory) {
    const movedPiece = pieceSquares.get(move.from);
    if (movedPiece) {
      pieceSquares.set(move.to, movedPiece);
      pieceSquares.delete(move.from);
  
      if (move.capture) {
        pieceSquares.delete(move.to);
        pieceSquares.set(move.to, movedPiece);
      }
    }
    //console.log(move.originalString)
    //console.log(pieceSquares)
  }

  //console.log("pieceSquares final state: ", pieceSquares)


  if (moveHistory[moveHistory.length - 1].originalString.includes('#')) {
    const matingSquare = moveHistory[moveHistory.length - 1].to;
    unambigMatingPiece = pieceSquares.get(matingSquare);
    console.log("unambigMatingPiece: ", unambigMatingPiece)
    let matedKingSquare;

    // iterate over pieceSquares to identify the mated king's square
    // probably better, more efficient ways to do this?
    for (const [square, piece] of pieceSquares.entries()) {
      if ((unambigMatingPiece.toLowerCase() === unambigMatingPiece && piece === 'K') || 
          (unambigMatingPiece.toUpperCase() === unambigMatingPiece && piece === 'k')) {
        matedKingSquare = square;
        break;
      }
    }
    unambigMatedPiece = pieceSquares.get(matedKingSquare);

    // console.log("unambigMatingPiece: ", unambigMatingPiece)
    // console.log("matedKingSquare: ", matedKingSquare)
    // console.log("unambigMatedPiece: ", unambigMatedPiece)


    // If mate see if also assist
    const assistCandidateSquare = moveHistory[moveHistory.length - 3].to;
    let unambigAssistCandidate = pieceSquares.get(assistCandidateSquare);
    if (
      moveHistory[moveHistory.length - 3].originalString.includes('+') &&
      unambigMatingPiece !== unambigAssistCandidate
    ) {
      unambigAssistingPiece = unambigAssistCandidate;

      // If assist check for hockey assist
      const hockeyCandidateSquare = moveHistory[moveHistory.length - 5].to;
      let unambigHockeyCandidate = pieceSquares.get(hockeyCandidateSquare);
      if (
        moveHistory[moveHistory.length - 5].originalString.includes('+') &&
        unambigAssistingPiece !== unambigHockeyCandidate &&
        unambigMatingPiece !== unambigHockeyCandidate
      ) {
        unambigHockeyAssistPiece = unambigHockeyCandidate;
      }
    }
  } else {
    // Handle non-checkmate endings here
    // Identify the last piece that moved:
    const lastMove = moveHistory[moveHistory.length - 1];
    lastPieceMoved = pieceSquares.get(lastMove.to);
    console.log('The game did not end in a checkmate. The last piece that moved was:', lastPieceMoved);
  }

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

// attempting to implement historyGenerator
export function getMateAndAssistsFromHistoryGenerator(pgnMoveLine: string) {
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
    //console.log("move: ", move)
    //console.log("board: ", board)
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
