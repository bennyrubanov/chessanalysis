import { Chess } from '../cjsmin/src/chess';
import { gameChunks } from './fileReader';

export async function* getHistoriesFromFilePath(path: string) {
  const chess = new Chess();
  const gamesGenerator = gameChunks(path);
  for await (const game of gamesGenerator) {
    chess.loadPgn(game.moves);
    yield chess.history();
  }
}
