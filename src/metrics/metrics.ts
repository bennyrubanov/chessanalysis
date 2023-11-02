import { Chess, PrettyMove } from '../../cjsmin/src/chess';
import { FileReaderGame } from '../types';

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

// calculates piece with highest K/D ratio and also contains assists by that piece
export async function getKillDeathRatios(games: FileReaderGame[]) {
  console.time('Task 4: getKillDeathRatios');
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
  let pieceWithHighestKDRatio = null;

  for (const piece of Object.keys(killDeathRatios)) {
    const ratio = killDeathRatios[piece];
    if (ratio > maxKillDeathRatio) {
      maxKillDeathRatio = ratio;
      pieceWithHighestKDRatio = piece;
    }
  }

  // KDR facts
  console.log('KDR FACTS (INCLUDING CHECKMATES AS KILLS):');
  console.log(
    `Piece with the highest kill death ratio: ${pieceWithHighestKDRatio}`
  );
  console.log('Kills, Deaths, and Assists for each unambiguous piece:'),
    console.table(killsDeathsAssistsMap);
  console.log(
    'Kill Death Ratios for each unambiguous piece: ' +
      JSON.stringify(killDeathRatios, null, 2)
  );

  console.timeEnd('Task 4: getKillDeathRatios');
  return {
    killDeathRatios,
    killsDeathsAssistsMap,
    pieceWithHighestKDRatio,
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
  console.time('Task 5: getGameWithMostMoves');
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

  console.timeEnd('Task 5: getGameWithMostMoves');

  // moves facts
  console.log('MOVES FACTS:');
  console.log(`The game with the most moves played: ${gameWithMostMoves}`);
  console.log(`The number of moves played in that game: ${maxNumMoves}`);

  console.log('==============================================================');
  console.log('\n');

  return {
    gameLinkWithMostMoves,
    maxNumMoves,
  };
}

export async function getPieceLevelMoveInfo(games: FileReaderGame[]) {
  console.time('Task 6: getPieceLevelMoveInfo');
  const numMovesByPiece = {};
  let avgMovesByPiece = {};
  let piecesWithMostMovesInAGame = [];
  let piecesWithHighestAvgMoves = [];
  let linkWithMostMoves = [];
  let maxMoves = 0;

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
        if (!numMovesByPiece[movedPiece]) {
          numMovesByPiece[movedPiece] = 0;
        }
        numMovesByPiece[movedPiece]++;
        numMovesByPieceThisGame[movedPiece]++;

        // Check if the move is a castling move
        if (moveInfo.move.flags === 'k' || moveInfo.move.flags === 'q') {
          let movingRook = moveInfo.move.flags === 'k' ? 'rh' : 'ra';
          if (moveInfo.move.color === 'w') {
            movingRook = movingRook.toUpperCase();
          }

          if (!numMovesByPiece[movingRook]) {
            numMovesByPiece[movingRook] = 0;
          }

          // duplicative action for the array capturing moves by piece for this game
          if (!numMovesByPieceThisGame[movingRook]) {
            numMovesByPieceThisGame[movingRook] = 0;
          }

          numMovesByPiece[movingRook]++;
          numMovesByPieceThisGame[movingRook]++;
        }
      }
    }

    for (const uahPiece of Object.keys(numMovesByPieceThisGame)) {
      let maxMovesInGame = numMovesByPieceThisGame[uahPiece];

      if (maxMovesInGame > maxMoves) {
        maxMoves = maxMovesInGame;
        piecesWithMostMovesInAGame = [uahPiece]; // New highest moves, reset the array
        linkWithMostMoves = [
          game.metadata
            .find((item) => item.startsWith('[Site "'))
            ?.replace('[Site "', '')
            .replace('"]', ''),
        ]; // New highest moves, reset the array
      } else if (maxMovesInGame === maxMoves) {
        piecesWithMostMovesInAGame.push(uahPiece); // Tie, add to the array
        linkWithMostMoves.push(
          game.metadata
            .find((item) => item.startsWith('[Site "'))
            ?.replace('[Site "', '')
            .replace('"]', '')
        ); // Tie, add to the array
      }
    }
  }

  // calculate average num moves by piece
  for (const uahPiece of Object.keys(numMovesByPiece)) {
    avgMovesByPiece[uahPiece] = numMovesByPiece[uahPiece] / gameCount;
  }

  let maxAverageNumMoves = 0;

  // find the piece with the highest average num moves
  for (const uahPiece of Object.keys(avgMovesByPiece)) {
    const averageNumMoves = avgMovesByPiece[uahPiece];
    if (averageNumMoves > maxAverageNumMoves) {
      maxAverageNumMoves = averageNumMoves;
      piecesWithHighestAvgMoves = [uahPiece]; // New highest average, reset the array
    } else if (averageNumMoves === maxAverageNumMoves) {
      piecesWithHighestAvgMoves.push(uahPiece); // Tie, add to the array
    }
  }

  console.log(
    `The piece with the highest average number moves: ${piecesWithHighestAvgMoves}`
  );
  console.log(
    `The piece with the most moves in a single game: ${piecesWithMostMovesInAGame}`
  );
  console.log('The total number of moves by piece in the set of games:'),
    console.table(numMovesByPiece);
  console.log('The average number of moves by piece in the set of games:'),
    console.table(avgMovesByPiece);
  console.log(
    `The number of moves played by that piece in that game: ${maxMoves}`
  );
  console.log(
    `The game that piece made that many moves in: ${linkWithMostMoves}`
  );

  console.timeEnd('Task 6: getPieceLevelMoveInfo');

  return {
    numMovesByPiece,
    avgMovesByPiece: avgMovesByPiece,
    piecesWithHighestAvgMoves: piecesWithHighestAvgMoves,
    piecesWithMostMovesInAGame,
    linkWithMostMoves,
    maxMoves,
  };
}
