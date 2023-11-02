import { gameChunks } from './fileReader';
import {
  getAverageDistance,
  getMoveDistanceSetOfGames,
} from './metrics/distances';
import {
  getGameWithMostMoves,
  getKillDeathRatios,
  getPieceLevelMoveInfo,
} from './metrics/metrics';
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

  const { gameLinkWithMostMoves: gameWithMostMoves, maxNumMoves } =
    await getGameWithMostMoves(games);

  await getPieceLevelMoveInfo(games);

  const { ambigPiecePromotedToMap, promotingPieceMap } =
    await getPiecePromotionInfo(games);

  console.time('Final Task: print results to console');
  console.log('\n');
  console.log(`Total number of games analyzed: ${gameCount}`);
  console.log('\n');

  console.log('==============================================================');
  console.log('\n');

  // promotions facts
  console.log('PROMOTIONS FACTS:');
  console.log(
    'How often a piece is promoted to different ambiguous piece types:'
  ),
    console.table(ambigPiecePromotedToMap);
  console.log('How often unambiguous piece is promoted:'),
    console.table(promotingPieceMap);
  console.log('==============================================================');
  console.log('\n');

  console.timeEnd('Final Task: print results to console');
  console.log('\n');

  console.timeEnd('Total Execution Time');
  console.log('\n');
}

if (require.main === module) {
  main(`data/10.10.23_test_set`).then(({}) => {});
}
