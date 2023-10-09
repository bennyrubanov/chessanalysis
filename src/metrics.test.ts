import { getMateAndAssists } from './metrics';

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
    });
  });

  it('should return the mating and assisting pieces if there is a mate and an assist', () => {
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
      assistingPiece: 'N',
    });
  });
});
