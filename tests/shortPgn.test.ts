import { main } from '../src';

describe('Using modified cjsmin returns expected results', () => {
  it('should not throw an error', async () => {
    const { histShort, historiesString } = await main(`data/short.pgn`);
    expect(histShort.trim()).toEqual(historiesString.trim());
  });

  //   it('should throw an error if input is not provided', async () => {
  //     await expect(index.main()).rejects.toThrow('Input is required');
  //   });
});
