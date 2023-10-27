// Tests for the functions in captures.ts

import { getBWKillStreaks } from '../src/metrics/captures';

describe('gets black and white kill streaks', () => {
  it('should return the correct kill streaks', () => {
    const moves = [
      { capture: true, unambiguousSymbol: 'PA' },
      { capture: false },
      { capture: true, unambiguousSymbol: 'PA' },
      { capture: true, unambiguousSymbol: 'rh' },
      { capture: false },
    ];

    const streaksObject = getBWKillStreaks(moves as any);
    expect(streaksObject['PA'].killStreaks).toEqual(2);
    expect(streaksObject['rh'].killStreaks).toEqual(1);
    expect(streaksObject['Q'].killStreaks).toEqual(0);
  });
});

describe('tracks kills, deaths and revenge kills by square', () => {
  it('should return the correct kill streaks', () => {});
});
