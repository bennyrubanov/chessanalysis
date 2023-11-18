import { Piece, PrettyMove, Chess} from '../../cjsmin/src/chess';
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
  chess: Chess;
  numberGamesAnalyzed: number;
  averagePlayerRating: number;
  averageRatingDiff: number;
  largestRatingDiff: number;
  largestRatingDiffGame: string[];
  mostGamesPlayed: number;
  playerMostGames: string[];
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
  gameEndings: {
    [gameEnding: string]: number;
  };

  // helping variables
  totalPlayerRating: number;
  totalPlayerRatingDiff: number;
  playerGameStats: {
    [player: string]: number;
  };
  numberGamesAnalyzedForRatings: number; // some games have missing rating data, so will decrement this number when calculating average ratings when ratings are missing

  constructor(chess) {
    this.clear();
    this.chess = chess;
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

    // only log gameTimeControlStats and openings tables if the object as appeared more than 5% of the total games analyzed (otherwise the tables are massive)
    // Number of games played by time control type
    console.log('Number of games played by time control type:');
    const filteredTimeControlStats = Object.fromEntries(
      Object.entries(this.gameTimeControlStats)
        .filter(([_, count]) => count / this.numberGamesAnalyzed > 0.05)
    );
    console.table(filteredTimeControlStats);
  
    // Openings by number of times they appear and their win rates
    console.log('Openings by number of times they appear and their win rates:');
    const filteredOpenings = Object.fromEntries(
      Object.entries(this.openings)
        .filter(([_, data]) => data.appearances / this.numberGamesAnalyzed > 0.05)
    );
    console.table(filteredOpenings);

    // console.log('Number of games played by time control quantity: '),
    // console.table(this.gameTimeControlStats);
    // console.log('Openings by number of times they appear and their win rates: '),
    // console.table(this.openings);

    console.log('Number of times bongcloud appeared: ', this.bongcloud)
    console.log('\n')

    console.log('Game Endings: '),
      console.table(this.gameEndings);
  }

  // Reset the maps used to track metrics
  clear(): void {
    this.numberGamesAnalyzed = 0;
    this.averagePlayerRating = 0;
    this.averageRatingDiff = 0;
    this.largestRatingDiff = 0;
    this.largestRatingDiffGame = [];
    this.mostGamesPlayed = 0;
    this.playerMostGames = [];
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
    this.gameEndings = {};

    // helping variables
    this.totalPlayerRating = 0;
    this.totalPlayerRatingDiff = 0;
    this.playerGameStats = {};
    this.numberGamesAnalyzedForRatings = 0;
  }

  processGame(
    game: { move: PrettyMove; board: Piece[] }[],
    metadata?: string[],
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
    // only add data if data is not NaN
    if (!isNaN(whiteRating) && !isNaN(blackRating)) {
      this.totalPlayerRating += whiteRating + blackRating;
      this.numberGamesAnalyzedForRatings++;

      // Calculate the player rating diffs
      let ratingDiff = Math.abs(whiteRating - blackRating);
      this.totalPlayerRatingDiff += ratingDiff;

      // Check if this game has the largest rating differential
      if (ratingDiff > this.largestRatingDiff) {
        this.largestRatingDiff = ratingDiff;
        this.largestRatingDiffGame = [
          metadata?.find((data) => data.startsWith('[Site')) || ''];
      } else if (ratingDiff === this.largestRatingDiff) {
        this.largestRatingDiffGame.push(
          metadata?.find((data) => data.startsWith('[Site')) || ''); // tie, add to array
      }
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
      console.log('Invalid result');
    }

// extract openings from metadata
const opening = metadata?.find((item) => item.startsWith('[Opening "'))
?.replace('[Opening "', '')
?.replace('"]', '');

if(opening) {
  if (opening.toLowerCase() == "bongcloud") {
    this.bongcloud++;
  }

  // add opening to openings object
  if (this.openings[opening]) {
    this.openings[opening].appearances++;
    switch(result) {
      case '[Result "1-0"]':
        this.openings[opening].whiteWins++;
        break;
      case '[Result "0-1"]':
        this.openings[opening].blackWins++;
        break;
      case '[Result "1/2-1/2"]':
        this.openings[opening].whiteWins += 0.5;
        this.openings[opening].blackWins += 0.5;
        this.openings[opening].ties++;
        break;
    }
    this.openings[opening].whiteToBlackWinRatio = this.openings[opening].whiteWins / this.openings[opening].blackWins;
  } else {
    let blackWins, whiteWins, ties, whiteToBlackWinRatio;

    switch(result) {
      case '[Result "0-1"]':
        blackWins = 1;
        whiteWins = 0;
        ties = 0;
        whiteToBlackWinRatio = 0;
        break;
      case '[Result "1-0"]':
        blackWins = 0;
        whiteWins = 1;
        ties = 0;
        whiteToBlackWinRatio = Infinity;
        break;
      case '[Result "1/2-1/2"]':
        blackWins = 0.5;
        whiteWins = 0.5;
        ties = 1;
        whiteToBlackWinRatio = 1;
        break;
      default:
        blackWins = 0;
        whiteWins = 0;
        ties = 0;
        whiteToBlackWinRatio = 0;
    }

    this.openings[opening] = {
      appearances: 1,
      blackWins: blackWins,
      whiteWins: whiteWins,
      ties: ties,
      whiteToBlackWinRatio: whiteToBlackWinRatio,
    };
  }
}


    // identify game endings
    let gameEnd = metadata.find(item => item.startsWith('[Termination'));
    const lastMove = game[game.length - 1].move;

    if (gameEnd === '[Termination "Normal"]') {
      if (lastMove.originalString.includes('#')) {
        this.gameEndings['checkmate'] = (this.gameEndings['checkmate'] || 0) + 1;
      } else if (result === '[Result "1/2-1/2"]') {
        this.gameEndings['draw'] = (this.gameEndings['draw'] || 0) + 1;
        if (this.chess.isStalemate()) {
          this.gameEndings['stalemate'] = (this.gameEndings['stalemate'] || 0) + 1;
        } else if (this.chess.isInsufficientMaterial()) {
          this.gameEndings['insufficient material'] = (this.gameEndings['insufficient material'] || 0) + 1;
        } 
      } else {
        this.gameEndings['resignation'] = (this.gameEndings['resignation'] || 0) + 1;
      }
    } else if (gameEnd === '[Termination "Time forfeit"]') {
      this.gameEndings['time out'] = (this.gameEndings['time out'] || 0) + 1;
    } 

    // check for threefold repetition (currently not checking if remaining castling rights and the possibility to capture en passant are the same per https://en.wikipedia.org/wiki/Threefold_repetition)
    // check for 50-moves rule
    let fiftyMovesCount = 0;
    let threefoldRepetitionCount = 0;
    let threefoldRepetitionFound = false; // check if threeFoldRepetition has been found
    const lastBoardString = JSON.stringify(game[game.length - 1].board) + this.chess.turn();
    for (const { move, board } of game.reverse()) {
      const boardString = JSON.stringify(board) + this.chess.turn(); // check if the same player has the move
      if (boardString === lastBoardString) {
        threefoldRepetitionCount++;
      }
      // only count as threefold repetition if the last board position is included in the repetition and 
      // the last board position has appeared 3 times (including the last time)
      if (!threefoldRepetitionFound && threefoldRepetitionCount === 3 && boardString === lastBoardString) {
        this.gameEndings['threefold repetition'] = 
          (this.gameEndings['threefold repetition'] || 0) + 1;
        threefoldRepetitionFound = true;
      }
      
      // check for fifty game rule
      if (move.capture || move.piece === 'p') {
        fiftyMovesCount = 0;
      } else {
        fiftyMovesCount++
      }
      if (fiftyMovesCount === 50) {
        this.gameEndings['fifty-move rule'] = (this.gameEndings['fifty-move rule'] || 0) + 1;
      }
    }

    // Increment the number of games analyzed
    this.numberGamesAnalyzed++;
  }

  // Aggregate the results of the metric
  aggregate() {
    // Calculate the average player rating after each game
    // 2 players per game, so need to divide by two given that the totalPlayerRating adds all ratings up from both players
    this.averagePlayerRating =
      this.totalPlayerRating / (this.numberGamesAnalyzedForRatings * 2);

    // Calculate the average player rating diff
    this.averageRatingDiff =
      this.totalPlayerRatingDiff / this.numberGamesAnalyzedForRatings;

    // Calculate the player with the most games played
    let maxGames = 0;
    let playerMostGames = [];
    for (const player in this.playerGameStats) {
      if (this.playerGameStats[player] > maxGames) {
        maxGames = this.playerGameStats[player];
        playerMostGames = [player];
      } else if (this.playerGameStats[player] === maxGames) {
        playerMostGames.push(player);
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
    const sortedOpenings = Object.entries(this.openings).sort((a, b) => b[1].whiteToBlackWinRatio - a[1].whiteToBlackWinRatio);
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
