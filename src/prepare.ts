// import { Chess } from 'chess.js';
import { Chess } from '../cjsmin/src/chess';

function getMoves() {}

// TODO: if needed we can overwrite the history code to store only what we need https://github.com/jhlywa/chess.js/blob/master/README.md#history-options-
export function getGameHistory(moves: string) {
  const board = new Chess();
  board.loadPgn(moves);
  return board.history();
}

// Should return an object for the metrics we want to track, not sure how best to structure so an exercise for the reader
export function initializeMetricMaps() {
  // kd ratio, distances moved,

  const squareInfo = {
    kills: {
      p: 0,
      n: 0,
      b: 0,
      r: 0,
      q: 0,
      k: 0,
    },
    deaths: {
      p: 0,
      n: 0,
      b: 0,
      r: 0,
      q: 0,
      k: 0,
    },
  };

  // adapted some chatgpt code for this
  const chessboard: { [key: string]: typeof squareInfo } = {};
  for (const rank of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
    for (const file of ['1', '2', '3', '4', '5', '6', '7', '8']) {
      chessboard[rank + file] = { ...squareInfo };
    }
  }

  // return {
  //   pawn: {},
  //   knight: {},
  //   bishop: {},
  //   rook: {},
  //   queen: {},
  //   king: {},
  // };

  return chessboard;
}
