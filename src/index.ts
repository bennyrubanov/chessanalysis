import { Chess } from '../cjsmin/src/chess';
import { gameChunks } from './fileReader';
import { KDRatioMetric, MateAndAssistMetric } from './metrics/captures';
import { MoveDistanceMetric } from './metrics/distances';
import { MetadataMetric } from './metrics/misc';
import {
  GameWithMostMovesMetric,
  PieceLevelMoveInfoMetric,
} from './metrics/moves';
import { PromotionMetric } from './metrics/promotions';

/**
 *
 * @param path
 * @returns
 */
export async function main(path: string) {
  console.time('Total Execution Time');
  await gameIterator(path);
  console.timeEnd('Total Execution Time');
}

/**
 * Metric functions will ingest a single game at a time
 * @param metricFunctions
 */
async function gameIterator(path) {
  const cjsmin = new Chess();

  const gamesGenerator = gameChunks(path);
  const kdRatioMetric = new KDRatioMetric();
  const killStreakMetric = new MoveDistanceMetric();
  const mateAndAssistMetric = new MateAndAssistMetric();
  const promotionMetric = new PromotionMetric();
  const moveDistanceMetric = new MoveDistanceMetric();
  const gameWithMostMovesMetric = new GameWithMostMovesMetric();
  const pieceLevelMoveInfoMetric = new PieceLevelMoveInfoMetric();
  const metadataMetric = new MetadataMetric(cjsmin);
  const metrics = [
    kdRatioMetric,
    killStreakMetric,
    mateAndAssistMetric,
    promotionMetric,
    moveDistanceMetric,
    gameWithMostMovesMetric,
    pieceLevelMoveInfoMetric,
    metadataMetric,
  ];

  let gameCounter = 0;
  for await (const { moves, metadata } of gamesGenerator) {
    gameCounter++;
    if (gameCounter % 20 == 0) {
      console.log('number of games ingested: ', gameCounter);
    }

    for (const metric of metrics) {
      // with array creation
      const historyGenerator = cjsmin.historyGeneratorArr(moves);
      metric.processGame(Array.from(historyGenerator), metadata);
    }
  }
  kdRatioMetric.aggregate();
  kdRatioMetric.logResults();
}

if (require.main === module) {
  main(`data/10.10.23_test_set`).then((a) => {});
}
