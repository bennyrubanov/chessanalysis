import { Chess } from '../cjsmin/src/chess';
import { gameChunks } from './fileReader';
import { getGameHistory, initializeMetricMaps } from './prepare';

// const year = 2013;
// const month = '01';
// const path = `data/lichess_db_standard_rated_${year}-${month}_TEST_SET.pgn`;

/**
 * We currently only support analyzing a single game at a time
 *
 * @param path
 * @returns
 */
export async function main(path: string) {
  const metrics = initializeMetricMaps();
  const games = gameChunks(path);
  const board = new Chess();

  let count = 0;
  for await (const game of games) {
    // progress tracker
    count++;
    if (count % 200 == 0) {
      console.log(count);
    }

    const history = getGameHistory(board, game.moves);
    for (const move of history) {
      if (move.captured) {
        metrics[move.to].deaths[move.captured]++;
        metrics[move.from].kills[move.captured]++;
      }
    }
  }
}

if (require.main === module) {
  main(`data/short.pgn`).then((res) => {});
}
