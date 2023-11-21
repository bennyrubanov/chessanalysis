import * as fs from 'fs';
import * as util from 'util';
import {
  ALL_SQUARES,
  Piece,
  PrettyMove,
  Square,
  UASymbol,
} from '../cjsmin/src/chess';
// const processFiles = require('./streaming_partial_decompresser.js');

const readFile = util.promisify(fs.readFile);

/**
 *
 * @param results.json
 * @returns final analysis results of all files created and deleted in streaming_partial_decompresser
 */
async function aggregateResults(filePath: string) {
  const data = JSON.parse(await readFile(filePath, 'utf-8'));

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
  let KDRatiosValues = {}
  let maxKDRatio = 0;
  let maxKDRatioValues = 0;
  let pieceWithHighestKDRatio = [];
  let pieceWithHighestKDRatioValues = [];
  let KillStreakMap = {};
  
  // helper variables
  let weightedTotalPlayerRating = 0;
  let weightedTotalRatingDiff = 0;


  for (const analysis of Object.values(data)) {
    analysisCounter++;

    const thisAnalysisGamesAnalyzed = analysis['Number of games analyzed'];

    // METADATA METRICS
    // ratings weighted average calculations
    const thisGamesAnalyzedForRatings = analysis['MetadataMetric']['numberGamesAnalyzedForRatings'];

    const averagePlayerRating = analysis['MetadataMetric']['averagePlayerRating'];
    weightedTotalPlayerRating += averagePlayerRating * thisGamesAnalyzedForRatings;

    const averageRatingDiff = analysis['MetadataMetric']['averageRatingDiff'];
    weightedTotalRatingDiff += averageRatingDiff * thisGamesAnalyzedForRatings;

    totalGamesAnalyzedForRatings += thisGamesAnalyzedForRatings;

    // ratings largest diff
    const thisLargestRatingDiff = analysis['MetadataMetric']['largestRatingDiff'];
    const thisLargestRatingDiffGame = analysis['MetadataMetric']['largestRatingDiffGame'];
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
    const thisGameTypeStats = analysis['MetadataMetric']['gameTypeStats'];
    for (const gameType in thisGameTypeStats) {
      if (!gameTypeStats[gameType]) {
        gameTypeStats[gameType] = 0;
      }
      gameTypeStats[gameType] += thisGameTypeStats[gameType];
    }

    // aggregate gameTimeControlStats
    const thisGameTimeControlStats = analysis['MetadataMetric']['gameTimeControlStats'];
    for (const timeControl in thisGameTimeControlStats) {
      if (!gameTimeControlStats[timeControl]) {
        gameTimeControlStats[timeControl] = 0;
      }
      gameTimeControlStats[timeControl] += thisGameTimeControlStats[timeControl];
    }

    // aggregate openings stats
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
      openings[opening].whiteToBlackWinRatio = (openings[opening].whiteWins + openings[opening].ties) / (openings[opening].blackWins + openings[opening].ties);
    }

    bongcloudAppearances += analysis['MetadataMetric']['bongcloudAppearances'];
    
    // aggregate game endings stats
    const thisGameEndingsStats = analysis['MetadataMetric']['gameEndings'];
    for (const ending in thisGameEndingsStats) {
      if (!gameEndings[ending]) {
        gameEndings[ending] = 0;
      }
      gameEndings[ending] += thisGameEndingsStats[ending];
    }

    // KD AND CAPTURE METRICS
    // KD Ratios
    // Recalculating KD Ratios across all the analyses (alternatively could do weighted averages)
    const thisKDMap = analysis['KDRatioMetric']['KDMap']
    const thisKDValuesMap = analysis['KDRatioMetric']['KDValuesMap']

    for (const uas in thisKDMap) {
      if (!KDMap[uas]) {
        KDMap[uas] = {
          kills: 0,
          deaths: 0,
          revengeKills: 0
        };
      }
      if (!KDValuesMap[uas]) {
        KDValuesMap[uas] = {
          valueKills: 0,
          deaths: 0
        };
      }
      KDMap[uas].kills += thisKDMap[uas].kills;
      KDMap[uas].deaths += thisKDMap[uas].deaths;
      KDMap[uas].revengeKills += thisKDMap[uas].revengeKills;
      KDValuesMap[uas].valueKills += thisKDValuesMap[uas].valueKills;
      KDValuesMap[uas].deaths += thisKDValuesMap[uas].deaths;
    }

    // kill streaks
    const thisKillStreakMap = analysis['Kd']

    // final increments
    totalGamesAnalyzed += thisAnalysisGamesAnalyzed;
  }

  // ratings weighted average calculations
  const weightedAveragePlayerRating = weightedTotalPlayerRating / totalGamesAnalyzedForRatings;
  const weightedAverageRatingDiff = weightedTotalRatingDiff / totalGamesAnalyzedForRatings

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


  // LOGS FOR THE ENTIRE SET
  // metadata logs
  console.log('GAME SET STATS (METADATA) ----------------------------');
  console.log(`Average Player Rating: ${weightedAveragePlayerRating}`);
  console.log(`Average Rating Difference: ${weightedAverageRatingDiff}`);
  console.log(`Largest Rating Difference: ${largestRatingDiff}`);
  console.log(`Largest Rating Difference Game(s): ${largestRatingDiffGame}`);
  console.log(`Player(s) with the most games played (CURRENTLY INACCURATELY TRACKED): ${playerMostGames}`);
  console.log(`Number of games played (CURRENTLY INACCURATELY TRACKED): ${mostGamesPlayedByPlayer}`);
  console.log('\n');
  console.log(`Game Type Stats: `),
  console.table(gameTypeStats);
  console.log(`Time Control Stats: (filtered by appearing in at least 1% of games):`);

  const sortedGameTimeControlStats = Object.entries(gameTimeControlStats)
  .sort(([, valueA], [, valueB]) => Number(valueB) - Number(valueA));

  const filteredGameTimeControlStats = Object.fromEntries(
    sortedGameTimeControlStats
      .filter(([_, value]) => (value as number) / totalGamesAnalyzed > 0.01)
  );

  console.table(filteredGameTimeControlStats);

  console.log('Openings stats (filtered by appearing in at least 1% of games):');

  const sortedOpenings = Object.entries(openings)
  .sort(([, dataA]: [string, { whiteToBlackWinRatio: number | null; }], [, dataB]: [string, { whiteToBlackWinRatio: number | null; }]) => 
    (dataB.whiteToBlackWinRatio || 0) - (dataA.whiteToBlackWinRatio || 0)
  );
  const filteredOpenings = Object.fromEntries(
    sortedOpenings
      .filter(([_, data]: [string, { appearances: number; blackWins: number; whiteWins: number; ties: number; whiteToBlackWinRatio: number | null; }]) => data.appearances / totalGamesAnalyzed > 0.01)
  );

  console.table(filteredOpenings);

  console.log(`Number of bongcloud appearances: ${bongcloudAppearances}`);
  console.log(`Game Endings: `),
  console.table(gameEndings);
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
  console.log("Piece values for kills: Pawn 1 point, Knight 3 points, Bishop 3 points, Rook 5 points, Queen 9 points, King 4 points. ")
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

  // final analysis logs
  console.log('\n');
  console.log('ANALYSIS STATS: ----------------------------')
  console.log(`Total games analyzed: ${totalGamesAnalyzed}`);
  console.log(`Number of separate analyses: ${analysisCounter}`)
}

console.time('Total Final Analysis Execution Time');
aggregateResults('src/results.json');
console.timeEnd('Total Final Analysis Execution Time');


// async function processAndAggregate() {
//   await processFiles();  // This will wait until processFiles() is done
//   await aggregateResults('src/results.json');
//   console.log('Final analysis complete.')
// }

// processAndAggregate();

// export default aggregateResults;