import {
  Chess,
  PrettyMove,
  UnambiguousPieceSymbol,
} from '../../cjsmin/src/chess';
import { FileReaderGame } from '../types';

// calculates how many games in the dataset
export function countGamesInDataset(datasetPath: string): number {
  const fs = require('fs');

  let data = fs.readFileSync(datasetPath, 'utf8');
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
  const chess = new Chess();
  const moveGenerator = chess.historyGenerator(game.moves);

  // try catch because this function is the first to be called by index.ts main, so it will crash first
  try {

  // create an object to track distance value for each piece
  const distanceMap: { [key: string]: number } = {};

  // Initialize variables to keep track of the maximum distance and the piece
  let maxDistance = -1;
  let maxDistancePiece: UnambiguousPieceSymbol;
  let singleGameDistanceTotal = 0;

  // evaluate each move, update the correct unambiguous piece's distance
  for (let moveInfo of moveGenerator) {
    const { move, board } = moveInfo;

    if (!distanceMap[move.unambiguousSymbol]) {
      distanceMap[move.unambiguousSymbol] = 0;
    }

    const fromMove = moveInfo.move.from;
    const toMove = moveInfo.move.to;

    let distance = 0;

    // Check if the move is a castling move
    if (moveInfo.move.flags === 'k' || moveInfo.move.flags === 'q') {
      let movingKing = 'k';
      let movingRook, rookDistance;

      if (moveInfo.move.flags === 'k') {
        rookDistance = 2;
        movingRook = 'rh';
      } else {
        rookDistance = 3;
        movingRook = 'ra';
      }

      if (moveInfo.move.color === 'w') {
        movingRook = movingRook.toUpperCase();
        movingKing = movingKing.toUpperCase();
      }

      distanceMap[movingKing] += 2;
      distanceMap[movingRook] += rookDistance;
      singleGameDistanceTotal += 2;
      singleGameDistanceTotal += rookDistance;

    } else {
      // Calculate the file (column) distance by subtracting ASCII values
      const fileDist = Math.abs(fromMove.charCodeAt(0) - toMove.charCodeAt(0));
      // Calculate the rank (row) distance by subtracting numeric values
      const rankDist = Math.abs(Number(fromMove[1]) - Number(toMove[1]));
      // The distance moved is the maximum of fileDist and rankDist
      distance = Math.max(fileDist, rankDist);

      distanceMap[move.unambiguousSymbol] += distance;
      singleGameDistanceTotal += distance;
    }

    if (distanceMap[move.unambiguousSymbol] > maxDistance) {
      maxDistance = distanceMap[move.unambiguousSymbol];
      maxDistancePiece = move.unambiguousSymbol;
    }
  }
  return {
    maxDistancePiece,
    maxDistance,
    distanceMap,
    singleGameDistanceTotal,
  };

  } catch (error) {
    console.error(`Error processing game: ${JSON.stringify(game, null, 2)}`);
    console.error(`Error message: ${error.message}`);
    throw error; // re-throw the error after logging
  }

}

// returns the piece that moved the furthest, the game it moved the furthest in, the distance it moved, and the number of games analyzed in the set
export async function getMoveDistanceSetOfGames(games: FileReaderGame[]) {
  let maxDistance = 0;
  let pieceThatMovedTheFurthest = null;
  let totalDistanceMap: { [key: string]: number } = {};
  let gameWithFurthestPiece = null;
  let siteWithFurthestPiece = null;
  let lastGame;
  let furthestCollectiveDistance = 0;
  let gameLinkWithFurthestCollectiveDistance = null;

  let gameCount = 0;
  for await (const game of games) {
    // progress tracker
    gameCount++;

    const {
      maxDistancePiece,
      maxDistance: distance,
      distanceMap,
      singleGameDistanceTotal,
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

    if (singleGameDistanceTotal > furthestCollectiveDistance) {
      furthestCollectiveDistance = singleGameDistanceTotal;
      gameLinkWithFurthestCollectiveDistance = game.metadata
      .find((item) => item.startsWith('[Site "'))
      ?.replace('[Site "', '')
      .replace('"]', '');
    }

    for (const piece of Object.keys(distanceMap)) {
      if (!totalDistanceMap[piece]) {
        totalDistanceMap[piece] = 0;
      }
      totalDistanceMap[piece] += distanceMap[piece];
    }

    lastGame = game;
  }

  return {
    pieceThatMovedTheFurthest,
    maxDistance,
    gameCount,
    gameWithFurthestPiece,
    siteWithFurthestPiece,
    totalDistanceMap,
    lastGame,
    furthestCollectiveDistance,
    gameLinkWithFurthestCollectiveDistance,
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
export async function getKillDeathRatios(games: FileReaderGame[]) {
  // create an object to track kills, deaths, and assists of each piece
  // The killsDeathsAssistsMap is an object where each key is a piece and the value is another object with kills, deaths, and assists properties.
  const killsDeathsAssistsMap: {
    [key: string]: { kills: number; deaths: number; assists: number };
  } = {};

  const killDeathRatios = {};

  // look at each game and find the piece with the largest kill/death ratio
  for (const game of games) {
    const chess = new Chess();
    const moveGenerator = chess.historyGenerator(game.moves);

    for (let moveInfo of moveGenerator) {
      const { move, board } = moveInfo;

      let piece = move.unambiguousSymbol;

      if (!killsDeathsAssistsMap[piece]) {
        killsDeathsAssistsMap[piece] = { kills: 0, deaths: 0, assists: 0 };
      }

      const movedPiece = move.unambiguousSymbol;

      // Check if movedPiece is not undefined
      if (movedPiece) {
        // update the kill & death counts of movedPiece
        if (move.capture) {
          killsDeathsAssistsMap[movedPiece].kills++;

          const capturedPiece = board[move.toIndex]?.unambiguousSymbol; // Get the unambiguous piece symbol from the board state

          if (capturedPiece) {
            if (!killsDeathsAssistsMap[capturedPiece]) {
              killsDeathsAssistsMap[capturedPiece] = {
                kills: 0,
                deaths: 0,
                assists: 0,
              };
            }
            killsDeathsAssistsMap[capturedPiece].deaths++;
          }
        }
      } else {
        console.log('No piece found for square:', move.from);
        console.log('move: ', move);
      }
    }

    // Check if the game is in checkmate after the last move
    if (chess.isCheckmate()) {
      const { unambigMatingPiece, unambigMatedPiece } = getMateAndAssists(
        game.moves
      );

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

// One edge case currently unaccounted for is when pieces "share" a mate, or check. This can be at most 2 due to discovery checks (currently we disregard this by just referring to whatever the PGN says. If the piece that moves causes checkmate, then it is the "mating piece")
export function getMateAndAssists(pgnMoveLine: string) {
  const chess = new Chess();
  const moveGenerator = chess.historyGenerator(pgnMoveLine);

  let matingPiece,
    assistingPiece,
    hockeyAssist,
    unambigMatingPiece,
    unambigMatedPiece,
    unambigAssistingPiece,
    unambigHockeyAssistPiece,
    lastPieceMoved;

  // Keep track of the last few moves
  let lastFewMoves: PrettyMove[] = [];

  for (let moveInfo of moveGenerator) {
    const { move, board } = moveInfo;

    // Add the current move to the start of the array
    lastFewMoves.unshift(move);

    // If we have more than 5 moves in the array, remove the oldest one
    if (lastFewMoves.length > 5) {
      lastFewMoves.pop();
    }

    if (move?.originalString.includes('#')) {
      matingPiece = move.piece;
      unambigMatingPiece = move.unambiguousSymbol;

      // Determine the color of the mated king
      const matedKingColor = move.color === 'w' ? 'b' : 'w';
      unambigMatedPiece = matedKingColor === 'w' ? 'K' : 'k';

      // If mate see if also assist
      if (
        lastFewMoves[2] &&
        lastFewMoves[2].originalString.includes('+') &&
        lastFewMoves[2].unambiguousSymbol !== unambigMatingPiece
      ) {
        assistingPiece = lastFewMoves[2].piece;
        unambigAssistingPiece = lastFewMoves[2].unambiguousSymbol;

        // If assist check for hockey assist
        if (
          lastFewMoves[4] &&
          lastFewMoves[4].originalString.includes('+') &&
          lastFewMoves[4].unambiguousSymbol !== unambigAssistingPiece &&
          lastFewMoves[4].unambiguousSymbol !== unambigMatingPiece
        ) {
          hockeyAssist = lastFewMoves[4].piece;
          unambigHockeyAssistPiece = lastFewMoves[4].unambiguousSymbol;
        }
      }
    }
  }
  // console.log('mating piece: ', matingPiece);
  // console.log('assisting piece: ', assistingPiece);
  // console.log('hockey assisting piece: ', hockeyAssist);
  // console.log('unambig mating piece: ', unambigMatingPiece);
  // console.log('unambig mated piece: ', unambigMatedPiece);
  // console.log('unambig assisting piece: ', unambigAssistingPiece);
  // console.log('unambig hockey assisting piece: ', unambigHockeyAssistPiece);
  // console.log('last piece moved: ', lastPieceMoved);

  return {
    matingPiece,
    assistingPiece,
    hockeyAssist,
    unambigMatingPiece,
    unambigMatedPiece,
    unambigAssistingPiece,
    unambigHockeyAssistPiece,
    lastPieceMoved,
  };
}

export async function getGameWithMostMoves(games: FileReaderGame[]) {
  let maxNumMoves = 0;
  let gameWithMostMoves: FileReaderGame | null = null;
  let gameLinkWithMostMoves = null;

  for await (const game of games) {
    const chess = new Chess();

    chess.loadPgn(game.moves);
    const numMoves = chess.history().length;

    if (numMoves > maxNumMoves) {
      maxNumMoves = numMoves;
      gameWithMostMoves = game;
      let site = game.metadata
      .find((item) => item.startsWith('[Site "'))
      ?.replace('[Site "', '')
      .replace('"]', '');
      gameLinkWithMostMoves = site;
    }
  }

  return {
    gameLinkWithMostMoves,
    maxNumMoves,
  };

}

export async function getPieceLevelMoveInfo(games: FileReaderGame[]) {
  const numMovesByPiece = {};
  let averageNumMovesByPiece = {};
  let pieceWithMostMovesInAGame = null;
  let pieceWithHighestAverageNumMoves = null;
  let gameLinkWithPieceMostMoves = null;
  let numMovesMadePieceWithMostMoves = 0;
  
  let gameCount = 0;

  for (const game of games) {
    gameCount++;
    const chess = new Chess();
    const moveGenerator = chess.historyGenerator(game.moves);

    const numMovesByPieceThisGame = {};

    // update move counts of each unambiguous piece
    for (let moveInfo of moveGenerator) {
      const { move } = moveInfo;

      let movedPiece = move.unambiguousSymbol;

      if (movedPiece) {
        if (!numMovesByPiece[movedPiece]){
          numMovesByPiece[movedPiece] = 0
        }
        numMovesByPiece[movedPiece]++;
        numMovesByPieceThisGame[movedPiece]++

        // Check if the move is a castling move
        if (moveInfo.move.flags === 'k' || moveInfo.move.flags === 'q') {
          let movingRook;
    
          if (moveInfo.move.flags === 'k') {
            movingRook = 'rh';
          } else {
            movingRook = 'ra';
          }
    
          if (moveInfo.move.color === 'w') {
            movingRook = movingRook.toUpperCase();
          }

          if (!numMovesByPiece[movingRook]){
            numMovesByPiece[movingRook] = 0
          }

          // duplicative action for the array capturing moves by piece for this game
          if (!numMovesByPieceThisGame[movingRook]){
            numMovesByPieceThisGame[movingRook] = 0
          }

          numMovesByPiece[movingRook]++;
          numMovesByPieceThisGame[movingRook]++;

        }
      }

      // console.log(move.originalString)
      // console.log(numMovesByPiece)

    }

    for (const uahPiece of Object.keys(numMovesByPieceThisGame)) {
      let maxMovesInGame = numMovesByPieceThisGame[uahPiece];

      if (maxMovesInGame > numMovesMadePieceWithMostMoves) {
        numMovesMadePieceWithMostMoves = maxMovesInGame;
        pieceWithMostMovesInAGame = uahPiece;
        gameLinkWithPieceMostMoves = game.metadata
        .find((item) => item.startsWith('[Site "'))
        ?.replace('[Site "', '')
        .replace('"]', '');
      }
    }

  }

  // calculate average num moves by piece
  for (const uahPiece of Object.keys(numMovesByPiece)) {
    averageNumMovesByPiece[uahPiece] = numMovesByPiece[uahPiece] / gameCount
  }

  let maxAverageNumMoves = 0;

  // find the piece with the highest average num moves
  for (const uahPiece of Object.keys(averageNumMovesByPiece)) {
    const averageNumMoves = averageNumMovesByPiece[uahPiece];
    if (averageNumMoves > maxAverageNumMoves) {
      maxAverageNumMoves = averageNumMoves;
      pieceWithHighestAverageNumMoves = uahPiece;
    }
  }

  return {
    numMovesByPiece,
    averageNumMovesByPiece,
    pieceWithHighestAverageNumMoves,
    pieceWithMostMovesInAGame,
    gameLinkWithPieceMostMoves,
    numMovesMadePieceWithMostMoves,
  }

}

export async function getPiecePromotionInfo(games: FileReaderGame[]) {
  let ambigPiecePromotedToMap = {};
  let promotingPieceMap = {};
  
  for (const game of games) {
    const chess = new Chess();
    chess.loadPgn(game.moves)
    const chessHistory = chess.history();

    for (const moveInfo of chessHistory) {
      if (moveInfo.originalString.includes('=')) {
        // REGEX to only capture the piece type
        const piecePromotedTo = moveInfo.originalString.split('=')[1].match(/[a-zA-Z]/)[0];
        
        const promotingPiece = moveInfo.unambiguousSymbol;

        // update ambigPiecePromotedToMap
        if (!ambigPiecePromotedToMap[piecePromotedTo]){
          ambigPiecePromotedToMap[piecePromotedTo] = 0
        }
        ambigPiecePromotedToMap[piecePromotedTo]++;

        // update promotingPieceMap
        if (!promotingPieceMap[promotingPiece]) {
          promotingPieceMap[promotingPiece] = 0
        }
        promotingPieceMap[promotingPiece]++

      }
    }
  }

  return {
    ambigPiecePromotedToMap,
    promotingPieceMap,
  }
}

export async function countAmbigPiecesOnBoard(games: FileReaderGame[]) {
  let piecesOnBoardCount = {};
  let maxQueenCounts = 0;
  let movesAndGamesWithMaxQueenCount = []

  for (const game of games) {
    const chess = new Chess();
    const moveGenerator = chess.historyGenerator(game.moves);

    for (const moveInfo of moveGenerator) {
      const { move, board } = moveInfo;
      let thisMoveQueenCount = 0;

      for (const piece of board) {
        if (piece) {
          if (piece.type === 'q') {
            thisMoveQueenCount++;
          }
          if (!piecesOnBoardCount[piece.type]) {
            piecesOnBoardCount[piece.type] = 0;
          }
          piecesOnBoardCount[piece.type]++;
        }
      }
      if (thisMoveQueenCount > maxQueenCounts) {
        maxQueenCounts = thisMoveQueenCount;
        movesAndGamesWithMaxQueenCount = [{
          game: game.metadata.find((item) => item.startsWith('[Site "'))
            ?.replace('[Site "', '')
            ?.replace('"]', ''),
          move: move.originalString
        }];
      } else if (thisMoveQueenCount === maxQueenCounts) {
        movesAndGamesWithMaxQueenCount.push({
          game: game.metadata.find((item) => item.startsWith('[Site "'))
            ?.replace('[Site "', '')
            ?.replace('"]', ''),
          move: move.originalString
        });
      }
    }


  }

  return {
    piecesOnBoardCount,
    maxQueenCounts,
    movesAndGamesWithMaxQueenCount,
  }
}