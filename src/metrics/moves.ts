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

export class MiscMoveFacts implements Metric {
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
    // When it must hop we randomly select a path and increment the count of all pieces hopped
    for (const { move, board } of game) {
      if (move.flags === 'e') {
        this.enPassantMoves++;
      }

      if (move.piece === 'n') {
        throw new Error('Not implemented');
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
