import { Piece, PrettyMove } from '../../cjsmin/src/chess';
import { Metric } from './metric';

// calculates how many games in the dataset
export function countGamesInDataset(datasetPath: string): number {
  const fs = require('fs');
  const path = require('path');

  let data = fs.readFileSync(
    path.join(__dirname, '../data/10.10.23_test_set'),
    'utf8'
  );
  let games = data.split('\n[Event');
  // If the first game doesn't start with a newline, add 1 back to the count
  if (data.startsWith('[Event')) {
    console.log(`Number of games: ${games.length}`);
    return games.length;
  } else {
    console.log(`Number of games: ${games.length - 1}`); // Subtract 1 because the first split item will be an empty string
    return games.length - 1;
  }
}

export class MetadataMetric implements Metric {
  // priority stats
  numberGamesAnalyzed: number;
  averagePlayerRating: number;
  averageRatingDiff: number;
  largestRatingDiff: number;
  largestRatingDiffGame: string;
  mostGamesPlayed: number;
  playerMostGames: string;
  blackWins: number;
  whiteWins: number;
  ties: number;
  openings: 
  { [opening: string]: 
    { appearances: number, 
      blackWins: number, 
      whiteWins: number, 
      ties: number,
      whiteToBlackWinRatio: number }
  };
  bongcloud: number;

  gameTypeStats: {
    numberUltraBulletGames: number;
    numberBulletGames: number;
    numberBlitzGames: number;
    numberRapidGames: number;
    numberClassicalGames: number;
    numberOtherGames: number;
  };
  gameTimeControlStats: {
    [timeControl: string]: number;
  };

  // helping variables
  totalPlayerRating: number;
  totalPlayerRatingDiff: number;
  playerGameStats: {
    [player: string]: number;
  };

  constructor() {
    this.clear();
  }

  logResults?(): void {
    // Dataset Facts
    console.log('Dataset Facts:');
    console.log(`Number of games analyzed: ${this.numberGamesAnalyzed}`);
    console.log(`Average player rating: ${this.averagePlayerRating}`);
    console.log(
      `Average player rating differential: ${this.averageRatingDiff}`
    );
    console.log(
      `Largest player rating differential: ${this.largestRatingDiff}`
    );
    console.log(
      `Game with largest player rating differential: ${this.largestRatingDiffGame}`
    );
    console.log(
      `Most games played by a single player in the dataset: ${this.mostGamesPlayed}`
    );
    console.log(`Player with most games played: ${this.playerMostGames}`);
    console.log('Number of games played by time control type: '),
      console.table(this.gameTypeStats);
    console.log('Number of games played by time control quantity: '),
      console.table(this.gameTimeControlStats);
    console.log('Openings by number of times they appear and their win rates: '),
      console.table(this.openings);
    console.log('Number of times bongcloud appeared: ', this.bongcloud)
  }

  // Reset the maps used to track metrics
  clear(): void {
    this.numberGamesAnalyzed = 0;
    this.averagePlayerRating = 0;
    this.averageRatingDiff = 0;
    this.largestRatingDiff = 0;
    this.largestRatingDiffGame = '';
    this.mostGamesPlayed = 0;
    this.playerMostGames = '';
    this.gameTypeStats = {
      numberUltraBulletGames: 0,
      numberBulletGames: 0,
      numberBlitzGames: 0,
      numberRapidGames: 0,
      numberClassicalGames: 0,
      numberOtherGames: 0,
    };
    this.gameTimeControlStats = {};
    this.openings = {};
    this.bongcloud = 0;

    // helping variables
    this.totalPlayerRating = 0;
    this.totalPlayerRatingDiff = 0;
    this.playerGameStats = {};
  }

  processGame(
    game: { move: PrettyMove; board: Piece[] }[],
    metadata?: string[]
  ) {
    // Update the gameTimeControlStats based on the time control of the game
    const timeControl = metadata?.find((data) =>
      data.startsWith('[TimeControl')
    );
    if (timeControl) {
      const timeControlQuantity = timeControl.split(' ')[1];
      if (this.gameTimeControlStats[timeControlQuantity]) {
        this.gameTimeControlStats[timeControlQuantity]++;
      } else {
        this.gameTimeControlStats[timeControlQuantity] = 1;
      }
    }

    // Identify the time control type from the metadata and updatae gameTypeStats
    const gameType = metadata?.find((data) => data.startsWith('[Event'));
    if (gameType) {
      if (gameType.includes('UltraBullet')) {
        this.gameTypeStats.numberUltraBulletGames++;
      } else if (gameType.includes('Bullet')) {
        this.gameTypeStats.numberBulletGames++;
      } else if (gameType.includes('Blitz')) {
        this.gameTypeStats.numberBlitzGames++;
      } else if (gameType.includes('Rapid')) {
        this.gameTypeStats.numberRapidGames++;
      } else if (gameType.includes('Classical')) {
        this.gameTypeStats.numberClassicalGames++;
      } else {
        this.gameTypeStats.numberOtherGames++;
      }
    }

    // Calculate average player rating (first, find the totalPlayerRating)
    const whiteRating = parseInt(
      metadata
        ?.find((data) => data.startsWith('[WhiteElo'))
        ?.replace(/"/g, '')
        .split(' ')[1]
    );
    const blackRating = parseInt(
      metadata
        ?.find((data) => data.startsWith('[BlackElo'))
        ?.replace(/"/g, '')
        .split(' ')[1]
    );
    this.totalPlayerRating += whiteRating + blackRating;

    // Calculate the player rating diffs
    const ratingDiff = Math.abs(whiteRating - blackRating);
    this.totalPlayerRatingDiff += ratingDiff;

    // Check if this game has the largest rating differential
    if (ratingDiff > this.largestRatingDiff) {
      this.largestRatingDiff = ratingDiff;
      this.largestRatingDiffGame =
        metadata?.find((data) => data.startsWith('[Site')) || '';
    }

    // helping variables to identify the player with the most games played in the data set
    // populate playerGameStats with the number of games each player has played (regardless if they played black or white)
    const whitePlayer = metadata?.find((data) => data.startsWith('[White'));
    const blackPlayer = metadata?.find((data) => data.startsWith('[Black'));
    const whiteUsername = whitePlayer?.split('"')[1];
    const blackUsername = blackPlayer?.split('"')[1];

    if (whiteUsername) {
      this.playerGameStats[whiteUsername] =
        (this.playerGameStats[whiteUsername] || 0) + 1;
    }
    if (blackUsername) {
      this.playerGameStats[blackUsername] =
        (this.playerGameStats[blackUsername] || 0) + 1;
    }

    // black vs white wins
    let result = metadata.find(item => item.startsWith('[Result'));

    if (result === '[Result "1-0"]') {
      this.whiteWins++;
    } else if (result === '[Result "0-1"]') {
      this.blackWins++;
    } else if (result === '[Result "1/2-1/2"]') {
      this.ties++;
    } else {
      throw new Error('Invalid result');
    }

    // extract openings from metadata
    const opening = metadata?.find((item) => item.startsWith('[Opening "'))
    ?.replace('[Opening "', '')
    ?.replace('"]', '');

    if (opening.toLowerCase() == "bongcloud") {
      this.bongcloud++;
    }

    // add opening to openings object
    if (this.openings[opening]) {
      this.openings[opening].appearances++;
      if (result === '[Result "1-0"]') {
        this.openings[opening].whiteWins++;
      } else if (result === '[Result "0-1"]') {
        this.openings[opening].blackWins++;
      } else if (result === '[Result "1/2-1/2"]') {
        this.openings[opening].whiteWins += 0.5;
        this.openings[opening].blackWins += 0.5;
        this.openings[opening].ties++;
      }
      this.openings[opening].whiteToBlackWinRatio = this.openings[opening].whiteWins / this.openings[opening].blackWins;
    } else {
      this.openings[opening] = {
        appearances: 1,
        blackWins: result === '[Result "0-1"]' ? 1 : (result === '[Result "1/2-1/2"]' ? 0.5 : 0),
        whiteWins: result === '[Result "1-0"]' ? 1 : (result === '[Result "1/2-1/2"]' ? 0.5 : 0),
        ties: result === '[Result "1/2-1/2"]' ? 1 : 0,
        whiteToBlackWinRatio: result === '[Result "1-0"]' ? 1 : 0,
      };
    }

    // Increment the number of games analyzed
    this.numberGamesAnalyzed++;
  }

  // Aggregate the results of the metric
  aggregate() {
    // Calculate the average player rating after each game
    // 2 players per game, so need to divide by two given that the totalPlayerRating adds all ratings up from both players
    this.averagePlayerRating =
      this.totalPlayerRating / (this.numberGamesAnalyzed * 2);

    // Calculate the average player rating diff
    this.averageRatingDiff =
      this.totalPlayerRatingDiff / this.numberGamesAnalyzed;

    // Calculate the player with the most games played
    let maxGames = 0;
    let playerMostGames = '';
    for (const player in this.playerGameStats) {
      if (this.playerGameStats[player] > maxGames) {
        maxGames = this.playerGameStats[player];
        playerMostGames = player;
      }
    }
    this.mostGamesPlayed = maxGames;
    this.playerMostGames = playerMostGames;

    // sort gameTypeStats from greatest to least by number of times they appear
    const sortedGameTypeStats = Object.entries(this.gameTypeStats).sort((a, b) => b[1] - a[1]);
    const sortedGameTypeStatsObj = Object.fromEntries(sortedGameTypeStats);
    this.gameTypeStats = sortedGameTypeStatsObj as {
      numberUltraBulletGames: number;
      numberBulletGames: number;
      numberBlitzGames: number;
      numberRapidGames: number;
      numberClassicalGames: number;
      numberOtherGames: number;
    };
    
    // sort gameTimeControlStats from greatest to least by number of times they appear
    const sortedGameTimeControlStats = Object.entries(this.gameTimeControlStats).sort((a, b) => b[1] - a[1]);
    const sortedGameTimeControlStatsObj = Object.fromEntries(sortedGameTimeControlStats);
    this.gameTimeControlStats = sortedGameTimeControlStatsObj;

    // sort the openings from greatest to least by number of times they appear
    const sortedOpenings = Object.entries(this.openings).sort((a, b) => b[1].appearances - a[1].appearances);
    const sortedOpeningsObj = Object.fromEntries(sortedOpenings);
    this.openings = sortedOpeningsObj;

    return {
      averagePlayerRating: this.averagePlayerRating,
      averageRatingDiff: this.averageRatingDiff,
      mostGamesPlayed: maxGames,
      playerMostGames,
      // This doesn't account for ties
      whiteWinRatio: this.whiteWins / (this.whiteWins + this.blackWins),
      sortedOpeningsObj,
    };
  }
}
