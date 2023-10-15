/**
 * Track where captures occur on the board, what piece was captured, by what piece and where the capturing piece was
 */

import { GameHistoryMove } from '../types';

function trackCaptures(game: GameHistoryMove[]) {
  const captures = [];
  for (const move of game) {
    if (move.captured) {
      captures.push({
        captured: move.captured, // this isn't the disambiguated piece symbol yet...
        capturedBy: move.piece,
        captureSquare: move.to,
        originSquare: move.from,
      });
    }
  }
  return captures;
}
