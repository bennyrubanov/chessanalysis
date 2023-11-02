import { gameChunks } from './fileReader';
import { getKillDeathRatios } from './metrics/captures';
import {
  getAverageDistance,
  getMoveDistanceSetOfGames,
} from './metrics/distances';
import { getGameWithMostMoves, getPieceLevelMoveInfo } from './metrics/metrics';
import { getPiecePromotionInfo } from './metrics/promotions';
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

  const { gameCount, totalDistanceMap } = await getMoveDistanceSetOfGames(
    games
  );

  getAverageDistance(totalDistanceMap, gameCount);

  await getKillDeathRatios(games);
  await getGameWithMostMoves(games);
  await getPieceLevelMoveInfo(games);
  await getPiecePromotionInfo(games);

  console.time('Final Task: print results to console');
  console.log('\n');
  console.log(`Total number of games analyzed: ${gameCount}`);
  console.log('\n');

  console.log('==============================================================');
  console.log('\n');
}

if (require.main === module) {
  main(`data/10.10.23_test_set`).then(({}) => {});
}
