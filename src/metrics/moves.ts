import { Piece, PrettyMove, UASymbol } from '../../cjsmin/src/chess';
import { UAPMap } from '../types';
import { createUAPMap } from '../utils';
import { Metric } from './metric';

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

  processGame(
    game: { move: PrettyMove; board: Piece[] }[],
    metadata: string[]
  ) {
    if (game.length > this.numMoves) {
      this.numMoves = game.length;
      this.link = metadata[1].match(/"(.*?)"/)[1];
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
  uasWithMostMoves: UASymbol[];
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

  processGame(
    game: { move: PrettyMove; board: Piece[] }[],
    metadata: string[]
  ) {
    // update move counts of each unambiguous piece
    const currentGameStats = createUAPMap({ numMoves: 0 });
    for (let { move } of game) {
      currentGameStats[move.uas].numMoves++;

      // Check if the move is a castling move, if so we need to increment rook too
      if (move.flags === 'k' || move.flags === 'q') {
        let movingRook = move.flags === 'k' ? 'rh' : 'ra';
        if (move.color === 'w') {
          movingRook = movingRook.toUpperCase();
        }

        currentGameStats[movingRook].numMoves++;
      }
    }

    // Calculate single game maxes & add to global totals
    for (const uas of Object.keys(currentGameStats)) {
      // increment global totals
      this.totalMovesByPiece[uas].numMoves += currentGameStats[uas].numMoves;
      const gameLink = metadata[1].match(/"(.*?)"/)[1];

      if (currentGameStats[uas].numMoves > this.singleGameMaxMoves) {
        this.singleGameMaxMoves = currentGameStats[uas].numMoves;
        this.uasWithMostMoves = [uas as UASymbol]; // New highest moves, reset the array
        this.gamesWithMostMoves = [gameLink]; // New highest moves, reset the array
      } else if (currentGameStats[uas] === this.singleGameMaxMoves) {
        this.uasWithMostMoves.push(uas as UASymbol); // Tie, add to the array
        this.gamesWithMostMoves.push(gameLink);
      }
    }

    this.gamesProcessed++;
  }

  aggregate() {
    const averagesMap = createUAPMap({ avgMoves: 0 });
    // Calculate averages
    for (const uas of Object.keys(this.totalMovesByPiece)) {
      averagesMap[uas].avgMoves =
        this.totalMovesByPiece[uas].numMoves / this.gamesProcessed;
    }

    return averagesMap;
  }
}

export class MiscMoveFactMetric implements Metric {
  enPassantMoves: number;
  knightHops: UAPMap<{ count: number }>; // the number of times a piece is hopped over by knights

  constructor() {
    this.clear();
  }

  clear(): void {
    this.enPassantMoves = 0;
    this.knightHops = createUAPMap({ count: 0 });
  }

  processGame(
    game: { move: PrettyMove; board: Piece[] }[],
    metadata?: string[]
  ) {
    // since a knight can take 2 paths to hop over a piece we ensure that it is forced to hop over at least one piece.
    // When it must hop we assume it hops all pieces so that the result is deterministic
    for (const { move, board } of game) {
      if (move.flags === 'e') {
        this.enPassantMoves++;
      }

      if (move.piece === 'n') {
        // a knight moving in a given direction has 4 things it can do in context of board index. It can increase by 1, decrease by 1, increase by 16, or decrease by 16.
        // Right and down both increase total value, left and up decrease total value
        // But it must do one of those things 2x. Meaning possible differences are 31, 33, 14, 18, -31, -33, -14, -18 (absolute values)
        const moveDiff = move.toIndex - move.fromIndex;

        // The offsets from current index to check for pieces hopped
        let path1 = [];
        let path2 = [];
        switch (moveDiff) {
          case 33:
            path1 = [1, 17];
            path2 = [16, 32];
            break;
          case 31:
            path1 = [-1, 15];
            path2 = [16, 32];
            break;
          case 18:
            path1 = [1, 2];
            path2 = [16, 17];
            break;
          case 14:
            path1 = [-1, -2];
            path2 = [16, 15];
            break;
          case -14:
            path1 = [1, 2];
            path2 = [-16, -15];
            break;
          case -18:
            path1 = [-1, -2];
            path2 = [-16, -17];
            break;
          case -31:
            path1 = [1, -15];
            path2 = [-16, -32];
            break;
          case -33:
            path1 = [-1, -17];
            path2 = [-16, -32];
            break;
          default:
            throw new Error('unexpected moveDiff');
        }
        path1 = path1.map((offset) => move.fromIndex + offset);
        path2 = path2.map((offset) => move.fromIndex + offset);
        if (
          (!board[path1[0]] && !board[path1[1]]) ||
          (!board[path2[0]] && !board[path2[1]])
        ) {
          // if either path is clear we don't increment. Otherwise we randomly select a path to increment
          continue;
        } else {
          // Could choose one path or the other at random. This makes a non-deterministic results
          // const path = Math.random() > 0.5 ? path1[0] : path2[0];
          for (const squareIndex of path1.concat(path2)) {
            if (board[squareIndex]) {
              this.knightHops[board[squareIndex].uas].count++;
            }
          }
        }
      }
    }
  }

  aggregate() {
    let totalHops = 0;
    for (const uas of Object.keys(this.knightHops)) {
      totalHops += this.knightHops[uas].count;
    }

    return {
      enPassantMoves: this.enPassantMoves,
      knightHops: totalHops,
    };
  }
}
