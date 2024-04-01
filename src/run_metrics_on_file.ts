import { randomUUID } from 'crypto';
import * as net from 'net';
import { Chess } from './cjsmin/src/chess';
import { gameChunks } from './fileReader';
import {
  KDRatioMetric,
  KillStreakMetric,
  MateAndAssistMetric,
} from './metrics/captures';
import { MoveDistanceMetric } from './metrics/distances';
import { MetadataMetric } from './metrics/misc';
import {
  GameWithMostMovesMetric,
  MiscMoveFactMetric,
  PieceLevelMoveInfoMetric,
} from './metrics/moves';
import { PromotionMetric } from './metrics/promotions';

/**
 *
 * @param path
 * @returns
 */
export async function main(path: string) {
  // run analysis for the given path
  console.time('Total Execution Time');
  const fileResults = await gameIterator(path);
  console.timeEnd('Total Execution Time');

  const now = new Date();
  const milliseconds = now.getMilliseconds();

  const analysisKey = `analysis_${now
    .toLocaleString()
    .replace(/\/|,|:|\s/g, '_')}_${milliseconds}_${randomUUID()}`;

  const client = net.createConnection({ port: 8000 });

  console.log('connected to queue server, sending results');

  // Send the task to the queue server
  client.write(JSON.stringify({ results: fileResults, analysisKey }));
  console.log('results sent');
  client.end();
}

/**
 * Metric functions will ingest a single game at a time
 * @param metricFunctions
 */
async function gameIterator(path: string) {
  const cjsmin = new Chess();

  const gamesGenerator = gameChunks(path);

  const metrics = [
    new KDRatioMetric(),
    new KillStreakMetric(),
    new MateAndAssistMetric(),
    new PromotionMetric(),
    new MoveDistanceMetric(),
    new GameWithMostMovesMetric(),
    new PieceLevelMoveInfoMetric(),
    new MetadataMetric(cjsmin),
    new MiscMoveFactMetric(),
  ];

  let gameCounter = 0;
  for await (const { moves, metadata } of gamesGenerator) {
    if (gameCounter++ % 400 == 0) console.log(`ingested ${gameCounter} games`);

    for (const metric of metrics) {
      // with array creation
      const historyGenerator = cjsmin.historyGeneratorArr(moves);
      // the generator is useless if we convert it to an array
      metric.processGame(Array.from(historyGenerator), metadata);
    }
  }

  const existingResults = {};

  existingResults['Number of games analyzed'] = gameCounter;
  for (const metric of metrics) {
    existingResults[metric.constructor.name] = metric.aggregate();
  }

  return existingResults;
}

// for use with zst_decompresser.js
if (require.main === module) {
  main(process.argv[2]);
}
