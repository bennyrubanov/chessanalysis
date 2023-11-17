import {
  ALL_SQUARES,
  ALL_UNAMBIGUOUS_PIECE_SYMBOLS,
  Chess,
  UASymbol,
} from '../cjsmin/src/chess';
import { gameChunks } from './fileReader';
import { BoardAndPieceMap, BoardMap, UAPMap } from './types';

export function orderObject(unordered) {
  return Object.keys(unordered)
    .sort()
    .reduce((obj, key) => {
      obj[key] = unordered[key];
      return obj;
    }, {});
}

export function createBoardMapOld(): BoardAndPieceMap<{
  captured: number;
  captures: number;
  revengeKills: number;
}> {
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
export function createUAPMap<T extends Object>(object: T): UAPMap<T> {
  const map = {};
  for (const uap of ALL_UNAMBIGUOUS_PIECE_SYMBOLS) {
    map[uap] = { ...object };
  }
  return map as { [key in UASymbol]: T };
}

export function createBoardAndPieceMap<T extends Object>(
  object: T
): BoardAndPieceMap<T> {
  const map = {};
  for (const square of ALL_SQUARES) {
    map[square] = createUAPMap(object);
  }
  return map as BoardAndPieceMap<T>;
}

export function createBoardMap<T extends Object>(object: T): BoardMap<T> {
  const map = {};
  for (const square of ALL_SQUARES) {
    map[square] = { ...object };
  }
  return map as BoardMap<T>;
}

export async function* getHistoriesFromFilePath(path: string) {
  const chess = new Chess();
  const gamesGenerator = gameChunks(path);
  for await (const game of gamesGenerator) {
    chess.loadPgn(game.moves);
    yield chess.history();
  }
}
