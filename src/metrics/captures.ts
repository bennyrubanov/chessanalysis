import {
  ALL_SQUARES,
  Piece,
  PrettyMove,
  UASymbol,
} from '../../cjsmin/src/chess';
import { BoardAndPieceMap, UAPMap } from '../types';
import { createBoardAndPieceMap, createBoardMap, createUAPMap } from '../utils';
import { Metric } from './metric';

export class KillStreakMetric implements Metric {
  killStreakMap: {
    [key: string]: {
      killStreaks: number;
    };
  };

  constructor() {
    this.killStreakMap = createUAPMap({ killStreaks: 0 });
  }

  clear(): void {
    this.killStreakMap = createUAPMap({ killStreaks: 0 });
  }

  getMaxKillStreak(
    game: { move: PrettyMove; board: Piece[] }[],
    startingIndex: 0 | 1 // assume games have at least 2 moves
  ) {
    let i = startingIndex;
    let streakLength = 0;
    let streakPiece: UASymbol;

    while (i < game.length) {
      const move = game[i].move;
      if (move.capture) {
        if (streakLength === 0) {
          streakPiece = move.uas;
          streakLength++;
        } else if (streakPiece === move.uas) {
          streakLength++;
        } else {
          this.killStreakMap[streakPiece].killStreaks = Math.max(
            this.killStreakMap[streakPiece].killStreaks,
            streakLength
          );
          streakLength = 0;
        }
      }
      i += 2;
    }
    this.killStreakMap[streakPiece].killStreaks = Math.max(
      this.killStreakMap[streakPiece].killStreaks,
      streakLength
    );
  }

  processGame(game: { move: PrettyMove; board: Piece[] }[]) {
    this.getMaxKillStreak(game, 0);
    this.getMaxKillStreak(game, 1);
  }
}

export class KDRatioMetric implements Metric {
  // create an object to track kills, deaths, and assists of each piece
  // The kDAssistsMap is an object where each key is a piece and the value is another object with kills, deaths, and assists properties.
  KDAssistsMap: UAPMap<{
    kills: number;
    deaths: number;
    assists: number;
    revengeKills: number;
  }>;
  pieceWithHighestKDRatio: string;
  // KDRatios is a convenience object for aggregation
  kdRatios: UAPMap<number>;

  constructor() {
    this.clear();
  }

  logResults(): void {
    // KDR facts
    console.log('KDR FACTS (INCLUDING CHECKMATES AS KILLS):');
    console.log(
      `Piece with the highest KD ratio: ${this.pieceWithHighestKDRatio}`
    );
    console.log('Kills, Deaths, and Assists for each unambiguous piece:'),
      console.table(this.KDAssistsMap);
    console.log(
      'Kill Death Ratios for each unambiguous piece: ' +
        JSON.stringify(this.kdRatios, null, 2)
    );
  }

  aggregate() {
    const KDRatios = createUAPMap(0);
    // calculate the KD ratios of each piece
    for (const uas of Object.keys(this.KDAssistsMap)) {
      const kills = this.KDAssistsMap[uas].kills;
      const deaths = this.KDAssistsMap[uas].deaths || 0;
      if (deaths !== 0) {
        KDRatios[uas] = kills / deaths;
      }
    }

    // find the piece with the highest KD ratio
    let maxKDRatio = 0;
    let pieceWithHighestKDRatio = null;

    for (const uas of Object.keys(KDRatios)) {
      if (KDRatios[uas] > maxKDRatio) {
        maxKDRatio = KDRatios[uas];
        pieceWithHighestKDRatio = uas;
      }
    }

    this.kdRatios = KDRatios;
    this.pieceWithHighestKDRatio = pieceWithHighestKDRatio;

    return {
      maxKDRatio,
      pieceWithHighestKDRatio,
      KDRatios: KDRatios,
    };
  }

  clear(): void {
    // KDRatios is reset JIT since it is only used in aggregation
    this.KDAssistsMap = createUAPMap({
      kills: 0,
      deaths: 0,
      assists: 0,
      revengeKills: 0,
    });
    this.kdRatios = undefined;
  }

  // calculates piece with highest K/D ratio and also contains assists by that piece
  processGame(
    game: { move: PrettyMove; board: Piece[] }[],
    metadata?: string[]
  ) {
    // @ts-ignore initialize with no capture
    let previousMove: PrettyMove = {};
    for (const { move } of game) {
      if (move.capture) {
        this.KDAssistsMap[move.uas].kills++;
        this.KDAssistsMap[move.capture.uas].deaths++;

        if (previousMove.capture && move.to === previousMove.to) {
          this.KDAssistsMap[move.uas].revengeKills++;
        }
        previousMove = move;
      }
    }

    const lastMove = game[game.length - 1].move;
    // Check if the game is in checkmate after the last move
    if (lastMove.originalString.includes('#')) {
      const unambigMatingPiece = lastMove.uas;
      this.KDAssistsMap[unambigMatingPiece].kills++;

      // only kings can get mated, and we know whose move it is
      const matedKing = lastMove.color === 'w' ? 'k' : 'K';
      this.KDAssistsMap[matedKing].deaths++;

      // A revenge kill can occur by checkmate too
      const secondToLastMove = game[game.length - 2].move;
      if (secondToLastMove.capture && secondToLastMove.uas === matedKing) {
        this.KDAssistsMap[lastMove.uas].revengeKills++;
      }
    }
  }
}

export class MateAndAssistMetric implements Metric {
  mateAndAssistMap: UAPMap<{
    mates: number;
    assists: number;
    hockeyAssists: number;
  }>;
  matedCounts: {
    k: number;
    K: number;
  };

  // these are initialized as undefined
  constructor() {
    this.clear();
  }

  // TODO: maybe slightly better if we don't recreate when clearing
  clear(): void {
    this.mateAndAssistMap = createUAPMap({
      mates: 0,
      assists: 0,
      hockeyAssists: 0,
    });

    // We delete kings because they cannot deliver checks and can only be mated
    // delete this.mateAndAssistMap.k;
    // delete this.mateAndAssistMap.K;
    this.matedCounts = {
      k: 0,
      K: 0,
    };
  }

  // One edge case currently unaccounted for is when pieces "share" a mate, or check. This can be at most 2 due to discovery
  // checks (currently we disregard this by just saying the last piece to move is the "mating piece")
  processGame(game: { move: PrettyMove; board: Piece[] }[]) {
    // Take no action if the game didn't end in checkmate
    if (!game[game.length - 1].move.originalString.includes('#')) {
      return;
    }

    const lastMove = game[game.length - 1].move;

    // increment the mate count of the mating piece
    this.mateAndAssistMap[lastMove.uas].mates++;
    // increment the mated (death) count of the mated king
    this.matedCounts[lastMove.color === 'w' ? 'k' : 'K']++;

    // The fastest possible checkmate is in 2 moves, so we do have to check for out of bounds

    // Look back 2 moves to see if there was an assist
    if (game.length > 2) {
      const assistMove = game[game.length - 3].move;
      if (
        assistMove.originalString.includes('+') &&
        assistMove.uas !== lastMove.uas
      ) {
        this.mateAndAssistMap[assistMove.uas].assists++;
      }

      // hockey assist is only counted if there was also an assist
      if (game.length > 4) {
        const hockeyAssistMove = game[game.length - 5].move;
        if (
          hockeyAssistMove.originalString.includes('+') &&
          assistMove.uas !== lastMove.uas
        ) {
          this.mateAndAssistMap[hockeyAssistMove.uas].hockeyAssists++;
        }
      }
    }
  }
}

export class CaptureLocationMetric implements Metric {
  captureLocationMap: BoardAndPieceMap<{ captures: number; captured: number }>;

  constructor() {
    this.clear();
  }

  clear(): void {
    const newMap = {};
    for (const square of ALL_SQUARES) {
      newMap[square] = createUAPMap({ captures: 0, captured: 0 });
    }
    this.captureLocationMap = newMap as any;
  }

  processGame(
    game: { move: PrettyMove; board: Piece[] }[],
    metadata?: string[]
  ) {
    let lastMove: PrettyMove;
    for (const { move, board } of game) {
      if (move.capture) {
        this.captureLocationMap[move.to][move.uas].captures++;
        this.captureLocationMap[move.to][move.capture.uas].captured++;
      }
      lastMove = move;
    }
  }

  aggregate() {
    // Gets a capture total for each square
    const captureTotals = createBoardMap({ captures: 0, captured: 0 });
    for (const square of Object.keys(this.captureLocationMap)) {
      for (const uas of Object.keys(this.captureLocationMap[square])) {
        captureTotals[square].captures +=
          this.captureLocationMap[square][uas].captures;
        captureTotals[square].captured +=
          this.captureLocationMap[square][uas].captured;
      }
    }

    return captureTotals;
  }
}

export class MatingSquareMetric implements Metric {
  matingSquareMap: BoardAndPieceMap<{
    mates: number;
    assists: number;
    hockeyAssists: number;
  }>;

  // these are initialized as undefined
  constructor() {
    this.clear();
  }

  // TODO: maybe slightly better if we don't recreate when clearing
  clear(): void {
    this.matingSquareMap = createBoardAndPieceMap({
      mates: 0,
      assists: 0,
      hockeyAssists: 0,
    });
  }

  // One edge case currently unaccounted for is when pieces "share" a mate, or check. This can be at most 2 due to discovery
  // checks (currently we disregard this by just saying the last piece to move is the "mating piece")
  processGame(game: { move: PrettyMove; board: Piece[] }[]) {
    // Take no action if the game didn't end in checkmate
    if (!game[game.length - 1].move.originalString.includes('#')) {
      return;
    }

    const lastMove = game[game.length - 1].move;
    // TODO: this is not properly tracking which pieces are delivering mates or asssits, because discovery checks can be delivered
    // by pieces other than the last piece to move
    this.matingSquareMap[lastMove.to][lastMove.uas].mates++;
  }
}

/**
 * When determining discovery checks, we need to look at the ray that was revealed. That measn tracking the index of the king
 * and the index of the moving piece, tracing that line back and seeing if a piece is now threatening.
 * We also need to track the new piece and see if its movement has created a new threat ray
 */
