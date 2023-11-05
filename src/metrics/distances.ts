import { Piece, PrettyMove, UASymbol } from '../../cjsmin/src/chess';
import { UAPMap } from '../types';
import { createUAPMap } from '../utils';
import { Metric } from './metric';

export class MoveDistanceMetric implements Metric {
  distanceMap: UAPMap<{ total: number; maxSingleGame: number }>;
  pieceWithHighestAvg: UASymbol;
  pieceWithLowestAvg: UASymbol;
  maxAvgDistance: number;
  minAvgDistance: number;
  totalDistance: number;
  maxSingleGameTotal: number;
  singleGameMaxPiece: {
    uas: UASymbol;
    distance: number;
    link: string;
  };

  constructor() {
    this.distanceMap = createUAPMap({
      total: 0,
      maxSingleGame: 0,
    });
    this.maxAvgDistance = 0;
    this.minAvgDistance = Infinity; // Set high so first will overwrite
  }

  aggregate(gameCount: number) {
    for (const uas of Object.keys(this.distanceMap)) {
      const avgDistance = this.distanceMap[uas].totalDistance / gameCount;
      if (avgDistance > this.maxAvgDistance) {
        this.maxAvgDistance = avgDistance;
        this.pieceWithHighestAvg = uas as UASymbol;
      }
      if (avgDistance < this.minAvgDistance) {
        this.minAvgDistance = avgDistance;
        this.pieceWithLowestAvg = uas as UASymbol;
      }
    }
  }

  logResults(): void {
    console.timeEnd('Task 2: getMoveDistanceSetOfGames');

    // distance facts
    console.log('DISTANCE FACTS:');
    console.log(
      '==============================================================\n'
    );
    console.log(
      `Piece with highest avg distance for games analyzed: ${this.pieceWithHighestAvg}`
    );
    console.log(
      `That piece's (${this.pieceWithHighestAvg}'s) average distance moved per game: ${this.maxAvgDistance}`
    );

    // Facts
    console.log(
      `Piece that moved the furthest: ${this.singleGameMaxPiece.uas}`
    );
    // Game link support will come later
    // console.log(
    //   `Game in which that piece (${this.maxSingleGameDistancePiece}) moved the furthest: ${siteWithFurthestPiece}`
    // );
    console.log(
      `Distance that piece moved in the game: ${this.singleGameMaxPiece.distance}`
    );
    // console.log(
    //   `Game with the furthest collective distance moved: ${gameLinkWithFurthestCollectiveDistance}`
    // );
    console.log(
      `Collective distance moved in that game: ${this.maxSingleGameTotal}`
    );
  }

  processGame(game: { move: PrettyMove; board: Piece[] }[]) {
    // Initialize variables to keep track of the maximum distance and the piece
    const singleGameMap = createUAPMap(0);

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

        singleGameMap[move.uas] += distance;
        this.totalDistance += distance;
      }
    }

    // add the single game aggregates to the state object
    for (const uas of Object.keys(singleGameMap)) {
      this.distanceMap[uas].totalDistance += singleGameMap[uas];
      if (singleGameMap[uas] > this.distanceMap[uas].maxSingleGameDistance) {
        this.distanceMap[uas].maxSingleGameDistance = singleGameMap[uas];
      }
    }
  }
}
