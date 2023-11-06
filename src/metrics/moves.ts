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

  processGame(game: { move: PrettyMove; board: Piece[] }[], gameLink?: string) {
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
