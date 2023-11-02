import { Piece, PrettyMove } from '../cjsmin/src/chess';
import { gameChunks } from './fileReader';
import { KDRatioMetric } from './metrics/captures';
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
  getGameWithMostMoves(games);
  getPieceLevelMoveInfo(games);
  getPiecePromotionInfo(games);

  console.log(`Total number of games analyzed: ${gameCount}`);
  console.log('\n');

  console.log('==============================================================');
  console.log('\n');

  console.timeEnd('Total Execution Time');
  console.log('\n');
}

/**
 * Metric functions will ingest a single game at a time
 * @param metricFunctions
 */
function gameIterator(
  metricFunctions: ((game: { move: PrettyMove; board: Piece[] }[]) => void)[]
) {
  const KDRatio = new KDRatioMetric();
  KDRatio.getKillDeathRatios(games);
}

if (require.main === module) {
  main(`data/10.10.23_test_set`).then(({}) => {});
}
