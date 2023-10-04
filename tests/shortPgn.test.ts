import { main } from '../src';

describe('Using modified cjsmin returns expected results', () => {
  it('should not throw an error', async () => {
    const res = await main();
    expect(res).toBe(true);
  });

  //   it('should throw an error if input is not provided', async () => {
  //     await expect(index.main()).rejects.toThrow('Input is required');
  //   });
});
