import { Chess as ChessOG } from 'chess.js';
import { Chess } from '../cjsmin/src/chess';
import {
  KDRatioMetric,
  KillStreakMetric,
  MateAndAssistMetric,
} from '../src/metrics/captures';
import { MoveDistanceMetric } from '../src/metrics/distances';
import {
  GameWithMostMovesMetric,
  PieceLevelMoveInfoMetric,
} from '../src/metrics/moves';
import { PromotionMetric } from '../src/metrics/promotions';

// convert PGN string to GameHistoryObject
export function pgnToGameHistory(pgn: string) {
  const chess = new Chess();
  chess.loadPgn(pgn);
  return chess.history();
}

// convert gameHistory object to a PGN string
export function gameHistoryToPgn(gameHistory): string {
  const chess = new ChessOG();

  for (const move of gameHistory) {
    chess.move(move);
  }

  return chess.pgn();
}

describe('All Tests', () => {
  const cjsmin = new Chess();

  describe('gets black and white kill streaks', () => {
    const killStreakMetric = new KillStreakMetric();

    it('should return the correct kill streaks', () => {
      const moves = [
        { capture: true, uas: 'PA' },
        { capture: false },
        { capture: true, uas: 'PA' },
        { capture: true, uas: 'rh' },
        { capture: false },
      ].map((move) => {
        return {
          move: move as any, // cast to match type checks in the processGame handler
          board: [],
        };
      });

      killStreakMetric.processGame(moves);
      expect(killStreakMetric.killStreakMap['PA'].killStreaks).toEqual(2);
      expect(killStreakMetric.killStreakMap['rh'].killStreaks).toEqual(1);
      expect(killStreakMetric.killStreakMap['Q'].killStreaks).toEqual(0);
    });
  });

  describe('tracks kills, deaths and revenge kills by square', () => {
    it('should return the correct kill streaks', () => {});
  });

  describe('getMateAndAssists', () => {
    const mateAndAssistMetric = new MateAndAssistMetric();

    afterEach(() => {
      mateAndAssistMetric.clear();
    });

    it('should not modify if game ends early', () => {
      const moves = [
        {
          originalString: 'e4',
          color: 'w',
          from: 'e2',
          to: 'e4',
          piece: 'p',
          flags: 'b',
        },
        {
          originalString: 'e5',
          color: 'b',
          from: 'e7',
          to: 'e5',
          piece: 'p',
          flags: 'n',
        },
        {
          originalString: 'Nf3',
          color: 'w',
          from: 'g1',
          to: 'f3',
          piece: 'n',
          flags: 'b',
        },
        {
          originalString: 'Nc6',
          color: 'b',
          from: 'b8',
          to: 'c6',
          piece: 'n',
          flags: 'n',
        },
      ].map((move) => {
        return {
          move: move as any, // cast to match type checks in the processGame handler
          board: [],
        };
      });

      // const result = getMateAndAssists(gameHistoryMoves);
      mateAndAssistMetric.processGame(moves);

      const result = { ...mateAndAssistMetric.mateAndAssistMap };
      // clear results before comparing
      mateAndAssistMetric.clear();

      expect(result).toEqual(mateAndAssistMetric.mateAndAssistMap);
    });

    it('should return the mating piece if there is a mate but no assist', () => {
      const moves: any[] = [
        {
          originalString: 'e4',
          color: 'w',
          from: 'e2',
          to: 'e4',
          piece: 'P',
          flags: 'b',
          uas: 'PE',
        },
        {
          originalString: 'e5',
          color: 'b',
          from: 'e7',
          to: 'e5',
          piece: 'p',
          flags: 'n',
          uas: 'pe',
        },
        {
          originalString: 'Qh5',
          color: 'w',
          from: 'd1',
          to: 'h5',
          piece: 'Q',
          flags: 'b',
        },
        {
          originalString: 'Nc6',
          color: 'b',
          from: 'b8',
          to: 'c6',
          piece: 'n',
          flags: 'n',
          uas: 'ng',
        },
        {
          originalString: 'Qxf7#',
          color: 'w',
          from: 'h5',
          to: 'f7',
          piece: 'Q',
          captured: 'p',
          flags: 't',
          uas: 'Q',
        },
      ].map((move) => {
        return {
          move: move as any, // cast to match type checks in the processGame handler
          board: [],
        };
      });

      mateAndAssistMetric.processGame(moves);

      expect(mateAndAssistMetric.mateAndAssistMap['Q']).toEqual({
        mates: 1,
        assists: 0,
        hockeyAssists: 0,
      });
    });

    it('should return the mating piece and not count the same piece as assisting', () => {
      const moves: any[] = [
        {
          originalString: 'e4',
          color: 'w',
          from: 'e2',
          to: 'e4',
          piece: 'P',
          flags: 'b',
        },
        {
          originalString: 'e5',
          color: 'b',
          from: 'e7',
          to: 'e5',
          piece: 'p',
          flags: 'n',
        },
        {
          originalString: 'Qh5',
          color: 'w',
          from: 'd1',
          to: 'h5',
          piece: 'Q',
          flags: 'b',
        },
        {
          originalString: 'Nc6',
          color: 'b',
          from: 'b8',
          to: 'c6',
          piece: 'n',
          flags: 'n',
        },
        {
          originalString: 'Qxf7+',
          color: 'w',
          from: 'h5',
          to: 'f7',
          piece: 'Q',
          captured: 'p',
          flags: 't',
          uas: 'Q',
        },
        {
          originalString: 'Kd8',
          color: 'b',
          from: 'e8',
          to: 'd8',
          piece: 'k',
          flags: 'n',
          uas: 'k',
        },
        {
          originalString: 'Qf8#',
          color: 'w',
          from: 'f7',
          to: 'f8',
          piece: 'Q',
          captured: 'k',
          flags: 't',
          uas: 'Q',
        },
      ].map((move) => {
        return {
          move: move as any, // cast to match type checks in the processGame handler
          board: [],
        };
      });

      mateAndAssistMetric.processGame(moves);

      expect(mateAndAssistMetric.mateAndAssistMap['Q']).toEqual({
        mates: 1,
        assists: 0,
        hockeyAssists: 0,
      });
    });
  });

  describe('getMoveDistanceSingleGame', () => {
    const moveDistanceMetric = new MoveDistanceMetric();
    it('should return the correct max distance and piece for a game', async () => {
      const game = '1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7#';

      moveDistanceMetric.processGame(Array.from(cjsmin.historyGenerator(game)));

      expect(moveDistanceMetric.pieceMaxes.distance).toEqual(6);
      expect(moveDistanceMetric.pieceMaxes.uasArray[0]).toEqual('Q');
    });

    it('should return 2 distance for a game with one move', async () => {
      const game = '1. e4 e5';

      moveDistanceMetric.clear();
      moveDistanceMetric.processGame(Array.from(cjsmin.historyGenerator(game)));

      expect(moveDistanceMetric.pieceMaxes.distance).toEqual(2);
      expect(moveDistanceMetric.pieceMaxes.uasArray).toEqual(['PE', 'pe']);
    });

    it('should return a singleGameDistanceTotal equal to the addition of all distances in the distanceMap', async () => {
      const game = '1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7#';

      moveDistanceMetric.processGame(Array.from(cjsmin.historyGenerator(game)));
      moveDistanceMetric.aggregate();

      let totalDistance = 0;

      for (const uas of Object.keys(moveDistanceMetric.distanceMap)) {
        totalDistance += moveDistanceMetric.distanceMap[uas].total;
      }

      expect(moveDistanceMetric.totalDistance).toEqual(totalDistance);
    });
  });

  // game being tested: https://www.chess.com/analysis/game/pgn/4uURW4rJaa?tab=analysis
  describe('getKillDeathRatios', () => {
    // this could be a beforeAll
    const kdrMetric = new KDRatioMetric();

    // Reset state before next test
    afterEach(() => {
      kdrMetric.clear();
    });

    it('should return the correct number of kills, deaths, and assists for each piece in a game', async () => {
      const game = [
        {
          metadata: [],
          moves:
            '1. e4 e5 2. d4 exd4 3. Qxd4 Nc6 4. Qa4 Nf6 5. Nc3 d5 6. exd5 Qe7+ 7. Kd1 Bg4+ 8. Kd2 Nxd5 9. Nb5 Ncb4 10. c3 O-O-O 11. f3 Qe3+ 12. Kd1 Nxc3# 0-1',
        },
      ];
      kdrMetric.processGame(
        Array.from(cjsmin.historyGenerator(game[0].moves)),
        ['m', 'et']
      );

      expect(kdrMetric.KDAssistsMap['pe'].kills).toEqual(1);
      expect(kdrMetric.KDAssistsMap['pe'].deaths).toEqual(1);
    });

    it('should return the correct number of kills for a piece in a game, including counting checkmates as a "kill"', async () => {
      // In this game 'ng' takes 2 pawns and also delivers checkmate, for 3 kills
      const game = [
        {
          metadata: [],
          moves:
            '1. e4 e5 2. d4 exd4 3. Qxd4 Nc6 4. Qa4 Nf6 5. Nc3 d5 6. exd5 Qe7+ 7. Kd1 Bg4+ 8. Kd2 Nxd5 9. Nb5 Ncb4 10. c3 O-O-O 11. f3 Qe3+ 12. Kd1 Nxc3# 0-1',
        },
      ];

      kdrMetric.processGame(
        Array.from(cjsmin.historyGenerator(game[0].moves)),
        ['m', 'et']
      );

      expect(kdrMetric.KDAssistsMap['ng'].kills).toEqual(3);
    });
  });

  describe('getGameWithMostMoves', () => {
    const mostMovesMetric = new GameWithMostMovesMetric();
    it('should return the correct number of moves made', async () => {
      const game = [
        {
          metadata: [],
          moves:
            '1. e4 e5 2. d4 exd4 3. Qxd4 Nc6 4. Qa4 Nf6 5. Nc3 d5 6. exd5 Qe7+ 7. Kd1 Bg4+ 8. Kd2 Nxd5 9. Nb5 Ncb4 10. c3 O-O-O 11. f3 Qe3+ 12. Kd1 Nxc3# 0-1',
        },
      ];

      mostMovesMetric.processGame(
        Array.from(cjsmin.historyGenerator(game[0].moves)),
        ['m', '"et"']
      );

      expect(mostMovesMetric.numMoves).toEqual(24);
    });
  });

  describe('PieceLevelMoveInfoMetric', () => {
    const cjsmin = new Chess();

    describe('processGame', () => {
      let plmiMetric = new PieceLevelMoveInfoMetric();

      beforeEach(() => {
        plmiMetric.clear();
      });

      it('should update totalMovesByPiece correctly', () => {
        const game =
          '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5 10. Bc2 c5 11. d4 Qc7 12. Nbd2 Bd7 13. Nf1 Rfc8 14. d5 Nc4 15. b3 Nb6 16. Ng3 g6 17. Nh2 c4 18. b4 a5 19. f4 axb4 20. cxb4 exf4 21. Bxf4 Be8 22. Rf1 Nfd7 23. Ng4 h5 24. Nh6+ Kg7 25. Nxh5+ gxh5 26. Qxh5 f5 27. Nxf5+ Kf6 28. Bg5+ Ke5 29. Qh8+ Bf6 30. Bxf6+ Nxf6 31. Ng7 Qf7 32. Rf5+ Kd4 33. Ne6+ Kc3 34. Rf3+ Kxc2 35. Nd4+ Kb2 36. Rf2+ Kxa1 37. Qh6 c3 38. Qc1#';

        plmiMetric.processGame(Array.from(cjsmin.historyGenerator(game)), [
          'm',
          '"et"',
        ]);

        expect(plmiMetric.totalMovesByPiece['Q'].numMoves).toEqual(4);
        expect(plmiMetric.totalMovesByPiece['K'].numMoves).toEqual(1);
        // This last one is not manually verified
        expect(
          plmiMetric.totalMovesByPiece['RA'].numMoves +
            plmiMetric.totalMovesByPiece['RH'].numMoves
        ).toEqual(6);
      });

      it('should update singleGameMaxMoves correctly', () => {
        const game1 =
          '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5 10. Bc2 c5 11. d4 Qc7 12. Nbd2 Bd7 13. Nf1 Rfc8 14. d5 Nc4 15. b3 Nb6 16. Ng3 g6 17. Nh2 c4 18. b4 a5 19. f4 axb4 20. cxb4 exf4 21. Bxf4 Be8 22. Rf1 Nfd7 23. Ng4 h5 24. Nh6+ Kg7 25. Nxh5+ gxh5 26. Qxh5 f5 27. Nxf5+ Kf6 28. Bg5+ Ke5 29. Qh8+ Bf6 30. Bxf6+ Nxf6 31. Ng7 Qf7 32. Rf5+ Kd4 33. Ne6+ Kc3 34. Rf3+ Kxc2 35. Nd4+ Kb2 36. Rf2+ Kxa1 37. Qh6 c3 38. Qc1#';
        const game2 =
          '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5 10. Bc2 c5 11. d4 Qc7 12. Nbd2 Bd7 13. Nf1 Rfc8 14. d5 Nc4 15. b3 Nb6 16. Ng3 g6 17. Nh2 c4 18. b4 a5 19. f4 axb4 20. cxb4 exf4 21. Bxf4 Be8 22. Rf1 Nfd7 23. Ng4 h5 24. Nh6+ Kg7 25. Nxh5+ gxh5 26. Qxh5 f5 27. Nxf5+ Kf6 28. Bg5+ Ke5 29. Qh8+ Bf6 30. Bxf6+ Nxf6 31. Ng7 Qf7 32. Rf5+ Kd4 33. Ne6+ Kc3 34. Rf3+ Kxc2 35. Nd4+ Kb2 36. Rf2+ Kxa1 37. Qh6 c3 38. Qc1#';

        plmiMetric.processGame(Array.from(cjsmin.historyGenerator(game1)), [
          'm',
          '"et"',
        ]);
        plmiMetric.processGame(Array.from(cjsmin.historyGenerator(game2)), [
          'm',
          '"et"',
        ]);

        expect(plmiMetric.singleGameMaxMoves).toEqual(9);
        expect(plmiMetric.uasWithMostMoves).toEqual(['k']);
        expect(plmiMetric.gamesWithMostMoves).toEqual(['et']);
      });
    });

    describe('aggregate', () => {
      let metric = new PieceLevelMoveInfoMetric();

      beforeEach(() => {
        metric.clear();
      });

      it('should return the correct averages', () => {
        const game1 =
          '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5 10. Bc2 c5 11. d4 Qc7 12. Nbd2 Bd7 13. Nf1 Rfc8 14. d5 Nc4 15. b3 Nb6 16. Ng3 g6 17. Nh2 c4 18. b4 a5 19. f4 axb4 20. cxb4 exf4 21. Bxf4 Be8 22. Rf1 Nfd7 23. Ng4 h5 24. Nh6+ Kg7 25. Nxh5+ gxh5 26. Qxh5 f5 27. Nxf5+ Kf6 28. Bg5+ Ke5 29. Qh8+ Bf6 30. Bxf6+ Nxf6 31. Ng7 Qf7 32. Rf5+ Kd4 33. Ne6+ Kc3 34. Rf3+ Kxc2 35. Nd4+ Kb2 36. Rf2+ Kxa1 37. Qh6 c3 38. Qc1#';
        const game2 =
          '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5 10. Bc2 c5 11. d4 Qc7 12. Nbd2 Bd7 13. Nf1 Rfc8 14. d5 Nc4 15. b3 Nb6 16. Ng3 g6 17. Nh2 c4 18. b4 a5 19. f4 axb4 20. cxb4 exf4 21. Bxf4 Be8 22. Rf1 Nfd7 23. Ng4 h5 24. Nh6+ Kg7 25. Nxh5+ gxh5 26. Qxh5 f5 27. Nxf5+ Kf6 28. Bg5+ Ke5 29. Qh8+ Bf6 30. Bxf6+ Nxf6 31. Ng7 Qf7 32. Rf5+ Kd4 33. Ne6+ Kc3 34. Rf3+ Kxc2 35. Nd4+ Kb2 36. Rf2+ Kxa1 37. Qh6 c3 38. Qc1#';

        metric.processGame(Array.from(cjsmin.historyGenerator(game1)), [
          'a',
          '"l"',
        ]);
        metric.processGame(Array.from(cjsmin.historyGenerator(game2)), [
          'a',
          '"p"',
        ]);

        const averages = metric.aggregate();

        expect(averages['Q'].avgMoves).toEqual(4);
        expect(averages['K'].avgMoves).toEqual(1);
        expect(averages['pa'].avgMoves).toEqual(3);
      });
    });
  });

  describe('PromotionMetric', () => {
    const promotionMetric = new PromotionMetric();

    afterEach(() => {
      promotionMetric.clear();
    });

    it('should update the promotion map when a promotion occurs', () => {
      const moves = [
        {
          move: {
            originalString: 'e8=Q',
            color: 'b',
            from: 'e7',
            to: 'e8',
            piece: 'p',
            flags: 'p',
            promotion: 'q',
            uas: 'pe',
          },
          board: [],
        },
        {
          move: {
            originalString: 'a2=a1',
            color: 'w',
            from: 'a2',
            to: 'a1',
            piece: 'p',
            flags: 'p',
            promotion: 'q',
            uas: 'PA',
          },
        },
        {
          move: {
            originalString: 'b7=b8',
            color: 'b',
            from: 'b7',
            to: 'b8',
            piece: 'p',
            flags: 'p',
            promotion: 'r',
            uas: 'pb',
          },
        },
      ].map((entry) => {
        return {
          move: entry.move as any, // cast to match type checks in the processGame handler
          board: [],
        };
      });

      promotionMetric.processGame(moves);

      expect(promotionMetric.promotionMap.pe.q).toEqual(1);
      expect(promotionMetric.promotionMap.PA.q).toEqual(1);
      expect(promotionMetric.promotionMap.pb.r).toEqual(1);
    });

    it('should not update the promotion map when a promotion does not occur', () => {
      const moves = [
        {
          move: {
            originalString: 'e4',
            color: 'w',
            from: 'e2',
            to: 'e4',
            piece: 'p',
            flags: 'b',
            uas: 'PE',
          },
        },
        {
          move: {
            originalString: 'e5',
            color: 'b',
            from: 'e7',
            to: 'e5',
            piece: 'p',
            flags: 'n',
            uas: 'pe',
          },
        },
      ].map((entry) => {
        return {
          move: entry.move as any, // cast to match type checks in the processGame handler
          board: [],
        };
      });

      promotionMetric.processGame(moves);
      let promoTotal = 0;

      for (const k of Object.keys(promotionMetric.promotionMap)) {
        for (const promoCount of Object.values(
          promotionMetric.promotionMap[k]
        )) {
          promoTotal += promoCount as number;
        }
      }

      expect(promoTotal).toEqual(0);
    });
  });
});
