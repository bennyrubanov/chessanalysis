import {
  getMateAndAssists,
  getMoveDistanceSingleGame,
} from '../src/metrics/metrics';

describe('getMateAndAssists', () => {
  it('should return empty objects if there is no mate or assist', () => {
    const gameHistory: any[] = [
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
        originalString: 'Nf3',
        color: 'w',
        from: 'g1',
        to: 'f3',
        piece: 'N',
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
    ];

    const result = getMateAndAssists(gameHistory);

    expect(result).toEqual({
      matingPiece: undefined,
      assistingPiece: undefined,
      hockeyAssist: undefined,
    });
  });

  it('should return the mating piece if there is a mate but no assist', () => {
    const gameHistory: any[] = [
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
    ];

    const result = getMateAndAssists(gameHistory);

    expect(result).toEqual({
      matingPiece: 'Q',
      assistingPiece: undefined,
      hockeyAssist: undefined,
    });
  });

  it('should return the mating piece and assist if there is a mate with assist', () => {
    const gameHistory: any[] = [
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

    const result = getMateAndAssists(gameHistory);

    expect(result).toEqual({
      matingPiece: 'Q',
      assistingPiece: undefined,
      hockeyAssist: undefined,
    });
  });

  // TODO: gen with copilot so teh game may not be valid
  it('should return just mating piece if the checks are all from the same piece', () => {
    const gameHistory: any[] = [
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
        originalString: 'Qf8+',
        color: 'w',
        from: 'f7',
        to: 'f8',
        piece: 'Q',
        flags: 'n',
      },
      {
        originalString: 'Rg8',
        color: 'b',
        from: 'h8',
        to: 'g8',
        piece: 'R',
        flags: 'n',
      },
      {
        originalString: 'Qg8#', // can capture and mate happen in same? How is it represented?
        color: 'w',
        from: 'f8',
        to: 'g8',
        piece: 'Q',
        captured: 'R',
        flags: 't',
      },
    ];

    const result = getMateAndAssists(gameHistory);

    expect(result).toEqual({
      matingPiece: 'Q',
      assistingPiece: undefined,
      hockeyAssist: undefined,
    });
  });
});

describe('getMoveDistanceSingleGame', () => {
  it('should return the correct max distance and piece for a game', async () => {
    const game = '1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7#';

    const result = await getMoveDistanceSingleGame({
      metadata: [],
      moves: game,
    });

    expect(result.maxDistancePiece).toEqual('q');
    expect(result.maxDistance).toEqual(6);
  });

  it('should return 2 distance for a game with one move', async () => {
    const game = '1. e4 e5';

    const result = await getMoveDistanceSingleGame({
      metadata: [],
      moves: game,
    });

    expect(result.maxDistancePiece).toBe('pe');
    expect(result.maxDistance).toEqual(2);
  });
});

// game being tested: https://www.chess.com/analysis/game/pgn/4uURW4rJaa?tab=analysis
// describe.only('getKillDeathRatios', () => {
//   it('should return the correct number of kills, deaths, and assists for each piece in a game', async () => {
//     const game = [
//       {
//         metadata: [],
//         moves: '1. e4 e5 2. d4 exd4 3. Qxd4 Nc6 4. Qa4 Nf6 5. Nc3 d5 6. exd5 Qe7+ 7. Kd1 Bg4+ 8. Kd2 Nxd5 9. Nb5 Ncb4 10. c3 O-O-O 11. f3 Qe3+ 12. Kd1 Nxc3# 0-1'
//       }
//     ];

//     const result = await getkillDeathRatios(game);

//     console.log(result);

//     expect(result['PE'].kills).toEqual(1);
//     expect(result['PE'].deaths).toEqual(1);
//   });
// })
