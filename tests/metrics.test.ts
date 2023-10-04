import { getMoveDistance } from '../src/metrics';

describe('getMoveDistance', () => {
  it('should return 0 for the same position', () => {
    const start = 'e2';
    const end = 'e2';
    expect(getMoveDistance(start, end)).toBe(0);
  });

  it('should return 1 for a one-square move', () => {
    const start = 'e2';
    const end = 'e3';
    expect(getMoveDistance(start, end)).toBe(1);
  });

  it('should return 2 for a two-square move', () => {
    const start = 'e2';
    const end = 'e4';
    expect(getMoveDistance(start, end)).toBe(2);
  });

  it('should return 6 for a diagonal move', () => {
    const start = 'e2';
    const end = 'h5';
    expect(getMoveDistance(start, end)).toBe(6);
  });

  it('should return 3 for a knight move', () => {
    const start = 'b1';
    const end = 'c3';
    expect(getMoveDistance(start, end)).toBe(3);
  });
});
