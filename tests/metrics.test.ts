import { getMoveDistanceSingleGame } from '../src/metrics';

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
