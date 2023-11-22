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
import * as fs from 'fs';
import * as path from 'path';

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
  killStreakMetric.aggregate()
  killStreakMetric.logResults()
  results['Number of games analyzed'] = gameCounter;
  let metricCallsCount = 0;
  // for (const metric of metrics) {
  //   metricCallsCount++;
  //   results[metric.constructor.name] = metric.aggregate()
  // }
}

// for use with streaming_partial_decompresser.js
// counter introduce to avoid overwriting existing data in results.json
// if (require.main === module) {
//   const pathToAnalyze = process.argv[2];
//   main(pathToAnalyze).then(async (results) => {
//     const now = new Date();
//     const counterPath = path.join(__dirname, 'counter.txt');
//     let counter = 1;

//     // Read the counter from the file
//     if (fs.existsSync(counterPath)) {
//       counter = parseInt(fs.readFileSync(counterPath, 'utf8'));
//     }

//     const analysisKey = `analysis_${now.toLocaleString().replace(/\/|,|:|\s/g, '_')}_${counter}`;
//     const resultsPath = path.join(__dirname, 'results.json');

//     let existingResults = {};
//     if (fs.existsSync(resultsPath)) {
//       const fileContent = fs.readFileSync(resultsPath, 'utf8');
//       if (fileContent !== '') {
//         existingResults = JSON.parse(fileContent);
//       }
//     }

//     existingResults[analysisKey] = results;
    
//     fs.writeFileSync(resultsPath, JSON.stringify(existingResults, null, 2));

//     // Increment the counter and write it back to the file
//     counter++;
//     fs.writeFileSync(counterPath, counter.toString());

//     console.log(`Analysis ${analysisKey} written to ${resultsPath}.`)
//   });
// }

// for use with running index.ts alone
if (require.main === module) {
  main(`data/11.11.23 3 Game Test Set`).then((a) => {});
}

// for use with index.ts
// if (require.main === module) {
//   main(`data/10.10.23_test_set`).then(async (results) => {
//     const now = new Date();
//     const analysisKey = `analysis${now.toLocaleString().replace(/\/|,|:|\s/g, '_')}`;    const resultsPath = path.join(__dirname, 'results.json');
    
//     let existingResults = {};
//     if (fs.existsSync(resultsPath)) {
//       const fileContent = fs.readFileSync(resultsPath, 'utf8');
//       if (fileContent !== '') {
//         existingResults = JSON.parse(fileContent);
//       }
//     }

//     existingResults[analysisKey] = results;
    
//     fs.writeFileSync(resultsPath, JSON.stringify(existingResults, null, 2));
//   });
// }