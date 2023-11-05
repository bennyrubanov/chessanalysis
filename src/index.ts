import { gameChunks } from './fileReader';
import { KDRatioMetric } from './metrics/captures';
import { MoveDistanceMetric } from './metrics/distances';
import { getPieceLevelMoveInfo } from './metrics/moves';
import { FileReaderGame } from './types';

/**
 *
 * @param path
 * @returns
 */
export async function main(path: string) {
  console.time('Total Execution Time');
  console.time('Task 1: FileReader');

  const gamesGenerator = gameChunks(path);
  const games: FileReaderGame[] = [];

  let gameCounter = 0;
  for await (const game of gamesGenerator) {
    gameCounter++;
    if (gameCounter % 20 == 0) {
      console.log('number of games ingested: ', gameCounter);
    }
    games.push(game);

    // const siteLink = game.metadata[1].match(/"(.*?)"/)[1];
    // console.log(`lichess link to game played: ${siteLink}`);
  }
  console.timeEnd('Task 1: FileReader');

  getPieceLevelMoveInfo(games);
}

/**
 * Metric functions will ingest a single game at a time
 * @param metricFunctions
 */
function gameIterator() {
  // Logic to get link to the game, which should be passed in processGame
  // let site = game.metadata
  // .find((item) => item.startsWith('[Site "'))
  // ?.replace('[Site "', '')
  // .replace('"]', '');
  const kdrm = new KDRatioMetric();
  const adm = new MoveDistanceMetric();
}

if (require.main === module) {
  main(`data/10.10.23_test_set`).then(({}) => {});
}
