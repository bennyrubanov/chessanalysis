import * as fs from 'fs';
import * as net from 'net';
import { Chess } from '../cjsmin/src/chess';
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
import { RESULTS_PATH } from './queue';

/**
 *
 * @param path
 * @returns
 */
export async function main(path: string) {
  console.time('Total Execution Time');
  await gameIterator(path, { 'Number of games analyzed': 0 });
  console.timeEnd('Total Execution Time');

  const now = new Date();
  const milliseconds = now.getMilliseconds();

  const analysisKey = `analysis_${now
    .toLocaleString()
    .replace(/\/|,|:|\s/g, '_')}_${milliseconds}`;

  let existingResults = {};
  if (fs.existsSync(RESULTS_PATH)) {
    const fileContent = fs.readFileSync(RESULTS_PATH, 'utf8');
    if (fileContent !== '') {
      existingResults = JSON.parse(fileContent);
    }
  }

  console.log('sending results');

  // TODO: Probably we need to read in the existing results in the queue server and merge them, as when there are multiple items in the queue
  // this is going to be out of date
  existingResults[analysisKey] = {
    'Number of games analyzed': 0,
  };

  const client = net.createConnection({ port: 8000 });

  console.log('connected to queue server');

  // Send the task to the queue server
  client.write(JSON.stringify({ results: existingResults, analysisKey }));

  console.log('results sent');
}

/**
 * Metric functions will ingest a single game at a time
 * @param metricFunctions
 */
async function gameIterator(path, results) {
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

  results['Number of games analyzed'] = gameCounter;
  for (const metric of metrics) {
    results[metric.constructor.name] = metric.aggregate();
  }
}

// for use with zst_decompresser.js
if (require.main === module) {
  main(process.argv[2]).then((results) => {});
}
