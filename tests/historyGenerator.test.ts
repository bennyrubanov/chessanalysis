import { Chess } from '../cjsmin/src/chess';

/**
 * @beta - this test was generated partially with chatGPT so might be an invalid PGN
 */
xdescribe('Chess', () => {
  describe('historyGenerator', () => {
    it('should generate the correct move history for a given PGN string', () => {
      const chess = new Chess();
      const moveString =
        '1. e4 e6 2. d4 b6 3. a3 Bb7 4. Nc3 Nh6 5. Bxh6 gxh6 6. Be2 Qg5 7. Bg4 h5 8. Nf3 Qg6 9. Nh4 Qg5 10. Bxh5 Qxh4 11. Qf3 Kd8 12. Qxf7 Nc6 13. Qe8# 1-0';

      const gen = chess.historyGenerator(moveString);
      const expectedMoves = moveString.split(' ').filter((_, i) => i % 3 !== 0);
      expectedMoves.pop(); // remove the result from the end of the array
      for (const { move, board } of gen) {
        // console.log(board);
        console.log(move);
        // validate that the piece that was moved is of the same type as the destination square
        expect(move.piece).toEqual(board[move.toIndex].type);
        expect(move.uas).toEqual(board[move.toIndex].unambiguousSymbol);
        // validate that the original string in the move matches the expected string
        expect(move.originalString).toEqual(expectedMoves.shift());
      }
    });
  });
});
