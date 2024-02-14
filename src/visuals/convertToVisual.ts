import { BoardMap } from '../types';
import { SquareUtilization } from './visualTypesRaw';

/**
 * Takes some arbitrary metric result in board format, as well as a conversion function &
 * returns a list of objects that can be passed to the heatmap library.
 *
 * Until we write a custom implementation we'll be limited by the setup of the library;
 * To match the patterns of the viz lib we need to pass a list of objects with structure:
 * {piece: string, color: string}[]
 *
 * @param boardMap
 * @param convert
 * @returns
 */
export function convertToVisual<T>(
  boardMap: BoardMap<T>,
  convert: (boardInput: T) => number
): Pick<SquareUtilization, 'all'>[] {
  //prettier-ignore
  const orderedSquares = [
    "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8",
    "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7",
    "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6",
    "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5",
    "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4",
    "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3",
    "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2",
    "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"
  ]

  return orderedSquares.map((square) => {
    return {
      all: {
        b: 0,
        w: convert(boardMap[square]), // Because of how we use the heatmap lib only this value  matters.
        // But we do need the other values to be present, or the lib will throw an error.
      },
      b: {
        b: 8,
        w: 14,
      },
      k: {
        b: 2,
        w: 2,
      },
      n: {
        b: 3,
        w: 6,
      },
      p: {
        b: 0,
        w: 0,
      },
      q: {
        b: 10,
        w: 5,
      },
      r: {
        b: 23,
        w: 32,
      },
    };
  });
}
