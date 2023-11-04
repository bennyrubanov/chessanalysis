import {
  ALL_SQUARES,
  ALL_UNAMBIGUOUS_PIECE_SYMBOLS,
} from '../cjsmin/src/chess';
import { BoardMap, UAPMap } from './types';

export function orderObject(unordered) {
  return Object.keys(unordered)
    .sort()
    .reduce((obj, key) => {
      obj[key] = unordered[key];
      return obj;
    }, {});
}

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
export function createUAPMap<T>(object: T): UAPMap<T> {
  const map = {};
  for (const uap of ALL_UNAMBIGUOUS_PIECE_SYMBOLS) {
    map[uap] = { ...object };
  }
  return map as UAPMap<T>;
}
