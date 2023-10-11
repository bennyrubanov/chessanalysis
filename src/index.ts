import { gameChunks } from './fileReader';
import { getMoveDistanceSingleGame } from './metrics';
import { getAverageDistance } from './metrics';

// const year = 2013;
// const month = '01';
// const path = `data/lichess_db_standard_rated_${year}-${month}_TEST_SET.pgn`;

/**
 * We currently only support analyzing a single game at a time
 *
 * @param path
 * @returns
 */
export async function main(path: string) {
  const games = gameChunks(path);
  let maxDistance = 0;
  let pieceThatMovedTheFurthest = null;
  let totalDistanceMap: { [key: string]: number } = {};
  let lastGame;

  let gameCount = 0;
  for await (const game of games) {
    // progress tracker
    gameCount++;
    if (gameCount % 100 == 0) {
      console.log('number of games analyzed: ', gameCount);
    }

    const { maxDistancePiece, maxDistance: distance, distanceMap } = await getMoveDistanceSingleGame(game);

    if (distance > maxDistance) {
      maxDistance = distance;
      pieceThatMovedTheFurthest = maxDistancePiece;
    }

    for (const piece of Object.keys(distanceMap)) {
      if (!totalDistanceMap[piece]) {
        totalDistanceMap[piece] = 0;
      }
      totalDistanceMap[piece] += distanceMap[piece];
    }

    lastGame = game;

  }
  
  const { pieceWithHighestAverageDistance, maxAverageDistance } = getAverageDistance(totalDistanceMap, gameCount);

  console.log('Last game analyzed: ', lastGame);

  return {
    pieceThatMovedTheFurthest,
    maxDistance,
    pieceWithHighestAverageDistance,
    maxAverageDistance,
    gameCount
  };

}

if (require.main === module) {
  main(`data/10.10.23_test_set`).then(({ pieceThatMovedTheFurthest, maxDistance, pieceWithHighestAverageDistance, maxAverageDistance, gameCount }) => {
    console.log(`Piece that moved the furthest: ${pieceThatMovedTheFurthest}`);
    console.log(`Max distance: ${maxDistance}`);
    console.log(`Piece with highest average distance for the set of games analyzed (calculated by distance piece has moved divided by the number of games analyzed): ${pieceWithHighestAverageDistance}`);
    console.log(`That piece's average distance moved per game: ${maxAverageDistance}`);
    console.log(`Number of games analyzed: ${gameCount}`);
  });
}
