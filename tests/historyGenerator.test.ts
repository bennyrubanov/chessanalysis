import exp = require('constants');
import { Chess } from '../cjsmin/src/chess';

describe('Chess', () => {
  describe('historyGenerator', () => {
    it('should generate the correct move history for a given PGN string', () => {
      const chess = new Chess();
      const moveString =
        '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5 10. Bc2 c5 11. d4 Qc7 12. Nbd2 Bd7 13. Nf1 Rfc8 14. d5 Nc4 15. b3 Nb6 16. Ng3 g6 17. Bh6 c4 18. b4 a5 19. a3 Ra6 20. Qd2 Rca8 21. Rac1 axb4 22. axb4 Ra2 23. Nh2 R8a3 24. f4 Na4 25. fxe5 dxe5 26. Bxa4 Rxd2 27. Bxd2 Rxa4 28. Ra1 Qa7+ 29. Be3 Rxa1 30. Bxa7 Rxe1+ 31. Kf2 Rc1 32. Ne2 Rc2 33. Ke3 Nxe4 34. Kxe4 Rxe2+ 35. Kf3 Rc2 36. Bc5 Rxc3+ 37. Ke4 Bf6 38. Ng4 Bf5#';

      const gen = chess.historyGenerator(moveString);
      const expectedMoves = moveString.split(' ').filter((_, i) => i % 3 !== 0);
      for (const { move, board } of gen) {
        expect(move.piece).toEqual(board[move.toIndex].type);
        expect(move.originalString).toEqual(expectedMoves.shift());
      }
    });
  });
});
