import { main } from '../src';

xdescribe('Using modified cjsmin returns expected results', () => {
  it('should not throw an error', async () => {
    const histShort = require('fs')
      .readFileSync('historiesShort.json')
      .toString()
      .trim();

    const histories = await main(`data/short.pgn`);
    const historiesString = JSON.stringify(histories, null, 2);

    expect(histShort.trim()).toEqual(historiesString.trim());
  });

  //   it('should throw an error if input is not provided', async () => {
  //     await expect(index.main()).rejects.toThrow('Input is required');
  //   });
});
