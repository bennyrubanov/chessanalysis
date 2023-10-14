import { gameChunks } from './fileReader';
import {
  getAverageDistance,
  getMoveDistanceSetOfGames,
} from './metrics/metrics';
import { FileReaderGame } from './types';

/**
 *
 * @param path
 * @returns
 */
export async function main(path: string) {
  const gamesGenerator = gameChunks(path);
  const games: FileReaderGame[] = [];
  for await (const game of gamesGenerator) {
    games.push(game);
  }
  const {
    pieceThatMovedTheFurthest,
    maxDistance,
    gameCount,
    siteWithFurthestPiece,
    totalDistanceMap,
  } = await getMoveDistanceSetOfGames(games);
  const { pieceWithHighestAverageDistance, maxAverageDistance } =
    getAverageDistance(totalDistanceMap, gameCount);
  // rest of your code

  console.log(`Piece that moved the furthest: ${pieceThatMovedTheFurthest}`);
  console.log(
    `Game in which that piece (${pieceThatMovedTheFurthest}) moved the furthest: ${siteWithFurthestPiece}`
  );
  console.log(`Distance that piece moved in the game: ${maxDistance}`);
  console.log(
    `Piece with highest average distance for the set of games analyzed (calculated by distance piece has moved divided by the number of games analyzed): ${pieceWithHighestAverageDistance}`
  );
  console.log(
    `That piece's (${pieceWithHighestAverageDistance}'s) average distance moved per game: ${maxAverageDistance}`
  );
  console.log(`Number of games analyzed: ${gameCount}`);

  return {
    pieceThatMovedTheFurthest,
    maxDistance,
    pieceWithHighestAverageDistance,
    maxAverageDistance,
    gameCount,
    siteWithFurthestPiece,
  };
}

if (require.main === module) {
  main(`data/10.10.23_test_set`).then(
    ({
      pieceThatMovedTheFurthest,
      maxDistance,
      pieceWithHighestAverageDistance,
      maxAverageDistance,
      gameCount,
    }) => {
      console.log(
        `Piece that moved the furthest: ${pieceThatMovedTheFurthest}`
      );
      console.log(`Max distance: ${maxDistance}`);
      console.log(
        `Piece with highest average distance for the set of games analyzed (calculated by distance piece has moved divided by the number of games analyzed): ${pieceWithHighestAverageDistance}`
      );
      console.log(
        `That piece's average distance moved per game: ${maxAverageDistance}`
      );
      console.log(`Number of games analyzed: ${gameCount}`);
    }
  );
}
