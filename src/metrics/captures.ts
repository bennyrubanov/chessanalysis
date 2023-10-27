import {
  ALL_SQUARES,
  ALL_UNAMBIGUOUS_PIECE_SYMBOLS,
  PrettyMove,
  UnambiguousPieceSymbol,
} from '../../cjsmin/src/chess';

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
      boardMap[move.to][move.unambiguousSymbol].captures++;
      boardMap[move.to][move.capture.unambiguousSymbol].captured++;
      // revenge kills
      if (lastMove.capture && move.to === lastMove.to) {
        boardMap[move.to][move.unambiguousSymbol].revengeKills++;
      }
    }
    lastMove = move;
    i++;
  }
}

function uapMap() {
  const map = {};
  for (const uap of ALL_UNAMBIGUOUS_PIECE_SYMBOLS) {
    map[uap] = { killStreaks: 0 };
  }
  return map;
}

function getMaxKillStreak(
  uapMap: any,
  moves: PrettyMove[],
  startingIndex: 0 | 1 // assume games have at least 2 moves
) {
  let i = startingIndex;
  let streakLength = 0;
  let streakPiece: UnambiguousPieceSymbol;

  while (i < moves.length) {
    const move = moves[i];
    if (move.capture) {
      if (streakLength === 0) {
        streakPiece = move.unambiguousSymbol;
        streakLength++;
      } else if (streakPiece === move.unambiguousSymbol) {
        streakLength++;
      } else {
        uapMap[streakPiece].killStreaks = Math.max(
          uapMap[streakPiece].killStreaks,
          streakLength
        );
        streakLength = 0;
      }
    }
    i += 2;
  }
}

export function getBWKillStreaks(moves: PrettyMove[]) {
  const tracker = uapMap();
  getMaxKillStreak(tracker, moves, 0);
  getMaxKillStreak(tracker, moves, 1);

  return tracker;
}
