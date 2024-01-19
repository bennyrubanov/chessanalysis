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
import * as fs from 'fs';
import * as path from 'path';
import * as async from 'async';

/**
 *
 * @param path
 * @returns
 */
export async function main(path: string) {
  console.time('Total Execution Time');
  await gameIterator(path);
  console.timeEnd('Total Execution Time');
  return results;
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
  let metricCallsCount = 0;
  for (const metric of metrics) {
    metricCallsCount++;
    results[metric.constructor.name] = metric.aggregate()
  }
}

// Create a write to result.json queue with a concurrency of 1
const queue = async.queue((task) => {
  return new Promise<void>((resolve, reject) => {
    const { results, analysisKey, resultsPath } = task;
    try {
      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
      console.log(`Analysis "${analysisKey}" has been written to ${resultsPath}`);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}, 1);

// for use with streaming_partial_decompresser.js
// counter introduced to avoid overwriting existing data in results.json
if (require.main === module) {
  const pathToAnalyze = process.argv[2];
  main(pathToAnalyze).then(async (results) => {
    const now = new Date();
    const milliseconds = now.getMilliseconds();

    const analysisKey = `analysis_${now.toLocaleString().replace(/\/|,|:|\s/g, '_')}_${milliseconds}`;
    const resultsPath = path.join(__dirname, 'results.json');

    let existingResults = {};
    if (fs.existsSync(resultsPath)) {
      const fileContent = fs.readFileSync(resultsPath, 'utf8');
      if (fileContent !== '') {
        existingResults = JSON.parse(fileContent);
      }
    }

    existingResults[analysisKey] = results;

    // Add the write task to the queue and wait for it to complete
    await queue.push({ results: existingResults, analysisKey, resultsPath });
  });
}