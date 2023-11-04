import {
  ALL_SQUARES,
  ALL_UNAMBIGUOUS_PIECE_SYMBOLS,
  Piece,
  PrettyMove,
  UAPSymbol,
} from '../../cjsmin/src/chess';
import { BoardMap, UAPMap } from '../types';
import { Metric } from './metric';

export function createBoardMap(): BoardMap {
  /**
   * i.e.
   * a1: {
   *   k: {
   *    captured: 0,
   *    captures: 0,
   *   },
   * },
   */
  const squareCaptureInfo: any = {}; // make typing simpler

  for (const square of ALL_SQUARES) {
    squareCaptureInfo[square] = {};
    for (const piece of ALL_UNAMBIGUOUS_PIECE_SYMBOLS) {
      squareCaptureInfo[square][piece] = {
        captured: 0,
        captures: 0,
        revengeKills: 0,
      };
    }
  }

  return squareCaptureInfo;
}

/**
 * A utitily function to create an object with unambiguous piece symbols as keys
 */
function createUAPMap<T>(object: T): UAPMap<T> {
  const map = {};
  for (const uap of ALL_UNAMBIGUOUS_PIECE_SYMBOLS) {
    map[uap] = { ...object };
  }
  return map as UAPMap<T>;
}

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
    let streakPiece: UAPSymbol;

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
  KDAssistsMap: {
    [key: string]: {
      kills: number;
      deaths: number;
      assists: number;
    };
  };
  pieceWithHighestKDRatio: string;
  KDRatios: {
    [key: string]: number;
  };

  constructor() {
    this.KDAssistsMap = {};
    this.KDRatios = {};
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
        JSON.stringify(this.KDRatios, null, 2)
    );
  }

  aggregate() {
    // calculate the KD ratios of each piece
    for (const piece of Object.keys(this.KDAssistsMap)) {
      const kills = this.KDAssistsMap[piece].kills;
      const deaths = this.KDAssistsMap[piece].deaths || 0;
      if (deaths !== 0) {
        this.KDRatios[piece] = kills / deaths;
      }
    }

    // find the piece with the highest KD ratio
    let maxKDRatio = 0;
    let pieceWithHighestKDRatio = null;

    for (const piece of Object.keys(this.KDRatios)) {
      if (this.KDRatios[piece] > maxKDRatio) {
        maxKDRatio = pieceWithHighestKDRatio = this.KDRatios[piece];
      }
    }

    return {
      maxKDRatio,
      pieceWithHighestKDRatio,
      KDRatios: this.KDRatios,
    };
  }

  clear(): void {
    this.KDAssistsMap = {};
    this.KDRatios = {};
  }

  // calculates piece with highest K/D ratio and also contains assists by that piece
  processGame(game: { move: PrettyMove; board: Piece[] }[]) {
    for (const { move } of game) {
      if (!this.KDAssistsMap[move.uas]) {
        this.KDAssistsMap[move.uas] = {
          kills: 0,
          deaths: 0,
          assists: 0,
        };
      }

      if (move.capture) {
        this.KDAssistsMap[move.uas].kills++;

        // capture stores which piece was captured
        if (!this.KDAssistsMap[move.capture.uas]) {
          this.KDAssistsMap[move.capture.uas] = {
            kills: 0,
            deaths: 0,
            assists: 0,
          };
        }
        this.KDAssistsMap[move.capture.uas].deaths++;
      }
    }

    // Check if the game is in checkmate after the last move
    if (game[game.length - 1].move.originalString.includes('#')) {
      const unambigMatingPiece = game[game.length - 1].move.uas;
      this.KDAssistsMap[unambigMatingPiece].kills++;

      // only kings can get mated, and we know whose move it is
      const matedKing = game[game.length - 1].move.color === 'w' ? 'k' : 'K';
      this.KDAssistsMap[matedKing].deaths++;
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
    delete this.mateAndAssistMap.k;
    delete this.mateAndAssistMap.K;
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

export function trackCaptures(boardMap: BoardMap, moves: PrettyMove[]) {
  let lastMove: PrettyMove;
  let i = 0;
  for (const move of moves) {
    if (move.capture) {
      boardMap[move.to][move.uas].captures++;
      boardMap[move.to][move.capture.uas].captured++;
      // revenge kills
      if (lastMove.capture && move.to === lastMove.to) {
        boardMap[move.to][move.uas].revengeKills++;
      }
    }
    lastMove = move;
    i++;
  }
}
