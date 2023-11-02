import { Chess } from '../../cjsmin/src/chess';
import { FileReaderGame } from '../types';

export async function getPiecePromotionInfo(games: FileReaderGame[]) {
  console.time('Task 7: getPiecePromotionInfo');
  let ambigPiecePromotedToMap = {};
  let promotingPieceMap = {};

  for (const game of games) {
    const chess = new Chess();
    chess.loadPgn(game.moves);
    const chessHistory = chess.history();

    for (const moveInfo of chessHistory) {
      if (moveInfo.originalString.includes('=')) {
        // REGEX to only capture the piece type
        const piecePromotedTo = moveInfo.originalString
          .split('=')[1]
          .match(/[a-zA-Z]/)[0];

        const promotingPiece = moveInfo.unambiguousSymbol;

        // update ambigPiecePromotedToMap
        if (!ambigPiecePromotedToMap[piecePromotedTo]) {
          ambigPiecePromotedToMap[piecePromotedTo] = 0;
        }
        ambigPiecePromotedToMap[piecePromotedTo]++;

        // update promotingPieceMap
        if (!promotingPieceMap[promotingPiece]) {
          promotingPieceMap[promotingPiece] = 0;
        }
        promotingPieceMap[promotingPiece]++;
      }
    }
  }

  // promotions facts
  console.log('PROMOTIONS FACTS:');
  console.log(
    'How often a piece is promoted to different ambiguous piece types:'
  ),
    console.table(ambigPiecePromotedToMap);
  console.log('How often unambiguous piece is promoted:'),
    console.table(promotingPieceMap);
  console.log('==============================================================');
  console.log('\n');

  console.timeEnd('Final Task: print results to console');
  console.log('\n');

  console.timeEnd('Total Execution Time');
  console.log('\n');

  console.timeEnd('Task 7: getPiecePromotionInfo');

  return {
    ambigPiecePromotedToMap,
    promotingPieceMap,
  };
}
