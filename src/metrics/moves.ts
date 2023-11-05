import { UnambiguousPieceSymbol } from '../../cjsmin/dist/types/chess';
import { Chess, Piece, PrettyMove } from '../../cjsmin/src/chess';
import { FileReaderGame, UAPMap } from '../types';
import { createUAPMap } from '../utils';
import { Metric } from './metric';

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

export class GameWithMostMovesMetric implements Metric {
  link: string;
  numMoves: number;

  constructor() {
    this.clear();
  }

  clear(): void {
    this.link = undefined;
    this.numMoves = 0;
  }

  processGame(game: { move: PrettyMove; board: Piece[] }[], gameLink?: string) {
    if (game.length > this.numMoves) {
      this.numMoves = game.length;
      this.link = gameLink;
    }
  }

  logResults(): void {
    console.log('MOVES FACTS:');
    console.log(`The game with the most moves played: ${this.link}`);
    console.log(`The number of moves played in that game: ${this.numMoves}`);

    console.log(
      '=============================================================='
    );
    console.log('\n');
  }
}

export class PieceLevelMoveInfoMetric implements Metric {
  totalMovesByPiece: UAPMap<{ numMoves: number }>;
  singleGameMaxMoves: number;
  uasWithMostMoves: UnambiguousPieceSymbol[];
  gamesWithMostMoves: string[];
  gamesProcessed: number; // this could be tracked externally also, in other metrics

  constructor() {
    this.clear();
  }

  clear(): void {
    this.totalMovesByPiece = createUAPMap({ numMoves: 0 });
    this.singleGameMaxMoves = 0;
    this.uasWithMostMoves = [];
    this.gamesProcessed = 0;
  }

  processGame(game: { move: PrettyMove; board: Piece[] }[], gameLink?: string) {
    // update move counts of each unambiguous piece
    for (let { move } of game) {
      this.totalMovesByPiece[move.uas].numMoves++;

      // Check if the move is a castling move, if so we need to increment rook too
      if (move.flags === 'k' || move.flags === 'q') {
        let movingRook = move.flags === 'k' ? 'rh' : 'ra';
        if (move.color === 'w') {
          movingRook = movingRook.toUpperCase();
        }

        this.totalMovesByPiece[movingRook].numMoves++;
      }
    }

    // Calculate single game maxes
    for (const uas of Object.keys(this.totalMovesByPiece)) {
      if (this.totalMovesByPiece[uas] > this.singleGameMaxMoves) {
        this.singleGameMaxMoves = this.totalMovesByPiece[uas];
        this.uasWithMostMoves = [uas as UnambiguousPieceSymbol]; // New highest moves, reset the array
        this.gamesWithMostMoves = [gameLink]; // New highest moves, reset the array
      } else if (this.totalMovesByPiece[uas] === this.singleGameMaxMoves) {
        this.uasWithMostMoves.push(uas as UnambiguousPieceSymbol); // Tie, add to the array
        this.gamesWithMostMoves.push(gameLink);
      }
    }

    this.gamesProcessed++;
  }

  aggregate() {}
}
