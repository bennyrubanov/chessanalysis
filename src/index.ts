import { Chess } from '../cjsmin/src/chess';
import { gameChunks } from './fileReader';
import { CaptureLocationMetric } from './metrics/captures';
import { convertToVisual } from './visuals/convertToVisual';

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
  const gamesGenerator = gameChunks(path);
  // const kdRatioMetric = new KDRatioMetric();
  // const killStreakMetric = new MoveDistanceMetric();
  // const mateAndAssistMetric = new MateAndAssistMetric();
  // const promotionMetric = new PromotionMetric();
  // const moveDistanceMetric = new MoveDistanceMetric();
  // const gameWithMostMovesMetric = new GameWithMostMovesMetric();
  // const pieceLevelMoveInfoMetric = new PieceLevelMoveInfoMetric();
  // const metadataMetric = new MetadataMetric();
  const captureLocationMetric = new CaptureLocationMetric();
  const metrics = [
    // kdRatioMetric,
    // killStreakMetric,
    // mateAndAssistMetric,
    // promotionMetric,
    // moveDistanceMetric,
    // gameWithMostMovesMetric,
    // pieceLevelMoveInfoMetric,
    // metadataMetric,
    captureLocationMetric,
  ];

  const cjsmin = new Chess();

  let gameCounter = 0;
  for await (const { moves, metadata } of gamesGenerator) {
    gameCounter++;
    if (gameCounter % 20 == 0) {
      console.log('number of games ingested: ', gameCounter);
    }

    for (const metric of metrics) {
      // with array creation
      const historyGenerator = cjsmin.historyGeneratorArr(moves);
      cjsmin.isCheckmate();
      metric.processGame(Array.from(historyGenerator), metadata);
    }
  }

  const boardMap = captureLocationMetric.aggregate();
  const capturedMap = convertToVisual(
    boardMap,
    (boardInput) => boardInput.captured
  );
  const captureMap = convertToVisual(
    boardMap,
    (boardInput) => boardInput.captures
  );
  require('fs').writeFileSync('boardMap.json', JSON.stringify(boardMap));
  require('fs').writeFileSync('capturedMap.json', JSON.stringify(capturedMap));
  require('fs').writeFileSync('captureMap.json', JSON.stringify(captureMap));

  console.log(captureMap);
  console.log(capturedMap);

  // metadataMetric.aggregate();
  // metadataMetric.logResults();
}

if (require.main === module) {
  main(`data/10.10.23_test_set`).then((a) => {});
}
