import { kill } from 'process';
import { Chess } from '../cjsmin/src/chess';
import { gameChunks } from './fileReader';
import { KDRatioMetric, MateAndAssistMetric, KillStreakMetric } from './metrics/captures';
import { MoveDistanceMetric } from './metrics/distances';
import { MetadataMetric } from './metrics/misc';
import {
  GameWithMostMovesMetric,
  PieceLevelMoveInfoMetric,
  MiscMoveFactMetric,
} from './metrics/moves';
import { PromotionMetric } from './metrics/promotions';
const fs = require('fs');


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

let results = {
  'Number of games analyzed': 0,
}

/**
 * Metric functions will ingest a single game at a time
 * @param metricFunctions
 */
async function gameIterator(path) {
  const cjsmin = new Chess();

  const gamesGenerator = gameChunks(path);
  const kdRatioMetric = new KDRatioMetric();
  const killStreakMetric = new KillStreakMetric();
  const mateAndAssistMetric = new MateAndAssistMetric();
  const promotionMetric = new PromotionMetric();
  const moveDistanceMetric = new MoveDistanceMetric();
  const gameWithMostMovesMetric = new GameWithMostMovesMetric();
  const pieceLevelMoveInfoMetric = new PieceLevelMoveInfoMetric();
  const metadataMetric = new MetadataMetric(cjsmin);
  const miscMoveFactMetric = new MiscMoveFactMetric();
  const metrics = [
    metadataMetric,
    kdRatioMetric,
    killStreakMetric,
    mateAndAssistMetric,
    promotionMetric,
    moveDistanceMetric,
    gameWithMostMovesMetric,
    pieceLevelMoveInfoMetric,
    miscMoveFactMetric,
  ];

  let gameCounter = 0;
  for await (const { moves, metadata } of gamesGenerator) {
    gameCounter++;
    if (gameCounter % 400 == 0) {
      console.log('number of games ingested: ', gameCounter);
    }

    for (const metric of metrics) {
      // with array creation
      const historyGenerator = cjsmin.historyGeneratorArr(moves);
      metric.processGame(Array.from(historyGenerator), metadata);
    }
  }
  results['Number of games analyzed'] = gameCounter;
  for (const metric of metrics) {
    results[`${metric}`] = metric.aggregate()
  }
}

// for use with streaming_partial_decompresser.js
if (require.main === module) {
  const path = process.argv[2];
  main(path).then(async (results) => {
    const analysisKey = `analysis${Date.now()}`; // Use the current timestamp as the key
    const existingResults = JSON.parse(fs.readFileSync('./results.json', 'utf8') || '{}'); // read the contents of results.json as JSON and store in existingResults
    existingResults[analysisKey] = results;
    fs.writeFileSync('./results.json', JSON.stringify(existingResults, null, 2)); // convert existResults to JSON string and write to results.json
  });
}

// for use with index.ts
// if (require.main === module) {
//   main(`data/11.11.23 3 Game Test Set`).then((a) => {});
// }