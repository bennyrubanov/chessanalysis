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
  singleGameMaxPiece: string[];
  // This has arrays to account for ties. Postions connect link to uas
  pieceMaxes: {
    distance: number;
    uasArray: UASymbol[];
    linkArray: string[];
  };
  gamesProcessed: number;

  constructor() {
    this.clear();
  }

  clear(): void {
    this.distanceMap = createUAPMap({
      total: 0,
      maxSingleGame: 0,
    });
    this.pieceWithHighestAvg = undefined;
    this.pieceWithLowestAvg = undefined;
    this.maxAvgDistance = 0;
    this.minAvgDistance = Infinity; // Set high so first will overwrite
    this.totalDistance = 0;
    this.pieceMaxes = {
      distance: 0,
      uasArray: [],
      linkArray: [],
    };
    this.gamesProcessed = 0;
    this.singleGameMaxPiece = [];
  }

  aggregate() {
    // reset just the total aggregates, the others don't need a reset
    this.totalDistance = 0;
    for (const uas of Object.keys(this.distanceMap)) {
      // increment the total distance by adding all pieces
      this.totalDistance += this.distanceMap[uas].total;

      const avgDistance = this.distanceMap[uas].total / this.gamesProcessed;
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

    // distance facts
    console.log('DISTANCE FACTS:');
    console.log(
      `Piece with highest avg distance for games analyzed: ${this.pieceWithHighestAvg}`
    );
    console.log(
      `That piece's (${this.pieceWithHighestAvg}'s) average distance moved per game: ${this.maxAvgDistance}`
    );

    // Facts
    console.log(`Piece that moved the furthest: ${this.pieceMaxes.uasArray}`);
    console.log(`Game in which that piece (${this.pieceMaxes.uasArray}) moved the furthest: ${this.singleGameMaxPiece}`
    );
    console.log(
      `Distance that piece moved in the game: ${this.pieceMaxes.distance}`
    );
    // console.log(
    //   `Game with the furthest collective distance moved: ${gameLinkWithFurthestCollectiveDistance}`
    // );
    // console.log(
    //   `Collective distance moved in that game: ${this.maxSingleGameTotal}`
    // );
  }

  processGame(
    game: { move: PrettyMove; board: Piece[] }[],
    metadata: string[]
  ) {
    // Initialize variables to keep track of the maximum distance and the piece
    const singleGameMap = createUAPMap({ total: 0 });

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
        singleGameMap[movingKing].total += 2;
        singleGameMap[movingRook].total += rookDistance;
      } else {
        // Calculate the file (column) distance by subtracting ASCII values
        const fileDist = Math.abs(
          move.from.charCodeAt(0) - move.to.charCodeAt(0)
        );
        // Calculate the rank (row) distance by subtracting numeric values
        const rankDist = Math.abs(Number(move.from[1]) - Number(move.to[1]));
        // The distance moved is the maximum of fileDist and rankDist
        const distance = Math.max(fileDist, rankDist);

        singleGameMap[move.uas].total += distance;
      }
    }

    // add the single game aggregates to the state object
    for (const uas of Object.keys(singleGameMap)) {
      this.distanceMap[uas].total += singleGameMap[uas].total;
      const gameLink = metadata.find((item) => item.startsWith('[Site "'))
      ?.replace('[Site "', '')
      ?.replace('"]', '');

      if (
        singleGameMap[uas].total > this.distanceMap[uas].maxSingleGameDistance
      ) {
        this.distanceMap[uas].maxSingleGameDistance = singleGameMap[uas].total;
      }

      // find the individual piece maxes
      if (singleGameMap[uas].total > this.pieceMaxes.distance) {
        this.pieceMaxes.uasArray = [uas as UASymbol];
        this.pieceMaxes.distance = singleGameMap[uas].total;
        this.singleGameMaxPiece = [gameLink];
      } else if (singleGameMap[uas].total === this.pieceMaxes.distance) {
        this.pieceMaxes.uasArray.push(uas as UASymbol);
        this.singleGameMaxPiece.push[gameLink];
      }
    }

    this.gamesProcessed++;
  }
}
