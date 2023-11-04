import { Chess } from '../../cjsmin/src/chess';
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

      let movedPiece = move.uas;

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
