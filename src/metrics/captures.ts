// /**
//  * Track where captures occur on the board, what piece was captured, by what piece and where the capturing piece was
//  */

// function initializeCaptureHistory() {
//   const captureHistory = {};

//   // The map value corresponds to the number of times this piece TOOK on the square, not was captured
//   const squareHistory: Record<string, number> = {
//     p: 0,
//     k: 0,
//     q: 0,
//     r: 0,
//     b: 0,
//     n: 0,
//     P: 0,
//     K: 0,
//     Q: 0,
//     R: 0,
//     B: 0,
//     N: 0,
//   };

//   for (const square of BOARD_SQUARES) {
//     // The map value corresponds to the number of times this piece TOOK on the square, not was captured
//     const squareTakeHistory: Record<string, number> = { ...squareHistory };

//     // This map is for the number of times a piece was captured on a square
//     const squareCaptureHistory: Record<string, number> = { ...squareHistory };
//     captureHistory[square] = {};
//   }

//   return captureHistory;
// }

// // currently we are only doing this by piece type (and color). We could add disambiguation
// function trackCaptures(game: GameHistoryMove[]) {
//   for (const move of game) {
//     if (move.capture) {
//     }
//   }
// }
