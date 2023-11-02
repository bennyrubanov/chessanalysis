import { gameChunks } from './fileReader';
import {
  getAverageDistance,
  getGameWithMostMoves,
  getKillDeathRatios,
  getMoveDistanceSetOfGames,
  getPieceLevelMoveInfo,
  getPiecePromotionInfo,
  countAmbigPiecesOnBoard,
} from './metrics/metrics';
import { FileReaderGame } from './types';

/**
 *
 * @param path
 * @returns
 */
export async function main(path: string) {
  console.time('Total Execution Time');

  console.log("\n");

  console.time("Task 1: FileReader")
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
  console.timeEnd('Task 1: FileReader');

  console.time('Task 2: getMoveDistanceSetOfGames');
  const {
    pieceThatMovedTheFurthest,
    maxDistance,
    gameCount,
    siteWithFurthestPiece,
    totalDistanceMap,
    furthestCollectiveDistance,
    gameLinkWithFurthestCollectiveDistance,
  } = await getMoveDistanceSetOfGames(games);
  console.timeEnd('Task 2: getMoveDistanceSetOfGames');

  console.time('Task 3: getAverageDistance');
  const { pieceWithHighestAverageDistance, maxAverageDistance } =
    getAverageDistance(totalDistanceMap, gameCount);
  console.timeEnd('Task 3: getAverageDistance');

  console.time('Task 4: getKillDeathRatios');
  const {
    killDeathRatios,
    killsDeathsAssistsMap,
    pieceWithHighestKillDeathRatio,
  } = await getKillDeathRatios(games);
  console.timeEnd('Task 4: getKillDeathRatios');

  console.time('Task 5: getGameWithMostMoves');
  const { gameLinkWithMostMoves: gameWithMostMoves, maxNumMoves } =
    await getGameWithMostMoves(games);
  console.timeEnd('Task 5: getGameWithMostMoves');

  console.time('Task 6: getPieceLevelMoveInfo');
  const {
    numMovesByPiece,
    averageNumMovesByPiece,
    pieceWithHighestAverageNumMoves,
    pieceWithMostMovesInAGame,
    gameLinkWithPieceMostMoves,
    numMovesMadePieceWithMostMoves,
  } = await getPieceLevelMoveInfo(games);
  console.timeEnd('Task 6: getPieceLevelMoveInfo');

  console.time('Task 7: getPiecePromotionInfo');
  const { ambigPiecePromotedToMap, promotingPieceMap } =
    await getPiecePromotionInfo(games);
  console.timeEnd('Task 7: getPiecePromotionInfo');

  console.time("Task 7: getPiecePromotionInfo")
  const {
    ambigPiecePromotedToMap,
    promotingPieceMap,
  } = await getPiecePromotionInfo(games);
  console.timeEnd("Task 7: getPiecePromotionInfo")

  console.time("Task 8: countAmbigPiecesOnBoard")
  const {
    piecesOnBoardCount,
    maxQueenCounts,
    movesAndGamesWithMaxQueenCount,
  } = await countAmbigPiecesOnBoard(games);
  console.timeEnd("Task 8: countAmbigPiecesOnBoard")

  console.time("Final Task: print results to console")
  console.log("\n");

  console.log(`Total number of games analyzed: ${gameCount}`);
  console.log('\n');

  // distance facts
  console.log('DISTANCE FACTS:');
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
  console.log(
    `Game with the furthest collective distance moved: ${gameLinkWithFurthestCollectiveDistance}`
  );
  console.log(
    `Collective distance moved in that game: ${furthestCollectiveDistance}`
  );
  console.log('==============================================================');
  console.log('\n');

  // KDR facts
  console.log('KDR FACTS (INCLUDING CHECKMATES AS KILLS):');
  console.log(
    `Piece with the highest kill death ratio: ${pieceWithHighestKillDeathRatio}`
  );
  console.log('Kills, Deaths, and Assists for each unambiguous piece:'),
    console.table(killsDeathsAssistsMap);
  console.log(
    'Kill Death Ratios for each unambiguous piece: ' +
      JSON.stringify(killDeathRatios, null, 2)
  );
  console.log('==============================================================');
  console.log('\n');

  // moves facts
  console.log('MOVES FACTS:');
  console.log(`The game with the most moves played: ${gameWithMostMoves}`);
  console.log(`The number of moves played in that game: ${maxNumMoves}`);
  console.log("The total number of moves by piece in the set of games:"), console.table(numMovesByPiece);
  console.log("The average number of moves by piece in the set of games:"), console.table(averageNumMovesByPiece);
  console.log(`The piece with the highest average number moves: ${pieceWithHighestAverageNumMoves}`);
  console.log(`The piece with the most moves in a single game: ${pieceWithMostMovesInAGame}`);
  console.log(`The number of moves played by that piece in that game: ${numMovesMadePieceWithMostMoves}`);
  console.log(`The game that piece made that many moves in: ${gameLinkWithPieceMostMoves}`);
  console.log("==============================================================");
  console.log("\n");

  // promotions facts
  console.log("PROMOTIONS FACTS:")
  console.log("How often a piece is promoted to different ambiguous piece types:"), console.table(ambigPiecePromotedToMap);
  console.log("How often unambiguous piece is promoted:"), console.table(promotingPieceMap);
  console.log("==============================================================");
  console.log("\n");

  // number of pieces to appear on board facts
  console.log("NUMBER OF PIECES TO APPEAR ON BOARD FACTS:")
  console.log("Number of times a piece type appeared on board:"), console.table(piecesOnBoardCount);
  console.log(`The maximum number of queens to appear in a given move in a game: ${maxQueenCounts}`);
  console.log(`The games(s) and last move(s) in that game in which that number of queens appeared: ${movesAndGamesWithMaxQueenCount.map(move => JSON.stringify(move, null, 2)).join(", ")}`);  console.log("==============================================================");
  console.log("\n");
  
  console.timeEnd("Final Task: print results to console")
  console.log("\n");

  console.timeEnd("Total Execution Time");
  console.log("\n");

  console.log('The total number of moves by piece in the set of games:'),
    console.table(numMovesByPiece);
  console.log('The average number of moves by piece in the set of games:'),
    console.table(averageNumMovesByPiece);
  console.log(
    `The piece with the highest average number moves: ${piecesWithHighestAverageNumMoves}`
  );
  console.log(
    `The piece with the most moves in a single game: ${piecesWithMostMovesInAGame}`
  );
  console.log(
    `The number of moves played by that piece in that game: ${numMovesMadePieceWithMostMoves}`
  );
  console.log(
    `The game that piece made that many moves in: ${gameLinksWithPiecesMostMoves}`
  );
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
  main(`data/10.10.23_test_set`).then(({}) => {});
}
