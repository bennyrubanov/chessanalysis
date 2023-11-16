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
  MiscMoveFactMetric,
  PieceLevelMoveInfoMetric,
} from '../src/metrics/moves';
import { PromotionMetric } from '../src/metrics/promotions';
import { MetadataMetric } from '../src/metrics/misc';

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
      const metadata = [];


      promotionMetric.processGame(moves, metadata);

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

  describe('MiscMoveFactsMetric', () => {
    const miscMoveFactsMetric = new MiscMoveFactMetric();

    const pgnEnPassantGame = `1. d2d4 f7f5 2. b2b3 e7e6 3. c1b2 d7d5 4. g1f3 f8d6 5. e2e3 g8f6 6. b1d2 e8g8 7. c2c4 c7c6 8. f1d3 b8d7 9. e1g1 f6e4 10. a1c1 g7g5 11. h2h3 d8e8 12. d3e4 d5e4 13. f3g5 e8g6 14. h3h4 h7h6 15. g5h3 d7f6 16. f2f4 e4f3 17. d2f3 f6g4 18. d1e2 d6g3 19. h3f4 g6g7 20. d4d5 g7f7 21. d5e6 c8e6 22. f3e5 g4e5 23. b2e5 g8h7 24. h4h5 f8g8 25. e2f3 g3f4 26. e5f4 g8g4 27. g2g3 a8g8 28. c1c2 b7b5 29. c4b5 e6d5 30. f3d1 f7h5 31. c2h2 g4g3+ 32. f4g3 g8g3+ 33. g1f2 h5h2+ 34. f2e1 g3g2 35. d1d3 d5e4 36. d3d7+ h7g6 37. b5c6 g2e2+ 38. e1d1 e2a2 0-1`;

    afterEach(() => {
      miscMoveFactsMetric.clear();
    });

    it('should update the enPassantMoves count when a move is an en passant', () => {
      const moves = Array.from(cjsmin.historyGenerator(pgnEnPassantGame));

      miscMoveFactsMetric.processGame(moves);

      expect(miscMoveFactsMetric.enPassantMoves).toEqual(1);
    });

    it('should count the number of knight hops correctly', () => {
      // Game starts with knight going forward and back
      const moves = Array.from(
        cjsmin.historyGenerator('1. Nf3 Nc6 2. Ng1 Nb8')
      );

      miscMoveFactsMetric.processGame(moves);

      console.log(miscMoveFactsMetric.knightHops);

      // TODO: this needs a better suite of tests
      expect(miscMoveFactsMetric.knightHops['PF'].count).toEqual(2);
      expect(miscMoveFactsMetric.knightHops['pc'].count).toEqual(2);
      expect(miscMoveFactsMetric.knightHops['PG'].count).toEqual(2);
      expect(miscMoveFactsMetric.knightHops['pb'].count).toEqual(2);
    });
  });

  describe('MetadataMetric', () => {
    const chess = new Chess();
    const metadataMetric = new MetadataMetric(chess);
    
    // https://www.chessgames.com/perl/chessgame?gid=1972221
    const game50MovesRule = [
      {
        metadata: [],
        moves:
          '1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Na6 8. Be3 Qe8 9. dxe5 dxe5 10. h3 b6 11. a3 Nc5 12. Qc2 Nfd7 13. Nd5 Qd8 14. b4 Ne6 15. b5 Bb7 16. Rad1 c6 17. bxc6 Bxc6 18. Qb1 Rc8 19. Bd3 Ndc5 20. Bc2 Qe8 21. g3 Kh8 22. h4 h5 23. Kh2 Bd7 24. Rd2 Nd8 25. Kg1 Ndb7 26. Re1 Bg4 27. Nh2 Be6 28. Nf3 Na5 29. Qa2 Ncb7 30. Bd3 Qa4 31. Ng5 Bxd5 32. cxd5 Nd6 33. Rc2 Rxc2 34. Bxc2 Qb5 35. a4 Qb4 36. Rb1 Qc4 37. Qxc4 Naxc4 38. Bc1 Rc8 39. Bd3 Kg8 40. Kf1 Nb7 41. Ke2 Bf8 42. f4 Bd6 43. f5 gxf5 44. exf5 Be7 45. Ne4 Ncd6 46. f6 Bd8 47. Ba3 Nxe4 48. Bxe4 Bxf6 49. d6 Nd8 50. Rc1 Rxc1 51. Bxc1 Ne6 52. Be3 Kf8 53. Kd3 Nd4 54. Kc4 Ke8 55. Kd5 Ne2 56. Kc6 Nxg3 57. d7+ Kd8 58. a5 bxa5 59. Bxa7 Ke7 60. Bd5 Kf8 61. Be3 Bd8 62. Bc5+ Kg7 63. Bb6 Be7 64. Bxa5 Nf5 65. d8=Q Bxd8 66. Bxd8 f6 67. Kd7 Nxh4 68. Ke6 Ng6 69. Bxf6+ Kh6 70. Kf5 h4 71. Bg5+ Kg7 72. Be4 Kf7 73. Bf6 Ne7+ 74. Kxe5 Ng6+ 75. Kf5 Ne7+ 76. Kg5 Ke6 77. Bd4 h3 78. Bg1 Ke5 79. Bb1 Nd5 80. Bf5 h2 81. Bxh2+ Kd4 82. Bh7 Nb4 83. Kf5 Nd3 84. Bg1+ Kd5 85. Bg8+ Kd6 86. Ke4 Nc5+ 87. Kd4 Ne6+ 88. Kc4 Ke5 89. Bh2+ Kf5 90. Bh7+ Kf6 91. Kd5 Ng7 92. Be5+ Kf7 93. Bc2 Ne8 94. Bb2 Ng7 95. Ke5 Ne8 96. Bc1 Ng7 97. Bb3+ Kg6 98. Ba4 Kf7 99. Bd7 Ke7 100. Bg4 Kf7 101. Be2 Kg6 102. Bd1 Kf7 103. Bd2 Kg6 104. Bc2+ Kf7 105. Kd6 Ne8+ 106. Kd7 Nf6+ 107. Kc6 Ne8 108. Kd5 Nf6+ 109. Ke5 Ne8 110. Bb3+ Kg6 111. Ba5 Ng7 112. Bd8 Nh5 113. Bh4 Ng7 114. Bc2+ Kf7 115. Kd6 Ne8+ 116. Kd7 Nf6+ 117. Kd8 Ke6 118. Bb3+ Ke5 119. Bg3+ Kd4 120. Ke7 Ne4 121. Bh2 Nd2 122. Bd1 Ne4 123. Ke6 Nc5+ 124. Kd6 Nd3 125. Bg3 Kc4 126. Be2 Kd4 127. Bh4 Kc3 128. Bg5 Nb2 129. Kd5 Kb3 130. Bf6 Kc2 131. Bh5 Kb3 132. Bg6 1/2-1/2',
      },
    ];

    afterEach(() => {
      metadataMetric.clear();
    });

    it('should correctly identify that 50-moves have occured without capture or pawn movement', () => {
      
      metadataMetric.processGame(Array.from(cjsmin.historyGenerator(game50MovesRule[0].moves)),
      ['m', 'et']);

      expect(metadataMetric.gameEndings['fifty-move rule']).toEqual(1);
    });
  });
});
