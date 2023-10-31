import { gameChunks } from './fileReader';
import {
  getAverageDistance,
  getKillDeathRatios,
  getMoveDistanceSetOfGames,
  getGameWithMostMoves,
} from './metrics/metrics';
import {
  getBWKillStreaks,
} from './metrics/captures';
import { FileReaderGame } from './types';

/**
 *
 * @param path
 * @returns
 */
export async function main(path: string) {
  const gamesGenerator = gameChunks(path);
  const games: FileReaderGame[] = [];
  let gameCounter = 0;
  for await (const game of gamesGenerator) {
    gameCounter++;
    if (gameCounter % 20 == 0) {
      console.log('number of games analyzed: ', gameCounter);
    }
    games.push(game);

    // const siteLink = game.metadata[1].match(/"(.*?)"/)[1];
    // console.log(`lichess link to game played: ${siteLink}`);
  }
  const {
    pieceThatMovedTheFurthest,
    maxDistance,
    gameCount,
    siteWithFurthestPiece,
    totalDistanceMap,
  } = await getMoveDistanceSetOfGames(games);

  const { 
    pieceWithHighestAverageDistance,
    maxAverageDistance,
   } = getAverageDistance(totalDistanceMap, gameCount);

  const {
    killDeathRatios,
    killsDeathsAssistsMap,
    pieceWithHighestKillDeathRatio,
  } = await getKillDeathRatios(games);

  const {
    gameLinkWithMostMoves : gameWithMostMoves,
    maxNumMoves,
  } = await getGameWithMostMoves(games);


  console.log("\n");
  console.log(`Total number of games analyzed: ${gameCount}`);
  console.log("\n");

  // distance facts
  console.log("DISTANCE FACTS:")
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
  console.log("==============================================================");
  console.log("\n");
  
  // KDR facts
  console.log("KDR FACTS (INCLUDING CHECKMATES AS KILLS):")
  console.log(`Piece with the highest kill death ratio: ${pieceWithHighestKillDeathRatio}`);
  console.log("Kills, Deaths, and Assists for each unambiguous piece:"), console.table(killsDeathsAssistsMap);
  console.log("Kill Death Ratios for each unambiguous piece: " + JSON.stringify(killDeathRatios, null, 2));
  console.log("==============================================================");
  console.log("\n");

  // moves facts
  console.log("MOVES FACTS:")
  console.log(`The game with the most moves played: ${gameWithMostMoves}`);
  console.log(`The number of moves played in that game: ${maxNumMoves}`);
  console.log("==============================================================");
  console.log("\n");


  return {
    pieceThatMovedTheFurthest,
    maxDistance,
    pieceWithHighestAverageDistance,
    maxAverageDistance,
    gameCount,
    siteWithFurthestPiece,
    killDeathRatios,
    killsDeathsAssistsMap,
    pieceWithHighestKillDeathRatio,
  };
}

if (require.main === module) {
  main(`data/10.10.23_test_set`).then(({}) => {}
  );
}
