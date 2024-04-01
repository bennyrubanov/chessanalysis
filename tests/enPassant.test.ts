import { Chess } from '../src/cjsmin/chess';

const pgnEP = `1. d2d4 f7f5 2. b2b3 e7e6 3. c1b2 d7d5 4. g1f3 f8d6 5. e2e3 g8f6 6. b1d2 e8g8 7. c2c4 c7c6 8. f1d3 b8d7 9. e1g1 f6e4 10. a1c1 g7g5 11. h2h3 d8e8 12. d3e4 d5e4 13. f3g5 e8g6 14. h3h4 h7h6 15. g5h3 d7f6 16. f2f4 e4f3 17. d2f3 f6g4 18. d1e2 d6g3 19. h3f4 g6g7 20. d4d5 g7f7 21. d5e6 c8e6 22. f3e5 g4e5 23. b2e5 g8h7 24. h4h5 f8g8 25. e2f3 g3f4 26. e5f4 g8g4 27. g2g3 a8g8 28. c1c2 b7b5 29. c4b5 e6d5 30. f3d1 f7h5 31. c2h2 g4g3+ 32. f4g3 g8g3+ 33. g1f2 h5h2+ 34. f2e1 g3g2 35. d1d3 d5e4 36. d3d7+ h7g6 37. b5c6 g2e2+ 38. e1d1 e2a2 0-1`;

describe('Game history for en passant move should show valid captured piece', () => {
  const chess = new Chess();
  it('should return the correct captured piece', () => {
    const game = [
      {
        metadata: [],
        moves: pgnEP,
      },
    ];

    const gen = chess.historyGenerator(game[0].moves);

    for (const { move } of gen) {
      if (move.flags === 'e') {
        expect(move.capture.type).toEqual('p');
        expect(move.capture.uas.charAt(0)).not.toEqual(move.uas.charAt(0));
      }
    }
  });
});
