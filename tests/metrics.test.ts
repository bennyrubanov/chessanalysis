import { Chess as ChessOG } from 'chess.js';
import { Chess } from '../cjsmin/src/chess';
import {
  KDRatioMetric,
  KillStreakMetric,
  MateAndAssistMetric,
} from '../src/metrics/captures';
import { getMoveDistanceSingleGame } from '../src/metrics/distances';
import { getGameWithMostMoves } from '../src/metrics/moves';

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

  xdescribe('gets black and white kill streaks', () => {
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

  xdescribe('tracks kills, deaths and revenge kills by square', () => {
    it('should return the correct kill streaks', () => {});
  });

  describe('getMateAndAssists', () => {
    const mateAndAssistMetric = new MateAndAssistMetric();

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
          originalString: 'Qxf7#',
          color: 'w',
          from: 'h5',
          to: 'f7',
          piece: 'Q',
          captured: 'p',
          flags: 't',
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
        },
        {
          originalString: 'Kd8',
          color: 'b',
          from: 'e8',
          to: 'd8',
          piece: 'k',
          flags: 'n',
        },
        {
          originalString: 'Qf8#',
          color: 'w',
          from: 'f7',
          to: 'f8',
          piece: 'Q',
          captured: 'k',
          flags: 't',
        },
      ];

      mateAndAssistMetric.processGame(moves);

      expect(mateAndAssistMetric.mateAndAssistMap['Q']).toEqual({
        mates: 1,
        assists: 0,
        hockeyAssists: 0,
      });
    });
  });

  xdescribe('getMoveDistanceSingleGame', () => {
    xit('should return the correct max distance and piece for a game', async () => {
      const game = '1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7#';

      const result = await getMoveDistanceSingleGame({
        metadata: [],
        moves: game,
      });

      expect(result.maxDistancePiece).toEqual('Q');
      expect(result.maxDistance).toEqual(6);
    });

    xit('should return 2 distance for a game with one move', async () => {
      const game = '1. e4 e5';

      const result = await getMoveDistanceSingleGame({
        metadata: [],
        moves: game,
      });

      expect(result.maxDistancePiece).toBe('PE');
      expect(result.maxDistance).toEqual(2);
    });

    it('should return a singleGameDistanceTotal equal to the addition of all distances in the distanceMap', async () => {
      const game = '1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7#';

      const result = await getMoveDistanceSingleGame({
        metadata: [],
        moves: game,
      });

      let totalDistance = 0;

      for (const distance of Object.keys(result.distanceMap)) {
        totalDistance += result.distanceMap[distance];
      }

      expect(result.singleGameDistanceTotal).toEqual(totalDistance);
    });
  });

  // game being tested: https://www.chess.com/analysis/game/pgn/4uURW4rJaa?tab=analysis
  xdescribe('getKillDeathRatios', () => {
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
      kdrMetric.processGame(Array.from(cjsmin.historyGenerator(game[0].moves)));

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

      kdrMetric.processGame(Array.from(cjsmin.historyGenerator(game[0].moves)));

      console.log(kdrMetric.KDAssistsMap['ng'].kills);
      expect(kdrMetric.KDAssistsMap['ng'].kills).toEqual(3);
    });
  });

  xdescribe('getMateAndAssists', () => {
    it('should return the correct mating piece', () => {
      const game = [
        {
          metadata: [],
          moves:
            '1. e4 e5 2. d4 exd4 3. Qxd4 Nc6 4. Qa4 Nf6 5. Nc3 d5 6. exd5 Qe7+ 7. Kd1 Bg4+ 8. Kd2 Nxd5 9. Nb5 Ncb4 10. c3 O-O-O 11. f3 Qe3+ 12. Kd1 Nxc3# 0-1',
        },
      ];

      const result = getMateAndAssists(game[0].moves);

      expect(result.matingPiece).toEqual('ng');
      // expect(result).toEqual({
      //   matingPiece: '',
      //   assistingPiece: '',
      //   hockeyAssist: ,
      //   unambigAssistingPiece: ,
      //   unambigMatingPiece: ,
      //   unambigHockeyAssist: ,
      //   lastPieceMoved:
      // });
    });

    it.only('should return the correct mating piece', () => {
      // game: https://lichess.org/jo73x9y8
      const game = [
        {
          metadata: [],
          moves:
            '1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. c3 Bc5 5. cxd4 Nxd4 6. Nxd4 Bxd4 7. Qxd4 d6 8. Qxg7 Qf6 9. Qxf6 Nxf6 10. Bc4 Be6 11. Bxe6 fxe6 12. Nc3 O-O-O 13. O-O Kb8 14. Bg5 Rhf8 15. Rad1 Rd7 16. e5 dxe5 17. Bxf6 Rxd1 18. Rxd1 a6 19. Bxe5 b5 20. Rd7 b4 21. Na4 Kb7 22. Rxc7+ Kb8 23. Rxh7+ Kc8 24. Rc7+ Kd8 25. Rc6 Ke7 26. Rxa6 Rd8 27. Ra7+ Ke8 28. Kf1 Rd2 29. Ra8+ Kd7 30. Rb8 Rd5 31. Bg3 Ra5 32. b3 Rd5 33. Rb7+ Kc6 34. Rb6+ Kd7 35. Rd6+ Rxd6 36. Bxd6 Kxd6 37. Ke2 Kc6 38. Kd3 Kb5 39. Ke4 Kc6 40. h4 Kd7 41. g4 Ke7 42. h5 Kf7 43. Ke5 Kg7 44. f4 Kh6 45. Kxe6 Kg7 46. g5 Kh7 47. Kf6 Kh8 48. g6 Kg8 49. h6 Kh8 50. Kg5 Kg8 51. f5 Kh8 52. f6 Kg8 53. g7 Kh7 54. Kf5 Kg8 55. Ke6 Kh7 56. f7 Kg6 57. f8=Q Kh7 58. g8=Q# 1-0',
        },
      ];

      const result = getMateAndAssists(game[0].moves);

      expect(result.unambigMatingPiece).toEqual('PG');
    });
  });

  xdescribe('getGameWithMostMoves', () => {
    it('should return the correct number of moves made', async () => {
      const game = [
        {
          metadata: [],
          moves:
            '1. e4 e5 2. d4 exd4 3. Qxd4 Nc6 4. Qa4 Nf6 5. Nc3 d5 6. exd5 Qe7+ 7. Kd1 Bg4+ 8. Kd2 Nxd5 9. Nb5 Ncb4 10. c3 O-O-O 11. f3 Qe3+ 12. Kd1 Nxc3# 0-1',
        },
      ];

      const result = await getGameWithMostMoves(game);

      expect(result.maxNumMoves).toEqual(24);
    });
  });
});
