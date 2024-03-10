import { readFileSync } from 'fs';
import { UASymbol } from '../cjsmin/src/chess';

/**
 *
 * @param results.json
 * @returns final analysis results of all files created and deleted in streaming_partial_decompresser
 */
async function aggregateResults(filePath: string) {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));

  // instantiate final variables
  let totalGamesAnalyzed = 0;
  let analysisCounter = 0;

  // metadata metrics
  let largestRatingDiff = 0;
  let largestRatingDiffGame = [];
  let mostGamesPlayedByPlayer = 0;
  let playerMostGames = [];
  let gameTypeStats = {};
  let gameTimeControlStats = {};
  let openings = {};
  let bongcloudAppearances = 0;
  let gameEndings = {};
  let totalGamesAnalyzedForRatings = 0; // accounting for some missing rating data

  // capture metrics
  let KDMap = {};
  let KDValuesMap = {};
  let KDRatios = {};
  let KDRatiosValues = {};
  let maxKDRatio = 0;
  let maxKDRatioValues = 0;
  let pieceWithHighestKDRatio = [];
  let pieceWithHighestKDRatioValues = [];
  let KillStreakMap = {};
  let maxKillStreak = 0;
  let maxKillStreakPiece = [];
  let maxKillStreakGame = [];

  // mates and assists metrics
  let mateAndAssistMap = {};
  let matedCountsMap = {
    k: 0,
    K: 0,
  };

  // promotions metrics
  let promotedToTotals = {
    q: 0,
    r: 0,
    b: 0,
    n: 0,
  };
  let uasPromotingPieces = {};
  let maxNumQueens = 0;
  let movesAndGamesMaxQueens = [];

  // distance metrics
  let pieceMaxAvgDist = [];
  let maxAvgDistance = 0;
  let pieceMinAvgDist = [];
  let minAvgDistance = Infinity;
  let pieceMaxDistSingleGame = [];
  let gamePieceMaxDist = [];
  let distPieceMaxDist = 0;
  let totalCollectiveDistGames = 0;
  let gameMaxCollectiveDist = {
    distance: 0,
    games: [],
  };
  let totalDistByPiece = {};
  let avgDistByPiece = {};

  // moves metrics
  let gameMostMoves = [];
  let gameMostMovesNumMoves = 0;
  let totalMovesByPiece = {};
  let averageNumMovesByPiece = {};
  let pieceHighestAverageMoves = [];
  let highestAverageMoves = 0;
  let singleGameMaxMoves = 0;
  let pieceSingleGameMaxMoves = [];
  let gameSingleGameMaxMoves = [];
  let gamesNoCastling = 0;
  let queenKingCastlingCounts = {
    blackKing: 0,
    blackQueen: 0,
    whiteKing: 0,
    whiteQueen: 0,
  };
  let enPassantMovesCount = 0;
  let totalNumPiecesKnightHopped = 0;

  // helper variables
  let weightedTotalPlayerRating = 0;
  let weightedTotalRatingDiff = 0;

  // ANALYSIS-BY-ANALYSIS CALCULATIONS
  for (const analysis of Object.values(data)) {
    analysisCounter++;

    const thisAnalysisGamesAnalyzed = analysis['Number of games analyzed'];

    // METADATA METRICS
    // ratings weighted average calculations
    ({
      weightedTotalPlayerRating,
      weightedTotalRatingDiff,
      totalGamesAnalyzedForRatings,
    } = aggregateMetadata(
      analysis,
      weightedTotalPlayerRating,
      weightedTotalRatingDiff,
      totalGamesAnalyzedForRatings
    ));

    // ratings largest diff
    const thisLargestRatingDiff =
      analysis['MetadataMetric']['largestRatingDiff'];
    const thisLargestRatingDiffGame =
      analysis['MetadataMetric']['largestRatingDiffGame'];
    if (thisLargestRatingDiff > largestRatingDiff) {
      largestRatingDiff = thisLargestRatingDiff;
      largestRatingDiffGame = thisLargestRatingDiffGame;
    } else if (thisLargestRatingDiff === largestRatingDiff) {
      largestRatingDiffGame.push(thisLargestRatingDiffGame);
    }

    // games played
    // currently this stat is inaccurately tracked across analyses
    // the player with the most games might have their games split across analyses
    // the fix is to return the playerGameStats from misc.ts and then parse that in the final aggregate analysis but that dataset could be very large
    const thisMostGamesPlayed = analysis['MetadataMetric']['mostGamesPlayed'];
    const thisPlayerMostGames = analysis['MetadataMetric']['playerMostGames'];
    if (thisMostGamesPlayed > mostGamesPlayedByPlayer) {
      mostGamesPlayedByPlayer = thisMostGamesPlayed;
      playerMostGames = thisPlayerMostGames;
    } else if (thisMostGamesPlayed === mostGamesPlayedByPlayer) {
      playerMostGames.push(thisPlayerMostGames);
    }

    // aggregate gameTypeStats
    aggregateGameTypeStats(analysis, gameTypeStats);

    // aggregate gameTimeControlStats
    aggregateGameTimeControlStats(analysis, gameTimeControlStats);

    // aggregate openings stats
    bongcloudAppearances = aggregateOpeningStats(
      analysis,
      openings,
      bongcloudAppearances
    );

    // aggregate game endings stats
    aggregateEndingStats(analysis, gameEndings);

    // KD AND CAPTURE METRICS
    // KD Ratios
    // Recalculating KD Ratios across all the analyses (alternatively could do weighted averages)
    aggregateKDRatio(analysis, KDMap, KDValuesMap);

    // kill streaks
    ({ maxKillStreak, maxKillStreakPiece, maxKillStreakGame } =
      aggregateKillStreaks(
        analysis,
        KillStreakMap,
        maxKillStreak,
        maxKillStreakPiece,
        maxKillStreakGame
      ));

    // mates and assists
    aggregateMatesAndAssists(analysis, mateAndAssistMap, matedCountsMap);

    // promotions metrics
    const { thisMaxNumQueens, thisMovesAndGamesMaxQueens } =
      aggregatePromotions(analysis, promotedToTotals, uasPromotingPieces);

    // find maxes
    if (thisMaxNumQueens > maxNumQueens) {
      maxNumQueens = thisMaxNumQueens;
      movesAndGamesMaxQueens = thisMovesAndGamesMaxQueens;
    } else if (thisMaxNumQueens > maxNumQueens) {
      movesAndGamesMaxQueens.push(thisMovesAndGamesMaxQueens);
    }

    // distance metrics
    ({
      maxAvgDistance,
      pieceMaxAvgDist,
      minAvgDistance,
      pieceMinAvgDist,
      distPieceMaxDist,
      pieceMaxDistSingleGame,
      gamePieceMaxDist,
      totalCollectiveDistGames,
      gameMaxCollectiveDist,
    } = aggregateDistanceMetrics(
      analysis,
      maxAvgDistance,
      pieceMaxAvgDist,
      minAvgDistance,
      pieceMinAvgDist,
      distPieceMaxDist,
      pieceMaxDistSingleGame,
      gamePieceMaxDist,
      totalCollectiveDistGames,
      gameMaxCollectiveDist,
      totalDistByPiece,
      avgDistByPiece
    ));

    // moves metrics
    const thisGameMostMoves =
      analysis['GameWithMostMovesMetric']['gameWithMostMoves'];
    const thisGameMostMovesNumMoves =
      analysis['GameWithMostMovesMetric']['gameWithMostMovesNumMoves'];
    if (thisGameMostMovesNumMoves > gameMostMovesNumMoves) {
      gameMostMovesNumMoves = thisGameMostMovesNumMoves;
      gameMostMoves = [thisGameMostMoves];
    } else if (thisGameMostMovesNumMoves === gameMostMovesNumMoves) {
      gameMostMoves.push(thisGameMostMoves);
    }

    // piece level moves metrics
    const thisTotalMovesByPiece =
      analysis['PieceLevelMoveInfoMetric']['totalMovesByPiece'];
    for (const uas in thisTotalMovesByPiece) {
      if (!totalMovesByPiece[uas]) {
        totalMovesByPiece[uas] = {
          numMoves: thisTotalMovesByPiece[uas].numMoves,
        };
      }
      totalMovesByPiece[uas].numMoves += thisTotalMovesByPiece[uas].numMoves;
    }

    const thisSingleGameMaxMoves =
      analysis['PieceLevelMoveInfoMetric']['uasSingleGameMaxMoves'];
    const thisPieceSingleGameMaxMoves =
      analysis['PieceLevelMoveInfoMetric']['uasWithMostMovesSingleGame'];
    const thisGameSingleGameMaxMoves =
      analysis['PieceLevelMoveInfoMetric']['gamesWithUasMostMoves'];
    if (thisSingleGameMaxMoves > singleGameMaxMoves) {
      singleGameMaxMoves = thisSingleGameMaxMoves;
      pieceSingleGameMaxMoves = [thisPieceSingleGameMaxMoves as UASymbol];
      gameSingleGameMaxMoves = [thisGameSingleGameMaxMoves];
    } else if (thisSingleGameMaxMoves === singleGameMaxMoves) {
      pieceSingleGameMaxMoves.push(thisPieceSingleGameMaxMoves as UASymbol);
      gameSingleGameMaxMoves.push(thisGameSingleGameMaxMoves);
    }

    const thisGamesNoCastling =
      analysis['PieceLevelMoveInfoMetric']['gamesWithNoCastling'];
    gamesNoCastling += thisGamesNoCastling;

    const thisQueenKingCastlingCounts =
      analysis['PieceLevelMoveInfoMetric']['queenKingCastlingCounts'];
    for (const count in thisQueenKingCastlingCounts) {
      queenKingCastlingCounts[count] += thisQueenKingCastlingCounts[count];
    }

    // misc move fact metrics
    const thisEnPassantMovesCount =
      analysis['MiscMoveFactMetric']['enPassantMovesCount'];
    enPassantMovesCount += thisEnPassantMovesCount;

    const thisTotalNumPiecesKnightHopped =
      analysis['MiscMoveFactMetric']['totalNumPiecesKnightHopped'];
    totalNumPiecesKnightHopped += thisTotalNumPiecesKnightHopped;

    // final increments
    totalGamesAnalyzed += thisAnalysisGamesAnalyzed;
  }

  // AGGREGATE CALCULATIONS
  // ratings weighted average calculations
  const weightedAveragePlayerRating =
    weightedTotalPlayerRating / totalGamesAnalyzedForRatings;
  const weightedAverageRatingDiff =
    weightedTotalRatingDiff / totalGamesAnalyzedForRatings;

  // calculating KD Ratios and maxes for final maps
  for (const uas of Object.keys(KDMap)) {
    const kills = KDMap[uas].kills;
    const deaths = KDMap[uas].deaths || 0;
    if (deaths !== 0) {
      KDRatios[uas] = kills / deaths;
    }
  }
  for (const uas of Object.keys(KDValuesMap)) {
    const valueKills = KDValuesMap[uas].valueKills;
    const deaths = KDValuesMap[uas].deaths || 0;
    if (deaths !== 0) {
      KDRatiosValues[uas] = valueKills / deaths;
    }
  }
  for (const uas of Object.keys(KDRatios)) {
    if (KDRatios[uas] > maxKDRatio) {
      maxKDRatio = KDRatios[uas];
      pieceWithHighestKDRatio = [uas as UASymbol];
    } else if (KDRatios[uas] === maxKDRatio) {
      pieceWithHighestKDRatio.push(uas as UASymbol); // tie, add to the array
    }
  }
  for (const uas of Object.keys(KDRatiosValues)) {
    if (KDRatiosValues[uas] > maxKDRatioValues) {
      maxKDRatioValues = KDRatiosValues[uas];
      pieceWithHighestKDRatioValues = [uas as UASymbol];
    } else if (KDRatiosValues[uas] === maxKDRatio) {
      pieceWithHighestKDRatioValues.push(uas as UASymbol); // tie, add to the array
    }
  }

  // calculating averageNumMovesByPiece (without doing weighted averages) and related maxes
  for (const uas in totalMovesByPiece) {
    if (!averageNumMovesByPiece[uas]) {
      averageNumMovesByPiece[uas] = {
        avgNumMoves: totalMovesByPiece[uas].numMoves / totalGamesAnalyzed,
      };
    }
  }

  for (const uas in averageNumMovesByPiece) {
    if (averageNumMovesByPiece[uas].avgNumMoves > highestAverageMoves) {
      highestAverageMoves = averageNumMovesByPiece[uas].avgNumMoves;
      pieceHighestAverageMoves = [uas as UASymbol];
    } else if (
      averageNumMovesByPiece[uas].avgNumMoves === highestAverageMoves
    ) {
      pieceHighestAverageMoves.push(uas as UASymbol);
    }
  }

  // LOGS FOR THE ENTIRE SET
  // metadata logs
  console.log('GAME SET STATS (METADATA) ----------------------------');
  console.log(`Average Player Rating: ${weightedAveragePlayerRating}`);
  console.log(`Average Rating Difference: ${weightedAverageRatingDiff}`);
  console.log(`Largest Rating Difference: ${largestRatingDiff}`);
  console.log(`Largest Rating Difference Game(s): ${largestRatingDiffGame}`);
  console.log(
    `Player(s) with the most games played (CURRENTLY INACCURATELY TRACKED): ${playerMostGames}`
  );
  console.log(
    `Number of games played (CURRENTLY INACCURATELY TRACKED): ${mostGamesPlayedByPlayer}`
  );
  console.log('\n');
  console.log(`Game Type Stats: `), console.table(gameTypeStats);
  console.log(
    `Time Control Stats: (filtered by appearing in at least 1% of games):`
  );

  const sortedGameTimeControlStats = Object.entries(gameTimeControlStats).sort(
    ([, valueA], [, valueB]) => Number(valueB) - Number(valueA)
  );

  const filteredGameTimeControlStats = Object.fromEntries(
    sortedGameTimeControlStats.filter(
      ([_, value]) => (value as number) / totalGamesAnalyzed > 0.01
    )
  );

  console.table(filteredGameTimeControlStats);

  console.log(
    'Openings stats (filtered by appearing in at least 1% of games):'
  );

  const sortedOpenings = Object.entries(openings).sort(
    (
      [, dataA]: [string, { whiteToBlackWinRatio: number | null }],
      [, dataB]: [string, { whiteToBlackWinRatio: number | null }]
    ) => (dataB.whiteToBlackWinRatio || 0) - (dataA.whiteToBlackWinRatio || 0)
  );
  const filteredOpenings = Object.fromEntries(
    sortedOpenings.filter(
      ([_, data]: [
        string,
        {
          appearances: number;
          blackWins: number;
          whiteWins: number;
          ties: number;
          whiteToBlackWinRatio: number | null;
        }
      ]) => data.appearances / totalGamesAnalyzed > 0.01
    )
  );

  console.table(filteredOpenings);

  console.log(`Number of bongcloud appearances: ${bongcloudAppearances}`);
  console.log(`Game Endings: `), console.table(gameEndings);
  console.log('\n');

  // captures logs
  console.log('CAPTURES STATS: ----------------------------');
  console.log('Kills, deaths, and revenge kills for each unambiguous piece:'),
    console.table(KDMap);
  console.log(
    'Kill Death Ratios for each unambiguous piece: ' +
      JSON.stringify(KDRatios, null, 2)
  );
  console.log(
    `Piece with the highest KD ratio was ${pieceWithHighestKDRatio} with a ratio of ${maxKDRatio}`
  );

  console.log('\n');
  console.log(
    'Piece values for kills: Pawn 1 point, Knight 3 points, Bishop 3 points, Rook 5 points, Queen 9 points, King 4 points. '
  );
  console.log('Value kills and deaths for each unambiguous piece:'),
    console.table(KDValuesMap);
  console.log(
    'Kill Death Ratios for each unambiguous piece: ' +
      JSON.stringify(KDRatiosValues, null, 2)
  );
  console.log(
    `Piece with the highest KD ratio (taking into account piece values) was ${pieceWithHighestKDRatioValues} with a ratio of ${maxKDRatioValues}`
  );

  console.log('\n');
  console.log('Max Kill Streaks achieved for each piece: ');
  console.table(KillStreakMap);
  console.log(
    `Max Kill Streak achieved by any piece (the number of captures without any other piece on its team capturing. doesn't have to be consecutive move captures): ${maxKillStreak} by the piece(s) ${maxKillStreakPiece}. This was done in the game(s): `
  );
  console.log(maxKillStreakGame.join('\n'));

  // mates and assists logs
  console.log('\n');
  console.log('MATES AND ASSISTS STATS: ----------------------------');
  console.log('Mates, assists, and hockey assists for each piece: ');
  console.table(mateAndAssistMap);
  console.log(
    'Note: any "mates" attributed to kings are a result of a king moving to reveal a discovered mate.'
  );
  console.log('Number of times each king was mated: ');
  console.table(matedCountsMap);

  // promotions logs
  console.log('\n');
  console.log('PROMOTIONS STATS: ----------------------------');
  console.log('Pieces promoted to most often: ');
  console.table(promotedToTotals);
  console.log('The pieces each unambiguous piece promotes to most often: ');
  console.table(uasPromotingPieces);
  console.log(
    `The maximum number of queens to appear in a given move in a game: ${maxNumQueens}`
  );
  console.log(`The games(s) and first move(s) in that game in which that number of queens appeared: 
    ${movesAndGamesMaxQueens
      .map((move) => JSON.stringify(move, null, 2))
      .join(', ')}`);

  // distance logs
  console.log('\n');
  console.log('DISTANCE STATS: ----------------------------');
  console.log(
    `Piece(s) with highest average distance: ${pieceMaxAvgDist}. That/those piece(s) average distance: ${maxAvgDistance}`
  );
  console.log(
    `Piece(s) with lowest average distance: ${pieceMinAvgDist}. That/those piece(s) average distance: ${minAvgDistance}`
  );
  console.log(
    `Piece that covered the most ground in a single game: ${pieceMaxDistSingleGame}. Distance covered: ${distPieceMaxDist}. Game in which that distance was covered by that piece: ${gamePieceMaxDist}.`
  );
  console.log(
    `Total collective distance of all pieces in games analyzed: ${totalCollectiveDistGames}`
  );
  console.log(
    `Game(s) with the furthest collective distance moved: ${gameMaxCollectiveDist.games}`
  );
  console.log(`Distance moved: ${gameMaxCollectiveDist.distance}`);
  console.log(`Total distance moved by piece:`);
  console.table(totalDistByPiece);
  console.log(`Average distance moved by piece:`);
  console.table(avgDistByPiece);

  //
  console.log('\n');
  console.log('MOVES STATS: ----------------------------');
  console.log(
    `Game(s) with most moves made (1 move = one white or one black move): ${gameMostMoves}`
  );
  console.log(`Number of moves made: ${gameMostMovesNumMoves}`);
  console.log('Total number of moves made by each piece: ');
  console.table(totalMovesByPiece);
  console.log('Average number of moves made by each piece: ');
  console.table(averageNumMovesByPiece);
  console.log(
    `Piece(s) with the highest average number of moves: ${pieceHighestAverageMoves}. The average number of moves that/those pieces made per game: ${highestAverageMoves}`
  );
  console.log(
    `The piece with the most moves played in a single game: ${pieceSingleGameMaxMoves}. The number of moves played in that game: ${singleGameMaxMoves}. The game it played that number of moves in: ${gameSingleGameMaxMoves}`
  );
  console.log(`The number of games with no castling: ${gamesNoCastling}`);
  console.log('The number of times each kind of castling happened: ');
  console.table(queenKingCastlingCounts);
  console.log(`The number of En passants that occured: ${enPassantMovesCount}`);
  console.log(
    `The number of pieces that were hopped over by a knight: ${totalNumPiecesKnightHopped}`
  );

  // final analysis logs
  console.log('\n');
  console.log('ANALYSIS STATS: ----------------------------');
  console.log(`Total games analyzed: ${totalGamesAnalyzed}`);
  console.log(`Number of separate analyses: ${analysisCounter}`);
}

console.time('Total Final Analysis Execution Time');
aggregateResults('src/results.json');
console.timeEnd('Total Final Analysis Execution Time');

function aggregateDistanceMetrics(
  analysis: unknown,
  maxAvgDistance: number,
  pieceMaxAvgDist: any[],
  minAvgDistance: number,
  pieceMinAvgDist: any[],
  distPieceMaxDist: number,
  pieceMaxDistSingleGame: any[],
  gamePieceMaxDist: any[],
  totalCollectiveDistGames: number,
  gameMaxCollectiveDist: { distance: number; games: any[] },
  totalDistByPiece: {},
  avgDistByPiece: {}
) {
  const thisMaxAvgDistance = analysis['MoveDistanceMetric']['maxAvgDistance'];
  const thisPieceMaxAvgDistance =
    analysis['MoveDistanceMetric']['pieceWithHighestAvg'];
  if (thisMaxAvgDistance > maxAvgDistance) {
    maxAvgDistance = thisMaxAvgDistance;
    pieceMaxAvgDist = thisPieceMaxAvgDistance;
  } else if (thisMaxAvgDistance === maxAvgDistance) {
    pieceMaxAvgDist.push(thisPieceMaxAvgDistance);
  }

  const thisMinAvgDistance = analysis['MoveDistanceMetric']['minAvgDistance'];
  const thisPieceMinAvgDistance =
    analysis['MoveDistanceMetric']['pieceWithLowestAvg'];
  if (thisMinAvgDistance < minAvgDistance) {
    minAvgDistance = thisMinAvgDistance;
    pieceMinAvgDist = thisPieceMinAvgDistance;
  } else if (thisMinAvgDistance === minAvgDistance) {
    pieceMinAvgDist.push(thisPieceMinAvgDistance);
  }

  const thisDistPieceMaxDist =
    analysis['MoveDistanceMetric']['distanceThatPieceMovedInTheGame'];
  const thisPieceMaxDistSingleGame =
    analysis['MoveDistanceMetric']['pieceThatMovedTheFurthest'];
  const thisGamePieceMaxDist =
    analysis['MoveDistanceMetric']['gameInWhichPieceMovedTheFurthest'];
  if (thisDistPieceMaxDist > distPieceMaxDist) {
    distPieceMaxDist = thisDistPieceMaxDist;
    pieceMaxDistSingleGame = thisPieceMaxDistSingleGame;
    gamePieceMaxDist = thisGamePieceMaxDist;
  } else if (thisDistPieceMaxDist === distPieceMaxDist) {
    pieceMaxDistSingleGame.push(thisPieceMaxDistSingleGame);
    gamePieceMaxDist.push(thisGamePieceMaxDist);
  }

  const thisTotalCollectiveDistance =
    analysis['MoveDistanceMetric']['totalCollectiveDistance'];
  totalCollectiveDistGames += thisTotalCollectiveDistance;

  const thisGameMaxCollectiveDistance =
    analysis['MoveDistanceMetric']['gameMaxCollectiveDistance'];
  if (thisGameMaxCollectiveDistance.distance > gameMaxCollectiveDist.distance) {
    gameMaxCollectiveDist = {
      distance: thisGameMaxCollectiveDistance.distance,
      games: [thisGameMaxCollectiveDistance.linkArray],
    };
  } else if (
    thisGameMaxCollectiveDistance.distance === gameMaxCollectiveDist.distance
  ) {
    gameMaxCollectiveDist.games.push(thisGameMaxCollectiveDistance.linkArray);
  }

  const thisTotalDistByPiece =
    analysis['MoveDistanceMetric']['totalDistancesByPiece'];
  for (const uas in thisTotalDistByPiece) {
    if (!totalDistByPiece[uas]) {
      totalDistByPiece[uas] = {
        distance: thisTotalDistByPiece[uas].distance,
      };
    }
    totalDistByPiece[uas].distance += thisTotalDistByPiece[uas].distance;
  }

  const thisAvgDistByPiece =
    analysis['MoveDistanceMetric']['avgDistancesByPiece'];
  for (const uas in thisAvgDistByPiece) {
    if (!avgDistByPiece[uas]) {
      avgDistByPiece[uas] = {
        avgDistance: thisAvgDistByPiece[uas].avgDistance,
      };
    }
    avgDistByPiece[uas].avgDistance += thisAvgDistByPiece[uas].avgDistance;
  }
  return {
    maxAvgDistance,
    pieceMaxAvgDist,
    minAvgDistance,
    pieceMinAvgDist,
    distPieceMaxDist,
    pieceMaxDistSingleGame,
    gamePieceMaxDist,
    totalCollectiveDistGames,
    gameMaxCollectiveDist,
  };
}

function aggregateKillStreaks(
  analysis: unknown,
  KillStreakMap: {},
  maxKillStreak: number,
  maxKillStreakPiece: any[],
  maxKillStreakGame: any[]
) {
  const thisKillStreakMap = analysis['KillStreakMetric']['killStreakMap'];
  const thisMaxKillStreak = analysis['KillStreakMetric']['maxKillStreak'];
  const thisMaxKillStreakPiece =
    analysis['KillStreakMetric']['maxKillStreakPiece'];
  const thisMaxKillStreakGame =
    analysis['KillStreakMetric']['maxKillStreakGame'];
  for (const uas in thisKillStreakMap) {
    if (!KillStreakMap[uas]) {
      KillStreakMap[uas] = 0;
    }
    if (thisKillStreakMap[uas].killStreaks > KillStreakMap[uas]) {
      KillStreakMap[uas] = thisKillStreakMap[uas].killStreaks;
    }
  }

  // find maxes
  if (thisMaxKillStreak > maxKillStreak) {
    maxKillStreak = thisMaxKillStreak;
    maxKillStreakPiece = thisMaxKillStreakPiece;
    maxKillStreakGame = thisMaxKillStreakGame;
  } else if (thisMaxKillStreak === maxKillStreak) {
    maxKillStreakPiece.push(thisMaxKillStreakPiece);
    maxKillStreakGame.push(thisMaxKillStreakGame);
  }
  return { maxKillStreak, maxKillStreakPiece, maxKillStreakGame };
}

function aggregateKDRatio(analysis: unknown, KDMap: {}, KDValuesMap: {}) {
  const thisKDMap = analysis['KDRatioMetric']['KDMap'];
  const thisKDValuesMap = analysis['KDRatioMetric']['KDValuesMap'];

  for (const uas in thisKDMap) {
    if (!KDMap[uas]) {
      KDMap[uas] = {
        kills: 0,
        deaths: 0,
        revengeKills: 0,
      };
    }
    if (!KDValuesMap[uas]) {
      KDValuesMap[uas] = {
        valueKills: 0,
        deaths: 0,
      };
    }
    KDMap[uas].kills += thisKDMap[uas].kills;
    KDMap[uas].deaths += thisKDMap[uas].deaths;
    KDMap[uas].revengeKills += thisKDMap[uas].revengeKills;
    KDValuesMap[uas].valueKills += thisKDValuesMap[uas].valueKills;
    KDValuesMap[uas].deaths += thisKDValuesMap[uas].deaths;
  }
}

function aggregateEndingStats(analysis: unknown, gameEndings: {}) {
  const thisGameEndingsStats = analysis['MetadataMetric']['gameEndings'];
  for (const ending in thisGameEndingsStats) {
    if (!gameEndings[ending]) {
      gameEndings[ending] = 0;
    }
    gameEndings[ending] += thisGameEndingsStats[ending];
  }
}

function aggregateOpeningStats(
  analysis: unknown,
  openings: {},
  bongcloudAppearances: number
) {
  const thisOpenings = analysis['MetadataMetric']['openings'];
  for (const opening in thisOpenings) {
    if (!openings[opening]) {
      openings[opening] = {
        appearances: 0,
        blackWins: 0,
        whiteWins: 0,
        ties: 0,
        whiteToBlackWinRatio: 0,
      };
    }
    openings[opening].appearances += thisOpenings[opening].appearances;
    openings[opening].blackWins += thisOpenings[opening].blackWins;
    openings[opening].whiteWins += thisOpenings[opening].whiteWins;
    openings[opening].ties += thisOpenings[opening].ties;
    // ratio accounting for ties
    openings[opening].whiteToBlackWinRatio =
      (openings[opening].whiteWins + openings[opening].ties) /
      (openings[opening].blackWins + openings[opening].ties);
  }

  bongcloudAppearances += analysis['MetadataMetric']['bongcloudAppearances'];
  return bongcloudAppearances;
}

function aggregateGameTimeControlStats(
  analysis: unknown,
  gameTimeControlStats: {}
) {
  const thisGameTimeControlStats =
    analysis['MetadataMetric']['gameTimeControlStats'];
  for (const timeControl in thisGameTimeControlStats) {
    if (!gameTimeControlStats[timeControl]) {
      gameTimeControlStats[timeControl] = 0;
    }
    gameTimeControlStats[timeControl] += thisGameTimeControlStats[timeControl];
  }
}

function aggregateMetadata(
  analysis: unknown,
  weightedTotalPlayerRating: number,
  weightedTotalRatingDiff: number,
  totalGamesAnalyzedForRatings: number
) {
  const thisGamesAnalyzedForRatings =
    analysis['MetadataMetric']['numberGamesAnalyzedForRatings'];

  const averagePlayerRating = analysis['MetadataMetric']['averagePlayerRating'];
  weightedTotalPlayerRating +=
    averagePlayerRating * thisGamesAnalyzedForRatings;

  const averageRatingDiff = analysis['MetadataMetric']['averageRatingDiff'];
  weightedTotalRatingDiff += averageRatingDiff * thisGamesAnalyzedForRatings;

  totalGamesAnalyzedForRatings += thisGamesAnalyzedForRatings;
  return {
    weightedTotalPlayerRating,
    weightedTotalRatingDiff,
    totalGamesAnalyzedForRatings,
  };
}

function aggregatePromotions(
  analysis: unknown,
  promotedToTotals: { q: number; r: number; b: number; n: number },
  uasPromotingPieces: {}
) {
  const thisPromotedToTotals = analysis['PromotionMetric']['promotedToTotals'];
  promotedToTotals.q += thisPromotedToTotals.q;
  promotedToTotals.r += thisPromotedToTotals.r;
  promotedToTotals.b += thisPromotedToTotals.b;
  promotedToTotals.n += thisPromotedToTotals.n;

  const thisUASPromotiongPieces =
    analysis['PromotionMetric']['uasPromotingPieces'];
  for (const uas in thisUASPromotiongPieces) {
    if (!uasPromotingPieces[uas]) {
      uasPromotingPieces[uas] = {
        q: 0,
        r: 0,
        b: 0,
        n: 0,
      };
    }
    uasPromotingPieces[uas].q += thisUASPromotiongPieces[uas].q;
    uasPromotingPieces[uas].r += thisUASPromotiongPieces[uas].r;
    uasPromotingPieces[uas].b += thisUASPromotiongPieces[uas].b;
    uasPromotingPieces[uas].n += thisUASPromotiongPieces[uas].n;
  }
  const thisMaxNumQueens = analysis['PromotionMetric']['maxNumQueens'];
  const thisMovesAndGamesMaxQueens =
    analysis['PromotionMetric']['movesAndGamesWithMaxQueenCount'];
  return { thisMaxNumQueens, thisMovesAndGamesMaxQueens };
}

function aggregateMatesAndAssists(
  analysis: unknown,
  mateAndAssistMap: {},
  matedCountsMap: { k: number; K: number }
) {
  const thisMateAndAssistMap =
    analysis['MateAndAssistMetric']['mateAndAssistMap'];
  for (const uas in thisMateAndAssistMap) {
    if (!mateAndAssistMap[uas]) {
      mateAndAssistMap[uas] = {
        mates: 0,
        assists: 0,
        hockeyAssists: 0,
      };
    }
    mateAndAssistMap[uas].mates += thisMateAndAssistMap[uas].mates;
    mateAndAssistMap[uas].assists += thisMateAndAssistMap[uas].assists;
    mateAndAssistMap[uas].hockeyAssists +=
      thisMateAndAssistMap[uas].hockeyAssists;
  }

  const thisMatedCountsMap = analysis['MateAndAssistMetric']['matedCounts'];
  matedCountsMap.k += thisMatedCountsMap.k;
  matedCountsMap.K += thisMatedCountsMap.K;
}

function aggregateGameTypeStats(analysis: unknown, gameTypeStats: {}) {
  const thisGameTypeStats = analysis['MetadataMetric']['gameTypeStats'];
  for (const gameType in thisGameTypeStats) {
    if (!gameTypeStats[gameType]) {
      gameTypeStats[gameType] = 0;
    }
    gameTypeStats[gameType] += thisGameTypeStats[gameType];
  }
}
// async function processAndAggregate() {
//   await processFiles();  // This will wait until processFiles() is done
//   await aggregateResults('src/results.json');
//   console.log('Final analysis complete.')
// }

// processAndAggregate();

// export default aggregateResults;
