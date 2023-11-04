import {
  ALL_SQUARES,
  ALL_UNAMBIGUOUS_PIECE_SYMBOLS,
  Chess,
  Piece,
  PrettyMove,
  UnambiguousPieceSymbol,
} from '../../cjsmin/src/chess';
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
  const squareCaptureInfo: {
    [key: string]: {
      [key: string]: {
        captured: number;
        captures: number;
        revengeKills: number;
      };
    };
  } = {};

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

interface BoardMap {
  [key: string]: {
    [key: string]: {
      captured: number;
      captures: number;
      revengeKills: number;
    };
  };
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

/**
 * A utitily function to create an object with unambiguous piece symbols as keys
 */
function createUAPMap<T>(object: T): { [key: string]: T } {
  const map = {};
  for (const uap of ALL_UNAMBIGUOUS_PIECE_SYMBOLS) {
    map[uap] = { ...object };
  }
  return map;
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

  logResults(): void {}

  aggregate() {
    return this.killStreakMap;
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
    let streakPiece: UnambiguousPieceSymbol;

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
      unambigMatingPiece = move.uas;

      // Determine the color of the mated king
      const matedKingColor = move.color === 'w' ? 'b' : 'w';
      unambigMatedPiece = matedKingColor === 'w' ? 'K' : 'k';

      // If mate see if also assist
      if (
        lastFewMoves[2] &&
        lastFewMoves[2].originalString.includes('+') &&
        lastFewMoves[2].uas !== unambigMatingPiece
      ) {
        assistingPiece = lastFewMoves[2].piece;
        unambigAssistingPiece = lastFewMoves[2].uas;

        // If assist check for hockey assist
        if (
          lastFewMoves[4] &&
          lastFewMoves[4].originalString.includes('+') &&
          lastFewMoves[4].uas !== unambigAssistingPiece &&
          lastFewMoves[4].uas !== unambigMatingPiece
        ) {
          hockeyAssist = lastFewMoves[4].piece;
          unambigHockeyAssistPiece = lastFewMoves[4].uas;
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
