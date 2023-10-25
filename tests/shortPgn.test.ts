import { getHistoriesFromFilePath } from '../src/gameHistory';

describe('Using modified cjsmin returns expected results', () => {
  it('should not throw an error', async () => {
    const histShort = JSON.parse(
      require('fs').readFileSync('historiesShort.json').toString().trim()
    );

    const historiesGenerator = getHistoriesFromFilePath(`data/short.pgn`);
    const histories = [];
    for await (const history of historiesGenerator) {
      histories.push(history);
    }

    require('fs').writeFileSync('histories.json', JSON.stringify(histories));

    expect(histShort[0]).toEqual(histories[0]);
  });

  //   it('should throw an error if input is not provided', async () => {
  //     await expect(index.main()).rejects.toThrow('Input is required');
  //   });
});
