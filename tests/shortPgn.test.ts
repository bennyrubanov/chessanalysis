import { Chess } from '../cjsmin/src/chess';
import { gameChunks } from '../src/fileReader';

async function* getHistoriesFromFilePath(path: string) {
  const chess = new Chess();
  const gamesGenerator = gameChunks(path);
  for await (const game of gamesGenerator) {
    chess.loadPgn(game.moves);
    yield chess.history();
  }
}

describe('Using modified cjsmin returns expected results', () => {
  it('should not throw an error', async () => {
    const histShort = JSON.parse(
      require('fs').readFileSync('data/historiesShort.json').toString().trim()
    );

    const historiesGenerator = getHistoriesFromFilePath(`data/short.pgn`);
    const histories = [];
    for await (const history of historiesGenerator) {
      histories.push(history);
    }

    expect(histShort[0]).toEqual(histories[0]);
  });

  //   it('should throw an error if input is not provided', async () => {
  //     await expect(index.main()).rejects.toThrow('Input is required');
  //   });
});
