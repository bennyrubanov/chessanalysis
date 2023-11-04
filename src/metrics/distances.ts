import { Chess, Piece, PrettyMove, UASymbol } from '../../cjsmin/src/chess';
import { FileReaderGame, UAPMap } from '../types';
import { createUAPMap } from '../utils';
import { Metric } from './metric';

// take a start and end board position and return the distances moved
export async function getMoveDistanceSingleGame(game: FileReaderGame) {
  const chess = new Chess();
  const moveGenerator = chess.historyGenerator(game.moves);

  // create an object to track distance value for each piece
  const distanceMap: { [key: string]: number } = {};

  // Initialize variables to keep track of the maximum distance and the piece
  let maxDistance = -1;
  let maxDistancePiece: UASymbol;
  let singleGameDistanceTotal = 0;

  // evaluate each move, update the correct unambiguous piece's distance
  for (let moveInfo of moveGenerator) {
    const { move, board } = moveInfo;

    if (!distanceMap[move.uas]) {
      distanceMap[move.uas] = 0;
    }

    const fromMove = moveInfo.move.from;
    const toMove = moveInfo.move.to;

    let distance = 0;

    // Check if the move is a castling move
    if (moveInfo.move.flags === 'k' || moveInfo.move.flags === 'q') {
      let movingKing = 'k';
      let movingRook, rookDistance;

      if (moveInfo.move.flags === 'k') {
        rookDistance = 2;
        movingRook = 'rh';
      } else {
        rookDistance = 3;
        movingRook = 'ra';
      }

      if (moveInfo.move.color === 'w') {
        movingRook = movingRook.toUpperCase();
        movingKing = movingKing.toUpperCase();
      }

      distanceMap[movingKing] += 2;
      distanceMap[movingRook] += rookDistance;
      singleGameDistanceTotal += 2;
      singleGameDistanceTotal += rookDistance;
    } else {
      // Calculate the file (column) distance by subtracting ASCII values
      const fileDist = Math.abs(fromMove.charCodeAt(0) - toMove.charCodeAt(0));
      // Calculate the rank (row) distance by subtracting numeric values
      const rankDist = Math.abs(Number(fromMove[1]) - Number(toMove[1]));
      // The distance moved is the maximum of fileDist and rankDist
      distance = Math.max(fileDist, rankDist);

      distanceMap[move.uas] += distance;
      singleGameDistanceTotal += distance;
    }

    if (distanceMap[move.uas] > maxDistance) {
      maxDistance = distanceMap[move.uas];
      maxDistancePiece = move.uas;
    }
  }

  return {
    maxDistancePiece,
    maxDistance,
    distanceMap,
    singleGameDistanceTotal,
  };
}

// returns the piece that moved the furthest, the game it moved the furthest in, the distance it moved, and the number of games analyzed in the set
export async function getMoveDistanceSetOfGames(games: FileReaderGame[]) {
  console.time('Task 2: getMoveDistanceSetOfGames');
  let maxDistance = 0;
  let pieceThatMovedTheFurthest = null;
  let totalDistanceMap: { [key: string]: number } = {};
  let gameWithFurthestPiece = null;
  let siteWithFurthestPiece = null;
  let lastGame;
  let furthestCollectiveDistance = 0;
  let gameLinkWithFurthestCollectiveDistance = null;

  let gameCount = 0;
  for await (const game of games) {
    // progress tracker
    gameCount++;

    const {
      maxDistancePiece,
      maxDistance: distance,
      distanceMap,
      singleGameDistanceTotal,
    } = await getMoveDistanceSingleGame(game);

    if (distance > maxDistance) {
      maxDistance = distance;
      pieceThatMovedTheFurthest = maxDistancePiece;
      gameWithFurthestPiece = game;
      let site = game.metadata
        .find((item) => item.startsWith('[Site "'))
        ?.replace('[Site "', '')
        .replace('"]', '');
      siteWithFurthestPiece = site;
    }

    if (singleGameDistanceTotal > furthestCollectiveDistance) {
      furthestCollectiveDistance = singleGameDistanceTotal;
      gameLinkWithFurthestCollectiveDistance = game.metadata
        .find((item) => item.startsWith('[Site "'))
        ?.replace('[Site "', '')
        .replace('"]', '');
    }

    for (const piece of Object.keys(distanceMap)) {
      if (!totalDistanceMap[piece]) {
        totalDistanceMap[piece] = 0;
      }
      totalDistanceMap[piece] += distanceMap[piece];
    }

    lastGame = game;
  }

  console.timeEnd('Task 2: getMoveDistanceSetOfGames');

  // distance facts
  console.log('DISTANCE FACTS:');
  console.log('==============================================================');
  console.log('\n');

  // Facts
  console.log(`Piece that moved the furthest: ${pieceThatMovedTheFurthest}`);
  console.log(
    `Game in which that piece (${pieceThatMovedTheFurthest}) moved the furthest: ${siteWithFurthestPiece}`
  );
  console.log(`Distance that piece moved in the game: ${maxDistance}`);
  console.log(
    `Game with the furthest collective distance moved: ${gameLinkWithFurthestCollectiveDistance}`
  );
  console.log(
    `Collective distance moved in that game: ${furthestCollectiveDistance}`
  );

  return {
    pieceThatMovedTheFurthest,
    maxDistance,
    gameCount,
    gameWithFurthestPiece,
    siteWithFurthestPiece,
    totalDistanceMap,
    lastGame,
    furthestCollectiveDistance,
    gameLinkWithFurthestCollectiveDistance,
  };
}

export class AverageDistanceMetric implements Metric {
  distanceMap: UAPMap<{ totalDistance: number }>;
  pieceWithHighestAvg: UASymbol;
  pieceWithLowestAvg: UASymbol;
  maxAvgDistance: number;
  minAvgDistance: number;
  totalDistance: number;

  constructor() {
    this.distanceMap = createUAPMap({ totalDistance: 0 });
    this.maxAvgDistance = 0;
    this.minAvgDistance = Infinity; // Set high so first will overwrite
  }

  aggregate(gameCount: number) {
    for (const piece of Object.keys(this.distanceMap)) {
      const avgDistance = this.distanceMap[piece].totalDistance / gameCount;
      if (avgDistance > this.maxAvgDistance) {
        this.maxAvgDistance = avgDistance;
        this.pieceWithHighestAvg = piece as UASymbol;
      }
      if (avgDistance < this.minAvgDistance) {
        this.minAvgDistance = avgDistance;
        this.pieceWithLowestAvg = piece as UASymbol;
      }
    }
  }

  logResults(): void {
    console.log(
      `Piece with highest avg distance for games analyzed: ${this.pieceWithHighestAvg}`
    );
    console.log(
      `That piece's (${this.pieceWithHighestAvg}'s) average distance moved per game: ${this.maxAvgDistance}`
    );
  }

  processGame(game: { move: PrettyMove; board: Piece[] }[]) {
    // Initialize variables to keep track of the maximum distance and the piece
    // evaluate each move, update the correct unambiguous piece's distance
    for (const { move } of game) {
      // Check if the move is a castling move
      if (move.flags === 'k' || move.flags === 'q') {
        let movingKing = 'k';
        let movingRook, rookDistance;

        if (move.flags === 'k') {
          rookDistance = 2;
          movingRook = 'rh';
        } else {
          rookDistance = 3;
          movingRook = 'ra';
        }

        if (move.color === 'w') {
          movingRook = movingRook.toUpperCase();
          movingKing = movingKing.toUpperCase();
        }

        // 2 for king + rook distance
        this.distanceMap[movingKing] += 2;
        this.distanceMap[movingRook] += rookDistance;
        this.totalDistance += 2;
        this.totalDistance += rookDistance;
      } else {
        // Calculate the file (column) distance by subtracting ASCII values
        const fileDist = Math.abs(
          move.from.charCodeAt(0) - move.to.charCodeAt(0)
        );
        // Calculate the rank (row) distance by subtracting numeric values
        const rankDist = Math.abs(Number(move.from[1]) - Number(move.to[1]));
        // The distance moved is the maximum of fileDist and rankDist
        const distance = Math.max(fileDist, rankDist);

        this.distanceMap[move.uas].totalDistance += distance;
        this.totalDistance += distance;
      }
    }
  }
}
